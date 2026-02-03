/**
 * DatabaseSyncResult Entity
 * Represents the result of a database synchronization operation
 * Contains counts for all 6 phases of the sync process
 */
class DatabaseSyncResult {
  /**
   * @param {Object} params
   * @param {number} [params.membersAdded=0] - Phase 1: Members added to member_activity
   * @param {number} [params.membersRemoved=0] - Phase 1: Members removed from member_activity
   * @param {number} [params.lectureAttendeesRemoved=0] - Phase 2: Lecture attendees removed
   * @param {number} [params.questionAttendeesRemoved=0] - Phase 2: Question attendees removed
   * @param {number} [params.lectureMessagesCleaned=0] - Phase 3: Lecture messages cleaned
   * @param {number} [params.questionMessagesCleaned=0] - Phase 3: Question messages cleaned
   * @param {number} [params.practiceMessagesCleaned=0] - Phase 3: Practice plan messages cleaned
   * @param {number} [params.quizMessagesCleaned=0] - Phase 3: Quiz messages cleaned
   * @param {number} [params.pointsRemoved=0] - Phase 4: Activity points removed
   * @param {number} [params.accumulationLogsRemoved=0] - Phase 4: Accumulation logs removed
   * @param {number} [params.practicesRemoved=0] - Phase 5: Practice plans removed
   * @param {number} [params.practiceRecordsRemoved=0] - Phase 5: Practice records removed
   * @param {number} [params.quizHistoryCleaned=0] - Phase 6: Orphaned quiz publish history removed
   */
  constructor({
    membersAdded = 0,
    membersRemoved = 0,
    lectureAttendeesRemoved = 0,
    questionAttendeesRemoved = 0,
    lectureMessagesCleaned = 0,
    questionMessagesCleaned = 0,
    practiceMessagesCleaned = 0,
    quizMessagesCleaned = 0,
    pointsRemoved = 0,
    accumulationLogsRemoved = 0,
    practicesRemoved = 0,
    practiceRecordsRemoved = 0,
    quizHistoryCleaned = 0,
  } = {}) {
    // Phase 1: Member activity sync
    this.membersAdded = membersAdded;
    this.membersRemoved = membersRemoved;

    // Phase 2: Attendees cleanup
    this.lectureAttendeesRemoved = lectureAttendeesRemoved;
    this.questionAttendeesRemoved = questionAttendeesRemoved;

    // Phase 3: Message ID verification
    this.lectureMessagesCleaned = lectureMessagesCleaned;
    this.questionMessagesCleaned = questionMessagesCleaned;
    this.practiceMessagesCleaned = practiceMessagesCleaned;
    this.quizMessagesCleaned = quizMessagesCleaned;

    // Phase 4: Activity points cleanup
    this.pointsRemoved = pointsRemoved;
    this.accumulationLogsRemoved = accumulationLogsRemoved;

    // Phase 5: Personal practice cleanup
    this.practicesRemoved = practicesRemoved;
    this.practiceRecordsRemoved = practiceRecordsRemoved;

    // Phase 6: Quiz publish history cleanup
    this.quizHistoryCleaned = quizHistoryCleaned;
  }

  /**
   * Increment members added count
   */
  incrementMembersAdded() {
    this.membersAdded++;
  }

  /**
   * Increment members removed count
   */
  incrementMembersRemoved() {
    this.membersRemoved++;
  }

  /**
   * Increment lecture attendees removed count
   */
  incrementLectureAttendeesRemoved() {
    this.lectureAttendeesRemoved++;
  }

  /**
   * Increment question attendees removed count
   */
  incrementQuestionAttendeesRemoved() {
    this.questionAttendeesRemoved++;
  }

  /**
   * Increment lecture messages cleaned count
   */
  incrementLectureMessagesCleaned() {
    this.lectureMessagesCleaned++;
  }

  /**
   * Increment question messages cleaned count
   */
  incrementQuestionMessagesCleaned() {
    this.questionMessagesCleaned++;
  }

