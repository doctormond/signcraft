# SignCraft GitHub Pages 업로드 가이드

## 1. GitHub 저장소 구조
이 ZIP의 압축을 풀면 아래 구조 그대로 GitHub 저장소 루트에 업로드하세요.

```text
.github/workflows/deploy.yml
signcraft/package.json
signcraft/package-lock.json
signcraft/src/
signcraft/public/
signcraft/vite.config.js
```

중요: `.github` 폴더는 반드시 저장소 최상위(root)에 있어야 합니다.
`signcraft/.github/workflows/deploy.yml` 위치에 있으면 GitHub Actions가 인식하지 못할 수 있습니다.

## 2. GitHub Actions 오류 수정 내용
기존 오류 원인:

```text
Dependencies lock file is not found
```

프로젝트 파일이 `signcraft/` 폴더 안에 있는데 workflow가 저장소 root에서 `package-lock.json`을 찾으려고 해서 발생했습니다.

수정된 `deploy.yml`은 다음을 반영했습니다.

- `working-directory: signcraft`
- `cache-dependency-path: signcraft/package-lock.json`
- `npm install` 대신 `npm ci`
- artifact 업로드 경로 `signcraft/dist`

## 3. GitHub Pages 설정
GitHub 저장소에서 다음을 확인하세요.

Settings → Pages → Build and deployment → Source: **GitHub Actions**

## 4. 저장소 이름 확인
현재 `signcraft/vite.config.js`는 아래처럼 설정되어 있습니다.

```js
base: '/signcraft/'
```

GitHub 저장소 이름이 `signcraft`이면 그대로 사용하세요.
저장소 이름이 다르면 `/저장소명/`으로 수정해야 합니다.

예: 저장소가 `signcraft-mvp`이면

```js
base: '/signcraft-mvp/'
```

그리고 `src/components/CmsApp.jsx`의 `SITE_URL`도 실제 GitHub Pages 주소에 맞춰 수정해야 합니다.
