const FirestoreService = require("../services/firestoreService");
const UserService = require("../services/userService");
const {successResponse} = require("../utils/helpers");

// 서비스 인스턴스 생성
const firestoreService = new FirestoreService('users');
const userService = new UserService();

/**
 * User Controller
 */
class UserController {
  /**
   * 사용자 생성 API (Firebase Auth + Firestore 생성)
   * 
   * 사용 시나리오:
   * - 관리자가 수동으로 사용자를 생성해야 하는 경우
   * - 테스트/개발용 사용자 생성
   * - 이메일/비밀번호로 사용자 생성
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createUser(req, res) {
    try {
      const result = await userService.createUser(req.body);
      res.json(successResponse(200, result));
    } catch (error) {
      console.error("Create user error:", error);
      error.code = error.code || "BAD_REQUEST";
      return req.next ? req.next(error) : res.status(400).json({ status: 400, error: error.message });
    }
  }

    /**
   * 모든 사용자 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
    async getAllUsers(req, res) {
      try {
        const users = await userService.getAllUsers();
        res.json(successResponse(200, { users, count: users.length }));
      } catch (error) {
        return req.next ? req.next(error) : res.status(500).json({ status: 500, error: error.message });
      }
    }
  
    /**
     * 사용자 정보 조회 API
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUserById(req, res) {
      try {
        const {userId} = req.params;
        const user = await userService.getUserById(userId);
        if (!user) {
          const err = new Error("User not found");
          err.code = "NOT_FOUND";
          throw err;
        }
        res.json(successResponse(200, user));
      } catch (error) {
        return req.next ? req.next(error) : res.status(500).json({ status: 500, error: error.message });
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
   */
  async provisionUser(req, res) {
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
      res.json(successResponse(200, { user: result.user }));
    } catch (error) {
      console.error("Provision user error:", error);
      return req.next ? req.next(error) : res.status(500).json({ status: 500, error: error.message || "Failed to provision user" });
    }
  }

  /**
   * 일반 수정용 :사용자 정보 수정 API
   * 
   * 사용 시나리오:
   * - 사용자가 자신의 정보를 수정할 때 (프로필 수정)
   * - 관리자가 특정 사용자 정보를 수정할 때
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUser(req, res) {
    try {
      const {userId} = req.params;
      const {name, profileImageUrl, birthYear, rewardPoints, level, badges, points, mainProfileId, onBoardingComplete, uploadQuotaBytes, usedStorageBytes} = req.body;

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
        const err = new Error("No valid fields to update");
        err.code = "BAD_REQUEST";
        throw err;
      }

      const result = await userService.updateUser(userId, updateData);
      res.json(successResponse(200, result));
    } catch (error) {
      return req.next ? req.next(error) : res.status(500).json({ status: 500, error: error.message });
    }
  }

  /**
   * 사용자 삭제 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteUser(req, res) {
    try {
      const {userId} = req.params;
      await userService.deleteUser(userId);
      res.json(successResponse(200, { userId }, "User deleted successfully from both Firebase Auth and Firestore"));
    } catch (error) {
      console.error("Delete user error:", error);
      return req.next ? req.next(error) : res.status(500).json({ status: 500, error: error.message });
    }
  }
}

module.exports = new UserController();
