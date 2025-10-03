import BottomNavigation from "@/components/shared/layouts/bottom-navigation";

/**
 * @description 하단 네브바 포함 레이아웃
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full w-full flex-col">
      {/* <TopBar /> */}
      <main className="flex h-full w-full flex-col">{children}</main>
      {/* <BottomNavigation /> */}
      {/* <PWAInstall /> */}
    </div>
  );
}
