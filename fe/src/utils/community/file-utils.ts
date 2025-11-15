import { deleteFilesById } from "@/api/generated/files-api";
import { ERROR_MESSAGES } from "@/constants/community/_write-constants";
import { debug } from "@/utils/shared/debugger";

/**
 * 파일 경로 배열로 다건 삭제 요청
 * @param paths - 삭제할 파일 경로 배열
 */
export const deleteFilesByPath = async (paths: string[]): Promise<void> => {
  if (!paths.length) return;
  await Promise.allSettled(paths.map((p) => deleteFilesById({ filePath: p })));
};

/**
 * 파일 중복 제거
 * - 같은 이름/사이즈/최종수정시간 조합은 동일 파일로 간주하여 1개만 유지합니다.
 * @param files - 원본 파일 배열
 * @returns 중복이 제거된 파일 배열
 */
export const dedupeFiles = (files: File[]): File[] => {
  const map = new Map<string, File>();
  files.forEach((f) => {
    const key = `${f.name}-${f.size}-${f.lastModified}`;
    if (!map.has(key)) map.set(key, f);
  });
  return Array.from(map.values());
};

/**
 * 에러가 이미 처리된 경우인지 확인
 * @param error - 에러 객체
 * @returns 이미 처리된 에러인지 여부
 */
export const isHandledError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  return (
    error.message === ERROR_MESSAGES.IMAGE_UPLOAD_FAILED ||
    error.message === ERROR_MESSAGES.IMAGE_URL_REPLACE_FAILED
  );
};

/**
 * 업로드된 파일들 롤백 삭제
 * @param imagePaths - 업로드된 이미지 경로 배열
 * @param filePaths - 업로드된 파일 경로 배열
 * @param context - 컨텍스트 메시지 (기본값: "게시글 작성/수정 실패")
 */
export const rollbackUploadedFiles = async (
  imagePaths: string[],
  filePaths: string[],
  context = "게시글 작성/수정 실패"
): Promise<void> => {
  const filesToDelete = [...imagePaths, ...filePaths];
  if (filesToDelete.length === 0) return;

  debug.log(`${context}, 파일 삭제 시작:`, filesToDelete);
  try {
    await deleteFilesByPath(filesToDelete);
    debug.log("파일 삭제 완료");
  } catch (deleteError) {
    debug.error("파일 삭제 중 에러:", deleteError);
  }
};
