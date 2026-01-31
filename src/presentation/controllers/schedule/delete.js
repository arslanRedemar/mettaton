const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../../core/config');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('일정삭제')
    .setDescription('일정을 삭제합니다')
    .addIntegerOption((option) => option.setName('id').setDescription('삭제할 강의 ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, repository) {
    const lectureId = interaction.options.getInteger('id');
    const lecture = repository.deleteLecture(lectureId);

    if (!lecture) {
      console.log(`[schedule/delete] Schedule #${lectureId} not found, requested by ${interaction.user.tag}`);
      return interaction.reply({ content: strings.schedule.deleteNotFound(lectureId), ephemeral: true });
    }

    const channel = interaction.guild.channels.cache.get(config.channels.schedule);
    if (channel && lecture.messageId) {
      try {
        const msg = await channel.messages.fetch(lecture.messageId);
        if (msg) await msg.delete();
      } catch (err) {
        console.error(`[schedule/delete] Failed to delete Discord message for schedule #${lectureId}:`, err);
      }
    }

    console.log(`[schedule/delete] Schedule #${lectureId} "${lecture.title}" deleted by ${interaction.user.tag}`);
    await interaction.reply({ content: strings.schedule.deleteSuccess(lecture.title), ephemeral: true });
  },
};
