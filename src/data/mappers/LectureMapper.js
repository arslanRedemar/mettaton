const Lecture = require('../../domain/entities/Lecture');

/**
 * Lecture Entity ↔ DB Model 변환
 */
class LectureMapper {
  /**
   * DB row → Lecture Entity
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
   * Lecture Entity → DB params
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
