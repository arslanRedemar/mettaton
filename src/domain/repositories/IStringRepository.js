/**
 * String Repository Interface
 * Bot UI string repository interface (abstraction)
 * Implemented in Data layer
 */
class IStringRepository {
  /**
   * Get all string overrides from database
   * @returns {Array<{key: string, value: string, params: string|null}>}
   */
  getAllStrings() {
    throw new Error('Method not implemented');
  }

  /**
   * Get a specific string override
   * @param {string} key - String key
   * @returns {{value: string, params: string|null}|null}
   */
  getString(key) {
    throw new Error('Method not implemented');
  }

  /**
   * Set or update a string override
   * @param {string} key - String key
   * @param {string} value - String value
   * @param {string[]|null} params - Template parameter names (will be JSON stringified)
   * @returns {void}
   */
  setString(key, value, params = null) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a string override (revert to default)
   * @param {string} key - String key
   * @returns {boolean} - True if deleted, false if not found
   */
  deleteString(key) {
    throw new Error('Method not implemented');
  }
}

module.exports = IStringRepository;
