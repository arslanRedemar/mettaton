/**
 * IPersonalPracticeRepository Interface
 * Defines the contract for personal practice data access operations
 */
class IPersonalPracticeRepository {
  /**
   * Get all personal practice plans
   * @returns {PersonalPractice[]}
   */
  getAllPersonalPracticePlans() {
    throw new Error('Method not implemented');
  }

  /**
   * Get personal practice plan by ID
   * @param {number} id - Plan ID
   * @returns {PersonalPractice|null}
   */
  getPersonalPracticePlanById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get personal practice plan by Discord message ID
   * @param {string} messageId - Discord message ID
   * @returns {PersonalPractice|null}
   */
  getPersonalPracticePlanByMessageId(messageId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get all personal practice plans for a specific user
   * @param {string} userId - Discord user ID
   * @returns {PersonalPractice[]}
   */
  getPersonalPracticePlansByUserId(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new personal practice plan
   * @param {PersonalPractice} plan - Practice plan entity
   * @returns {PersonalPractice} - Plan with ID assigned
   */
  addPersonalPracticePlan(plan) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an existing personal practice plan
   * @param {PersonalPractice} plan - Practice plan entity with updated data
   * @returns {boolean} - True if update successful
   */
  updatePersonalPracticePlan(plan) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a personal practice plan
   * @param {number} id - Plan ID
   * @returns {PersonalPractice|null} - Deleted plan or null if not found
   */
  deletePersonalPracticePlan(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get all check-in records for a practice plan
   * @param {number} planId - Plan ID
   * @returns {string[]} - Array of check dates (YYYY-MM-DD)
   */
  getPersonalPracticeRecords(planId) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if a specific date has a check-in record
   * @param {number} planId - Plan ID
   * @param {string} checkDate - Date to check (YYYY-MM-DD)
   * @returns {boolean}
   */
  hasPersonalPracticeRecord(planId, checkDate) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a check-in record for a practice plan
   * @param {number} planId - Plan ID
   * @param {string} userId - Discord user ID
   * @param {string} checkDate - Date to check (YYYY-MM-DD)
   * @returns {boolean} - True if record added (false if duplicate)
   */
  addPersonalPracticeRecord(planId, userId, checkDate) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove a check-in record for a practice plan
   * @param {number} planId - Plan ID
   * @param {string} checkDate - Date to uncheck (YYYY-MM-DD)
   * @returns {boolean} - True if record removed
   */
  removePersonalPracticeRecord(planId, checkDate) {
    throw new Error('Method not implemented');
  }

  /**
   * Clear message ID for a practice plan (used during sync operations)
   * @param {number} id - Plan ID
   */
  clearPracticePlanMessageId(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = IPersonalPracticeRepository;
