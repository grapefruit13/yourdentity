import { useQuery } from "@tanstack/react-query";
import {
  getSidoList,
  getSigunguList,
  type SidoItem,
  type SigunguItem,
} from "@/api/regions";

/**
 * @description 시도 목록 조회 hook
 */
export const useSidoList = () => {
  return useQuery<SidoItem[], Error>({
    queryKey: ["regions", "sido"],
    queryFn: async () => {
      return await getSidoList();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24시간 (행정구역은 자주 변경되지 않음)
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7일
  });
};

/**
 * @description 시군구 목록 조회 hook
 * @param sidoCode - 시도 코드 (2자리)
 */
export const useSigunguList = (sidoCode: string | null) => {
  return useQuery<SigunguItem[], Error>({
    queryKey: ["regions", "sigungu", sidoCode],
    queryFn: async () => {
      if (!sidoCode) {
        return [];
      }
      return await getSigunguList(sidoCode);
    },
    enabled: !!sidoCode, // sidoCode가 있을 때만 조회
    staleTime: 24 * 60 * 60 * 1000, // 24시간
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7일
  });
};
