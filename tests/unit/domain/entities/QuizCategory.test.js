const QuizCategory = require('../../../../src/domain/entities/QuizCategory');

describe('QuizCategory Entity', () => {
  let category;

  beforeEach(() => {
    category = new QuizCategory({
      name: '국어',
      createdAt: '2025-01-01T00:00:00.000Z',
    });
  });

  describe('constructor', () => {
    it('should create a quiz category with all properties', () => {
      expect(category.name).toBe('국어');
      expect(category.createdAt).toBe('2025-01-01T00:00:00.000Z');
    });
  });

  describe('isValidName (static)', () => {
    it('should return true for valid category names', () => {
      expect(QuizCategory.isValidName('국어')).toBe(true);
      expect(QuizCategory.isValidName('수학')).toBe(true);
      expect(QuizCategory.isValidName('English Grammar')).toBe(true);
      expect(QuizCategory.isValidName('a')).toBe(true); // 1 char is valid
      expect(QuizCategory.isValidName('A'.repeat(50))).toBe(true); // 50 chars is valid
    });

    it('should return false for invalid category names', () => {
      expect(QuizCategory.isValidName('')).toBe(false); // empty
      expect(QuizCategory.isValidName('   ')).toBe(false); // only spaces
      expect(QuizCategory.isValidName('A'.repeat(51))).toBe(false); // over 50 chars
      expect(QuizCategory.isValidName(123)).toBe(false); // not a string
      expect(QuizCategory.isValidName(null)).toBe(false);
      expect(QuizCategory.isValidName(undefined)).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(QuizCategory.isValidName('  국어  ')).toBe(true);
      expect(QuizCategory.isValidName('  ')).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return a plain object with all properties', () => {
      const json = category.toJSON();
      expect(json).toEqual({
        name: '국어',
        createdAt: '2025-01-01T00:00:00.000Z',
      });
    });
  });
});
