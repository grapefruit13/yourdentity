import BottomNavigation from "@/shared/components/layouts/bottom-navigation";
import TopBar from "@/shared/components/layouts/top-bar";

/**
 * @description 하단 네브바 포함 레이아웃
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full flex-col">
      <TopBar />
      <main className="h-full">{children}</main>
      <BottomNavigation />
    </div>
  );
}
