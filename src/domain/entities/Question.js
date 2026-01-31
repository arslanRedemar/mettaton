class Question {
  constructor({ id, author, question, answer = null, answeredBy = null, attendees = [], messageId = null }) {
    this.id = id;
    this.author = author;
    this.question = question;
    this.answer = answer;
    this.answeredBy = answeredBy;
    this.attendees = attendees;
    this.messageId = messageId;
  }

  setAnswer(answer, answeredBy) {
    this.answer = answer;
    this.answeredBy = answeredBy;
  }

  isAnswered() {
    return this.answer !== null;
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
      author: this.author,
      question: this.question,
      answer: this.answer,
      answeredBy: this.answeredBy,
      attendees: this.attendees,
      messageId: this.messageId,
    };
  }
}

module.exports = Question;
