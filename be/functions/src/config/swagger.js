const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Yourdentity API",
      version: "1.0.0",
      description: "Yourdentity 백엔드 API 문서",
      contact: {
        name: "Yourdentity Team",
        email: "support@yourdentity.com",
      },
    },
    servers: [
      {
        url: "http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api",
        description: "개발 서버 (Firebase Emulator)",
      },
      {
        url: "https://asia-northeast3-yourdentity.cloudfunctions.net",
        description: "프로덕션 서버",
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
          properties: {
            missionId: {
              type: "string",
              description: "미션 ID",
              example: "mission_001",
            },
            userId: {
              type: "string",
              description: "사용자 ID",
              example: "abc123def456",
            },
            status: {
              type: "string",
              enum: ["ONGOING", "COMPLETED", "EXPIRED", "RETRY"],
              description: "미션 상태",
              example: "ONGOING",
            },
            startedAt: {
              type: "string",
              format: "date-time",
              description: "미션 시작 시간",
            },
            completedAt: {
              type: "string",
              format: "date-time",
              description: "미션 완료 시간",
            },
            certified: {
              type: "boolean",
              description: "인증 완료 여부",
              example: false,
            },
            review: {
              type: "string",
              description: "미션 리뷰",
              example: "미션이 유익했습니다.",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "에러 메시지",
              example: "Invalid request",
            },
            status: {
              type: "number",
              description: "HTTP 상태 코드",
              example: 400,
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            status: {
              type: "number",
              example: 200,
              description: "HTTP 상태 코드",
            },
            data: {
              type: "object",
              description: "응답 데이터",
            },
            message: {
              type: "string",
              description: "성공 메시지",
              example: "Operation succeeded",
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
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
