const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('질문답변')
    .setDescription('질문에 답변 등록')
    .addIntegerOption((opt) => opt.setName('id').setDescription('질문 ID').setRequired(true))
    .addStringOption((opt) => opt.setName('내용').setDescription('답변 내용').setRequired(true)),

  async execute(interaction, repository) {
    const id = interaction.options.getInteger('id');
    const answer = interaction.options.getString('내용');

    const question = repository.getQuestionById(id);

    if (!question) {
      return interaction.reply('❌ 해당 ID의 질문이 없습니다.');
    }

    question.setAnswer(answer, interaction.user.id);
    repository.updateQuestion(question);

    const channel = interaction.guild.channels.cache.find((c) => c.name === config.channels.question);
    if (channel && question.messageId) {
      try {
        const msg = await channel.messages.fetch(question.messageId);
        if (msg) {
          await msg.edit(
            `❓ **질문 #${question.id}**\n${question.question}\n작성자: <@${question.author}>\n\n✅ **답변:** ${answer}\n(답변자: <@${interaction.user.id}>)`
          );
        }
      } catch {}
    }

    await interaction.reply(`✅ 질문 #${id}에 답변 등록 완료`);
  },
};
