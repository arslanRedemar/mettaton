const QuizAnswer = require('../../../../src/domain/entities/QuizAnswer');

describe('QuizAnswer Entity', () => {
  let answer;

  beforeEach(() => {
    answer = new QuizAnswer({
      id: 1,
      questionId: 10,
      userId: 'user123',
      selectedOption: 3,
      isCorrect: true,
      pointsAwarded: 200,
      submittedAt: '2025-01-01T10:00:00.000Z',
      updatedAt: null,
    });
  });

  describe('constructor', () => {
    it('should create a quiz answer with all properties', () => {
      expect(answer.id).toBe(1);
      expect(answer.questionId).toBe(10);
      expect(answer.userId).toBe('user123');
      expect(answer.selectedOption).toBe(3);
      expect(answer.isCorrect).toBe(true);
      expect(answer.pointsAwarded).toBe(200);
      expect(answer.submittedAt).toBe('2025-01-01T10:00:00.000Z');
      expect(answer.updatedAt).toBeNull();
    });

    it('should default pointsAwarded to 0 if not provided', () => {
      const newAnswer = new QuizAnswer({
        questionId: 10,
        userId: 'user456',
        selectedOption: 2,
        isCorrect: false,
      });
      expect(newAnswer.pointsAwarded).toBe(0);
    });
  });

  describe('updateAnswer', () => {
    it('should update selectedOption and isCorrect', () => {
      answer.updateAnswer(5, false);
      expect(answer.selectedOption).toBe(5);
      expect(answer.isCorrect).toBe(false);
    });

    it('should allow changing from incorrect to correct', () => {
      const incorrectAnswer = new QuizAnswer({
        questionId: 10,
        userId: 'user789',
        selectedOption: 1,
        isCorrect: false,
      });
      incorrectAnswer.updateAnswer(3, true);
      expect(incorrectAnswer.selectedOption).toBe(3);
      expect(incorrectAnswer.isCorrect).toBe(true);
    });
  });

  describe('awardPoints', () => {
    it('should set pointsAwarded', () => {
      const newAnswer = new QuizAnswer({
        questionId: 10,
        userId: 'user456',
        selectedOption: 2,
        isCorrect: false,
        pointsAwarded: 0,
      });
      newAnswer.awardPoints(150);
      expect(newAnswer.pointsAwarded).toBe(150);
    });

    it('should allow overwriting existing points', () => {
      answer.awardPoints(300);
      expect(answer.pointsAwarded).toBe(300);
    });
  });

  describe('hasPointsAwarded', () => {
    it('should return true if points awarded', () => {
      expect(answer.hasPointsAwarded()).toBe(true);
    });

    it('should return false if no points awarded', () => {
      const newAnswer = new QuizAnswer({
        questionId: 10,
        userId: 'user456',
        selectedOption: 2,
        isCorrect: false,
        pointsAwarded: 0,
      });
      expect(newAnswer.hasPointsAwarded()).toBe(false);
    });
  });

  describe('isValidOption (static)', () => {
    it('should return true for valid options (1-5)', () => {
      expect(QuizAnswer.isValidOption(1)).toBe(true);
      expect(QuizAnswer.isValidOption(2)).toBe(true);
      expect(QuizAnswer.isValidOption(3)).toBe(true);
      expect(QuizAnswer.isValidOption(4)).toBe(true);
      expect(QuizAnswer.isValidOption(5)).toBe(true);
    });

    it('should return false for invalid options', () => {
      expect(QuizAnswer.isValidOption(0)).toBe(false);
      expect(QuizAnswer.isValidOption(6)).toBe(false);
      expect(QuizAnswer.isValidOption(-1)).toBe(false);
      expect(QuizAnswer.isValidOption(1.5)).toBe(false);
      expect(QuizAnswer.isValidOption('2')).toBe(false);
      expect(QuizAnswer.isValidOption(null)).toBe(false);
      expect(QuizAnswer.isValidOption(undefined)).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return a plain object with all properties', () => {
      const json = answer.toJSON();
      expect(json).toEqual({
        id: 1,
        questionId: 10,
        userId: 'user123',
        selectedOption: 3,
        isCorrect: true,
        pointsAwarded: 200,
        submittedAt: '2025-01-01T10:00:00.000Z',
        updatedAt: null,
      });
    });
  });
});
