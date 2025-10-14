/**
 * @description ExtendedRecordMap 대체 타입
 * BE에서 Notion 데이터를 가공하여 제공하므로, FE에서는 간단한 타입만 정의
 *
 * TODO: BE API 응답 구조가 확정되면 이 타입을 실제 응답 구조로 변경
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = Record<string, any>;

export interface ExtendedRecordMap {
  block: Record<string, AnyObject>;
  collection?: Record<string, AnyObject>;
  collection_view?: Record<string, AnyObject>;
  notion_user?: Record<string, AnyObject>;
  collection_query?: Record<string, AnyObject>;
  signed_urls?: Record<string, string>;
}
