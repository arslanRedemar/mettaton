/**
 * Meeting Repository Interface
 * 모임 레포지토리 인터페이스 (추상화)
 * Data 레이어에서 구현
 */
class IMeetingRepository {
  /**
   * 모임 설정 조회
   * @returns {MeetingConfig|null}
   */
  getMeetingConfig() {
    throw new Error('Method not implemented');
  }

  /**
   * 모임 설정 저장
   * @param {MeetingConfig} config
   * @returns {boolean}
   */
  setMeetingConfig(config) {
    throw new Error('Method not implemented');
  }

  /**
   * 모임 횟수 조회
   * @returns {number}
   */
  getMeetingCount() {
    throw new Error('Method not implemented');
  }

  /**
   * 모임 횟수 증가
   * @returns {number}
   */
  incrementMeetingCount() {
    throw new Error('Method not implemented');
  }
}

module.exports = IMeetingRepository;
