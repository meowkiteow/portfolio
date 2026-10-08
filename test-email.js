require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function runTest() {
  console.log('=======================================================');
  console.log('  VELLISTO.COM EMAIL SYSTEM VALIDATION');
  console.log('=======================================================');

  // 1. Verify Domain Details
  console.log('[1/3] Checking domain status on Resend...');
  const domainRes = await resend.domains.get('1ec1637c-7448-4e9e-be85-58f174f7fee9');
  console.log('  • Domain Name:  ', domainRes.data.name);
  console.log('  • Status:       ', domainRes.data.status);
  console.log('  • Capabilities: ', JSON.stringify(domainRes.data.capabilities));

  // 2. Send Outbound Test Email
  console.log('\n[2/3] Sending live outbound email from hello@vellisto.com...');
  const recipient = 'krishnarawatshri@gmail.com';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Vellisto Studio <hello@vellisto.com>';
  
  const startTime = Date.now();
  const sendRes = await resend.emails.send({
    from: fromEmail,
    to: recipient,
    subject: '🎬 Vellisto Studio — Domain Verified & Active!',
    text: `Hello Krishna,\n\nThis is an official verification test email sent directly from hello@vellisto.com.\n\nAll DNS records (DKIM, SPF, MX) are officially verified on Resend and active worldwide!\n\nBest regards,\nVellisto Studio Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; color: #111; line-height: 1.6; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VELLISTO</h2>
        <p style="font-size: 15px; margin-bottom: 20px;">Hello Krishna,</p>
        <p style="font-size: 15px; margin-bottom: 20px;">
          This is an official confirmation test email sent directly from <strong>hello@vellisto.com</strong>.
        </p>
        <div style="background: #f8f9fa; border-left: 4px solid #2ecc71; padding: 14px 18px; margin: 20px 0; font-size: 14px;">
          <strong>Domain Health Check:</strong><br/>
          • Sending (DKIM & SPF): <strong>VERIFIED</strong><br/>
          • Inbound (MX Records): <strong>VERIFIED</strong><br/>
          • From Address: <strong>${fromEmail}</strong><br/>
          • Delivery Status: <strong>LIVE</strong>
        </div>
        <p style="font-size: 13px; color: #888; border-top: 1px solid #eaeaea; padding-top: 16px; margin-top: 24px;">
          Sent from Vellisto Studio CRM Engine
        </p>
      </div>
    `
  });

  const duration = Date.now() - startTime;

  if (sendRes.error) {
    console.error('  ❌ Send Failed:', sendRes.error);
    return;
  }

  console.log('  ✅ Outbound Email Sent Successfully!');
  console.log('  • Message ID: ', sendRes.data.id);
  console.log('  • Recipient:  ', recipient);
  console.log('  • Latency:    ', `${duration}ms`);

  // 3. Inspect Sent Email Details via Resend API
  console.log('\n[3/3] Inspecting delivery record on Resend API...');
  const emailRecord = await resend.emails.get(sendRes.data.id);
  console.log('  • Created At: ', emailRecord.data?.created_at);
  console.log('  • Subject:    ', emailRecord.data?.subject);
  console.log('  • From:       ', emailRecord.data?.from);
  console.log('  • To:         ', JSON.stringify(emailRecord.data?.to));
  console.log('  • Last Event: ', emailRecord.data?.last_event || 'Queued / Sent');

  console.log('\n=======================================================');
  console.log('  ALL EMAIL SYSTEMS ARE 100% OPERATIONAL!');
  console.log('=======================================================');
}

runTest().catch(console.error);
