/**
 * @description Programs 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import type * as Schema from "./api-schema";

export interface TGETApiProgramsReq {
  recruitmentStatus?: "before" | "ongoing" | "completed" | "cancelled";
  programStatus?: "before" | "ongoing" | "completed" | "cancelled";
  programType?: "ROUTINE" | "TMI" | "GATHERING";
  pageSize?: number;
  cursor?: string;
}

export type TGETApiProgramsRes = Schema.ProgramListResponse;

export interface TGETApiProgramsSearchReq {
  q: string;
  recruitmentStatus?: "before" | "ongoing" | "completed" | "cancelled";
  programStatus?: "before" | "ongoing" | "completed" | "cancelled";
  programType?: "ROUTINE" | "TMI" | "GATHERING";
  pageSize?: number;
  cursor?: string;
}

export type TGETApiProgramsSearchRes = Schema.ProgramSearchResponse;

export interface TGETApiProgramsByIdReq {
  programId: string;
}

export type TGETApiProgramsByIdRes = Schema.ProgramDetailResponse;
