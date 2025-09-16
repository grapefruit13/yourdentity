import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yourdentity",
  description: "Yourdentity PWA",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icons/icon-192*192.png", sizes: "192x192" },
    { rel: "apple-touch-icon", url: "/icons/icon-192*192.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
