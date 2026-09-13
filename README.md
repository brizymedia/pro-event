# 프로이벤트 홈페이지 리뉴얼 시안

www.pro-event.kr 을 다시 만든 한 장짜리 사이트입니다. 서버 없이 정적 파일만으로 돌아갑니다.

```
index.html            페이지 전체 (히어로 → 고객 띠 → 소개 → 사업분야 → 포트폴리오 → 프로세스 → 시스템 → 영상 → 섭외 → 견적문의 → 푸터)
assets/style.css      스타일
assets/app.js         스크립트 (커튼·커서·카운터·사업분야 무대·포트폴리오 필터/라이트박스·유튜브·문의 폼)
assets/video/hero.mp4    히어로 몽타주 (1280×720, 26.5초, 8MB) — 원본 사이트 영상 3편에서 11컷
assets/video/hero_sm.mp4 폰용 (854×480, 4.8MB)
assets/img/works/     포트폴리오 사진 19장 (원본 사이트 게시물)
assets/img/biz/       사업분야 무대 사진 (원본 테마 이미지)
assets/img/sys/       음향·조명·무대 사진 (원본 행사시스템 게시판)
_raw/                 원본 영상·사진·검수용 파일 (배포하지 않음, .gitignore)
```

## 보기

```
npx -y http-server C:/Users/gilau/Documents/pro-event -p 8177 -c-1
```
→ http://localhost:8177  (file:// 로 열면 영상·폰트가 안 나옵니다)

## 납품 전에 바꿀 것

1. `index.html` 의 `<meta name="robots" content="noindex,nofollow">` 지우기 (시안이라 검색 차단 중).
3. `assets/app.js` 맨 위 `FORM_ENDPOINT` 에 문의 접수 서버 주소 넣기 (Apps Script 또는 FormSubmit).
   비어 있으면 폰에서는 문자 앱이 열리고, PC 에서는 내용을 복사해 주고 전화번호를 안내합니다.
4. `og:image` 를 실제 주소(https://…/assets/img/hero_poster.webp)로.
5. 포트폴리오 글 순서·제목은 `app.js` 의 `WORKS` 배열에서 고칩니다. 사진 번호(w1~w19)와 글 매핑도 거기가 정본.

## 히어로 영상 다시 만들기

`_raw/video/slide01~03.mp4` 가 원본입니다. 컷 목록(파일 · 시작초 · 길이)은 이 순서로 잘라 0.5초 크로스페이드로 이었습니다.

```
slide02 32.5 3.0 (위쪽 정렬 크롭으로 자막 제거)  slide03 34.0 3.0   slide03 58.0 3.0
slide01 85.5 2.5   slide01 79.0 3.0   slide03 55.0 3.0   slide03 64.0 2.5
slide03 82.0 3.0   slide01 126.5 2.5   slide03 40.0 3.0   slide03 43.0 3.0
```
ffmpeg 를 반복문 안에서 돌릴 땐 꼭 `-nostdin` 을 붙일 것 (표준입력을 먹어 컷이 빠집니다).
