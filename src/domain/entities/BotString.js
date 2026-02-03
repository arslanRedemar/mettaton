/**
 * BotString Entity
 * Represents a customizable UI string with template parameter support
 */
class BotString {
  /**
   * @param {Object} params
   * @param {string} params.key - Unique string key (e.g., 'ready.loginSuccess')
   * @param {string} params.value - String value with optional {param} placeholders
   * @param {string[]|null} params.params - Array of required template parameter names
   * @param {Date|null} params.updatedAt - Last update timestamp (null for defaults)
   */
  constructor({ key, value, params = null, updatedAt = null }) {
    this.key = key;
    this.value = value;
    this.params = params;
    this.updatedAt = updatedAt;
  }

  /**
   * Check if this string is a DB override (vs default)
   * @returns {boolean}
   */
  isOverridden() {
    return this.updatedAt !== null;
  }

  /**
   * Validate that a new value contains all required template parameters
   * @param {string} newValue - Value to validate
   * @returns {{valid: boolean, missing: string[]}}
   */
  validateParams(newValue) {
    if (!this.params || this.params.length === 0) {
      return { valid: true, missing: [] };
    }

    const missing = this.params.filter((param) => !newValue.includes(`{${param}}`));
    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Replace template parameters in the value
   * @param {Object} replacements - Key-value pairs for parameter replacement
   * @returns {string}
   */
  format(replacements = {}) {
    let result = this.value;
    for (const [param, val] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), val);
    }
    return result;
  }
}

module.exports = BotString;
