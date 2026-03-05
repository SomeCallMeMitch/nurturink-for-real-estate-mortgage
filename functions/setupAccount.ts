import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, companyName, details } = await req.json();

    if (!['sales_rep', 'company', 'whitelabel'].includes(role)) {
      return Response.json({ error: 'Invalid role selected' }, { status: 400 });
    }

    // Check if user is already onboarded
    if (user.onboardingComplete) {
        return Response.json({ success: true, message: "Already onboarded" });
    }

    let orgId = null;
    let appRole = 'sales_rep';
    let accountTier = 'individual';

    if (role === 'sales_rep') {
      // Create a personal organization for the sales rep
      const org = await base44.asServiceRole.entities.Organization.create({
        name: `${details?.firstName || user.full_name}'s Workspace`,
        accountType: 'company', // Treated as a company of 1
        website: details?.website,
        industry: details?.industry,
        activeTeamMembers: 1,
        creditBalance: 0
      });
      orgId = org.id;
      appRole = 'sales_rep';
      accountTier = 'individual';
    } 
    else if (role === 'company') {
      const org = await base44.asServiceRole.entities.Organization.create({
        name: companyName || `${user.full_name}'s Company`,
        accountType: 'company',
        website: details?.website,
        phone: details?.phone,
        industry: details?.industry,
        activeTeamMembers: 1,
        creditBalance: 0
      });
      orgId = org.id;
      appRole = 'organization_owner';
      accountTier = 'company';
    }
    else if (role === 'whitelabel') {
      const org = await base44.asServiceRole.entities.Organization.create({
        name: companyName || `${user.full_name}'s Agency`,
        accountType: 'whitelabel_partner',
        website: details?.website,
        phone: details?.phone,
        industry: details?.industry,
        activeTeamMembers: 1,
        creditBalance: 0
      });
      orgId = org.id;
      appRole = 'whitelabel_partner'; // Note: User schema enum says 'whitelabel_partner', not 'whitelabel_owner'
      accountTier = 'whitelabel_partner';
      
      // Create WhitelabelPartner entity
      await base44.asServiceRole.entities.WhitelabelPartner.create({
        organizationId: org.id,
        partnerName: org.name,
        wholesalePricePerCredit: 200, 
        resalePricePerCredit: 300, 
      });
    }

    // Create UserPhone entity if phone exists
    let defaultPhoneId = null;
    if (details?.phone) {
      const userPhone = await base44.asServiceRole.entities.UserPhone.create({
        userId: user.id,
        orgId: orgId,
        phoneNumber: details.phone,
        label: 'Primary',
        isDefault: true
      });
      defaultPhoneId = userPhone.id;
    }

    // Create UserUrl entity if website exists
    if (details?.website) {
      await base44.asServiceRole.entities.UserUrl.create({
        userId: user.id,
        orgId: orgId,
        url: details.website,
        label: 'Website',
        isDefault: true
      });
    }

    const computedFullName = `${details?.firstName || ''} ${details?.lastName || ''}`.trim() || user.full_name;

    // Update User
    await base44.auth.updateMe({
      orgId: orgId,
      appRole: appRole,
      accountTier: accountTier,
      onboardingComplete: true,
      title: details?.jobTitle,
      phone: details?.phone,
      firstName: details?.firstName || '',
      lastName: details?.lastName || '',
      fullName: computedFullName,
      full_name: computedFullName,
      companyName: companyName || '',
      writingStyle: details?.writingStyle || '',
      ...(defaultPhoneId && { defaultPhoneId })
    });

    return Response.json({ success: true, orgId, appRole });

  } catch (error) {
    console.error("Setup account error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});