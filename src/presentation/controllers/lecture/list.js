const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('강의목록')
    .setDescription('현재 등록된 강의 목록 조회')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, repository) {
    const lectures = repository.getAllLectures();

    if (lectures.length === 0) {
      return interaction.reply('📭 등록된 강의가 없습니다.');
    }

    const embed = new EmbedBuilder().setTitle('📚 현재 등록된 강의 목록').setColor(0x00aaff);

    for (const lec of lectures) {
      const attendeeNames = [];
      for (const id of lec.attendees) {
        try {
          const member = await interaction.guild.members.fetch(id);
          attendeeNames.push(member.displayName);
        } catch {
          attendeeNames.push(id);
        }
      }

      embed.addFields({
        name: `#${lec.id} ${lec.title}`,
        value: `날짜: ${lec.date} ${lec.start}~${lec.end}\n장소: ${lec.location}\n교사: ${lec.teacher}\n참석자: ${lec.attendees.length}명 ${attendeeNames.join(', ')}`,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
