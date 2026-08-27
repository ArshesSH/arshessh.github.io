# Kim Saehyeon — Portfolio

게임, XR, 디지털 트윈 분야의 실시간 3D 클라이언트 엔지니어 포트폴리오입니다.

## Local development

```bash
npm install
npm run dev
```

개발 서버에서 `http://localhost:5173/?edit=1`로 열거나 `Ctrl/Cmd+Shift+E`를 누르면 편집 모드가 열립니다. 본문을 클릭해 수정한 뒤 포커스를 잃으면 약 300ms 후 `src/content/content.json`에 자동 저장됩니다. 저장 상태와 실패 사유는 상단 툴바에 표시되며, 실패한 경우 `다시 시도`로 재전송할 수 있습니다.

`content.json`이 사이트 콘텐츠의 유일한 저장소입니다. JSON을 직접 수정해도 되고 편집 모드에서 수정해도 되며, 편집 모드의 저장은 로컬 개발 서버에서만 허용됩니다. 배포본에는 편집 기능과 파일 쓰기 기능이 포함되지 않습니다. 변경사항을 되돌릴 때는 Git을 사용합니다.

## Production build

```bash
npm run build
```

`main` 브랜치에 푸시하면 GitHub Actions가 사이트를 빌드해 GitHub Pages에 배포합니다.
