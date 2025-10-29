const UserService = require("../services/userService");
const {AUTH_TYPES} = require("../constants/userConstants");

// 서비스 인스턴스 생성
const userService = new UserService();

/**
 * User Controller
 */

class UserController {
  
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
      return res.success({user});
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
   * - nickname (필수)
   */
  async updateOnboarding(req, res, next) {
    try {
      const {uid} = req.user;
      const {nickname} = req.body || {};

      const result = await userService.updateOnboarding({
        uid,
        payload: {nickname},
      });

      return res.success({onboardingCompleted: result.onboardingCompleted});
    } catch (error) {
      return next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const {userId} = req.params;
      const {
        name, profileImageUrl, birthDate, rewardPoints, level, badges,
        points, mainProfileId, onboardingCompleted, uploadQuotaBytes,
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
      if (onboardingCompleted !== undefined) {
        updateData.onboardingCompleted = onboardingCompleted;
      }
      if (birthDate !== undefined) {
        updateData.birthDate = birthDate;
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
