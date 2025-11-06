"use client";

import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/shared/cn";
import { getTimeAgo } from "@/utils/shared/date";
import { debug } from "@/utils/shared/debugger";
import ShareModal from "./ShareModal";
import { CommunityPost } from "@/types/community";

interface CommunityDetailProps {
  post: CommunityPost;
}

const CommunityDetail = ({ post }: CommunityDetailProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comment, setComment] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // 뒤로가기 핸들러
  const handleBack = () => {
    router.back();
  };

  // 메뉴 아이템 클릭 핸들러
  const handleMenuAction = (action: string) => {
    debug.log(`${action} 클릭됨`);
    setIsMenuOpen(false);

    // 향후 각 액션에 따른 로직 구현
    switch (action) {
      case "수정":
        // 수정 로직
        break;
      case "상단 고정":
        // 상단 고정 로직
        break;
      case "삭제":
        // 삭제 로직
        break;
      case "신고":
        // 신고 로직
        break;
      case "게시글 복사":
        // 복사 로직
        break;
      case "게시글 이동":
        // 이동 로직
        break;
    }
  };

  // 댓글 제출 핸들러
  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      debug.log("댓글 제출:", comment);
      setComment("");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium">뒤로</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className={cn(
              "p-1 text-gray-600 transition-colors hover:text-gray-800"
            )}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={cn(
              "p-1 text-gray-600 transition-colors hover:text-gray-800"
            )}
          >
            <svg
              className={cn(
                "h-5 w-5 transition-colors",
                isBookmarked
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-gray-600"
              )}
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>

          {/* 점 3개 메뉴 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "p-1 text-gray-600 transition-colors hover:text-gray-800"
              )}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            {isMenuOpen && (
              <div
                className={cn(
                  "absolute top-8 right-0 z-10 w-32 rounded-lg border border-gray-200 bg-white shadow-lg"
                )}
              >
                <div className="py-1">
                  <button
                    onClick={() => handleMenuAction("수정")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleMenuAction("상단 고정")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    상단 고정
                  </button>
                  <button
                    onClick={() => handleMenuAction("삭제")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => handleMenuAction("신고")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    신고
                  </button>
                  <button
                    onClick={() => handleMenuAction("게시글 복사")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    게시글 복사
                  </button>
                  <button
                    onClick={() => handleMenuAction("게시글 이동")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    게시글 이동
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-4 py-6 pb-26">
        {/* 활동 후기 헤더 */}
        <div className="mb-2 text-sm text-gray-500">
          {post?.category || "활동 후기"}
        </div>

        {/* 제목 */}
        <h1 className="mb-4 text-3xl font-bold text-gray-800">{post?.title}</h1>

        {/* 프로필 섹션 */}
        <div className="mb-6 flex items-center">
          <div className="mr-3 h-8 w-8 rounded-full bg-gray-300">
            {post?.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-full w-full rounded-full object-cover"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-800">
                {post?.author.name}
              </span>
              <span className="rounded-md bg-pink-200 px-1.5 py-0.5 text-xs text-pink-600">
                {post?.author.badge}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {post?.createdAt && getTimeAgo(post.createdAt)}
            </div>
          </div>
        </div>

        {/* 내용 */}
        <div className="mb-6 text-base leading-relaxed text-gray-700">
          {post?.content ? (
            <div className="whitespace-pre-line">{post.content}</div>
          ) : (
            <>
              <p className="mb-3">
                학교 밖 생활을 시작한 지 얼마 되지 않아 마음이 복잡했지만, 이번
                달 &apos;유스보이스&apos;라는 커뮤니티의 월간 소모임에 처음
                참여하면서 생각이 조금 정리되었다. 모임에서 만난 사람들은 각자
                다른 이유로 학교 밖을 선택했지만, 공통점은 자기 자리에서 최선을
                다하려고 애쓴다는 점이었다.
              </p>
              <p className="mb-3">
                누군가는 일을 병행하며 자격증을 준비하고, 누군가는 창작을 꾸준히
                이어가고, 또 다른 누군가는 새로운 진로를 탐색 중이었다.
                &quot;나만 낯선 길을 걷는 게 아니구나&quot;라는 안도감이 들었다.
              </p>
              <p className="mb-3">
                가장 인상 깊었던 순간은 초청 강연 시간이었다. 강연자
                &apos;서하림(가명)&apos;은 어린 시절부터 이어진 굴곡과 실패를
                숨기지 않고 이야기했다. 화려한 성공담 대신, 멈추지 않고 버틴
                날들의 기록을 조용히 꺼내 놓는 모습이 오래 마음에 남았다.
              </p>
              <p className="mb-3">
                &quot;완벽한 계획보다, 오늘 조금이라도 움직였다는 사실이 내일의
                나를 지탱한다&quot;는 말이 특히 큰 울림이었다. 나는 강연 내내
                고개를 끄덕이며, 지금의 불안도 언젠가 내 문장이 되고 내 선택을
                지지해 줄 자원이 될 수 있겠다고 생각했다.
              </p>
              <p className="mb-3">
                모임이 끝날 무렵, 작은 책 선물을 받았다. 표지를 쓰다듬다 보니
                오늘의 감정이 서랍에 곱게 정리되는 느낌이었다. 집에 돌아오자마자
                첫 장에 날짜를 적고, 강연에서 메모한 문장들을 옮겨 적었다.
              </p>
              <p className="mb-3">
                다음 달에는 그냥 참여자에 머무르지 말고, 내가 겪는 시행착오와
                작은 성취들을 짧은 글로 나눠 보기로 했다. 시작선에 서 있는
                마음은 여전히 떨리지만, 오늘 만난 사람들과 문장 덕분에 한 발 더
                나아갈 용기가 생겼다. 다음 소모임에도 꼭 참여할 것이다.
              </p>
              <p className="text-gray-500">+ 책 선물 진짜 너무너무 좋아요..</p>
            </>
          )}
        </div>

        {/* 이미지 섹션 */}
        <div className="mb-6">
          <img
            src="/imgs/mockup.jpg"
            alt="커뮤니티 활동 이미지"
            className="h-auto w-full rounded-lg shadow-sm"
          />
        </div>

        {/* 태그 섹션 */}
        {post?.tags && post.tags.length > 0 && (
          <div className="mb-6 flex flex-col gap-2">
            <span className="text-sm text-gray-500">{post.category}</span>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex h-6 w-auto items-center justify-center rounded-full border border-gray-300 bg-white px-3"
                >
                  <span className="text-xs text-gray-600">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 하단 액션 바 */}
        <div className="mb-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "flex items-center gap-2 transition-opacity hover:opacity-80"
              )}
            >
              <svg
                className={cn(
                  "h-5 w-5 transition-colors",
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                )}
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span
                className={cn(
                  "text-sm transition-colors",
                  isLiked ? "text-red-500" : "text-gray-600"
                )}
              >
                {(post?.likesCount || 0) + (isLiked ? 1 : 0)}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-sm text-gray-600">
                {post?.stats.comments || 0}
              </span>
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">댓글</h3>

          {/* 댓글 목록 */}
          <div className="space-y-3">
            {/* 샘플 댓글들 */}
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-300"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    유어123
                  </span>
                  <span className="text-xs text-gray-500">2시간 전</span>
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  정말 공감되는 글이네요! 저도 비슷한 경험이 있어서 더욱
                  와닿았습니다.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-300"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    유어456
                  </span>
                  <span className="text-xs text-gray-500">1시간 전</span>
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  다음 소모임 언제인가요? 저도 참여하고 싶어요!
                </p>
              </div>
            </div>
          </div>

          {/* 댓글 작성칸 */}
          <form
            onSubmit={handleCommentSubmit}
            className="rounded-lg border border-gray-200 p-4"
          >
            <input
              type="text"
              placeholder="댓글을 작성해보세요."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border-none bg-transparent px-0 py-2 focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                className="p-1 text-gray-400 transition-colors hover:text-gray-600"
              >
                <span className="text-sm font-bold">Aa</span>
              </button>
              <button
                type="button"
                className="p-1 text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="p-1 text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="p-1 text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="p-1 text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="p-1 text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="p-1 text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 공유 모달 */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        postTitle={post?.title}
        postUrl={`https://youthvoice.vake.io/sharing/${post?.id || "1"}`}
      />
    </div>
  );
};

export default CommunityDetail;
