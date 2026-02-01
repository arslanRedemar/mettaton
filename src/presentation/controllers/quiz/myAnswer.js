const { SlashCommandBuilder } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('내답변')
    .setDescription('오늘의 문제에 대한 내 답변 확인'),

  async execute(interaction, _repository, _schedulerService, _pointService, quizService) {
    try {
      const answer = quizService.getUserAnswer(interaction.user.id);

      if (!answer) {
        const history = quizService.getTodayHistory();
        if (!history) {
          console.log(`[quiz/my-answer] No quiz today, requested by ${interaction.user.tag}`);
          return interaction.reply({
            content: strings.quiz.myAnswerNoQuiz,
            ephemeral: true,
          });
        }

        console.log(`[quiz/my-answer] No answer yet for ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.quiz.myAnswerNone,
          ephemeral: true,
        });
      }

      // Format submitted time
      const submittedAt = new Date(answer.submittedAt).toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      console.log(`[quiz/my-answer] Answer retrieved for ${interaction.user.tag}: option ${answer.selectedOption}`);
      await interaction.reply({
        content: `${strings.quiz.myAnswerTitle}\n${strings.quiz.myAnswerInfo(answer.selectedOption, submittedAt)}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(`[quiz/my-answer] ${error.constructor.name}: Failed to retrieve answer for ${interaction.user.tag}:`, error);
      await interaction.reply({
        content: '❌ 답변 조회 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
