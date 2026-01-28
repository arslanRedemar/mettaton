const { getDatabase } = require('./database');
const Lecture = require('../../domain/entities/Lecture');
const Question = require('../../domain/entities/Question');

class SqliteRepository {
  constructor() {
    this.db = null;
  }

  init() {
    this.db = getDatabase();
    this._prepareStatements();
  }

  _prepareStatements() {
    // Lecture statements
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

      // Settings
      getSetting: this.db.prepare(`
        SELECT value FROM settings WHERE key = ?
      `),
      setSetting: this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
      `),
    };
  }

  // ==================== Lecture Operations ====================

  _rowToLecture(row) {
    if (!row) return null;
    const attendees = this.stmts.getAttendees.all(row.id).map((a) => a.user_id);
    return new Lecture({
      id: row.id,
      title: row.title,
      date: row.date,
      start: row.start,
      end: row.end,
      location: row.location,
      teacher: row.teacher,
      attendees,
      messageId: row.message_id,
    });
  }

  getAllLectures() {
    const rows = this.stmts.getAllLectures.all();
    return rows.map((row) => this._rowToLecture(row));
  }

  getLectureById(id) {
    const row = this.stmts.getLectureById.get(id);
    return this._rowToLecture(row);
  }

  addLecture(lecture) {
    const result = this.stmts.insertLecture.run({
      title: lecture.title,
      date: lecture.date,
      start: lecture.start,
      end: lecture.end,
      location: lecture.location,
      teacher: lecture.teacher,
      messageId: lecture.messageId,
    });
    lecture.id = result.lastInsertRowid;
    return lecture;
  }

  updateLecture(lecture) {
    // Update lecture info
    this.stmts.updateLecture.run({
      id: lecture.id,
      title: lecture.title,
      date: lecture.date,
      start: lecture.start,
      end: lecture.end,
      location: lecture.location,
      teacher: lecture.teacher,
      messageId: lecture.messageId,
    });

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

  // ==================== Question Operations ====================

  _rowToQuestion(row) {
    if (!row) return null;
    return new Question({
      id: row.id,
      author: row.author,
      question: row.question,
      answer: row.answer,
      answeredBy: row.answered_by,
      messageId: row.message_id,
    });
  }

  getAllQuestions() {
    const rows = this.stmts.getAllQuestions.all();
    return rows.map((row) => this._rowToQuestion(row));
  }

  getQuestionById(id) {
    const row = this.stmts.getQuestionById.get(id);
    return this._rowToQuestion(row);
  }

  addQuestion(question) {
    const result = this.stmts.insertQuestion.run({
      author: question.author,
      question: question.question,
      answer: question.answer,
      answeredBy: question.answeredBy,
      messageId: question.messageId,
    });
    question.id = result.lastInsertRowid;
    return question;
  }

  updateQuestion(question) {
    this.stmts.updateQuestion.run({
      id: question.id,
      question: question.question,
      answer: question.answer,
      answeredBy: question.answeredBy,
      messageId: question.messageId,
    });
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
}

module.exports = SqliteRepository;
