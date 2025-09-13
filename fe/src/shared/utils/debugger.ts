const isDev = process.env.NODE_ENV === "development";
type LogLevel = "log" | "warn" | "error";
interface LoggerOptions {
  /** 로그 그룹명 (선택사항) */
  group?: string;
  /** 로그 스타일 (선택사항) */
  style?: string;
}

/**
 * @description 개발 환경에서만 console.log를 출력합니다.
 * @param message - 출력할 메시지
 * @param data - 추가 데이터 (선택사항)
 * @param options - 로깅 옵션 (선택사항)
 */
const log = (
  message: string,
  data?: unknown,
  options?: LoggerOptions
): void => {
  if (!isDev) return;

  const { group, style } = options || {};

  if (group) {
    console.group(`🔍 ${group}`);
  }

  if (style) {
    console.log(`%c${message}`, style, data || "");
  } else {
    console.log(`📝 ${message}`, data || "");
  }

  if (group) {
    console.groupEnd();
  }
};

/**
 * @descriptioin 개발 환경에서만 console.warn을 출력합니다.
 * @param message - 경고 메시지
 * @param data - 추가 데이터 (선택사항)
 * @param options - 로깅 옵션 (선택사항)
 */
const warn = (
  message: string,
  data?: unknown,
  options?: LoggerOptions
): void => {
  if (!isDev) return;

  const { group } = options || {};

  if (group) {
    console.group(`⚠️ ${group}`);
  }

  console.warn(`⚠️ ${message}`, data || "");

  if (group) {
    console.groupEnd();
  }
};

/**
 * @description 개발 환경에서만 console.error를 출력합니다.
 * @param message - 에러 메시지
 * @param data - 추가 데이터 (선택사항)
 * @param options - 로깅 옵션 (선택사항)
 */
const error = (
  message: string,
  data?: unknown,
  options?: LoggerOptions
): void => {
  if (!isDev) return;

  const { group } = options || {};

  if (group) {
    console.group(`❌ ${group}`);
  }

  console.error(`❌ ${message}`, data || "");

  if (group) {
    console.groupEnd();
  }
};

/**
 * @description 개발 환경에서만 조건부 로그를 출력합니다.
 * @param condition - 로그 출력 조건
 * @param message - 출력할 메시지
 * @param data - 추가 데이터 (선택사항)
 * @param level - 로그 레벨 (기본값: 'log')
 */
const logIf = (
  condition: boolean,
  message: string,
  data?: unknown,
  level: LogLevel = "log"
): void => {
  if (!isDev || !condition) return;

  switch (level) {
    case "warn":
      warn(message, data);
      break;
    case "error":
      error(message, data);
      break;
    default:
      log(message, data);
  }
};

/**
 * @description 개발 환경에서만 함수 실행 시간을 측정합니다.
 * @param label - 측정 라벨
 * @param fn - 측정할 함수
 * @returns 함수 실행 결과
 */
const time = async <T>(label: string, fn: () => T | Promise<T>): Promise<T> => {
  if (!isDev) {
    return await fn();
  }

  console.time(`⏱️ ${label}`);
  try {
    const result = await fn();
    console.timeEnd(`⏱️ ${label}`);
    return result;
  } catch (error) {
    console.timeEnd(`⏱️ ${label}`);
    throw error;
  }
};

/**
 * @description 개발 환경에서만 테이블 형태로 데이터를 출력합니다.
 * @param data - 테이블로 출력할 데이터
 * @param label - 테이블 라벨 (선택사항)
 */
const table = (data: unknown, label?: string): void => {
  if (!isDev) return;

  if (label) {
    console.log(`📊 ${label}`);
  }
  console.table(data);
};

/**
 * @description 개발 환경에서만 스택 트레이스를 출력합니다.
 * @param message - 메시지 (선택사항)
 */
const trace = (message?: string): void => {
  if (!isDev) return;

  if (message) {
    console.log(`🔍 ${message}`);
  }
  console.trace();
};

export const debug = {
  log,
  warn,
  error,
  logIf,
  time,
  table,
  trace,
};
