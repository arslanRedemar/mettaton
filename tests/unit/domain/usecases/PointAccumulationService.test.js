const PointAccumulationService = require('../../../../src/domain/usecases/PointAccumulationService');
const ActivityTypeConfig = require('../../../../src/domain/entities/ActivityTypeConfig');
const PointAccumulationLog = require('../../../../src/domain/entities/PointAccumulationLog');
const ActivityPoint = require('../../../../src/domain/entities/ActivityPoint');

describe('PointAccumulationService', () => {
  let service;
  let mockRepository;

  const makeConfig = (overrides = {}) => new ActivityTypeConfig({
    activityType: 'GENERAL',
    points: 50,
    cooldownMinutes: 5,
    dailyCap: null,
    enabled: true,
    ...overrides,
  });

  beforeEach(() => {
    mockRepository = {
      getActivityTypeConfig: jest.fn().mockReturnValue(makeConfig()),
      getAllActivityTypeConfigs: jest.fn().mockReturnValue([]),
      setActivityTypeConfig: jest.fn(),
      getAccumulationLog: jest.fn().mockReturnValue(null),
      upsertAccumulationLog: jest.fn(),
      getActivityPoint: jest.fn().mockReturnValue(null),
      upsertActivityPoint: jest.fn(),
      getAllActivityPoints: jest.fn().mockReturnValue([]),
      getPointConfig: jest.fn().mockReturnValue({ pointsPerAction: 100, cooldownMinutes: 5 }),
      setPointConfig: jest.fn(),
      resetUserPoints: jest.fn().mockReturnValue(true),
      resetAllPoints: jest.fn().mockReturnValue(true),
      resetUserAccumulationLogs: jest.fn(),
      resetAllAccumulationLogs: jest.fn(),
      insertPointAwardHistory: jest.fn().mockReturnValue(true),
      getPointAwardHistory: jest.fn().mockReturnValue([]),
      resetUserPointAwardHistory: jest.fn().mockReturnValue(true),
      resetAllPointAwardHistory: jest.fn().mockReturnValue(true),
    };
    service = new PointAccumulationService(mockRepository);
  });

  describe('tryAccumulate', () => {
    it('should accumulate GENERAL type with correct points', () => {
      const result = service.tryAccumulate('user1', 'GENERAL');

      expect(result).not.toBeNull();
      expect(result.accumulated).toBe(true);
      expect(result.pointsAdded).toBe(50);
      expect(result.activityType).toBe('GENERAL');
      expect(mockRepository.upsertActivityPoint).toHaveBeenCalled();
      expect(mockRepository.upsertAccumulationLog).toHaveBeenCalled();
    });

    it('should accumulate FORUM_POST type with 300 points', () => {
      mockRepository.getActivityTypeConfig.mockReturnValue(
        makeConfig({ activityType: 'FORUM_POST', points: 300 })
      );

      const result = service.tryAccumulate('user1', 'FORUM_POST');

      expect(result.pointsAdded).toBe(300);
      expect(result.activityType).toBe('FORUM_POST');
    });

    it('should return null when config not found', () => {
      mockRepository.getActivityTypeConfig.mockReturnValue(null);

      const result = service.tryAccumulate('user1', 'UNKNOWN');

      expect(result).toBeNull();
    });

    it('should return null when activity type is disabled', () => {
      mockRepository.getActivityTypeConfig.mockReturnValue(
        makeConfig({ enabled: false })
      );

      const result = service.tryAccumulate('user1', 'GENERAL');

      expect(result).toBeNull();
    });

    it('should return null when cooldown is active', () => {
      const log = new PointAccumulationLog({
        userId: 'user1',
        activityType: 'GENERAL',
        lastAccumulatedAt: new Date(), // just now
        dailyCount: 1,
        dailyDate: new Date().toISOString().split('T')[0],
      });
      mockRepository.getAccumulationLog.mockReturnValue(log);

      const result = service.tryAccumulate('user1', 'GENERAL');

      expect(result).toBeNull();
    });

    it('should return null when daily cap is reached', () => {
      const today = new Date().toISOString().split('T')[0];
      mockRepository.getActivityTypeConfig.mockReturnValue(
        makeConfig({ activityType: 'PERSONAL_PRACTICE', points: 150, cooldownMinutes: 1, dailyCap: 1 })
      );
      const log = new PointAccumulationLog({
        userId: 'user1',
        activityType: 'PERSONAL_PRACTICE',
        lastAccumulatedAt: new Date(Date.now() - 10 * 60 * 1000), // cooldown expired
        dailyCount: 1,
        dailyDate: today,
      });
      mockRepository.getAccumulationLog.mockReturnValue(log);

      const result = service.tryAccumulate('user1', 'PERSONAL_PRACTICE');

      expect(result).toBeNull();
    });

    it('should accumulate when daily cap not yet reached', () => {
      const today = new Date().toISOString().split('T')[0];
      mockRepository.getActivityTypeConfig.mockReturnValue(
        makeConfig({ activityType: 'PERSONAL_PRACTICE', points: 150, cooldownMinutes: 1, dailyCap: 2 })
      );
      const log = new PointAccumulationLog({
        userId: 'user1',
        activityType: 'PERSONAL_PRACTICE',
        lastAccumulatedAt: new Date(Date.now() - 10 * 60 * 1000),
        dailyCount: 1,
        dailyDate: today,
      });
      mockRepository.getAccumulationLog.mockReturnValue(log);

      const result = service.tryAccumulate('user1', 'PERSONAL_PRACTICE');

      expect(result).not.toBeNull();
      expect(result.pointsAdded).toBe(150);
    });

    it('should have independent cooldowns per activity type', () => {
      // GENERAL has active cooldown
      const generalLog = new PointAccumulationLog({
        userId: 'user1',
        activityType: 'GENERAL',
        lastAccumulatedAt: new Date(), // just now
      });

      // First call: GENERAL with active cooldown -> null
      mockRepository.getAccumulationLog.mockReturnValue(generalLog);
      const generalResult = service.tryAccumulate('user1', 'GENERAL');
      expect(generalResult).toBeNull();

      // Second call: FORUM_POST with no log -> should succeed
      mockRepository.getActivityTypeConfig.mockReturnValue(
        makeConfig({ activityType: 'FORUM_POST', points: 300 })
      );
      mockRepository.getAccumulationLog.mockReturnValue(null);
      const forumResult = service.tryAccumulate('user1', 'FORUM_POST');
      expect(forumResult).not.toBeNull();
      expect(forumResult.pointsAdded).toBe(300);
    });

    it('should add points to existing user total', () => {
      const existingPoint = new ActivityPoint({ userId: 'user1', points: 500 });
      mockRepository.getActivityPoint.mockReturnValue(existingPoint);

      const result = service.tryAccumulate('user1', 'GENERAL');

      expect(result.newPoints).toBe(550);
    });

    it('should record point award history when accumulating', () => {
      service.tryAccumulate('user1', 'GENERAL');

      expect(mockRepository.insertPointAwardHistory).toHaveBeenCalledWith('user1', 'GENERAL', 50);
    });

    it('should record point award history with correct points for different activity types', () => {
      mockRepository.getActivityTypeConfig.mockReturnValue(
        makeConfig({ activityType: 'FORUM_POST', points: 300 })
      );

      service.tryAccumulate('user1', 'FORUM_POST');

      expect(mockRepository.insertPointAwardHistory).toHaveBeenCalledWith('user1', 'FORUM_POST', 300);
    });

    it('should not record history when accumulation is blocked by cooldown', () => {
      const log = new PointAccumulationLog({
        userId: 'user1',
        activityType: 'GENERAL',
        lastAccumulatedAt: new Date(), // just now
      });
      mockRepository.getAccumulationLog.mockReturnValue(log);

      service.tryAccumulate('user1', 'GENERAL');

      expect(mockRepository.insertPointAwardHistory).not.toHaveBeenCalled();
    });
  });

  describe('resetUserPoints', () => {
    it('should also clear accumulation logs and award history', () => {
      service.resetUserPoints('user1');

      expect(mockRepository.resetUserPoints).toHaveBeenCalledWith('user1');
      expect(mockRepository.resetUserAccumulationLogs).toHaveBeenCalledWith('user1');
      expect(mockRepository.resetUserPointAwardHistory).toHaveBeenCalledWith('user1');
    });
  });

  describe('resetAllPoints', () => {
    it('should also clear all accumulation logs and award history', () => {
      service.resetAllPoints();

      expect(mockRepository.resetAllPoints).toHaveBeenCalled();
      expect(mockRepository.resetAllAccumulationLogs).toHaveBeenCalled();
      expect(mockRepository.resetAllPointAwardHistory).toHaveBeenCalled();
    });
  });

  describe('setActivityTypeConfig', () => {
    it('should persist config to repository', () => {
      service.setActivityTypeConfig('FORUM_POST', 300, 10, null, true);

      expect(mockRepository.setActivityTypeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          activityType: 'FORUM_POST',
          points: 300,
          cooldownMinutes: 10,
          dailyCap: null,
          enabled: true,
        })
      );
    });
  });

  describe('getAllActivityTypeConfigs', () => {
    it('should delegate to repository', () => {
      const configs = [makeConfig()];
      mockRepository.getAllActivityTypeConfigs.mockReturnValue(configs);

      const result = service.getAllActivityTypeConfigs();

      expect(result).toBe(configs);
    });
  });

  describe('getUserPoints', () => {
    it('should return 0 when user has no points', () => {
      expect(service.getUserPoints('user1')).toBe(0);
    });

    it('should return existing points', () => {
      mockRepository.getActivityPoint.mockReturnValue(
        new ActivityPoint({ userId: 'user1', points: 500 })
      );

      expect(service.getUserPoints('user1')).toBe(500);
    });
  });

  describe('getConfig (legacy)', () => {
    it('should return legacy config', () => {
      const config = service.getConfig();

      expect(config.pointsPerAction).toBe(100);
      expect(config.cooldownMinutes).toBe(5);
    });

    it('should return defaults when no config exists', () => {
      mockRepository.getPointConfig.mockReturnValue(null);

      const config = service.getConfig();

      expect(config.pointsPerAction).toBe(100);
      expect(config.cooldownMinutes).toBe(5);
    });
  });

  describe('getPointHistory', () => {
    it('should return point award history from repository', () => {
      const mockHistory = [
        { activityType: 'GENERAL', totalPoints: 200 },
        { activityType: 'FORUM_POST', totalPoints: 600 },
      ];
      mockRepository.getPointAwardHistory.mockReturnValue(mockHistory);

      const result = service.getPointHistory('user1');

      expect(result).toEqual(mockHistory);
      expect(mockRepository.getPointAwardHistory).toHaveBeenCalledWith('user1', undefined, undefined);
    });

    it('should pass date range to repository when provided', () => {
      const mockHistory = [
        { activityType: 'GENERAL', totalPoints: 100 },
      ];
      mockRepository.getPointAwardHistory.mockReturnValue(mockHistory);

      const result = service.getPointHistory('user1', '2025-01-01', '2025-01-31');

      expect(result).toEqual(mockHistory);
      expect(mockRepository.getPointAwardHistory).toHaveBeenCalledWith('user1', '2025-01-01', '2025-01-31');
    });

    it('should return empty array when no history exists', () => {
      mockRepository.getPointAwardHistory.mockReturnValue([]);

      const result = service.getPointHistory('user1');

      expect(result).toEqual([]);
    });
  });
});
