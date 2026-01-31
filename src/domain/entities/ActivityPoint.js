/**
 * ActivityPoint Entity
 * Represents a user's activity points in the server
 */
class ActivityPoint {
  /**
   * @param {Object} params
   * @param {string} params.userId - Discord user ID
   * @param {number} [params.points=0] - Total points accumulated
   * @param {Date|null} [params.lastAccumulatedAt=null] - Last time points were accumulated
   */
  constructor({ userId, points = 0, lastAccumulatedAt = null }) {
    this.userId = userId;
    this.points = points;
    this.lastAccumulatedAt = lastAccumulatedAt;
  }

  /**
   * Check if user can accumulate points (cooldown expired)
   * @param {number} cooldownMinutes - Cooldown period in minutes
   * @returns {boolean}
   */
  canAccumulate(cooldownMinutes) {
    if (!this.lastAccumulatedAt) return true;

    const now = new Date();
    const lastAccumulated = new Date(this.lastAccumulatedAt);
    const diffMinutes = (now - lastAccumulated) / (1000 * 60);

    return diffMinutes >= cooldownMinutes;
  }

  /**
   * Add points to the user's total
   * @param {number} amount - Amount of points to add
   * @returns {number} - New total points
   */
  addPoints(amount) {
    this.points = Math.max(0, this.points + amount);
    this.lastAccumulatedAt = new Date();
    return this.points;
  }

  /**
   * Set points to a specific value
   * @param {number} amount - New point value
   * @returns {number} - New total points
   */
  setPoints(amount) {
    this.points = Math.max(0, amount);
    return this.points;
  }

  /**
   * Reset points to zero
   * @returns {number} - New total points (0)
   */
  resetPoints() {
    this.points = 0;
    this.lastAccumulatedAt = null;
    return this.points;
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      userId: this.userId,
      points: this.points,
      lastAccumulatedAt: this.lastAccumulatedAt,
    };
  }
}

module.exports = ActivityPoint;
