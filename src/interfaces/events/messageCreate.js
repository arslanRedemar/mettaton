const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  async execute(message, { moonCalendarService }) {
    if (message.author.bot) return;

    if (message.content === '!달위상') {
      const msg = await message.channel.send('⏳ 달력 가져오는 중...');
      try {
        const imageBuffer = await moonCalendarService.getCalendarImage();

        const embed = new EmbedBuilder()
          .setTitle('🌙 달 위상 달력')
          .setDescription('서울 기준 달력입니다.')
          .setColor('#FFD700')
          .setImage('attachment://moon_calendar.png')
          .setFooter({ text: '출처: Rhythm of Nature' });

        await msg.edit({
          content: null,
          embeds: [embed],
          files: [{ attachment: imageBuffer, name: 'moon_calendar.png' }],
        });
      } catch (err) {
        console.error('⚠️ 달력 전송 오류:', err);
        await msg.edit('⚠️ 달력 가져오기에 실패했습니다.');
      }
    }
  },
};
