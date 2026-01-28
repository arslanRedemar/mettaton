const config = require('../../config');

module.exports = {
  name: 'messageDelete',
  async execute(message, repository) {
    if (!message.guild) return;

    if (message.channel.name === config.channels.question) {
      const deleted = repository.deleteQuestionByMessageId(message.id);
      if (deleted) {
        console.log(`질문이 관리자에 의해 삭제됨.`);
      }
    }

    if (message.channel.name === config.channels.schedule) {
      const deleted = repository.deleteLectureByMessageId(message.id);
      if (deleted) {
        console.log(`강의가 관리자에 의해 삭제됨.`);
      }
    }
  },
};
