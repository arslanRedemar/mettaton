const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const strings = require('../../interfaces/strings');

/**
 * Schedule List Command
 * Displays all registered schedules with attendee information
 * Available to all users (ephemeral reply)
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName('일정목록')
    .setDescription('현재 등록된 일정 목록 조회'),

  /**
   * Execute schedule list display
   * @param {CommandInteraction} interaction - Discord interaction
   * @param {SqliteRepository} repository - Repository instance
   */
  async execute(interaction, repository) {
    const schedules = repository.getAllSchedules();

    if (schedules.length === 0) {
      console.log(`[schedule/list] No schedules found, requested by ${interaction.user.tag} (${interaction.user.id})`);
      try {
        return interaction.reply({ content: strings.schedule.listEmpty, ephemeral: true });
      } catch (error) {
        console.error(`[schedule/list] ${error.constructor.name}: Failed to send empty list reply:`, error);
        return;
      }
    }

    const embed = new EmbedBuilder().setTitle(strings.schedule.listTitle).setColor(0x00aaff);

    for (const schedule of schedules) {
      const attendeeNames = [];
      for (const id of schedule.attendees) {
        try {
          const member = await interaction.guild.members.fetch(id);
          attendeeNames.push(member.displayName);
        } catch (error) {
          console.error(`[schedule/list] Failed to fetch member ${id}:`, error);
          attendeeNames.push(id);
        }
      }

      const attendeeInfo = `${schedule.attendees.length}명 ${attendeeNames.join(', ')}`;
      embed.addFields({
        name: `#${schedule.id} ${schedule.title}`,
        value: strings.schedule.listFieldValue(schedule.date, schedule.start, schedule.end, schedule.location, schedule.teacher, attendeeInfo),
      });
    }

    console.log(`[schedule/list] Listed ${schedules.length} schedule(s), requested by ${interaction.user.tag} (${interaction.user.id})`);

    try {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(`[schedule/list] ${error.constructor.name}: Failed to send schedule list to ${interaction.user.tag}:`, error);
    }
  },
};
