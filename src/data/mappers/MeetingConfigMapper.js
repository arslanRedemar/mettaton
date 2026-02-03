const MeetingConfig = require('../../domain/entities/MeetingConfig');

/**
 * MeetingConfig Mapper
 * Maps between MeetingConfig entity and database model
 */
class MeetingConfigMapper {
  /**
   * Convert database row to MeetingConfig entity
   * @param {Object} row - Database row
   * @returns {MeetingConfig|null}
   */
  static toDomain(row) {
    if (!row) return null;

    return new MeetingConfig({
      id: row.id,
      channelId: row.channel_id,
      scheduleHour: row.schedule_hour,
      scheduleMinute: row.schedule_minute,
      meetingStartTime: row.meeting_start_time,
      meetingEndTime: row.meeting_end_time,
      location: row.location,
      activity: row.activity,
      enabled: Boolean(row.enabled),
      updatedAt: row.updated_at,
    });
  }

  /**
   * Convert MeetingConfig entity to database model
   * @param {MeetingConfig} entity - MeetingConfig entity
   * @returns {Object} - Database model
   */
  static toModel(entity) {
    return {
      id: entity.id,
      channel_id: entity.channelId,
      schedule_hour: entity.scheduleHour,
      schedule_minute: entity.scheduleMinute,
      meeting_start_time: entity.meetingStartTime,
      meeting_end_time: entity.meetingEndTime,
      location: entity.location,
      activity: entity.activity,
      enabled: entity.enabled ? 1 : 0,
      updated_at: entity.updatedAt,
    };
  }

  /**
   * Convert MeetingConfig entity to database parameters for prepared statements
   * @param {MeetingConfig} entity - MeetingConfig entity
   * @returns {Object} - Database parameters with @ prefix for named parameters
   */
  static toDbParams(entity) {
    return {
      channelId: entity.channelId,
      scheduleHour: entity.scheduleHour,
      scheduleMinute: entity.scheduleMinute,
      meetingStartTime: entity.meetingStartTime,
      meetingEndTime: entity.meetingEndTime,
      location: entity.location,
      activity: entity.activity,
      enabled: entity.enabled ? 1 : 0,
    };
  }
}

module.exports = MeetingConfigMapper;
