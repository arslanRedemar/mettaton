const DatabaseSyncResult = require('../entities/DatabaseSyncResult');

/**
 * Sync Service
 * Handles business logic for database synchronization across 6 phases
 */
class SyncService {
  /**
   * @param {Object} repository - Repository implementation
   */
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Execute Phase 1: Member activity synchronization
   * - Add guild members not in DB
   * - Remove DB members not in guild
   * @param {Set<string>} guildMemberIds - Set of guild member IDs (excluding bots)
   * @param {DatabaseSyncResult} results - Results object to update
   */
  executePhase1MemberActivitySync(guildMemberIds, results) {
    console.log('[sync/phase1] Starting member activity sync');

    // Add missing members
    for (const memberId of guildMemberIds) {
      if (this.repository.insertMemberActivityIfMissing(memberId)) {
        results.incrementMembersAdded();
      }
    }

    // Remove members not in guild
    const activities = this.repository.getAllMemberActivities();
    for (const activity of activities) {
      if (!guildMemberIds.has(activity.user_id)) {
        this.repository.deleteMemberActivity(activity.user_id);
        results.incrementMembersRemoved();
      }
    }

    console.log(`[sync/phase1] Completed: added=${results.membersAdded}, removed=${results.membersRemoved}`);
  }

  /**
   * Execute Phase 2: Attendees cleanup
   * - Remove lecture attendees not in guild
   * - Remove question attendees not in guild
   * @param {Set<string>} guildMemberIds - Set of guild member IDs
   * @param {DatabaseSyncResult} results - Results object to update
   */
  executePhase2AttendeesCleanup(guildMemberIds, results) {
    console.log('[sync/phase2] Starting attendees cleanup');

    // Clean lecture attendees
    const lectures = this.repository.getAllLectures();
    for (const lecture of lectures) {
      for (const userId of lecture.attendees) {
        if (!guildMemberIds.has(userId)) {
          this.repository.removeAttendee(lecture.id, userId);
          results.incrementLectureAttendeesRemoved();
        }
      }
    }

    // Clean question attendees
    const questions = this.repository.getAllQuestions();
    for (const question of questions) {
      for (const userId of question.attendees) {
        if (!guildMemberIds.has(userId)) {
          this.repository.removeQuestionAttendee(question.id, userId);
          results.incrementQuestionAttendeesRemoved();
        }
      }
    }

    console.log(`[sync/phase2] Completed: lectureAttendees=${results.lectureAttendeesRemoved}, questionAttendees=${results.questionAttendeesRemoved}`);
  }

  /**
   * Execute Phase 3: Message ID verification
   * - Verify lecture message IDs
   * - Verify question message IDs
   * - Verify practice plan message IDs
   * - Verify quiz publish history message IDs
   * @param {Object} channels - Object containing channel instances
   * @param {DatabaseSyncResult} results - Results object to update
   * @returns {Promise<void>}
   */
  async executePhase3MessageIdVerification(channels, results) {
    console.log('[sync/phase3] Starting message ID verification');

    // Verify lecture messages
    if (channels.schedule) {
      const lectures = this.repository.getAllLectures();
      for (const lecture of lectures) {
        if (lecture.messageId) {
          try {
            await channels.schedule.messages.fetch(lecture.messageId);
          } catch (error) {
            console.log(`[sync/phase3] DiscordAPIError: Lecture message #${lecture.messageId} not found, clearing`);
            this.repository.clearLectureMessageId(lecture.id);
            results.incrementLectureMessagesCleaned();
          }
        }
      }
    }

    // Verify question messages
    if (channels.question) {
      const questions = this.repository.getAllQuestions();
      for (const question of questions) {
        if (question.messageId) {
          try {
            await channels.question.messages.fetch(question.messageId);
          } catch (error) {
            console.log(`[sync/phase3] DiscordAPIError: Question message #${question.messageId} not found, clearing`);
            this.repository.clearQuestionMessageId(question.id);
            results.incrementQuestionMessagesCleaned();
          }
        }
      }
    }

    // Verify practice plan messages
    if (channels.practice) {
      const practicePlans = this.repository.getAllPersonalPracticePlans();
      for (const plan of practicePlans) {
        if (plan.messageId) {
          try {
            await channels.practice.messages.fetch(plan.messageId);
          } catch (error) {
            console.log(`[sync/phase3] DiscordAPIError: Practice plan message #${plan.messageId} not found, clearing`);
            this.repository.clearPracticePlanMessageId(plan.id);
            results.incrementPracticeMessagesCleaned();
          }
        }
      }
    }

    // Verify quiz publish history messages
    if (channels.quiz) {
      const quizHistory = this.repository.getAllQuizPublishHistory();
      for (const history of quizHistory) {
        if (history.message_id) {
          try {
            await channels.quiz.messages.fetch(history.message_id);
          } catch (error) {
            console.log(`[sync/phase3] DiscordAPIError: Quiz message #${history.message_id} not found, clearing`);
            this.repository.clearQuizPublishHistoryMessageId(history.id);
            results.incrementQuizMessagesCleaned();
          }
        }
      }
    }

    console.log(`[sync/phase3] Completed: lectures=${results.lectureMessagesCleaned}, questions=${results.questionMessagesCleaned}, practice=${results.practiceMessagesCleaned}, quiz=${results.quizMessagesCleaned}`);
  }

