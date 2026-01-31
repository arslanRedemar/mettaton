const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('비활동목록')
    .setDescription('비활동 회원 목록을 조회합니다')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, repository) {
    const days = repository.getInactiveDays();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const guild = interaction.guild;
    await guild.members.fetch();

    const activities = repository.getAllMemberActivities();
    const activityMap = new Map();
    for (const row of activities) {
      activityMap.set(row.user_id, new Date(row.last_active_at));
    }

    const inactiveMembers = [];
    for (const [, member] of guild.members.cache) {
      if (member.user.bot) continue;
      if (member.id === guild.ownerId) continue;

      const lastActive = activityMap.get(member.id);
      if (!lastActive || lastActive < cutoffDate) {
        inactiveMembers.push({
          id: member.id,
          lastActive: lastActive
            ? lastActive.toLocaleDateString('ko-KR')
            : '기록 없음',
        });
      }
    }

    if (inactiveMembers.length === 0) {
      console.log(`[inactive/list] No inactive members found (threshold: ${days} days), requested by ${interaction.user.tag}`);
      return interaction.reply({ content: strings.inactive.listEmpty, ephemeral: true });
    }

    const header = strings.inactive.listHeader(days, inactiveMembers.length);
    const items = inactiveMembers
      .map((m) => strings.inactive.listItem(m.id, m.lastActive))
      .join('\n');

    const content = `${header}\n${items}`;

    // Discord 메시지 길이 제한 (2000자)
    if (content.length > 2000) {
      const truncated = content.substring(0, 1950) + '\n... (목록이 너무 깁니다)';
      return interaction.reply({ content: truncated, ephemeral: true });
    }

    console.log(`[inactive/list] Found ${inactiveMembers.length} inactive member(s) (threshold: ${days} days), requested by ${interaction.user.tag}`);
    await interaction.reply({ content, ephemeral: true });
  },
};
