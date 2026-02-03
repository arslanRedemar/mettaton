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
      console.log(`[question/delete] Question #${questionId} not found, requested by ${interaction.user.tag}`);
      try {
        return interaction.reply({ content: strings.question.deleteNotFound(questionId), ephemeral: true });
      } catch (error) {
        console.error(`[question/delete] ${error.constructor.name}: Failed to send not found reply to ${interaction.user.tag}:`, error);
        return;
      }
    }

    const channel = interaction.guild.channels.cache.get(config.channels.question);
    if (channel && question.messageId) {
      try {
        const msg = await channel.messages.fetch(question.messageId);
        if (msg) {
          await msg.delete();
        }
      } catch (err) {
        console.error(`[question/delete] ${err.constructor.name}: Failed to delete Discord message for question #${questionId}:`, err);
      }
    } else if (!channel) {
      console.error(`[question/delete] ChannelNotFoundError: Question channel not found (ID: ${config.channels.question})`);
    }

    console.log(`[question/delete] Question #${questionId} deleted by ${interaction.user.tag} (${interaction.user.id})`);

    try {
      await interaction.reply({ content: strings.question.deleteSuccess(question.id), ephemeral: true });
    } catch (error) {
      console.error(`[question/delete] ${error.constructor.name}: Failed to send delete success reply to ${interaction.user.tag}:`, error);
    }
  },
};
