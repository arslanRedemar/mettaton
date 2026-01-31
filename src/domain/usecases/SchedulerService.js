const schedule = require('node-schedule');
const config = require('../../../core/config');

/**
 * 수행 모임 스케줄링 유스케이스
 */
class SchedulerService {
  constructor(client, repository) {
    this.client = client;
    this.repository = repository;
    this.scheduledJob = null;
  }

  start() {
    const meetingConfig = this.repository.getMeetingConfig();
    if (meetingConfig && meetingConfig.enabled) {
      this._scheduleJob(meetingConfig);
      console.log(
        `✅ 수행 모임 스케줄 시작: ${String(meetingConfig.scheduleHour).padStart(2, '0')}:${String(meetingConfig.scheduleMinute).padStart(2, '0')}`
      );
    } else {
      console.log('ℹ️ 수행 모임 알림이 비활성화 상태입니다.');
    }
  }

  reschedule() {
    this.cancelSchedule();
    const meetingConfig = this.repository.getMeetingConfig();
    if (meetingConfig && meetingConfig.enabled) {
      this._scheduleJob(meetingConfig);
      console.log(
        `🔄 수행 모임 스케줄 재설정: ${String(meetingConfig.scheduleHour).padStart(2, '0')}:${String(meetingConfig.scheduleMinute).padStart(2, '0')}`
      );
    }
  }

  cancelSchedule() {
    if (this.scheduledJob) {
      this.scheduledJob.cancel();
      this.scheduledJob = null;
      console.log('⏹️ 수행 모임 스케줄 취소됨');
    }
  }

  _scheduleJob(meetingConfig) {
    this.scheduledJob = schedule.scheduleJob(
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
}

module.exports = SchedulerService;
