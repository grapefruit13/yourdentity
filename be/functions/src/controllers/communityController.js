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
      const {type, page = 0, size = 10} = req.query;

      const result = await communityService.getCommunities({type, page, size});
      return res.paginate(result.content, result.pagination);
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
      const {
        type,
        filter,  // filter 파라미터 추가
        channel,
        communityId,
        page = 0,
        size = 10,
        includeContent = false,
      } = req.query;

      // filter 파라미터를 type으로 매핑 (하위 호환성)
      const finalType = type || filter;

      const result = await communityService.getAllCommunityPosts({
        type: finalType,
        channel,
        communityId,
        page,
        size,
        includeContent: includeContent === "true",
      });

      return res.paginate(result.content, result.pagination);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 커뮤니티 상세 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getCommunityById(req, res, next) {
    try {
      const {communityId} = req.params;
      const community = await communityService.getCommunityById(communityId);
      return res.success(community);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 커뮤니티 멤버 목록 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getCommunityMembers(req, res, next) {
    try {
      const {communityId} = req.params;
      const {page = 0, size = 20} = req.query;

      const result = await communityService.getCommunityMembers(communityId, {page, size});
      return res.paginate(result.content, result.pagination);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 특정 커뮤니티의 게시글 목록 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getCommunityPosts(req, res, next) {
    try {
      const {communityId} = req.params;
      const {
        type,
        channel,
        page = 0,
        size = 10,
        includeContent = false,
      } = req.query;

      const result = await communityService.getCommunityPosts(communityId, {
        type,
        channel,
        page,
        size,
        includeContent: includeContent === "true",
      });

      return res.paginate(result.content, result.pagination);
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
      const post = await communityService.getPostById(communityId, postId);
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

      const result = await communityService.updatePost(communityId, postId, updateData);
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

      await communityService.deletePost(communityId, postId);
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
}

module.exports = new CommunityController();
