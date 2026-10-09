const fs = require('fs');
const path = require('path');
const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
  UserSelectMenuBuilder,
  StringSelectMenuBuilder,
  MessageFlags
} = require('discord.js');
const { Resend } = require('resend');

const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');
const CLIENTS_FILE = path.join(__dirname, 'clients.json');
const PROCESSED_EMAILS_FILE = path.join(__dirname, 'processed_emails.json');

let client = null;
let resend = null;
let isReady = false;

function getProcessedEmails() {
  try {
    if (fs.existsSync(PROCESSED_EMAILS_FILE)) {
      return new Set(JSON.parse(fs.readFileSync(PROCESSED_EMAILS_FILE, 'utf8')));
    }
  } catch (e) {}
  return new Set();
}

function saveProcessedEmail(id) {
  try {
    const set = getProcessedEmails();
    set.add(id);
    fs.writeFileSync(PROCESSED_EMAILS_FILE, JSON.stringify(Array.from(set), null, 2), 'utf8');
  } catch (e) {}
}

// -------------------------------------------------------------
// Database Helpers
// -------------------------------------------------------------
function getSubmissions() {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('[CRM ERROR] Failed to read submissions.json:', e.message);
  }
  return [];
}

function updateSubmission(leadId, patch) {
  try {
    const list = getSubmissions();
    const idx = list.findIndex(item => item.id === leadId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...patch };
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
      return list[idx];
    }
  } catch (e) {
    console.error('[CRM ERROR] Failed to update submission:', e.message);
  }
  return null;
}

function findSubmission(leadId) {
  const list = getSubmissions();
  return list.find(item => item.id === leadId);
}

function getClients() {
  try {
    if (fs.existsSync(CLIENTS_FILE)) {
      return JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('[CRM ERROR] Failed to read clients.json:', e.message);
  }
  return [];
}

function saveClient(clientData) {
  try {
    const list = getClients();
    const idx = list.findIndex(item => item.id === clientData.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...clientData };
    } else {
      list.push(clientData);
    }
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(list, null, 2), 'utf8');
    return clientData;
  } catch (e) {
    console.error('[CRM ERROR] Failed to save client:', e.message);
  }
  return clientData;
}

function findClient(clientId) {
  const list = getClients();
  return list.find(item => item.id === clientId);
}

function parseDeadlineToUnix(str) {
  if (!str) return null;
  const s = str.trim().toLowerCase();

  const hoursMatch = s.match(/^(\d+)\s*(h|hr|hours?)$/);
  if (hoursMatch) {
    const hrs = parseInt(hoursMatch[1], 10);
    return Math.floor((Date.now() + hrs * 3600 * 1000) / 1000);
  }

  const daysMatch = s.match(/^(\d+)\s*(d|days?)$/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    return Math.floor((Date.now() + days * 24 * 3600 * 1000) / 1000);
  }

  if (s.includes('tomorrow')) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return Math.floor(d.getTime() / 1000);
  }

  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return Math.floor(parsed / 1000);
  }

  return null;
}

// -------------------------------------------------------------
// Defined Roles & Permissions Configuration
// -------------------------------------------------------------
const ROLE_CONFIGS = [
  {
    name: 'Co-Admin',
    color: 0xE67E22, // Gold / Amber
    permissions: [PermissionsBitField.Flags.Administrator],
    description: 'Full administrative access to all channels, settings, and CRM'
  },
  {
    name: 'Support',
    color: 0x9B59B6, // Purple
    permissions: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.EmbedLinks,
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.AddReactions,
      PermissionsBitField.Flags.ManageMessages
    ],
    description: 'Customer success & support agent (can manage discussions & client messages)'
  },
  {
    name: 'Client',
    color: 0x2ECC71, // Green
    permissions: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.EmbedLinks,
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.AddReactions
    ],
    description: 'Onboarded client (view and interact in their private CRM channel)'
  },
  {
    name: 'Editor',
    color: 0x1ABC9C, // Teal / Mint
    permissions: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.EmbedLinks,
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.AddReactions
    ],
    description: 'Video Editor & Motion Designer (access to assigned project tickets)'
  },
  {
    name: 'Member',
    color: 0x3498DB, // Blue
    permissions: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.AddReactions
    ],
    description: 'Standard server member (access to general chat and project inquiry)'
  }
];

// Helper: Ensure role exists or create it
async function ensureServerRoles(guild) {
  const createdRoles = {};
  for (const cfg of ROLE_CONFIGS) {
    let r = guild.roles.cache.find(role => role.name.toLowerCase() === cfg.name.toLowerCase());
    if (!r) {
      try {
        r = await guild.roles.create({
          name: cfg.name,
          color: cfg.color,
          permissions: cfg.permissions,
          reason: 'Automated role provisioning by Vellisto CRM'
        });
        console.log(`[DISCORD CRM] Created role: @${cfg.name}`);
      } catch (e) {
        console.error(`[DISCORD CRM ERROR] Could not create role ${cfg.name}:`, e.message);
      }
    } else {
      // Ensure permissions match
      try {
        await r.setPermissions(cfg.permissions).catch(() => {});
      } catch (e) {}
    }
    if (r) createdRoles[cfg.name] = r;
  }
  return createdRoles;
}

// -------------------------------------------------------------
// Helper: Build strictly private permission overwrites for ticket channels
// -------------------------------------------------------------
function createTicketPermissionOverwrites(guild, creatorMemberId) {
  const overwrites = [
    // 1. Explicitly DENY @everyone
    {
      id: guild.roles.everyone.id,
      deny: [PermissionsBitField.Flags.ViewChannel]
    },
    // 2. Explicitly ALLOW Ticket Creator
    {
      id: creatorMemberId,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.AttachFiles,
        PermissionsBitField.Flags.EmbedLinks,
        PermissionsBitField.Flags.AddReactions
      ]
    },
    // 3. Explicitly ALLOW Bot
    {
      id: guild.members.me.id,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.ManageChannels,
        PermissionsBitField.Flags.EmbedLinks,
        PermissionsBitField.Flags.AttachFiles
      ]
    }
  ];

  // 4. Explicitly DENY regular member/client roles so other users can never view
  ['member', 'client'].forEach(name => {
    const r = guild.roles.cache.find(role => role.name.toLowerCase() === name);
    if (r && !overwrites.some(o => o.id === r.id)) {
      overwrites.push({
        id: r.id,
        deny: [PermissionsBitField.Flags.ViewChannel]
      });
    }
  });

  // 5. Explicitly ALLOW Editor role(s)
  const editorRoles = guild.roles.cache.filter(role => 
    role.name.toLowerCase() === 'editor' || role.name.toLowerCase() === 'editors'
  );
  editorRoles.forEach(editorRole => {
    if (!overwrites.some(o => o.id === editorRole.id)) {
      overwrites.push({
        id: editorRole.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.AttachFiles,
          PermissionsBitField.Flags.EmbedLinks,
          PermissionsBitField.Flags.AddReactions
        ]
      });
    }
  });

  // 6. Explicitly ALLOW Support role
  const supportRole = guild.roles.cache.find(role => role.name.toLowerCase() === 'support');
  if (supportRole && !overwrites.some(o => o.id === supportRole.id)) {
    overwrites.push({
      id: supportRole.id,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.AttachFiles,
        PermissionsBitField.Flags.EmbedLinks,
        PermissionsBitField.Flags.AddReactions
      ]
    });
  }

  // 7. Explicitly ALLOW Administrators & Co-Admins
  guild.roles.cache.forEach(role => {
    if (
      role.permissions.has(PermissionsBitField.Flags.Administrator) ||
      ['co-admin', 'admin', 'administrator'].includes(role.name.toLowerCase())
    ) {
      if (!overwrites.some(o => o.id === role.id)) {
        overwrites.push({
          id: role.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.ManageMessages,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.EmbedLinks
          ]
        });
      }
    }
  });

  return overwrites;
}

