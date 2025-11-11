const {admin} = require("../config/database");

/**
 * 선택적 인증 미들웨어
 * - Authorization 헤더가 없으면 그대로 통과
 * - Bearer 토큰이 있으면 검증 후 req.user에 최소 정보 저장
 * - 토큰이 잘못됐더라도 요청을 차단하지 않고 경고만 남김
 */
module.exports = async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      return next();
    }

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = req.user || {};
    if (!req.user.uid) {
      req.user.uid = decoded.uid;
    }
    if (!req.user.email && decoded.email) {
      req.user.email = decoded.email;
    }
    if (req.user.emailVerified === undefined && decoded.email_verified !== undefined) {
      req.user.emailVerified = decoded.email_verified;
    }
    req.user.customClaims = req.user.customClaims || decoded.custom_claims || {};
  } catch (error) {
    console.warn("[optionalAuth] 토큰 검증 실패:", error.message);
  }

  return next();
};

