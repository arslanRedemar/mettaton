const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('비활동설정')
    .setDescription('비활동 기준 기간을 설정합니다')
    .addIntegerOption((option) =>
      option
        .setName('일수')
        .setDescription('비활동 기준 일수 (1~365)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(365),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, repository) {
    const days = interaction.options.getInteger('일수');
    repository.setInactiveDays(days);
    console.log(`[inactive/config] Inactive threshold set to ${days} days by ${interaction.user.tag}`);
    await interaction.reply({ content: strings.inactive.configSaved(days), ephemeral: true });
  },
};
