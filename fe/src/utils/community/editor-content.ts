import { debug } from "@/utils/shared/debugger";
import { elementToHtml, normalizeBrTags } from "@/utils/shared/text-editor";

/**
 * content HTML의 a[data-file-id]를 응답 fileUrl로 교체하고 data 속성을 제거
 * @param html - HTML 콘텐츠
 * @param byIdToUrl - clientId와 URL 매핑
 * @returns 교체된 HTML 콘텐츠
 */
export const replaceEditorFileHrefWithUploadedUrls = (
  html: string,
  byIdToUrl: Map<string, string>
): string => {
  if (!html) return html;

  if (byIdToUrl.size === 0) {
    return html;
  }

  const container = document.createElement("div");
  container.innerHTML = html;

  container
    .querySelectorAll<HTMLAnchorElement>("a[data-file-id]")
    .forEach((a) => {
      const clientId = a.getAttribute("data-file-id") || "";
      const url = byIdToUrl.get(clientId);
      if (url) {
        a.setAttribute("href", url);
        a.removeAttribute("data-file-id");
      }
    });

  let resultHtml = "";
  container.childNodes.forEach((child) => {
    resultHtml += elementToHtml(child);
  });
  // 불필요한 <br> 태그 제거
  return normalizeBrTags(resultHtml);
};

/**
 * content HTML의 img[data-client-id]를 응답 fileUrl로 교체하고 data 속성을 제거
 * @param html - HTML 콘텐츠
 * @param byIdToUrl - clientId와 URL 매핑
 * @returns 교체된 HTML 콘텐츠
 */
export const replaceEditorImageSrcWithUploadedUrls = (
  html: string,
  byIdToUrl: Map<string, string>
): string => {
  if (!html) return html;

  debug.log("replaceEditorImageSrcWithUploadedUrls 시작:", {
    htmlLength: html.length,
    byIdToUrlSize: byIdToUrl.size,
    byIdToUrlEntries: Array.from(byIdToUrl.entries()),
  });

  if (byIdToUrl.size === 0) {
    debug.log("byIdToUrl이 비어있어 원본 HTML 반환");
    return html;
  }

  const container = document.createElement("div");
  container.innerHTML = html;

  const images = container.querySelectorAll<HTMLImageElement>(
    "img[data-client-id]"
  );

  debug.log("교체할 이미지 개수:", images.length);

  images.forEach((img) => {
    const clientId = img.getAttribute("data-client-id");
    if (!clientId) {
      debug.log("clientId가 없는 이미지 발견");
      return;
    }

    const url = byIdToUrl.get(clientId);
    debug.log(`이미지 교체 시도: clientId=${clientId}, url=${url}`);
    if (url) {
      img.setAttribute("src", url);
      img.removeAttribute("data-client-id");
      debug.log(`이미지 교체 성공: ${clientId} -> ${url}`);
    } else {
      debug.warn(`이미지 URL을 찾을 수 없음: clientId=${clientId}`);
    }
  });

  let resultHtml = "";
  container.childNodes.forEach((child) => {
    resultHtml += elementToHtml(child);
  });

  // 교체 후 남은 data-client-id 확인
  const tempCheck = document.createElement("div");
  tempCheck.innerHTML = resultHtml;
  const remainingImages = tempCheck.querySelectorAll("img[data-client-id]");
  debug.log("교체 후 남은 data-client-id 이미지 개수:", remainingImages.length);

  // 불필요한 <br> 태그 제거
  return normalizeBrTags(resultHtml);
};

/**
 * content HTML에서 이미지 src에서 filePath 추출
 * @param content - HTML 콘텐츠
 * @returns filePath 배열
 */
export const extractImagePathsFromContent = (content: string): string[] => {
  if (!content) return [];

  const container = document.createElement("div");
  container.innerHTML = content;

  const images = container.querySelectorAll<HTMLImageElement>("img");
  const paths: string[] = [];

  images.forEach((img) => {
    const src = img.getAttribute("src");
    if (!src) return;

    // data-client-id가 있으면 새로 추가된 이미지 (아직 업로드 전)
    if (img.hasAttribute("data-client-id")) {
      return;
    }

    // src에서 filePath 추출
    const filePath = extractFilePathFromUrl(src);
    if (filePath) {
      paths.push(filePath);
    }
  });

  return paths;
};

/**
 * content HTML에서 앵커 href에서 filePath 추출
 * @param content - HTML 콘텐츠
 * @returns filePath 배열
 */
export const extractFilePathsFromContent = (content: string): string[] => {
  if (!content) return [];

  const container = document.createElement("div");
  container.innerHTML = content;

  const anchors = container.querySelectorAll<HTMLAnchorElement>("a");
  const paths: string[] = [];

  anchors.forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href) return;

    // data-file-id가 있으면 새로 추가된 파일 (아직 업로드 전)
    if (anchor.hasAttribute("data-file-id")) {
      return;
    }

    // href에서 filePath 추출
    const filePath = extractFilePathFromUrl(href);
    if (filePath) {
      paths.push(filePath);
    }
  });

  return paths;
};

/**
 * URL에서 filePath 추출
 * @param url - 이미지 URL
 * @returns filePath 또는 null
 */
export const extractFilePathFromUrl = (url: string): string | null => {
  if (!url) return null;

  // URL이 전체 URL인 경우 pathname에서 추출
  try {
    const urlObj = new URL(url);
    // 예: "files/user123/image.jpg" 형태
    const pathname = urlObj.pathname;
    if (pathname.startsWith("/")) {
      return pathname.substring(1); // 앞의 '/' 제거
    }
    return pathname;
  } catch {
    // URL이 아닌 경우 (상대 경로)
    // 예: "files/user123/image.jpg"
    if (url.startsWith("files/")) {
      return url;
    }
    // 다른 형식의 경우 원본 media와 매칭 시도
    return url;
  }
};
