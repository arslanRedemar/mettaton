const config = require('../../../core/config');
const strings = require('./strings');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channel = member.guild.channels.cache.get(config.greetingChannelId);
    if (!channel) return;

    channel.send(strings.guildMemberAdd.welcome(member.id));
  },
};
