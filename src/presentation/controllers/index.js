const scheduleRegister = require('./schedule/register');
const scheduleDelete = require('./schedule/delete');
const scheduleList = require('./schedule/list');

const questionRegister = require('./question/register');
const questionDelete = require('./question/delete');
const questionList = require('./question/list');
const questionAnswer = require('./question/answer');

const meetingConfig = require('./meeting/config');
const stringConfig = require('./string/config');

const inactiveList = require('./inactive/list');
const inactiveKick = require('./inactive/kick');
const inactiveConfig = require('./inactive/config');
const inactiveConfigView = require('./inactive/configView');

const syncSync = require('./sync/sync');

const pointMyPoints = require('./point/myPoints');
const pointHistory = require('./point/history');
const pointRanking = require('./point/ranking');
const pointConfig = require('./point/config');

const personalPractice = require('./personal-practice');

const quizRegister = require('./quiz');
const quizBulkRegister = require('./quiz/bulkRegister');
const quizList = require('./quiz/list');
const quizStats = require('./quiz/stats');
const quizStatus = require('./quiz/status');
const quizConfig = require('./quiz/config');
const quizDelete = require('./quiz/delete');
const quizReset = require('./quiz/reset');
const quizAnswer = require('./quiz/answer');
const quizMyAnswer = require('./quiz/myAnswer');

const commands = [
  scheduleRegister,
  scheduleDelete,
  scheduleList,
  questionRegister,
  questionDelete,
  questionList,
  questionAnswer,
  meetingConfig,
  stringConfig,
  inactiveList,
  inactiveKick,
  inactiveConfig,
  inactiveConfigView,
  syncSync,
  pointMyPoints,
  pointHistory,
  pointRanking,
  pointConfig,
  personalPractice,
  quizRegister,
  quizBulkRegister,
  quizList,
  quizStats,
  quizStatus,
  quizConfig,
  quizDelete,
  quizReset,
  quizAnswer,
  quizMyAnswer,
];

module.exports = commands;
