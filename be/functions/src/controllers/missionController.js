const notionMissionService = require("../services/notionMissionService");
const missionService = require("../services/missionService");
const missionPostService = require("../services/missionPostService");

class MissionController {
  constructor() {
    // 메서드 바인딩
    this.getCategories = this.getCategories.bind(this);
    this.applyMission = this.applyMission.bind(this);
    this.getMissions = this.getMissions.bind(this);
    this.getMissionById = this.getMissionById.bind(this);
    this.getParticipatedMissionIds = this.getParticipatedMissionIds.bind(this);
    this.createMissionPost = this.createMissionPost.bind(this);
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
   * @note MVP: 전체 미션 반환 (페이지네이션 없음)
   * @note 정렬: latest(최신순), popular(인기순)
   * @note 필터: category(카테고리), excludeParticipated(참여 미션 제외)
   */
  async getMissions(req, res, next) {
    try {
      const { 
        category, 
        sortBy = 'latest',
        excludeParticipated 
      } = req.query;
      
      const userId = req.user?.uid; // optionalAuth에서 가져옴

      // 필터 조건 구성
      const filters = {
        sortBy, // 'latest' or 'popular'
      };
      
      if (category) {
        filters.category = category;
      }

      // 노션에서 미션 조회
      let result = await notionMissionService.getMissions(filters);

      // 참여 미션 제외 (로그인 유저 & 옵션 활성화 시)
      if (userId && excludeParticipated === 'true') {
        const participatedIds = await this.getParticipatedMissionIds(userId);
        result.missions = result.missions.filter(
          mission => !participatedIds.includes(mission.id)
        );
        result.totalCount = result.missions.length;
      }

      res.success({
        missions: result.missions,
        totalCount: result.totalCount
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

}

module.exports = new MissionController();
