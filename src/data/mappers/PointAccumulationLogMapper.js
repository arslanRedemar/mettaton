const PointAccumulationLog = require('../../domain/entities/PointAccumulationLog');

class PointAccumulationLogMapper {
  static toEntity(row) {
    if (!row) return null;
    return new PointAccumulationLog({
      userId: row.user_id,
      activityType: row.activity_type,
      lastAccumulatedAt: row.last_accumulated_at ? new Date(row.last_accumulated_at) : null,
      dailyCount: row.daily_count || 0,
      dailyDate: row.daily_date || null,
    });
  }

  static toDbParams(log) {
    return {
      userId: log.userId,
      activityType: log.activityType,
      lastAccumulatedAt: log.lastAccumulatedAt ? log.lastAccumulatedAt.toISOString() : null,
      dailyCount: log.dailyCount,
      dailyDate: log.dailyDate,
    };
  }
}

module.exports = PointAccumulationLogMapper;
