/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { debug } from "@/utils/shared/debugger";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * @description PWA 설치를 관리 훅
 */
export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA가 이미 설치되었는지 확인
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isIosStandalone = (window.navigator as any).standalone === true;

    debug.log("[PWA Install] 설치 상태 확인:", {
      isStandalone,
      isIosStandalone,
      userAgent: navigator.userAgent,
    });

    if (isStandalone || isIosStandalone) {
      debug.log("[PWA Install] 이미 설치됨");
      setIsInstalled(true);
      return;
    }

    let currentPrompt: BeforeInstallPromptEvent | null = null;

    // beforeinstallprompt 이벤트 리스너
    const handler = (e: Event) => {
      debug.log("[PWA Install] beforeinstallprompt 이벤트 발생!");
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      currentPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // appinstalled 이벤트 리스너
    const installedHandler = () => {
      debug.log("[PWA Install] 앱 설치 완료!");
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", installedHandler);

    // 3초 후 이벤트 감지 여부 로그
    const timeoutId = setTimeout(() => {
      debug.log("[PWA Install] 3초 경과 - 현재 상태:", {
        isInstallable,
        hasDeferredPrompt: !!currentPrompt,
      });

      if (!currentPrompt) {
        debug.warn(
          "[PWA Install] beforeinstallprompt 이벤트가 발생하지 않았습니다.\n" +
            "가능한 원인:\n" +
            "1. HTTPS가 아닌 환경 (localhost는 예외)\n" +
            "2. manifest.json이 올바르게 설정되지 않음\n" +
            "3. Service Worker가 등록되지 않음\n" +
            "4. 이미 설치되었거나 사용자가 이전에 거부함\n" +
            "5. 브라우저가 PWA 설치를 지원하지 않음 (Safari 등)"
        );
      }
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const promptInstall = async (): Promise<{
    success: boolean;
    error?: "no-prompt" | "user-dismissed" | "unknown";
  }> => {
    // deferredPrompt가 없으면 설치 프롬프트를 열 수 없음
    if (!deferredPrompt) {
      debug.warn(
        "[PWA Install] 설치 프롬프트를 열 수 없습니다. deferredPrompt가 없습니다."
      );
      return { success: false, error: "no-prompt" };
    }

    try {
      // 설치 프롬프트 표시
      await deferredPrompt.prompt();

      // 사용자 선택 대기
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return { success: true };
      }

      return { success: false, error: "user-dismissed" };
    } catch (error) {
      debug.error("[PWA Install] 설치 프롬프트 오픈 중 에러 발생:", error);
      return { success: false, error: "unknown" };
    }
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall,
  };
};
