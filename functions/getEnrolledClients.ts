import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, status = 'enrolled', search, page = 1, limit = 25 } = await req.json();

    // Validate required fields
    if (!campaignId) {
      return Response.json({ 
        success: false, 
        error: 'Missing required field: campaignId' 
      }, { status: 400 });
    }

    // Cap limit
    const actualLimit = Math.min(Math.max(1, limit), 100);
    const actualPage = Math.max(1, page);

    // Get user's orgId
    let orgId = null;
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    
    if (userProfiles && userProfiles.length > 0) {
      orgId = userProfiles[0].orgId;
    } else if (user.role !== 'admin') {
      return Response.json({ success: false, error: 'User profile not found.' }, { status: 400 });
    }

    // Fetch the campaign
    const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
    if (!campaigns || campaigns.length === 0) {
      return Response.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }
    const campaign = campaigns[0];

    // Verify org ownership
    if (orgId && campaign.orgId !== orgId) {
      return Response.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Fetch enrollments
    let enrollments = await base44.entities.CampaignEnrollment.filter({ campaignId });

    // Filter by status
    if (status !== 'all') {
      enrollments = enrollments.filter(e => e.status === status);
    }

    // Get all client IDs from enrollments
    const clientIds = enrollments.map(e => e.clientId);

    // Fetch all clients in one query
    const allClients = await base44.entities.Client.filter({ orgId: campaign.orgId });
    const clientMap = new Map(allClients.map(c => [c.id, c]));

    // Join enrollment data with client data
    let enrichedEnrollments = enrollments.map(enrollment => {
      const client = clientMap.get(enrollment.clientId);
      if (!client) return null;

      // Determine trigger field based on campaign type
      const triggerFieldMap = {
        birthday: 'birthday',
        welcome: 'policy_start_date',
        renewal: 'renewal_date'
      };
      const triggerField = triggerFieldMap[campaign.type];

      return {
        enrollmentId: enrollment.id,
        clientId: enrollment.clientId,
        clientName: client.fullName || `${client.firstName} ${client.lastName}`,
        clientEmail: client.email,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        excludedAt: enrollment.excludedAt,
        triggerDate: client[triggerField],
        lastSentDate: enrollment.lastSentDate,
        lastSentStep: enrollment.lastSentStep
      };
    }).filter(Boolean);

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      enrichedEnrollments = enrichedEnrollments.filter(e => 
        e.clientName?.toLowerCase().includes(searchLower) ||
        e.clientEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = enrichedEnrollments.length;
    const totalPages = Math.ceil(total / actualLimit);
    const skip = (actualPage - 1) * actualLimit;

    // Apply pagination
    const paginatedEnrollments = enrichedEnrollments.slice(skip, skip + actualLimit);

    // Fetch scheduled sends for these clients
    const scheduledSends = await base44.entities.ScheduledSend.filter({ campaignId });
    const sendsByClient = new Map();
    
    for (const send of scheduledSends) {
      if (!sendsByClient.has(send.clientId)) {
        sendsByClient.set(send.clientId, []);
      }
      sendsByClient.get(send.clientId).push(send);
    }

    // Add scheduled send info to each enrollment
    const finalEnrollments = paginatedEnrollments.map(enrollment => {
      const clientSends = sendsByClient.get(enrollment.clientId) || [];
      
      const sentSends = clientSends.filter(s => s.status === 'sent');
      const pendingSends = clientSends.filter(s => s.status === 'pending');

      // Get last sent and next scheduled
      const lastSent = sentSends.length > 0 
        ? sentSends.sort((a, b) => new Date(b.sentAt || b.scheduledDate) - new Date(a.sentAt || a.scheduledDate))[0]
        : null;
      
      const nextScheduled = pendingSends.length > 0
        ? pendingSends.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))[0]
        : null;

      return {
        ...enrollment,
        lastSent: lastSent?.sentAt || lastSent?.scheduledDate || null,
        nextScheduled: nextScheduled?.scheduledDate || null
      };
    });

    return Response.json({ 
      success: true,
      clients: finalEnrollments,
      pagination: {
        page: actualPage,
        limit: actualLimit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('getEnrolledClients error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
});