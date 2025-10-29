import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { LINK_URL } from "@/constants/shared/_link-url";

const withPWA = withPWAInit({
  dest: "public",
  // disable: false, // 프로덕션에서도 PWA 활성화
  disable: true, // 프로덕션에서도 PWA 활성화
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
  },
  // eslint-disable-next-line require-await
  async redirects() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }
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
    return [
      {
        source: "/api-proxy/:path*",
        destination:
          "https://asia-northeast3-youthvoice-2025.cloudfunctions.net/api/:path*",
      },
    ];
  },
};

export default withPWA(nextConfig);
