const schedule = require('node-schedule');
const config = require('../../config');

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
      console.log('수행 모임 알림이 비활성화 상태입니다.');
      return;
    }

    const guild = this.client.guilds.cache.get(config.guildId);
    if (!guild) {
      console.error('길드 찾기 실패');
      return;
    }

    // 채널 ID로 찾기
    const channel = guild.channels.cache.get(meetingConfig.channelId);
    if (!channel || !channel.isTextBased()) {
      console.error(`수행계획방 찾기 실패 (채널 ID: ${meetingConfig.channelId})`);
      return;
    }

    const meetingCount = this.repository.incrementMeetingCount();
    let participants = new Set();

    const formatMessage = (count, participantSize, participantList, isCompleted = false) => {
      const completedText = isCompleted ? ' [완료]' : '';
      return (
        `[제 ${count}차] 수행 모임${completedText}\n` +
        `장소: ${meetingConfig.location}\n` +
        `시각: ${new Date().toLocaleDateString('ko-KR')} - ${meetingConfig.meetingStartTime} ~ ${meetingConfig.meetingEndTime}\n` +
        `인원: ${participantSize}인(${participantList})\n` +
        `활동 내용: ${meetingConfig.activity}`
      );
    };

    const msg = await channel.send(formatMessage(meetingCount, 0, '아직 없음'));

    await msg.react('✅');
    await msg.react('❌');

    const filter = (reaction, user) =>
      !user.bot && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌');

    const collector = msg.createReactionCollector({ filter, time: 6 * 60 * 60 * 1000 });

    collector.on('collect', async (reaction, user) => {
      const member = await msg.guild.members.fetch(user.id);
      const displayName = member.displayName;

      if (reaction.emoji.name === '✅') {
        participants.add(displayName);
      } else if (reaction.emoji.name === '❌') {
        participants.delete(displayName);
      }

      const participantList = Array.from(participants).join(', ') || '아직 없음';
      await msg.edit(formatMessage(meetingCount, participants.size, participantList));
    });

    collector.on('end', async () => {
      const participantList = Array.from(participants).join(', ') || '아직 없음';
      await msg.edit(formatMessage(meetingCount, participants.size, participantList, true));
    });
  }
}

module.exports = SchedulerService;
