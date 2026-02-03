/**
 * MemberActivity Repository Interface
 * Member activity repository interface (abstract)
 * Implemented in Data layer
 */
class IMemberActivityRepository {
  /**
   * Update member activity timestamp to current time
   * @param {string} userId - Discord user ID
   * @returns {void}
   */
  updateMemberActivity(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get all member activities
   * @returns {MemberActivity[]}
   */
  getAllMemberActivities() {
    throw new Error('Method not implemented');
  }

  /**
   * Get inactive threshold setting in days
   * @returns {number} - Inactive threshold in days
   */
  getInactiveDays() {
    throw new Error('Method not implemented');
  }

  /**
   * Set inactive threshold setting in days
   * @param {number} days - Inactive threshold in days (1-365)
   * @returns {void}
   */
  setInactiveDays(days) {
    throw new Error('Method not implemented');
  }

  /**
   * Get member activity for a specific user
   * @param {string} userId - Discord user ID
   * @returns {MemberActivity|null}
   */
  getMemberActivity(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete member activity record
   * @param {string} userId - Discord user ID
   * @returns {void}
   */
  deleteMemberActivity(userId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IMemberActivityRepository;
