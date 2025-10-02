/**
 * Swagger API 응답 캡처 미들웨어
 * 개발 모드에서 API 응답을 자동으로 캡처하여 Swagger 문서 생성에 활용
 */

// 캡처된 데이터를 저장할 Map
const capturedData = new Map();

/**
 * API 응답 캡처 미들웨어
 * @return {Function} Express 미들웨어 함수
 */
const capture = () => {
  return (req, res, next) => {
    // 원본 res.json 메서드를 백업
    const originalJson = res.json;

    // res.json을 오버라이드하여 응답을 캡처
    res.json = function(body) {
      try {
        // API 엔드포인트 정보 캡처
        const endpoint = {
          method: req.method,
          baseUrl: req.baseUrl || "",
          path: req.route ? req.route.path : req.path,
          originalUrl: req.originalUrl,
          statusCode: res.statusCode,
          response: body,
          timestamp: new Date().toISOString(),
        };

        // 경로 정규화 (baseUrl + path)
        const normalizedPath = (endpoint.baseUrl || "") + (endpoint.path || "");
        endpoint.normalizedPath = normalizedPath || endpoint.originalUrl;

        // 엔드포인트 키 생성 (method + normalizedPath)
        const key = `${endpoint.method} ${endpoint.normalizedPath}`;

        // 캡처된 데이터 저장
        capturedData.set(key, endpoint);

        console.log(`📝 API 응답 캡처됨: ${key} (${res.statusCode})`);
      } catch (error) {
        console.error("❌ API 응답 캡처 중 오류:", error);
      }

      // 원본 res.json 호출
      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * 캡처된 데이터 조회
 * @return {Map} 캡처된 API 응답 데이터
 */
const getCapturedData = () => {
  return capturedData;
};

/**
 * 캡처된 데이터를 OpenAPI 스펙 형태로 변환
 * @return {Object} OpenAPI 스펙 객체
 */
const toOpenAPISpec = () => {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "Yourdentity API (자동 캡처)",
      version: "1.0.0",
      description: "자동으로 캡처된 API 응답을 기반으로 생성된 문서",
    },
    paths: {},
  };

  capturedData.forEach((endpoint) => {
    const path = endpoint.normalizedPath || endpoint.originalUrl;
    const method = endpoint.method.toLowerCase();

    if (!spec.paths[path]) {
      spec.paths[path] = {};
    }

    spec.paths[path][method] = {
      summary: `자동 캡처된 ${method.toUpperCase()} ${path}`,
      responses: {
        [endpoint.statusCode]: {
          description: "자동 캡처된 응답",
          content: {
            "application/json": {
              schema: {
                type: "object",
                example: endpoint.response,
              },
            },
          },
        },
      },
    };
  });

  return spec;
};

/**
 * 캡처된 데이터 초기화
 */
const clearCapturedData = () => {
  capturedData.clear();
  console.log("🗑️ 캡처된 데이터가 초기화되었습니다.");
};

module.exports = {
  capture,
  getCapturedData,
  toOpenAPISpec,
  clearCapturedData,
};
