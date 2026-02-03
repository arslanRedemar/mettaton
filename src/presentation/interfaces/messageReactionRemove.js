const { EmbedBuilder } = require('discord.js');
const config = require('../../../core/config');
const strings = require('./strings');

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user, repository) {
    if (user.bot) return;
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
          schedule.removeAttendee(user.id);
          repository.updateSchedule(schedule);

          const attendeeInfo = schedule.attendees.length > 0
            ? `${schedule.attendees.length}명 (${schedule.attendees.map((uid) => `<@${uid}>`).join(', ')})`
            : '0명';
          try {
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
          } catch (editError) {
            console.error(`[messageReactionRemove] ${editError.constructor.name}: Failed to edit schedule message #${schedule.id}:`, editError);
          }
          console.log(`[messageReactionRemove] Schedule #${schedule.id} attendee removed: ${user.tag} (${user.id})`);
        } else if (reaction.emoji.name === '❌') {
          schedule.addAttendee(user.id);
          repository.updateSchedule(schedule);

          const attendeeInfo = `${schedule.attendees.length}명 (${schedule.attendees.map((uid) => `<@${uid}>`).join(', ')})`;
          try {
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
          } catch (editError) {
            console.error(`[messageReactionRemove] ${editError.constructor.name}: Failed to edit schedule message #${schedule.id}:`, editError);
          }
          console.log(`[messageReactionRemove] Schedule #${schedule.id} ❌ reaction removed, attendee re-added: ${user.tag} (${user.id})`);
        }
      } catch (error) {
        console.error(`[messageReactionRemove] ${error.constructor.name}: Schedule #${schedule.id} reaction handling failed for ${user.tag} (${user.id}):`, error);
      }
    } else if (channel.id === config.channels.question) {
      const question = repository.getQuestionByMessageId(reaction.message.id);
      if (!question) return;

      try {
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
        console.log(`[messageReactionRemove] Question #${question.id} attendee removed: ${user.tag} (${user.id})`);
      } catch (error) {
        console.error(`[messageReactionRemove] Question #${question.id} reaction handling failed for ${user.tag} (${user.id}):`, error);
      }
    }

    // Handle personal practice check-in removal
    if (reaction.emoji.name === '✅') {
      const practice = repository.getPersonalPracticePlanByMessageId(reaction.message.id);
      if (!practice) return;

      // Only the plan owner can uncheck
      if (practice.userId !== user.id) {
        console.log(`[messageReactionRemove] Personal practice uncheck denied: non-owner ${user.tag} tried to uncheck plan #${practice.id}`);
        return;
      }

      // Ignore if plan has ended
      if (practice.hasEnded()) {
        console.log(`[messageReactionRemove] Personal practice uncheck denied: plan #${practice.id} has ended`);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];

        // Remove check record
        const removed = repository.removePersonalPracticeRecord(practice.id, today);

        if (removed) {
          // Update embed with new progress
          const checkDates = repository.getPersonalPracticeRecords(practice.id);
          const completedCount = checkDates.length;
          const totalDays = practice.getTotalDays();
          const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

          await reaction.message.edit({
            embeds: [
              new EmbedBuilder()
                .setTitle(strings.personalPractice.embedTitle)
                .setDescription(
                  strings.personalPractice.embedDescription(
                    `<@${practice.userId}>`,
                    practice.content,
                    practice.dailyGoal,
                    practice.unit,
                    practice.startDate,
                    practice.endDate,
                    completedCount,
                    totalDays,
                    percentage
                  )
                )
                .setColor(0x4CAF50)
                .setFooter({ text: strings.personalPractice.embedFooter }),
            ],
          });
          console.log(`[messageReactionRemove] Personal practice #${practice.id} unchecked by ${user.tag} (${user.id}) for ${today}`);
        }
      } catch (error) {
        console.error(`[messageReactionRemove] ${error.constructor.name}: Personal practice #${practice.id} uncheck failed for ${user.tag} (${user.id}):`, error);
      }
    }
  },
};
