# yourdentity-front

유어덴티티 프론트엔드 레포입니다.

## 테크 스택

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- ESLint 9 + Prettier
- shadcn/ui, lucide-react
- 유틸리티: clsx, class-variance-authority, tailwind-merge, tw-animate-css
- package.json에서 전부 확인 가능합니다.

## 폴더 아키텍처

- `modules` 폴더는 FSD 관점의 feature 레이어와 동일합니다. 도메인/서브도메인 단위로 나뉘며 각 폴더 내에 slice(하위 레이어)가 구성됩니다.
- `shared` 폴더는 모듈 간 공유되는 공용 레이어입니다.

```
📦public
 ┣ 📂fonts - 폰트
 ┣ 📂imgs - 이미지(png, jpeg 등)
 ┗ 📂svgs - svg
📦src
 ┣ 📂app - Next.js App Router 엔트리(레이아웃/페이지)
 ┣ 📂modules - FSD의 feature 레이어 (도메인 단위)
 ┃ ┣ 📂admin | comminity | store
 ┃ ┃ ┣ 📂api - api 호출 관련 유틸
 ┃ ┃ ┣ 📂components - 화면을 구성하는 UI 컴포넌트(서버/클라이언트 모두)
 ┃ ┃ ┣ 📂constants - 상수, enum-like 값, 키 문자열, 라벨, 경로 등
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

### git 전략

- feature -> main
- 1개 이상의 approve 받아야 merge 가능
