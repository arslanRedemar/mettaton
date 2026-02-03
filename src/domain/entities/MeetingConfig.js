/**
 * MeetingConfig Entity
 * Represents configuration for meeting scheduler (수행 모임 스케줄러)
 */
class MeetingConfig {
  /**
   * @param {Object} params
   * @param {number} [params.id=1] - Config ID (singleton)
   * @param {string} params.channelId - Discord channel ID for meeting announcements
   * @param {number} params.scheduleHour - Notification hour (0-23)
   * @param {number} params.scheduleMinute - Notification minute (0-59)
   * @param {string} params.meetingStartTime - Meeting start time (HH:MM format)
   * @param {string} params.meetingEndTime - Meeting end time (HH:MM format)
   * @param {string} params.location - Meeting location
   * @param {string} params.activity - Meeting activity description
   * @param {boolean} [params.enabled=false] - Whether meeting scheduler is enabled
   * @param {string} [params.updatedAt] - Last update timestamp
   */
  constructor({
    id = 1,
    channelId,
    scheduleHour,
    scheduleMinute,
    meetingStartTime,
    meetingEndTime,
    location,
    activity,
    enabled = false,
    updatedAt,
  }) {
    this.id = id;
    this.channelId = channelId;
    this.scheduleHour = scheduleHour;
    this.scheduleMinute = scheduleMinute;
    this.meetingStartTime = meetingStartTime;
    this.meetingEndTime = meetingEndTime;
    this.location = location;
    this.activity = activity;
    this.enabled = enabled;
    this.updatedAt = updatedAt;
  }

  /**
   * Validate time string format (HH:MM or 24:00)
   * @param {string} timeStr - Time string to validate
   * @returns {boolean} - True if valid format
   */
  static isValidTimeFormat(timeStr) {
    const timeRegex = /^(([01]?\d|2[0-3]):([0-5]\d)|24:00)$/;
    return timeRegex.test(timeStr);
  }

  /**
   * Validate schedule hour (0-23)
   * @param {number} hour - Hour to validate
   * @returns {boolean} - True if valid
   */
  static isValidHour(hour) {
    return Number.isInteger(hour) && hour >= 0 && hour <= 23;
  }

  /**
   * Validate schedule minute (0-59)
   * @param {number} minute - Minute to validate
   * @returns {boolean} - True if valid
   */
  static isValidMinute(minute) {
    return Number.isInteger(minute) && minute >= 0 && minute <= 59;
  }

  /**
   * Get formatted schedule time (HH:MM)
   * @returns {string} - Formatted schedule time
   */
  getScheduleTime() {
    return `${String(this.scheduleHour).padStart(2, '0')}:${String(this.scheduleMinute).padStart(2, '0')}`;
  }

  /**
   * Get status string (활성화/비활성화)
   * @param {Object} strings - String service object
   * @returns {string} - Localized status string
   */
  getStatusString(strings) {
    return this.enabled ? strings.meeting.statusEnabled : strings.meeting.statusDisabled;
  }

  /**
   * Enable meeting scheduler
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable meeting scheduler
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Update schedule time
   * @param {number} hour - Schedule hour (0-23)
   * @param {number} minute - Schedule minute (0-59)
   * @returns {boolean} - True if valid and updated
   */
  updateScheduleTime(hour, minute) {
    if (!MeetingConfig.isValidHour(hour) || !MeetingConfig.isValidMinute(minute)) {
      return false;
    }
    this.scheduleHour = hour;
    this.scheduleMinute = minute;
    return true;
  }

  /**
   * Update meeting time range
   * @param {string} startTime - Start time (HH:MM)
   * @param {string} endTime - End time (HH:MM)
   * @returns {boolean} - True if valid and updated
   */
  updateMeetingTime(startTime, endTime) {
    if (!MeetingConfig.isValidTimeFormat(startTime) || !MeetingConfig.isValidTimeFormat(endTime)) {
      return false;
    }
    this.meetingStartTime = startTime;
    this.meetingEndTime = endTime;
    return true;
  }

  /**
   * Update meeting location
   * @param {string} location - Meeting location
   */
  updateLocation(location) {
    this.location = location;
  }

  /**
   * Update meeting activity
   * @param {string} activity - Meeting activity description
   */
  updateActivity(activity) {
    this.activity = activity;
  }

  /**
   * Update channel ID
   * @param {string} channelId - Discord channel ID
   */
  updateChannel(channelId) {
    this.channelId = channelId;
  }

  /**
   * Validate all required fields
   * @returns {boolean} - True if all fields are valid
   */
  isValid() {
    return (
      this.channelId &&
      MeetingConfig.isValidHour(this.scheduleHour) &&
      MeetingConfig.isValidMinute(this.scheduleMinute) &&
      MeetingConfig.isValidTimeFormat(this.meetingStartTime) &&
      MeetingConfig.isValidTimeFormat(this.meetingEndTime) &&
      this.location &&
      this.activity
    );
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      channelId: this.channelId,
      scheduleHour: this.scheduleHour,
      scheduleMinute: this.scheduleMinute,
      meetingStartTime: this.meetingStartTime,
      meetingEndTime: this.meetingEndTime,
      location: this.location,
      activity: this.activity,
      enabled: this.enabled,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = MeetingConfig;
