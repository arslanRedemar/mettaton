/**
 * Lecture Entity (Legacy name for Schedule)
 * Represents a scheduled lecture/event with attendee management
 * Note: This is the original entity name. Use Schedule entity for new code.
 */
class Lecture {
  /**
   * Create a Lecture instance
   * @param {Object} params - Lecture parameters
   * @param {number} [params.id] - Lecture ID (auto-assigned on creation)
   * @param {string} params.title - Lecture title
   * @param {string} params.date - Lecture date (YYYY-MM-DD format)
   * @param {string} params.start - Start time (HH:MM format, 24-hour)
   * @param {string} params.end - End time (HH:MM format, 24-hour)
   * @param {string} params.location - Event location
   * @param {string} params.teacher - Lecturer/organizer name
   * @param {string[]} [params.attendees=[]] - Array of Discord user IDs
   * @param {string|null} [params.messageId=null] - Discord message ID for the lecture embed
   */
  constructor({ id, title, date, start, end, location, teacher, attendees = [], messageId = null }) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.start = start;
    this.end = end;
    this.location = location;
    this.teacher = teacher;
    this.attendees = attendees;
    this.messageId = messageId;
  }

  /**
   * Add an attendee to the lecture
   * @param {string} userId - Discord user ID
   * @returns {boolean} True if attendee was added, false if already attending
   */
  addAttendee(userId) {
    if (!this.attendees.includes(userId)) {
      this.attendees.push(userId);
      return true;
    }
    return false;
  }

  /**
   * Remove an attendee from the lecture
   * @param {string} userId - Discord user ID
   * @returns {boolean} True if attendee was removed, false if not attending
   */
  removeAttendee(userId) {
    const index = this.attendees.indexOf(userId);
    if (index !== -1) {
      this.attendees.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Check if a user is attending
   * @param {string} userId - Discord user ID
   * @returns {boolean} True if user is attending
   */
  hasAttendee(userId) {
    return this.attendees.includes(userId);
  }

  /**
   * Convert entity to JSON representation
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      date: this.date,
      start: this.start,
      end: this.end,
      location: this.location,
      teacher: this.teacher,
      attendees: this.attendees,
      messageId: this.messageId,
    };
  }
}

module.exports = Lecture;
