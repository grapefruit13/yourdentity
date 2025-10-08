"use client";

import * as React from "react";
import { usePwaInstall } from "@/hooks/shared/usePwaInstall";
import useToggle from "@/hooks/shared/useToggle";
import PwaDownloadBottomSheet from "./pwa-download-bottomsheet";

const PWA_PROMPT_DISMISSED_KEY = "pwa_prompt_dismissed";
const PWA_PROMPT_DISMISSED_UNTIL_KEY = "pwa_prompt_dismissed_until";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7일

/**
 * @description PWA 설치 프롬프트를 관리하는 컴포넌트
 */
const PwaInstallPrompt = () => {
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const { isOpen, open, close } = useToggle();

  React.useEffect(() => {
    // 이미 설치되었거나 설치 불가능한 경우 표시하지 않음
    if (isInstalled || !isInstallable) {
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
  }, [isInstallable, isInstalled, open]);

  const handleInstall = async () => {
    const success = await promptInstall();

    if (success) {
      close();
      localStorage.setItem(PWA_PROMPT_DISMISSED_KEY, "true");
    }
  };

  const handleDismiss = () => {
    close();

    // 7일 후에 다시 표시
    const dismissedUntil = Date.now() + DISMISS_DURATION_MS;
    localStorage.setItem(
      PWA_PROMPT_DISMISSED_UNTIL_KEY,
      dismissedUntil.toString()
    );
  };

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
