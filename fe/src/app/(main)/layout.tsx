import BottomNavigation from "@/components/shared/layouts/bottom-navigation";
import TopBar from "@/components/shared/layouts/top-bar";
import { AuthGuard } from "@/contexts/shared/guard";
/**
 * @description 하단 네브바 포함 레이아웃
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex min-h-[100dvh] w-full flex-col">
        <TopBar />
        <main className="flex w-full flex-1 flex-col">{children}</main>
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
