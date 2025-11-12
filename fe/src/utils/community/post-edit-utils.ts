/**
 * filePath 매칭 여부 확인
 * @param currentPath - 현재 경로
 * @param originalPath - 원본 경로
 * @returns 매칭 여부
 */
export const isFilePathMatching = (
  currentPath: string,
  originalPath: string
): boolean => {
  return (
    currentPath === originalPath ||
    currentPath.includes(originalPath) ||
    originalPath.includes(currentPath)
  );
};
