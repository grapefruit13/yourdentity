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
      const {
        type,
        filter,  // filter 파라미터 추가
      } = req.query;
      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 10;

      // filter 파라미터를 type으로 매핑 (하위 호환성)
      const finalType = type || filter;

      const result = await communityService.getAllCommunityPosts(
        {
          type: finalType,
          page,
          size,
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
}

module.exports = new CommunityController();
