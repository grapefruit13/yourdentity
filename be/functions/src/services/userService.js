const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const NicknameService = require("./nicknameService");
const {AUTH_TYPES, USER_STATUS} = require("../constants/userConstants");
const {isValidPhoneNumber, formatDate} = require("../utils/helpers");

/**
 * User Service (비즈니스 로직 계층)
 * Firebase Auth + Firestore 통합 관리
 */
class UserService {
  constructor() {
    this.firestoreService = new FirestoreService("users");
    this.nicknameService = new NicknameService();
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
    // 1) 현재 사용자 문서 조회 (FirestoreService 사용)
    const existing = await this.firestoreService.getById(uid);
    if (!existing) {
      const e = new Error("User document not found");
      e.code = "NOT_FOUND";
      throw e;
    }

    // 2) 허용 필드 화이트리스트 적용
    const allowedFields = [
      "name",
      "nickname",
      "birthDate",
      "gender",
      "phoneNumber",
    ];
    const update = {};
    for (const key of allowedFields) {
      if (payload[key] !== undefined) update[key] = payload[key];
    }

    // 3) 유효성 검증
    if (update.birthDate !== undefined) {
      try {
        const formattedDate = formatDate(update.birthDate);
        update.birthDate = formattedDate;
      } catch (error) {
        const e = new Error("올바른 날짜 형식이 아닙니다");
        e.code = "INVALID_INPUT";
        throw e;
      }
    }
    if (update.phoneNumber !== undefined) {
      if (!isValidPhoneNumber(update.phoneNumber)) {
        const e = new Error("올바른 전화번호 형식이 아닙니다");
        e.code = "INVALID_INPUT";
        throw e;
      }
      // 전화번호 정규화 (숫자만 추출)
      update.phoneNumber = update.phoneNumber.replace(/[^0-9+]/g, "");
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
    const terms = payload.terms; // { SERVICE: true, PRIVACY: true }
    if (terms) {
      // 필수 약관 체크 (이메일만)
      const isEmail = existing.authType === AUTH_TYPES.EMAIL;
      if (isEmail) {
        const requiredTerms = ["SERVICE", "PRIVACY"];
        for (const requiredType of requiredTerms) {
          if (!terms[requiredType]) {
            const e = new Error(`REQUIRED_TERM_NOT_AGREED: ${requiredType}`);
            e.code = "REQUIRED_TERM_NOT_AGREED";
            throw e;
          }
        }
      }

      // 약관 동의 정보를 users 필드에 저장 (true/false 구조)
      update.serviceTermsAgreed = terms.SERVICE === true;
      update.servicePrivacyAgreed = terms.PRIVACY === true;
      update.termsAgreedAt = FieldValue.serverTimestamp();
    }

    // 5) 제공자별 필수값 체크
    const isEmail = existing.authType === AUTH_TYPES.EMAIL;
    const requiredForEmail = ["name", "nickname", "birthDate"];
    const requiredForKakao = ["nickname"];
    const required = isEmail ? requiredForEmail : requiredForKakao;

    // 필수 필드 체크
    const missing = required.filter((f) => !payload[f]);
    if (missing.length > 0) {
      const e = new Error(`REQUIRE_FIELDS_MISSING: ${missing.join(",")}`);
      e.code = "REQUIRE_FIELDS_MISSING";
      throw e;
    }

    // 약관 동의 체크 (이메일 사용자만)
    if (isEmail && !terms) {
      const e = new Error("TERMS_REQUIRED_FOR_EMAIL");
      e.code = "TERMS_REQUIRED_FOR_EMAIL";
      throw e;
    }

    // 6) 닉네임 설정 (중복 체크 및 예약)
    const nickname = update.nickname;
    const setNickname = typeof nickname === "string" && nickname.trim().length > 0;

    if (setNickname) {
      await this.nicknameService.setNickname(nickname, uid, existing.nickname);
    }

    // 온보딩 완료 처리
    const userUpdate = {
      ...update,
      onboardingCompleted: true, // 모든 필수 정보가 입력되었으므로 완료
      status: USER_STATUS.PENDING, // 이메일 인증 대기 상태
      updatedAt: FieldValue.serverTimestamp(),
    };

    // 사용자 문서 업데이트 (FirestoreService 사용)
    await this.firestoreService.update(uid, userUpdate);
    
    return {onboardingCompleted: true};
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
    const {name, email, password, profileImageUrl, birthDate, authType = "email", snsProvider = null} = userData;
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
      birthDate: birthDate || null,
      authType,
      snsProvider,
      role: "user",
      rewardPoints: 0,
      level: 1,
      badges: [],
      points: "0",
      mainProfileId: "",
      onboardingCompleted: false,
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