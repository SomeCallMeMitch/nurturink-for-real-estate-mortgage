import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Resend } from 'npm:resend@2.0.0';

/**
 * sendApprovalNotification.js
 * 
 * Purpose: Send email notifications when scheduled sends are approved or rejected.
 * 
 * Input: {
 *   scheduledSendId: string,
 *   action: 'approved' | 'rejected' | 'cancelled' | 'insufficient_credits',
 *   recipientEmail?: string (optional, defaults to campaign creator)
 * }
 */

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const APP_URL = Deno.env.get("APP_URL") || "https://app.base44.com";

// Email template for approved sends
const createApprovedEmailHTML = ({ clientName, campaignName, scheduledDate, approvalQueueUrl, logoUrl }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Card Send Approved</title>
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
              <!-- Success Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; line-height: 64px; font-size: 32px;">
                  ✓
                </div>
              </div>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: bold; color: #111827; text-align: center;">Card Send Approved</h1>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #374151; text-align: center;">
                A scheduled card send has been approved and will be processed on its scheduled date.
              </p>
              
              <!-- Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Recipient</p>
                    <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">${clientName}</p>
                    
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Campaign</p>
                    <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">${campaignName}</p>
                    
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Scheduled Date</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${scheduledDate}</p>
                  </td>
                </tr>
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

// Email template for rejected/cancelled sends
const createRejectedEmailHTML = ({ clientName, campaignName, scheduledDate, reason, approvalQueueUrl, logoUrl }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Card Send Rejected</title>
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
              <!-- Warning Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 64px; height: 64px; background-color: #fee2e2; border-radius: 50%; line-height: 64px; font-size: 32px;">
                  ✕
                </div>
              </div>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: bold; color: #111827; text-align: center;">Card Send Rejected</h1>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #374151; text-align: center;">
                A scheduled card send has been rejected and will not be processed.
              </p>
              
              <!-- Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Recipient</p>
                    <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">${clientName}</p>
                    
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Campaign</p>
                    <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">${campaignName}</p>
                    
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Scheduled Date</p>
                    <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">${scheduledDate}</p>
                    
                    ${reason ? `
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Reason</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #dc2626;">${reason}</p>
                    ` : ''}
                  </td>
                </tr>
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

// Email template for insufficient credits
const createInsufficientCreditsEmailHTML = ({ clientName, campaignName, scheduledDate, creditsUrl, logoUrl }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Insufficient Credits</title>
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
              <!-- Warning Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 64px; height: 64px; background-color: #fef3c7; border-radius: 50%; line-height: 64px; font-size: 32px;">
                  ⚠
                </div>
              </div>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: bold; color: #111827; text-align: center;">Insufficient Credits</h1>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #374151; text-align: center;">
                A scheduled card send could not be approved due to insufficient credits. Please add more credits to your account.
              </p>
              
              <!-- Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Recipient</p>
                    <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">${clientName}</p>
                    
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Campaign</p>
                    <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">${campaignName}</p>
                    
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Scheduled Date</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${scheduledDate}</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA -->
              <div style="text-align: center;">
                <a href="${creditsUrl}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600;">Add Credits</a>
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scheduledSendId, action, recipientEmail } = await req.json();

    if (!scheduledSendId || !action) {
      return Response.json({ 
        error: 'Missing required fields: scheduledSendId, action' 
      }, { status: 400 });
    }

    // Fetch the scheduled send with related data
    const sends = await base44.asServiceRole.entities.ScheduledSend.filter({ id: scheduledSendId });
    if (!sends || sends.length === 0) {
      return Response.json({ error: 'Scheduled send not found' }, { status: 404 });
    }
    const send = sends[0];

    // Fetch campaign
    const campaigns = await base44.asServiceRole.entities.Campaign.filter({ id: send.campaignId });
    const campaign = campaigns?.[0];

    // Fetch client
    const clients = await base44.asServiceRole.entities.Client.filter({ id: send.clientId });
    const client = clients?.[0];

    // Determine recipient email - use provided, or campaign creator, or org owner
    let toEmail = recipientEmail;
    if (!toEmail && campaign?.createdBy) {
      // Try to get the campaign creator's email
      const users = await base44.asServiceRole.entities.User.filter({ id: campaign.createdBy });
      toEmail = users?.[0]?.email;
    }

    if (!toEmail) {
      console.log('[sendApprovalNotification] No recipient email found, skipping notification');
      return Response.json({ 
        success: false, 
        message: 'No recipient email available for notification' 
      });
    }

    // Format date
    const scheduledDate = send.scheduledDate 
      ? new Date(send.scheduledDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Not specified';

    // Build URLs
    const approvalQueueUrl = `${APP_URL}/ApprovalQueue`;
    const creditsUrl = `${APP_URL}/Credits`;
    const logoUrl = `${APP_URL}/logo.png`;

    // Prepare email content based on action
    let subject, html;
    const templateData = {
      clientName: client?.fullName || 'Unknown Client',
      campaignName: campaign?.name || 'Unknown Campaign',
      scheduledDate,
      approvalQueueUrl,
      creditsUrl,
      logoUrl
    };

    switch (action) {
      case 'approved':
        subject = `Card Send Approved: ${templateData.clientName}`;
        html = createApprovedEmailHTML(templateData);
        break;
      
      case 'rejected':
      case 'cancelled':
        subject = `Card Send ${action === 'rejected' ? 'Rejected' : 'Cancelled'}: ${templateData.clientName}`;
        html = createRejectedEmailHTML({
          ...templateData,
          reason: send.failureReason || (action === 'cancelled' ? 'Manually cancelled' : 'Rejected by approver')
        });
        break;
      
      case 'insufficient_credits':
        subject = `Action Required: Insufficient Credits for ${templateData.clientName}`;
        html = createInsufficientCreditsEmailHTML(templateData);
        break;
      
      default:
        return Response.json({ 
          error: `Invalid action: ${action}. Expected: approved, rejected, cancelled, insufficient_credits` 
        }, { status: 400 });
    }

    // Send email
    const result = await resend.emails.send({
      from: 'NurturInk <notifications@nurturink.com>',
      to: toEmail,
      subject,
      html
    });

    console.log(`[sendApprovalNotification] Email sent: ${action} for send ${scheduledSendId} to ${toEmail}`);

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: `${action} notification sent to ${toEmail}` 
    });

  } catch (error) {
    console.error('[sendApprovalNotification] Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to send notification' 
    }, { status: 500 });
  }
});