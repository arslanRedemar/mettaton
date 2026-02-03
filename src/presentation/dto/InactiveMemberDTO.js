/**
 * InactiveMemberDTO
 * Data Transfer Object for inactive member information (Presentation Layer)
 */
class InactiveMemberDTO {
  /**
   * @param {Object} params
   * @param {string} params.id - Discord user ID
   * @param {string} params.lastActive - Formatted last active date or '기록 없음'
   */
  constructor({ id, lastActive }) {
    this.id = id;
    this.lastActive = lastActive;
  }

  /**
   * Create DTO from member and activity entity
   * @param {import('discord.js').GuildMember} member - Discord guild member
   * @param {import('../../domain/entities/MemberActivity')|null} activity - Member activity entity
   * @returns {InactiveMemberDTO}
   */
  static fromMemberAndActivity(member, activity) {
    return new InactiveMemberDTO({
      id: member.id,
      lastActive: activity ? activity.formatLastActive() : '기록 없음',
    });
  }

  /**
   * Create DTO array from service result
   * @param {Array<{id: string, lastActive: string}>} inactiveList - List from service
   * @returns {InactiveMemberDTO[]}
   */
  static fromServiceList(inactiveList) {
    return inactiveList.map((item) => new InactiveMemberDTO(item));
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      lastActive: this.lastActive,
    };
  }
}

module.exports = InactiveMemberDTO;
