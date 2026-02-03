const PersonalPractice = require('../entities/PersonalPractice');
const { ValidationError, NotFoundError, PermissionError } = require('../../../core/errors');

/**
 * PersonalPracticeService
 * Use case layer for personal practice business logic
 */
class PersonalPracticeService {
  /**
   * @param {IPersonalPracticeRepository} repository - Personal practice repository
   */
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} dateStr - Date string to validate
   * @returns {boolean}
   * @private
   */
  _isValidDateFormat(dateStr) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(dateStr);
  }

  /**
   * Get today's date in YYYY-MM-DD format
   * @returns {string}
   * @private
   */
  _getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Validate practice plan creation parameters
   * @param {Object} params - Plan parameters
   * @throws {ValidationError} If validation fails
   * @private
   */
  _validatePlanCreation(params) {
    const errors = [];
    const { content, dailyGoal, unit, startDate, endDate } = params;

    if (!content || content.trim() === '') {
      errors.push('수행 내용을 입력해주세요.');
    }

    if (!dailyGoal || dailyGoal <= 0) {
      errors.push('목표량은 1 이상이어야 합니다.');
    }

    if (!unit || unit.trim() === '') {
      errors.push('목표 단위를 입력해주세요.');
    }

    if (!this._isValidDateFormat(startDate)) {
      errors.push('시작일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
    }

    if (!this._isValidDateFormat(endDate)) {
      errors.push('종료일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
    }

    if (this._isValidDateFormat(startDate) && this._isValidDateFormat(endDate)) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (end <= start) {
        errors.push('종료일은 시작일 이후여야 합니다.');
      }

      if (start < today) {
        errors.push('시작일은 오늘 이후여야 합니다.');
      }

      const durationMs = end - start;
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      if (durationDays > 365) {
        errors.push('계획 기간은 최대 1년(365일)까지 등록 가능합니다.');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }

  /**
   * Validate practice plan update parameters
   * @param {PersonalPractice} plan - Existing plan
   * @param {Object} updates - Update parameters
   * @throws {ValidationError} If validation fails
   * @private
   */
  _validatePlanUpdate(plan, updates) {
    const errors = [];
    const { content, dailyGoal, unit, endDate } = updates;

    if (content !== undefined && content !== null && content.trim() === '') {
      errors.push('수행 내용은 비어있을 수 없습니다.');
    }

    if (dailyGoal !== undefined && dailyGoal !== null && dailyGoal <= 0) {
      errors.push('목표량은 1 이상이어야 합니다.');
    }

    if (unit !== undefined && unit !== null && unit.trim() === '') {
      errors.push('목표 단위는 비어있을 수 없습니다.');
    }

    if (endDate !== undefined && endDate !== null) {
      if (!this._isValidDateFormat(endDate)) {
        errors.push('종료일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
      } else {
        const end = new Date(endDate);
        const start = new Date(plan.startDate);

        if (end <= start) {
          errors.push('종료일은 시작일 이후여야 합니다.');
        }

        const durationMs = end - start;
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
        if (durationDays > 365) {
          errors.push('계획 기간은 최대 1년(365일)까지 등록 가능합니다.');
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }

  /**
   * Create a new personal practice plan
   * @param {Object} params - Plan parameters
   * @param {string} params.userId - Discord user ID
   * @param {string} params.content - Practice content
   * @param {number} params.dailyGoal - Daily goal amount
   * @param {string} params.unit - Unit for daily goal
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @returns {PersonalPractice} Created plan
   * @throws {ValidationError} If validation fails
   */
  createPlan(params) {
    this._validatePlanCreation(params);

    const plan = new PersonalPractice({
      userId: params.userId,
      content: params.content,
      dailyGoal: params.dailyGoal,
      unit: params.unit,
      startDate: params.startDate,
      endDate: params.endDate,
    });

    return this.repository.addPersonalPracticePlan(plan);
  }

  /**
   * Get a personal practice plan by ID
   * @param {number} planId - Plan ID
   * @returns {PersonalPractice} Practice plan
   * @throws {NotFoundError} If plan not found
   */
  getPlanById(planId) {
    const plan = this.repository.getPersonalPracticePlanById(planId);
    if (!plan) {
      throw new NotFoundError('Personal practice plan', planId);
    }
    return plan;
  }

  /**
   * Get all plans for a specific user
   * @param {string} userId - Discord user ID
   * @returns {PersonalPractice[]} Array of plans
   */
  getUserPlans(userId) {
    return this.repository.getPersonalPracticePlansByUserId(userId);
  }

  /**
   * Get active (not ended) plans for a specific user
   * @param {string} userId - Discord user ID
   * @returns {PersonalPractice[]} Array of active plans
   */
  getActiveUserPlans(userId) {
    const plans = this.repository.getPersonalPracticePlansByUserId(userId);
    return plans.filter((plan) => !plan.hasEnded());
  }

  /**
   * Update a personal practice plan
   * @param {number} planId - Plan ID
   * @param {string} userId - User ID requesting update
   * @param {Object} updates - Fields to update
   * @param {string} [updates.content] - New content
   * @param {number} [updates.dailyGoal] - New daily goal
   * @param {string} [updates.unit] - New unit
   * @param {string} [updates.endDate] - New end date
   * @returns {PersonalPractice} Updated plan
   * @throws {NotFoundError} If plan not found
   * @throws {PermissionError} If user is not the plan owner
   * @throws {ValidationError} If plan has already ended or validation fails
   */
  updatePlan(planId, userId, updates) {
    const plan = this.getPlanById(planId);

    if (plan.userId !== userId) {
      throw new PermissionError('본인의 수행 계획만 수정할 수 있습니다.');
    }

    if (plan.hasEnded()) {
      throw new ValidationError('이미 종료된 수행 계획입니다.');
    }

    this._validatePlanUpdate(plan, updates);

    // Apply updates
    if (updates.content !== undefined && updates.content !== null) {
      plan.content = updates.content;
    }
    if (updates.dailyGoal !== undefined && updates.dailyGoal !== null) {
      plan.dailyGoal = updates.dailyGoal;
    }
    if (updates.unit !== undefined && updates.unit !== null) {
      plan.unit = updates.unit;
    }
    if (updates.endDate !== undefined && updates.endDate !== null) {
      plan.endDate = updates.endDate;
    }

    this.repository.updatePersonalPracticePlan(plan);
    return plan;
  }

  /**
   * Delete a personal practice plan
   * @param {number} planId - Plan ID
   * @param {string} userId - User ID requesting deletion
   * @returns {PersonalPractice} Deleted plan
   * @throws {NotFoundError} If plan not found
   * @throws {PermissionError} If user is not the plan owner
   */
  deletePlan(planId, userId) {
    const plan = this.getPlanById(planId);

    if (plan.userId !== userId) {
      throw new PermissionError('본인의 수행 계획만 삭제할 수 있습니다.');
    }

    return this.repository.deletePersonalPracticePlan(planId);
  }

  /**
   * Check in for a practice plan
   * @param {number} planId - Plan ID
   * @param {string} userId - User ID performing check-in
   * @param {string} [checkDate] - Date to check (defaults to today)
   * @returns {Object} Check-in result
   * @returns {boolean} returns.added - True if check-in was added
   * @returns {number} returns.completedCount - Total completed days
   * @returns {number} returns.totalDays - Total days in plan
   * @returns {number} returns.percentage - Completion percentage
   * @throws {NotFoundError} If plan not found
   * @throws {PermissionError} If user is not the plan owner
   * @throws {ValidationError} If plan has ended or date is outside plan period
   */
  checkIn(planId, userId, checkDate = null) {
    const plan = this.getPlanById(planId);
    const today = checkDate || this._getTodayDate();

    if (plan.userId !== userId) {
      throw new PermissionError('본인의 수행 계획만 체크할 수 있습니다.');
    }

    if (plan.hasEnded()) {
      throw new ValidationError('이미 종료된 수행 계획입니다.');
    }

    if (today < plan.startDate || today > plan.endDate) {
      throw new ValidationError(`오늘은 수행 계획 기간(${plan.startDate} ~ ${plan.endDate})에 포함되지 않습니다.`);
    }

    const added = this.repository.addPersonalPracticeRecord(planId, userId, today);

    const checkDates = this.repository.getPersonalPracticeRecords(planId);
    const completedCount = checkDates.length;
    const totalDays = plan.getTotalDays();
    const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

    return {
      added,
      completedCount,
      totalDays,
      percentage,
    };
  }

  /**
   * Remove check-in for a practice plan
   * @param {number} planId - Plan ID
   * @param {string} userId - User ID performing check-in removal
   * @param {string} [checkDate] - Date to uncheck (defaults to today)
   * @returns {Object} Check-in removal result
   * @returns {boolean} returns.removed - True if check-in was removed
   * @returns {number} returns.completedCount - Total completed days
   * @returns {number} returns.totalDays - Total days in plan
   * @returns {number} returns.percentage - Completion percentage
   * @throws {NotFoundError} If plan not found
   * @throws {PermissionError} If user is not the plan owner
   */
  uncheckIn(planId, userId, checkDate = null) {
    const plan = this.getPlanById(planId);
    const today = checkDate || this._getTodayDate();

    if (plan.userId !== userId) {
      throw new PermissionError('본인의 수행 계획만 체크 해제할 수 있습니다.');
    }

    const removed = this.repository.removePersonalPracticeRecord(planId, today);

    const checkDates = this.repository.getPersonalPracticeRecords(planId);
    const completedCount = checkDates.length;
    const totalDays = plan.getTotalDays();
    const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

    return {
      removed,
      completedCount,
      totalDays,
      percentage,
    };
  }

  /**
   * Get progress statistics for a practice plan
   * @param {number} planId - Plan ID
   * @returns {Object} Progress statistics
   * @returns {PersonalPractice} returns.plan - Practice plan
   * @returns {string[]} returns.checkDates - Array of checked dates
   * @returns {number} returns.completedCount - Total completed days
   * @returns {number} returns.totalDays - Total days in plan
   * @returns {number} returns.percentage - Completion percentage
   * @throws {NotFoundError} If plan not found
   */
  getProgress(planId) {
    const plan = this.getPlanById(planId);
    const checkDates = this.repository.getPersonalPracticeRecords(planId);
    const completedCount = checkDates.length;
    const totalDays = plan.getTotalDays();
    const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

    return {
      plan,
      checkDates,
      completedCount,
      totalDays,
      percentage,
    };
  }
}

module.exports = PersonalPracticeService;
