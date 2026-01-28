const config = require('../../config');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channel = member.guild.channels.cache.get(config.greetingChannelId);
    if (!channel) return;

    channel.send(`🎉 환영합니다, <@${member.id}> 님! 서버에 오신 걸 환영해요!`);
  },
};
