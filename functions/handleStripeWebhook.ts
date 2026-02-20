import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.11.0';

// Production mode - full Stripe signature validation enabled
const DEV_MODE = false;

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

    // Get the raw body as text
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    console.log('📝 Body Length:', body.length);
    console.log('✍️ Signature Present:', !!signature);

    let event;

    if (DEV_MODE) {
      console.warn('⚠️⚠️⚠️ DEVELOPMENT MODE: SKIPPING SIGNATURE VALIDATION ⚠️⚠️⚠️');
      try {
        event = JSON.parse(body);
        console.log('✅ Event parsed directly from body');
      } catch (parseErr) {
        console.error('❌ Failed to parse webhook body as JSON:', parseErr);
        return Response.json({ error: 'Invalid JSON in webhook body' }, { status: 400 });
      }
    } else {
      console.log('🔒 PRODUCTION MODE: Verifying Stripe signature...');

      if (!signature) {
        console.error('❌ Missing stripe-signature header');
        return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
      }

      try {
        event = await stripe.webhooks.constructEventAsync(
          body,
          signature,
          webhookSecret
        );
        console.log('✅ Signature verified successfully');
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return Response.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    console.log('📨 Processing event type:', event.type);

    // createClientFromRequest is the ONLY supported way to get asServiceRole
    // in a Base44-hosted backend function (confirmed by B44 Discord/docs)
    const base44 = createClientFromRequest(req);

    console.log('✅ Base44 client initialized');

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log('💳 Processing checkout.session.completed');
      console.log('💳 Session ID:', session.id);
      console.log('💳 Payment Intent:', session.payment_intent);
      console.log('💳 Amount Total:', session.amount_total);
      console.log('💳 Currency:', session.currency);
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

      console.log('🔍 Extracted metadata:');
      console.log('  - userId:', userId);
      console.log('  - orgId:', orgId);
      console.log('  - pricingTierId:', pricingTierId);
      console.log('  - creditAmount:', creditAmount);
      console.log('  - purchaseType:', purchaseType);
      console.log('  - couponCode:', couponCode);
      console.log('  - originalPrice:', originalPrice);
      console.log('  - discountApplied:', discountApplied);
      console.log('  - finalPrice:', finalPrice);

      if (!userId || !pricingTierId || !creditAmount) {
        console.error('❌ Missing required metadata in webhook');
        return Response.json({
          error: 'Missing metadata',
          received: session.metadata
        }, { status: 400 });
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

      // Load organization if company purchase
      let organization = null;
      if (isCompanyPurchase && orgId) {
        console.log('🏢 Loading organization:', orgId);
        const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });
        if (orgs && orgs.length > 0) {
          organization = orgs[0];
          console.log('✅ Organization loaded:', organization.name);
        } else {
          console.warn('⚠️ Organization not found:', orgId);
          console.warn('⚠️ Falling back to personal purchase');
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
            await base44.asServiceRole.entities.Coupon.update(couponUsed.id, {
              usedCount: newUsedCount
            });
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
          orgId: organization.id,
          userId: user.id,
          type: 'purchase_org',
          amount: credits,
          balanceAfter: newBalance,
          balanceType: 'organization',
          description: description,
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
          orgId: user.orgId || '',
          userId: user.id,
          type: 'purchase_user',
          amount: credits,
          balanceAfter: newPersonalPurchased,
          balanceType: 'user',
          description: description,
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
      {
        error: error.message || 'Webhook processing failed',
        details: error.stack
      },
      { status: 500 }
    );
  }
});