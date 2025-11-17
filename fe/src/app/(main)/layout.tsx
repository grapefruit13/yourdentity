"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import BottomNavigation from "@/components/shared/layouts/bottom-navigation";
import TopBar from "@/components/shared/layouts/top-bar";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useGetHome } from "@/hooks/generated/home-hooks";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type { TGETHomeRes } from "@/types/generated/home-types";
import {
  findEarliestExpiry,
  hasExpiredS3Urls,
} from "@/utils/shared/s3-url-parser";

const isDev = process.env.NODE_ENV === "development";
const HOME_DATA_STALE_TIME = 60 * 1000; // 1분
const CACHE_EXPIRY_KEY = "notion-home-data-expiry";

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

  const isCommunityPage = pathname === LINK_URL.COMMUNITY;
  const isMyPage = pathname === LINK_URL.MY_PAGE;
  const isMissionPage = pathname === LINK_URL.MISSION;
  const storeHideTopBar = useTopBarStore((state) => state.hideTopBar);
  const hideTopBar =
    isCommunityPage || isMyPage || isMissionPage || storeHideTopBar;

  // 라우트 변경 시 항상 스크롤 최상단으로 이동 (Next.js 15 스크롤 복원 이슈 대응)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);

  // LocalStorage 캐시 (브라우저 전용)
  // S3 URL 만료 시간을 기준으로 캐시 무효화
  const [cachedHome, setCachedHome] = useState<TGETHomeRes | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      // 만료 시간 확인
      const expiryStr = localStorage.getItem(CACHE_EXPIRY_KEY);
      if (expiryStr) {
        const expiryTime = parseInt(expiryStr, 10);
        const now = Date.now();
        if (now >= expiryTime) {
          // 만료된 캐시 삭제
          localStorage.removeItem("notion-home-data");
          localStorage.removeItem(CACHE_EXPIRY_KEY);
          return null;
        }
      }

      const raw = localStorage.getItem("notion-home-data");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // API 응답이 { message, data } 형태일 경우 unwrap
      if (parsed && typeof parsed === "object" && "data" in parsed) {
        return parsed.data as TGETHomeRes;
      }
      return parsed as TGETHomeRes;
    } catch {
      return null;
    }
  });

  // 홈 페이지일 때만 홈 데이터 로드 여부 확인 (스플래시 표시용)
  // initialData로 캐시를 주입하여 첫 렌더에서 로딩 스플래시를 최소화
  const {
    data: homeData,
    isLoading: isHomeLoading,
    refetch: refetchHome,
  } = useGetHome({
    enabled: isHomePage,
    initialData: cachedHome ?? undefined,
    staleTime: isDev ? 0 : HOME_DATA_STALE_TIME,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    select: (data) => {
      // API 응답이 { data: TGETHomeRes } 형태일 경우 unwrap
      if (data && typeof data === "object" && "data" in data) {
        return (data as { data: TGETHomeRes }).data;
      }
      return data;
    },
  });

  // updatedAt 기준으로 변경된 경우에만 캐시 갱신
  // localStorage를 다시 읽지 않고 cachedHome 상태를 직접 사용
  useEffect(() => {
    if (typeof window === "undefined" || !homeData) return;

    const currentUpdatedAt = homeData.updatedAt;
    const prevUpdatedAt = cachedHome?.updatedAt;

    // S3 URL 만료 체크: 만료된 URL이 있으면 캐시 무효화
    const hasExpiredUrls = hasExpiredS3Urls(homeData);
    if (hasExpiredUrls) {
      // 만료된 URL이 있으면 캐시 삭제하고 데이터 재요청
      try {
        localStorage.removeItem("notion-home-data");
        localStorage.removeItem(CACHE_EXPIRY_KEY);
        setCachedHome(null);
        // 데이터 재요청
        void refetchHome();
      } catch {
        // 캐시 삭제 실패는 무시
      }
      return;
    }

    // updatedAt이 없거나 변경된 경우에만 캐시 갱신
    const shouldUpdateCache =
      !cachedHome || !currentUpdatedAt || prevUpdatedAt !== currentUpdatedAt;

    if (shouldUpdateCache) {
      try {
        localStorage.setItem("notion-home-data", JSON.stringify(homeData));

        // S3 URL 만료 시간 계산 및 저장
        // 모든 이미지 URL의 만료 시간을 확인하여 가장 짧은 만료 시간을 캐시 만료 시간으로 설정
        const earliestExpiry = findEarliestExpiry(homeData);
        if (earliestExpiry) {
          localStorage.setItem(CACHE_EXPIRY_KEY, earliestExpiry.toString());
        } else {
          // S3 URL이 없거나 만료 시간을 파싱할 수 없는 경우 캐시 만료 키 제거
          localStorage.removeItem(CACHE_EXPIRY_KEY);
        }

        setCachedHome(homeData);
      } catch (error) {
        console.error("캐시 저장 실패:", error);
      }
    } else {
      // updatedAt이 변경되지 않았지만, 만료 시간이 없으면 저장
      // (이전에 저장 실패했을 수 있음)
      const existingExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      if (!existingExpiry) {
        const earliestExpiry = findEarliestExpiry(homeData);
        if (earliestExpiry) {
          try {
            localStorage.setItem(CACHE_EXPIRY_KEY, earliestExpiry.toString());
          } catch (error) {
            // 저장 실패는 무시
            console.error("만료 시간 저장 실패:", error);
          }
        }
      }
    }
  }, [homeData, cachedHome, refetchHome]);

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
    } else if (!homeData && isHomeLoading) {
      // '데이터가 전혀 없고' 로딩 중일 때만 스플래시 표시
      setShowOverlay(true);
      setOverlayOpaque(true);
    } else {
      // 캐시가 있어 화면을 그릴 수 있으면 스플래시 숨김 유지
      setShowOverlay(false);
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
        {hideTopBar ? null : (
          <TopBar
            leftSlot={
              isHomePage ? (
                <div className="relative h-[40px] w-[40px]">
                  <Image
                    src={IMAGE_URL.ICON.logo.youthIt.url}
                    alt="Youth Voice 로고"
                    fill
                    priority
                    loading="eager"
                  />
                </div>
              ) : undefined
            }
          />
        )}
        <main className="w-full flex-1 overflow-x-hidden">{children}</main>
        <BottomNavigation />
      </div>
    </div>
  );
}
