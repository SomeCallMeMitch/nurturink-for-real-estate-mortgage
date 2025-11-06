import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { jsPDF } from 'npm:jspdf@2.5.1';

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
    
    // Create PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Mailing Batch Summary', 20, 20);
    
    // Organization info
    if (organization) {
      doc.setFontSize(12);
      doc.text(organization.name, 20, 30);
    }
    
    // Batch info
    doc.setFontSize(10);
    doc.text(`Batch ID: ${mailingBatchId.slice(0, 13)}...`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Total Recipients: ${clients.length}`, 20, 50);
    doc.text(`Sent by: ${user.full_name || user.email}`, 20, 55);
    
    // Table header
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    let y = 70;
    doc.text('#', 15, y);
    doc.text('Recipient', 25, y);
    doc.text('Address', 80, y);
    doc.text('Design', 140, y);
    doc.text('Return', 175, y);
    
    // Table content
    doc.setFont(undefined, 'normal');
    y += 5;
    
    clients.forEach((client, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        
        // Repeat header on new page
        doc.setFont(undefined, 'bold');
        doc.text('#', 15, y);
        doc.text('Recipient', 25, y);
        doc.text('Address', 80, y);
        doc.text('Design', 140, y);
        doc.text('Return', 175, y);
        doc.setFont(undefined, 'normal');
        y += 5;
      }
      
      const design = getClientDesign(client.id);
      const returnMode = getClientReturnMode(client.id);
      
      doc.text(`${index + 1}`, 15, y);
      doc.text(client.fullName || 'N/A', 25, y);
      
      // Address (truncated)
      const address = `${client.street}, ${client.city}, ${client.state} ${client.zipCode}`;
      const truncatedAddress = address.length > 45 ? address.slice(0, 42) + '...' : address;
      doc.text(truncatedAddress, 80, y);
      
      doc.text(design?.name || 'N/A', 140, y);
      doc.text(formatReturnMode(returnMode), 175, y);
      
      y += 7;
    });
    
    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Generate PDF as buffer
    const pdfBytes = doc.output('arraybuffer');
    
    // Return PDF file
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="mailing-batch-${mailingBatchId.slice(0, 8)}.pdf"`
      }
    });
    
  } catch (error) {
    console.error('Error in exportMailingBatchPDF:', error);
    return Response.json(
      { error: error.message || 'Failed to export PDF' },
      { status: 500 }
    );
  }
});