const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // 기본값
  let status = 500;
  let errorMessage = err.message || "Internal server error";

  // 표준 에러 코드 매핑
  switch (err.code) {
    case "BAD_REQUEST":
      status = 400;
      if (!errorMessage) errorMessage = "Bad request";
      break;
    case "PERMISSION_DENIED":
      status = 403;
      if (!errorMessage) errorMessage = "Permission denied";
      break;
    case "NOT_FOUND":
      status = 404;
      if (!errorMessage) errorMessage = "Resource not found";
      break;
    default:
      status = err.status || status;
      break;
  }

  return res.status(status).json({ status, error: errorMessage });
};

module.exports = errorHandler;
