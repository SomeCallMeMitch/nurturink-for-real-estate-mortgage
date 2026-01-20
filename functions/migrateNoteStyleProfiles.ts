import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check if user is super admin
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.appRole !== 'super_admin') {
      return Response.json({ 
        success: false, 
        error: 'Only super admins can run migrations' 
      }, { status: 403 });
    }

    // Get all existing profiles using service role
    const allProfiles = await base44.asServiceRole.entities.NoteStyleProfile.filter({});
    
    console.log(`Found ${allProfiles.length} profiles to migrate`);

    const migrationStats = {
      total: allProfiles.length,
      alreadyMigrated: 0,
      migratedToOrg: 0,
      migratedToPersonal: 0,
      errors: []
    };

    for (const profile of allProfiles) {
      try {
        // Skip if already has 'type' field set to non-null value
        if (profile.type && profile.type !== null) {
          migrationStats.alreadyMigrated++;
          console.log(`Profile ${profile.id} already migrated (type: ${profile.type})`);
          continue;
        }

        // Determine new type based on isOrgWide
        const newType = profile.isOrgWide ? 'organization' : 'personal';
        
        // Prepare update data
        const updateData = {
          type: newType,
          createdByUserId: profile.userId,
          organizationId: newType === 'organization' ? profile.orgId : null
        };

        // Update the profile using service role
        await base44.asServiceRole.entities.NoteStyleProfile.update(profile.id, updateData);
        
        if (newType === 'organization') {
          migrationStats.migratedToOrg++;
        } else {
          migrationStats.migratedToPersonal++;
        }
        
        console.log(`Migrated ${profile.id} (${profile.name}) to type: ${newType}`);

      } catch (error) {
        console.error(`Failed to migrate profile ${profile.id}:`, error);
        migrationStats.errors.push({
          profileId: profile.id,
          profileName: profile.name,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: 'Migration completed',
      stats: migrationStats
    });

  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Migration failed' 
    }, { status: 500 });
  }
});