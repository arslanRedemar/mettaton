const Question = require('../../../src/domain/entities/Question');

describe('Question Entity', () => {
  let question;

  beforeEach(() => {
    question = new Question({
      id: 1,
      author: 'user123',
      question: '테스트 질문입니다.',
      answer: null,
      answeredBy: null,
      messageId: null,
    });
  });

  describe('constructor', () => {
    it('should create a question with all properties', () => {
      expect(question.id).toBe(1);
      expect(question.author).toBe('user123');
      expect(question.question).toBe('테스트 질문입니다.');
      expect(question.answer).toBeNull();
      expect(question.answeredBy).toBeNull();
      expect(question.messageId).toBeNull();
    });

    it('should use default values for optional properties', () => {
      const minimalQuestion = new Question({
        author: 'user456',
        question: '간단한 질문',
      });

      expect(minimalQuestion.answer).toBeNull();
      expect(minimalQuestion.answeredBy).toBeNull();
      expect(minimalQuestion.messageId).toBeNull();
    });

    it('should create a question with answer', () => {
      const answeredQuestion = new Question({
        id: 2,
        author: 'user123',
        question: '답변된 질문',
        answer: '이것이 답변입니다.',
        answeredBy: 'admin456',
        messageId: 'msg789',
      });

      expect(answeredQuestion.answer).toBe('이것이 답변입니다.');
      expect(answeredQuestion.answeredBy).toBe('admin456');
    });
  });

  describe('setAnswer', () => {
    it('should set answer and answeredBy', () => {
      question.setAnswer('답변 내용', 'admin123');

      expect(question.answer).toBe('답변 내용');
      expect(question.answeredBy).toBe('admin123');
    });

    it('should overwrite existing answer', () => {
      question.setAnswer('첫 번째 답변', 'admin1');
      question.setAnswer('수정된 답변', 'admin2');

      expect(question.answer).toBe('수정된 답변');
      expect(question.answeredBy).toBe('admin2');
    });
  });

  describe('isAnswered', () => {
    it('should return false for unanswered question', () => {
      expect(question.isAnswered()).toBe(false);
    });

    it('should return true for answered question', () => {
      question.setAnswer('답변', 'admin');

      expect(question.isAnswered()).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation for unanswered question', () => {
      question.messageId = 'msg123';

      const json = question.toJSON();

      expect(json).toEqual({
        id: 1,
        author: 'user123',
        question: '테스트 질문입니다.',
        answer: null,
        answeredBy: null,
        messageId: 'msg123',
      });
    });

    it('should return correct JSON representation for answered question', () => {
      question.setAnswer('답변 내용', 'admin456');
      question.messageId = 'msg123';

      const json = question.toJSON();

      expect(json).toEqual({
        id: 1,
        author: 'user123',
        question: '테스트 질문입니다.',
        answer: '답변 내용',
        answeredBy: 'admin456',
        messageId: 'msg123',
      });
    });
  });
});
