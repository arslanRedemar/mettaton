const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder().setName('질문목록').setDescription('현재 등록된 질문 목록 조회'),

  async execute(interaction, repository) {
    const questions = repository.getAllQuestions();

    if (questions.length === 0) {
      console.log(`[question/list] No questions found, requested by ${interaction.user.tag}`);
      return interaction.reply(strings.question.listEmpty);
    }

    const embed = new EmbedBuilder().setTitle(strings.question.listTitle).setColor(0x0099ff);

    questions.forEach((q) => {
      const status = q.isAnswered() ? strings.question.statusAnswered : strings.question.statusUnanswered;
      const attendeeInfo = q.attendees.length > 0
        ? `${q.attendees.length}명 (${q.attendees.map((uid) => `<@${uid}>`).join(', ')})`
        : '0명';
      embed.addFields({
        name: `#${q.id} ${q.question}`,
        value: strings.question.listFieldValue(q.author, status, attendeeInfo),
      });
    });

    console.log(`[question/list] Listed ${questions.length} question(s), requested by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [embed] });
  },
};
