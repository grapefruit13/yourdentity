import TopBar from "@/components/shared/layouts/top-bar";

/**
 * @description auth 레이아웃
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-full w-full flex-col">
      <TopBar />
      {children}
    </main>
  );
}
