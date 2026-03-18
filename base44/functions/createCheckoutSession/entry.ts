import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    const { pricingTierId, couponCode, simulateSuccess, purchaseType } = body;
    
    console.log('\n========================================');
    console.log(simulateSuccess ? '🎭 SIMULATING PURCHASE' : '💳 CREATING CHECKOUT SESSION');
    console.log('========================================');
    console.log('User:', user.email);
    console.log('Pricing Tier ID:', pricingTierId);
    console.log('Coupon Code:', couponCode || 'None');
    console.log('Simulate Success:', simulateSuccess || false);
    console.log('Purchase Type (from request):', purchaseType || 'auto');
    
    if (!pricingTierId) {
      return Response.json({ error: 'pricingTierId is required' }, { status: 400 });
    }
    
    // Load pricing tier
    const tiers = await base44.asServiceRole.entities.PricingTier.filter({ id: pricingTierId });
    if (!tiers || tiers.length === 0) {
      return Response.json({ error: 'Pricing tier not found' }, { status: 404 });
    }
    const tier = tiers[0];
    
    if (!tier.isActive) {
      return Response.json({ error: 'This pricing tier is no longer available' }, { status: 400 });
    }
    
    let finalPriceInCents = tier.priceInCents;
    let discountApplied = 0;
    let validatedCoupon = null;
    
    // ==================== COUPON VALIDATION ====================
    if (couponCode && couponCode.trim()) {
      console.log('🎟️ Validating coupon:', couponCode);
      
      const coupons = await base44.asServiceRole.entities.Coupon.filter({ 
        code: couponCode.toUpperCase().trim() 
      });
      
      if (!coupons || coupons.length === 0) {
        return Response.json({ error: 'Invalid coupon code' }, { status: 400 });
      }
      
      const coupon = coupons[0];
      
      if (!coupon.isActive) {
        return Response.json({ error: 'This coupon is no longer active' }, { status: 400 });
      }
      
      if (coupon.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(coupon.expiresAt);
        if (now > expiresAt) {
          return Response.json({ error: 'This coupon has expired' }, { status: 400 });
        }
      }
      
      if (coupon.maxUsesGlobal !== null && coupon.usedCount >= coupon.maxUsesGlobal) {
        return Response.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
      }
      
      if (coupon.maxUsesPerUser !== null) {
        const userTransactions = await base44.asServiceRole.entities.Transaction.filter({
          userId: user.id,
          couponCode: coupon.code
        });
        if (userTransactions.length >= coupon.maxUsesPerUser) {
          return Response.json({ error: 'You have already used this coupon the maximum number of times' }, { status: 400 });
        }
      }
      
      if (coupon.eligibleTierIds && coupon.eligibleTierIds.length > 0) {
        if (!coupon.eligibleTierIds.includes(pricingTierId)) {
          return Response.json({ error: 'This coupon is not valid for the selected pricing tier' }, { status: 400 });
        }
      }
      
      // Apply discount
      console.log('✅ Coupon valid, applying discount. Mode:', coupon.applyMode);
      
      if (coupon.applyMode === 'percentage') {
        const discountPercent = coupon.discountValue || 0;
        discountApplied = Math.round(tier.priceInCents * (discountPercent / 100));
        finalPriceInCents = tier.priceInCents - discountApplied;
      } else if (coupon.applyMode === 'fixed_amount') {
        discountApplied = coupon.discountValue || 0;
        finalPriceInCents = tier.priceInCents - discountApplied;
      } else if (coupon.applyMode === 'tier_price_match') {
        let targetTier = null;
        
        if (coupon.applyNextTierUp) {
          const allTiers = await base44.asServiceRole.entities.PricingTier.filter({ isActive: true });
          const sortedTiers = allTiers.sort((a, b) => a.creditAmount - b.creditAmount);
          const higherTiers = sortedTiers.filter(t => t.creditAmount > tier.creditAmount);
          targetTier = higherTiers.length > 0 ? higherTiers[0] : tier;
        } else if (coupon.targetTierId) {
          const targetTiers = await base44.asServiceRole.entities.PricingTier.filter({ id: coupon.targetTierId });
          if (targetTiers && targetTiers.length > 0) targetTier = targetTiers[0];
        }
        
        if (!targetTier) {
          return Response.json({ error: 'Coupon configuration error: no valid target tier' }, { status: 500 });
        }
        
        const targetPricePerNote = targetTier.priceInCents / targetTier.creditAmount;
        let matchedPrice = Math.round(targetPricePerNote * tier.creditAmount);
        
        if (coupon.capTierId) {
          const capTiers = await base44.asServiceRole.entities.PricingTier.filter({ id: coupon.capTierId });
          if (capTiers && capTiers.length > 0) {
            const capPrice = capTiers[0].priceInCents;
            if (matchedPrice < capPrice) matchedPrice = capPrice;
          }
        }
        
        discountApplied = tier.priceInCents - matchedPrice;
        finalPriceInCents = matchedPrice;
      }
      
      // Apply bonus discount
      if (coupon.bonusDiscountType && coupon.bonusDiscountType !== 'none') {
        let bonusDiscount = 0;
        if (coupon.bonusDiscountType === 'per_note_discount') {
          bonusDiscount = (coupon.bonusDiscountValue || 0) * tier.creditAmount;
        } else if (coupon.bonusDiscountType === 'percentage') {
          bonusDiscount = Math.round(finalPriceInCents * ((coupon.bonusDiscountValue || 0) / 100));
        }
        discountApplied += bonusDiscount;
        finalPriceInCents -= bonusDiscount;
      }
      
      if (finalPriceInCents < 0) finalPriceInCents = 0;
      validatedCoupon = coupon;
      
      console.log(`✅ Final price: $${(finalPriceInCents / 100).toFixed(2)} (discount: $${(discountApplied / 100).toFixed(2)})`);
    }
    
    // Load organization
    let organization = null;
    if (user.orgId) {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: user.orgId });
      if (orgs && orgs.length > 0) organization = orgs[0];
    }
    
    // Determine purchase type
    const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;
    const isOrgManager = user.appRole === 'organization_manager' || user.isOrgManager === true;
    const canChoosePurchaseType = (isOrgOwner || isOrgManager) && organization;
    
    let finalPurchaseType;
    if (purchaseType && canChoosePurchaseType) {
      if (purchaseType === 'company' || purchaseType === 'personal') {
        finalPurchaseType = purchaseType;
      } else {
        return Response.json({ error: 'Invalid purchaseType. Must be "company" or "personal".' }, { status: 400 });
      }
    } else if (canChoosePurchaseType && !purchaseType) {
      finalPurchaseType = 'company';
    } else {
      finalPurchaseType = 'personal';
    }
    
    const isCompanyPurchase = finalPurchaseType === 'company' && organization;
    console.log('Final Purchase Type:', isCompanyPurchase ? 'Company Pool' : 'Personal');
    
    // ==================== SIMULATE SUCCESS MODE ====================
    if (simulateSuccess) {
      console.log('🎭 SIMULATION MODE ACTIVATED');
      const fakeSessionId = `sim_${Date.now()}_${user.id.substring(0, 8)}`;
      const credits = tier.creditAmount;
      
      if (isCompanyPurchase && organization) {
        const currentBalance = organization.creditBalance || 0;
        const newBalance = currentBalance + credits;
        await base44.asServiceRole.entities.Organization.update(organization.id, { creditBalance: newBalance });
        
        let description = `Purchased ${tier.name} - ${credits} notes (Company Pool) [SIMULATED]`;
        if (validatedCoupon) description += ` (${validatedCoupon.code}: -$${(discountApplied / 100).toFixed(2)})`;
        
        await base44.asServiceRole.entities.Transaction.create({
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
          totalPriceCents: finalPriceInCents,
          metadata: { stripeSessionId: fakeSessionId, simulated: true, amountPaid: finalPriceInCents, currency: 'usd', originalPrice: tier.priceInCents, discountApplied, finalPrice: finalPriceInCents, pricingTierName: tier.name, purchaseType: 'company', creditType: 'companyPool' },
          relatedPricingTierId: pricingTierId,
          stripePaymentId: `sim_pi_${Date.now()}`,
          couponCode: validatedCoupon ? validatedCoupon.code : null
        });
        
        if (validatedCoupon) {
          await base44.asServiceRole.entities.Coupon.update(validatedCoupon.id, { usedCount: (validatedCoupon.usedCount || 0) + 1 });
        }
      } else {
        const currentPersonalPurchased = user.personalPurchasedCredits || 0;
        const newPersonalPurchased = currentPersonalPurchased + credits;
        await base44.asServiceRole.entities.User.update(user.id, { personalPurchasedCredits: newPersonalPurchased });
        
        let description = `Purchased ${tier.name} - ${credits} notes (Personal) [SIMULATED]`;
        if (validatedCoupon) description += ` (${validatedCoupon.code}: -$${(discountApplied / 100).toFixed(2)})`;
        
        await base44.asServiceRole.entities.Transaction.create({
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
          totalPriceCents: finalPriceInCents,
          metadata: { stripeSessionId: fakeSessionId, simulated: true, amountPaid: finalPriceInCents, currency: 'usd', originalPrice: tier.priceInCents, discountApplied, finalPrice: finalPriceInCents, pricingTierName: tier.name, purchaseType: 'personal', creditType: 'personalPurchasedCredits' },
          relatedPricingTierId: pricingTierId,
          stripePaymentId: `sim_pi_${Date.now()}`,
          couponCode: validatedCoupon ? validatedCoupon.code : null
        });
        
        if (validatedCoupon) {
          await base44.asServiceRole.entities.Coupon.update(validatedCoupon.id, { usedCount: (validatedCoupon.usedCount || 0) + 1 });
        }
      }
      
      console.log('✅ SIMULATION COMPLETE');
      return Response.json({
        success: true, simulated: true, sessionId: fakeSessionId,
        redirectToSuccess: true, originalPrice: tier.priceInCents,
        discountApplied, finalPrice: finalPriceInCents,
        couponApplied: validatedCoupon ? validatedCoupon.code : null,
        creditsAdded: tier.creditAmount, purchaseType: finalPurchaseType
      });
    }
    
    // ==================== REAL STRIPE CHECKOUT ====================
    console.log('💳 Creating real Stripe checkout session...');
    
    // Get or create Stripe customer
    let stripeCustomerId;
    if (isCompanyPurchase && organization.stripeCustomerId) {
      stripeCustomerId = organization.stripeCustomerId;
    } else if (isCompanyPurchase) {
      const customer = await stripe.customers.create({
        email: user.email, name: organization.name,
        metadata: { orgId: organization.id, userId: user.id, type: 'organization' }
      });
      stripeCustomerId = customer.id;
      await base44.asServiceRole.entities.Organization.update(organization.id, { stripeCustomerId: customer.id });
    } else {
      const customer = await stripe.customers.create({
        email: user.email, name: user.full_name,
        metadata: { userId: user.id, type: 'user' }
      });
      stripeCustomerId = customer.id;
    }
    
    // ✅ FIXED: Use nurturink.com as the app base URL for success/cancel redirects
    // The internal req.url returns a deno.dev URL which is not user-facing
    const appBaseUrl = 'https://nurturink.com';
    
    let productDescription = `${tier.creditAmount} handwritten note${tier.creditAmount === 1 ? '' : 's'}`;
    if (validatedCoupon) productDescription += ` (Coupon: ${validatedCoupon.code})`;
    productDescription += ` - ${finalPurchaseType === 'company' ? 'Company Pool' : 'Personal'}`;
    
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: tier.name,
            description: productDescription,
            metadata: {
              pricingTierId: tier.id,
              creditAmount: tier.creditAmount.toString(),
              originalPrice: tier.priceInCents.toString(),
              discountApplied: validatedCoupon ? discountApplied.toString() : '0',
              couponCode: validatedCoupon ? validatedCoupon.code : ''
            }
          },
          unit_amount: finalPriceInCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
    success_url: `${appBaseUrl}/PaymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/Credits?payment=cancelled`,
      metadata: {
        userId: user.id,
        orgId: user.orgId || '',
        pricingTierId: tier.id,
        creditAmount: tier.creditAmount.toString(),
        purchaseType: finalPurchaseType,
        couponCode: validatedCoupon ? validatedCoupon.code : '',
        originalPrice: tier.priceInCents.toString(),
        discountApplied: validatedCoupon ? discountApplied.toString() : '0',
        finalPrice: finalPriceInCents.toString()
      }
    });
    
    console.log('✅ Stripe checkout session created:', session.id);
    console.log('💳 Final amount:', `$${(finalPriceInCents / 100).toFixed(2)}`);
    console.log('========================================\n');
    
    return Response.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      originalPrice: tier.priceInCents,
      discountApplied: validatedCoupon ? discountApplied : 0,
      finalPrice: finalPriceInCents,
      couponApplied: validatedCoupon ? validatedCoupon.code : null,
      purchaseType: finalPurchaseType
    });
    
  } catch (error) {
    console.error('❌ Error in checkout process:', error);
    return Response.json(
      { error: error.message || 'Failed to create checkout session', details: error.stack },
      { status: 500 }
    );
  }
});