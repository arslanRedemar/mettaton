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
  'point.historyTitle': ['user'],
  'point.historyEmpty': [],
  'point.historyTotal': ['total'],
  'point.historyPeriod': ['startDate', 'endDate'],
  'point.historyItem': ['type', 'points', 'percentage'],
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
  // Personal Practice strings
  'personalPractice.registerSuccess': ['planId'],
  'personalPractice.embedTitle': [],
  'personalPractice.embedDescription': ['user', 'content', 'dailyGoal', 'unit', 'startDate', 'endDate', 'completed', 'totalDays', 'percentage'],
  'personalPractice.embedFooter': [],
  'personalPractice.invalidDateFormat': [],
  'personalPractice.endBeforeStart': [],
  'personalPractice.startInPast': [],
  'personalPractice.exceedsMaxDuration': [],
  'personalPractice.graphTitle': ['user', 'content'],
  'personalPractice.graphProgress': ['completed', 'totalDays', 'percentage'],
  'personalPractice.graphError': [],
  'personalPractice.editSuccess': ['planId'],
  'personalPractice.deleteSuccess': ['planId'],
  'personalPractice.deleteMessageFail': [],
  'personalPractice.checkSuccess': ['content', 'completed', 'totalDays', 'percentage'],
  'personalPractice.alreadyChecked': ['content'],
  'personalPractice.outsidePeriod': ['startDate', 'endDate'],
  'personalPractice.notOwner': [],
  'personalPractice.notFound': [],
  'personalPractice.alreadyEnded': [],
  // Quiz controller strings
  'quiz.registerSuccess': ['id', 'category'],
  'quiz.registerDuplicate': [],
  'quiz.registerInvalidAnswer': [],
  'quiz.registerCategoryNotFound': ['category'],
  'quiz.bulkSuccess': ['count', 'failCount'],
  'quiz.bulkFormatError': [],
  'quiz.bulkEmpty': [],
  'quiz.listTitle': ['total'],
  'quiz.listItem': ['id', 'category', 'questionPreview', 'status'],
  'quiz.listStatusPublished': [],
  'quiz.listStatusPending': [],
  'quiz.listEmpty': [],
  'quiz.statsTitle': [],
  'quiz.statsItem': ['id', 'category', 'participants', 'correctRate'],
  'quiz.statsEmpty': [],
  'quiz.statusTitle': [],
  'quiz.statusInfo': ['total', 'remaining', 'published', 'quizTime', 'explanationTime', 'channelId'],
  'quiz.statusToday': ['id', 'category'],
  'quiz.statusNoToday': [],
  'quiz.editSuccess': ['id'],
  'quiz.editNotFound': ['id'],
  'quiz.editAlreadyPublished': [],
  'quiz.configTimeSet': ['quizTime', 'explanationTime'],
  'quiz.configChannelSet': ['channelId'],
  'quiz.configEnabled': [],
  'quiz.configDisabled': [],
  'quiz.configCategoryAdded': ['category'],
  'quiz.configCategoryRemoved': ['category'],
  'quiz.configCategoryList': ['categories'],
  'quiz.configCategoryInUse': ['category', 'count'],
  'quiz.configInvalidTime': [],
  'quiz.deleteConfirm': ['id'],
  'quiz.deleteSuccess': ['id'],
  'quiz.deleteNotFound': ['id'],
  'quiz.deleteCancelled': [],
  'quiz.resetConfirm': [],
  'quiz.resetSuccess': ['count'],
  'quiz.resetCancelled': [],
  'quiz.resetTimeout': [],
  'quiz.answerSuccess': ['option'],
  'quiz.answerUpdated': ['option'],
  'quiz.answerNoQuiz': [],
  'quiz.answerClosed': [],
  'quiz.answerInvalid': [],
  'quiz.myAnswerTitle': [],
  'quiz.myAnswerInfo': ['option', 'submittedAt'],
  'quiz.myAnswerNone': [],
  'quiz.myAnswerNoQuiz': [],
  'quiz.publishTitle': ['id'],
  'quiz.publishCategory': ['category'],
  'quiz.publishQuestion': ['question'],
  'quiz.publishOption': ['num', 'option'],
  'quiz.publishFooter': ['explanationTime'],
  'quiz.publishAllUsed': [],
  'quiz.publishNoQuestions': [],
  'quiz.explanationTitle': ['id'],
  'quiz.explanationAnswer': ['answer'],
  'quiz.explanationBody': ['explanation'],
  'quiz.explanationStats': ['participants', 'correctRate'],
  'quiz.explanationPoints': ['participantCount', 'correctCount'],
  'quiz.noPermission': [],
  'quiz.channelNotSet': [],
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
