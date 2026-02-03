const BotString = require('../../domain/entities/BotString');

/**
 * BotString Entity ↔ DB Model transformation
 */
class BotStringMapper {
  /**
   * DB row → BotString Entity
   * @param {Object} row - Database row
   * @returns {BotString|null}
   */
  static toEntity(row) {
    if (!row) return null;
    return new BotString({
      key: row.key,
      value: row.value,
      params: row.params ? JSON.parse(row.params) : null,
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    });
  }

  /**
   * BotString Entity → DB params
   * @param {BotString} botString - BotString entity
   * @returns {Object} - DB parameter object
   */
  static toDbParams(botString) {
    return {
      key: botString.key,
      value: botString.value,
      params: botString.params ? JSON.stringify(botString.params) : null,
    };
  }
}

module.exports = BotStringMapper;
