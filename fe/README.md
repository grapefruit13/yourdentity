# yourdentity-front

유어덴티티 프론트엔드

## 테크 스택

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- ESLint 9 + Prettier
- shadcn/ui, lucide-react
- 유틸리티: clsx, class-variance-authority, tailwind-merge, tw-animate-css
- `fe/package.json`에서 전부 확인 가능합니다.

## 폴더 아키텍처

```
📦public
 ┣ 📂fonts - 폰트
 ┣ 📂imgs - 이미지(png, jpeg 등)
 ┗ 📂icons - svg 포함한 아이콘
📦src
 ┣ 📂app - Next.js App Router 엔트리(레이아웃/페이지)
 ┣ 📂api - api 호출 관련 유틸
 ┣ 📂components - 화면을 구성하는 UI 컴포넌트(서버/클라이언트 모두)
 ┃ ┣ 📂common - 모듈에 공통으로 사용되는 컴포넌트
 ┃ ┗ 📂community / my-page / mission ...  - 각 모듈에서만 사용되는 컴포넌트
 ┣ 📂constants - 상수, enum-like 값, 키 문자열, 라벨, 경로 등
 ┃ ┃ ┣ 📂contexts - React Context와 Provider, 관련 훅
 ┃ ┃ ┣ 📂lib - 도메인 로직, 순수 함수, 비주입 훅, 포맷터, 파서 등 UI 비의존 코드
 ┃ ┃ ┣ 📂pages - 모듈 단위의 페이지 레벨 컴포넌트/조합(실제 라우팅은 `app/`에서 구성)
 ┃ ┃ ┣ 📂types - 모듈 전용 타입 정의, 스키마(Zod 등), DTO
 ┃ ┃ ┗ 📂utils - 소규모 범용 유틸(순수 함수), 모듈 내부 공통 헬퍼
 ┗ 📂shared - 여러 도메인에서 사용되는 공통 함수
```

### 명령어

```shell
# 설치
pnpm i
# 로컬 실행
pnpm dev
# 빌드
pnpm build
# 빌드 후 실행
pnpm start
```

### Firebase 설정

- Hosting: `fe/firebase.json` 기준 `out/` 디렉터리를 정적 호스팅하며, 모든 경로를 `/index.html`로 리라이트합니다.
- Functions: 소스는 `fe/functions`를 사용하며, 예시로 `sendNotificationHttp`(us-central1)가 등록되어 있습니다. CORS 허용 도메인은 `functions:config:set cors.origins="https://example.com,https://example2.com"` 형태로 설정합니다.

### 자주 쓰는 명령어

```shell
# 정적 + 동적(functions) 전체 배포
pnpm run deploy

# 정적 파일만 배포
pnpm run deploy:hosting

# 동적(functions)만 배포
pnpm run deploy:functions

# 로컬 functions 에뮬레이터 + pwa 실행
pnpm dev:emulator

```

### git 전략

- feature -> main
