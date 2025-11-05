"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import DeleteAccountModal from "@/components/my-page/DeleteAccountModal";
import LogoutModal from "@/components/my-page/LogoutModal";
import SettingsSection from "@/components/my-page/SettingsSection";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useDeleteAccount } from "@/hooks/auth/useDeleteAccount";
import { useLogout } from "@/hooks/auth/useLogout";
import { debug } from "@/utils/shared/debugger";

/**
 * @description 설정 페이지
 */
const SettingsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const { mutate: logoutMutate } = useLogout();
  const { mutate: deleteAccountMutate, isPending: isDeleting } =
    useDeleteAccount();

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const cleanupAndRedirectToHome = () => {
    if (typeof window === "undefined") return;
    queryClient.clear();
    window.location.replace(LINK_URL.HOME);
  };

  /**
   * @description 로그아웃 모달 '확인' 클릭 시
   */
  const handleLogoutConfirm = () => {
    logoutMutate(undefined, {
      onSuccess: () => {
        cleanupAndRedirectToHome();
      },
      onError: (error) => {
        debug.error("로그아웃 오류 발생:", error);
        cleanupAndRedirectToHome();
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
    setIsDeleteAccountModalOpen(true);
  };

  /**
   * @description 회원 탈퇴 확인 버튼 클릭 시
   */
  const handleDeleteAccountConfirm = () => {
    deleteAccountMutate(undefined, {
      onSuccess: () => {
        debug.log("회원 탈퇴 성공");

        // 1. React Query 캐시 모두 제거
        queryClient.clear();

        // 2. LocalStorage 정리 (Firebase 관련)
        const allKeys = Object.keys(localStorage);
        allKeys.forEach((key) => {
          if (
            key.startsWith("firebase:authUser:") ||
            key.startsWith("firebase:refreshToken:") ||
            key.startsWith("firebase:host:") ||
            key.startsWith("firebase:heartbeat:")
          ) {
            localStorage.removeItem(key);
          }
        });

        // 3. 쿠키 정리
        const clearCookie = (name: string) => {
          const paths = ["/", window.location.pathname];
          const domains = [
            window.location.hostname,
            "." + window.location.hostname,
          ];

          paths.forEach((path) => {
            domains.forEach((domain) => {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
            });
          });
        };

        document.cookie.split(";").forEach((c) => {
          const name = c.split("=")[0].trim();
          clearCookie(name);
        });

        // 4. 모달 닫기
        setIsDeleteAccountModalOpen(false);

        // 5. 홈 페이지로 리다이렉트 (히스토리 정리)
        router.replace(LINK_URL.HOME);
      },
      onError: (error) => {
        debug.error("회원 탈퇴 오류:", error);
        // 에러 발생 시 모달은 열어두어 재시도 가능하도록 함
      },
    });
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

      {/* 회원 탈퇴 모달 */}
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        isLoading={isDeleting}
        onConfirm={handleDeleteAccountConfirm}
        onClose={() => {
          if (isDeleting) return;
          setIsDeleteAccountModalOpen(false);
        }}
      />
    </div>
  );
};

export default SettingsPage;
