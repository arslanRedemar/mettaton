const PointAccumulationLog = require('../../../../src/domain/entities/PointAccumulationLog');

describe('PointAccumulationLog Entity', () => {
  let log;

  beforeEach(() => {
    log = new PointAccumulationLog({
      userId: 'user123',
      activityType: 'GENERAL',
    });
  });

  describe('constructor', () => {
    it('should create a log with all properties', () => {
      const l = new PointAccumulationLog({
        userId: 'user456',
        activityType: 'FORUM_POST',
        lastAccumulatedAt: new Date('2024-01-01T12:00:00Z'),
        dailyCount: 3,
        dailyDate: '2024-01-01',
      });

      expect(l.userId).toBe('user456');
      expect(l.activityType).toBe('FORUM_POST');
      expect(l.lastAccumulatedAt).toEqual(new Date('2024-01-01T12:00:00Z'));
      expect(l.dailyCount).toBe(3);
      expect(l.dailyDate).toBe('2024-01-01');
    });

    it('should use default values for optional properties', () => {
      expect(log.userId).toBe('user123');
      expect(log.activityType).toBe('GENERAL');
      expect(log.lastAccumulatedAt).toBeNull();
      expect(log.dailyCount).toBe(0);
      expect(log.dailyDate).toBeNull();
    });
  });

  describe('canAccumulate', () => {
    it('should return true when lastAccumulatedAt is null', () => {
      expect(log.canAccumulate(5)).toBe(true);
    });

    it('should return false when cooldown has not expired', () => {
      log.lastAccumulatedAt = new Date(Date.now() - 2 * 60 * 1000); // 2 min ago
      expect(log.canAccumulate(5)).toBe(false);
    });

    it('should return true when cooldown has expired', () => {
      log.lastAccumulatedAt = new Date(Date.now() - 6 * 60 * 1000); // 6 min ago
      expect(log.canAccumulate(5)).toBe(true);
    });

    it('should return true when cooldown exactly matches', () => {
      log.lastAccumulatedAt = new Date(Date.now() - 5 * 60 * 1000);
      expect(log.canAccumulate(5)).toBe(true);
    });
  });

  describe('isDailyCapReached', () => {
    it('should return false when dailyCap is null', () => {
      log.dailyCount = 100;
      expect(log.isDailyCapReached(null)).toBe(false);
    });

    it('should return false when dailyCap is undefined', () => {
      log.dailyCount = 100;
      expect(log.isDailyCapReached(undefined)).toBe(false);
    });

    it('should return false when dailyDate is a different day', () => {
      log.dailyDate = '2020-01-01';
      log.dailyCount = 10;
      expect(log.isDailyCapReached(1)).toBe(false);
    });

    it('should return true when count >= cap on same day', () => {
      const today = new Date().toISOString().split('T')[0];
      log.dailyDate = today;
      log.dailyCount = 1;
      expect(log.isDailyCapReached(1)).toBe(true);
    });

    it('should return false when count < cap on same day', () => {
      const today = new Date().toISOString().split('T')[0];
      log.dailyDate = today;
      log.dailyCount = 0;
      expect(log.isDailyCapReached(1)).toBe(false);
    });
  });

  describe('recordAccumulation', () => {
    it('should set lastAccumulatedAt and start daily count', () => {
      log.recordAccumulation();

      expect(log.lastAccumulatedAt).toBeInstanceOf(Date);
      expect(log.dailyCount).toBe(1);
      expect(log.dailyDate).toBe(new Date().toISOString().split('T')[0]);
    });

    it('should increment daily count on same day', () => {
      const today = new Date().toISOString().split('T')[0];
      log.dailyDate = today;
      log.dailyCount = 2;

      log.recordAccumulation();

      expect(log.dailyCount).toBe(3);
      expect(log.dailyDate).toBe(today);
    });

    it('should reset daily count on new day', () => {
      log.dailyDate = '2020-01-01';
      log.dailyCount = 5;

      log.recordAccumulation();

      expect(log.dailyCount).toBe(1);
      expect(log.dailyDate).toBe(new Date().toISOString().split('T')[0]);
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const json = log.toJSON();

      expect(json).toEqual({
        userId: 'user123',
        activityType: 'GENERAL',
        lastAccumulatedAt: null,
        dailyCount: 0,
        dailyDate: null,
      });
    });

    it('should return correct JSON after accumulation', () => {
      log.recordAccumulation();
      const json = log.toJSON();

      expect(json.userId).toBe('user123');
      expect(json.activityType).toBe('GENERAL');
      expect(json.lastAccumulatedAt).toBeInstanceOf(Date);
      expect(json.dailyCount).toBe(1);
      expect(json.dailyDate).toBe(new Date().toISOString().split('T')[0]);
    });
  });
});
