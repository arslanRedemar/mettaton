const { getDatabase } = require('../datasource/database');
const { LectureMapper, QuestionMapper, ActivityPointMapper } = require('../mappers');

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
    return this.stmts.getAllMemberActivities.all();
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

  getMeetingConfig() {
    const row = this.stmts.getMeetingConfig.get();
    if (!row) return null;
    return {
      channelId: row.channel_id,
      scheduleHour: row.schedule_hour,
      scheduleMinute: row.schedule_minute,
      meetingStartTime: row.meeting_start_time,
      meetingEndTime: row.meeting_end_time,
      location: row.location,
      activity: row.activity,
      enabled: row.enabled === 1,
    };
  }

  setMeetingConfig(config) {
    this.stmts.upsertMeetingConfig.run({
      channelId: config.channelId,
      scheduleHour: config.scheduleHour,
      scheduleMinute: config.scheduleMinute,
      meetingStartTime: config.meetingStartTime,
      meetingEndTime: config.meetingEndTime,
      location: config.location,
      activity: config.activity,
      enabled: config.enabled ? 1 : 0,
    });
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
}

module.exports = SqliteRepository;
