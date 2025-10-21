const { Client } = require('@notionhq/client');
const { 
  buildNotionHeadersFromEnv,
  getTextContent,
  getTitleValue,
  getSelectValue,
  getMultiSelectNames,
  getDateValue,
  getCheckboxValue,
  getUrlValue,
  getStatusValue,
  getFileUrls,
  getRelationValues,
  getRollupValues,
  formatNotionBlocks
} = require('../utils/notionHelper');
const faqService = require('./faqService');

// 상수 정의
const NOTION_VERSION = process.env.NOTION_VERSION || "2025-09-03";
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

// page_size 검증 및 클램프 함수
function normalizePageSize(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, Math.trunc(num)));
}

// 에러 코드 정의
const ERROR_CODES = {
  MISSING_API_KEY: 'MISSING_NOTION_API_KEY',
  MISSING_DB_ID: 'MISSING_NOTION_DB_ID',
  NOTION_API_ERROR: 'NOTION_API_ERROR',
  PROGRAM_NOT_FOUND: 'PROGRAM_NOT_FOUND',
  INVALID_PAGE_SIZE: 'INVALID_PAGE_SIZE',
  SEARCH_ERROR: 'SEARCH_ERROR'
};

// Notion 필드명 상수
const NOTION_FIELDS = {
  PROGRAM_TITLE: "프로그램 제목",
  PROGRAM_NAME: "프로그램명",
  PROGRAM_DESCRIPTION: "프로그램 소개글",
  PROGRAM_TYPE: "프로그램 종류",
  RECRUITMENT_STATUS: "모집상태",
  PROGRAM_STATUS: "프로그램 진행 여부",
  START_DATE: "활동 시작 날짜",
  END_DATE: "활동 종료 날짜",
  RECRUITMENT_START_DATE: "모집 시작 날짜",
  RECRUITMENT_END_DATE: "모집 종료 날짜",
  TARGET_AUDIENCE: "참여 대상",
  THUMBNAIL: "썸네일",
  LINK_URL: "바로 보러 가기",
  IS_REVIEW_REGISTERED: "프로그램 후기 등록 여부",
  IS_BANNER_REGISTERED: "하단 배너 등록 여부",
  PARTICIPANTS_NAME: "참여자 별명",
  PARTICIPANTS_ID: "참여자 ID",
  NOTES: "참고 사항",
  FAQ: "FAQ",
  LAST_EDITED_TIME: "최근 수정 날짜",
  NOTION_PAGE_TITLE: "상세페이지(노션)"
};


class ProgramService {
  constructor() {
    const {
      NOTION_API_KEY,
      NOTION_PROGRAM_DB_ID,
    } = process.env;

    // 환경 변수 검증
    if (!NOTION_API_KEY) {
      const error = new Error("NOTION_API_KEY가 필요합니다");
      error.code = ERROR_CODES.MISSING_API_KEY;
      throw error;
    }
    if (!NOTION_PROGRAM_DB_ID) {
      const error = new Error("NOTION_PROGRAM_DB_ID가 필요합니다");
      error.code = ERROR_CODES.MISSING_DB_ID;
      throw error;
    }

    // Notion 클라이언트 초기화
    this.notion = new Client({
      auth: NOTION_API_KEY,
      notionVersion: NOTION_VERSION,
    });

    this.programDataSource = NOTION_PROGRAM_DB_ID;
  }

