const MemberActivity = require('../../../../src/domain/entities/MemberActivity');

describe('MemberActivity Entity', () => {
  describe('constructor', () => {
    it('should create a MemberActivity instance with userId and lastActiveAt', () => {
      const userId = '123456789';
      const lastActiveAt = new Date('2024-01-01T00:00:00Z');

      const activity = new MemberActivity({ userId, lastActiveAt });

      expect(activity.userId).toBe(userId);
      expect(activity.lastActiveAt).toEqual(lastActiveAt);
    });
  });

  describe('isInactive', () => {
    it('should return true when last activity is older than threshold', () => {
      const userId = '123456789';
      const lastActiveAt = new Date();
      lastActiveAt.setDate(lastActiveAt.getDate() - 100); // 100 days ago

      const activity = new MemberActivity({ userId, lastActiveAt });

      expect(activity.isInactive(90)).toBe(true);
    });

    it('should return false when last activity is within threshold', () => {
      const userId = '123456789';
      const lastActiveAt = new Date();
      lastActiveAt.setDate(lastActiveAt.getDate() - 50); // 50 days ago

      const activity = new MemberActivity({ userId, lastActiveAt });

      expect(activity.isInactive(90)).toBe(false);
    });

    it('should return false when last activity is exactly on threshold', () => {
      const userId = '123456789';
      const lastActiveAt = new Date();
      lastActiveAt.setDate(lastActiveAt.getDate() - 90); // Exactly 90 days ago

      const activity = new MemberActivity({ userId, lastActiveAt });

      // Should be false because it's not strictly less than cutoff
      expect(activity.isInactive(90)).toBe(false);
    });
  });

  describe('getDaysSinceLastActivity', () => {
    it('should return correct number of days since last activity', () => {
      const userId = '123456789';
      const lastActiveAt = new Date();
      lastActiveAt.setDate(lastActiveAt.getDate() - 45);

      const activity = new MemberActivity({ userId, lastActiveAt });

      expect(activity.getDaysSinceLastActivity()).toBe(45);
    });

    it('should return 0 for activity today', () => {
      const userId = '123456789';
      const lastActiveAt = new Date();

      const activity = new MemberActivity({ userId, lastActiveAt });

      expect(activity.getDaysSinceLastActivity()).toBe(0);
    });
  });

  describe('updateActivity', () => {
    it('should update lastActiveAt to current time', () => {
      const userId = '123456789';
      const lastActiveAt = new Date('2024-01-01T00:00:00Z');

      const activity = new MemberActivity({ userId, lastActiveAt });
      const before = new Date();
      const newActiveAt = activity.updateActivity();
      const after = new Date();

      expect(newActiveAt).toBeInstanceOf(Date);
      expect(activity.lastActiveAt).toBe(newActiveAt);
      expect(newActiveAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(newActiveAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('formatLastActive', () => {
    it('should format date in Korean locale', () => {
      const userId = '123456789';
      const lastActiveAt = new Date('2024-01-15T12:00:00Z');

      const activity = new MemberActivity({ userId, lastActiveAt });
      const formatted = activity.formatLastActive();

      // Korean locale date format (may vary by environment)
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/1/);
      expect(formatted).toMatch(/15/);
    });
  });

  describe('toJSON', () => {
    it('should convert to plain object', () => {
      const userId = '123456789';
      const lastActiveAt = new Date('2024-01-01T00:00:00Z');

      const activity = new MemberActivity({ userId, lastActiveAt });
      const json = activity.toJSON();

      expect(json).toEqual({
        userId,
        lastActiveAt,
      });
    });
  });
});
