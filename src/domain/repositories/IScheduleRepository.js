/**
 * Schedule Repository Interface
 * Repository interface for Schedule Management feature
 * Implemented in Data layer
 */
class IScheduleRepository {
  /**
   * Get all schedules
   * @returns {Schedule[]} Array of all schedules
   */
  getAllSchedules() {
    throw new Error('Method not implemented');
  }

  /**
   * Get schedule by ID
   * @param {number} id - Schedule ID
   * @returns {Schedule|null} Schedule entity or null if not found
   */
  getScheduleById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get schedule by Discord message ID
   * @param {string} messageId - Discord message ID
   * @returns {Schedule|null} Schedule entity or null if not found
   */
  getScheduleByMessageId(messageId) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a new schedule
   * @param {Schedule} schedule - Schedule entity to add
   * @returns {Schedule} Created schedule with assigned ID
   */
  addSchedule(schedule) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an existing schedule
   * @param {Schedule} schedule - Schedule entity with updated data
   * @returns {boolean} True if update was successful
   */
  updateSchedule(schedule) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete schedule by ID
   * @param {number} id - Schedule ID
   * @returns {Schedule|null} Deleted schedule entity or null if not found
   */
  deleteSchedule(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete schedule by Discord message ID
   * Used for automatic cleanup when message is deleted
   * @param {string} messageId - Discord message ID
   * @returns {boolean} True if deletion was successful
   */
  deleteScheduleByMessageId(messageId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IScheduleRepository;
