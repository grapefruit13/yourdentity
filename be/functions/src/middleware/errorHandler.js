const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // 에러 초기화
  let status = err.status || 500;
  let errorMessage = err.message || null;

  // 표준 에러 코드 매핑
  switch (err.code) {
    case "BAD_REQUEST":
      status = 400;
      errorMessage = errorMessage || "Bad request";
      break;
    case "UNAUTHENTICATED":
      status = 401;
      errorMessage = errorMessage || "Authentication required";
      break;
    case "PERMISSION_DENIED":
    case "UNAUTHORIZED":
    case "AUTHORIZATION_FAILED":
      status = 403;
      errorMessage = errorMessage || "Permission denied";
      break;
    case "NOT_FOUND":
      status = 404;
      errorMessage = errorMessage || "Resource not found";
      break;
    default:
      // status는 이미 err.status || 500으로 초기화됨
      errorMessage = errorMessage || "Internal server error";
      break;
  }

  return res.status(status).json({status, error: errorMessage});
};

module.exports = errorHandler;

