const Question = require('../../domain/entities/Question');

/**
 * Question Entity ↔ DB Model 변환
 */
class QuestionMapper {
  /**
   * DB row → Question Entity
   */
  static toEntity(row) {
    if (!row) return null;
    return new Question({
      id: row.id,
      author: row.author,
      question: row.question,
      answer: row.answer,
      answeredBy: row.answered_by,
      messageId: row.message_id,
    });
  }

  /**
   * Question Entity → DB params
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
