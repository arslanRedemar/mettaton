const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../../core/config');
const strings = require('../../interfaces/strings');
const { SyncService } = require('../../../domain/usecases');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('동기화')
    .setDescription('디스코드 서버 기준으로 DB를 동기화합니다')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, repository) {
    await interaction.deferReply({ ephemeral: true });

    console.log(`[sync] Sync started by ${interaction.user.tag} (${interaction.user.id})`);

    try {
      const { guild } = interaction;

      // Fetch all guild members
      await guild.members.fetch();

      // Extract non-bot member IDs
      const guildMemberIds = new Set(
        guild.members.cache
          .filter((m) => !m.user.bot)
          .map((m) => m.id),
      );

      // Prepare channels for sync
      const scheduleChannel = guild.channels.cache.get(config.channels.schedule);
      const questionChannel = guild.channels.cache.get(config.channels.question);
      const practiceChannel = guild.channels.cache.get(config.channels.practice);

      // Get quiz channel from config
      let quizChannel = null;
      try {
        const quizConfigStmt = repository.db.prepare('SELECT quiz_channel_id FROM quiz_config WHERE id = 1');
        const quizConfig = quizConfigStmt.get();
        if (quizConfig?.quiz_channel_id) {
          quizChannel = guild.channels.cache.get(quizConfig.quiz_channel_id);
        }
      } catch (error) {
        console.log(`[sync] Warning: Could not fetch quiz channel config:`, error.message);
      }

      const channels = {
        schedule: scheduleChannel,
        question: questionChannel,
        practice: practiceChannel,
        quiz: quizChannel,
      };

      // Execute sync using SyncService
      const syncService = new SyncService(repository);
      const results = await syncService.executeFullSync({
        guildMemberIds,
        channels,
      });

      console.log(`[sync] Sync completed by ${interaction.user.tag} (${interaction.user.id}): ${results.toLogString()}`);

      await interaction.editReply({
        content: strings.sync.complete(
          results.membersAdded,
          results.membersRemoved,
          results.lectureAttendeesRemoved,
          results.questionAttendeesRemoved,
          results.lectureMessagesCleaned,
          results.questionMessagesCleaned,
          results.practiceMessagesCleaned,
          results.quizMessagesCleaned,
          results.pointsRemoved,
          results.accumulationLogsRemoved,
          results.practicesRemoved,
          results.practiceRecordsRemoved,
          results.quizHistoryCleaned,
        ),
      });
    } catch (error) {
      console.error(`[sync] ${error.constructor.name}: Sync failed for ${interaction.user.tag} (${interaction.user.id}):`, error);
      await interaction.editReply({
        content: strings.sync.error(error.message),
      });
    }
  },
};
