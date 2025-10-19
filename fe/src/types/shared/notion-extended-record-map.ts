/**
 * @fileoverview Notion ExtendedRecordMap 타입 정의
 * @description BE에서 Notion 데이터를 가공하여 제공하므로, FE에서는 간단한 타입만 정의
 *
 * @todo BE API 응답 구조가 확정되면 이 타입을 실제 응답 구조로 변경
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = Record<string, any>;

/**
 * Notion 페이지의 확장된 레코드 맵 타입
 * @interface ExtendedRecordMap
 */
export interface ExtendedRecordMap {
  /** 페이지 블록 데이터 */
  block: Record<string, AnyObject>;
  /** 컬렉션 데이터 (선택적) */
  collection?: Record<string, AnyObject>;
  /** 컬렉션 뷰 데이터 (선택적) */
  collection_view?: Record<string, AnyObject>;
  /** Notion 사용자 데이터 (선택적) */
  notion_user?: Record<string, AnyObject>;
  /** 컬렉션 쿼리 데이터 (선택적) */
  collection_query?: Record<string, AnyObject>;
  /** 서명된 URL 데이터 (선택적) */
  signed_urls?: Record<string, string>;
  /** Notion 워크스페이스 데이터 (선택적) */
  space?: Record<string, AnyObject>;
  /** 미리보기 이미지 데이터 (선택적) */
  preview_images?: Record<string, AnyObject>;
}
