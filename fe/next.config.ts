import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false, // 프로덕션에서도 PWA 활성화
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
})(nextConfig);
