const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

// Egyszerű HTTP szerver, hogy a Render ne lője le a botot
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!\n');
});
server.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const WEBHOOK_URL = process.env.GOOGLE_WEB_APP_URL;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

client.on('ready', async () => {
  console.log(`Bejelentkezve mint ${client.user.tag}!`);
  
  const syncMembers = async () => {
    try {
      const guild = await client.guilds.fetch(GUILD_ID);
      const members = await guild.members.fetch();
      
      const memberList = members.map(m => ({
        userId: m.id,
        username: m.user.username,
        displayName: m.displayName,
        bot: m.user.bot,
        joinedAt: m.joinedAt,
        avatarUrl: m.user.displayAvatarURL()
      }));

      // Itt állítottuk át POLL_SNAPSHOT-ra, hogy a Google Script naplózzon is
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: WEBHOOK_SECRET,
          action: 'POLL_SNAPSHOT', 
          members: memberList
        })
      });
      console.log(`[SZINKRON] Sikeresen elküldve ${memberList.length} tag (POLL_SNAPSHOT mód).`);
    } catch (e) {
      console.error('Szinkronizálási hiba:', e);
    }
  };

  await syncMembers();
  setInterval(syncMembers, 1000 * 60 * 60); // 1 óra
});

client.login(process.env.DISCORD_BOT_TOKEN);
