# 헤더 PDF 툴팁 복구 보고서

## 복구한 항목

- `src/content/types.ts`에 `HeaderContent`를 추가하고, 요약 PDF와 전체 PDF의 툴팁을 콘텐츠 모델 필드로 정의했습니다.
- `src/content/default-content.ts`에 원문을 그대로 복구했습니다.
  - 요약 PDF: `전체 프로젝트를 한 장 분량으로 요약한 PDF를 저장합니다`
  - 전체 PDF: `상세 구현과 설계 도면까지 포함한 전체 PDF를 저장합니다`
- `src/App.tsx`의 헤더 두 버튼을 각각 `content.summaryPdfTitle`, `content.fullPdfTitle`에서 `title`로 주입하도록 연결했습니다. 홈·프로젝트 목록·프로젝트 상세 헤더 모두 같은 모델을 사용합니다.
- `src/content/validation.ts`에서 두 툴팁 필드를 필수 비공백 문자열로 검증하도록 추가했습니다.

## 기준 대비 속성 점검

`dev` 기준 커밋 `21c57fa`의 `src/App.tsx`와 현재 파일을 비교했습니다.

- 누락된 사용자 표시 속성은 전체 PDF 버튼의 `title` 1건이었습니다. 원문을 콘텐츠 모델과 마크업에 복구했습니다.
- 요약 PDF 버튼의 기존 `title` 문구는 유지됐지만 하드코딩이었으므로 전체 PDF와 동일하게 콘텐츠 모델에서 오도록 변경했습니다.
- 기준의 `aria-label` 문자열(`홈으로`, `주요 메뉴`, `PDF 저장`, `상세 구현 수록`)은 모두 유지됐습니다.
- 기준의 이미지 `alt=""`와 영상 `iframe` `title`도 모두 유지됐습니다.
- 프로젝트 타일의 `aria-hidden`은 편집 모드에서 콘텐츠를 편집할 수 있도록 조건부로 바뀐 의도적 차이이며, 누락으로 보지 않았습니다.
- 그 밖에 복구할 `title`, `aria-label`, `alt` 등 사용자 표시 속성 문자열은 확인되지 않았습니다.

## 검증 결과

- `npm run build` 통과 (`tsc -b && vite build`)
- `git diff --check` 통과
