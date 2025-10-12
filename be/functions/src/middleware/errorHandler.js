/**
 * Error Handler Middleware
 * 모든 에러를 표준화된 형식으로 변환하여 응답합니다.
 */
const errorHandler = (err, req, res, next) => {
  console.error("에러 발생:", err);
  if (err.stack) console.error("스택 추적:", err.stack);

  let httpStatus = err.status || 500;
  let errorMessage = err.message || "서버 내부 오류가 발생했습니다";

  // 에러 코드 매핑
  switch (err.code) {
    case "BAD_REQUEST":
    case "VALIDATION_ERROR":
    case "INVALID_INPUT":
    case "MISSING_REQUIRED_FIELD":
      httpStatus = 400;
      if (!err.message) errorMessage = "잘못된 요청입니다";
      break;

    case "UNAUTHENTICATED":
    case "INVALID_TOKEN":
    case "TOKEN_EXPIRED":
    case "AUTHENTICATION_REQUIRED":
      httpStatus = 401;
      if (!err.message) errorMessage = "인증이 필요합니다";
      break;

    case "PERMISSION_DENIED":
    case "UNAUTHORIZED":
    case "AUTHORIZATION_FAILED":
    case "FORBIDDEN":
    case "INSUFFICIENT_PERMISSION":
      httpStatus = 403;
      if (!err.message) errorMessage = "권한이 없습니다";
      break;

    case "NOT_FOUND":
    case "USER_NOT_FOUND":
    case "RESOURCE_NOT_FOUND":
    case "COMMUNITY_NOT_FOUND":
    case "POST_NOT_FOUND":
    case "MISSION_NOT_FOUND":
      httpStatus = 404;
      if (!err.message) errorMessage = "리소스를 찾을 수 없습니다";
      break;

    case "RESOURCE_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS":
    case "EMAIL_ALREADY_EXISTS":
      httpStatus = 409;
      if (!err.message) errorMessage = "이미 존재하는 리소스입니다";
      break;

  }

  // 프로덕션 보안: 500 에러 시 상세 메시지 숨김
  if (httpStatus >= 500 && process.env.NODE_ENV === "production") {
    console.error("원본 에러 메시지 (프로덕션에서 숨김):", errorMessage);
    errorMessage = "서버 내부 오류가 발생했습니다";
  }

  // 표준화된 에러 응답 반환
  if (typeof res.error === "function") {
    return res.error(httpStatus, errorMessage);
  } else {
    console.warn("res.error를 사용할 수 없습니다. 기본 응답을 사용합니다");
    return res.status(httpStatus).json({
      status: httpStatus,
      message: errorMessage,
    });
  }
};

module.exports = errorHandler;

