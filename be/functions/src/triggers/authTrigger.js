const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");
const {AUTH_TYPES, USER_ROLES, USER_STATUS} = require("../constants/userConstants");

// Admin 초기화 (프로덕션에서는 기본 서비스 계정 사용)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Auth Triggers은 1세대 Functions 사용 (현재 파일에서 관리)
const functions = require("firebase-functions");

/**
 * Firebase Auth 사용자 생성 시 자동 실행되는 트리거
 * 최초 가입 시 Firestore users/{uid} 문서 생성
 * 
 * ⚠️ 이메일 중복 체크는 프론트엔드에서 checkEmailAvailability() 호출로 사전 검증됨
 * 이 트리거는 단순히 Firestore 문서 생성만 수행
 */
exports.createUserDocument = functions
    .region("asia-northeast3")
    .auth.user()
    .onCreate(async (user) => {
      try {
        const uid = user.uid;
        const email = user.email;

        console.log("🔥 Auth Trigger: 사용자 생성 감지", {uid, email});

        // Provider ID 추출 및 정규화
        const providerId = user.providerData?.[0]?.providerId;
        let provider = AUTH_TYPES.EMAIL; // 기본값

        if (providerId) {
          if (providerId.startsWith("oidc.")) {
            // OIDC 제공자 (카카오, 구글 등)
            provider = providerId.replace("oidc.", "");
          } else if (providerId === "password") {
            // 이메일/비밀번호 인증
            provider = AUTH_TYPES.EMAIL;
          } else {
            // 기타 제공자
            provider = providerId;
          }
        }

        // 🆕 Firestore 사용자 문서 생성
        const userDoc = {
          // 기본 정보
          name: user.displayName || "", // 이메일: 온보딩 필수, 카카오: 카카오에서 제공
          email: email || null,
          nickname: "", // 온보딩에서 필수 입력
          profileImageUrl: user.photoURL || "",
          birthYear: null, // 이메일: 온보딩 필수, 카카오: 카카오 심사 후 제공
          birthDate: null, // 이메일: 온보딩 필수, 카카오: 카카오 심사 후 제공
          gender: null, // 온보딩에서 선택 입력 (MALE | FEMALE | null)
          phoneNumber: "", // 온보딩에서 선택 입력
          address: "",
          addressDetail: "",

          // 인증 정보
          authType: provider === AUTH_TYPES.EMAIL ? AUTH_TYPES.EMAIL : AUTH_TYPES.SNS,
          snsProvider: provider === AUTH_TYPES.EMAIL ? null : provider,

          // 사용자 상태
          role: USER_ROLES.USER,
          onboardingCompleted: false, // 온보딩 완료 시 true로 변경
          status: USER_STATUS.CREATED, // CREATED → 온보딩 완료 시 PENDING → 이메일 인증 완료 시 ACTIVE

          // 리워드 시스템
          rewardPoints: 0,
          level: 1,
          badges: [],
          points: "0",

          // 스토리지 관리
          uploadQuotaBytes: 1073741824, // 1GB
          usedStorageBytes: 0,

          // 마케팅/유입
          utmSource: "",
          inviter: null,
          penalty: false,

          // 타임스탬프
          createdAt: FieldValue.serverTimestamp(),
          lastLogin: FieldValue.serverTimestamp(),
          lastUpdated: FieldValue.serverTimestamp(),
        };

        // Firestore 문서 생성
        const userRef = admin.firestore().collection("users").doc(uid);
        await userRef.set(userDoc);

        console.log("✅ Auth Trigger: 새 사용자 문서 생성 완료", {uid});

        return {success: true, uid};
      } catch (error) {
        console.error("❌ Auth Trigger: 사용자 문서 생성 실패", error);
        throw error;
      }
    });

/**
 * Firebase Auth 사용자 삭제 시 자동 실행되는 트리거
 */
exports.deleteUserDocument = functions
    .region("asia-northeast3")
    .auth.user()
    .onDelete(async (user) => {
      try {
        const uid = user.uid;

        console.log("🔥 Auth Trigger: 사용자 삭제 감지", {uid});

        // Firestore 사용자 문서 삭제
        const userRef = admin.firestore().collection("users").doc(uid);
        await userRef.delete();

        console.log("✅ Auth Trigger: 사용자 문서 삭제 완료", {uid});

        return {success: true, uid};
      } catch (error) {
        console.error("❌ Auth Trigger: 사용자 문서 삭제 실패", error);
        throw error;
      }
    });
