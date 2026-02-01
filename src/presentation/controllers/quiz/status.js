const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퀴즈현황')
    .setDescription('현재 출제 현황 (총 문제 수, 미출제 수, 오늘의 문제 등)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, _repository, _schedulerService, _pointService, quizService) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: strings.quiz.noPermission(),
        ephemeral: true,
      });
    }

    try {
      const status = quizService.getQuizStatus();

      // Build status text
      const lines = [
        strings.quiz.statusTitle(),
        strings.quiz.statusInfo(
          status.total,
          status.remaining,
          status.published,
          status.quizTime,
          status.explanationTime,
          status.channelId || '미설정'
        ),
        '',
      ];

      if (status.todayQuestion) {
        lines.push(strings.quiz.statusToday(status.todayQuestion.id, status.todayQuestion.category));
      } else {
        lines.push(strings.quiz.statusNoToday());
      }

      console.log(`[quiz/status] Status requested by ${interaction.user.tag}`);
      await interaction.reply({
        content: lines.join('\n'),
        ephemeral: true,
      });
    } catch (error) {
      console.error(`[quiz/status] ${error.constructor.name}: Failed to retrieve status for ${interaction.user.tag}:`, error);
      await interaction.reply({
        content: '❌ 현황 조회 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
