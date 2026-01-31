const { SlashCommandBuilder } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('포인트')
    .setDescription('내 활동 포인트 확인'),

  async execute(interaction, _repository, _schedulerService, pointAccumulationService) {
    if (!pointAccumulationService) {
      console.error('[point/myPoints] Point system unavailable');
      return interaction.reply({
        content: '❌ 포인트 시스템을 사용할 수 없습니다.',
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;
    const points = pointAccumulationService.getUserPoints(userId);

    const message = points > 0
      ? strings.point.myPoints(points)
      : strings.point.noPoints;

    console.log(`[point/myPoints] User ${interaction.user.tag} (${userId}) queried points: ${points}`);
    await interaction.reply({
      content: message,
      ephemeral: true,
    });
  },
};
