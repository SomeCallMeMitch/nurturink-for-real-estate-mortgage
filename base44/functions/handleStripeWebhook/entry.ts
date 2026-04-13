import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.11.0';

const DEV_MODE = Deno.env.get('STRIPE_DEV_MODE') === 'true';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2023-10-16',
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  try {
    console.log('\n========================================');
    console.log('🎯 STRIPE WEBHOOK RECEIVED');
    console.log('========================================');
    console.log('⚙️ DEV_MODE:', DEV_MODE);
    console.log('🔑 Webhook Secret Present:', !!webhookSecret);
    console.log('🔑 Stripe Key Present:', !!Deno.env.get("STRIPE_SECRET_KEY"));

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    console.log('📝 Body Length:', body.length);
    console.log('✍️ Signature Present:', !!signature);

    let event;

    if (DEV_MODE) {
      // BATCH3-E (REVISED): Two independent production safeguards, both block with HTTP 500.
      // Safeguard 1: Block if APP_ENV=production (environment-based check).
      // Safeguard 2: Block if STRIPE_SECRET_KEY starts with sk_live_ (key-based check).
      // Either condition alone is sufficient to abort — they are evaluated separately
      // so that a misconfigured environment is caught even if one variable is absent.
      const appEnv = (Deno.env.get('APP_ENV') || '').toLowerCase();
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
      const isLiveKey = stripeKey.startsWith('sk_live_');

      if (appEnv === 'production') {
        console.error('[BATCH3-E] FATAL: STRIPE_DEV_MODE=true detected with APP_ENV=production. Signature bypass is NOT permitted in production. Set STRIPE_DEV_MODE=false to resolve.');
        return Response.json({
          error: 'Development mode signature bypass is not permitted when APP_ENV=production.',
          code: 'DEV_MODE_BLOCKED_IN_PRODUCTION'
        }, { status: 500 });
      }

      if (isLiveKey) {
        console.error('[BATCH3-E] FATAL: STRIPE_DEV_MODE=true detected with a live Stripe secret key (sk_live_...). Signature bypass is NOT permitted with live credentials. Set STRIPE_DEV_MODE=false to resolve.');
        return Response.json({
          error: 'Development mode signature bypass is not permitted when using a live Stripe secret key (sk_live_...).',
          code: 'DEV_MODE_BLOCKED_WITH_LIVE_KEY'
        }, { status: 500 });
      }

      console.warn('⚠️⚠️⚠️ DEVELOPMENT MODE: SKIPPING SIGNATURE VALIDATION ⚠️⚠️⚠️');
      try {
        event = JSON.parse(body);
      } catch (parseErr) {
        return Response.json({ error: 'Invalid JSON in webhook body' }, { status: 400 });
      }
    } else {
      console.log('🔒 PRODUCTION MODE: Verifying Stripe signature...');
      if (!signature) {
        console.error('❌ Missing stripe-signature header');
        return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
      }
      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
        console.log('✅ Signature verified successfully');
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return Response.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    console.log('📨 Processing event type:', event.type);

    const base44 = createClientFromRequest(req);
    console.log('✅ Base44 client initialized');

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log('💳 Processing checkout.session.completed');
      console.log('💳 Session ID:', session.id);
      console.log('💳 Payment Intent:', session.payment_intent);
      console.log('💳 Amount Total:', session.amount_total);
      console.log('📦 Metadata:', JSON.stringify(session.metadata, null, 2));

      const {
        userId,
        orgId,
        pricingTierId,
        creditAmount,
        purchaseType,
        couponCode,
        originalPrice,
        discountApplied,
        finalPrice
      } = session.metadata;

      if (!userId || !pricingTierId || !creditAmount) {
        console.error('❌ Missing required metadata in webhook');
        return Response.json({ error: 'Missing metadata', received: session.metadata }, { status: 400 });
      }

      const credits = parseInt(creditAmount);
      const isCompanyPurchase = purchaseType === 'company' || purchaseType === 'organization';

      console.log('📊 Purchase details:');
      console.log('  - Credits:', credits);
      console.log('  - Purchase Type:', purchaseType);
      console.log('  - Is Company Purchase:', isCompanyPurchase);

      // Load user
      console.log('👤 Loading user:', userId);
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      if (!users || users.length === 0) {
        console.error('❌ User not found:', userId);
        return Response.json({ error: 'User not found' }, { status: 404 });
      }
      const user = users[0];
      console.log('✅ User loaded:', user.email);

      // BATCH2: Idempotency guard — prevent double-crediting on Stripe retries.
      // Use payment_intent as the stable dedup key (falls back to session.id for
      // edge cases where payment_intent may be null, e.g. free/trial sessions).
      const dedupeId = session.payment_intent || session.id;
      console.log('🔍 [IDEMPOTENCY] Checking for existing transaction:', dedupeId);
      try {
        const existingTx = await base44.asServiceRole.entities.Transaction.filter({
          stripePaymentId: dedupeId
        });
        if (existingTx && existingTx.length > 0) {
          console.warn(`⚠️ [IDEMPOTENCY] Payment ${dedupeId} already processed — Transaction ID: ${existingTx[0].id}. Returning idempotent success.`);
          return Response.json({
            success: true,
            message: 'Payment already processed (idempotent response)',
            duplicate: true,
            existingTransactionId: existingTx[0].id
          });
        }
        console.log('✅ [IDEMPOTENCY] No existing transaction found — safe to proceed');
      } catch (idempotencyCheckError) {
        // BATCH2-REVISED: Fail-CLOSED on dedupe check failure.
        // Rationale: If the SDK/database call to check for an existing Transaction fails
        // (e.g., transient error), we cannot safely determine whether this payment has
        // already been credited. The fail-open approach risked double-crediting on retries.
        //
        // Stripe retries webhooks up to ~15 times over 72 hours, so returning a 500 here
        // guarantees the event will be redelivered once the transient issue resolves.
        // The customer will receive their credits on the next successful attempt.
        // Worst-case delay: a few minutes. Worst-case fail-open: real money lost.
        console.error('[IDEMPOTENCY] Dedupe check FAILED — returning 500 to let Stripe retry:', idempotencyCheckError.message);
        return Response.json({
          error: 'Idempotency check failed — will retry',
          retryable: true
        }, { status: 500 });
      }

      // Load organization if company purchase
      let organization = null;
      if (isCompanyPurchase && orgId) {
        console.log('🏢 Loading organization:', orgId);
        const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });
        if (orgs && orgs.length > 0) {
          organization = orgs[0];
          console.log('✅ Organization loaded:', organization.name);
        } else {
          console.warn('⚠️ Organization not found, falling back to personal purchase');
        }
      }

      // Load pricing tier
      console.log('💰 Loading pricing tier:', pricingTierId);
      const tiers = await base44.asServiceRole.entities.PricingTier.filter({ id: pricingTierId });
      const tier = tiers && tiers.length > 0 ? tiers[0] : null;
      if (tier) {
        console.log('✅ Pricing tier loaded:', tier.name);
      } else {
        console.warn('⚠️ Pricing tier not found:', pricingTierId);
      }

      // ==================== COUPON PROCESSING ====================
      let couponUsed = null;
      if (couponCode && couponCode.trim()) {
        console.log('🎟️ Processing coupon:', couponCode);
        try {
          const coupons = await base44.asServiceRole.entities.Coupon.filter({
            code: couponCode.trim().toUpperCase()
          });
          if (coupons && coupons.length > 0) {
            couponUsed = coupons[0];
            const newUsedCount = (couponUsed.usedCount || 0) + 1;
            await base44.asServiceRole.entities.Coupon.update(couponUsed.id, { usedCount: newUsedCount });
            console.log(`✅ Coupon ${couponCode} usage incremented to ${newUsedCount}`);
          } else {
            console.warn(`⚠️ Coupon ${couponCode} not found in database`);
          }
        } catch (couponError) {
          console.error('❌ Error processing coupon:', couponError);
        }
      }

      // ==================== CREDIT BALANCE UPDATE ====================

      if (isCompanyPurchase && organization) {
        // Company purchase — credits go to organization.creditBalance
        console.log('🏢 Processing company purchase...');

        const currentBalance = organization.creditBalance || 0;
        const newBalance = currentBalance + credits;
        console.log(`💳 Organization balance: ${currentBalance} → ${newBalance}`);

        await base44.asServiceRole.entities.Organization.update(organization.id, {
          creditBalance: newBalance
        });
        console.log('✅ Organization balance updated');

        let description = `Purchased ${tier?.name || 'credits'} - ${credits} notes (Company Pool)`;
        if (couponUsed) {
          const discountAmount = discountApplied ? parseInt(discountApplied) : 0;
          description += ` (${couponUsed.code}: -$${(discountAmount / 100).toFixed(2)})`;
        }

        const transaction = await base44.asServiceRole.entities.Transaction.create({
          fromAccountType: 'platform',
          fromAccountId: null,
          toAccountType: 'company',
          toAccountId: organization.id,
          orgId: organization.id,
          userId: user.id,
          type: 'purchase_org',
          amount: credits,
          balanceAfter: newBalance,
          balanceType: 'organization',
          description: description,
          totalPriceCents: session.amount_total,
          metadata: {
            stripeSessionId: session.id,
            stripePaymentIntent: session.payment_intent,
            amountPaid: session.amount_total,
            currency: session.currency,
            originalPrice: originalPrice ? parseInt(originalPrice) : null,
            discountApplied: discountApplied ? parseInt(discountApplied) : 0,
            finalPrice: finalPrice ? parseInt(finalPrice) : session.amount_total,
            pricingTierName: tier?.name || null,
            purchaseType: 'company',
            creditType: 'companyPool'
          },
          relatedPricingTierId: pricingTierId,
          stripePaymentId: session.payment_intent,
          couponCode: couponUsed ? couponUsed.code : null
        });

        console.log('✅ Transaction record created:', transaction.id);
        console.log(`✅ Company purchase complete: ${credits} credits added to ${organization.name} pool`);

      } else {
        // Personal purchase — credits go to user.personalPurchasedCredits
        console.log('👤 Processing personal purchase...');

        const currentPersonalPurchased = user.personalPurchasedCredits || 0;
        const newPersonalPurchased = currentPersonalPurchased + credits;
        console.log(`💳 User personalPurchasedCredits: ${currentPersonalPurchased} → ${newPersonalPurchased}`);

        await base44.asServiceRole.entities.User.update(user.id, {
          personalPurchasedCredits: newPersonalPurchased
        });
        console.log('✅ User personalPurchasedCredits updated');

        let description = `Purchased ${tier?.name || 'credits'} - ${credits} notes (Personal)`;
        if (couponUsed) {
          const discountAmount = discountApplied ? parseInt(discountApplied) : 0;
          description += ` (${couponUsed.code}: -$${(discountAmount / 100).toFixed(2)})`;
        }

        const transaction = await base44.asServiceRole.entities.Transaction.create({
          fromAccountType: 'platform',
          fromAccountId: null,
          toAccountType: 'user',
          toAccountId: user.id,
          orgId: user.orgId || '',
          userId: user.id,
          type: 'purchase_user',
          amount: credits,
          balanceAfter: newPersonalPurchased,
          balanceType: 'user',
          description: description,
          totalPriceCents: session.amount_total,
          metadata: {
            stripeSessionId: session.id,
            stripePaymentIntent: session.payment_intent,
            amountPaid: session.amount_total,
            currency: session.currency,
            originalPrice: originalPrice ? parseInt(originalPrice) : null,
            discountApplied: discountApplied ? parseInt(discountApplied) : 0,
            finalPrice: finalPrice ? parseInt(finalPrice) : session.amount_total,
            pricingTierName: tier?.name || null,
            purchaseType: 'personal',
            creditType: 'personalPurchasedCredits'
          },
          relatedPricingTierId: pricingTierId,
          stripePaymentId: session.payment_intent,
          couponCode: couponUsed ? couponUsed.code : null
        });

        console.log('✅ Transaction record created:', transaction.id);
        console.log(`✅ Personal purchase complete: ${credits} credits added to ${user.email}`);
      }

      console.log('========================================');
      console.log('✅ WEBHOOK PROCESSING COMPLETE');
      console.log('========================================\n');

      return Response.json({
        success: true,
        message: 'Payment processed successfully',
        creditsAdded: credits,
        purchaseType: isCompanyPurchase ? 'company' : 'personal',
        couponApplied: couponUsed ? couponUsed.code : null
      });
    }

    console.log(`ℹ️ Unhandled event type: ${event.type}`);
    return Response.json({ received: true });

  } catch (error) {
    console.error('========================================');
    console.error('❌ ERROR PROCESSING WEBHOOK');
    console.error('========================================');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================\n');

    return Response.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
});