import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2023-10-16',
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get the raw body as text for signature validation
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }
    
    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    console.log('📨 Webhook event type:', event.type);
    
    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('💳 Processing checkout session:', session.id);
      console.log('📦 Session metadata:', session.metadata);
      
      // Extract metadata
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
      
      // Validate required metadata
      if (!userId || !pricingTierId || !creditAmount) {
        console.error('❌ Missing required metadata in webhook');
        return Response.json({ 
          error: 'Missing metadata',
          received: session.metadata 
        }, { status: 400 });
      }
      
      const credits = parseInt(creditAmount);
      const isOrgPurchase = purchaseType === 'organization';
      
      // Load user
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      if (!users || users.length === 0) {
        console.error('❌ User not found:', userId);
        return Response.json({ error: 'User not found' }, { status: 404 });
      }
      const user = users[0];
      
      // Load organization if org purchase
      let organization = null;
      if (isOrgPurchase && orgId) {
        const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });
        if (orgs && orgs.length > 0) {
          organization = orgs[0];
        }
      }
      
      // Load pricing tier for details
      const tiers = await base44.asServiceRole.entities.PricingTier.filter({ 
        id: pricingTierId 
      });
      const tier = tiers && tiers.length > 0 ? tiers[0] : null;
      
      // ==================== COUPON PROCESSING ====================
      let couponUsed = null;
      
      if (couponCode && couponCode.trim()) {
        console.log('🎟️ Processing coupon:', couponCode);
        
        try {
          // Fetch coupon from database
          const coupons = await base44.asServiceRole.entities.Coupon.filter({ 
            code: couponCode.trim().toUpperCase() 
          });
          
          if (coupons && coupons.length > 0) {
            couponUsed = coupons[0];
            
            // Increment coupon usage count
            const newUsedCount = (couponUsed.usedCount || 0) + 1;
            
            await base44.asServiceRole.entities.Coupon.update(couponUsed.id, {
              usedCount: newUsedCount
            });
            
            console.log(`✅ Coupon ${couponCode} usage incremented to ${newUsedCount}`);
          } else {
            console.warn(`⚠️ Coupon ${couponCode} not found in database (may have been deleted)`);
          }
        } catch (couponError) {
          console.error('❌ Error processing coupon:', couponError);
          // Don't fail the entire webhook if coupon processing fails
          // The payment was successful, so we should still credit the account
        }
      }
      
      // ==================== CREDIT BALANCE UPDATE ====================
      
      // Calculate new balance and create transaction
      if (isOrgPurchase && organization) {
        // Organization purchase
        const newBalance = (organization.creditBalance || 0) + credits;
        
        // Update organization credit balance
        await base44.asServiceRole.entities.Organization.update(organization.id, {
          creditBalance: newBalance
        });
        
        // Build transaction description
        let description = `Purchased ${tier?.name || 'credits'} - ${credits} notes`;
        if (couponUsed) {
          const discountAmount = discountApplied ? parseInt(discountApplied) : 0;
          description += ` (${couponUsed.code}: -$${(discountAmount / 100).toFixed(2)})`;
        }
        
        // Create transaction record with coupon info
        await base44.asServiceRole.entities.Transaction.create({
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
            pricingTierName: tier?.name || null
          },
          relatedPricingTierId: pricingTierId,
          stripePaymentId: session.payment_intent,
          couponCode: couponUsed ? couponUsed.code : null
        });
        
        console.log(`✅ Organization purchase complete: ${credits} credits added to ${organization.name}`);
        
        if (couponUsed) {
          console.log(`🎉 Coupon ${couponUsed.code} applied successfully`);
        }
        
      } else {
        // Individual user purchase
        const newBalance = (user.creditBalance || 0) + credits;
        
        // Update user credit balance
        await base44.asServiceRole.entities.User.update(user.id, {
          creditBalance: newBalance
        });
        
        // Build transaction description
        let description = `Purchased ${tier?.name || 'credits'} - ${credits} notes`;
        if (couponUsed) {
          const discountAmount = discountApplied ? parseInt(discountApplied) : 0;
          description += ` (${couponUsed.code}: -$${(discountAmount / 100).toFixed(2)})`;
        }
        
        // Create transaction record with coupon info
        await base44.asServiceRole.entities.Transaction.create({
          orgId: user.orgId || '',
          userId: user.id,
          type: 'purchase_user',
          amount: credits,
          balanceAfter: newBalance,
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
            pricingTierName: tier?.name || null
          },
          relatedPricingTierId: pricingTierId,
          stripePaymentId: session.payment_intent,
          couponCode: couponUsed ? couponUsed.code : null
        });
        
        console.log(`✅ User purchase complete: ${credits} credits added to ${user.email}`);
        
        if (couponUsed) {
          console.log(`🎉 Coupon ${couponUsed.code} applied successfully`);
        }
      }
      
      // TODO: Send confirmation email
      
      return Response.json({ 
        success: true,
        message: 'Payment processed successfully',
        creditsAdded: credits,
        couponApplied: couponUsed ? couponUsed.code : null
      });
    }
    
    // Handle other event types
    console.log(`ℹ️ Unhandled event type: ${event.type}`);
    return Response.json({ received: true });
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return Response.json(
      { 
        error: error.message || 'Webhook processing failed',
        details: error.stack
      },
      { status: 500 }
    );
  }
});