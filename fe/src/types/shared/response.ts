interface StatusCode {
  status: number;
}

/**
 * @description API 요청 성공 시 응답
 */
export type Result<TData> = { data: TData } & StatusCode;

/**
 * @description API 요청 실패 시 응답
 */
export type ErrorResponse = {
  message: string;
} & StatusCode;
