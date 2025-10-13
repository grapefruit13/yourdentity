const authService = require("../services/authService");

/**
 * Auth Controller
 * Firebase Client SDK 기반 인증 시스템의 백엔드 지원
 * - 회원가입/로그인: 프론트엔드에서 Firebase Client SDK 사용
 * - 로그아웃: 백엔드에서 Refresh Token 무효화로 보안 강화
 */
class AuthController {
  /**
   * 로그아웃 API
   * 사용자의 모든 Refresh Token을 무효화하여 기존 토큰 사용 불가능하게 함
   *
   * @description
   * - 프론트엔드에서 auth.signOut() 호출 후 이 API 호출
   * - authService.logout()으로 비즈니스 로직 처리
   * - authGuard에서 tokensValidAfterTime 체크로 로그아웃된 토큰 거부
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      const uid = req.user.uid; // authGuard에서 설정된 사용자 정보

      // authService를 통한 로그아웃 처리
      const result = await authService.logout(uid);

      res.json({
        status: 200,
        data: {
          message: "Logout successful",
          revokedAt: result.revokedAt,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        status: 500,
        error: "Internal server error",
      });
    }
  }

  /**
   * 토큰 검증 테스트용 API (개발/디버깅용)
   * authGuard를 통과하면 사용자 정보 반환
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyToken(req, res) {
    try {
      // authGuard에서 이미 검증 완료
      res.json({
        status: 200,
        data: {
          message: "Token is valid",
          user: req.user,
        },
      });
    } catch (error) {
      console.error("Verify token error:", error);
      res.status(500).json({
        status: 500,
        error: "Internal server error",
      });
    }
  }
}

module.exports = new AuthController();
