const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('포인트랭킹')
    .setDescription('포인트 랭킹 조회 (관리자 전용)')
    .addIntegerOption((option) =>
      option
        .setName('인원')
        .setDescription('표시할 인원 수 (기본: 10명)')
        .setMinValue(1)
        .setMaxValue(50)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, _repository, _schedulerService, pointAccumulationService) {
    if (!pointAccumulationService) {
      return interaction.reply({
        content: '❌ 포인트 시스템을 사용할 수 없습니다.',
        ephemeral: true,
      });
    }

    const limit = interaction.options.getInteger('인원') || 10;
    const ranking = pointAccumulationService.getRanking(limit);

    if (ranking.length === 0) {
      await interaction.reply({
        content: strings.point.rankingEmpty,
        ephemeral: true,
      });
      return;
    }

    // Build ranking message
    const title = strings.point.rankingTitle;
    const items = ranking
      .map((ap, index) => strings.point.rankingItem(index + 1, ap.userId, ap.points))
      .join('\n');

    await interaction.reply({
      content: `${title}\n\n${items}`,
      ephemeral: true,
    });
  },
};
