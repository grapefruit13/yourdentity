const {admin, db} = require("../config/database");

/**
 * 로그아웃 - Refresh Token 무효화
 *
 * @description
 * 사용자의 모든 Refresh Token을 무효화하여 기존 토큰 사용 불가능하게 함
 * - revokeRefreshTokens()로 모든 디바이스의 토큰 무효화
 * - authGuard에서 tokensValidAfterTime 체크로 로그아웃된 토큰 거부
 *
 * @param {string} uid - 사용자 UID
 * @return {{ success: boolean, revokedAt: string }}
 */
const logout = async (uid) => {
  try {
    if (!uid) {
      const error = new Error("UID가 필요합니다");
      error.code = "BAD_REQUEST";
      throw error;
    }

    // 모든 Refresh Token 무효화
    await admin.auth().revokeRefreshTokens(uid);

    // tokensValidAfterTime 업데이트됨 (현재 시간)
    const user = await admin.auth().getUser(uid);

    console.log(`✅ AuthService: Logout - Tokens revoked at ${user.tokensValidAfterTime}`, {
      uid,
    });

    return {
      success: true,
      revokedAt: user.tokensValidAfterTime,
    };
  } catch (error) {
    console.error("❌ AuthService: Logout 실패:", error);
    throw error;
  }
};

/**
 * 회원 탈퇴 - 개인정보 가명처리 + 카카오 연결 해제
 *
 * @description
 * 1. 카카오 로그인 사용자인 경우 카카오 연결 해제
 * 2. Firebase Auth 사용자 삭제 (가명처리는 onDelete 트리거에서 수행)
 *
 * **개인정보 처리:**
 * - 닉네임 삭제: nicknames 컬렉션에서 해당 사용자의 닉네임 문서 삭제 (onDelete 트리거에서 처리)
 * - 제거: 생년월일(가명처리), deletedAt, lastUpdatedAt을 제외한 모든 필드를 null로 처리
 *   (이름, 이메일, 전화번호, 닉네임, 주소, 프로필 이미지, 자기소개, rewards, profileImagePath 등 모든 필드)
 * - 가명처리: 생년월일 (YYYY-**-** 형태로 마스킹)
 * - 유지: 가명처리된 생년월일, 삭제일시(deletedAt), 마지막 업데이트 일자(lastUpdatedAt)만 유지
 *
 * @param {string} uid - 사용자 UID
 * @param {string} kakaoAccessToken - 카카오 액세스 토큰 (카카오 로그인 사용자인 경우 필수)
 * @return {{ success: boolean }}
 */
const deleteAccount = async (uid, kakaoAccessToken) => {
  try {
    if (!uid) {
      const error = new Error("UID가 필요합니다");
      error.code = "BAD_REQUEST";
      throw error;
    }

    // 1. Firebase Auth 사용자 정보 조회
    const user = await admin.auth().getUser(uid);
    const isKakaoUser = user.providerData.some(
        (provider) => provider.providerId === "oidc.kakao",
    );

    // 2. 카카오 로그인 사용자인 경우, 카카오 연결 해제
    if (isKakaoUser) {
      if (!kakaoAccessToken) {
        const error = new Error("카카오 액세스 토큰이 필요합니다");
        error.code = "BAD_REQUEST";
        throw error;
      }

      try {
        const response = await fetch("https://kapi.kakao.com/v1/user/unlink", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${kakaoAccessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "",
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          console.error("❌ AuthService: 카카오 연결 해제 실패:", response.status, text);
        } else {
          console.log("✅ AuthService: 카카오 연결 해제 완료", {uid});
        }
      } catch (kakaoError) {
        console.error("❌ AuthService: 카카오 연결 해제 예외:", kakaoError);
        // 카카오 연결 해제 실패해도 계속 진행 (토큰 만료 등의 경우)
      }
    }

    // 3. Firebase Auth 사용자 삭제 (가명처리는 onDelete 트리거에서 처리)
    await admin.auth().deleteUser(uid);
    console.log("✅ AuthService: Firebase Auth 사용자 삭제 완료", {uid});

    return {success: true};
  } catch (error) {
    console.error("❌ AuthService: 회원 탈퇴 실패:", error);
    throw error;
  }
};

/**
 * 자격정지 상태 체크
 *
 * @description
 * Firestore에서 사용자의 자격정지 정보를 조회하여 현재 정지 상태인지 확인
 * - suspensionStartAt, suspensionEndAt 기간 내에 있는지 체크
 * - 정지 중이면 정지 사유와 종료일 반환
 *
 * @param {string} uid - 사용자 UID
 * @return {Promise<{isSuspended: boolean, suspensionReason?: string, suspensionEndAt?: string}>}
 */
const checkSuspensionStatus = async (uid) => {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      // 사용자 문서가 없으면 정지되지 않은 것으로 간주
      return {isSuspended: false};
    }

    const userData = userDoc.data();
    const {suspensionStartAt, suspensionEndAt, suspensionReason} = userData;

    // 자격정지 기간 체크
    if (!suspensionStartAt || !suspensionEndAt) {
      // 자격정지 정보가 없으면 정지되지 않은 것으로 간주
      return {isSuspended: false};
    }

    const now = new Date();
    // Firestore Timestamp 객체를 Date로 변환 (toDate 메서드가 있으면 사용, 없으면 new Date 사용)
    const startDate = suspensionStartAt?.toDate?.() || new Date(suspensionStartAt);
    const endDate = suspensionEndAt?.toDate?.() || new Date(suspensionEndAt);

    // 현재 시간이 자격정지 기간 내인지 확인
    const isSuspended = now >= startDate && now < endDate;

    return {
      isSuspended,
      suspensionReason: isSuspended ? (suspensionReason || "자격정지 상태입니다") : undefined,
      // 이미 변환된 endDate를 ISO 문자열로 반환 (타입 일관성 보장)
      suspensionEndAt: isSuspended ? endDate.toISOString() : undefined,
    };
  } catch (error) {
    console.error("❌ AuthService: 자격정지 체크 실패:", error.message);
    // 에러 발생 시 정지되지 않은 것으로 간주 (안전한 실패)
    return {isSuspended: false};
  }
};

module.exports = {
  logout,
  deleteAccount,
  checkSuspensionStatus,
};

