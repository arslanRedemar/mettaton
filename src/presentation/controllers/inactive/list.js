const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../interfaces/strings');
const { InactiveMemberDTO } = require('../../dto');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('비활동목록')
    .setDescription('비활동 회원 목록을 조회합니다')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, inactiveMemberService) {
    try {
      const guild = interaction.guild;
      await guild.members.fetch();

      const inactiveList = inactiveMemberService.getInactiveMembersList(guild);
      const days = inactiveMemberService.getInactiveDays();

      if (inactiveList.length === 0) {
        console.log(`[inactive/list] No inactive members found (threshold: ${days} days), requested by ${interaction.user.tag}`);
        return interaction.reply({ content: strings.inactive.listEmpty, ephemeral: true });
      }

      const inactiveDTOs = InactiveMemberDTO.fromServiceList(inactiveList);
      const header = strings.inactive.listHeader(days, inactiveDTOs.length);
      const items = inactiveDTOs
        .map((dto) => strings.inactive.listItem(dto.id, dto.lastActive))
        .join('\n');

      const content = `${header}\n${items}`;

      // Discord message length limit (2000 characters)
      if (content.length > 2000) {
        const truncated = content.substring(0, 1950) + '\n... (목록이 너무 깁니다)';
        console.log(`[inactive/list] Found ${inactiveDTOs.length} inactive member(s) (threshold: ${days} days, truncated), requested by ${interaction.user.tag}`);
        return interaction.reply({ content: truncated, ephemeral: true });
      }

      console.log(`[inactive/list] Found ${inactiveDTOs.length} inactive member(s) (threshold: ${days} days), requested by ${interaction.user.tag}`);
      await interaction.reply({ content, ephemeral: true });
    } catch (error) {
      console.error(`[inactive/list] ${error.constructor.name}: Failed to retrieve inactive member list for ${interaction.user.tag}:`, error);
      throw error;
    }
  },
};
