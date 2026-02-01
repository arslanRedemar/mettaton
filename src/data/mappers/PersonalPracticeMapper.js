const PersonalPractice = require('../../domain/entities/PersonalPractice');

/**
 * PersonalPractice Entity ↔ DB Model conversion
 */
class PersonalPracticeMapper {
  /**
   * DB row → PersonalPractice Entity
   * @param {Object} row - Database row
   * @returns {PersonalPractice|null}
   */
  static toEntity(row) {
    if (!row) return null;
    return new PersonalPractice({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      dailyGoal: row.daily_goal,
      unit: row.unit,
      startDate: row.start_date,
      endDate: row.end_date,
      messageId: row.message_id,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    });
  }

  /**
   * PersonalPractice Entity → DB params
   * @param {PersonalPractice} practice - PersonalPractice entity
   * @returns {Object}
   */
  static toDbParams(practice) {
    return {
      id: practice.id,
      userId: practice.userId,
      content: practice.content,
      dailyGoal: practice.dailyGoal,
      unit: practice.unit,
      startDate: practice.startDate,
      endDate: practice.endDate,
      messageId: practice.messageId,
    };
  }
}

module.exports = PersonalPracticeMapper;
