const UserService = require("../services/userService");

// 서비스 인스턴스 생성
const userService = new UserService();

/**
 * User Controller
 */

class UserController {
  /**
   * 사용자 생성 API (Firebase Auth + Firestore 생성)
   * 
   * ⚠️ **테스트용 API - Firebase Admin SDK 방식**
   * 
   * **프로덕션에서는 사용하지 마세요!**
   * - 실제 회원가입: 프론트엔드에서 Firebase Client SDK 사용
   * - createUserWithEmailAndPassword(auth, email, password)
   * - Auth Trigger가 자동으로 Firestore 문서 생성
   *
   * 사용 시나리오 (테스트/개발용):
   * - 관리자가 수동으로 사용자를 생성해야 하는 경우
   * - 테스트/개발용 사용자 생성
   * - 이메일/비밀번호로 사용자 생성
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createUser(req, res, next) {
    try {
      const result = await userService.createUser(req.body);
      return res.success(result);
    } catch (error) {
      console.error("사용자 생성 에러:", error);
      return next(error);
    }
  }

  /**
   * 모든 사용자 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.success({users, count: users.length});
    } catch (error) {
      return next(error);
    }
  }

  /**
     * 사용자 정보 조회 API
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
  /**
   * 본인 정보 조회
   * GET /users/me
   */
  async getMe(req, res, next) {
    try {
      const {uid} = req.user; // authGuard에서 설정
      const user = await userService.getUserById(uid);
      if (!user) {
        const err = new Error("사용자를 찾을 수 없습니다");
        err.code = "NOT_FOUND";
        throw err;
      }
      return res.json({
        status: 200,
        user: user,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 특정 사용자 정보 조회 (Admin 또는 본인만)
   * GET /users/:userId
   */
  async getUserById(req, res, next) {
    try {
      const {userId} = req.params;
      const {uid, customClaims} = req.user; // authGuard에서 설정

      // 권한 체크: 본인이거나 Admin만 조회 가능
      const isOwner = userId === uid;
      const isAdmin = customClaims?.role === "admin";

      if (!isOwner && !isAdmin) {
        const err = new Error("권한이 없습니다");
        err.code = "FORBIDDEN";
        throw err;
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        const err = new Error("사용자를 찾을 수 없습니다");
        err.code = "NOT_FOUND";
        throw err;
      }
      return res.success(user);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 온보딩 정보 업데이트
   * PATCH /users/me/onboarding
   * 
   * Body:
   * - name, nickname, birthYear, birthDate, gender, phoneNumber
   * - terms: { SERVICE: boolean, PRIVACY: boolean, MARKETING: boolean }
   */
  async updateOnboarding(req, res, next) {
    try {
      const {uid} = req.user;
      const {name, nickname, birthYear, birthDate, gender, phoneNumber, terms} = req.body || {};

      // 약관 검증 (형식 체크)
      if (terms !== undefined && typeof terms !== "object") {
        const err = new Error("약관 동의는 객체 형태여야 합니다.");
        err.code = "INVALID_INPUT";
        throw err;
      }

      const result = await userService.updateOnboarding({
        uid,
        payload: {name, nickname, birthYear, birthDate, gender, phoneNumber, terms},
      });

      return res.json({
        status: 200,
        message: "ONBOARDING_UPDATED",
        data: {onboardingCompleted: result.onboardingCompleted},
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const {userId} = req.params;
      const {
        name, profileImageUrl, birthYear, rewardPoints, level, badges,
        points, mainProfileId, onBoardingComplete, uploadQuotaBytes,
        usedStorageBytes,
      } = req.body;

      const updateData = {};

      if (name !== undefined) {
        updateData.name = name;
      }
      if (profileImageUrl !== undefined) {
        updateData.profileImageUrl = profileImageUrl;
      }
      if (points !== undefined) {
        updateData.points = points;
      }
      if (mainProfileId !== undefined) {
        updateData.mainProfileId = mainProfileId;
      }
      if (birthYear !== undefined) {
        updateData.birthYear = birthYear;
      }
      if (rewardPoints !== undefined) {
        updateData.rewardPoints = rewardPoints;
      }
      if (level !== undefined) {
        updateData.level = level;
      }
      if (uploadQuotaBytes !== undefined) {
        updateData.uploadQuotaBytes = uploadQuotaBytes;
      }
      if (usedStorageBytes !== undefined) {
        updateData.usedStorageBytes = usedStorageBytes;
      }
      if (badges !== undefined) {
        updateData.badges = badges;
      }
      if (onBoardingComplete !== undefined) {
        updateData.onBoardingComplete = onBoardingComplete;
      }

      if (Object.keys(updateData).length === 0) {
        const err = new Error("업데이트할 유효한 필드가 없습니다");
        err.code = "BAD_REQUEST";
        throw err;
      }

      const result = await userService.updateUser(userId, updateData);

      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 사용자 삭제 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async deleteUser(req, res, next) {
    try {
      const {userId} = req.params;

      await userService.deleteUser(userId);

      return res.success({userId});
    } catch (error) {
      console.error("사용자 삭제 에러:", error);
      return next(error);
    }
  }
}

module.exports = new UserController();
