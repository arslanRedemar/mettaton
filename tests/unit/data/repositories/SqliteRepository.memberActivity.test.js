const path = require('path');
const fs = require('fs');
const { initializeDatabase, closeDatabase } = require('../../../../src/data/datasource/database');
const { SqliteRepository } = require('../../../../src/data/repositories');
const MemberActivity = require('../../../../src/domain/entities/MemberActivity');

describe('SqliteRepository - Member Activity Operations', () => {
  let repository;
  const testDbPath = path.join(__dirname, 'test-member-activity.db');

  beforeAll(() => {
    // Initialize test database
    initializeDatabase(testDbPath);
    repository = new SqliteRepository();
    repository.init();
  });

  afterAll(() => {
    // Cleanup
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    // Remove WAL files if they exist
    const walPath = testDbPath + '-wal';
    const shmPath = testDbPath + '-shm';
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  });

  beforeEach(() => {
    // Clear member_activity table before each test
    const db = require('../../../../src/data/datasource/database').getDatabase();
    db.exec('DELETE FROM member_activity');
    db.exec("UPDATE settings SET value = '90' WHERE key = 'inactive_days'");
  });

  describe('updateMemberActivity', () => {
    it('should insert new member activity', () => {
      const userId = '123456789';

      repository.updateMemberActivity(userId);
      const activity = repository.getMemberActivity(userId);

      expect(activity).toBeTruthy();
      expect(activity).toBeInstanceOf(MemberActivity);
      expect(activity.userId).toBe(userId);
      expect(activity.lastActiveAt).toBeInstanceOf(Date);
    });

    it('should update existing member activity', () => {
      const userId = '123456789';

      // First insert
      repository.updateMemberActivity(userId);
      const firstActivity = repository.getMemberActivity(userId);

      // Second update (timestamp should be different or equal)
      repository.updateMemberActivity(userId);
      const secondActivity = repository.getMemberActivity(userId);

      expect(secondActivity).toBeTruthy();
      expect(secondActivity.userId).toBe(userId);
      expect(secondActivity.lastActiveAt).toBeInstanceOf(Date);
    });
  });

  describe('getAllMemberActivities', () => {
    it('should return empty array when no activities exist', () => {
      const activities = repository.getAllMemberActivities();

      expect(activities).toEqual([]);
    });

    it('should return all member activities as entities', () => {
      const userId1 = '111';
      const userId2 = '222';

      repository.updateMemberActivity(userId1);
      repository.updateMemberActivity(userId2);

      const activities = repository.getAllMemberActivities();

      expect(activities).toHaveLength(2);
      expect(activities[0]).toBeInstanceOf(MemberActivity);
      expect(activities[1]).toBeInstanceOf(MemberActivity);

      const userIds = activities.map((a) => a.userId);
      expect(userIds).toContain(userId1);
      expect(userIds).toContain(userId2);
    });

    it('should return entities with valid Date objects', () => {
      const userId = '123456789';

      repository.updateMemberActivity(userId);
      const activities = repository.getAllMemberActivities();

      expect(activities).toHaveLength(1);
      expect(activities[0].lastActiveAt).toBeInstanceOf(Date);
    });
  });

  describe('getMemberActivity', () => {
    it('should return null for non-existent member', () => {
      const activity = repository.getMemberActivity('nonexistent');

      expect(activity).toBeNull();
    });

    it('should return MemberActivity entity for existing member', () => {
      const userId = '123456789';

      repository.updateMemberActivity(userId);
      const activity = repository.getMemberActivity(userId);

      expect(activity).toBeInstanceOf(MemberActivity);
      expect(activity.userId).toBe(userId);
      expect(activity.lastActiveAt).toBeInstanceOf(Date);
    });
  });

  describe('getInactiveDays', () => {
    it('should return default inactive days (90) when setting exists', () => {
      const days = repository.getInactiveDays();

      expect(days).toBe(90);
    });

    it('should return 90 as default when setting does not exist', () => {
      const db = require('../../../../src/data/datasource/database').getDatabase();
      db.prepare('DELETE FROM settings WHERE key = ?').run('inactive_days');

      const days = repository.getInactiveDays();

      expect(days).toBe(90);
    });

    it('should return correct inactive days when custom value set', () => {
      repository.setInactiveDays(60);

      const days = repository.getInactiveDays();

      expect(days).toBe(60);
    });
  });

  describe('setInactiveDays', () => {
    it('should set inactive days setting', () => {
      repository.setInactiveDays(60);

      const days = repository.getInactiveDays();
      expect(days).toBe(60);
    });

    it('should update existing inactive days setting', () => {
      repository.setInactiveDays(30);
      repository.setInactiveDays(60);

      const days = repository.getInactiveDays();
      expect(days).toBe(60);
    });

    it('should accept boundary values', () => {
      repository.setInactiveDays(1);
      expect(repository.getInactiveDays()).toBe(1);

      repository.setInactiveDays(365);
      expect(repository.getInactiveDays()).toBe(365);
    });
  });

  describe('deleteMemberActivity', () => {
    it('should delete member activity record', () => {
      const userId = '123456789';

      repository.updateMemberActivity(userId);
      let activity = repository.getMemberActivity(userId);
      expect(activity).toBeTruthy();

      repository.deleteMemberActivity(userId);
      activity = repository.getMemberActivity(userId);
      expect(activity).toBeNull();
    });

    it('should not throw error when deleting non-existent activity', () => {
      expect(() => repository.deleteMemberActivity('nonexistent')).not.toThrow();
    });
  });
});
