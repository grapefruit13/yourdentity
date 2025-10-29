const {admin, FieldValue} = require("../config/database");
const {AUTH_TYPES, USER_ROLES} = require("../constants/userConstants");

// Auth Triggers은 1세대 Functions 사용 (현재 파일에서 관리)
const functions = require("firebase-functions");

/**
 * Firebase Auth 사용자 생성 시 자동 실행되는 트리거
 * 최초 가입 시 Firestore users/{uid} 문서 생성
 */
exports.createUserDocument = functions
    .region("asia-northeast3")
    .auth.user()
    .onCreate(async (user) => {
      try {
        const uid = user.uid;
        const email = user.email;

        console.log("🔥 Auth Trigger: 사용자 생성 감지", {uid, email});

        // Provider 정규화 및 검증 (에뮬레이터에서는 건너뜀)
        const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
        if (!isEmulator) {
          const providerId = user.providerData?.[0]?.providerId || "";
          // OIDC Provider인지 확인
          if (!providerId || !providerId.startsWith("oidc.")) {
            const err = new Error("지원하지 않는 Provider: 지원하는 OIDC가 아니며 Provider를 식별할 수 없습니다");
            err.code = "UNSUPPORTED_PROVIDER";
            throw err;
          }
        }

        // 🆕 Firestore 사용자 문서 생성 (기본 정보만)
        // 참고: gender, birthday, phoneNumber, terms는 동기화 API에서 채움
        const userDoc = {
          // 기본 정보
          name: user.displayName || null,
          email: email || null,
          phoneNumber: null,
          
          // 프로필
          nickname: "",
          profileImageUrl: user.photoURL || "",
          bio: "",
          
          // 개인정보
          birthDate: null,
          gender: null,
          
          // 주소 정보
          address: "",
          addressDetail: "",

          // 인증 정보
          authType: AUTH_TYPES.SNS,
          snsProvider: "kakao",

          // 사용자 상태
          role: USER_ROLES.USER,
          onboardingCompleted: false,

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
