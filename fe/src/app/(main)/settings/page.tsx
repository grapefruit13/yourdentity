"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoutModal from "@/components/my-page/LogoutModal";
import Modal from "@/components/shared/ui/modal";
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert("정확히 'DELETE'를 입력해주세요.");
      return;
    }

    try {
      console.log("계정 삭제 진행 중...");

      // 1. 서버에 계정 삭제 요청 전송
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 포함
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // 503 상태 코드 (서비스 이용 불가) 처리
        if (response.status === 503) {
          alert(
            "계정 삭제 기능이 현재 비활성화되어 있습니다. 관리자에게 문의해주세요."
          );
          setIsDeleteModalOpen(false);
          return;
        }

        throw new Error(
          errorData.message ||
            errorData.error ||
            `서버 오류: ${response.status}`
        );
      }

      // 2. 서버 삭제 성공 후 클라이언트 사이드 정리
      localStorage.clear();
      sessionStorage.clear();

      // 3. 쿠키 정리
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // 4. 모달 닫기
      setIsDeleteModalOpen(false);

      // 5. 성공 메시지 표시
      alert("계정이 성공적으로 삭제되었습니다.");

      // 6. 로그인 페이지로 리다이렉트
      router.push("/login");

      // 7. 완전한 페이지 새로고침
      window.location.reload();

      console.log("계정 삭제 완료");
    } catch (error) {
      console.error("계정 삭제 중 오류 발생:", error);

      // 사용자에게 구체적인 오류 메시지 표시
      const errorMessage =
        error instanceof Error
          ? error.message
          : "계정 삭제 중 알 수 없는 오류가 발생했습니다.";

      alert(`계정 삭제 실패: ${errorMessage}`);

      // 오류 발생 시 모달은 열어두어 사용자가 재시도할 수 있도록 함
      // setIsDeleteModalOpen(false); // 주석 처리
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmText("");
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

      {/* 계정 삭제 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="계정을 삭제하시겠습니까?"
        description="⚠️ 이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다."
        confirmText="계정 삭제"
        cancelText="취소"
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        confirmDisabled={deleteConfirmText !== "DELETE"}
        variant="danger"
      >
        <div>
          <p
            id="delete-confirm-description"
            className="mb-2 text-sm text-gray-600"
          >
            확인을 위해 <strong>DELETE</strong>를 정확히 입력해주세요:
          </p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE 입력"
            aria-label="계정 삭제 확인 텍스트 입력"
            aria-describedby="delete-confirm-description"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          />
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
