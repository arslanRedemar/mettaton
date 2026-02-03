const DatabaseSyncResult = require('../../../../src/domain/entities/DatabaseSyncResult');

describe('DatabaseSyncResult', () => {
  describe('constructor', () => {
    it('should initialize with default values of 0 for all counts', () => {
      const result = new DatabaseSyncResult();

      expect(result.membersAdded).toBe(0);
      expect(result.membersRemoved).toBe(0);
      expect(result.lectureAttendeesRemoved).toBe(0);
      expect(result.questionAttendeesRemoved).toBe(0);
      expect(result.lectureMessagesCleaned).toBe(0);
      expect(result.questionMessagesCleaned).toBe(0);
      expect(result.practiceMessagesCleaned).toBe(0);
      expect(result.quizMessagesCleaned).toBe(0);
      expect(result.pointsRemoved).toBe(0);
      expect(result.accumulationLogsRemoved).toBe(0);
      expect(result.practicesRemoved).toBe(0);
      expect(result.practiceRecordsRemoved).toBe(0);
      expect(result.quizHistoryCleaned).toBe(0);
    });

    it('should initialize with provided values', () => {
      const result = new DatabaseSyncResult({
        membersAdded: 5,
        membersRemoved: 3,
        lectureAttendeesRemoved: 10,
        pointsRemoved: 7,
      });

      expect(result.membersAdded).toBe(5);
      expect(result.membersRemoved).toBe(3);
      expect(result.lectureAttendeesRemoved).toBe(10);
      expect(result.pointsRemoved).toBe(7);
      expect(result.questionAttendeesRemoved).toBe(0); // default
    });
  });

  describe('increment methods', () => {
    it('should increment membersAdded', () => {
      const result = new DatabaseSyncResult();

      result.incrementMembersAdded();
      result.incrementMembersAdded();

      expect(result.membersAdded).toBe(2);
    });

    it('should increment membersRemoved', () => {
      const result = new DatabaseSyncResult();

      result.incrementMembersRemoved();

      expect(result.membersRemoved).toBe(1);
    });

    it('should increment lectureAttendeesRemoved', () => {
      const result = new DatabaseSyncResult();

      result.incrementLectureAttendeesRemoved();
      result.incrementLectureAttendeesRemoved();
      result.incrementLectureAttendeesRemoved();

      expect(result.lectureAttendeesRemoved).toBe(3);
    });

    it('should increment questionAttendeesRemoved', () => {
      const result = new DatabaseSyncResult();

      result.incrementQuestionAttendeesRemoved();

      expect(result.questionAttendeesRemoved).toBe(1);
    });

    it('should increment lectureMessagesCleaned', () => {
      const result = new DatabaseSyncResult();

      result.incrementLectureMessagesCleaned();

      expect(result.lectureMessagesCleaned).toBe(1);
    });

    it('should increment questionMessagesCleaned', () => {
      const result = new DatabaseSyncResult();

      result.incrementQuestionMessagesCleaned();

      expect(result.questionMessagesCleaned).toBe(1);
    });

    it('should increment practiceMessagesCleaned', () => {
      const result = new DatabaseSyncResult();

      result.incrementPracticeMessagesCleaned();

      expect(result.practiceMessagesCleaned).toBe(1);
    });

    it('should increment quizMessagesCleaned', () => {
      const result = new DatabaseSyncResult();

      result.incrementQuizMessagesCleaned();

      expect(result.quizMessagesCleaned).toBe(1);
    });

    it('should increment practicesRemoved', () => {
      const result = new DatabaseSyncResult();

      result.incrementPracticesRemoved();

      expect(result.practicesRemoved).toBe(1);
    });
  });

  describe('add methods', () => {
    it('should add to pointsRemoved', () => {
      const result = new DatabaseSyncResult();

      result.addPointsRemoved(5);
      result.addPointsRemoved(3);

      expect(result.pointsRemoved).toBe(8);
    });

    it('should add to accumulationLogsRemoved', () => {
      const result = new DatabaseSyncResult();

      result.addAccumulationLogsRemoved(10);
      result.addAccumulationLogsRemoved(7);

      expect(result.accumulationLogsRemoved).toBe(17);
    });

    it('should add to practiceRecordsRemoved', () => {
      const result = new DatabaseSyncResult();

      result.addPracticeRecordsRemoved(4);
      result.addPracticeRecordsRemoved(2);

      expect(result.practiceRecordsRemoved).toBe(6);
    });
  });

  describe('setQuizHistoryCleaned', () => {
    it('should set quizHistoryCleaned to specific value', () => {
      const result = new DatabaseSyncResult();

      result.setQuizHistoryCleaned(15);

      expect(result.quizHistoryCleaned).toBe(15);
    });

    it('should override previous value', () => {
      const result = new DatabaseSyncResult({ quizHistoryCleaned: 5 });

      result.setQuizHistoryCleaned(20);

      expect(result.quizHistoryCleaned).toBe(20);
    });
  });

  describe('getTotalChanges', () => {
    it('should return 0 when no changes', () => {
      const result = new DatabaseSyncResult();

      expect(result.getTotalChanges()).toBe(0);
    });

    it('should sum all changes across all phases', () => {
      const result = new DatabaseSyncResult({
        membersAdded: 2,
        membersRemoved: 3,
        lectureAttendeesRemoved: 5,
        questionAttendeesRemoved: 1,
        lectureMessagesCleaned: 4,
        questionMessagesCleaned: 2,
        practiceMessagesCleaned: 1,
        quizMessagesCleaned: 3,
        pointsRemoved: 6,
        accumulationLogsRemoved: 10,
        practicesRemoved: 2,
        practiceRecordsRemoved: 8,
        quizHistoryCleaned: 7,
      });

      // 2+3+5+1+4+2+1+3+6+10+2+8+7 = 54
      expect(result.getTotalChanges()).toBe(54);
    });

    it('should reflect incremental updates', () => {
      const result = new DatabaseSyncResult();

      expect(result.getTotalChanges()).toBe(0);

      result.incrementMembersAdded();
      expect(result.getTotalChanges()).toBe(1);

      result.addPointsRemoved(5);
      expect(result.getTotalChanges()).toBe(6);

      result.setQuizHistoryCleaned(10);
      expect(result.getTotalChanges()).toBe(16);
    });
  });

  describe('hasChanges', () => {
    it('should return false when no changes', () => {
      const result = new DatabaseSyncResult();

      expect(result.hasChanges()).toBe(false);
    });

    it('should return true when there are changes', () => {
      const result = new DatabaseSyncResult({ membersAdded: 1 });

      expect(result.hasChanges()).toBe(true);
    });

    it('should return true after incremental updates', () => {
      const result = new DatabaseSyncResult();

      expect(result.hasChanges()).toBe(false);

      result.incrementMembersRemoved();

      expect(result.hasChanges()).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should return structured JSON object with all phases', () => {
      const result = new DatabaseSyncResult({
        membersAdded: 2,
        membersRemoved: 1,
        lectureAttendeesRemoved: 3,
        questionAttendeesRemoved: 4,
        lectureMessagesCleaned: 5,
        questionMessagesCleaned: 6,
        practiceMessagesCleaned: 7,
        quizMessagesCleaned: 8,
        pointsRemoved: 9,
        accumulationLogsRemoved: 10,
        practicesRemoved: 11,
        practiceRecordsRemoved: 12,
        quizHistoryCleaned: 13,
      });

      const json = result.toJSON();

      expect(json).toEqual({
        phase1: {
          membersAdded: 2,
          membersRemoved: 1,
        },
        phase2: {
          lectureAttendeesRemoved: 3,
          questionAttendeesRemoved: 4,
        },
        phase3: {
          lectureMessagesCleaned: 5,
          questionMessagesCleaned: 6,
          practiceMessagesCleaned: 7,
          quizMessagesCleaned: 8,
        },
        phase4: {
          pointsRemoved: 9,
          accumulationLogsRemoved: 10,
        },
        phase5: {
          practicesRemoved: 11,
          practiceRecordsRemoved: 12,
        },
        phase6: {
          quizHistoryCleaned: 13,
        },
        totalChanges: 91,
      });
    });
  });

  describe('toLogString', () => {
    it('should return formatted log string', () => {
      const result = new DatabaseSyncResult({
        membersAdded: 2,
        membersRemoved: 1,
        lectureAttendeesRemoved: 3,
        questionAttendeesRemoved: 4,
        lectureMessagesCleaned: 5,
        questionMessagesCleaned: 6,
        practiceMessagesCleaned: 7,
        quizMessagesCleaned: 8,
        pointsRemoved: 9,
        accumulationLogsRemoved: 10,
        practicesRemoved: 11,
        practiceRecordsRemoved: 12,
        quizHistoryCleaned: 13,
      });

      const logString = result.toLogString();

      expect(logString).toBe(
        'Phase1(+2/-1), Phase2(lec=3/q=4), Phase3(lec=5/q=6/prac=7/quiz=8), Phase4(pts=9/logs=10), Phase5(plans=11/rec=12), Phase6(hist=13)',
      );
    });

    it('should return log string with zeros when no changes', () => {
      const result = new DatabaseSyncResult();

      const logString = result.toLogString();

      expect(logString).toBe(
        'Phase1(+0/-0), Phase2(lec=0/q=0), Phase3(lec=0/q=0/prac=0/quiz=0), Phase4(pts=0/logs=0), Phase5(plans=0/rec=0), Phase6(hist=0)',
      );
    });
  });
});
