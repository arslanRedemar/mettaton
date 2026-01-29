const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('질문목록').setDescription('현재 등록된 질문 목록 조회'),

  async execute(interaction, repository) {
    const questions = repository.getAllQuestions();

    if (questions.length === 0) {
      return interaction.reply('📭 등록된 질문이 없습니다.');
    }

    const embed = new EmbedBuilder().setTitle('💬 현재 질문 목록').setColor(0x0099ff);

    questions.forEach((q) => {
      embed.addFields({
        name: `#${q.id} ${q.question}`,
        value: `작성자: <@${q.author}>\n상태: ${q.isAnswered() ? '✅ 답변완료' : '❌ 미답변'}`,
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
