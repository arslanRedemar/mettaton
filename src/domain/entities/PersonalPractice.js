/**
 * PersonalPractice Entity
 * Represents a user's personal practice plan
 */
class PersonalPractice {
  /**
   * @param {Object} params
   * @param {number} [params.id] - Practice plan ID
   * @param {string} params.userId - Discord user ID
   * @param {string} params.content - Practice content description
   * @param {number} params.dailyGoal - Daily goal amount
   * @param {string} params.unit - Unit for daily goal (e.g., '분', '회', '권')
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {string|null} [params.messageId=null] - Discord message ID
   * @param {Date} [params.createdAt] - Creation timestamp
   */
  constructor({
    id,
    userId,
    content,
    dailyGoal,
    unit,
    startDate,
    endDate,
    messageId = null,
    createdAt = new Date(),
  }) {
    this.id = id;
    this.userId = userId;
    this.content = content;
    this.dailyGoal = dailyGoal;
    this.unit = unit;
    this.startDate = startDate;
    this.endDate = endDate;
    this.messageId = messageId;
    this.createdAt = createdAt;
  }

  /**
   * Check if practice plan is currently active
   * @returns {boolean}
   */
  isActive() {
    const today = new Date().toISOString().split('T')[0];
    return today >= this.startDate && today <= this.endDate;
  }

  /**
   * Check if practice plan has ended
   * @returns {boolean}
   */
  hasEnded() {
    const today = new Date().toISOString().split('T')[0];
    return today > this.endDate;
  }

  /**
   * Get total number of days in practice period
   * @returns {number}
   */
  getTotalDays() {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  }

  /**
   * Get all dates in the practice period
   * @returns {string[]} Array of date strings (YYYY-MM-DD)
   */
  getAllDates() {
    const dates = [];
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates;
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      content: this.content,
      dailyGoal: this.dailyGoal,
      unit: this.unit,
      startDate: this.startDate,
      endDate: this.endDate,
      messageId: this.messageId,
      createdAt: this.createdAt,
    };
  }
}

module.exports = PersonalPractice;
