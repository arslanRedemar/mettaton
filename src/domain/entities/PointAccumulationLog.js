/**
 * PointAccumulationLog Entity
 * Tracks per-user, per-activity-type cooldown and daily accumulation
 */
class PointAccumulationLog {
  /**
   * @param {Object} params
   * @param {string} params.userId - Discord user ID
   * @param {string} params.activityType - Activity type key
   * @param {Date|null} [params.lastAccumulatedAt=null] - Last accumulation time
   * @param {number} [params.dailyCount=0] - Number of accumulations today
   * @param {string|null} [params.dailyDate=null] - Date of daily count (YYYY-MM-DD)
   */
  constructor({ userId, activityType, lastAccumulatedAt = null, dailyCount = 0, dailyDate = null }) {
    this.userId = userId;
    this.activityType = activityType;
    this.lastAccumulatedAt = lastAccumulatedAt;
    this.dailyCount = dailyCount;
    this.dailyDate = dailyDate;
  }

  /**
   * Check if cooldown has expired for this activity type
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
   * Check if daily cap has been reached
   * @param {number|null} dailyCap - Max accumulations per day (null = unlimited)
   * @returns {boolean}
   */
  isDailyCapReached(dailyCap) {
    if (dailyCap === null || dailyCap === undefined) return false;
    const today = new Date().toISOString().split('T')[0];
    if (this.dailyDate !== today) return false;
    return this.dailyCount >= dailyCap;
  }

  /**
   * Record an accumulation event
   */
  recordAccumulation() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    this.lastAccumulatedAt = now;
    if (this.dailyDate === today) {
      this.dailyCount += 1;
    } else {
      this.dailyDate = today;
      this.dailyCount = 1;
    }
  }

  toJSON() {
    return {
      userId: this.userId,
      activityType: this.activityType,
      lastAccumulatedAt: this.lastAccumulatedAt,
      dailyCount: this.dailyCount,
      dailyDate: this.dailyDate,
    };
  }
}

module.exports = PointAccumulationLog;
