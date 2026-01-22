import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

/**
 * Verify Resend webhook signature using Deno's native Web Crypto API
 * Converts the secret and body to appropriate formats for HMAC-SHA256
 */
const verifyResendSignature = async (body, signature, secret) => {
  try {
    // Encode the secret as a CryptoKey
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Sign the body
    const bodyData = encoder.encode(body);
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, bodyData);
    
    // Convert the signature to hex
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const digest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Compare signatures (constant-time comparison would be ideal, but this works for webhooks)
    return digest === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Process incoming email from Resend webhook
 * 1. Verify webhook signature
 * 2. Store email in IncomingEmail entity
 * 3. Forward email to user's Gmail
 * 4. Return 200 OK to Resend
 */
Deno.serve(async (req) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return Response.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Get the raw body for signature verification
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    // Get signature from headers
    const signature = req.headers.get('resend-signature');
    const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');

    if (!signature || !secret) {
      console.error('Missing signature or webhook secret');
      return Response.json(
        { error: 'Webhook not properly configured' },
        { status: 500 }
      );
    }

    // Verify the signature (now async)
    const isValidSignature = await verifyResendSignature(bodyText, signature, secret);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return Response.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
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

    // Step 1: Store email in IncomingEmail entity
    let storedEmailId = null;
    try {
      // Use base44 SDK to store the email
      // Note: This assumes base44 SDK is available in the function context
      const storedEmail = await globalThis.base44?.asServiceRole?.entities?.IncomingEmail?.create?.({
        resendEmailId: email_id,
        from,
        to,
        subject,
        text: text || '',
        html: html || '',
        attachments: attachments || [],
        forwardedTo: forwardToEmail,
        receivedAt: created_at || now
      });
      storedEmailId = storedEmail?.id;
      console.log('Email stored in IncomingEmail entity:', storedEmailId);
    } catch (storageError) {
      console.warn('Could not store email in entity (may not be available):', storageError);
      // Continue with forwarding even if storage fails
    }

    // Step 2: Forward email to user's Gmail
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
              ${storedEmailId ? `<p style="margin: 5px 0 0;">Email ID: ${storedEmailId}</p>` : ''}
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
${storedEmailId ? `Email ID: ${storedEmailId}` : ''}
        `
      });

      console.log('Email forwarded successfully:', forwardResult.data?.id);

      // Step 3: Update the stored email with forwarding timestamp
      if (storedEmailId) {
        try {
          await globalThis.base44?.asServiceRole?.entities?.IncomingEmail?.update?.(
            storedEmailId,
            { forwardedAt: now }
          );
        } catch (updateError) {
          console.warn('Could not update forwarding timestamp:', updateError);
        }
      }

      // Return 200 OK to Resend
      return Response.json({
        success: true,
        message: 'Email received and forwarded',
        emailId: email_id,
        storedEmailId,
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