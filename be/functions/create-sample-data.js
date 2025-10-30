const admin = require("firebase-admin");

// Firebase Admin SDK 초기화 (에뮬레이터 없이 실제 프로젝트에 연결)
admin.initializeApp({
  projectId: "youthvoice-2025",
});

const db = admin.firestore();

async function createSampleData() {
  try {
    console.log("🚀 샘플 데이터 생성 시작...");

    // 커뮤니티 데이터 생성
    const communityId = "CP:ABC123DEF456";
    await db.collection("communities").doc(communityId).set({
      id: communityId,
      name: "TMI 자아탐색",
      type: "interest",
      channel: "TMI 자아탐색",
      postType: "TMI",
      membersCount: 150,
      postsCount: 3,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    console.log("✅ 커뮤니티 데이터 생성 완료:", communityId);

    // 포스트 데이터 생성
    const posts = [
      {
        id: "AMrsQRg9tBY0ZGJMbKG2",
        type: "TMI",
        authorId: "user123",
        author: "유어123",
        title: "오늘 하늘이 이뻤어요!",
        content: [
          {
            type: "text",
            order: 1,
            content: "두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다"
          }
        ],
        preview: {
          description: "두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요!",
          thumbnail: {
            url: "/imgs/mockup.jpg",
            blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            width: 1080,
            height: 1080,
            ratio: "1080:1080"
          },
          isVideo: false,
          hasImage: true,
          hasVideo: false
        },
        mediaCount: 1,
        channel: "TMI 자아탐색",
        category: "TMI",
        tags: ["TMI"],
        scheduledDate: null,
        isLocked: false,
        visibility: "public",
        likesCount: 12,
        commentsCount: 3,
        viewCount: 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      },
      {
        id: "jpb8WjP7poOmI07Z7tU8",
        type: "TMI",
        authorId: "user123",
        author: "유어123",
        title: "오늘 하늘이 이뻤어요!",
        content: [
          {
            type: "text",
            order: 1,
            content: "두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다"
          }
        ],
        preview: {
          description: "두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요!",
          thumbnail: {
            url: "/imgs/mockup2.jpg",
            blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            width: 1080,
            height: 1080,
            ratio: "1080:1080"
          },
          isVideo: false,
          hasImage: true,
          hasVideo: false
        },
        mediaCount: 1,
        channel: "TMI 자아탐색",
        category: "한끗루틴",
        tags: ["한끗루틴"],
        scheduledDate: null,
        isLocked: false,
        visibility: "public",
        likesCount: 8,
        commentsCount: 1,
        viewCount: 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      },
      {
        id: "45Sb6iETW1lNgyHBVS75",
        type: "TMI",
        authorId: "user123",
        author: "유어123",
        title: "오늘 하늘이 이뻤어요!",
        content: [
          {
            type: "text",
            order: 1,
            content: "두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다"
          }
        ],
        preview: {
          description: "두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요!",
          thumbnail: {
            url: "/imgs/mockup3.jpg",
            blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            width: 1080,
            height: 1080,
            ratio: "1080:1080"
          },
          isVideo: false,
          hasImage: true,
          hasVideo: false
        },
        mediaCount: 1,
        channel: "TMI 자아탐색",
        category: "월간 소모임",
        tags: ["월간 소모임"],
        scheduledDate: null,
        isLocked: false,
        visibility: "public",
        likesCount: 15,
        commentsCount: 7,
        viewCount: 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      }
    ];

    // 각 포스트를 communities/{communityId}/posts/{postId} 경로에 저장
    for (const post of posts) {
      await db.collection(`communities/${communityId}/posts`).doc(post.id).set(post);
      console.log(`✅ 포스트 데이터 생성 완료: ${post.id}`);
    }

    // 사용자 데이터 생성
    await db.collection("users").doc("user123").set({
      nickname: "유어123",
      profileImageUrl: null,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    console.log("✅ 사용자 데이터 생성 완료: user123");
    console.log("🎉 모든 샘플 데이터 생성 완료!");

  } catch (error) {
    console.error("❌ 샘플 데이터 생성 실패:", error);
  }
}

createSampleData();
