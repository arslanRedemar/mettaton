const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('일정목록')
    .setDescription('현재 등록된 일정 목록 조회'),

  async execute(interaction, repository) {
    const lectures = repository.getAllLectures();

    if (lectures.length === 0) {
      return interaction.reply(strings.schedule.listEmpty);
    }

    const embed = new EmbedBuilder().setTitle(strings.schedule.listTitle).setColor(0x00aaff);

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

      const attendeeInfo = `${lec.attendees.length}명 ${attendeeNames.join(', ')}`;
      embed.addFields({
        name: `#${lec.id} ${lec.title}`,
        value: strings.schedule.listFieldValue(lec.date, lec.start, lec.end, lec.location, lec.teacher, attendeeInfo),
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
