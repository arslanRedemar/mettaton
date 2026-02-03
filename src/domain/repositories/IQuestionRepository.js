/**
 * Question Repository Interface
 * Abstract repository for question management
 * Implementation should be provided in the Data layer
 */
class IQuestionRepository {
  /**
   * Get all questions
   * @returns {Question[]} Array of all questions
   */
  getAllQuestions() {
    throw new Error('Method not implemented');
  }

  /**
   * Get a question by ID
   * @param {number} id - Question ID
   * @returns {Question|null} Question entity or null if not found
   */
  getQuestionById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a new question
   * @param {Question} question - Question entity to add
   * @returns {Question} Added question with generated ID
   */
  addQuestion(question) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an existing question
   * @param {Question} question - Question entity to update
   * @returns {boolean} True if updated successfully
   */
  updateQuestion(question) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a question by ID
   * @param {number} id - Question ID
   * @returns {Question|null} Deleted question entity or null if not found
   */
  deleteQuestion(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a question by Discord message ID
   * @param {string} messageId - Discord message ID
   * @returns {boolean} True if deleted successfully
   */
  deleteQuestionByMessageId(messageId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IQuestionRepository;
