const { getDatabase } = require('../datasource/database');
const {
  QuizQuestionMapper,
  QuizConfigMapper,
  QuizCategoryMapper,
  QuizPublishHistoryMapper,
  QuizAnswerMapper,
} = require('../mappers');
const IQuizRepository = require('../../domain/repositories/IQuizRepository');

/**
 * SQLite Quiz Repository Implementation
 * Implements IQuizRepository interface
 */
class SqliteQuizRepository extends IQuizRepository {
  constructor() {
    super();
    this.db = null;
    this.stmts = {};
  }

  init() {
    this.db = getDatabase();
    this._prepareStatements();
  }

  _prepareStatements() {
    // QuizQuestion statements
    this.stmts.getAllQuizQuestions = this.db.prepare(`
      SELECT * FROM quiz_questions ORDER BY id DESC
    `);

    this.stmts.getQuizQuestionById = this.db.prepare(`
      SELECT * FROM quiz_questions WHERE id = ?
    `);

    this.stmts.getQuizQuestionsByCategory = this.db.prepare(`
      SELECT * FROM quiz_questions WHERE category = ? ORDER BY id DESC
    `);

    this.stmts.insertQuizQuestion = this.db.prepare(`
      INSERT INTO quiz_questions (category, question, option_1, option_2, option_3, option_4, option_5, answer, explanation, created_by)
      VALUES (@category, @question, @option_1, @option_2, @option_3, @option_4, @option_5, @answer, @explanation, @created_by)
    `);

    this.stmts.updateQuizQuestion = this.db.prepare(`
      UPDATE quiz_questions
      SET category = @category, question = @question, option_1 = @option_1, option_2 = @option_2,
          option_3 = @option_3, option_4 = @option_4, option_5 = @option_5, answer = @answer,
          explanation = @explanation
      WHERE id = @id
    `);

    this.stmts.deleteQuizQuestion = this.db.prepare(`
      DELETE FROM quiz_questions WHERE id = ?
    `);

    this.stmts.checkDuplicateQuestion = this.db.prepare(`
      SELECT COUNT(*) as count FROM quiz_questions WHERE question = ?
    `);

    this.stmts.getUnpublishedQuestions = this.db.prepare(`
      SELECT * FROM quiz_questions
      WHERE id NOT IN (SELECT question_id FROM quiz_publish_history)
      ORDER BY id
    `);

    // QuizConfig statements
    this.stmts.getQuizConfig = this.db.prepare(`
      SELECT * FROM quiz_config WHERE id = 1
    `);

    this.stmts.updateQuizConfig = this.db.prepare(`
      INSERT INTO quiz_config (id, quiz_channel_id, quiz_time, explanation_time, enabled, updated_at)
      VALUES (1, @quiz_channel_id, @quiz_time, @explanation_time, @enabled, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        quiz_channel_id = @quiz_channel_id,
        quiz_time = @quiz_time,
        explanation_time = @explanation_time,
        enabled = @enabled,
        updated_at = CURRENT_TIMESTAMP
    `);

    // QuizCategory statements
    this.stmts.getAllCategories = this.db.prepare(`
      SELECT * FROM quiz_categories ORDER BY name
    `);

    this.stmts.getCategoryByName = this.db.prepare(`
      SELECT * FROM quiz_categories WHERE name = ?
    `);

    this.stmts.insertCategory = this.db.prepare(`
      INSERT INTO quiz_categories (name) VALUES (?)
    `);

    this.stmts.deleteCategory = this.db.prepare(`
      DELETE FROM quiz_categories WHERE name = ?
    `);

    this.stmts.getQuestionCountByCategory = this.db.prepare(`
      SELECT COUNT(*) as count FROM quiz_questions WHERE category = ?
    `);

    // QuizPublishHistory statements
    this.stmts.getAllPublishHistory = this.db.prepare(`
      SELECT * FROM quiz_publish_history ORDER BY published_date DESC
    `);

    this.stmts.getPublishHistoryByDate = this.db.prepare(`
      SELECT * FROM quiz_publish_history WHERE published_date = ?
    `);

    this.stmts.insertPublishHistory = this.db.prepare(`
      INSERT INTO quiz_publish_history (question_id, published_date, message_id, explanation_revealed)
      VALUES (@question_id, @published_date, @message_id, @explanation_revealed)
    `);

    this.stmts.updatePublishHistory = this.db.prepare(`
      UPDATE quiz_publish_history
      SET message_id = @message_id, explanation_revealed = @explanation_revealed
      WHERE id = @id
    `);

    this.stmts.deleteAllPublishHistory = this.db.prepare(`
      DELETE FROM quiz_publish_history
    `);

    this.stmts.getPublishedQuestionCount = this.db.prepare(`
      SELECT COUNT(DISTINCT question_id) as count FROM quiz_publish_history
    `);

    // QuizAnswer statements
    this.stmts.getAnswerByQuestionAndUser = this.db.prepare(`
      SELECT * FROM quiz_answers WHERE question_id = ? AND user_id = ?
    `);

    this.stmts.getAnswersByQuestion = this.db.prepare(`
      SELECT * FROM quiz_answers WHERE question_id = ?
    `);

    this.stmts.insertAnswer = this.db.prepare(`
      INSERT INTO quiz_answers (question_id, user_id, selected_option, is_correct, points_awarded, submitted_at)
      VALUES (@question_id, @user_id, @selected_option, @is_correct, @points_awarded, CURRENT_TIMESTAMP)
      ON CONFLICT(question_id, user_id) DO UPDATE SET
        selected_option = @selected_option,
        is_correct = @is_correct,
        updated_at = CURRENT_TIMESTAMP
    `);

    this.stmts.updateAnswer = this.db.prepare(`
      UPDATE quiz_answers
      SET selected_option = @selected_option, is_correct = @is_correct, points_awarded = @points_awarded, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    this.stmts.getCorrectAnswerCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM quiz_answers WHERE question_id = ? AND is_correct = 1
    `);

    this.stmts.getParticipantCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM quiz_answers WHERE question_id = ?
    `);

    this.stmts.getUnawardedAnswers = this.db.prepare(`
      SELECT * FROM quiz_answers WHERE question_id = ? AND points_awarded = 0
    `);
  }

  // ========== QuizQuestion Methods ==========

  getAllQuizQuestions() {
    const rows = this.stmts.getAllQuizQuestions.all();
    return rows.map((row) => QuizQuestionMapper.toDomain(row));
  }

  getQuizQuestionById(id) {
    const row = this.stmts.getQuizQuestionById.get(id);
    return QuizQuestionMapper.toDomain(row);
  }

  getQuizQuestionsByCategory(category) {
    const rows = this.stmts.getQuizQuestionsByCategory.all(category);
    return rows.map((row) => QuizQuestionMapper.toDomain(row));
  }

  addQuizQuestion(question) {
    const model = QuizQuestionMapper.toModel(question);
    const result = this.stmts.insertQuizQuestion.run(model);
    question.id = result.lastInsertRowid;
    return question;
  }

  updateQuizQuestion(question) {
    const model = QuizQuestionMapper.toModel(question);
    const result = this.stmts.updateQuizQuestion.run(model);
    return result.changes > 0;
  }

  deleteQuizQuestion(id) {
    const result = this.stmts.deleteQuizQuestion.run(id);
    return result.changes > 0;
  }

  isDuplicateQuestion(question) {
    const result = this.stmts.checkDuplicateQuestion.get(question);
    return result.count > 0;
  }

  getUnpublishedQuestions() {
    const rows = this.stmts.getUnpublishedQuestions.all();
    return rows.map((row) => QuizQuestionMapper.toDomain(row));
  }

  // ========== QuizConfig Methods ==========

  getQuizConfig() {
    const row = this.stmts.getQuizConfig.get();
    return QuizConfigMapper.toDomain(row);
  }

  updateQuizConfig(config) {
    const model = QuizConfigMapper.toModel(config);
    this.stmts.updateQuizConfig.run(model);
    return true;
  }

  // ========== QuizCategory Methods ==========

  getAllCategories() {
    const rows = this.stmts.getAllCategories.all();
    return rows.map((row) => QuizCategoryMapper.toDomain(row));
  }

  getCategoryByName(name) {
    const row = this.stmts.getCategoryByName.get(name);
    return QuizCategoryMapper.toDomain(row);
  }

  addCategory(category) {
    this.stmts.insertCategory.run(category.name);
    return category;
  }

  deleteCategory(name) {
    const result = this.stmts.deleteCategory.run(name);
    return result.changes > 0;
  }

  getQuestionCountByCategory(categoryName) {
    const result = this.stmts.getQuestionCountByCategory.get(categoryName);
    return result.count;
  }

  // ========== QuizPublishHistory Methods ==========

  getAllPublishHistory() {
    const rows = this.stmts.getAllPublishHistory.all();
    return rows.map((row) => QuizPublishHistoryMapper.toDomain(row));
  }

  getPublishHistoryByDate(date) {
    const row = this.stmts.getPublishHistoryByDate.get(date);
    return QuizPublishHistoryMapper.toDomain(row);
  }

  getTodayPublishHistory() {
    const today = new Date().toISOString().split('T')[0];
    return this.getPublishHistoryByDate(today);
  }

  addPublishHistory(history) {
    const model = QuizPublishHistoryMapper.toModel(history);
    const result = this.stmts.insertPublishHistory.run(model);
    history.id = result.lastInsertRowid;
    return history;
  }

  updatePublishHistory(history) {
    const model = QuizPublishHistoryMapper.toModel(history);
    const result = this.stmts.updatePublishHistory.run(model);
    return result.changes > 0;
  }

  deleteAllPublishHistory() {
    const result = this.stmts.deleteAllPublishHistory.run();
    return result.changes;
  }

  getPublishedQuestionCount() {
    const result = this.stmts.getPublishedQuestionCount.get();
    return result.count;
  }

  // ========== QuizAnswer Methods ==========

  getAnswerByQuestionAndUser(questionId, userId) {
    const row = this.stmts.getAnswerByQuestionAndUser.get(questionId, userId);
    return QuizAnswerMapper.toDomain(row);
  }

  getAnswersByQuestion(questionId) {
    const rows = this.stmts.getAnswersByQuestion.all(questionId);
    return rows.map((row) => QuizAnswerMapper.toDomain(row));
  }

  upsertAnswer(answer) {
    const model = QuizAnswerMapper.toModel(answer);

    if (answer.id) {
      // Update existing
      this.stmts.updateAnswer.run(model);
    } else {
      // Insert or update
      const result = this.stmts.insertAnswer.run(model);
      if (!answer.id) {
        answer.id = result.lastInsertRowid;
      }
    }

    return answer;
  }

  getCorrectAnswerCount(questionId) {
    const result = this.stmts.getCorrectAnswerCount.get(questionId);
    return result.count;
  }

  getParticipantCount(questionId) {
    const result = this.stmts.getParticipantCount.get(questionId);
    return result.count;
  }

  getUnawardedAnswers(questionId) {
    const rows = this.stmts.getUnawardedAnswers.all(questionId);
    return rows.map((row) => QuizAnswerMapper.toDomain(row));
  }
}

module.exports = SqliteQuizRepository;
