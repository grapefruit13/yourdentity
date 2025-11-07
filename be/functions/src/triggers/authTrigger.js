const {admin, FieldValue} = require("../config/database");
const {AUTH_TYPES, SNS_PROVIDERS, DEFAULT_UPLOAD_QUOTA_BYTES} = require("../constants/userConstants");
const notionUserService = require("../services/notionUserService");


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

        // Provider 확인
        const providerId = user.providerData?.[0]?.providerId || "";
        console.log("Provider ID:", providerId);

        // 🆕 Firestore 사용자 문서 생성
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
          birthDate: "",
          gender: null,

          // 주소 정보
          address: "",
          addressDetail: "",

          // 인증 정보
          authType: AUTH_TYPES.SNS,
          snsProvider: SNS_PROVIDERS.KAKAO,

          // 리워드 시스템
          level: 1,
          badges: [],
          rewards: 0,

          // 스토리지 관리
          uploadQuotaBytes: DEFAULT_UPLOAD_QUOTA_BYTES,
          usedStorageBytes: 0,

          // 약관 기본값 (동기화 시 갱신)
          serviceTermsVersion: null,
          privacyTermsVersion: null,
          age14TermsAgreed: false,
          pushTermsAgreed: false,
          termsAgreedAt: null,

          // 활동 카운트
          activityParticipationCount: 0,
          certificationPosts: 0,
          reportCount: 0,

          // 징계/정지 정보
          suspensionReason: "",
          suspensionStartAt: null,
          suspensionEndAt: null,

          // 타임스탬프
          createdAt: FieldValue.serverTimestamp(),
          lastLogin: FieldValue.serverTimestamp(),
          lastUpdated: FieldValue.serverTimestamp(),
        };

        // Firestore 문서 생성
        const userRef = admin.firestore().collection("users").doc(uid);
        await userRef.set(userDoc);

        console.log("✅ Auth Trigger: 새 사용자 문서 생성 완료", {uid});


        // Notion에 새 사용자 동기화 (비동기로 실행, 실패해도 메인 프로세스에 영향 없음)
        notionUserService.syncSingleUserToNotion(uid)
          .then(result => {
            if (result.success) {
              console.log(`Notion 동기화 완료: ${uid}`);
            } else {
              console.warn(`Notion 동기화 실패: ${uid} - ${result.error || result.reason}`);
            }
          })
          .catch(error => {
            console.error(`Notion 동기화 오류: ${uid}`, error);
          });



        return {success: true, uid};
      } catch (error) {
        console.error("❌ Auth Trigger: 사용자 문서 생성 실패", error);
        throw error;
      }
    });

/**
 * Firebase Auth 사용자 삭제 시 자동 실행되는 트리거
 *
 * ⚠️ 주의: authService.deleteAccount()에서 이미 가명처리를 완료했을 수 있으므로
 * deletedAt 존재 시 추가 작업을 하지 않습니다.
 *
 * 만약 콘솔 등에서 직접 삭제해 가명처리가 되지 않은 경우,
 * 여기서 개인정보 가명처리를 수행합니다.
 */
exports.deleteUserDocument = functions
    .region("asia-northeast3")
    .auth.user()
    .onDelete(async (user) => {
      try {
        const uid = user.uid;

        console.log("🔥 Auth Trigger: 사용자 삭제 감지", {uid});

        // Firestore 문서 확인
        const userRef = admin.firestore().collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const data = userDoc.data() || {};

          if (data.deletedAt) {
            return {success: true, uid, action: "skipped"};
          }

          let maskedBirthDate = null;
          if (data.birthDate && typeof data.birthDate === "string" && data.birthDate.length >= 4) {
            const birthYear = data.birthDate.substring(0, 4);
            maskedBirthDate = `${birthYear}-**-**`;
          }

          const anonymized = {
            name: null,
            email: null,
            phoneNumber: null,
            address: null,
            addressDetail: null,
            profileImageUrl: null,
            bio: null,
            birthDate: maskedBirthDate,
            deletedAt: FieldValue.serverTimestamp(),
            lastUpdated: FieldValue.serverTimestamp(),
          };

          await userRef.update(anonymized);
          console.log("✅ Auth Trigger: 사용자 문서 가명처리 완료", {uid});
          return {success: true, uid, action: "anonymized"};
        }

        console.log("ℹ️ Auth Trigger: Firestore 문서 없음", {uid});
        return {success: true, uid, action: "not_found"};
      } catch (error) {
        console.error("❌ Auth Trigger: 사용자 문서 처리 실패", error);
        throw error;
      }
    });
