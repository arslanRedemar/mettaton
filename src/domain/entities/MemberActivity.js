/**
 * MemberActivity Entity
 * Represents a member's last activity timestamp in the server
 */
class MemberActivity {
  /**
   * @param {Object} params
   * @param {string} params.userId - Discord user ID
   * @param {Date} params.lastActiveAt - Last activity timestamp
   */
  constructor({ userId, lastActiveAt }) {
    this.userId = userId;
    this.lastActiveAt = lastActiveAt;
  }

  /**
   * Check if member is inactive based on threshold days
   * @param {number} thresholdDays - Number of days to consider inactive
   * @returns {boolean} - True if inactive, false otherwise
   */
  isInactive(thresholdDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);
    return this.lastActiveAt < cutoffDate;
  }

  /**
   * Calculate days since last activity
   * @returns {number} - Number of days since last activity
   */
  getDaysSinceLastActivity() {
    const now = new Date();
    const diffMs = now - this.lastActiveAt;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Update last active timestamp to current time
   * @returns {Date} - New lastActiveAt timestamp
   */
  updateActivity() {
    this.lastActiveAt = new Date();
    return this.lastActiveAt;
  }

  /**
   * Format last active date for display (Korean locale)
   * @returns {string} - Formatted date string
   */
  formatLastActive() {
    return this.lastActiveAt.toLocaleDateString('ko-KR');
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      userId: this.userId,
      lastActiveAt: this.lastActiveAt,
    };
  }
}

module.exports = MemberActivity;
