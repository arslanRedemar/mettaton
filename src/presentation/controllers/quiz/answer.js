const { SlashCommandBuilder } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('답변')
    .setDescription('오늘의 문제에 답변 제출 (1~5번)')
    .addIntegerOption((opt) =>
      opt.setName('번호').setDescription('선택한 답 번호 (1~5)').setRequired(true).setMinValue(1).setMaxValue(5)
    ),

  async execute(interaction, _repository, _schedulerService, _pointService, quizService) {
    const selectedOption = interaction.options.getInteger('번호');

    try {
      const { isNew, isCorrect } = quizService.submitAnswer(interaction.user.id, selectedOption);

      if (isNew) {
        console.log(`[quiz/answer] New answer submitted by ${interaction.user.tag} (${interaction.user.id}): option ${selectedOption}`);
        await interaction.reply({
          content: strings.quiz.answerSuccess(selectedOption),
          ephemeral: true,
        });
      } else {
        console.log(`[quiz/answer] Answer updated by ${interaction.user.tag} (${interaction.user.id}): option ${selectedOption}`);
        await interaction.reply({
          content: strings.quiz.answerUpdated(selectedOption),
          ephemeral: true,
        });
      }
    } catch (error) {
      if (error.message === 'INVALID_OPTION') {
        console.log(`[quiz/answer] Invalid option by ${interaction.user.tag}: ${selectedOption}`);
        return interaction.reply({
          content: strings.quiz.answerInvalid(),
          ephemeral: true,
        });
      }

      if (error.message === 'NO_QUIZ_TODAY') {
        console.log(`[quiz/answer] No quiz today, requested by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.quiz.answerNoQuiz(),
          ephemeral: true,
        });
      }

      if (error.message === 'ANSWER_CLOSED') {
        console.log(`[quiz/answer] Answer closed, requested by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.quiz.answerClosed(),
          ephemeral: true,
        });
      }

      console.error(`[quiz/answer] ${error.constructor.name}: Answer submission failed for ${interaction.user.tag}:`, error);
      await interaction.reply({
        content: '❌ 답변 제출 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
