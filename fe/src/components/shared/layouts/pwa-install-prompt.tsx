"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LINK_URL } from "@/constants/shared/_link-url";
import { usePwaInstall } from "@/hooks/shared/usePwaInstall";
import useToggle from "@/hooks/shared/useToggle";
import { debug } from "@/utils/shared/debugger";
import { isIOSDevice, isStandalone } from "@/utils/shared/device";
import PwaDownloadBottomSheet from "./pwa-download-bottomsheet";

// react-ios-pwa-prompt는 클라이언트 사이드에서만 동작하므로 dynamic import
const PWAPrompt = dynamic(
  () => import("react-ios-pwa-prompt").then((mod) => mod.default),
  { ssr: false }
);

const PWA_PROMPT_DISMISSED_KEY = "pwa_prompt_dismissed";
const PWA_PROMPT_DISMISSED_UNTIL_KEY = "pwa_prompt_dismissed_until";
const DISMISS_DURATION_MS = 1 * 24 * 60 * 60 * 1000; // 1일

/**
 * @description PWA 설치 프롬프트를 관리하는 컴포넌트
 */
const PwaInstallPrompt = () => {
  const router = useRouter();
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const { isOpen, open, close } = useToggle();

  // iOS 기기 여부 확인 (상태 없이 매번 체크)
  const isIOSDeviceCheck = isIOSDevice();
  const isStandaloneCheck = isStandalone();

  // iOS 프롬프트 표시 여부 확인
  const shouldShowIOSPrompt = (): boolean => {
    if (!isIOSDeviceCheck || isInstalled || isStandaloneCheck) {
      return false;
    }

    // 사용자가 이전에 "다음에 하기"를 눌렀는지 확인
    const dismissedUntilStr = localStorage.getItem(
      PWA_PROMPT_DISMISSED_UNTIL_KEY
    );

    if (dismissedUntilStr) {
      const dismissedUntil = parseInt(dismissedUntilStr, 10);
      const now = Date.now();

      if (now < dismissedUntil) {
        return false;
      }
      localStorage.removeItem(PWA_PROMPT_DISMISSED_UNTIL_KEY);
    }

    // 영구적으로 거부했는지 확인
    const isDismissedPermanently = localStorage.getItem(
      PWA_PROMPT_DISMISSED_KEY
    );

    if (isDismissedPermanently === "true") {
      return false;
    }

    return true;
  };

  // Android/Chrome용 프롬프트 표시 여부 결정
  useEffect(() => {
    // iOS가 아니고, 이미 설치되었거나 설치 불가능한 경우 표시하지 않음
    if (isIOSDeviceCheck || isInstalled || !isInstallable) {
      return;
    }

    // 사용자가 이전에 "다음에 하기"를 눌렀는지 확인
    const dismissedUntilStr = localStorage.getItem(
      PWA_PROMPT_DISMISSED_UNTIL_KEY
    );

    if (dismissedUntilStr) {
      const dismissedUntil = parseInt(dismissedUntilStr, 10);
      if (Date.now() < dismissedUntil) {
        return;
      }
      localStorage.removeItem(PWA_PROMPT_DISMISSED_UNTIL_KEY);
    }

    // 영구적으로 거부했는지 확인
    const isDismissedPermanently = localStorage.getItem(
      PWA_PROMPT_DISMISSED_KEY
    );

    if (isDismissedPermanently === "true") {
      return;
    }

    // 바텀시트 표시 (약간의 지연을 두어 UX 개선)
    const timer = setTimeout(() => {
      open();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isIOSDeviceCheck, isInstallable, isInstalled, open]);

  const handleInstall = async () => {
    try {
      const result = await promptInstall();

      if (result.success) {
        close();
        localStorage.setItem(PWA_PROMPT_DISMISSED_KEY, "true");
      } else if (result.error === "no-prompt" || result.error === "unknown") {
        // 팝업 오픈 실패: 가이드 페이지로 이동
        debug.warn(
          "[PWA Prompt] 설치 프롬프트 오픈 실패. 가이드 페이지로 이동합니다.",
          { error: result.error }
        );
        close();
        router.push(LINK_URL.DOWNLOAD);
      }
      // result.error === "user-dismissed"인 경우는 사용자가 거부한 것이므로
      // 바텀시트를 그대로 유지하여 다시 시도 가능
    } catch (error) {
      debug.error("[PWA Prompt] 설치 중 예상치 못한 에러가 발생했습니다.", {
        error,
      });
      close();
      router.push(LINK_URL.DOWNLOAD);
    }
  };

  /**
   * @description 프롬프트 닫기 처리 (1일 후에 다시 표시)
   */
  const handleDismiss = () => {
    close();

    // 1일 후에 다시 표시
    const dismissedUntil = Date.now() + DISMISS_DURATION_MS;
    localStorage.setItem(
      PWA_PROMPT_DISMISSED_UNTIL_KEY,
      dismissedUntil.toString()
    );
  };

  // iOS 기기인 경우 react-ios-pwa-prompt 사용
  if (isIOSDeviceCheck) {
    const shouldRenderIOSPrompt = shouldShowIOSPrompt();

    if (!shouldRenderIOSPrompt || isInstalled) {
      return null;
    }

    return (
      <PWAPrompt
        delay={1000}
        copySubtitle="홈 화면에 추가"
        copyTitle="유스-잇"
        copyDescription="홈 화면에 유스-잇을 추가하고 간편하게 이용해보세요!"
        copyShareStep="하단 메뉴 바에서 '공유' 버튼을 누르세요"
        copyMoreStep="'더 보기' 버튼을 누르세요"
        copyAddToHomeScreenStep="'홈 화면에 추가'를 누르세요"
        appIconPath="/icons/favicon/180x180.png"
        onClose={handleDismiss}
        isShown={shouldRenderIOSPrompt}
      />
    );
  }

  // Android/Chrome 기기인 경우 기존 바텀시트 사용
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <PwaDownloadBottomSheet
      isOpen={isOpen}
      onClose={handleDismiss}
      onInstall={handleInstall}
    />
  );
};

export default PwaInstallPrompt;
