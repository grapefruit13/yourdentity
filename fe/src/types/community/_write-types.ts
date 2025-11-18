/**
 * @description 커뮤니티 글 작성 페이지 타입 정의
 */

export type WriteFormValues = {
  title: string;
  content: string; // HTML 포함
  category: "한끗루틴" | "TMI 프로젝트" | "월간 소모임";
};
