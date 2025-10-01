import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Noto_Sans_KR } from "next/font/google";
import BottomNavigation from "@/components/shared/layouts/bottom-navigation";
import TopBar from "@/components/shared/layouts/top-bar";
import { Toaster } from "@/components/shared/ui/sonner";
import { cn } from "@/utils/shared/cn";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "유스-잇",
  description: "유스-잇 앱입니다.",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icons/favicon/16x16.png", sizes: "16x16" },
    { rel: "icon", url: "/icons/favicon/32x32.png", sizes: "32x32" },
    { rel: "icon", url: "/icons/favicon/48x48.png", sizes: "48x48" },
    { rel: "icon", url: "/icons/app/app-icon-192x192.png", sizes: "192x192" },
    { rel: "icon", url: "/icons/app/app-icon-512x512.png", sizes: "512x512" },
    {
      rel: "apple-touch-icon",
      url: "/icons/app/app-icon-192x192.png",
      sizes: "192x192",
    },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "유스잇",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* <meta name="apple-mobile-web-app-capable" content="yes" /> */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="유스잇" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple Touch 스플래시 화면 메타 태그 */}
        <link
          rel="apple-touch-startup-image"
          href="/imgs/splash/splash-2048x2732.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/imgs/splash/splash-1536x2048.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/imgs/splash/splash-1242x2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/imgs/splash/splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/imgs/splash/splash-828x1792.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/imgs/splash/splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/imgs/splash/splash-414x896.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 1) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/imgs/splash/splash-360x640.png"
          media="(device-width: 360px) and (device-height: 640px) and (-webkit-device-pixel-ratio: 1) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/imgs/splash/splash-320x568.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 1) and (orientation: portrait)"
        />
      </head>
      <body
        className={cn(notoSansKr.variable, "flex h-screen w-full flex-col")}
      >
        <Toaster />
        <div className="flex h-screen w-full flex-col">
          {/* 데모 위해 임시로 탑바/바텀 네비게이션 적용 */}
          <TopBar />
          {children}
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
