const { EmbedBuilder, ChannelType } = require('discord.js');
const ActivityType = require('../../../core/types/ActivityType');
const strings = require('./strings');

module.exports = {
  name: 'messageCreate',
  async execute(message, { moonCalendarService, repository, pointAccumulationService }) {
    if (message.author.bot) return;

    // Member activity tracking
    if (repository && message.guild) {
      try {
        repository.updateMemberActivity(message.author.id);
      } catch (error) {
        console.error(`[messageCreate] Activity tracking failed for ${message.author.tag} (${message.author.id}):`, error);
      }
    }

    // Point accumulation (automatic, no notification)
    if (pointAccumulationService && message.guild) {
      try {
        let activityType = ActivityType.GENERAL;

        // Forum post detection: thread in a GuildForum channel
        if (
          message.channel.type === ChannelType.PublicThread
          && message.channel.parent
          && message.channel.parent.type === ChannelType.GuildForum
        ) {
          activityType = ActivityType.FORUM_POST;
        }

        const result = pointAccumulationService.tryAccumulate(message.author.id, activityType);
        if (result) {
          console.log(`[messageCreate] Points accumulated for ${message.author.tag} (${message.author.id}): +${result.pointsAdded} (${result.activityType}) -> ${result.newPoints}`);
        }
      } catch (error) {
        console.error(`[messageCreate] Point accumulation failed for ${message.author.tag} (${message.author.id}):`, error);
      }
    }

    if (message.content === strings.messageCreate.moonCommand) {
      console.log(`[messageCreate] Moon calendar requested by ${message.author.tag} (${message.author.id})`);
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
        console.log(`[messageCreate] Moon calendar sent successfully for ${message.author.tag}`);
      } catch (err) {
        console.error(`[messageCreate] Moon calendar failed for ${message.author.tag}:`, err);
        await msg.edit(strings.messageCreate.moonError);
      }
    }
  },
};
