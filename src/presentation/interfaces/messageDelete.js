const config = require('../../../core/config');

/**
 * Message Delete Event Handler
 * Automatically cleans up database records when Discord messages are deleted
 * Handles schedule and question message deletions
 */
module.exports = {
  name: 'messageDelete',
  /**
   * Execute message delete cleanup
   * @param {Message} message - Deleted Discord message
   * @param {SqliteRepository} repository - Repository instance
   */
  async execute(message, repository) {
    if (!message.guild) return;

    if (message.channel.id === config.channels.question) {
      try {
        const deleted = repository.deleteQuestionByMessageId(message.id);
        if (deleted) {
          console.log(`[messageDelete] Question record deleted for message ${message.id}`);
        }
      } catch (error) {
        console.error(`[messageDelete] ${error.constructor.name}: Failed to delete question record for message ${message.id}:`, error);
      }
    }

    if (message.channel.id === config.channels.schedule) {
      try {
        const deleted = repository.deleteScheduleByMessageId(message.id);
        if (deleted) {
          console.log(`[messageDelete] Schedule record deleted for message ${message.id}`);
        }
      } catch (error) {
        console.error(`[messageDelete] ${error.constructor.name}: Failed to delete schedule record for message ${message.id}:`, error);
      }
    }
  },
};
