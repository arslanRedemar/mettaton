/**
 * Quiz Repository Interface
 * Abstract repository for quiz data operations
 * Implemented in Data Layer
 */
class IQuizRepository {
  // ========== QuizQuestion Methods ==========

  /**
   * Get all quiz questions
   * @returns {QuizQuestion[]}
   */
  getAllQuizQuestions() {
    throw new Error('Method not implemented');
  }

  /**
   * Get quiz question by ID
   * @param {number} id - Question ID
   * @returns {QuizQuestion|null}
   */
  getQuizQuestionById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get quiz questions by category
   * @param {string} category - Category name
   * @returns {QuizQuestion[]}
   */
  getQuizQuestionsByCategory(category) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a quiz question
   * @param {QuizQuestion} question - Question to add
   * @returns {QuizQuestion} - Added question with ID
   */
  addQuizQuestion(question) {
    throw new Error('Method not implemented');
  }

  /**
   * Update a quiz question
   * @param {QuizQuestion} question - Question to update
   * @returns {boolean} - Success status
   */
  updateQuizQuestion(question) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a quiz question
   * @param {number} id - Question ID
   * @returns {boolean} - Success status
   */
  deleteQuizQuestion(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if a question with the same content exists
   * @param {string} question - Question text
   * @returns {boolean} - True if duplicate exists
   */
  isDuplicateQuestion(question) {
    throw new Error('Method not implemented');
  }

  /**
   * Get unpublished questions (not in publish history)
   * @returns {QuizQuestion[]}
   */
  getUnpublishedQuestions() {
    throw new Error('Method not implemented');
  }

  // ========== QuizConfig Methods ==========

  /**
   * Get quiz configuration (singleton)
   * @returns {QuizConfig|null}
   */
  getQuizConfig() {
    throw new Error('Method not implemented');
  }

  /**
   * Update quiz configuration
   * @param {QuizConfig} config - Configuration to update
   * @returns {boolean} - Success status
   */
  updateQuizConfig(config) {
    throw new Error('Method not implemented');
  }

  // ========== QuizCategory Methods ==========

  /**
   * Get all categories
   * @returns {QuizCategory[]}
   */
  getAllCategories() {
    throw new Error('Method not implemented');
  }

  /**
   * Get category by name
   * @param {string} name - Category name
   * @returns {QuizCategory|null}
   */
  getCategoryByName(name) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a category
   * @param {QuizCategory} category - Category to add
   * @returns {QuizCategory} - Added category
   */
  addCategory(category) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a category
   * @param {string} name - Category name
   * @returns {boolean} - Success status
   */
  deleteCategory(name) {
    throw new Error('Method not implemented');
  }

  /**
   * Get count of questions in a category
   * @param {string} categoryName - Category name
   * @returns {number} - Question count
   */
  getQuestionCountByCategory(categoryName) {
    throw new Error('Method not implemented');
  }

  // ========== QuizPublishHistory Methods ==========

  /**
   * Get all publish history
   * @returns {QuizPublishHistory[]}
   */
  getAllPublishHistory() {
    throw new Error('Method not implemented');
  }

  /**
   * Get publish history by date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {QuizPublishHistory|null}
   */
  getPublishHistoryByDate(date) {
    throw new Error('Method not implemented');
  }

  /**
   * Get today's publish history
   * @returns {QuizPublishHistory|null}
   */
  getTodayPublishHistory() {
    throw new Error('Method not implemented');
  }

  /**
   * Add publish history record
   * @param {QuizPublishHistory} history - History to add
   * @returns {QuizPublishHistory} - Added history with ID
   */
  addPublishHistory(history) {
    throw new Error('Method not implemented');
  }

  /**
   * Update publish history
   * @param {QuizPublishHistory} history - History to update
   * @returns {boolean} - Success status
   */
  updatePublishHistory(history) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete all publish history (reset)
   * @returns {number} - Number of deleted records
   */
  deleteAllPublishHistory() {
    throw new Error('Method not implemented');
  }

  /**
   * Get count of published questions
   * @returns {number}
   */
  getPublishedQuestionCount() {
    throw new Error('Method not implemented');
  }

  // ========== QuizAnswer Methods ==========

  /**
   * Get answer by question ID and user ID
   * @param {number} questionId - Question ID
   * @param {string} userId - Discord user ID
   * @returns {QuizAnswer|null}
   */
  getAnswerByQuestionAndUser(questionId, userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get all answers for a question
   * @param {number} questionId - Question ID
   * @returns {QuizAnswer[]}
   */
  getAnswersByQuestion(questionId) {
    throw new Error('Method not implemented');
  }

  /**
   * Add or update answer (upsert)
   * @param {QuizAnswer} answer - Answer to add/update
   * @returns {QuizAnswer} - Saved answer
   */
  upsertAnswer(answer) {
    throw new Error('Method not implemented');
  }

  /**
   * Get correct answer count for a question
   * @param {number} questionId - Question ID
   * @returns {number} - Count of correct answers
   */
  getCorrectAnswerCount(questionId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get total participant count for a question
   * @param {number} questionId - Question ID
   * @returns {number} - Total participant count
   */
  getParticipantCount(questionId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get answers that haven't been awarded points yet
   * @param {number} questionId - Question ID
   * @returns {QuizAnswer[]}
   */
  getUnawardedAnswers(questionId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IQuizRepository;
