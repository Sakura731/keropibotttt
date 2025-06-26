# 🐸 Keroppi Bot

A cute Discord bot that creates personal "pond" (voice) channels for users, styled after Keroppi!  
Includes slash commands for info, help, and setup, supports customizable VC categories, shows adorable status messages, and stays alive 24/7 with a keep-alive server.

---

## Features

- **Join-to-Create VCs:** Users join a "Join to Create" VC and Keroppi creates a personal pond for them.
- **Auto-Delete Empty VCs:** Temporary VCs are deleted once empty.
- **Customizable VC Category:** Admins can choose which category Keroppi creates ponds in.
- **Slash Commands:**  
  `/keroppihelp` — Usage and help  
  `/keroppisetup <category>` — Set which category new VCs are created in (admin only)  
  `/ping` — Get a cute, mood-based latency response  
  `/about` — Learn about the bot
- **Cute Status Cycling:** Keroppi displays rotating status messages every 2 minutes.
- **Keep-Alive:** Express web server keeps the bot running 24/7 on platforms like Replit or Glitch.

---

## Setup Guide

### 1. Clone or Download

Download all the files in this repo or:

```bash
git clone https://github.com/yourusername/keroppi-bot.git
cd keroppi-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Discord Bot

- Go to the [Discord Developer Portal](https://discord.com/developers/applications)
- Click **New Application** and name it (e.g., "Keroppi Bot")
- Go to **Bot** > **Add Bot**
- Copy the **Bot Token** (you’ll use this in the next step)
- Under **Privileged Gateway Intents**, enable **Server Members Intent** (not strictly required, but useful for more features)
- Go to **OAuth2 > URL Generator**:
  - Scopes: `bot`, `applications.commands`
  - Bot Permissions: `View Channels`, `Connect`, `Move Members`, `Manage Channels`, `Send Messages`
  - Copy the URL and invite the bot to your server

### 4. Configure Environment Variables

Create a `.env` file with your bot token and your Discord server's Guild ID:

```env
BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
GUILD_ID=YOUR_DISCORD_GUILD_ID
```

### 5. Prepare Your Discord Server

- Create a voice channel named **Join to Create** (case-sensitive)
- (Optional) Create a category (e.g., "Keroppi's Ponds") for personal VCs

### 6. Start the Bot

```bash
node keroppiBot.js
```

### 7. Keep the Bot Alive (Replit/Glitch/Etc.)

- The bot runs a web server on port 3000.  
- Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your Replit/Glitch project URL every 5 minutes.

---

## Commands

| Command                   | Description                                                        |
|---------------------------|--------------------------------------------------------------------|
| `/keroppihelp`            | Show usage help and bot features                                   |
| `/keroppisetup <category>`| Admin: Set which category new ponds are created in                 |
| `/ping`                   | Cute Keroppi latency check                                         |
| `/about`                  | Info about Keroppi Bot                                             |

---

## File List

- `keroppiBot.js` — Main bot file
- `keep_alive.js` — Keep-alive Express web server
- `package.json` — NPM dependencies and scripts
- `.env` — Environment variables (not included in repo, you create this)
- `keroppi_settings.json` — (Created at runtime) Stores your server's chosen VC category

---

## Example Usage

- Join the "Join to Create" voice channel
- Keroppi creates a "🐸 Pond for [Your Name]" VC and moves you in!
- VC is auto-deleted when empty
- Use `/keroppisetup MyPondCategory` as an admin to change the pond category
- Use `/ping` or `/about` for cute bot interactions

---

## Hosting Tips

- For 24/7 uptime on platforms like Replit, **do not close your browser tab!** Use UptimeRobot to ping your web server.
- On a VPS or local server, the keep-alive server is optional but causes no harm.

---

## Credits

- Keroppi (Sanrio) character by © Sanrio Co., Ltd.
- Bot by Sakura731 (and GitHub Copilot!)

---

## License

MIT
