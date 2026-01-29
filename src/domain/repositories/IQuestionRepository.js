/**
 * Question Repository Interface
 * 질문 레포지토리 인터페이스 (추상화)
 * Data 레이어에서 구현
 */
class IQuestionRepository {
  /**
   * 모든 질문 조회
   * @returns {Question[]}
   */
  getAllQuestions() {
    throw new Error('Method not implemented');
  }

  /**
   * ID로 질문 조회
   * @param {number} id
   * @returns {Question|null}
   */
  getQuestionById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * 질문 추가
   * @param {Question} question
   * @returns {Question}
   */
  addQuestion(question) {
    throw new Error('Method not implemented');
  }

  /**
   * 질문 수정
   * @param {Question} question
   * @returns {boolean}
   */
  updateQuestion(question) {
    throw new Error('Method not implemented');
  }

  /**
   * 질문 삭제
   * @param {number} id
   * @returns {Question|null}
   */
  deleteQuestion(id) {
    throw new Error('Method not implemented');
  }

  /**
   * 메시지 ID로 질문 삭제
   * @param {string} messageId
   * @returns {boolean}
   */
  deleteQuestionByMessageId(messageId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IQuestionRepository;
