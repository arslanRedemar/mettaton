const QuizQuestion = require('../../domain/entities/QuizQuestion');

/**
 * QuizQuestion Mapper
 * Maps between QuizQuestion entity and database model
 */
class QuizQuestionMapper {
  /**
   * Convert database row to QuizQuestion entity
   * @param {Object} row - Database row
   * @returns {QuizQuestion}
   */
  static toDomain(row) {
    if (!row) return null;

    return new QuizQuestion({
      id: row.id,
      category: row.category,
      question: row.question,
      option1: row.option_1,
      option2: row.option_2,
      option3: row.option_3,
      option4: row.option_4,
      option5: row.option_5,
      answer: row.answer,
      explanation: row.explanation,
      createdBy: row.created_by,
      createdAt: row.created_at,
    });
  }

  /**
   * Convert QuizQuestion entity to database model
   * @param {QuizQuestion} entity - QuizQuestion entity
   * @returns {Object} - Database model
   */
  static toModel(entity) {
    return {
      id: entity.id,
      category: entity.category,
      question: entity.question,
      option_1: entity.option1,
      option_2: entity.option2,
      option_3: entity.option3,
      option_4: entity.option4,
      option_5: entity.option5,
      answer: entity.answer,
      explanation: entity.explanation,
      created_by: entity.createdBy,
      created_at: entity.createdAt,
    };
  }
}

module.exports = QuizQuestionMapper;
