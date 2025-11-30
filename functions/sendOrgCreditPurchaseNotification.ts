import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createNotificationHTML = ({
  admin_firstName,
  purchasing_admin_name,
  organization_name,
  credits_purchased,
  purchase_date,
  new_org_pool_balance,
  team_management_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Credit Purchase Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          
          <!-- Header with Notification Badge -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: left;">
                    <img src="${app_logo_url}" alt="RoofScribe" style="height: 40px; max-width: 200px;" />
                  </td>
                  <td style="text-align: right;">
                    <span style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold;">NOTIFICATION</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Brief Update -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <p style="margin: 0 0 10px; font-size: 16px; color: #374151;">Hi ${admin_firstName},</p>
              <h2 style="margin: 0 0 10px; font-size: 20px; font-weight: bold; color: #1f2937;">${purchasing_admin_name} purchased ${credits_purchased} credits for ${organization_name}</h2>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">${purchase_date}</p>
            </td>
          </tr>
          
          <!-- Current Balance -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Organization pool</p>
                    <p style="margin: 0; font-size: 28px; font-weight: bold; color: #FF7A00;">${new_org_pool_balance} credits</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Team Benefit -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 16px; color: #374151; text-align: center;">Your team can now send more handwritten notes.</p>
            </td>
          </tr>
          
          <!-- Optional CTA -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${team_management_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px;">View Team Dashboard →</a>
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

const createNotificationText = (props) => `
RoofScribe - Credit Purchase Notification

Hi ${props.admin_firstName},

${props.purchasing_admin_name} purchased ${props.credits_purchased} credits for ${props.organization_name}
${props.purchase_date}

ORGANIZATION POOL: ${props.new_org_pool_balance} credits

Your team can now send more handwritten notes.

View Team Dashboard: ${props.team_management_url}

Questions? Contact us at support@roofscribe.com
© 2024 RoofScribe. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const data = await req.json();
    const {
      other_admins_emails,
      admin_firstName,
      purchasing_admin_name,
      organization_name,
      credits_purchased,
      purchase_date,
      new_org_pool_balance,
      team_management_url,
      app_logo_url
    } = data;

    if (!other_admins_emails || other_admins_emails.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No other admins to notify' 
      });
    }

    const emailData = {
      admin_firstName,
      purchasing_admin_name,
      organization_name,
      credits_purchased,
      purchase_date: purchase_date || new Date().toLocaleString('en-US'),
      new_org_pool_balance,
      team_management_url: team_management_url || `${Deno.env.get("APP_URL")}/TeamManagement`,
      app_logo_url: app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    // Send to all other admins
    const emailPromises = other_admins_emails.map(email =>
      resend.emails.send({
        from: 'RoofScribe <notifications@roofscribe.com>',
        to: email,
        subject: `${purchasing_admin_name} purchased ${credits_purchased} credits for ${organization_name}`,
        html: createNotificationHTML(emailData),
        text: createNotificationText(emailData)
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true, 
      message: `Notification sent to ${other_admins_emails.length} admin(s)` 
    });

  } catch (error) {
    console.error('Error sending org purchase notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});