import { useEffect, useState } from "react";

/**
 * @description 클라이언트 마운트 여부를 확인하는 훅
 * 서버 사이드 렌더링과 클라이언트 사이드 렌더링의 불일치를 방지하기 위해 사용
 * @returns 클라이언트에서 마운트되었으면 true, 아니면 false
 */
export const useMounted = (): boolean => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
};
