/**
 * Lecture Repository Interface (Legacy name for Schedule)
 * Repository interface for lecture/schedule management
 * Implemented in Data layer
 * Note: This is the original interface name. Use IScheduleRepository for new code.
 */
class ILectureRepository {
  /**
   * Get all lectures
   * @returns {Lecture[]} Array of all lectures
   */
  getAllLectures() {
    throw new Error('Method not implemented');
  }

  /**
   * Get lecture by ID
   * @param {number} id - Lecture ID
   * @returns {Lecture|null} Lecture entity or null if not found
   */
  getLectureById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a new lecture
   * @param {Lecture} lecture - Lecture entity to add
   * @returns {Lecture} Created lecture with assigned ID
   */
  addLecture(lecture) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an existing lecture
   * @param {Lecture} lecture - Lecture entity with updated data
   * @returns {boolean} True if update was successful
   */
  updateLecture(lecture) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete lecture by ID
   * @param {number} id - Lecture ID
   * @returns {Lecture|null} Deleted lecture entity or null if not found
   */
  deleteLecture(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete lecture by Discord message ID
   * Used for automatic cleanup when message is deleted
   * @param {string} messageId - Discord message ID
   * @returns {boolean} True if deletion was successful
   */
  deleteLectureByMessageId(messageId) {
    throw new Error('Method not implemented');
  }
}

module.exports = ILectureRepository;
