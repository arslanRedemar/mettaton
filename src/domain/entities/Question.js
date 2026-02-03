/**
 * Question Entity
 * Represents a question posted by users in the server.
 * Users can post questions, answer them, and show interest via reactions.
 */
class Question {
  /**
   * Create a Question entity
   * @param {Object} params - Question parameters
   * @param {number} [params.id] - Question ID (auto-generated)
   * @param {string} params.author - Discord user ID of the author
   * @param {string} params.question - Question content
   * @param {string|null} [params.answer=null] - Answer content
   * @param {string|null} [params.answeredBy=null] - Discord user ID of the answerer
   * @param {string[]} [params.attendees=[]] - Array of Discord user IDs who showed interest
   * @param {string|null} [params.messageId=null] - Discord message ID of the embed
   */
  constructor({ id, author, question, answer = null, answeredBy = null, attendees = [], messageId = null }) {
    this.id = id;
    this.author = author;
    this.question = question;
    this.answer = answer;
    this.answeredBy = answeredBy;
    this.attendees = attendees;
    this.messageId = messageId;
  }

  /**
   * Set answer for this question
   * @param {string} answer - Answer content
   * @param {string} answeredBy - Discord user ID of the answerer
   */
  setAnswer(answer, answeredBy) {
    this.answer = answer;
    this.answeredBy = answeredBy;
  }

  /**
   * Check if this question has been answered
   * @returns {boolean} True if answered, false otherwise
   */
  isAnswered() {
    return this.answer !== null;
  }

  /**
   * Add a user to the attendees list (interest indicator)
   * @param {string} userId - Discord user ID
   * @returns {boolean} True if added, false if already exists
   */
  addAttendee(userId) {
    if (!this.attendees.includes(userId)) {
      this.attendees.push(userId);
      return true;
    }
    return false;
  }

  /**
   * Remove a user from the attendees list
   * @param {string} userId - Discord user ID
   * @returns {boolean} True if removed, false if not found
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
   * Check if a user is in the attendees list
   * @param {string} userId - Discord user ID
   * @returns {boolean} True if user is an attendee
   */
  hasAttendee(userId) {
    return this.attendees.includes(userId);
  }

  /**
   * Convert entity to plain JSON object
   * @returns {Object} Plain object representation
   */
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
