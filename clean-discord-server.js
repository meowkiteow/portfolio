require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  ChannelType, 
  PermissionsBitField, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', async () => {
  console.log(`[CLEANUP] Logged in as ${client.user.tag}`);
  const guild = client.guilds.cache.first();
  if (!guild) {
    console.log('No guild found');
    process.exit(1);
  }

  console.log(`[CLEANUP] Cleaning server: ${guild.name}`);

  // 1. Delete old test deal channels (deal-s, deal-test-client, etc.)
  for (const channel of guild.channels.cache.values()) {
    if (channel.name.startsWith('deal-') || channel.name.startsWith('inquiry-')) {
      console.log(`[CLEANUP] Deleting test room: #${channel.name}`);
      await channel.delete('Clearing test discussion rooms').catch(() => {});
    }
  }

  // 2. Clean #inquiries channel: delete all old messages and post clean header
  const leadsChannelId = process.env.DISCORD_LEADS_CHANNEL_ID;
  if (leadsChannelId) {
    const inquiriesCh = await guild.channels.fetch(leadsChannelId).catch(() => null);
    if (inquiriesCh) {
      console.log(`[CLEANUP] Purging past messages in #${inquiriesCh.name}...`);
      try {
        const msgs = await inquiriesCh.messages.fetch({ limit: 100 });
        for (const msg of msgs.values()) {
          await msg.delete().catch(() => {});
        }
        console.log(`[CLEANUP] Purged messages in #${inquiriesCh.name}`);
      } catch (e) {
        console.log(`[CLEANUP] Notice on purge:`, e.message);
      }
    }
  }

  // 3. Re-create / Fresh #admin-hub with ONLY the pinned Master Control Panel
  let adminChannel = guild.channels.cache.find(c => c.name === 'admin-hub');
  if (adminChannel) {
    console.log(`[CLEANUP] Recreating fresh #admin-hub...`);
    const parent = adminChannel.parent;
    await adminChannel.delete('Recreating fresh admin-hub').catch(() => {});

    const coAdminRole = guild.roles.cache.find(r => r.name === 'Co-Admin');
    const newAdminChannel = await guild.channels.create({
      name: 'admin-hub',
      type: ChannelType.GuildText,
      parent: parent ? parent.id : null,
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

    if (coAdminRole) {
      await newAdminChannel.permissionOverwrites.create(coAdminRole.id, {
        ViewChannel: true,
        SendMessages: true,
        EmbedLinks: true
      }).catch(() => {});
    }

    const adminPanelEmbed = new EmbedBuilder()
      .setTitle('🛡️ VELLISTO ADMIN CONTROL PANEL')
      .setColor(0xE67E22)
      .setDescription('Private dashboard for Founder & Co-Admin. Assign roles and manage your team with zero settings hassle.')
      .addFields([
        {
          name: '👑 Available Server Roles',
          value: '• **@Co-Admin**: Full administrative permissions\n• **@Support**: Customer success & project management\n• **@Client**: Access to private client CRM workspaces\n• **@Member**: Standard community member',
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

    const pMsg = await newAdminChannel.send({ embeds: [adminPanelEmbed], components: [adminPanelButtons] });
    await pMsg.pin().catch(() => {});
    console.log(`[CLEANUP] Fresh #admin-hub created and master panel pinned!`);
  }

  console.log('[CLEANUP] Server cleanup 100% complete!');
  client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_BOT_TOKEN);
