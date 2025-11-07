/**
 * @description Programs 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import type * as Schema from "./api-schema";

export interface TGETProgramsReq {
  recruitmentStatus?: "before" | "ongoing" | "completed" | "cancelled";
  programStatus?: "before" | "ongoing" | "completed" | "cancelled";
  programType?: "ROUTINE" | "TMI" | "GATHERING";
  pageSize?: number;
  cursor?: string;
}

export type TGETProgramsRes = Schema.ProgramListResponse;

export interface TGETProgramsSearchReq {
  q: string;
  recruitmentStatus?: "before" | "ongoing" | "completed" | "cancelled";
  programStatus?: "before" | "ongoing" | "completed" | "cancelled";
  programType?: "ROUTINE" | "TMI" | "GATHERING";
  pageSize?: number;
  cursor?: string;
}

export type TGETProgramsSearchRes = Schema.ProgramSearchResponse;

export interface TGETProgramsByIdReq {
  programId: string;
}

export type TGETProgramsByIdRes = Schema.ProgramDetailResponse;

export interface TPOSTProgramsApplyByIdReq {
  programId: string;
  data: Schema.ProgramApplicationRequest;
}

export type TPOSTProgramsApplyByIdRes = Schema.ProgramApplicationResponse;

export interface TGETProgramsApplicationsApproveByTwoIdsReq {
  programId: string;
  applicationId: string;
}

export interface TGETProgramsApplicationsRejectByTwoIdsReq {
  programId: string;
  applicationId: string;
}
