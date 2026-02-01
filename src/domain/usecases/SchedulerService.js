const schedule = require('node-schedule');
const config = require('../../../core/config');
const ActivityType = require('../../../core/types/ActivityType');

/**
 * Scheduler Service
 * Handles meeting scheduling, quiz auto-publishing, and explanation revealing
 */
class SchedulerService {
  constructor(client, repository, pointAccumulationService, quizService = null) {
    this.client = client;
    this.repository = repository;
    this.pointAccumulationService = pointAccumulationService;
    this.quizService = quizService;
    this.meetingJob = null;
    this.quizPublishJob = null;
    this.quizExplanationJob = null;
  }

  start() {
    // Start meeting schedule
    const meetingConfig = this.repository.getMeetingConfig();
    if (meetingConfig && meetingConfig.enabled) {
      this._scheduleMeetingJob(meetingConfig);
      console.log(
        `✅ 수행 모임 스케줄 시작: ${String(meetingConfig.scheduleHour).padStart(2, '0')}:${String(meetingConfig.scheduleMinute).padStart(2, '0')}`
      );
    } else {
      console.log('ℹ️ 수행 모임 알림이 비활성화 상태입니다.');
    }

    // Start quiz schedules if service is available
    if (this.quizService) {
      this.startQuizSchedules();
    }
  }

  reschedule() {
    this.cancelMeetingSchedule();
    const meetingConfig = this.repository.getMeetingConfig();
    if (meetingConfig && meetingConfig.enabled) {
      this._scheduleMeetingJob(meetingConfig);
      console.log(
        `🔄 수행 모임 스케줄 재설정: ${String(meetingConfig.scheduleHour).padStart(2, '0')}:${String(meetingConfig.scheduleMinute).padStart(2, '0')}`
      );
    }
  }

  cancelSchedule() {
    this.cancelMeetingSchedule();
    this.cancelQuizSchedules();
  }

  cancelMeetingSchedule() {
    if (this.meetingJob) {
      this.meetingJob.cancel();
      this.meetingJob = null;
      console.log('⏹️ 수행 모임 스케줄 취소됨');
    }
  }

  _scheduleMeetingJob(meetingConfig) {
    this.meetingJob = schedule.scheduleJob(
      {
        hour: meetingConfig.scheduleHour,
        minute: meetingConfig.scheduleMinute,
        tz: 'Asia/Seoul',
      },
      async () => {
        await this.sendMeetingAnnouncement();
      }
    );
  }

