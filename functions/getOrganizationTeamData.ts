import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get comprehensive team data for an organization
 * Returns team members with usage stats and summary statistics
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is organization owner or super admin
    const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;
    const isSuperAdmin = user.appRole === 'super_admin';
    
    // Super admins with isOrgOwner flag OR organization owners can access
    if (!isOrgOwner && !isSuperAdmin) {
      return Response.json(
        { error: 'Access denied. Only organization owners and super admins can view team data.' },
        { status: 403 }
      );
    }
    
    // Determine which organization to query
    const targetOrgId = user.orgId;
    
    if (!targetOrgId) {
      // For super_admin without orgId, provide helpful error
      if (isSuperAdmin) {
        return Response.json(
          { error: 'You need to be assigned to an organization to view team data. Please set your orgId in your user profile or use the admin dashboard to select an organization.' },
          { status: 400 }
        );
      }
      return Response.json(
        { error: 'No organization found' },
        { status: 400 }
      );
    }
    
    // Fetch all users in the organization
    const teamMembers = await base44.asServiceRole.entities.User.filter({
      orgId: targetOrgId
    });
    
    // Fetch pending invitations
    const pendingInvitations = await base44.asServiceRole.entities.Invitation.filter({
      orgId: targetOrgId,
      status: 'pending'
    });
    
    // Get current month date range for stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Aggregate data for each member
    const membersWithStats = await Promise.all(
      teamMembers.map(async (member) => {
        // Get notes sent by this member
        const notes = await base44.asServiceRole.entities.Note.filter({
          senderUserId: member.id
        });
        
        // Get notes sent this month
        const notesThisMonth = notes.filter(note => 
          new Date(note.created_date) >= startOfMonth
        );
        
        // Get most recent activity (latest note or transaction)
        const recentTransactions = await base44.asServiceRole.entities.Transaction.filter({
          userId: member.id
        }, '-created_date', 1);
        
        let lastActive = member.updated_date || member.created_date;
        
        if (notes.length > 0) {
          const latestNoteDate = notes[0].created_date;
          if (new Date(latestNoteDate) > new Date(lastActive)) {
            lastActive = latestNoteDate;
          }
        }
        
        if (recentTransactions.length > 0) {
          const latestTransactionDate = recentTransactions[0].created_date;
          if (new Date(latestTransactionDate) > new Date(lastActive)) {
            lastActive = latestTransactionDate;
          }
        }
        
        // Determine status (simple heuristic for now)
        const daysSinceActive = (now - new Date(lastActive)) / (1000 * 60 * 60 * 24);
        let status = 'Active';
        if (daysSinceActive > 30) {
          status = 'Inactive';
        }
        
        // Generate initials for avatar
        const nameParts = (member.full_name || member.email).split(' ');
        const initials = nameParts.length >= 2 
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : (nameParts[0][0] || 'U').toUpperCase();
        
        return {
          userId: member.id,
          name: member.full_name || member.email,
          email: member.email,
          initials: initials,
          role: member.appRole || 'sales_rep',
          isOrgOwner: member.appRole === 'organization_owner' || member.isOrgOwner === true,
          status: status,
          credits: member.creditBalance || 0,
          cardsSent: notes.length,
          cardsSentThisMonth: notesThisMonth.length,
          lastActive: lastActive,
          createdAt: member.created_date
        };
      })
    );
    
    // Add pending invitations to the list
    const pendingMembers = pendingInvitations.map(invitation => ({
      invitationId: invitation.id,
      userId: null,
      name: invitation.email,
      email: invitation.email,
      initials: invitation.email[0].toUpperCase(),
      role: invitation.role,
      isOrgOwner: invitation.role === 'organization_owner',
      status: 'Pending',
      credits: 0,
      cardsSent: 0,
      cardsSentThisMonth: 0,
      lastActive: invitation.createdAt,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt
    }));
    
    // Combine active members and pending invitations
    const allMembers = [...membersWithStats, ...pendingMembers];
    
    // Sort by created date (newest first)
    allMembers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Calculate summary statistics
    const activeMembers = membersWithStats.filter(m => m.status === 'Active').length;
    const adminCount = membersWithStats.filter(m => m.isOrgOwner).length;
    const totalCardsSent = membersWithStats.reduce((sum, m) => sum + m.cardsSent, 0);
    
    const summaryStats = {
      totalMembers: allMembers.length,
      activeMembers: activeMembers,
      admins: adminCount,
      cardsSent: totalCardsSent
    };
    
    return Response.json({
      members: allMembers,
      summaryStats: summaryStats
    });
    
  } catch (error) {
    console.error('Error in getOrganizationTeamData:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to fetch team data',
        details: error.stack
      },
      { status: 500 }
    );
  }
});