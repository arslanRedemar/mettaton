/**
 * Lecture Repository Interface
 * 강의 레포지토리 인터페이스 (추상화)
 * Data 레이어에서 구현
 */
class ILectureRepository {
  /**
   * 모든 강의 조회
   * @returns {Lecture[]}
   */
  getAllLectures() {
    throw new Error('Method not implemented');
  }

  /**
   * ID로 강의 조회
   * @param {number} id
   * @returns {Lecture|null}
   */
  getLectureById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * 강의 추가
   * @param {Lecture} lecture
   * @returns {Lecture}
   */
  addLecture(lecture) {
    throw new Error('Method not implemented');
  }

  /**
   * 강의 수정
   * @param {Lecture} lecture
   * @returns {boolean}
   */
  updateLecture(lecture) {
    throw new Error('Method not implemented');
  }

  /**
   * 강의 삭제
   * @param {number} id
   * @returns {Lecture|null}
   */
  deleteLecture(id) {
    throw new Error('Method not implemented');
  }

  /**
   * 메시지 ID로 강의 삭제
   * @param {string} messageId
   * @returns {boolean}
   */
  deleteLectureByMessageId(messageId) {
    throw new Error('Method not implemented');
  }
}

module.exports = ILectureRepository;
