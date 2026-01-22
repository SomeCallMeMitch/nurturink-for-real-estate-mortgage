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

    // DEBUG: Log the entire payload
    console.log('=== RESEND WEBHOOK PAYLOAD ===');
    console.log('Full body:', JSON.stringify(body, null, 2));
    console.log('Event type:', body.type);
    console.log('Data keys:', Object.keys(body.data || {}));
    console.log('================================');

    // Extract email data
    const eventType = body.type;
    const data = body.data || {};

    console.log(`Processing event type: ${eventType}`);
    console.log(`From: ${data.from}, To: ${data.to}, Subject: ${data.subject}`);

    // For now, just return 200 OK for any email.received event
    if (eventType === 'email.received') {
      console.log('✅ Email received event detected');
      
      // Try to forward
      try {
        const forwardResult = await resend.emails.send({
          from: 'NurturInk Inbox <notifications@nurturink.com>',
          to: 'mitch@lynxecom.com',
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
              </div>
            </div>
          `,
          text: `From: ${data.from}\nTo: ${data.to}\nSubject: ${data.subject}\n\n${data.text || data.html}\n\n---\nForwarded by NurturInk`
        });
        
        console.log('✅ Email forwarded successfully:', forwardResult.data?.id);
        
        return Response.json({
          success: true,
          message: 'Email received and forwarded',
          forwardedId: forwardResult.data?.id
        }, { status: 200 });
      } catch (forwardError) {
        console.error('❌ Error forwarding email:', forwardError);
        return Response.json({
          success: false,
          error: 'Failed to forward',
          details: forwardError.message
        }, { status: 200 }); // Still return 200 to Resend
      }
    } else {
      console.log(`⚠️ Event type not email.received: ${eventType}`);
      return Response.json({
        success: true,
        message: 'Event received but not processed'
      }, { status: 200 });
    }

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 200 } // Still return 200 to Resend so it doesn't retry
    );
  }
});