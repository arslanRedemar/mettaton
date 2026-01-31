/**
 * ActivityPoint Repository Interface
 * Activity point repository interface (abstract)
 * Implemented in Data layer
 */
class IActivityPointRepository {
  /**
   * Get activity points for a specific user
   * @param {string} userId - Discord user ID
   * @returns {ActivityPoint|null}
   */
  getActivityPoint(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get all activity points (for ranking)
   * @returns {ActivityPoint[]}
   */
  getAllActivityPoints() {
    throw new Error('Method not implemented');
  }

  /**
   * Create or update activity points for a user
   * @param {ActivityPoint} activityPoint
   * @returns {ActivityPoint}
   */
  upsertActivityPoint(activityPoint) {
    throw new Error('Method not implemented');
  }

  /**
   * Reset points for a specific user
   * @param {string} userId - Discord user ID
   * @returns {boolean}
   */
  resetUserPoints(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Reset all user points
   * @returns {boolean}
   */
  resetAllPoints() {
    throw new Error('Method not implemented');
  }

  /**
   * Get point configuration
   * @returns {Object|null} - {pointsPerAction: number, cooldownMinutes: number}
   */
  getPointConfig() {
    throw new Error('Method not implemented');
  }

  /**
   * Set point configuration
   * @param {number} pointsPerAction - Points awarded per action
   * @param {number} cooldownMinutes - Cooldown period in minutes
   * @returns {boolean}
   */
  setPointConfig(pointsPerAction, cooldownMinutes) {
    throw new Error('Method not implemented');
  }
}

module.exports = IActivityPointRepository;
