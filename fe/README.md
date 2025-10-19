# 🚀 Yourdentity Frontend

> 청소년의 정체성 형성을 돕는 커뮤니티 플랫폼 - PWA 기반 모바일 웹 애플리케이션

## 🚀 테크 스택

- **프레임워크**: Next.js 15 (App Router) + React 19
- **언어**: TypeScript
- **스타일링**: Tailwind CSS 4
- **UI 컴포넌트**: shadcn/ui, lucide-react
- **상태관리**: Zustand (stores 폴더)
- **PWA**: next-pwa, Firebase Cloud Messaging
- **개발도구**: ESLint 9, Prettier, Husky
- **유틸리티**: clsx, class-variance-authority, tailwind-merge

## 📁 폴더 아키텍처

```
📦 fe/
├── 📂 public/                                    # 정적 파일 (PWA/이미지/아이콘)
│   ├── 📂 fonts/                                 # 폰트 파일
│   ├── 📂 icons/                                 # 앱/파비콘 아이콘
│   │   ├── 📂 app/                               # 앱 아이콘 (192/512 등)
│   │   └── 📂 favicon/                           # 파비콘 (16/32/48)
│   ├── 📂 imgs/                                  # 이미지 파일
│   ├── 📄 firebase-messaging-sw.js               # FCM Service Worker
│   └── 📄 sw.js                                  # PWA 서비스 워커 번들
│
└── 📂 src/
    ├── 📂 app/                                   # Next.js App Router
    │   ├── 📂 (auth)/                            # 인증 관련 라우트 그룹
    │   ├── 📂 (main)/                            # 메인 앱 라우트 그룹
    │   ├── 📂 api/                               # 서버 액션/라우트 핸들러
    │   ├── favicon.ico
    │   ├── globals.css                           # 전역 스타일 정의
    │   ├── layout.tsx                            # root 레이아웃
    │   ├── manifest.ts                           # PWA 매니페스트 (TS)
    │   └── page.tsx                              # 홈페이지
    │
    ├── 📂 api/                                   # API 호출 함수
    │   ├── 📂 [module]/                          # 모듈별
    │   ├── 📂 generated/                         # 자동 생성된 API 함수
    │   └── 📂 shared/                            # 공통
    │
    ├── 📂 components/                            # UI 컴포넌트
    │   ├── 📂 [module]/                          # 모듈별
    │   ├── 📂 shared/                            # 공통
    │   └── 📂 ui/                                # shadcn
    │
    ├── 📂 constants/                             # 상수
    │   ├── 📂 [module]/                          # 모듈별
    │   └── 📂 shared/                            # 공통
    │
    ├── 📂 hooks/                                 # 커스텀 훅
    │   ├── 📂 [module]/                          # 모듈별
    │   ├── 📂 generated/                         # 자동 생성된 React Query 훅
    │   └── 📂 shared/                            # 공통
    │
    ├── 📂 lib/                                   # 라이브러리 설정
    │   └── firebase.ts                           # Firebase 초기화
    │
    ├── 📂 stores/                                # Zustand 스토어
    │   ├── 📂 [module]/                          # 모듈별
    │   └── 📂 shared/                            # 공통
    │
    ├── 📂 styles/
    │
    ├── 📂 types/                                 # 전역/도메인 타입
    │   ├── 📂 [module]/                          # 모듈별
    │   ├── 📂 generated/                         # 자동 생성된 API 타입
    │   └── 📂 shared/                            # 공통
    │
    └── 📂 utils/                                 # 유틸리티 함수
       ├── 📂 [module]/                           # 모듈별
       └── 📂 shared/                             # 공통
│
└── 📂 scripts/                                   # 자동화 스크립트
    ├── fetch-swagger.ts                          # Swagger 스펙 다운로드
    └── generate-api.ts                           # API 코드 생성
```

### 🏗️ 아키텍처 특징

- **모듈 기반 구조**: 각 기능별로 독립적인 폴더 구조
- **공통/모듈 분리**: `shared` 폴더로 재사용 가능한 코드 관리
- **App Router**: Next.js 15의 최신 라우팅 시스템
- **PWA 지원**: 모바일 앱과 유사한 사용자 경험
- **타입 안전성**: TypeScript로 전체 코드베이스 타입 관리
- **API 자동 생성**: Swagger 기반 API 코드 자동 생성 시스템

## 🔧 API 자동 생성 시스템

이 프로젝트는 **Swagger 기반 API 코드 자동 생성 시스템**을 사용합니다.

### 주요 특징

- ✅ **API 함수 자동 생성**: 백엔드 API에 맞는 TypeScript 함수
- ✅ **타입 안전성**: Swagger 스펙 기반 TypeScript 타입
- ✅ **React Query 통합**: Query Keys와 Hooks 자동 생성
- ✅ **실시간 동기화**: 백엔드 변경사항 자동 감지

### 사용법

```bash
# API 코드 자동 생성
pnpm api:sync

# 개발 서버 실행 (자동 감지 모드)
pnpm dev:with-api
```

자세한 내용은 [API 자동 생성 시스템 가이드](./README_API_GENERATION.md)를 참고하세요.

## 🛠️ 개발 환경 설정

### 필수 요구사항

- Node.js 20+
- pnpm (권장 패키지 매니저)
- Firebase CLI

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 백엔드 서버 실행 (별도 터미널)
cd ../be/functions
firebase emulators:start --only functions,auth

# 프론트엔드 개발 서버 실행 (API 자동 생성 모드)
cd ../../fe
pnpm dev:with-api

# 또는 일반 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

## 🚀 배포

### Firebase 배포

```bash
# 전체 배포 (정적 + Functions)
pnpm run deploy

# 정적 파일만 배포
pnpm run deploy:hosting

# Functions만 배포
pnpm run deploy:functions
```

### 로컬 에뮬레이터

```bash
# Firebase 에뮬레이터 + 개발 서버 동시 실행
pnpm dev:emulator
```

## 🔧 개발 도구

### 코드 품질

```bash
# ESLint 검사
pnpm lint

# ESLint 자동 수정
pnpm lint:fix

# Prettier 포맷팅
pnpm format

# Prettier 검사
pnpm format:check
```

## 📋 Git 전략

- **브랜치**: `feature` → `main`
- **커밋 전**: Husky를 통한 자동 lint-staged 실행
