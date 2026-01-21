/**
 * Resend Webhook Handler: Forward Received Emails
 * 
 * This function receives webhook events from Resend when an email is received.
 * It fetches the full email content and attachments, then forwards the email
 * to mitch@lynxecom.com.
 * 
 * Webhook URL to configure in Resend: [Your App URL]/api/forwardReceivedEmail
 */

import { Resend } from 'npm:resend@3.0.0';

const FORWARD_TO_EMAIL = 'mitch@lynxecom.com';
const RESEND_API_URL = 'https://api.resend.com';

Deno.serve(async (req) => {
  // Only accept POST requests (webhooks)
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    // Parse the webhook payload
    const webhookEvent = await req.json();
    console.log('Received webhook event:', JSON.stringify(webhookEvent, null, 2));

    // Only process email.received events
    if (webhookEvent.type !== 'email.received') {
      console.log(`Ignoring event type: ${webhookEvent.type}`);
      return Response.json({ success: true, message: 'Event type ignored' });
    }

    const eventData = webhookEvent.data;
    const emailId = eventData.email_id;

    if (!emailId) {
      console.error('No email_id in webhook payload');
      return Response.json({ error: 'Missing email_id' }, { status: 400 });
    }

    console.log(`Processing received email: ${emailId}`);

    // Step 1: Fetch the full email content from Resend API
    const emailResponse = await fetch(`${RESEND_API_URL}/emails/${emailId}`, {
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
      },
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error(`Failed to fetch email content: ${errorText}`);
      return Response.json({ error: 'Failed to fetch email content' }, { status: 500 });
    }

    const emailResult = await emailResponse.json();
    const emailContent = emailResult.data || emailResult;
    console.log('Fetched email content:', JSON.stringify(emailContent, null, 2));

    // Step 2: Fetch attachments if any
    let attachmentsToForward = [];
    try {
      const attachmentsResponse = await fetch(`${RESEND_API_URL}/emails/${emailId}/attachments`, {
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
        },
      });

      if (attachmentsResponse.ok) {
        const attachmentsResult = await attachmentsResponse.json();
        const attachments = attachmentsResult.data || [];

        // Download each attachment and encode in base64
        for (const attachment of attachments) {
          if (attachment.download_url) {
            try {
              const downloadResponse = await fetch(attachment.download_url);
              if (downloadResponse.ok) {
                const arrayBuffer = await downloadResponse.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                
                // Convert to base64
                let binary = '';
                for (let i = 0; i < uint8Array.length; i++) {
                  binary += String.fromCharCode(uint8Array[i]);
                }
                const base64Content = btoa(binary);

                attachmentsToForward.push({
                  filename: attachment.filename || 'attachment',
                  content: base64Content,
                  content_type: attachment.content_type,
                });
              }
            } catch (attachmentError) {
              console.error(`Failed to download attachment: ${attachment.filename}`, attachmentError);
            }
          }
        }
        console.log(`Processed ${attachmentsToForward.length} attachments`);
      }
    } catch (attachmentFetchError) {
      console.error('Error fetching attachments:', attachmentFetchError);
      // Continue without attachments
    }

    // Step 3: Build the forwarded email subject
    const originalFrom = eventData.from || emailContent.from || 'Unknown Sender';
    const originalSubject = eventData.subject || emailContent.subject || '(No Subject)';
    const forwardSubject = `Fwd: ${originalSubject}`;

    // Step 4: Build forwarded email body with original message info
    const forwardHeader = `
---------- Forwarded message ---------
From: ${originalFrom}
To: ${eventData.to || 'Receiving Address'}
Subject: ${originalSubject}
Date: ${new Date().toLocaleString()}

`;

    // Use the original HTML or plain text content
    let htmlBody = emailContent.html || '';
    let textBody = emailContent.text || '';

    // Wrap HTML content with forward header
    if (htmlBody) {
      htmlBody = `
<div style="font-family: Arial, sans-serif; padding: 10px; border-left: 3px solid #ccc; margin-bottom: 20px;">
  <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">---------- Forwarded message ---------</p>
  <p style="margin: 2px 0;"><strong>From:</strong> ${originalFrom}</p>
  <p style="margin: 2px 0;"><strong>To:</strong> ${eventData.to || 'Receiving Address'}</p>
  <p style="margin: 2px 0;"><strong>Subject:</strong> ${originalSubject}</p>
  <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
</div>
<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
${htmlBody}
`;
    }

    // Prepend forward header to text body
    if (textBody) {
      textBody = forwardHeader + textBody;
    }

    // Step 5: Forward the email via Resend
    const sendPayload = {
      from: 'NurturInk Forwarding <onboarding@resend.dev>', // Update this to your verified domain sender
      to: [FORWARD_TO_EMAIL],
      subject: forwardSubject,
      reply_to: originalFrom, // Allow replying to original sender
    };

    // Add content
    if (htmlBody) {
      sendPayload.html = htmlBody;
    }
    if (textBody) {
      sendPayload.text = textBody;
    }

    // Add attachments if any
    if (attachmentsToForward.length > 0) {
      sendPayload.attachments = attachmentsToForward;
    }

    console.log('Forwarding email to:', FORWARD_TO_EMAIL);
    const { data: sendResult, error: sendError } = await resend.emails.send(sendPayload);

    if (sendError) {
      console.error('Failed to forward email:', sendError);
      return Response.json({ 
        error: 'Failed to forward email', 
        details: sendError.message || JSON.stringify(sendError) 
      }, { status: 500 });
    }

    console.log('Email forwarded successfully:', sendResult?.id);

    return Response.json({
      success: true,
      message: `Email forwarded to ${FORWARD_TO_EMAIL}`,
      originalEmailId: emailId,
      forwardedEmailId: sendResult?.id,
    });

  } catch (error) {
    console.error('Error in forwardReceivedEmail:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});