const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../../core/config');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('동기화')
    .setDescription('디스코드 서버 기준으로 DB를 동기화합니다')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, repository) {
    await interaction.deferReply({ ephemeral: true });

    console.log(`[sync] Sync started by ${interaction.user.tag}`);

    try {
      const { guild } = interaction;
      await guild.members.fetch();

      const guildMemberIds = new Set(
        guild.members.cache
          .filter((m) => !m.user.bot)
          .map((m) => m.id),
      );

      const results = {
        membersAdded: 0,
        membersRemoved: 0,
        attendeesRemoved: 0,
        lectureMessagesCleaned: 0,
        questionMessagesCleaned: 0,
      };

      // Phase 1: Member activity sync
      for (const memberId of guildMemberIds) {
        if (repository.insertMemberActivityIfMissing(memberId)) {
          results.membersAdded++;
        }
      }

      const activities = repository.getAllMemberActivities();
      for (const activity of activities) {
        if (!guildMemberIds.has(activity.user_id)) {
          repository.deleteMemberActivity(activity.user_id);
          results.membersRemoved++;
        }
      }

      // Phase 2: Lecture attendees cleanup
      const lectures = repository.getAllLectures();
      for (const lecture of lectures) {
        for (const userId of lecture.attendees) {
          if (!guildMemberIds.has(userId)) {
            repository.removeAttendee(lecture.id, userId);
            results.attendeesRemoved++;
          }
        }
      }

      // Phase 3: Message ID verification
      const scheduleChannel = guild.channels.cache.get(config.channels.schedule);
      if (scheduleChannel) {
        for (const lecture of lectures) {
          if (lecture.messageId) {
            try {
              await scheduleChannel.messages.fetch(lecture.messageId);
            } catch {
              repository.clearLectureMessageId(lecture.id);
              results.lectureMessagesCleaned++;
            }
          }
        }
      }

      const questionChannel = guild.channels.cache.get(config.channels.question);
      const questions = repository.getAllQuestions();
      if (questionChannel) {
        for (const question of questions) {
          if (question.messageId) {
            try {
              await questionChannel.messages.fetch(question.messageId);
            } catch {
              repository.clearQuestionMessageId(question.id);
              results.questionMessagesCleaned++;
            }
          }
        }
      }

      console.log(`[sync] Sync completed by ${interaction.user.tag}: added=${results.membersAdded}, removed=${results.membersRemoved}, attendees=${results.attendeesRemoved}, lectures=${results.lectureMessagesCleaned}, questions=${results.questionMessagesCleaned}`);
      await interaction.editReply({
        content: strings.sync.complete(
          results.membersAdded,
          results.membersRemoved,
          results.attendeesRemoved,
          results.lectureMessagesCleaned,
          results.questionMessagesCleaned,
        ),
      });
    } catch (error) {
      console.error(`[sync] Sync failed for ${interaction.user.tag}:`, error);
      await interaction.editReply({
        content: strings.sync.error(error.message),
      });
    }
  },
};
