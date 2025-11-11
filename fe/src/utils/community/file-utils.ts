import { deleteFilesById } from "@/api/generated/files-api";

/**
 * 파일 경로 배열로 다건 삭제 요청
 * @param paths - 삭제할 파일 경로 배열
 */
export const deleteFilesByPath = async (paths: string[]): Promise<void> => {
  if (!paths.length) return;
  await Promise.allSettled(paths.map((p) => deleteFilesById({ filePath: p })));
};
