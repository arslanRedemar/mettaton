const path = require('path');
const fs = require('fs');
const { initializeDatabase, closeDatabase } = require('../../../../src/data/datasource/database');
const { SqliteRepository } = require('../../../../src/data/repositories');
const Lecture = require('../../../../src/domain/entities/Lecture');
const Question = require('../../../../src/domain/entities/Question');

describe('SqliteRepository', () => {
  let repository;
  const testDbPath = path.join(__dirname, 'test.db');

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
    // Clear tables before each test
    const db = require('../../../../src/data/datasource/database').getDatabase();
    db.exec('DELETE FROM lecture_attendees');
    db.exec('DELETE FROM lectures');
    db.exec('DELETE FROM questions');
    db.exec('DELETE FROM member_activity');
    db.exec("UPDATE settings SET value = '0' WHERE key = 'meeting_count'");
    db.exec("UPDATE settings SET value = '90' WHERE key = 'inactive_days'");
  });

  describe('Lecture Operations', () => {
    describe('addLecture', () => {
      it('should add a new lecture and return it with id', () => {
        const lecture = new Lecture({
          title: '테스트 강의',
          date: '2025-01-28',
          start: '10:00',
          end: '12:00',
          location: '온라인',
          teacher: '홍길동',
        });

        const result = repository.addLecture(lecture);

        expect(result.id).toBeDefined();
        expect(result.id).toBeGreaterThan(0);
        expect(result.title).toBe('테스트 강의');
      });
    });

    describe('getLectureById', () => {
      it('should return lecture by id', () => {
        const lecture = new Lecture({
          title: '조회 테스트',
          date: '2025-01-28',
          start: '14:00',
          end: '16:00',
          location: '강의실 A',
          teacher: '김철수',
        });
        const added = repository.addLecture(lecture);

        const result = repository.getLectureById(added.id);

        expect(result).not.toBeNull();
        expect(result.title).toBe('조회 테스트');
        expect(result.teacher).toBe('김철수');
      });

      it('should return null for non-existent id', () => {
        const result = repository.getLectureById(99999);

        expect(result).toBeNull();
      });
    });

    describe('getAllLectures', () => {
      it('should return empty array when no lectures', () => {
        const result = repository.getAllLectures();

        expect(result).toEqual([]);
      });

      it('should return all lectures', () => {
        repository.addLecture(
          new Lecture({
            title: '강의 1',
            date: '2025-01-28',
            start: '10:00',
            end: '12:00',
            location: '온라인',
            teacher: '교사 1',
          })
        );
        repository.addLecture(
          new Lecture({
            title: '강의 2',
            date: '2025-01-29',
            start: '14:00',
            end: '16:00',
            location: '오프라인',
            teacher: '교사 2',
          })
        );

        const result = repository.getAllLectures();

        expect(result.length).toBe(2);
      });
    });

    describe('updateLecture', () => {
      it('should update lecture properties', () => {
        const lecture = repository.addLecture(
          new Lecture({
            title: '원래 제목',
            date: '2025-01-28',
            start: '10:00',
            end: '12:00',
            location: '온라인',
            teacher: '홍길동',
          })
        );

        lecture.title = '수정된 제목';
        lecture.location = '오프라인';
        repository.updateLecture(lecture);

        const updated = repository.getLectureById(lecture.id);
        expect(updated.title).toBe('수정된 제목');
        expect(updated.location).toBe('오프라인');
      });

      it('should update attendees', () => {
        const lecture = repository.addLecture(
          new Lecture({
            title: '참석자 테스트',
            date: '2025-01-28',
            start: '10:00',
            end: '12:00',
            location: '온라인',
            teacher: '홍길동',
          })
        );

        lecture.addAttendee('user1');
        lecture.addAttendee('user2');
        repository.updateLecture(lecture);

        const updated = repository.getLectureById(lecture.id);
        expect(updated.attendees).toContain('user1');
        expect(updated.attendees).toContain('user2');
        expect(updated.attendees.length).toBe(2);
      });

      it('should remove attendees when updated', () => {
        const lecture = repository.addLecture(
          new Lecture({
            title: '참석자 삭제 테스트',
            date: '2025-01-28',
            start: '10:00',
            end: '12:00',
            location: '온라인',
            teacher: '홍길동',
          })
        );

        lecture.addAttendee('user1');
        lecture.addAttendee('user2');
        repository.updateLecture(lecture);

        lecture.removeAttendee('user1');
        repository.updateLecture(lecture);

        const updated = repository.getLectureById(lecture.id);
        expect(updated.attendees).not.toContain('user1');
        expect(updated.attendees).toContain('user2');
        expect(updated.attendees.length).toBe(1);
      });
    });

    describe('deleteLecture', () => {
      it('should delete lecture and return it', () => {
        const lecture = repository.addLecture(
          new Lecture({
            title: '삭제할 강의',
            date: '2025-01-28',
            start: '10:00',
            end: '12:00',
            location: '온라인',
            teacher: '홍길동',
          })
        );

        const deleted = repository.deleteLecture(lecture.id);

        expect(deleted).not.toBeNull();
        expect(deleted.title).toBe('삭제할 강의');
        expect(repository.getLectureById(lecture.id)).toBeNull();
      });

      it('should return null when deleting non-existent lecture', () => {
        const deleted = repository.deleteLecture(99999);

        expect(deleted).toBeNull();
      });
    });

    describe('deleteLectureByMessageId', () => {
      it('should delete lecture by message id', () => {
        const lecture = repository.addLecture(
          new Lecture({
            title: '메시지 ID 테스트',
            date: '2025-01-28',
            start: '10:00',
            end: '12:00',
            location: '온라인',
            teacher: '홍길동',
            messageId: 'msg123',
          })
        );

        const result = repository.deleteLectureByMessageId('msg123');

        expect(result).toBe(true);
        expect(repository.getLectureById(lecture.id)).toBeNull();
      });

      it('should return false for non-existent message id', () => {
        const result = repository.deleteLectureByMessageId('nonexistent');

        expect(result).toBe(false);
      });
    });
  });

  describe('Question Operations', () => {
    describe('addQuestion', () => {
      it('should add a new question and return it with id', () => {
        const question = new Question({
          author: 'user123',
          question: '테스트 질문입니다.',
        });

        const result = repository.addQuestion(question);

        expect(result.id).toBeDefined();
        expect(result.id).toBeGreaterThan(0);
        expect(result.question).toBe('테스트 질문입니다.');
      });
    });

    describe('getQuestionById', () => {
      it('should return question by id', () => {
        const question = new Question({
          author: 'user123',
          question: '조회 테스트 질문',
        });
        const added = repository.addQuestion(question);

        const result = repository.getQuestionById(added.id);

        expect(result).not.toBeNull();
        expect(result.question).toBe('조회 테스트 질문');
        expect(result.author).toBe('user123');
      });

      it('should return null for non-existent id', () => {
        const result = repository.getQuestionById(99999);

        expect(result).toBeNull();
      });
    });

    describe('getAllQuestions', () => {
      it('should return empty array when no questions', () => {
        const result = repository.getAllQuestions();

        expect(result).toEqual([]);
      });

      it('should return all questions', () => {
        repository.addQuestion(new Question({ author: 'user1', question: '질문 1' }));
        repository.addQuestion(new Question({ author: 'user2', question: '질문 2' }));

        const result = repository.getAllQuestions();

        expect(result.length).toBe(2);
      });
    });

    describe('updateQuestion', () => {
      it('should update question with answer', () => {
        const question = repository.addQuestion(
          new Question({
            author: 'user123',
            question: '답변 대기 질문',
          })
        );

        question.setAnswer('이것이 답변입니다.', 'admin456');
        repository.updateQuestion(question);

        const updated = repository.getQuestionById(question.id);
        expect(updated.answer).toBe('이것이 답변입니다.');
        expect(updated.answeredBy).toBe('admin456');
        expect(updated.isAnswered()).toBe(true);
      });
    });

    describe('deleteQuestion', () => {
      it('should delete question and return it', () => {
        const question = repository.addQuestion(
          new Question({
            author: 'user123',
            question: '삭제할 질문',
          })
        );

        const deleted = repository.deleteQuestion(question.id);

        expect(deleted).not.toBeNull();
        expect(deleted.question).toBe('삭제할 질문');
        expect(repository.getQuestionById(question.id)).toBeNull();
      });

      it('should return null when deleting non-existent question', () => {
        const deleted = repository.deleteQuestion(99999);

        expect(deleted).toBeNull();
      });
    });

    describe('deleteQuestionByMessageId', () => {
      it('should delete question by message id', () => {
        const question = repository.addQuestion(
          new Question({
            author: 'user123',
            question: '메시지 ID 테스트',
            messageId: 'qmsg123',
          })
        );

        const result = repository.deleteQuestionByMessageId('qmsg123');

        expect(result).toBe(true);
        expect(repository.getQuestionById(question.id)).toBeNull();
      });

      it('should return false for non-existent message id', () => {
        const result = repository.deleteQuestionByMessageId('nonexistent');

        expect(result).toBe(false);
      });
    });
  });

  describe('Member Activity Operations', () => {
    describe('updateMemberActivity', () => {
      it('should insert new member activity', () => {
        repository.updateMemberActivity('user123');

        const activities = repository.getAllMemberActivities();
        expect(activities.length).toBe(1);
        expect(activities[0].user_id).toBe('user123');
        expect(activities[0].last_active_at).toBeDefined();
      });

      it('should update existing member activity', () => {
        repository.updateMemberActivity('user123');
        const before = repository.getAllMemberActivities();

        repository.updateMemberActivity('user123');
        const after = repository.getAllMemberActivities();

        expect(after.length).toBe(1);
        expect(after[0].user_id).toBe('user123');
      });

      it('should track multiple members independently', () => {
        repository.updateMemberActivity('user1');
        repository.updateMemberActivity('user2');
        repository.updateMemberActivity('user3');

        const activities = repository.getAllMemberActivities();
        expect(activities.length).toBe(3);
        const userIds = activities.map((a) => a.user_id).sort();
        expect(userIds).toEqual(['user1', 'user2', 'user3']);
      });
    });

    describe('getAllMemberActivities', () => {
      it('should return empty array when no activities', () => {
        const activities = repository.getAllMemberActivities();
        expect(activities).toEqual([]);
      });
    });

    describe('getInactiveDays', () => {
      it('should return default 90 days', () => {
        const days = repository.getInactiveDays();
        expect(days).toBe(90);
      });
    });

    describe('setInactiveDays', () => {
      it('should update inactive days setting', () => {
        repository.setInactiveDays(30);
        expect(repository.getInactiveDays()).toBe(30);
      });

      it('should persist the setting', () => {
        repository.setInactiveDays(180);
        const days = repository.getInactiveDays();
        expect(days).toBe(180);
      });
    });
  });

  describe('Sync Operations', () => {
    describe('insertMemberActivityIfMissing', () => {
      it('should insert when missing and return true', () => {
        const inserted = repository.insertMemberActivityIfMissing('newUser');

        expect(inserted).toBe(true);
        const activities = repository.getAllMemberActivities();
        expect(activities.some((a) => a.user_id === 'newUser')).toBe(true);
      });

      it('should not overwrite existing and return false', () => {
        repository.updateMemberActivity('existingUser');
        const inserted = repository.insertMemberActivityIfMissing('existingUser');

        expect(inserted).toBe(false);
        const activities = repository.getAllMemberActivities();
        expect(activities.filter((a) => a.user_id === 'existingUser').length).toBe(1);
      });
    });

    describe('deleteMemberActivity', () => {
      it('should remove member activity record', () => {
        repository.updateMemberActivity('userToDelete');
        expect(repository.getAllMemberActivities().length).toBe(1);

        repository.deleteMemberActivity('userToDelete');

        expect(repository.getAllMemberActivities().length).toBe(0);
      });
    });

    describe('removeAttendee', () => {
      it('should remove a single attendee from a lecture', () => {
        const lecture = repository.addLecture(
          new Lecture({
            title: 'Attendee removal test',
            date: '2025-01-28',
            start: '10:00',
            end: '12:00',
            location: 'Online',
            teacher: 'Teacher',
          })
        );
        lecture.addAttendee('user1');
        lecture.addAttendee('user2');
        repository.updateLecture(lecture);

        repository.removeAttendee(lecture.id, 'user1');

        const updated = repository.getLectureById(lecture.id);
        expect(updated.attendees).not.toContain('user1');
        expect(updated.attendees).toContain('user2');
      });
    });

    describe('clearLectureMessageId', () => {
      it('should set lecture message_id to null', () => {
        const lecture = repository.addLecture(
          new Lecture({
            title: 'Message ID clear test',
            date: '2025-01-28',
            start: '10:00',
            end: '12:00',
            location: 'Online',
            teacher: 'Teacher',
            messageId: 'msg456',
          })
        );

        repository.clearLectureMessageId(lecture.id);

        const updated = repository.getLectureById(lecture.id);
        expect(updated.messageId).toBeNull();
      });
    });

    describe('clearQuestionMessageId', () => {
      it('should set question message_id to null', () => {
        const question = repository.addQuestion(
          new Question({
            author: 'user123',
            question: 'Message ID clear test',
            messageId: 'qmsg456',
          })
        );

        repository.clearQuestionMessageId(question.id);

        const updated = repository.getQuestionById(question.id);
        expect(updated.messageId).toBeNull();
      });
    });
  });

  describe('Settings Operations', () => {
    describe('getMeetingCount', () => {
      it('should return 0 initially', () => {
        const count = repository.getMeetingCount();

        expect(count).toBe(0);
      });
    });

    describe('incrementMeetingCount', () => {
      it('should increment meeting count', () => {
        const count1 = repository.incrementMeetingCount();
        const count2 = repository.incrementMeetingCount();
        const count3 = repository.incrementMeetingCount();

        expect(count1).toBe(1);
        expect(count2).toBe(2);
        expect(count3).toBe(3);
      });

      it('should persist meeting count', () => {
        repository.incrementMeetingCount();
        repository.incrementMeetingCount();

        const count = repository.getMeetingCount();

        expect(count).toBe(2);
      });
    });
  });
});