  async sendMeetingAnnouncement() {
    const meetingConfig = this.repository.getMeetingConfig();
    if (!meetingConfig || !meetingConfig.enabled) {
      console.log('[SchedulerService] Meeting announcement skipped - disabled');
      return;
    }

    const guild = this.client.guilds.cache.get(config.guildId);
    if (!guild) {
      console.error(`[SchedulerService] Guild not found (ID: ${config.guildId})`);
      return;
    }

    const channel = guild.channels.cache.get(meetingConfig.channelId);
    if (!channel || !channel.isTextBased()) {
      console.error(`[SchedulerService] Meeting channel not found or not text-based (ID: ${meetingConfig.channelId})`);
      return;
    }

    const meetingCount = this.repository.incrementMeetingCount();
    console.log(`[SchedulerService] Sending meeting #${meetingCount} announcement to channel ${meetingConfig.channelId}`);
    let participants = new Set();

    const formatMessage = (count, isCompleted = false) => {
      const completedText = isCompleted ? ' [완료]' : '';
      const participantMentions = Array.from(participants).map((uid) => `<@${uid}>`).join(' , ');
      const attendeeText = participants.size > 0
        ? `참석자 ${participants.size}명 (${participantMentions})`
        : '참석자 0명';
      return (
        `[제 ${count}차] 수행 모임${completedText}\n` +
        `장소: ${meetingConfig.location}\n` +
        `시각: ${new Date().toLocaleDateString('ko-KR')} - ${meetingConfig.meetingStartTime} ~ ${meetingConfig.meetingEndTime}\n` +
        `${attendeeText}\n` +
        `활동 내용: ${meetingConfig.activity}`
      );
    };

    const msg = await channel.send(formatMessage(meetingCount));

    await msg.react('✅');
    await msg.react('❌');

    const filter = (reaction, user) =>
      !user.bot && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌');

    const collector = msg.createReactionCollector({ filter, time: 6 * 60 * 60 * 1000, dispose: true });

    collector.on('collect', async (reaction, user) => {
      if (reaction.emoji.name === '✅') {
        participants.add(user.id);
        // Award meeting attendance points
        if (this.pointAccumulationService) {
          try {
            const pointResult = this.pointAccumulationService.tryAccumulate(user.id, ActivityType.MEETING_ATTEND);
            if (pointResult) {
              console.log(`[SchedulerService] Meeting points for ${user.tag} (${user.id}): +${pointResult.pointsAdded}`);
            }
          } catch (err) {
            console.error(`[SchedulerService] Meeting point error for ${user.tag} (${user.id}):`, err);
          }
        }
        console.log(`[SchedulerService] Meeting #${meetingCount} participant added: ${user.tag} (${user.id})`);
      } else if (reaction.emoji.name === '❌') {
        participants.delete(user.id);
        console.log(`[SchedulerService] Meeting #${meetingCount} participant removed: ${user.tag} (${user.id})`);
      }

      await msg.edit(formatMessage(meetingCount));
    });

    collector.on('dispose', async (reaction, user) => {
      if (reaction.emoji.name === '✅') {
        participants.delete(user.id);
        console.log(`[SchedulerService] Meeting #${meetingCount} participant left: ${user.tag} (${user.id})`);
      }

      await msg.edit(formatMessage(meetingCount));
    });

    collector.on('end', async () => {
      console.log(`[SchedulerService] Meeting #${meetingCount} collection ended. Final participants: ${participants.size}`);
      await msg.edit(formatMessage(meetingCount, true));
    });
  }

  // ========== Quiz Scheduling ==========

  /**
   * Start quiz auto-publish and explanation reveal schedules
   */
  startQuizSchedules() {
    if (!this.quizService) {
      console.log('[SchedulerService] Quiz service not available');
      return;
    }

    const quizConfig = this.quizService.getConfig();
    if (!quizConfig || !quizConfig.enabled) {
      console.log('[SchedulerService] Quiz auto-publish disabled');
      return;
    }

    // Schedule quiz publish
    const quizTime = quizConfig.getQuizTime();
    if (quizTime) {
      this._scheduleQuizPublishJob(quizTime.hour, quizTime.minute);
      console.log(`✅ Quiz publish schedule started: ${quizConfig.quizTime}`);
    }

    // Schedule explanation reveal
    const explanationTime = quizConfig.getExplanationTime();
    if (explanationTime) {
      this._scheduleQuizExplanationJob(explanationTime.hour, explanationTime.minute);
      console.log(`✅ Quiz explanation schedule started: ${quizConfig.explanationTime}`);
    }
  }

  /**
   * Reschedule quiz jobs
   */
  rescheduleQuizSchedules() {
    this.cancelQuizSchedules();
    this.startQuizSchedules();
  }

  /**
   * Cancel quiz schedules
   */
  cancelQuizSchedules() {
    if (this.quizPublishJob) {
      this.quizPublishJob.cancel();
      this.quizPublishJob = null;
      console.log('⏹️ Quiz publish schedule cancelled');
    }

    if (this.quizExplanationJob) {
      this.quizExplanationJob.cancel();
      this.quizExplanationJob = null;
      console.log('⏹️ Quiz explanation schedule cancelled');
    }
  }

  /**
   * Schedule quiz publish job
   * @private
   */
  _scheduleQuizPublishJob(hour, minute) {
    this.quizPublishJob = schedule.scheduleJob(
      {
        hour,
        minute,
        tz: 'Asia/Seoul',
      },
      async () => {
        await this.publishDailyQuiz();
      }
    );
  }

