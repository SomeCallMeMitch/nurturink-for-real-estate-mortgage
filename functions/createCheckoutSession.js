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
    const { pricingTierId } = body;
    
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
    
    // Determine who is purchasing (user or organization)
    const isOrgPurchase = user.appRole === 'organization_owner' && organization;
    
    // Get or create Stripe customer
    let stripeCustomerId;
    
    if (isOrgPurchase && organization.stripeCustomerId) {
      // Use existing organization Stripe customer
      stripeCustomerId = organization.stripeCustomerId;
    } else if (isOrgPurchase) {
      // Create new Stripe customer for organization
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
      
      // Save Stripe customer ID to organization
      await base44.asServiceRole.entities.Organization.update(organization.id, {
        stripeCustomerId: customer.id
      });
    } else {
      // Individual user purchase - create or retrieve customer
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
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tier.name,
              description: `${tier.creditAmount} handwritten note${tier.creditAmount === 1 ? '' : 's'}`,
              metadata: {
                pricingTierId: tier.id,
                creditAmount: tier.creditAmount.toString()
              }
            },
            unit_amount: tier.priceInCents,
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
        purchaseType: isOrgPurchase ? 'organization' : 'user'
      }
    });
    
    return Response.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to create checkout session',
        details: error.stack
      },
      { status: 500 }
    );
  }
});