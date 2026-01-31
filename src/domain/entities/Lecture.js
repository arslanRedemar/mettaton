class Lecture {
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

  addAttendee(userId) {
    if (!this.attendees.includes(userId)) {
      this.attendees.push(userId);
      return true;
    }
    return false;
  }

  removeAttendee(userId) {
    const index = this.attendees.indexOf(userId);
    if (index !== -1) {
      this.attendees.splice(index, 1);
      return true;
    }
    return false;
  }

  hasAttendee(userId) {
    return this.attendees.includes(userId);
  }

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
