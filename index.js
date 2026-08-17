const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const WEBHOOK_URL = process.env.GOOGLE_WEB_APP_URL;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

client.on('ready', async () => {
  console.log(`Bejelentkezve mint ${client.user.tag}!`);
  
  // Automatikus szinkronizálás indításkor és óránként
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

      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: WEBHOOK_SECRET,
          action: 'SYNC_MEMBERS',
          members: memberList
        })
      });
      console.log(`[SZINKRON] Sikeresen elküldve ${memberList.length} tag.`);
    } catch (e) {
      console.error('Szinkronizálási hiba:', e);
    }
  };

  await syncMembers();
  setInterval(syncMembers, 1000 * 60 * 60); // 1 óra
});

client.login(process.env.DISCORD_BOT_TOKEN);
