const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퀴즈삭제')
    .setDescription('문제 ID로 문제 삭제')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption((opt) => opt.setName('문제번호').setDescription('삭제할 문제 ID').setRequired(true)),

  async execute(interaction, _repository, _schedulerService, _pointService, quizService) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: strings.quiz.noPermission(),
        ephemeral: true,
      });
    }

    const questionId = interaction.options.getInteger('문제번호');

    try {
      // Check if question exists
      const question = quizService.getQuestionById(questionId);
      if (!question) {
        console.log(`[quiz/delete] Question #${questionId} not found, requested by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.quiz.deleteNotFound(questionId),
          ephemeral: true,
        });
      }

      // Show confirmation buttons
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('quiz_delete_confirm')
          .setLabel('삭제')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('quiz_delete_cancel')
          .setLabel('취소')
          .setStyle(ButtonStyle.Secondary)
      );

      const response = await interaction.reply({
        content: strings.quiz.deleteConfirm(questionId),
        components: [row],
        ephemeral: true,
      });

      // Wait for button interaction
      try {
        const confirmation = await response.awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 30000,
        });

        if (confirmation.customId === 'quiz_delete_confirm') {
          quizService.deleteQuestion(questionId);

          console.log(`[quiz/delete] Question #${questionId} deleted by ${interaction.user.tag} (${interaction.user.id})`);
          await confirmation.update({
            content: strings.quiz.deleteSuccess(questionId),
            components: [],
          });
        } else {
          console.log(`[quiz/delete] Deletion cancelled for question #${questionId} by ${interaction.user.tag}`);
          await confirmation.update({
            content: strings.quiz.deleteCancelled(),
            components: [],
          });
        }
      } catch (error) {
        console.log(`[quiz/delete] Timeout for question #${questionId} deletion by ${interaction.user.tag}`);
        await interaction.editReply({
          content: strings.quiz.deleteCancelled(),
          components: [],
        });
      }
    } catch (error) {
      console.error(`[quiz/delete] ${error.constructor.name}: Failed to delete question #${questionId} for ${interaction.user.tag}:`, error);
      await interaction.reply({
        content: '❌ 문제 삭제 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
