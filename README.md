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
2. `assets/app.js` 맨 위 `FORM_ENDPOINT` 에 문의 접수 서버 주소 넣기 (Apps Script 또는 FormSubmit).
   비어 있으면 폰에서는 문자 앱이 열리고, PC 에서는 내용을 복사해 주고 전화번호를 안내합니다.
3. `og:image` 를 실제 주소(https://…/assets/img/hero_poster.webp)로.
4. 포트폴리오 글 순서·제목은 `app.js` 의 `WORKS` 배열에서 고칩니다. 사진 번호(w1~w19)와 글 매핑도 거기가 정본.

## 히어로 영상 (2026-09-13 2차, 1920×1080)

30초, 11컷, 0.5초 크로스페이드. 화면 폭에 따라 `hero.mp4`(1080p) · `hero_md.mp4`(720p) · `hero_sm.mp4`(480p)를 app.js 가 고른다.

| 순서 | 출처 | 내용 |
|---|---|---|
| 1 | 원본 slide02 32.5s (1080p, 위쪽 정렬 크롭) | 항공샷 |
| 2 | AI(Kling 2.5 turbo, 사진 w14) | 워터밤 야간 관중 |
| 3 | 원본 slide03 34s → Real-ESRGAN 2배 | 광장 와이드 |
| 4 | AI(사진 w9) | 삼성 페스티벌 |
| 5 | 원본 slide01 85.5s (1080p) | 레드카펫 통로 |
| 6 | 원본 slide01 79s (1080p) | 테이프 커팅 |
| 7 | AI(사진 w16) | KAID 송년회 무대 |
| 8 | 원본 slide03 58s → 2배 | 손 든 관중 |
| 9 | AI(사진 w12) | 우산 거리 |
| 10 | 원본 slide03 43s → 2배 | 춤추는 관중 |
| 11 | AI(사진 w18) | 체육대회 개회식 |

- 원본 slide03 은 864×486 이라 `_raw/tools/realesrgan`(Real-ESRGAN ncnn, animevideov3 x2)로 2배 키웠다. 프레임 추출 → 업스케일 → 재인코딩. 이 PC GPU 로 513프레임에 6분.
- AI 클립은 Pollo 의 Kling 2.5 turbo image-to-video(720p, 5초, 16크레딧/컷)로 만들고, 사진에 박힌 워터마크가 안 보이게 위쪽 정렬로 크롭했다. 원본 mp4 는 `_raw/ai/a1~a5.mp4`.
- 마스터 `_raw/master_1080.mp4`(CRF 18). 배포본은 2-pass 로 3.3M/1.8M/0.85Mbps.
- ffmpeg 를 반복문 안에서 돌릴 땐 꼭 `-nostdin`.
