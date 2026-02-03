const PersonalPractice = require('../../../../src/domain/entities/PersonalPractice');

describe('PersonalPractice Entity', () => {
  describe('Constructor', () => {
    it('should create a personal practice plan with all required fields', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123456789',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        messageId: 'msg123',
        createdAt: new Date('2026-01-31'),
      });

      expect(plan.id).toBe(1);
      expect(plan.userId).toBe('123456789');
      expect(plan.content).toBe('명상');
      expect(plan.dailyGoal).toBe(30);
      expect(plan.unit).toBe('분');
      expect(plan.startDate).toBe('2026-02-01');
      expect(plan.endDate).toBe('2026-02-28');
      expect(plan.messageId).toBe('msg123');
      expect(plan.createdAt).toEqual(new Date('2026-01-31'));
    });

    it('should create a plan without optional fields', () => {
      const plan = new PersonalPractice({
        userId: '123456789',
        content: '독서',
        dailyGoal: 1,
        unit: '권',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(plan.id).toBeUndefined();
      expect(plan.messageId).toBeNull();
      expect(plan.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('isActive', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true if today is within practice period', () => {
      jest.setSystemTime(new Date('2026-02-15'));

      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(plan.isActive()).toBe(true);
    });

    it('should return true on start date', () => {
      jest.setSystemTime(new Date('2026-02-01'));

      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(plan.isActive()).toBe(true);
    });

    it('should return true on end date', () => {
      jest.setSystemTime(new Date('2026-02-28'));

      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(plan.isActive()).toBe(true);
    });

    it('should return false if today is before start date', () => {
      jest.setSystemTime(new Date('2026-01-31'));

      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(plan.isActive()).toBe(false);
    });

    it('should return false if today is after end date', () => {
      jest.setSystemTime(new Date('2026-03-01'));

      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(plan.isActive()).toBe(false);
    });
  });

  describe('hasEnded', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return false if plan is still ongoing', () => {
      jest.setSystemTime(new Date('2026-02-15'));

      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(plan.hasEnded()).toBe(false);
    });

    it('should return false on end date', () => {
      jest.setSystemTime(new Date('2026-02-28'));

      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(plan.hasEnded()).toBe(false);
    });

    it('should return true if plan has ended', () => {
      jest.setSystemTime(new Date('2026-03-01'));

      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(plan.hasEnded()).toBe(true);
    });
  });

  describe('getTotalDays', () => {
    it('should calculate total days correctly for single day', () => {
      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-01',
      });

      expect(plan.getTotalDays()).toBe(1);
    });

    it('should calculate total days correctly for one month', () => {
      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(plan.getTotalDays()).toBe(28);
    });

    it('should calculate total days correctly for one year', () => {
      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      });

      expect(plan.getTotalDays()).toBe(365);
    });

    it('should include both start and end dates in count', () => {
      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-07',
      });

      // Feb 1, 2, 3, 4, 5, 6, 7 = 7 days
      expect(plan.getTotalDays()).toBe(7);
    });
  });

  describe('getAllDates', () => {
    it('should return all dates in practice period', () => {
      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-05',
      });

      const dates = plan.getAllDates();

      expect(dates).toEqual([
        '2026-02-01',
        '2026-02-02',
        '2026-02-03',
        '2026-02-04',
        '2026-02-05',
      ]);
    });

    it('should return single date for single-day plan', () => {
      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-15',
        endDate: '2026-02-15',
      });

      const dates = plan.getAllDates();

      expect(dates).toEqual(['2026-02-15']);
    });

    it('should handle month boundaries correctly', () => {
      const plan = new PersonalPractice({
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-01-30',
        endDate: '2026-02-02',
      });

      const dates = plan.getAllDates();

      expect(dates).toEqual([
        '2026-01-30',
        '2026-01-31',
        '2026-02-01',
        '2026-02-02',
      ]);
    });
  });

  describe('toJSON', () => {
    it('should convert entity to plain object', () => {
      const createdAt = new Date('2026-01-31');
      const plan = new PersonalPractice({
        id: 1,
        userId: '123456789',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        messageId: 'msg123',
        createdAt,
      });

      const json = plan.toJSON();

      expect(json).toEqual({
        id: 1,
        userId: '123456789',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        messageId: 'msg123',
        createdAt,
      });
    });
  });
});