  /**
   * Execute Phase 4: Activity points cleanup
   * - Remove activity points for members not in guild
   * - Remove accumulation logs for members not in guild
   * - Note: point_award_history is preserved for statistics
   * @param {Set<string>} guildMemberIds - Set of guild member IDs
   * @param {DatabaseSyncResult} results - Results object to update
   */
  executePhase4ActivityPointsCleanup(guildMemberIds, results) {
    console.log('[sync/phase4] Starting activity points cleanup');

    const allActivityPoints = this.repository.getAllActivityPoints();
    for (const activityPoint of allActivityPoints) {
      if (!guildMemberIds.has(activityPoint.userId)) {
        const pointsRemoved = this.repository.deleteActivityPointsByUserId(activityPoint.userId);
        const logsRemoved = this.repository.deleteAccumulationLogsByUserId(activityPoint.userId);
        results.addPointsRemoved(pointsRemoved);
        results.addAccumulationLogsRemoved(logsRemoved);
      }
    }

    console.log(`[sync/phase4] Completed: points=${results.pointsRemoved}, logs=${results.accumulationLogsRemoved}`);
  }

  /**
   * Execute Phase 5: Personal practice cleanup
   * - Remove practice plans for members not in guild
   * - Remove associated practice records (CASCADE)
   * - Delete embed messages from practice channel if exist
   * @param {Set<string>} guildMemberIds - Set of guild member IDs
   * @param {Object|null} practiceChannel - Practice channel instance or null
   * @param {DatabaseSyncResult} results - Results object to update
   * @returns {Promise<void>}
   */
  async executePhase5PersonalPracticeCleanup(guildMemberIds, practiceChannel, results) {
    console.log('[sync/phase5] Starting personal practice cleanup');

    const practicePlans = this.repository.getAllPersonalPracticePlans();
    for (const plan of practicePlans) {
      if (!guildMemberIds.has(plan.userId)) {
        // Try to delete the embed message from channel
        if (plan.messageId && practiceChannel) {
          try {
            const message = await practiceChannel.messages.fetch(plan.messageId);
            await message.delete();
            console.log(`[sync/phase5] Deleted orphaned practice plan message #${plan.messageId}`);
          } catch (error) {
            console.log(`[sync/phase5] DiscordAPIError: Could not delete practice plan message #${plan.messageId}:`, error.message);
          }
        }

        // Count records before deletion
        const records = this.repository.getPersonalPracticeRecords(plan.id);
        results.addPracticeRecordsRemoved(records.length);

        // Delete the plan (records will be deleted via CASCADE or explicitly)
        this.repository.deletePersonalPracticePlan(plan.id);
        results.incrementPracticesRemoved();
      }
    }

    console.log(`[sync/phase5] Completed: practices=${results.practicesRemoved}, records=${results.practiceRecordsRemoved}`);
  }

  /**
   * Execute Phase 6: Quiz publish history cleanup
   * - Remove quiz publish history for deleted questions
   * - Note: quiz_answers are preserved for statistics (accuracy, participant count)
   * @param {DatabaseSyncResult} results - Results object to update
   */
  executePhase6QuizHistoryCleanup(results) {
    console.log('[sync/phase6] Starting quiz publish history cleanup');

    const cleaned = this.repository.deleteOrphanQuizPublishHistory();
    results.setQuizHistoryCleaned(cleaned);

    console.log(`[sync/phase6] Completed: orphanHistory=${results.quizHistoryCleaned}`);
  }

  /**
   * Execute full database synchronization (all 6 phases)
   * @param {Object} params - Synchronization parameters
   * @param {Set<string>} params.guildMemberIds - Set of guild member IDs (excluding bots)
   * @param {Object} params.channels - Channel instances { schedule, question, practice, quiz }
   * @returns {Promise<DatabaseSyncResult>} - Sync results
   */
  async executeFullSync({ guildMemberIds, channels }) {
    const results = new DatabaseSyncResult();

    try {
      // Phase 1: Member activity sync
      this.executePhase1MemberActivitySync(guildMemberIds, results);

      // Phase 2: Attendees cleanup
      this.executePhase2AttendeesCleanup(guildMemberIds, results);

      // Phase 3: Message ID verification (async)
      await this.executePhase3MessageIdVerification(channels, results);

      // Phase 4: Activity points cleanup
      this.executePhase4ActivityPointsCleanup(guildMemberIds, results);

      // Phase 5: Personal practice cleanup (async)
      await this.executePhase5PersonalPracticeCleanup(
        guildMemberIds,
        channels.practice,
        results,
      );

      // Phase 6: Quiz publish history cleanup
      this.executePhase6QuizHistoryCleanup(results);

      return results;
    } catch (error) {
      console.error(`[sync] ${error.constructor.name}: Sync execution failed:`, error);
      throw error;
    }
  }
}

module.exports = SyncService;
