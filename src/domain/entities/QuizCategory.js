/**
 * QuizCategory Entity
 * Represents a category for organizing quiz questions
 */
class QuizCategory {
  /**
   * @param {Object} params
   * @param {string} params.name - Category name
   * @param {string} [params.createdAt] - Creation timestamp
   */
  constructor({ name, createdAt }) {
    this.name = name;
    this.createdAt = createdAt;
  }

  /**
   * Validate category name
   * @param {string} name - Category name to validate
   * @returns {boolean} - True if valid
   */
  static isValidName(name) {
    return typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 50;
  }

  /**
   * Convert to JSON object
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      createdAt: this.createdAt,
    };
  }
}

module.exports = QuizCategory;
