const container = require('../../../core/di/container');

const PARAM_MAP = {
  // Interface strings
  'ready.loginSuccess': ['tag'],
  'guildMemberAdd.welcome': ['memberId'],
  'interactionCreate.commandNotFound': ['name'],
  'interactionCreate.commandError': ['name'],
  // Schedule controller strings
  'schedule.embedTitle': ['id', 'title'],
  'schedule.embedDescription': ['location', 'date', 'start', 'end', 'teacher', 'attendeeInfo'],
  'schedule.deleteNotFound': ['id'],
  'schedule.deleteSuccess': ['title'],
  'schedule.listFieldValue': ['date', 'start', 'end', 'location', 'teacher', 'attendeeInfo'],
  'schedule.attendSuccess': ['id'],
  'schedule.cancelSuccess': ['title'],
  // Question controller strings
  'question.channelMessage': ['id', 'question', 'author'],
  'question.channelMessageAnswered': ['id', 'question', 'author', 'answer', 'answeredBy'],
  'question.embedTitle': ['id'],
  'question.embedDescription': ['question', 'author', 'attendeeInfo'],
  'question.embedDescriptionAnswered': ['question', 'author', 'answer', 'answeredBy', 'attendeeInfo'],
  'question.deleteNotFound': ['id'],
  'question.deleteSuccess': ['id'],
  'question.listFieldValue': ['author', 'status', 'attendeeInfo'],
  'question.answerSuccess': ['id'],
  // Meeting controller strings
  'meeting.configSaved': ['channel', 'scheduleTime', 'startTime', 'endTime', 'location', 'activity', 'status'],
  'meeting.configDisplay': ['channel', 'scheduleTime', 'startTime', 'endTime', 'location', 'activity', 'status'],
  // Inactive member management strings
  'inactive.listHeader': ['days', 'count'],
  'inactive.listItem': ['memberId', 'lastActive'],
  'inactive.kickConfirm': ['count'],
  'inactive.kickProgress': ['current', 'total'],
  'inactive.kickSuccess': ['count'],
  'inactive.kickPartialFail': ['success', 'fail'],
  'inactive.configSaved': ['days'],
  'inactive.configDisplay': ['days'],
  // Sync command strings
  'sync.complete': ['membersAdded', 'membersRemoved', 'attendeesRemoved', 'lectureMessagesCleaned', 'questionMessagesCleaned'],
  'sync.error': ['error'],
  // Point controller strings
  'point.myPoints': ['points'],
  'point.noPoints': [],
  'point.rankingTitle': [],
  'point.rankingItem': ['rank', 'memberId', 'points'],
  'point.rankingEmpty': [],
  'point.configSaved': ['pointsPerAction', 'cooldownMinutes'],
  'point.configDisplay': ['pointsPerAction', 'cooldownMinutes'],
  'point.adjustSuccess': ['memberId', 'amount', 'newPoints'],
  'point.setSuccess': ['memberId', 'newPoints'],
  'point.resetUserConfirm': ['memberId'],
  'point.resetUserSuccess': ['memberId'],
  'point.resetAllConfirm': [],
  'point.resetAllSuccess': [],
  'point.resetCancelled': [],
  'point.resetTimeout': [],
  'point.userNotFound': ['memberId'],
};

function getStringService() {
  return container.resolve('stringService');
}

const handler = {
  get(_target, category) {
    return new Proxy({}, {
      get(_inner, name) {
        const key = `${category}.${name}`;
        const paramNames = PARAM_MAP[key];

        if (paramNames && paramNames.length > 0) {
          return (...args) => {
            const replacements = {};
            paramNames.forEach((pName, i) => {
              replacements[pName] = args[i];
            });
            return getStringService().get(key, replacements);
          };
        }
        return getStringService().get(key);
      },
    });
  },
};

module.exports = new Proxy({}, handler);
