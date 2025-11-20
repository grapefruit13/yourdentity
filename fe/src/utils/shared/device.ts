type NavigatorWithStandalone = Navigator & { standalone?: boolean };

/**
 * @description iOS 기기인지 확인
 * @returns {boolean} iOS 기기인 경우 true
 */
export const isIOSDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS =
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS 13+

  return isIOS;
};

/**
 * @description PWA가 standalone 모드로 설치되어 있는지 확인
 * @returns {boolean} standalone 모드인 경우 true
 */
export const isStandalone = (): boolean => {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = window.navigator as NavigatorWithStandalone;

  return (
    navigatorWithStandalone.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
};
