import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    formats: ["image/webp", "image/avif"],
    unoptimized: true, // 정적 export에서 필요
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === "development",
  disable: false,
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
