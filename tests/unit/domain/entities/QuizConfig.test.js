const QuizConfig = require('../../../../src/domain/entities/QuizConfig');

describe('QuizConfig Entity', () => {
  let config;

  beforeEach(() => {
    config = new QuizConfig({
      id: 1,
      quizChannelId: '123456789',
      quizTime: '09:00',
      explanationTime: '21:00',
      enabled: true,
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
  });

  describe('constructor', () => {
    it('should create a quiz config with all properties', () => {
      expect(config.id).toBe(1);
      expect(config.quizChannelId).toBe('123456789');
      expect(config.quizTime).toBe('09:00');
      expect(config.explanationTime).toBe('21:00');
      expect(config.enabled).toBe(true);
      expect(config.updatedAt).toBe('2025-01-01T00:00:00.000Z');
    });

    it('should use default values for optional properties', () => {
      const minimalConfig = new QuizConfig({});
      expect(minimalConfig.id).toBe(1);
      expect(minimalConfig.quizChannelId).toBeNull();
      expect(minimalConfig.quizTime).toBe('09:00');
      expect(minimalConfig.explanationTime).toBe('21:00');
      expect(minimalConfig.enabled).toBe(true);
    });
  });

  describe('parseTime (static)', () => {
    it('should parse valid time strings', () => {
      expect(QuizConfig.parseTime('09:00')).toEqual({ hour: 9, minute: 0 });
      expect(QuizConfig.parseTime('21:30')).toEqual({ hour: 21, minute: 30 });
      expect(QuizConfig.parseTime('00:00')).toEqual({ hour: 0, minute: 0 });
      expect(QuizConfig.parseTime('23:59')).toEqual({ hour: 23, minute: 59 });
    });

    it('should return null for invalid time strings', () => {
      expect(QuizConfig.parseTime('9:00')).toBeNull(); // missing leading zero
      expect(QuizConfig.parseTime('24:00')).toBeNull(); // hour out of range
      expect(QuizConfig.parseTime('12:60')).toBeNull(); // minute out of range
      expect(QuizConfig.parseTime('12:5')).toBeNull(); // missing leading zero
      expect(QuizConfig.parseTime('invalid')).toBeNull();
      expect(QuizConfig.parseTime('')).toBeNull();
      expect(QuizConfig.parseTime('12-30')).toBeNull();
    });
  });

  describe('isValidTime (static)', () => {
    it('should return true for valid time formats', () => {
      expect(QuizConfig.isValidTime('09:00')).toBe(true);
      expect(QuizConfig.isValidTime('21:30')).toBe(true);
      expect(QuizConfig.isValidTime('00:00')).toBe(true);
      expect(QuizConfig.isValidTime('23:59')).toBe(true);
    });

    it('should return false for invalid time formats', () => {
      expect(QuizConfig.isValidTime('9:00')).toBe(false);
      expect(QuizConfig.isValidTime('24:00')).toBe(false);
      expect(QuizConfig.isValidTime('12:60')).toBe(false);
      expect(QuizConfig.isValidTime('invalid')).toBe(false);
    });
  });

  describe('getQuizTime', () => {
    it('should return parsed quiz time', () => {
      expect(config.getQuizTime()).toEqual({ hour: 9, minute: 0 });
    });

    it('should return null for invalid quiz time', () => {
      config.quizTime = 'invalid';
      expect(config.getQuizTime()).toBeNull();
    });
  });

  describe('getExplanationTime', () => {
    it('should return parsed explanation time', () => {
      expect(config.getExplanationTime()).toEqual({ hour: 21, minute: 0 });
    });

    it('should return null for invalid explanation time', () => {
      config.explanationTime = 'invalid';
      expect(config.getExplanationTime()).toBeNull();
    });
  });

  describe('setQuizTime', () => {
    it('should set quiz time if valid', () => {
      const result = config.setQuizTime('10:30');
      expect(result).toBe(true);
      expect(config.quizTime).toBe('10:30');
    });

    it('should not set quiz time if invalid', () => {
      const result = config.setQuizTime('25:00');
      expect(result).toBe(false);
      expect(config.quizTime).toBe('09:00'); // unchanged
    });
  });

  describe('setExplanationTime', () => {
    it('should set explanation time if valid', () => {
      const result = config.setExplanationTime('22:00');
      expect(result).toBe(true);
      expect(config.explanationTime).toBe('22:00');
    });

    it('should not set explanation time if invalid', () => {
      const result = config.setExplanationTime('invalid');
      expect(result).toBe(false);
      expect(config.explanationTime).toBe('21:00'); // unchanged
    });
  });

  describe('hasChannel', () => {
    it('should return true if channel is configured', () => {
      expect(config.hasChannel()).toBe(true);
    });

    it('should return false if channel is null', () => {
      config.quizChannelId = null;
      expect(config.hasChannel()).toBe(false);
    });

    it('should return false if channel is empty string', () => {
      config.quizChannelId = '';
      expect(config.hasChannel()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return a plain object with all properties', () => {
      const json = config.toJSON();
      expect(json).toEqual({
        id: 1,
        quizChannelId: '123456789',
        quizTime: '09:00',
        explanationTime: '21:00',
        enabled: true,
        updatedAt: '2025-01-01T00:00:00.000Z',
      });
    });
  });
});
