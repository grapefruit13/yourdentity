import type { ReactNode } from "react";
import TopBar from "@/components/shared/layouts/top-bar";
import { GuestGuard } from "@/contexts/shared/guard";

/**
 * @description auth 레이아웃
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <GuestGuard>
      <main className="flex h-full w-full flex-col">
        <TopBar />
        {children}
      </main>
    </GuestGuard>
  );
}
