import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "유스잇",
    short_name: "유스잇",
    description: "유스잇",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    lang: "ko",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/favicon/16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/icons/favicon/32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icons/favicon/48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/icons/app/app-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/app/app-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
