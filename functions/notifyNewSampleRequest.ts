import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Resend } from 'npm:resend@3.2.0';

/**
 * notifyNewSampleRequest
 * Entity automation trigger: fires on SampleRequest CREATE events.
 * Sends a notification email to mitch@nurturmail.com with full lead details.
 *
 * NOTE: This duplicates the email already sent inside submitSampleRequest.js,
 * but it serves as a reliable fallback automation in case the function path
 * fails, and also allows future integrations (e.g. Slack, CRM) to be added here.
 * You can disable this automation if you prefer the single-path approach.
 */

const NOTIFY_EMAIL = 'mitch@nurturmail.com';
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    const { event, data } = payload;

    // Only process 'create' events
    if (event?.type !== 'create') {
      return Response.json({ skipped: true, reason: 'Not a create event' });
    }

    let record = data;

    // If data was too large or missing, fetch it
    if (!record || payload.payload_too_large) {
      record = await base44.asServiceRole.entities.SampleRequest.get(event.entity_id);
    }

    if (!record) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    const {
      firstName, lastName, email, address, city, stateZip,
      storeNameOrUrl, productType, monthlyOrders, source, status, id,
    } = record;

    // Send notification email
    await resend.emails.send({
      from: 'NurturInk Leads <noreply@nurturmail.com>',
      to: NOTIFY_EMAIL,
      subject: `New Sample Request — ${firstName} ${lastName} (${source})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2d3748;">
          <div style="background: #1a2d4a; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Sample Card Request</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">
              Source: <strong style="color: #f59e0b; text-transform: uppercase;">${source}</strong> landing page
              &nbsp;|&nbsp; Status: <strong style="color: #f59e0b;">${status}</strong>
            </p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="font-size: 15px; color: #1a2d4a; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.08em;">Contact Info</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 7px 0; color: #718096; width: 160px;">Name</td><td style="padding: 7px 0; font-weight: 700;">${firstName} ${lastName}</td></tr>
              <tr style="background:#edf2f7"><td style="padding: 7px 8px; color: #718096;">Email</td><td style="padding: 7px 8px;"><a href="mailto:${email}" style="color: #FF7A00;">${email}</a></td></tr>
              <tr><td style="padding: 7px 0; color: #718096;">Address</td><td style="padding: 7px 0;">${address}</td></tr>
              <tr style="background:#edf2f7"><td style="padding: 7px 8px; color: #718096;">City</td><td style="padding: 7px 8px;">${city}</td></tr>
              <tr><td style="padding: 7px 0; color: #718096;">State / ZIP</td><td style="padding: 7px 0;">${stateZip}</td></tr>
            </table>
            <h2 style="font-size: 15px; color: #1a2d4a; margin: 20px 0 16px; text-transform: uppercase; letter-spacing: 0.08em;">Business Info</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 7px 0; color: #718096; width: 160px;">Business</td><td style="padding: 7px 0; font-weight: 700;">${storeNameOrUrl}</td></tr>
              <tr style="background:#edf2f7"><td style="padding: 7px 8px; color: #718096;">Product / Service</td><td style="padding: 7px 8px;">${productType || '—'}</td></tr>
              <tr><td style="padding: 7px 0; color: #718096;">Monthly Volume</td><td style="padding: 7px 0;">${monthlyOrders || '—'}</td></tr>
            </table>
            <div style="margin-top: 24px; padding: 14px 16px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #f59e0b; font-size: 13px; color: #744210;">
              Record ID: <code>${id}</code>
              &nbsp;—&nbsp;
              <a href="https://app.base44.com" style="color: #FF7A00;">View in Admin Dashboard</a>
            </div>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true, notified: NOTIFY_EMAIL });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});