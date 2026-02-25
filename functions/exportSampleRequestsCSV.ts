import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * exportSampleRequestsCSV
 * Admin-only endpoint that streams all SampleRequest records as a CSV download.
 * Supports optional ?source= filter passed in the request body.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Only admins may export
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { source } = body;

    // Fetch records — filter by source if provided
    let records;
    if (source && source !== 'all') {
      records = await base44.asServiceRole.entities.SampleRequest.filter({ source }, '-created_date', 2000);
    } else {
      records = await base44.asServiceRole.entities.SampleRequest.list('-created_date', 2000);
    }

    // Build CSV
    const headers = [
      'ID', 'Submitted', 'Source', 'Status',
      'First Name', 'Last Name', 'Email',
      'Address', 'City', 'State/ZIP',
      'Business', 'Product/Service', 'Monthly Volume',
    ];

    const escape = (val) => {
      if (val == null) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = records.map((r) => [
      escape(r.id),
      escape(r.created_date ? new Date(r.created_date).toISOString() : ''),
      escape(r.source),
      escape(r.status),
      escape(r.firstName),
      escape(r.lastName),
      escape(r.email),
      escape(r.address),
      escape(r.city),
      escape(r.stateZip),
      escape(r.storeNameOrUrl),
      escape(r.productType),
      escape(r.monthlyOrders),
    ].join(','));

    const csv = [headers.map(escape).join(','), ...rows].join('\r\n');

    const filename = `sample-requests-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});