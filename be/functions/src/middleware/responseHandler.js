/**
 * Response Handler Middleware
 * Express res 객체에 표준화된 응답 메서드를 추가합니다.
 * 
 * 응답 형식:
 * - 성공: { status: 200, data: {...} }
 * - 실패: { status: 400, message: "..." }
 */
const responseHandler = (req, res, next) => {
  // 성공 응답 (200)
  res.success = (data = null) => {
    const response = {status: 200};
    if (data !== null && data !== undefined) {
      response.data = data;
    }
    return res.status(200).json(response);
  };

  // 에러 응답
  res.error = (message, statusCode = 400) => {
    if (!message || typeof message !== "string") {
      message = "오류가 발생했습니다";
    }

    if (typeof statusCode !== "number" || statusCode < 100 || statusCode > 599) {
      console.warn(`유효하지 않은 상태 코드: ${statusCode}, 500으로 대체`);
      statusCode = 500;
    }

    return res.status(statusCode).json({
      status: statusCode,
      message,
    });
  };

  // 페이지네이션 응답
  res.paginate = (data, pagination) => {
    if (!Array.isArray(data)) {
      console.warn("페이지네이션: data가 배열이 아닙니다. 배열로 변환합니다");
      data = data ? [data] : [];
    }

    if (!pagination || typeof pagination !== "object") {
      console.warn("페이지네이션: pagination 정보가 없거나 유효하지 않습니다");
      pagination = {
        page: 0,
        size: data.length,
        totalElements: data.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
    }

    return res.status(200).json({
      status: 200,
      data,
      pagination,
    });
  };

  // 생성 성공 응답 (201)
  res.created = (data) => {
    if (!data) {
      console.warn("생성 응답: 201 응답에는 data가 필요합니다");
      data = {};
    }

    return res.status(201).json({
      status: 201,
      data,
    });
  };

  // 삭제 성공 응답 (204)
  res.noContent = () => {
    return res.status(204).send();
  };

  next();
};

module.exports = responseHandler;

