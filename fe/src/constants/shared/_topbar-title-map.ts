import { LINK_URL } from "./_link-url";

export const TOPBAR_TITLE_MAP: Array<{ prefix: string; label: string }> = [
  { prefix: LINK_URL.EMAIL_LOGIN, label: "로그인" },
  { prefix: LINK_URL.HOME, label: "" },
  { prefix: LINK_URL.MISSION, label: "미션" },
  { prefix: LINK_URL.COMMUNITY_POST, label: "" }, // 게시글 상세 페이지는 레이블 없음
  { prefix: LINK_URL.COMMUNITY, label: "글 작성" },
  { prefix: LINK_URL.ROUTINES, label: "한끗루틴" },
  { prefix: LINK_URL.ROUTINES_APPLY, label: "신청하기" },
  { prefix: LINK_URL.MY_PAGE, label: "마이" },
  { prefix: LINK_URL.SETTINGS, label: "설정" },
  { prefix: LINK_URL.PERSONAL_INFO, label: "개인 정보 관리" },
];
