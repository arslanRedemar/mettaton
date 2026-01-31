const ActivityPoint = require('../../../../src/domain/entities/ActivityPoint');

describe('ActivityPoint Entity', () => {
  let activityPoint;

  beforeEach(() => {
    activityPoint = new ActivityPoint({
      userId: 'user123',
      points: 0,
      lastAccumulatedAt: null,
    });
  });

  describe('constructor', () => {
    it('should create an activity point with all properties', () => {
      const ap = new ActivityPoint({
        userId: 'user456',
        points: 500,
        lastAccumulatedAt: new Date('2024-01-01T12:00:00Z'),
      });

      expect(ap.userId).toBe('user456');
      expect(ap.points).toBe(500);
      expect(ap.lastAccumulatedAt).toEqual(new Date('2024-01-01T12:00:00Z'));
    });

    it('should use default values for optional properties', () => {
      const ap = new ActivityPoint({
        userId: 'user789',
      });

      expect(ap.userId).toBe('user789');
      expect(ap.points).toBe(0);
      expect(ap.lastAccumulatedAt).toBeNull();
    });

    it('should create activity point with zero points', () => {
      expect(activityPoint.userId).toBe('user123');
      expect(activityPoint.points).toBe(0);
      expect(activityPoint.lastAccumulatedAt).toBeNull();
    });
  });

  describe('canAccumulate', () => {
    it('should return true when lastAccumulatedAt is null', () => {
      expect(activityPoint.canAccumulate(5)).toBe(true);
    });

    it('should return false when cooldown has not expired', () => {
      const now = new Date();
      activityPoint.lastAccumulatedAt = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago

      expect(activityPoint.canAccumulate(5)).toBe(false);
    });

    it('should return true when cooldown has expired', () => {
      const now = new Date();
      activityPoint.lastAccumulatedAt = new Date(now.getTime() - 6 * 60 * 1000); // 6 minutes ago

      expect(activityPoint.canAccumulate(5)).toBe(true);
    });

    it('should return true when cooldown exactly matches', () => {
      const now = new Date();
      activityPoint.lastAccumulatedAt = new Date(now.getTime() - 5 * 60 * 1000); // Exactly 5 minutes ago

      expect(activityPoint.canAccumulate(5)).toBe(true);
    });

    it('should handle different cooldown periods', () => {
      const now = new Date();
      activityPoint.lastAccumulatedAt = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes ago

      expect(activityPoint.canAccumulate(10)).toBe(true);
      expect(activityPoint.canAccumulate(20)).toBe(false);
    });
  });

  describe('addPoints', () => {
    it('should add points to the total', () => {
      const newPoints = activityPoint.addPoints(100);

      expect(newPoints).toBe(100);
      expect(activityPoint.points).toBe(100);
      expect(activityPoint.lastAccumulatedAt).toBeInstanceOf(Date);
    });

    it('should accumulate multiple point additions', () => {
      activityPoint.addPoints(100);
      activityPoint.addPoints(50);
      const newPoints = activityPoint.addPoints(25);

      expect(newPoints).toBe(175);
      expect(activityPoint.points).toBe(175);
    });

    it('should update lastAccumulatedAt on each addition', () => {
      const firstTime = new Date();
      activityPoint.addPoints(100);
      const firstAccumulated = activityPoint.lastAccumulatedAt;

      expect(firstAccumulated).toBeInstanceOf(Date);
      expect(firstAccumulated.getTime()).toBeGreaterThanOrEqual(firstTime.getTime());
    });

    it('should not allow points to go below zero', () => {
      activityPoint.points = 50;
      const newPoints = activityPoint.addPoints(-100);

      expect(newPoints).toBe(0);
      expect(activityPoint.points).toBe(0);
    });

    it('should handle negative point adjustments', () => {
      activityPoint.points = 200;
      const newPoints = activityPoint.addPoints(-50);

      expect(newPoints).toBe(150);
      expect(activityPoint.points).toBe(150);
    });
  });

  describe('setPoints', () => {
    it('should set points to a specific value', () => {
      const newPoints = activityPoint.setPoints(500);

      expect(newPoints).toBe(500);
      expect(activityPoint.points).toBe(500);
    });

    it('should not allow setting points below zero', () => {
      const newPoints = activityPoint.setPoints(-100);

      expect(newPoints).toBe(0);
      expect(activityPoint.points).toBe(0);
    });

    it('should overwrite existing points', () => {
      activityPoint.points = 1000;
      const newPoints = activityPoint.setPoints(250);

      expect(newPoints).toBe(250);
      expect(activityPoint.points).toBe(250);
    });

    it('should allow setting points to zero', () => {
      activityPoint.points = 100;
      const newPoints = activityPoint.setPoints(0);

      expect(newPoints).toBe(0);
      expect(activityPoint.points).toBe(0);
    });
  });

  describe('resetPoints', () => {
    it('should reset points to zero', () => {
      activityPoint.points = 500;
      activityPoint.lastAccumulatedAt = new Date();

      const newPoints = activityPoint.resetPoints();

      expect(newPoints).toBe(0);
      expect(activityPoint.points).toBe(0);
      expect(activityPoint.lastAccumulatedAt).toBeNull();
    });

    it('should reset lastAccumulatedAt to null', () => {
      activityPoint.addPoints(100);
      expect(activityPoint.lastAccumulatedAt).not.toBeNull();

      activityPoint.resetPoints();
      expect(activityPoint.lastAccumulatedAt).toBeNull();
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const json = activityPoint.toJSON();

      expect(json).toEqual({
        userId: 'user123',
        points: 0,
        lastAccumulatedAt: null,
      });
    });

    it('should return correct JSON with accumulated points', () => {
      activityPoint.addPoints(250);
      const json = activityPoint.toJSON();

      expect(json.userId).toBe('user123');
      expect(json.points).toBe(250);
      expect(json.lastAccumulatedAt).toBeInstanceOf(Date);
    });

    it('should preserve lastAccumulatedAt in JSON', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      activityPoint.lastAccumulatedAt = testDate;
      activityPoint.points = 300;

      const json = activityPoint.toJSON();

      expect(json.lastAccumulatedAt).toEqual(testDate);
      expect(json.points).toBe(300);
    });
  });
});
