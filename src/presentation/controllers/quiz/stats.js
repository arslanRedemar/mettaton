const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퀴즈통계')
    .setDescription('문제별 정답률 및 참여 통계 조회')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, _repository, _schedulerService, _pointService, quizService) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: strings.quiz.noPermission(),
        ephemeral: true,
      });
    }

    try {
      const statistics = quizService.getQuizStatistics();

      if (statistics.length === 0) {
        console.log(`[quiz/stats] No published questions, requested by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.quiz.statsEmpty(),
          ephemeral: true,
        });
      }

      // Build stats text
      const lines = [strings.quiz.statsTitle(), ''];
      statistics.forEach(({ question, participants, correctRate }) => {
        lines.push(strings.quiz.statsItem(question.id, question.category, participants, correctRate));
      });

      console.log(`[quiz/stats] Statistics requested by ${interaction.user.tag} (${statistics.length} questions)`);
      await interaction.reply({
        content: lines.join('\n'),
        ephemeral: true,
      });
    } catch (error) {
      console.error(`[quiz/stats] ${error.constructor.name}: Failed to retrieve stats for ${interaction.user.tag}:`, error);
      await interaction.reply({
        content: '❌ 통계 조회 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
