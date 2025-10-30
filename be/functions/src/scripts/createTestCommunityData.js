const admin = require("firebase-admin");

// Firebase Admin 초기화 (로컬 에뮬레이터용)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "youthvoice-2025",
  });
}

// 에뮬레이터 설정
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

const db = admin.firestore();

/**
 * @description 테스트용 커뮤니티 데이터 생성
 */
async function createTestData() {
  try {
    console.log("🚀 테스트 데이터 생성 시작...");

    // 1. 커뮤니티 생성
    const communityRef = await db.collection("communities").add({
      name: "TMI 자아탐색",
      type: "interest",
      channel: "TMI",
      postType: "TMI",
      membersCount: 0,
      postsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ 커뮤니티 생성 완료:", communityRef.id);

    // 2. 테스트 게시글 생성
    const posts = [
      {
        type: "TMI",
        authorId: "test-user-1",
        author: "테스트유저1",
        title: "오늘의 TMI 인증!",
        content: [
          {
            type: "text",
            order: 1,
            content: "오늘도 열심히 활동했어요! 😊",
          },
        ],
        communityId: communityRef.id,
        channel: "TMI 자아탐색",
        category: "TMI",
        tags: ["TMI", "인증"],
        isLocked: false,
        visibility: "public",
        likesCount: 5,
        commentsCount: 2,
        viewCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "TMI",
        authorId: "test-user-2",
        author: "테스트유저2",
        title: "TMI 프로젝트 진행 중",
        content: [
          {
            type: "text",
            order: 1,
            content: "프로젝트 진행 상황 공유합니다!",
          },
        ],
        communityId: communityRef.id,
        channel: "TMI 자아탐색",
        category: "TMI",
        tags: ["TMI", "프로젝트"],
        isLocked: false,
        visibility: "public",
        likesCount: 3,
        commentsCount: 1,
        viewCount: 8,
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000),
      },
      {
        type: "ROUTINE_CERT",
        authorId: "test-user-3",
        author: "테스트유저3",
        title: "한끗루틴 인증",
        content: [
          {
            type: "text",
            order: 1,
            content: "오늘의 루틴 완료!",
          },
        ],
        communityId: communityRef.id,
        channel: "한끗루틴",
        category: "루틴",
        tags: ["한끗루틴", "인증"],
        isLocked: false,
        visibility: "public",
        likesCount: 8,
        commentsCount: 3,
        viewCount: 15,
        createdAt: new Date(Date.now() - 7200000),
        updatedAt: new Date(Date.now() - 7200000),
      },
    ];

    for (const post of posts) {
      await db
        .collection("communities")
        .doc(communityRef.id)
        .collection("posts")
        .add(post);
    }

    console.log(`✅ ${posts.length}개의 게시글 생성 완료`);
    console.log("\n✨ 테스트 데이터 생성 완료!");
    console.log(`📍 커뮤니티 ID: ${communityRef.id}`);
    console.log("\n이제 프론트엔드에서 테스트할 수 있습니다!");

    process.exit(0);
  } catch (error) {
    console.error("❌ 에러 발생:", error);
    process.exit(1);
  }
}

// 실행
createTestData();


