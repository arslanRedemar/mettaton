const SyncService = require('../../../../src/domain/usecases/SyncService');
const DatabaseSyncResult = require('../../../../src/domain/entities/DatabaseSyncResult');

describe('SyncService', () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      insertMemberActivityIfMissing: jest.fn(),
      getAllMemberActivities: jest.fn(),
      deleteMemberActivity: jest.fn(),
      getAllLectures: jest.fn(),
      removeAttendee: jest.fn(),
      getAllQuestions: jest.fn(),
      removeQuestionAttendee: jest.fn(),
      clearLectureMessageId: jest.fn(),
      clearQuestionMessageId: jest.fn(),
      clearPracticePlanMessageId: jest.fn(),
      clearQuizPublishHistoryMessageId: jest.fn(),
      getAllActivityPoints: jest.fn(),
      deleteActivityPointsByUserId: jest.fn(),
      deleteAccumulationLogsByUserId: jest.fn(),
      getAllPersonalPracticePlans: jest.fn(),
      getPersonalPracticeRecords: jest.fn(),
      deletePersonalPracticePlan: jest.fn(),
      deleteOrphanQuizPublishHistory: jest.fn(),
      getAllQuizPublishHistory: jest.fn(),
    };

    service = new SyncService(mockRepository);

    // Suppress console.log and console.error in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('executePhase1MemberActivitySync', () => {
    it('should add guild members not in database', () => {
      const guildMemberIds = new Set(['user1', 'user2', 'user3']);
      const results = new DatabaseSyncResult();

      mockRepository.insertMemberActivityIfMissing
        .mockReturnValueOnce(true)  // user1 added
        .mockReturnValueOnce(false) // user2 already exists
        .mockReturnValueOnce(true); // user3 added

      mockRepository.getAllMemberActivities.mockReturnValue([]);

      service.executePhase1MemberActivitySync(guildMemberIds, results);

      expect(results.membersAdded).toBe(2);
      expect(results.membersRemoved).toBe(0);
      expect(mockRepository.insertMemberActivityIfMissing).toHaveBeenCalledTimes(3);
    });

    it('should remove database members not in guild', () => {
      const guildMemberIds = new Set(['user1', 'user2']);
      const results = new DatabaseSyncResult();

      mockRepository.insertMemberActivityIfMissing.mockReturnValue(false);
      mockRepository.getAllMemberActivities.mockReturnValue([
        { user_id: 'user1' },
        { user_id: 'user2' },
        { user_id: 'user3' }, // not in guild
        { user_id: 'user4' }, // not in guild
      ]);

      service.executePhase1MemberActivitySync(guildMemberIds, results);

      expect(results.membersAdded).toBe(0);
      expect(results.membersRemoved).toBe(2);
      expect(mockRepository.deleteMemberActivity).toHaveBeenCalledWith('user3');
      expect(mockRepository.deleteMemberActivity).toHaveBeenCalledWith('user4');
    });

    it('should handle both add and remove operations', () => {
      const guildMemberIds = new Set(['user1', 'user2', 'user3']);
      const results = new DatabaseSyncResult();

      mockRepository.insertMemberActivityIfMissing
        .mockReturnValueOnce(true)  // user1 added
        .mockReturnValueOnce(false) // user2 exists
        .mockReturnValueOnce(false); // user3 exists

      mockRepository.getAllMemberActivities.mockReturnValue([
        { user_id: 'user2' },
        { user_id: 'user3' },
        { user_id: 'user4' }, // to be removed
      ]);

      service.executePhase1MemberActivitySync(guildMemberIds, results);

      expect(results.membersAdded).toBe(1);
      expect(results.membersRemoved).toBe(1);
    });
  });

  describe('executePhase2AttendeesCleanup', () => {
    it('should remove lecture attendees not in guild', () => {
      const guildMemberIds = new Set(['user1', 'user2']);
      const results = new DatabaseSyncResult();

      mockRepository.getAllLectures.mockReturnValue([
        { id: 1, attendees: ['user1', 'user2', 'user3'] }, // user3 not in guild
        { id: 2, attendees: ['user1', 'user4'] }, // user4 not in guild
      ]);
      mockRepository.getAllQuestions.mockReturnValue([]);

      service.executePhase2AttendeesCleanup(guildMemberIds, results);

      expect(results.lectureAttendeesRemoved).toBe(2);
      expect(mockRepository.removeAttendee).toHaveBeenCalledWith(1, 'user3');
      expect(mockRepository.removeAttendee).toHaveBeenCalledWith(2, 'user4');
    });

    it('should remove question attendees not in guild', () => {
      const guildMemberIds = new Set(['user1']);
      const results = new DatabaseSyncResult();

      mockRepository.getAllLectures.mockReturnValue([]);
      mockRepository.getAllQuestions.mockReturnValue([
        { id: 1, attendees: ['user1', 'user2', 'user3'] }, // user2, user3 not in guild
      ]);

      service.executePhase2AttendeesCleanup(guildMemberIds, results);

      expect(results.questionAttendeesRemoved).toBe(2);
      expect(mockRepository.removeQuestionAttendee).toHaveBeenCalledWith(1, 'user2');
      expect(mockRepository.removeQuestionAttendee).toHaveBeenCalledWith(1, 'user3');
    });

    it('should handle both lecture and question attendees', () => {
      const guildMemberIds = new Set(['user1']);
      const results = new DatabaseSyncResult();

      mockRepository.getAllLectures.mockReturnValue([
        { id: 1, attendees: ['user1', 'user2'] },
      ]);
      mockRepository.getAllQuestions.mockReturnValue([
        { id: 1, attendees: ['user1', 'user3'] },
      ]);

      service.executePhase2AttendeesCleanup(guildMemberIds, results);

      expect(results.lectureAttendeesRemoved).toBe(1);
      expect(results.questionAttendeesRemoved).toBe(1);
    });
  });

  describe('executePhase3MessageIdVerification', () => {
    it('should clear lecture message IDs when messages not found', async () => {
      const results = new DatabaseSyncResult();
      const mockScheduleChannel = {
        messages: {
          fetch: jest.fn()
            .mockRejectedValueOnce(new Error('Unknown Message'))
            .mockResolvedValueOnce({}), // second message exists
        },
      };

      mockRepository.getAllLectures.mockReturnValue([
        { id: 1, messageId: 'msg1' }, // will fail
        { id: 2, messageId: 'msg2' }, // will succeed
      ]);
      mockRepository.getAllQuestions.mockReturnValue([]);
      mockRepository.getAllPersonalPracticePlans.mockReturnValue([]);
      mockRepository.getAllQuizPublishHistory.mockReturnValue([]);

      const channels = { schedule: mockScheduleChannel };

      await service.executePhase3MessageIdVerification(channels, results);

      expect(results.lectureMessagesCleaned).toBe(1);
      expect(mockRepository.clearLectureMessageId).toHaveBeenCalledWith(1);
      expect(mockRepository.clearLectureMessageId).not.toHaveBeenCalledWith(2);
    });

    it('should clear question message IDs when messages not found', async () => {
      const results = new DatabaseSyncResult();
      const mockQuestionChannel = {
        messages: {
          fetch: jest.fn().mockRejectedValue(new Error('Unknown Message')),
        },
      };

      mockRepository.getAllLectures.mockReturnValue([]);
      mockRepository.getAllQuestions.mockReturnValue([
        { id: 1, messageId: 'msg1' },
        { id: 2, messageId: 'msg2' },
      ]);
      mockRepository.getAllPersonalPracticePlans.mockReturnValue([]);
      mockRepository.getAllQuizPublishHistory.mockReturnValue([]);

      const channels = { question: mockQuestionChannel };

      await service.executePhase3MessageIdVerification(channels, results);

      expect(results.questionMessagesCleaned).toBe(2);
    });

    it('should clear practice plan message IDs when messages not found', async () => {
      const results = new DatabaseSyncResult();
      const mockPracticeChannel = {
        messages: {
          fetch: jest.fn().mockRejectedValue(new Error('Unknown Message')),
        },
      };

      mockRepository.getAllLectures.mockReturnValue([]);
      mockRepository.getAllQuestions.mockReturnValue([]);
      mockRepository.getAllPersonalPracticePlans.mockReturnValue([
        { id: 1, messageId: 'msg1' },
      ]);
      mockRepository.getAllQuizPublishHistory.mockReturnValue([]);

      const channels = { practice: mockPracticeChannel };

      await service.executePhase3MessageIdVerification(channels, results);

      expect(results.practiceMessagesCleaned).toBe(1);
    });

    it('should clear quiz publish history message IDs when messages not found', async () => {
      const results = new DatabaseSyncResult();
      const mockQuizChannel = {
        messages: {
          fetch: jest.fn().mockRejectedValue(new Error('Unknown Message')),
        },
      };

      mockRepository.getAllLectures.mockReturnValue([]);
      mockRepository.getAllQuestions.mockReturnValue([]);
      mockRepository.getAllPersonalPracticePlans.mockReturnValue([]);
      mockRepository.getAllQuizPublishHistory.mockReturnValue([
        { id: 1, message_id: 'msg1' },
      ]);

      const channels = { quiz: mockQuizChannel };

      await service.executePhase3MessageIdVerification(channels, results);

      expect(results.quizMessagesCleaned).toBe(1);
    });

    it('should skip verification when channels are not provided', async () => {
      const results = new DatabaseSyncResult();

      mockRepository.getAllLectures.mockReturnValue([
        { id: 1, messageId: 'msg1' },
      ]);
      mockRepository.getAllQuestions.mockReturnValue([]);
      mockRepository.getAllPersonalPracticePlans.mockReturnValue([]);
      mockRepository.getAllQuizPublishHistory.mockReturnValue([]);

      const channels = {}; // no channels

      await service.executePhase3MessageIdVerification(channels, results);

      expect(results.lectureMessagesCleaned).toBe(0);
      expect(mockRepository.clearLectureMessageId).not.toHaveBeenCalled();
    });
  });

  describe('executePhase4ActivityPointsCleanup', () => {
    it('should remove activity points for users not in guild', () => {
      const guildMemberIds = new Set(['user1']);
      const results = new DatabaseSyncResult();

      mockRepository.getAllActivityPoints.mockReturnValue([
        { userId: 'user1' }, // in guild
        { userId: 'user2' }, // not in guild
        { userId: 'user3' }, // not in guild
      ]);

      mockRepository.deleteActivityPointsByUserId
        .mockReturnValueOnce(1) // user2: 1 record deleted
        .mockReturnValueOnce(1); // user3: 1 record deleted

      mockRepository.deleteAccumulationLogsByUserId
        .mockReturnValueOnce(3) // user2: 3 logs deleted
        .mockReturnValueOnce(2); // user3: 2 logs deleted

      service.executePhase4ActivityPointsCleanup(guildMemberIds, results);

      expect(results.pointsRemoved).toBe(2);
      expect(results.accumulationLogsRemoved).toBe(5);
      expect(mockRepository.deleteActivityPointsByUserId).toHaveBeenCalledWith('user2');
      expect(mockRepository.deleteActivityPointsByUserId).toHaveBeenCalledWith('user3');
      expect(mockRepository.deleteActivityPointsByUserId).not.toHaveBeenCalledWith('user1');
    });

    it('should handle no orphaned points', () => {
      const guildMemberIds = new Set(['user1', 'user2']);
      const results = new DatabaseSyncResult();

      mockRepository.getAllActivityPoints.mockReturnValue([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);

      service.executePhase4ActivityPointsCleanup(guildMemberIds, results);

      expect(results.pointsRemoved).toBe(0);
      expect(results.accumulationLogsRemoved).toBe(0);
      expect(mockRepository.deleteActivityPointsByUserId).not.toHaveBeenCalled();
    });
  });

  describe('executePhase5PersonalPracticeCleanup', () => {
    it('should remove practice plans for users not in guild', async () => {
      const guildMemberIds = new Set(['user1']);
      const results = new DatabaseSyncResult();

      mockRepository.getAllPersonalPracticePlans.mockReturnValue([
        { id: 1, userId: 'user1', messageId: null },
        { id: 2, userId: 'user2', messageId: null }, // not in guild
        { id: 3, userId: 'user3', messageId: null }, // not in guild
      ]);

      mockRepository.getPersonalPracticeRecords
        .mockReturnValueOnce(['2025-01-01', '2025-01-02']) // plan 2: 2 records
        .mockReturnValueOnce(['2025-01-01']); // plan 3: 1 record

      await service.executePhase5PersonalPracticeCleanup(guildMemberIds, null, results);

      expect(results.practicesRemoved).toBe(2);
      expect(results.practiceRecordsRemoved).toBe(3);
      expect(mockRepository.deletePersonalPracticePlan).toHaveBeenCalledWith(2);
      expect(mockRepository.deletePersonalPracticePlan).toHaveBeenCalledWith(3);
      expect(mockRepository.deletePersonalPracticePlan).not.toHaveBeenCalledWith(1);
    });

    it('should delete embed messages when practice channel is provided', async () => {
      const guildMemberIds = new Set(['user1']);
      const results = new DatabaseSyncResult();
      const mockMessage = { delete: jest.fn().mockResolvedValue({}) };
      const mockPracticeChannel = {
        messages: {
          fetch: jest.fn().mockResolvedValue(mockMessage),
        },
      };

      mockRepository.getAllPersonalPracticePlans.mockReturnValue([
        { id: 1, userId: 'user2', messageId: 'msg1' }, // not in guild, has message
      ]);

      mockRepository.getPersonalPracticeRecords.mockReturnValue([]);

      await service.executePhase5PersonalPracticeCleanup(
        guildMemberIds,
        mockPracticeChannel,
        results,
      );

      expect(mockPracticeChannel.messages.fetch).toHaveBeenCalledWith('msg1');
      expect(mockMessage.delete).toHaveBeenCalled();
      expect(results.practicesRemoved).toBe(1);
    });

    it('should handle message deletion failures gracefully', async () => {
      const guildMemberIds = new Set(['user1']);
      const results = new DatabaseSyncResult();
      const mockPracticeChannel = {
        messages: {
          fetch: jest.fn().mockRejectedValue(new Error('Unknown Message')),
        },
      };

      mockRepository.getAllPersonalPracticePlans.mockReturnValue([
        { id: 1, userId: 'user2', messageId: 'msg1' },
      ]);

      mockRepository.getPersonalPracticeRecords.mockReturnValue([]);

      await service.executePhase5PersonalPracticeCleanup(
        guildMemberIds,
        mockPracticeChannel,
        results,
      );

      // Should still delete the plan even if message deletion fails
      expect(results.practicesRemoved).toBe(1);
      expect(mockRepository.deletePersonalPracticePlan).toHaveBeenCalledWith(1);
    });
  });

  describe('executePhase6QuizHistoryCleanup', () => {
    it('should delete orphaned quiz publish history', () => {
      const results = new DatabaseSyncResult();

      mockRepository.deleteOrphanQuizPublishHistory.mockReturnValue(5);

      service.executePhase6QuizHistoryCleanup(results);

      expect(results.quizHistoryCleaned).toBe(5);
      expect(mockRepository.deleteOrphanQuizPublishHistory).toHaveBeenCalled();
    });

    it('should handle no orphaned history', () => {
      const results = new DatabaseSyncResult();

      mockRepository.deleteOrphanQuizPublishHistory.mockReturnValue(0);

      service.executePhase6QuizHistoryCleanup(results);

      expect(results.quizHistoryCleaned).toBe(0);
    });
  });

  describe('executeFullSync', () => {
    it('should execute all 6 phases in order', async () => {
      const guildMemberIds = new Set(['user1']);
      const channels = {
        schedule: null,
        question: null,
        practice: null,
        quiz: null,
      };

      mockRepository.getAllMemberActivities.mockReturnValue([]);
      mockRepository.insertMemberActivityIfMissing.mockReturnValue(true);
      mockRepository.getAllLectures.mockReturnValue([]);
      mockRepository.getAllQuestions.mockReturnValue([]);
      mockRepository.getAllPersonalPracticePlans.mockReturnValue([]);
      mockRepository.getAllQuizPublishHistory.mockReturnValue([]);
      mockRepository.getAllActivityPoints.mockReturnValue([]);
      mockRepository.deleteOrphanQuizPublishHistory.mockReturnValue(0);

      const results = await service.executeFullSync({ guildMemberIds, channels });

      expect(results).toBeInstanceOf(DatabaseSyncResult);
      expect(results.membersAdded).toBe(1);
      expect(mockRepository.getAllMemberActivities).toHaveBeenCalled();
      expect(mockRepository.getAllLectures).toHaveBeenCalled();
      expect(mockRepository.getAllQuestions).toHaveBeenCalled();
      expect(mockRepository.getAllActivityPoints).toHaveBeenCalled();
      expect(mockRepository.getAllPersonalPracticePlans).toHaveBeenCalled();
      expect(mockRepository.deleteOrphanQuizPublishHistory).toHaveBeenCalled();
    });

    it('should propagate errors with proper logging', async () => {
      const guildMemberIds = new Set(['user1']);
      const channels = {};

      mockRepository.getAllMemberActivities.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(
        service.executeFullSync({ guildMemberIds, channels }),
      ).rejects.toThrow('Database error');

      expect(console.error).toHaveBeenCalledWith(
        '[sync] Error: Sync execution failed:',
        expect.any(Error),
      );
    });

    it('should return comprehensive results from all phases', async () => {
      const guildMemberIds = new Set(['user1']);
      const channels = {
        schedule: null,
        question: null,
        practice: null,
        quiz: null,
      };

      // Phase 1: Add 1 member, remove 1 member
      mockRepository.insertMemberActivityIfMissing.mockReturnValue(true);
      mockRepository.getAllMemberActivities.mockReturnValue([
        { user_id: 'user1' },
        { user_id: 'user2' },
      ]);

      // Phase 2: Remove 2 lecture attendees, 1 question attendee
      mockRepository.getAllLectures.mockReturnValue([
        { id: 1, attendees: ['user1', 'user2'] },
      ]);
      mockRepository.getAllQuestions.mockReturnValue([
        { id: 1, attendees: ['user1', 'user2'] },
      ]);

      // Phase 3: No messages (skipped)
      mockRepository.getAllPersonalPracticePlans.mockReturnValue([]);
      mockRepository.getAllQuizPublishHistory.mockReturnValue([]);

      // Phase 4: Remove 1 point, 2 logs
      mockRepository.getAllActivityPoints.mockReturnValue([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);
      mockRepository.deleteActivityPointsByUserId.mockReturnValue(1);
      mockRepository.deleteAccumulationLogsByUserId.mockReturnValue(2);

      // Phase 5: Remove 1 practice, 3 records
      mockRepository.getPersonalPracticeRecords.mockReturnValue(['2025-01-01', '2025-01-02', '2025-01-03']);

      // Phase 6: Clean 5 orphan history
      mockRepository.deleteOrphanQuizPublishHistory.mockReturnValue(5);

      const results = await service.executeFullSync({ guildMemberIds, channels });

      expect(results.membersAdded).toBe(1);
      expect(results.membersRemoved).toBe(1);
      expect(results.lectureAttendeesRemoved).toBe(1);
      expect(results.questionAttendeesRemoved).toBe(1);
      expect(results.pointsRemoved).toBe(1);
      expect(results.accumulationLogsRemoved).toBe(2);
      expect(results.quizHistoryCleaned).toBe(5);
      expect(results.getTotalChanges()).toBe(12);
    });
  });
});
