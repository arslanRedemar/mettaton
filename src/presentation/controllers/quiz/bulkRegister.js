const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퀴즈일괄등록')
    .setDescription('JSON 파일로 다수 문제 일괄 등록')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addAttachmentOption((opt) => opt.setName('파일').setDescription('JSON 파일').setRequired(true)),

  async execute(interaction, _repository, _schedulerService, _pointService, quizService) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: strings.quiz.noPermission(),
        ephemeral: true,
      });
    }

    const file = interaction.options.getAttachment('파일');

    if (!file.name.endsWith('.json')) {
      console.log(`[quiz/bulk-register] Invalid file type by ${interaction.user.tag}: ${file.name}`);
      return interaction.reply({
        content: '❌ JSON 파일만 업로드 가능합니다.',
        ephemeral: true,
      });
    }

    try {
      // Fetch file content
      const response = await fetch(file.url);
      const text = await response.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data) || data.length === 0) {
        console.log(`[quiz/bulk-register] Empty or invalid JSON by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.quiz.bulkEmpty(),
          ephemeral: true,
        });
      }

      await interaction.deferReply({ ephemeral: true });

      const results = quizService.bulkRegisterQuestions(data, interaction.user.id);

      console.log(`[quiz/bulk-register] Bulk registration by ${interaction.user.tag}: success=${results.success}, failed=${results.failed}`);
      await interaction.editReply({
        content: strings.quiz.bulkSuccess(results.success, results.failed),
        ephemeral: true,
      });
    } catch (error) {
      console.error(`[quiz/bulk-register] ${error.constructor.name}: Bulk registration failed for ${interaction.user.tag}:`, error);

      if (error instanceof SyntaxError) {
        return interaction.reply({
          content: strings.quiz.bulkFormatError(),
          ephemeral: true,
        });
      }

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ 일괄 등록 중 오류가 발생했습니다.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: '❌ 일괄 등록 중 오류가 발생했습니다.',
          ephemeral: true,
        });
      }
    }
  },
};
