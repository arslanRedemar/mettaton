const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../../core/config');
const ActivityType = require('../../../../core/types/ActivityType');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('질문답변')
    .setDescription('질문에 답변 등록')
    .addIntegerOption((opt) => opt.setName('id').setDescription('질문 ID').setRequired(true))
    .addStringOption((opt) => opt.setName('내용').setDescription('답변 내용').setRequired(true)),

  async execute(interaction, repository, _schedulerService, pointAccumulationService) {
    const id = interaction.options.getInteger('id');
    const answer = interaction.options.getString('내용');

    const question = repository.getQuestionById(id);

    if (!question) {
      console.log(`[question/answer] Question #${id} not found, requested by ${interaction.user.tag}`);
      return interaction.reply(strings.question.answerNotFound);
    }

    question.setAnswer(answer, interaction.user.id);
    repository.updateQuestion(question);

    // Award question answer points
    if (pointAccumulationService) {
      try {
        const pointResult = pointAccumulationService.tryAccumulate(interaction.user.id, ActivityType.QUESTION_ANSWER);
        if (pointResult) {
          console.log(`[question/answer] Points awarded to ${interaction.user.tag} (${interaction.user.id}): +${pointResult.pointsAdded}`);
        }
      } catch (err) {
        console.error(`[question/answer] Point accumulation error for ${interaction.user.tag} (${interaction.user.id}):`, err);
      }
    }

    const channel = interaction.guild.channels.cache.get(config.channels.question);
    if (channel && question.messageId) {
      try {
        const msg = await channel.messages.fetch(question.messageId);
        if (msg) {
          const attendeeInfo = question.attendees.length > 0
            ? `${question.attendees.length}명 (${question.attendees.map((uid) => `<@${uid}>`).join(', ')})`
            : '0명';
          await msg.edit({
            content: '',
            embeds: [
              new EmbedBuilder()
                .setTitle(strings.question.embedTitle(question.id))
                .setDescription(
                  strings.question.embedDescriptionAnswered(question.question, question.author, answer, interaction.user.id, attendeeInfo),
                )
                .setColor(0x00cc66),
            ],
          });
        }
      } catch (error) {
        console.error(`[question/answer] Failed to update Discord message for question #${id}:`, error);
      }
    }

    console.log(`[question/answer] Question #${id} answered by ${interaction.user.tag}`);
    await interaction.reply(strings.question.answerSuccess(id));
  },
};
