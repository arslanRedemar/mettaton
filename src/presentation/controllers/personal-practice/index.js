const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const PersonalPractice = require('../../../domain/entities/PersonalPractice');
const PersonalPracticeGraphRenderer = require('../../views/PersonalPracticeGraphRenderer');
const config = require('../../../../core/config');
const ActivityType = require('../../../../core/types/ActivityType');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('개인수행')
    .setDescription('개인 수행 관리')
    .addSubcommand((sub) =>
      sub
        .setName('등록')
        .setDescription('개인 수행 계획 등록')
        .addStringOption((opt) =>
          opt.setName('내용').setDescription('수행 내용 (예: 명상, 절, 독서 등)').setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt.setName('목표').setDescription('매일 목표량 (숫자)').setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName('단위').setDescription('목표 단위 (예: 분, 회, 권 등)').setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName('시작일').setDescription('시작 날짜 (YYYY-MM-DD)').setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName('종료일').setDescription('종료 날짜 (YYYY-MM-DD)').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('확인')
        .setDescription('수행 현황 그래프 조회')
        .addIntegerOption((opt) =>
          opt
            .setName('계획')
            .setDescription('조회할 수행 계획')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('수정')
        .setDescription('수행 계획 수정')
        .addIntegerOption((opt) =>
          opt
            .setName('계획')
            .setDescription('수정할 수행 계획')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((opt) =>
          opt.setName('내용').setDescription('새로운 수행 내용').setRequired(false)
        )
        .addIntegerOption((opt) =>
          opt.setName('목표').setDescription('새로운 매일 목표량').setRequired(false)
        )
        .addStringOption((opt) =>
          opt.setName('단위').setDescription('새로운 목표 단위').setRequired(false)
        )
        .addStringOption((opt) =>
          opt.setName('종료일').setDescription('새로운 종료 날짜 (YYYY-MM-DD)').setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('삭제')
        .setDescription('수행 계획 삭제')
        .addIntegerOption((opt) =>
          opt
            .setName('계획')
            .setDescription('삭제할 수행 계획')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('체크')
        .setDescription('오늘의 수행 완료 체크')
        .addIntegerOption((opt) =>
          opt
            .setName('계획')
            .setDescription('체크할 수행 계획')
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),

  async autocomplete(interaction, repository) {
    const subcommand = interaction.options.getSubcommand();
    if (!['확인', '수정', '삭제', '체크'].includes(subcommand)) return;

    try {
      const userId = interaction.user.id;
      let plans = repository.getPersonalPracticePlansByUserId(userId);

      // For '체크' subcommand, filter to only active (not ended) plans
      if (subcommand === '체크') {
        plans = plans.filter((plan) => !plan.hasEnded());
      }

      const choices = plans.slice(0, 25).map((plan) => ({
        name: `#${plan.id} ${plan.content} (${plan.startDate}~${plan.endDate})`,
        value: plan.id,
      }));

      await interaction.respond(choices);
    } catch (error) {
      console.error(`[personal-practice/autocomplete] ${error.constructor.name}: Failed to fetch plans for ${interaction.user.tag}:`, error);
      await interaction.respond([]);
    }
  },

  async execute(interaction, repository, _schedulerService, pointAccumulationService) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '등록') {
      await this.handleRegister(interaction, repository);
    } else if (subcommand === '확인') {
      await this.handleView(interaction, repository);
    } else if (subcommand === '수정') {
      await this.handleEdit(interaction, repository);
    } else if (subcommand === '삭제') {
      await this.handleDelete(interaction, repository);
    } else if (subcommand === '체크') {
      await this.handleCheck(interaction, repository, pointAccumulationService);
    }
  },

  async handleRegister(interaction, repository) {
    const content = interaction.options.getString('내용');
    const dailyGoal = interaction.options.getInteger('목표');
    const unit = interaction.options.getString('단위');
    const startDate = interaction.options.getString('시작일');
    const endDate = interaction.options.getString('종료일');

    const errors = [];

    // Validate content
    if (!content || content.trim() === '') {
      errors.push('수행 내용을 입력해주세요.');
    }

    // Validate daily goal
    if (!dailyGoal || dailyGoal <= 0) {
      errors.push('목표량은 1 이상이어야 합니다.');
    }

    // Validate unit
    if (!unit || unit.trim() === '') {
      errors.push('목표 단위를 입력해주세요.');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      errors.push(strings.personalPractice.invalidDateFormat);
    }
    if (!dateRegex.test(endDate)) {
      errors.push(strings.personalPractice.invalidDateFormat);
    }

    // Validate date logic
    if (dateRegex.test(startDate) && dateRegex.test(endDate)) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (end <= start) {
        errors.push(strings.personalPractice.endBeforeStart);
      }

      if (start < today) {
        errors.push(strings.personalPractice.startInPast);
      }

      // Validate max duration (365 days)
      const durationMs = end - start;
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      if (durationDays > 365) {
        errors.push(strings.personalPractice.exceedsMaxDuration);
      }
    }

    if (errors.length > 0) {
      console.log(`[personal-practice/register] Validation failed by ${interaction.user.tag}: ${errors.join(', ')}`);
      return interaction.reply({
        content: `❌ 등록 실패:\n${errors.map((e) => `- ${e}`).join('\n')}`,
        ephemeral: true,
      });
    }

    // Check if command is executed in 수행계획방 channel
    const meetingConfig = repository.getMeetingConfig();
    if (!meetingConfig || interaction.channelId !== meetingConfig.channelId) {
      console.log(`[personal-practice/register] Channel restriction: ${interaction.user.tag} tried to register outside 수행계획방 channel (channel: ${interaction.channelId})`);
      return interaction.reply({
        content: '❌ 이 명령어는 수행계획방 채널에서만 사용할 수 있습니다.',
        ephemeral: true,
      });
    }

    const plan = new PersonalPractice({
      userId: interaction.user.id,
      content,
      dailyGoal,
      unit,
      startDate,
      endDate,
    });

    repository.addPersonalPracticePlan(plan);

    // Post public embed to 수행계획방 channel
    const channel = interaction.guild.channels.cache.get(meetingConfig.channelId);
    if (channel) {
      try {
        const embed = new EmbedBuilder()
          .setTitle(strings.personalPractice.embedTitle)
          .setDescription(
            strings.personalPractice.embedDescription(
              `<@${interaction.user.id}>`,
              content,
              dailyGoal,
              unit,
              startDate,
              endDate,
              0,
              plan.getTotalDays(),
              0
            )
          )
          .setColor(0x4CAF50)
          .setFooter({ text: strings.personalPractice.embedFooter });

        const msg = await channel.send({ embeds: [embed] });
        await msg.react('✅');

        plan.messageId = msg.id;
        repository.updatePersonalPracticePlan(plan);
      } catch (error) {
        console.error(`[personal-practice/register] DiscordAPIError: Failed to send embed for plan #${plan.id}:`, error);
      }
    } else {
      console.error(`[personal-practice/register] ChannelNotFoundError: 수행계획방 channel not found (ID: ${meetingConfig.channelId})`);
    }

    console.log(`[personal-practice/register] Plan #${plan.id} "${content}" registered by ${interaction.user.tag} (${interaction.user.id})`);
    await interaction.reply({
      content: strings.personalPractice.registerSuccess(plan.id),
      ephemeral: true,
    });
  },

  async handleView(interaction, repository) {
    const planId = interaction.options.getInteger('계획');
    const plan = repository.getPersonalPracticePlanById(planId);

    if (!plan) {
      console.log(`[personal-practice/view] Plan #${planId} not found, requested by ${interaction.user.tag}`);
      return interaction.reply({
        content: strings.personalPractice.notFound,
        ephemeral: true,
      });
    }

    // Check ownership
    if (plan.userId !== interaction.user.id) {
      console.log(`[personal-practice/view] Plan #${planId} access denied for ${interaction.user.tag} (owner: ${plan.userId})`);
      return interaction.reply({
        content: strings.personalPractice.notOwner,
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // Get check records
      const checkDates = repository.getPersonalPracticeRecords(planId);
      const allDates = plan.getAllDates();

      // Generate graph
      const graphRenderer = new PersonalPracticeGraphRenderer();
      const imageBuffer = await graphRenderer.renderGraph({
        content: plan.content,
        startDate: plan.startDate,
        endDate: plan.endDate,
        checkDates,
        allDates,
      });

      const attachment = new AttachmentBuilder(imageBuffer, { name: 'practice-graph.png' });

      const completedCount = checkDates.length;
      const totalDays = plan.getTotalDays();
      const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

      await interaction.editReply({
        content: `${strings.personalPractice.graphTitle(`<@${plan.userId}>`, plan.content)}\n${strings.personalPractice.graphProgress(completedCount, totalDays, percentage)}`,
        files: [attachment],
        ephemeral: true,
      });

      console.log(`[personal-practice/view] Graph generated for plan #${planId} by ${interaction.user.tag}`);
    } catch (error) {
      console.error(`[personal-practice/view] ${error.constructor.name}: Graph generation failed for plan #${planId}:`, error);
      await interaction.editReply({
        content: strings.personalPractice.graphError,
        ephemeral: true,
      });
    }
  },

  async handleEdit(interaction, repository) {
    const planId = interaction.options.getInteger('계획');
    const newContent = interaction.options.getString('내용');
    const newGoal = interaction.options.getInteger('목표');
    const newUnit = interaction.options.getString('단위');
    const newEndDate = interaction.options.getString('종료일');

    const plan = repository.getPersonalPracticePlanById(planId);

    if (!plan) {
      console.log(`[personal-practice/edit] Plan #${planId} not found, requested by ${interaction.user.tag}`);
      return interaction.reply({
        content: strings.personalPractice.notFound,
        ephemeral: true,
      });
    }

    // Check ownership
    if (plan.userId !== interaction.user.id) {
      console.log(`[personal-practice/edit] Plan #${planId} edit denied for ${interaction.user.tag} (owner: ${plan.userId})`);
      return interaction.reply({
        content: strings.personalPractice.notOwner,
        ephemeral: true,
      });
    }

    // Check if already ended
    if (plan.hasEnded()) {
      console.log(`[personal-practice/edit] Plan #${planId} already ended, requested by ${interaction.user.tag}`);
      return interaction.reply({
        content: strings.personalPractice.alreadyEnded,
        ephemeral: true,
      });
    }

    const errors = [];

    // Validate new values if provided
    if (newContent !== null && newContent.trim() === '') {
      errors.push('수행 내용은 비어있을 수 없습니다.');
    }

    if (newGoal !== null && newGoal <= 0) {
      errors.push('목표량은 1 이상이어야 합니다.');
    }

    if (newUnit !== null && newUnit.trim() === '') {
      errors.push('목표 단위는 비어있을 수 없습니다.');
    }

    if (newEndDate !== null) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(newEndDate)) {
        errors.push(strings.personalPractice.invalidDateFormat);
      } else {
        const end = new Date(newEndDate);
        const start = new Date(plan.startDate);
        if (end <= start) {
          errors.push(strings.personalPractice.endBeforeStart);
        }

        // Validate max duration (365 days)
        const durationMs = end - start;
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
        if (durationDays > 365) {
          errors.push(strings.personalPractice.exceedsMaxDuration);
        }
      }
    }

    if (errors.length > 0) {
      console.log(`[personal-practice/edit] Validation failed for plan #${planId} by ${interaction.user.tag}: ${errors.join(', ')}`);
      return interaction.reply({
        content: `❌ 수정 실패:\n${errors.map((e) => `- ${e}`).join('\n')}`,
        ephemeral: true,
      });
    }

    // Check if command is executed in 수행계획방 channel
    const meetingConfig = repository.getMeetingConfig();
    if (!meetingConfig || interaction.channelId !== meetingConfig.channelId) {
      console.log(`[personal-practice/edit] Channel restriction: ${interaction.user.tag} tried to edit plan #${planId} outside 수행계획방 channel (channel: ${interaction.channelId})`);
      return interaction.reply({
        content: '❌ 이 명령어는 수행계획방 채널에서만 사용할 수 있습니다.',
        ephemeral: true,
      });
    }

    // Update fields
    if (newContent !== null) plan.content = newContent;
    if (newGoal !== null) plan.dailyGoal = newGoal;
    if (newUnit !== null) plan.unit = newUnit;
    if (newEndDate !== null) plan.endDate = newEndDate;

    repository.updatePersonalPracticePlan(plan);

    // Update embed message
    const channel = interaction.guild.channels.cache.get(meetingConfig.channelId);
    if (channel && plan.messageId) {
      try {
        const msg = await channel.messages.fetch(plan.messageId);
        if (msg) {
          const checkDates = repository.getPersonalPracticeRecords(planId);
          const completedCount = checkDates.length;
          const totalDays = plan.getTotalDays();
          const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

          const embed = new EmbedBuilder()
            .setTitle(strings.personalPractice.embedTitle)
            .setDescription(
              strings.personalPractice.embedDescription(
                `<@${plan.userId}>`,
                plan.content,
                plan.dailyGoal,
                plan.unit,
                plan.startDate,
                plan.endDate,
                completedCount,
                totalDays,
                percentage
              )
            )
            .setColor(0x4CAF50)
            .setFooter({ text: strings.personalPractice.embedFooter });

          await msg.edit({ embeds: [embed] });
        }
      } catch (error) {
        console.error(`[personal-practice/edit] DiscordAPIError: Failed to update embed message for plan #${planId}:`, error);
      }
    }

    console.log(`[personal-practice/edit] Plan #${planId} updated by ${interaction.user.tag} (${interaction.user.id})`);
    await interaction.reply({
      content: strings.personalPractice.editSuccess(planId),
      ephemeral: true,
    });
  },

  async handleDelete(interaction, repository) {
    const planId = interaction.options.getInteger('계획');
    const plan = repository.getPersonalPracticePlanById(planId);

    if (!plan) {
      console.log(`[personal-practice/delete] Plan #${planId} not found, requested by ${interaction.user.tag}`);
      return interaction.reply({
        content: strings.personalPractice.notFound,
        ephemeral: true,
      });
    }

    // Check ownership
    if (plan.userId !== interaction.user.id) {
      console.log(`[personal-practice/delete] Plan #${planId} delete denied for ${interaction.user.tag} (owner: ${plan.userId})`);
      return interaction.reply({
        content: strings.personalPractice.notOwner,
        ephemeral: true,
      });
    }

    // Check if command is executed in 수행계획방 channel
    const meetingConfig = repository.getMeetingConfig();
    if (!meetingConfig || interaction.channelId !== meetingConfig.channelId) {
      console.log(`[personal-practice/delete] Channel restriction: ${interaction.user.tag} tried to delete plan #${planId} outside 수행계획방 channel (channel: ${interaction.channelId})`);
      return interaction.reply({
        content: '❌ 이 명령어는 수행계획방 채널에서만 사용할 수 있습니다.',
        ephemeral: true,
      });
    }

    // Delete from database (cascade will delete records)
    repository.deletePersonalPracticePlan(planId);

    // Delete Discord message
    const channel = interaction.guild.channels.cache.get(meetingConfig.channelId);
    if (channel && plan.messageId) {
      try {
        const msg = await channel.messages.fetch(plan.messageId);
        if (msg) await msg.delete();
      } catch (error) {
        console.error(`[personal-practice/delete] DiscordAPIError: Failed to delete message for plan #${planId}:`, error);
      }
    }

    console.log(`[personal-practice/delete] Plan #${planId} "${plan.content}" deleted by ${interaction.user.tag} (${interaction.user.id})`);
    await interaction.reply({
      content: strings.personalPractice.deleteSuccess(planId),
      ephemeral: true,
    });
  },

  async handleCheck(interaction, repository, pointAccumulationService) {
    const planId = interaction.options.getInteger('계획');
    const plan = repository.getPersonalPracticePlanById(planId);

    if (!plan) {
      console.log(`[personal-practice/체크] Plan #${planId} not found, requested by ${interaction.user.tag}`);
      return interaction.reply({
        content: strings.personalPractice.notFound,
        ephemeral: true,
      });
    }

    // Check ownership
    if (plan.userId !== interaction.user.id) {
      console.log(`[personal-practice/체크] Plan #${planId} check denied for ${interaction.user.tag} (owner: ${plan.userId})`);
      return interaction.reply({
        content: strings.personalPractice.notOwner,
        ephemeral: true,
      });
    }

    // Check if already ended
    if (plan.hasEnded()) {
      console.log(`[personal-practice/체크] Plan #${planId} already ended, requested by ${interaction.user.tag}`);
      return interaction.reply({
        content: strings.personalPractice.alreadyEnded,
        ephemeral: true,
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if today is within practice period
    if (today < plan.startDate || today > plan.endDate) {
      console.log(`[personal-practice/체크] Plan #${planId} outside period: today ${today} not in ${plan.startDate}~${plan.endDate}`);
      return interaction.reply({
        content: strings.personalPractice.outsidePeriod(plan.startDate, plan.endDate),
        ephemeral: true,
      });
    }

    try {
      // Add check record (duplicate check prevented by UNIQUE constraint)
      const added = repository.addPersonalPracticeRecord(planId, interaction.user.id, today);

      if (!added) {
        // Already checked today
        console.log(`[personal-practice/체크] Plan #${planId} already checked for ${today} by ${interaction.user.tag}`);
        return interaction.reply({
          content: strings.personalPractice.alreadyChecked(plan.content),
          ephemeral: true,
        });
      }

      // Award personal practice points
      if (pointAccumulationService) {
        try {
          const pointResult = pointAccumulationService.tryAccumulate(interaction.user.id, ActivityType.PERSONAL_PRACTICE);
          if (pointResult) {
            console.log(`[personal-practice/체크] Points awarded to ${interaction.user.tag} (${interaction.user.id}): +${pointResult.pointsAdded}`);
          }
        } catch (err) {
          console.error(`[personal-practice/체크] Point accumulation error for ${interaction.user.tag} (${interaction.user.id}):`, err);
        }
      }

      // Update embed message with new progress
      const meetingConfig = repository.getMeetingConfig();
      if (meetingConfig && plan.messageId) {
        const channel = interaction.guild.channels.cache.get(meetingConfig.channelId);
        if (channel) {
          try {
            const msg = await channel.messages.fetch(plan.messageId);
            if (msg) {
              const checkDates = repository.getPersonalPracticeRecords(planId);
              const completedCount = checkDates.length;
              const totalDays = plan.getTotalDays();
              const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

              const embed = new EmbedBuilder()
                .setTitle(strings.personalPractice.embedTitle)
                .setDescription(
                  strings.personalPractice.embedDescription(
                    `<@${plan.userId}>`,
                    plan.content,
                    plan.dailyGoal,
                    plan.unit,
                    plan.startDate,
                    plan.endDate,
                    completedCount,
                    totalDays,
                    percentage
                  )
                )
                .setColor(0x4CAF50)
                .setFooter({ text: strings.personalPractice.embedFooter });

              await msg.edit({ embeds: [embed] });
            }
          } catch (error) {
            console.error(`[personal-practice/체크] DiscordAPIError: Failed to update embed message for plan #${planId}:`, error);
          }
        } else {
          console.error(`[personal-practice/체크] ChannelNotFoundError: 수행계획방 channel not found (ID: ${meetingConfig.channelId})`);
        }
      }

      // Calculate updated stats for response
      const checkDates = repository.getPersonalPracticeRecords(planId);
      const completedCount = checkDates.length;
      const totalDays = plan.getTotalDays();
      const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

      console.log(`[personal-practice/체크] Plan #${planId} checked by ${interaction.user.tag} (${interaction.user.id}) for ${today}`);
      await interaction.reply({
        content: strings.personalPractice.checkSuccess(plan.content, completedCount, totalDays, percentage),
        ephemeral: true,
      });
    } catch (error) {
      console.error(`[personal-practice/체크] ${error.constructor.name}: Check failed for plan #${planId}:`, error);
      await interaction.reply({
        content: '❌ 수행 체크 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
