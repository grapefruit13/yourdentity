"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LogoutModal from "@/components/my-page/LogoutModal";
import SettingsSection from "@/components/my-page/SettingsSection";

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

  const handleLogoutConfirm = async () => {
    try {
      // 1. 서버 세션 무효화
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn("서버 로그아웃 실패, 클라이언트 사이드 정리만 진행");
      }

      // 2. 로컬 스토리지 정리
      localStorage.clear();
      sessionStorage.clear();

      // 3. 쿠키 정리
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // 4. 모달 닫기
      setIsLogoutModalOpen(false);

      // 5. 로그인 페이지로 리다이렉트
      router.push("/login");

      console.log("로그아웃 완료");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      
      // 오류 발생 시에도 클라이언트 사이드 정리
      localStorage.clear();
      sessionStorage.clear();
      
      // 오류가 발생해도 로그인 페이지로 이동
      router.push("/login");
    }
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
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 503 상태 코드 (서비스 이용 불가) 처리
        if (response.status === 503) {
          alert("계정 삭제 기능이 현재 비활성화되어 있습니다. 관리자에게 문의해주세요.");
          setIsDeleteModalOpen(false);
          return;
        }
        
        throw new Error(errorData.message || errorData.error || `서버 오류: ${response.status}`);
      }

      // 2. 서버 삭제 성공 후 클라이언트 사이드 정리
      localStorage.clear();
      sessionStorage.clear();

      // 3. 쿠키 정리
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
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
      const errorMessage = error instanceof Error 
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
      onClick: handleLogout
    },
    {
      text: "유스-잇 떠나기",
      onClick: handleDeleteAccount,
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
          aria-label="뒤로 가기"
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

      {/* 계정 삭제 모달 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleDeleteCancel}
          />
          <div className="relative mx-8 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-center text-lg font-medium text-black">
              계정을 삭제하시겠습니까?
            </h2>
            <p className="mb-4 text-center text-sm text-red-600">
              ⚠️ 이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
            </p>
            <div className="mb-6">
              <p id="delete-confirm-description" className="mb-2 text-sm text-gray-600">
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
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label="계정 삭제 취소"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText !== "DELETE"}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="계정 영구 삭제"
              >
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;