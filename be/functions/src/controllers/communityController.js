const CommunityService = require("../services/communityService");

// 서비스 인스턴스 생성
const communityService = new CommunityService();

class CommunityController {
  /**
   * 커뮤니티 목록 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCommunities(req, res) {
    try {
      const {type, page = 0, size = 10} = req.query;

      const result = await communityService.getCommunities({type, page, size});

      res.json({
        success: true,
        data: result.content,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get communities error:", error);
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "커뮤니티 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 전체 커뮤니티 게시글 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllCommunityPosts(req, res) {
    try {
      const {
        type,
        channel,
        communityId,
        page = 0,
        size = 10,
        includeContent = false,
      } = req.query;

      const result = await communityService.getAllCommunityPosts({
        type,
        channel,
        communityId,
        page,
        size,
        includeContent: includeContent === "true",
      });

      res.json({
        success: true,
        data: result.content,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get all community posts error:", error);
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "커뮤니티 게시글 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 커뮤니티 상세 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCommunityById(req, res) {
    try {
      const {communityId} = req.params;
      const community = await communityService.getCommunityById(communityId);

      res.json({
        success: true,
        data: community,
      });
    } catch (error) {
      console.error("Get community by ID error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "커뮤니티를 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "커뮤니티 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 커뮤니티 멤버 목록 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCommunityMembers(req, res) {
    try {
      const {communityId} = req.params;
      const {page = 0, size = 20} = req.query;

      const result = await communityService.getCommunityMembers(communityId, {page, size});

      res.json({
        success: true,
        data: result.content,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get community members error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "커뮤니티를 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "멤버 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 특정 커뮤니티의 게시글 목록 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCommunityPosts(req, res) {
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

      res.json({
        success: true,
        data: result.content,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get community posts error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "커뮤니티를 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "게시글 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 게시글 생성 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createPost(req, res) {
    try {
      const {communityId} = req.params;
      const {uid: userId} = req.user;
      const postData = req.body;

      const result = await communityService.createPost(communityId, userId, postData);

      res.status(201).json({
        success: true,
        data: result,
        message: "게시글이 성공적으로 작성되었습니다.",
      });
    } catch (error) {
      console.error("Create post error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "커뮤니티를 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "게시글 작성 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 게시글 상세 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPostById(req, res) {
    try {
      const {communityId, postId} = req.params;
      const post = await communityService.getPostById(communityId, postId);

      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      console.error("Get post by ID error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "게시글을 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "게시글 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 게시글 수정 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updatePost(req, res) {
    try {
      const {communityId, postId} = req.params;
      const updateData = req.body;

      const result = await communityService.updatePost(communityId, postId, updateData);

      res.json({
        success: true,
        data: result,
        message: "게시글이 성공적으로 수정되었습니다.",
      });
    } catch (error) {
      console.error("Update post error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "게시글을 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "게시글 수정 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 게시글 삭제 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deletePost(req, res) {
    try {
      const {communityId, postId} = req.params;

      await communityService.deletePost(communityId, postId);

      res.json({
        success: true,
        message: "게시글이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      console.error("Delete post error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "게시글을 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "게시글 삭제 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 게시글 좋아요 토글 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async togglePostLike(req, res) {
    try {
      const {communityId, postId} = req.params;
      const {uid: userId} = req.user;

      const result = await communityService.togglePostLike(communityId, postId, userId);

      res.json({
        success: true,
        data: result,
        message: result.isLiked ? "좋아요가 등록되었습니다." : "좋아요가 취소되었습니다.",
      });
    } catch (error) {
      console.error("Toggle post like error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "게시글을 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "좋아요 처리 중 오류가 발생했습니다.",
      });
    }
  }
}

module.exports = new CommunityController();