  /**
   * Increment practice messages cleaned count
   */
  incrementPracticeMessagesCleaned() {
    this.practiceMessagesCleaned++;
  }

  /**
   * Increment quiz messages cleaned count
   */
  incrementQuizMessagesCleaned() {
    this.quizMessagesCleaned++;
  }

  /**
   * Add to points removed count
   * @param {number} count - Number of points removed
   */
  addPointsRemoved(count) {
    this.pointsRemoved += count;
  }

  /**
   * Add to accumulation logs removed count
   * @param {number} count - Number of logs removed
   */
  addAccumulationLogsRemoved(count) {
    this.accumulationLogsRemoved += count;
  }

  /**
   * Increment practices removed count
   */
  incrementPracticesRemoved() {
    this.practicesRemoved++;
  }

  /**
   * Add to practice records removed count
   * @param {number} count - Number of records removed
   */
  addPracticeRecordsRemoved(count) {
    this.practiceRecordsRemoved += count;
  }

  /**
   * Set quiz history cleaned count
   * @param {number} count - Number of orphaned history records removed
   */
  setQuizHistoryCleaned(count) {
    this.quizHistoryCleaned = count;
  }

  /**
   * Get total number of changes made across all phases
   * @returns {number}
   */
  getTotalChanges() {
    return this.membersAdded
      + this.membersRemoved
      + this.lectureAttendeesRemoved
      + this.questionAttendeesRemoved
      + this.lectureMessagesCleaned
      + this.questionMessagesCleaned
      + this.practiceMessagesCleaned
      + this.quizMessagesCleaned
      + this.pointsRemoved
      + this.accumulationLogsRemoved
      + this.practicesRemoved
      + this.practiceRecordsRemoved
      + this.quizHistoryCleaned;
  }

  /**
   * Check if any changes were made
   * @returns {boolean}
   */
  hasChanges() {
    return this.getTotalChanges() > 0;
  }

  /**
   * Convert to plain object for logging or serialization
   * @returns {Object}
   */
  toJSON() {
    return {
      phase1: {
        membersAdded: this.membersAdded,
        membersRemoved: this.membersRemoved,
      },
      phase2: {
        lectureAttendeesRemoved: this.lectureAttendeesRemoved,
        questionAttendeesRemoved: this.questionAttendeesRemoved,
      },
      phase3: {
        lectureMessagesCleaned: this.lectureMessagesCleaned,
        questionMessagesCleaned: this.questionMessagesCleaned,
        practiceMessagesCleaned: this.practiceMessagesCleaned,
        quizMessagesCleaned: this.quizMessagesCleaned,
      },
      phase4: {
        pointsRemoved: this.pointsRemoved,
        accumulationLogsRemoved: this.accumulationLogsRemoved,
      },
      phase5: {
        practicesRemoved: this.practicesRemoved,
        practiceRecordsRemoved: this.practiceRecordsRemoved,
      },
      phase6: {
        quizHistoryCleaned: this.quizHistoryCleaned,
      },
      totalChanges: this.getTotalChanges(),
    };
  }

  /**
   * Create a summary string for logging
   * @returns {string}
   */
  toLogString() {
    return `Phase1(+${this.membersAdded}/-${this.membersRemoved}), `
      + `Phase2(lec=${this.lectureAttendeesRemoved}/q=${this.questionAttendeesRemoved}), `
      + `Phase3(lec=${this.lectureMessagesCleaned}/q=${this.questionMessagesCleaned}/prac=${this.practiceMessagesCleaned}/quiz=${this.quizMessagesCleaned}), `
      + `Phase4(pts=${this.pointsRemoved}/logs=${this.accumulationLogsRemoved}), `
      + `Phase5(plans=${this.practicesRemoved}/rec=${this.practiceRecordsRemoved}), `
      + `Phase6(hist=${this.quizHistoryCleaned})`;
  }
}

module.exports = DatabaseSyncResult;
