const ActivityTypeConfig = require('../../domain/entities/ActivityTypeConfig');

class ActivityTypeConfigMapper {
  static toEntity(row) {
    if (!row) return null;
    return new ActivityTypeConfig({
      activityType: row.activity_type,
      points: row.points,
      cooldownMinutes: row.cooldown_minutes,
      dailyCap: row.daily_cap !== null && row.daily_cap !== undefined ? row.daily_cap : null,
      enabled: row.enabled === 1,
    });
  }

  static toDbParams(config) {
    return {
      activityType: config.activityType,
      points: config.points,
      cooldownMinutes: config.cooldownMinutes,
      dailyCap: config.dailyCap,
      enabled: config.enabled ? 1 : 0,
    };
  }
}

module.exports = ActivityTypeConfigMapper;
