import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { ORG_ROLES, mapLegacyRoleToOrgRole, upsertUserProfile } from './utils/roleHelpers.ts';

/**
 * Migration function to populate UserProfile entity from existing User records
 * 
 * Creates a UserProfile for every user that belongs to an organization.
 * The orgRole is determined from the legacy appRole and isOrgOwner fields.
 * 
 * Usage:
 * await base44.functions.invoke('migrateUsersToUserProfile', { dryRun: true });
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only super admins can run this migration
    if (user.appRole !== 'super_admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun !== false; // Default to true for safety
    
    // 1. Fetch all users with an orgId
    // Note: We might need pagination if there are many users, but for now fetch all
    const allUsers = await base44.asServiceRole.entities.User.filter({});
    const usersWithOrg = allUsers.filter(u => u.orgId);
    
    console.log(`Found ${usersWithOrg.length} users belonging to organizations.`);
    
    const results = {
      total: usersWithOrg.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      details: []
    };
    
    // 2. Process each user
    for (const user of usersWithOrg) {
      try {
        // Determine correct orgRole
        let orgRole = ORG_ROLES.MEMBER;
        
        if (user.isOrgOwner || user.appRole === 'organization_owner') {
          orgRole = ORG_ROLES.OWNER;
        } else if (user.appRole === 'organization_manager') {
          orgRole = ORG_ROLES.MANAGER;
        }
        
        // Check if profile already exists
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({
          userId: user.id,
          orgId: user.orgId
        });
        
        const existingProfile = profiles.length > 0 ? profiles[0] : null;
        
        if (dryRun) {
          results.details.push({
            userId: user.id,
            email: user.email,
            orgId: user.orgId,
            inferredRole: orgRole,
            action: existingProfile ? 'update' : 'create'
          });
          if (existingProfile) results.updated++;
          else results.created++;
        } else {
          // Perform the migration
          if (existingProfile) {
            // Update if role is different
            if (existingProfile.orgRole !== orgRole) {
              await base44.asServiceRole.entities.UserProfile.update(existingProfile.id, {
                orgRole: orgRole
              });
              results.updated++;
            } else {
              results.skipped++;
            }
          } else {
            // Create new profile
            await base44.asServiceRole.entities.UserProfile.create({
              userId: user.id,
              orgId: user.orgId,
              orgRole: orgRole
            });
            results.created++;
          }
        }
        
      } catch (err) {
        console.error(`Error processing user ${user.id}:`, err);
        results.errors.push({ userId: user.id, error: err.message });
      }
    }
    
    return Response.json({
      success: true,
      dryRun: dryRun,
      results: results
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});