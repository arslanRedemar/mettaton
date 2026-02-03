const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../../core/config');
const strings = require('../../interfaces/strings');

/**
 * Schedule Delete Command
 * Admin-only command to delete a schedule by ID
 * Removes the schedule from database and deletes the Discord message
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName('일정삭제')
    .setDescription('일정을 삭제합니다')
    .addIntegerOption((option) => option.setName('id').setDescription('삭제할 일정 ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * Execute schedule deletion
   * @param {CommandInteraction} interaction - Discord interaction
   * @param {SqliteRepository} repository - Repository instance
   */
  async execute(interaction, repository) {
    const scheduleId = interaction.options.getInteger('id');
    const schedule = repository.deleteSchedule(scheduleId);

    if (!schedule) {
      console.log(`[schedule/delete] Schedule #${scheduleId} not found, requested by ${interaction.user.tag} (${interaction.user.id})`);
      try {
        return interaction.reply({ content: strings.schedule.deleteNotFound(scheduleId), ephemeral: true });
      } catch (error) {
        console.error(`[schedule/delete] ${error.constructor.name}: Failed to send not found reply:`, error);
        return;
      }
    }

    const channel = interaction.guild.channels.cache.get(config.channels.schedule);
    if (channel && schedule.messageId) {
      try {
        const msg = await channel.messages.fetch(schedule.messageId);
        if (msg) {
          await msg.delete();
          console.log(`[schedule/delete] Discord message ${schedule.messageId} deleted for schedule #${scheduleId}`);
        }
      } catch (error) {
        console.error(`[schedule/delete] ${error.constructor.name}: Failed to delete Discord message ${schedule.messageId} for schedule #${scheduleId}:`, error);
      }
    } else if (!channel) {
      console.error(`[schedule/delete] ChannelNotFoundError: Schedule channel not found (ID: ${config.channels.schedule})`);
    }

    console.log(`[schedule/delete] Schedule #${scheduleId} "${schedule.title}" deleted by ${interaction.user.tag} (${interaction.user.id})`);

    try {
      await interaction.reply({ content: strings.schedule.deleteSuccess(schedule.title), ephemeral: true });
    } catch (error) {
      console.error(`[schedule/delete] ${error.constructor.name}: Failed to send success reply:`, error);
    }
  },
};
