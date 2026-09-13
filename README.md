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

## 히어로 영상 (2026-09-13 3차, 드론·배경 위주, 1920×1080)

27초, 10컷, 0.5초 크로스페이드. 인물 클로즈업은 뺐다. 화면 폭×배율에 따라 `hero.mp4`(1080p 11MB) · `hero_md.mp4`(720p 6MB) · `hero_sm.mp4`(480p 2.8MB)를 app.js 가 고른다.

| 순서 | 출처 | 내용 |
|---|---|---|
| 1 | 원본 slide02 0~2s (1080p) | 드론 오프닝 |
| 2 | AI 텍스트→영상(Wan 2.6, 1080p, 40크레딧) | 골든아워 축제장 드론 |
| 3 | AI 사진→영상(Wan 2.6 flash 1080p, 20크레딧, 사진 w14) | 워터밤 와이드 |
| 4 | 원본 slide02 32.5s (1080p, 위쪽 크롭) | 드론 수영장 |
| 5 | AI 사진→영상(사진 w11) 2.6~5s | 국회 에어바운스 와이드 |
| 6 | 원본 slide01 85.5s | 레드카펫 통로 |
| 7 | AI 텍스트→영상(Wan 2.6, 40크레딧) | 야간 콘서트 드론·불꽃 |
| 8 | AI 사진→영상(사진 w18) | 체육대회 개회식 |
| 9 | AI 사진→영상(사진 w17) | 간담회 홀 |
| 10 | 원본 slide01 79s | 테이프 커팅 |

- 사진 워터마크(CREATIVE PLAN PROEVENT)는 프로이벤트 것이라 그대로 둔다(형님 지시).
- 저해상도 원본(slide03) 업스케일 컷은 흐려서 3차에서 전부 뺐다. 업스케일은 히어로에만 쓰고 다른 영상은 손대지 않는다.
- AI 원본 mp4 는 `_raw/ai/`(a1~5 2차 Kling, b1~4·d1~2 3차 Wan). 마스터 `_raw/master_1080.mp4`, 배포본은 2-pass 3.3M/1.8M/0.85Mbps.
- ffmpeg 를 반복문 안에서 돌릴 땐 꼭 `-nostdin`.
