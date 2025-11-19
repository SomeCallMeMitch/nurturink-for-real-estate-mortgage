import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend';

// Initialize Resend with the secret environment variable
const resend = new Resend(Deno.env.get('Resend'));

Deno.serve(async (req) => {
  try {
    // Initialize Base44 SDK
    const base44 = createClientFromRequest(req);

    // Authenticate the user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { to, subject, html, from = 'onboarding@resend.dev' } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return Response.json({ error: 'Missing required fields: to, subject, html' }, { status: 400 });
    }

    // Send email via Resend
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (data.error) {
      console.error('Resend API Error:', data.error);
      return Response.json({ error: data.error.message, details: data.error }, { status: 500 });
    }

    // Return success response
    return Response.json({ success: true, data });

  } catch (error) {
    console.error('Function Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});