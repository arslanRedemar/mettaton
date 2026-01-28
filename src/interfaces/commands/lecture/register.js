const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Lecture = require('../../../domain/entities/Lecture');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('강의등록')
    .setDescription('강의 등록')
    .addStringOption((opt) => opt.setName('제목').setDescription('강의 제목').setRequired(true))
    .addStringOption((opt) => opt.setName('날짜').setDescription('YYYY-MM-DD').setRequired(true))
    .addStringOption((opt) => opt.setName('시작').setDescription('HH:MM').setRequired(true))
    .addStringOption((opt) => opt.setName('종료').setDescription('HH:MM').setRequired(true))
    .addStringOption((opt) => opt.setName('장소').setDescription('강의 장소').setRequired(true))
    .addStringOption((opt) => opt.setName('교사').setDescription('강의 교사').setRequired(true)),

  async execute(interaction, repository) {
    const title = interaction.options.getString('제목');
    const date = interaction.options.getString('날짜');
    const start = interaction.options.getString('시작');
    const end = interaction.options.getString('종료');
    const location = interaction.options.getString('장소');
    const teacher = interaction.options.getString('교사');

    const errors = [];

    if (!title || title.trim() === '') errors.push('제목이 비어 있습니다.');
    if (!location || location.trim() === '') errors.push('장소가 비어 있습니다.');
    if (!teacher || teacher.trim() === '') errors.push('교사가 비어 있습니다.');

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)');

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(start)) errors.push('시작 시간 형식이 올바르지 않습니다. (HH:mm)');
    if (!timeRegex.test(end)) errors.push('종료 시간 형식이 올바르지 않습니다. (HH:mm)');

    if (errors.length > 0) {
      return interaction.reply({
        content: '❌ 강의 등록 실패:\n' + errors.map((e) => `- ${e}`).join('\n'),
        ephemeral: true,
      });
    }

    const lecture = new Lecture({ title, date, start, end, location, teacher });
    repository.addLecture(lecture);

    const channel = interaction.guild.channels.cache.find((c) => c.name === config.channels.schedule);
    if (channel) {
      const msg = await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`📖 [${lecture.id}] ${lecture.title}`)
            .setDescription(
              `장소: ${lecture.location}\n시각: ${lecture.date} ${lecture.start} ~ ${lecture.end}\n교사: ${lecture.teacher}\n인원: 0명`
            )
            .setColor(0x00cc66),
        ],
      });
      lecture.messageId = msg.id;
      repository.updateLecture(lecture);
    }

    await interaction.reply('✅ 강의가 등록되었습니다.');
  },
};
