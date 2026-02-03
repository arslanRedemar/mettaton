const QuizPublishHistory = require('../../../../src/domain/entities/QuizPublishHistory');

describe('QuizPublishHistory Entity', () => {
  let history;

  beforeEach(() => {
    history = new QuizPublishHistory({
      id: 1,
      questionId: 10,
      publishedDate: '2025-01-15',
      messageId: '987654321',
      explanationRevealed: false,
      publishedAt: '2025-01-15T09:00:00.000Z',
    });
  });

  describe('constructor', () => {
    it('should create a quiz publish history with all properties', () => {
      expect(history.id).toBe(1);
      expect(history.questionId).toBe(10);
      expect(history.publishedDate).toBe('2025-01-15');
      expect(history.messageId).toBe('987654321');
      expect(history.explanationRevealed).toBe(false);
      expect(history.publishedAt).toBe('2025-01-15T09:00:00.000Z');
    });

    it('should default messageId to null and explanationRevealed to false', () => {
      const minimalHistory = new QuizPublishHistory({
        questionId: 20,
        publishedDate: '2025-01-16',
      });
      expect(minimalHistory.messageId).toBeNull();
      expect(minimalHistory.explanationRevealed).toBe(false);
    });
  });

  describe('revealExplanation', () => {
    it('should mark explanation as revealed', () => {
      history.revealExplanation();
      expect(history.explanationRevealed).toBe(true);
    });

    it('should do nothing if already revealed', () => {
      history.explanationRevealed = true;
      history.revealExplanation();
      expect(history.explanationRevealed).toBe(true);
    });
  });

  describe('isExplanationRevealed', () => {
    it('should return true if explanation is revealed (boolean true)', () => {
      history.explanationRevealed = true;
      expect(history.isExplanationRevealed()).toBe(true);
    });

    it('should return true if explanation is revealed (integer 1)', () => {
      history.explanationRevealed = 1; // SQLite returns integers for booleans
      expect(history.isExplanationRevealed()).toBe(true);
    });

    it('should return false if explanation is not revealed (boolean false)', () => {
      history.explanationRevealed = false;
      expect(history.isExplanationRevealed()).toBe(false);
    });

    it('should return false if explanation is not revealed (integer 0)', () => {
      history.explanationRevealed = 0;
      expect(history.isExplanationRevealed()).toBe(false);
    });
  });

  describe('getTodayDate (static)', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      const today = QuizPublishHistory.getTodayDate();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Verify it's actually today
      const now = new Date();
      const expectedDate = now.toISOString().split('T')[0];
      expect(today).toBe(expectedDate);
    });
  });

  describe('isToday', () => {
    it('should return true if published today', () => {
      const todayDate = QuizPublishHistory.getTodayDate();
      history.publishedDate = todayDate;
      expect(history.isToday()).toBe(true);
    });

    it('should return false if not published today', () => {
      history.publishedDate = '2020-01-01';
      expect(history.isToday()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return a plain object with all properties', () => {
      const json = history.toJSON();
      expect(json).toEqual({
        id: 1,
        questionId: 10,
        publishedDate: '2025-01-15',
        messageId: '987654321',
        explanationRevealed: false,
        publishedAt: '2025-01-15T09:00:00.000Z',
      });
    });
  });
});
