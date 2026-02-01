/**
 * QuizAnswer Entity
 * Represents a user's answer to a quiz question
 */
class QuizAnswer {
  /**
   * @param {Object} params
   * @param {number} [params.id] - Answer ID
   * @param {number} params.questionId - Question ID
   * @param {string} params.userId - Discord user ID
   * @param {number} params.selectedOption - Selected option (1-5)
   * @param {boolean} params.isCorrect - Whether answer is correct
   * @param {number} [params.pointsAwarded=0] - Points awarded
   * @param {string} [params.submittedAt] - Submission timestamp
   * @param {string} [params.updatedAt] - Last update timestamp
   */
  constructor({
    id,
    questionId,
    userId,
    selectedOption,
    isCorrect,
    pointsAwarded = 0,
    submittedAt,
    updatedAt,
  }) {
    this.id = id;
    this.questionId = questionId;
    this.userId = userId;
    this.selectedOption = selectedOption;
    this.isCorrect = isCorrect;
    this.pointsAwarded = pointsAwarded;
    this.submittedAt = submittedAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Update the selected option
   * @param {number} newOption - New selected option (1-5)
   * @param {boolean} isCorrect - Whether new answer is correct
   */
  updateAnswer(newOption, isCorrect) {
    this.selectedOption = newOption;
    this.isCorrect = isCorrect;
  }

  /**
   * Award points to this answer
   * @param {number} points - Points to award
   */
  awardPoints(points) {
    this.pointsAwarded = points;
  }

  /**
   * Check if points have been awarded
   * @returns {boolean}
   */
  hasPointsAwarded() {
    return this.pointsAwarded > 0;
  }

  /**
   * Validate option number
   * @param {number} option - Option to validate
   * @returns {boolean} - True if valid (1-5)
   */
  static isValidOption(option) {
    return Number.isInteger(option) && option >= 1 && option <= 5;
  }

  /**
   * Convert to JSON object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      questionId: this.questionId,
      userId: this.userId,
      selectedOption: this.selectedOption,
      isCorrect: this.isCorrect,
      pointsAwarded: this.pointsAwarded,
      submittedAt: this.submittedAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = QuizAnswer;
