import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Migration Function: Move existing creditBalance to companyAllocatedCredits
 * 
 * This migration:
 * 1. For all users with creditBalance > 0
 * 2. Moves creditBalance to companyAllocatedCredits
 * 3. Sets creditBalance to 0 (deprecated field)
 * 4. Creates migration transaction records
 * 
 * IMPORTANT: Run this ONCE after deploying the new credit system
 * Safe to run multiple times - idempotent (checks for existing migration)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated and is super admin
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.appRole !== 'super_admin') {
      return Response.json(
        { error: 'Only super admins can run this migration' },
        { status: 403 }
      );
    }
    
    console.log('🚀 Starting credit balance migration...');
    console.log('👤 Initiated by:', user.email);
    
    // Load all users with creditBalance > 0
    const allUsers = await base44.asServiceRole.entities.User.filter({});
    const usersToMigrate = allUsers.filter(u => (u.creditBalance || 0) > 0);
    
    console.log(`📊 Found ${usersToMigrate.length} users with credit balance to migrate`);
    
    if (usersToMigrate.length === 0) {
      return Response.json({
        success: true,
        message: 'No users need migration - all credit balances are already 0',
        usersMigrated: 0,
        totalCreditsM igrated: 0
      });
    }
    
    const migrationResults = [];
    let totalCredits Migrated = 0;
    let successCount = 0;
    let errorCount = 0;
    
    for (const targetUser of usersToMigrate) {
      try {
        const oldBalance = targetUser.creditBalance || 0;
        
        // Skip if already migrated (companyAllocatedCredits already has value and creditBalance should be 0)
        if ((targetUser.companyAllocatedCredits || 0) > 0 && oldBalance === 0) {
          console.log(`⏭️ Skipping ${targetUser.email} - already migrated`);
          migrationResults.push({
            userId: targetUser.id,
            email: targetUser.email,
            status: 'skipped',
            reason: 'already_migrated'
          });
          continue;
        }
        
        console.log(`🔄 Migrating ${targetUser.email}: ${oldBalance} credits`);
        
        // Move balance from creditBalance to companyAllocatedCredits
        const newCompanyAllocated = (targetUser.companyAllocatedCredits || 0) + oldBalance;
        
        await base44.asServiceRole.entities.User.update(targetUser.id, {
          companyAllocatedCredits: newCompanyAllocated,
          creditBalance: 0  // Reset legacy field
        });
        
        // Create transaction record for audit trail
        await base44.asServiceRole.entities.Transaction.create({
          orgId: targetUser.orgId || '',
          userId: targetUser.id,
          type: 'voucher',
          amount: 0,  // No change to total, just reorganization
          balanceAfter: newCompanyAllocated,
          balanceType: 'user',
          description: `Credit migration: Moved ${oldBalance} credits from legacy creditBalance to companyAllocatedCredits`,
          metadata: {
            migration: true,
            migratedBy: user.id,
            migratedAt: new Date().toISOString(),
            oldCreditBalance: oldBalance,
            newCompanyAllocatedCredits: newCompanyAllocated,
            creditType: 'companyAllocatedCredits'
          }
        });
        
        totalCreditsMigrated += oldBalance;
        successCount++;
        
        migrationResults.push({
          userId: targetUser.id,
          email: targetUser.email,
          status: 'success',
          creditsMigrated: oldBalance,
          newCompanyAllocated: newCompanyAllocated
        });
        
        console.log(`✅ Migrated ${targetUser.email}: ${oldBalance} → companyAllocatedCredits`);
        
      } catch (userError) {
        console.error(`❌ Error migrating ${targetUser.email}:`, userError);
        errorCount++;
        
        migrationResults.push({
          userId: targetUser.id,
          email: targetUser.email,
          status: 'error',
          error: userError.message
        });
      }
    }
    
    console.log('========================================');
    console.log('✅ MIGRATION COMPLETE');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`💰 Total Credits Migrated: ${totalCreditsMigrated}`);
    console.log('========================================');
    
    return Response.json({
      success: true,
      message: `Migration complete: ${successCount} users migrated`,
      usersMigrated: successCount,
      usersErrored: errorCount,
      totalCreditsMigrated: totalCreditsMigrated,
      results: migrationResults
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return Response.json(
      { 
        success: false,
        error: error.message || 'Migration failed',
        details: error.stack
      },
      { status: 500 }
    );
  }
});