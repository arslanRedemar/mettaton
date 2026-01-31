const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('비활동설정확인')
    .setDescription('현재 비활동 기준 설정을 확인합니다')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, repository) {
    const days = repository.getInactiveDays();
    await interaction.reply({ content: strings.inactive.configDisplay(days), ephemeral: true });
  },
};
