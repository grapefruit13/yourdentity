/**
 * Utility Helpers
 * 순수 유틸리티 함수들을 모아놓은 파일입니다.
 *
 * 참고:
 * - Response 관련: middleware/responseHandler.js 사용
 * - Error 관련: middleware/errorHandler.js 사용
 */

/**
 * 미션 상태 검증
 * @param {string} status - 미션 상태
 * @return {boolean} 유효성 여부
 */
const validateMissionStatus = (status) => {
  const validStatuses = ["ONGOING", "COMPLETED", "EXPIRED", "RETRY"];
  return validStatuses.includes(status);
};

/**
 * 이메일 형식 검증
 * @param {string} email - 이메일 주소
 * @return {boolean} 유효성 여부
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 고유 ID 생성 (타임스탬프 기반)
 * @return {string} 생성된 ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 날짜 포맷팅
 * @param {Date|string} date - 날짜
 * @return {string} 포맷된 날짜 (YYYY-MM-DD)
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 배열을 청크로 분할
 * @param {array} array - 분할할 배열
 * @param {number} size - 청크 크기
 * @return {array} 청크 배열
 */
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * 객체에서 null/undefined 값 제거
 * @param {object} obj - 정리할 객체
 * @return {object} 정리된 객체
 */
const removeNullValues = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

/**
 * 딥 클론 (간단한 구현)
 * @param {object} obj - 복사할 객체
 * @return {object} 복사된 객체
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

module.exports = {
  // Validation
  validateMissionStatus,
  isValidEmail,

  // ID 생성
  generateId,

  // 포맷팅
  formatDate,

  // 배열/객체 유틸리티
  chunkArray,
  removeNullValues,
  deepClone,
};

