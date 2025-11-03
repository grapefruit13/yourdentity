"use client";

import { useRouter } from "next/navigation";
import type { TGETHomeRes } from "@/types/generated/home-types";

interface HomeContentRendererProps {
  content: TGETHomeRes["content"];
  className?: string;
}

/**
 * URL 정규식 - http://, https://, www. 등으로 시작하는 URL 패턴
 * 다양한 URL 형식을 지원 (http://, https://, www., 도메인 직접 입력 등)
 */
const URL_REGEX =
  /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?[&#\w=.-]*)?(#[\w-]*)?$/i;

/**
 * @description caption에서 URL을 추출하는 헬퍼 함수
 * @param caption - 이미지 caption 텍스트
 * @returns 유효한 URL이 있으면 URL, 없으면 null
 */
const extractUrlFromCaption = (caption: string | undefined): string | null => {
  if (!caption || typeof caption !== "string") return null;

  const trimmedCaption = caption.trim();

  // 1. 전체 caption이 URL인지 확인
  if (URL_REGEX.test(trimmedCaption)) {
    if (
      !trimmedCaption.startsWith("http://") &&
      !trimmedCaption.startsWith("https://")
    ) {
      return `https://${trimmedCaption}`;
    }
    return trimmedCaption;
  }

  // 2. 공백으로 분리하여 각 부분이 URL인지 확인
  const parts = trimmedCaption.split(/\s+/);
  for (const part of parts) {
    const cleanedPart = part.trim();
    if (!cleanedPart) continue;

    // URL 정규식으로 테스트
    if (URL_REGEX.test(cleanedPart)) {
      // http:// 또는 https://가 없으면 추가
      if (
        !cleanedPart.startsWith("http://") &&
        !cleanedPart.startsWith("https://")
      ) {
        return `https://${cleanedPart}`;
      }
      return cleanedPart;
    }
  }

  return null;
};

/**
 * @description 홈 화면 컨텐츠 블록을 렌더링하는 컴포넌트
 * 서버에서 받은 content 배열을 나열식으로 렌더링
 */
export const HomeContentRenderer = ({
  content,
  className = "",
}: HomeContentRendererProps) => {
  const router = useRouter();

  if (!content || content?.length === 0) {
    return null;
  }

  // 리스트 아이템들을 그룹화하기 위한 헬퍼 함수
  const groupListItems = (
    blocks: TGETHomeRes["content"]
  ): (
    | TGETHomeRes["content"][number]
    | { type: "grouped_list"; items: TGETHomeRes["content"] }
  )[] => {
    const result: (
      | TGETHomeRes["content"][number]
      | { type: "grouped_list"; items: TGETHomeRes["content"] }
    )[] = [];
    let currentBulletedGroup: TGETHomeRes["content"] = [];
    let currentNumberedGroup: TGETHomeRes["content"] = [];

    const flushGroups = () => {
      if (currentBulletedGroup.length > 0) {
        result.push({
          type: "grouped_list" as const,
          items: currentBulletedGroup,
        });
        currentBulletedGroup = [];
      }
      if (currentNumberedGroup.length > 0) {
        result.push({
          type: "grouped_list" as const,
          items: currentNumberedGroup,
        });
        currentNumberedGroup = [];
      }
    };

    blocks.forEach((block) => {
      if (block.type === "bulleted_list_item") {
        currentNumberedGroup.length > 0 && flushGroups();
        currentBulletedGroup.push(block);
      } else if (block.type === "numbered_list_item") {
        currentBulletedGroup.length > 0 && flushGroups();
        currentNumberedGroup.push(block);
      } else {
        flushGroups();
        result.push(block);
      }
    });

    flushGroups();
    return result;
  };

  const groupedContent = groupListItems(content);

  return (
    <div className={className}>
      <div className="flex flex-col gap-4">
        {groupedContent.map((item, index) => {
          // 그룹화된 리스트 처리
          if (
            item &&
            typeof item === "object" &&
            "type" in item &&
            item.type === "grouped_list"
          ) {
            const firstItem = item.items[0];
            const ListTag =
              firstItem?.type === "numbered_list_item" ? "ol" : "ul";

            return (
              <ListTag
                key={`list-${index}`}
                className={
                  firstItem?.type === "numbered_list_item"
                    ? "ml-4 list-decimal"
                    : "ml-4 list-disc"
                }
              >
                {item.items.map((block) => {
                  return (
                    <li key={block.id}>
                      {block.text || ""}
                      {block.links && block.links.length > 0 && (
                        <span className="ml-2">
                          {block.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {link.text || link.url}
                            </a>
                          ))}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ListTag>
            );
          }

          // 일반 블록 처리
          const block = item;
          if (!block) return null;
          switch (block.type) {
            case "heading_1":
              return (
                <h1 key={block.id} className="text-3xl leading-tight font-bold">
                  {block.text || ""}
                  {block.links && block.links.length > 0 && (
                    <span className="ml-2">
                      {block.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {link.text || link.url}
                        </a>
                      ))}
                    </span>
                  )}
                </h1>
              );

            case "heading_2":
              return (
                <h2 key={block.id} className="text-2xl leading-tight font-bold">
                  {block.text || ""}
                  {block.links && block.links.length > 0 && (
                    <span className="ml-2">
                      {block.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {link.text || link.url}
                        </a>
                      ))}
                    </span>
                  )}
                </h2>
              );

            case "heading_3":
              return (
                <h3 key={block.id} className="text-xl leading-tight font-bold">
                  {block.text || ""}
                  {block.links && block.links.length > 0 && (
                    <span className="ml-2">
                      {block.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {link.text || link.url}
                        </a>
                      ))}
                    </span>
                  )}
                </h3>
              );

            case "paragraph":
              if (!block.text || !block.text.trim()) {
                return <div key={block.id} className="h-4" />;
              }
              return (
                <p key={block.id} className="text-base leading-relaxed">
                  {block.text}
                  {block.links && block.links.length > 0 && (
                    <span className="ml-2">
                      {block.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {link.text || link.url}
                        </a>
                      ))}
                    </span>
                  )}
                </p>
              );

            case "bulleted_list_item":
            case "numbered_list_item":
              // 리스트 아이템은 그룹화된 리스트에서 처리되므로 여기서는 처리하지 않음
              // 만약 그룹화되지 않은 경우를 대비하여 fallback 제공
              return null;

            case "toggle":
              return (
                <details key={block.id} className="my-2">
                  <summary className="cursor-pointer font-medium">
                    {block.text || ""}
                    {block.links && block.links.length > 0 && (
                      <span className="ml-2">
                        {block.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {link.text || link.url}
                          </a>
                        ))}
                      </span>
                    )}
                  </summary>
                  <div className="mt-2 ml-4 border-l-2 border-gray-300 pl-2">
                    {/* Toggle content would be nested blocks if available */}
                  </div>
                </details>
              );

            case "to_do":
              return (
                <div key={block.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={block.checked || false}
                    readOnly
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <span
                    className={
                      block.checked ? "text-gray-500 line-through" : ""
                    }
                  >
                    {block.text || ""}
                  </span>
                  {block.links && block.links.length > 0 && (
                    <span className="ml-2">
                      {block.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {link.text || link.url}
                        </a>
                      ))}
                    </span>
                  )}
                </div>
              );

            case "quote":
              return (
                <blockquote
                  key={block.id}
                  className="border-l-4 border-gray-300 pl-4 text-gray-700 italic"
                >
                  {block.text || ""}
                  {block.links && block.links.length > 0 && (
                    <span className="ml-2">
                      {block.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {link.text || link.url}
                        </a>
                      ))}
                    </span>
                  )}
                </blockquote>
              );

            case "callout":
              return (
                <div
                  key={block.id}
                  className="rounded-md border border-blue-200 bg-blue-50 p-4"
                >
                  <p className="text-base">
                    {block.text || ""}
                    {block.links && block.links.length > 0 && (
                      <span className="ml-2">
                        {block.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {link.text || link.url}
                          </a>
                        ))}
                      </span>
                    )}
                  </p>
                </div>
              );

            case "image": {
              if (!block.url) {
                return null;
              }

              // caption에서 URL 추출
              const captionUrl = extractUrlFromCaption(block.caption);

              // URL이 있으면 클릭 핸들러
              const handleImageClick = () => {
                if (captionUrl) {
                  // URL에서 도메인 제거하여 경로만 추출
                  try {
                    const urlObj = new URL(
                      captionUrl.startsWith("http")
                        ? captionUrl
                        : `https://${captionUrl}`
                    );
                    // 같은 도메인인지 확인 (내부 링크인 경우)
                    if (
                      urlObj.hostname === window.location.hostname ||
                      urlObj.hostname.includes("yourdentity")
                    ) {
                      // 경로만 추출하여 router.push 사용
                      router.push(urlObj.pathname + urlObj.search);
                    } else {
                      // 외부 링크는 새 탭에서 열기
                      window.open(captionUrl, "_blank", "noopener,noreferrer");
                    }
                  } catch {
                    // URL 파싱 실패 시 경로로 직접 사용
                    const path = captionUrl.startsWith("/")
                      ? captionUrl
                      : `/${captionUrl}`;
                    router.push(path);
                  }
                }
              };

              return (
                <figure key={block.id}>
                  {captionUrl ? (
                    <button
                      onClick={handleImageClick}
                      className="block w-full cursor-pointer border-0 bg-transparent p-0"
                      type="button"
                      aria-label={block.caption || "이미지 링크"}
                    >
                      <img
                        src={block.url}
                        alt={block.caption || ""}
                        className="w-full rounded-md transition-opacity hover:opacity-90"
                      />
                    </button>
                  ) : (
                    <img
                      src={block.url}
                      alt={block.caption || ""}
                      className="w-full rounded-md"
                    />
                  )}
                </figure>
              );
            }

            case "video":
              if (!block.url) {
                return null;
              }
              return (
                <figure key={block.id} className="my-4">
                  <video
                    src={block.url}
                    controls
                    className="w-full rounded-md"
                  />
                  {block.caption && (
                    <figcaption className="mt-2 text-center text-sm text-gray-600">
                      {block.caption}
                      {block.links && block.links.length > 0 && (
                        <span className="ml-2">
                          {block.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {link.text || link.url}
                            </a>
                          ))}
                        </span>
                      )}
                    </figcaption>
                  )}
                </figure>
              );

            case "file":
              if (!block.url) {
                return null;
              }
              return (
                <div key={block.id} className="my-4">
                  <a
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 underline hover:text-blue-800"
                  >
                    <span>📎</span>
                    <span>{block.caption || "파일 다운로드"}</span>
                  </a>
                </div>
              );

            case "divider":
              return <hr key={block.id} className="my-4 border-gray-300" />;

            default:
              return (
                <div key={block.id} className="text-sm text-gray-500">
                  지원하지 않는 블록 타입: {block.type}
                </div>
              );
          }
        })}
      </div>
    </div>
  );
};
