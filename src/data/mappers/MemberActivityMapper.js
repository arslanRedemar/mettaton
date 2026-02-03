const MemberActivity = require('../../domain/entities/MemberActivity');

/**
 * MemberActivity Entity ↔ DB Model conversion
 */
class MemberActivityMapper {
  /**
   * DB row → MemberActivity Entity
   * @param {Object} row - Database row
   * @returns {MemberActivity|null}
   */
  static toEntity(row) {
    if (!row) return null;
    return new MemberActivity({
      userId: row.user_id,
      lastActiveAt: new Date(row.last_active_at),
    });
  }

  /**
   * MemberActivity Entity → DB params
   * @param {MemberActivity} memberActivity - MemberActivity entity
   * @returns {Object}
   */
  static toDbParams(memberActivity) {
    return {
      userId: memberActivity.userId,
      lastActiveAt: memberActivity.lastActiveAt.toISOString(),
    };
  }
}

module.exports = MemberActivityMapper;
