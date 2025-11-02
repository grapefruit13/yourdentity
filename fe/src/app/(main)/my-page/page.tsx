"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MyPageProfileSection from "@/components/my-page/MyPageProfileSection";
import MyPageTabs, { TabType } from "@/components/my-page/MyPageTabs";
// import MyPageFilter, { FilterType } from "@/components/my-page/MyPageFilter"; // MVP 범위에서 제외
import PostCard from "@/components/my-page/PostCard";

/**
 * @description 마이 페이지
 */
const Page = () => {
  const router = useRouter();

  // 상태 관리
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  // const [activeFilter, setActiveFilter] = useState<FilterType>("program"); // MVP 범위에서 제외

  // FIXME: 실제로는 API에서 가져와야 함
  const mockUserData = {
    profileImageUrl: "",
    nickname: "유어덴티티",
    bio: "자기소개 및 글자까지 쓸 수 있어요",
    postCount: 12,
    activityCount: 15,
    points: 5000,
  };

  // FIXME: 실제로는 API에서 가져와야 함
  const mockPostsData = {
    posts: [
      {
        id: "1",
        imageUrl: "https://picsum.photos/400/400?random=1",
        title: "한꽃루틴",
        description: "프로그램 참여에서 좋았어요",
        authorName: "유어덴티티",
        authorProfileUrl: "",
        likeCount: 3,
        commentCount: 2,
      },
      {
        id: "2",
        imageUrl: "https://picsum.photos/400/400?random=2",
        title: "월간소모임",
        description: "프로그램 참여에서 좋았어요",
        authorName: "유어덴티티",
        authorProfileUrl: "",
        likeCount: 3,
        commentCount: 2,
      },
    ],
    comments: [
      {
        id: "3",
        imageUrl: "https://picsum.photos/400/400?random=3",
        title: "월간소모임",
        description: "댓글을 남긴 게시글입니다",
        authorName: "다른사용자",
        authorProfileUrl: "",
        likeCount: 5,
        commentCount: 8,
      },
      {
        id: "4",
        imageUrl: "https://picsum.photos/400/400?random=4",
        title: "한꽃루틴",
        description: "여기도 댓글을 남겼어요",
        authorName: "다른사용자2",
        authorProfileUrl: "",
        likeCount: 2,
        commentCount: 4,
      },
    ],
    liked: [
      {
        id: "5",
        imageUrl: "https://picsum.photos/400/400?random=5",
        title: "TMI프로젝트",
        description: "좋아요를 누른 게시글입니다",
        authorName: "작성자A",
        authorProfileUrl: "",
        likeCount: 10,
        commentCount: 3,
      },
      {
        id: "6",
        imageUrl: "https://picsum.photos/400/400?random=6",
        title: "월간소모임",
        description: "이것도 좋아요 눌렀어요",
        authorName: "작성자B",
        authorProfileUrl: "",
        likeCount: 7,
        commentCount: 1,
      },
    ],
  };

  // 현재 탭에 따른 데이터 선택
  const currentPosts = mockPostsData[activeTab];

  // 프로필 편집 버튼 핸들러
  const handleEditProfile = () => {
    router.push("/my-page/edit");
  };

  // 게시글 클릭 핸들러
  const handlePostClick = (postId: string) => {
    // FIXME: 실제 게시글 상세 페이지로 이동
    console.log("게시글 클릭:", postId);
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-gray-50">
      {/* 프로필 섹션 */}
      <MyPageProfileSection
        profileImageUrl={mockUserData.profileImageUrl}
        nickname={mockUserData.nickname}
        bio={mockUserData.bio}
        postCount={mockUserData.postCount}
        activityCount={mockUserData.activityCount}
        points={mockUserData.points}
        onEditClick={handleEditProfile}
      />

      {/* 탭 */}
      <MyPageTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 필터 - MVP 범위에서 제외 */}
      {/* <MyPageFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      /> */}

      {/* 게시글 그리드 */}
      <div className="grid grid-cols-2 gap-[5px] bg-gray-50 px-4 pt-[16px] pb-24">
        {currentPosts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            imageUrl={post.imageUrl}
            title={post.title}
            description={post.description}
            authorName={post.authorName}
            authorProfileUrl={post.authorProfileUrl}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
            onClick={() => handlePostClick(post.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Page;
