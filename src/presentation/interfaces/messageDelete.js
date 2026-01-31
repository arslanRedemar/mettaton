const config = require('../../../core/config');

module.exports = {
  name: 'messageDelete',
  async execute(message, repository) {
    if (!message.guild) return;

    if (message.channel.id === config.channels.question) {
      try {
        const deleted = repository.deleteQuestionByMessageId(message.id);
        if (deleted) {
          console.log(`[messageDelete] Question record deleted for message ${message.id}`);
        }
      } catch (error) {
        console.error(`[messageDelete] Failed to delete question record for message ${message.id}:`, error);
      }
    }

    if (message.channel.id === config.channels.schedule) {
      try {
        const deleted = repository.deleteLectureByMessageId(message.id);
        if (deleted) {
          console.log(`[messageDelete] Schedule record deleted for message ${message.id}`);
        }
      } catch (error) {
        console.error(`[messageDelete] Failed to delete schedule record for message ${message.id}:`, error);
      }
    }
  },
};
