import { useState, useEffect } from "react";

/**
 * @description 모바일 디바이스 여부를 감지하는 커스텀 훅
 * @returns {boolean} 모바일 디바이스이면 true, 아니면 false
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 *
 * return (
 *   <div>
 *     {isMobile ? <MobileView /> : <DesktopView />}
 *   </div>
 * );
 * ```
 */
const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 모바일 디바이스 감지
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ["android", "iphone", "ipad", "ipod", "mobile"];
      return mobileKeywords.some((keyword) => userAgent.includes(keyword));
    };

    setIsMobile(checkMobile());
  }, []);

  return isMobile;
};

export default useIsMobile;
