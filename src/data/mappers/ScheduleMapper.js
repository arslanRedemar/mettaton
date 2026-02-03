const Schedule = require('../../domain/entities/Schedule');

/**
 * Schedule Entity ↔ DB Model Mapper
 * Transforms between Schedule domain entity and database row representation
 */
class ScheduleMapper {
  /**
   * Convert database row to Schedule entity
   * @param {Object} row - Database row from lectures table
   * @param {string[]} [attendees=[]] - Array of attendee user IDs
   * @returns {Schedule|null} Schedule entity or null if row is null
   */
  static toEntity(row, attendees = []) {
    if (!row) return null;
    return new Schedule({
      id: row.id,
      title: row.title,
      date: row.date,
      start: row.start,
      end: row.end,
      location: row.location,
      teacher: row.teacher,
      attendees,
      messageId: row.message_id,
    });
  }

  /**
   * Convert Schedule entity to database parameters
   * @param {Schedule} schedule - Schedule entity
   * @returns {Object} Database parameters for prepared statements
   */
  static toDbParams(schedule) {
    return {
      id: schedule.id,
      title: schedule.title,
      date: schedule.date,
      start: schedule.start,
      end: schedule.end,
      location: schedule.location,
      teacher: schedule.teacher,
      messageId: schedule.messageId,
    };
  }
}

module.exports = ScheduleMapper;
