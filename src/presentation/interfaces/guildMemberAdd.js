const config = require('../../../core/config');
const strings = require('./strings');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channel = member.guild.channels.cache.get(config.greetingChannelId);
    if (!channel) {
      console.error(`[guildMemberAdd] Greeting channel not found (ID: ${config.greetingChannelId})`);
      return;
    }

    try {
      await channel.send(strings.guildMemberAdd.welcome(member.id));
      console.log(`[guildMemberAdd] Welcome message sent for ${member.user.tag} (${member.id})`);
    } catch (error) {
      console.error(`[guildMemberAdd] Failed to send welcome message for ${member.user.tag} (${member.id}):`, error);
    }
  },
};
