import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    console.log('[processMobileQuickSend] User authenticated:', {
      userId: user.id,
      email: user.email,
      orgId: user.orgId,
      personalCredits: user.personalPurchasedCredits,
      allocatedCredits: user.companyAllocatedCredits,
      canAccessPool: user.canAccessCompanyPool
    });
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    const { clientIds, quickSendTemplateId } = body;
    console.log('[processMobileQuickSend] Request payload:', { 
      clientIds, 
      quickSendTemplateId,
      clientCount: clientIds?.length 
    });
    
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
    console.log('[processMobileQuickSend] Checking credit availability for:', creditsNeeded, 'credits');
    
    const creditCheckResponse = await base44.functions.invoke('checkCreditAvailability', {
      creditsNeeded: creditsNeeded
    });
    
    console.log('[processMobileQuickSend] Credit check response:', {
      status: creditCheckResponse.status,
      available: creditCheckResponse.data.available,
      message: creditCheckResponse.data.message,
      data: creditCheckResponse.data
    });

    if (!creditCheckResponse.data.available) {
      console.error('[processMobileQuickSend] Insufficient credits:', creditCheckResponse.data);
      return Response.json(
        { error: creditCheckResponse.data.message || 'Insufficient credits to send these QuickCards.' },
        { status: 402 }
      );
    }

    // Create new MailingBatch with QuickSendTemplate details
    console.log('[processMobileQuickSend] Creating MailingBatch with data:', {
      userId: user.id,
      organizationId: user.orgId,
      quickSendTemplateId: quickSendTemplate.id,
      templateId: quickSendTemplate.templateId,
      cardDesignId: quickSendTemplate.cardDesignId,
      noteStyleProfileId: quickSendTemplate.noteStyleProfileId
    });
    
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
    
    console.log('[processMobileQuickSend] MailingBatch created:', { 
      mailingBatchId: mailingBatch.id,
      status: mailingBatch.status 
    });

    // Process this mailing batch immediately to create Notes and Mailings
    console.log('[processMobileQuickSend] Invoking processMailingBatch for:', mailingBatch.id);
    const processResponse = await base44.functions.invoke('processMailingBatch', {
      mailingBatchId: mailingBatch.id
    });
    
    console.log('[processMobileQuickSend] processMailingBatch response:', {
      status: processResponse.status,
      data: processResponse.data
    });

    // Handle potential errors from processMailingBatch
    if (processResponse.status !== 200) {
      console.error('[processMobileQuickSend] processMailingBatch failed:', {
        status: processResponse.status,
        error: processResponse.data.error,
        fullResponse: processResponse.data
      });
      return Response.json(
        { error: processResponse.data.error || 'Failed to process mailing batch after creation.' },
        { status: processResponse.status }
      );
    }
    
    console.log('[processMobileQuickSend] SUCCESS - Returning response:', {
      mailingBatchId: mailingBatch.id,
      clientCount: clients.length,
      templateName: quickSendTemplate.name,
      processedCount: processResponse.data.processedCount
    });
    
    return Response.json({
      success: true,
      mailingBatchId: mailingBatch.id,
      clientCount: clients.length,
      templateName: quickSendTemplate.name,
      processedCount: processResponse.data.processedCount
    });
    
  } catch (error) {
    console.error('[processMobileQuickSend] ERROR caught:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return Response.json(
      { error: error.message || 'Failed to process mobile Quick Send' },
      { status: 500 }
    );
  }
});