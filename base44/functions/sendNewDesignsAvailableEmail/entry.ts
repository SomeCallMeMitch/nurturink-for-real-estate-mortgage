import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createNewDesignsHTML = ({
  user_firstName,
  release_date,
  featured_designs,
  gallery_url,
  manage_preferences_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Designs Available</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 40px 30px; text-align: center;">
              <img src="${app_logo_url}" alt="NurturInk" style="height: 40px; margin-bottom: 20px;" />
              <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; line-height: 1.3;">
                New Card Designs Are Here!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                We've just added fresh new card designs to your library! Check out these latest additions to make your handwritten notes even more impactful.
              </p>
              
              <!-- Featured Designs -->
              ${featured_designs && featured_designs.length > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                ${featured_designs.map(design => `
                <tr>
                  <td style="padding-bottom: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                      ${design.preview_url ? `
                      <tr>
                        <td>
                          <img src="${design.preview_url}" alt="${design.name}" style="width: 100%; height: auto; display: block;" />
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: #1f2937;">${design.name}</p>
                          <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280;">${design.description || ''}</p>
                          <a href="${design.design_url}" style="color: #8b5cf6; text-decoration: none; font-size: 14px; font-weight: 600;">Use This Design →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `).join('')}
              </table>
              ` : ''}
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <a href="${gallery_url}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">Browse All Designs</a>
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
                Don't want these updates? <a href="${manage_preferences_url}" style="color: #FF7A00; text-decoration: none;">Manage preferences</a>
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

const createNewDesignsText = (props) => `
NurturInk - New Card Designs Are Here!

Hi ${props.user_firstName},

We've just added fresh new card designs to your library! Check out these latest additions to make your handwritten notes even more impactful.

${props.featured_designs && props.featured_designs.length > 0 ? 
  props.featured_designs.map(d => `
${d.name}
${d.description || ''}
Use This Design: ${d.design_url}
`).join('\n---\n') : ''}

Browse All Designs: ${props.gallery_url}

Don't want these updates? Manage preferences: ${props.manage_preferences_url}

© 2024 NurturInk. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const data = await req.json();

    if (!data.user_emails || data.user_emails.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No users to notify' 
      });
    }

    const emailData = {
      user_firstName: data.user_firstName || 'there',
      release_date: data.release_date || new Date().toLocaleDateString('en-US'),
      featured_designs: data.featured_designs || [],
      gallery_url: data.gallery_url || `${Deno.env.get("APP_URL")}/SelectDesign`,
      manage_preferences_url: data.manage_preferences_url || `${Deno.env.get("APP_URL")}/SettingsProfile`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    // Send to all users (batch)
    const emailPromises = data.user_emails.map((email, index) =>
      resend.emails.send({
        from: 'NurturInk <updates@nurturink.com>',
        to: email,
        subject: `New card designs are here! Check out the latest styles`,
        html: createNewDesignsHTML({
          ...emailData,
          user_firstName: data.user_firstNames?.[index] || 'there'
        }),
        text: createNewDesignsText({
          ...emailData,
          user_firstName: data.user_firstNames?.[index] || 'there'
        })
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true, 
      message: `New designs notification sent to ${data.user_emails.length} user(s)` 
    });

  } catch (error) {
    console.error('Error sending new designs email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});