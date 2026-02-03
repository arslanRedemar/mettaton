const QuizQuestion = require('../../../../src/domain/entities/QuizQuestion');

describe('QuizQuestion Entity', () => {
  let question;

  beforeEach(() => {
    question = new QuizQuestion({
      id: 1,
      category: '국어',
      question: '다음 중 맞춤법이 올바른 것은?',
      option1: '됬어요',
      option2: '됐어요',
      option3: '됬었어요',
      option4: '되었어요',
      option5: '되여요',
      answer: 2,
      explanation: '\'되다\'의 과거형은 \'됐다\'입니다.',
      createdBy: 'user123',
      createdAt: '2025-01-01T00:00:00.000Z',
    });
  });

  describe('constructor', () => {
    it('should create a quiz question with all properties', () => {
      expect(question.id).toBe(1);
      expect(question.category).toBe('국어');
      expect(question.question).toBe('다음 중 맞춤법이 올바른 것은?');
      expect(question.option1).toBe('됬어요');
      expect(question.option2).toBe('됐어요');
      expect(question.option3).toBe('됬었어요');
      expect(question.option4).toBe('되었어요');
      expect(question.option5).toBe('되여요');
      expect(question.answer).toBe(2);
      expect(question.explanation).toBe('\'되다\'의 과거형은 \'됐다\'입니다.');
      expect(question.createdBy).toBe('user123');
    });
  });

  describe('getOptions', () => {
    it('should return all 5 options as an array', () => {
      const options = question.getOptions();
      expect(options).toEqual(['됬어요', '됐어요', '됬었어요', '되었어요', '되여요']);
      expect(options.length).toBe(5);
    });
  });

  describe('getOption', () => {
    it('should return the correct option by number (1-5)', () => {
      expect(question.getOption(1)).toBe('됬어요');
      expect(question.getOption(2)).toBe('됐어요');
      expect(question.getOption(3)).toBe('됬었어요');
      expect(question.getOption(4)).toBe('되었어요');
      expect(question.getOption(5)).toBe('되여요');
    });

    it('should return null for invalid option numbers', () => {
      expect(question.getOption(0)).toBeNull();
      expect(question.getOption(6)).toBeNull();
      expect(question.getOption(-1)).toBeNull();
    });
  });

  describe('isCorrect', () => {
    it('should return true for correct answer', () => {
      expect(question.isCorrect(2)).toBe(true);
    });

    it('should return false for incorrect answers', () => {
      expect(question.isCorrect(1)).toBe(false);
      expect(question.isCorrect(3)).toBe(false);
      expect(question.isCorrect(4)).toBe(false);
      expect(question.isCorrect(5)).toBe(false);
    });
  });

  describe('isValidAnswer (static)', () => {
    it('should return true for valid answers (1-5)', () => {
      expect(QuizQuestion.isValidAnswer(1)).toBe(true);
      expect(QuizQuestion.isValidAnswer(2)).toBe(true);
      expect(QuizQuestion.isValidAnswer(3)).toBe(true);
      expect(QuizQuestion.isValidAnswer(4)).toBe(true);
      expect(QuizQuestion.isValidAnswer(5)).toBe(true);
    });

    it('should return false for invalid answers', () => {
      expect(QuizQuestion.isValidAnswer(0)).toBe(false);
      expect(QuizQuestion.isValidAnswer(6)).toBe(false);
      expect(QuizQuestion.isValidAnswer(-1)).toBe(false);
      expect(QuizQuestion.isValidAnswer(1.5)).toBe(false);
      expect(QuizQuestion.isValidAnswer('2')).toBe(false);
      expect(QuizQuestion.isValidAnswer(null)).toBe(false);
      expect(QuizQuestion.isValidAnswer(undefined)).toBe(false);
    });
  });

  describe('getPreview', () => {
    it('should return full question if 50 chars or less', () => {
      const shortQuestion = new QuizQuestion({
        category: '수학',
        question: '2 + 2 = ?',
        option1: '3',
        option2: '4',
        option3: '5',
        option4: '6',
        option5: '7',
        answer: 2,
        explanation: '4입니다.',
        createdBy: 'user123',
      });
      expect(shortQuestion.getPreview()).toBe('2 + 2 = ?');
    });

    it('should truncate and add ellipsis if over 50 chars', () => {
      const longQuestion = new QuizQuestion({
        category: '국어',
        question: '다음 글을 읽고 작가가 말하고자 하는 바를 가장 잘 나타낸 것을 고르시오. 이것은 매우 긴 문장입니다.',
        option1: '선택1',
        option2: '선택2',
        option3: '선택3',
        option4: '선택4',
        option5: '선택5',
        answer: 1,
        explanation: '설명',
        createdBy: 'user123',
      });
      const preview = longQuestion.getPreview();
      expect(preview.length).toBe(53); // 50 chars + '...'
      expect(preview.endsWith('...')).toBe(true);
      expect(preview.startsWith('다음 글을 읽고')).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should return a plain object with all properties', () => {
      const json = question.toJSON();
      expect(json).toEqual({
        id: 1,
        category: '국어',
        question: '다음 중 맞춤법이 올바른 것은?',
        option1: '됬어요',
        option2: '됐어요',
        option3: '됬었어요',
        option4: '되었어요',
        option5: '되여요',
        answer: 2,
        explanation: '\'되다\'의 과거형은 \'됐다\'입니다.',
        createdBy: 'user123',
        createdAt: '2025-01-01T00:00:00.000Z',
      });
    });
  });
});
