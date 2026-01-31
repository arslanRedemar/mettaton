const { EmbedBuilder } = require('discord.js');
const config = require('../../../core/config');
const strings = require('./strings');

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user, repository, pointAccumulationService) {
    if (user.bot) return;

    // Point accumulation for reactions (automatic, no notification)
    if (pointAccumulationService && reaction.message.guild) {
      try {
        const result = pointAccumulationService.tryAccumulate(user.id);
        if (result) {
          console.log(`[messageReactionAdd] Points accumulated for ${user.tag} (${user.id}): +${result.pointsAdded} -> ${result.newPoints}`);
        }
      } catch (error) {
        console.error(`[messageReactionAdd] Point accumulation failed for ${user.tag} (${user.id}):`, error);
      }
    }

    if (reaction.emoji.name !== '✅' && reaction.emoji.name !== '❌') return;

    // Fetch uncached partials (best-effort, continue with available data)
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch {
        // emoji.name and message.id are available without fetch
      }
    }
    if (reaction.message.partial) {
      try {
        await reaction.message.fetch();
      } catch {
        // message.id and channel are available without fetch
      }
    }

    const { channel } = reaction.message;
    if (!channel) return;

    if (channel.id === config.channels.schedule) {
      const schedule = repository.getScheduleByMessageId(reaction.message.id);
      if (!schedule) return;

      try {
        if (reaction.emoji.name === '✅') {
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
          console.log(`[messageReactionAdd] Schedule #${schedule.id} attendee added: ${user.tag} (${user.id})`);
        } else if (reaction.emoji.name === '❌') {
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
          console.log(`[messageReactionAdd] Schedule #${schedule.id} attendee removed via ❌: ${user.tag} (${user.id})`);
        }
      } catch (error) {
        console.error(`[messageReactionAdd] Schedule #${schedule.id} reaction handling failed for ${user.tag} (${user.id}):`, error);
      }
    } else if (channel.id === config.channels.question) {
      const question = repository.getQuestionByMessageId(reaction.message.id);
      if (!question) return;

      try {
        question.addAttendee(user.id);
        repository.updateQuestion(question);

        const attendeeInfo = `${question.attendees.length}명 (${question.attendees.map((uid) => `<@${uid}>`).join(', ')})`;
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
        console.log(`[messageReactionAdd] Question #${question.id} attendee added: ${user.tag} (${user.id})`);
      } catch (error) {
        console.error(`[messageReactionAdd] Question #${question.id} reaction handling failed for ${user.tag} (${user.id}):`, error);
      }
    }
  },
};
