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

/**
 * HTML 문자열에서 텍스트만 추출
 * @param html - HTML 문자열
 * @returns 태그와 HTML 엔티티가 제거된 순수 텍스트
 */
export const extractTextFromHtml = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "") // 태그 제거
    .replace(/&nbsp;/g, " ") // nbsp 치환
    .trim();
};

/**
 * DOM 요소를 HTML 문자열로 변환 (속성 보존)
 * container.innerHTML로 파싱한 후에도 속성을 보존하기 위해
 * outerHTML을 사용하여 브라우저가 파싱한 HTML을 그대로 가져옴
 * @param element - 변환할 DOM 요소
 * @returns HTML 문자열
 */
export const elementToHtml = (element: Node): string => {
  if (element.nodeType === Node.TEXT_NODE) {
    return element.textContent || "";
  }

  if (element.nodeType === Node.ELEMENT_NODE) {
    const el = element as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    // outerHTML을 사용하면 브라우저가 파싱한 속성을 그대로 가져올 수 있음
    // container.innerHTML로 파싱한 후에도 outerHTML은 속성을 포함함
    const outerHtml = el.outerHTML;

    // outerHTML이 있으면 사용 (속성이 포함되어 있음)
    if (outerHtml) {
      // 자식 노드들을 재귀적으로 처리하기 위해
      // 시작 태그와 끝 태그를 분리하고 자식만 재귀 처리
      const startTagMatch = outerHtml.match(new RegExp(`<${tagName}[^>]*>`));
      const endTag = `</${tagName}>`;

      if (startTagMatch) {
        const startTag = startTagMatch[0];

        // 자식 노드들을 재귀적으로 처리
        let childrenHtml = "";
        el.childNodes.forEach((child) => {
          childrenHtml += elementToHtml(child);
        });

        return `${startTag}${childrenHtml}${endTag}`;
      }
    }

    // outerHTML이 없는 경우 (드물지만) 명시적으로 속성 추가
    let html = `<${tagName}`;

    // 모든 속성을 추가
    if (el.attributes && el.attributes.length > 0) {
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        html += ` ${attr.name}="${attr.value.replace(/"/g, "&quot;")}"`;
      }
    }

    // className 확인 및 추가
    const className = el.className;
    if (className && typeof className === "string" && className.trim()) {
      const hasClassAttr = el.hasAttribute("class");
      if (!hasClassAttr) {
        html += ` class="${String(className).replace(/"/g, "&quot;")}"`;
      }
    }

    // dataset 속성 확인 및 추가
    if (el.dataset) {
      Object.keys(el.dataset).forEach((key) => {
        const dataAttr = `data-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        const hasDataAttr = el.hasAttribute(dataAttr);
        if (!hasDataAttr && el.dataset[key]) {
          html += ` ${dataAttr}="${String(el.dataset[key]).replace(/"/g, "&quot;")}"`;
        }
      });
    }

    html += ">";

    // 자식 노드들을 재귀적으로 처리
    if (el.childNodes.length > 0) {
      el.childNodes.forEach((child) => {
        html += elementToHtml(child);
      });
    }

    html += `</${tagName}>`;
    return html;
  }

  return "";
};
