import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Initialize Base44 SDK for entity operations
    const base44 = createClientFromRequest(req);

    // Get the raw body
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    // Log the incoming webhook for debugging
    console.log('=== RESEND WEBHOOK RECEIVED ===');
    console.log('Event type:', body.type);
    console.log('Data keys:', Object.keys(body.data || {}));

    // Extract event data
    const eventType = body.type;
    const data = body.data || {};

    // Only process email.received events
    if (eventType !== 'email.received') {
      console.log(`Event type "${eventType}" not processed`);
      return Response.json({ success: true, message: 'Event type not processed' });
    }

    console.log(`Processing email - From: ${data.from}, To: ${data.to}, Subject: ${data.subject}`);

    const forwardToEmail = 'mitch@lynxecom.com';
    const now = new Date().toISOString();

    // Step 1: Store the email in IncomingEmail entity
    let storedEmailId = null;
    try {
      const storedEmail = await base44.asServiceRole.entities.IncomingEmail.create({
        resendEmailId: data.email_id || data.id || `resend-${Date.now()}`,
        from: data.from || 'unknown',
        to: data.to || 'unknown',
        subject: data.subject || 'No Subject',
        text: data.text || '',
        html: data.html || '',
        attachments: data.attachments ? JSON.stringify(data.attachments) : null,
        forwardedTo: forwardToEmail,
        receivedAt: data.created_at || now
      });
      storedEmailId = storedEmail.id;
      console.log('Email stored successfully, ID:', storedEmailId);
    } catch (storageError) {
      console.error('Failed to store email:', storageError.message);
      // Continue with forwarding even if storage fails
    }

    // Step 2: Forward the email
    try {
      const forwardResult = await resend.emails.send({
        from: 'NurturInk Inbox <notifications@nurturink.com>',
        to: forwardToEmail,
        subject: `[Forwarded] ${data.subject || 'No Subject'}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333;">
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>From:</strong> ${data.from || 'Unknown'}<br/>
                <strong>To:</strong> ${data.to || 'Unknown'}<br/>
                <strong>Subject:</strong> ${data.subject || 'No Subject'}<br/>
                <strong>Received:</strong> ${new Date(data.created_at || Date.now()).toLocaleString()}
              </p>
            </div>
            <div style="border-left: 4px solid #FF7A00; padding-left: 15px; margin: 20px 0;">
              ${data.html || `<pre style="white-space: pre-wrap; word-wrap: break-word;">${data.text || 'No content'}</pre>`}
            </div>
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
              <p style="margin: 0;">This email was forwarded by NurturInk's inbound email system.</p>
              ${storedEmailId ? `<p style="margin: 5px 0 0;">Stored Email ID: ${storedEmailId}</p>` : ''}
            </div>
          </div>
        `,
        text: `From: ${data.from}\nTo: ${data.to}\nSubject: ${data.subject}\n\n${data.text || data.html || 'No content'}\n\n---\nForwarded by NurturInk`
      });

      console.log('Email forwarded successfully, Resend ID:', forwardResult.data?.id);

      // Step 3: Update stored email with forwarding timestamp
      if (storedEmailId) {
        try {
          await base44.asServiceRole.entities.IncomingEmail.update(storedEmailId, {
            forwardedAt: now
          });
          console.log('Updated forwardedAt timestamp');
        } catch (updateError) {
          console.warn('Could not update forwardedAt:', updateError.message);
        }
      }

      return Response.json({
        success: true,
        message: 'Email received and forwarded',
        storedEmailId,
        forwardedId: forwardResult.data?.id
      });

    } catch (forwardError) {
      console.error('Error forwarding email:', forwardError.message);
      // Return 200 to Resend so it doesn't retry, but indicate failure
      return Response.json({
        success: false,
        error: 'Failed to forward email',
        details: forwardError.message,
        storedEmailId
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Error processing webhook:', error.message);
    // Return 200 to Resend to prevent retries
    return Response.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 200 });
  }
});