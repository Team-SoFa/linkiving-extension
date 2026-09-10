# linkiving-extension

Next.js + TypeScript 기반의 Chrome Extension (Manifest V3) 프로젝트입니다.

## 시작

```bash
pnpm install
cp .env.example .env.local
pnpm build
```

빌드 결과물은 `out/` 폴더에 생성됩니다.
`extension/manifest.json`의 `default_popup`은 `index.html`을 가리키지만, 이 파일은 소스 트리에 직접 존재하지 않고 `Next.js export` 단계에서 `out/index.html`로 생성됩니다.

Chrome에서 `chrome://extensions`로 이동한 뒤 `압축해제된 확장 프로그램을 로드`에서 `out/` 폴더를 선택하면 됩니다.
`extension/` 폴더를 직접 로드하면 `index.html`이 없어서 팝업이 동작하지 않습니다.

## 환경변수

```bash
NEXT_PUBLIC_EXTENSION_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_EXTENSION_AUTH_BASE_URL=https://linkiving.example.com
NEXT_PUBLIC_EXTENSION_API_TOKEN=
```

- 권장 파일명은 `.env.local`입니다.
- 현재 프로젝트는 이전 호환성을 위해 `.env_local`도 fallback으로 읽습니다.
- `NEXT_PUBLIC_EXTENSION_API_BASE_URL`은 필수입니다.
- 익스텐션은 브라우저에서 백엔드로 직접 호출하므로 절대 URL이어야 합니다.
- 익스텐션은 Linkiving 웹사이트의 `accessToken` 쿠키를 먼저 읽어 로그인 상태를 재사용합니다.
- `NEXT_PUBLIC_EXTENSION_AUTH_BASE_URL`을 설정하면 기본값인 `https://linkiving.com` 대신 해당 사이트의 쿠키도 조회합니다.
- 쿠키 재사용 방식을 쓰려면 Chrome 확장 권한에서 `cookies`와 해당 도메인 host permission이 필요합니다.
- 기본 manifest는 운영 API와 인증 도메인만 host permission으로 허용합니다. 로컬 또는 별도 환경을 사용하려면 해당 origin을 `extension/manifest.json`에 명시적으로 추가해야 합니다.
- `NEXT_PUBLIC_EXTENSION_API_TOKEN`은 쿠키가 없을 때 로컬 개발에서만 사용하는 fallback이며 프로덕션 빌드에서는 허용되지 않습니다.
- 개발용 fallback에는 최소 권한·짧은 만료 토큰만 사용해야 합니다. `NEXT_PUBLIC_*` 값은 빌드 결과물에 포함되므로 서버 전용 비밀값을 넣으면 안 됩니다.
- 백엔드는 `chrome-extension://<extension-id>` 오리진에 대해 CORS 허용이 되어 있어야 합니다.

## 스크립트

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm version:sync
pnpm version:check
pnpm test
pnpm verify:extension
```

`package.json`의 `version`을 릴리스 버전의 기준으로 사용합니다. 버전을 변경한 뒤
`pnpm version:sync`를 실행하면 원본 manifest가 동기화되며, 릴리스에서는 태그와 빌드
산출물의 버전까지 자동으로 검증합니다.

## 구조

- `src/app`: 팝업 UI를 만드는 Next.js App Router 엔트리
- `src/components`: `linkiving`에서 가져온 UI 컴포넌트와 팝업 전용 조합 컴포넌트
- `src/apis`, `src/hooks`, `src/lib`: 익스텐션에서 직접 백엔드 호출하도록 바꾼 클라이언트 로직
- `extension/manifest.json`: Chrome Extension 매니페스트 원본. 빌드 시 `out/`으로 복사됩니다.
- `scripts/copy-extension.mjs`: `next export` 산출물과 `extension/manifest.json`을 합쳐 익스텐션 로드용 `out/` 구조로 정리하는 스크립트

## 확장 권한

- `activeTab`, `scripting`: 사용자가 확장 아이콘을 누른 현재 페이지에 오버레이와 저장 완료 토스트를 주입합니다.
- `tabs`: 활성 탭 변경에 따라 지원하지 않는 페이지용 팝업을 전환하고 최근 웹 탭을 찾습니다.
- `cookies`: Linkiving 웹 로그인 쿠키를 읽어 사용자 인증을 재사용합니다.
- `storage`: 설치별 GA client ID를 로컬에 보관합니다.
- host permission은 Linkiving 운영 웹/API 도메인의 쿠키 조회와 API 요청에만 사용합니다.
- `index.html`만 모든 사이트에서 iframe으로 표시할 수 있도록 web accessible resource로 공개합니다.

## 현재 동작

- 팝업이 열리면 현재 활성 탭 URL을 자동으로 입력합니다.
- URL을 직접 입력해도 되고, `현재 탭 가져오기` 버튼으로 다시 불러올 수 있습니다.
- 단일 링크 저장과 다중 링크 저장이 모두 가능합니다.
