import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Resend } from 'npm:resend@2.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body for optional recipient email
    let toEmail = user.email;
    try {
      const body = await req.json();
      if (body.toEmail) {
        toEmail = body.toEmail;
      }
    } catch {
      // No body provided, use user's email
    }

    // Initialize Resend with API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return Response.json({ 
        success: false, 
        error: 'RESEND_API_KEY not configured' 
      }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    // Send test email
    const { data, error } = await resend.emails.send({
      from: 'NurturInk <onboarding@resend.dev>',
      to: toEmail,
      subject: 'NurturInk - Resend Connection Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #FF7A00;">Resend Connection Successful!</h1>
          <p>This is a test email to verify that your Resend API key is working correctly.</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <p><strong>Sent to:</strong> ${toEmail}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">This email was sent from NurturInk via Resend.</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return Response.json({ 
        success: false, 
        error: error.message || 'Failed to send test email' 
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: `Test email sent successfully to ${toEmail}`,
      emailId: data?.id
    });

  } catch (error) {
    console.error('Error in testResendConnection:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to test Resend connection' 
    }, { status: 500 });
  }
});