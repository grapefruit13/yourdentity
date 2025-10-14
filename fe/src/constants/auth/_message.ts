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
} as const;

export type AuthMessage = typeof AUTH_MESSAGE;
