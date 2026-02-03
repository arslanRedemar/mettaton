const { getDatabase } = require('../datasource/database');
const {
  LectureMapper,
  QuestionMapper,
  ActivityPointMapper,
  PersonalPracticeMapper,
  ActivityTypeConfigMapper,
  PointAccumulationLogMapper,
  MeetingConfigMapper,
  MemberActivityMapper,
} = require('../mappers');

/**
 * SQLite Repository 구현체
 * Domain의 IRepository 인터페이스 구현
 */
class SqliteRepository {
  constructor() {
    this.db = null;
  }

  init() {
    this.db = getDatabase();
    this._prepareStatements();
  }

  _prepareStatements() {
    this.stmts = {
      // Lectures
      getAllLectures: this.db.prepare(`
        SELECT * FROM lectures ORDER BY date, start
      `),
      getLectureById: this.db.prepare(`
        SELECT * FROM lectures WHERE id = ?
      `),
      getLectureByMessageId: this.db.prepare(`
        SELECT * FROM lectures WHERE message_id = ?
      `),
      insertLecture: this.db.prepare(`
        INSERT INTO lectures (title, date, start, end, location, teacher, message_id)
        VALUES (@title, @date, @start, @end, @location, @teacher, @messageId)
      `),
      updateLecture: this.db.prepare(`
        UPDATE lectures
        SET title = @title, date = @date, start = @start, end = @end,
            location = @location, teacher = @teacher, message_id = @messageId
        WHERE id = @id
      `),
      deleteLecture: this.db.prepare(`
        DELETE FROM lectures WHERE id = ?
      `),
      deleteLectureByMessageId: this.db.prepare(`
        DELETE FROM lectures WHERE message_id = ?
      `),

      // Attendees
      getAttendees: this.db.prepare(`
        SELECT user_id FROM lecture_attendees WHERE lecture_id = ?
      `),
      addAttendee: this.db.prepare(`
        INSERT OR IGNORE INTO lecture_attendees (lecture_id, user_id) VALUES (?, ?)
      `),
      removeAttendee: this.db.prepare(`
        DELETE FROM lecture_attendees WHERE lecture_id = ? AND user_id = ?
      `),

      // Questions
      getAllQuestions: this.db.prepare(`
        SELECT * FROM questions ORDER BY created_at DESC
      `),
      getQuestionById: this.db.prepare(`
        SELECT * FROM questions WHERE id = ?
      `),
      getQuestionByMessageId: this.db.prepare(`
        SELECT * FROM questions WHERE message_id = ?
      `),
      insertQuestion: this.db.prepare(`
        INSERT INTO questions (author, question, answer, answered_by, message_id)
        VALUES (@author, @question, @answer, @answeredBy, @messageId)
      `),
      updateQuestion: this.db.prepare(`
        UPDATE questions
        SET question = @question, answer = @answer, answered_by = @answeredBy, message_id = @messageId
        WHERE id = @id
      `),
      deleteQuestion: this.db.prepare(`
        DELETE FROM questions WHERE id = ?
      `),
      deleteQuestionByMessageId: this.db.prepare(`
        DELETE FROM questions WHERE message_id = ?
      `),

      // Question Attendees
      getQuestionAttendees: this.db.prepare(`
        SELECT user_id FROM question_attendees WHERE question_id = ?
      `),
      addQuestionAttendee: this.db.prepare(`
        INSERT OR IGNORE INTO question_attendees (question_id, user_id) VALUES (?, ?)
      `),
      removeQuestionAttendee: this.db.prepare(`
        DELETE FROM question_attendees WHERE question_id = ? AND user_id = ?
      `),

      // Settings
      getSetting: this.db.prepare(`
        SELECT value FROM settings WHERE key = ?
      `),
      setSetting: this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
      `),

      // Bot Strings
      getAllStrings: this.db.prepare(`
        SELECT key, value, params FROM bot_strings
      `),
      getString: this.db.prepare(`
        SELECT value, params FROM bot_strings WHERE key = ?
      `),
      setString: this.db.prepare(`
        INSERT INTO bot_strings (key, value, params, updated_at)
        VALUES (@key, @value, @params, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
          value = @value,
          params = @params,
          updated_at = CURRENT_TIMESTAMP
      `),
      deleteString: this.db.prepare(`
        DELETE FROM bot_strings WHERE key = ?
      `),

      // Member Activity
      upsertMemberActivity: this.db.prepare(`
        INSERT INTO member_activity (user_id, last_active_at, updated_at)
        VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          last_active_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      `),
      getAllMemberActivities: this.db.prepare(`
        SELECT user_id, last_active_at FROM member_activity
      `),
      getMemberActivity: this.db.prepare(`
        SELECT user_id, last_active_at FROM member_activity WHERE user_id = ?
      `),

      // Sync Operations
      deleteMemberActivity: this.db.prepare(`
        DELETE FROM member_activity WHERE user_id = ?
      `),
      insertMemberActivityIfMissing: this.db.prepare(`
        INSERT OR IGNORE INTO member_activity (user_id, last_active_at, updated_at)
        VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `),
      clearLectureMessageId: this.db.prepare(`
        UPDATE lectures SET message_id = NULL WHERE id = ?
      `),
      clearQuestionMessageId: this.db.prepare(`
        UPDATE questions SET message_id = NULL WHERE id = ?
      `),
      clearPracticePlanMessageId: this.db.prepare(`
        UPDATE personal_practice_plans SET message_id = NULL WHERE id = ?
      `),
      clearQuizPublishHistoryMessageId: this.db.prepare(`
        UPDATE quiz_publish_history SET message_id = NULL WHERE id = ?
      `),
      getAllQuizPublishHistory: this.db.prepare(`
        SELECT * FROM quiz_publish_history ORDER BY published_date DESC
      `),
      deleteActivityPointsByUserId: this.db.prepare(`
        DELETE FROM activity_points WHERE user_id = ?
      `),
      deleteAccumulationLogsByUserId: this.db.prepare(`
        DELETE FROM point_accumulation_log WHERE user_id = ?
      `),
      deleteOrphanQuizPublishHistory: this.db.prepare(`
        DELETE FROM quiz_publish_history
        WHERE question_id NOT IN (SELECT id FROM quiz_questions)
      `),

      // Meeting Config
      getMeetingConfig: this.db.prepare(`
        SELECT * FROM meeting_config WHERE id = 1
      `),
      upsertMeetingConfig: this.db.prepare(`
        INSERT INTO meeting_config (id, channel_id, schedule_hour, schedule_minute, meeting_start_time, meeting_end_time, location, activity, enabled)
        VALUES (1, @channelId, @scheduleHour, @scheduleMinute, @meetingStartTime, @meetingEndTime, @location, @activity, @enabled)
        ON CONFLICT(id) DO UPDATE SET
          channel_id = @channelId,
          schedule_hour = @scheduleHour,
          schedule_minute = @scheduleMinute,
          meeting_start_time = @meetingStartTime,
          meeting_end_time = @meetingEndTime,
          location = @location,
          activity = @activity,
          enabled = @enabled,
          updated_at = CURRENT_TIMESTAMP
      `),

      // Activity Points
      getActivityPoint: this.db.prepare(`
        SELECT * FROM activity_points WHERE user_id = ?
      `),
      getAllActivityPoints: this.db.prepare(`
        SELECT * FROM activity_points ORDER BY points DESC
      `),
      upsertActivityPoint: this.db.prepare(`
        INSERT INTO activity_points (user_id, points, last_accumulated_at, updated_at)
        VALUES (@userId, @points, @lastAccumulatedAt, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          points = @points,
          last_accumulated_at = @lastAccumulatedAt,
          updated_at = CURRENT_TIMESTAMP
      `),
      resetUserPoints: this.db.prepare(`
        UPDATE activity_points SET points = 0, last_accumulated_at = NULL WHERE user_id = ?
      `),
      resetAllPoints: this.db.prepare(`
        UPDATE activity_points SET points = 0, last_accumulated_at = NULL
      `),

      // Point Config
      getPointConfig: this.db.prepare(`
        SELECT * FROM point_config WHERE id = 1
      `),
      upsertPointConfig: this.db.prepare(`
        INSERT INTO point_config (id, points_per_action, cooldown_minutes, updated_at)
        VALUES (1, @pointsPerAction, @cooldownMinutes, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          points_per_action = @pointsPerAction,
          cooldown_minutes = @cooldownMinutes,
          updated_at = CURRENT_TIMESTAMP
      `),

      // Personal Practice Plans
      getAllPersonalPracticePlans: this.db.prepare(`
        SELECT * FROM personal_practice_plans ORDER BY created_at DESC
      `),
      getPersonalPracticePlanById: this.db.prepare(`
        SELECT * FROM personal_practice_plans WHERE id = ?
      `),
      getPersonalPracticePlanByMessageId: this.db.prepare(`
        SELECT * FROM personal_practice_plans WHERE message_id = ?
      `),
      getPersonalPracticePlansByUserId: this.db.prepare(`
        SELECT * FROM personal_practice_plans WHERE user_id = ? ORDER BY created_at DESC
      `),
      insertPersonalPracticePlan: this.db.prepare(`
        INSERT INTO personal_practice_plans (user_id, content, daily_goal, unit, start_date, end_date, message_id)
        VALUES (@userId, @content, @dailyGoal, @unit, @startDate, @endDate, @messageId)
      `),
      updatePersonalPracticePlan: this.db.prepare(`
        UPDATE personal_practice_plans
        SET content = @content, daily_goal = @dailyGoal, unit = @unit,
            end_date = @endDate, message_id = @messageId
        WHERE id = @id
      `),
      deletePersonalPracticePlan: this.db.prepare(`
        DELETE FROM personal_practice_plans WHERE id = ?
      `),

      // Personal Practice Records
      getPersonalPracticeRecordsByPlanId: this.db.prepare(`
        SELECT * FROM personal_practice_records WHERE plan_id = ? ORDER BY check_date
      `),
      getPersonalPracticeRecord: this.db.prepare(`
        SELECT * FROM personal_practice_records WHERE plan_id = ? AND check_date = ?
      `),
      insertPersonalPracticeRecord: this.db.prepare(`
        INSERT OR IGNORE INTO personal_practice_records (plan_id, user_id, check_date)
        VALUES (?, ?, ?)
      `),
      deletePersonalPracticeRecord: this.db.prepare(`
        DELETE FROM personal_practice_records WHERE plan_id = ? AND check_date = ?
      `),

      // Activity Type Config
      getActivityTypeConfig: this.db.prepare(`
        SELECT * FROM activity_type_config WHERE activity_type = ?
      `),
      getAllActivityTypeConfigs: this.db.prepare(`
        SELECT * FROM activity_type_config ORDER BY activity_type
      `),
      upsertActivityTypeConfig: this.db.prepare(`
        INSERT INTO activity_type_config (activity_type, points, cooldown_minutes, daily_cap, enabled, updated_at)
        VALUES (@activityType, @points, @cooldownMinutes, @dailyCap, @enabled, CURRENT_TIMESTAMP)
        ON CONFLICT(activity_type) DO UPDATE SET
          points = @points,
          cooldown_minutes = @cooldownMinutes,
          daily_cap = @dailyCap,
          enabled = @enabled,
          updated_at = CURRENT_TIMESTAMP
      `),

      // Point Accumulation Log
      getAccumulationLog: this.db.prepare(`
        SELECT * FROM point_accumulation_log WHERE user_id = ? AND activity_type = ?
      `),
      upsertAccumulationLog: this.db.prepare(`
        INSERT INTO point_accumulation_log (user_id, activity_type, last_accumulated_at, daily_count, daily_date)
        VALUES (@userId, @activityType, @lastAccumulatedAt, @dailyCount, @dailyDate)
        ON CONFLICT(user_id, activity_type) DO UPDATE SET
          last_accumulated_at = @lastAccumulatedAt,
          daily_count = @dailyCount,
          daily_date = @dailyDate
      `),
      resetUserAccumulationLogs: this.db.prepare(`
        DELETE FROM point_accumulation_log WHERE user_id = ?
      `),
      resetAllAccumulationLogs: this.db.prepare(`
        DELETE FROM point_accumulation_log
      `),

      // Point Award History
      insertPointAwardHistory: this.db.prepare(`
        INSERT INTO point_award_history (user_id, activity_type, points_awarded, awarded_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `),
      getPointAwardHistoryByUser: this.db.prepare(`
        SELECT activity_type, SUM(points_awarded) as total_points
        FROM point_award_history
        WHERE user_id = ?
        GROUP BY activity_type
      `),
      getPointAwardHistoryByUserAndDateRange: this.db.prepare(`
        SELECT activity_type, SUM(points_awarded) as total_points
        FROM point_award_history
        WHERE user_id = ?
          AND DATE(awarded_at) >= DATE(?)
          AND DATE(awarded_at) <= DATE(?)
        GROUP BY activity_type
      `),
      resetUserPointAwardHistory: this.db.prepare(`
        DELETE FROM point_award_history WHERE user_id = ?
      `),
      resetAllPointAwardHistory: this.db.prepare(`
        DELETE FROM point_award_history
      `),
    };
  }

  // ==================== Lecture Operations ====================

  getAllLectures() {
    const rows = this.stmts.getAllLectures.all();
    return rows.map((row) => {
      const attendees = this.stmts.getAttendees.all(row.id).map((a) => a.user_id);
      return LectureMapper.toEntity(row, attendees);
    });
  }

  getLectureById(id) {
    const row = this.stmts.getLectureById.get(id);
    if (!row) return null;
    const attendees = this.stmts.getAttendees.all(row.id).map((a) => a.user_id);
    return LectureMapper.toEntity(row, attendees);
  }

  getLectureByMessageId(messageId) {
    const row = this.stmts.getLectureByMessageId.get(messageId);
    if (!row) return null;
    const attendees = this.stmts.getAttendees.all(row.id).map((a) => a.user_id);
    return LectureMapper.toEntity(row, attendees);
  }

  addLecture(lecture) {
    const params = LectureMapper.toDbParams(lecture);
    const result = this.stmts.insertLecture.run(params);
    lecture.id = result.lastInsertRowid;
    return lecture;
  }

  updateLecture(lecture) {
    const params = LectureMapper.toDbParams(lecture);
    this.stmts.updateLecture.run(params);

    // Sync attendees
    const currentAttendees = this.stmts.getAttendees.all(lecture.id).map((a) => a.user_id);

    // Add new attendees
    for (const userId of lecture.attendees) {
      if (!currentAttendees.includes(userId)) {
        this.stmts.addAttendee.run(lecture.id, userId);
      }
    }

    // Remove old attendees
    for (const userId of currentAttendees) {
      if (!lecture.attendees.includes(userId)) {
        this.stmts.removeAttendee.run(lecture.id, userId);
      }
    }

    return true;
  }

  deleteLecture(id) {
    const lecture = this.getLectureById(id);
    if (lecture) {
      this.stmts.deleteLecture.run(id);
      return lecture;
    }
    return null;
  }

  deleteLectureByMessageId(messageId) {
    const result = this.stmts.deleteLectureByMessageId.run(messageId);
    return result.changes > 0;
  }

  // ==================== Schedule Operations (Aliases for Lecture) ====================

  getAllSchedules() {
    return this.getAllLectures();
  }

  getScheduleById(id) {
    return this.getLectureById(id);
  }

  getScheduleByMessageId(messageId) {
    return this.getLectureByMessageId(messageId);
  }

  addSchedule(schedule) {
    return this.addLecture(schedule);
  }

  updateSchedule(schedule) {
    return this.updateLecture(schedule);
  }

  deleteSchedule(id) {
    return this.deleteLecture(id);
  }

  deleteScheduleByMessageId(messageId) {
    return this.deleteLectureByMessageId(messageId);
  }

  // ==================== Question Operations ====================

  getAllQuestions() {
    const rows = this.stmts.getAllQuestions.all();
    return rows.map((row) => {
      const attendees = this.stmts.getQuestionAttendees.all(row.id).map((a) => a.user_id);
      return QuestionMapper.toEntity(row, attendees);
    });
  }

  getQuestionById(id) {
    const row = this.stmts.getQuestionById.get(id);
    if (!row) return null;
    const attendees = this.stmts.getQuestionAttendees.all(row.id).map((a) => a.user_id);
    return QuestionMapper.toEntity(row, attendees);
  }

  getQuestionByMessageId(messageId) {
    const row = this.stmts.getQuestionByMessageId.get(messageId);
    if (!row) return null;
    const attendees = this.stmts.getQuestionAttendees.all(row.id).map((a) => a.user_id);
    return QuestionMapper.toEntity(row, attendees);
  }

  addQuestion(question) {
    const params = QuestionMapper.toDbParams(question);
    const result = this.stmts.insertQuestion.run(params);
    question.id = result.lastInsertRowid;
    return question;
  }

  updateQuestion(question) {
    const params = QuestionMapper.toDbParams(question);
    this.stmts.updateQuestion.run(params);

    // Sync attendees
    const currentAttendees = this.stmts.getQuestionAttendees.all(question.id).map((a) => a.user_id);

    for (const userId of question.attendees) {
      if (!currentAttendees.includes(userId)) {
        this.stmts.addQuestionAttendee.run(question.id, userId);
      }
    }

    for (const userId of currentAttendees) {
      if (!question.attendees.includes(userId)) {
        this.stmts.removeQuestionAttendee.run(question.id, userId);
      }
    }

    return true;
  }

  deleteQuestion(id) {
    const question = this.getQuestionById(id);
    if (question) {
      this.stmts.deleteQuestion.run(id);
      return question;
    }
    return null;
  }

  deleteQuestionByMessageId(messageId) {
    const result = this.stmts.deleteQuestionByMessageId.run(messageId);
    return result.changes > 0;
  }

  // ==================== Settings Operations ====================

  getMeetingCount() {
    const row = this.stmts.getSetting.get('meeting_count');
    return row ? parseInt(row.value, 10) : 0;
  }

  incrementMeetingCount() {
    const current = this.getMeetingCount();
    const newCount = current + 1;
    this.stmts.setSetting.run('meeting_count', String(newCount));
    return newCount;
  }

  // ==================== Bot String Operations ====================

  getAllStrings() {
    return this.stmts.getAllStrings.all();
  }

  getString(key) {
    return this.stmts.getString.get(key) || null;
  }

  setString(key, value, params = null) {
    this.stmts.setString.run({
      key,
      value,
      params: params ? JSON.stringify(params) : null,
    });
  }

  deleteString(key) {
    const result = this.stmts.deleteString.run(key);
    return result.changes > 0;
  }

  // ==================== Member Activity Operations ====================

  updateMemberActivity(userId) {
    this.stmts.upsertMemberActivity.run(userId);
  }

  getAllMemberActivities() {
    const rows = this.stmts.getAllMemberActivities.all();
    return rows.map((row) => MemberActivityMapper.toEntity(row));
  }

  getMemberActivity(userId) {
    const row = this.stmts.getMemberActivity.get(userId);
    return MemberActivityMapper.toEntity(row);
  }

  getInactiveDays() {
    const row = this.stmts.getSetting.get('inactive_days');
    return row ? parseInt(row.value, 10) : 90;
  }

  setInactiveDays(days) {
    this.stmts.setSetting.run('inactive_days', String(days));
  }

  // ==================== Sync Operations ====================

  deleteMemberActivity(userId) {
    this.stmts.deleteMemberActivity.run(userId);
  }

  insertMemberActivityIfMissing(userId) {
    const result = this.stmts.insertMemberActivityIfMissing.run(userId);
    return result.changes > 0;
  }

  removeAttendee(lectureId, userId) {
    this.stmts.removeAttendee.run(lectureId, userId);
  }

  clearLectureMessageId(id) {
    this.stmts.clearLectureMessageId.run(id);
  }

  clearQuestionMessageId(id) {
    this.stmts.clearQuestionMessageId.run(id);
  }

  // ==================== Meeting Config Operations ====================

  /**
   * Get meeting configuration
   * @returns {MeetingConfig|null}
   */
  getMeetingConfig() {
    const row = this.stmts.getMeetingConfig.get();
    return MeetingConfigMapper.toDomain(row);
  }

  /**
   * Set meeting configuration
   * @param {MeetingConfig|Object} config - MeetingConfig entity or plain object
   * @returns {boolean}
   */
  setMeetingConfig(config) {
    const params = MeetingConfigMapper.toDbParams(config);
    this.stmts.upsertMeetingConfig.run(params);
    return true;
  }

  // ==================== Activity Point Operations ====================

  /**
   * Get activity points for a specific user
   * @param {string} userId - Discord user ID
   * @returns {ActivityPoint|null}
   */
  getActivityPoint(userId) {
    const row = this.stmts.getActivityPoint.get(userId);
    return ActivityPointMapper.toEntity(row);
  }

  /**
   * Get all activity points (sorted by points descending)
   * @returns {ActivityPoint[]}
   */
  getAllActivityPoints() {
    const rows = this.stmts.getAllActivityPoints.all();
    return rows.map((row) => ActivityPointMapper.toEntity(row));
  }

  /**
   * Create or update activity points for a user
   * @param {ActivityPoint} activityPoint
   * @returns {ActivityPoint}
   */
  upsertActivityPoint(activityPoint) {
    const params = ActivityPointMapper.toDbParams(activityPoint);
    this.stmts.upsertActivityPoint.run(params);
    return activityPoint;
  }

  /**
   * Reset points for a specific user
   * @param {string} userId - Discord user ID
   * @returns {boolean}
   */
  resetUserPoints(userId) {
    const result = this.stmts.resetUserPoints.run(userId);
    return result.changes > 0;
  }

  /**
   * Reset all user points
   * @returns {boolean}
   */
  resetAllPoints() {
    const result = this.stmts.resetAllPoints.run();
    return result.changes > 0;
  }

  /**
   * Get point configuration
   * @returns {Object|null} - {pointsPerAction: number, cooldownMinutes: number}
   */
  getPointConfig() {
    const row = this.stmts.getPointConfig.get();
    if (!row) return null;
    return {
      pointsPerAction: row.points_per_action,
      cooldownMinutes: row.cooldown_minutes,
    };
  }

  /**
   * Set point configuration
   * @param {number} pointsPerAction - Points awarded per action
   * @param {number} cooldownMinutes - Cooldown period in minutes
   * @returns {boolean}
   */
  setPointConfig(pointsPerAction, cooldownMinutes) {
    this.stmts.upsertPointConfig.run({
      pointsPerAction,
      cooldownMinutes,
    });
    return true;
  }

  // ==================== Activity Type Config Operations ====================

  /**
   * Get configuration for a specific activity type
   * @param {string} activityType - Activity type key
   * @returns {ActivityTypeConfig|null}
   */
  getActivityTypeConfig(activityType) {
    const row = this.stmts.getActivityTypeConfig.get(activityType);
    return ActivityTypeConfigMapper.toEntity(row);
  }

  /**
   * Get all activity type configurations
   * @returns {ActivityTypeConfig[]}
   */
  getAllActivityTypeConfigs() {
    const rows = this.stmts.getAllActivityTypeConfigs.all();
    return rows.map((row) => ActivityTypeConfigMapper.toEntity(row));
  }

  /**
   * Create or update activity type configuration
   * @param {ActivityTypeConfig} config
   * @returns {boolean}
   */
  setActivityTypeConfig(config) {
    const params = ActivityTypeConfigMapper.toDbParams(config);
    this.stmts.upsertActivityTypeConfig.run(params);
    return true;
  }

  // ==================== Point Accumulation Log Operations ====================

  /**
   * Get accumulation log for a user and activity type
   * @param {string} userId - Discord user ID
   * @param {string} activityType - Activity type key
   * @returns {PointAccumulationLog|null}
   */
  getAccumulationLog(userId, activityType) {
    const row = this.stmts.getAccumulationLog.get(userId, activityType);
    return PointAccumulationLogMapper.toEntity(row);
  }

  /**
   * Create or update accumulation log
   * @param {PointAccumulationLog} log
   * @returns {PointAccumulationLog}
   */
  upsertAccumulationLog(log) {
    const params = PointAccumulationLogMapper.toDbParams(log);
    this.stmts.upsertAccumulationLog.run(params);
    return log;
  }

  /**
   * Reset accumulation logs for a specific user
   * @param {string} userId - Discord user ID
   */
  resetUserAccumulationLogs(userId) {
    this.stmts.resetUserAccumulationLogs.run(userId);
  }

  /**
   * Reset all accumulation logs
   */
  resetAllAccumulationLogs() {
    this.stmts.resetAllAccumulationLogs.run();
  }

  // ==================== Point Award History Operations ====================

  /**
   * Insert a point award history record
   * @param {string} userId - Discord user ID
   * @param {string} activityType - Activity type key
   * @param {number} pointsAwarded - Points awarded
   * @returns {boolean}
   */
  insertPointAwardHistory(userId, activityType, pointsAwarded) {
    const result = this.stmts.insertPointAwardHistory.run(userId, activityType, pointsAwarded);
    return result.changes > 0;
  }

  /**
   * Get aggregated point award history for a user
   * @param {string} userId - Discord user ID
   * @param {string} [startDate] - Start date (YYYY-MM-DD), optional
   * @param {string} [endDate] - End date (YYYY-MM-DD), optional
   * @returns {Array<{activityType: string, totalPoints: number}>}
   */
  getPointAwardHistory(userId, startDate, endDate) {
    let rows;
    if (startDate && endDate) {
      rows = this.stmts.getPointAwardHistoryByUserAndDateRange.all(userId, startDate, endDate);
    } else {
      rows = this.stmts.getPointAwardHistoryByUser.all(userId);
    }

    return rows.map((row) => ({
      activityType: row.activity_type,
      totalPoints: row.total_points,
    }));
  }

  /**
   * Reset point award history for a specific user
   * @param {string} userId - Discord user ID
   * @returns {boolean}
   */
  resetUserPointAwardHistory(userId) {
    const result = this.stmts.resetUserPointAwardHistory.run(userId);
    return result.changes > 0;
  }

  /**
   * Reset all point award history
   * @returns {boolean}
   */
  resetAllPointAwardHistory() {
    const result = this.stmts.resetAllPointAwardHistory.run();
    return result.changes > 0;
  }

  // ==================== Personal Practice Operations ====================

  /**
   * Get all personal practice plans
   * @returns {PersonalPractice[]}
   */
  getAllPersonalPracticePlans() {
    const rows = this.stmts.getAllPersonalPracticePlans.all();
    return rows.map((row) => PersonalPracticeMapper.toEntity(row));
  }

  /**
   * Get personal practice plan by ID
   * @param {number} id - Plan ID
   * @returns {PersonalPractice|null}
   */
  getPersonalPracticePlanById(id) {
    const row = this.stmts.getPersonalPracticePlanById.get(id);
    return PersonalPracticeMapper.toEntity(row);
  }

  /**
   * Get personal practice plan by message ID
   * @param {string} messageId - Discord message ID
   * @returns {PersonalPractice|null}
   */
  getPersonalPracticePlanByMessageId(messageId) {
    const row = this.stmts.getPersonalPracticePlanByMessageId.get(messageId);
    return PersonalPracticeMapper.toEntity(row);
  }

  /**
   * Get all personal practice plans for a user
   * @param {string} userId - Discord user ID
   * @returns {PersonalPractice[]}
   */
  getPersonalPracticePlansByUserId(userId) {
    const rows = this.stmts.getPersonalPracticePlansByUserId.all(userId);
    return rows.map((row) => PersonalPracticeMapper.toEntity(row));
  }

  /**
   * Create a new personal practice plan
   * @param {PersonalPractice} plan - Practice plan entity
   * @returns {PersonalPractice}
   */
  addPersonalPracticePlan(plan) {
    const params = PersonalPracticeMapper.toDbParams(plan);
    const result = this.stmts.insertPersonalPracticePlan.run(params);
    plan.id = result.lastInsertRowid;
    return plan;
  }

  /**
   * Update personal practice plan
   * @param {PersonalPractice} plan - Practice plan entity
   * @returns {boolean}
   */
  updatePersonalPracticePlan(plan) {
    const params = PersonalPracticeMapper.toDbParams(plan);
    this.stmts.updatePersonalPracticePlan.run(params);
    return true;
  }

  /**
   * Delete personal practice plan
   * @param {number} id - Plan ID
   * @returns {PersonalPractice|null}
   */
  deletePersonalPracticePlan(id) {
    const plan = this.getPersonalPracticePlanById(id);
    if (plan) {
      this.stmts.deletePersonalPracticePlan.run(id);
      return plan;
    }
    return null;
  }

  /**
   * Get all check records for a practice plan
   * @param {number} planId - Plan ID
   * @returns {string[]} Array of check dates (YYYY-MM-DD)
   */
  getPersonalPracticeRecords(planId) {
    const rows = this.stmts.getPersonalPracticeRecordsByPlanId.all(planId);
    return rows.map((row) => row.check_date);
  }

  /**
   * Check if a specific date is checked for a plan
   * @param {number} planId - Plan ID
   * @param {string} checkDate - Date to check (YYYY-MM-DD)
   * @returns {boolean}
   */
  hasPersonalPracticeRecord(planId, checkDate) {
    const row = this.stmts.getPersonalPracticeRecord.get(planId, checkDate);
    return !!row;
  }

  /**
   * Add a check record for a practice plan
   * @param {number} planId - Plan ID
   * @param {string} userId - User ID
   * @param {string} checkDate - Date to check (YYYY-MM-DD)
   * @returns {boolean}
   */
  addPersonalPracticeRecord(planId, userId, checkDate) {
    const result = this.stmts.insertPersonalPracticeRecord.run(planId, userId, checkDate);
    return result.changes > 0;
  }

  /**
   * Remove a check record for a practice plan
   * @param {number} planId - Plan ID
   * @param {string} checkDate - Date to uncheck (YYYY-MM-DD)
   * @returns {boolean}
   */
  removePersonalPracticeRecord(planId, checkDate) {
    const result = this.stmts.deletePersonalPracticeRecord.run(planId, checkDate);
    return result.changes > 0;
  }

  // ==================== Sync Operations ====================

  /**
   * Clear message ID for a practice plan
   * @param {number} id - Plan ID
   */
  clearPracticePlanMessageId(id) {
    this.stmts.clearPracticePlanMessageId.run(id);
  }

  /**
   * Clear message ID for quiz publish history
   * @param {number} id - Publish history ID
   */
  clearQuizPublishHistoryMessageId(id) {
    this.stmts.clearQuizPublishHistoryMessageId.run(id);
  }

  /**
   * Get all quiz publish history records
   * @returns {Array} Array of publish history records
   */
  getAllQuizPublishHistory() {
    return this.stmts.getAllQuizPublishHistory.all();
  }

  /**
   * Delete all activity points for a user
   * @param {string} userId - User ID
   * @returns {number} Number of deleted records
   */
  deleteActivityPointsByUserId(userId) {
    const result = this.stmts.deleteActivityPointsByUserId.run(userId);
    return result.changes;
  }

  /**
   * Delete all accumulation logs for a user
   * @param {string} userId - User ID
   * @returns {number} Number of deleted records
   */
  deleteAccumulationLogsByUserId(userId) {
    const result = this.stmts.deleteAccumulationLogsByUserId.run(userId);
    return result.changes;
  }

  /**
   * Delete orphaned quiz publish history records (question_id not in quiz_questions)
   * @returns {number} Number of deleted records
   */
  deleteOrphanQuizPublishHistory() {
    const result = this.stmts.deleteOrphanQuizPublishHistory.run();
    return result.changes;
  }
}

module.exports = SqliteRepository;
