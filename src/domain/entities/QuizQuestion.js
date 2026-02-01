/**
 * QuizQuestion Entity
 * Represents a CSAT-style multiple choice question
 */
class QuizQuestion {
  /**
   * @param {Object} params
   * @param {number} [params.id] - Question ID
   * @param {string} params.category - Category name
   * @param {string} params.question - Question text
   * @param {string} params.option1 - Option 1 text
   * @param {string} params.option2 - Option 2 text
   * @param {string} params.option3 - Option 3 text
   * @param {string} params.option4 - Option 4 text
   * @param {string} params.option5 - Option 5 text
   * @param {number} params.answer - Correct answer (1-5)
   * @param {string} params.explanation - Explanation text
   * @param {string} params.createdBy - Discord user ID of creator
   * @param {string} [params.createdAt] - Creation timestamp
   */
  constructor({
    id,
    category,
    question,
    option1,
    option2,
    option3,
    option4,
    option5,
    answer,
    explanation,
    createdBy,
    createdAt,
  }) {
    this.id = id;
    this.category = category;
    this.question = question;
    this.option1 = option1;
    this.option2 = option2;
    this.option3 = option3;
    this.option4 = option4;
    this.option5 = option5;
    this.answer = answer;
    this.explanation = explanation;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
  }

  /**
   * Get all options as an array
   * @returns {string[]} - Array of 5 options
   */
  getOptions() {
    return [this.option1, this.option2, this.option3, this.option4, this.option5];
  }

  /**
   * Get a specific option by number (1-5)
   * @param {number} num - Option number (1-5)
   * @returns {string|null} - Option text or null if invalid
   */
  getOption(num) {
    if (num < 1 || num > 5) return null;
    return this[`option${num}`];
  }

  /**
   * Check if a given answer is correct
   * @param {number} selectedOption - Selected option number (1-5)
   * @returns {boolean} - True if correct
   */
  isCorrect(selectedOption) {
    return selectedOption === this.answer;
  }

  /**
   * Validate answer number
   * @param {number} answer - Answer to validate
   * @returns {boolean} - True if valid (1-5)
   */
  static isValidAnswer(answer) {
    return Number.isInteger(answer) && answer >= 1 && answer <= 5;
  }

  /**
   * Get a preview of the question (first 50 chars)
   * @returns {string} - Question preview
   */
  getPreview() {
    if (this.question.length <= 50) return this.question;
    return `${this.question.substring(0, 50)}...`;
  }

  /**
   * Convert to JSON object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      category: this.category,
      question: this.question,
      option1: this.option1,
      option2: this.option2,
      option3: this.option3,
      option4: this.option4,
      option5: this.option5,
      answer: this.answer,
      explanation: this.explanation,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
    };
  }
}

module.exports = QuizQuestion;
