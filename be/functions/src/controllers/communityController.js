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
      const {programType, programTypes, programState} = req.query;
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

      const result = await communityService.getAllCommunityPosts(
        {
          programTypes: requestedProgramTypes,
          programState: normalizedProgramState,
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

      // 리워드 부여 (게시글 타입별)
      if (result.type === 'GATHERING_REVIEW') {
        // 소모임 후기글 - 이미지 포함 여부 체크
        // 1차: media 배열 우선 (가장 신뢰할 수 있는 방법)
        let hasImage = Array.isArray(result.media) && result.media.length > 0;
        
        // 2차 fallback: content에서 img 태그 검사 (엄격한 패턴)
        if (!hasImage && result.content) {
          // code block 제거 (```...``` 형태)
          const contentWithoutCodeBlocks = result.content.replace(/```[\s\S]*?```/g, '');
          // img 태그 패턴 매칭 (대소문자 무관, 공백 허용)
          hasImage = /<\s*img\b/i.test(contentWithoutCodeBlocks);
        }
        
        const actionKey = hasImage 
          ? 'gathering_review_media' 
          : 'gathering_review_text';
        
        await req.grantReward(actionKey, {
          postId: result.id,
          communityId,
        });
      } else if (result.type === 'TMI') {
        // TMI 프로젝트 후기글
        await req.grantReward('tmi_review', {
          postId: result.id,
          communityId,
        });
      }

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