  /**
   * Schedule quiz explanation job
   * @private
   */
  _scheduleQuizExplanationJob(hour, minute) {
    this.quizExplanationJob = schedule.scheduleJob(
      {
        hour,
        minute,
        tz: 'Asia/Seoul',
      },
      async () => {
        await this.revealQuizExplanation();
      }
    );
  }

  /**
   * Publish today's quiz (called by scheduler)
   */
  async publishDailyQuiz() {
    if (!this.quizService) {
      console.log('[SchedulerService] Quiz service not available');
      return;
    }

    const result = this.quizService.publishTodayQuiz();
    if (!result) {
      return;
    }

    const { question, history } = result;
    const quizConfig = this.quizService.getConfig();

    if (!quizConfig.hasChannel()) {
      console.log('[SchedulerService] Quiz channel not configured');
      return;
    }

    const guild = this.client.guilds.cache.get(config.guildId);
    if (!guild) {
      console.error(`[SchedulerService] Guild not found (ID: ${config.guildId})`);
      return;
    }

    const channel = guild.channels.cache.get(quizConfig.quizChannelId);
    if (!channel || !channel.isTextBased()) {
      console.error(`[SchedulerService] Quiz channel not found or not text-based (ID: ${quizConfig.quizChannelId})`);
      return;
    }

    try {
      // Format quiz message
      const strings = require('../../presentation/interfaces/strings');
      const optionsText = question.getOptions()
        .map((opt, idx) => strings.quiz.publishOption(idx + 1, opt))
        .join('\n');

      const messageText = `${strings.quiz.publishTitle(question.id)}\n${strings.quiz.publishCategory(question.category)}\n\n${strings.quiz.publishQuestion(question.question)}\n\n${optionsText}\n\n${strings.quiz.publishFooter(quizConfig.explanationTime)}`;

      const msg = await channel.send(messageText);

      // Update history with message ID
      history.messageId = msg.id;
      this.quizService.repository.updatePublishHistory(history);

      console.log(`[SchedulerService] Daily quiz #${question.id} published to channel ${quizConfig.quizChannelId}`);
    } catch (error) {
      console.error(`[SchedulerService] DiscordAPIError: Failed to publish quiz #${question.id}:`, error);
    }
  }

  /**
   * Reveal quiz explanation and award points (called by scheduler)
   */
  async revealQuizExplanation() {
    if (!this.quizService) {
      console.log('[SchedulerService] Quiz service not available');
      return;
    }

    const result = this.quizService.revealExplanation();
    if (!result) {
      return;
    }

    const { question, participants, correctCount, correctRate } = result;
    const quizConfig = this.quizService.getConfig();

    if (!quizConfig.hasChannel()) {
      console.log('[SchedulerService] Quiz channel not configured');
      return;
    }

    const guild = this.client.guilds.cache.get(config.guildId);
    if (!guild) {
      console.error(`[SchedulerService] Guild not found (ID: ${config.guildId})`);
      return;
    }

    const channel = guild.channels.cache.get(quizConfig.quizChannelId);
    if (!channel || !channel.isTextBased()) {
      console.error(`[SchedulerService] Quiz explanation channel not found or not text-based (ID: ${quizConfig.quizChannelId})`);
      return;
    }

    try {
      // Format explanation message
      const strings = require('../../presentation/interfaces/strings');
      const messageText = `${strings.quiz.explanationTitle(question.id)}\n${strings.quiz.explanationAnswer(question.answer)}\n\n${strings.quiz.explanationBody(question.explanation)}\n\n${strings.quiz.explanationStats(participants, correctRate)}\n${strings.quiz.explanationPoints(participants - correctCount, correctCount)}`;

      await channel.send(messageText);

      console.log(`[SchedulerService] Quiz #${question.id} explanation revealed. Participants: ${participants}, Correct: ${correctCount}`);
    } catch (error) {
      console.error(`[SchedulerService] DiscordAPIError: Failed to reveal explanation for quiz #${question.id}:`, error);
    }
  }
}

module.exports = SchedulerService;
