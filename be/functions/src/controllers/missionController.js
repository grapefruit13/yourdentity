const notionMissionService = require("../services/notionMissionService");
const missionService = require("../services/missionService");
const missionPostService = require("../services/missionPostService");
const { MISSION_STATUS } = require("../constants/missionConstants");
const {
  parsePageSize,
  sanitizeCursor,
} = require("../utils/paginationHelper");
const paginationConstants = require("../constants/paginationConstants");
const {
  DEFAULT_MISSION_PAGE_SIZE,
  MAX_MISSION_PAGE_SIZE,
  NOTION_MAX_PAGE_SIZE,
  DEFAULT_POST_PAGE_SIZE,
  MAX_POST_PAGE_SIZE,
  DEFAULT_COMMENT_PAGE_SIZE,
  MAX_COMMENT_PAGE_SIZE,
} = paginationConstants;

const encodePaginationCursor = (payload) => {
  try {
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  } catch (error) {
    console.warn("[MissionController] Failed to encode pagination cursor:", error.message);
    return null;
  }
};

const decodePaginationCursor = (cursor) => {
  if (!cursor || typeof cursor !== "string") {
    return {
      bufferedMissions: [],
      notionCursor: null,
    };
  }

  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf8");
    const parsed = JSON.parse(decoded);
    return {
      bufferedMissions: Array.isArray(parsed.bufferedMissions) ? parsed.bufferedMissions : [],
      notionCursor: typeof parsed.notionCursor === "string" ? parsed.notionCursor : null,
    };
  } catch (error) {
    console.warn("[MissionController] Failed to decode pagination cursor:", error.message);
    return {
      bufferedMissions: [],
      notionCursor: null,
    };
  }
};

class MissionController {
  constructor() {
    // 메서드 바인딩
    this.getCategories = this.getCategories.bind(this);
    this.applyMission = this.applyMission.bind(this);
    this.getMissions = this.getMissions.bind(this);
    this.getMissionById = this.getMissionById.bind(this);
    this.getParticipatedMissionIds = this.getParticipatedMissionIds.bind(this);
    this.createMissionPost = this.createMissionPost.bind(this);
    this.getMyMissions = this.getMyMissions.bind(this);
    this.quitMission = this.quitMission.bind(this);
    this.getMissionStats = this.getMissionStats.bind(this);
    this.getAllMissionPosts = this.getAllMissionPosts.bind(this);
    this.getMissionPostById = this.getMissionPostById.bind(this);
    this.createMissionPostComment = this.createMissionPostComment.bind(this);
    this.getMissionPostComments = this.getMissionPostComments.bind(this);
    this.updateMissionPostComment = this.updateMissionPostComment.bind(this);
    this.deleteMissionPostComment = this.deleteMissionPostComment.bind(this);
  }

