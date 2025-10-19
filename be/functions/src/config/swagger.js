const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Yourdentity API",
      version: "1.0.0",
      description: "Yourdentity 백엔드 API 문서",
      contact: {
        name: "Yourdentity Team",
        email: "support@yourdentity.com",
      },
    },
    tags: [
      {
        name: "Users",
        description: "사용자 관련 API",
      },
      {
        name: "Missions",
        description: "미션 관련 API",
      },
      {
        name: "Images",
        description: "이미지 업로드 관련 API",
      },
      {
        name: "Routines",
        description: "루틴 관련 API",
      },
      {
        name: "Gatherings",
        description: "월간 소모임 관련 API",
      },
      {
        name: "Communities",
        description:
          "커뮤니티 통합 관리 API (전체 포스트 조회, 루틴 인증글, 소모임 후기글, TMI 소개글)",
      },
      {
        name: "Announcements",
        description: "공지사항 관련 API",
      },
      {
        name: "FAQs",
        description: "FAQ 관련 API",
      },
      {
        name: "FCM",
        description: "FCM 푸시 알림 토큰 관리 API",
      },
    ],
    servers: [
      {
        url: process.env.FUNCTIONS_EMULATOR === "true" ?
          `http://127.0.0.1:5001/${process.env.DEV_PROJECT_ID || "youthvoice-2025"}/asia-northeast3/api` :
          `https://asia-northeast3-${process.env.PROD_PROJECT_ID || "youthvoice-2025"}.cloudfunctions.net/api`,
        description: process.env.FUNCTIONS_EMULATOR === "true" ?
          "개발 서버 (Firebase Emulator)" :
          "프로덕션 서버",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Firebase ID Token을 Bearer 토큰으로 전달",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            uid: {
              type: "string",
              description: "사용자 고유 ID",
              example: "abc123def456",
            },
            name: {
              type: "string",
              description: "사용자 이름",
              example: "홍길동",
            },
            email: {
              type: "string",
              format: "email",
              description: "이메일 주소",
              example: "user@example.com",
            },
            profileImageUrl: {
              type: "string",
              description: "프로필 이미지 URL",
              example: "https://example.com/profile.jpg",
            },
            authType: {
              type: "string",
              enum: ["email", "sns"],
              description: "인증 유형",
              example: "sns",
            },
            snsProvider: {
              type: "string",
              enum: ["kakao", "google"],
              description: "소셜 로그인 제공자",
              example: "kakao",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              description: "사용자 권한",
              example: "user",
            },
            onBoardingComplete: {
              type: "boolean",
              description: "온보딩 완료 여부",
              example: false,
            },
            phoneNumber: {
              type: "string",
              description: "휴대전화 번호",
              example: "010-1234-5678",
            },
            phoneVerified: {
              type: "boolean",
              description: "휴대전화 인증 완료 여부",
              example: false,
            },
            birthYear: {
              type: "number",
              description: "출생년도",
              example: 1990,
            },
            rewardPoints: {
              type: "number",
              description: "리워드 포인트",
              example: 1000,
            },
            level: {
              type: "number",
              description: "사용자 레벨",
              example: 5,
            },
            badges: {
              type: "array",
              items: {
                type: "string",
              },
              description: "획득한 배지 목록",
              example: ["first_mission", "early_bird"],
            },
            points: {
              type: "string",
              description: "사용자 포인트 (문자열 형태)",
              example: "1500",
            },
            mainProfileId: {
              type: "string",
              description: "메인 프로필 ID",
              example: "profile_abc123",
              nullable: true,
            },
            uploadQuotaBytes: {
              type: "number",
              description: "업로드 쿼터 (바이트)",
              example: 1073741824,
            },
            usedStorageBytes: {
              type: "number",
              description: "사용 중인 스토리지 (바이트)",
              example: 52428800,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "계정 생성 시간",
            },
            lastLogin: {
              type: "string",
              format: "date-time",
              description: "마지막 로그인 시간",
            },
          },
        },
        Mission: {
          type: "object",
          required: ["title", "description", "userId"],
          properties: {
            missionId: {
              type: "string",
              description: "미션 ID",
              example: "mission_001",
            },
            userId: {
              type: "string",
              description: "소유자 ID",
              example: "abc123def456",
            },
            title: {
              type: "string",
              description: "미션 제목",
              example: "노을 보기 미션",
            },
            description: {
              type: "string",
              description: "미션 설명",
              example: "노을 보기 미션 설명",
            },
            status: {
              type: "string",
              enum: ["pending", "in_progress", "completed", "cancelled"],
              description: "미션 상태",
              example: "in_progress",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              description: "미션 마감일",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일시",
            },
          },
        },
        ImageUpload: {
          type: "object",
          required: ["image"],
          properties: {
            image: {
              type: "string",
              format: "binary",
              description: "업로드할 이미지 파일",
            },
          },
        },
        FileUpload: {
          type: "object",
          required: ["file"],
          properties: {
            file: {
              type: "string",
              format: "binary",
              description: "업로드할 파일 (multipart/form-data)",
            },
          },
        },
        Image: {
          type: "object",
          required: ["url", "order"],
          properties: {
            url: {
              type: "string",
              description: "이미지 URL",
              example:
                "https://youthvoice.vake.io/files/G0IZUDWCL/FKGRWXUG8/file",
            },
            order: {
              type: "number",
              description: "이미지 순서",
              example: 1,
            },
          },
        },
        ContentItem: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["text", "image", "video", "embed", "file"],
              description: "콘텐츠 타입",
              example: "text",
            },
            order: {
              type: "number",
              description: "순서",
              example: 1,
            },
            content: {
              type: "string",
              description: "텍스트 내용 (text 타입일 때)",
              example: "오늘도 화이팅!",
            },
            url: {
              type: "string",
              description: "미디어 URL",
              example: "https://example.com/image.jpg",
            },
            width: {
              type: "number",
              description: "너비",
              example: 1080,
            },
            height: {
              type: "number",
              description: "높이",
              example: 1080,
            },
            blurHash: {
              type: "string",
              description: "블러 해시",
              example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            thumbUrl: {
              type: "string",
              description: "썸네일 URL (video 전용)",
              example: "https://example.com/thumb.jpg",
            },
            videoSource: {
              type: "string",
              enum: ["uploaded", "youtube", "vimeo"],
              description: "비디오 소스",
              example: "uploaded",
            },
            provider: {
              type: "string",
              enum: ["youtube", "vimeo", "self"],
              description: "제공자",
              example: "self",
            },
            providerVideoId: {
              type: "string",
              description: "제공자 비디오 ID",
              example: "abc123",
            },
            duration: {
              type: "number",
              description: "비디오 길이 (초)",
              example: 120,
            },
            sizeBytes: {
              type: "number",
              description: "파일 크기",
              example: 1048576,
            },
            mimeType: {
              type: "string",
              description: "MIME 타입",
              example: "image/jpeg",
            },
            processingStatus: {
              type: "string",
              enum: ["uploaded", "processing", "ready", "failed"],
              description: "처리 상태",
              example: "ready",
            },
            transcodedVariants: {
              type: "array",
              description: "비디오 변환 결과",
              items: {
                type: "object",
                properties: {
                  resolution: {
                    type: "string",
                    description: "해상도",
                    example: "1080p",
                  },
                  bitrate: {
                    type: "number",
                    description: "비트레이트",
                    example: 2000,
                  },
                  url: {
                    type: "string",
                    description: "변환된 비디오 URL",
                    example: "https://example.com/video_1080p.mp4",
                  },
                },
              },
            },
            fileName: {
              type: "string",
              description: "파일명 (file 전용)",
              example: "document.pdf",
            },
          },
        },
        MediaItem: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["image", "video", "embed", "file"],
              description: "미디어 타입",
              example: "image",
            },
            url: {
              type: "string",
              description: "미디어 URL",
              example: "https://example.com/image.jpg",
            },
            order: {
              type: "number",
              description: "순서",
              example: 1,
            },
            width: {
              type: "number",
              description: "너비",
              example: 1080,
            },
            height: {
              type: "number",
              description: "높이",
              example: 1080,
            },
            blurHash: {
              type: "string",
              description: "블러 해시",
              example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            },
            thumbUrl: {
              type: "string",
              description: "썸네일 URL",
              example: "https://example.com/thumb.jpg",
            },
            videoSource: {
              type: "string",
              enum: ["uploaded", "youtube", "vimeo"],
              description: "비디오 소스",
              example: "uploaded",
            },
            provider: {
              type: "string",
              enum: ["youtube", "vimeo", "self"],
              description: "제공자",
              example: "self",
            },
            providerVideoId: {
              type: "string",
              description: "제공자 비디오 ID",
              example: "abc123",
            },
            duration: {
              type: "number",
              description: "비디오 길이 (초)",
              example: 120,
            },
            sizeBytes: {
              type: "number",
              description: "파일 크기",
              example: 1048576,
            },
            mimeType: {
              type: "string",
              description: "MIME 타입",
              example: "image/jpeg",
            },
            processingStatus: {
              type: "string",
              enum: ["uploaded", "processing", "ready", "failed"],
              description: "처리 상태",
              example: "ready",
            },
            transcodedVariants: {
              type: "array",
              description: "비디오 변환 결과",
              items: {
                type: "object",
                properties: {
                  resolution: {
                    type: "string",
                    description: "해상도",
                    example: "1080p",
                  },
                  bitrate: {
                    type: "number",
                    description: "비트레이트",
                    example: 2000,
                  },
                  url: {
                    type: "string",
                    description: "변환된 비디오 URL",
                    example: "https://example.com/video_1080p.mp4",
                  },
                },
              },
            },
            fileName: {
              type: "string",
              description: "파일명 (file 전용)",
              example: "document.pdf",
            },
          },
        },
        StandardResponse: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "number",
              description: "HTTP 상태 코드",
              example: 200,
            },
            data: {
              description: "응답 데이터 (성공 시에만 포함)",
              nullable: true,
              oneOf: [
                {type: "object", additionalProperties: true},
                {type: "array", items: {type: "object"}},
                {type: "string"},
                {type: "number"},
                {type: "boolean"},
              ],
            },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["status", "message"],
          properties: {
            status: {
              type: "number",
              description: "HTTP 상태 코드",
              example: 400,
            },
            message: {
              type: "string",
              description: "에러 메시지",
              example: "잘못된 요청입니다",
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          required: ["status", "data", "pagination"],
          properties: {
            status: {
              type: "number",
              description: "HTTP 상태 코드",
              example: 200,
            },
            data: {
              type: "array",
              description: "응답 데이터 배열",
              items: {
                type: "object",
              },
            },
            pagination: {
              type: "object",
              description: "페이지네이션 정보",
              properties: {
                page: {
                  type: "number",
                  description: "현재 페이지",
                  example: 0,
                },
                size: {
                  type: "number",
                  description: "페이지당 항목 수",
                  example: 20,
                },
                totalElements: {
                  type: "number",
                  description: "전체 항목 수",
                  example: 100,
                },
                totalPages: {
                  type: "number",
                  description: "전체 페이지 수",
                  example: 5,
                },
                hasNext: {
                  type: "boolean",
                  description: "다음 페이지 존재 여부",
                  example: true,
                },
                hasPrevious: {
                  type: "boolean",
                  description: "이전 페이지 존재 여부",
                  example: false,
                },
              },
            },
          },
        },
        CreatedResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "number",
              description: "HTTP 상태 코드",
              example: 201,
            },
            data: {
              type: "object",
              description: "생성된 리소스 데이터",
            },
          },
        },
        RoutineListItem: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "루틴 고유 ID",
              example: "routine_123",
            },
            name: {
              type: "string",
              description: "루틴 이름",
              example: "매일 운동하기",
            },
            description: {
              type: "string",
              description: "루틴 설명",
              example: "하루 30분씩 운동하는 루틴입니다",
            },
            status: {
              type: "string",
              enum: ["RECRUITING", "IN_PROGRESS", "COMPLETED"],
              description: "루틴 상태",
              example: "RECRUITING",
            },
            price: {
              type: "number",
              description: "가격",
              example: 10000,
            },
            currency: {
              type: "string",
              description: "통화",
              example: "KRW",
            },
            stockCount: {
              type: "integer",
              description: "재고 수량",
              example: 50,
            },
            soldCount: {
              type: "integer",
              description: "판매 수량",
              example: 10,
            },
            viewCount: {
              type: "integer",
              description: "조회수",
              example: 150,
            },
            buyable: {
              type: "boolean",
              description: "구매 가능 여부",
              example: true,
            },
            sellerId: {
              type: "string",
              description: "판매자 ID",
              example: "seller_123",
            },
            sellerName: {
              type: "string",
              description: "판매자 이름",
              example: "유스보이스",
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "마감일",
              example: "2024-12-31T23:59:59.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
        },
        RoutineDetail: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "루틴 고유 ID",
              example: "routine_123",
            },
            name: {
              type: "string",
              description: "루틴 이름",
              example: "매일 운동하기",
            },
            description: {
              type: "string",
              description: "루틴 설명",
              example: "하루 30분씩 운동하는 루틴입니다",
            },
            status: {
              type: "string",
              enum: ["RECRUITING", "IN_PROGRESS", "COMPLETED"],
              description: "루틴 상태",
              example: "RECRUITING",
            },
            price: {
              type: "number",
              description: "가격",
              example: 10000,
            },
            currency: {
              type: "string",
              description: "통화",
              example: "KRW",
            },
            stockCount: {
              type: "integer",
              description: "재고 수량",
              example: 50,
            },
            soldCount: {
              type: "integer",
              description: "판매 수량",
              example: 10,
            },
            viewCount: {
              type: "integer",
              description: "조회수",
              example: 151,
            },
            buyable: {
              type: "boolean",
              description: "구매 가능 여부",
              example: true,
            },
            sellerId: {
              type: "string",
              description: "판매자 ID",
              example: "seller_123",
            },
            sellerName: {
              type: "string",
              description: "판매자 이름",
              example: "유스보이스",
            },
            content: {
              type: "array",
              description: "루틴 상세 내용",
              items: {
                type: "object",
              },
            },
            media: {
              type: "array",
              description: "미디어 파일",
              items: {
                type: "object",
              },
            },
            options: {
              type: "array",
              description: "옵션 목록",
              items: {
                type: "object",
              },
            },
            primaryDetails: {
              type: "array",
              description: "주요 상세 정보",
              items: {
                type: "object",
              },
            },
            variants: {
              type: "array",
              description: "변형 옵션",
              items: {
                type: "object",
              },
            },
            customFields: {
              type: "array",
              description: "커스텀 필드",
              items: {
                type: "object",
              },
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "마감일",
              example: "2024-12-31T23:59:59.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
              example: "2024-01-01T00:00:00.000Z",
            },
            qna: {
              type: "array",
              description: "Q&A 목록",
              items: {
                $ref: "#/components/schemas/QnAItem",
              },
            },
            communityPosts: {
              type: "array",
              description: "커뮤니티 게시글 목록",
              items: {
                $ref: "#/components/schemas/CommunityPost",
              },
            },
          },
        },
        ApplicationResponse: {
          type: "object",
          properties: {
            applicationId: {
              type: "string",
              description: "신청 ID",
              example: "app_123",
            },
            type: {
              type: "string",
              description: "신청 타입",
              example: "ROUTINE",
            },
            targetId: {
              type: "string",
              description: "대상 ID",
              example: "routine_123",
            },
            userId: {
              type: "string",
              description: "사용자 ID",
              example: "user_123",
            },
            status: {
              type: "string",
              description: "신청 상태",
              example: "PENDING",
            },
            selectedVariant: {
              type: "string",
              nullable: true,
              description: "선택된 옵션",
            },
            quantity: {
              type: "integer",
              description: "수량",
              example: 1,
            },
            customFieldsRequest: {
              type: "object",
              description: "커스텀 필드 요청",
            },
            activityNickname: {
              type: "string",
              description: "활동용 닉네임",
              example: "기진맥진",
            },
            activityPhoneNumber: {
              type: "string",
              description: "활동용 전화번호",
              example: "010-1234-5678",
            },
            region: {
              type: "object",
              description: "지역 정보",
              properties: {
                city: {
                  type: "string",
                  description: "시/도",
                  example: "서울시",
                },
                district: {
                  type: "string",
                  description: "군/구",
                  example: "성동구",
                },
              },
            },
            currentSituation: {
              type: "string",
              description: "현재 상황",
              example: "중학생입니다.",
            },
            applicationSource: {
              type: "string",
              description: "신청 경로",
              example: "인스타그램",
            },
            applicationMotivation: {
              type: "string",
              description: "신청 동기",
              example: "규칙적인 생활을 위해서",
            },
            canAttendEvents: {
              type: "boolean",
              description: "필참 일정 참여 여부",
              example: true,
            },
            appliedAt: {
              type: "string",
              format: "date-time",
              description: "신청일",
              example: "2024-01-01T00:00:00.000Z",
            },
            targetName: {
              type: "string",
              description: "대상 이름",
              example: "매일 운동하기",
            },
            targetPrice: {
              type: "number",
              description: "대상 가격",
              example: 10000,
            },
          },
        },
        Review: {
          type: "object",
          properties: {
            reviewId: {
              type: "string",
              description: "리뷰 고유 ID",
            },
            type: {
              type: "string",
              enum: ["ROUTINE", "GATHERING"],
              description: "리뷰 타입",
            },
            targetId: {
              type: "string",
              description: "루틴 ID 또는 소모임 ID",
            },
            userId: {
              type: "string",
              description: "사용자 ID",
            },
            content: {
              type: "string",
              description: "리뷰 내용",
            },
            images: {
              type: "array",
              items: {
                type: "string",
                description: "이미지 URL",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일시",
            },
          },
        },
        QnAItem: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Q&A ID",
              example: "qna_123",
            },
            content: {
              type: "array",
              description: "질문 내용",
              items: {
                type: "object",
              },
            },
            media: {
              type: "array",
              description: "미디어 파일",
              items: {
                type: "object",
              },
            },
            answerContent: {
              type: "array",
              nullable: true,
              description: "답변 내용",
              items: {
                type: "object",
              },
            },
            answerMedia: {
              type: "array",
              description: "답변 미디어",
              items: {
                type: "object",
              },
            },
            answerUserId: {
              type: "string",
              nullable: true,
              description: "답변자 ID",
              example: "user_456",
            },
            askedBy: {
              type: "string",
              description: "질문자 ID",
              example: "user_123",
            },
            answeredBy: {
              type: "string",
              nullable: true,
              description: "답변자 ID",
              example: "user_456",
            },
            askedAt: {
              type: "string",
              format: "date-time",
              description: "질문일",
              example: "2024-01-01T00:00:00.000Z",
            },
            answeredAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "답변일",
              example: "2024-01-02T00:00:00.000Z",
            },
            likesCount: {
              type: "integer",
              description: "좋아요 수",
              example: 5,
            },
          },
        },
        CommunityPostListItem: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "게시글 ID",
              example: "AMrsQRg9tBY0ZGJMbKG2",
            },
            type: {
              type: "string",
              description: "게시글 타입",
              example: "TMI",
            },
            author: {
              type: "string",
              description: "작성자",
              example: "사용자닉네임",
            },
            title: {
              type: "string",
              description: "제목",
              example: "오늘의 루틴 인증!",
            },
            preview: {
              type: "object",
              description: "미리보기 정보",
              properties: {
                description: {
                  type: "string",
                  description: "미리보기 설명",
                  example: "string",
                },
                thumbnail: {
                  type: "object",
                  nullable: true,
                  description: "썸네일 정보 (null 가능)",
                  properties: {
                    url: {
                      type: "string",
                      description: "썸네일 URL",
                      example: "https://example.com/updated-image.jpg",
                    },
                    blurHash: {
                      type: "string",
                      description: "블러 해시",
                      example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
                    },
                    width: {
                      type: "integer",
                      description: "너비",
                      example: 1080,
                    },
                    height: {
                      type: "integer",
                      description: "높이",
                      example: 1080,
                    },
                    ratio: {
                      type: "string",
                      description: "비율",
                      example: "1080:1080",
                    },
                  },
                },
                isVideo: {
                  type: "boolean",
                  description: "비디오 여부",
                  example: false,
                },
                hasImage: {
                  type: "boolean",
                  description: "이미지 포함 여부",
                  example: false,
                },
                hasVideo: {
                  type: "boolean",
                  description: "동영상 포함 여부",
                  example: false,
                },
              },
            },
            mediaCount: {
              type: "integer",
              description: "미디어 개수",
              example: 0,
            },
            channel: {
              type: "string",
              description: "채널명",
              example: "TMI 자아탐색",
            },
            category: {
              type: "string",
              nullable: true,
              description: "카테고리",
              example: "string",
            },
            tags: {
              type: "array",
              description: "태그 목록",
              items: {
                type: "string",
              },
              example: ["string"],
            },
            scheduledDate: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "예약 발행 날짜",
              example: "2025-10-03T17:15:04.882Z",
            },
            isLocked: {
              type: "boolean",
              description: "잠금 여부",
              example: false,
            },
            visibility: {
              type: "string",
              description: "공개 범위",
              example: "public",
            },
            likesCount: {
              type: "integer",
              description: "좋아요 수",
              example: 0,
            },
            commentsCount: {
              type: "integer",
              description: "댓글 수",
              example: 0,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
              example: "2025-10-03T17:15:07.862Z",
            },
            timeAgo: {
              type: "string",
              description: "상대적 시간",
              example: "2분 전",
            },
          },
        },
        CommunityPost: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "게시글 ID",
              example: "post_123",
            },
            type: {
              type: "string",
              description: "게시글 타입",
              example: "ROUTINE_CERT",
            },
            author: {
              type: "string",
              description: "작성자",
              example: "사용자닉네임",
            },
            title: {
              type: "string",
              description: "제목",
              example: "오늘의 루틴 인증!",
            },
            content: {
              type: "array",
              description: "내용",
              items: {
                type: "object",
              },
            },
            media: {
              type: "array",
              description: "미디어",
              items: {
                type: "object",
              },
            },
            channel: {
              type: "string",
              description: "채널명",
              example: "플래너 인증 루틴",
            },
            isLocked: {
              type: "boolean",
              description: "잠금 여부",
              example: false,
            },
            visibility: {
              type: "string",
              description: "공개 범위",
              example: "public",
            },
            likesCount: {
              type: "integer",
              description: "좋아요 수",
              example: 10,
            },
            commentsCount: {
              type: "integer",
              description: "댓글 수",
              example: 3,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
        },
        Comment: {
          type: "object",
          properties: {
            commentId: {
              type: "string",
              description: "댓글 고유 ID",
            },
            type: {
              type: "string",
              enum: [
                "tmi",
                "review",
                "routine_cert",
                "gathering",
                "community_post",
              ],
              description: "댓글 타입",
            },
            targetId: {
              type: "string",
              description: "대상 ID",
            },
            userId: {
              type: "string",
              description: "사용자 ID",
            },
            content: {
              type: "string",
              description: "댓글 내용",
            },
            images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: {
                    type: "string",
                    description: "이미지 URL",
                  },
                  order: {
                    type: "number",
                    description: "이미지 순서",
                  },
                },
              },
            },
            parentId: {
              type: "string",
              nullable: true,
              description: "부모 댓글 ID",
            },
            depth: {
              type: "number",
              description: "댓글 깊이",
            },
            isReply: {
              type: "boolean",
              description: "답글 여부",
            },
            isLocked: {
              type: "boolean",
              description: "댓글 잠금 여부",
            },
            reportsCount: {
              type: "number",
              description: "신고 횟수",
            },
            deleted: {
              type: "boolean",
              description: "삭제 여부",
            },
            deletedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "삭제일시",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일시",
            },
          },
        },
        GatheringListItem: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "소모임 고유 ID",
              example: "gathering_123",
            },
            name: {
              type: "string",
              description: "소모임 이름",
              example: "월간 독서 모임",
            },
            description: {
              type: "string",
              description: "소모임 설명",
              example: "매월 한 권씩 책을 읽고 토론하는 모임입니다",
            },
            status: {
              type: "string",
              enum: ["RECRUITING", "IN_PROGRESS", "COMPLETED"],
              description: "소모임 상태",
              example: "RECRUITING",
            },
            price: {
              type: "number",
              description: "가격",
              example: 5000,
            },
            currency: {
              type: "string",
              description: "통화",
              example: "KRW",
            },
            stockCount: {
              type: "integer",
              description: "재고 수량",
              example: 20,
            },
            soldCount: {
              type: "integer",
              description: "판매 수량",
              example: 5,
            },
            viewCount: {
              type: "integer",
              description: "조회수",
              example: 80,
            },
            buyable: {
              type: "boolean",
              description: "구매 가능 여부",
              example: true,
            },
            sellerId: {
              type: "string",
              description: "판매자 ID",
              example: "seller_123",
            },
            sellerName: {
              type: "string",
              description: "판매자 이름",
              example: "독서 코치",
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "마감일",
              example: "2024-12-31T23:59:59.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
        },
        GatheringDetail: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "소모임 고유 ID",
              example: "gathering_123",
            },
            name: {
              type: "string",
              description: "소모임 이름",
              example: "월간 독서 모임",
            },
            description: {
              type: "string",
              description: "소모임 설명",
              example: "매월 한 권씩 책을 읽고 토론하는 모임입니다",
            },
            status: {
              type: "string",
              enum: ["RECRUITING", "IN_PROGRESS", "COMPLETED"],
              description: "소모임 상태",
              example: "RECRUITING",
            },
            price: {
              type: "number",
              description: "가격",
              example: 5000,
            },
            currency: {
              type: "string",
              description: "통화",
              example: "KRW",
            },
            stockCount: {
              type: "integer",
              description: "재고 수량",
              example: 20,
            },
            soldCount: {
              type: "integer",
              description: "판매 수량",
              example: 5,
            },
            viewCount: {
              type: "integer",
              description: "조회수",
              example: 81,
            },
            buyable: {
              type: "boolean",
              description: "구매 가능 여부",
              example: true,
            },
            sellerId: {
              type: "string",
              description: "판매자 ID",
              example: "seller_123",
            },
            sellerName: {
              type: "string",
              description: "판매자 이름",
              example: "독서 코치",
            },
            content: {
              type: "array",
              description: "소모임 상세 내용",
              items: {
                type: "object",
              },
            },
            media: {
              type: "array",
              description: "미디어 파일",
              items: {
                type: "object",
              },
            },
            options: {
              type: "array",
              description: "옵션 목록",
              items: {
                type: "object",
              },
            },
            primaryDetails: {
              type: "array",
              description: "주요 상세 정보",
              items: {
                type: "object",
              },
            },
            variants: {
              type: "array",
              description: "변형 옵션",
              items: {
                type: "object",
              },
            },
            customFields: {
              type: "array",
              description: "커스텀 필드",
              items: {
                type: "object",
              },
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "마감일",
              example: "2024-12-31T23:59:59.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
              example: "2024-01-01T00:00:00.000Z",
            },
            qna: {
              type: "array",
              description: "Q&A 목록",
              items: {
                $ref: "#/components/schemas/QnAItem",
              },
            },
            communityPosts: {
              type: "array",
              description: "커뮤니티 게시글 목록",
              items: {
                $ref: "#/components/schemas/CommunityPost",
              },
            },
          },
        },
        Community: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "커뮤니티 고유 ID",
            },
            name: {
              type: "string",
              description: "커뮤니티 이름",
            },
            interestTag: {
              type: "string",
              description: "관심사 태그",
            },
            type: {
              type: "string",
              enum: ["interest", "anonymous"],
              description: "커뮤니티 타입",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
            },
            createdBy: {
              type: "string",
              description: "생성자 ID",
            },
            linkedChat: {
              type: "string",
              description: "연결된 채팅방 ID",
            },
          },
        },
        Post: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "게시글 고유 ID",
              example: "CERT_1758883064394",
            },
            type: {
              type: "string",
              enum: ["ROUTINE_CERT", "TMI", "GATHERING_REVIEW"],
              description: "게시글 타입",
              example: "ROUTINE_CERT",
            },
            refId: {
              type: "string",
              description: "외부 참조 ID (루틴/소모임/TMI 프로젝트 ID)",
              example: "routine_123",
            },
            authorId: {
              type: "string",
              description: "작성자 ID",
              example: "user123",
            },
            author: {
              type: "string",
              description: "작성자 닉네임",
              example: "사용자닉네임",
            },
            communityPath: {
              type: "string",
              description: "커뮤니티 경로",
              example: "communities/routine-cert",
            },
            title: {
              type: "string",
              description: "게시글 제목",
              example: "오늘의 루틴 인증!",
            },
            content: {
              type: "array",
              description: "게시글 본문 내용",
              items: {
                $ref: "#/components/schemas/ContentItem",
              },
            },
            media: {
              type: "array",
              description: "미디어 목록",
              items: {
                $ref: "#/components/schemas/MediaItem",
              },
            },
            channel: {
              type: "string",
              description: "채널명",
              example: "플래너 인증 루틴",
            },
            isLocked: {
              type: "boolean",
              description: "잠금 여부",
              example: false,
            },
            visibility: {
              type: "string",
              enum: ["public", "private", "hidden"],
              description: "공개 범위",
              example: "public",
            },
            rewardGiven: {
              type: "boolean",
              description: "리워드 지급 여부",
              example: false,
            },
            reactionsCount: {
              type: "number",
              description: "반응 수",
              example: 0,
            },
            likesCount: {
              type: "number",
              description: "좋아요 수",
              example: 0,
            },
            commentsCount: {
              type: "number",
              description: "댓글 수",
              example: 0,
            },
            reportsCount: {
              type: "number",
              description: "신고 수",
              example: 0,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
              example: "2025-09-28T14:39:41.690Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일시",
              example: "2025-09-28T14:39:41.690Z",
            },
          },
        },
        ActivityResponse: {
          type: "object",
          properties: {
            activityId: {
              type: "string",
              description: "활동 고유 ID",
            },
            type: {
              type: "string",
              enum: ["GATHERING_REVIEW", "ROUTINE_CERT", "TMI_REVIEW"],
              description: "활동 구분",
            },
            refId: {
              type: "string",
              description: "원본 활동 ID",
            },
            userId: {
              type: "string",
              description: "작성자 ID",
            },
            title: {
              type: "string",
              description: "제목",
            },
            content: {
              type: "string",
              description: "내용",
            },
            images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: {
                    type: "string",
                    description: "이미지 URL",
                  },
                  order: {
                    type: "number",
                    description: "이미지 순서",
                  },
                },
              },
            },
            likesCount: {
              type: "number",
              description: "좋아요 수",
            },
            commentsCount: {
              type: "number",
              description: "댓글 수",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일시",
            },
          },
        },
        LikeToggleResponse: {
          type: "object",
          properties: {
            routineId: {
              type: "string",
              description: "루틴 ID",
              example: "routine_123",
            },
            userId: {
              type: "string",
              description: "사용자 ID",
              example: "user_123",
            },
            isLiked: {
              type: "boolean",
              description: "좋아요 여부",
              example: true,
            },
            likesCount: {
              type: "integer",
              description: "좋아요 수",
              example: 5,
            },
          },
        },
        QnALikeToggleResponse: {
          type: "object",
          properties: {
            qnaId: {
              type: "string",
              description: "Q&A ID",
              example: "qna_123",
            },
            userId: {
              type: "string",
              description: "사용자 ID",
              example: "user_123",
            },
            isLiked: {
              type: "boolean",
              description: "좋아요 여부",
              example: true,
            },
            likesCount: {
              type: "integer",
              description: "좋아요 수",
              example: 3,
            },
          },
        },
        Announcement: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "공지사항 ID (Notion 페이지 ID)",
              example: "abc123def456",
            },
            title: {
              type: "string",
              description: "공지사항 제목",
              example: "새로운 기능 업데이트 안내",
            },
            author: {
              type: "string",
              nullable: true,
              description: "작성자 ID",
              example: "user_123",
            },
            contentRich: {
              type: "array",
              description: "노션 블록 형태의 상세 내용",
              items: {
                type: "object",
                description: "노션 블록 객체",
              },
            },
            pinned: {
              type: "boolean",
              nullable: true,
              description: "고정 여부",
              example: false,
            },
            startDate: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "공지 시작일",
              example: "2024-01-01T00:00:00.000Z",
            },
            endDate: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "공지 종료일",
              example: "2024-12-31T23:59:59.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일시",
              example: "2024-01-01T00:00:00.000Z",
            },
            isDeleted: {
              type: "boolean",
              description: "삭제 여부",
              example: false,
            },
          },
        },
        AnnouncementListResponse: {
          type: "object",
          properties: {
            status: {
              type: "number",
              description: "HTTP 상태 코드",
              example: 200,
            },
            data: {
              type: "array",
              description: "공지사항 목록",
              items: {
                $ref: "#/components/schemas/Announcement",
              },
            },
          },
        },
        AnnouncementDetailResponse: {
          type: "object",
          properties: {
            status: {
              type: "number",
              description: "HTTP 상태 코드",
              example: 200,
            },
            data: {
              $ref: "#/components/schemas/Announcement",
            },
          },
        },
        AnnouncementSyncResponse: {
          type: "object",
          properties: {
            status: {
              type: "number",
              description: "HTTP 상태 코드",
              example: 200,
            },
            data: {
              $ref: "#/components/schemas/Announcement",
            },
          },
        },
        AnnouncementDeleteResponse: {
          type: "object",
          properties: {
            status: {
              type: "number",
              description: "HTTP 상태 코드",
              example: 200,
            },
            data: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "공지사항 ID",
                  example: "abc123def456",
                },
                isDeleted: {
                  type: "boolean",
                  description: "삭제 여부",
                  example: true,
                },
                updatedAt: {
                  type: "string",
                  format: "date-time",
                  description: "수정일시",
                  example: "2024-01-01T00:00:00.000Z",
                },
              },
            },
          },
        },
        FCMToken: {
          type: "object",
          required: ["token"],
          properties: {
            token: {
              type: "string",
              description: "FCM 토큰",
              example: "fcm_token_example_123456789",
            },
            deviceInfo: {
              type: "string",
              description: "디바이스 정보 (브라우저 userAgent, 모바일 deviceId 등)",
              example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            deviceType: {
              type: "string",
              enum: ["pwa", "mobile", "web"],
              description: "디바이스 타입",
              default: "pwa",
              example: "pwa",
            },
          },
        },
        FCMTokenResponse: {
          type: "object",
          properties: {
            deviceId: {
              type: "string",
              description: "디바이스 ID",
              example: "device_abc123def456",
            },
            message: {
              type: "string",
              description: "응답 메시지",
              example: "토큰 저장 완료",
            },
          },
        },
        FCMTokenListResponse: {
          type: "object",
          properties: {
            tokens: {
              type: "array",
              description: "FCM 토큰 목록",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "디바이스 ID (문서 ID)",
                    example: "63279522febcf5538b72",
                  },
                  token: {
                    type: "string",
                    description: "FCM 토큰",
                    example: "fcm_token_example_123456789",
                  },
                  deviceType: {
                    type: "string",
                    description: "디바이스 타입",
                    example: "pwa",
                  },
                  deviceInfo: {
                    type: "string",
                    description: "디바이스 정보",
                    example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                  },
                  lastUsed: {
                    type: "string",
                    format: "date-time",
                    description: "마지막 사용 시간",
                    example: "2024-01-01T00:00:00.000Z",
                  },
                  createdAt: {
                    type: "string",
                    format: "date-time",
                    description: "생성 시간",
                    example: "2024-01-01T00:00:00.000Z",
                  },
                },
              },
            },
          },
        },
        FCMDeleteResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "삭제 결과 메시지",
              example: "토큰이 삭제되었습니다.",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/docs/*.js"],
};

// 기본 Swagger 스펙 생성
const specs = swaggerJSDoc(options);

// 자동 생성된 Swagger와 병합
async function getMergedSwaggerSpecs() {
  try {
    // require 캐시 삭제로 파일 변경사항 반영
    const swaggerConfigPath = require.resolve("./swagger.js");
    delete require.cache[swaggerConfigPath];

    // 매번 새로운 스펙을 생성해서 변경사항이 반영되도록 함
    return swaggerJSDoc(options);
  } catch (error) {
    console.warn("⚠️  자동 Swagger 병합 실패, 기본 스펙 사용:", error.message);
    return swaggerJSDoc(options);
  }
}

module.exports = {
  // 기본 스펙 (기존 호환성)
  default: specs,

  // 병합된 스펙 (자동 생성 포함)
  getMerged: getMergedSwaggerSpecs,
};
