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

/**
 * 영어 상태값을 한국어로 변환
 * @param {string} type - 상태 타입 ('recruitment' | 'program')
 * @param {string} englishValue - 영어 상태값
 * @returns {string} 한국어 상태값
 * @throws {Error} 유효하지 않은 상태값인 경우
 */
const mapStatusToKorean = (type, englishValue) => {
  const mapping = STATUS_MAPPINGS[type];
  if (!mapping) {
    throw new Error(`지원하지 않는 상태 타입입니다: ${type}`);
  }
  
  const koreanValue = mapping[englishValue];
  if (!koreanValue) {
    const validValues = Object.keys(mapping).join(', ');
    throw new Error(`유효하지 않은 ${type} 상태값입니다. 사용 가능한 값: ${validValues}`);
  }
  
  return koreanValue;
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
        pageSize = DEFAULT_PAGE_SIZE,
        cursor
      } = req.query;

      // 필터 조건 구성
      const filters = {};
      if (recruitmentStatus) {
        try {
          const koreanStatus = mapStatusToKorean('recruitment', recruitmentStatus);
          filters.recruitmentStatus = koreanStatus;
        } catch (error) {
          const badRequestError = new Error(error.message);
          badRequestError.code = 'BAD_REQUEST';
          badRequestError.statusCode = 400;
          return next(badRequestError);
        }
      }
      if (programStatus) {
        try {
          const koreanStatus = mapStatusToKorean('program', programStatus);
          filters.programStatus = koreanStatus;
        } catch (error) {
          const badRequestError = new Error(error.message);
          badRequestError.code = 'BAD_REQUEST';
          badRequestError.statusCode = 400;
          return next(badRequestError);
        }
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
      console.error("[ProgramController] getPrograms error:", error.message);
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
      console.error("[ProgramController] getProgramById error:", error.message);
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
        try {
          const koreanStatus = mapStatusToKorean('recruitment', recruitmentStatus);
          filters.recruitmentStatus = koreanStatus;
        } catch (error) {
          const badRequestError = new Error(error.message);
          badRequestError.code = 'BAD_REQUEST';
          badRequestError.statusCode = 400;
          return next(badRequestError);
        }
      }
      if (programStatus) {
        try {
          const koreanStatus = mapStatusToKorean('program', programStatus);
          filters.programStatus = koreanStatus;
        } catch (error) {
          const badRequestError = new Error(error.message);
          badRequestError.code = 'BAD_REQUEST';
          badRequestError.statusCode = 400;
          return next(badRequestError);
        }
      }

      // 페이지 크기 검증
      const pageSizeNum = parseInt(pageSize);
      if (isNaN(pageSizeNum) || pageSizeNum < MIN_PAGE_SIZE || pageSizeNum > MAX_PAGE_SIZE) {
        const error = new Error("페이지 크기는 1-100 사이의 숫자여야 합니다.");
        error.code = 'BAD_REQUEST';
        error.statusCode = 400;
        return next(error);
      }

      const result = await programService.searchPrograms(q.trim(), filters);

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
      console.error("[ProgramController] searchPrograms error:", error.message);
      return next(error);
    }
  }

}

module.exports = new ProgramController();
