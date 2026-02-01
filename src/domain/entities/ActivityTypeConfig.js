/**
 * ActivityTypeConfig Entity
 * Represents configuration for a specific activity type
 */
class ActivityTypeConfig {
  /**
   * @param {Object} params
   * @param {string} params.activityType - Activity type key
   * @param {number} params.points - Points awarded per action
   * @param {number} params.cooldownMinutes - Cooldown in minutes
   * @param {number|null} [params.dailyCap=null] - Daily cap (null = no cap)
   * @param {boolean} [params.enabled=true] - Whether this type is enabled
   */
  constructor({ activityType, points, cooldownMinutes, dailyCap = null, enabled = true }) {
    this.activityType = activityType;
    this.points = points;
    this.cooldownMinutes = cooldownMinutes;
    this.dailyCap = dailyCap;
    this.enabled = enabled;
  }

  toJSON() {
    return {
      activityType: this.activityType,
      points: this.points,
      cooldownMinutes: this.cooldownMinutes,
      dailyCap: this.dailyCap,
      enabled: this.enabled,
    };
  }
}

module.exports = ActivityTypeConfig;
