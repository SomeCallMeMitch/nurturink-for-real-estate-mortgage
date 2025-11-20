import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createOrgWarningHTML = ({
  admin_firstName,
  organization_name,
  current_org_pool_balance,
  team_size,
  average_weekly_usage,
  estimated_days_remaining,
  is_first_warning,
  purchase_credits_url,
  usage_report_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Low Organization Pool Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          
          <!-- Header with Warning Badge -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: left;">
                    <img src="${app_logo_url}" alt="RoofScribe" style="height: 40px; max-width: 200px;" />
                  </td>
                  <td style="text-align: right;">
                    <span style="display: inline-block; background-color: #fbbf24; color: #92400e; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold;">⚠️ WARNING</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Alert Message -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <p style="margin: 0 0 10px; font-size: 16px; color: #374151;">Hi ${admin_firstName},</p>
              <h1 style="margin: 0 0 15px; font-size: 24px; font-weight: bold; color: #111827;">${organization_name}'s credit pool is running low</h1>
              ${is_first_warning ? `
                <p style="margin: 0; font-size: 16px; color: #374151;">Your organization's credit pool is getting low. To ensure your team can continue sending handwritten notes without interruption, consider purchasing more credits soon.</p>
              ` : `
                <p style="margin: 0; font-size: 16px; color: #374151;">This is a reminder that your organization's credit pool is still low.</p>
              `}
            </td>
          </tr>
          
          <!-- Current Balance -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #92400e;">Organization pool</p>
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #92400e;">${current_org_pool_balance} credits</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Usage Insights Box -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                <tr style="background-color: #f9fafb;">
                  <td colspan="2" style="padding: 16px 20px; font-size: 16px; color: #1f2937; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Usage Insights</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Team size</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${team_size} members</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Average weekly usage</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${average_weekly_usage} credits</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280;">Estimated time remaining</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; font-weight: 600;">~${estimated_days_remaining} days</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Impact on Team -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 16px; color: #374151;">At current usage rates, your team will run out of credits soon.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Primary CTA -->
          <tr>
            <td style="padding: 0 40px 20px; text-align: center;">
              <a href="${purchase_credits_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">Purchase More Credits</a>
            </td>
          </tr>
          
          <!-- Secondary CTA -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${usage_report_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px;">View Usage Report →</a>
            </td>
          </tr>
          
          <!-- Standard Footer -->
          <tr>
            <td style="padding: 40px 20px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #FF7A00;">RoofScribe</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Authentic handwritten notes that build real relationships</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Questions? Contact us at <a href="mailto:support@roofscribe.com" style="color: #FF7A00; text-decoration: none;">support@roofscribe.com</a></p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2024 RoofScribe. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const createOrgWarningText = (props) => `
RoofScribe - Low Organization Pool Alert

Hi ${props.admin_firstName},

⚠️ ${props.organization_name}'s credit pool is running low

${props.is_first_warning ? 
  "Your organization's credit pool is getting low. To ensure your team can continue sending handwritten notes without interruption, consider purchasing more credits soon." :
  "This is a reminder that your organization's credit pool is still low."
}

ORGANIZATION POOL: ${props.current_org_pool_balance} credits

USAGE INSIGHTS:
Team size: ${props.team_size} members
Average weekly usage: ${props.average_weekly_usage} credits
Estimated time remaining: ~${props.estimated_days_remaining} days

At current usage rates, your team will run out of credits soon.

Purchase More Credits: ${props.purchase_credits_url}
View Usage Report: ${props.usage_report_url}

Questions? Contact us at support@roofscribe.com
© 2024 RoofScribe. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const subject = data.is_first_warning
      ? `Low Credit Alert: ${data.organization_name} pool running low`
      : 'Reminder: Organization Credit Pool Low';

    const emailData = {
      admin_firstName: data.admin_firstName,
      organization_name: data.organization_name,
      current_org_pool_balance: data.current_org_pool_balance,
      team_size: data.team_size,
      average_weekly_usage: data.average_weekly_usage,
      estimated_days_remaining: data.estimated_days_remaining,
      is_first_warning: data.is_first_warning !== false,
      purchase_credits_url: data.purchase_credits_url || `${Deno.env.get("APP_URL")}/Credits`,
      usage_report_url: data.usage_report_url || `${Deno.env.get("APP_URL")}/TeamManagement`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    // Send to all admins
    const adminEmails = Array.isArray(data.admin_emails) ? data.admin_emails : [data.admin_email];
    
    const emailPromises = adminEmails.map(email =>
      resend.emails.send({
        from: 'RoofScribe <notifications@roofscribe.com>',
        to: email,
        subject,
        html: createOrgWarningHTML(emailData),
        text: createOrgWarningText(emailData)
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true, 
      message: `Low org pool warning sent to ${adminEmails.length} admin(s)` 
    });

  } catch (error) {
    console.error('Error sending low org pool warning:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});