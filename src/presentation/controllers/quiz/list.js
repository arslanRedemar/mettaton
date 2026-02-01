const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퀴즈목록')
    .setDescription('등록된 문제 목록 조회 (ID, 카테고리, 출제 여부)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, _repository, _schedulerService, _pointService, quizService) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: strings.quiz.noPermission(),
        ephemeral: true,
      });
    }

    try {
      const allQuestions = quizService.getAllQuestions();

      if (allQuestions.length === 0) {
        console.log(`[quiz/list] No questions found, requested by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.quiz.listEmpty(),
          ephemeral: true,
        });
      }

      // Build list text
      const lines = [strings.quiz.listTitle(allQuestions.length), ''];
      allQuestions.forEach(({ question, isPublished }) => {
        const status = isPublished ? strings.quiz.listStatusPublished() : strings.quiz.listStatusPending();
        lines.push(strings.quiz.listItem(question.id, question.category, question.getPreview(), status));
      });

      console.log(`[quiz/list] Question list requested by ${interaction.user.tag} (total: ${allQuestions.length})`);
      await interaction.reply({
        content: lines.join('\n'),
        ephemeral: true,
      });
    } catch (error) {
      console.error(`[quiz/list] ${error.constructor.name}: Failed to list questions for ${interaction.user.tag}:`, error);
      await interaction.reply({
        content: '❌ 목록 조회 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
