/* eslint-disable @typescript-eslint/no-explicit-any */
import { postFilesUploadMultiple } from "@/api/generated/files-api";
import { MAX_FILES } from "@/constants/community/_write-constants";
import { debug } from "@/utils/shared/debugger";

type FileQueueItem = { clientId: string; file: File };

type UploadResult = {
  byIdToPath: Map<string, string>;
  byIdToUrl: Map<string, string>;
  failedCount: number;
};

/**
 * 파일 큐를 한 번에 업로드하고 clientId 매핑을 반환
 * @param queue - 업로드할 파일 큐
 * @param logPrefix - 로그 접두사 (디버깅용)
 * @returns 업로드 결과
 */
export const uploadFileQueue = async (
  queue: FileQueueItem[],
  logPrefix = "파일"
): Promise<UploadResult> => {
  debug.log(`${logPrefix} 업로드 호출, queue.length:`, queue.length);

  if (!queue.length) {
    return {
      byIdToPath: new Map<string, string>(),
      byIdToUrl: new Map<string, string>(),
      failedCount: 0,
    };
  }

  const formData = new FormData();
  queue.slice(0, MAX_FILES).forEach(({ clientId, file }) => {
    const renamed = new File([file], `${clientId}__${file.name}`, {
      type: file.type,
    });
    formData.append("file", renamed);
  });

  debug.log(`${logPrefix} 업로드 API 호출 시작, 파일 개수:`, queue.length);
  const res = await postFilesUploadMultiple(formData);
  debug.log(`${logPrefix} 업로드 API 응답:`, res);

  const items = (res as any)?.data?.files ?? [];
  const byIdToPath = new Map<string, string>();
  const byIdToUrl = new Map<string, string>();
  let failedCount = 0;

  const uploadedCount = queue.slice(0, MAX_FILES).length;

  // 응답 개수가 업로드한 개수보다 적으면 일부가 실패한 것
  if (items.length < uploadedCount) {
    failedCount = uploadedCount - items.length;
  }

  // 각 응답 아이템 검사
  for (const item of items) {
    if (!item?.success) {
      failedCount += 1;
      continue;
    }

    const data = item?.data;
    const filePath = data?.path ?? data?.fileName;
    if (!filePath) {
      failedCount += 1;
      continue;
    }

    const original = data.originalFileName ?? data.fileName ?? "";
    const clientId = String(original).split("__")[0] || "";

    if (clientId) {
      byIdToPath.set(clientId, filePath);
      const url = data.fileUrl || filePath;
      byIdToUrl.set(clientId, url);
    }
  }

  debug.log(`${logPrefix} 업로드 결과:`, {
    byIdToPath: Array.from(byIdToPath.entries()),
    byIdToUrl: Array.from(byIdToUrl.entries()),
    failedCount,
  });

  return { byIdToPath, byIdToUrl, failedCount };
};
