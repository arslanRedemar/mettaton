const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('강의참석')
    .setDescription('강의에 참석 등록')
    .addIntegerOption((opt) => opt.setName('id').setDescription('강의 ID').setRequired(true)),

  async execute(interaction, repository) {
    const id = interaction.options.getInteger('id');
    const lecture = repository.getLectureById(id);

    if (!lecture) {
      return interaction.reply('❌ 해당 ID의 강의가 없습니다.');
    }

    lecture.addAttendee(interaction.user.id);
    repository.updateLecture(lecture);

    const channel = interaction.guild.channels.cache.find((c) => c.name === config.channels.schedule);
    if (channel && lecture.messageId) {
      try {
        const msg = await channel.messages.fetch(lecture.messageId);
        if (msg) {
          await msg.edit({
            embeds: [
              new EmbedBuilder()
                .setTitle(`📖 [${lecture.id}] ${lecture.title}`)
                .setDescription(
                  `장소: ${lecture.location}\n시각: ${lecture.date} ${lecture.start} ~ ${lecture.end}\n교사: ${lecture.teacher}\n인원: ${lecture.attendees.length}명 (${lecture.attendees.map((uid) => `<@${uid}>`).join(', ')})`
                )
                .setColor(0x00cc66),
            ],
          });
        }
      } catch {}
    }

    await interaction.reply(`✅ 강의 #${id} 참석 등록 완료`);
  },
};
