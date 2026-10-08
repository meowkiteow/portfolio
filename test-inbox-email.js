require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPrimaryInboxTest() {
  console.log('--- Sending Primary Inbox Test Email ---');
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Krishna | Vellisto <hello@vellisto.com>';
  const recipient = 'krishnarawatshri@gmail.com';

  const res = await resend.emails.send({
    from: fromEmail,
    to: recipient,
    reply_to: 'hello@vellisto.com',
    subject: 'Quick update on your video project — Vellisto',
    text: `Hi Krishna,\n\nThanks for reaching out! I wanted to follow up directly regarding your recent inquiry.\n\nWe have everything set up on our side and would love to review your latest goals and project scope.\n\nLet me know what time works best for a quick chat, or simply reply to this email!\n\nBest regards,\nKrishna\nVellisto Studio • https://vellisto.com`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.6; max-width: 580px; padding: 12px 0;">
        <p style="margin: 0 0 16px;">Hi Krishna,</p>
        <p style="margin: 0 0 16px;">
          Thanks for reaching out! I wanted to follow up directly regarding your recent inquiry.
        </p>
        <p style="margin: 0 0 16px;">
          We have everything set up on our side and would love to review your latest goals and project scope.
        </p>
        <p style="margin: 0 0 20px;">
          Let me know what time works best for a quick chat, or simply reply directly to this email!
        </p>
        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #e5e5e5; font-size: 13px; color: #555;">
          <p style="margin: 0; font-weight: 600; color: #111;">Krishna</p>
          <p style="margin: 2px 0 0; color: #777;">Vellisto Studio &bull; <a href="https://vellisto.com" style="color: #555; text-decoration: none;">vellisto.com</a></p>
        </div>
      </div>
    `
  });

  if (res.error) {
    console.error('❌ Failed:', res.error);
  } else {
    console.log('✅ Sent successfully!');
    console.log('• ID:   ', res.data.id);
    console.log('• From: ', fromEmail);
    console.log('• To:   ', recipient);
  }
}

sendPrimaryInboxTest().catch(console.error);
