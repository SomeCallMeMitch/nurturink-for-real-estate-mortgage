import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Resend } from 'npm:resend@2.0.0';

/**
 * sendBulkApprovalNotification.js
 * 
 * Purpose: Send a single summary email when multiple sends are approved/rejected at once.
 * 
 * Input: {
 *   scheduledSendIds: string[],
 *   action: 'approved' | 'rejected' | 'cancelled',
 *   recipientEmail?: string
 * }
 */

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const APP_URL = Deno.env.get("APP_URL") || "https://app.base44.com";

const createBulkEmailHTML = ({ action, sends, approvalQueueUrl, creditsUrl, logoUrl }) => {
  const isApproved = action === 'approved';
  const iconBg = isApproved ? '#dcfce7' : '#fee2e2';
  const icon = isApproved ? '✓' : '✕';
  const title = isApproved ? 'Cards Approved' : 'Cards Rejected';
  const description = isApproved 
    ? 'The following card sends have been approved and will be processed on their scheduled dates.'
    : 'The following card sends have been rejected and will not be processed.';

  const sendsTableRows = sends.map(send => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827;">${send.clientName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">${send.campaignName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">${send.scheduledDate}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <img src="${logoUrl}" alt="NurturInk" style="height: 36px; max-width: 180px;" />
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 64px; height: 64px; background-color: ${iconBg}; border-radius: 50%; line-height: 64px; font-size: 32px;">
                  ${icon}
                </div>
              </div>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: bold; color: #111827; text-align: center;">${sends.length} ${title}</h1>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #374151; text-align: center;">
                ${description}
              </p>
              
              <!-- Sends Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Recipient</th>
                    <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Campaign</th>
                    <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${sendsTableRows}
                </tbody>
              </table>
              
              <!-- CTA -->
              <div style="text-align: center;">
                <a href="${approvalQueueUrl}" style="display: inline-block; background-color: #0477d1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600;">View Approval Queue</a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">This is an automated notification from NurturInk.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scheduledSendIds, action, recipientEmail } = await req.json();

    if (!scheduledSendIds || !Array.isArray(scheduledSendIds) || scheduledSendIds.length === 0) {
      return Response.json({ 
        error: 'Missing or invalid scheduledSendIds array' 
      }, { status: 400 });
    }

    if (!action || !['approved', 'rejected', 'cancelled'].includes(action)) {
      return Response.json({ 
        error: 'Invalid action. Expected: approved, rejected, cancelled' 
      }, { status: 400 });
    }

    // Fetch all sends with related data
    const sendsData = [];
    let toEmail = recipientEmail;

    for (const sendId of scheduledSendIds) {
      const sends = await base44.asServiceRole.entities.ScheduledSend.filter({ id: sendId });
      if (!sends || sends.length === 0) continue;
      const send = sends[0];

      // Fetch campaign
      const campaigns = await base44.asServiceRole.entities.Campaign.filter({ id: send.campaignId });
      const campaign = campaigns?.[0];

      // Fetch client
      const clients = await base44.asServiceRole.entities.Client.filter({ id: send.clientId });
      const client = clients?.[0];

      // Get email from campaign creator if not provided
      if (!toEmail && campaign?.createdBy) {
        const users = await base44.asServiceRole.entities.User.filter({ id: campaign.createdBy });
        toEmail = users?.[0]?.email;
      }

      sendsData.push({
        clientName: client?.fullName || 'Unknown Client',
        campaignName: campaign?.name || 'Unknown Campaign',
        scheduledDate: send.scheduledDate 
          ? new Date(send.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Not specified'
      });
    }

    if (sendsData.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No valid sends found' 
      });
    }

    if (!toEmail) {
      console.log('[sendBulkApprovalNotification] No recipient email found, skipping notification');
      return Response.json({ 
        success: false, 
        message: 'No recipient email available for notification' 
      });
    }

    // Build email
    const subject = `${sendsData.length} Card ${sendsData.length === 1 ? 'Send' : 'Sends'} ${action.charAt(0).toUpperCase() + action.slice(1)}`;
    const html = createBulkEmailHTML({
      action,
      sends: sendsData,
      approvalQueueUrl: `${APP_URL}/ApprovalQueue`,
      creditsUrl: `${APP_URL}/Credits`,
      logoUrl: `${APP_URL}/logo.png`
    });

    // Send email
    const result = await resend.emails.send({
      from: 'NurturInk <notifications@nurturink.com>',
      to: toEmail,
      subject,
      html
    });

    console.log(`[sendBulkApprovalNotification] Email sent: ${sendsData.length} ${action} to ${toEmail}`);

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: `Bulk notification sent to ${toEmail} for ${sendsData.length} sends` 
    });

  } catch (error) {
    console.error('[sendBulkApprovalNotification] Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to send notification' 
    }, { status: 500 });
  }
});