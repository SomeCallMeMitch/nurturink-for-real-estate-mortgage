import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Resend } from 'npm:resend@3.2.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const NOTIFY_EMAIL = 'mitch@nurturmail.com';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const body = await req.json();
  const {
    firstName,
    lastName,
    email,
    address,
    city,
    stateZip,
    storeNameOrUrl,
    productType,
    monthlyOrders,
    source = 'solar',
  } = body;

  // Basic validation
  if (!firstName || !lastName || !email || !address || !city || !stateZip || !storeNameOrUrl) {
    return Response.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // 1. Store in database (service role — no auth required on public landing page)
  const record = await base44.asServiceRole.entities.SampleRequest.create({
    firstName,
    lastName,
    email,
    address,
    city,
    stateZip,
    storeNameOrUrl,
    productType: productType || null,
    monthlyOrders: monthlyOrders || null,
    source,
    status: 'new',
  });

  // 2. Notify mitch@nurturmail.com with all form details
  await resend.emails.send({
    from: 'NurturInk <noreply@nurturink.com>',
    to: NOTIFY_EMAIL,
    replyTo: NOTIFY_EMAIL,
    subject: `New Free Sample Request — ${firstName} ${lastName} (${source})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2d3748;">
        <div style="background: #1a2d4a; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Sample Card Request</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">
            Source: <strong style="color: #f59e0b; text-transform: uppercase;">${source}</strong> landing page
          </p>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">

          <h2 style="font-size: 15px; color: #1a2d4a; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.08em;">Contact Info</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 7px 0; color: #718096; width: 160px;">Name</td><td style="padding: 7px 0; font-weight: 700;">${firstName} ${lastName}</td></tr>
            <tr style="background: #edf2f7;"><td style="padding: 7px 8px; color: #718096;">Email</td><td style="padding: 7px 8px;"><a href="mailto:${email}" style="color: #FF7A00;">${email}</a></td></tr>
            <tr><td style="padding: 7px 0; color: #718096;">Mailing Address</td><td style="padding: 7px 0;">${address}</td></tr>
            <tr style="background: #edf2f7;"><td style="padding: 7px 8px; color: #718096;">City</td><td style="padding: 7px 8px;">${city}</td></tr>
            <tr><td style="padding: 7px 0; color: #718096;">State / ZIP</td><td style="padding: 7px 0;">${stateZip}</td></tr>
          </table>

          <h2 style="font-size: 15px; color: #1a2d4a; margin: 20px 0 16px; text-transform: uppercase; letter-spacing: 0.08em;">Business Info</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 7px 0; color: #718096; width: 160px;">Store / URL</td><td style="padding: 7px 0; font-weight: 700;">${storeNameOrUrl}</td></tr>
            <tr style="background: #edf2f7;"><td style="padding: 7px 8px; color: #718096;">What They Sell</td><td style="padding: 7px 8px;">${productType || '—'}</td></tr>
            <tr><td style="padding: 7px 0; color: #718096;">Monthly Orders</td><td style="padding: 7px 0;">${monthlyOrders || '—'}</td></tr>
          </table>

          <div style="margin-top: 24px; padding: 14px 16px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #f59e0b; font-size: 13px; color: #744210;">
            Record ID: <code>${record.id}</code> — Status: <strong>New</strong>
          </div>
        </div>
      </div>
    `,
  });

  // 3. Send confirmation email to the requester
  await resend.emails.send({
    from: 'NurturInk <noreply@nurturink.com>',
    replyTo: NOTIFY_EMAIL,
    to: email,
    subject: 'Your NurturInk Sample Card is On Its Way!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; color: #2d3748;">
        <div style="background: #1a2d4a; padding: 28px 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Your sample is being processed.</h1>
        </div>
        <div style="background: #ffffff; padding: 28px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
            Hi ${firstName},
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Thank you for requesting a free sample card from NurturInk. We will have it written and in the mail within <strong>24-48 hours</strong>. Cards typically arrive within <strong>6-10 days</strong>.
          </p>

          <div style="background: #1a2d4a; border-radius: 8px; padding: 18px 20px; margin: 0 0 20px;">
            <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 15px; line-height: 1.55;">
              <strong style="color: #f59e0b;">Check your inbox</strong> — we are sending you something worth reading before your card arrives, including a chance to lock in our lowest rate before we speak.<br><br>
              <strong style="color: #f59e0b;">Add us to your contacts</strong> so our emails don't land in spam. Look for messages from <strong style="color: #ffffff;">noreply@nurturmail.com</strong>.
            </p>
          </div>

          <p style="font-size: 14px; color: #718096; line-height: 1.6; margin: 0;">
            Questions? Reply to this email and a real person will get back to you.
          </p>
        </div>
        <div style="text-align: center; padding: 16px; font-size: 12px; color: #a0aec0;">
          NurturInk — Handwritten Cards That Grow Your Business
        </div>
      </div>
    `,
  });

  return Response.json({ success: true, recordId: record.id });
});