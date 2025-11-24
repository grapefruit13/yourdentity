"use client";

import { useEffect, useRef, useState } from "react";
import BottomSheet from "@/components/shared/ui/bottom-sheet";
import { debug } from "@/utils/shared/debugger";

interface AuthWebViewBottomSheetProps {
  /** 바텀시트 열림/닫힘 상태 */
  isOpen: boolean;
  /** 바텀시트 닫기 핸들러 */
  onClose: () => void;
  /** 로그인 URL */
  loginUrl: string;
}

/**
 * @description iOS PWA 환경에서 /login 페이지를 웹뷰 바텀시트로 표시하는 컴포넌트
 * iframe을 사용하여 /login 페이지를 로드하고, 페이지 이동 시 바텀시트를 닫음
 */
export const AuthWebViewBottomSheet = ({
  isOpen,
  onClose,
  loginUrl,
}: AuthWebViewBottomSheetProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // iframe 내부 페이지 변경 감지하여 같은 도메인 내에서 /login이 아닌 페이지로 이동하면 바텀시트 닫기
  // Firebase 핸들러나 외부 링크로 이동하는 경우는 제외
  useEffect(() => {
    if (!isOpen || !iframeRef.current) return;

    const iframe = iframeRef.current;
    let lastUrl = loginUrl;
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : "";

    const checkUrlChange = () => {
      try {
        // iframe의 현재 URL 확인 (같은 origin이므로 접근 가능)
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
          const currentUrl = iframeWindow.location.href;
          const currentUrlObj = new URL(currentUrl);

          // 같은 도메인인지 확인
          const isSameOrigin = currentUrlObj.origin === currentOrigin;

          // Firebase Auth 핸들러인지 확인
          const isFirebaseHandler =
            currentUrl.includes("/__/auth/handler") ||
            currentUrl.includes("firebaseapp.com") ||
            currentUrl.includes("/__/firebase/");

          // 외부 링크인지 확인
          const isExternalLink = !isSameOrigin;

          // 같은 도메인 내에서 /login이 아닌 다른 페이지로 이동한 경우만 바텀시트 닫기
          // Firebase 핸들러나 외부 링크로 이동하는 경우는 제외
          if (
            currentUrl !== lastUrl &&
            isSameOrigin &&
            !currentUrl.includes("/login") &&
            !isFirebaseHandler &&
            !isExternalLink
          ) {
            debug.log(
              "AuthWebViewBottomSheet: 로그인 완료, 바텀시트 닫기",
              currentUrl
            );
            onClose();
          }
          lastUrl = currentUrl;
        }
      } catch (error) {
        // cross-origin 에러는 외부 링크로 이동한 것으로 간주하고 무시
        debug.warn(
          "AuthWebViewBottomSheet: URL 확인 실패 (외부 링크일 수 있음)",
          error
        );
      }
    };

    // 주기적으로 URL 변경 확인 (페이지 이동 감지)
    const interval = setInterval(checkUrlChange, 500);

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, loginUrl, onClose]);

  // iframe 로드 완료 시
  const handleIframeLoad = () => {
    setIsLoading(false);
    debug.log("AuthWebViewBottomSheet: iframe 로드 완료");
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="min-h-full p-0">
      <div className="flex h-full max-h-full flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold">로그인</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 웹뷰 컨테이너 */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <iframe
            ref={iframeRef}
            src={loginUrl}
            className="min-h-80vh h-full w-full border-0"
            onLoad={handleIframeLoad}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            style={{ minHeight: "80vh" }}
          />
        </div>
      </div>
    </BottomSheet>
  );
};
