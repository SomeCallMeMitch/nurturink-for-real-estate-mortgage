import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { ORG_ROLES } from './utils/roleHelpers.ts';

/**
 * Migration function to create UserProfile records for existing users
 * 
 * This function:
 * 1. Finds all users with an orgId but no UserProfile
 * 2. Creates a UserProfile record based on their legacy role fields
 * 
 * This is a one-time migration that should be run after deploying the UserProfile entity.
 * It's safe to run multiple times (idempotent).
 * 
 * Only super admins can run this migration.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only super admins can run migrations
    if (user.appRole !== 'super_admin') {
      return Response.json(
        { error: 'Access denied. Only super admins can run migrations.' },
        { status: 403 }
      );
    }
    
    // Parse optional parameters
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const targetOrgId = body.orgId || null; // Optional: migrate only specific org
    
    console.log(`Starting UserProfile migration (dryRun: ${dryRun}, targetOrgId: ${targetOrgId || 'all'})`);
    
    // Fetch all users with an orgId
    let usersQuery: Record<string, any> = {};
    if (targetOrgId) {
      usersQuery.orgId = targetOrgId;
    }
    
    const allUsers = await base44.asServiceRole.entities.User.filter(usersQuery);
    const usersWithOrg = allUsers.filter(u => u.orgId);
    
    console.log(`Found ${usersWithOrg.length} users with orgId`);
    
    // Fetch all existing UserProfiles
    const existingProfiles = await base44.asServiceRole.entities.UserProfile.list();
    
    // Create a set of existing userId+orgId combinations for quick lookup
    const existingProfileKeys = new Set(
      existingProfiles.map(p => `${p.userId}:${p.orgId}`)
    );
    
    console.log(`Found ${existingProfiles.length} existing UserProfiles`);
    
    // Find users that need UserProfile records
    const usersNeedingProfile = usersWithOrg.filter(u => 
      !existingProfileKeys.has(`${u.id}:${u.orgId}`)
    );
    
    console.log(`Found ${usersNeedingProfile.length} users needing UserProfile records`);
    
    // Track results
    const results = {
      totalUsers: usersWithOrg.length,
      existingProfiles: existingProfiles.length,
      usersNeedingProfile: usersNeedingProfile.length,
      created: 0,
      errors: [] as string[],
      dryRun: dryRun
    };
    
    // Create UserProfile records
    for (const targetUser of usersNeedingProfile) {
      try {
        // Determine orgRole from legacy fields
        let orgRole = ORG_ROLES.MEMBER;
        
        if (targetUser.isOrgOwner === true || targetUser.appRole === 'organization_owner') {
          orgRole = ORG_ROLES.OWNER;
        } else if (targetUser.appRole === 'organization_manager') {
          orgRole = ORG_ROLES.MANAGER;
        }
        
        const profileData = {
          userId: targetUser.id,
          orgId: targetUser.orgId,
          orgRole: orgRole
        };
        
        if (dryRun) {
          console.log(`[DRY RUN] Would create UserProfile:`, profileData);
        } else {
          await base44.asServiceRole.entities.UserProfile.create(profileData);
          console.log(`Created UserProfile for user ${targetUser.id} (${targetUser.email}) with role ${orgRole}`);
        }
        
        results.created++;
        
      } catch (err) {
        const errorMsg = `Failed to create UserProfile for user ${targetUser.id}: ${err.message}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }
    
    console.log(`Migration complete. Created ${results.created} UserProfiles (dryRun: ${dryRun})`);
    
    return Response.json({
      success: true,
      message: dryRun 
        ? `Dry run complete. Would create ${results.created} UserProfile records.`
        : `Migration complete. Created ${results.created} UserProfile records.`,
      results: results
    });
    
  } catch (error) {
    console.error('Error in migrateUsersToUserProfile:', error);
    return Response.json(
      { 
        error: error.message || 'Migration failed',
        details: error.stack
      },
      { status: 500 }
    );
  }
});
