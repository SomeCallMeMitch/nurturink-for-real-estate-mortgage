import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { test_email } = await req.json();
    
    if (!test_email) {
      return Response.json({ error: 'test_email is required' }, { status: 400 });
    }

    const results = [];
    const appUrl = Deno.env.get("APP_URL") || "https://app.base44.com";

    // 1. Welcome Email
    try {
      const welcomeResult = await base44.functions.invoke('sendWelcomeEmail', {
        user_firstName: 'Aatman',
        user_email: test_email,
        dashboard_url: `${appUrl}/Home`,
        send_note_url: `${appUrl}/FindClients`,
        templates_url: `${appUrl}/Templates`,
        support_url: `${appUrl}/support`,
        app_logo_url: `${appUrl}/logo.png`
      });
      results.push({ template: 'Welcome Email', status: 'sent', data: welcomeResult.data });
    } catch (error) {
      results.push({ template: 'Welcome Email', status: 'failed', error: error.message });
    }

    // 2. Team Invitation Email
    try {
      const invitationResult = await base44.functions.invoke('sendTeamInvitationEmail', {
        inviter_firstName: 'John',
        inviter_fullName: 'John Smith',
        invitee_email: test_email,
        organization_name: 'Test Roofing Company',
        role: 'sales_rep',
        role_display: 'Member',
        invitation_token: 'test-token-12345',
        invitation_expires: '7 days',
        app_logo_url: `${appUrl}/logo.png`
      });
      results.push({ template: 'Team Invitation Email', status: 'sent', data: invitationResult.data });
    } catch (error) {
      results.push({ template: 'Team Invitation Email', status: 'failed', error: error.message });
    }

    // 3. Invitation Accepted Email
    try {
      const acceptedResult = await base44.functions.invoke('sendInvitationAcceptedEmail', {
        admin_email: test_email,
        admin_firstName: 'John',
        new_member_fullName: 'Sarah Johnson',
        new_member_email: 'sarah@example.com',
        new_member_role_display: 'Member',
        organization_name: 'Test Roofing Company',
        joined_timestamp: new Date().toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: 'numeric' 
        }),
        team_management_url: `${appUrl}/TeamManagement`,
        member_profile_url: `${appUrl}/TeamManagement`,
        app_logo_url: `${appUrl}/logo.png`
      });
      results.push({ template: 'Invitation Accepted Email', status: 'sent', data: acceptedResult.data });
    } catch (error) {
      results.push({ template: 'Invitation Accepted Email', status: 'failed', error: error.message });
    }

    // 4. Password Reset Email
    try {
      const resetResult = await base44.functions.invoke('sendPasswordResetEmail', {
        user_firstName: 'Aatman',
        user_email: test_email,
        reset_token: 'test-reset-token-67890',
        expires_in: '1 hour',
        request_ip: '192.168.1.1',
        support_url: `${appUrl}/support`,
        app_logo_url: `${appUrl}/logo.png`
      });
      results.push({ template: 'Password Reset Email', status: 'sent', data: resetResult.data });
    } catch (error) {
      results.push({ template: 'Password Reset Email', status: 'failed', error: error.message });
    }

    return Response.json({ 
      success: true,
      message: `Sent ${results.filter(r => r.status === 'sent').length} of 4 test emails to ${test_email}`,
      results 
    });

  } catch (error) {
    console.error('Error sending test emails:', error);
    return Response.json({ 
      error: error.message || 'Failed to send test emails' 
    }, { status: 500 });
  }
});