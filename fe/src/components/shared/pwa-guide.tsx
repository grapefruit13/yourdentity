"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const PWAGuide = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installable, setInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const inStandalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    const navWithStandalone = typeof navigator !== "undefined" ? (navigator as Navigator & { standalone?: boolean }) : undefined;
    const iosStandalone = navWithStandalone?.standalone === true;
    setIsStandalone(inStandalone || iosStandalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstallable(false);
        setDeferredPrompt(null);
      }
    } catch {
      // ignore
    }
  };

  if (isStandalone) return null;

  return (
    <div className="mx-auto w-full max-w-xl rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-base font-semibold">앱 설치 안내</h2>
      {installable ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">이 기기에 앱을 설치할 수 있어요.</p>
          <button
            type="button"
            onClick={onInstallClick}
            className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
          >
            설치하기
          </button>
        </div>
      ) : (
        <div className="space-y-1 text-sm text-gray-600">
          <p>홈 화면에 추가하여 더 편리하게 이용해보세요.</p>
          <ul className="list-inside list-disc">
            <li>iOS: 공유 버튼 → &quot;홈 화면에 추가&quot;</li>
            <li>Android: 브라우저 메뉴 → &quot;앱 설치&quot; 또는 &quot;홈 화면에 추가&quot;</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PWAGuide;


