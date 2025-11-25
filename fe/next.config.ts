import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { loadEnvConfig } from "@next/env";
import { LINK_URL } from "@/constants/shared/_link-url";

// Next.js 공식 환경 변수 로더 사용
loadEnvConfig(process.cwd());

const withPWA = withPWAInit({
  dest: "public",
  register: false,
  // register: true,
  // cacheOnFrontEndNav: true, // 페이지 네비게이션 시 캐싱 활성화
  // cacheStartUrl: true, // start_url 캐싱
  // workboxOptions: {
  //   disableDevLogs: true, // 프로덕션 로그 최소화
  //   skipWaiting: true, // Service Worker 즉시 활성화
  //   clientsClaim: true, // 모든 클라이언트에서 즉시 활성화
  //   // 로그인 페이지는 서비스워커 네비게이션 핸들링에서 제외
  //   navigateFallbackDenylist: [/^\/login/, /^\/login\?/],
  //   runtimeCaching: [
  //     {
  //       // 로그인 페이지 및 모든 쿼리 파라미터 포함 요청 제외 (네트워크로 직접 요청, 캐싱 안 함)
  //       // 예: /login, /login?_rsc=xxx, /login?next=xxx 등
  //       // 이 패턴을 가장 먼저 매칭하도록 순서 중요
  //       urlPattern: ({ url }) => {
  //         return url.pathname.startsWith("/login");
  //       },
  //       handler: "NetworkOnly",
  //       options: {
  //         // 서비스워커가 이 요청을 가로채지 않도록 설정
  //         // 하지만 NetworkOnly는 서비스워커를 거치되 네트워크로만 전달
  //         // 실제로 서비스워커를 완전히 우회하려면 클라이언트 측에서 처리 필요
  //       },
  //     },
  //     {
  //       // API 프록시 요청은 제외 (네트워크로 직접 요청)
  //       urlPattern: /^https?:\/\/.*\/api-proxy\/.*/i,
  //       handler: "NetworkOnly",
  //     },
  //     {
  //       // Firebase Auth 도메인은 제외
  //       urlPattern:
  //         /^https?:\/\/.*\.(firebaseapp\.com|firebasestorage\.app|googleapis\.com)\/.*/i,
  //       handler: "NetworkOnly",
  //     },
  //     {
  //       // 카카오 OAuth 도메인은 제외
  //       urlPattern: /^https?:\/\/.*\.(kakao\.com|kauth\.kakao\.com)\/.*/i,
  //       handler: "NetworkOnly",
  //     },
  //     {
  //       // 나머지 요청은 NetworkFirst 전략 사용
  //       urlPattern: /^https?.*/,
  //       handler: "NetworkFirst",
  //       options: {
  //         cacheName: "offlineCache",
  //         expiration: {
  //           maxEntries: 200,
  //         },
  //       },
  //     },
  //   ],
  // },
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
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "**.firebasestorage.app",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
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
