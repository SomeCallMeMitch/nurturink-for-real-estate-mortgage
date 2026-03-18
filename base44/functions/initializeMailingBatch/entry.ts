import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('[initializeMailingBatch] User authenticated:', user.id, 'orgId:', user.orgId);
    
    // Parse request body
    const body = await req.json();
    const { clientIds, quickSendTemplateId } = body;
    
    console.log('[initializeMailingBatch] Received clientIds:', clientIds?.length, 'quickSendTemplateId:', quickSendTemplateId);
    
    // Validate input
    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return Response.json(
        { error: 'At least one client must be selected' },
        { status: 400 }
      );
    }
    
    // Verify all clients belong to user's organization
    // Fetch all org clients and filter by the provided IDs (safer than $in operator)
    const allOrgClients = await base44.entities.Client.filter({
      orgId: user.orgId
    });
    
    console.log('[initializeMailingBatch] Org clients found:', allOrgClients.length);
    
    const clientIdSet = new Set(clientIds);
    const clients = allOrgClients.filter(c => clientIdSet.has(c.id));
    
    console.log('[initializeMailingBatch] Matched clients:', clients.length);
    
    if (clients.length !== clientIds.length) {
      console.log('[initializeMailingBatch] Client count mismatch - requested:', clientIds.length, 'found:', clients.length);
      return Response.json(
        { error: 'Some selected clients do not exist or do not belong to your organization' },
        { status: 403 }
      );
    }
    
    // If quickSendTemplateId provided, fetch the template and pre-populate batch
    let templateData = {};
    
    if (quickSendTemplateId) {
      const quickSendTemplate = await base44.entities.QuickSendTemplate.filter({
        id: quickSendTemplateId
      });
      
      if (quickSendTemplate.length === 0) {
        return Response.json(
          { error: 'Quick Send template not found' },
          { status: 404 }
        );
      }
      
      const template = quickSendTemplate[0];
      
      // Pre-populate batch with template settings
      templateData = {
        quickSendTemplateId: template.id,
        globalTemplateId: template.templateId,
        selectedCardDesignId: template.cardDesignId,
        selectedNoteStyleProfileId: template.noteStyleProfileId,
        includeGreeting: template.includeGreeting,
        includeSignature: template.includeSignature,
        returnAddressModeGlobal: template.returnAddressMode
      };
    }
    
    // Create new MailingBatch
    console.log('[initializeMailingBatch] Creating MailingBatch...');
    
    const mailingBatch = await base44.entities.MailingBatch.create({
      userId: user.id,
      organizationId: user.orgId,
      status: 'draft',
      selectedClientIds: clientIds,
      globalMessage: null,
      contentOverrides: null,
      ...templateData,
      // Fallback defaults if no Quick Send template
      selectedCardDesignId: templateData.selectedCardDesignId || null,
      selectedNoteStyleProfileId: templateData.selectedNoteStyleProfileId || null,
      includeGreeting: templateData.includeGreeting !== undefined ? templateData.includeGreeting : true,
      includeSignature: templateData.includeSignature !== undefined ? templateData.includeSignature : true
    });
    
    console.log('[initializeMailingBatch] MailingBatch created:', mailingBatch.id);
    
    return Response.json({
      mailingBatchId: mailingBatch.id,
      clientCount: clientIds.length
    });
    
  } catch (error) {
    console.error('[initializeMailingBatch] Error:', error);
    console.error('[initializeMailingBatch] Error stack:', error.stack);
    return Response.json(
      { error: error.message || 'Failed to initialize mailing batch' },
      { status: 500 }
    );
  }
});