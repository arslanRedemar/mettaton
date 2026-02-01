const ActivityPoint = require('../entities/ActivityPoint');
const PointAccumulationLog = require('../entities/PointAccumulationLog');
const ActivityTypeConfig = require('../entities/ActivityTypeConfig');

/**
 * Point Accumulation Service
 * Handles activity-type-aware point accumulation with per-type cooldowns and daily caps
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
   * @param {string} activityType - Activity type key (e.g. 'GENERAL', 'FORUM_POST')
   * @returns {Object|null} - {accumulated, newPoints, pointsAdded, activityType} or null if blocked
   */
  tryAccumulate(userId, activityType) {
    try {
      const typeConfig = this.repository.getActivityTypeConfig(activityType);
      if (!typeConfig || !typeConfig.enabled) {
        return null;
      }

      let log = this.repository.getAccumulationLog(userId, activityType);
      if (!log) {
        log = new PointAccumulationLog({ userId, activityType });
      }

      if (!log.canAccumulate(typeConfig.cooldownMinutes)) {
        return null;
      }

      if (log.isDailyCapReached(typeConfig.dailyCap)) {
        return null;
      }

      let activityPoint = this.repository.getActivityPoint(userId);
      if (!activityPoint) {
        activityPoint = new ActivityPoint({ userId, points: 0 });
      }

      activityPoint.addPoints(typeConfig.points);
      this.repository.upsertActivityPoint(activityPoint);

      log.recordAccumulation();
      this.repository.upsertAccumulationLog(log);

      // Record award history
      this.repository.insertPointAwardHistory(userId, activityType, typeConfig.points);

      return {
        accumulated: true,
        newPoints: activityPoint.points,
        pointsAdded: typeConfig.points,
        activityType,
      };
    } catch (error) {
      console.error(`[PointService] tryAccumulate failed for user ${userId} (type: ${activityType}):`, error);
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
      this.repository.resetUserAccumulationLogs(userId);
      this.repository.resetUserPointAwardHistory(userId);
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
      this.repository.resetAllAccumulationLogs();
      this.repository.resetAllPointAwardHistory();
      console.log('[PointService] All user points reset');
      return result;
    } catch (error) {
      console.error('[PointService] resetAllPoints failed:', error);
      throw error;
    }
  }

  /**
   * Get current point configuration (legacy)
   * @returns {Object} - {pointsPerAction: number, cooldownMinutes: number}
   */
  getConfig() {
    const config = this.repository.getPointConfig();
    return config || { pointsPerAction: 100, cooldownMinutes: 5 };
  }

  /**
   * Update point configuration (legacy, admin function)
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

  /**
   * Get configuration for a specific activity type
   * @param {string} activityType - Activity type key
   * @returns {ActivityTypeConfig|null}
   */
  getActivityTypeConfig(activityType) {
    return this.repository.getActivityTypeConfig(activityType);
  }

  /**
   * Get all activity type configurations
   * @returns {ActivityTypeConfig[]}
   */
  getAllActivityTypeConfigs() {
    return this.repository.getAllActivityTypeConfigs();
  }

  /**
   * Set configuration for a specific activity type (admin function)
   * @param {string} activityType - Activity type key
   * @param {number} points - Points awarded per action
   * @param {number} cooldownMinutes - Cooldown in minutes
   * @param {number|null} dailyCap - Daily cap (null = no cap)
   * @param {boolean} enabled - Whether this type is enabled
   * @returns {boolean}
   */
  setActivityTypeConfig(activityType, points, cooldownMinutes, dailyCap = null, enabled = true) {
    try {
      const config = new ActivityTypeConfig({ activityType, points, cooldownMinutes, dailyCap, enabled });
      this.repository.setActivityTypeConfig(config);
      console.log(`[PointService] Activity type config updated: ${activityType} = ${points}pts, ${cooldownMinutes}min CD, cap=${dailyCap}, enabled=${enabled}`);
      return true;
    } catch (error) {
      console.error(`[PointService] setActivityTypeConfig failed for ${activityType}:`, error);
      throw error;
    }
  }

  /**
   * Get point award history for a user
   * @param {string} userId - Discord user ID
   * @param {string} [startDate] - Start date (YYYY-MM-DD), optional
   * @param {string} [endDate] - End date (YYYY-MM-DD), optional
   * @returns {Array<{activityType: string, totalPoints: number}>}
   */
  getPointHistory(userId, startDate, endDate) {
    try {
      return this.repository.getPointAwardHistory(userId, startDate, endDate);
    } catch (error) {
      console.error(`[PointService] getPointHistory failed for user ${userId}:`, error);
      throw error;
    }
  }
}

module.exports = PointAccumulationService;
