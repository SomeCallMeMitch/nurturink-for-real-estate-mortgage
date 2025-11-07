import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Validates a coupon code for a specific pricing tier
 * Returns discount information WITHOUT creating a Stripe checkout session
 * This allows frontend to show discount breakdown before purchase
 */
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
    const { pricingTierId, couponCode } = body;
    
    // Validate input
    if (!pricingTierId) {
      return Response.json(
        { error: 'pricingTierId is required' },
        { status: 400 }
      );
    }
    
    if (!couponCode || !couponCode.trim()) {
      return Response.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }
    
    // Load pricing tier
    const tiers = await base44.asServiceRole.entities.PricingTier.filter({ 
      id: pricingTierId 
    });
    
    if (!tiers || tiers.length === 0) {
      return Response.json(
        { error: 'Pricing tier not found' },
        { status: 404 }
      );
    }
    
    const tier = tiers[0];
    
    // Verify tier is active
    if (!tier.isActive) {
      return Response.json(
        { error: 'This pricing tier is no longer available' },
        { status: 400 }
      );
    }
    
    // Initialize pricing variables
    let finalPriceInCents = tier.priceInCents;
    let discountApplied = 0;
    let validatedCoupon = null;
    
    // ==================== COUPON VALIDATION & CALCULATION ====================
    console.log('🎟️ Validating coupon:', couponCode);
    
    // Fetch coupon from database
    const coupons = await base44.asServiceRole.entities.Coupon.filter({ 
      code: couponCode.toUpperCase().trim() 
    });
    
    if (!coupons || coupons.length === 0) {
      return Response.json(
        { error: 'Invalid coupon code' },
        { status: 400 }
      );
    }
    
    const coupon = coupons[0];
    
    // 1. Check if coupon is active
    if (!coupon.isActive) {
      return Response.json(
        { error: 'This coupon is no longer active' },
        { status: 400 }
      );
    }
    
    // 2. Check expiration
    if (coupon.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(coupon.expiresAt);
      if (now > expiresAt) {
        return Response.json(
          { error: 'This coupon has expired' },
          { status: 400 }
        );
      }
    }
    
    // 3. Check global max uses
    if (coupon.maxUsesGlobal !== null && coupon.usedCount >= coupon.maxUsesGlobal) {
      return Response.json(
        { error: 'This coupon has reached its usage limit' },
        { status: 400 }
      );
    }
    
    // 4. Check per-user max uses
    if (coupon.maxUsesPerUser !== null) {
      const userTransactions = await base44.asServiceRole.entities.Transaction.filter({
        userId: user.id,
        couponCode: coupon.code
      });
      
      if (userTransactions.length >= coupon.maxUsesPerUser) {
        return Response.json(
          { error: 'You have already used this coupon the maximum number of times' },
          { status: 400 }
        );
      }
    }
    
    // 5. Check if tier is eligible
    if (coupon.eligibleTierIds && coupon.eligibleTierIds.length > 0) {
      if (!coupon.eligibleTierIds.includes(pricingTierId)) {
        return Response.json(
          { error: 'This coupon is not valid for the selected pricing tier' },
          { status: 400 }
        );
      }
    }
    
    // ==================== APPLY DISCOUNT ====================
    console.log('✅ Coupon valid, calculating discount. Mode:', coupon.applyMode);
    
    if (coupon.applyMode === 'percentage') {
      // Simple percentage discount
      const discountPercent = coupon.discountValue || 0;
      discountApplied = Math.round(tier.priceInCents * (discountPercent / 100));
      finalPriceInCents = tier.priceInCents - discountApplied;
      
    } else if (coupon.applyMode === 'fixed_amount') {
      // Simple fixed amount discount (in cents)
      discountApplied = coupon.discountValue || 0;
      finalPriceInCents = tier.priceInCents - discountApplied;
      
    } else if (coupon.applyMode === 'tier_price_match') {
      // Complex tier price matching
      let targetTier = null;
      
      // Determine target tier
      if (coupon.applyNextTierUp) {
        // Find next tier up (higher credit amount)
        const allTiers = await base44.asServiceRole.entities.PricingTier.filter({ 
          isActive: true 
        });
        
        // Sort by credit amount ascending
        const sortedTiers = allTiers.sort((a, b) => a.creditAmount - b.creditAmount);
        
        // Find tiers with higher credit amount than selected tier
        const higherTiers = sortedTiers.filter(t => t.creditAmount > tier.creditAmount);
        
        if (higherTiers.length > 0) {
          targetTier = higherTiers[0];
        } else {
          targetTier = tier;
        }
      } else if (coupon.targetTierId) {
        // Use specified target tier
        const targetTiers = await base44.asServiceRole.entities.PricingTier.filter({ 
          id: coupon.targetTierId 
        });
        
        if (targetTiers && targetTiers.length > 0) {
          targetTier = targetTiers[0];
        }
      }
      
      if (!targetTier) {
        return Response.json(
          { error: 'Coupon configuration error: no valid target tier' },
          { status: 500 }
        );
      }
      
      // Calculate price-per-note from target tier
      const targetPricePerNote = targetTier.priceInCents / targetTier.creditAmount;
      
      // Apply to selected tier's credit amount
      let matchedPrice = Math.round(targetPricePerNote * tier.creditAmount);
      
      // Apply cap if specified
      if (coupon.capTierId) {
        const capTiers = await base44.asServiceRole.entities.PricingTier.filter({ 
          id: coupon.capTierId 
        });
        
        if (capTiers && capTiers.length > 0) {
          const capTier = capTiers[0];
          const capPrice = capTier.priceInCents;
          
          if (matchedPrice < capPrice) {
            matchedPrice = capPrice;
          }
        }
      }
      
      // Calculate discount
      discountApplied = tier.priceInCents - matchedPrice;
      finalPriceInCents = matchedPrice;
    }
    
    // ==================== APPLY BONUS DISCOUNT ====================
    if (coupon.bonusDiscountType && coupon.bonusDiscountType !== 'none') {
      let bonusDiscount = 0;
      
      if (coupon.bonusDiscountType === 'per_note_discount') {
        // Discount per note/credit
        const bonusPerNote = coupon.bonusDiscountValue || 0;
        bonusDiscount = bonusPerNote * tier.creditAmount;
        
      } else if (coupon.bonusDiscountType === 'percentage') {
        // Additional percentage off the already-discounted price
        const bonusPercent = coupon.bonusDiscountValue || 0;
        bonusDiscount = Math.round(finalPriceInCents * (bonusPercent / 100));
      }
      
      discountApplied += bonusDiscount;
      finalPriceInCents -= bonusDiscount;
    }
    
    // Ensure price doesn't go negative
    if (finalPriceInCents < 0) {
      finalPriceInCents = 0;
    }
    
    // Calculate discount percentage
    const discountPercentage = tier.priceInCents > 0 
      ? Math.round((discountApplied / tier.priceInCents) * 100)
      : 0;
    
    console.log('✅ Validation successful:');
    console.log(`   Original: $${(tier.priceInCents / 100).toFixed(2)}`);
    console.log(`   Discount: $${(discountApplied / 100).toFixed(2)} (${discountPercentage}%)`);
    console.log(`   Final: $${(finalPriceInCents / 100).toFixed(2)}`);
    
    // Return validation result
    return Response.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        applyMode: coupon.applyMode
      },
      pricing: {
        originalPrice: tier.priceInCents,
        discountApplied: discountApplied,
        finalPrice: finalPriceInCents,
        discountPercentage: discountPercentage,
        tierName: tier.name,
        creditAmount: tier.creditAmount
      }
    });
    
  } catch (error) {
    console.error('❌ Error validating coupon:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to validate coupon',
        details: error.stack
      },
      { status: 500 }
    );
  }
});