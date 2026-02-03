const PersonalPracticeService = require('../../../../src/domain/usecases/PersonalPracticeService');
const PersonalPractice = require('../../../../src/domain/entities/PersonalPractice');
const { ValidationError, NotFoundError, PermissionError } = require('../../../../core/errors');

describe('PersonalPracticeService', () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      addPersonalPracticePlan: jest.fn(),
      getPersonalPracticePlanById: jest.fn(),
      getPersonalPracticePlansByUserId: jest.fn(),
      updatePersonalPracticePlan: jest.fn(),
      deletePersonalPracticePlan: jest.fn(),
      getPersonalPracticeRecords: jest.fn(),
      addPersonalPracticeRecord: jest.fn(),
      removePersonalPracticeRecord: jest.fn(),
    };

    service = new PersonalPracticeService(mockRepository);

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-10'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createPlan', () => {
    it('should create a valid personal practice plan', () => {
      const params = {
        userId: '123456789',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-15',
        endDate: '2026-03-15',
      };

      const createdPlan = new PersonalPractice({ ...params, id: 1 });
      mockRepository.addPersonalPracticePlan.mockReturnValue(createdPlan);

      const result = service.createPlan(params);

      expect(mockRepository.addPersonalPracticePlan).toHaveBeenCalledWith(
        expect.objectContaining(params)
      );
      expect(result).toEqual(createdPlan);
    });

    it('should throw ValidationError if content is empty', () => {
      const params = {
        userId: '123456789',
        content: '',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-15',
        endDate: '2026-03-15',
      };

      expect(() => service.createPlan(params)).toThrow(ValidationError);
      expect(() => service.createPlan(params)).toThrow('수행 내용을 입력해주세요');
    });

    it('should throw ValidationError if dailyGoal is zero or negative', () => {
      const params = {
        userId: '123456789',
        content: '명상',
        dailyGoal: 0,
        unit: '분',
        startDate: '2026-02-15',
        endDate: '2026-03-15',
      };

      expect(() => service.createPlan(params)).toThrow(ValidationError);
      expect(() => service.createPlan(params)).toThrow('목표량은 1 이상이어야 합니다');
    });

    it('should throw ValidationError if date format is invalid', () => {
      const params = {
        userId: '123456789',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026/02/15',
        endDate: '2026-03-15',
      };

      expect(() => service.createPlan(params)).toThrow(ValidationError);
      expect(() => service.createPlan(params)).toThrow('형식이 올바르지 않습니다');
    });

    it('should throw ValidationError if end date is before start date', () => {
      const params = {
        userId: '123456789',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-03-15',
        endDate: '2026-02-15',
      };

      expect(() => service.createPlan(params)).toThrow(ValidationError);
      expect(() => service.createPlan(params)).toThrow('종료일은 시작일 이후여야 합니다');
    });

    it('should throw ValidationError if start date is in the past', () => {
      const params = {
        userId: '123456789',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-09',
        endDate: '2026-03-15',
      };

      expect(() => service.createPlan(params)).toThrow(ValidationError);
      expect(() => service.createPlan(params)).toThrow('시작일은 오늘 이후여야 합니다');
    });

    it('should throw ValidationError if duration exceeds 365 days', () => {
      const params = {
        userId: '123456789',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-15',
        endDate: '2027-02-20',
      };

      expect(() => service.createPlan(params)).toThrow(ValidationError);
      expect(() => service.createPlan(params)).toThrow('최대 1년(365일)까지');
    });
  });

  describe('getPlanById', () => {
    it('should return plan if found', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-15',
        endDate: '2026-03-15',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);

      const result = service.getPlanById(1);

      expect(result).toEqual(plan);
      expect(mockRepository.getPersonalPracticePlanById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError if plan not found', () => {
      mockRepository.getPersonalPracticePlanById.mockReturnValue(null);

      expect(() => service.getPlanById(999)).toThrow(NotFoundError);
    });
  });

  describe('getUserPlans', () => {
    it('should return all plans for a user', () => {
      const plans = [
        new PersonalPractice({
          id: 1,
          userId: '123',
          content: '명상',
          dailyGoal: 30,
          unit: '분',
          startDate: '2026-02-15',
          endDate: '2026-03-15',
        }),
        new PersonalPractice({
          id: 2,
          userId: '123',
          content: '독서',
          dailyGoal: 1,
          unit: '권',
          startDate: '2026-02-01',
          endDate: '2026-02-28',
        }),
      ];

      mockRepository.getPersonalPracticePlansByUserId.mockReturnValue(plans);

      const result = service.getUserPlans('123');

      expect(result).toEqual(plans);
      expect(mockRepository.getPersonalPracticePlansByUserId).toHaveBeenCalledWith('123');
    });
  });

  describe('getActiveUserPlans', () => {
    it('should return only active plans for a user', () => {
      const activePlan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-03-15',
      });

      const endedPlan = new PersonalPractice({
        id: 2,
        userId: '123',
        content: '독서',
        dailyGoal: 1,
        unit: '권',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      });

      mockRepository.getPersonalPracticePlansByUserId.mockReturnValue([
        activePlan,
        endedPlan,
      ]);

      const result = service.getActiveUserPlans('123');

      expect(result).toEqual([activePlan]);
    });
  });

  describe('updatePlan', () => {
    it('should update plan with valid changes', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-15',
        endDate: '2026-03-15',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);
      mockRepository.updatePersonalPracticePlan.mockReturnValue(true);

      const result = service.updatePlan(1, '123', {
        content: '요가',
        dailyGoal: 45,
      });

      expect(result.content).toBe('요가');
      expect(result.dailyGoal).toBe(45);
      expect(mockRepository.updatePersonalPracticePlan).toHaveBeenCalledWith(plan);
    });

    it('should throw PermissionError if user is not the owner', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-15',
        endDate: '2026-03-15',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);

      expect(() =>
        service.updatePlan(1, '999', { content: '요가' })
      ).toThrow(PermissionError);
    });

    it('should throw ValidationError if plan has ended', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);

      expect(() =>
        service.updatePlan(1, '123', { content: '요가' })
      ).toThrow(ValidationError);
      expect(() =>
        service.updatePlan(1, '123', { content: '요가' })
      ).toThrow('이미 종료된');
    });

    it('should throw ValidationError if new end date exceeds 365 days', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-15',
        endDate: '2026-03-15',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);

      expect(() =>
        service.updatePlan(1, '123', { endDate: '2027-02-20' })
      ).toThrow(ValidationError);
      expect(() =>
        service.updatePlan(1, '123', { endDate: '2027-02-20' })
      ).toThrow('최대 1년(365일)까지');
    });
  });

  describe('deletePlan', () => {
    it('should delete plan if user is owner', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-15',
        endDate: '2026-03-15',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);
      mockRepository.deletePersonalPracticePlan.mockReturnValue(plan);

      const result = service.deletePlan(1, '123');

      expect(result).toEqual(plan);
      expect(mockRepository.deletePersonalPracticePlan).toHaveBeenCalledWith(1);
    });

    it('should throw PermissionError if user is not the owner', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-15',
        endDate: '2026-03-15',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);

      expect(() => service.deletePlan(1, '999')).toThrow(PermissionError);
    });
  });

  describe('checkIn', () => {
    it('should add check-in record for valid date', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);
      mockRepository.addPersonalPracticeRecord.mockReturnValue(true);
      mockRepository.getPersonalPracticeRecords.mockReturnValue([
        '2026-02-01',
        '2026-02-02',
        '2026-02-10',
      ]);

      const result = service.checkIn(1, '123');

      expect(result.added).toBe(true);
      expect(result.completedCount).toBe(3);
      expect(result.totalDays).toBe(28);
      expect(result.percentage).toBe(11);
      expect(mockRepository.addPersonalPracticeRecord).toHaveBeenCalledWith(
        1,
        '123',
        '2026-02-10'
      );
    });

    it('should throw PermissionError if user is not the owner', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);

      expect(() => service.checkIn(1, '999')).toThrow(PermissionError);
    });

    it('should throw ValidationError if plan has ended', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);

      expect(() => service.checkIn(1, '123')).toThrow(ValidationError);
      expect(() => service.checkIn(1, '123')).toThrow('이미 종료된');
    });

    it('should throw ValidationError if today is outside plan period', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);

      expect(() => service.checkIn(1, '123')).toThrow(ValidationError);
      expect(() => service.checkIn(1, '123')).toThrow('포함되지 않습니다');
    });
  });

  describe('uncheckIn', () => {
    it('should remove check-in record', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);
      mockRepository.removePersonalPracticeRecord.mockReturnValue(true);
      mockRepository.getPersonalPracticeRecords.mockReturnValue([
        '2026-02-01',
        '2026-02-02',
      ]);

      const result = service.uncheckIn(1, '123');

      expect(result.removed).toBe(true);
      expect(result.completedCount).toBe(2);
      expect(mockRepository.removePersonalPracticeRecord).toHaveBeenCalledWith(
        1,
        '2026-02-10'
      );
    });

    it('should throw PermissionError if user is not the owner', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);

      expect(() => service.uncheckIn(1, '999')).toThrow(PermissionError);
    });
  });

  describe('getProgress', () => {
    it('should return progress statistics', () => {
      const plan = new PersonalPractice({
        id: 1,
        userId: '123',
        content: '명상',
        dailyGoal: 30,
        unit: '분',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      mockRepository.getPersonalPracticePlanById.mockReturnValue(plan);
      mockRepository.getPersonalPracticeRecords.mockReturnValue([
        '2026-02-01',
        '2026-02-02',
        '2026-02-03',
      ]);

      const result = service.getProgress(1);

      expect(result.plan).toEqual(plan);
      expect(result.checkDates).toEqual([
        '2026-02-01',
        '2026-02-02',
        '2026-02-03',
      ]);
      expect(result.completedCount).toBe(3);
      expect(result.totalDays).toBe(28);
      expect(result.percentage).toBe(11);
    });

    it('should throw NotFoundError if plan not found', () => {
      mockRepository.getPersonalPracticePlanById.mockReturnValue(null);

      expect(() => service.getProgress(999)).toThrow(NotFoundError);
    });
  });
});
