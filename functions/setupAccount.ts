import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  console.log("--- setupAccount function invoked ---");
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      console.error("Unauthorized: No user found.");
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.onboardingComplete) {
      console.log(`User ${user.id} is already onboarded.`);
      return Response.json({ success: true, message: "Already onboarded" });
    }

    const { role, companyName, details, teamInvites } = await req.json();
    console.log("Received payload:", { role, companyName, details, teamInvites });

    if (!['sales_rep', 'company', 'whitelabel_partner'].includes(role)) {
      console.error(`Invalid role: ${role}`);
      return Response.json({ error: 'Invalid role selected' }, { status: 400 });
    }

    let orgId = null;
    let appRole = 'sales_rep';
    let accountTier = 'individual';

    // 1. Create Organization based on Role
    if (role === 'sales_rep') {
      const org = await base44.asServiceRole.entities.Organization.create({
        name: `${details?.firstName || user.full_name}'s Workspace`,
        accountType: 'company',
        website: details?.website,
        industry: details?.industry,
        activeTeamMembers: 1,
        creditBalance: 0,
        // Sales rep uses their personal address as the org address
        street: details?.personalStreet,
        city: details?.personalCity,
        state: details?.personalState,
        zipCode: details?.personalZipCode,
      });
      orgId = org.id;
      console.log(`Created personal organization ${orgId} for sales_rep.`);
    } else if (role === 'company' || role === 'whitelabel_partner') {
      const isWhitelabel = role === 'whitelabel_partner';
      const org = await base44.asServiceRole.entities.Organization.create({
        name: companyName || `${details?.firstName || user.full_name}'s Company`,
        accountType: isWhitelabel ? 'whitelabel_partner' : 'company',
        website: details?.website,
        phone: details?.phone,
        industry: details?.industry,
        email: details?.organizationEmail, // Save organization email
        // Persist company address as the structured companyReturnAddress object
        companyReturnAddress: {
          companyName: companyName || '',
          street: details?.companyStreet || '',
          address2: null,
          city: details?.companyCity || '',
          state: details?.companyState || '',
          zip: details?.companyZipCode || '',
        },
        activeTeamMembers: 1,
        creditBalance: 0
      });
      orgId = org.id;
      appRole = isWhitelabel ? 'whitelabel_partner' : 'organization_owner';
      accountTier = isWhitelabel ? 'whitelabel_partner' : 'company';
      console.log(`Created ${accountTier} organization ${orgId}.`);

      if (isWhitelabel) {
        await base44.asServiceRole.entities.WhitelabelPartner.create({
          organizationId: org.id,
          partnerName: org.name,
          wholesalePricePerCredit: 200,
          resalePricePerCredit: 300,
        });
        console.log(`Created WhitelabelPartner entity for org ${orgId}.`);
      }
    }

    // 2. Create UserPhone and UserUrl entities
    let defaultPhoneId = null;
    if (details?.phone) {
      const userPhone = await base44.asServiceRole.entities.UserPhone.create({
        userId: user.id, orgId, phoneNumber: details.phone, label: 'Primary', isDefault: true
      });
      defaultPhoneId = userPhone.id;
      console.log(`Created UserPhone ${userPhone.id}.`);
    }

    let defaultUrlId = null;
    if (details?.website) {
      const userUrl = await base44.asServiceRole.entities.UserUrl.create({
        userId: user.id, orgId, url: details.website, label: 'Website', isDefault: true
      });
      defaultUrlId = userUrl.id;
      console.log(`Created UserUrl ${userUrl.id}.`);
    }

    // 3. Find NoteStyleProfile ID for the chosen writing style
    let favoriteNoteStyleProfileIds = [];
    if (details?.writingStyle) {
      const styles = await base44.asServiceRole.entities.NoteStyleProfile.filter({
        type: 'platform',
        name: details.writingStyle
      });
      if (styles.length > 0) {
        favoriteNoteStyleProfileIds.push(styles[0].id);
        console.log(`Found NoteStyleProfile ${styles[0].id} for style '${details.writingStyle}'.`);
      }
    }

    // 4. Prepare the final user update payload
    // Compute full name from first + last; fall back to existing full_name
    const computedFullName = `${details?.firstName || ''} ${details?.lastName || ''}`.trim() || user.full_name;
    const userUpdatePayload = {
      orgId,
      appRole,
      accountTier,
      onboardingComplete: true,
      full_name: computedFullName, // Built-in User field
      title: details?.jobTitle,
      phone: details?.phone,
      firstName: details?.firstName,
      lastName: details?.lastName,
      fullName: computedFullName,
      companyName: companyName || '',
      writingStyle: details?.writingStyle,
      street: details?.personalStreet,
      city: details?.personalCity,
      state: details?.personalState,
      zipCode: details?.personalZipCode,
      ...(defaultPhoneId && { defaultPhoneId }),
      ...(defaultUrlId && { defaultUrlId }),
      ...(favoriteNoteStyleProfileIds.length > 0 && { favoriteNoteStyleProfileIds })
    };

    console.log("Final user update payload:", userUpdatePayload);
    await base44.auth.updateMe(userUpdatePayload);
    console.log(`Successfully updated user ${user.id}.`);

    // 5. Invite Team Members (if any)
    // This part is a placeholder for future implementation of an inviteTeamMembers function
    if (teamInvites && teamInvites.length > 0) {
        console.log(`Team invites to be sent:`, teamInvites);
        // await base44.functions.invoke('inviteTeamMembers', { invites: teamInvites, orgId });
    }

    // 6. Fire-and-forget the seeder — do NOT await it.
    // The seeder can take 5-15 seconds for larger industry datasets (e.g. mortgage has 28 templates).
    // Awaiting it causes setupAccount to hit the Base44 function timeout and return a 502.
    // We return success immediately and let the seeder run in the background.
    const seedIndustry = details?.industry || 'universal';
    console.log(`Firing seedInitialContent (background) for orgId: ${orgId}, industry: ${seedIndustry}`);
    base44.asServiceRole.functions.invoke('seedInitialContent', {
      industry: seedIndustry,
      userId: user.id,
      orgId: orgId
    }).catch((seedError: any) => {
      console.error('Background seedInitialContent failed:', seedError);
    });

    console.log("--- setupAccount function completed successfully ---");
    return Response.json({ success: true, orgId, appRole });

  } catch (error) {
    console.error("Setup account error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});