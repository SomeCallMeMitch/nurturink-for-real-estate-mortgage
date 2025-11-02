import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

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
    const { clientIds } = body;
    
    // Validate input
    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return Response.json(
        { error: 'At least one client must be selected' },
        { status: 400 }
      );
    }
    
    // Verify all clients belong to user's organization
    const clients = await base44.entities.Client.filter({
      id: { $in: clientIds },
      orgId: user.orgId
    });
    
    if (clients.length !== clientIds.length) {
      return Response.json(
        { error: 'Some selected clients do not exist or do not belong to your organization' },
        { status: 403 }
      );
    }
    
    // Create new MailingBatch
    const mailingBatch = await base44.entities.MailingBatch.create({
      userId: user.id,
      organizationId: user.orgId,
      status: 'draft',
      selectedClientIds: clientIds,
      globalMessage: null,
      contentOverrides: null,
      selectedCardDesignId: null,
      selectedNoteStyleProfileId: null,
      includeGreeting: true,
      includeSignature: true
    });
    
    return Response.json({
      mailingBatchId: mailingBatch.id,
      clientCount: clientIds.length
    });
    
  } catch (error) {
    console.error('Error in initializeMailingBatch:', error);
    return Response.json(
      { error: error.message || 'Failed to initialize mailing batch' },
      { status: 500 }
    );
  }
});