const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('수행설정')
    .setDescription('수행 모임 자동 알림 설정 (관리자 전용)')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('설정')
        .setDescription('수행 모임 알림 설정')
        .addChannelOption((option) =>
          option
            .setName('채널')
            .setDescription('알림을 보낼 채널')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('알림시')
            .setDescription('알림 시간 (시, 0-23)')
            .setMinValue(0)
            .setMaxValue(23)
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('알림분')
            .setDescription('알림 시간 (분, 0-59)')
            .setMinValue(0)
            .setMaxValue(59)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName('시작시각').setDescription('모임 시작 시각 (예: 23:00)').setRequired(true)
        )
        .addStringOption((option) =>
          option.setName('종료시각').setDescription('모임 종료 시각 (예: 24:00)').setRequired(true)
        )
        .addStringOption((option) =>
          option.setName('장소').setDescription('모임 장소').setRequired(true)
        )
        .addStringOption((option) =>
          option.setName('활동내용').setDescription('활동 내용').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('활성화').setDescription('수행 모임 알림 활성화')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('비활성화').setDescription('수행 모임 알림 비활성화')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('확인').setDescription('현재 수행 모임 설정 확인')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, repository, schedulerService) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '설정') {
      const channel = interaction.options.getChannel('채널');
      const scheduleHour = interaction.options.getInteger('알림시');
      const scheduleMinute = interaction.options.getInteger('알림분');
      const meetingStartTime = interaction.options.getString('시작시각');
      const meetingEndTime = interaction.options.getString('종료시각');
      const location = interaction.options.getString('장소');
      const activity = interaction.options.getString('활동내용');

      // Validate time format
      const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(meetingStartTime) || !timeRegex.test(meetingEndTime)) {
        console.log(`[meeting/config] Invalid time format by ${interaction.user.tag}: start=${meetingStartTime}, end=${meetingEndTime}`);
        return interaction.reply({
          content: strings.meeting.invalidTimeFormat,
          ephemeral: true,
        });
      }

      const currentConfig = repository.getMeetingConfig();
      const enabled = currentConfig ? currentConfig.enabled : false;

      repository.setMeetingConfig({
        channelId: channel.id,
        scheduleHour,
        scheduleMinute,
        meetingStartTime,
        meetingEndTime,
        location,
        activity,
        enabled,
      });

      // Reschedule if enabled
      if (enabled && schedulerService) {
        schedulerService.reschedule();
      }

      const scheduleTime = `${String(scheduleHour).padStart(2, '0')}:${String(scheduleMinute).padStart(2, '0')}`;
      const status = enabled ? strings.meeting.statusEnabled : strings.meeting.statusDisabled;

      console.log(`[meeting/config] Meeting config saved by ${interaction.user.tag}: channel=${channel.id}, time=${scheduleTime}, ${meetingStartTime}~${meetingEndTime}`);
      await interaction.reply({
        content: strings.meeting.configSaved(channel.id, scheduleTime, meetingStartTime, meetingEndTime, location, activity, status),
        ephemeral: true,
      });
    } else if (subcommand === '활성화') {
      const config = repository.getMeetingConfig();
      if (!config) {
        console.log(`[meeting/config] Enable failed - no config exists, requested by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.meeting.noConfig,
          ephemeral: true,
        });
      }

      repository.setMeetingConfig({ ...config, enabled: true });

      if (schedulerService) {
        schedulerService.reschedule();
      }

      console.log(`[meeting/config] Meeting enabled by ${interaction.user.tag}`);
      await interaction.reply({
        content: strings.meeting.enableSuccess,
        ephemeral: true,
      });
    } else if (subcommand === '비활성화') {
      const config = repository.getMeetingConfig();
      if (!config) {
        console.log(`[meeting/config] Disable failed - no config exists, requested by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.meeting.noConfigExists,
          ephemeral: true,
        });
      }

      repository.setMeetingConfig({ ...config, enabled: false });

      if (schedulerService) {
        schedulerService.cancelSchedule();
      }

      console.log(`[meeting/config] Meeting disabled by ${interaction.user.tag}`);
      await interaction.reply({
        content: strings.meeting.disableSuccess,
        ephemeral: true,
      });
    } else if (subcommand === '확인') {
      const config = repository.getMeetingConfig();
      if (!config) {
        console.log(`[meeting/config] View failed - no config exists, requested by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.meeting.noConfigView,
          ephemeral: true,
        });
      }

      const scheduleTime = `${String(config.scheduleHour).padStart(2, '0')}:${String(config.scheduleMinute).padStart(2, '0')}`;
      const status = config.enabled ? strings.meeting.statusEnabled : strings.meeting.statusDisabled;

      console.log(`[meeting/config] Config viewed by ${interaction.user.tag}`);
      await interaction.reply({
        content: strings.meeting.configDisplay(config.channelId, scheduleTime, config.meetingStartTime, config.meetingEndTime, config.location, config.activity, status),
        ephemeral: true,
      });
    }
  },
};
