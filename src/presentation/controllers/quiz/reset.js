const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퀴즈초기화')
    .setDescription('출제 이력 초기화 (문제 데이터는 유지)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, _repository, _schedulerService, _pointService, quizService) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: strings.quiz.noPermission(),
        ephemeral: true,
      });
    }

    try {
      // Show confirmation buttons
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('quiz_reset_confirm')
          .setLabel('초기화')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('quiz_reset_cancel')
          .setLabel('취소')
          .setStyle(ButtonStyle.Secondary)
      );

      const response = await interaction.reply({
        content: strings.quiz.resetConfirm(),
        components: [row],
        ephemeral: true,
      });

      // Wait for button interaction
      try {
        const confirmation = await response.awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 30000,
        });

        if (confirmation.customId === 'quiz_reset_confirm') {
          const count = quizService.resetPublishHistory();

          console.log(`[quiz/reset] Publish history reset by ${interaction.user.tag} (${interaction.user.id}): ${count} records`);
          await confirmation.update({
            content: strings.quiz.resetSuccess(count),
            components: [],
          });
        } else {
          console.log(`[quiz/reset] Reset cancelled by ${interaction.user.tag}`);
          await confirmation.update({
            content: strings.quiz.resetCancelled(),
            components: [],
          });
        }
      } catch (error) {
        console.log(`[quiz/reset] Timeout for reset by ${interaction.user.tag}`);
        await interaction.editReply({
          content: strings.quiz.resetTimeout(),
          components: [],
        });
      }
    } catch (error) {
      console.error(`[quiz/reset] ${error.constructor.name}: Failed to reset publish history for ${interaction.user.tag}:`, error);
      await interaction.reply({
        content: '❌ 초기화 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
