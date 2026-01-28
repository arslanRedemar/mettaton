const Lecture = require('../../../src/domain/entities/Lecture');

describe('Lecture Entity', () => {
  let lecture;

  beforeEach(() => {
    lecture = new Lecture({
      id: 1,
      title: '테스트 강의',
      date: '2025-01-28',
      start: '10:00',
      end: '12:00',
      location: '온라인',
      teacher: '홍길동',
      attendees: [],
      messageId: null,
    });
  });

  describe('constructor', () => {
    it('should create a lecture with all properties', () => {
      expect(lecture.id).toBe(1);
      expect(lecture.title).toBe('테스트 강의');
      expect(lecture.date).toBe('2025-01-28');
      expect(lecture.start).toBe('10:00');
      expect(lecture.end).toBe('12:00');
      expect(lecture.location).toBe('온라인');
      expect(lecture.teacher).toBe('홍길동');
      expect(lecture.attendees).toEqual([]);
      expect(lecture.messageId).toBeNull();
    });

    it('should use default values for optional properties', () => {
      const minimalLecture = new Lecture({
        title: '최소 강의',
        date: '2025-01-28',
        start: '10:00',
        end: '12:00',
        location: '오프라인',
        teacher: '김철수',
      });

      expect(minimalLecture.attendees).toEqual([]);
      expect(minimalLecture.messageId).toBeNull();
    });
  });

  describe('addAttendee', () => {
    it('should add a new attendee', () => {
      const result = lecture.addAttendee('user123');

      expect(result).toBe(true);
      expect(lecture.attendees).toContain('user123');
    });

    it('should not add duplicate attendee', () => {
      lecture.addAttendee('user123');
      const result = lecture.addAttendee('user123');

      expect(result).toBe(false);
      expect(lecture.attendees.length).toBe(1);
    });

    it('should add multiple different attendees', () => {
      lecture.addAttendee('user1');
      lecture.addAttendee('user2');
      lecture.addAttendee('user3');

      expect(lecture.attendees.length).toBe(3);
      expect(lecture.attendees).toEqual(['user1', 'user2', 'user3']);
    });
  });

  describe('removeAttendee', () => {
    beforeEach(() => {
      lecture.addAttendee('user1');
      lecture.addAttendee('user2');
    });

    it('should remove an existing attendee', () => {
      const result = lecture.removeAttendee('user1');

      expect(result).toBe(true);
      expect(lecture.attendees).not.toContain('user1');
      expect(lecture.attendees).toContain('user2');
    });

    it('should return false when removing non-existent attendee', () => {
      const result = lecture.removeAttendee('user999');

      expect(result).toBe(false);
      expect(lecture.attendees.length).toBe(2);
    });
  });

  describe('hasAttendee', () => {
    beforeEach(() => {
      lecture.addAttendee('user123');
    });

    it('should return true for existing attendee', () => {
      expect(lecture.hasAttendee('user123')).toBe(true);
    });

    it('should return false for non-existent attendee', () => {
      expect(lecture.hasAttendee('user999')).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      lecture.addAttendee('user1');
      lecture.messageId = 'msg123';

      const json = lecture.toJSON();

      expect(json).toEqual({
        id: 1,
        title: '테스트 강의',
        date: '2025-01-28',
        start: '10:00',
        end: '12:00',
        location: '온라인',
        teacher: '홍길동',
        attendees: ['user1'],
        messageId: 'msg123',
      });
    });
  });
});
