import BottomNavigation from "@/components/shared/layouts/bottom-navigation";
import TopBar from "@/components/shared/layouts/top-bar";
/**
 * @description 하단 네브바 포함 레이아웃
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center bg-white">
      <div className="flex min-h-[100dvh] w-full max-w-[470px] min-w-[320px] flex-col">
        <TopBar />
        <main className="w-full flex-1 overflow-x-hidden pb-[72px]">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}
