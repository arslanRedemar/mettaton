const lectureRegister = require('./lecture/register');
const lectureDelete = require('./lecture/delete');
const lectureList = require('./lecture/list');
const lectureAttend = require('./lecture/attend');
const lectureCancelAttend = require('./lecture/cancelAttend');

const questionRegister = require('./question/register');
const questionDelete = require('./question/delete');
const questionList = require('./question/list');
const questionAnswer = require('./question/answer');

const meetingConfig = require('./meeting/config');

const commands = [
  lectureRegister,
  lectureDelete,
  lectureList,
  lectureAttend,
  lectureCancelAttend,
  questionRegister,
  questionDelete,
  questionList,
  questionAnswer,
  meetingConfig,
];

module.exports = commands;
