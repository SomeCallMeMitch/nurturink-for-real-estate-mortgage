import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Helper function to replace placeholders in text
function replacePlaceholders(text, client, user, organization) {
  if (!text) return '';
  
  let result = text;
  
  // Client placeholders
  if (client) {
    result = result.replace(/\{\{client\.firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{client\.lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{client\.fullName\}\}/g, client.fullName || '');
    result = result.replace(/\{\{client\.initials\}\}/g, 
      client.firstName && client.lastName 
        ? `${client.firstName[0]}${client.lastName[0]}` 
        : ''
    );
    result = result.replace(/\{\{client\.email\}\}/g, client.email || '');
    result = result.replace(/\{\{client\.phone\}\}/g, client.phone || '');
    result = result.replace(/\{\{client\.street\}\}/g, client.street || '');
    result = result.replace(/\{\{client\.city\}\}/g, client.city || '');
    result = result.replace(/\{\{client\.state\}\}/g, client.state || '');
    result = result.replace(/\{\{client\.zipCode\}\}/g, client.zipCode || '');
    result = result.replace(/\{\{client\.company\}\}/g, client.company || '');
  }
  
  // User/Me placeholders
  if (user) {
    result = result.replace(/\{\{me\.firstName\}\}/g, user.firstName || user.full_name?.split(' ')[0] || '');
    result = result.replace(/\{\{me\.lastName\}\}/g, user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '');
    result = result.replace(/\{\{me\.fullName\}\}/g, user.full_name || '');
    result = result.replace(/\{\{me\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{me\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{me\.title\}\}/g, user.title || '');
    result = result.replace(/\{\{me\.companyName\}\}/g, user.companyName || '');
    result = result.replace(/\{\{me\.street\}\}/g, user.street || '');
    result = result.replace(/\{\{me\.city\}\}/g, user.city || '');
    result = result.replace(/\{\{me\.state\}\}/g, user.state || '');
    result = result.replace(/\{\{me\.zipCode\}\}/g, user.zipCode || '');
  }
  
  // Organization placeholders
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.website\}\}/g, organization.website || '');
    result = result.replace(/\{\{org\.email\}\}/g, organization.email || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
    result = result.replace(/\{\{org\.street\}\}/g, organization.companyReturnAddress?.street || '');
    result = result.replace(/\{\{org\.city\}\}/g, organization.companyReturnAddress?.city || '');
    result = result.replace(/\{\{org\.state\}\}/g, organization.companyReturnAddress?.state || '');
    result = result.replace(/\{\{org\.zipCode\}\}/g, organization.companyReturnAddress?.zip || '');
  }
  
  return result;
}

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
    const { mailingBatchId } = body;
    
    // Validate input
    if (!mailingBatchId) {
      return Response.json(
        { error: 'mailingBatchId is required' },
        { status: 400 }
      );
    }
    
    // Load mailing batch
    const batches = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
    if (!batches || batches.length === 0) {
      return Response.json(
        { error: 'Mailing batch not found' },
        { status: 404 }
      );
    }
    
    const batch = batches[0];
    
    // Verify ownership
    if (batch.userId !== user.id && batch.organizationId !== user.orgId) {
      return Response.json(
        { error: 'Unauthorized to process this batch' },
        { status: 403 }
      );
    }
    
    // Validate batch has required data
    if (!batch.selectedClientIds || batch.selectedClientIds.length === 0) {
      return Response.json(
        { error: 'No clients selected in batch' },
        { status: 400 }
      );
    }
    
    if (!batch.selectedCardDesignId) {
      return Response.json(
        { error: 'No card design selected' },
        { status: 400 }
      );
    }
    
    // Calculate total credits needed
    const creditsNeeded = batch.selectedClientIds.length;
    
    // Get user's credit balances with new granular tracking
    const companyAllocatedCredits = user.companyAllocatedCredits || 0;
    const personalPurchasedCredits = user.personalPurchasedCredits || 0;
    let companyPoolCredits = 0;
    let organization = null;
    
    if (user.orgId) {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ 
        id: user.orgId 
      });
      
      if (orgs && orgs.length > 0) {
        organization = orgs[0];
        companyPoolCredits = organization.creditBalance || 0;
      }
    }
    
    const totalAvailable = companyAllocatedCredits + personalPurchasedCredits + companyPoolCredits;
    
    // Verify user has enough credits
    if (totalAvailable < creditsNeeded) {
      return Response.json(
        { 
          error: 'Insufficient credits',
          creditsNeeded: creditsNeeded,
          totalAvailable: totalAvailable,
          breakdown: {
            companyAllocatedCredits: companyAllocatedCredits,
            personalPurchasedCredits: personalPurchasedCredits,
            companyPoolCredits: companyPoolCredits
          },
          deficit: creditsNeeded - totalAvailable
        },
        { status: 402 }
      );
    }
    
    // Calculate credit deduction plan following hierarchy:
    // 1. Company-allocated credits first
    // 2. Personal purchased credits second
    // 3. Company pool credits last
    let remaining = creditsNeeded;
    let fromCompanyAllocated = 0;
    let fromPersonalPurchased = 0;
    let fromCompanyPool = 0;
    
    // Step 1: Use company-allocated credits first
    if (companyAllocatedCredits > 0) {
      fromCompanyAllocated = Math.min(companyAllocatedCredits, remaining);
      remaining -= fromCompanyAllocated;
    }
    
    // Step 2: Use personal purchased credits second
    if (remaining > 0 && personalPurchasedCredits > 0) {
      fromPersonalPurchased = Math.min(personalPurchasedCredits, remaining);
      remaining -= fromPersonalPurchased;
    }
    
    // Step 3: Use company pool last
    if (remaining > 0 && companyPoolCredits > 0) {
      fromCompanyPool = Math.min(companyPoolCredits, remaining);
      remaining -= fromCompanyPool;
    }
    
    // Load necessary data
    const [clients, noteStyleProfile] = await Promise.all([
      base44.asServiceRole.entities.Client.filter({ 
        id: { $in: batch.selectedClientIds } 
      }),
      batch.selectedNoteStyleProfileId 
        ? base44.asServiceRole.entities.NoteStyleProfile.filter({ 
            id: batch.selectedNoteStyleProfileId 
          }).then(profiles => profiles.length > 0 ? profiles[0] : null)
        : Promise.resolve(null)
    ]);
    
    // Verify all clients were found
    if (clients.length !== batch.selectedClientIds.length) {
      return Response.json(
        { error: 'Some clients could not be found' },
        { status: 400 }
      );
    }
    
    // Process each client and create Note + Mailing records
    const processedMailings = [];
    const errors = [];
    const currentTimestamp = new Date().toISOString();
    
    for (const client of clients) {
      try {
        // 1. Determine final message for this client
        const clientMessage = batch.contentOverrides?.[client.id] || batch.globalMessage || '';
        
        // 2. Compose full message with greeting and signature
        let fullMessage = '';
        
        // Add greeting if enabled
        if (batch.includeGreeting && noteStyleProfile?.defaultGreeting) {
          const greeting = replacePlaceholders(
            noteStyleProfile.defaultGreeting, 
            client, 
            user, 
            organization
          );
          if (greeting) {
            fullMessage += greeting + '\n\n';
          }
        }
        
        // Add main message
        const processedMessage = replacePlaceholders(clientMessage, client, user, organization);
        fullMessage += processedMessage;
        
        // Add signature if enabled
        let signatureText = null;
        if (batch.includeSignature && noteStyleProfile?.signatureText) {
          signatureText = replacePlaceholders(
            noteStyleProfile.signatureText, 
            client, 
            user, 
            organization
          );
          if (signatureText) {
            fullMessage += '\n\n' + signatureText;
          }
        }
        
        // 3. Determine card design for this client
        const cardDesignId = batch.cardDesignOverrides?.[client.id] || batch.selectedCardDesignId;
        
        // 4. Create Note entity
        const note = await base44.asServiceRole.entities.Note.create({
          orgId: user.orgId,
          userId: user.id,
          clientId: client.id,
          cardDesignId: cardDesignId,
          noteStyleProfileId: batch.selectedNoteStyleProfileId || null,
          message: fullMessage,
          signature: signatureText,
          status: 'queued_for_sending',
          sentDate: currentTimestamp,
          creditCost: 1,
          recipientName: client.fullName,
          senderUserId: user.id,
          senderName: user.full_name
        });
        
        // 5. Determine return address based on mode
        const returnMode = batch.returnAddressModeOverrides?.[client.id] 
          || batch.returnAddressModeGlobal 
          || 'company';
        
        let returnAddress = null;
        
        if (returnMode === 'company' && organization?.companyReturnAddress) {
          const companyAddr = organization.companyReturnAddress;
          returnAddress = {
            name: companyAddr.companyName || organization.name || '',
            street: companyAddr.street || '',
            address2: companyAddr.address2 || null,
            city: companyAddr.city || '',
            state: companyAddr.state || '',
            zip: companyAddr.zip || ''
          };
        } else if (returnMode === 'rep' && user.street) {
          returnAddress = {
            name: user.returnAddressName || user.full_name || '',
            street: user.street || '',
            address2: user.address2 || null,
            city: user.city || '',
            state: user.state || '',
            zip: user.zipCode || ''
          };
        }
        
        // 6. Create Mailing entity
        const mailing = await base44.asServiceRole.entities.Mailing.create({
          noteId: note.id,
          orgId: user.orgId,
          recipientAddress: {
            name: client.fullName || '',
            street: client.street || '',
            address2: client.address2 || null,
            city: client.city || '',
            state: client.state || '',
            zip: client.zipCode || ''
          },
          returnAddress: returnAddress,
          status: 'queued'
        });
        
        // 7. Update Client tracking fields
        const currentTotalNotes = (client.totalNotesSent || 0) + 1;
        
        await base44.asServiceRole.entities.Client.update(client.id, {
          lastNoteSentDate: currentTimestamp,
          totalNotesSent: currentTotalNotes
        });
        
        processedMailings.push({
          noteId: note.id,
          mailingId: mailing.id,
          clientId: client.id,
          clientName: client.fullName
        });
        
      } catch (clientError) {
        console.error(`Error processing client ${client.id}:`, clientError);
        errors.push({
          clientId: client.id,
          clientName: client.fullName,
          error: clientError.message
        });
      }
    }
    
    // 8. Deduct credits following the hierarchy and create transaction records
    const successfulSends = processedMailings.length;
    let actualFromCompanyAllocated = 0;
    let actualFromPersonalPurchased = 0;
    let actualFromCompanyPool = 0;
    
    if (successfulSends > 0) {
      // Recalculate deductions based on successful sends
      let remainingToDeduct = successfulSends;
      
      // Step 1: Deduct from company-allocated credits first
      if (fromCompanyAllocated > 0) {
        actualFromCompanyAllocated = Math.min(fromCompanyAllocated, remainingToDeduct);
        remainingToDeduct -= actualFromCompanyAllocated;
        
        const newCompanyAllocatedBalance = companyAllocatedCredits - actualFromCompanyAllocated;
        
        await base44.asServiceRole.entities.User.update(user.id, {
          companyAllocatedCredits: newCompanyAllocatedBalance
        });
        
        // Create transaction record
        await base44.asServiceRole.entities.Transaction.create({
          orgId: user.orgId,
          userId: user.id,
          type: 'deduction',
          amount: -actualFromCompanyAllocated,
          balanceAfter: newCompanyAllocatedBalance,
          balanceType: 'user',
          description: `Sent ${actualFromCompanyAllocated} handwritten ${actualFromCompanyAllocated === 1 ? 'note' : 'notes'} (company-allocated credits)`,
          metadata: {
            mailingBatchId: mailingBatchId,
            noteCount: actualFromCompanyAllocated,
            source: 'company_allocated',
            creditType: 'companyAllocatedCredits'
          }
        });
      }
      
      // Step 2: Deduct from personal purchased credits second
      if (remainingToDeduct > 0 && fromPersonalPurchased > 0) {
        actualFromPersonalPurchased = Math.min(fromPersonalPurchased, remainingToDeduct);
        remainingToDeduct -= actualFromPersonalPurchased;
        
        const newPersonalPurchasedBalance = personalPurchasedCredits - actualFromPersonalPurchased;
        
        await base44.asServiceRole.entities.User.update(user.id, {
          personalPurchasedCredits: newPersonalPurchasedBalance
        });
        
        // Create transaction record
        await base44.asServiceRole.entities.Transaction.create({
          orgId: user.orgId,
          userId: user.id,
          type: 'deduction',
          amount: -actualFromPersonalPurchased,
          balanceAfter: newPersonalPurchasedBalance,
          balanceType: 'user',
          description: `Sent ${actualFromPersonalPurchased} handwritten ${actualFromPersonalPurchased === 1 ? 'note' : 'notes'} (personal purchased credits)`,
          metadata: {
            mailingBatchId: mailingBatchId,
            noteCount: actualFromPersonalPurchased,
            source: 'personal_purchased',
            creditType: 'personalPurchasedCredits'
          }
        });
      }
      
      // Step 3: Deduct from company pool last
      if (remainingToDeduct > 0 && fromCompanyPool > 0 && organization) {
        actualFromCompanyPool = Math.min(fromCompanyPool, remainingToDeduct);
        remainingToDeduct -= actualFromCompanyPool;
        
        const newCompanyPoolBalance = companyPoolCredits - actualFromCompanyPool;
        
        await base44.asServiceRole.entities.Organization.update(organization.id, {
          creditBalance: newCompanyPoolBalance
        });
        
        // Create transaction record for organization
        await base44.asServiceRole.entities.Transaction.create({
          orgId: user.orgId,
          userId: user.id,
          type: 'deduction',
          amount: -actualFromCompanyPool,
          balanceAfter: newCompanyPoolBalance,
          balanceType: 'organization',
          description: `Sent ${actualFromCompanyPool} handwritten ${actualFromCompanyPool === 1 ? 'note' : 'notes'} (company pool credits)`,
          metadata: {
            mailingBatchId: mailingBatchId,
            noteCount: actualFromCompanyPool,
            source: 'company_pool'
          }
        });
      }
    }
    
    // 9. Update batch status
    await base44.asServiceRole.entities.MailingBatch.update(mailingBatchId, {
      status: 'completed'
    });
    
    // Return success response
    const response = {
      success: true,
      processedCount: processedMailings.length,
      totalClients: clients.length,
      mailings: processedMailings,
      creditsDeducted: {
        companyAllocated: actualFromCompanyAllocated,
        personalPurchased: actualFromPersonalPurchased,
        companyPool: actualFromCompanyPool,
        total: successfulSends
      }
    };
    
    // Include errors if any occurred
    if (errors.length > 0) {
      response.errors = errors;
      response.partialSuccess = true;
    }
    
    return Response.json(response);
    
  } catch (error) {
    console.error('Error in processMailingBatch:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to process mailing batch',
        details: error.stack
      },
      { status: 500 }
    );
  }
});