# 🎣 API 훅 사용 가이드

> 자동 생성된 React Query 훅들의 기본 사용법을 설명합니다.

## useQuery 사용법

데이터를 조회할 때 사용합니다.

```typescript
import { useGetCommunities } from "@/hooks/generated/communities-hooks";

function CommunitiesPage() {
  const { data, isLoading, error } = useGetCommunities({
    type: "interest",
    page: 1,
    size: 10,
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return (
    <div>
      {data?.data.communities?.map((community) => (
        <div key={community.id}>{community.name}</div>
      ))}
    </div>
  );
}
```

## useMutation 사용법

데이터를 생성/수정/삭제할 때 사용합니다.

```typescript
import { usePostCommunitiesPostsById } from "@/hooks/generated/communities-hooks";
import { useQueryClient } from "@tanstack/react-query";

function CreatePostForm({ communityId }: { communityId: string }) {
  const queryClient = useQueryClient();
  const mutation = usePostCommunitiesPostsById();

  const handleSubmit = async (formData: any) => {
    try {
      await mutation.mutateAsync({
        communityId,
        data: {
          title: formData.title,
          content: formData.content,
          visibility: "public",
        },
      });

      // 성공시 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: ["communities", "getCommunitiesPostsById"],
      });
    } catch (error) {
      console.error("생성 실패:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="제목" />
      <textarea placeholder="내용" />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "생성 중..." : "포스트 생성"}
      </button>
    </form>
  );
}
```

## 💡 기본 패턴

- **useQuery**: `{ data, isLoading, error }` 구조로 데이터 조회
- **useMutation**: `mutateAsync()` 또는 `mutate()` 로 데이터 변경
- **캐시 무효화**: `queryClient.invalidateQueries()` 로 목록 새로고침
