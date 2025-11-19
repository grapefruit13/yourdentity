const CommunityService = require("../services/communityService");

// 서비스 인스턴스 생성
const communityService = new CommunityService();

class CommunityController {
  /**
   * 커뮤니티 목록 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getCommunities(req, res, next) {
    try {
      const {type} = req.query;
      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 10;

      const result = await communityService.getCommunities({type, page, size});
      
      // data 객체 안에 communities 배열과 pagination 객체 분리
      const responseData = {
        communities: result.content || [],
        pagination: result.pagination || {}
      };
      
      return res.success(responseData);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 전체 커뮤니티 게시글 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAllCommunityPosts(req, res, next) {
    try {
      const {programType, programTypes, programState, sort} = req.query;
      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 10;

      const collectProgramTypes = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) {
          return value
            .flatMap((item) =>
              typeof item === "string" ? item.split(",") : [],
            )
            .map((item) => item.trim())
            .filter(Boolean);
        }
        if (typeof value === "string") {
          return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
        return [];
      };

      const requestedProgramTypes = Array.from(
        new Set([
          ...collectProgramTypes(programTypes),
          ...collectProgramTypes(programType),
        ]),
      );

      const normalizeProgramState = (value) => {
        if (!value) {
          return null;
        }
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return null;
          }
          return normalizeProgramState(value[0]);
        }
        if (typeof value !== "string") {
          return null;
        }
        const lower = value.toLowerCase();
        if (lower === "ongoing" || lower === "finished") {
          return lower;
        }
        return null;
      };

      const normalizedProgramState = normalizeProgramState(programState);

      const sortOption = sort === "popular" ? "popular" : "latest";
      
      const result = await communityService.getAllCommunityPosts(
        {
          programTypes: requestedProgramTypes,
          programState: normalizedProgramState,
          page,
          size,
          sort: sortOption,
        },
        req.user?.uid || null,
      );

      // data 객체 안에 posts 배열과 pagination 객체 분리
      const responseData = {
        posts: result.content || [],
        pagination: result.pagination || {}
      };

      return res.success(responseData);
    } catch (error) {
      return next(error);
    }
  }




  /**
   * 게시글 생성 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createPost(req, res, next) {
    try {
      const {communityId} = req.params;
      const {uid: userId} = req.user;
      const postData = req.body;

      const result = await communityService.createPost(communityId, userId, postData);

      // 리워드 부여
      await req.grantPostReward(result);

      return res.created(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 게시글 상세 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getPostById(req, res, next) {
    try {
      const {communityId, postId} = req.params;
      const viewerId = req.user?.uid || null;
      const post = await communityService.getPostById(communityId, postId, viewerId);
      return res.success(post);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 게시글 수정 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updatePost(req, res, next) {
    try {
      const {communityId, postId} = req.params;
      const updateData = req.body;
      const userId = req.user.uid;

      const result = await communityService.updatePost(communityId, postId, updateData, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 게시글 삭제 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async deletePost(req, res, next) {
    try {
      const {communityId, postId} = req.params;
      const userId = req.user.uid;

      await communityService.deletePost(communityId, postId, userId);
      return res.noContent();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 게시글 좋아요 토글 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async togglePostLike(req, res, next) {
    try {
      const {communityId, postId} = req.params;
      const {uid: userId} = req.user;

      const result = await communityService.togglePostLike(communityId, postId, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 커뮤니티 멤버 닉네임 가용성 확인 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async checkNicknameAvailability(req, res, next) {
    try {
      const {communityId} = req.params;
      const {nickname} = req.query;

      const available = await communityService.checkNicknameAvailability(communityId, nickname);

      return res.success({available});
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new CommunityController();
