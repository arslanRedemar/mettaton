const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const strings = require('../../interfaces/strings');
const PointHistoryPieChartRenderer = require('../../views/PointHistoryPieChartRenderer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('포인트내역')
    .setDescription('활동별 포인트 적립 내역 조회')
    .addStringOption((option) =>
      option
        .setName('시작일')
        .setDescription('조회 시작일 (YYYY-MM-DD)')
        .setRequired(false))
    .addStringOption((option) =>
      option
        .setName('종료일')
        .setDescription('조회 종료일 (YYYY-MM-DD)')
        .setRequired(false)),

  async execute(interaction, _repository, _schedulerService, pointAccumulationService) {
    if (!pointAccumulationService) {
      console.error('[point/history] Point system unavailable');
      return interaction.reply({
        content: '❌ 포인트 시스템을 사용할 수 없습니다.',
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;
    const userName = interaction.user.tag;
    const startDate = interaction.options.getString('시작일');
    const endDate = interaction.options.getString('종료일');

    // Validate date format if provided
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      console.log(`[point/history] Invalid start date format by ${userName}: ${startDate}`);
      return interaction.reply({
        content: '❌ 시작일 형식이 올바르지 않습니다. (YYYY-MM-DD)',
        ephemeral: true,
      });
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      console.log(`[point/history] Invalid end date format by ${userName}: ${endDate}`);
      return interaction.reply({
        content: '❌ 종료일 형식이 올바르지 않습니다. (YYYY-MM-DD)',
        ephemeral: true,
      });
    }

    // Validate date logic
    if (startDate && endDate && startDate > endDate) {
      console.log(`[point/history] Invalid date range by ${userName}: ${startDate} > ${endDate}`);
      return interaction.reply({
        content: '❌ 시작일이 종료일보다 늦습니다.',
        ephemeral: true,
      });
    }

    try {
      // Defer reply since rendering takes time
      await interaction.deferReply({ ephemeral: true });

      console.log(`[point/history] Fetching history for ${userName} (${userId}), period: ${startDate || 'all'} ~ ${endDate || 'all'}`);

      // Get point history
      const history = pointAccumulationService.getPointHistory(userId, startDate, endDate);

      if (!history || history.length === 0) {
        console.log(`[point/history] No history found for ${userName} (${userId})`);
        return interaction.editReply({
          content: strings.point.historyEmpty,
          ephemeral: true,
        });
      }

      console.log(`[point/history] Rendering pie chart for ${userName} (${history.length} activity types)`);

      // Render pie chart
      const renderer = new PointHistoryPieChartRenderer();
      const imageBuffer = await renderer.renderPieChart({
        userName,
        history,
        startDate,
        endDate,
      });

      const attachment = new AttachmentBuilder(imageBuffer, { name: 'point-history.png' });

      console.log(`[point/history] Pie chart sent to ${userName} (${userId})`);
      await interaction.editReply({
        files: [attachment],
      });
    } catch (error) {
      console.error(`[point/history] ${error.constructor.name}: Failed to generate history for ${userName} (${userId}):`, error);
      try {
        await interaction.editReply({
          content: '❌ 포인트 내역을 조회하는 중 오류가 발생했습니다.',
        });
      } catch (editError) {
        console.error(`[point/history] ${editError.constructor.name}: Failed to send error message:`, editError);
      }
    }
  },
};