// -------------------------------------------------------------
// Helper: Create a private ticket channel under 🎫 TICKETS category
// -------------------------------------------------------------
async function createPrivateTicketChannel(guild, user, { topic = 'Project Inquiry', details = '', budget = '' } = {}) {
  // Find or create "🎫 TICKETS" category
  let ticketCat = guild.channels.cache.find(c => 
    c.type === ChannelType.GuildCategory && (c.name.includes('TICKET') || c.id === '1558147743728402494')
  );
  if (!ticketCat) {
    ticketCat = await guild.channels.create({
      name: '🎫 TICKETS',
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });
  } else {
    // Ensure category itself is private to @everyone
    await ticketCat.permissionOverwrites.edit(guild.roles.everyone.id, {
      ViewChannel: false
    }).catch(() => {});
  }

  const cleanUsername = user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18) || 'client';
  let baseName = `ticket-${cleanUsername}`;
  let channelName = baseName;
  if (guild.channels.cache.some(c => c.name === channelName)) {
    channelName = `${baseName}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const overwrites = createTicketPermissionOverwrites(guild, user.id);

  const ticketChannel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: ticketCat ? ticketCat.id : null,
    topic: `🔒 Private Ticket | Client: @${user.tag} (${user.id}) | Topic: ${topic}`,
    permissionOverwrites: overwrites
  });

  const editorRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'editor' || r.name.toLowerCase() === 'editors');
  const coAdminRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'co-admin');

  const ticketEmbed = new EmbedBuilder()
    .setTitle(`🎫 TICKET — ${topic.toUpperCase()}`)
    .setColor(0xFFDE31)
    .setDescription(
      `Hello <@${user.id}>! This is your **private and confidential** workspace with the Vellisto Studio team.\n\n` +
      `🔒 **Strict Privacy Enabled:** Only **you**, **Administrators**, and our **Editor** team can view or access this channel. All other server members are denied access.`
    )
    .addFields([
      { name: '👤 Opened By', value: `<@${user.id}> (${user.tag})`, inline: true },
      { name: '📋 Subject / Service', value: topic || 'Project Inquiry', inline: true },
      { name: '💰 Budget / Timeline', value: budget || 'Not specified', inline: true },
      { name: '📝 Description & Details', value: details || 'No additional details provided.', inline: false },
      { 
        name: '🛡️ Authorized Access List', 
        value: `• **Ticket Creator:** <@${user.id}>\n• **Administrators:** ${coAdminRole ? `<@&${coAdminRole.id}>` : 'Server Admins'}\n• **Editors:** ${editorRole ? `<@&${editorRole.id}>` : '@Editor'}\n• **Other Server Members:** 🚫 Denied Access`,
        inline: false 
      }
    ])
    .setFooter({ text: 'Vellisto Studio • Private Ticket System' })
    .setTimestamp();

  const ticketActionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`close_ticket:${ticketChannel.id}`)
      .setLabel('🔒 Close Ticket')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`ticket_info:${ticketChannel.id}`)
      .setLabel('ℹ️ Privacy Breakdown')
      .setStyle(ButtonStyle.Secondary)
  );

  await ticketChannel.send({
    content: `👋 <@${user.id}> ${editorRole ? `<@&${editorRole.id}>` : ''} ${coAdminRole ? `<@&${coAdminRole.id}>` : ''}`,
    embeds: [ticketEmbed],
    components: [ticketActionRow]
  });

  console.log(`[DISCORD CRM] ✅ Created secure private ticket #${ticketChannel.name} (${ticketChannel.id}) for user @${user.tag}`);
  return ticketChannel;
}

// -------------------------------------------------------------
// Helper: Repost the official Tickets / Support / Work With Us panel with buttons
// -------------------------------------------------------------
async function repostWorkWithUsPanel(guild) {
  let workChannel = guild.channels.cache.find(c => 
    c.name === 'work-with-us' || 
    c.name === '💼│workwithus' || 
    c.name.includes('workwithus') || 
    (c.name.includes('work') && c.name.includes('with') && c.name.includes('us'))
  );

  if (!workChannel) {
    const infoCat = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('information'));
    workChannel = await guild.channels.create({
      name: 'work-with-us',
      type: ChannelType.GuildText,
      parent: infoCat ? infoCat.id : null,
      topic: 'Open a private ticket to work with Vellisto Studio founders and editors'
    });
  }

  // Ensure @everyone can view channel and read history, but not send spam messages
  await workChannel.permissionOverwrites.edit(guild.roles.everyone.id, {
    ViewChannel: true,
    ReadMessageHistory: true,
    SendMessages: false
  }).catch(() => {});

  // Check if an interactive Tickets / Support panel already exists in this channel
  const fetched = await workChannel.messages.fetch({ limit: 15 }).catch(() => null);
  const existingPanel = fetched?.find(m => 
    m.author.id === guild.members.me.id && 
    m.components.length > 0 && 
    m.embeds[0]?.title?.includes('Tickets')
  );

  if (existingPanel) {
    console.log(`[DISCORD CRM] ✅ Interactive Tickets panel already active in #${workChannel.name} (${existingPanel.id}), preserving message.`);
    return existingPanel;
  }

  // Clean up any old buttonless bot messages only if no interactive panel exists
  if (fetched) {
    for (const msg of fetched.values()) {
      if (msg.author.id === guild.members.me.id && msg.components.length === 0) {
        await msg.delete().catch(() => {});
      }
    }
  }

  const panelEmbed = new EmbedBuilder()
    .setTitle('🎫 Tickets / Support — Work With Us')
    .setColor(0x3498DB)
    .setDescription(
      'Need help with a project, have a question, or want to discuss a new video production retainer? **Open a private ticket below** and our team will pick it up immediately.\n\n' +
      '**🔒 Private & Confidential by Default**\n' +
      'When you open a ticket, a private channel is created exclusively for you, our **Administrators**, and our **Editor** team. No other server members can view or access your conversation.\n\n' +
      '**⚡ What can you use tickets for?**\n' +
      '• New video project inquiries, YouTube long-form & short-form retainers\n' +
      '• Footage delivery, project briefs & creative direction\n' +
      '• Edit revisions, status updates & general support questions'
    )
    .addFields([
      {
        name: '📌 How to Open a Ticket',
        value: 'Click the **🚀 Open a Ticket / Work With Us** button below to create your private ticket channel.',
        inline: false
      }
    ])
    .setFooter({ text: '🔒 Private by default — only you, Support, Editors and admins can see your ticket.' });

  const panelButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_ticket_btn')
      .setLabel('🚀 Open a Ticket / Work With Us')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🎫'),
    new ButtonBuilder()
      .setCustomId('open_support_ticket_btn')
      .setLabel('💬 General Support')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('❓')
  );

  const panelMsg = await workChannel.send({ embeds: [panelEmbed], components: [panelButtons] });
  await panelMsg.pin().catch(() => {});
  console.log(`[DISCORD CRM] ✅ Created Tickets / Support panel in #${workChannel.name} (${workChannel.id})`);
  return panelMsg;
}

// -------------------------------------------------------------
// Automated Server Provisioning: #admin-hub & #work-with-us
// -------------------------------------------------------------
async function provisionServerStructure(guild) {
  try {
    const roles = await ensureServerRoles(guild);

    // 1. Private Admin Hub Category & Channel
    let adminChannel = guild.channels.cache.find(c => c.name === 'admin-hub');
    if (!adminChannel) {
      adminChannel = await guild.channels.create({
        name: 'admin-hub',
        type: ChannelType.GuildText,
        topic: 'Private Founder & Co-Admin Control Center | Role Management & Operations',
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: guild.members.me.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks]
          }
        ]
      });

      if (roles['Co-Admin']) {
        await adminChannel.permissionOverwrites.create(roles['Co-Admin'].id, {
          ViewChannel: true,
          SendMessages: true,
          EmbedLinks: true
        }).catch(() => {});
      }

      console.log(`[DISCORD CRM] Created private #admin-hub channel (${adminChannel.id})`);
    }

    // Pin Role Control Panel inside #admin-hub
    const adminPanelEmbed = new EmbedBuilder()
      .setTitle('🛡️ VELLISTO ADMIN CONTROL PANEL')
      .setColor(0xE67E22)
      .setDescription('Private dashboard for Founder & Co-Admin. Assign roles and manage your team with zero settings hassle.')
      .addFields([
        {
          name: '👑 Available Server Roles',
          value: '• **@Co-Admin**: Full administrative permissions\n• **@Editor**: Video editor & motion designer access\n• **@Support**: Customer success & project management\n• **@Client**: Access to private client CRM workspaces\n• **@Member**: Standard community member',
          inline: false
        },
        {
          name: '⚡ Quick Actions',
          value: 'Click the buttons below to assign or remove roles from any member instantly.',
          inline: false
        }
      ])
      .setFooter({ text: 'Vellisto Agency Ops • Restricted Access' })
      .setTimestamp();

    const adminPanelButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('admin_assign_btn')
        .setLabel('👤 Assign Role to Member')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('admin_remove_btn')
        .setLabel('❌ Remove Role from Member')
        .setStyle(ButtonStyle.Danger)
    );

    // Send or refresh panel
    const existingMessages = await adminChannel.messages.fetch({ limit: 10 }).catch(() => null);
    const existingPanel = existingMessages?.find(m => m.embeds[0]?.title?.includes('ADMIN CONTROL PANEL'));
    if (!existingPanel) {
      const pMsg = await adminChannel.send({ embeds: [adminPanelEmbed], components: [adminPanelButtons] });
      await pMsg.pin().catch(() => {});
    }

    // 2. Repost / refresh Tickets / Support panel with interactive buttons in #work-with-us
    await repostWorkWithUsPanel(guild);

    console.log('[DISCORD CRM] ✅ Server structure & roles fully provisioned!');
  } catch (err) {
    console.error('[DISCORD CRM ERROR] Failed to provision server structure:', err);
  }
}

// -------------------------------------------------------------
// UI Builders for Production Hub
// -------------------------------------------------------------
const STAGES = [
  { id: 'INGESTION', label: '📥 Raw Footage Ingested' },
  { id: 'ROUGH_CUT', label: '✂️ Rough Cut Editing' },
  { id: 'FINISHING', label: '🎨 Sound & Color Grading' },
  { id: 'CLIENT_REVIEW', label: '🟠 In Client Review' },
  { id: 'COMPLETED', label: '🟢 Approved & Completed' }
];

