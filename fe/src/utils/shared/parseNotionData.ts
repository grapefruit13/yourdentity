import { NOTION_PROPERTY_MAPPINGS } from "@/constants/shared/notion-property-mapping";
import { NotionPageData } from "@/types/shared/notion";
import type { ExtendedRecordMap } from "@/types/shared/notion-extended-record-map";

/**
 * @description Notion recordMap에서 페이지 데이터를 파싱
 */
export const parseNotionData = (
  recordMap: ExtendedRecordMap
): NotionPageData | null => {
  try {
    // 첫 번째 페이지 블록 찾기
    const pageId = Object.keys(recordMap.block).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (id) => (recordMap.block[id] as any)?.value?.type === "page"
    );

    if (!pageId) {
      // 개발 환경에서만 에러 로깅
      if (process.env.NODE_ENV === "development") {
        console.error("페이지 블록을 찾을 수 없습니다.");
      }
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageBlock = (recordMap.block[pageId] as any)?.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties = (pageBlock?.properties || {}) as any;

    // Collection schema에서 property 이름 매핑 가져오기
    const propertyMap = new Map<string, string>();

    if (recordMap.collection) {
      const collections = Object.values(recordMap.collection);
      if (collections.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const collection = (collections[0] as any)?.value;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schema = collection?.schema as any;

        // schema의 각 property ID를 실제 이름으로 매핑
        if (schema) {
          Object.entries(schema).forEach(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ([id, prop]: [string, any]) => {
              propertyMap.set(id, prop.name);
            }
          );
        }
      }
    }

    // property 이름을 ID로 역매핑
    const nameToId = new Map<string, string>();
    propertyMap.forEach((name, id) => {
      nameToId.set(name, id);
    });

    // 타입별 추출 함수
    const extractors = {
      text: (propertyName: string): string => {
        const propId = nameToId.get(propertyName);
        if (!propId) return "";

        const prop = properties[propId];
        if (!prop || !Array.isArray(prop) || prop.length === 0) return "";

        const firstItem = prop[0];
        if (!Array.isArray(firstItem) || firstItem.length === 0) return "";

        return String(firstItem[0] || "");
      },

      number: (propertyName: string): number => {
        const text = extractors.text(propertyName);
        return parseInt(text) || 0;
      },

      checkbox: (propertyName: string): boolean => {
        const text = extractors.text(propertyName);
        return text === "Yes";
      },

      tags: (propertyName: string): string[] => {
        const text = extractors.text(propertyName);
        if (!text) return [];
        return text.split(",").map((tag) => tag.trim());
      },

      image: (propertyName: string): string => {
        const propId = nameToId.get(propertyName);
        if (!propId) return "";

        const prop = properties[propId];
        if (!prop || !Array.isArray(prop) || prop.length === 0) return "";

        const firstItem = prop[0];
        if (!Array.isArray(firstItem) || firstItem.length < 2) return "";

        const linkData = firstItem[1];
        if (!Array.isArray(linkData) || linkData.length === 0) return "";

        const linkInfo = linkData[0];
        if (!Array.isArray(linkInfo) || linkInfo.length < 2) return "";

        const attachmentUrl = linkInfo[1];
        if (typeof attachmentUrl !== "string") return "";

        if (attachmentUrl.startsWith("attachment:")) {
          return `https://www.notion.so/image/${encodeURIComponent(attachmentUrl)}?table=block&id=${pageId}&cache=v2`;
        }

        return "";
      },
    };

    // 매핑 설정을 기반으로 동적으로 데이터 추출
    const result: Partial<NotionPageData> = {};

    NOTION_PROPERTY_MAPPINGS.forEach((mapping) => {
      const extractor = extractors[mapping.type];
      const value = extractor(mapping.notionKey);

      // 값이 비어있으면 기본값 사용
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[mapping.key] = value || mapping.defaultValue;
    });

    // title은 특별 처리 (properties.title에서도 가져올 수 있음)
    if (!result.title) {
      result.title = properties.title?.[0]?.[0] || "";
    }

    return result as NotionPageData;
  } catch (error) {
    // 개발 환경에서만 에러 로깅
    if (process.env.NODE_ENV === "development") {
      console.error("Notion 데이터 파싱 실패:", error);
    }
    return null;
  }
};
