# React Query 사용 가이드 (Next.js 15)

## 설정 완료 ✅

Next.js 15 App Router에서 hydration 에러를 방지하는 React Query 설정이 완료되었습니다.

## 1. 클라이언트 컴포넌트에서 사용

```tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query 예제
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      return res.json();
    },
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  return <div>{data.name}</div>;
}

// Mutation 예제
function CreatePostButton() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newPost: { title: string; content: string }) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(newPost),
      });
      return res.json();
    },
    onSuccess: () => {
      // 게시글 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ title: "제목", content: "내용" })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "생성 중..." : "게시글 작성"}
    </button>
  );
}
```

## 2. 서버 컴포넌트에서 Prefetch (선택사항)

```tsx
// app/users/[id]/page.tsx (서버 컴포넌트)
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { UserProfile } from "./user-profile"; // 클라이언트 컴포넌트

async function fetchUser(userId: string) {
  const res = await fetch(`${process.env.API_URL}/users/${userId}`);
  return res.json();
}

export default async function UserPage({ params }: { params: { id: string } }) {
  const queryClient = getQueryClient();

  // 서버에서 데이터 프리페치
  await queryClient.prefetchQuery({
    queryKey: ["user", params.id],
    queryFn: () => fetchUser(params.id),
  });

  return (
    // dehydrate로 서버 상태를 클라이언트로 전달
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProfile userId={params.id} />
    </HydrationBoundary>
  );
}
```

## 3. 무한 스크롤 예제

```tsx
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

function PostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: async ({ pageParam = 1 }) => {
        const res = await fetch(`/api/posts?page=${pageParam}`);
        return res.json();
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.hasMore ? allPages.length + 1 : undefined;
      },
    });

  return (
    <div>
      {data?.pages.map((page) =>
        page.posts.map((post: any) => <div key={post.id}>{post.title}</div>)
      )}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "로딩 중..." : "더 보기"}
        </button>
      )}
    </div>
  );
}
```

## 핵심 포인트

### ✅ Hydration 에러 방지

- `useState(() => getQueryClient())`로 클라이언트에서만 QueryClient 생성
- 서버는 매 요청마다 새 인스턴스 생성
- 브라우저는 싱글톤 패턴으로 재사용

### ✅ 기본 설정

- staleTime: 5분 (데이터가 신선한 상태로 간주되는 시간)
- gcTime: 10분 (캐시된 데이터가 메모리에 유지되는 시간)
- retry: 3회 (실패 시 자동 재시도)
- refetchOnWindowFocus: false (PWA 특성 고려)

### ✅ DevTools

개발 환경에서 자동으로 활성화됩니다. 브라우저 하단에 React Query 아이콘이 표시됩니다.

## 참고 자료

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [Next.js와 React Query 통합 가이드](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
