import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;
    const isOrgManager = user.appRole === 'organization_manager';
    const canExportOrgTransactions = isOrgOwner || isOrgManager;
    
    // Parse request body
    const body = await req.json();
    const { format = 'csv', startDate, endDate, scope } = body;
    
    // Build query for transactions
    const requestedOrgScope = scope === 'organization';
    if (requestedOrgScope && (!user.orgId || !canExportOrgTransactions)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const query = (requestedOrgScope || (user.orgId && canExportOrgTransactions))
      ? { orgId: user.orgId }
      : { userId: user.id };
    
    // Add date range if provided
    if (startDate || endDate) {
      query.created_date = {};
      if (startDate) query.created_date.$gte = startDate;
      if (endDate) query.created_date.$lte = endDate;
    }
    
    // Load transactions
    const transactions = await base44.asServiceRole.entities.Transaction.filter(
      query,
      '-created_date',
      1000 // Max 1000 transactions
    );
    
    if (format === 'csv') {
      // Generate CSV
      const csvRows = [
        ['Date', 'Type', 'Description', 'Amount', 'Balance After', 'Payment ID'].join(',')
      ];
      
      transactions.forEach(t => {
        const date = new Date(t.created_date).toLocaleDateString();
        const type = t.type.replace(/_/g, ' ').toUpperCase();
        const description = `"${t.description.replace(/"/g, '""')}"`;
        const amount = t.amount > 0 ? `+${t.amount}` : t.amount;
        const balance = t.balanceAfter;
        const paymentId = t.stripePaymentId || '';
        
        csvRows.push([date, type, description, amount, balance, paymentId].join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      return Response.json({ 
        error: 'Unsupported format. Use "csv".' 
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in exportTransactionHistory:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to export transaction history',
        details: error.stack
      },
      { status: 500 }
    );
  }
});
