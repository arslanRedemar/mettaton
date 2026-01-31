const { EmbedBuilder } = require('discord.js');
const config = require('../../../core/config');
const strings = require('./strings');

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user, repository) {
    if (user.bot) return;
    if (reaction.emoji.name !== '✅' && reaction.emoji.name !== '❌') return;

    // Handle uncached partials
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch {
        return;
      }
    }
    if (reaction.message.partial) {
      try {
        await reaction.message.fetch();
      } catch {
        return;
      }
    }

    const { channel } = reaction.message;

    if (channel.id === config.channels.schedule) {
      const schedule = repository.getScheduleByMessageId(reaction.message.id);
      if (!schedule) return;

      if (reaction.emoji.name === '✅') {
        schedule.removeAttendee(user.id);
        repository.updateSchedule(schedule);

        const attendeeInfo = schedule.attendees.length > 0
          ? `${schedule.attendees.length}명 (${schedule.attendees.map((uid) => `<@${uid}>`).join(', ')})`
          : '0명';
        await reaction.message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(strings.schedule.embedTitle(schedule.id, schedule.title))
              .setDescription(
                strings.schedule.embedDescription(schedule.location, schedule.date, schedule.start, schedule.end, schedule.teacher, attendeeInfo),
              )
              .setColor(0x00cc66),
          ],
        });
      } else if (reaction.emoji.name === '❌') {
        schedule.addAttendee(user.id);
        repository.updateSchedule(schedule);

        const attendeeInfo = `${schedule.attendees.length}명 (${schedule.attendees.map((uid) => `<@${uid}>`).join(', ')})`;
        await reaction.message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(strings.schedule.embedTitle(schedule.id, schedule.title))
              .setDescription(
                strings.schedule.embedDescription(schedule.location, schedule.date, schedule.start, schedule.end, schedule.teacher, attendeeInfo),
              )
              .setColor(0x00cc66),
          ],
        });
      }
    } else if (channel.id === config.channels.question) {
      const question = repository.getQuestionByMessageId(reaction.message.id);
      if (!question) return;

      question.removeAttendee(user.id);
      repository.updateQuestion(question);

      const attendeeInfo = question.attendees.length > 0
        ? `${question.attendees.length}명 (${question.attendees.map((uid) => `<@${uid}>`).join(', ')})`
        : '0명';
      const description = question.isAnswered()
        ? strings.question.embedDescriptionAnswered(question.question, question.author, question.answer, question.answeredBy, attendeeInfo)
        : strings.question.embedDescription(question.question, question.author, attendeeInfo);
      await reaction.message.edit({
        content: '',
        embeds: [
          new EmbedBuilder()
            .setTitle(strings.question.embedTitle(question.id))
            .setDescription(description)
            .setColor(question.isAnswered() ? 0x00cc66 : 0xffaa00),
        ],
      });
    }
  },
};
