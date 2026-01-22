import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Declare hmacKeyPromise outside Deno.serve to persist across requests (warm starts)
let hmacKeyPromise = null;

// Function to get or create the HMAC key once
const getOrCreateHmacKey = async (secret) => {
  if (!secret) {
    return null;
  }
  // If hmacKeyPromise is not initialized, or if it resolved to null (meaning secret was initially missing)
  if (!hmacKeyPromise) {
    hmacKeyPromise = (async () => {
      try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        return await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
      } catch (e) {
        console.error('Failed to import HMAC key:', e);
        return null;
      }
    })();
  }
  return await hmacKeyPromise;
};

/**
 * Verify Resend webhook signature using Deno's native Web Crypto API
 * Accepts a pre-computed CryptoKey to avoid repeated importKey calls.
 */
const verifyResendSignature = async (body, signature, key) => {
  try {
    if (!key) {
      console.error('HMAC key not provided for signature verification.');
      return false;
    }
    const encoder = new TextEncoder();
    const bodyData = encoder.encode(body);
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, bodyData);
    
    // Convert the signature to hex
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const digest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return digest === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

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

    console.log('RESEND_WEBHOOK_SECRET value:', secret ? 'Set' : 'Not Set');
    console.log('Signature header present:', signature ? 'Yes' : 'No');

    // Get or create the HMAC key
    const hmacKey = await getOrCreateHmacKey(secret);

    // For testing: allow requests without signature
    // For production: Resend will always send a signature
    if (signature && secret && hmacKey) {
      console.log('Verifying webhook signature...');
      const isValidSignature = await verifyResendSignature(bodyText, signature, hmacKey);
      if (!isValidSignature) {
        console.error('Invalid webhook signature');
        return Response.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
      console.log('Signature verified successfully');
    } else {
      console.log('No signature/secret provided - allowing request (test mode)');
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

    // Step 1: Store email in IncomingEmail entity
    let storedEmailId = null;
    try {
      // Use base44 SDK to store the email
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
      console.warn('Could not store email in entity:', storageError);
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
                <strong>From:</strong> ${from}  

                <strong>To:</strong> ${to}  

                <strong>Subject:</strong> ${subject}  

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
