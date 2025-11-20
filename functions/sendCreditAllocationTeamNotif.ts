import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createTeamNotifHTML = ({
  admin_firstName,
  allocating_admin_name,
  organization_name,
  allocation_date,
  allocations,
  total_credits_allocated,
  remaining_org_pool,
  team_management_url,
  app_logo_url
}) => {
  const showDetails = allocations.length <= 5;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Credit Allocation Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          
          <!-- Header -->
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
              <h2 style="margin: 0 0 10px; font-size: 20px; font-weight: bold; color: #1f2937;">${allocating_admin_name} allocated credits to team members</h2>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">${allocation_date}</p>
            </td>
          </tr>
          
          <!-- Allocation Summary -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    ${showDetails ? `
                      ${allocations.map(a => `
                        <p style="margin: 0 0 8px; font-size: 14px; color: #374151;"><strong>${a.member_name}:</strong> ${a.credits_allocated} credits</p>
                      `).join('')}
                    ` : `
                      <p style="margin: 0 0 8px; font-size: 14px; color: #374151;">Allocated to <strong>${allocations.length} team members</strong></p>
                      <p style="margin: 0; font-size: 14px; color: #374151;">Total: <strong>${total_credits_allocated} credits</strong></p>
                    `}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Remaining Pool -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fed7aa; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #92400e;">Remaining organization pool</p>
                    <p style="margin: 0; font-size: 28px; font-weight: bold; color: #92400e;">${remaining_org_pool} credits</p>
                  </td>
                </tr>
              </table>
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
};

const createTeamNotifText = (props) => {
  const showDetails = props.allocations.length <= 5;
  
  return `
RoofScribe - Credit Allocation Notification

Hi ${props.admin_firstName},

${props.allocating_admin_name} allocated credits to team members
${props.allocation_date}

${showDetails ? 
  props.allocations.map(a => `${a.member_name}: ${a.credits_allocated} credits`).join('\n') :
  `Allocated to ${props.allocations.length} team members\nTotal: ${props.total_credits_allocated} credits`
}

REMAINING ORGANIZATION POOL: ${props.remaining_org_pool} credits

View Team Dashboard: ${props.team_management_url}

Questions? Contact us at support@roofscribe.com
© 2024 RoofScribe. All rights reserved.
`;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const {
      other_admins_emails,
      allocating_admin_name,
      organization_name,
      allocations,
      remaining_org_pool,
      team_management_url,
      app_logo_url
    } = data;

    if (!other_admins_emails || other_admins_emails.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No other admins to notify' 
      });
    }

    const total_credits_allocated = allocations.reduce((sum, a) => sum + a.credits_allocated, 0);

    const emailPromises = other_admins_emails.map((email, index) =>
      resend.emails.send({
        from: 'RoofScribe <notifications@roofscribe.com>',
        to: email,
        subject: `${allocating_admin_name} allocated credits to team members`,
        html: createTeamNotifHTML({
          admin_firstName: data.admin_firstNames?.[index] || 'there',
          allocating_admin_name,
          organization_name,
          allocation_date: data.allocation_date || new Date().toLocaleString('en-US'),
          allocations,
          total_credits_allocated,
          remaining_org_pool,
          team_management_url: team_management_url || `${Deno.env.get("APP_URL")}/TeamManagement`,
          app_logo_url: app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
        }),
        text: createTeamNotifText({
          admin_firstName: data.admin_firstNames?.[index] || 'there',
          allocating_admin_name,
          organization_name,
          allocation_date: data.allocation_date || new Date().toLocaleString('en-US'),
          allocations,
          total_credits_allocated,
          remaining_org_pool,
          team_management_url: team_management_url || `${Deno.env.get("APP_URL")}/TeamManagement`
        })
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true, 
      message: `Notification sent to ${other_admins_emails.length} admin(s)` 
    });

  } catch (error) {
    console.error('Error sending team allocation notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});