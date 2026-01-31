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
const pointRanking = require('./point/ranking');
const pointConfig = require('./point/config');

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
  pointRanking,
  pointConfig,
];

module.exports = commands;
