const programService = require("../services/programService");
const { successResponse } = require("../utils/helpers");

// 상수 정의
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

// 상태 매핑 상수
const STATUS_MAPPINGS = {
  recruitment: {
    'before': '모집 전',
    'ongoing': '모집 중',
    'completed': '모집 완료',
    'cancelled': '모집 취소'
  },
  program: {
    'before': '진행 전',
    'ongoing': '진행 중',
    'completed': '종료됨',
    'cancelled': '진행 취소됨'
  }
};


class ProgramController {
  /**
   * 프로그램 목록 조회
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   */
  async getPrograms(req, res, next) {
    try {
      const {
        recruitmentStatus,
        programStatus,
        programType,
        pageSize = DEFAULT_PAGE_SIZE,
        cursor
      } = req.query;

      // 필터 조건 구성
      const filters = {};
      if (recruitmentStatus) {
        const koreanStatus = STATUS_MAPPINGS.recruitment[recruitmentStatus];
        if (!koreanStatus) {
          const error = new Error(`유효하지 않은 모집상태입니다: ${recruitmentStatus}`);
          error.code = 'BAD_REQUEST';
          error.statusCode = 400;
          return next(error);
        }
        filters.recruitmentStatus = koreanStatus;
      }
      if (programStatus) {
        const koreanStatus = STATUS_MAPPINGS.program[programStatus];
        if (!koreanStatus) {
          const error = new Error(`유효하지 않은 프로그램 상태입니다: ${programStatus}`);
          error.code = 'BAD_REQUEST';
          error.statusCode = 400;
          return next(error);
        }
        filters.programStatus = koreanStatus;
      }
      if (programType) {
        // 프로그램 종류는 직접 사용 (ROUTINE, TMI, GATHERING)
        filters.programType = programType;
      }

      // 페이지 크기 검증
      const pageSizeNum = parseInt(pageSize);
      if (isNaN(pageSizeNum) || pageSizeNum < MIN_PAGE_SIZE || pageSizeNum > MAX_PAGE_SIZE) {
        const error = new Error("페이지 크기는 1-100 사이의 숫자여야 합니다.");
        error.code = 'BAD_REQUEST';
        error.statusCode = 400;
        return next(error);
      }

      const result = await programService.getPrograms(filters, pageSizeNum, cursor);

      res.success({
        message: "프로그램 목록을 성공적으로 조회했습니다.",
        programs: result.programs,
        pagination: {
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
          totalCount: result.totalCount
        }
      });

    } catch (error) {
      console.error("[ProgramController] 프로그램 목록 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 프로그램 상세 조회
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   */
  async getProgramById(req, res, next) {
    try {
      const { programId } = req.params;

      if (!programId) {
        const error = new Error("프로그램 ID가 필요합니다.");
        error.code = 'BAD_REQUEST';
        error.statusCode = 400;
        return next(error);
      }

      const program = await programService.getProgramById(programId);

      res.success({
        message: "프로그램 상세 정보를 성공적으로 조회했습니다.",
        program
      });

    } catch (error) {
      console.error("[ProgramController] 프로그램 상세 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 프로그램 검색
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express next 함수
   */
  async searchPrograms(req, res, next) {
    try {
      const {
        q,
        recruitmentStatus,
        programStatus,
        programType,
        pageSize = DEFAULT_PAGE_SIZE,
        cursor
      } = req.query;

      if (!q || q.trim() === '') {
        const error = new Error("검색어가 필요합니다.");
        error.code = 'BAD_REQUEST';
        error.statusCode = 400;
        return next(error);
      }

      // 필터 조건 구성
      const filters = {};
      if (recruitmentStatus) {
        const koreanStatus = STATUS_MAPPINGS.recruitment[recruitmentStatus];
        if (!koreanStatus) {
          const error = new Error(`유효하지 않은 모집상태입니다: ${recruitmentStatus}`);
          error.code = 'BAD_REQUEST';
          error.statusCode = 400;
          return next(error);
        }
        filters.recruitmentStatus = koreanStatus;
      }
      if (programStatus) {
        const koreanStatus = STATUS_MAPPINGS.program[programStatus];
        if (!koreanStatus) {
          const error = new Error(`유효하지 않은 프로그램 상태입니다: ${programStatus}`);
          error.code = 'BAD_REQUEST';
          error.statusCode = 400;
          return next(error);
        }
        filters.programStatus = koreanStatus;
      }
      if (programType) {
        // 프로그램 종류는 직접 사용 (ROUTINE, TMI, GATHERING)
        filters.programType = programType;
      }

      // 페이지 크기 검증
      const pageSizeNum = parseInt(pageSize);
      if (isNaN(pageSizeNum) || pageSizeNum < MIN_PAGE_SIZE || pageSizeNum > MAX_PAGE_SIZE) {
        const error = new Error("페이지 크기는 1-100 사이의 숫자여야 합니다.");
        error.code = 'BAD_REQUEST';
        error.statusCode = 400;
        return next(error);
      }

      const result = await programService.searchPrograms(q.trim(), filters, pageSizeNum, cursor);

      res.success({
        message: `'${q}'에 대한 검색 결과를 성공적으로 조회했습니다.`,
        programs: result.programs,
        pagination: {
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
          totalCount: result.totalCount
        },
        searchTerm: q
      });

    } catch (error) {
      console.error("[ProgramController] 프로그램 검색 오류:", error.message);
      return next(error);
    }
  }

}

module.exports = new ProgramController();
