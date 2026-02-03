const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퀴즈수정')
    .setDescription('문제 ID로 문제 내용 수정')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption((opt) => opt.setName('문제번호').setDescription('수정할 문제 ID').setRequired(true))
    .addStringOption((opt) => opt.setName('카테고리').setDescription('문제 카테고리'))
    .addStringOption((opt) => opt.setName('문제').setDescription('문제 본문'))
    .addStringOption((opt) => opt.setName('보기1').setDescription('보기 1번'))
    .addStringOption((opt) => opt.setName('보기2').setDescription('보기 2번'))
    .addStringOption((opt) => opt.setName('보기3').setDescription('보기 3번'))
    .addStringOption((opt) => opt.setName('보기4').setDescription('보기 4번'))
    .addStringOption((opt) => opt.setName('보기5').setDescription('보기 5번'))
    .addIntegerOption((opt) => opt.setName('정답').setDescription('정답 번호 (1~5)').setMinValue(1).setMaxValue(5))
    .addStringOption((opt) => opt.setName('해설').setDescription('해설')),

  async execute(interaction, _repository, _schedulerService, _pointService, quizService) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: strings.quiz.noPermission,
        ephemeral: true,
      });
    }

    const questionId = interaction.options.getInteger('문제번호');
    const updates = {};

    // Collect provided options
    const category = interaction.options.getString('카테고리');
    const question = interaction.options.getString('문제');
    const option1 = interaction.options.getString('보기1');
    const option2 = interaction.options.getString('보기2');
    const option3 = interaction.options.getString('보기3');
    const option4 = interaction.options.getString('보기4');
    const option5 = interaction.options.getString('보기5');
    const answer = interaction.options.getInteger('정답');
    const explanation = interaction.options.getString('해설');

    if (category) updates.category = category;
    if (question) updates.question = question;
    if (option1) updates.option1 = option1;
    if (option2) updates.option2 = option2;
    if (option3) updates.option3 = option3;
    if (option4) updates.option4 = option4;
    if (option5) updates.option5 = option5;
    if (answer !== null) updates.answer = answer;
    if (explanation) updates.explanation = explanation;

    // Check if any updates provided
    if (Object.keys(updates).length === 0) {
      console.log(`[quiz/edit] No updates provided for question #${questionId} by ${interaction.user.tag}`);
      return interaction.reply({
        content: '❌ 수정할 내용을 최소 하나 이상 입력하세요.',
        ephemeral: true,
      });
    }

    try {
      quizService.updateQuestion(questionId, updates);

      console.log(`[quiz/edit] Question #${questionId} updated by ${interaction.user.tag} (${interaction.user.id}). Fields: ${Object.keys(updates).join(', ')}`);
      await interaction.reply({
        content: strings.quiz.editSuccess(questionId),
        ephemeral: true,
      });
    } catch (error) {
      if (error.message === 'QUESTION_NOT_FOUND') {
        console.log(`[quiz/edit] Question #${questionId} not found by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.quiz.editNotFound(questionId),
          ephemeral: true,
        });
      }

      if (error.message === 'INVALID_ANSWER') {
        console.log(`[quiz/edit] Invalid answer for question #${questionId} by ${interaction.user.tag}: ${answer}`);
        return interaction.reply({
          content: strings.quiz.registerInvalidAnswer,
          ephemeral: true,
        });
      }

      if (error.message === 'CATEGORY_NOT_FOUND') {
        console.log(`[quiz/edit] Category not found for question #${questionId} by ${interaction.user.tag}: ${category}`);
        return interaction.reply({
          content: strings.quiz.registerCategoryNotFound(category),
          ephemeral: true,
        });
      }

      console.error(`[quiz/edit] ${error.constructor.name}: Failed to update question #${questionId} by ${interaction.user.tag}:`, error);
      await interaction.reply({
        content: '❌ 문제 수정 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
