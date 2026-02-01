const QuizCategory = require('../../domain/entities/QuizCategory');

/**
 * QuizCategory Mapper
 * Maps between QuizCategory entity and database model
 */
class QuizCategoryMapper {
  /**
   * Convert database row to QuizCategory entity
   * @param {Object} row - Database row
   * @returns {QuizCategory}
   */
  static toDomain(row) {
    if (!row) return null;

    return new QuizCategory({
      name: row.name,
      createdAt: row.created_at,
    });
  }

  /**
   * Convert QuizCategory entity to database model
   * @param {QuizCategory} entity - QuizCategory entity
   * @returns {Object} - Database model
   */
  static toModel(entity) {
    return {
      name: entity.name,
      created_at: entity.createdAt,
    };
  }
}

module.exports = QuizCategoryMapper;