  /**
   * 미션 신청
   */
  async applyMission(req, res, next) {
    try {
      const { missionId } = req.params;
      const userId = req.user?.uid;

      if (!missionId) {
        const error = new Error("미션 ID가 필요합니다.");
        error.code = 'BAD_REQUEST';
        error.statusCode = 400;
        return next(error);
      }

      const result = await missionService.applyMission({
        userId,
        missionId,
      });

      return res.created({
        missionId: result.missionId,
        status: result.status,
      });

    } catch (error) {
      console.error("[MissionController] 미션 신청 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 내 미션 목록 조회
   */
  async getMyMissions(req, res, next) {
    try {
      const userId = req.user?.uid;
      const { status = MISSION_STATUS.IN_PROGRESS, limit } = req.query;

      const missions = await missionService.getUserMissions({
        userId,
        status,
        limit: limit ? Number(limit) : 20,
      });

      return res.success({ missions });
    } catch (error) {
      console.error("[MissionController] 내 미션 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 미션 그만두기
   */
  async quitMission(req, res, next) {
    try {
      const { missionId } = req.params;
      const userId = req.user?.uid;

      if (!missionId) {
        const error = new Error("미션 ID가 필요합니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        return next(error);
      }

      const result = await missionService.quitMission({
        userId,
        missionId,
      });

      return res.success({
        missionId: result.missionId,
        status: result.status,
      });
    } catch (error) {
      console.error("[MissionController] 미션 그만두기 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 미션 통계 조회
   */
  async getMissionStats(req, res, next) {
    try {
      const userId = req.user?.uid;

      const stats = await missionService.getMissionStats({ userId });

      return res.success(stats);
    } catch (error) {
      console.error("[MissionController] 미션 통계 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 미션 인증 글 작성 (완료 처리)
   */
  async createMissionPost(req, res, next) {
    try {
      const { missionId } = req.params;
      const userId = req.user?.uid;
      const postData = req.body || {};

      const result = await missionPostService.createPost({
        userId,
        missionId,
        postData,
      });

      return res.created({
        missionId: result.missionId,
        postId: result.postId,
        status: result.status,
      });
    } catch (error) {
      console.error("[MissionController] 미션 인증 작성 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 미션 카테고리 목록 조회
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   */
  async getCategories(req, res, next) {
    try {
      const result = await notionMissionService.getCategories();

      res.success({
        categories: result.categories
      });

    } catch (error) {
      console.error("[MissionController] 카테고리 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 미션 목록 조회
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   * 
   * @note Notion cursor 기반 페이지네이션 지원
   * @note 정렬: latest(최신순), popular(인기순)
   * @note 필터: category(카테고리), excludeParticipated(참여 미션 제외)
   */
  async getMissions(req, res, next) {
    try {
      const {
        category,
        sortBy = "latest",
        excludeParticipated,
        pageSize: pageSizeParam,
        startCursor: startCursorParam,
      } = req.query;

      const pageSize = parsePageSize(
        pageSizeParam,
        DEFAULT_MISSION_PAGE_SIZE,
        MAX_MISSION_PAGE_SIZE,
      );
      const sanitizedCursor = sanitizeCursor(startCursorParam);
      const { bufferedMissions: initialBufferedMissions, notionCursor: initialNotionCursor } =
        decodePaginationCursor(sanitizedCursor);

      const userId = req.user?.uid; // optionalAuth에서 가져옴
      const needsExclude = Boolean(userId && excludeParticipated === "true");

      const responseMissions = [];
      const bufferQueue = Array.isArray(initialBufferedMissions) ? [...initialBufferedMissions] : [];

      while (responseMissions.length < pageSize && bufferQueue.length > 0) {
        responseMissions.push(bufferQueue.shift());
      }

      let participatedIds = [];
      if (needsExclude) {
        participatedIds = await this.getParticipatedMissionIds(userId);
      }

      const shouldIncludeMission = (mission) =>
        !needsExclude || !participatedIds.includes(mission.id);

      let notionCursor = initialNotionCursor;
      let notionHasMore = false;
      const bufferedOverflow = [];
      const fetchSize = needsExclude
        ? Math.min(pageSize * 3, NOTION_MAX_PAGE_SIZE)
        : pageSize;

      const buildNotionRequest = () => {
        const requestPayload = {
          sortBy,
          pageSize: fetchSize,
        };

        if (category) {
          requestPayload.category = category;
        }

        if (notionCursor) {
          requestPayload.startCursor = notionCursor;
        }

        return requestPayload;
      };

      while (responseMissions.length < pageSize) {
        const notionRequest = buildNotionRequest();
        const result = await notionMissionService.getMissions(notionRequest);
        notionCursor = result.nextCursor || null;
        notionHasMore = Boolean(result.hasMore && notionCursor);

        let fetchedMissions = Array.isArray(result.missions) ? result.missions : [];
        fetchedMissions = fetchedMissions.filter(shouldIncludeMission);

        if (fetchedMissions.length === 0) {
          if (!notionHasMore) {
            break;
          }
          continue;
        }

        fetchedMissions.forEach((mission) => {
          if (responseMissions.length < pageSize) {
            responseMissions.push(mission);
          } else {
            bufferedOverflow.push(mission);
          }
        });

        if (!notionHasMore) {
          break;
        }
      }

      const finalBuffer = bufferQueue.concat(bufferedOverflow);
      const hasBufferedItems = finalBuffer.length > 0;
      const hasNext = hasBufferedItems || notionHasMore;
      const nextCursorPayload = hasNext
        ? encodePaginationCursor({
            bufferedMissions: finalBuffer,
            notionCursor: notionHasMore ? notionCursor : null,
          })
        : null;

      const pageInfo = {
        pageSize,
        nextCursor: nextCursorPayload,
        hasNext,
      };

      res.success({
        missions: responseMissions,
        pageInfo,
      });
    } catch (error) {
      console.error("[MissionController] 미션 목록 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 참여한 미션 ID 조회 (헬퍼 함수)
   * @private
   */
  async getParticipatedMissionIds(userId) {
    const { db } = require('../config/database');
    
    try {
      const snapshot = await db.collection('userMissions')
        .where('userId', '==', userId)
        .where('status', 'in', ['IN_PROGRESS', 'COMPLETED'])
        .select('missionNotionPageId')
        .get();
      
      return snapshot.docs.map(doc => doc.data().missionNotionPageId);
    } catch (error) {
      console.warn('[MissionController] 참여 미션 조회 오류:', error.message);
      return []; // 오류 시 빈 배열 (필터링 안 함)
    }
  }

  /**
   * 미션 상세 조회
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   */
  async getMissionById(req, res, next) {
    try {
      const { missionId } = req.params;

      if (!missionId) {
        const error = new Error("미션 ID가 필요합니다.");
        error.code = 'BAD_REQUEST';
        error.statusCode = 400;
        return next(error);
      }

      const mission = await notionMissionService.getMissionById(missionId);

      res.success({
        mission
      });

    } catch (error) {
      console.error("[MissionController] 미션 상세 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 미션 인증글 목록 조회
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   */
  async getAllMissionPosts(req, res, next) {
    try {
      const {
        sort = "latest",
        userId,
        pageSize: pageSizeParam,
        startCursor: startCursorParam,
      } = req.query;
      const rawCategories = req.query.categories;

      let categories = [];
      if (typeof rawCategories === "string" && rawCategories.trim().length > 0) {
        categories = rawCategories
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      } else if (Array.isArray(rawCategories)) {
        categories = rawCategories
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
      }

      const viewerId = req.user?.uid || null;

      const pageSize = parsePageSize(
        pageSizeParam,
        DEFAULT_POST_PAGE_SIZE,
        MAX_POST_PAGE_SIZE,
      );
      const startCursor = sanitizeCursor(startCursorParam);

      const result = await missionPostService.getAllMissionPosts(
        {
          sort,
          categories,
          userId,
          pageSize,
          startCursor,
        },
        viewerId,
      );

      return res.success(result);
    } catch (error) {
      console.error("[MissionController] 미션 인증글 목록 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 미션 인증글 상세 조회
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   */
  async getMissionPostById(req, res, next) {
    try {
      const { postId } = req.params;
      const viewerId = req.user?.uid || null;

      if (!postId) {
        const error = new Error("인증글 ID가 필요합니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        return next(error);
      }

      const post = await missionPostService.getMissionPostById(postId, viewerId);

      return res.success(post);
    } catch (error) {
      console.error("[MissionController] 미션 인증글 상세 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 미션 인증글 댓글 목록 조회
   */
  async getMissionPostComments(req, res, next) {
    try {
      const { postId } = req.params;
      const viewerId = req.user?.uid || null;
      const { pageSize: pageSizeParam, startCursor: startCursorParam } = req.query;

      if (!postId) {
        const error = new Error("인증글 ID가 필요합니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        return next(error);
      }

      const pageSize = parsePageSize(
        pageSizeParam,
        DEFAULT_COMMENT_PAGE_SIZE,
        MAX_COMMENT_PAGE_SIZE,
      );
      const startCursor = sanitizeCursor(startCursorParam);

      const result = await missionPostService.getComments(postId, viewerId, {
        pageSize,
        startCursor,
      });

      return res.success(result);
    } catch (error) {
      console.error("[MissionController] 미션 인증글 댓글 목록 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 미션 인증글 댓글 생성
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   */
  async createMissionPostComment(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user?.uid;
      const commentData = req.body;

      if (!postId) {
        const error = new Error("인증글 ID가 필요합니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        return next(error);
      }

      const result = await missionPostService.createComment(postId, userId, commentData);

      return res.created(result);
    } catch (error) {
      console.error("[MissionController] 미션 인증글 댓글 생성 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 미션 인증글 댓글 수정
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   */
  async updateMissionPostComment(req, res, next) {
    try {
      const { postId, commentId } = req.params;
      const userId = req.user?.uid;
      const updateData = req.body;

      if (!postId) {
        const error = new Error("인증글 ID가 필요합니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        return next(error);
      }

      if (!commentId) {
        const error = new Error("댓글 ID가 필요합니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        return next(error);
      }

      const result = await missionPostService.updateComment(postId, commentId, userId, updateData);

      return res.success(result);
    } catch (error) {
      console.error("[MissionController] 미션 인증글 댓글 수정 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 미션 인증글 댓글 삭제
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   */
  async deleteMissionPostComment(req, res, next) {
    try {
      const { postId, commentId } = req.params;
      const userId = req.user?.uid;

      if (!postId) {
        const error = new Error("인증글 ID가 필요합니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        return next(error);
      }

      if (!commentId) {
        const error = new Error("댓글 ID가 필요합니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        return next(error);
      }

      await missionPostService.deleteComment(postId, commentId, userId);

      return res.noContent();
    } catch (error) {
      console.error("[MissionController] 미션 인증글 댓글 삭제 오류:", error.message);
      return next(error);
    }
  }

}

module.exports = new MissionController();
