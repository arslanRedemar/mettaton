const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('퀴즈설정')
    .setDescription('퀴즈 설정 관리')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName('시간')
        .setDescription('출제 시간 및 해설 공개 시간 설정')
        .addStringOption((opt) => opt.setName('출제시간').setDescription('출제 시간 (HH:MM)').setRequired(true))
        .addStringOption((opt) => opt.setName('해설시간').setDescription('해설 공개 시간 (HH:MM)').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('채널')
        .setDescription('문제 출제 채널 설정')
        .addChannelOption((opt) =>
          opt
            .setName('채널')
            .setDescription('출제할 채널')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((sub) => sub.setName('활성화').setDescription('퀴즈 자동 출제 활성화'))
    .addSubcommand((sub) => sub.setName('비활성화').setDescription('퀴즈 자동 출제 비활성화'))
    .addSubcommand((sub) =>
      sub
        .setName('카테고리추가')
        .setDescription('새 카테고리 추가')
        .addStringOption((opt) => opt.setName('이름').setDescription('카테고리 이름').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('카테고리삭제')
        .setDescription('카테고리 삭제 (문제가 없는 경우만)')
        .addStringOption((opt) => opt.setName('이름').setDescription('카테고리 이름').setRequired(true))
    )
    .addSubcommand((sub) => sub.setName('카테고리목록').setDescription('등록된 카테고리 목록 조회')),

  async execute(interaction, _repository, schedulerService, _pointService, quizService) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: strings.quiz.noPermission(),
        ephemeral: true,
      });
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === '시간') {
        await this.handleTime(interaction, schedulerService, quizService);
      } else if (subcommand === '채널') {
        await this.handleChannel(interaction, quizService);
      } else if (subcommand === '활성화') {
        await this.handleEnable(interaction, schedulerService, quizService);
      } else if (subcommand === '비활성화') {
        await this.handleDisable(interaction, schedulerService, quizService);
      } else if (subcommand === '카테고리추가') {
        await this.handleCategoryAdd(interaction, quizService);
      } else if (subcommand === '카테고리삭제') {
        await this.handleCategoryDelete(interaction, quizService);
      } else if (subcommand === '카테고리목록') {
        await this.handleCategoryList(interaction, quizService);
      }
    } catch (error) {
      console.error(`[quiz/config/${subcommand}] ${error.constructor.name}: Config update failed for ${interaction.user.tag}:`, error);
      await interaction.reply({
        content: '❌ 설정 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },

  async handleTime(interaction, schedulerService, quizService) {
    const quizTime = interaction.options.getString('출제시간');
    const explanationTime = interaction.options.getString('해설시간');

    try {
      quizService.updateConfig({ quizTime, explanationTime });

      // Reschedule quiz jobs
      if (schedulerService && schedulerService.rescheduleQuizSchedules) {
        schedulerService.rescheduleQuizSchedules();
      }

      console.log(`[quiz/config/time] Time updated by ${interaction.user.tag}: quiz=${quizTime}, explanation=${explanationTime}`);
      await interaction.reply({
        content: strings.quiz.configTimeSet(quizTime, explanationTime),
        ephemeral: true,
      });
    } catch (error) {
      if (error.message === 'INVALID_TIME_FORMAT') {
        console.log(`[quiz/config/time] Invalid time format by ${interaction.user.tag}: quiz=${quizTime}, explanation=${explanationTime}`);
        return interaction.reply({
          content: strings.quiz.configInvalidTime(),
          ephemeral: true,
        });
      }
      throw error;
    }
  },

  async handleChannel(interaction, quizService) {
    const channel = interaction.options.getChannel('채널');

    quizService.updateConfig({ quizChannelId: channel.id });

    console.log(`[quiz/config/channel] Channel set by ${interaction.user.tag}: ${channel.id}`);
    await interaction.reply({
      content: strings.quiz.configChannelSet(channel.id),
      ephemeral: true,
    });
  },

  async handleEnable(interaction, schedulerService, quizService) {
    quizService.updateConfig({ enabled: true });

    // Start quiz schedules
    if (schedulerService && schedulerService.startQuizSchedules) {
      schedulerService.startQuizSchedules();
    }

    console.log(`[quiz/config/enable] Quiz enabled by ${interaction.user.tag}`);
    await interaction.reply({
      content: strings.quiz.configEnabled(),
      ephemeral: true,
    });
  },

  async handleDisable(interaction, schedulerService, quizService) {
    quizService.updateConfig({ enabled: false });

    // Cancel quiz schedules
    if (schedulerService && schedulerService.cancelQuizSchedules) {
      schedulerService.cancelQuizSchedules();
    }

    console.log(`[quiz/config/disable] Quiz disabled by ${interaction.user.tag}`);
    await interaction.reply({
      content: strings.quiz.configDisabled(),
      ephemeral: true,
    });
  },

  async handleCategoryAdd(interaction, quizService) {
    const name = interaction.options.getString('이름');

    try {
      quizService.addCategory(name);

      console.log(`[quiz/config/category-add] Category '${name}' added by ${interaction.user.tag}`);
      await interaction.reply({
        content: strings.quiz.configCategoryAdded(name),
        ephemeral: true,
      });
    } catch (error) {
      if (error.message === 'INVALID_CATEGORY_NAME') {
        console.log(`[quiz/config/category-add] Invalid category name by ${interaction.user.tag}: ${name}`);
        return interaction.reply({
          content: '❌ 카테고리 이름이 올바르지 않습니다.',
          ephemeral: true,
        });
      }

      if (error.message === 'CATEGORY_ALREADY_EXISTS') {
        console.log(`[quiz/config/category-add] Category already exists: ${name} by ${interaction.user.tag}`);
        return interaction.reply({
          content: `❌ 카테고리 '${name}'은(는) 이미 존재합니다.`,
          ephemeral: true,
        });
      }

      throw error;
    }
  },

  async handleCategoryDelete(interaction, quizService) {
    const name = interaction.options.getString('이름');

    try {
      quizService.deleteCategory(name);

      console.log(`[quiz/config/category-delete] Category '${name}' deleted by ${interaction.user.tag}`);
      await interaction.reply({
        content: strings.quiz.configCategoryRemoved(name),
        ephemeral: true,
      });
    } catch (error) {
      if (error.message === 'CATEGORY_NOT_FOUND') {
        console.log(`[quiz/config/category-delete] Category not found: ${name} by ${interaction.user.tag}`);
        return interaction.reply({
          content: `❌ 카테고리 '${name}'을(를) 찾을 수 없습니다.`,
          ephemeral: true,
        });
      }

      if (error.message === 'CATEGORY_IN_USE') {
        console.log(`[quiz/config/category-delete] Category in use: ${name} (${error.questionCount} questions) by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.quiz.configCategoryInUse(name, error.questionCount),
          ephemeral: true,
        });
      }

      throw error;
    }
  },

  async handleCategoryList(interaction, quizService) {
    const categories = quizService.getAllCategories();

    if (categories.length === 0) {
      console.log(`[quiz/config/category-list] No categories, requested by ${interaction.user.tag}`);
      return interaction.reply({
        content: '📋 등록된 카테고리가 없습니다.',
        ephemeral: true,
      });
    }

    const categoryNames = categories.map((c) => c.name).join(', ');

    console.log(`[quiz/config/category-list] Category list requested by ${interaction.user.tag}: ${categoryNames}`);
    await interaction.reply({
      content: strings.quiz.configCategoryList(categoryNames),
      ephemeral: true,
    });
  },
};
