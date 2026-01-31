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
    try {
      const config = this.repository.getPointConfig();
      const pointsPerAction = config?.pointsPerAction || 100;
      const cooldownMinutes = config?.cooldownMinutes || 5;

      let activityPoint = this.repository.getActivityPoint(userId);

      if (!activityPoint) {
        activityPoint = new ActivityPoint({ userId, points: 0 });
      }

      if (!activityPoint.canAccumulate(cooldownMinutes)) {
        return null;
      }

      activityPoint.addPoints(pointsPerAction);
      this.repository.upsertActivityPoint(activityPoint);

      return {
        accumulated: true,
        newPoints: activityPoint.points,
        pointsAdded: pointsPerAction,
      };
    } catch (error) {
      console.error(`[PointService] tryAccumulate failed for user ${userId}:`, error);
      throw error;
    }
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
    try {
      let activityPoint = this.repository.getActivityPoint(userId);

      if (!activityPoint) {
        activityPoint = new ActivityPoint({ userId, points: 0 });
      }

      activityPoint.addPoints(amount);
      this.repository.upsertActivityPoint(activityPoint);

      console.log(`[PointService] Points adjusted for user ${userId}: ${amount > 0 ? '+' : ''}${amount} -> ${activityPoint.points}`);
      return activityPoint.points;
    } catch (error) {
      console.error(`[PointService] adjustPoints failed for user ${userId} (amount: ${amount}):`, error);
      throw error;
    }
  }

  /**
   * Set points for a specific user (admin function)
   * @param {string} userId - Discord user ID
   * @param {number} points - New point value
   * @returns {number} - New total points
   */
  setPoints(userId, points) {
    try {
      let activityPoint = this.repository.getActivityPoint(userId);

      if (!activityPoint) {
        activityPoint = new ActivityPoint({ userId });
      }

      activityPoint.setPoints(points);
      this.repository.upsertActivityPoint(activityPoint);

      console.log(`[PointService] Points set for user ${userId}: ${activityPoint.points}`);
      return activityPoint.points;
    } catch (error) {
      console.error(`[PointService] setPoints failed for user ${userId} (points: ${points}):`, error);
      throw error;
    }
  }

  /**
   * Reset points for a specific user
   * @param {string} userId - Discord user ID
   * @returns {boolean} - Success status
   */
  resetUserPoints(userId) {
    try {
      const result = this.repository.resetUserPoints(userId);
      console.log(`[PointService] Points reset for user ${userId}`);
      return result;
    } catch (error) {
      console.error(`[PointService] resetUserPoints failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Reset all user points (admin function)
   * @returns {boolean} - Success status
   */
  resetAllPoints() {
    try {
      const result = this.repository.resetAllPoints();
      console.log('[PointService] All user points reset');
      return result;
    } catch (error) {
      console.error('[PointService] resetAllPoints failed:', error);
      throw error;
    }
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
    try {
      const result = this.repository.setPointConfig(pointsPerAction, cooldownMinutes);
      console.log(`[PointService] Config updated: pointsPerAction=${pointsPerAction}, cooldownMinutes=${cooldownMinutes}`);
      return result;
    } catch (error) {
      console.error(`[PointService] setConfig failed (pointsPerAction: ${pointsPerAction}, cooldownMinutes: ${cooldownMinutes}):`, error);
      throw error;
    }
  }
}

module.exports = PointAccumulationService;
