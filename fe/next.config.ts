import { existsSync } from "fs";
import { resolve } from "path";
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { config } from "dotenv";
import { LINK_URL } from "@/constants/shared/_link-url";

// 환경 변수 파일 로드 (우선순위: .env.local > .env.production/.env.development > .env)
const loadEnvFiles = () => {
  const envFiles = [
    ".env.local",
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
    ".env",
  ];

  envFiles.forEach((file) => {
    const filePath = resolve(process.cwd(), file);
    if (existsSync(filePath)) {
      config({ path: filePath, override: false }); // 이미 설정된 변수는 덮어쓰지 않음
    }
  });
};

loadEnvFiles();

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
