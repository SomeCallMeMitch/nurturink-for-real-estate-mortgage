import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, clientIds } = await req.json();

    // Validate required fields
    if (!campaignId) {
      return Response.json({ 
        success: false, 
        error: 'Missing required field: campaignId' 
      }, { status: 400 });
    }

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'clientIds must be a non-empty array' 
      }, { status: 400 });
    }

    if (clientIds.length > 500) {
      return Response.json({ 
        success: false, 
        error: 'Maximum 500 clients can be enrolled at once' 
      }, { status: 400 });
    }

    // Get user's orgId from UserProfile
    let orgId = null;
    let userProfile = null;
    
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    
    if (userProfiles && userProfiles.length > 0) {
      userProfile = userProfiles[0];
      orgId = userProfile.orgId;
    } else if (user.role === 'admin') {
      // Super admin
    } else {
      return Response.json({ 
        success: false, 
        error: 'User profile not found.' 
      }, { status: 400 });
    }

    // PHASE 2: Removed role restriction - all users can enroll clients in their own campaigns

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

    // PHASE 2: Additional check for rep-level access
    // Regular users (reps) can only enroll clients in their own campaigns
    if (user.role === 'user' && campaign.ownerId && campaign.ownerId !== user.id) {
      return Response.json({ success: false, error: 'Permission denied. You can only enroll clients in your own campaigns.' }, { status: 403 });
    }

    // Determine required field
    const triggerFieldMap = {
      birthday: 'birthday',
      welcome: 'policy_start_date',
      renewal: 'renewal_date'
    };
    const requiredField = triggerFieldMap[campaign.type];

    // PHASE 2: Fetch only the campaign owner's clients (not all org clients)
    const allClients = await base44.entities.Client.filter({ 
      orgId: campaign.orgId,
      ownerId: campaign.ownerId  // Only allow enrolling the campaign owner's clients
    });
    
    // Filter to only requested clients
    const requestedClients = allClients.filter(c => clientIds.includes(c.id));

    // Check existing enrollments
    const existingEnrollments = await base44.entities.CampaignEnrollment.filter({ campaignId });
    const enrolledClientIds = new Set(
      existingEnrollments
        .filter(e => e.status === 'enrolled')
        .map(e => e.clientId)
    );

    // Filter eligible clients
    const eligibleClients = requestedClients.filter(client => {
      // Has required field
      if (!client[requiredField]) return false;
      // Not already enrolled
      if (enrolledClientIds.has(client.id)) return false;
      return true;
    });

    // Count skipped
    const alreadyEnrolled = requestedClients.filter(c => enrolledClientIds.has(c.id)).length;
    const missingField = requestedClients.filter(c => 
      !c[requiredField] && !enrolledClientIds.has(c.id)
    ).length;

    // Create enrollment records
    let enrolled = 0;
    const errors = [];

    if (eligibleClients.length > 0) {
      const enrollmentRecords = eligibleClients.map(client => ({
        campaignId,
        clientId: client.id,
        status: 'enrolled',
        enrolledAt: new Date().toISOString()
      }));

      try {
        await base44.entities.CampaignEnrollment.bulkCreate(enrollmentRecords);
        enrolled = eligibleClients.length;
      } catch (bulkError) {
        console.error('Bulk create error:', bulkError);
        errors.push('Some enrollments may have failed');
      }
    }

    return Response.json({ 
      success: true, 
      enrolled,
      skipped: alreadyEnrolled + missingField,
      details: {
        alreadyEnrolled,
        missingRequiredField: missingField,
        notFound: clientIds.length - requestedClients.length
      },
      errors
    });

  } catch (error) {
    console.error('bulkEnrollClients error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
});