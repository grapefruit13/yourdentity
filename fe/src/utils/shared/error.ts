/**
 * @description 에러 응답에서 status 코드 추출
 * @param error - 에러 객체 (unknown 타입)
 * @returns HTTP status 코드 또는 null
 */
export const getErrorStatus = (error: unknown): number | null => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const { response } = error as { response?: { status?: unknown } };

    if (response && typeof response === "object" && "status" in response) {
      const { status } = response as { status?: unknown };

      return typeof status === "number" ? status : null;
    }
  }

  return null;
};

/**
 * @description 에러 응답에서 메시지 추출
 * @param error - 에러 객체 (unknown 타입)
 * @param defaultMessage - 기본 메시지 (기본값: "오류가 발생했습니다.")
 * @returns 에러 메시지 문자열
 */
export const getErrorMessage = (
  error: unknown,
  defaultMessage = "오류가 발생했습니다."
): string => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};
