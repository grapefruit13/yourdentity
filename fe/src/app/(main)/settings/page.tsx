"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SettingsSection from "@/components/my-page/SettingsSection";
import LogoutModal from "@/components/my-page/LogoutModal";

/**
 * @description 설정 페이지
 */
const SettingsPage = () => {
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    // TODO: 실제 로그아웃 로직 구현
    console.log("로그아웃 확인");
    setIsLogoutModalOpen(false);
    // 로그아웃 후 로그인 페이지로 이동
    // router.push("/login");
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  const loginSectionItems = [
    {
      text: "로그아웃",
      onClick: handleLogout
    },
    {
      text: "유스-잇 떠나기",
      onClick: () => {
        // TODO: 계정 삭제 로직 구현
        console.log("유스-잇 떠나기 클릭");
      },
      showArrow: true
    }
  ];

  const policySectionItems = [
    {
      text: "서비스 이용약관",
      onClick: () => {
        // TODO: 서비스 이용약관 페이지로 이동
        console.log("서비스 이용약관 클릭");
      },
      showArrow: true
    },
    {
      text: "개인정보 처리방침",
      onClick: () => {
        // TODO: 개인정보 처리방침 페이지로 이동
        console.log("개인정보 처리방침 클릭");
      },
      showArrow: true
    }
  ];

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      {/* 헤더 */}
      <header className="flex w-full items-center gap-4 p-4 pb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-black" />
        </button>
        <h1 className="text-xl font-bold text-black">설정</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex flex-1 flex-col px-4 gap-6">
        {/* 로그인/회원정보 섹션 */}
        <SettingsSection
          title="로그인/회원정보"
          items={loginSectionItems}
        />

        {/* 정책 및 약관 섹션 */}
        <SettingsSection
          title="정책 및 약관"
          items={policySectionItems}
        />
      </main>

      {/* 버전 정보 */}
      <footer className="p-4 pt-6">
        <span className="text-sm text-gray-500">현재 버전 1.03.004</span>
      </footer>

      {/* 로그아웃 모달 */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default SettingsPage;