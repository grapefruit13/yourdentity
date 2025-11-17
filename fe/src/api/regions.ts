/**
 * @description 행정구역 관련 API (Next.js API Route를 통한 SGIS 통계청 API 호출)
 * API 실패 시 fallback 데이터 사용
 */

import { KOREAN_REGIONS_FALLBACK } from "@/constants/shared/korean-regions";

export interface SidoItem {
  code: string;
  name: string;
  fullName: string;
}

export interface SigunguItem {
  code: string;
  name: string;
  fullName: string;
}

/**
 * Fallback 데이터를 SidoItem 형식으로 변환
 */
function getFallbackSidoList(): SidoItem[] {
  return KOREAN_REGIONS_FALLBACK.map((region) => ({
    code: region.code,
    name: region.name,
    fullName: region.name,
  }));
}

/**
 * Fallback 데이터를 SigunguItem 형식으로 변환
 */
function getFallbackSigunguList(sidoCode: string): SigunguItem[] {
  const region = KOREAN_REGIONS_FALLBACK.find((r) => r.code === sidoCode);
  if (!region) {
    return [];
  }
  return region.districts.map((district) => ({
    code: district.code,
    name: district.name,
    fullName: `${region.name} ${district.name}`,
  }));
}

/**
 * API 응답 데이터로 fallback 데이터 업데이트 (병합)
 * API 응답이 있으면 그것을 우선 사용하고, fallback의 누락된 데이터는 보완
 */
function mergeWithFallback(
  apiData: SidoItem[] | SigunguItem[],
  fallbackData: SidoItem[] | SigunguItem[]
): SidoItem[] | SigunguItem[] {
  if (apiData.length === 0) {
    return fallbackData;
  }

  // API 데이터를 기준으로 하고, fallback에서 누락된 항목은 보완
  const apiMap = new Map(apiData.map((item) => [item.code, item]));

  const merged = [...apiData];

  // Fallback에 있지만 API에 없는 항목 추가
  for (const fallbackItem of fallbackData) {
    if (!apiMap.has(fallbackItem.code)) {
      merged.push(fallbackItem);
    }
  }

  return merged;
}

/**
 * 시도 목록 조회 (API 실패 시 fallback 사용)
 */
export const getSidoList = async (): Promise<SidoItem[]> => {
  try {
    const response = await fetch("/api/regions");

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn("[Regions API] 시도 목록 조회 실패, fallback 데이터 사용");
      return getFallbackSidoList();
    }

    const apiData = await response.json();

    // API 응답이 비어있으면 fallback 사용
    if (!apiData || apiData.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("[Regions API] 시도 목록이 비어있음, fallback 데이터 사용");
      return getFallbackSidoList();
    }

    // API 데이터와 fallback 병합 (API 데이터 우선)
    const fallbackData = getFallbackSidoList();
    return mergeWithFallback(apiData, fallbackData) as SidoItem[];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      "[Regions API] 시도 목록 조회 에러, fallback 데이터 사용:",
      error
    );
    return getFallbackSidoList();
  }
};

/**
 * 시군구 목록 조회 (API 실패 시 fallback 사용)
 * @param sidoCode - 시도 코드 (2자리)
 */
export const getSigunguList = async (
  sidoCode: string
): Promise<SigunguItem[]> => {
  if (!sidoCode || sidoCode.length !== 2) {
    throw new Error("시도 코드는 2자리여야 합니다.");
  }

  try {
    const response = await fetch(
      `/api/regions?sidoCode=${encodeURIComponent(sidoCode)}`
    );

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn(
        `[Regions API] 시군구 목록 조회 실패 (sidoCode: ${sidoCode}), fallback 데이터 사용`
      );
      return getFallbackSigunguList(sidoCode);
    }

    const apiData = await response.json();

    // API 응답이 비어있으면 fallback 사용
    if (!apiData || apiData.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `[Regions API] 시군구 목록이 비어있음 (sidoCode: ${sidoCode}), fallback 데이터 사용`
      );
      return getFallbackSigunguList(sidoCode);
    }

    // API 데이터와 fallback 병합 (API 데이터 우선)
    const fallbackData = getFallbackSigunguList(sidoCode);
    return mergeWithFallback(apiData, fallbackData) as SigunguItem[];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[Regions API] 시군구 목록 조회 에러 (sidoCode: ${sidoCode}), fallback 데이터 사용:`,
      error
    );
    return getFallbackSigunguList(sidoCode);
  }
};
