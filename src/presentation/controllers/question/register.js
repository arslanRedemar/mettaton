const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Question = require('../../../domain/entities/Question');
const config = require('../../../../core/config');
const strings = require('../../interfaces/strings');

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

    const channel = interaction.guild.channels.cache.get(config.channels.question);
    if (channel) {
      const msg = await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(strings.question.embedTitle(question.id))
            .setDescription(strings.question.embedDescription(question.question, question.author, '0명'))
            .setColor(0xffaa00),
        ],
      });
      question.messageId = msg.id;
      repository.updateQuestion(question);
    } else {
      console.error(`[question/register] Question channel not found (ID: ${config.channels.question})`);
    }

    console.log(`[question/register] Question #${question.id} registered by ${interaction.user.tag} (${interaction.user.id})`);
    await interaction.reply(strings.question.registerSuccess);
  },
};
