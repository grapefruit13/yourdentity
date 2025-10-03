const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");

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
    this.firestoreService = new FirestoreService('users');
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
      await this.firestoreService.create(userDoc, uid);

      return {
        isNewUser,
        user: {
          uid,
          ...userDoc,
          email: userData.email || null,
        },
      };
    } catch (error) {
      console.error("User provision error:", error.message);
      throw new Error("Failed to provision user");
    }
  }

  /**
   * 사용자 생성 (Firebase Auth + Firestore)
   * @param {Object} userData
   * @return {Promise<Object>} 생성된 사용자 데이터
   */
  async createUser(userData) {
    const {name, email, password, profileImageUrl, birthYear, authType = "email", snsProvider = null} = userData;
    if (!name) { const e = new Error("name is required"); e.code = "BAD_REQUEST"; throw e; }
    if (!email) { const e = new Error("email is required"); e.code = "BAD_REQUEST"; throw e; }
    if (!password) { const e = new Error("password is required"); e.code = "BAD_REQUEST"; throw e; }

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
        console.error("Get all users error:", error.message);
        throw new Error("Failed to get users");
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
      console.error("Get user error:", error.message);
      const e = new Error("Failed to get user");
      e.code = "INTERNAL";
      throw e;
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
        throw new Error(
            "User document not found. Auth trigger may have failed.");
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
      console.error("User update error:", error);
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
      console.error("Update user error:", error.message);
      const e = new Error("Failed to update user");
      e.code = "INTERNAL";
      throw e;
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
      console.error("Delete user error:", error.message);
      const e = new Error("Failed to delete user");
      e.code = "INTERNAL";
      throw e;
    }
  }
}

module.exports = UserService;
