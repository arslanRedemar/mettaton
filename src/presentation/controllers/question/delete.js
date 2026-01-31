const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../../core/config');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('질문삭제')
    .setDescription('질문을 삭제합니다')
    .addIntegerOption((option) => option.setName('id').setDescription('삭제할 질문 ID').setRequired(true)),

  async execute(interaction, repository) {
    const questionId = interaction.options.getInteger('id');
    const question = repository.deleteQuestion(questionId);

    if (!question) {
      return interaction.reply({ content: strings.question.deleteNotFound(questionId), ephemeral: true });
    }

    const channel = interaction.guild.channels.cache.get(config.channels.question);
    if (channel && question.messageId) {
      try {
        const msg = await channel.messages.fetch(question.messageId);
        if (msg) await msg.delete();
      } catch (err) {
        console.log(strings.question.deleteMessageFail, err);
      }
    }

    await interaction.reply({ content: strings.question.deleteSuccess(question.id), ephemeral: true });
  },
};
