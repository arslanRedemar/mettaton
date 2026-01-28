class Question {
  constructor({ id, author, question, answer = null, answeredBy = null, messageId = null }) {
    this.id = id;
    this.author = author;
    this.question = question;
    this.answer = answer;
    this.answeredBy = answeredBy;
    this.messageId = messageId;
  }

  setAnswer(answer, answeredBy) {
    this.answer = answer;
    this.answeredBy = answeredBy;
  }

  isAnswered() {
    return this.answer !== null;
  }

  toJSON() {
    return {
      id: this.id,
      author: this.author,
      question: this.question,
      answer: this.answer,
      answeredBy: this.answeredBy,
      messageId: this.messageId,
    };
  }
}

module.exports = Question;
