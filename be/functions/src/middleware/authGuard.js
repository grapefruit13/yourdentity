const admin = require("firebase-admin");

// Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Firebase ID 토큰 검증 미들웨어
 * Authorization: Bearer <ID_TOKEN> 헤더에서 토큰을 추출하고 검증
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authGuard = async (req, res, next) => {
  // CORS preflight (OPTIONS) 요청은 토큰 검증 없이 통과
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.error(401, "Bearer 토큰이 필요합니다");
    }

    const idToken = authHeader.split("Bearer ")[1];

    if (!idToken) {
      return res.error(401, "잘못된 인증 헤더 형식입니다");
    }

    // Firebase ID 토큰 검증
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Revoke Token 체크 (로그아웃된 토큰 거부)
    const user = await admin.auth().getUser(decodedToken.uid);
    
    if (user.tokensValidAfterTime) {
      const tokenIssuedAt = decodedToken.auth_time * 1000; // 토큰 발급 시간 (ms)
      const tokensRevokedAt = new Date(user.tokensValidAfterTime).getTime(); // Revoke 시간 (ms)

      if (tokenIssuedAt < tokensRevokedAt) {
        console.log("🚫 Revoked token detected:", {
          uid: decodedToken.uid,
          tokenIssuedAt: new Date(tokenIssuedAt).toISOString(),
          tokensRevokedAt: new Date(tokensRevokedAt).toISOString(),
        });

        return res.error(401, "토큰이 무효화되었습니다 (로그아웃됨)");
      }
    }

    // req.user에 사용자 정보 저장
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      customClaims: decodedToken.custom_claims || {},
    };

    next();
  } catch (error) {
    console.error("AuthGuard error:", error.message);

    if (error.code === "auth/id-token-expired") {
      return res.error(401, "토큰이 만료되었습니다");
    }

    if (error.code === "auth/invalid-id-token") {
      return res.error(401, "유효하지 않은 토큰입니다");
    }

    return res.error(401, "인증에 실패했습니다");
  }
};

module.exports = authGuard;
