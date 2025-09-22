import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/shared/components/ui/sonner";

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
    title: "Yourdentity",
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Yourdentity" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
