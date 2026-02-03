const Lecture = require('../../domain/entities/Lecture');

/**
 * Lecture Entity ↔ DB Model Mapper (Legacy name for Schedule)
 * Transforms between Lecture domain entity and database row representation
 * Note: This is the original mapper name. Use ScheduleMapper for new code.
 */
class LectureMapper {
  /**
   * Convert database row to Lecture entity
   * @param {Object} row - Database row from lectures table
   * @param {string[]} [attendees=[]] - Array of attendee user IDs
   * @returns {Lecture|null} Lecture entity or null if row is null
   */
  static toEntity(row, attendees = []) {
    if (!row) return null;
    return new Lecture({
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
   * Convert Lecture entity to database parameters
   * @param {Lecture} lecture - Lecture entity
   * @returns {Object} Database parameters for prepared statements
   */
  static toDbParams(lecture) {
    return {
      id: lecture.id,
      title: lecture.title,
      date: lecture.date,
      start: lecture.start,
      end: lecture.end,
      location: lecture.location,
      teacher: lecture.teacher,
      messageId: lecture.messageId,
    };
  }
}

module.exports = LectureMapper;
