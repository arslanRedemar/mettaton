const fs = require('fs');
const Lecture = require('../../domain/entities/Lecture');
const Question = require('../../domain/entities/Question');

class JsonDataRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  load() {
    if (!fs.existsSync(this.filePath)) {
      return { lectures: [], questions: [], meetingCount: 0 };
    }
    return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
  }

  save(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  // Lecture operations
  getAllLectures() {
    const data = this.load();
    return data.lectures.map((l) => new Lecture(l));
  }

  getLectureById(id) {
    const data = this.load();
    const lecture = data.lectures.find((l) => l.id === id);
    return lecture ? new Lecture(lecture) : null;
  }

  addLecture(lecture) {
    const data = this.load();
    const newId = data.lectures.length + 1;
    lecture.id = newId;
    data.lectures.push(lecture.toJSON());
    this.save(data);
    return lecture;
  }

  updateLecture(lecture) {
    const data = this.load();
    const index = data.lectures.findIndex((l) => l.id === lecture.id);
    if (index !== -1) {
      data.lectures[index] = lecture.toJSON();
      this.save(data);
      return true;
    }
    return false;
  }

  deleteLecture(id) {
    const data = this.load();
    const index = data.lectures.findIndex((l) => l.id === id);
    if (index !== -1) {
      const deleted = data.lectures.splice(index, 1)[0];
      this.save(data);
      return new Lecture(deleted);
    }
    return null;
  }

  deleteLectureByMessageId(messageId) {
    const data = this.load();
    const index = data.lectures.findIndex((l) => l.messageId === messageId);
    if (index !== -1) {
      data.lectures.splice(index, 1);
      this.save(data);
      return true;
    }
    return false;
  }

  // Question operations
  getAllQuestions() {
    const data = this.load();
    return data.questions.map((q) => new Question(q));
  }

  getQuestionById(id) {
    const data = this.load();
    const question = data.questions.find((q) => q.id === id);
    return question ? new Question(question) : null;
  }

  addQuestion(question) {
    const data = this.load();
    const newId = data.questions.length + 1;
    question.id = newId;
    data.questions.push(question.toJSON());
    this.save(data);
    return question;
  }

  updateQuestion(question) {
    const data = this.load();
    const index = data.questions.findIndex((q) => q.id === question.id);
    if (index !== -1) {
      data.questions[index] = question.toJSON();
      this.save(data);
      return true;
    }
    return false;
  }

  deleteQuestion(id) {
    const data = this.load();
    const index = data.questions.findIndex((q) => q.id === id);
    if (index !== -1) {
      const deleted = data.questions.splice(index, 1)[0];
      this.save(data);
      return new Question(deleted);
    }
    return null;
  }

  deleteQuestionByMessageId(messageId) {
    const data = this.load();
    const index = data.questions.findIndex((q) => q.messageId === messageId);
    if (index !== -1) {
      data.questions.splice(index, 1);
      this.save(data);
      return true;
    }
    return false;
  }

  // Meeting count
  getMeetingCount() {
    const data = this.load();
    return data.meetingCount || 0;
  }

  incrementMeetingCount() {
    const data = this.load();
    data.meetingCount = (data.meetingCount || 0) + 1;
    this.save(data);
    return data.meetingCount;
  }
}

module.exports = JsonDataRepository;
