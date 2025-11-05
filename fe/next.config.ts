import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { loadEnvConfig } from "@next/env";
import { LINK_URL } from "@/constants/shared/_link-url";

// Next.js 공식 환경 변수 로더 사용
loadEnvConfig(process.cwd());

const withPWA = withPWAInit({
  dest: "public",
  disable: true,
  register: true,
  cacheOnFrontEndNav: true, // 페이지 네비게이션 시 캐싱 활성화
  cacheStartUrl: true, // start_url 캐싱
  workboxOptions: {
    disableDevLogs: true, // 프로덕션 로그 최소화
    skipWaiting: true, // Service Worker 즉시 활성화
    clientsClaim: true, // 모든 클라이언트에서 즉시 활성화
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "offlineCache",
          expiration: {
            maxEntries: 200,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.notion.so",
      },
      {
        protocol: "https",
        hostname: "**.s3.**.amazonaws.com",
      },
    ],
  },
  // eslint-disable-next-line require-await
  async redirects() {
    return [
      {
        source: LINK_URL.ROOT,
        destination: LINK_URL.HOME,
        permanent: false,
      },
    ];
  },
  // API 프록시 설정 - HTTPS에서 HTTP 백엔드로 안전하게 요청
  // eslint-disable-next-line require-await
  async rewrites() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // 환경 변수가 없으면 빈 배열 반환 (프록시 비활성화)
    if (!baseUrl) {
      console.warn("⚠️ NEXT_PUBLIC_BASE_URL is not set. API proxy disabled.");
      return [];
    }

    return [
      {
        source: "/api-proxy/:path*",
        destination: `${baseUrl}/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
