const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");

// Admin 초기화 (프로덕션에서는 기본 서비스 계정 사용)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Auth Triggers은 1세대 Functions 사용 (현재 파일에서 관리)
const functions = require("firebase-functions");

/**
 * Firebase Auth 사용자 생성 시 자동 실행되는 트리거
 * 최초 가입 시 Firestore users/{uid} 문서 생성
 * 이메일 중복 시 기존 문서에 provider 추가 (계정 통합)
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
        let provider = "email"; // 기본값

        if (providerId) {
          if (providerId.startsWith("oidc.")) {
            // OIDC 제공자 (카카오, 구글 등)
            provider = providerId.replace("oidc.", "");
          } else if (providerId === "password") {
            // 이메일/비밀번호 인증
            provider = "email";
          } else {
            // 기타 제공자
            provider = providerId;
          }
        }

        // 🔍 이메일로 기존 Firestore 문서 찾기 (중복 방지)
        if (email) {
          const existingUserQuery = await admin.firestore()
              .collection("users")
              .where("email", "==", email)
              .limit(1)
              .get();

          if (!existingUserQuery.empty) {
            // ⚠️ 기존 사용자 발견 → 중복 가입 차단
            const existingDoc = existingUserQuery.docs[0];
            const existingData = existingDoc.data();

            console.log("⚠️ Auth Trigger: 이메일 중복 감지, 신규 계정 삭제", {
              existingUID: existingDoc.id,
              newUID: uid,
              email,
              existingProvider: existingData.authType,
              newProvider: provider,
            });

            // 신규 생성된 Firebase Auth 계정 삭제
            await admin.auth().deleteUser(uid);

            console.log("✅ Auth Trigger: 중복 계정 삭제 완료", {
              deletedUID: uid,
              existingUID: existingDoc.id,
            });

            // 에러 반환 (프론트엔드에서 처리)
            throw new functions.https.HttpsError(
                "already-exists",
                `이미 ${existingData.authType === "email" ? "이메일" : existingData.snsProvider}로 가입된 계정입니다.`,
                {existingProvider: existingData.authType, email},
            );
          }
        }

        // 🆕 기존 사용자 없음 → 새 문서 생성
        const userDoc = {
        // 기본 정보
          name: user.displayName || "사용자 이름", // 추후 온보딩에서 설정
          email: email || null,
          profileImageUrl: user.photoURL || "",
          birthYear: null, // 추후 카카오 심사 후 제공
          phoneNumber: "",
          phoneVerified: false,

          // 인증 정보
          authType: provider === "email" ? "email" : "sns",
          snsProvider: provider === "email" ? null : provider,

          // 사용자 상태
          role: "user",
          onBoardingComplete: false,

          // 리워드 시스템
          rewardPoints: 0,
          level: 1,
          badges: [],
          points: "0",
          mainProfileId: "", // 온보딩에서 멀티프로필 생성 후 설정

          // 스토리지 관리
          uploadQuotaBytes: 1073741824, // 1GB
          usedStorageBytes: 0,

          // 타임스탬프
          createdAt: FieldValue.serverTimestamp(),
          lastLogin: FieldValue.serverTimestamp(),
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
