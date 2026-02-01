/**
 * QuizConfig Entity
 * Represents configuration for quiz auto-publishing
 */
class QuizConfig {
  /**
   * @param {Object} params
   * @param {number} [params.id=1] - Config ID (singleton)
   * @param {string} [params.quizChannelId] - Channel ID for quiz publishing
   * @param {string} [params.quizTime='09:00'] - Quiz publish time (HH:MM)
   * @param {string} [params.explanationTime='21:00'] - Explanation reveal time (HH:MM)
   * @param {boolean} [params.enabled=true] - Whether auto-publish is enabled
   * @param {string} [params.updatedAt] - Last update timestamp
   */
  constructor({
    id = 1,
    quizChannelId = null,
    quizTime = '09:00',
    explanationTime = '21:00',
    enabled = true,
    updatedAt,
  }) {
    this.id = id;
    this.quizChannelId = quizChannelId;
    this.quizTime = quizTime;
    this.explanationTime = explanationTime;
    this.enabled = enabled;
    this.updatedAt = updatedAt;
  }

  /**
   * Parse time string (HH:MM) to hour and minute
   * @param {string} timeStr - Time string in HH:MM format
   * @returns {{hour: number, minute: number}|null} - Parsed time or null if invalid
   */
  static parseTime(timeStr) {
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    const match = timeStr.match(timeRegex);
    if (!match) return null;
    return {
      hour: parseInt(match[1], 10),
      minute: parseInt(match[2], 10),
    };
  }

  /**
   * Validate time string format
   * @param {string} timeStr - Time string to validate
   * @returns {boolean} - True if valid HH:MM format
   */
  static isValidTime(timeStr) {
    return QuizConfig.parseTime(timeStr) !== null;
  }

  /**
   * Get quiz time as {hour, minute}
   * @returns {{hour: number, minute: number}|null}
   */
  getQuizTime() {
    return QuizConfig.parseTime(this.quizTime);
  }

  /**
   * Get explanation time as {hour, minute}
   * @returns {{hour: number, minute: number}|null}
   */
  getExplanationTime() {
    return QuizConfig.parseTime(this.explanationTime);
  }

  /**
   * Set quiz time
   * @param {string} timeStr - Time in HH:MM format
   * @returns {boolean} - True if valid and set
   */
  setQuizTime(timeStr) {
    if (!QuizConfig.isValidTime(timeStr)) return false;
    this.quizTime = timeStr;
    return true;
  }

  /**
   * Set explanation time
   * @param {string} timeStr - Time in HH:MM format
   * @returns {boolean} - True if valid and set
   */
  setExplanationTime(timeStr) {
    if (!QuizConfig.isValidTime(timeStr)) return false;
    this.explanationTime = timeStr;
    return true;
  }

  /**
   * Check if quiz channel is configured
   * @returns {boolean}
   */
  hasChannel() {
    return this.quizChannelId !== null && this.quizChannelId !== '';
  }

  /**
   * Convert to JSON object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      quizChannelId: this.quizChannelId,
      quizTime: this.quizTime,
      explanationTime: this.explanationTime,
      enabled: this.enabled,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = QuizConfig;
