import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Migration function: Sets ownerId = createdBy for all existing campaigns
 * that don't have an ownerId set.
 * 
 * ADMIN ONLY: This function should only be called by super admins.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ADMIN ONLY: Verify the user is a super admin
    if (user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        error: 'Forbidden: Admin access required' 
      }, { status: 403 });
    }

    console.log('[migrateCampaignOwnerId] Starting migration...');

    // Fetch all campaigns using service role
    const allCampaigns = await base44.asServiceRole.entities.Campaign.filter({});

    console.log(`[migrateCampaignOwnerId] Found ${allCampaigns.length} total campaigns`);

    // Filter campaigns that don't have ownerId set
    const campaignsToMigrate = allCampaigns.filter(c => !c.ownerId);

    console.log(`[migrateCampaignOwnerId] ${campaignsToMigrate.length} campaigns need migration`);

    let migratedCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const campaign of campaignsToMigrate) {
      try {
        // Set ownerId to createdBy (the original creator)
        // Note: createdBy is a built-in field that stores the user email
        // We need to find the user ID from the email or use the built-in created_by if it's ID
        
        // Check if createdBy is already set on the campaign object
        let ownerIdValue = campaign.createdBy;
        
        // If createdBy looks like an email, we need to find the user ID
        if (ownerIdValue && ownerIdValue.includes('@')) {
          // Try to find user by email
          const users = await base44.asServiceRole.entities.User.filter({ email: ownerIdValue });
          if (users && users.length > 0) {
            ownerIdValue = users[0].id;
          } else {
            console.warn(`[migrateCampaignOwnerId] Could not find user for email: ${ownerIdValue}`);
            // Fall back to using the email as-is (will need manual fix later)
          }
        }

        if (!ownerIdValue) {
          // If no createdBy, check the built-in created_by field (which is email)
          const createdByEmail = campaign.created_by;
          if (createdByEmail) {
            const users = await base44.asServiceRole.entities.User.filter({ email: createdByEmail });
            if (users && users.length > 0) {
              ownerIdValue = users[0].id;
            }
          }
        }

        if (ownerIdValue) {
          await base44.asServiceRole.entities.Campaign.update(campaign.id, {
            ownerId: ownerIdValue
          });
          migratedCount++;
          console.log(`[migrateCampaignOwnerId] Migrated campaign ${campaign.id} (${campaign.name}) -> ownerId: ${ownerIdValue}`);
        } else {
          console.warn(`[migrateCampaignOwnerId] Skipping campaign ${campaign.id} - no owner found`);
          errors.push({ campaignId: campaign.id, name: campaign.name, reason: 'No owner found' });
          failedCount++;
        }
      } catch (updateError) {
        console.error(`[migrateCampaignOwnerId] Failed to update campaign ${campaign.id}:`, updateError);
        errors.push({ campaignId: campaign.id, name: campaign.name, reason: updateError.message });
        failedCount++;
      }
    }

    console.log(`[migrateCampaignOwnerId] Migration complete. Migrated: ${migratedCount}, Failed: ${failedCount}`);

    return Response.json({
      success: true,
      totalCampaigns: allCampaigns.length,
      campaignsNeedingMigration: campaignsToMigrate.length,
      migratedCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('[migrateCampaignOwnerId] Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Migration failed' 
    }, { status: 500 });
  }
});