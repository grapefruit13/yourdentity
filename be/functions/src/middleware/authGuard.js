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
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        error: "Authorization header with Bearer token required",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];

    if (!idToken) {
      return res.status(401).json({
        status: 401,
        error: "Invalid authorization header format",
      });
    }

    // Firebase ID 토큰 검증
    const decodedToken = await admin.auth().verifyIdToken(idToken);

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
      return res.status(401).json({
        status: 401,
        error: "Token expired",
      });
    }

    if (error.code === "auth/invalid-id-token") {
      return res.status(401).json({
        status: 401,
        error: "Invalid token",
      });
    }

    return res.status(401).json({
      status: 401,
      error: "Authentication failed",
    });
  }
};

module.exports = authGuard;
