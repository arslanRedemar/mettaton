const config = require('../../../core/config');
const strings = require('./strings');

module.exports = {
  name: 'messageDelete',
  async execute(message, repository) {
    if (!message.guild) return;

    if (message.channel.id === config.channels.question) {
      const deleted = repository.deleteQuestionByMessageId(message.id);
      if (deleted) {
        console.log(strings.messageDelete.questionDeleted);
      }
    }

    if (message.channel.id === config.channels.schedule) {
      const deleted = repository.deleteLectureByMessageId(message.id);
      if (deleted) {
        console.log(strings.messageDelete.scheduleDeleted);
      }
    }
  },
};
