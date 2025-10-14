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
  async getUserById(req, res, next) {
    try {
      const {userId} = req.params;
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
   * 온보딩 과정용 : 사용자 정보 수정 API
   *
   * 사용 시나리오:
   * - Auth Trigger로 이미 생성된 사용자 문서를 업데이트
   * - 온보딩 과정에서 추가 정보 입력 시 (닉네임, 프로필 이미지 등)
   * - 사용자가 프로필 정보를 수정할 때
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async provisionUser(req, res, next) {
    try {
      // authGuard 미들웨어에서 설정한 req.user 사용
      const {uid} = req.user;
      const {email, name, profileImageUrl, birthYear, authType, snsProvider} =
          req.body;

      // 사용자 정보 업데이트
      const result = await userService.updateUserInfo(uid, {
        email,
        name,
        profileImageUrl,
        birthYear, // 추후 카카오 심사 후 제공
        authType,
        snsProvider,
      });
      return res.success({user: result.user});
    } catch (error) {
      console.error("사용자 프로비저닝 에러:", error);
      return next(error);
    }
  }

  /**
   * 사용자 정보 수정 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
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
