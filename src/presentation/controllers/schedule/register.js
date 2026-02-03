const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Schedule = require('../../../domain/entities/Schedule');
const config = require('../../../../core/config');
const strings = require('../../interfaces/strings');

/**
 * Schedule Registration Command
 * Admin-only command to register a new schedule
 * Creates an embed message in the schedule channel with attendance reactions
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName('일정등록')
    .setDescription('일정 등록')
    .addStringOption((opt) => opt.setName('제목').setDescription('제목').setRequired(true))
    .addStringOption((opt) => opt.setName('날짜').setDescription('YYYY-MM-DD').setRequired(true))
    .addStringOption((opt) => opt.setName('시작').setDescription('HH:MM').setRequired(true))
    .addStringOption((opt) => opt.setName('종료').setDescription('HH:MM').setRequired(true))
    .addStringOption((opt) => opt.setName('장소').setDescription('장소').setRequired(true))
    .addStringOption((opt) => opt.setName('주최자').setDescription('주최자').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * Execute schedule registration
   * @param {CommandInteraction} interaction - Discord interaction
   * @param {SqliteRepository} repository - Repository instance
   */
  async execute(interaction, repository) {
    const title = interaction.options.getString('제목');
    const date = interaction.options.getString('날짜');
    const start = interaction.options.getString('시작');
    const end = interaction.options.getString('종료');
    const location = interaction.options.getString('장소');
    const teacher = interaction.options.getString('주최자');

    const errors = [];

    if (!title || title.trim() === '') errors.push(strings.schedule.emptyTitle);
    if (!location || location.trim() === '') errors.push(strings.schedule.emptyLocation);
    if (!teacher || teacher.trim() === '') errors.push(strings.schedule.emptyTeacher);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(strings.schedule.invalidDate);

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(start)) errors.push(strings.schedule.invalidStartTime);
    if (!timeRegex.test(end)) errors.push(strings.schedule.invalidEndTime);

    if (errors.length > 0) {
      console.log(`[schedule/register] Validation failed by ${interaction.user.tag}: ${errors.join(', ')}`);
      return interaction.reply({
        content: strings.schedule.registerFail + errors.map((e) => `- ${e}`).join('\n'),
        ephemeral: true,
      });
    }

    const schedule = new Schedule({ title, date, start, end, location, teacher });
    repository.addSchedule(schedule);

    const channel = interaction.guild.channels.cache.get(config.channels.schedule);
    if (channel) {
      try {
        const msg = await channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(strings.schedule.embedTitle(schedule.id, schedule.title))
              .setDescription(
                strings.schedule.embedDescription(schedule.location, schedule.date, schedule.start, schedule.end, schedule.teacher, '0명')
              )
              .setColor(0x00cc66),
          ],
        });
        await msg.react('✅');
        await msg.react('❌');
        schedule.messageId = msg.id;
        repository.updateSchedule(schedule);
      } catch (error) {
        console.error(`[schedule/register] ${error.constructor.name}: Failed to post schedule embed for #${schedule.id}:`, error);
      }
    } else {
      console.error(`[schedule/register] ChannelNotFoundError: Schedule channel not found (ID: ${config.channels.schedule})`);
    }

    console.log(`[schedule/register] Schedule #${schedule.id} "${title}" registered by ${interaction.user.tag} (${interaction.user.id})`);

    try {
      await interaction.reply({ content: strings.schedule.registerSuccess, ephemeral: true });
    } catch (error) {
      console.error(`[schedule/register] ${error.constructor.name}: Failed to send reply to ${interaction.user.tag}:`, error);
    }
  },
};
