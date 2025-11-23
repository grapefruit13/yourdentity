/**
 * @description 에러 응답에서 status 코드 추출
 * @param error - 에러 객체 (unknown 타입)
 * @returns HTTP status 코드 또는 null
 */
export const getErrorStatus = (error: unknown): number | null => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "status" in error.response
  ) {
    return (error.response as { status: number }).status;
  }
  return null;
};
