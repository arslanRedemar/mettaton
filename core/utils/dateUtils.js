/**
 * 날짜 유틸리티
 */

/**
 * 날짜 형식 검증 (YYYY-MM-DD)
 */
function isValidDateFormat(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

/**
 * 시간 형식 검증 (HH:MM)
 */
function isValidTimeFormat(timeString) {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeString);
}

/**
 * 한국 날짜 포맷
 */
function formatKoreanDate(date = new Date()) {
  return date.toLocaleDateString('ko-KR');
}

/**
 * 시간 패딩 (2자리)
 */
function padTime(num) {
  return String(num).padStart(2, '0');
}

module.exports = {
  isValidDateFormat,
  isValidTimeFormat,
  formatKoreanDate,
  padTime,
};
