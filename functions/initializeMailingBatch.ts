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
    const { clientIds, quickSendTemplateId } = body;
    
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