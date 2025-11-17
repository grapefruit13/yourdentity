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
   * @param {Function} next - Express next function
   */
  async logout(req, res, next) {
    try {
      const uid = req.user.uid; // authGuard에서 설정된 사용자 정보

      // authService를 통한 로그아웃 처리
      const result = await authService.logout(uid);

      return res.success({
        message: "로그아웃 성공",
        revokedAt: result.revokedAt,
      });
    } catch (error) {
      console.error("로그아웃 에러:", error);
      return next(error);
    }
  }

  /**
   * 토큰 검증 테스트용 API (개발/디버깅용)
   * authGuard를 통과하면 사용자 정보 반환
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async verifyToken(req, res, next) {
    try {
      // authGuard에서 이미 검증 완료
      return res.success({
        message: "토큰이 유효합니다",
        user: req.user,
      });
    } catch (error) {
      console.error("토큰 검증 에러:", error);
      return next(error);
    }
  }

  /**
   * 회원 탈퇴 API
   * 개인정보 가명처리 후 Firebase Auth 사용자 삭제
   *
   * @description
   * - 카카오 로그인 사용자: 카카오 연결 해제 필수
   * - Firestore: 개인정보 제거 + 생년월일 가명처리
   *   * 닉네임 삭제: nicknames 컬렉션에서 해당 사용자의 닉네임 문서 삭제
   *   * 제거: 생년월일(가명처리), deletedAt, lastUpdatedAt을 제외한 모든 필드를 null로 처리
   *     (이름, 이메일, 전화번호, 닉네임, 주소, 프로필 이미지, 자기소개, rewards, profileImagePath 등 모든 필드)
   *   * 가명처리: 생년월일 (YYYY-**-** 형태로 마스킹)
   *   * 유지: 가명처리된 생년월일, 삭제일시(deletedAt), 마지막 업데이트 일자(lastUpdatedAt)만 유지
   * - Firebase Auth: 사용자 삭제
   *
   * @param {Object} req - Express request object
   * @param {Object} req.body.kakaoAccessToken - 카카오 액세스 토큰 (카카오 로그인 사용자만)
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async deleteAccount(req, res, next) {
    try {
      const uid = req.user.uid; // authGuard에서 설정된 사용자 정보
      const {kakaoAccessToken} = req.body || {};

      // authService를 통한 회원 탈퇴 처리
      await authService.deleteAccount(uid, kakaoAccessToken);

      return res.success({
        message: "회원 탈퇴가 완료되었습니다",
      });
    } catch (error) {
      console.error("회원 탈퇴 에러:", error);
      return next(error);
    }
  }
}

module.exports = new AuthController();
