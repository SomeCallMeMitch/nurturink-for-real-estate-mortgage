import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
    const batches = await base44.asServiceRole.entities.MailingBatch.filter({ id: mailingBatchId });
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
        { error: 'Unauthorized to access this batch' },
        { status: 403 }
      );
    }
    
    // Load organization
    let organization = null;
    if (user.orgId) {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: user.orgId });
      if (orgs.length > 0) {
        organization = orgs[0];
      }
    }
    
    // Load clients
    const clients = await base44.asServiceRole.entities.Client.filter({
      id: { $in: batch.selectedClientIds }
    });
    
    // Load card designs used
    const designIds = new Set();
    if (batch.selectedCardDesignId) {
      designIds.add(batch.selectedCardDesignId);
    }
    if (batch.cardDesignOverrides) {
      Object.values(batch.cardDesignOverrides).forEach(id => designIds.add(id));
    }
    
    let designs = {};
    if (designIds.size > 0) {
      const designList = await base44.asServiceRole.entities.CardDesign.filter({
        id: { $in: Array.from(designIds) }
      });
      designList.forEach(d => {
        designs[d.id] = d;
      });
    }
    
    // Helper functions
    const getClientDesign = (clientId) => {
      const designId = batch.cardDesignOverrides?.[clientId] || batch.selectedCardDesignId;
      return designId ? designs[designId] : null;
    };
    
    const getClientReturnMode = (clientId) => {
      return batch.returnAddressModeOverrides?.[clientId] || batch.returnAddressModeGlobal || 'company';
    };
    
    const formatReturnMode = (mode) => {
      const modeMap = { 'company': 'Company', 'rep': 'Rep', 'none': 'None' };
      return modeMap[mode] || mode;
    };
    
    // Build email body (HTML)
    let emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #333;">Your Notes are On The Way!</h1>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #1e40af;">Mailing Summary</h2>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Recipients:</strong> ${clients.length}</p>
          ${organization ? `<p><strong>Organization:</strong> ${organization.name}</p>` : ''}
          <p><strong>Sent by:</strong> ${user.full_name || user.email}</p>
        </div>
        
        <h3 style="color: #333; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Recipients</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <thead>
            <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">#</th>
              <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Recipient</th>
              <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Address</th>
              <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Design</th>
              <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Return</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    clients.forEach((client, index) => {
      const design = getClientDesign(client.id);
      const returnMode = getClientReturnMode(client.id);
      const address = `${client.street}, ${client.city}, ${client.state} ${client.zipCode}`;
      
      emailBody += `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; font-size: 14px;">${index + 1}</td>
          <td style="padding: 12px; font-size: 14px; font-weight: 500;">${client.fullName || 'N/A'}</td>
          <td style="padding: 12px; font-size: 14px; color: #6b7280;">${address}</td>
          <td style="padding: 12px; font-size: 14px;">${design?.name || 'N/A'}</td>
          <td style="padding: 12px; font-size: 14px;">
            <span style="background-color: ${
              returnMode === 'company' ? '#dbeafe' : 
              returnMode === 'rep' ? '#d1fae5' : 
              '#f3f4f6'
            }; color: ${
              returnMode === 'company' ? '#1e40af' : 
              returnMode === 'rep' ? '#065f46' : 
              '#374151'
            }; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${formatReturnMode(returnMode)}
            </span>
          </td>
        </tr>
      `;
    });
    
    emailBody += `
          </tbody>
        </table>
        
        <div style="background-color: #f9fafb; padding: 16px; margin-top: 24px; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #333;">What Happens Next?</h3>
          <ul style="color: #6b7280; line-height: 1.8;">
            <li>Your cards are being printed with your custom message right now</li>
            <li>Each card will be hand-addressed and handwritten by our team</li>
            <li>Recipients should receive them in 5-10 business days</li>
          </ul>
        </div>
        
        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; text-align: center;">
          This is an automated email from RoofScribe. Please do not reply to this email.
        </p>
      </div>
    `;
    
    // Send email using Core.SendEmail integration
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: organization?.name || 'RoofScribe',
      to: user.email,
      subject: `Your ${clients.length} card${clients.length !== 1 ? 's are' : ' is'} on the way! 📬`,
      body: emailBody
    });
    
    return Response.json({
      success: true,
      message: `Email sent to ${user.email}`
    });
    
  } catch (error) {
    console.error('Error in emailMailingSummary:', error);
    return Response.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
});