function getStageLabel(stageId) {
  const found = STAGES.find(s => s.id === stageId);
  return found ? found.label : '🟡 In Production';
}

function buildDashboardEmbed(c) {
  const footageText = c.footageUrl && c.footageUrl.startsWith('http')
    ? `[🔗 Open Google Drive Folder](${c.footageUrl})`
    : '`⚠️ Not set yet`';

  const dropboxText = c.dropboxUrl && c.dropboxUrl.startsWith('http')
    ? `[🔗 Open Dropbox Output Folder](${c.dropboxUrl})`
    : '`⚠️ Not set yet`';

  const deadlineText = c.deadline
    ? `<t:${c.deadline}:F>\n> ⏳ **<t:${c.deadline}:R>**`
    : '`⚪ No deadline set yet`';

  const platformBadge = c.preferredPlatform ? `📱 **Platform:** \`${c.preferredPlatform.toUpperCase()}\`` : '📱 **Platform:** `EMAIL`';

  const embed = new EmbedBuilder()
    .setTitle(`🎬 VELLISTO PRODUCTION HUB — ${c.name.toUpperCase()}`)
    .setColor(c.stage === 'COMPLETED' ? 0x2ecc71 : 0xFFDE31)
    .setDescription(`Workspace for **${c.name}** (${c.email || 'No email'}).\n${platformBadge}`)
    .addFields([
      {
        name: '📁 Footage & Deliveries',
        value: `• **📥 Raw Footage (Google Drive):**\n  ${footageText}\n• **📤 Deliveries (Dropbox):**\n  ${dropboxText}`,
        inline: false
      },
      {
        name: '⏱️ Timeline & Deadline',
        value: `• **Current Milestone:** ${c.milestone || 'Rough Cut Draft'}\n• **Target Deadline:** ${deadlineText}`,
        inline: true
      },
      {
        name: '📊 Production Status',
        value: `**${getStageLabel(c.stage)}**\n• Deliveries logged: **${c.deliveries ? c.deliveries.length : 0}**\n• Assigned Editor: **${c.assignedEditor ? `<@${c.assignedEditor}>` : 'Unassigned'}**`,
        inline: true
      }
    ])
    .setFooter({ text: 'Vellisto Agency CRM • Production Hub' })
    .setTimestamp();

  return embed;
}

function buildDashboardButtons(clientId) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hub_deadline:${clientId}`)
      .setLabel('📅 Set / Change Deadline')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`hub_links:${clientId}`)
      .setLabel('📁 Set Storage Links')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`hub_status:${clientId}`)
      .setLabel('🔄 Next Stage')
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hub_deliver:${clientId}`)
      .setLabel('🚀 Send Dropbox Delivery')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`hub_email:${clientId}`)
      .setLabel('✉️ Message Client')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`hub_assign_btn:${clientId}`)
      .setLabel('👥 Assign Editor')
      .setStyle(ButtonStyle.Secondary)
  );

  return [row1, row2];
}

async function updateDashboardMessage(clientData) {
  if (!clientData.channelId || !clientData.dashboardMessageId) return;
  try {
    const channel = await client.channels.fetch(clientData.channelId);
    if (!channel) return;
    const msg = await channel.messages.fetch(clientData.dashboardMessageId);
    if (!msg) return;

    await msg.edit({
      embeds: [buildDashboardEmbed(clientData)],
      components: buildDashboardButtons(clientData.id)
    });
  } catch (err) {
    console.error('[CRM ERROR] Failed to update dashboard message:', err.message);
  }
}

// -------------------------------------------------------------
// Client Channel Creator
// -------------------------------------------------------------
async function createClientChannel(data) {
  if (!client || !isReady) throw new Error('Discord bot is not online.');

  const categoryId = process.env.DISCORD_CLIENTS_CATEGORY_ID;
  const channelName = `client-${(data.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

  let targetGuild = null;
  let categoryChannel = null;

  for (const guild of client.guilds.cache.values()) {
    if (categoryId) {
      const ch = guild.channels.cache.get(categoryId);
      if (ch) {
        targetGuild = guild;
        categoryChannel = ch;
        break;
      }
    } else {
      targetGuild = guild;
      break;
    }
  }

  if (!targetGuild) targetGuild = client.guilds.cache.first();
  if (!targetGuild) throw new Error('Bot is not in any Discord server.');

  const newChannel = await targetGuild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: categoryChannel ? categoryChannel.id : null,
    topic: `Vellisto Video Production Hub | ${data.name} | Platform: ${data.preferredPlatform || 'EMAIL'}`,
    permissionOverwrites: createTicketPermissionOverwrites(targetGuild, data.discordUserId || targetGuild.members.me.id)
  });

  const clientId = `client_${Date.now()}`;
  const clientObj = {
    id: clientId,
    name: data.name || 'Client',
    email: data.email || '',
    company: data.company || '',
    preferredPlatform: data.preferredPlatform || 'EMAIL',
    channelId: newChannel.id,
    footageUrl: data.footageUrl || '',
    dropboxUrl: data.dropboxUrl || '',
    deadline: data.deadline ? parseDeadlineToUnix(data.deadline) : null,
    milestone: data.milestone || 'Rough Cut Draft',
    stage: 'INGESTION',
    createdAt: new Date().toISOString(),
    deliveries: []
  };

  const dashboardMsg = await newChannel.send({
    embeds: [buildDashboardEmbed(clientObj)],
    components: buildDashboardButtons(clientId)
  });

  await dashboardMsg.pin().catch(() => {});
  clientObj.dashboardMessageId = dashboardMsg.id;
  saveClient(clientObj);

  await newChannel.send({
    content: `🎉 **Production Channel Created for ${clientObj.name}!**\n• Preferred Platform: **${clientObj.preferredPlatform.toUpperCase()}**\n• Pinned storage links and live deadline tracker are active above.\n• Assign editors using **👥 Assign Editor** button.`
  });

  console.log(`[DISCORD CRM] Created client channel #${newChannel.name} (${newChannel.id})`);
  return { channel: newChannel, client: clientObj };
}

