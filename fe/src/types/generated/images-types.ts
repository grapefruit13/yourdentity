/**
 * @description Images 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import type * as Schema from "./api-schema";

export type TPOSTImagesUploadImageRes = {
  imageUrl?: string;
  displayUrl?: string;
  deleteUrl?: string;
  size?: number;
  title?: string;
  fileName?: string;
  mimeType?: string;
  width?: number;
  height?: number;
};
