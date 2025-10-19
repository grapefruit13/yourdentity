const { Client } = require('@notionhq/client');
const { buildNotionHeadersFromEnv } = require('../utils/notionHelper');
const faqService = require('./faqService');

// 상수 정의
const NOTION_VERSION = process.env.NOTION_VERSION || "2025-09-03";
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

// 에러 코드 정의
const ERROR_CODES = {
  MISSING_API_KEY: 'MISSING_NOTION_API_KEY',
  MISSING_DB_ID: 'MISSING_NOTION_DB_ID',
  NOTION_API_ERROR: 'NOTION_API_ERROR',
  PROGRAM_NOT_FOUND: 'PROGRAM_NOT_FOUND',
  INVALID_PAGE_SIZE: 'INVALID_PAGE_SIZE',
  SEARCH_ERROR: 'SEARCH_ERROR'
};

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

class ProgramService {
  constructor() {
    const {
      NOTION_API_KEY,
      NOTION_PROGRAM_DB_ID,
    } = process.env;

    // 환경 변수 검증
    if (!NOTION_API_KEY) {
      const error = new Error("NOTION_API_KEY is required");
      error.code = ERROR_CODES.MISSING_API_KEY;
      throw error;
    }
    if (!NOTION_PROGRAM_DB_ID) {
      const error = new Error("NOTION_PROGRAM_DB_ID is required");
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
        page_size: pageSize,
        sorts: [
          {
            property: "최근 수정 날짜",
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
            property: "모집상태",
            status: {
              equals: filters.recruitmentStatus
            }
          });
        }

        if (filters.programStatus) {
          queryBody.filter.and.push({
            property: "프로그램 진행 여부",
            status: {
              equals: filters.programStatus
            }
          });
        }

        if (filters.programType) {
          queryBody.filter.and.push({
            property: "프로그램 종류",
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
   * @param {Array} faqRelation - FAQ 관계 배열
   * @returns {Promise<Array>} FAQ 목록
   */
  async getFaqListForProgram(faqRelation) {
    if (!faqRelation || faqRelation.length === 0) {
      return [];
    }

    try {
      const faqIds = faqRelation.map(relation => relation.id);
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
    return blocks.map(block => {
      const formattedBlock = {
        type: block.type,
        id: block.id,
        hasChildren: block.has_children
      };

      switch (block.type) {
        case 'paragraph':
          formattedBlock.text = block.paragraph?.rich_text?.map(text => text.plain_text).join('') || '';
          formattedBlock.richText = block.paragraph?.rich_text || [];
          break;
        case 'heading_1':
          formattedBlock.text = block.heading_1?.rich_text?.map(text => text.plain_text).join('') || '';
          formattedBlock.richText = block.heading_1?.rich_text || [];
          break;
        case 'heading_2':
          formattedBlock.text = block.heading_2?.rich_text?.map(text => text.plain_text).join('') || '';
          formattedBlock.richText = block.heading_2?.rich_text || [];
          break;
        case 'heading_3':
          formattedBlock.text = block.heading_3?.rich_text?.map(text => text.plain_text).join('') || '';
          formattedBlock.richText = block.heading_3?.rich_text || [];
          break;
        case 'bulleted_list_item':
          formattedBlock.text = block.bulleted_list_item?.rich_text?.map(text => text.plain_text).join('') || '';
          formattedBlock.richText = block.bulleted_list_item?.rich_text || [];
          break;
        case 'numbered_list_item':
          formattedBlock.text = block.numbered_list_item?.rich_text?.map(text => text.plain_text).join('') || '';
          formattedBlock.richText = block.numbered_list_item?.rich_text || [];
          break;
        case 'to_do':
          formattedBlock.text = block.to_do?.rich_text?.map(text => text.plain_text).join('') || '';
          formattedBlock.checked = block.to_do?.checked || false;
          formattedBlock.richText = block.to_do?.rich_text || [];
          break;
        case 'toggle':
          formattedBlock.text = block.toggle?.rich_text?.map(text => text.plain_text).join('') || '';
          formattedBlock.richText = block.toggle?.rich_text || [];
          break;
        case 'quote':
          formattedBlock.text = block.quote?.rich_text?.map(text => text.plain_text).join('') || '';
          formattedBlock.richText = block.quote?.rich_text || [];
          break;
        case 'callout':
          formattedBlock.text = block.callout?.rich_text?.map(text => text.plain_text).join('') || '';
          formattedBlock.icon = block.callout?.icon;
          formattedBlock.richText = block.callout?.rich_text || [];
          break;
        case 'image':
          formattedBlock.caption = block.image?.caption?.map(text => text.plain_text).join('') || '';
          formattedBlock.url = block.image?.type === 'external' 
            ? block.image.external.url 
            : block.image?.file?.url;
          break;
        case 'video':
          formattedBlock.caption = block.video?.caption?.map(text => text.plain_text).join('') || '';
          formattedBlock.url = block.video?.type === 'external' 
            ? block.video.external.url 
            : block.video?.file?.url;
          break;
        case 'file':
          formattedBlock.caption = block.file?.caption?.map(text => text.plain_text).join('') || '';
          formattedBlock.url = block.file?.type === 'external' 
            ? block.file.external.url 
            : block.file?.file?.url;
          break;
        case 'divider':
          // 구분선은 별도 텍스트 없음
          break;
        default:
          formattedBlock.text = '';
          formattedBlock.richText = [];
      }

      return formattedBlock;
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
        title: this.getTitleValue(pageData.properties["제목"]),
        category: this.getMultiSelectValues(pageData.properties["주제"]),
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
    return blocks.map(block => {
      const formattedBlock = {
        type: block.type,
        id: block.id
      };

      switch (block.type) {
        case 'paragraph':
          formattedBlock.text = block.paragraph?.rich_text?.map(text => text.plain_text).join('') || '';
          break;
        case 'heading_1':
          formattedBlock.text = block.heading_1?.rich_text?.map(text => text.plain_text).join('') || '';
          break;
        case 'heading_2':
          formattedBlock.text = block.heading_2?.rich_text?.map(text => text.plain_text).join('') || '';
          break;
        case 'heading_3':
          formattedBlock.text = block.heading_3?.rich_text?.map(text => text.plain_text).join('') || '';
          break;
        case 'bulleted_list_item':
          formattedBlock.text = block.bulleted_list_item?.rich_text?.map(text => text.plain_text).join('') || '';
          break;
        case 'numbered_list_item':
          formattedBlock.text = block.numbered_list_item?.rich_text?.map(text => text.plain_text).join('') || '';
          break;
        default:
          formattedBlock.text = '';
      }

      return formattedBlock;
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
      title: this.getTextContent(props["프로그램 제목"]),
      programName: this.getTextContent(props["프로그램명"]),
      description: this.getTextContent(props["프로그램 소개글"]),
      programType: this.getSelectValue(props["프로그램 종류"]),
      recruitmentStatus: this.getStatusValue(props["모집상태"]),
      programStatus: this.getStatusValue(props["프로그램 진행 여부"]),
      startDate: this.getDateValue(props["활동 시작 날짜"]),
      endDate: this.getDateValue(props["활동 종료 날짜"]),
      recruitmentStartDate: this.getDateValue(props["모집 시작 날짜"]),
      recruitmentEndDate: this.getDateValue(props["모집 종료 날짜"]),
      targetAudience: this.getTextContent(props["참여 대상"]),
      thumbnail: this.getFileUrls(props["썸네일"]),
      linkUrl: this.getUrlValue(props["바로 보러 가기"]),
      isReviewRegistered: this.getCheckboxValue(props["프로그램 후기 등록 여부"]),
      isBannerRegistered: this.getCheckboxValue(props["하단 배너 등록 여부"]),
      participants: this.getMultiSelectValues(props["참여자 별명"]),
      notes: this.getTextContent(props["참고 사항"]),
      userIds: this.getTextContent(props["사용자ID"]),
      faqRelation: this.getRelationValue(props["FAQ"]),
      createdAt: page.last_edited_time || this.getDateValue(props["최근 수정 날짜"]) || null,
      notionPageTitle: this.getTitleValue(props["상세페이지(노션)"])
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
        page_size: pageSize,
        sorts: [
          {
            property: "최근 수정 날짜",
            direction: "descending"
          }
        ],
        filter: {
          or: [
            {
              property: "프로그램 제목",
              rich_text: {
                contains: searchTerm
              }
            },
            {
              property: "프로그램 소개글",
              rich_text: {
                contains: searchTerm
              }
            },
            {
              property: "프로그램명",
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
            property: "모집상태",
            status: {
              equals: filters.recruitmentStatus
            }
          });
        }

        if (filters.programStatus) {
          queryBody.filter.and.push({
            property: "프로그램 진행 여부",
            status: {
              equals: filters.programStatus
            }
          });
        }

        if (filters.programType) {
          queryBody.filter.and.push({
            property: "프로그램 종류",
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


  // Helper methods for extracting data from Notion properties
  getTextContent(property) {
    if (!property || !property.rich_text) return '';
    return property.rich_text.map(text => text.plain_text).join('');
  }

  getRichTextContent(property) {
    if (!property || !property.rich_text) return '';
    return property.rich_text.map(text => ({
      text: text.plain_text,
      annotations: text.annotations,
      href: text.href
    }));
  }

  getStatusValue(property) {
    if (!property || !property.status) return null;
    return property.status.name;
  }

  getSelectValue(property) {
    if (!property || !property.select) return null;
    return property.select.name;
  }

  getMultiSelectValues(property) {
    if (!property || !property.multi_select) return [];
    return property.multi_select.map(option => option.name);
  }

  getNumberValue(property) {
    if (!property || property.number === null || property.number === undefined) return null;
    return property.number;
  }

  getDateValue(property) {
    if (!property || !property.date) return null;
    return property.date.start;
  }

  getCheckboxValue(property) {
    if (!property) return false;
    return property.checkbox;
  }

  getUrlValue(property) {
    if (!property || !property.url) return null;
    return property.url;
  }

  getTitleValue(property) {
    if (!property || !property.title) return '';
    return property.title.map(text => text.plain_text).join('');
  }

  getFileUrls(property) {
    if (!property || !property.files) return [];
    return property.files.map(file => ({
      name: file.name,
      url: file.type === 'external' ? file.external.url : file.file.url,
      type: file.type
    }));
  }

  getRelationValue(property) {
    if (!property || !property.relation) return [];
    return property.relation.map(relation => ({
      id: relation.id
    }));
  }
}

module.exports = new ProgramService();
