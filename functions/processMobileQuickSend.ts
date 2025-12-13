import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
    if (!quickSendTemplateId) {
      return Response.json(
        { error: 'Quick Send template must be selected' },
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
    
    // Fetch the QuickSendTemplate
    const quickSendTemplates = await base44.entities.QuickSendTemplate.filter({
      id: quickSendTemplateId
    });
    
    if (quickSendTemplates.length === 0) {
      return Response.json(
        { error: 'Quick Send template not found' },
        { status: 404 }
      );
    }
    
    const quickSendTemplate = quickSendTemplates[0];

    // Check credit availability BEFORE creating batch and notes
    const creditsNeeded = clients.length;
    
    const creditCheckResponse = await base44.functions.invoke('checkCreditAvailability', {
      creditsNeeded: creditsNeeded
    });

    if (!creditCheckResponse.data.available) {
      return Response.json(
        { error: creditCheckResponse.data.message || 'Insufficient credits to send these QuickCards.' },
        { status: 402 }
      );
    }

    // Create new MailingBatch with QuickSendTemplate details
    const mailingBatch = await base44.entities.MailingBatch.create({
      userId: user.id,
      organizationId: user.orgId,
      status: 'ready_to_send',
      selectedClientIds: clientIds,
      quickSendTemplateId: quickSendTemplate.id,
      globalTemplateId: quickSendTemplate.templateId,
      selectedCardDesignId: quickSendTemplate.cardDesignId,
      selectedNoteStyleProfileId: quickSendTemplate.noteStyleProfileId,
      includeGreeting: quickSendTemplate.includeGreeting ?? true,
      includeSignature: quickSendTemplate.includeSignature ?? true,
      returnAddressModeGlobal: quickSendTemplate.returnAddressMode || 'company',
      contentOverrides: {},
      cardDesignOverrides: {},
      noteStyleProfileOverrides: {},
      greetingOverrides: {},
      signatureOverrides: {},
      returnAddressModeOverrides: {}
    });

    // Process this mailing batch immediately to create Notes and Mailings
    const processResponse = await base44.functions.invoke('processMailingBatch', {
      mailingBatchId: mailingBatch.id
    });

    // Handle potential errors from processMailingBatch
    if (processResponse.status !== 200) {
      return Response.json(
        { error: processResponse.data.error || 'Failed to process mailing batch after creation.' },
        { status: processResponse.status }
      );
    }
    
    return Response.json({
      success: true,
      mailingBatchId: mailingBatch.id,
      clientCount: clients.length,
      templateName: quickSendTemplate.name,
      processedCount: processResponse.data.processedCount
    });
    
  } catch (error) {
    console.error('Error in processMobileQuickSend:', error);
    return Response.json(
      { error: error.message || 'Failed to process mobile Quick Send' },
      { status: 500 }
    );
  }
});