  /**
   * 프로그램 목록 조회 (필터링 지원)
   * @param {Object} filters - 필터 조건
   * @param {string} [filters.recruitmentStatus] - 모집상태 (모집 전, 모집 중, 모집 완료, 모집 취소)
   * @param {string} [filters.programStatus] - 프로그램 진행여부 (진행 전, 진행 중, 종료됨, 진행 취소됨)
   * @param {string} [filters.programType] - 프로그램 종류 (ROUTINE, TMI, GATHERING)
   * @param {number} [pageSize=20] - 페이지 크기 (1-100)
   * @param {string} [startCursor] - 페이지네이션 커서
   * @returns {Promise<Object>} 프로그램 목록과 페이지네이션 정보
   * @throws {Error} NOTION_API_ERROR - Notion API 호출 실패
   */
  async getPrograms(filters = {}, pageSize = DEFAULT_PAGE_SIZE, startCursor = null) {
    try {
      const queryBody = {
        page_size: normalizePageSize(pageSize),
        sorts: [
          {
            property: NOTION_FIELDS.LAST_EDITED_TIME,
            direction: "descending"
          }
        ]
      };

      // 필터 조건 추가
      if (filters.recruitmentStatus || filters.programStatus || filters.programType) {
        queryBody.filter = {
          and: []
        };

        if (filters.recruitmentStatus) {
          queryBody.filter.and.push({
            property: NOTION_FIELDS.RECRUITMENT_STATUS,
            status: {
              equals: filters.recruitmentStatus
            }
          });
        }

        if (filters.programStatus) {
          queryBody.filter.and.push({
            property: NOTION_FIELDS.PROGRAM_STATUS,
            status: {
              equals: filters.programStatus
            }
          });
        }

        if (filters.programType) {
          queryBody.filter.and.push({
            property: NOTION_FIELDS.PROGRAM_TYPE,
            select: {
              equals: filters.programType
            }
          });
        }
      }

      if (startCursor) {
        queryBody.start_cursor = startCursor;
      }

      // v5.3.0에서 databases.query가 제거되어 dataSources.query 사용
      const data = await this.notion.dataSources.query({
        data_source_id: this.programDataSource,
        ...queryBody
      });
      
      const programs = data.results.map(page => this.formatProgramData(page));
      
      return {
        programs,
        hasMore: data.has_more,
        nextCursor: data.next_cursor,
        totalCount: data.results.length
      };

    } catch (error) {
      console.error('[ProgramService] 프로그램 목록 조회 오류:', error.message);
      
      // Notion SDK 에러 처리
      if (error.code === 'object_not_found') {
        const notFoundError = new Error('프로그램 데이터 소스를 찾을 수 없습니다.');
        notFoundError.code = ERROR_CODES.MISSING_DB_ID;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      
      // Rate Limiting 처리
      if (error.code === 'rate_limited') {
        const rateLimitError = new Error('Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.');
        rateLimitError.code = 'RATE_LIMITED';
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }
      
      const serviceError = new Error(`프로그램 목록 조회 중 오류가 발생했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.NOTION_API_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }

  /**
   * 프로그램 상세 조회 (FAQ 포함)
   * @param {string} programId - 프로그램 ID
   * @returns {Promise<Object>} 프로그램 상세 정보 (FAQ 포함)
   * @throws {Error} PROGRAM_NOT_FOUND - 프로그램을 찾을 수 없음
   * @throws {Error} NOTION_API_ERROR - Notion API 호출 실패
   */
  async getProgramById(programId) {
    try {
      // Notion SDK 사용으로 통일
      const page = await this.notion.pages.retrieve({
        page_id: programId
      });
      const programData = this.formatProgramData(page, true);

      // 프로그램 페이지 블록 내용 조회 (병렬 처리)
      const [pageBlocks, faqList] = await Promise.allSettled([
        this.getProgramPageBlocks(programId),
        this.getFaqListForProgram(programData.faqRelation)
      ]);

      // 페이지 블록 내용 추가
      if (pageBlocks.status === 'fulfilled') {
        programData.pageContent = pageBlocks.value;
      } else {
        programData.pageContent = [];
      }

      // FAQ 목록 추가
      if (faqList.status === 'fulfilled') {
        programData.faqList = faqList.value;
      } else {
        programData.faqList = [];
      }

      return programData;

    } catch (error) {
      console.error('[ProgramService] 프로그램 상세 조회 오류:', error.message);
      
      // Notion SDK 에러 처리
      if (error.code === 'object_not_found') {
        const notFoundError = new Error('해당 프로그램을 찾을 수 없습니다.');
        notFoundError.code = ERROR_CODES.PROGRAM_NOT_FOUND;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      
      // Rate Limiting 처리
      if (error.code === 'rate_limited') {
        const rateLimitError = new Error('Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.');
        rateLimitError.code = 'RATE_LIMITED';
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }
      
      const serviceError = new Error(`프로그램 상세 조회 중 오류가 발생했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.NOTION_API_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }

  /**
   * 프로그램 페이지 블록 내용 조회
   * @param {string} programId - 프로그램 ID
   * @returns {Promise<Array>} 페이지 블록 내용
   */
  async getProgramPageBlocks(programId) {
    try {
      // Notion SDK 사용으로 통일
      const data = await this.notion.blocks.children.list({
        block_id: programId
      });
      
      return this.formatProgramBlocks(data.results);
    } catch (error) {
      console.warn('[ProgramService] 프로그램 페이지 블록 조회 오류:', error.message);
      return [];
    }
  }

  /**
   * FAQ 관계를 통한 FAQ 목록 조회
   * @param {Object} faqRelation - FAQ 관계 객체
   * @returns {Promise<Array>} FAQ 목록
   */
  async getFaqListForProgram(faqRelation) {
    if (!faqRelation || !faqRelation.relations || faqRelation.relations.length === 0) {
      return [];
    }

    try {
      const faqIds = faqRelation.relations.map(relation => relation.id);
      return await this.getFaqListByIds(faqIds);
    } catch (error) {
      console.warn('[ProgramService] FAQ 목록 조회 오류:', error.message);
      return [];
    }
  }

  /**
   * 프로그램 페이지 블록 포맷팅
   * @param {Array} blocks - Notion 블록 배열
   * @returns {Array} 포맷팅된 페이지 내용
   */
  formatProgramBlocks(blocks) {
    return formatNotionBlocks(blocks, { 
      includeRichText: true, 
      includeMetadata: true 
    });
  }

  /**
   * FAQ ID 목록으로 FAQ 상세 정보 조회 (병렬 처리)
   * @param {Array<string>} faqIds - FAQ ID 배열
   * @returns {Promise<Array>} FAQ 목록
   */
  async getFaqListByIds(faqIds) {
    try {
      // 병렬로 FAQ 정보 조회
      const faqPromises = faqIds.map(faqId => this.getFaqById(faqId));
      const faqResults = await Promise.allSettled(faqPromises);
      
      // 성공한 결과만 필터링
      const faqList = faqResults
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);
      
      return faqList;
    } catch (error) {
      console.error('[ProgramService] FAQ ID 목록 조회 오류:', error.message);
      return [];
    }
  }

  /**
   * 개별 FAQ 상세 정보 조회
   * @param {string} faqId - FAQ ID
   * @returns {Promise<Object|null>} FAQ 상세 정보
   */
  async getFaqById(faqId) {
    try {
      // FAQ 페이지 정보와 블록 내용을 병렬로 조회
      const [pageResponse, blocksResponse] = await Promise.allSettled([
        this.notion.pages.retrieve({
          page_id: faqId
        }),
        faqService.getPageBlocks({ pageId: faqId })
      ]);

      // 페이지 정보 조회 실패 시 null 반환
      if (pageResponse.status !== 'fulfilled') {
        return null;
      }

      const pageData = pageResponse.value;
      
      // 블록 내용 조회 실패 시 빈 배열로 처리
      let blocks = [];
      if (blocksResponse.status === 'fulfilled') {
        blocks = blocksResponse.value.results || [];
      }
      
      return {
        id: faqId,
        title: getTitleValue(pageData.properties["FAQ"]),
        category: getMultiSelectNames(pageData.properties["주제"]),
        content: this.formatFaqBlocks(blocks),
        createdAt: pageData.created_time,
        updatedAt: pageData.last_edited_time
      };
    } catch (error) {
      console.warn(`[ProgramService] FAQ ${faqId} 조회 실패:`, error.message);
      return null;
    }
  }

  /**
   * FAQ 블록 내용 포맷팅
   * @param {Array} blocks - Notion 블록 배열
   * @returns {Array} 포맷팅된 FAQ 내용
   */
  formatFaqBlocks(blocks) {
    return formatNotionBlocks(blocks, { 
      includeRichText: false, 
      includeMetadata: false 
    });
  }

  /**
   * 프로그램 데이터 포맷팅 (실제 Notion DB 구조에 맞춤)
   * @param {Object} page - Notion 페이지 객체
   * @param {boolean} includeDetails - 상세 정보 포함 여부
   */
  formatProgramData(page, includeDetails = false) {
    const props = page.properties;
    
    const baseData = {
      id: page.id,
      title: getTextContent(props[NOTION_FIELDS.PROGRAM_TITLE]),
      programName: getTextContent(props[NOTION_FIELDS.PROGRAM_NAME]),
      description: getTextContent(props[NOTION_FIELDS.PROGRAM_DESCRIPTION]),
      programType: getSelectValue(props[NOTION_FIELDS.PROGRAM_TYPE]),
      recruitmentStatus: getStatusValue(props[NOTION_FIELDS.RECRUITMENT_STATUS]),
      programStatus: getStatusValue(props[NOTION_FIELDS.PROGRAM_STATUS]),
      startDate: getDateValue(props[NOTION_FIELDS.START_DATE]),
      endDate: getDateValue(props[NOTION_FIELDS.END_DATE]),
      recruitmentStartDate: getDateValue(props[NOTION_FIELDS.RECRUITMENT_START_DATE]),
      recruitmentEndDate: getDateValue(props[NOTION_FIELDS.RECRUITMENT_END_DATE]),
      targetAudience: getTextContent(props[NOTION_FIELDS.TARGET_AUDIENCE]),
      thumbnail: getFileUrls(props[NOTION_FIELDS.THUMBNAIL]),
      linkUrl: getUrlValue(props[NOTION_FIELDS.LINK_URL]),
      isReviewRegistered: getCheckboxValue(props[NOTION_FIELDS.IS_REVIEW_REGISTERED]),
      isBannerRegistered: getCheckboxValue(props[NOTION_FIELDS.IS_BANNER_REGISTERED]),
      participants: this.getParticipantsData(props[NOTION_FIELDS.PARTICIPANTS_NAME], props[NOTION_FIELDS.PARTICIPANTS_ID]),
      notes: getTextContent(props[NOTION_FIELDS.NOTES]),
      faqRelation: getRelationValues(props[NOTION_FIELDS.FAQ]),
      createdAt: page.last_edited_time || getDateValue(props[NOTION_FIELDS.LAST_EDITED_TIME]) || null,
      updatedAt: page.last_edited_time || getDateValue(props[NOTION_FIELDS.LAST_EDITED_TIME]) || null,
      notionPageTitle: getTitleValue(props[NOTION_FIELDS.NOTION_PAGE_TITLE])
    };


    return baseData;
  }

  /**
   * 프로그램 검색 (제목, 설명 기반)
   * @param {string} searchTerm - 검색어
   * @param {Object} filters - 필터 조건
   * @param {string} [filters.recruitmentStatus] - 모집상태
   * @param {string} [filters.programStatus] - 프로그램 진행여부
   * @param {string} [filters.programType] - 프로그램 종류 (ROUTINE, TMI, GATHERING)
   * @param {number} pageSize - 페이지 크기
   * @param {string} startCursor - 페이지네이션 커서
   */
  async searchPrograms(searchTerm, filters = {}, pageSize = DEFAULT_PAGE_SIZE, startCursor = null) {
    try {
      const queryBody = {
        page_size: normalizePageSize(pageSize),
        sorts: [
          {
            property: NOTION_FIELDS.LAST_EDITED_TIME,
            direction: "descending"
          }
        ],
        filter: {
          or: [
            {
              property: NOTION_FIELDS.PROGRAM_TITLE,
              rich_text: {
                contains: searchTerm
              }
            },
            {
              property: NOTION_FIELDS.PROGRAM_DESCRIPTION,
              rich_text: {
                contains: searchTerm
              }
            },
            {
              property: NOTION_FIELDS.PROGRAM_NAME,
              rich_text: {
                contains: searchTerm
              }
            }
          ]
        }
      };

      if (startCursor) {
        queryBody.start_cursor = startCursor;
      }

      // 추가 필터 조건 적용
      if (filters.recruitmentStatus || filters.programStatus || filters.programType) {
        queryBody.filter = {
          and: [queryBody.filter]
        };

        if (filters.recruitmentStatus) {
          queryBody.filter.and.push({
            property: NOTION_FIELDS.RECRUITMENT_STATUS,
            status: {
              equals: filters.recruitmentStatus
            }
          });
        }

        if (filters.programStatus) {
          queryBody.filter.and.push({
            property: NOTION_FIELDS.PROGRAM_STATUS,
            status: {
              equals: filters.programStatus
            }
          });
        }

        if (filters.programType) {
          queryBody.filter.and.push({
            property: NOTION_FIELDS.PROGRAM_TYPE,
            select: {
              equals: filters.programType
            }
          });
        }
      }

      // v5.3.0에서 databases.query가 제거되어 dataSources.query 사용
      const data = await this.notion.dataSources.query({
        data_source_id: this.programDataSource,
        ...queryBody
      });
      const programs = data.results.map(page => this.formatProgramData(page));
      
      return {
        programs,
        hasMore: data.has_more,
        nextCursor: data.next_cursor,
        totalCount: data.results.length
      };

    } catch (error) {
      console.error('[ProgramService] 프로그램 검색 오류:', error.message);
      
      // Notion SDK 에러 처리
      if (error.code === 'object_not_found') {
        const notFoundError = new Error('프로그램 데이터 소스를 찾을 수 없습니다.');
        notFoundError.code = ERROR_CODES.MISSING_DB_ID;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      
      // Rate Limiting 처리
      if (error.code === 'rate_limited') {
        const rateLimitError = new Error('Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.');
        rateLimitError.code = 'RATE_LIMITED';
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }
      
      const serviceError = new Error(`프로그램 검색 중 오류가 발생했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.SEARCH_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }


  getParticipantsData(namesProperty, idsProperty) {
    // 참여자 이름 추출 (rollup 타입)
    const namesData = getRollupValues(namesProperty);
    // 참여자 ID 추출 (rollup 타입)
    const idsData = getRollupValues(idsProperty);
    
    // rollup 데이터에서 실제 배열 추출
    const names = namesData.value || [];
    const ids = idsData.value || [];
    
    // 이름과 ID를 매칭하여 결합
    const participants = [];
    const maxLength = Math.max(names.length, ids.length);
    
    for (let i = 0; i < maxLength; i++) {
      const name = names[i]?.name || '';
      const id = ids[i]?.name || null; // name 필드에서 ID 추출
      
      if (name || id) {
        participants.push({
          name,
          id
        });
      }
    }
    
    return participants;
  }


}

module.exports = new ProgramService();
