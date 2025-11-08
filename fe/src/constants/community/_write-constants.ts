/**
 * @description 커뮤니티 글 작성 페이지 상수 정의
 */
export const MAX_FILES = 5;

/**
 * @description 커뮤니티 글 작성 페이지 에러 메시지
 */
export const WRITE_MESSAGES = {
  IMAGE_UPLOAD_FAILED:
    "이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.",
  IMAGE_URL_REPLACE_FAILED:
    "이미지 URL 교체에 실패했습니다. 잠시 후 다시 시도해주세요.",
  IMAGE_UPLOAD_PARTIAL_FAILED: (count: number) =>
    `이미지 업로드에 실패했습니다. (${count}개 실패) 잠시 후 다시 시도해주세요.`,
  POST_CREATE_FAILED: "등록에 실패했습니다. 잠시 후 다시 시도해주세요.",
  POST_CREATE_SUCCESS: "게시물이 등록되었습니다.",
  POST_RESPONSE_INVALID: "응답에서 postId 또는 communityId를 찾을 수 없습니다.",
} as const;
