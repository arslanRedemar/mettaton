const ActivityTypeConfig = require('../../../../src/domain/entities/ActivityTypeConfig');

describe('ActivityTypeConfig Entity', () => {
  describe('constructor', () => {
    it('should create config with all properties', () => {
      const config = new ActivityTypeConfig({
        activityType: 'FORUM_POST',
        points: 300,
        cooldownMinutes: 5,
        dailyCap: 10,
        enabled: true,
      });

      expect(config.activityType).toBe('FORUM_POST');
      expect(config.points).toBe(300);
      expect(config.cooldownMinutes).toBe(5);
      expect(config.dailyCap).toBe(10);
      expect(config.enabled).toBe(true);
    });

    it('should use default values for optional properties', () => {
      const config = new ActivityTypeConfig({
        activityType: 'GENERAL',
        points: 50,
        cooldownMinutes: 5,
      });

      expect(config.dailyCap).toBeNull();
      expect(config.enabled).toBe(true);
    });

    it('should allow dailyCap to be null', () => {
      const config = new ActivityTypeConfig({
        activityType: 'GENERAL',
        points: 50,
        cooldownMinutes: 5,
        dailyCap: null,
      });

      expect(config.dailyCap).toBeNull();
    });

    it('should allow enabled to be false', () => {
      const config = new ActivityTypeConfig({
        activityType: 'GENERAL',
        points: 50,
        cooldownMinutes: 5,
        enabled: false,
      });

      expect(config.enabled).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const config = new ActivityTypeConfig({
        activityType: 'PERSONAL_PRACTICE',
        points: 150,
        cooldownMinutes: 1440,
        dailyCap: 1,
        enabled: true,
      });

      expect(config.toJSON()).toEqual({
        activityType: 'PERSONAL_PRACTICE',
        points: 150,
        cooldownMinutes: 1440,
        dailyCap: 1,
        enabled: true,
      });
    });

    it('should handle null dailyCap in JSON', () => {
      const config = new ActivityTypeConfig({
        activityType: 'GENERAL',
        points: 50,
        cooldownMinutes: 5,
      });

      expect(config.toJSON().dailyCap).toBeNull();
    });
  });
});
