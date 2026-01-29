const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../../core/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('강의삭제')
    .setDescription('강의를 삭제합니다')
    .addIntegerOption((option) => option.setName('id').setDescription('삭제할 강의 ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, repository) {
    const lectureId = interaction.options.getInteger('id');
    const lecture = repository.deleteLecture(lectureId);

    if (!lecture) {
      return interaction.reply({ content: `❌ 강의 ID ${lectureId}를 찾을 수 없습니다.`, ephemeral: true });
    }

    const channel = interaction.guild.channels.cache.get(config.channels.schedule);
    if (channel && lecture.messageId) {
      try {
        const msg = await channel.messages.fetch(lecture.messageId);
        if (msg) await msg.delete();
      } catch (err) {
        console.log('강의 메시지 삭제 실패:', err);
      }
    }

    await interaction.reply({ content: `🗑 강의 [${lecture.title}] 삭제 완료`, ephemeral: true });
  },
};
