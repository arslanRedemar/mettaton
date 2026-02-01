const QuizConfig = require('../../domain/entities/QuizConfig');

/**
 * QuizConfig Mapper
 * Maps between QuizConfig entity and database model
 */
class QuizConfigMapper {
  /**
   * Convert database row to QuizConfig entity
   * @param {Object} row - Database row
   * @returns {QuizConfig}
   */
  static toDomain(row) {
    if (!row) return null;

    return new QuizConfig({
      id: row.id,
      quizChannelId: row.quiz_channel_id,
      quizTime: row.quiz_time,
      explanationTime: row.explanation_time,
      enabled: Boolean(row.enabled),
      updatedAt: row.updated_at,
    });
  }

  /**
   * Convert QuizConfig entity to database model
   * @param {QuizConfig} entity - QuizConfig entity
   * @returns {Object} - Database model
   */
  static toModel(entity) {
    return {
      id: entity.id,
      quiz_channel_id: entity.quizChannelId,
      quiz_time: entity.quizTime,
      explanation_time: entity.explanationTime,
      enabled: entity.enabled ? 1 : 0,
      updated_at: entity.updatedAt,
    };
  }
}

module.exports = QuizConfigMapper;
