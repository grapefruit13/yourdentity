const admin = require("firebase-admin");
const serviceAccount = require("../../../../youthvoice-2025-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// const admin = require("firebase-admin");

// process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8081";

// // Firebase Admin SDK 초기화
// admin.initializeApp({
//   projectId: "", // 로컬에서는 projectId만 주면 됨
// });

// const db = admin.firestore();

// 랜덤 ID 생성 함수
const generateRandomId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 컬렉션 생성 함수
const createFirestoreCollections = async () => {
  try {
    console.log("🚀 Firestore 컬렉션 생성 시작...");

    // ID 생성
    const gatheringId = `CP:${generateRandomId()}`;
    const routineId = `CP:${generateRandomId()}`;
    const tmiId = `CP:${generateRandomId()}`;
    const routineCommunityId1 = `CP:${generateRandomId()}`;
    const routineCommunityId2 = `CP:${generateRandomId()}`;
    const routineCommunityId3 = `CP:${generateRandomId()}`;
    const gatheringCommunityId1 = `CP:${generateRandomId()}`;
    const gatheringCommunityId2 = `CP:${generateRandomId()}`;
    const gatheringCommunityId3 = `CP:${generateRandomId()}`;
    const tmiCommunityId1 = `CP:${generateRandomId()}`;
    const tmiCommunityId2 = `CP:${generateRandomId()}`;
    const tmiCommunityId3 = `CP:${generateRandomId()}`;

    // 1. gatherings 컬렉션 (루틴과 동일한 구조)
    await db
        .collection("gatherings")
        .doc(gatheringId)
        .set({
        // 기본 정보
          name: "9월 독서 소모임",
          description: "매월 함께 책을 읽고 토론하는 소모임입니다.",

          // 상태 및 가격
          status: "OPEN",
          price: 0,
          currency: "KRW",

          // 재고 및 판매 정보
          stockCount: 15,
          soldCount: 5,
          viewCount: 89,
          buyable: true,

          // 판매자 정보
          sellerId: "CS:NOZU0HZP",
          sellerName: "유스보이스",

          // 커스텀 필드 (신청 시 필요한 정보)
          customFields: [
            {
              isRequired: true,
              isSecret: false,
              isMasking: false,
              type: "input",
              key: "custom_1",
              label: {ko: "닉네임"},
              description: {ko: "독서 소모임에서 사용할 닉네임을 적어주세요."},
            },
            {
              isRequired: true,
              isSecret: false,
              isMasking: false,
              type: "input",
              key: "custom_2",
              label: {ko: "관심 분야"},
              description: {ko: "어떤 장르의 책을 선호하시나요?"},
            },
          ],

          // 상세 내용 (텍스트 2개, 이미지 1개, 동영상 1개)
          content: [
            {
              type: "text",
              order: 1,
              content: "매월 함께 책을 읽고 토론하는 소모임입니다.",
            },
            {
              type: "text",
              order: 2,
              content: "매주 토요일 오후 2시에 만나서 책에 대해 이야기해요.",
            },
            {
              type: "image",
              order: 3,
              url: "https://example.com/gathering-poster.jpg",
              width: 800,
              height: 600,
              content: "독서 소모임 포스터",
            },
            {
              type: "video",
              order: 4,
              url: "https://example.com/gathering-intro.mp4",
              width: 1920,
              height: 1080,
              content: "소모임 소개 영상",
              thumbUrl: "https://example.com/gathering-video-thumb.jpg",
              videoSource: "uploaded",
              provider: "self",
              duration: 180,
              sizeBytes: 15728640,
              mimeType: "video/mp4",
              processingStatus: "ready",
            },
          ],

          // content에서 미디어 추출하여 별도 media 배열 생성
          media: [
            {
              type: "image",
              url: "https://example.com/gathering-poster.jpg",
              order: 1,
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            {
              type: "video",
              url: "https://example.com/gathering-intro.mp4",
              order: 2,
              width: 1920,
              height: 1080,
              thumbUrl: "https://example.com/gathering-video-thumb.jpg",
              videoSource: "uploaded",
              provider: "self",
              duration: 180,
              sizeBytes: 15728640,
              mimeType: "video/mp4",
              processingStatus: "ready",
            },
          ],

          // 상품 옵션
          options: [
            {
              key: "month_selection",
              label: "참여 월 선택",
              items: [
                {
                  title: "9월 독서 소모임",
                  value: "september_2024",
                },
              ],
            },
          ],

          // 상세 정보
          primaryDetails: [
            {
              key: "schedule",
              label: "모임 일정",
              value: "매주 토요일 오후 2시",
            },
            {
              key: "recruitment",
              label: "모집 인원",
              value: "15명 *선착순입니다.",
            },
          ],

          // 상품 변형
          variants: [
            {
              id: "GATHER_VAR_001",
              optionValues: {
                month_selection: "september_2024",
              },
              stockCount: 15,
              soldCount: 5,
              price: 0,
              status: "onSale",
            },
          ],

          // 마감일
          deadline: admin.firestore.Timestamp.fromDate(
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          ),

          // 타임스탬프
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });
    console.log("✅ gatherings 컬렉션 생성 완료");

    // 2. routines 컬렉션 (원래 구조 유지)
    await db
        .collection("routines")
        .doc(routineId)
        .set({
        // 기본 정보
          name: "66일 한끗루틴",
          description:
          "66일 동안 나만의 루틴을 지속하면 정말 나의 습관이 된다고 해요!",

          // 상태 및 가격
          status: "OPEN",
          price: 0,
          currency: "KRW",

          // 재고 및 판매 정보
          stockCount: 20,
          soldCount: 10,
          viewCount: 130,
          buyable: true,

          // 판매자 정보
          sellerId: "CS:NOZU0HZP",
          sellerName: "유스보이스",

          // 커스텀 필드 (신청 시 필요한 정보)
          customFields: [
            {
              isRequired: true,
              isSecret: false,
              isMasking: false,
              type: "input",
              key: "custom_1",
              label: {ko: "이름을 적어주세요."},
              description: {ko: "실명을 적어주세요. (닉네임X)"},
            },
            {
              isRequired: true,
              isSecret: false,
              isMasking: false,
              type: "input",
              key: "custom_2",
              label: {ko: "한끗루틴에서 사용할 닉네임을 알려주세요!"},
              description: {
                ko: "15일동안 한끗루틴에서 사용할 닉네임을 써주세요. (변동X)",
              },
            },
          ],

          // 상세 내용 (텍스트 2개, 이미지 1개, 동영상 1개)
          content: [
            {
              type: "text",
              order: 1,
              content:
              "66일 동안 나만의 루틴을 지속하면 정말 나의 습관이 된다고 해요!",
            },
            {
              type: "text",
              order: 2,
              content:
              "아침·점심·저녁, 정해진 시간대에 나만의 루틴을 인증하면서 하루를 차곡차곡 쌓아가요.",
            },
            {
              type: "image",
              order: 3,
              url: "https://example.com/content-image.jpg",
              width: 1080,
              height: 1080,
              content: "루틴 일정표",
            },
            {
              type: "video",
              order: 4,
              url: "https://example.com/routine-intro.mp4",
              width: 1920,
              height: 1080,
              content: "루틴 소개 영상",
              thumbUrl: "https://example.com/routine-video-thumb.jpg",
              videoSource: "uploaded",
              provider: "self",
              duration: 240,
              sizeBytes: 20971520,
              mimeType: "video/mp4",
              processingStatus: "ready",
            },
          ],

          // content에서 미디어 추출하여 별도 media 배열 생성
          media: [
            {
              type: "image",
              url: "https://example.com/content-image.jpg",
              order: 1,
              width: 1080,
              height: 1080,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            {
              type: "video",
              url: "https://example.com/routine-intro.mp4",
              order: 2,
              width: 1920,
              height: 1080,
              thumbUrl: "https://example.com/routine-video-thumb.jpg",
              videoSource: "uploaded",
              provider: "self",
              duration: 240,
              sizeBytes: 20971520,
              mimeType: "video/mp4",
              processingStatus: "ready",
            },
          ],

          // 상품 옵션
          options: [
            {
              key: "month_selection",
              label: "신청 월 선택",
              items: [
                {
                  title: "10월) 66일 한끗루틴",
                  value: "october_2024",
                },
              ],
            },
          ],

          // 상세 정보
          primaryDetails: [
            {
              key: "recruitment",
              label: "모집인원",
              value: "10명 *선착순입니다.",
            },
          ],

          // 상품 변형
          variants: [
            {
              id: "HBDI31D52H",
              optionValues: {
                month_selection: "october_2024",
              },
              stockCount: 0,
              soldCount: 10,
              price: 0,
              status: "soldOut",
            },
          ],

          // 마감일
          deadline: admin.firestore.Timestamp.fromDate(
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          ),

          // 타임스탬프
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });
    console.log("✅ routines 컬렉션 생성 완료");

    // 4. qnas 컬렉션 (새로운 구조)
    await db
        .collection("qnas")
        .doc("sample-qna")
        .set({
          type: "ROUTINE",
          targetId: routineId,
          userId: "user123",
          content: [
            {
              type: "text",
              order: 1,
              content: "루틴 시작일은 언제인가요?",
            },
            {
              type: "text",
              order: 2,
              content: "혹시 중간에 참여할 수 있나요?",
            },
            {
              type: "image",
              order: 3,
              src: "https://example.com/question-image.jpg",
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            {
              type: "video",
              order: 4,
              src: "https://example.com/question-video.mp4",
              width: 1920,
              height: 1080,
              thumbUrl: "https://example.com/question-video-thumb.jpg",
              videoSource: "uploaded",
              provider: "self",
              duration: 30,
              sizeBytes: 5242880,
              mimeType: "video/mp4",
              processingStatus: "ready",
            },
          ],
          media: [
            {
              type: "image",
              url: "https://example.com/question-image.jpg",
              order: 1,
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            {
              type: "video",
              url: "https://example.com/question-video.mp4",
              order: 2,
              width: 1920,
              height: 1080,
              thumbUrl: "https://example.com/question-video-thumb.jpg",
              videoSource: "uploaded",
              provider: "self",
              duration: 30,
              sizeBytes: 5242880,
              mimeType: "video/mp4",
              processingStatus: "ready",
            },
          ],
          answerContent: [
            {
              type: "text",
              order: 1,
              content: "매월 1일에 시작됩니다.",
            },
            {
              type: "text",
              order: 2,
              content: "네, 중간 참여도 가능합니다. 언제든지 신청해주세요!",
            },
            {
              type: "image",
              order: 3,
              src: "https://example.com/answer-schedule.jpg",
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
          ],
          answerMedia: [
            {
              type: "image",
              url: "https://example.com/answer-schedule.jpg",
              order: 1,
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
          ],
          answerUserId: "admin123",
          answerCreatedAt: admin.firestore.Timestamp.now(),
          likesCount: 3,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

    // 소모임 Q&A 샘플
    await db
        .collection("qnas")
        .doc("sample-gathering-qna")
        .set({
          type: "GATHERING",
          targetId: gatheringId,
          userId: "user123",
          content: [
            {
              type: "text",
              order: 1,
              content: "독서 소모임은 어떤 책을 읽나요?",
            },
            {
              type: "text",
              order: 2,
              content: "매주 얼마나 읽어야 하나요?",
            },
            {
              type: "image",
              order: 3,
              src: "https://example.com/gathering-question-image.jpg",
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            {
              type: "video",
              order: 4,
              src: "https://example.com/gathering-question-video.mp4",
              width: 1920,
              height: 1080,
              thumbUrl: "https://example.com/gathering-question-video-thumb.jpg",
              videoSource: "uploaded",
              provider: "self",
              duration: 30,
              sizeBytes: 5242880,
              mimeType: "video/mp4",
              processingStatus: "ready",
            },
          ],
          media: [
            {
              type: "image",
              url: "https://example.com/gathering-question-image.jpg",
              order: 1,
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            {
              type: "video",
              url: "https://example.com/gathering-question-video.mp4",
              order: 2,
              width: 1920,
              height: 1080,
              thumbUrl: "https://example.com/gathering-question-video-thumb.jpg",
              videoSource: "uploaded",
              provider: "self",
              duration: 30,
              sizeBytes: 5242880,
              mimeType: "video/mp4",
              processingStatus: "ready",
            },
          ],
          answerContent: [
            {
              type: "text",
              order: 1,
              content: "매월 멤버들이 함께 정한 책을 읽습니다.",
            },
            {
              type: "text",
              order: 2,
              content: "주당 50-100페이지 정도 읽으시면 됩니다.",
            },
            {
              type: "image",
              order: 3,
              src: "https://example.com/gathering-answer-schedule.jpg",
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
          ],
          answerMedia: [
            {
              type: "image",
              url: "https://example.com/gathering-answer-schedule.jpg",
              order: 1,
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
          ],
          answerUserId: "admin123",
          answerCreatedAt: admin.firestore.Timestamp.now(),
          likesCount: 1,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

    // TMI Q&A 샘플
    await db
        .collection("qnas")
        .doc("sample-tmi-qna")
        .set({
          type: "TMI",
          targetId: tmiId,
          userId: "user123",
          content: [
            {
              type: "text",
              order: 1,
              content: "TMI 프로젝트는 어떤 활동을 하나요?",
            },
            {
              type: "text",
              order: 2,
              content: "창작 경험이 없어도 참여할 수 있나요?",
            },
            {
              type: "image",
              order: 3,
              src: "https://example.com/tmi-question-image.jpg",
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            {
              type: "video",
              order: 4,
              src: "https://example.com/tmi-question-video.mp4",
              width: 1920,
              height: 1080,
              thumbUrl: "https://example.com/tmi-question-video-thumb.jpg",
              videoSource: "uploaded",
              provider: "self",
              duration: 60,
              sizeBytes: 10485760,
              mimeType: "video/mp4",
              processingStatus: "ready",
            },
          ],
          media: [
            {
              type: "image",
              url: "https://example.com/tmi-question-image.jpg",
              order: 1,
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            {
              type: "video",
              url: "https://example.com/tmi-question-video.mp4",
              order: 2,
              width: 1920,
              height: 1080,
              thumbUrl: "https://example.com/tmi-question-video-thumb.jpg",
              videoSource: "uploaded",
              provider: "self",
              duration: 60,
              sizeBytes: 10485760,
              mimeType: "video/mp4",
              processingStatus: "ready",
            },
          ],
          answerContent: [
            {
              type: "text",
              order: 1,
              content: "다양한 미디어를 활용한 창작 활동을 합니다.",
            },
            {
              type: "text",
              order: 2,
              content: "네, 초보자도 환영합니다! 단계별로 안내해드려요.",
            },
            {
              type: "image",
              order: 3,
              src: "https://example.com/tmi-answer-guide.jpg",
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            {
              type: "file",
              order: 4,
              src: "https://example.com/tmi-guide.pdf",
              fileName: "tmi-guide.pdf",
              sizeBytes: 2048000,
              mimeType: "application/pdf",
            },
          ],
          answerMedia: [
            {
              type: "image",
              url: "https://example.com/tmi-answer-guide.jpg",
              order: 1,
              width: 800,
              height: 600,
              blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            {
              type: "file",
              url: "https://example.com/tmi-guide.pdf",
              order: 2,
              fileName: "tmi-guide.pdf",
              sizeBytes: 2048000,
              mimeType: "application/pdf",
            },
          ],
          answerUserId: "admin123",
          answerCreatedAt: admin.firestore.Timestamp.now(),
          likesCount: 5,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });
    console.log("✅ qnas 컬렉션 생성 완료");

    // 5. applications 컬렉션 (루틴/소모임/TMI 모두 지원)
    await db.collection("applications").doc("sample-routine-application").set({
      type: "ROUTINE", // 신청 타입
      targetId: routineId, // 대상 ID (루틴/소모임/TMI ID)
      userId: "user123",
      status: "PENDING",
      selectedVariant: null,
      quantity: 1,
      targetName: "66일 한끗루틴", // 대상명 (루틴명/소모임명/TMI명)
      targetPrice: 0, // 대상 가격
      customFieldsResponse: {},
      appliedAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    await db
        .collection("applications")
        .doc("sample-gathering-application")
        .set({
          type: "GATHERING", // 신청 타입
          targetId: gatheringId, // 대상 ID
          userId: "user123",
          status: "APPROVED",
          selectedVariant: "GATHER_VAR_001",
          quantity: 1,
          targetName: "9월 독서 소모임", // 대상명
          targetPrice: 0, // 대상 가격
          customFieldsResponse: {
            custom_1: "독서러",
            custom_2: "소설",
          },
          appliedAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

    await db
        .collection("applications")
        .doc("sample-tmi-application")
        .set({
          type: "TMI", // 신청 타입
          targetId: tmiId, // 대상 ID
          userId: "user123",
          status: "PENDING",
          selectedVariant: null,
          quantity: 1,
          targetName: "나다운게", // 대상명
          targetPrice: 0, // 대상 가격
          customFieldsResponse: {
            custom_1: "홍길동",
          },
          appliedAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });
    console.log("✅ applications 컬렉션 생성 완료");

    // 6. comments 컬렉션 (루틴/소모임/TMI 모두 지원) - 평면적 구조
    // 루틴 관련 댓글들
    await db
        .collection("comments")
        .doc("routine-comment-1")
        .set({
          type: "ROUTINE_CERT",
          targetId: `routine-cert-${routineCommunityId1}`,
          targetPath: `communities/${routineCommunityId1}/posts/routine-cert-${routineCommunityId1}`,
          userId: "user123",
          userNickname: "루틴러",
          content: [
            {
              type: "text",
              order: 1,
              content: "루틴 인증 정말 잘하셨네요! 💪",
            },
          ],
          mediaBlocks: [],
          parentId: null,
          depth: 0,
          isReply: false,
          isLocked: false,
          reportsCount: 0,
          likesCount: 3,
          deleted: false,
          deletedAt: null,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

    await db
        .collection("comments")
        .doc("routine-reply-1")
        .set({
          type: "ROUTINE_CERT",
          targetId: `routine-cert-${routineCommunityId1}`,
          targetPath: `communities/${routineCommunityId1}/posts/routine-cert-${routineCommunityId1}`,
          userId: "user456",
          userNickname: "응원러",
          content: [
            {
              type: "text",
              order: 1,
              content: "저도 루틴 시작해볼게요!",
            },
          ],
          mediaBlocks: [],
          parentId: "routine-comment-1",
          depth: 1,
          isReply: true,
          isLocked: false,
          reportsCount: 0,
          likesCount: 0,
          deleted: false,
          deletedAt: null,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

    // 소모임 관련 댓글들
    await db
        .collection("comments")
        .doc("gathering-comment-1")
        .set({
          type: "GATHERING_REVIEW",
          targetId: `gathering-review-${gatheringCommunityId1}`,
          targetPath: `communities/${gatheringCommunityId1}/posts/gathering-review-${gatheringCommunityId1}`,
          userId: "user456",
          userNickname: "독서러",
          content: [
            {
              type: "text",
              order: 1,
              content: "저도 참여하고 싶어요! 📚",
            },
          ],
          mediaBlocks: [],
          parentId: null,
          depth: 0,
          isReply: false,
          isLocked: false,
          reportsCount: 0,
          likesCount: 1,
          deleted: false,
          deletedAt: null,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

    await db
        .collection("comments")
        .doc("gathering-reply-1")
        .set({
          type: "GATHERING_REVIEW",
          targetId: `gathering-review-${gatheringCommunityId1}`,
          targetPath: `communities/${gatheringCommunityId1}/posts/gathering-review-${gatheringCommunityId1}`,
          userId: "user789",
          userNickname: "책벌레",
          content: [
            {
              type: "text",
              order: 1,
              content: "독서 모임 정말 좋아요!",
            },
          ],
          mediaBlocks: [],
          parentId: "gathering-comment-1",
          depth: 1,
          isReply: true,
          isLocked: false,
          reportsCount: 0,
          likesCount: 1,
          deleted: false,
          deletedAt: null,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

    // TMI 관련 댓글들
    await db
        .collection("comments")
        .doc("tmi-comment-1")
        .set({
          type: "TMI",
          targetId: `tmi-intro-${tmiCommunityId1}`,
          targetPath: `communities/${tmiCommunityId1}/posts/tmi-intro-${tmiCommunityId1}`,
          userId: "user789",
          userNickname: "TMI러",
          content: [
            {
              type: "text",
              order: 1,
              content: "TMI 프로젝트 정말 흥미롭네요! 🎨",
            },
          ],
          mediaBlocks: [],
          parentId: null,
          depth: 0,
          isReply: false,
          isLocked: false,
          reportsCount: 0,
          likesCount: 2,
          deleted: false,
          deletedAt: null,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

    await db
        .collection("comments")
        .doc("tmi-reply-1")
        .set({
          type: "TMI",
          targetId: `tmi-intro-${tmiCommunityId1}`,
          targetPath: `communities/${tmiCommunityId1}/posts/tmi-intro-${tmiCommunityId1}`,
          userId: "user123",
          userNickname: "창작러",
          content: [
            {
              type: "text",
              order: 1,
              content: "함께 참여해요!",
            },
          ],
          mediaBlocks: [],
          parentId: "tmi-comment-1",
          depth: 1,
          isReply: true,
          isLocked: false,
          reportsCount: 0,
          likesCount: 0,
          deleted: false,
          deletedAt: null,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });
    console.log("✅ comments 컬렉션 생성 완료");

    // 7. likes 컬렉션
    await db.collection("likes").doc("sample-like").set({
      type: "ROUTINE",
      targetId: routineId,
      userId: "user123",
      createdAt: admin.firestore.Timestamp.now(),
    });
    console.log("✅ likes 컬렉션 생성 완료");

    // 8. users 컬렉션
    await db.collection("users").doc("user123").set({
      nickname: "admin",
      profileImageUrl: "https://example.com/admin.jpg",
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log("✅ users 컬렉션 생성 완료");

    // 9. missions 컬렉션
    await db.collection("missions").doc("sample-mission").set({
      title: "첫 번째 미션",
      description: "첫 번째 미션을 완료해보세요!",
      status: "ACTIVE",
      points: 100,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log("✅ missions 컬렉션 생성 완료");

    // 11. communities 컬렉션 (새로운 구조)
    const communities = [
      {
        id: routineCommunityId1,
        name: "플래너 작성하기",
        interestTag: "productivity",
        type: "interest",
        channel: "플래너 인증 루틴",
        postType: "ROUTINE_CERT",
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: "user123",
        linkedChat: "https://open.kakao.com/o/planner-chat",
      },
      {
        id: routineCommunityId2,
        name: "운동 루틴",
        interestTag: "fitness",
        type: "interest",
        channel: "운동 인증 루틴",
        postType: "ROUTINE_CERT",
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: "user123",
        linkedChat: "https://open.kakao.com/o/exercise-chat",
      },
      {
        id: routineCommunityId3,
        name: "독서 루틴",
        interestTag: "reading",
        type: "interest",
        channel: "독서 인증 루틴",
        postType: "ROUTINE_CERT",
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: "user123",
        linkedChat: "https://open.kakao.com/o/reading-chat",
      },
      {
        id: gatheringCommunityId1,
        name: "독서 모임",
        interestTag: "book",
        type: "interest",
        channel: "독서 모임 후기",
        postType: "GATHERING_REVIEW",
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: "user123",
        linkedChat: "https://open.kakao.com/o/bookclub-chat",
      },
      {
        id: gatheringCommunityId2,
        name: "스터디 그룹",
        interestTag: "study",
        type: "interest",
        channel: "스터디 후기",
        postType: "GATHERING_REVIEW",
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: "user123",
        linkedChat: "https://open.kakao.com/o/study-chat",
      },
      {
        id: gatheringCommunityId3,
        name: "취미 모임",
        interestTag: "hobby",
        type: "interest",
        channel: "취미 모임 후기",
        postType: "GATHERING_REVIEW",
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: "user123",
        linkedChat: "https://open.kakao.com/o/hobby-chat",
      },
      {
        id: tmiCommunityId1,
        name: "TMI 소개",
        interestTag: "tmi",
        type: "anonymous",
        channel: "TMI 프로젝트 소개",
        postType: "TMI",
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: "user123",
        linkedChat: "https://open.kakao.com/o/tmi-intro-chat",
      },
      {
        id: tmiCommunityId2,
        name: "TMI 프로젝트",
        interestTag: "project",
        type: "anonymous",
        channel: "TMI 프로젝트 진행",
        postType: "TMI",
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: "user123",
        linkedChat: "https://open.kakao.com/o/tmi-project-chat",
      },
      {
        id: tmiCommunityId3,
        name: "TMI 자아탐색",
        interestTag: "self-discovery",
        type: "anonymous",
        channel: "TMI 자아탐색",
        postType: "TMI",
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: "user123",
        linkedChat: "https://open.kakao.com/o/tmi-self-discovery-chat",
      },
    ];

    for (const community of communities) {
      await db.collection("communities").doc(community.id).set(community);

      // 각 커뮤니티에 멤버 서브컬렉션 추가
      await db
          .collection("communities")
          .doc(community.id)
          .collection("members")
          .doc("user123")
          .set({
            role: "admin",
            joinedAt: admin.firestore.Timestamp.now(),
          });

      // 각 커뮤니티에 샘플 게시글 서브컬렉션 추가
      const postId = `sample-post-${community.id}`;

      // refId 설정 (루틴/소모임/TMI와 연동)
      let refId = null;
      if (
        community.id === routineCommunityId1 ||
        community.id === routineCommunityId2 ||
        community.id === routineCommunityId3
      ) {
        refId = routineId; // 루틴 ID와 연동
      } else if (
        community.id === gatheringCommunityId1 ||
        community.id === gatheringCommunityId2 ||
        community.id === gatheringCommunityId3
      ) {
        refId = gatheringId; // 소모임 ID와 연동
      } else if (
        community.id === tmiCommunityId1 ||
        community.id === tmiCommunityId2 ||
        community.id === tmiCommunityId3
      ) {
        refId = tmiId; // TMI 프로젝트 ID와 연동
      }

      await db
          .collection("communities")
          .doc(community.id)
          .collection("posts")
          .doc(postId)
          .set({
            id: postId,
            type: community.id.startsWith("routine") ?
            "ROUTINE_CERT" :
            community.id.startsWith("gathering") ?
            "GATHERING_REVIEW" :
            "TMI",
            refId: refId,
            authorId: "user123",
            author: "관리자",
            communityPath: `communities/${community.id}`,
            title: `${community.name} 첫 번째 게시글`,
            content: [
            // 텍스트 타입 1
              {
                type: "text",
                order: 1,
                content: `${community.name} 커뮤니티에 오신 것을 환영합니다!`,
              },
              // 텍스트 타입 2
              {
                type: "text",
                order: 2,
                content: "함께 목표를 달성하고 성장해나가요!",
              },
              // 이미지 타입
              {
                type: "image",
                order: 3,
                content: "오늘의 인증 사진입니다!",
                url: "https://example.com/image.jpg",
                width: 1080,
                height: 1080,
                blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
              },
              // 비디오 타입
              {
                type: "video",
                order: 4,
                content: "루틴 인증 영상입니다!",
                url: "https://example.com/video.mp4",
                width: 1920,
                height: 1080,
                thumbUrl: "https://example.com/video-thumb.jpg",
                videoSource: "uploaded",
                provider: "self",
                duration: 120,
                sizeBytes: 10485760,
                mimeType: "video/mp4",
                processingStatus: "ready",
              },
            ],
            media: [
            // 이미지 미디어
              {
                type: "image",
                url: "https://example.com/image.jpg",
                order: 1,
                width: 1080,
                height: 1080,
                blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
              },
              // 비디오 미디어
              {
                type: "video",
                url: "https://example.com/video.mp4",
                order: 2,
                width: 1920,
                height: 1080,
                thumbUrl: "https://example.com/video-thumb.jpg",
                videoSource: "uploaded",
                provider: "self",
                duration: 120,
                sizeBytes: 10485760,
                mimeType: "video/mp4",
                processingStatus: "ready",
              },
              // 파일 미디어
              {
                type: "file",
                url: "https://example.com/routine-plan.pdf",
                order: 3,
                fileName: "routine-plan.pdf",
                sizeBytes: 2048000,
                mimeType: "application/pdf",
              },
            ],
            channel: community.name,
            category: community.name, // 카테고리 (커뮤니티명으로 설정)
            tags: community.id.startsWith("routine") ?
            ["한끗루틴", "66일 루틴"] :
            community.id.startsWith("gathering") ?
            ["소모임", "후기"] :
            ["TMI", "자아탐색"], // 태그 배열
            scheduledDate: null, // 예약 날짜 (기본값: null)
            isLocked: false,
            visibility: "public",
            rewardGiven: false,
            reactionsCount: 0,
            likesCount: 0,
            commentsCount: 0,
            reportsCount: 0,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          });
    }
    console.log("✅ communities 컬렉션 및 서브컬렉션 생성 완료");

    // 추가 커뮤니티 게시글 생성 (실제 연동용)
    console.log("📝 추가 커뮤니티 게시글 생성 중...");

    // 1. 루틴 관련 커뮤니티 게시글들
    const routineCommunities = [
      routineCommunityId1,
      routineCommunityId2,
      routineCommunityId3,
    ];
    for (const communityId of routineCommunities) {
      // 루틴 인증 게시글
      await db
          .collection("communities")
          .doc(communityId)
          .collection("posts")
          .doc(`routine-cert-${communityId}`)
          .set({
            id: `routine-cert-${communityId}`,
            type: "ROUTINE_CERT",
            refId: routineId, // 루틴 ID와 연동
            authorId: "user123",
            author: "루틴러",
            communityPath: `communities/${communityId}`,
            title: "오늘의 루틴 인증! 💪",
            content: [
              {
                type: "text",
                order: 1,
                content: "66일 한끗루틴 3일차 완료했습니다!",
              },
              {
                type: "text",
                order: 2,
                content: "아침 운동을 꾸준히 하고 있어요. 정말 뿌듯합니다!",
              },
              {
                type: "text",
                order: 3,
                content:
                "오늘은 30분간 조깅을 했는데, 날씨가 좋아서 기분이 정말 좋았어요.",
              },
              {
                type: "text",
                order: 4,
                content:
                "운동 후 스트레칭도 빼먹지 않고 했습니다. 몸이 한결 가벼워진 느낌이에요!",
              },
              {
                type: "text",
                order: 5,
                content:
                "내일도 꾸준히 할 수 있도록 동기부여가 되네요. 함께하는 분들도 화이팅! 🔥",
              },
              {
                type: "image",
                order: 6,
                content: "운동 인증 사진",
                url: "https://example.com/workout-cert.jpg",
                width: 1080,
                height: 1080,
                blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
              },
              {
                type: "video",
                order: 7,
                content: "운동 영상",
                url: "https://example.com/workout-video.mp4",
                width: 1920,
                height: 1080,
                thumbUrl: "https://example.com/workout-video-thumb.jpg",
                videoSource: "uploaded",
                provider: "self",
                duration: 60,
                sizeBytes: 10485760,
                mimeType: "video/mp4",
                processingStatus: "ready",
              },
              {
                type: "file",
                order: 8,
                content: "운동 계획서",
                url: "https://example.com/workout-plan.pdf",
                fileName: "workout-plan.pdf",
                sizeBytes: 2048000,
                mimeType: "application/pdf",
              },
            ],
            media: [
              {
                type: "image",
                url: "https://example.com/workout-cert.jpg",
                order: 1,
                width: 1080,
                height: 1080,
                blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
              },
              {
                type: "video",
                url: "https://example.com/workout-video.mp4",
                order: 2,
                width: 1920,
                height: 1080,
                thumbUrl: "https://example.com/workout-video-thumb.jpg",
                videoSource: "uploaded",
                provider: "self",
                duration: 60,
                sizeBytes: 10485760,
                mimeType: "video/mp4",
                processingStatus: "ready",
              },
              {
                type: "file",
                url: "https://example.com/workout-plan.pdf",
                order: 3,
                fileName: "workout-plan.pdf",
                sizeBytes: 2048000,
                mimeType: "application/pdf",
              },
            ],
            channel:
            communityId === routineCommunityId1 ?
              "플래너 인증 루틴" :
              communityId === routineCommunityId2 ?
              "운동 인증 루틴" :
              "독서 인증 루틴",
            category: "한끗루틴", // 카테고리
            tags:
            communityId === routineCommunityId1 ?
              ["아침 한끗", "플래너 인증", "66일 루틴"] :
              communityId === routineCommunityId2 ?
              ["운동 한끗", "아침 운동", "66일 루틴"] :
              ["독서 한끗", "아침 독서", "66일 루틴"], // 태그 배열
            scheduledDate: null, // 예약 날짜 (기본값: null)
            isLocked: false,
            visibility: "public",
            rewardGiven: false,
            reactionsCount: 5,
            likesCount: 12,
            commentsCount: 3,
            reportsCount: 0,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          });
    }

    // 2. 소모임 관련 커뮤니티 게시글들
    const gatheringCommunities = [
      gatheringCommunityId1,
      gatheringCommunityId2,
      gatheringCommunityId3,
    ];
    for (const communityId of gatheringCommunities) {
      // 소모임 후기 게시글
      await db
          .collection("communities")
          .doc(communityId)
          .collection("posts")
          .doc(`gathering-review-${communityId}`)
          .set({
            id: `gathering-review-${communityId}`,
            type: "GATHERING_REVIEW",
            refId: gatheringId, // 소모임 ID와 연동
            authorId: "user123",
            author: "소모임러",
            communityPath: `communities/${communityId}`,
            title: "소모임 참여 후기 📚",
            content: [
              {
                type: "text",
                order: 1,
                content: "9월 독서 소모임에 참여한 후기입니다!",
              },
              {
                type: "text",
                order: 2,
                content:
                "정말 유익한 시간이었고, 다른 분들과 책에 대해 이야기하는 것이 너무 좋았어요.",
              },
              {
                type: "text",
                order: 3,
                content:
                "이번 달에는 '마음의 평화'라는 책을 함께 읽었는데, 각자 다른 관점에서 해석하는 것이 정말 흥미로웠습니다.",
              },
              {
                type: "text",
                order: 4,
                content:
                "토론 시간에는 정말 열정적으로 이야기했어요. 책에 대한 깊이 있는 대화를 나눌 수 있어서 정말 좋았습니다.",
              },
              {
                type: "text",
                order: 5,
                content:
                "다음 달에는 어떤 책을 읽을지 벌써 기대가 되네요. 독서 모임 덕분에 책 읽는 습관도 생겼어요!",
              },
              {
                type: "text",
                order: 6,
                content:
                "함께 참여한 분들과도 친해져서 개인적으로도 소중한 인맥이 생겼습니다. 정말 감사해요! 🙏",
              },
              {
                type: "image",
                order: 7,
                content: "소모임 활동 사진",
                url: "https://example.com/bookclub-activity.jpg",
                width: 1080,
                height: 1080,
                blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
              },
              {
                type: "video",
                order: 8,
                content: "토론 영상",
                url: "https://example.com/bookclub-discussion.mp4",
                width: 1920,
                height: 1080,
                thumbUrl: "https://example.com/discussion-thumb.jpg",
                videoSource: "uploaded",
                provider: "self",
                duration: 180,
                sizeBytes: 20971520,
                mimeType: "video/mp4",
                processingStatus: "ready",
              },
              {
                type: "file",
                order: 9,
                content: "독서 노트",
                url: "https://example.com/reading-notes.pdf",
                fileName: "reading-notes.pdf",
                sizeBytes: 1536000,
                mimeType: "application/pdf",
              },
            ],
            media: [
              {
                type: "image",
                url: "https://example.com/bookclub-activity.jpg",
                order: 1,
                width: 1080,
                height: 1080,
                blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
              },
              {
                type: "video",
                url: "https://example.com/bookclub-discussion.mp4",
                order: 2,
                width: 1920,
                height: 1080,
                thumbUrl: "https://example.com/discussion-thumb.jpg",
                videoSource: "uploaded",
                provider: "self",
                duration: 180,
                sizeBytes: 20971520,
                mimeType: "video/mp4",
                processingStatus: "ready",
              },
              {
                type: "file",
                url: "https://example.com/reading-notes.pdf",
                order: 3,
                fileName: "reading-notes.pdf",
                sizeBytes: 1536000,
                mimeType: "application/pdf",
              },
            ],
            channel:
            communityId === gatheringCommunityId1 ?
              "독서 모임 후기" :
              communityId === gatheringCommunityId2 ?
              "스터디 후기" :
              "취미 모임 후기",
            category: "월간 소모임", // 카테고리
            tags:
            communityId === gatheringCommunityId1 ?
              ["독서 모임", "9월 소모임", "후기"] :
              communityId === gatheringCommunityId2 ?
              ["스터디 그룹", "9월 소모임", "후기"] :
              ["취미 모임", "9월 소모임", "후기"], // 태그 배열
            scheduledDate: null, // 예약 날짜 (기본값: null)
            isLocked: false,
            visibility: "public",
            rewardGiven: false,
            reactionsCount: 8,
            likesCount: 15,
            commentsCount: 5,
            reportsCount: 0,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          });
    }

    // 3. TMI 관련 커뮤니티 게시글들
    const tmiCommunities = [tmiCommunityId1, tmiCommunityId2, tmiCommunityId3];
    for (const communityId of tmiCommunities) {
      // TMI 소개 게시글
      await db
          .collection("communities")
          .doc(communityId)
          .collection("posts")
          .doc(`tmi-intro-${communityId}`)
          .set({
            id: `tmi-intro-${communityId}`,
            type: "TMI",
            refId: tmiId, // TMI 프로젝트 ID와 연동
            authorId: "user123",
            author: "TMI러",
            communityPath: `communities/${communityId}`,
            title: "나만의 TMI 소개 🎨",
            content: [
              {
                type: "text",
                order: 1,
                content: `${communityId} 프로젝트에 참여하게 된 계기를 소개합니다!`,
              },
              {
                type: "text",
                order: 2,
                content:
                "창작과 자아탐색을 통해 나만의 이야기를 만들어가고 있어요.",
              },
              {
                type: "text",
                order: 3,
                content:
                "처음에는 망설였지만, 지금은 정말 즐겁게 참여하고 있습니다. 나 자신에 대해 더 많이 알게 되었어요.",
              },
              {
                type: "text",
                order: 4,
                content:
                "다양한 미디어를 활용해서 나만의 스토리를 표현하는 것이 정말 재미있어요. 그림, 글, 영상 등 모든 것을 시도해보고 있습니다.",
              },
              {
                type: "text",
                order: 5,
                content:
                "프로젝트를 통해 만난 다른 참여자들과도 좋은 교류를 하고 있어요. 서로 다른 관점에서 이야기를 나누는 것이 정말 유익합니다.",
              },
              {
                type: "text",
                order: 6,
                content:
                "앞으로도 계속 참여해서 더 많은 작품을 만들어가고 싶어요. 나만의 독특한 이야기를 세상과 공유하는 것이 목표입니다! ✨",
              },
              {
                type: "image",
                order: 7,
                content: "작품 사진",
                url: "https://example.com/tmi-work.jpg",
                width: 1080,
                height: 1080,
                blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
              },
              {
                type: "video",
                order: 8,
                content: "창작 과정 영상",
                url: "https://example.com/tmi-creation-process.mp4",
                width: 1920,
                height: 1080,
                thumbUrl: "https://example.com/creation-thumb.jpg",
                videoSource: "uploaded",
                provider: "self",
                duration: 240,
                sizeBytes: 26214400,
                mimeType: "video/mp4",
                processingStatus: "ready",
              },
              {
                type: "file",
                order: 9,
                content: "창작 포트폴리오",
                url: "https://example.com/tmi-portfolio.pdf",
                fileName: "tmi-portfolio.pdf",
                sizeBytes: 3072000,
                mimeType: "application/pdf",
              },
            ],
            media: [
              {
                type: "image",
                url: "https://example.com/tmi-work.jpg",
                order: 1,
                width: 1080,
                height: 1080,
                blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
              },
              {
                type: "video",
                url: "https://example.com/tmi-creation-process.mp4",
                order: 2,
                width: 1920,
                height: 1080,
                thumbUrl: "https://example.com/creation-thumb.jpg",
                videoSource: "uploaded",
                provider: "self",
                duration: 240,
                sizeBytes: 26214400,
                mimeType: "video/mp4",
                processingStatus: "ready",
              },
              {
                type: "file",
                url: "https://example.com/tmi-portfolio.pdf",
                order: 3,
                fileName: "tmi-portfolio.pdf",
                sizeBytes: 3072000,
                mimeType: "application/pdf",
              },
            ],
            channel:
            communityId === tmiCommunityId1 ?
              "TMI 프로젝트 소개" :
              communityId === tmiCommunityId2 ?
              "TMI 프로젝트 진행" :
              "TMI 자아탐색",
            category: "TMI 프로젝트", // 카테고리
            tags:
            communityId === tmiCommunityId1 ?
              ["TMI 소개", "자아탐색", "창작"] :
              communityId === tmiCommunityId2 ?
              ["TMI 프로젝트", "진행", "창작"] :
              ["TMI 자아탐색", "나다움", "창작"], // 태그 배열
            scheduledDate: null, // 예약 날짜 (기본값: null)
            isLocked: false,
            visibility: "public",
            rewardGiven: false,
            reactionsCount: 3,
            likesCount: 7,
            commentsCount: 2,
            reportsCount: 0,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          });
    }

    console.log("✅ 추가 커뮤니티 게시글 생성 완료");

    // 8. TMI 프로젝트 컬렉션 생성
    console.log("📝 TMI 프로젝트 컬렉션 생성 중...");
    const tmiProjects = [];
    const tmiProjectIds = [
      tmiId,
      `CP:${generateRandomId()}`,
      `CP:${generateRandomId()}`,
    ];
    for (let i = 1; i <= 3; i++) {
      const tmiProject = {
        id: tmiProjectIds[i - 1],
        name: i === 1 ? "나다운게" : i === 2 ? "창작 프로젝트" : "자아탐색",
        description:
          i === 1 ?
            "학교 밖 청소년의 나다움을 찾는 12주 자아탐색 창작 프로젝트" :
            i === 2 ?
            "나만의 창작물을 만드는 8주 프로젝트" :
            "내 안의 진짜 나를 찾는 6주 자아탐색 프로그램",
        status: "OPEN",
        price: 0,
        currency: "KRW",
        stockCount: 15,
        soldCount: 5,
        viewCount: 120,
        buyable: true,
        sellerId: "CS:NOZU0HZP",
        sellerName: "유스보이스",
        content: [
          {
            type: "text",
            order: 1,
            content: `TMI 프로젝트 ${i}에 대한 상세 설명입니다.`,
          },
          {
            type: "text",
            order: 2,
            content:
              "창작과 자아탐색을 통해 나만의 이야기를 만들어가는 프로젝트입니다.",
          },
          {
            type: "image",
            order: 3,
            url: "https://example.com/tmi-poster.jpg",
            width: 800,
            height: 600,
            content: "TMI 프로젝트 포스터",
          },
          {
            type: "video",
            order: 4,
            url: "https://example.com/tmi-intro.mp4",
            width: 1920,
            height: 1080,
            content: "TMI 프로젝트 소개 영상",
            thumbUrl: "https://example.com/tmi-video-thumb.jpg",
            videoSource: "uploaded",
            provider: "self",
            duration: 300,
            sizeBytes: 26214400,
            mimeType: "video/mp4",
            processingStatus: "ready",
          },
        ],
        // content에서 미디어 추출하여 별도 media 배열 생성
        media: [
          {
            type: "image",
            url: "https://example.com/tmi-poster.jpg",
            order: 1,
            width: 800,
            height: 600,
            blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
          },
          {
            type: "video",
            url: "https://example.com/tmi-intro.mp4",
            order: 2,
            width: 1920,
            height: 1080,
            thumbUrl: "https://example.com/tmi-video-thumb.jpg",
            videoSource: "uploaded",
            provider: "self",
            duration: 300,
            sizeBytes: 26214400,
            mimeType: "video/mp4",
            processingStatus: "ready",
          },
        ],
        options: [],
        primaryDetails: [
          {
            key: "모집인원",
            value: "15명 *선착순입니다.",
          },
          {
            key: "활동기간",
            value: "12주간 진행됩니다.",
          },
        ],
        variants: [],
        customFields: [
          {
            isRequired: true,
            isSecret: false,
            isMasking: false,
            type: "input",
            key: "custom_1",
            label: {ko: "이름을 적어주세요."},
            description: {ko: "실명을 적어주세요. (닉네임X)"},
          },
        ],
        deadline: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ), // 30일 후
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      tmiProjects.push(tmiProject);
      await db.collection("tmis").doc(tmiProject.id).set(tmiProject);
    }
    console.log("✅ TMI 프로젝트 컬렉션 생성 완료");

    // 스토어 컬렉션 생성
    await createStoreCollections();

    console.log("🎉 모든 Firestore 컬렉션 생성 완료!");
    process.exit(0);
  } catch (error) {
    console.error("❌ 컬렉션 생성 중 오류 발생:", error);
    process.exit(1);
  }
};

// 스토어 컬렉션 생성 함수
const createStoreCollections = async () => {
  try {
    console.log("🏪 스토어 컬렉션 생성을 시작합니다...");

    // 샘플 상품 데이터
    const sampleProduct = {
      id: "CP:45HBVVFPYEFOI",
      name: "[모어포모레] 에브리 립밤",
      description:
        "건조한 입술을 촉촉하게 지키고, 도심 속 가로수도 지키는 종이 케이스에 담긴 비건 립밤입니다.\n(*퓨어/레드 옵션이 있습니다. )",
      price: 0,
      currency: "KRW",
      additionalFees: [
        {
          type: "coin",
          resourceId: "COIN-43TOZ4S9867",
          amount: 150,
        },
      ],
      options: [
        {
          items: [
            {
              title: {
                ko: "퓨어",
              },
              value: "value_e88ea371-b50e-4671-8956-de497ad8d838",
              imageUrl:
                "https://youthvoice.vake.io/files/G0IZUDWCL/FD3MXBDP4/file",
            },
            {
              title: {
                ko: "레드",
              },
              value: "value_f6c68132-2435-48f0-8dee-cf2bffbbdce3",
              imageUrl:
                "https://youthvoice.vake.io/files/G0IZUDWCL/FZ0K9UVTF/file",
            },
          ],
          key: "key_f89d9c57-b9e8-47c7-b152-9cd99b28f7a2",
          label: {
            ko: "색상을 선택해주세요.",
          },
        },
      ],
      productVariants: [
        {
          id: "H6POQ92WZK",
          productId: "CP:45HBVVFPYEFOI",
          values: {
            "key_f89d9c57-b9e8-47c7-b152-9cd99b28f7a2":
              "value_e88ea371-b50e-4671-8956-de497ad8d838",
          },
          soldCount: 1,
          stockCount: 29,
          price: 150,
          additionalFees: [
            {
              type: "coin",
              amount: 150,
              resourceId: "COIN-43TOZ4S9867",
            },
          ],
          estimatedDeliveryAt: 0,
          status: "onSale",
          currency: "KRW",
          createdAt: 1745458857059,
          updatedAt: 1745458857059,
          buyable: true,
        },
        {
          id: "H6POQ92XEJ",
          productId: "CP:45HBVVFPYEFOI",
          values: {
            "key_f89d9c57-b9e8-47c7-b152-9cd99b28f7a2":
              "value_f6c68132-2435-48f0-8dee-cf2bffbbdce3",
          },
          soldCount: 1,
          stockCount: 29,
          price: 150,
          additionalFees: [
            {
              type: "coin",
              amount: 150,
              resourceId: "COIN-43TOZ4S9867",
            },
          ],
          estimatedDeliveryAt: 0,
          status: "onSale",
          currency: "KRW",
          createdAt: 1745458857059,
          updatedAt: 1745458857059,
          buyable: true,
        },
      ],
      view_count: 176,
      view_count_member: 41,
      soldCount: 2,
      soldAmount: 0,
      buyersCount: 2,
      status: "onSale",
      sellerId: "CS:NOZU0HZP",
      sellerName: "유스-잇",
      content: [
        {
          src: "https://youthvoice.vake.io/files/G0IZUDWCL/FDUYDPKWN/___________2025-04-24_______10.32.05.png",
          type: "image",
          width: 548,
          height: 548,
        },
        {
          type: "text",
          content:
            "<attr fw=\"600\" fs=\"24\">건조한 입술도 촉촉하게 지키고,</attr>",
        },
        {
          type: "text",
          content:
            "<attr fw=\"600\" fs=\"24\">도심 속 가로수도 지키는 모어포모레 에브리 립밤</attr>",
        },
        {
          type: "text",
          content: "",
        },
        {
          type: "text",
          content:
            "<attr fw=\"600\" fc=\"#ffffff\" bc=\"#ffcd28\" fs=\"24\">" +
            "<https://morestore.co.kr/product/detail.html?product_no=876&cate_no=1&display_group=1#none|" +
            "제품 자세히 살펴보기|false></attr>",
        },
        {
          type: "text",
          content: "",
        },
        {
          type: "text",
          content: "유스-잇에 함께해주셔서 진심으로 감사합니다.🩵",
        },
        {
          type: "text",
          content:
            "여러분이 쌓아온 소중한 '나다움'을, 원하는 선물로 바꿔보세요!",
        },
        {
          type: "text",
          content: "",
        },
        {
          type: "text",
          content: "&#42;상품은 영업일 중 5일 내로 전송될 예정입니다.",
        },
      ],
      media: [
        {
          src: "https://youthvoice.vake.io/files/G0IZUDWCL/FDUYDPKWN/___________2025-04-24_______10.32.05.png",
          type: "image",
          width: 548,
          height: 548,
        },
      ],
      buyable: true,
      createdAt: 1745458855909,
      updatedAt: 1755326139550,
      type: "normal",
    };

    // 상품 컬렉션에 샘플 데이터 추가
    await db.collection("products").doc(sampleProduct.id).set(sampleProduct);
    console.log("✅ 상품 데이터가 생성되었습니다:", sampleProduct.id);

    // 추가 샘플 상품들
    const additionalProducts = [
      {
        id: "CP:ONLINE_GIFT_20K",
        name: "온라인 상품권 2만원 권",
        description:
          "다양한 온라인 쇼핑몰에서 사용할 수 있는 2만원 상품권입니다.",
        price: 0,
        originalPrice: 0,
        normalPrice: 0,
        currency: "KRW",
        additionalFees: [
          {
            type: "coin",
            resourceId: "COIN-43TOZ4S9867",
            amount: 250,
          },
        ],
        content: [
          {
            src: "https://example.com/gift-card-20k.jpg",
            type: "image",
            width: 400,
            height: 300,
          },
          {
            type: "text",
            content: "온라인 상품권 2만원 권",
          },
        ],
        media: [
          {
            src: "https://example.com/gift-card-20k.jpg",
            type: "image",
            width: 400,
            height: 300,
          },
        ],
        options: [],
        productVariants: [],
        view_count: 267,
        view_count_member: 50,
        soldCount: 5,
        soldAmount: 0,
        buyersCount: 5,
        status: "onSale",
        shippingRequired: false,
        sellerId: "CS:NOZU0HZP",
        sellerName: "유스-잇",
        shippingFee: 0,
        customFields: [],
        completeMessage: {
          title: {
            ko: "상품권이 이메일로 발송됩니다!",
          },
          description: {},
        },
        primaryDetails: [],
        repliesCount: 0,
        reviewsCount: 0,
        ratingsCount: 0,
        commentsCount: 0,
        avgRate: 0,
        deliveryType: "online",
        isDisplayed: true,
        variantSkus: [],
        creditAmount: 0,
        buyable: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        type: "normal",
      },
      {
        id: "CP:ONLINE_GIFT_30K",
        name: "온라인 상품권 3만원 권",
        description:
          "다양한 온라인 쇼핑몰에서 사용할 수 있는 3만원 상품권입니다.",
        price: 0,
        originalPrice: 0,
        normalPrice: 0,
        currency: "KRW",
        additionalFees: [
          {
            type: "coin",
            resourceId: "COIN-43TOZ4S9867",
            amount: 350,
          },
        ],
        content: [
          {
            src: "https://example.com/gift-card-30k.jpg",
            type: "image",
            width: 400,
            height: 300,
          },
          {
            type: "text",
            content: "온라인 상품권 3만원 권",
          },
        ],
        media: [
          {
            src: "https://example.com/gift-card-30k.jpg",
            type: "image",
            width: 400,
            height: 300,
          },
        ],
        options: [],
        productVariants: [],
        view_count: 202,
        view_count_member: 30,
        soldCount: 3,
        soldAmount: 0,
        buyersCount: 3,
        status: "onSale",
        shippingRequired: false,
        sellerId: "CS:NOZU0HZP",
        sellerName: "유스-잇",
        shippingFee: 0,
        customFields: [],
        completeMessage: {
          title: {
            ko: "상품권이 이메일로 발송됩니다!",
          },
          description: {},
        },
        primaryDetails: [],
        repliesCount: 0,
        reviewsCount: 0,
        ratingsCount: 0,
        commentsCount: 0,
        avgRate: 0,
        deliveryType: "online",
        isDisplayed: true,
        variantSkus: [],
        creditAmount: 0,
        buyable: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        type: "normal",
      },
    ];

    // 추가 상품들 생성
    for (const product of additionalProducts) {
      await db.collection("products").doc(product.id).set(product);
      console.log("✅ 추가 상품 데이터가 생성되었습니다:", product.id);
    }

    console.log("🎉 스토어 컬렉션 생성이 완료되었습니다!");
    console.log("📊 생성된 컬렉션:");
    console.log("  - products: 상품 정보");
    console.log("  - purchases: 구매 신청 정보 (자동 생성)");
    console.log("  - likes: 상품 좋아요 정보 (자동 생성)");
    console.log("  - qnas: 상품 Q&A 정보 (자동 생성)");
  } catch (error) {
    console.error("❌ 스토어 컬렉션 생성 중 오류 발생:", error);
    throw error;
  }
};

// 스크립트 실행
createFirestoreCollections();
