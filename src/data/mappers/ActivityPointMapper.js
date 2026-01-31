const ActivityPoint = require('../../domain/entities/ActivityPoint');

/**
 * ActivityPoint Entity ↔ DB Model conversion
 */
class ActivityPointMapper {
  /**
   * DB row → ActivityPoint Entity
   * @param {Object} row - Database row
   * @returns {ActivityPoint|null}
   */
  static toEntity(row) {
    if (!row) return null;
    return new ActivityPoint({
      userId: row.user_id,
      points: row.points,
      lastAccumulatedAt: row.last_accumulated_at ? new Date(row.last_accumulated_at) : null,
    });
  }

  /**
   * ActivityPoint Entity → DB params
   * @param {ActivityPoint} activityPoint - ActivityPoint entity
   * @returns {Object}
   */
  static toDbParams(activityPoint) {
    return {
      userId: activityPoint.userId,
      points: activityPoint.points,
      lastAccumulatedAt: activityPoint.lastAccumulatedAt
        ? activityPoint.lastAccumulatedAt.toISOString()
        : null,
    };
  }
}

module.exports = ActivityPointMapper;
