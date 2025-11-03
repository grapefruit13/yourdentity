"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import BottomNavigation from "@/components/shared/layouts/bottom-navigation";
import TopBar from "@/components/shared/layouts/top-bar";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useGetHome } from "@/hooks/generated/home-hooks";

const HOME_DATA_STALE_TIME = 60 * 1000; // 1분

/**
 * @description 하단 네브바 포함 레이아웃
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === LINK_URL.HOME;

  // 라우트 변경 시 항상 스크롤 최상단으로 이동 (Next.js 15 스크롤 복원 이슈 대응)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);

  // 홈 페이지일 때만 홈 데이터 로드 여부 확인 (스플래시 표시용)
  // staleTime: 1분(60000ms) 동안 캐시된 데이터 사용, 네트워크 요청 없음
  // refetchOnMount: staleTime 내에는 캐시된 데이터 사용, refetch 하지 않음
  const { data: homeData, isLoading: isHomeLoading } = useGetHome({
    enabled: isHomePage,
    staleTime: HOME_DATA_STALE_TIME,
    refetchOnMount: false, // staleTime 내에는 캐시된 데이터 사용, refetch 하지 않음
  });

  // 스플래시 페이드아웃: 데이터가 준비되면 짧게 opacity 전환 후 제거
  const [isFading, setIsFading] = useState(false);
  const hasShownRef = useRef(false);

  useEffect(() => {
    // 홈에서만 스플래시 관리
    if (!isHomePage) return;

    // 최초 진입에만 페이드아웃 수행 (탭 전환/재방문 시 캐시가 있으면 스킵)
    if (!hasShownRef.current && !isHomeLoading && homeData) {
      hasShownRef.current = true;
      setIsFading(true);
      const t = setTimeout(() => setIsFading(false), 400);
      return () => clearTimeout(t);
    }
  }, [isHomeLoading, homeData, isHomePage]);

  // 오버레이 스플래시: 항상 레이아웃을 렌더하고 위에 얹어서 페이드아웃
  // 표시 여부와 투명도 상태를 분리하여 버벅임 최소화
  const [showOverlay, setShowOverlay] = useState(isHomePage);
  const [overlayOpaque, setOverlayOpaque] = useState(isHomePage);

  useEffect(() => {
    if (!isHomePage) {
      setShowOverlay(false);
      return;
    }

    // 데이터 준비되면 opacity -> 0 전환 후 DOM 제거
    if (!isHomeLoading && homeData) {
      let animationFrameId: number | null = null;
      let timeoutId: NodeJS.Timeout | null = null;

      // 한 프레임 뒤에 opacity 변경하여 CSS 트랜지션 보장
      animationFrameId = requestAnimationFrame(() => {
        setOverlayOpaque(false);
        timeoutId = setTimeout(() => setShowOverlay(false), 500);
      });

      return () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      };
    } else {
      // 로딩 중에는 다시 보여주고 불투명하게 유지
      setShowOverlay(true);
      setOverlayOpaque(true);
    }
  }, [isHomePage, isHomeLoading, homeData]);

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center bg-white">
      {showOverlay && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 will-change-[opacity] ${
            overlayOpaque ? "opacity-100" : "opacity-0"
          }`}
          style={{ backfaceVisibility: "hidden", transform: "translateZ(0)" }}
        >
          <div className="relative h-full w-full max-w-[470px]">
            <img
              src="/imgs/splash/apple-splash-1320-2868.jpg"
              alt="스플래시 화면"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}
      <div className="flex min-h-[100dvh] w-full min-w-[320px] flex-col">
        <TopBar
          leftSlot={
            isHomePage ? (
              <Image
                src="/icons/logo/lg-youth-voice.svg"
                alt="Youth Voice 로고"
                width={60}
                height={20}
                className="object-contain"
                priority
                loading="eager"
              />
            ) : undefined
          }
        />
        <main className="w-full flex-1 overflow-x-hidden pb-[72px]">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}
