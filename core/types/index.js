/**
 * 공통 타입 정의 (JSDoc 기반)
 */

/**
 * @typedef {Object} LectureData
 * @property {number} [id]
 * @property {string} title
 * @property {string} date
 * @property {string} start
 * @property {string} end
 * @property {string} location
 * @property {string} teacher
 * @property {string[]} [attendees]
 * @property {string} [messageId]
 */

/**
 * @typedef {Object} QuestionData
 * @property {number} [id]
 * @property {string} author
 * @property {string} question
 * @property {string} [answer]
 * @property {string} [answeredBy]
 * @property {string} [messageId]
 */

/**
 * @typedef {Object} MeetingConfig
 * @property {string} channelId
 * @property {number} scheduleHour
 * @property {number} scheduleMinute
 * @property {string} meetingStartTime
 * @property {string} meetingEndTime
 * @property {string} location
 * @property {string} activity
 * @property {boolean} enabled
 */

module.exports = {
  ActivityType: require('./ActivityType'),
};
