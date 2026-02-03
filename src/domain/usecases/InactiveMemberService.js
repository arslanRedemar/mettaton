const MemberActivity = require('../entities/MemberActivity');

/**
 * Inactive Member Management Service
 * Handles inactive member detection and management business logic
 */
class InactiveMemberService {
  /**
   * @param {IMemberActivityRepository} repository - Repository with member activity methods
   */
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Get inactive threshold setting in days
   * @returns {number} - Inactive threshold in days
   */
  getInactiveDays() {
    return this.repository.getInactiveDays();
  }

  /**
   * Set inactive threshold setting in days
   * @param {number} days - Inactive threshold in days (1-365)
   * @returns {void}
   */
  setInactiveDays(days) {
    if (days < 1 || days > 365) {
      throw new Error('Inactive days must be between 1 and 365');
    }
    this.repository.setInactiveDays(days);
  }

  /**
   * Update member activity timestamp
   * @param {string} userId - Discord user ID
   * @returns {void}
   */
  recordActivity(userId) {
    this.repository.updateMemberActivity(userId);
  }

  /**
   * Get all inactive members based on threshold
   * @returns {MemberActivity[]} - Array of inactive member activity records
   */
  getInactiveMembers() {
    const thresholdDays = this.repository.getInactiveDays();
    const allActivities = this.repository.getAllMemberActivities();

    return allActivities.filter((activity) => activity.isInactive(thresholdDays));
  }

  /**
   * Get inactive members filtered by guild member list
   * Excludes bots, server owner, and members with higher roles than the bot
   * @param {import('discord.js').Guild} guild - Discord guild object
   * @returns {Array<{member: import('discord.js').GuildMember, activity: MemberActivity|null}>}
   */
  getKickableInactiveMembers(guild) {
    const thresholdDays = this.repository.getInactiveDays();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

    const activities = this.repository.getAllMemberActivities();
    const activityMap = new Map();

    for (const activity of activities) {
      activityMap.set(activity.userId, activity);
    }

    const botMember = guild.members.me;
    const kickableMembers = [];

    for (const [, member] of guild.members.cache) {
      // Skip bots
      if (member.user.bot) continue;

      // Skip server owner
      if (member.id === guild.ownerId) continue;

      // Skip members with higher or equal role than bot
      if (botMember && member.roles.highest.position >= botMember.roles.highest.position) {
        continue;
      }

      const activity = activityMap.get(member.id);

      // Include members with no activity record OR inactive members
      if (!activity || activity.isInactive(thresholdDays)) {
        kickableMembers.push({
          member,
          activity,
        });
      }
    }

    return kickableMembers;
  }

  /**
   * Get formatted inactive member list for display
   * @param {import('discord.js').Guild} guild - Discord guild object
   * @returns {Array<{id: string, lastActive: string}>}
   */
  getInactiveMembersList(guild) {
    const thresholdDays = this.repository.getInactiveDays();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

    const activities = this.repository.getAllMemberActivities();
    const activityMap = new Map();

    for (const activity of activities) {
      activityMap.set(activity.userId, activity);
    }

    const inactiveMembers = [];

    for (const [, member] of guild.members.cache) {
      // Skip bots
      if (member.user.bot) continue;

      // Skip server owner
      if (member.id === guild.ownerId) continue;

      const activity = activityMap.get(member.id);

      // Include members with no activity record OR inactive members
      if (!activity || activity.isInactive(thresholdDays)) {
        inactiveMembers.push({
          id: member.id,
          lastActive: activity ? activity.formatLastActive() : '기록 없음',
        });
      }
    }

    return inactiveMembers;
  }

  /**
   * Generate kick reason string
   * @returns {string} - Formatted kick reason
   */
  getKickReason() {
    const days = this.repository.getInactiveDays();
    return `비활동 ${days}일 이상`;
  }
}

module.exports = InactiveMemberService;
