const { SlashCommandBuilder } = require('discord.js');
const Question = require('../../../domain/entities/Question');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('질문등록')
    .setDescription('질문 등록')
    .addStringOption((opt) => opt.setName('내용').setDescription('질문 내용').setRequired(true)),

  async execute(interaction, repository) {
    const content = interaction.options.getString('내용');

    const question = new Question({
      author: interaction.user.id,
      question: content,
    });

    repository.addQuestion(question);

    const channel = interaction.guild.channels.cache.find((c) => c.name === config.channels.question);
    if (channel) {
      const msg = await channel.send(`❓ **질문 #${question.id}**\n${question.question}\n작성자: <@${question.author}>`);
      question.messageId = msg.id;
      repository.updateQuestion(question);
    }

    await interaction.reply('✅ 질문이 등록되었습니다.');
  },
};
