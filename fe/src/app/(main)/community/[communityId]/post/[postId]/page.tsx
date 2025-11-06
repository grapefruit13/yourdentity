"use client";

import CommunityDetail from "@/components/community/CommunityDetail";
// import { useGetCommunityPostDetail } from "@/hooks/community/useGetCommunityPostDetail";
// import { useParams, useRouter } from "next/navigation";
// import { CommunityPost } from "@/types/community";
// import type * as Schema from "@/types/generated/api-schema";
// import { TGETCommunitiesPostsByTwoIdsRes } from "@/types/generated/communities-types";

/**
 * @description 커뮤니티 상세 페이지
 * TODO: API 연동 시 구현
 */
const CommunityDetailPage = () => {
  // TODO: API 연동 시 구현
  // const transformApiDataToCommunityPost = (
  //   apiData: TGETCommunitiesPostsByTwoIdsRes,
  //   communityId: string
  // ): CommunityPost => {
  //   const contentItems = (apiData.content as Schema.ContentItem[]) || [];
  //   const fullContent = contentItems
  //     .filter((item: Schema.ContentItem) => item.type === "text")
  //     .sort((a: Schema.ContentItem, b: Schema.ContentItem) => (a.order || 0) - (b.order || 0))
  //     .map((item: Schema.ContentItem) => item.content || "")
  //     .join("\n\n");
  //   const apiDataTyped = apiData as Schema.CommunityPost & {
  //     preview?: { description?: string; thumbnail?: { url?: string } };
  //     tags?: string[];
  //   };
  //   return {
  //     id: apiDataTyped.id || "",
  //     communityId: communityId,
  //     title: apiDataTyped.title || "",
  //     author: { name: apiDataTyped.author || "익명", badge: "일반 사용자", avatar: undefined },
  //     content: fullContent || apiDataTyped.preview?.description || "",
  //     category: apiDataTyped.category || "일상 공유",
  //     tags: apiDataTyped.tags || [],
  //     stats: { likes: apiDataTyped.likesCount || 0, comments: apiDataTyped.commentsCount || 0 },
  //     thumbnail: apiDataTyped.preview?.thumbnail?.url,
  //     createdAt: apiDataTyped.createdAt || "",
  //   };
  // };
  // const params = useParams();
  // const router = useRouter();
  // const communityId = params.communityId as string;
  // const postId = params.postId as string;
  // const { data, isLoading, isSuccess, error } = useGetCommunityPostDetail({
  //   communityId,
  //   postId,
  // });
  // const post = isSuccess && transformApiDataToCommunityPost(data.data, communityId);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">커뮤니티 상세 페이지 (구현 예정)</div>
      </div>
    </div>
  );
};

export default CommunityDetailPage;
