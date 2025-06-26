require('./keep_alive.js'); // Keep-alive web server

const { 
  Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, ChannelType, ActivityType, PermissionsBitField, PermissionFlagsBits, EmbedBuilder 
} = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel]
});

const SETTINGS_FILE = "keroppi_settings.json";
let settings = {};
if (fs.existsSync(SETTINGS_FILE)) {
  try {
    settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
  } catch { settings = {}; }
}

function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

const TEMP_VC_PREFIX = "🐸 Pond for";

// Keroppi-themed statuses
const statuses = [
  { type: ActivityType.Playing, text: "in the lily pond 🐸" },
  { type: ActivityType.Listening, text: "to happy croaks!" },
  { type: ActivityType.Watching, text: "the clouds float by..." },
  { type: ActivityType.Playing, text: "with friends in Donut Pond!" },
];
let statusIndex = 0;

const tempVCs = new Set();

function updateStatus() {
  const s = statuses[statusIndex % statuses.length];
  client.user.setActivity(s.text, { type: s.type });
  statusIndex++;
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag} as Keroppi!`);
  updateStatus();
  setInterval(updateStatus, 2 * 60 * 1000);

  // Register slash commands (guild-specific for instant update)
  const commands = [
    new SlashCommandBuilder()
      .setName('keroppihelp')
      .setDescription("Show Keroppi's helpful command guide 🐸"),
    new SlashCommandBuilder()
      .setName('keroppisetup')
      .setDescription("Set which category Keroppi puts new ponds in")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addStringOption(option =>
        option.setName('category')
          .setDescription('The category name for Keroppi’s ponds')
          .setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName('keroppisettrigger')
      .setDescription("Set the voice channel Keroppi listens to for pond creation")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addChannelOption(option =>
        option.setName('voice_channel')
          .setDescription('The voice channel to use as the trigger')
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName('ping')
      .setDescription("Keroppi checks how fast he can croak to you!"),
    new SlashCommandBuilder()
      .setName('about')
      .setDescription("Learn about Keroppi Bot!"),
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  const guildId = process.env.GUILD_ID;

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, guildId),
      { body: commands }
    );
    console.log("Slash commands registered!");
  } catch (error) {
    console.error(error);
  }
});

// Slash command handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const guildId = interaction.guildId;

  // /keroppihelp
  if (interaction.commandName === 'keroppihelp') {
    const trigger = settings[guildId]?.triggerChannelId;
    const triggerChannel = trigger ? `<#${trigger}>` : "*(not set)*";
    await interaction.reply({
      content: "🐸 **Keroppi Bot Help!**\n" +
        `Join the configured voice channel ${triggerChannel} and Keroppi will make a new pond just for you!\n` +
        "Ponds are auto-deleted when empty.\n" +
        "`/keroppisetup <category>` — Choose which category Keroppi puts new ponds in (admin only)\n" +
        "`/keroppisettrigger <voice_channel>` — Choose which voice channel is the trigger for pond creation (admin only)\n" +
        "`/ping` — Check how fast Keroppi croaks!\n" +
        "`/about` — Learn about Keroppi Bot!\n" +
        "`/keroppihelp` — Show this help message.",
      ephemeral: true
    });
  }

  // /keroppisetup
  if (interaction.commandName === 'keroppisetup') {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "Only admins can set the Keroppi pond category!", ephemeral: true });
    }
    const categoryName = interaction.options.getString('category');
    const category = interaction.guild.channels.cache.find(
      ch => ch.type === ChannelType.GuildCategory && ch.name === categoryName
    );
    if (!category) {
      return interaction.reply({ content: `No category named "${categoryName}" found! Please create it first.`, ephemeral: true });
    }
    if (!settings[guildId]) settings[guildId] = {};
    settings[guildId].categoryId = category.id;
    saveSettings();
    await interaction.reply({ content: `Keroppi will now put new ponds in "${categoryName}"! 🐸`, ephemeral: true });
  }

  // /keroppisettrigger
  if (interaction.commandName === 'keroppisettrigger') {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "Only admins can set the Keroppi trigger channel!", ephemeral: true });
    }
    const channel = interaction.options.getChannel('voice_channel');
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      return interaction.reply({ content: "Please select a valid voice channel.", ephemeral: true });
    }
    if (!settings[guildId]) settings[guildId] = {};
    settings[guildId].triggerChannelId = channel.id;
    saveSettings();
    await interaction.reply({ content: `Keroppi will now watch <#${channel.id}> for new pond friends! 🐸`, ephemeral: true });
  }

  // /ping
  if (interaction.commandName === 'ping') {
    const sent = await interaction.reply({ content: "🐸 Croaking...", fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    let mood, emoji, color;
    if (latency < 100) {
      mood = "Yay! I'm as quick as a happy frog!";
      emoji = "🌈";
      color = 0x6ee87a; // light green
    } else if (latency < 250) {
      mood = "Ribbit! I had to hop a little, but I'm still fast!";
      emoji = "🍃";
      color = 0xffe066; // yellow
    } else {
      mood = "Phew... Even frogs get tired sometimes 💤";
      emoji = "😴";
      color = 0x7ec6f8; // blue
    }

    const embed = new EmbedBuilder()
      .setTitle("Keroppi Ping!")
      .setDescription(`${emoji} **${mood}**\n\n> Message latency: **${latency}ms**\n> API latency: **${apiLatency}ms**`)
      .setColor(color)
      .setThumbnail(client.user.displayAvatarURL());

    await interaction.editReply({ content: "", embeds: [embed] });
  }

  // /about
  if (interaction.commandName === 'about') {
    const embed = new EmbedBuilder()
      .setTitle("About Keroppi Bot 🐸")
      .setDescription(
        "Hi! I'm **Keroppi Bot** — your friendly, froggy voice channel assistant!\n\n" +
        "• I create a private pond (voice channel) for you when you hop into my special VC.\n" +
        "• My pond is always cheerful and tidy — I clean up after myself when you're done!\n" +
        "• I love croaking cute messages and helping make your server fun!\n\n" +
        "_Made with love and lily pads._"
      )
      .setColor(0x6ee87a)
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({text: "Ribbit! Thanks for using Keroppi Bot!", iconURL: client.user.displayAvatarURL()});
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// Voice state update handler
client.on('voiceStateUpdate', async (oldState, newState) => {
  // Only care about joins, not leaves
  if (!oldState.channel && newState.channel) {
    const guild = newState.guild;
    const guildId = guild.id;
    const triggerChannelId = settings[guildId]?.triggerChannelId;
    if (!triggerChannelId) return;

    // Is this the configured trigger channel?
    if (newState.channel.id === triggerChannelId) {
      const member = newState.member;

      // Optional: Find configured category
      let category = null;
      if (settings[guildId] && settings[guildId].categoryId) {
        category = guild.channels.cache.get(settings[guildId].categoryId);
      }

      // Create the new VC
      const vcName = `${TEMP_VC_PREFIX} ${member.displayName}`;
      try {
        const newVC = await guild.channels.create({
          name: vcName,
          type: ChannelType.GuildVoice,
          parent: category?.id,
          permissionOverwrites: [
            {
              id: guild.id,
              allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
            },
          ],
          reason: "Keroppi made a pond for a new friend!",
        });
        tempVCs.add(newVC.id);

        // Move the user
        await member.voice.setChannel(newVC);
      } catch (err) {
        console.error("Error creating Keroppi pond:", err);
      }
    }
  }

  // Clean up temp VCs when empty
  if (oldState.channel && tempVCs.has(oldState.channel.id)) {
    const channel = oldState.channel;
    if (channel.members.size === 0) {
      try {
        tempVCs.delete(channel.id);
        await channel.delete("Keroppi cleaned up an empty pond!");
      } catch (err) {
        // Already deleted or no perms
      }
    }
  }
});

client.login(process.env.BOT_TOKEN);