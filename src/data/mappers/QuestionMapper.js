const Question = require('../../domain/entities/Question');

/**
 * Question Entity ↔ DB Model Mapper
 * Handles conversion between Question domain entity and database models
 */
class QuestionMapper {
  /**
   * Convert database row to Question entity
   * @param {Object} row - Database row object
   * @param {string[]} [attendees=[]] - Array of attendee user IDs
   * @returns {Question|null} Question entity or null if row is empty
   */
  static toEntity(row, attendees = []) {
    if (!row) return null;
    return new Question({
      id: row.id,
      author: row.author,
      question: row.question,
      answer: row.answer,
      answeredBy: row.answered_by,
      attendees,
      messageId: row.message_id,
    });
  }

  /**
   * Convert Question entity to database parameters
   * @param {Question} question - Question entity
   * @returns {Object} Database parameter object
   */
  static toDbParams(question) {
    return {
      id: question.id,
      author: question.author,
      question: question.question,
      answer: question.answer,
      answeredBy: question.answeredBy,
      messageId: question.messageId,
    };
  }
}

module.exports = QuestionMapper;
