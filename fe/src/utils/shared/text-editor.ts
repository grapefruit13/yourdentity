export const rgbToHex = (rgb: string, fallback: string): string => {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return fallback;

  return (
    "#" +
    match
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

export const isElementEmpty = (element: HTMLElement | null): boolean => {
  if (!element) return true;

  // 이미지/비디오/SVG/첨부 블록 등 비-텍스트 콘텐츠가 있으면 비어있지 않음으로 간주
  const atomic = element.querySelector("img,video,svg,[data-attachment]");
  if (atomic) return false;

  // 텍스트 기반 검사: 공백, NBSP, zero-width space 제거 후 체크
  const text = (element.textContent || "")
    .replace(/\u200B/g, "") // zero-width space
    .replace(/\u00A0/g, " ") // NBSP를 일반 공백으로
    .trim();
  return text === "";
};

export const createRangeAtEnd = (element: HTMLElement): Range => {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  return range;
};

export const createRangeAtStart = (element: HTMLElement): Range => {
  const range = document.createRange();
  range.setStart(element, 0);
  range.collapse(true);
  return range;
};

export const setCursorPosition = (
  element: HTMLElement,
  atEnd = false
): void => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = atEnd ? createRangeAtEnd(element) : createRangeAtStart(element);
  selection.removeAllRanges();
  selection.addRange(range);
};

/**
 * URL 정규화: 프로토콜이 없으면 https://를 붙임
 * @param raw - 정규화할 URL 문자열
 * @returns 정규화된 URL 문자열 (유효하지 않으면 빈 문자열)
 */
export const normalizeUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    // 이미 유효한 절대 URL이면 그대로
    // new URL은 절대 URL만 허용
    // http/https 외는 차단
    const u = new URL(trimmed);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
    return "";
  } catch {
    // 프로토콜이 없으면 https 붙여 재시도
    try {
      const u2 = new URL(`https://${trimmed}`);
      if (u2.protocol === "http:" || u2.protocol === "https:")
        return u2.toString();
      return "";
    } catch {
      return "";
    }
  }
};
