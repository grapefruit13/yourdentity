import { useRouter } from "next/navigation";

interface PostDetailErrorProps {
  /**
   * @description 에러 객체
   */
  error?: Error | null;
  /**
   * @description 데이터가 없는 경우 메시지
   */
  notFoundMessage?: string;
  /**
   * @description 뒤로가기 버튼 텍스트
   */
  backButtonText?: string;
}

/**
 * @description 게시글 상세 페이지 에러 처리 컴포넌트
 */
export const PostDetailError = ({
  error,
  notFoundMessage = "게시글을 찾을 수 없습니다.",
  backButtonText = "이전으로 돌아가기",
}: PostDetailErrorProps) => {
  const router = useRouter();

  const errorMessage = error
    ? "게시글을 불러오는 중 오류가 발생했습니다."
    : notFoundMessage;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="mb-4 text-gray-500">{errorMessage}</div>
        {error && (
          <div className="mb-4 text-sm text-gray-400">
            {error.message || "알 수 없는 오류"}
          </div>
        )}
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-blue-600 underline hover:text-blue-800"
        >
          {backButtonText}
        </button>
      </div>
    </div>
  );
};
