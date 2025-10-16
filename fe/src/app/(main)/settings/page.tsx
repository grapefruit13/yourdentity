"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoutModal from "@/components/my-page/LogoutModal";
import SettingsSection from "@/components/my-page/SettingsSection";
import { Typography } from "@/components/shared/typography";
import Modal from "@/components/shared/ui/modal";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useLogout } from "@/hooks/auth/useLogout";
import { debug } from "@/utils/shared/debugger";

/**
 * @description 설정 페이지
 */
const SettingsPage = () => {
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const { mutate: logoutMutate } = useLogout();
  /**
   * @description 로그아웃 모달 '확인' 클릭 시
   */
  const handleLogoutConfirm = () => {
    logoutMutate(undefined, {
      onSuccess: () => {
        router.push(LINK_URL.LOGIN);
      },
      onError: (error) => {
        // TODO: 로그아웃 오류 발생 시 어떻게 처리?. 오류 시에도 login 페이지로 이동?
        debug.error("로그아웃 오류 발생:", error);
      },
      onSettled: () => {
        setIsLogoutModalOpen(false);
      },
    });
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  const handleDeleteAccount = () => {
    router.push("/mypage-setting-leave");
  };

  const loginSectionItems = [
    {
      text: "로그아웃",
      onClick: handleLogout,
    },
    {
      text: "유스-잇 떠나기",
      onClick: handleDeleteAccount,
      showArrow: true,
    },
  ];

  const policySectionItems = [
    {
      text: "서비스 이용약관",
      onClick: () => {
        // TODO: 서비스 이용약관 페이지로 이동
        console.log("서비스 이용약관 클릭");
      },
      showArrow: true,
    },
    {
      text: "개인정보 처리방침",
      onClick: () => {
        // TODO: 개인정보 처리방침 페이지로 이동
        console.log("개인정보 처리방침 클릭");
      },
      showArrow: true,
    },
  ];

  return (
    <div className="flex min-h-full w-full flex-col bg-gray-50">
      {/* 메인 컨텐츠 */}
      <main className="flex flex-1 flex-col gap-6 px-4 pt-6">
        {/* 로그인/회원정보 섹션 */}
        <SettingsSection title="로그인/회원정보" items={loginSectionItems} />

        {/* 정책 및 약관 섹션 */}
        <SettingsSection title="정책 및 약관" items={policySectionItems} />
      </main>

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
