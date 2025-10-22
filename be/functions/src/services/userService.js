const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const TermsService = require("./termsService");
const {REQUIRED_TERMS} = require("../schemas/userTermsSchema");

// Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * User Service (비즈니스 로직 계층)
 * Firebase Auth + Firestore 통합 관리
 */
class UserService {
  constructor() {
    this.firestoreService = new FirestoreService("users");
    this.termsService = new TermsService();
  }

  /**
   * 온보딩 업데이트
   * - 허용 필드만 부분 업데이트
   * - 제공자별 필수값 검증
   * - 닉네임 중복 방지(트랜잭션, nicknames/{lowerNick})
   * - 완료 조건 충족 시 onboardingCompleted=true
   * @param {Object} params
   * @param {string} params.uid
   * @param {Object} params.payload
   * @return {Promise<{onboardingCompleted:boolean}>}
   */
  async updateOnboarding({uid, payload}) {
    const db = admin.firestore();

    // 1) 현재 사용자 문서 조회
    const userRef = db.collection("users").doc(uid);
    const snap = await userRef.get();
    if (!snap.exists) {
      const e = new Error("User document not found");
      e.code = "NOT_FOUND";
      throw e;
    }
    const existing = snap.data() || {};

    // 2) 허용 필드 화이트리스트 적용
    const allowedFields = [
      "name",
      "nickname",
      "birthYear",
      "birthDate",
      "gender",
      "phoneNumber",
    ];
    const update = {};
    for (const key of allowedFields) {
      if (payload[key] !== undefined) update[key] = payload[key];
    }

    // 3) 유효성 검증
    const currentYear = new Date().getFullYear();
    if (update.birthYear !== undefined) {
      const y = Number(update.birthYear);
      if (!Number.isInteger(y) || y < 1900 || y > currentYear) {
        const e = new Error("INVALID_BIRTH_YEAR");
        e.code = "INVALID_INPUT";
        throw e;
      }
      update.birthYear = y;
    }
    if (update.birthDate !== undefined) {
      const re = /^\d{4}-\d{2}-\d{2}$/;
      if (!re.test(String(update.birthDate))) {
        const e = new Error("INVALID_BIRTH_DATE_FORMAT");
        e.code = "INVALID_INPUT";
        throw e;
      }
      const d = new Date(update.birthDate);
      // Date 유효성: toString() NaN 체크 및 월/일 보정
      const [yy, mm, dd] = String(update.birthDate).split("-").map(Number);
      if (
        Number.isNaN(d.getTime()) ||
        d.getUTCFullYear() !== yy ||
        d.getUTCMonth() + 1 !== mm ||
        d.getUTCDate() !== dd
      ) {
        const e = new Error("INVALID_BIRTH_DATE_VALUE");
        e.code = "INVALID_INPUT";
        throw e;
      }
    }
    if (update.phoneNumber !== undefined) {
      const normalized = String(update.phoneNumber).replace(/[^0-9+]/g, "");
      if (normalized.length < 9) {
        const e = new Error("INVALID_PHONE_NUMBER");
        e.code = "INVALID_INPUT";
        throw e;
      }
      update.phoneNumber = normalized;
    }
    if (update.gender !== undefined) {
      const validGenders = ["MALE", "FEMALE", null];
      if (!validGenders.includes(update.gender)) {
        const e = new Error("INVALID_GENDER");
        e.code = "INVALID_INPUT";
        throw e;
      }
    }

    // 4) 약관 동의 처리
    const terms = payload.terms; // { SERVICE: true, PRIVACY: true, MARKETING: false }
    if (terms) {
      // 필수 약관 체크 (이메일만)
      const isEmail = existing.authType === "email";
      if (isEmail) {
        for (const requiredType of REQUIRED_TERMS) {
          if (!terms[requiredType]) {
            const e = new Error(`REQUIRED_TERM_NOT_AGREED: ${requiredType}`);
            e.code = "REQUIRED_TERM_NOT_AGREED";
            e.status = 400;
            throw e;
          }
        }
      }

      // 약관 동의 레코드 생성
      const termRecords = Object.keys(terms).map((type) => ({
        type,
        agreed: terms[type],
      }));
      await this.termsService.createTermConsents(uid, termRecords);
    }

    // 5) 제공자별 필수값 계산 (기존값+업데이트 병합 후 판단)
    const merged = {...existing, ...update};
    //const isEmail = (existing.authType || existing.providerId) === "email" || existing.snsProvider === null || existing.providerId === "password";
    const isEmail = existing.authType === "email";
    const requiredForEmail = ["name", "nickname", "birthYear", "birthDate"];
    const requiredForKakao = ["nickname"];
    const required = isEmail ? requiredForEmail : requiredForKakao;

    // 이메일: 약관 동의 필수
    if (isEmail && !terms) {
      const e = new Error("TERMS_REQUIRED_FOR_EMAIL");
      e.code = "TERMS_REQUIRED_FOR_EMAIL";
      e.status = 400;
      throw e;
    }

    const missing = required.filter((f) => !merged[f]);
    if (missing.length > 0) {
      const e = new Error(`REQUIRE_FIELDS_MISSING: ${missing.join(",")}`);
      e.code = "REQUIRE_FIELDS_MISSING";
      e.status = 400;
      throw e;
    }

    // 6) 닉네임 점유 트랜잭션 (닉네임이 존재할 때만)
    const nickname = update.nickname;
    const doNicknameReservation = typeof nickname === "string" && nickname.trim().length > 0;

    const result = await db.runTransaction(async (tx) => {
      let onboardingCompleted = false;

      // 닉네임 처리
      if (doNicknameReservation) {
        const lower = nickname.toLowerCase();
        const nickRef = db.collection("nicknames").doc(lower);
        const nickDoc = await tx.get(nickRef);
        if (nickDoc.exists && nickDoc.data()?.uid !== uid) {
          const e = new Error("NICKNAME_TAKEN");
          e.code = "NICKNAME_TAKEN";
          e.status = 409;
          throw e;
        }
        tx.set(nickRef, {uid});

        // 기존 닉네임과 다르면 이전 키 해제 (선택적)
        const prevNick = existing.nickname;
        if (prevNick && prevNick.toLowerCase() !== lower) {
          const prevRef = db.collection("nicknames").doc(prevNick.toLowerCase());
          tx.delete(prevRef);
        }
      }

      // 온보딩 완료 여부 (필수 필드 + 약관 동의 완료)
      const fieldsCompleted = required.every((f) => !!merged[f]);
      const termsCompleted = isEmail ? !!terms : true; // 이메일: 약관 필수, 카카오: 불필요
      onboardingCompleted = fieldsCompleted && termsCompleted;

      const userUpdate = {
        ...update,
        onboardingCompleted,
        updatedAt: FieldValue.serverTimestamp(),
      };

      // 온보딩 완료 시 status를 ACTIVE로 변경
      if (onboardingCompleted) {
        userUpdate.status = "ACTIVE";
      }

      tx.update(userRef, userUpdate);

      return {onboardingCompleted};
    });

    return result;
  }
  /**
   * Firebase Auth 사용자 생성 또는 조회
   * @param {string} uid - 사용자 ID
   * @param {Object} userData - 사용자 데이터
   * @return {Promise<Object>} 사용자 정보와 신규 여부
   */
  async provisionUser(uid, userData = {}) {
    try {
      let isNewUser = false;

      try {
        // 기존 사용자 조회
        await admin.auth().getUser(uid);
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          // 신규 사용자 생성
          const createUserData = {
            uid: uid,
            displayName: userData.name || "사용자",
            emailVerified: false,
          };

          // 이메일은 존재할 때만 설정 (null/undefined는 전달하지 않음)
          if (userData.email) {
            createUserData.email = userData.email;
          }

          await admin.auth().createUser(createUserData);
          isNewUser = true;
        } else {
          throw error;
        }
      }

      // Provider ID 추출 (oidc.kakao → kakao)
      const provider = userData.providerId?.replace("oidc.", "") || "kakao";

      const userDoc = {
        // 기본 정보
        name: userData.name || "사용자 이름",
        email: userData.email || null,
        profileImageUrl: userData.profileImageUrl || "",
        birthYear: userData.birthYear || null,
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
        mainProfileId: "",

        // 스토리지 관리
        uploadQuotaBytes: 1073741824, // 1GB
        usedStorageBytes: 0,

        // 타임스탬프
        lastLogin: FieldValue.serverTimestamp(),
      };

      // FirestoreService를 활용한 문서 생성/업데이트
      if (isNewUser) {
        // 신규 사용자: 전체 문서 생성
        await this.firestoreService.create(userDoc, uid);
      } else {
        // 기존 사용자: 명시적으로 제공된 필드만 업데이트 (기존 데이터 보존)
        const updateData = {
          lastLogin: FieldValue.serverTimestamp(),
        };

        if (userData.name !== undefined) updateData.name = userData.name;
        if (userData.email !== undefined) updateData.email = userData.email;
        if (userData.profileImageUrl !== undefined) {
          updateData.profileImageUrl = userData.profileImageUrl;
        }
        if (userData.providerId !== undefined) {
          const providerId = userData.providerId.replace("oidc.", "");
          updateData.authType = providerId === "email" ? "email" : "sns";
          updateData.snsProvider = providerId === "email" ? null : providerId;
        }

        await this.firestoreService.update(uid, updateData);
      }

      return {
        isNewUser,
        user: {
          uid,
          ...userDoc,
          email: userData.email || null,
        },
      };
    } catch (error) {
      console.error("사용자 프로비저닝 에러:", error.message);
      throw new Error("사용자 프로비저닝에 실패했습니다");
    }
  }

  /**
   * 사용자 생성 (Firebase Auth + Firestore)
   * 
   * ⚠️ **테스트용 메서드 - Firebase Admin SDK 방식**
   * 
   * **프로덕션에서는 사용하지 마세요!**
   * - 실제 회원가입: 프론트엔드에서 Firebase Client SDK 사용
   * - createUserWithEmailAndPassword(auth, email, password)
   * - Auth Trigger가 자동으로 Firestore 문서 생성
   * 
   * @param {Object} userData
   * @return {Promise<Object>} 생성된 사용자 데이터
   */
  async createUser(userData) {
    const {name, email, password, profileImageUrl, birthYear, authType = "email", snsProvider = null} = userData;
    if (!name) {
      const e = new Error("이름이 필요합니다");
      e.code = "BAD_REQUEST";
      throw e;
    }
    if (!email) {
      const e = new Error("이메일이 필요합니다");
      e.code = "BAD_REQUEST";
      throw e;
    }
    if (!password) {
      const e = new Error("비밀번호가 필요합니다");
      e.code = "BAD_REQUEST";
      throw e;
    }

    // Firebase Auth 사용자 생성
    const authUser = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
      emailVerified: false,
      photoURL: profileImageUrl || null,
    });

    // Firestore 사용자 문서 생성
    const firestoreUser = {
      name,
      email: email,
      profileImageUrl: profileImageUrl || "",
      birthYear: birthYear || null,
      authType,
      snsProvider,
      role: "user",
      rewardPoints: 0,
      level: 1,
      badges: [],
      points: "0",
      mainProfileId: "",
      onBoardingComplete: false,
      uploadQuotaBytes: 1073741824, // 1GB
      usedStorageBytes: 0,
    };

    const created = await this.firestoreService.create(firestoreUser, authUser.uid);
    return {uid: authUser.uid, ...created};
  }

  /**
   * 모든 사용자 조회
   * @return {Promise<Array>} 사용자 목록
   */
  async getAllUsers() {
    try {
      return await this.firestoreService.getAll();
    } catch (error) {
      console.error("사용자 목록 조회 에러:", error.message);
      throw new Error("사용자 목록을 조회할 수 없습니다");
    }
  }

  /**
   * 사용자 정보 조회
   * @param {string} uid - 사용자 ID
   * @return {Promise<Object|null>} 사용자 정보
   */
  async getUserById(uid) {
    try {
      return await this.firestoreService.getById(uid);
    } catch (error) {
      console.error("사용자 조회 에러:", error.message);
      throw new Error("사용자를 조회할 수 없습니다");
    }
  }

  /**
   * 온보딩 프로비저닝용 : 사용자 정보 업데이트
   * Auth Trigger로 생성된 사용자 문서를 업데이트
   * @param {string} uid - 사용자 ID
   * @param {Object} userData - 업데이트할 사용자 데이터
   * @return {Promise<Object>} 업데이트된 사용자 정보
   */
  async updateUserInfo(uid, userData) {
    try {
      const userRef = admin.firestore().collection("users").doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        const e = new Error("사용자 문서를 찾을 수 없습니다. Auth Trigger 실패 가능성 있음");
        e.code = "NOT_FOUND";
        throw e;
      }

      // 업데이트할 정보만 필터링
      const updateData = {};

      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.profileImageUrl !== undefined) updateData.profileImageUrl = userData.profileImageUrl;
      if (userData.birthYear !== undefined) updateData.birthYear = userData.birthYear;
      if (userData.authType !== undefined) updateData.authType = userData.authType;
      if (userData.snsProvider !== undefined) updateData.snsProvider = userData.snsProvider;

      // lastLogin 업데이트
      updateData.lastLogin = FieldValue.serverTimestamp();

      // Firestore 문서 업데이트
      await userRef.update(updateData);

      // 업데이트된 문서 조회
      const updatedDoc = await userRef.get();

      return {
        user: updatedDoc.data(),
      };
    } catch (error) {
      console.error("사용자 정보 업데이트 에러:", error);
      throw error;
    }
  }

  /**
   * 일반 수정용 : 사용자 정보 업데이트
   * @param {string} uid - 사용자 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @return {Promise<Object>} 업데이트된 사용자 정보
   */
  async updateUser(uid, updateData) {
    try {
      // 업데이트 데이터에 updatedAt 추가
      const updatePayload = {
        ...updateData,
        updatedAt: FieldValue.serverTimestamp(),
      };

      return await this.firestoreService.update(uid, updatePayload);
    } catch (error) {
      console.error("사용자 업데이트 에러:", error.message);
      throw new Error("사용자 정보를 업데이트할 수 없습니다");
    }
  }

  /**
   * 사용자 삭제 (Firebase Auth + Firestore)
   * @param {string} uid
   * @return {Promise<void>}
   */
  async deleteUser(uid) {
    try {
      await admin.auth().deleteUser(uid);
      await this.firestoreService.delete(uid);
    } catch (error) {
      console.error("사용자 삭제 에러:", error.message);
      throw new Error("사용자를 삭제할 수 없습니다");
    }
  }
}

module.exports = UserService;