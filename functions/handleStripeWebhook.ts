import { createServiceClient } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

/**
 * Stripe Webhook Handler - v2.0.0
 * Processes Stripe payment completion webhooks
 * 
 * DEPLOYMENT STATUS: 2024-01-15 - REDEPLOYED WITH SERVICE CLIENT FIX
 * 
 * ⚠️ DEV MODE - SET TO FALSE BEFORE PRODUCTION ⚠️
 * When DEV_MODE is true, signature validation is skipped for testing
 */

const DEV_MODE = true; // Set to false in production
const STRIPE_API_VERSION = '2023-10-16';

// Initialize Stripe with secret key
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: STRIPE_API_VERSION,
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

/**
 * Main webhook handler
 * This runs without user authentication - uses service role
 */
Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    console.log('\n========================================');
    console.log('🎯 STRIPE WEBHOOK RECEIVED - v2.0.0');
    console.log('========================================');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('⚙️ DEV_MODE:', DEV_MODE);
    console.log('🔑 Webhook Secret Present:', !!webhookSecret);
    console.log('🔑 Stripe Key Present:', !!Deno.env.get("STRIPE_SECRET_KEY"));
    console.log('🔑 App ID Present:', !!Deno.env.get("BASE44_APP_ID"));
    
    // Get the raw body as text for signature verification
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    console.log('📝 Body Length:', body.length);
    console.log('✍️ Signature Present:', !!signature);
    
    let event;
    
    // ==================== EVENT VERIFICATION ====================
    if (DEV_MODE) {
      // ⚠️ DEVELOPMENT MODE: Skip signature validation
      console.warn('⚠️⚠️⚠️ DEVELOPMENT MODE: SKIPPING SIGNATURE VALIDATION ⚠️⚠️⚠️');
      console.warn('⚠️ This should NEVER be enabled in production!');
      
      try {
        event = JSON.parse(body);
        console.log('✅ Event parsed directly from body (DEV MODE)');
        console.log('📨 Event Type:', event.type);
        console.log('📨 Event ID:', event.id);
      } catch (parseErr) {
        console.error('❌ Failed to parse webhook body as JSON:', parseErr);
        return Response.json({ 
          error: 'Invalid JSON in webhook body',
          details: parseErr.message 
        }, { status: 400 });
      }
    } else {
      // PRODUCTION MODE: Verify Stripe signature
      console.log('🔒 PRODUCTION MODE: Verifying Stripe signature...');
      
      if (!signature) {
        console.error('❌ Missing stripe-signature header');
        return Response.json({ 
          error: 'Missing stripe-signature header' 
        }, { status: 400 });
      }
      
      try {
        event = await stripe.webhooks.constructEventAsync(
          body,
          signature,
          webhookSecret
        );
        console.log('✅ Signature verified successfully');
        console.log('📨 Event Type:', event.type);
        console.log('📨 Event ID:', event.id);
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return Response.json({ 
          error: 'Invalid signature',
          details: err.message 
        }, { status: 400 });
      }
    }
    
    // ==================== INITIALIZE BASE44 SERVICE CLIENT ====================
    // CRITICAL: Using createServiceClient (no auth headers required)
    console.log('🔧 Initializing Base44 service client...');
    
    const appId = Deno.env.get("BASE44_APP_ID");
    if (!appId) {
      throw new Error('BASE44_APP_ID environment variable is not set');
    }
    
    const base44 = createServiceClient({
      appId: appId
    });
    
    console.log('✅ Base44 service client initialized successfully');
    console.log('📨 Processing event type:', event.type);
    
    // ==================== HANDLE CHECKOUT SESSION COMPLETED ====================
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('\n💳 PROCESSING CHECKOUT SESSION COMPLETED');
      console.log('💳 Session ID:', session.id);
      console.log('💳 Payment Intent:', session.payment_intent);
      console.log('💳 Amount Total:', session.amount_total, 'cents');
      console.log('💳 Currency:', session.currency);
      console.log('💳 Payment Status:', session.payment_status);
      console.log('📦 Metadata:', JSON.stringify(session.metadata, null, 2));
      
      // Extract and validate metadata
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
      
      console.log('\n🔍 EXTRACTED METADATA:');
      console.log('  - User ID:', userId);
      console.log('  - Org ID:', orgId || 'N/A');
      console.log('  - Pricing Tier ID:', pricingTierId);
      console.log('  - Credit Amount:', creditAmount);
      console.log('  - Purchase Type:', purchaseType);
      console.log('  - Coupon Code:', couponCode || 'None');
      console.log('  - Original Price:', originalPrice);
      console.log('  - Discount Applied:', discountApplied || '0');
      console.log('  - Final Price:', finalPrice);
      
      // Validate required metadata
      if (!userId || !pricingTierId || !creditAmount) {
        const missingFields = [];
        if (!userId) missingFields.push('userId');
        if (!pricingTierId) missingFields.push('pricingTierId');
        if (!creditAmount) missingFields.push('creditAmount');
        
        console.error('❌ Missing required metadata:', missingFields.join(', '));
        return Response.json({ 
          error: 'Missing required metadata',
          missing: missingFields,
          received: session.metadata 
        }, { status: 400 });
      }
      
      const credits = parseInt(creditAmount);
      const isOrgPurchase = purchaseType === 'organization';
      
      console.log('\n📊 PURCHASE DETAILS:');
      console.log('  - Credits to Add:', credits);
      console.log('  - Is Organization Purchase:', isOrgPurchase);
      
      // ==================== LOAD USER ====================
      console.log('\n👤 Loading user data...');
      console.log('👤 User ID:', userId);
      
      const users = await base44.entities.User.filter({ id: userId });
      if (!users || users.length === 0) {
        console.error('❌ User not found:', userId);
        return Response.json({ 
          error: 'User not found',
          userId: userId 
        }, { status: 404 });
      }
      
      const user = users[0];
      console.log('✅ User loaded successfully');
      console.log('   Email:', user.email);
      console.log('   Name:', user.full_name);
      
      // ==================== LOAD ORGANIZATION (if applicable) ====================
      let organization = null;
      if (isOrgPurchase && orgId) {
        console.log('\n🏢 Loading organization data...');
        console.log('🏢 Organization ID:', orgId);
        
        const orgs = await base44.entities.Organization.filter({ id: orgId });
        if (orgs && orgs.length > 0) {
          organization = orgs[0];
          console.log('✅ Organization loaded successfully');
          console.log('   Name:', organization.name);
          console.log('   Current Balance:', organization.creditBalance || 0);
        } else {
          console.warn('⚠️ Organization not found for ID:', orgId);
        }
      }
      
      // ==================== LOAD PRICING TIER ====================
      console.log('\n💰 Loading pricing tier...');
      console.log('💰 Pricing Tier ID:', pricingTierId);
      
      const tiers = await base44.entities.PricingTier.filter({ 
        id: pricingTierId 
      });
      const tier = tiers && tiers.length > 0 ? tiers[0] : null;
      
      if (tier) {
        console.log('✅ Pricing tier loaded successfully');
        console.log('   Name:', tier.name);
        console.log('   Credits:', tier.creditAmount);
        console.log('   Price:', tier.priceInCents, 'cents');
      } else {
        console.warn('⚠️ Pricing tier not found for ID:', pricingTierId);
      }
      
      // ==================== PROCESS COUPON (if applicable) ====================
      let couponUsed = null;
      
      if (couponCode && couponCode.trim()) {
        console.log('\n🎟️ PROCESSING COUPON');
        console.log('🎟️ Coupon Code:', couponCode);
        
        try {
          const coupons = await base44.entities.Coupon.filter({ 
            code: couponCode.trim().toUpperCase() 
          });
          
          if (coupons && coupons.length > 0) {
            couponUsed = coupons[0];
            console.log('✅ Coupon found in database');
            console.log('   Code:', couponUsed.code);
            console.log('   Description:', couponUsed.description);
            console.log('   Current Usage:', couponUsed.usedCount || 0);
            
            // Increment coupon usage count
            const newUsedCount = (couponUsed.usedCount || 0) + 1;
            
            await base44.entities.Coupon.update(couponUsed.id, {
              usedCount: newUsedCount
            });
            
            console.log(`✅ Coupon usage incremented to ${newUsedCount}`);
          } else {
            console.warn(`⚠️ Coupon code "${couponCode}" not found in database`);
          }
        } catch (couponError) {
          console.error('❌ Error processing coupon:', couponError);
          console.error('   Message:', couponError.message);
        }
      }
      
      // ==================== UPDATE CREDIT BALANCES ====================
      console.log('\n💳 UPDATING CREDIT BALANCES');
      
      if (isOrgPurchase && organization) {
        // ORGANIZATION PURCHASE - Update organization.creditBalance
        console.log('🏢 Processing ORGANIZATION purchase...');
        
        const currentBalance = organization.creditBalance || 0;
        const newBalance = currentBalance + credits;
        
        console.log(`   Current Balance: ${currentBalance}`);
        console.log(`   Adding: ${credits}`);
        console.log(`   New Balance: ${newBalance}`);
        
        // Update organization credit balance
        await base44.entities.Organization.update(organization.id, {
          creditBalance: newBalance
        });
        
        console.log('✅ Organization balance updated successfully');
        
        // Build transaction description
        let description = `Purchased ${tier?.name || 'credits'} - ${credits} notes`;
        if (couponUsed) {
          const discountAmount = discountApplied ? parseInt(discountApplied) : 0;
          description += ` (Coupon: ${couponUsed.code}, -$${(discountAmount / 100).toFixed(2)})`;
        }
        
        // Create transaction record
        console.log('\n📝 Creating transaction record...');
        const transaction = await base44.entities.Transaction.create({
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
        
        console.log('✅ Transaction record created');
        console.log('   Transaction ID:', transaction.id);
        console.log('   Type: Organization Purchase');
        console.log('   Credits Added:', credits);
        console.log('   Organization:', organization.name);
        
        if (couponUsed) {
          console.log(`🎉 Coupon "${couponUsed.code}" applied successfully`);
        }
        
      } else {
        // INDIVIDUAL USER PURCHASE - Update user.personalPurchasedCredits
        console.log('👤 Processing INDIVIDUAL USER purchase...');
        
        const currentPersonalPurchased = user.personalPurchasedCredits || 0;
        const newPersonalPurchased = currentPersonalPurchased + credits;
        
        console.log(`   Current Personal Credits: ${currentPersonalPurchased}`);
        console.log(`   Adding: ${credits}`);
        console.log(`   New Personal Credits: ${newPersonalPurchased}`);
        
        // Update user's personal purchased credit balance
        await base44.entities.User.update(user.id, {
          personalPurchasedCredits: newPersonalPurchased
        });
        
        console.log('✅ User personal credits updated successfully');
        
        // Build transaction description
        let description = `Purchased ${tier?.name || 'credits'} - ${credits} notes`;
        if (couponUsed) {
          const discountAmount = discountApplied ? parseInt(discountApplied) : 0;
          description += ` (Coupon: ${couponUsed.code}, -$${(discountAmount / 100).toFixed(2)})`;
        }
        
        // Create transaction record
        console.log('\n📝 Creating transaction record...');
        const transaction = await base44.entities.Transaction.create({
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
            creditType: 'personalPurchasedCredits'
          },
          relatedPricingTierId: pricingTierId,
          stripePaymentId: session.payment_intent,
          couponCode: couponUsed ? couponUsed.code : null
        });
        
        console.log('✅ Transaction record created');
        console.log('   Transaction ID:', transaction.id);
        console.log('   Type: User Purchase');
        console.log('   Credits Added:', credits);
        console.log('   User:', user.email);
        console.log('   Credit Type: personalPurchasedCredits');
        
        if (couponUsed) {
          console.log(`🎉 Coupon "${couponUsed.code}" applied successfully`);
        }
      }
      
      const processingTime = Date.now() - startTime;
      
      console.log('\n========================================');
      console.log('✅ WEBHOOK PROCESSING COMPLETE');
      console.log('========================================');
      console.log('⏱️ Processing Time:', processingTime, 'ms');
      console.log('💳 Credits Added:', credits);
      console.log('🎟️ Coupon Applied:', couponUsed ? couponUsed.code : 'None');
      console.log('========================================\n');
      
      return Response.json({ 
        success: true,
        message: 'Payment processed successfully',
        creditsAdded: credits,
        couponApplied: couponUsed ? couponUsed.code : null,
        processingTimeMs: processingTime
      });
    }
    
    // ==================== HANDLE OTHER EVENT TYPES ====================
    console.log(`ℹ️ Unhandled event type: ${event.type}`);
    console.log('   Event ID:', event.id);
    
    return Response.json({ 
      received: true,
      eventType: event.type,
      eventId: event.id
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('\n========================================');
    console.error('❌ ERROR PROCESSING WEBHOOK');
    console.error('========================================');
    console.error('⏱️ Processing Time:', processingTime, 'ms');
    console.error('❌ Error Type:', error.constructor.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Stack Trace:');
    console.error(error.stack);
    console.error('========================================\n');
    
    return Response.json(
      { 
        error: error.message || 'Webhook processing failed',
        errorType: error.constructor.name,
        details: error.stack,
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
});