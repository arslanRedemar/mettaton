const QuizPublishHistory = require('../../domain/entities/QuizPublishHistory');

/**
 * QuizPublishHistory Mapper
 * Maps between QuizPublishHistory entity and database model
 */
class QuizPublishHistoryMapper {
  /**
   * Convert database row to QuizPublishHistory entity
   * @param {Object} row - Database row
   * @returns {QuizPublishHistory}
   */
  static toDomain(row) {
    if (!row) return null;

    return new QuizPublishHistory({
      id: row.id,
      questionId: row.question_id,
      publishedDate: row.published_date,
      messageId: row.message_id,
      explanationRevealed: Boolean(row.explanation_revealed),
      publishedAt: row.published_at,
    });
  }

  /**
   * Convert QuizPublishHistory entity to database model
   * @param {QuizPublishHistory} entity - QuizPublishHistory entity
   * @returns {Object} - Database model
   */
  static toModel(entity) {
    return {
      id: entity.id,
      question_id: entity.questionId,
      published_date: entity.publishedDate,
      message_id: entity.messageId,
      explanation_revealed: entity.explanationRevealed ? 1 : 0,
      published_at: entity.publishedAt,
    };
  }
}

module.exports = QuizPublishHistoryMapper;
