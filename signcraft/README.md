# 📺 SignCraft — 디지털 사이니지 CMS

디지털 사이니지 콘텐츠 제작 + QR 프로모션 관리 플랫폼 MVP

---

## 🚀 배포 방법 (코딩 몰라도 OK — 10분이면 완료)

### 1단계: GitHub에 올리기

1. https://github.com 에서 회원가입/로그인
2. 오른쪽 위 **[+ New repository]** 클릭
3. Repository name: `signcraft` 입력 → **[Create repository]**
4. 생성된 페이지에서 **"uploading an existing file"** 클릭
5. 이 폴더 안의 **모든 파일을 드래그해서 업로드**
6. **[Commit changes]** 클릭

### 2단계: Vercel에서 배포하기

1. https://vercel.com 에서 회원가입 (GitHub 계정으로 로그인 권장)
2. 대시보드에서 **[Add New → Project]** 클릭
3. GitHub에서 방금 만든 `signcraft` 저장소 선택 → **[Import]**
4. 설정 화면에서 아무것도 건드리지 말고 **[Deploy]** 클릭
5. 🎉 1-2분 후 `signcraft-xxx.vercel.app` URL이 생성됩니다!

---

## 📱 앱 기능

### CMS 에디터
- 텍스트·이미지·이모지 드래그로 배치
- 간판 사이즈 프리셋 (Full HD 가로/세로, 4:3 등)
- 배경색 커스터마이징
- 레이어 순서 조정

### 📺 디스플레이 기기 연결 QR
- 태블릿·TV·모니터에서 스캔 → 콘텐츠 전체화면 표시
- 연결 시뮬레이션 미리보기

### 📱 프로모션 QR
- 행인이 스캔 → 쿠폰·이벤트 모바일 페이지
- 쿠폰 코드 자동 생성
- 6가지 테마 (골든, 네이비, 에메랄드, 로즈, 화이트, 퍼플)
- 고객 화면 시뮬레이션

---

## 🛣 로드맵

| 단계 | 기능 |
|------|------|
| 현재 (MVP) | 콘텐츠 제작, QR 생성, 로컬 저장 |
| v0.2 | 실제 QR URL 연결 (Firebase), 쿠폰 통계 |
| v0.3 | 블루투스·LAN 디바이스 자동 연결 |
| v1.0 | 다중 매장 관리, 실시간 콘텐츠 푸시, 앱스토어 출시 |

---

## 🛠 개발자용 로컬 실행

```bash
npm install
npm run dev
```
