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
        lectureAttendeesRemoved: 0,
        questionAttendeesRemoved: 0,
        lectureMessagesCleaned: 0,
        questionMessagesCleaned: 0,
        practiceMessagesCleaned: 0,
        quizMessagesCleaned: 0,
        pointsRemoved: 0,
        accumulationLogsRemoved: 0,
        practicesRemoved: 0,
        practiceRecordsRemoved: 0,
        quizHistoryCleaned: 0,
      };

      // Phase 1: Member activity sync
      console.log('[sync/phase1] Starting member activity sync');
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
      console.log(`[sync/phase1] Completed: added=${results.membersAdded}, removed=${results.membersRemoved}`);

      // Phase 2: Attendees cleanup (lecture + question)
      console.log('[sync/phase2] Starting attendees cleanup');
      const lectures = repository.getAllLectures();
      for (const lecture of lectures) {
        for (const userId of lecture.attendees) {
          if (!guildMemberIds.has(userId)) {
            repository.removeAttendee(lecture.id, userId);
            results.lectureAttendeesRemoved++;
          }
        }
      }

      const questions = repository.getAllQuestions();
      for (const question of questions) {
        for (const userId of question.attendees) {
          if (!guildMemberIds.has(userId)) {
            repository.removeQuestionAttendee(question.id, userId);
            results.questionAttendeesRemoved++;
          }
        }
      }
      console.log(`[sync/phase2] Completed: lectureAttendees=${results.lectureAttendeesRemoved}, questionAttendees=${results.questionAttendeesRemoved}`);

      // Phase 3: Message ID verification (lecture, question, practice, quiz)
      console.log('[sync/phase3] Starting message ID verification');

      const scheduleChannel = guild.channels.cache.get(config.channels.schedule);
      if (scheduleChannel) {
        for (const lecture of lectures) {
          if (lecture.messageId) {
            try {
              await scheduleChannel.messages.fetch(lecture.messageId);
            } catch (error) {
              console.log(`[sync/phase3] DiscordAPIError: Lecture message #${lecture.messageId} not found, clearing`);
              repository.clearLectureMessageId(lecture.id);
              results.lectureMessagesCleaned++;
            }
          }
        }
      }

      const questionChannel = guild.channels.cache.get(config.channels.question);
      if (questionChannel) {
        for (const question of questions) {
          if (question.messageId) {
            try {
              await questionChannel.messages.fetch(question.messageId);
            } catch (error) {
              console.log(`[sync/phase3] DiscordAPIError: Question message #${question.messageId} not found, clearing`);
              repository.clearQuestionMessageId(question.id);
              results.questionMessagesCleaned++;
            }
          }
        }
      }

      const practiceChannel = guild.channels.cache.get(config.channels.practice);
      const practicePlans = repository.getAllPersonalPracticePlans();
      if (practiceChannel) {
        for (const plan of practicePlans) {
          if (plan.messageId) {
            try {
              await practiceChannel.messages.fetch(plan.messageId);
            } catch (error) {
              console.log(`[sync/phase3] DiscordAPIError: Practice plan message #${plan.messageId} not found, clearing`);
              repository.clearPracticePlanMessageId(plan.id);
              results.practiceMessagesCleaned++;
            }
          }
        }
      }

      const quizHistory = repository.getAllQuizPublishHistory();
      if (quizHistory && quizHistory.length > 0) {
        const quizConfigStmt = repository.db.prepare('SELECT quiz_channel_id FROM quiz_config WHERE id = 1');
        const quizConfig = quizConfigStmt.get();
        const quizChannel = quizConfig?.quiz_channel_id
          ? guild.channels.cache.get(quizConfig.quiz_channel_id)
          : null;

        if (quizChannel) {
          for (const history of quizHistory) {
            if (history.message_id) {
              try {
                await quizChannel.messages.fetch(history.message_id);
              } catch (error) {
                console.log(`[sync/phase3] DiscordAPIError: Quiz message #${history.message_id} not found, clearing`);
                repository.clearQuizPublishHistoryMessageId(history.id);
                results.quizMessagesCleaned++;
              }
            }
          }
        }
      }
      console.log(`[sync/phase3] Completed: lectures=${results.lectureMessagesCleaned}, questions=${results.questionMessagesCleaned}, practice=${results.practiceMessagesCleaned}, quiz=${results.quizMessagesCleaned}`);

      // Phase 4: Activity points cleanup
      console.log('[sync/phase4] Starting activity points cleanup');
      const allActivityPoints = repository.getAllActivityPoints();
      for (const activityPoint of allActivityPoints) {
        if (!guildMemberIds.has(activityPoint.user_id)) {
          results.pointsRemoved += repository.deleteActivityPointsByUserId(activityPoint.user_id);
          results.accumulationLogsRemoved += repository.deleteAccumulationLogsByUserId(activityPoint.user_id);
        }
      }
      console.log(`[sync/phase4] Completed: points=${results.pointsRemoved}, logs=${results.accumulationLogsRemoved}`);

      // Phase 5: Personal practice cleanup
      console.log('[sync/phase5] Starting personal practice cleanup');
      for (const plan of practicePlans) {
        if (!guildMemberIds.has(plan.userId)) {
          if (plan.messageId && practiceChannel) {
            try {
              const message = await practiceChannel.messages.fetch(plan.messageId);
              await message.delete();
              console.log(`[sync/phase5] Deleted orphaned practice plan message #${plan.messageId}`);
            } catch (error) {
              console.log(`[sync/phase5] DiscordAPIError: Could not delete practice plan message #${plan.messageId}:`, error.message);
            }
          }

          const records = repository.getPersonalPracticeRecords(plan.id);
          results.practiceRecordsRemoved += records.length;

          repository.deletePersonalPracticePlan(plan.id);
          results.practicesRemoved++;
        }
      }
      console.log(`[sync/phase5] Completed: practices=${results.practicesRemoved}, records=${results.practiceRecordsRemoved}`);

      // Phase 6: Quiz publish history cleanup
      console.log('[sync/phase6] Starting quiz publish history cleanup');
      results.quizHistoryCleaned = repository.deleteOrphanQuizPublishHistory();
      console.log(`[sync/phase6] Completed: orphanHistory=${results.quizHistoryCleaned}`);

      console.log(`[sync] Sync completed by ${interaction.user.tag}: Phase1(+${results.membersAdded}/-${results.membersRemoved}), Phase2(lec=${results.lectureAttendeesRemoved}/q=${results.questionAttendeesRemoved}), Phase3(lec=${results.lectureMessagesCleaned}/q=${results.questionMessagesCleaned}/prac=${results.practiceMessagesCleaned}/quiz=${results.quizMessagesCleaned}), Phase4(pts=${results.pointsRemoved}/logs=${results.accumulationLogsRemoved}), Phase5(plans=${results.practicesRemoved}/rec=${results.practiceRecordsRemoved}), Phase6(hist=${results.quizHistoryCleaned})`);

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
      console.error(`[sync] ${error.constructor.name}: Sync failed for ${interaction.user.tag}:`, error);
      await interaction.editReply({
        content: strings.sync.error(error.message),
      });
    }
  },
};
