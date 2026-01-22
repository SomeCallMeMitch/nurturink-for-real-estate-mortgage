import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createWeeklyDigestHTML = ({
  user_firstName,
  week_start,
  week_end,
  notes_sent,
  credits_used,
  credits_remaining,
  top_template,
  top_design,
  team_notes_sent,
  dashboard_url,
  send_note_url,
  manage_preferences_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #FF7A00; padding: 40px 40px 30px; text-align: center;">
              <img src="${app_logo_url}" alt="NurturInk" style="height: 40px; margin-bottom: 20px;" />
              <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; line-height: 1.3;">
                Your Weekly Summary
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0;">${week_start} - ${week_end}</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">Hi ${user_firstName}, here's what happened this week:</p>
              
              <!-- Stats Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="50%" style="padding-right: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px; text-align: center;">
                          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #FF7A00;">${notes_sent}</p>
                          <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Notes Sent</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="50%" style="padding-left: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px; text-align: center;">
                          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #FF7A00;">${credits_remaining}</p>
                          <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Credits Left</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              ${team_notes_sent !== null ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #1e40af;">Team Total</p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1e40af;">${team_notes_sent} notes sent</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Highlights -->
              ${(top_template || top_design) ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr style="background-color: #f9fafb;">
                  <td colspan="2" style="padding: 12px 20px; font-size: 14px; font-weight: bold; color: #1f2937; border-bottom: 1px solid #e5e7eb;">This Week's Favorites</td>
                </tr>
                ${top_template ? `
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Most Used Template</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${top_template}</td>
                </tr>
                ` : ''}
                ${top_design ? `
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280;">Most Used Design</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right;">${top_design}</td>
                </tr>
                ` : ''}
              </table>
              ` : ''}
              
              <!-- Motivation -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 16px; color: #374151;">
                      ${notes_sent > 0 
                        ? `Great work! Every note you send strengthens a relationship.` 
                        : `Ready to connect? Send your first note of the week!`}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTAs -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 15px;">
                    <a href="${send_note_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(255, 122, 0, 0.3);">Send a Note</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <a href="${dashboard_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px;">View Full Dashboard →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                <strong style="color: #FF7A00;">NurturInk</strong><br>
                Authentic handwritten notes that build real relationships
              </p>
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
                Don't want weekly summaries? <a href="${manage_preferences_url}" style="color: #FF7A00; text-decoration: none;">Manage preferences</a>
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                © 2024 NurturInk. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const createWeeklyDigestText = (props) => `
NurturInk - Your Weekly Summary
${props.week_start} - ${props.week_end}

Hi ${props.user_firstName}, here's what happened this week:

YOUR STATS:
Notes Sent: ${props.notes_sent}
Credits Used: ${props.credits_used}
Credits Remaining: ${props.credits_remaining}

${props.team_notes_sent !== null ? `TEAM TOTAL: ${props.team_notes_sent} notes sent` : ''}

${props.top_template ? `Most Used Template: ${props.top_template}` : ''}
${props.top_design ? `Most Used Design: ${props.top_design}` : ''}

${props.notes_sent > 0 
  ? `Great work! Every note you send strengthens a relationship.` 
  : `Ready to connect? Send your first note of the week!`}

Send a Note: ${props.send_note_url}
View Dashboard: ${props.dashboard_url}

Don't want weekly summaries? Manage preferences: ${props.manage_preferences_url}

© 2024 NurturInk. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const data = await req.json();

    const emailData = {
      user_firstName: data.user_firstName,
      week_start: data.week_start,
      week_end: data.week_end,
      notes_sent: data.notes_sent || 0,
      credits_used: data.credits_used || 0,
      credits_remaining: data.credits_remaining || 0,
      top_template: data.top_template || null,
      top_design: data.top_design || null,
      team_notes_sent: data.team_notes_sent !== undefined ? data.team_notes_sent : null,
      dashboard_url: data.dashboard_url || `${Deno.env.get("APP_URL")}/Home`,
      send_note_url: data.send_note_url || `${Deno.env.get("APP_URL")}/FindClients`,
      manage_preferences_url: data.manage_preferences_url || `${Deno.env.get("APP_URL")}/SettingsProfile`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'NurturInk <hello@nurturink.com>',
      to: data.user_email,
      subject: `Your week in review: ${data.notes_sent || 0} notes sent`,
      html: createWeeklyDigestHTML(emailData),
      text: createWeeklyDigestText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Weekly digest sent' 
    });

  } catch (error) {
    console.error('Error sending weekly digest:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});