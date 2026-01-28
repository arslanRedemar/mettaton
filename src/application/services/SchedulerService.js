const schedule = require('node-schedule');
const config = require('../../config');

class SchedulerService {
  constructor(client, repository) {
    this.client = client;
    this.repository = repository;
  }

  startDailyMeeting() {
    schedule.scheduleJob({ hour: 20, minute: 58, tz: 'Asia/Seoul' }, async () => {
      await this.sendMeetingAnnouncement();
    });
  }

  async sendMeetingAnnouncement() {
    const guild = this.client.guilds.cache.get(config.guildId);
    if (!guild) {
      console.error('길드 찾기 실패');
      return;
    }

    const channel = guild.channels.cache.find(
      (ch) => ch.name === config.channels.practice && ch.isTextBased()
    );
    if (!channel) {
      console.error('수행계획방 찾기 실패');
      return;
    }

    const meetingCount = this.repository.incrementMeetingCount();
    let participants = new Set();

    const messageText =
      `[제 ${meetingCount}차] 수행 모임\n` +
      `장소: 음성 채널 수행방(온라인)\n` +
      `시각: ${new Date().toLocaleDateString('ko-KR')} - 23:00 ~ 24:00\n` +
      `인원:  0인(아직 없음)\n` +
      `활동 내용: 각자 수행 및 일지 작성`;

    const msg = await channel.send(messageText);

    await msg.react('✅');
    await msg.react('❌');

    const filter = (reaction, user) =>
      !user.bot && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌');

    const collector = msg.createReactionCollector({ filter, time: 6 * 60 * 60 * 1000 });

    collector.on('collect', async (reaction, user) => {
      const foundU = await msg.guild.members.fetch(user.id);
      const displayName = foundU.displayName;

      if (reaction.emoji.name === '✅') {
        participants.add(displayName);
      } else if (reaction.emoji.name === '❌') {
        participants.delete(displayName);
      }

      const participantList = Array.from(participants).join(', ') || '아직 없음';
      await msg.edit(
        `[제 ${meetingCount}차] 수행 모임\n` +
          `장소: 음성 채널 수행방(온라인)\n` +
          `시각: ${new Date().toLocaleDateString('ko-KR')} - 23:00 ~ 24:00\n` +
          `인원:  ${participants.size}인(${participantList})\n` +
          `활동 내용: 각자 수행 및 일지 작성`
      );
    });

    collector.on('end', async () => {
      const participantList = Array.from(participants).join(', ') || '아직 없음';
      await msg.edit(
        `[제 ${meetingCount}차] 수행 모임 [완료]\n` +
          `장소: 음성 채널 수행방(온라인)\n` +
          `시각: ${new Date().toLocaleDateString('ko-KR')} - 23:00 ~ 24:00\n` +
          `인원:  ${participants.size}인(${participantList})\n` +
          `활동 내용: 각자 수행 및 일지 작성`
      );
    });
  }
}

module.exports = SchedulerService;
