# CODEX 작업 보고서

## 구현 내용

- 현재 `src/App.tsx`의 최신 콘텐츠를 `src/content/default-content.ts`로 분리했습니다. 13개 프로젝트의 요약, 케이스 스터디, 기술 스택, 링크, 이미지, YouTube, 상세 구현의 다이어그램·미디어·의사코드를 포함합니다.
- `src/content/types.ts`에 프로필, 경력, 학력, capabilities, personal lab, 프로젝트, 인쇄용 콘텐츠를 타입으로 정의했습니다.
- `src/content/validation.ts`에서 JSON 구조, 안정적인 id, URL, 이메일, 미디어 경로, 다이어그램 구조를 검증합니다.
- `src/content/review-storage.ts`에서 브라우저 `localStorage` 저장·복원과 JSON 원본/래퍼 형식 불러오기를 지원합니다.
- 홈, 프로젝트 아카이브, 프로젝트 상세, 다이어그램, PDF 인쇄 화면을 콘텐츠 상태에 연결했습니다.
- 편집 모드에서는 본문, 프로젝트 필드, 케이스 스터디, 스택, 미디어 캡션/경로, 상세 구현, 다이어그램 텍스트와 의사코드를 인라인 편집할 수 있습니다.
- 편집 UI 스타일은 기존 `--elev-*`, `--paper-*`, `--fs-*` 토큰을 사용해 최소한으로 추가했습니다. 편집 모드가 꺼져 있으면 툴바와 편집 표시가 나타나지 않습니다.

## 편집 모드 사용법

1. 사이트 URL 뒤에 `?edit=1`을 붙여 접속합니다.
2. `CONTENT EDITOR` 툴바가 나타나면 원하는 본문을 클릭해 수정합니다.
3. `저장`을 누르면 현재 브라우저의 `localStorage`에 저장되고, 다음 방문 시 복원됩니다.
4. `JSON 내보내기`로 소스 반영용 JSON을 내려받고, `JSON 불러오기`로 검증된 콘텐츠를 다시 적용할 수 있습니다.
5. `기본값 복원`은 저장된 초안과 현재 편집 상태를 최신 기본 콘텐츠로 되돌립니다.
6. `Ctrl/Cmd + Shift + E`로 편집 모드를 켜고 끌 수도 있습니다.

JSON은 `version: 2`, `updatedAt`, `content`를 가진 래퍼 형식으로 내보냅니다. 편집 모드는 인증 기능이 아니므로 배포 환경에서 운영자 전용으로 사용할 경우 별도 접근 제어가 필요합니다.

## 검증 결과

- `npm run build` 통과
  - `tsc -b`
  - `vite build`
- 기본 콘텐츠 검증 통과: 13개 프로젝트
- 기본 콘텐츠 JSON 왕복 파싱 검증 통과
- `git diff --check` 통과
- 로컬 Vite 개발 서버가 HTML을 정상적으로 제공하는 것을 확인했습니다.

브라우저 GUI 조작 검증은 이 실행 환경의 `orca-ide` AppImage가 FUSE 장치 부재로 실행되지 않아 완료하지 못했습니다. 코드·타입·콘텐츠 검증에는 영향이 없습니다.

## 커밋

- `740eacb` Extract portfolio content model and draft storage
- `dfef418` Connect portfolio pages to editable content

기존에 있던 미추적 `CODEX_TASK.md`와 `codex-run.log`는 변경하거나 커밋하지 않았습니다.
