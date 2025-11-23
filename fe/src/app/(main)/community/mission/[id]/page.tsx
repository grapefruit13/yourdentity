"use client";

import { useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import KebabMenu from "@/components/shared/kebab-menu";
import { PostContent } from "@/components/shared/post-content";
import { PostDetailError } from "@/components/shared/post-detail-error";
import { PostDetailSkeleton } from "@/components/shared/post-detail-skeleton";
import { PostProfileSection } from "@/components/shared/post-profile-section";
import { Typography } from "@/components/shared/typography";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useGetMissionsPostsById } from "@/hooks/generated/missions-hooks";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type * as Schema from "@/types/generated/missions-types";
import { sharePost } from "@/utils/shared/post-share";

/**
 * @description 미션 인증글 상세 페이지
 */
const Page = () => {
  const params = useParams();

  // URL에서 postId 추출
  const postId = params.id as string;

  const setRightSlot = useTopBarStore((state) => state.setRightSlot);

  // API 연동 - useGetMissionsPostsById 사용
  const {
    data: postData,
    isLoading,
    error,
  } = useGetMissionsPostsById({
    request: {
      postId,
    },
    enabled: !!postId,
  });

  // postData를 Schema.TGETMissionsPostsByIdRes 타입으로 변환
  const post = postData as Schema.TGETMissionsPostsByIdRes;

  // 공유하기 기능
  const handleShare = useCallback(async () => {
    if (!post) return;

    await sharePost({
      title: post.title,
      content: post.content,
      postId,
      sharePath: LINK_URL.COMMUNITY_MISSION,
      defaultTitle: "미션 인증글",
    });
  }, [post, postId]);

  // 탑바 커스텀
  useEffect(() => {
    setRightSlot(
      <KebabMenu
        onShare={handleShare}
        onEdit={undefined}
        onDelete={undefined}
      />
    );
  }, [setRightSlot, handleShare]);

  // 로딩 중 - 스켈레톤 표시
  if (isLoading) {
    return <PostDetailSkeleton headerButtonCount={1} showCategory={true} />;
  }

  // 에러 처리 또는 postData가 없는 경우
  if (error || !postData) {
    return (
      <PostDetailError
        error={error || undefined}
        notFoundMessage="인증글을 찾을 수 없습니다."
        backButtonText="이전으로 돌아가기"
      />
    );
  }

  return (
    <div className="bg-white pt-12">
      {/* 메인 콘텐츠 */}
      <div className="px-5 py-5">
        {/* 미션 제목 */}
        {post?.missionTitle && (
          <Typography
            as="h1"
            font="noto"
            variant="body2R"
            className="mb-1 text-gray-500"
          >
            {post.missionTitle}
          </Typography>
        )}

        {/* 제목 */}
        <Typography
          as="h2"
          font="noto"
          variant="heading1M"
          className="mb-4 text-gray-950"
        >
          {post?.title || "제목 없음"}
        </Typography>

        {/* 프로필 섹션 */}
        <PostProfileSection
          profileImageUrl={post?.profileImageUrl}
          author={post?.author}
          createdAt={post?.createdAt}
          viewCount={post?.viewCount}
        />

        {/* 내용 */}
        <div className="py-8">
          {post?.content && <PostContent content={post.content} />}
        </div>
      </div>
    </div>
  );
};

export default Page;
