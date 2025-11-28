import { ReactNode, useMemo } from "react";
import Image from "next/image";

/**
 * img 태그에서 src와 alt 속성 추출
 */
const extractImgAttributes = (
  imgTag: string
): { src: string; alt: string } | null => {
  const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
  const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);

  if (!srcMatch) return null;

  return {
    src: srcMatch[1],
    alt: altMatch ? altMatch[1] : "GIF",
  };
};

/**
 * 댓글 콘텐츠를 파싱하여 React 컴포넌트로 변환
 * - iOS PWA에서 GIF 깜빡임 방지를 위해 최적화된 렌더링 사용
 */
export const parseCommentContent = (html: string): ReactNode[] => {
  if (!html) return [];

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let imgIndex = 0;

  // img 태그 찾기 (정규식)
  const imgRegex = /<img[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(html)) !== null) {
    // img 태그 이전의 텍스트 추가
    const beforeText = html.substring(lastIndex, match.index);
    if (beforeText.trim()) {
      // HTML 태그 제거하고 텍스트만 추출
      const textOnly = beforeText
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      if (textOnly.trim()) {
        // 줄바꿈을 <br>로 변환
        const lines = textOnly.split("\n");
        lines.forEach((line, lineIndex) => {
          if (line.trim()) {
            nodes.push(
              <span key={`text-${imgIndex}-${lineIndex}`}>{line}</span>
            );
          }
          if (lineIndex < lines.length - 1) {
            nodes.push(<br key={`br-${imgIndex}-${lineIndex}`} />);
          }
        });
      }
    }

    // img 태그 처리
    const imgTag = match[0];
    const imgAttrs = extractImgAttributes(imgTag);

    if (imgAttrs) {
      const { src, alt } = imgAttrs;
      const isExternalUrl = /^https?:\/\//i.test(src);
      const isGif = /\.gif$/i.test(src) || src.includes("giphy.com");

      // 고유 키 생성 (src와 인덱스 조합)
      const imgKey = `img-${imgIndex}-${src.substring(0, 20).replace(/[^a-zA-Z0-9]/g, "-")}`;

      nodes.push(
        <div
          key={imgKey}
          className="my-1 block"
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "8px",
          }}
        >
          {isExternalUrl || isGif ? (
            // 외부 URL이나 GIF는 일반 img 태그 사용 (iOS PWA 최적화 적용)
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "8px",
                display: "block",
                margin: "4px 0",
                // iOS PWA 최적화: 하드웨어 가속 및 리플로우 방지
                willChange: "auto",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                // 레이아웃 시프트 방지
                objectFit: "contain",
              }}
              loading="lazy"
              decoding="async"
            />
          ) : (
            // 내부 이미지는 next/image 사용
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={800}
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "8px",
                display: "block",
                margin: "4px 0",
              }}
              className="max-h-[300px] w-auto max-w-full object-contain"
              loading="lazy"
            />
          )}
        </div>
      );
      imgIndex++;
    }

    lastIndex = match.index + match[0].length;
  }

  // 마지막 텍스트 추가
  const remainingText = html.substring(lastIndex);
  if (remainingText.trim()) {
    const textOnly = remainingText
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    if (textOnly.trim()) {
      const lines = textOnly.split("\n");
      lines.forEach((line, lineIndex) => {
        if (line.trim()) {
          nodes.push(<span key={`text-final-${lineIndex}`}>{line}</span>);
        }
        if (lineIndex < lines.length - 1) {
          nodes.push(<br key={`br-final-${lineIndex}`} />);
        }
      });
    }
  }

  // img 태그가 없는 경우 원본 HTML을 텍스트로만 표시
  if (nodes.length === 0) {
    const textOnly = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    if (textOnly.trim()) {
      const lines = textOnly.split("\n");
      lines.forEach((line, lineIndex) => {
        if (line.trim()) {
          nodes.push(<span key={`text-fallback-${lineIndex}`}>{line}</span>);
        }
        if (lineIndex < lines.length - 1) {
          nodes.push(<br key={`br-fallback-${lineIndex}`} />);
        }
      });
    }
  }

  return nodes.length > 0 ? nodes : [html];
};
