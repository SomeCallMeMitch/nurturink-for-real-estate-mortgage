import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📧 Sending test email to:', user.email);

    const result = await resend.emails.send({
      from: 'RoofScribe <billing@roofscribe.com>',
      to: user.email,
      subject: 'Test Email from RoofScribe',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Test Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px;">
              <h1 style="color: #FF7A00; margin-bottom: 20px;">✅ Test Email Successful</h1>
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                This is a test email from RoofScribe. If you're receiving this, your Resend integration is working correctly!
              </p>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Sent to: ${user.email}<br>
                Time: ${new Date().toLocaleString()}
              </p>
            </div>
          </body>
        </html>
      `,
      text: `Test Email from RoofScribe\n\nThis is a test email. If you're receiving this, your Resend integration is working correctly!\n\nSent to: ${user.email}\nTime: ${new Date().toLocaleString()}`
    });

    console.log('✅ Test email sent successfully. Email ID:', result.data?.id);

    return Response.json({
      success: true,
      emailId: result.data?.id,
      sentTo: user.email,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});