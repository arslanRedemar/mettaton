const path = require('path');
const fs = require('fs');
const { initializeDatabase, closeDatabase, getDatabase } = require('../../../../src/data/datasource/database');
const { SqliteRepository } = require('../../../../src/data/repositories');
const MeetingConfig = require('../../../../src/domain/entities/MeetingConfig');

describe('SqliteRepository - Meeting Config', () => {
  let repository;
  const testDbPath = path.join(__dirname, 'test-meeting.db');

  beforeAll(() => {
    initializeDatabase(testDbPath);
    repository = new SqliteRepository();
    repository.init();
  });

  afterAll(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    const walPath = testDbPath + '-wal';
    const shmPath = testDbPath + '-shm';
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  });

  beforeEach(() => {
    const db = getDatabase();
    db.exec('DELETE FROM meeting_config');
  });

  describe('getMeetingConfig', () => {
    it('should return null when no config exists', () => {
      const config = repository.getMeetingConfig();
      expect(config).toBeNull();
    });

    it('should return config after setting', () => {
      const meetingConfig = new MeetingConfig({
        channelId: '123456789',
        scheduleHour: 20,
        scheduleMinute: 30,
        meetingStartTime: '21:00',
        meetingEndTime: '22:00',
        location: '온라인 수행방',
        activity: '명상 수행',
        enabled: true,
      });

      repository.setMeetingConfig(meetingConfig);

      const config = repository.getMeetingConfig();

      expect(config).not.toBeNull();
      expect(config).toBeInstanceOf(MeetingConfig);
      expect(config.channelId).toBe('123456789');
      expect(config.scheduleHour).toBe(20);
      expect(config.scheduleMinute).toBe(30);
      expect(config.meetingStartTime).toBe('21:00');
      expect(config.meetingEndTime).toBe('22:00');
      expect(config.location).toBe('온라인 수행방');
      expect(config.activity).toBe('명상 수행');
      expect(config.enabled).toBe(true);
    });
  });

  describe('setMeetingConfig', () => {
    it('should create new config', () => {
      const meetingConfig = new MeetingConfig({
        channelId: '111111111',
        scheduleHour: 19,
        scheduleMinute: 0,
        meetingStartTime: '20:00',
        meetingEndTime: '21:00',
        location: '강의실',
        activity: '토론',
        enabled: false,
      });

      const result = repository.setMeetingConfig(meetingConfig);

      expect(result).toBe(true);

      const config = repository.getMeetingConfig();
      expect(config).toBeInstanceOf(MeetingConfig);
      expect(config.channelId).toBe('111111111');
      expect(config.enabled).toBe(false);
    });

    it('should update existing config', () => {
      const config1 = new MeetingConfig({
        channelId: '111111111',
        scheduleHour: 19,
        scheduleMinute: 0,
        meetingStartTime: '20:00',
        meetingEndTime: '21:00',
        location: '강의실',
        activity: '토론',
        enabled: false,
      });

      repository.setMeetingConfig(config1);

      const config2 = new MeetingConfig({
        channelId: '222222222',
        scheduleHour: 21,
        scheduleMinute: 30,
        meetingStartTime: '22:00',
        meetingEndTime: '23:00',
        location: '수정된 장소',
        activity: '수정된 활동',
        enabled: true,
      });

      repository.setMeetingConfig(config2);

      const config = repository.getMeetingConfig();
      expect(config).toBeInstanceOf(MeetingConfig);
      expect(config.channelId).toBe('222222222');
      expect(config.scheduleHour).toBe(21);
      expect(config.scheduleMinute).toBe(30);
      expect(config.location).toBe('수정된 장소');
      expect(config.activity).toBe('수정된 활동');
      expect(config.enabled).toBe(true);
    });

    it('should toggle enabled status', () => {
      const meetingConfig = new MeetingConfig({
        channelId: '123456789',
        scheduleHour: 20,
        scheduleMinute: 0,
        meetingStartTime: '21:00',
        meetingEndTime: '22:00',
        location: '장소',
        activity: '활동',
        enabled: false,
      });

      repository.setMeetingConfig(meetingConfig);

      let config = repository.getMeetingConfig();
      expect(config).toBeInstanceOf(MeetingConfig);
      expect(config.enabled).toBe(false);

      config.enable();
      repository.setMeetingConfig(config);
      config = repository.getMeetingConfig();
      expect(config.enabled).toBe(true);

      config.disable();
      repository.setMeetingConfig(config);
      config = repository.getMeetingConfig();
      expect(config.enabled).toBe(false);
    });
  });
});
