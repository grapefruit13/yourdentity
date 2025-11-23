import { LINK_URL } from "@/constants/shared/_link-url";
import { shareContent } from "./share";

interface PostShareParams {
  /**
   * @description 게시글 제목
   */
  title?: string;
  /**
   * @description 게시글 HTML 콘텐츠
   */
  content?: string;
  /**
   * @description 게시글 ID
   */
  postId: string;
  /**
   * @description 공유 URL 경로 (예: LINK_URL.COMMUNITY_POST, LINK_URL.COMMUNITY_MISSION)
   */
  sharePath: string;
  /**
   * @description 추가 쿼리 파라미터 (예: "?communityId=xxx")
   */
  queryParams?: string;
  /**
   * @description 기본 제목 (title이 없을 때 사용)
   */
  defaultTitle?: string;
}

/**
 * @description 게시글 공유하기 유틸 함수
 * @param params - 공유 파라미터
 */
export const sharePost = async ({
  title,
  content,
  postId,
  sharePath,
  queryParams = "",
  defaultTitle = "게시글",
}: PostShareParams) => {
  const shareTitle = title || defaultTitle;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${sharePath}/${postId}${queryParams}`
      : "";

  const contentText =
    content && typeof content === "string"
      ? content.replace(/<[^>]*>/g, "").substring(0, 100)
      : "";
  const shareText = contentText
    ? `${shareTitle}\n${contentText}...`
    : shareTitle;

  await shareContent({
    title: shareTitle,
    text: shareText,
    url: shareUrl,
  });
};
