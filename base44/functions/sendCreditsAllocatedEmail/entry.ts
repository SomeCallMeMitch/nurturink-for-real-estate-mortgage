import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createAllocationHTML = ({
  member_firstName,
  member_email,
  admin_name,
  credits_allocated,
  allocation_date,
  new_personal_balance,
  org_pool_available,
  send_note_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Credits Allocated</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          
          <!-- Header with Gift Icon -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: left;">
                    <img src="${app_logo_url}" alt="NurturInk" style="height: 40px; max-width: 200px;" />
                  </td>
                  <td style="text-align: right;">
                    <span style="font-size: 32px;">🎁</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Good News -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <p style="margin: 0 0 10px; font-size: 16px; color: #374151;">Hi ${member_firstName},</p>
              <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: bold; color: #111827;">🎉 You've been allocated ${credits_allocated} credits!</h1>
              <p style="margin: 0; font-size: 16px; color: #6b7280;">${admin_name} allocated credits to you on ${allocation_date}</p>
            </td>
          </tr>
          
          <!-- Balance Display -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #FF7A00 0%, #ea580c 100%); border-radius: 8px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #ffffff; opacity: 0.9;">Your new balance</p>
                    <p style="margin: 0 0 12px; font-size: 32px; font-weight: bold; color: #ffffff;">${new_personal_balance} credits</p>
                    <p style="margin: 0; font-size: 14px; color: #ffffff; opacity: 0.9;">(Plus ${org_pool_available} available from organization pool)</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Primary CTA -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${send_note_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">Send a Note</a>
            </td>
          </tr>
          
          <!-- How Credits Work -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #1f2937;">How credits work:</p>
                    <p style="margin: 0; font-size: 14px; color: #374151;">Your personal credits are used first, then organization pool credits.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Encouragement -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <p style="margin: 0; font-size: 16px; color: #374151;">Start building relationships with authentic handwritten notes!</p>
            </td>
          </tr>
          
          <!-- Standard Footer -->
          <tr>
            <td style="padding: 40px 20px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #FF7A00;">NurturInk</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Authentic handwritten notes that build real relationships</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Questions? Contact us at <a href="mailto:support@nurturink.com" style="color: #FF7A00; text-decoration: none;">support@nurturink.com</a></p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2024 NurturInk. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const createAllocationText = (props) => `
NurturInk - Credits Allocated

Hi ${props.member_firstName},

🎉 You've been allocated ${props.credits_allocated} credits!

${props.admin_name} allocated credits to you on ${props.allocation_date}

YOUR NEW BALANCE: ${props.new_personal_balance} credits
(Plus ${props.org_pool_available} available from organization pool)

HOW CREDITS WORK:
Your personal credits are used first, then organization pool credits.

Start building relationships with authentic handwritten notes!

Send a Note: ${props.send_note_url}

Questions? Contact us at support@nurturink.com
© 2024 NurturInk. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const data = await req.json();

    const emailData = {
      member_firstName: data.member_firstName,
      member_email: data.member_email,
      admin_name: data.admin_name,
      credits_allocated: data.credits_allocated,
      allocation_date: data.allocation_date || new Date().toLocaleString('en-US'),
      new_personal_balance: data.new_personal_balance,
      org_pool_available: data.org_pool_available || 0,
      send_note_url: data.send_note_url || `${Deno.env.get("APP_URL")}/FindClients`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'NurturInk <notifications@nurturink.com>',
      to: data.member_email,
      subject: `${data.admin_name} allocated ${data.credits_allocated} credits to you`,
      html: createAllocationHTML(emailData),
      text: createAllocationText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Credits allocated notification sent' 
    });

  } catch (error) {
    console.error('Error sending credits allocated email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});