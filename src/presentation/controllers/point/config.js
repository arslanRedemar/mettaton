const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('포인트설정')
    .setDescription('포인트 시스템 관리 (관리자 전용)')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('조정')
        .setDescription('특정 사용자의 포인트 조정')
        .addUserOption((option) =>
          option
            .setName('사용자')
            .setDescription('포인트를 조정할 사용자')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('포인트')
            .setDescription('설정할 포인트 (0 이상)')
            .setMinValue(0)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('설정')
        .setDescription('포인트 적립 설정 변경')
        .addIntegerOption((option) =>
          option
            .setName('적립포인트')
            .setDescription('활동당 적립될 포인트 (기본: 100)')
            .setMinValue(1)
            .setMaxValue(10000)
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('쿨다운')
            .setDescription('쿨다운 시간(분) (기본: 5)')
            .setMinValue(1)
            .setMaxValue(1440)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('확인')
        .setDescription('현재 포인트 설정 확인')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('초기화')
        .setDescription('포인트 초기화')
        .addUserOption((option) =>
          option
            .setName('사용자')
            .setDescription('초기화할 사용자 (미지정시 전체 초기화)')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('활동설정')
        .setDescription('활동 유형별 포인트 설정')
        .addStringOption((option) =>
          option
            .setName('유형')
            .setDescription('활동 유형')
            .setRequired(true)
            .addChoices(
              { name: '포럼 글쓰기', value: 'FORUM_POST' },
              { name: '질문 답변', value: 'QUESTION_ANSWER' },
              { name: '수행모임 참여', value: 'MEETING_ATTEND' },
              { name: '개인수행', value: 'PERSONAL_PRACTICE' },
              { name: '일반활동', value: 'GENERAL' },
            )
        )
        .addIntegerOption((option) =>
          option.setName('포인트').setDescription('적립 포인트').setMinValue(0).setMaxValue(10000).setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName('쿨다운').setDescription('쿨다운(분)').setMinValue(1).setMaxValue(1440).setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName('일일한도').setDescription('일일 한도 (0=무제한)').setMinValue(0).setMaxValue(100).setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('활동확인')
        .setDescription('활동 유형별 포인트 설정 확인')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, _repository, _schedulerService, pointAccumulationService) {
    if (!pointAccumulationService) {
      console.error('[point/config] Point system unavailable');
      return interaction.reply({
        content: '❌ 포인트 시스템을 사용할 수 없습니다.',
        ephemeral: true,
      });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '조정') {
      const user = interaction.options.getUser('사용자');
      const points = interaction.options.getInteger('포인트');

      const newPoints = pointAccumulationService.setPoints(user.id, points);

      console.log(`[point/config] Points set for ${user.tag} (${user.id}): ${newPoints}, by ${interaction.user.tag}`);
      await interaction.reply({
        content: strings.point.setSuccess(user.id, newPoints),
        ephemeral: true,
      });
    } else if (subcommand === '설정') {
      const pointsPerAction = interaction.options.getInteger('적립포인트');
      const cooldownMinutes = interaction.options.getInteger('쿨다운');

      pointAccumulationService.setConfig(pointsPerAction, cooldownMinutes);

      console.log(`[point/config] Config updated by ${interaction.user.tag}: pointsPerAction=${pointsPerAction}, cooldown=${cooldownMinutes}min`);
      await interaction.reply({
        content: strings.point.configSaved(pointsPerAction, cooldownMinutes),
        ephemeral: true,
      });
    } else if (subcommand === '확인') {
      const config = pointAccumulationService.getConfig();

      console.log(`[point/config] Config viewed by ${interaction.user.tag}`);
      await interaction.reply({
        content: strings.point.configDisplay(config.pointsPerAction, config.cooldownMinutes),
        ephemeral: true,
      });
    } else if (subcommand === '활동설정') {
      const type = interaction.options.getString('유형');
      const points = interaction.options.getInteger('포인트');
      const cooldown = interaction.options.getInteger('쿨다운');
      const dailyCapInput = interaction.options.getInteger('일일한도');
      const dailyCap = dailyCapInput === 0 || dailyCapInput === null ? null : dailyCapInput;

      pointAccumulationService.setActivityTypeConfig(type, points, cooldown, dailyCap, true);

      const ACTIVITY_TYPE_LABELS = {
        FORUM_POST: '포럼 글쓰기',
        QUESTION_ANSWER: '질문 답변',
        MEETING_ATTEND: '수행모임 참여',
        PERSONAL_PRACTICE: '개인수행',
        GENERAL: '일반활동',
      };

      const label = ACTIVITY_TYPE_LABELS[type] || type;
      const capText = dailyCap ? ` | 일일한도: ${dailyCap}회` : '';

      console.log(`[point/config] Activity type config updated by ${interaction.user.tag}: ${type} = ${points}pts, ${cooldown}min CD, cap=${dailyCap}`);
      await interaction.reply({
        content: `✅ **${label}** 설정 완료\n포인트: ${points} | 쿨다운: ${cooldown}분${capText}`,
        ephemeral: true,
      });
    } else if (subcommand === '활동확인') {
      const configs = pointAccumulationService.getAllActivityTypeConfigs();

      const ACTIVITY_TYPE_LABELS = {
        FORUM_POST: '포럼 글쓰기',
        QUESTION_ANSWER: '질문 답변',
        MEETING_ATTEND: '수행모임 참여',
        PERSONAL_PRACTICE: '개인수행',
        GENERAL: '일반활동',
      };

      const lines = configs.map((c) => {
        const label = ACTIVITY_TYPE_LABELS[c.activityType] || c.activityType;
        const capText = c.dailyCap ? ` | 일일한도: ${c.dailyCap}회` : '';
        const status = c.enabled ? '✅' : '❌';
        return `${status} **${label}**: ${c.points}pts | 쿨다운: ${c.cooldownMinutes}분${capText}`;
      });

      console.log(`[point/config] Activity type configs viewed by ${interaction.user.tag}`);
      await interaction.reply({
        content: `📋 **활동 유형별 포인트 설정**\n${lines.join('\n')}`,
        ephemeral: true,
      });
    } else if (subcommand === '초기화') {
      const user = interaction.options.getUser('사용자');

      if (user) {
        // Reset specific user
        const confirmMessage = strings.point.resetUserConfirm(user.id);
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_reset_user')
            .setLabel('확인')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancel_reset')
            .setLabel('취소')
            .setStyle(ButtonStyle.Secondary)
        );

        const response = await interaction.reply({
          content: confirmMessage,
          components: [row],
          ephemeral: true,
        });

        try {
          const confirmation = await response.awaitMessageComponent({
            filter: (i) => i.user.id === interaction.user.id,
            time: 30000,
          });

          if (confirmation.customId === 'confirm_reset_user') {
            pointAccumulationService.resetUserPoints(user.id);
            console.log(`[point/config] Points reset for ${user.tag} (${user.id}) by ${interaction.user.tag}`);
            await confirmation.update({
              content: strings.point.resetUserSuccess(user.id),
              components: [],
            });
          } else {
            console.log(`[point/config] User point reset cancelled by ${interaction.user.tag}`);
            await confirmation.update({
              content: strings.point.resetCancelled,
              components: [],
            });
          }
        } catch (error) {
          console.log(`[point/config] User point reset timed out for ${interaction.user.tag}`);
          await interaction.editReply({
            content: strings.point.resetTimeout,
            components: [],
          });
        }
      } else {
        // Reset all users
        const confirmMessage = strings.point.resetAllConfirm;
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_reset_all')
            .setLabel('확인')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancel_reset')
            .setLabel('취소')
            .setStyle(ButtonStyle.Secondary)
        );

        const response = await interaction.reply({
          content: confirmMessage,
          components: [row],
          ephemeral: true,
        });

        try {
          const confirmation = await response.awaitMessageComponent({
            filter: (i) => i.user.id === interaction.user.id,
            time: 30000,
          });

          if (confirmation.customId === 'confirm_reset_all') {
            pointAccumulationService.resetAllPoints();
            console.log(`[point/config] All points reset by ${interaction.user.tag}`);
            await confirmation.update({
              content: strings.point.resetAllSuccess,
              components: [],
            });
          } else {
            console.log(`[point/config] All points reset cancelled by ${interaction.user.tag}`);
            await confirmation.update({
              content: strings.point.resetCancelled,
              components: [],
            });
          }
        } catch (error) {
          console.log(`[point/config] All points reset timed out for ${interaction.user.tag}`);
          await interaction.editReply({
            content: strings.point.resetTimeout,
            components: [],
          });
        }
      }
    }
  },
};
