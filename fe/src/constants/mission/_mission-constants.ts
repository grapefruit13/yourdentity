/**
 * @description 미션 페이지 상수 정의
 */

/**
 * 토스트 메시지 표시 지연 시간 (ms)
 */
export const TOAST_DELAY_MS = 100;

/**
 * 토스트 메시지 표시 지속 시간 (ms)
 */
export const TOAST_DURATION_MS = 2000;

/**
 * 미션 그만두기 성공 메시지
 */
export const QUIT_MISSION_SUCCESS_MESSAGE =
  "미션을 그만뒀어요. 다음 미션을 진행할까요?";

/**
 * 미션 그만두기 에러 메시지
 */
export const QUIT_MISSION_ERROR_MESSAGE = "미션 삭제 중 오류가 발생했습니다.";

/**
 * 미션 상세 페이지 모달 기본 내용
 */
export const DEFAULT_MODAL_CONTENT = {
  title: "미션을 시작할까요?",
  description: "",
};

/**
 * 미션 최대 개수 초과 에러 모달 내용
 */
export const MAX_MISSION_ERROR_MODAL = {
  title: "미션 신청이 어려워요",
  description:
    "미션은 최대 3개까지만 신청할 수 있어요.\n진행 중인 미션을 완료하거나 그만두신 후\n다시 시도해주세요.",
};

/**
 * TopBar 제목 최대 길이
 */
export const MAX_TITLE_LENGTH = 20;
