const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../../core/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('질문삭제')
    .setDescription('질문을 삭제합니다')
    .addIntegerOption((option) => option.setName('id').setDescription('삭제할 질문 ID').setRequired(true)),

  async execute(interaction, repository) {
    const questionId = interaction.options.getInteger('id');
    const question = repository.deleteQuestion(questionId);

    if (!question) {
      return interaction.reply({ content: `❌ 질문 ID ${questionId}를 찾을 수 없습니다.`, ephemeral: true });
    }

    const channel = interaction.guild.channels.cache.get(config.channels.question);
    if (channel && question.messageId) {
      try {
        const msg = await channel.messages.fetch(question.messageId);
        if (msg) await msg.delete();
      } catch (err) {
        console.log('질문 메시지 삭제 실패:', err);
      }
    }

    await interaction.reply({ content: `🗑 질문 #${question.id} 삭제 완료`, ephemeral: true });
  },
};
