const https = require('https');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_LEADS_CHANNEL_ID = process.env.DISCORD_LEADS_CHANNEL_ID;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        const params = new URLSearchParams(body);
        body = {};
        for (const [k, v] of params.entries()) body[k] = v;
      }
    }

    const lead = {
      name: body.Name || body.name || 'Not provided',
      email: body.email || body.Email || 'Not provided',
      budget: body['Budget per video'] || body.budget || body.Budget || 'Not specified',
      message: body.Message || body.message || body.details || body.Details || 'No details provided',
      submittedAt: new Date().toISOString()
    };

    const payload = JSON.stringify({
      embeds: [{
        title: '🎯 New Client Lead Received!',
        description: 'A new inquiry was submitted on **Editor Krishna Portfolio**.',
        color: 0xF59E0B,
        fields: [
          { name: '👤 Client Name', value: lead.name, inline: true },
          { name: '📧 Email Address', value: lead.email, inline: true },
          { name: '💰 Budget Per Video', value: lead.budget, inline: true },
          { name: '📝 Project Details', value: lead.message, inline: false }
        ],
        footer: {
          text: 'Editor Krishna Studio • Lead Queue'
        },
        timestamp: new Date().toISOString()
      }]
    });

    await new Promise((resolve) => {
      const discordReq = https.request({
        hostname: 'discord.com',
        path: '/api/v10/channels/' + DISCORD_LEADS_CHANNEL_ID + '/messages',
        method: 'POST',
        headers: {
          'Authorization': 'Bot ' + DISCORD_BOT_TOKEN,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (discordRes) => {
        discordRes.on('data', () => {});
        discordRes.on('end', () => resolve(true));
      });

      discordReq.on('error', (err) => {
        console.error('Discord error:', err);
        resolve(false);
      });

      discordReq.write(payload);
      discordReq.end();
    });

    return res.status(200).json({ success: true, message: 'Inquiry received successfully!' });
  } catch (err) {
    console.error('Inquiry handler error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
