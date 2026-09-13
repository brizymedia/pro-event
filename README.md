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
4. 사업분야 사진(`assets/img/biz/b1~b8`)은 전부 프로이벤트 원본: b1 삼성 페스티벌(w9) · b2 소방학교(w10) · b3 광주 어린이날(w12) · b4 강서 간담회(w17) · b5 학교행사 게시판 s3(운동장 단체) · b6 slide01 80.5s 프레임 · b7 워터밤 야간 무대(w14: 트러스·LED·조명·음향) · b8 국회 에어바운스 와이드(assembly/n06). AI 이미지 금지. 국회 사진은 게시물 원본 `_raw/assembly/`(n02 와이드 = w13, n08 분수 = w11).
5. 포트폴리오 글 순서·제목은 `app.js` 의 `WORKS` 배열에서 고칩니다. 사진 번호(w1~w19)와 글 매핑도 거기가 정본.

## 히어로 영상 (2026-09-13 4차, 한글 정확·드론 위주, 1920×1080)

27초, 10컷, 0.5초 크로스페이드. **AI 영상은 한글·간판을 뭉갠다** → 글자가 있는 장면은 원본 사진을 ffmpeg zoompan 으로 천천히 줌하는 실사 컷으로 만들고, AI 드론 컷은 간판·무대 화면이 없는 장면으로만 생성했다.

| 순서 | 출처 | 내용 |
|---|---|---|
| 1 | 원본 slide02 0~2s | 드론 오프닝 |
| 2 | AI 텍스트→영상(Wan 2.6 1080p) | 강변 축제 드론·불꽃 (글자 없음) |
| 3 | 사진 w14 줌 | 워터밤 야간 |
| 4 | 원본 slide02 32.5s | 드론 수영장 |
| 5 | AI 사진→영상(Wan 2.6 flash, w11) 2.6~5s | 국회 에어바운스 와이드 |
| 6 | 원본 slide01 85.5s | 레드카펫 통로 |
| 7 | AI 텍스트→영상(Wan 2.6) | 야간 콘서트 드론 (글자 없음) |
| 8 | 사진 w18 줌 | 「2025 제5회 순천시 읍면동 체육대회」 현수막 — 글자 정확 |
| 9 | 사진 w17 줌 | 「2025 이용자간담회」 홀 — 글자 정확 |
| 10 | 원본 slide01 79s | 테이프 커팅 |

- 사진 줌 컷 만들기: `ffmpeg -loop 1 -i 사진.jpg -frames:v 88 -vf "scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,zoompan=z='min(zoom+0.0018,1.18)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=88:s=1920x1080:fps=25" -r 25 …`
- 글자가 뭉개져 버린 AI 컷(`_raw/ai/b2 b3 b4 d1 d3`)은 안 쓴다. 워터마크(CREATIVE PLAN PROEVENT)는 프로이벤트 것이라 그대로.
- 화면 폭×배율에 따라 `hero.mp4`(1080p) · `hero_md.mp4`(720p) · `hero_sm.mp4`(480p)를 app.js 가 고른다. 마스터 `_raw/master_1080.mp4`.
- ffmpeg 를 반복문 안에서 돌릴 땐 꼭 `-nostdin`.
