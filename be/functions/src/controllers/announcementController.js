const AnnouncementService = require("../services/announcementService");

// 서비스 인스턴스 생성
const announcementService = new AnnouncementService();

// 상수 정의
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

class AnnouncementController {
  /**
   * 공지사항 목록 조회 (Notion 기반)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAnnouncements(req, res, next) {
    try {
      const {
        pageSize = DEFAULT_PAGE_SIZE,
        cursor
      } = req.query;

      // 페이지 크기 검증
      const pageSizeNum = parseInt(pageSize, 10);
      if (isNaN(pageSizeNum) || pageSizeNum < MIN_PAGE_SIZE || pageSizeNum > MAX_PAGE_SIZE) {
        const error = new Error("페이지 크기는 1-100 사이의 숫자여야 합니다.");
        error.code = 'BAD_REQUEST';
        error.statusCode = 400;
        return next(error);
      }

      const result = await announcementService.getAnnouncements(pageSizeNum, cursor);

      return res.success({
        message: "공지사항 목록을 성공적으로 조회했습니다.",
        announcements: result.announcements,
        pagination: {
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
          currentPageCount: result.currentPageCount
        }
      });

    } catch (error) {
      console.error("[AnnouncementController] 공지사항 목록 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 공지사항 상세 조회 (Notion 기반 - 페이지 내용 포함)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAnnouncementById(req, res, next) {
    try {
      const {pageId} = req.params;

      if (!pageId) {
        const error = new Error("공지사항 ID가 필요합니다.");
        error.code = 'BAD_REQUEST';
        error.statusCode = 400;
        return next(error);
      }

      const announcement = await announcementService.getAnnouncementById(pageId);

      return res.success({
        message: "공지사항 상세 정보를 성공적으로 조회했습니다.",
        announcement
      });

    } catch (error) {
      console.error("[AnnouncementController] 공지사항 상세 조회 오류:", error.message);
      return next(error);
    }
  }
}

module.exports = new AnnouncementController();


