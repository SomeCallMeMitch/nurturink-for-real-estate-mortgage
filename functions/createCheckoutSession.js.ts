
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
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
    const { pricingTierId, couponCode, simulateSuccess } = body;
    
    console.log('\n========================================');
    console.log(simulateSuccess ? '🎭 SIMULATING PURCHASE' : '💳 CREATING CHECKOUT SESSION');
    console.log('========================================');
    console.log('User:', user.email);
    console.log('Pricing Tier ID:', pricingTierId);
    console.log('Coupon Code:', couponCode || 'None');
    console.log('Simulate Success:', simulateSuccess || false);
    
    // Validate input
    if (!pricingTierId) {
      return Response.json(
        { error: 'pricingTierId is required' },
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
    if (couponCode && couponCode.trim()) {
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
      console.log('✅ Coupon valid, applying discount. Mode:', coupon.applyMode);
      
      if (coupon.applyMode === 'percentage') {
        // Simple percentage discount
        const discountPercent = coupon.discountValue || 0;
        discountApplied = Math.round(tier.priceInCents * (discountPercent / 100));
        finalPriceInCents = tier.priceInCents - discountApplied;
        
        console.log(`💰 Percentage discount: ${discountPercent}% = $${(discountApplied / 100).toFixed(2)} off`);
        
      } else if (coupon.applyMode === 'fixed_amount') {
        // Simple fixed amount discount (in cents)
        discountApplied = coupon.discountValue || 0;
        finalPriceInCents = tier.priceInCents - discountApplied;
        
        console.log(`💰 Fixed amount discount: $${(discountApplied / 100).toFixed(2)} off`);
        
      } else if (coupon.applyMode === 'tier_price_match') {
        // Complex tier price matching
        console.log('🎯 Tier price-match mode');
        
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
            targetTier = higherTiers[0]; // First tier above current
            console.log(`📈 Next tier up: ${targetTier.name} (${targetTier.creditAmount} credits)`);
          } else {
            // No higher tier exists, use current tier
            targetTier = tier;
            console.log(`⚠️ No higher tier found, using current tier`);
          }
        } else if (coupon.targetTierId) {
          // Use specified target tier
          const targetTiers = await base44.asServiceRole.entities.PricingTier.filter({ 
            id: coupon.targetTierId 
          });
          
          if (targetTiers && targetTiers.length > 0) {
            targetTier = targetTiers[0];
            console.log(`🎯 Target tier: ${targetTier.name} (${targetTiers[0].creditAmount} credits)`);
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
        console.log(`💵 Target price-per-note: $${(targetPricePerNote / 100).toFixed(4)}`);
        
        // Apply to selected tier's credit amount
        let matchedPrice = Math.round(targetPricePerNote * tier.creditAmount);
        console.log(`🧮 Matched price: $${(matchedPrice / 100).toFixed(2)}`);
        
        // Apply cap if specified
        if (coupon.capTierId) {
          const capTiers = await base44.asServiceRole.entities.PricingTier.filter({ 
            id: coupon.capTierId 
          });
          
          if (capTiers && capTiers.length > 0) {
            const capTier = capTiers[0];
            const capPrice = capTier.priceInCents;
            
            if (matchedPrice < capPrice) {
              console.log(`🚫 Cap applied: price raised from $${(matchedPrice / 100).toFixed(2)} to $${(capPrice / 100).toFixed(2)}`);
              matchedPrice = capPrice;
            }
          }
        }
        
        // Calculate discount
        discountApplied = tier.priceInCents - matchedPrice;
        finalPriceInCents = matchedPrice;
        
        console.log(`💰 Tier price-match discount: $${(discountApplied / 100).toFixed(2)} off`);
      }
      
      // ==================== APPLY BONUS DISCOUNT ====================
      if (coupon.bonusDiscountType && coupon.bonusDiscountType !== 'none') {
        console.log('🎁 Applying bonus discount. Type:', coupon.bonusDiscountType);
        
        let bonusDiscount = 0;
        
        if (coupon.bonusDiscountType === 'per_note_discount') {
          // Discount per note/credit
          const bonusPerNote = coupon.bonusDiscountValue || 0;
          bonusDiscount = bonusPerNote * tier.creditAmount;
          console.log(`🎁 Bonus per-note: $${(bonusPerNote / 100).toFixed(2)} × ${tier.creditAmount} = $${(bonusDiscount / 100).toFixed(2)}`);
          
        } else if (coupon.bonusDiscountType === 'percentage') {
          // Additional percentage off the already-discounted price
          const bonusPercent = coupon.bonusDiscountValue || 0;
          bonusDiscount = Math.round(finalPriceInCents * (bonusPercent / 100));
          console.log(`🎁 Bonus percentage: ${bonusPercent}% of $${(finalPriceInCents / 100).toFixed(2)} = $${(bonusDiscount / 100).toFixed(2)}`);
        }
        
        discountApplied += bonusDiscount;
        finalPriceInCents -= bonusDiscount;
      }
      
      // Ensure price doesn't go negative
      if (finalPriceInCents < 0) {
        console.warn('⚠️ Final price was negative, setting to $0');
        finalPriceInCents = 0;
      }
      
      // Store validated coupon for later use
      validatedCoupon = coupon;
      
      console.log('✅ Final price calculation:');
      console.log(`   Original: $${(tier.priceInCents / 100).toFixed(2)}`);
      console.log(`   Discount: $${(discountApplied / 100).toFixed(2)}`);
      console.log(`   Final: $${(finalPriceInCents / 100).toFixed(2)}`);
    }
    
    // Load organization if user belongs to one
    let organization = null;
    if (user.orgId) {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ 
        id: user.orgId 
      });
      if (orgs && orgs.length > 0) {
        organization = orgs[0];
      }
    }
    
    // Determine who is purchasing (check both appRole and isOrgOwner flag)
    const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;
    const isOrgPurchase = isOrgOwner && organization;
    
    console.log('Purchase Type:', isOrgPurchase ? 'Organization' : 'User');
    
    // ==================== SIMULATE SUCCESS MODE ====================
    if (simulateSuccess) {
      console.log('🎭 SIMULATION MODE ACTIVATED');
      console.log('Bypassing Stripe, processing payment directly...');
      
      // Generate a unique fake session ID
      const fakeSessionId = `sim_${Date.now()}_${user.id.substring(0, 8)}`;
      console.log('Generated fake session ID:', fakeSessionId);
      
      const credits = tier.creditAmount;
      
      // Process credit addition based on purchase type
      if (isOrgPurchase && organization) {
        // Organization purchase - goes to organization.creditBalance
        console.log('💼 Processing organization purchase...');
        
        const currentBalance = organization.creditBalance || 0;
        const newBalance = currentBalance + credits;
        
        console.log(`Organization balance: ${currentBalance} → ${newBalance}`);
        
        // Update organization credit balance
        await base44.asServiceRole.entities.Organization.update(organization.id, {
          creditBalance: newBalance
        });
        
        console.log('✅ Organization balance updated');
        
        // Build transaction description
        let description = `Purchased ${tier.name} - ${credits} notes`;
        if (validatedCoupon) {
          description += ` (${validatedCoupon.code}: -$${(discountApplied / 100).toFixed(2)})`;
        }
        description += ' [SIMULATED]';
        
        // Create transaction record
        const transaction = await base44.asServiceRole.entities.Transaction.create({
          orgId: organization.id,
          userId: user.id,
          type: 'purchase_org',
          amount: credits,
          balanceAfter: newBalance,
          balanceType: 'organization',
          description: description,
          metadata: {
            stripeSessionId: fakeSessionId,
            simulated: true,
            amountPaid: finalPriceInCents,
            currency: 'usd',
            originalPrice: tier.priceInCents,
            discountApplied: discountApplied,
            finalPrice: finalPriceInCents,
            pricingTierName: tier.name
          },
          relatedPricingTierId: pricingTierId,
          stripePaymentId: `sim_pi_${Date.now()}`,
          couponCode: validatedCoupon ? validatedCoupon.code : null
        });
        
        console.log('✅ Transaction record created:', transaction.id);
        
        // Increment coupon usage if applicable
        if (validatedCoupon) {
          const newUsedCount = (validatedCoupon.usedCount || 0) + 1;
          await base44.asServiceRole.entities.Coupon.update(validatedCoupon.id, {
            usedCount: newUsedCount
          });
          console.log(`✅ Coupon ${validatedCoupon.code} usage incremented to ${newUsedCount}`);
        }
        
        console.log(`✅ Simulated organization purchase complete: ${credits} credits added`);
        
      } else {
        // Individual user purchase - goes to user.personalPurchasedCredits
        console.log('👤 Processing user purchase...');
        
        const currentPersonalPurchased = user.personalPurchasedCredits || 0;
        const newPersonalPurchased = currentPersonalPurchased + credits;
        
        console.log(`User personalPurchasedCredits: ${currentPersonalPurchased} → ${newPersonalPurchased}`);
        
        // Update user's personal purchased credit balance
        await base44.asServiceRole.entities.User.update(user.id, {
          personalPurchasedCredits: newPersonalPurchased
        });
        
        console.log('✅ User personalPurchasedCredits updated');
        
        // Build transaction description
        let description = `Purchased ${tier.name} - ${credits} notes`;
        if (validatedCoupon) {
          description += ` (${validatedCoupon.code}: -$${(discountApplied / 100).toFixed(2)})`;
        }
        description += ' [SIMULATED]';
        
        // Create transaction record
        const transaction = await base44.asServiceRole.entities.Transaction.create({
          orgId: user.orgId || '',
          userId: user.id,
          type: 'purchase_user',
          amount: credits,
          balanceAfter: newPersonalPurchased,
          balanceType: 'user',
          description: description,
          metadata: {
            stripeSessionId: fakeSessionId,
            simulated: true,
            amountPaid: finalPriceInCents,
            currency: 'usd',
            originalPrice: tier.priceInCents,
            discountApplied: discountApplied,
            finalPrice: finalPriceInCents,
            pricingTierName: tier.name,
            creditType: 'personalPurchasedCredits'
          },
          relatedPricingTierId: pricingTierId,
          stripePaymentId: `sim_pi_${Date.now()}`,
          couponCode: validatedCoupon ? validatedCoupon.code : null
        });
        
        console.log('✅ Transaction record created:', transaction.id);
        
        // Increment coupon usage if applicable
        if (validatedCoupon) {
          const newUsedCount = (validatedCoupon.usedCount || 0) + 1;
          await base44.asServiceRole.entities.Coupon.update(validatedCoupon.id, {
            usedCount: newUsedCount
          });
          console.log(`✅ Coupon ${validatedCoupon.code} usage incremented to ${newUsedCount}`);
        }
        
        console.log(`✅ Simulated user purchase complete: ${credits} credits added (personalPurchasedCredits)`);
      }
      
      console.log('========================================');
      console.log('✅ SIMULATION COMPLETE');
      console.log('========================================\n');
      
      // Return success with redirect instruction
      return Response.json({
        success: true,
        simulated: true,
        sessionId: fakeSessionId,
        redirectToSuccess: true,
        originalPrice: tier.priceInCents,
        discountApplied: discountApplied,
        finalPrice: finalPriceInCents,
        couponApplied: validatedCoupon ? validatedCoupon.code : null,
        creditsAdded: tier.creditAmount
      });
    } else {
    // ==================== REAL STRIPE CHECKOUT ====================
    
    console.log('💳 Creating real Stripe checkout session...');
    
    // Get or create Stripe customer
    let stripeCustomerId;
    
    if (isOrgPurchase && organization.stripeCustomerId) {
      stripeCustomerId = organization.stripeCustomerId;
    } else if (isOrgPurchase) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: organization.name,
        metadata: {
          orgId: organization.id,
          userId: user.id,
          type: 'organization'
        }
      });
      stripeCustomerId = customer.id;
      
      await base44.asServiceRole.entities.Organization.update(organization.id, {
        stripeCustomerId: customer.id
      });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          userId: user.id,
          type: 'user'
        }
      });
      stripeCustomerId = customer.id;
    }
    
    // Get app URL from request headers
    const url = new URL(req.url);
    const appBaseUrl = `${url.protocol}//${url.host}`;
    
    // Build product description with discount info
    let productDescription = `${tier.creditAmount} handwritten note${tier.creditAmount === 1 ? '' : 's'}`;
    if (validatedCoupon) {
      productDescription += ` (Coupon: ${validatedCoupon.code})`;
    }
    
    // Create Stripe checkout session with (potentially discounted) price
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
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
        },
      ],
      mode: 'payment',
      success_url: `${appBaseUrl}?page=Credits&payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}?page=Credits&payment=cancelled`,
      metadata: {
        userId: user.id,
        orgId: user.orgId || '',
        pricingTierId: tier.id,
        creditAmount: tier.creditAmount.toString(),
        purchaseType: isOrgPurchase ? 'organization' : 'user',
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
      couponApplied: validatedCoupon ? validatedCoupon.code : null
    });
  }
    
  } catch (error) {
    console.error('❌ Error in checkout process:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to create checkout session',
        details: error.stack
      },
      { status: 500 }
    );
  }
});
