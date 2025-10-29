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
 * 전화번호 형식 검증
 * @param {string} phoneNumber - 전화번호
 * @return {boolean} 유효성 여부
 */
const isValidPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  // 한국용 정규화 먼저 수행
  const normalized = normalizeKoreanPhoneNumber(phoneNumber);

  // 숫자만 추출
  const numbers = normalized.replace(/\D/g, '');
  
  // 한국 휴대폰 번호 패턴: 010-XXXX-XXXX (11자리)
  if (numbers.length === 11 && numbers.startsWith('010')) {
    return true;
  }
  
  // 한국 지역번호 패턴 (9-10자리)
  // 02: 서울 (9자리), 그 외 지역 (10자리)
  if (numbers.length === 9 && numbers.startsWith('02')) {
    return true;
  }
  
  if (numbers.length === 10 && !numbers.startsWith('02') && !numbers.startsWith('010')) {
    return true;
  }
  
  return false;
};

/**
 * 한국 전화번호 정규화
 * - 공백/하이픈 등 제거
 * - +82 또는 82 국가코드를 국내 0 프리픽스로 변환
 * @param {string} phone - 원본 전화번호
 * @return {string} 정규화된 국내형 번호
 */
const normalizeKoreanPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  const rawClean = phone.replace(/[^0-9+]/g, '');
  if (rawClean.startsWith('+82')) return '0' + rawClean.slice(3);
  if (rawClean.startsWith('82')) return '0' + rawClean.slice(2);
  return rawClean;
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
 * @throws {Error} 유효하지 않은 날짜인 경우
 */
const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error("유효하지 않은 날짜입니다");
  }
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
 * @throws {Error} size가 1 이상의 정수가 아닌 경우
 */
const chunkArray = (array, size) => {
  const chunkSize = Number(size);
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error("chunk size는 1 이상의 정수여야 합니다");
  }
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
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

/**
 * 전화번호 마스킹 (PII 보호)
 * @param {string} phoneNumber - 마스킹할 전화번호
 * @return {string} 마스킹된 전화번호
 */
const maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return phoneNumber;
  }

  // 숫자만 추출
  const numbers = phoneNumber.replace(/\D/g, '');
  
  // 한국 전화번호 패턴 (010-XXXX-XXXX 또는 010XXXXXXXX)
  if (numbers.length === 11 && numbers.startsWith('010')) {
    return `010-****-${numbers.slice(-4)}`;
  }
  
  // 다른 길이의 전화번호는 중간 부분을 마스킹
  if (numbers.length >= 8) {
    const start = numbers.slice(0, 3);
    const end = numbers.slice(-4);
    const middle = '*'.repeat(Math.max(4, numbers.length - 7));
    return `${start}-${middle}-${end}`;
  }
  
  // 너무 짧은 번호는 부분적으로만 마스킹
  if (numbers.length >= 4) {
    const visible = numbers.slice(-2);
    const masked = '*'.repeat(numbers.length - 2);
    return `${masked}${visible}`;
  }
  
  // 4자리 미만은 전체 마스킹
  return '*'.repeat(numbers.length);
};

module.exports = {
  // Validation
  validateMissionStatus,
  isValidEmail,
  isValidPhoneNumber,
  normalizeKoreanPhoneNumber,

  // ID 생성
  generateId,

  // 포맷팅
  formatDate,

  // PII 보호
  maskPhoneNumber,

  // 배열/객체 유틸리티
  chunkArray,
  removeNullValues,
  deepClone,
};

