import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2023-10-16',
});

/**
 * Fetches and validates a Stripe checkout session by ID
 * This is a READ-ONLY function - it does NOT modify any user data
 * 
 * Per Base44's security model, this function only retrieves session data.
 * The actual credit balance update must be performed by the frontend
 * using the logged-in user's session (base44.auth.updateMe or base44.entities.Organization.update)
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
    const { sessionId } = body;
    
    if (!sessionId) {
      return Response.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Fetching Stripe session:', sessionId);
    
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('📦 Session retrieved:', {
      id: session.id,
      payment_status: session.payment_status,
      customer: session.customer,
      metadata: session.metadata
    });
    
    // Validate session belongs to this user or their organization
    const { userId, orgId } = session.metadata;
    
    if (userId !== user.id) {
      // If user IDs don't match, check if it's an organization purchase
      if (!orgId || orgId !== user.orgId) {
        return Response.json(
          { error: 'This session does not belong to you' },
          { status: 403 }
        );
      }
    }
    
    // Validate payment was successful
    if (session.payment_status !== 'paid') {
      return Response.json(
        { error: 'Payment not completed', payment_status: session.payment_status },
        { status: 400 }
      );
    }
    
    // Return session data for frontend to process
    return Response.json({
      success: true,
      session: {
        id: session.id,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        paymentIntent: session.payment_intent
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching Stripe session:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to fetch session',
        details: error.stack
      },
      { status: 500 }
    );
  }
});