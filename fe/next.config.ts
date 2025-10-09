import type { NextConfig } from "next";
import withPWA from "next-pwa";
import { LINK_URL } from "@/constants/shared/_link-url";

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
