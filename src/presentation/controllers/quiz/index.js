const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퀴즈등록')
    .setDescription('단일 문제 등록')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((opt) => opt.setName('카테고리').setDescription('문제 카테고리').setRequired(true))
    .addStringOption((opt) => opt.setName('문제').setDescription('문제 본문').setRequired(true))
    .addStringOption((opt) => opt.setName('보기1').setDescription('보기 1번').setRequired(true))
    .addStringOption((opt) => opt.setName('보기2').setDescription('보기 2번').setRequired(true))
    .addStringOption((opt) => opt.setName('보기3').setDescription('보기 3번').setRequired(true))
    .addStringOption((opt) => opt.setName('보기4').setDescription('보기 4번').setRequired(true))
    .addStringOption((opt) => opt.setName('보기5').setDescription('보기 5번').setRequired(true))
    .addIntegerOption((opt) => opt.setName('정답').setDescription('정답 번호 (1~5)').setRequired(true).setMinValue(1).setMaxValue(5))
    .addStringOption((opt) => opt.setName('해설').setDescription('해설').setRequired(true)),

  async execute(interaction, _repository, _schedulerService, _pointService, quizService) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: strings.quiz.noPermission(),
        ephemeral: true,
      });
    }

    const category = interaction.options.getString('카테고리');
    const question = interaction.options.getString('문제');
    const option1 = interaction.options.getString('보기1');
    const option2 = interaction.options.getString('보기2');
    const option3 = interaction.options.getString('보기3');
    const option4 = interaction.options.getString('보기4');
    const option5 = interaction.options.getString('보기5');
    const answer = interaction.options.getInteger('정답');
    const explanation = interaction.options.getString('해설');

    try {
      const registered = quizService.registerQuestion({
        category,
        question,
        option1,
        option2,
        option3,
        option4,
        option5,
        answer,
        explanation,
        createdBy: interaction.user.id,
      });

      console.log(`[quiz/register] Question #${registered.id} registered by ${interaction.user.tag} (${interaction.user.id})`);
      await interaction.reply({
        content: strings.quiz.registerSuccess(registered.id, category),
        ephemeral: true,
      });
    } catch (error) {
      if (error.message === 'INVALID_ANSWER') {
        console.log(`[quiz/register] Invalid answer by ${interaction.user.tag}: ${answer}`);
        return interaction.reply({
          content: strings.quiz.registerInvalidAnswer(),
          ephemeral: true,
        });
      }

      if (error.message === 'CATEGORY_NOT_FOUND') {
        console.log(`[quiz/register] Category not found: ${category} by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.quiz.registerCategoryNotFound(category),
          ephemeral: true,
        });
      }

      if (error.message === 'DUPLICATE_QUESTION') {
        console.log(`[quiz/register] Duplicate question by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.quiz.registerDuplicate(),
          ephemeral: true,
        });
      }

      console.error(`[quiz/register] ${error.constructor.name}: Failed to register question by ${interaction.user.tag}:`, error);
      await interaction.reply({
        content: '❌ 문제 등록 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
