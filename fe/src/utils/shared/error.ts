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
