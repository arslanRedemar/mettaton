const ActivityPoint = require('../entities/ActivityPoint');

/**
 * Point Accumulation Service
 * Handles automatic point accumulation with cooldown logic
 */
class PointAccumulationService {
  /**
   * @param {Object} repository - Repository with activity point methods
   */
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Try to accumulate points for a user activity
   * @param {string} userId - Discord user ID
   * @returns {Object|null} - {accumulated: boolean, newPoints: number, message: string} or null if cooldown active
   */
  tryAccumulate(userId) {
    // Get point configuration
    const config = this.repository.getPointConfig();
    const pointsPerAction = config?.pointsPerAction || 100;
    const cooldownMinutes = config?.cooldownMinutes || 5;

    // Get user's current points
    let activityPoint = this.repository.getActivityPoint(userId);

    // If user doesn't exist, create new record
    if (!activityPoint) {
      activityPoint = new ActivityPoint({ userId, points: 0 });
    }

    // Check cooldown
    if (!activityPoint.canAccumulate(cooldownMinutes)) {
      return null; // Cooldown active, don't accumulate
    }

    // Add points and update
    activityPoint.addPoints(pointsPerAction);
    this.repository.upsertActivityPoint(activityPoint);

    return {
      accumulated: true,
      newPoints: activityPoint.points,
      pointsAdded: pointsPerAction,
    };
  }

  /**
   * Get user's current points
   * @param {string} userId - Discord user ID
   * @returns {number} - Current point total
   */
  getUserPoints(userId) {
    const activityPoint = this.repository.getActivityPoint(userId);
    return activityPoint ? activityPoint.points : 0;
  }

  /**
   * Get points ranking (top users by points)
   * @param {number} [limit=10] - Number of top users to return
   * @returns {ActivityPoint[]} - Array of activity points sorted by points descending
   */
  getRanking(limit = 10) {
    const allPoints = this.repository.getAllActivityPoints();
    return allPoints.slice(0, limit);
  }

  /**
   * Adjust points for a specific user (admin function)
   * @param {string} userId - Discord user ID
   * @param {number} amount - Amount to add (can be negative)
   * @returns {number} - New total points
   */
  adjustPoints(userId, amount) {
    let activityPoint = this.repository.getActivityPoint(userId);

    if (!activityPoint) {
      activityPoint = new ActivityPoint({ userId, points: 0 });
    }

    activityPoint.addPoints(amount);
    this.repository.upsertActivityPoint(activityPoint);

    return activityPoint.points;
  }

  /**
   * Set points for a specific user (admin function)
   * @param {string} userId - Discord user ID
   * @param {number} points - New point value
   * @returns {number} - New total points
   */
  setPoints(userId, points) {
    let activityPoint = this.repository.getActivityPoint(userId);

    if (!activityPoint) {
      activityPoint = new ActivityPoint({ userId });
    }

    activityPoint.setPoints(points);
    this.repository.upsertActivityPoint(activityPoint);

    return activityPoint.points;
  }

  /**
   * Reset points for a specific user
   * @param {string} userId - Discord user ID
   * @returns {boolean} - Success status
   */
  resetUserPoints(userId) {
    return this.repository.resetUserPoints(userId);
  }

  /**
   * Reset all user points (admin function)
   * @returns {boolean} - Success status
   */
  resetAllPoints() {
    return this.repository.resetAllPoints();
  }

  /**
   * Get current point configuration
   * @returns {Object} - {pointsPerAction: number, cooldownMinutes: number}
   */
  getConfig() {
    const config = this.repository.getPointConfig();
    return config || { pointsPerAction: 100, cooldownMinutes: 5 };
  }

  /**
   * Update point configuration (admin function)
   * @param {number} pointsPerAction - Points awarded per action
   * @param {number} cooldownMinutes - Cooldown period in minutes
   * @returns {boolean} - Success status
   */
  setConfig(pointsPerAction, cooldownMinutes) {
    return this.repository.setPointConfig(pointsPerAction, cooldownMinutes);
  }
}

module.exports = PointAccumulationService;
