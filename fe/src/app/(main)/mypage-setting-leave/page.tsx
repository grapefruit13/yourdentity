"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Typography } from "@/components/shared/typography";
import ButtonBase from "@/components/shared/base/button-base";
import Modal from "@/components/shared/ui/modal";

/**
 * @description 계정 삭제 페이지
 */
const MyPageSettingLeavePage = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteAccount = () => {
    if (!userName.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
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
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-gray-50">
      {/* 메인 컨텐츠 */}
      <main className="flex flex-1 flex-col gap-6 px-4 pt-6 pb-4">
        {/* 경고 섹션 */}
        <div className="rounded-lg bg-gray-100 p-4">
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <Typography
              font="noto"
              variant="body2R"
              className="text-center text-red-600"
            >
              계정 정보는 모두 삭제되며 이는 다시 가입하더라도 복구되지
              않습니다.
            </Typography>
          </div>
        </div>

        {/* 안내 텍스트 */}
        <Typography font="noto" variant="body1R" className="text-black">
          위 내용에 동의하고 탈퇴하려면, 유스-잇에서 사용하시던 이름을 아래에
          적어주세요.
        </Typography>

        {/* 이름 입력 필드 */}
        <div className="flex flex-col gap-2">
          <Typography font="noto" variant="body1M" className="text-black">
            이름
          </Typography>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full rounded-lg border border-pink-300 px-3 py-3 text-sm focus:border-pink-500 focus:outline-none"
          />
        </div>
      </main>

      {/* 떠나기 버튼 - 하단바 바로 위 */}
      <div className="px-4 pb-4">
        <ButtonBase
          onClick={handleDeleteAccount}
          className="relative w-full rounded-lg bg-[#FF006C] py-4 transition-colors hover:bg-[#e6005a] disabled:bg-[#FF006C] disabled:after:absolute disabled:after:inset-0 disabled:after:rounded-lg disabled:after:bg-white/70 disabled:after:content-['']"
          disabled={!userName.trim()}
        >
          <Typography
            font="noto"
            variant="body1B"
            className="relative z-10 text-white"
          >
            떠나기
          </Typography>
        </ButtonBase>
      </div>

      {/* 계정 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="탈퇴 하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        variant="danger"
      />
    </div>
  );
};

export default MyPageSettingLeavePage;
