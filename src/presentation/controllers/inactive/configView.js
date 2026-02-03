const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('비활동설정확인')
    .setDescription('현재 비활동 기준 설정을 확인합니다')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, inactiveMemberService) {
    try {
      const days = inactiveMemberService.getInactiveDays();
      console.log(`[inactive/configView] Inactive threshold viewed (${days} days) by ${interaction.user.tag}`);
      await interaction.reply({ content: strings.inactive.configDisplay(days), ephemeral: true });
    } catch (error) {
      console.error(`[inactive/configView] ${error.constructor.name}: Failed to retrieve inactive threshold for ${interaction.user.tag}:`, error);
      throw error;
    }
  },
};
