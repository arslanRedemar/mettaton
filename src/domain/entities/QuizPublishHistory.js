/**
 * QuizPublishHistory Entity
 * Represents a record of a quiz being published
 */
class QuizPublishHistory {
  /**
   * @param {Object} params
   * @param {number} [params.id] - History ID
   * @param {number} params.questionId - Question ID
   * @param {string} params.publishedDate - Published date (YYYY-MM-DD)
   * @param {string} [params.messageId] - Discord message ID
   * @param {boolean} [params.explanationRevealed=false] - Whether explanation was revealed
   * @param {string} [params.publishedAt] - Published timestamp
   */
  constructor({
    id,
    questionId,
    publishedDate,
    messageId = null,
    explanationRevealed = false,
    publishedAt,
  }) {
    this.id = id;
    this.questionId = questionId;
    this.publishedDate = publishedDate;
    this.messageId = messageId;
    this.explanationRevealed = explanationRevealed;
    this.publishedAt = publishedAt;
  }

  /**
   * Mark explanation as revealed
   */
  revealExplanation() {
    this.explanationRevealed = true;
  }

  /**
   * Check if explanation has been revealed
   * @returns {boolean}
   */
  isExplanationRevealed() {
    return this.explanationRevealed === true || this.explanationRevealed === 1;
  }

  /**
   * Get today's date in YYYY-MM-DD format
   * @returns {string}
   */
  static getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Check if this is today's quiz
   * @returns {boolean}
   */
  isToday() {
    return this.publishedDate === QuizPublishHistory.getTodayDate();
  }

  /**
   * Convert to JSON object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      questionId: this.questionId,
      publishedDate: this.publishedDate,
      messageId: this.messageId,
      explanationRevealed: this.explanationRevealed,
      publishedAt: this.publishedAt,
    };
  }
}

module.exports = QuizPublishHistory;
