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
    
    // Helper to get effective design for a client
    const getClientDesign = (clientId) => {
      const designId = batch.cardDesignOverrides?.[clientId] || batch.selectedCardDesignId;
      return designId ? designs[designId] : null;
    };
    
    // Helper to get effective return address mode
    const getClientReturnMode = (clientId) => {
      return batch.returnAddressModeOverrides?.[clientId] || batch.returnAddressModeGlobal || 'company';
    };
    
    // Helper to format return mode
    const formatReturnMode = (mode) => {
      const modeMap = {
        'company': 'Company',
        'rep': 'Rep',
        'none': 'None'
      };
      return modeMap[mode] || mode;
    };
    
    // Build CSV content
    const headers = [
      'Recipient Name',
      'Street Address',
      'Address Line 2',
      'City',
      'State',
      'ZIP Code',
      'Card Design',
      'Return Address Mode',
      'Message Type'
    ];
    
    const rows = clients.map((client) => {
      const design = getClientDesign(client.id);
      const returnMode = getClientReturnMode(client.id);
      const hasCustomMessage = batch.contentOverrides?.[client.id];
      
      return [
        client.fullName || '',
        client.street || '',
        client.address2 || '',
        client.city || '',
        client.state || '',
        client.zipCode || '',
        design?.name || '',
        formatReturnMode(returnMode),
        hasCustomMessage ? 'Custom' : 'Global'
      ];
    });
    
    // Convert to CSV format
    const escapeCSVField = (field) => {
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };
    
    const csvLines = [
      headers.map(escapeCSVField).join(','),
      ...rows.map(row => row.map(escapeCSVField).join(','))
    ];
    
    const csvContent = csvLines.join('\n');
    
    // Return CSV file
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="mailing-batch-${mailingBatchId.slice(0, 8)}.csv"`
      }
    });
    
  } catch (error) {
    console.error('Error in exportMailingBatchCSV:', error);
    return Response.json(
      { error: error.message || 'Failed to export CSV' },
      { status: 500 }
    );
  }
});