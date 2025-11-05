/**
 * Error Handler Middleware
 * 모든 에러를 표준화된 형식으로 변환하여 응답합니다.
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 * @return {void}
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
    case "INVALID_FILE_TYPE":
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
    case "CONFLICT":
      httpStatus = 409;
      if (!err.message) errorMessage = "이미 존재하는 리소스입니다";
      break;

    case "USER_ALREADY_EXISTS":
      httpStatus = 409;
      if (!err.message) errorMessage = "이미 존재하는 사용자입니다";
      break;

    case "NICKNAME_TAKEN":
      httpStatus = 409;
      if (!err.message) errorMessage = "이미 사용 중인 닉네임입니다";
      break;

    case "PARTIAL_SUCCESS":
      httpStatus = 500;
      if (!err.message) errorMessage = "일부 작업이 완료되지 않았습니다";
      break;

    case "REQUIRE_FIELDS_MISSING":
      httpStatus = 400;
      if (!err.message) errorMessage = "필수 입력 항목이 누락되었습니다";
      break;

    case "DUPLICATE_REPORT":
    httpStatus = 400;
    if (!err.message) errorMessage = "이미 신고한 콘텐츠입니다";
    break;

    case "NOTION_DATABASE_NOT_FOUND":
    case "NOTION_SYNC_FAILED":
      httpStatus = 500;
      if (!err.message) errorMessage = "Notion 서비스 오류가 발생했습니다";
      break;

    case "REPORT_CREATION_FAILED":
    case "REPORTS_FETCH_FAILED":
      httpStatus = 500;
      if (!err.message) errorMessage = "신고 처리 중 오류가 발생했습니다";
      break;

    case "MISSING_COMMUNITY_ID":
      httpStatus = 400;
      if (!err.message) errorMessage = "communityId가 필요합니다. 게시글은 반드시 커뮤니티 하위에 존재합니다.";
      break;

    case "NOTION_POST_NOT_FOUND":
      httpStatus = 404;
      if (!err.message) errorMessage = "신고하려는 게시글을 찾을 수 없습니다.";
      break;

    case "SUSPENSION_PERIOD_REQUIRED":
      httpStatus = 400;
      if (!err.message) errorMessage = "자격정지 상태가 일시정지인 경우 자격정지 기간을 입력해주세요.";
      break;

    case "COMMENT_NOT_FOUND":
      httpStatus = 404;
      if (!err.message) errorMessage = "신고하려는 댓글을 찾을 수 없습니다.";
      break;

    case "KAKAO_USERINFO_FAILED":
      httpStatus = 400;
      if (!err.message) errorMessage = "카카오 사용자 정보 조회에 실패했습니다";
      break;

    case "REQUIRED_FIELDS_MISSING":
      httpStatus = 400;
      if (!err.message) errorMessage = "필수 입력 항목이 누락되었습니다";
      break;

    case "INTERNAL_ERROR":
      httpStatus = 500;
      if (!err.message) errorMessage = "서버 내부 오류가 발생했습니다";
      break;

    case "UNSUPPORTED_PROVIDER":
      httpStatus = 400;
      if (!err.message) errorMessage = "지원하지 않는 로그인 방식입니다";
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

