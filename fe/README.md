# yourdentity-front

유어덴티티 프론트엔드 - PWA 기반 모바일 웹 애플리케이션

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
├── 📂 public/                    # 정적 파일
│   ├── 📂 fonts/                 # 폰트 파일
│   ├── 📂 icons/                 # SVG 아이콘
│   ├── 📂 imgs/                  # 이미지 파일
│   └── 📄 manifest.json          # PWA 매니페스트
│
├── 📂 src/
│   ├── 📂 app/                   # Next.js App Router
│   │   ├── 📂 (auth)/            # 인증 관련 페이지
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forget-password/
│   │   └── 📂 (main)/            # 메인 앱 페이지
│   │       ├── community/        # 커뮤니티
│   │       ├── mission/          # 미션
│   │       ├── my-page/          # 마이페이지
│   │       ├── store/            # 스토어
│   │       └── admin/            # 관리자
│   │
│   ├── 📂 components/            # UI 컴포넌트
│   │   ├── 📂 shared/            # 공통 컴포넌트
│   │   │   ├── layouts/          # 레이아웃 컴포넌트
│   │   │   └── ui/               # 기본 UI 컴포넌트
│   │   └── 📂 [module]/          # 모듈별 컴포넌트
│   │
│   ├── 📂 api/                   # API 호출 함수
│   │   ├── 📂 shared/            # 공통 API
│   │   └── 📂 [module]/          # 모듈별 API
│   │
│   ├── 📂 hooks/                 # 커스텀 훅
│   │   ├── 📂 shared/            # 공통 훅
│   │   └── 📂 [module]/          # 모듈별 훅
│   │
│   ├── 📂 stores/                # Zustand 상태 관리
│   │   ├── 📂 shared/            # 공통 스토어
│   │   └── 📂 [module]/          # 모듈별 스토어
│   │
│   ├── 📂 types/                 # TypeScript 타입 정의
│   │   ├── 📂 shared/            # 공통 타입
│   │   └── 📂 [module]/          # 모듈별 타입
│   │
│   ├── 📂 constants/             # 상수 정의
│   │   ├── 📂 shared/            # 공통 상수
│   │   └── 📂 [module]/          # 모듈별 상수
│   │
│   ├── 📂 utils/                 # 유틸리티 함수
│   │   ├── 📂 shared/            # 공통 유틸
│   │   └── 📂 [module]/          # 모듈별 유틸
│   │
│   └── 📂 lib/                   # 라이브러리 설정
│       └── firebase.ts           # Firebase 설정
│
└── 📂 functions/                 # Firebase Functions
    └── 📂 src/
        └── index.ts              # Functions 진입점
```

### 🏗️ 아키텍처 특징

- **모듈 기반 구조**: 각 기능별로 독립적인 폴더 구조
- **공통/모듈 분리**: `shared` 폴더로 재사용 가능한 코드 관리
- **App Router**: Next.js 15의 최신 라우팅 시스템
- **PWA 지원**: 모바일 앱과 유사한 사용자 경험
- **타입 안전성**: TypeScript로 전체 코드베이스 타입 관리

## 🛠️ 개발 환경 설정

### 필수 요구사항

- Node.js 18+
- pnpm (권장 패키지 매니저)

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (HTTPS)
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