// -------------------------------------------------------------
// Discord Bot Initialization & Complete Event Routing
// -------------------------------------------------------------
function initDiscordCRM() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const resendKey = process.env.RESEND_API_KEY;

  if (!token) return;
  if (resendKey) resend = new Resend(resendKey);

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  async function syncInboundEmails() {
    if (!resend || !resend.emails || !resend.emails.receiving) return;
    try {
      const listRes = await resend.emails.receiving.list({ limit: 15 });
      const emails = listRes.data?.data || [];
      const processed = getProcessedEmails();

      for (const item of emails) {
        if (!processed.has(item.id)) {
          const full = await resend.emails.receiving.get(item.id);
          if (full.data) {
            console.log(`[INBOUND SYNC] Pulling new email from ${full.data.from} (${full.data.subject})`);
            await handleInboundEmail(full.data);
            saveProcessedEmail(item.id);
          }
        }
      }
    } catch (err) {
      // Polling caught silently
    }
  }

  client.on('ready', async () => {
    isReady = true;
    console.log(`[DISCORD CRM] ✅ Logged in to Discord as ${client.user.tag}`);

    // Auto-provision roles, #admin-hub, and #work-with-us on startup!
    for (const guild of client.guilds.cache.values()) {
      await provisionServerStructure(guild);
    }

    // Auto-sync inbound emails every 8 seconds from Resend API
    setInterval(syncInboundEmails, 8000);
    syncInboundEmails();
  });

  // Fast chat command: !role @user RoleName
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith('!role')) return;

    const member = message.member;
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator) && !member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply('⛔ Only administrators can assign roles.');
    }

    const args = message.content.slice(5).trim().split(/\s+/);
    const targetMember = message.mentions.members.first();
    const roleName = args.slice(1).join(' ').toLowerCase();

    if (!targetMember || !roleName) {
      return message.reply('Usage: `!role @user RoleName` (e.g. `!role @sam Co-Admin`, `!role @david Client`, `!role @alex Support`)');
    }

    const matchedRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);
    if (!matchedRole) {
      return message.reply(`❌ Role "${roleName}" not found. Available: Co-Admin, Support, Client, Member.`);
    }

    try {
      await targetMember.roles.add(matchedRole);
      const resMsg = await message.reply(`✅ Granted **@${matchedRole.name}** role to <@${targetMember.id}>!`);
      setTimeout(() => {
        message.delete().catch(() => {});
        resMsg.delete().catch(() => {});
      }, 3500);
    } catch (e) {
      message.reply(`❌ Error granting role: ${e.message}`);
    }
  });

  // Fast chat command: !clear [number]
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith('!clear')) return;

    const member = message.member;
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator) && !member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('⛔ Only administrators can clear messages.');
    }

    const args = message.content.trim().split(/\s+/);
    const count = Math.min(parseInt(args[1], 10) || 50, 100);

    try {
      await message.delete().catch(() => {});
      const fetched = await message.channel.messages.fetch({ limit: count });
      const deletable = fetched.filter(m => !m.pinned);
      await message.channel.bulkDelete(deletable, true).catch(() => {});
      const notify = await message.channel.send(`🧹 **Cleared past messages!**`);
      setTimeout(() => notify.delete().catch(() => {}), 3000);
    } catch (err) {
      console.error('Clear error:', err.message);
    }
  });

  // Fast chat command / trigger: ticket: [issue]
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.trim().toLowerCase().startsWith('ticket:')) return;

    try {
      const issue = message.content.slice(7).trim();
      const ticketChannel = await createPrivateTicketChannel(message.guild, message.author, {
        topic: 'Support Ticket',
        details: issue || 'Opened via chat command'
      });
      const replyMsg = await message.reply(`✅ <@${message.author.id}> **Private ticket channel created:** <#${ticketChannel.id}>!\n🔒 Only you, Administrators, and our Editor team can access it.\n*(This message will automatically delete in 1 minute)*`);
      setTimeout(async () => {
        await replyMsg.delete().catch(() => {});
        await message.delete().catch(() => {});
      }, 60000);
    } catch (err) {
      console.error('[DISCORD CRM ERROR] Failed to create ticket from text command:', err);
    }
  });

  client.on('interactionCreate', async (interaction) => {
    try {
      // =======================================================
      // 1. BUTTON INTERACTIONS
      // =======================================================
      if (interaction.isButton()) {
        const customId = interaction.customId;

        // A. Admin Hub: Assign Role Button -> Prompt User Select
        if (customId === 'admin_assign_btn') {
          const userSelect = new UserSelectMenuBuilder()
            .setCustomId('admin_user_pick:assign')
            .setPlaceholder('Pick a member to grant a role')
            .setMinValues(1)
            .setMaxValues(1);

          return await interaction.reply({
            content: '👤 **Select the member you want to assign a role to:**',
            components: [new ActionRowBuilder().addComponents(userSelect)],
            ephemeral: true
          });
        }

        // B. Admin Hub: Remove Role Button -> Prompt User Select
        if (customId === 'admin_remove_btn') {
          const userSelect = new UserSelectMenuBuilder()
            .setCustomId('admin_user_pick:remove')
            .setPlaceholder('Pick a member to remove a role from')
            .setMinValues(1)
            .setMaxValues(1);

          return await interaction.reply({
            content: '❌ **Select the member you want to remove a role from:**',
            components: [new ActionRowBuilder().addComponents(userSelect)],
            ephemeral: true
          });
        }

        // C. Member "Work With Us" / Open Ticket Buttons
        if (customId === 'open_ticket_btn' || customId === 'open_support_ticket_btn' || customId === 'member_start_project') {
          const isSupport = customId === 'open_support_ticket_btn';
          const modal = new ModalBuilder()
            .setCustomId(`ticket_modal:${interaction.user.id}:${isSupport ? 'support' : 'project'}`)
            .setTitle(isSupport ? 'Open Support Ticket' : 'Open Ticket — Work With Us');

          const topicInput = new TextInputBuilder()
            .setCustomId('ticket_topic')
            .setLabel(isSupport ? 'Issue / Topic' : 'Project Type (Shorts/YouTube/Ads/Retainer)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(isSupport ? 'e.g. Revision on recent short-form edit' : 'e.g. 10x YouTube Shorts Retainer')
            .setRequired(true);

          const descInput = new TextInputBuilder()
            .setCustomId('ticket_details')
            .setLabel(isSupport ? 'Describe your issue or question' : 'Project Scope, References & Channel Link')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Provide details, links to footage, reference channels, or questions...')
            .setRequired(true);

          const budgetInput = new TextInputBuilder()
            .setCustomId('ticket_budget')
            .setLabel(isSupport ? 'Priority / Timeline (Optional)' : 'Budget / Target Timeline (Optional)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(isSupport ? 'e.g. Urgent / Normal' : 'e.g. $1,000 - $2,500 / month')
            .setRequired(false);

          modal.addComponents(
            new ActionRowBuilder().addComponents(topicInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(budgetInput)
          );

          return await interaction.showModal(modal);
        }

        // C.1 Ticket Management: Close Ticket
        if (customId.startsWith('close_ticket:')) {
          const chId = customId.split(':')[1] || interaction.channelId;
          return await interaction.reply({
            content: '⚠️ **Are you sure you want to close this ticket?** This channel will be permanently archived and removed.',
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`confirm_close_ticket:${chId}`)
                  .setLabel('🔒 Confirm Close & Delete Channel')
                  .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                  .setCustomId('cancel_close_ticket')
                  .setLabel('Cancel')
                  .setStyle(ButtonStyle.Secondary)
              )
            ],
            ephemeral: true
          });
        }

        if (customId.startsWith('confirm_close_ticket:')) {
          const chId = customId.split(':')[1] || interaction.channelId;
          const ch = interaction.guild.channels.cache.get(chId) || interaction.channel;
          await interaction.reply({ content: '🔒 **Ticket closed.** Channel will self-destruct in 5 seconds...' });
          setTimeout(() => { ch.delete('Ticket closed by user/admin').catch(() => {}); }, 5000);
          return;
        }

        if (customId === 'cancel_close_ticket') {
          return await interaction.update({ content: '❎ Ticket close request cancelled.', components: [] });
        }

        if (customId.startsWith('ticket_info:')) {
          const ch = interaction.channel;
          const overwrites = ch.permissionOverwrites.cache;
          const allowedNames = [];
          const deniedNames = [];

          overwrites.forEach(po => {
            const role = interaction.guild.roles.cache.get(po.id);
            const user = interaction.guild.members.cache.get(po.id)?.user;
            const name = role ? `@${role.name}` : (user ? `@${user.tag}` : po.id);
            if (po.allow.has(PermissionsBitField.Flags.ViewChannel)) allowedNames.push(name);
            if (po.deny.has(PermissionsBitField.Flags.ViewChannel)) deniedNames.push(name);
          });

          return await interaction.reply({
            content: `🔒 **Private Ticket Privacy Verification:**\n\n` +
              `✅ **Explicitly Allowed Access:**\n${allowedNames.map(n => `• ${n}`).join('\n') || 'None'}\n\n` +
              `🚫 **Explicitly Denied Access:**\n${deniedNames.map(n => `• ${n}`).join('\n') || 'None'}\n\n` +
              `*No unauthorized server members can view this channel.*`,
            ephemeral: true
          });
        }

        // D. Inbound Lead: Create Dedicated Discussion Room Channel (Separated from #inquiries)
        if (customId.startsWith('open_disc_channel:')) {
          const leadId = customId.split(':')[1];
          const lead = findSubmission(leadId);
          if (!lead) return interaction.reply({ content: '⚠️ Lead not found.', ephemeral: true });

          await interaction.deferReply({ ephemeral: true });

          const guild = interaction.guild;
          if (!guild) return interaction.editReply({ content: '❌ Guild not found.' });

          // Find or create "💬 DISCUSSIONS" category
          let discCat = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('discussion'));
          if (!discCat) {
            discCat = await guild.channels.create({
              name: '💬 DISCUSSIONS',
              type: ChannelType.GuildCategory,
              permissionOverwrites: [
                {
                  id: guild.roles.everyone.id,
                  deny: [PermissionsBitField.Flags.ViewChannel]
                }
              ]
            }).catch(() => null);
          }

          const cleanLeadName = (lead.data?.name || 'lead').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const discChannel = await guild.channels.create({
            name: `deal-${cleanLeadName}`,
            type: ChannelType.GuildText,
            parent: discCat ? discCat.id : null,
            topic: `Active Negotiation Room | ${lead.data?.name} | ${lead.data?.email || 'No email'}`,
            permissionOverwrites: createTicketPermissionOverwrites(guild, guild.members.me.id)
          });

          // Action Card inside the new discussion channel
          const discEmbed = new EmbedBuilder()
            .setTitle(`🎯 DEAL DESK — ${lead.data?.name || 'New Lead'}`)
            .setColor(0xFFDE31)
            .setDescription(`Negotiation & discovery room for **${lead.data?.name}** (${lead.data?.email}).`)
            .addFields([
              { name: 'Services / Scope', value: Array.isArray(lead.data?.project) ? lead.data.project.join(', ') : lead.data?.project || 'Not specified', inline: true },
              { name: 'Budget', value: lead.data?.budget || 'Not specified', inline: true },
              { name: 'Details', value: lead.data?.message || 'No initial message', inline: false }
            ])
            .setFooter({ text: 'Vellisto Deal Desk • 1-Click Response Suite' });

          const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`tpl_pricing:${leadId}`)
              .setLabel('💰 Send Pricing & Rates')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(`tpl_portfolio:${leadId}`)
              .setLabel('🎬 Send Portfolio / Reel')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId(`tpl_proposal:${leadId}`)
              .setLabel('🤝 Send Deal Proposal')
              .setStyle(ButtonStyle.Success)
          );

          const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`modal_reply:${leadId}`)
              .setLabel('✉️ Custom Reply')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId(`finalize_deal:${leadId}`)
              .setLabel('🚀 Finalize & Convert to Client')
              .setStyle(ButtonStyle.Success)
          );

          await discChannel.send({ embeds: [discEmbed], components: [row1, row2] });

          return await interaction.editReply({
            content: `✅ **Dedicated discussion room created:** <#${discChannel.id}>`
          });
        }

        // E. Quick Templates inside discussion room
        if (customId.startsWith('tpl_pricing:')) {
          const leadId = customId.split(':')[1];
          const lead = findSubmission(leadId) || { data: { name: 'there', email: '' } };

          const modal = new ModalBuilder()
            .setCustomId(`send_pricing:${leadId}`)
            .setTitle('Send Pricing & Rates');

          const subjectInput = new TextInputBuilder()
            .setCustomId('subject')
            .setLabel('Subject')
            .setStyle(TextInputStyle.Short)
            .setValue('Re: Project inquiry — Vellisto overview & rates')
            .setRequired(true);

          const clientFirstName = (lead.data?.name || 'there').split(' ')[0];
          const defaultBody = `Hi ${clientFirstName},\n\nThanks for reaching out! Here is a quick overview of how we typically structure video production and editing:\n\n• Dedicated Short-Form Retainer (Reels / Shorts): 10 videos/mo with 48h turnaround, sound design, and color grading\n• Long-Form YouTube Projects: scoped per project with full editing and thumbnails\n• All deliverables include 2 complimentary revision rounds.\n\nWhich format are you looking to produce?`;

          const bodyInput = new TextInputBuilder()
            .setCustomId('body')
            .setLabel('Your Message')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(defaultBody)
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(subjectInput),
            new ActionRowBuilder().addComponents(bodyInput)
          );

          return await interaction.showModal(modal);
        }

        if (customId.startsWith('tpl_portfolio:')) {
          const leadId = customId.split(':')[1];
          const lead = findSubmission(leadId) || { data: { name: 'there', email: '' } };

          const modal = new ModalBuilder()
            .setCustomId(`send_portfolio:${leadId}`)
            .setTitle('Send Portfolio Reel');

          const subjectInput = new TextInputBuilder()
            .setCustomId('subject')
            .setLabel('Subject')
            .setStyle(TextInputStyle.Short)
            .setValue('Re: Project inquiry — Recent work & showcase')
            .setRequired(true);

          const clientFirstName = (lead.data?.name || 'there').split(' ')[0];
          const defaultBody = `Hi ${clientFirstName},\n\nHere are a few relevant video editing samples we've produced recently:\n\n• Showcase Reel: https://vellisto.com\n• High-Retention Short-Form & YouTube Edits\n\nLet me know what style matches your brand's vision best!`;

          const bodyInput = new TextInputBuilder()
            .setCustomId('body')
            .setLabel('Your Message')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(defaultBody)
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(subjectInput),
            new ActionRowBuilder().addComponents(bodyInput)
          );

          return await interaction.showModal(modal);
        }

        if (customId.startsWith('tpl_proposal:')) {
          const leadId = customId.split(':')[1];
          const lead = findSubmission(leadId) || { data: { name: 'there', email: '' } };

          const modal = new ModalBuilder()
            .setCustomId(`send_proposal:${leadId}`)
            .setTitle('Send Deal Proposal');

          const subjectInput = new TextInputBuilder()
            .setCustomId('subject')
            .setLabel('Subject')
            .setStyle(TextInputStyle.Short)
            .setValue('Re: Agreed project scope & next steps')
            .setRequired(true);

          const clientFirstName = (lead.data?.name || 'there').split(' ')[0];
          const defaultBody = `Hi ${clientFirstName},\n\nBased on our conversation, here is a quick summary of the agreed project scope:\n\n• Scope: Monthly Content Retainer\n• Turnaround: 48 hours per initial draft\n• Shared Workspace: Shared drive for raw footage + dedicated review link\n• Revisions: 2 rounds included per edit\n\nIf everything looks good to you, reply with a quick 'Confirmed' and we'll spin up your project workspace right away!`;

          const bodyInput = new TextInputBuilder()
            .setCustomId('body')
            .setLabel('Proposal Body')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(defaultBody)
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(subjectInput),
            new ActionRowBuilder().addComponents(bodyInput)
          );

          return await interaction.showModal(modal);
        }

        // Custom 1-on-1 Reply Button (Handles ✉️ Custom Reply)
        if (customId.startsWith('modal_reply:')) {
          const leadId = customId.split(':')[1];
          const lead = findSubmission(leadId) || { data: { name: 'there', email: '' } };

          const modal = new ModalBuilder()
            .setCustomId(`modal_reply:${leadId}`)
            .setTitle('Custom Reply to Lead');

          const subjectInput = new TextInputBuilder()
            .setCustomId('subject')
            .setLabel('Subject')
            .setStyle(TextInputStyle.Short)
            .setValue('Re: Project inquiry — Vellisto')
            .setRequired(true);

          const clientFirstName = (lead.data?.name || 'there').split(' ')[0];
          const messageInput = new TextInputBuilder()
            .setCustomId('message')
            .setLabel('Your Message')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(`Hi ${clientFirstName},\n\n`)
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(subjectInput),
            new ActionRowBuilder().addComponents(messageInput)
          );

          return await interaction.showModal(modal);
        }

        // F. Finalize Deal Button -> Onboard
        if (customId.startsWith('finalize_deal:')) {
          const leadId = customId.split(':')[1];
          const lead = findSubmission(leadId) || { data: { name: '', email: '' } };

          const modal = new ModalBuilder()
            .setCustomId(`do_finalize:${leadId}`)
            .setTitle('Finalize Deal & Onboard');

          const nameInput = new TextInputBuilder()
            .setCustomId('client_name')
            .setLabel('Client / Company Name')
            .setStyle(TextInputStyle.Short)
            .setValue(lead.data?.name || '')
            .setRequired(true);

          const platformInput = new TextInputBuilder()
            .setCustomId('platform')
            .setLabel('Platform (DISCORD/EMAIL/WHATSAPP)')
            .setStyle(TextInputStyle.Short)
            .setValue('DISCORD')
            .setPlaceholder('DISCORD, EMAIL, WHATSAPP, or INSTAGRAM')
            .setRequired(true);

          const milestoneInput = new TextInputBuilder()
            .setCustomId('milestone')
            .setLabel('Initial Milestone')
            .setStyle(TextInputStyle.Short)
            .setValue('Rough Cut Draft')
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(platformInput),
            new ActionRowBuilder().addComponents(milestoneInput)
          );

          return await interaction.showModal(modal);
        }

        // G. Dashboard Controls (Deadline, Links, Status, Deliver with optional email)
        const [action, param] = customId.split(':');

        if (action === 'hub_deadline') {
          let clientObj = findClient(param) || getClients().find(c => c.channelId === interaction.channelId);
          if (!clientObj) return interaction.reply({ content: '⚠️ Client record not found.', flags: MessageFlags.Ephemeral });

          const modal = new ModalBuilder()
            .setCustomId(`modal_deadline:${clientObj.id}`)
            .setTitle('Set Project Deadline');

          const deadlineInput = new TextInputBuilder()
            .setCustomId('deadline_input')
            .setLabel('Target Deadline (Date or Hours)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g. 48 hours, tomorrow, or 2026-10-12 18:00')
            .setRequired(true);

          const milestoneInput = new TextInputBuilder()
            .setCustomId('milestone_input')
            .setLabel('Milestone Description')
            .setStyle(TextInputStyle.Short)
            .setValue(clientObj.milestone || 'Rough Cut Draft')
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(deadlineInput),
            new ActionRowBuilder().addComponents(milestoneInput)
          );

          return await interaction.showModal(modal);
        }

        if (action === 'hub_links') {
          let clientObj = findClient(param) || getClients().find(c => c.channelId === interaction.channelId);
          if (!clientObj) return interaction.reply({ content: '⚠️ Client not found.', flags: MessageFlags.Ephemeral });

          const modal = new ModalBuilder()
            .setCustomId(`modal_links:${clientObj.id}`)
            .setTitle('Set Storage Links');

          const footageInput = new TextInputBuilder()
            .setCustomId('footage_url')
            .setLabel('Google Drive Footage Link')
            .setStyle(TextInputStyle.Short)
            .setValue(clientObj.footageUrl || '')
            .setPlaceholder('https://drive.google.com/drive/folders/...')
            .setRequired(false);

          const dropboxInput = new TextInputBuilder()
            .setCustomId('dropbox_url')
            .setLabel('Dropbox Delivery Folder Link')
            .setStyle(TextInputStyle.Short)
            .setValue(clientObj.dropboxUrl || '')
            .setPlaceholder('https://www.dropbox.com/scl/fo/...')
            .setRequired(false);

          modal.addComponents(
            new ActionRowBuilder().addComponents(footageInput),
            new ActionRowBuilder().addComponents(dropboxInput)
          );

          return await interaction.showModal(modal);
        }

        if (action === 'hub_status') {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });
          let clientObj = findClient(param) || getClients().find(c => c.channelId === interaction.channelId);
          if (!clientObj) return interaction.editReply({ content: '⚠️ Client not found.' });

          const currentIdx = STAGES.findIndex(s => s.id === clientObj.stage);
          const nextIdx = (currentIdx + 1) % STAGES.length;
          clientObj.stage = STAGES[nextIdx].id;
          saveClient(clientObj);
          await updateDashboardMessage(clientObj);

          return await interaction.editReply({
            content: `🔄 **Status updated:** ${getStageLabel(clientObj.stage)}`
          });
        }

        // Deliver with OPTIONAL email toggle!
        if (action === 'hub_deliver') {
          let clientObj = findClient(param) || getClients().find(c => c.channelId === interaction.channelId);
          if (!clientObj) return interaction.reply({ content: '⚠️ Client not found.', flags: MessageFlags.Ephemeral });

          const modal = new ModalBuilder()
            .setCustomId(`modal_deliver:${clientObj.id}`)
            .setTitle(`Dropbox Delivery for ${clientObj.name.slice(0, 20)}`);

          const urlInput = new TextInputBuilder()
            .setCustomId('delivery_url')
            .setLabel('Dropbox Video Link')
            .setStyle(TextInputStyle.Short)
            .setValue(clientObj.dropboxUrl || '')
            .setPlaceholder('https://dropbox.com/s/...')
            .setRequired(true);

          const notesInput = new TextInputBuilder()
            .setCustomId('delivery_notes')
            .setLabel('Notes for Client')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(`Hi ${clientObj.name.split(' ')[0]},\n\nYour latest video cut is uploaded and ready for review! Check out the link below and let me know your thoughts.\n\nBest,\nKrishna`)
            .setRequired(true);

          const sendEmailInput = new TextInputBuilder()
            .setCustomId('send_email_toggle')
            .setLabel('Send Email Notification? (YES / NO)')
            .setStyle(TextInputStyle.Short)
            .setValue(clientObj.preferredPlatform === 'EMAIL' ? 'YES' : 'NO')
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(urlInput),
            new ActionRowBuilder().addComponents(notesInput),
            new ActionRowBuilder().addComponents(sendEmailInput)
          );

          return await interaction.showModal(modal);
        }

        if (action === 'hub_assign_btn') {
          let clientObj = findClient(param) || getClients().find(c => c.channelId === interaction.channelId);
          if (!clientObj) return interaction.reply({ content: '⚠️ Client not found.', flags: MessageFlags.Ephemeral });

          const userSelect = new UserSelectMenuBuilder()
            .setCustomId(`select_editor:${clientObj.id}`)
            .setPlaceholder('Choose a team member to assign as lead editor')
            .setMinValues(1)
            .setMaxValues(1);

          return await interaction.reply({
            content: `👥 **Select Lead Editor for ${clientObj.name}:**`,
            components: [new ActionRowBuilder().addComponents(userSelect)],
            flags: MessageFlags.Ephemeral
          });
        }

        if (action === 'hub_email') {
          let clientObj = findClient(param) || getClients().find(c => c.channelId === interaction.channelId);
          if (!clientObj) return interaction.reply({ content: '⚠️ Client not found.', flags: MessageFlags.Ephemeral });

          const modal = new ModalBuilder()
            .setCustomId(`modal_hub_email:${clientObj.id}`)
            .setTitle(`Message ${clientObj.name.slice(0, 25)}`);

          const subjectInput = new TextInputBuilder()
            .setCustomId('email_subject')
            .setLabel('Subject')
            .setStyle(TextInputStyle.Short)
            .setValue(`Quick note regarding your video project — Vellisto`)
            .setRequired(true);

          const bodyInput = new TextInputBuilder()
            .setCustomId('email_body')
            .setLabel('Your Message')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(`Hi ${clientObj.name.split(' ')[0]},\n\n`)
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(subjectInput),
            new ActionRowBuilder().addComponents(bodyInput)
          );

          return await interaction.showModal(modal);
        }

        // Guaranteed catch-all for any unhandled button clicks
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '⚡ Action received.', flags: MessageFlags.Ephemeral }).catch(() => {});
        }
      }

      // =======================================================
      // 2. USER SELECT MENUS
      // =======================================================
      if (interaction.isUserSelectMenu()) {
        const [action, param] = interaction.customId.split(':');

        // Admin Hub: Member selected -> Update in-place to Role Picker
        if (action === 'admin_user_pick') {
          const targetUserId = interaction.values[0];
          const mode = param; // 'assign' or 'remove'

          const roleSelect = new StringSelectMenuBuilder()
            .setCustomId(`admin_role_do:${targetUserId}:${mode}`)
            .setPlaceholder(`Choose role to ${mode}`)
            .addOptions([
              { label: 'Co-Admin', value: 'Co-Admin', description: 'Full administrative access to everything' },
              { label: 'Support', value: 'Support', description: 'Customer success & discussion moderator' },
              { label: 'Client', value: 'Client', description: 'Private client CRM workspace access' },
              { label: 'Member', value: 'Member', description: 'Standard community access' }
            ]);

          return await interaction.update({
            content: `🛡️ **Selected Member:** <@${targetUserId}>\nChoose which role to **${mode.toUpperCase()}**:`,
            components: [new ActionRowBuilder().addComponents(roleSelect)]
          });
        }

        // Project: Lead Editor Selected
        if (action === 'select_editor') {
          await interaction.deferUpdate();
          const selectedUserId = interaction.values[0];
          const clientObj = findClient(param);

          if (!clientObj) return;

          clientObj.assignedEditor = selectedUserId;
          saveClient(clientObj);
          await updateDashboardMessage(clientObj);

          const guild = interaction.guild;
          if (guild) {
            const member = await guild.members.fetch(selectedUserId).catch(() => null);
            const channel = await guild.channels.fetch(clientObj.channelId).catch(() => null);
            if (channel) {
              await channel.permissionOverwrites.create(selectedUserId, {
                ViewChannel: true,
                SendMessages: true,
                AttachFiles: true
              }).catch(() => {});

              await channel.send({
                content: `👋 <@${selectedUserId}> **has been assigned as lead editor for ${clientObj.name}!**\n• Raw Footage & Assets are pinned above.\n• Keep notes and status updated here.`
              });
            }
          }

          return await interaction.followUp({
            content: `✅ Assigned <@${selectedUserId}> as lead editor!`,
            ephemeral: true
          });
        }
      }

      // =======================================================
      // 3. STRING SELECT MENUS (Role Assignment Execution)
      // =======================================================
      if (interaction.isStringSelectMenu()) {
        const [action, targetUserId, mode] = interaction.customId.split(':');
        if (action === 'admin_role_do') {
          const selectedRoleName = interaction.values[0];
          const guild = interaction.guild;

          if (!guild) return;

          const targetMember = await guild.members.fetch(targetUserId).catch(() => null);
          if (!targetMember) {
            return await interaction.update({ content: '❌ Member not found in server.', components: [] });
          }

          const role = guild.roles.cache.find(r => r.name.toLowerCase() === selectedRoleName.toLowerCase());
          if (!role) {
            return await interaction.update({ content: `❌ Role @${selectedRoleName} not found.`, components: [] });
          }

          try {
            if (mode === 'assign') {
              await targetMember.roles.add(role);
              await interaction.update({
                content: `✅ **Granted @${role.name} role to <@${targetUserId}>!** *(Clearing message...)*`,
                components: []
              });
            } else {
              await targetMember.roles.remove(role);
              await interaction.update({
                content: `✅ **Removed @${role.name} role from <@${targetUserId}>!** *(Clearing message...)*`,
                components: []
              });
            }

            // Auto-delete / auto-clean the message after 3 seconds so zero clutter remains!
            setTimeout(async () => {
              try {
                await interaction.deleteReply().catch(() => {});
              } catch (delErr) {}
            }, 3000);

          } catch (e) {
            return await interaction.update({ content: `❌ Error: ${e.message}`, components: [] });
          }
        }
      }

      // =======================================================
      // 4. MODAL SUBMISSIONS
      // =======================================================
      if (interaction.isModalSubmit()) {
        const [action, param] = interaction.customId.split(':');

        // Member "Work With Us" / Ticket Modal Submission
        if (action === 'ticket_modal' || action === 'member_modal_project') {
          await interaction.deferReply();
          const guild = interaction.guild;
          if (!guild) return interaction.editReply({ content: '❌ Guild not found.' });

          let topic = 'Project Inquiry';
          let details = '';
          let budget = '';

          try {
            topic = interaction.fields.getTextInputValue('ticket_topic') || interaction.fields.getTextInputValue('project_type') || 'Project Inquiry';
          } catch (_) {}
          try {
            details = interaction.fields.getTextInputValue('ticket_details') || interaction.fields.getTextInputValue('project_desc') || '';
          } catch (_) {}
          try {
            budget = interaction.fields.getTextInputValue('ticket_budget') || interaction.fields.getTextInputValue('project_budget') || '';
          } catch (_) {}

          const ticketChannel = await createPrivateTicketChannel(guild, interaction.user, {
            topic,
            details,
            budget
          });

          await interaction.editReply({
            content: `🎉 <@${interaction.user.id}> **Your private ticket channel is ready:** <#${ticketChannel.id}>!\n\n🔒 **Privacy Confirmed:** Only you, Administrators, and our Editor team have access.\n*(This message will automatically delete in 1 minute)*`
          });

          // Automatically delete confirmation message after 1 minute (60 seconds)
          setTimeout(async () => {
            try {
              await interaction.deleteReply();
            } catch (_) {
              try {
                const msg = await interaction.fetchReply();
                if (msg) await msg.delete().catch(() => {});
              } catch (_) {}
            }
          }, 60000);
          return;
        }

        // Fast Email Deliveries (Pricing, Portfolio, Proposal, Custom)
        if (action === 'send_pricing' || action === 'send_portfolio' || action === 'send_proposal' || action === 'modal_reply') {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });
          let lead = findSubmission(param);
          
          // Robust fallback: if not found in memory, parse email from discussion channel topic
          if (!lead) {
            const ch = interaction.channel;
            const topic = ch?.topic || '';
            const emailMatch = topic.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            if (emailMatch) {
              lead = { data: { email: emailMatch[1], name: ch.name.replace(/^deal-/, '') } };
            }
          }

          if (!lead || !lead.data?.email) {
            return interaction.editReply({ content: '❌ Lead email could not be located for this deal channel.' });
          }

          const subject = interaction.fields.getTextInputValue('subject');
          const body = interaction.fields.getTextInputValue(action === 'modal_reply' ? 'message' : 'body');
          const recipientEmail = lead.data.email;
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'Krishna | Vellisto <hello@vellisto.com>';

          if (resend) {
            const paragraphs = body.split('\n\n').map(p => `<p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.6; color: #1a1a1a;">${p.replace(/\n/g, '<br/>')}</p>`).join('');
            await resend.emails.send({
              from: fromEmail,
              to: recipientEmail,
              reply_to: 'hello@vellisto.com',
              subject,
              text: `${body}\n\n--\nKrishna\nVellisto Studio • https://vellisto.com`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #1a1a1a; padding: 8px 0;">
                  ${paragraphs}
                  <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
                    <p style="margin: 0; font-weight: 600; color: #111;">Krishna</p>
                    <p style="margin: 2px 0 0; color: #777;">Vellisto Studio &bull; <a href="https://vellisto.com" style="color: #555; text-decoration: none;">vellisto.com</a></p>
                  </div>
                </div>
              `
            }).catch(e => console.error('[RESEND ERR]', e));
          }

          await interaction.channel.send({
            content: `📬 **Sent to ${recipientEmail} by @${interaction.user.username}:**\n**Subject:** ${subject}\n> ${body.slice(0, 150).replace(/\n/g, ' ')}...`
          });

          return interaction.editReply({ content: `✅ Email delivered to ${recipientEmail}!` });
        }

        // Deal Finalized ➔ Create Official Workspace
        if (action === 'do_finalize') {
          await interaction.deferReply({ ephemeral: true });
          const lead = findSubmission(param);
          const clientName = interaction.fields.getTextInputValue('client_name');
          const platform = interaction.fields.getTextInputValue('platform').toUpperCase().trim();
          const milestone = interaction.fields.getTextInputValue('milestone');

          try {
            const { channel, client: newClient } = await createClientChannel({
              name: clientName,
              email: lead?.data?.email || '',
              company: lead?.data?.company || '',
              preferredPlatform: platform,
              milestone
            });

            await interaction.channel.send({
              content: `🎉 **DEAL LOCKED!** Client onboarded into <#${channel.id}> (${platform} Mode).`
            });

            return interaction.editReply({
              content: `🎉 **Successfully created client workspace!** Channel: <#${channel.id}>`
            });
          } catch (e) {
            return interaction.editReply({ content: `❌ Error: ${e.message}` });
          }
        }

        // Deadline Modal
        if (action === 'modal_deadline') {
          const clientObj = findClient(param);
          if (!clientObj) return interaction.reply({ content: '⚠️ Client record not found.', ephemeral: true });

          const rawDeadline = interaction.fields.getTextInputValue('deadline_input');
          const milestone = interaction.fields.getTextInputValue('milestone_input');
          const unixTs = parseDeadlineToUnix(rawDeadline);

          if (!unixTs) {
            return interaction.reply({
              content: `⚠️ Could not parse date "${rawDeadline}". Try "48 hours", "tomorrow", or "2026-10-12 18:00".`,
              ephemeral: true
            });
          }

          clientObj.deadline = unixTs;
          clientObj.milestone = milestone;
          saveClient(clientObj);
          await updateDashboardMessage(clientObj);

          await interaction.channel.send({
            content: `⏱️ **Deadline Updated by @${interaction.user.username}:**\n• Milestone: **${milestone}**\n• Target: <t:${unixTs}:F> (**<t:${unixTs}:R>**)`
          });

          return interaction.reply({ content: '✅ Deadline updated successfully!', ephemeral: true });
        }

        // Storage Links Modal
        if (action === 'modal_links') {
          const clientObj = findClient(param);
          if (!clientObj) return interaction.reply({ content: '⚠️ Client not found.', ephemeral: true });

          const fUrl = interaction.fields.getTextInputValue('footage_url').trim();
          const dUrl = interaction.fields.getTextInputValue('dropbox_url').trim();

          if (fUrl) clientObj.footageUrl = fUrl;
          if (dUrl) clientObj.dropboxUrl = dUrl;

          saveClient(clientObj);
          await updateDashboardMessage(clientObj);

          await interaction.channel.send({
            content: `📁 **Storage Links Updated by @${interaction.user.username}:**\n• Google Drive: ${clientObj.footageUrl ? `<${clientObj.footageUrl}>` : 'Not set'}\n• Dropbox: ${clientObj.dropboxUrl ? `<${clientObj.dropboxUrl}>` : 'Not set'}`
          });

          return interaction.reply({ content: '✅ Storage links updated!', ephemeral: true });
        }

        // Dropbox Delivery Modal (WITH OPTIONAL EMAIL TOGGLE)
        if (action === 'modal_deliver') {
          await interaction.deferReply({ ephemeral: true });
          const clientObj = findClient(param);
          if (!clientObj) return interaction.editReply({ content: '⚠️ Client not found.' });

          const deliveryUrl = interaction.fields.getTextInputValue('delivery_url').trim();
          const notes = interaction.fields.getTextInputValue('delivery_notes');
          const sendEmailRaw = interaction.fields.getTextInputValue('send_email_toggle').trim().toUpperCase();
          const shouldSendEmail = sendEmailRaw === 'YES' || sendEmailRaw === 'Y' || sendEmailRaw === 'TRUE';

          clientObj.dropboxUrl = deliveryUrl;
          clientObj.stage = 'CLIENT_REVIEW';
          if (!clientObj.deliveries) clientObj.deliveries = [];
          clientObj.deliveries.push({
            url: deliveryUrl,
            timestamp: new Date().toISOString(),
            deliveredBy: interaction.user.tag,
            notes,
            emailed: shouldSendEmail
          });

          saveClient(clientObj);
          await updateDashboardMessage(clientObj);

          let routeNote = 'Posted in Discord only (No email sent)';
          if (shouldSendEmail && resend && clientObj.email) {
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'Krishna | Vellisto <hello@vellisto.com>';
            await resend.emails.send({
              from: fromEmail,
              to: clientObj.email,
              reply_to: 'hello@vellisto.com',
              subject: `Video draft ready for review — ${clientObj.name}`,
              text: `${notes}\n\nReview link: ${deliveryUrl}\n\n--\nKrishna\nVellisto Studio • https://vellisto.com`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #1a1a1a; padding: 8px 0; line-height: 1.6;">
                  <p style="margin: 0 0 16px;">${notes.replace(/\n/g, '<br/>')}</p>
                  <p style="margin: 16px 0;">
                    <a href="${deliveryUrl}" style="background: #111; color: #fff; text-decoration: none; padding: 12px 22px; font-weight: 600; display: inline-block; border-radius: 6px;">
                      📥 Review & Download Assets
                    </a>
                  </p>
                  <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
                    <p style="margin: 0; font-weight: 600; color: #111;">Krishna</p>
                    <p style="margin: 2px 0 0; color: #777;">Vellisto Studio &bull; <a href="https://vellisto.com" style="color: #555; text-decoration: none;">vellisto.com</a></p>
                  </div>
                </div>
              `
            }).catch(e => console.error('[RESEND ERR]', e));
            routeNote = `Emailed to ${clientObj.email}`;
          }

          await interaction.channel.send({
            content: `🚀 **New Dropbox Delivery Posted by @${interaction.user.username}!**\n🔗 **Dropbox Link:** <${deliveryUrl}>\n📝 **Notes:**\n> ${notes.replace(/\n/g, '\n> ')}\n📬 **Notification:** ${routeNote}`
          });

          return interaction.editReply({ content: `✅ Delivery logged! (${routeNote})` });
        }

        // Direct Email Modal
        if (action === 'modal_hub_email') {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });
          let clientObj = findClient(param) || getClients().find(c => c.channelId === interaction.channelId);
          if (!clientObj || !clientObj.email) return interaction.editReply({ content: '⚠️ Client has no email address.' });

          const subject = interaction.fields.getTextInputValue('email_subject');
          const body = interaction.fields.getTextInputValue('email_body');
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'Krishna | Vellisto <hello@vellisto.com>';

          if (resend) {
            const paragraphs = body.split('\n\n').map(p => `<p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.6; color: #1a1a1a;">${p.replace(/\n/g, '<br/>')}</p>`).join('');
            await resend.emails.send({
              from: fromEmail,
              to: clientObj.email,
              reply_to: 'hello@vellisto.com',
              subject,
              text: `${body}\n\n--\nKrishna\nVellisto Studio • https://vellisto.com`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #1a1a1a; padding: 8px 0;">
                  ${paragraphs}
                  <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
                    <p style="margin: 0; font-weight: 600; color: #111;">Krishna</p>
                    <p style="margin: 2px 0 0; color: #777;">Vellisto Studio &bull; <a href="https://vellisto.com" style="color: #555; text-decoration: none;">vellisto.com</a></p>
                  </div>
                </div>
              `
            }).catch(e => console.error('[RESEND ERR]', e));
          }

          await interaction.channel.send({
            content: `✉️ **Message sent to ${clientObj.email} by @${interaction.user.username}:**\n**Subject:** ${subject}\n> ${body.slice(0, 150).replace(/\n/g, ' ')}...`
          });

          return interaction.editReply({ content: `✅ Message sent to ${clientObj.email}!` });
        }
      }
    } catch (err) {
      console.error('[CRM ERROR] Interaction error:', err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: `⚠️ Action error: ${err.message}`, flags: MessageFlags.Ephemeral }).catch(() => {});
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: `⚠️ Action error: ${err.message}` }).catch(() => {});
        }
      } catch (e) {}
    }
  });

  client.login(token).catch(err => {
    console.error('[DISCORD CRM ERROR] Failed to login to Discord Bot:', err.message);
    isReady = false;
  });
}

// -------------------------------------------------------------
// Lead Notification in #inquiries (with [Open Discussion Room] button)
// -------------------------------------------------------------
async function sendLeadViaBot(entry) {
  if (!isReady || !client) return false;

  const channelId = process.env.DISCORD_LEADS_CHANNEL_ID;
  if (!channelId) return false;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return false;

    const { action, data, id, timestamp } = entry;
    const isEnquiry = action === 'enquiry-form';
    const title = isEnquiry ? '🚀 New Project Enquiry' : '💬 New General Contact Message';
    const color = 0xFFDE31;

    const fields = [
      { name: '👤 Name', value: data.name || 'Not provided', inline: true },
      { name: '✉️ Email', value: data.email || 'Not provided', inline: true }
    ];

    if (data.company) fields.push({ name: '🏢 Company', value: data.company, inline: true });
    if (data.project) {
      const services = Array.isArray(data.project) ? data.project.join(', ') : data.project;
      fields.push({ name: '🎨 Services Requested', value: services || 'None selected', inline: false });
    }
    if (data.budget) fields.push({ name: '💰 Budget', value: data.budget, inline: true });
    if (data.timeline) fields.push({ name: '⏳ Timeline', value: data.timeline, inline: true });
    if (data.origin) fields.push({ name: '📍 Source Page', value: data.origin, inline: true });
    if (data.message) fields.push({ name: '📝 Message / Details', value: data.message, inline: false });

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(color)
      .setDescription(`New lead received from **${data.name || 'A visitor'}** on **${data.origin || 'Vellisto Website'}**.`)
      .addFields(fields)
      .setFooter({ text: 'Vellisto Lead Capture CRM' })
      .setTimestamp(new Date(timestamp));

    // Button creates a dedicated channel in 💬 DISCUSSIONS category (NOT a thread!)
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`open_disc_channel:${id}`)
        .setLabel('💬 Open Discussion Room')
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({
      embeds: [embed],
      components: [buttonRow]
    });

    console.log(`[DISCORD CRM] Sent lead card with Discussion Room button for ${data.name || data.email}`);
    return true;
  } catch (err) {
    console.error('[DISCORD CRM ERROR] Failed to send message to Discord channel:', err.message);
    return false;
  }
}

function extractCleanEmailReply(rawText) {
  if (!rawText) return '';
  // 1. Cut off Gmail style quote headers: "On ... wrote:"
  let clean = rawText.split(/\r?\n\s*On\s+.+?\s+wrote:\s*\r?\n/i)[0];
  // 2. Cut off Outlook / Apple Mail headers
  clean = clean.split(/-----Original Message-----/i)[0];
  clean = clean.split(/________________________________/)[0];
  clean = clean.split(/\r?\nFrom:\s+.+?\r?\nSent:\s+/i)[0];
  // 3. Remove leading '>' quote lines
  const lines = clean.split(/\r?\n/);
  const unquoted = lines.filter(l => !l.trim().startsWith('>'));
  const result = unquoted.join('\n').trim();
  return result || clean.trim() || rawText.trim();
}

// -------------------------------------------------------------
// Two-Way Inbound Email Handler (Resend -> Discord)
// -------------------------------------------------------------
async function handleInboundEmail(emailData) {
  if (!isReady || !client) return false;

  const fromRaw = emailData.from || '';
  const emailMatch = fromRaw.match(/<([^>]+)>/) || [null, fromRaw];
  const senderEmail = (emailMatch[1] || fromRaw).trim().toLowerCase();
  const subject = emailData.subject || 'No Subject';
  const text = emailData.text || emailData.html || 'No content provided';
  const cleanBody = extractCleanEmailReply(text);
  const cleanSender = fromRaw.split('<')[0].trim() || senderEmail;

  // 1. First priority: Check active Deal Negotiation Rooms (#deal-[name])
  for (const guild of client.guilds.cache.values()) {
    const dealChannel = guild.channels.cache.find(c => 
      c.name.startsWith('deal-') && 
      (c.topic || '').toLowerCase().includes(senderEmail)
    );
    if (dealChannel) {
      try {
        const replyBtn = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`modal_reply:${dealChannel.id}`)
            .setLabel('✉️ Reply to Email')
            .setStyle(ButtonStyle.Primary)
        );

        // Clean native message with NO box/embed clutter
        await dealChannel.send({
          content: `💬 **${cleanSender}** (via Email):\n${cleanBody}`,
          components: [replyBtn]
        });

        console.log(`[INBOUND EMAIL] Routed clean reply from ${senderEmail} to #${dealChannel.name}!`);
        return true;
      } catch (err) {
        console.error('[INBOUND DEAL ROOM ERROR]', err.message);
      }
    }
  }

  // 2. Second priority: Look up existing client in clients.json
  const clients = getClients();
  const matchedClient = clients.find(c => c.email && c.email.toLowerCase() === senderEmail);

  if (matchedClient && matchedClient.channelId) {
    try {
      const ch = await client.channels.fetch(matchedClient.channelId);
      if (ch) {
        const replyBtn = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`hub_email:${matchedClient.id}`)
            .setLabel('✉️ Reply to Email')
            .setStyle(ButtonStyle.Primary)
        );

        // Clean native message with NO box/embed clutter
        await ch.send({
          content: `💬 **${matchedClient.name}** (via Email):\n${cleanBody}`,
          components: [replyBtn]
        });

        console.log(`[INBOUND EMAIL] Routed clean reply from ${senderEmail} to #${ch.name}!`);
        return true;
      }
    } catch (e) {
      console.error('[INBOUND EMAIL ERROR]', e.message);
    }
  }

  // 2. If unknown sender, forward to #inquiries as new lead!
  const leadsChannelId = process.env.DISCORD_LEADS_CHANNEL_ID;
  if (leadsChannelId) {
    try {
      const inquiriesCh = await client.channels.fetch(leadsChannelId);
      if (inquiriesCh) {
        const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const newEntry = {
          id,
          timestamp: new Date().toISOString(),
          action: 'inbound-email',
          data: {
            name: fromRaw.split('<')[0].trim() || senderEmail,
            email: senderEmail,
            message: text,
            origin: 'Direct Email (hello@vellisto.com)'
          }
        };

        const submissions = getSubmissions();
        submissions.push(newEntry);
        fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf8');

        const embed = new EmbedBuilder()
          .setTitle('🚀 New Direct Email Inquiry')
          .setColor(0xFFDE31)
          .setDescription(`Email received from **${newEntry.data.name}** (<${senderEmail}>).`)
          .addFields([
            { name: '📌 Subject', value: subject, inline: true },
            { name: '📝 Message', value: text.slice(0, 1000), inline: false }
          ])
          .setFooter({ text: 'Vellisto Inbound Mail Receiver' })
          .setTimestamp();

        const btnRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`open_disc_channel:${id}`)
            .setLabel('💬 Open Discussion Room')
            .setStyle(ButtonStyle.Primary)
        );

        await inquiriesCh.send({ embeds: [embed], components: [btnRow] });
        console.log(`[INBOUND EMAIL] Routed new email from unknown sender ${senderEmail} to #inquiries!`);
        return true;
      }
    } catch (e) {
      console.error('[INBOUND LEADS ERROR]', e.message);
    }
  }

  return false;
}

module.exports = {
  initDiscordCRM,
  sendLeadViaBot,
  createClientChannel,
  handleInboundEmail
};
