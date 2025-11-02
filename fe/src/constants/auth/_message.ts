export const AUTH_MESSAGE = {
  LOGIN: {
    TITLE_FAILURE: "로그인 실패",
    INVALID_CREDENTIALS:
      "계정 아이디(이메일) 또는 비밀번호를 다시 확인해주세요.",
    NETWORK_ERROR:
      "로그인에 실패했습니다. 네트워크 상태를 확인하고 다시 시도해 주세요.",
    BUTTON: "로그인",
    LOADING: "로그인 중...",
    EMAIL: {
      MIN: "이메일을 입력해주세요",
      REGEX: "올바른 이메일 형식을 입력해주세요",
      LABEL: "이메일",
      PLACEHOLDER: "이메일을 입력하세요",
    },
    PASSWORD: {
      LABEL: "비밀번호",
      PLACEHOLDER: "비밀번호를 입력하세요",
      MIN: "비밀번호를 입력해주세요",
      REGEX: "비밀번호는 문자, 숫자를 포함하여 6글자 이상이어야 합니다",
    },
  },
  KAKAO: {
    SUCCESS: "카카오 로그인 성공",
    FAILURE: "카카오 로그인에 실패했습니다. 다시 시도해주세요.",
    CANCELLED: "로그인이 취소되었습니다.",
    POPUP_BLOCKED:
      "팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.",
    NETWORK_ERROR: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    ACCOUNT_EXISTS: "이미 다른 방식으로 가입된 계정입니다.",
  },
  ERROR: {
    NETWORK_ERROR: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    TOO_MANY_REQUESTS: "요청이 많습니다. 잠시 후 다시 시도해주세요.",
    UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
} as const;

export type AuthMessage = typeof AUTH_MESSAGE;
