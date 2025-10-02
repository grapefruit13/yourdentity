const swaggerJSDoc = require("swagger-jsdoc");
// const SwaggerGenerator = require('../utils/swaggerGenerator');
// const AutoSwaggerMiddleware = require('../middleware/autoSwagger');

// 자동 Swagger 생성기 초기화 (임시 비활성화)
// const swaggerGenerator = new SwaggerGenerator();
// const autoSwaggerMiddleware = new AutoSwaggerMiddleware();

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
        description: "커뮤니티 통합 관리 API (전체 포스트 조회, 루틴 인증글, 소모임 후기글, TMI 소개글)",
      },
    ],
    servers: [
      {
        url: "http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api",
        description: "개발 서버 (localhost)",
      },
      {
        url: "http://192.168.0.12:5001/youthvoice-2025/asia-northeast3/api",
        description: "개발 서버 (WiFi 네트워크)",
      },
      {
        url: "https://youthvoice-2025-asia-northeast3-xxxxx.cloudfunctions.net/api",
        description: "프로덕션 서버",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          required: ["email", "name"],
          properties: {
            id: {
              type: "string",
              description: "사용자 고유 ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "사용자 이메일",
            },
            name: {
              type: "string",
              description: "사용자 이름",
            },
            profileImage: {
              type: "string",
              description: "프로필 이미지 URL",
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
        Mission: {
          type: "object",
          required: ["title", "description", "userId"],
          properties: {
            id: {
              type: "string",
              description: "미션 고유 ID",
            },
            title: {
              type: "string",
              description: "미션 제목",
            },
            description: {
              type: "string",
              description: "미션 설명",
            },
            userId: {
              type: "string",
              description: "미션 소유자 ID",
            },
            status: {
              type: "string",
              enum: ["pending", "in_progress", "completed", "cancelled"],
              description: "미션 상태",
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
        Image: {
          type: "object",
          required: ["url", "order"],
          properties: {
            url: {
              type: "string",
              description: "이미지 URL",
              example: "https://youthvoice.vake.io/files/G0IZUDWCL/FKGRWXUG8/file",
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
            text: {
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
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "에러 메시지",
            },
            code: {
              type: "string",
              description: "에러 코드",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "에러 발생 시간",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            code: {
              type: "string",
              description: "에러 코드",
            },
            message: {
              type: "string",
              description: "에러 메시지",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "에러 발생 시간",
            },
          },
        },
        PaginationResponse: {
          type: "object",
          properties: {
            page: {
              type: "number",
              description: "현재 페이지",
              example: 1,
            },
            limit: {
              type: "number",
              description: "페이지당 항목 수",
              example: 10,
            },
            total: {
              type: "number",
              description: "전체 항목 수",
              example: 100,
            },
            totalPages: {
              type: "number",
              description: "전체 페이지 수",
              example: 10,
            },
            hasNext: {
              type: "boolean",
              description: "다음 페이지 존재 여부",
              example: true,
            },
            hasPrev: {
              type: "boolean",
              description: "이전 페이지 존재 여부",
              example: false,
            },
          },
        },
        Routine: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "루틴 고유 ID",
            },
            title: {
              type: "string",
              description: "루틴 제목",
            },
            description: {
              type: "string",
              description: "루틴 설명",
            },
            status: {
              type: "string",
              enum: ["OPEN", "ACTIVE", "CLOSED"],
              description: "루틴 상태",
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "루틴 마감일",
            },
            likesCount: {
              type: "number",
              description: "좋아요 수",
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
          },
        },
        Application: {
          type: "object",
          properties: {
            applicationId: {
              type: "string",
              description: "신청 고유 ID",
            },
            routineId: {
              type: "string",
              description: "루틴 ID",
            },
            userId: {
              type: "string",
              description: "사용자 ID",
            },
            status: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
              description: "신청 상태",
            },
            appliedAt: {
              type: "string",
              format: "date-time",
              description: "신청일시",
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
        QnA: {
          type: "object",
          properties: {
            qnaId: {
              type: "string",
              description: "QnA 고유 ID",
            },
            routineId: {
              type: "string",
              description: "루틴 ID",
            },
            userId: {
              type: "string",
              description: "사용자 ID",
            },
            question: {
              type: "string",
              description: "질문 내용",
            },
            answer: {
              type: "string",
              nullable: true,
              description: "답변 내용",
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
        Comment: {
          type: "object",
          properties: {
            commentId: {
              type: "string",
              description: "댓글 고유 ID",
            },
            type: {
              type: "string",
              enum: ["tmi", "review", "routine_cert", "gathering", "community_post"],
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
        Gathering: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "소모임 고유 ID",
            },
            title: {
              type: "string",
              description: "소모임 제목",
            },
            description: {
              type: "string",
              description: "소모임 설명",
            },
            status: {
              type: "string",
              enum: ["OPEN", "CLOSED"],
              description: "소모임 상태",
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "소모임 마감일",
            },
            likesCount: {
              type: "number",
              description: "좋아요 수",
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
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
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
              description: "외부 참조 ID (루틴 ID 등)",
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
      },
    },
  },
  apis: [
    "./src/routes/*.js", // 기존 라우터 파일
    "./src/docs/*.js", // 문서 클래스 파일
  ],
};

// 기본 Swagger 스펙 생성
const specs = swaggerJSDoc(options);

// 자동 생성된 Swagger와 병합 (임시 비활성화)
async function getMergedSwaggerSpecs() {
  try {
    // const autoGenerated = await swaggerGenerator.mergeWithExistingSwagger();
    // return autoGenerated;
    return specs;
  } catch (error) {
    console.warn("⚠️  자동 Swagger 병합 실패, 기본 스펙 사용:", error.message);
    return specs;
  }
}

// 개발 모드에서 자동 업데이트 활성화 (임시 비활성화)
// if (process.env.NODE_ENV === 'development') {
//   // 파일 변경 감지 시작
//   autoSwaggerMiddleware.startFileWatcher();
//
//   // 서버 시작 시 초기화
//   autoSwaggerMiddleware.initializeSwagger();
// }

module.exports = {
  // 기본 스펙 (기존 호환성)
  default: specs,

  // 병합된 스펙 (자동 생성 포함)
  getMerged: getMergedSwaggerSpecs,

  // 자동 업데이트 미들웨어 (임시 비활성화)
  // autoUpdateMiddleware: autoSwaggerMiddleware.middleware(),

  // 수동 업데이트 함수 (임시 비활성화)
  // updateSwagger: () => swaggerGenerator.mergeWithExistingSwagger(),

  // Swagger 생성기 인스턴스 (임시 비활성화)
  // generator: swaggerGenerator
};
