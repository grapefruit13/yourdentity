const MIN_PAGE_SIZE = 1;

/**
 * pageSize 값을 파싱해 최소/최대 범위에 맞게 정규화합니다.
 * @param {number|string|undefined} value - 입력값
 * @param {number} defaultSize - 기본값
 * @param {number} maxSize - 허용되는 최대값
 * @returns {number} 정규화된 pageSize
 */
function parsePageSize(value, defaultSize, maxSize) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return defaultSize;
  }

  return Math.min(maxSize, Math.max(MIN_PAGE_SIZE, Math.trunc(parsed)));
}

/**
 * cursor 문자열을 정규화합니다.
 * @param {string|undefined|null} value - 입력값
 * @returns {string|null} 정규화된 cursor 문자열
 */
function sanitizeCursor(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

module.exports = {
  parsePageSize,
  sanitizeCursor,
};

