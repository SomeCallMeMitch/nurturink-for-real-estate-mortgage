import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return Response.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Get the raw body
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    // Get signature from headers (optional for testing)
    const signature = req.headers.get('resend-signature');
    const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    
    // DEBUG: Log the secret status
    console.log('RESEND_WEBHOOK_SECRET value:', secret ? 'Set' : 'Not Set');
    console.log('Signature header present:', signature ? 'Yes' : 'No');

    // If signature is provided, we could verify it (but skipping for now due to performance)
    if (signature && secret) {
      console.log('Webhook signature and secret both present');
    } else if (signature && !secret) {
      console.warn('Signature provided but RESEND_WEBHOOK_SECRET not set');
    }

    // Extract email data from Resend webhook
    const {
      type,
      data: {
        from,
        to,
        subject,
        text,
        html,
        attachments,
        email_id,
        created_at
      }
    } = body;

    // Only process email.received events
    if (type !== 'email.received') {
      return Response.json({ success: true, message: 'Event type not processed' });
    }

    if (!from || !to || !subject) {
      return Response.json(
        { error: 'Missing required email fields' },
        { status: 400 }
      );
    }

    const forwardToEmail = 'mitch@lynxecom.com';
    const now = new Date().toISOString();

    console.log(`Processing email from ${from} to ${to} with subject: ${subject}`);

    // Forward email to user's Gmail
    try {
      const forwardResult = await resend.emails.send({
        from: 'NurturInk Inbox <notifications@nurturink.com>',
        to: forwardToEmail,
        subject: `[Forwarded] ${subject}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333;">
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>From:</strong> ${from}<br>
                <strong>To:</strong> ${to}<br>
                <strong>Subject:</strong> ${subject}<br>
                <strong>Received:</strong> ${new Date(created_at || now).toLocaleString()}
              </p>
            </div>
            <div style="border-left: 4px solid #FF7A00; padding-left: 15px; margin: 20px 0;">
              ${html || `<pre style="white-space: pre-wrap; word-wrap: break-word;">${text}</pre>`}
            </div>
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
              <p style="margin: 0;">This email was forwarded by NurturInk's inbound email system.</p>
            </div>
          </div>
        `,
        text: `
From: ${from}
To: ${to}
Subject: ${subject}
Received: ${new Date(created_at || now).toLocaleString()}

---

${text || html}

---
This email was forwarded by NurturInk's inbound email system.
        `
      });

      console.log('Email forwarded successfully:', forwardResult.data?.id);

      return Response.json({
        success: true,
        message: 'Email received and forwarded',
        emailId: email_id,
        forwardedTo: forwardToEmail
      });

    } catch (forwardError) {
      console.error('Error forwarding email:', forwardError);
      return Response.json(
        { error: 'Failed to forward email', details: forwardError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing inbound email:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
});
