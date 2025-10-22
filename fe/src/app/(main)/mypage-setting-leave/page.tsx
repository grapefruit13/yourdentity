"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { AlertTriangle } from "lucide-react";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";
import Modal from "@/components/shared/ui/modal";
import { LINK_URL } from "@/constants/shared/_link-url";
import { signOut } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { getCsrfToken } from "@/utils/shared/csrf";

/**
 * @description 계정 삭제 페이지
 */
const MyPageSettingLeavePage = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actualUserName, setActualUserName] = useState<string | null>(null);
  const [nameError, setNameError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Firebase Auth에서 사용자 이름 가져오기 (비동기)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setActualUserName(null);
        return;
      }
      // displayName이 있으면 사용, 없으면 email의 @ 앞부분 사용
      const name =
        currentUser.displayName || currentUser.email?.split("@")[0] || null;
      setActualUserName(name);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteAccount = () => {
    if (!userName.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    // 실제 사용자 이름과 비교
    if (actualUserName && userName.trim() !== actualUserName) {
      setNameError("사용 중인 이름과 다릅니다. 다시 입력해 주세요.");
      return;
    }

    // 이름이 일치하면 에러 메시지 제거
    setNameError("");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      // 1. CSRF 토큰 동기화 (double-submit cookie)
      const csrfToken = getCsrfToken();
      const csrfResponse = await fetch("/api/csrf", {
        method: "GET",
        headers: { "X-CSRF-Token": csrfToken },
        credentials: "include",
      });

      if (!csrfResponse.ok) {
        throw new Error("CSRF 토큰 동기화에 실패했습니다. 다시 시도해주세요.");
      }

      // 2. 서버에 계정 삭제 요청 전송 (CSRF 토큰 포함)
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
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

      // 3. 서버 삭제 성공 후 클라이언트 사이드 정리
      // 3-1) Firebase 클라이언트 인증 상태 초기화 + 백엔드 Refresh Token 무효화
      await signOut();

      // 3-2) 로컬 스토리지: 명시적인 Firebase 인증 키만 제거
      const allKeys = Object.keys(localStorage);
      allKeys.forEach((key) => {
        // firebase:authUser:[PROJECT_ID] 형식 처리
        if (
          key.startsWith("firebase:authUser:") ||
          key.startsWith("firebase:refreshToken:") ||
          key.startsWith("firebase:host:") ||
          key.startsWith("firebase:heartbeat:")
        ) {
          localStorage.removeItem(key);
        }
      });

      // 4. 쿠키 정리 - 다양한 경로와 도메인 조합으로 시도
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

      // 5. 모달 닫기
      setIsDeleteModalOpen(false);

      // 6. 성공 메시지 표시
      alert("계정이 성공적으로 삭제되었습니다.");

      // 7. 로그인 페이지로 리다이렉트
      router.push(LINK_URL.LOGIN);
      router.refresh(); // Next.js 라우터 캐시 새로고침
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
    } finally {
      setIsDeleting(false);
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
          <Typography
            as="label"
            htmlFor="userName"
            font="noto"
            variant="body1M"
            className="text-black"
          >
            이름
          </Typography>
          <input
            id="userName"
            name="userName"
            type="text"
            value={userName}
            onChange={(e) => {
              const value = e.target.value;
              setUserName(value);

              // 실시간 이름 검증
              if (
                actualUserName &&
                value.trim() !== "" &&
                value.trim() !== actualUserName
              ) {
                setNameError("사용 중인 이름과 다릅니다. 다시 입력해 주세요.");
              } else {
                setNameError("");
              }
            }}
            placeholder="이름을 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm shadow-sm focus:border-gray-300 focus:outline-none"
          />
          {nameError && (
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <Typography
                font="noto"
                variant="label1R"
                className="text-red-500"
              >
                {nameError}
              </Typography>
            </div>
          )}
        </div>
      </main>

      {/* 떠나기 버튼 - 하단바 바로 위 */}
      <div className="px-4 pb-4">
        <ButtonBase
          onClick={handleDeleteAccount}
          className="relative w-full rounded-lg bg-[#FF006C] py-[15px] transition-colors hover:bg-[#e6005a] disabled:bg-[#FF006C] disabled:after:absolute disabled:after:inset-0 disabled:after:rounded-lg disabled:after:bg-white/70 disabled:after:content-['']"
          disabled={
            !userName.trim() || nameError !== "" || actualUserName === null
          }
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
        confirmDisabled={isDeleting}
      />
    </div>
  );
};

export default MyPageSettingLeavePage;
