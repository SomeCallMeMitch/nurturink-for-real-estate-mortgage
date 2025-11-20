import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { to, subject, html, text, from, replyTo } = await req.json();

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return Response.json({ 
        error: 'Missing required fields: to, subject, and either html or text' 
      }, { status: 400 });
    }

    // Send email via Resend
    const result = await resend.emails.send({
      from: from || 'onboarding@resend.dev', // Default Resend sender for testing
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
      text: text,
      replyTo: replyTo,
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return Response.json({ 
      error: error.message || 'Failed to send email' 
    }, { status: 500 });
  }
});