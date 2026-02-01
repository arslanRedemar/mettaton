const QuizAnswer = require('../../domain/entities/QuizAnswer');

/**
 * QuizAnswer Mapper
 * Maps between QuizAnswer entity and database model
 */
class QuizAnswerMapper {
  /**
   * Convert database row to QuizAnswer entity
   * @param {Object} row - Database row
   * @returns {QuizAnswer}
   */
  static toDomain(row) {
    if (!row) return null;

    return new QuizAnswer({
      id: row.id,
      questionId: row.question_id,
      userId: row.user_id,
      selectedOption: row.selected_option,
      isCorrect: Boolean(row.is_correct),
      pointsAwarded: row.points_awarded,
      submittedAt: row.submitted_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Convert QuizAnswer entity to database model
   * @param {QuizAnswer} entity - QuizAnswer entity
   * @returns {Object} - Database model
   */
  static toModel(entity) {
    return {
      id: entity.id,
      question_id: entity.questionId,
      user_id: entity.userId,
      selected_option: entity.selectedOption,
      is_correct: entity.isCorrect ? 1 : 0,
      points_awarded: entity.pointsAwarded,
      submitted_at: entity.submittedAt,
      updated_at: entity.updatedAt,
    };
  }
}

module.exports = QuizAnswerMapper;
