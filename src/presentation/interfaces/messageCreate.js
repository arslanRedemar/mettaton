const { EmbedBuilder } = require('discord.js');
const strings = require('./strings');

module.exports = {
  name: 'messageCreate',
  async execute(message, { moonCalendarService }) {
    if (message.author.bot) return;

    if (message.content === strings.messageCreate.moonCommand) {
      const msg = await message.channel.send(strings.messageCreate.moonLoading);
      try {
        const imageBuffer = await moonCalendarService.getCalendarImage();

        const embed = new EmbedBuilder()
          .setTitle(strings.messageCreate.moonTitle)
          .setDescription(strings.messageCreate.moonDescription)
          .setColor('#FFD700')
          .setImage('attachment://moon_calendar.png')
          .setFooter({ text: strings.messageCreate.moonFooter });

        await msg.edit({
          content: null,
          embeds: [embed],
          files: [{ attachment: imageBuffer, name: 'moon_calendar.png' }],
        });
      } catch (err) {
        console.error(strings.messageCreate.moonErrorLog, err);
        await msg.edit(strings.messageCreate.moonError);
      }
    }
  },
};
