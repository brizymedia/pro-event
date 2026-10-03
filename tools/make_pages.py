# -*- coding: utf-8 -*-
"""
행사 이야기(stories/) · 지역 페이지(areas/) 만들기 — 사이트 틀(머리글 · 바닥글)은 index.html 에서 빌려 온다.
(바로기획 tools/make_pages.py 를 한 장짜리 사이트에 맞게 옮긴 것)

  python tools/make_pages.py

내용은 아래 STORIES · AREAS 표만 고치면 된다. 사실만 적을 것(홈페이지 포트폴리오 · 원본 사이트 게시물 · 네이버 블로그 · 대표님 확인분).
만든 뒤 sitemap.xml 도 같이 다시 쓴다.
"""
import os, re, html, datetime

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://brizymedia.github.io/pro-event/'
BLOG = 'https://blog.naver.com/pro_event/'
YOUTUBE = 'https://www.youtube.com/watch?v='
TEL, TEL_M = '02-457-8262', '010-3999-8262'
E = html.escape

# ── 행사 이야기 ──────────────────────────────────────────────
# 근거: 1~3 = 홈페이지 포트폴리오(app.js WORKS) · 원본 사이트(pro-event.kr) 포트폴리오 게시판 제목, 4~5 = 네이버 블로그 현장 후기 원문
STORIES = [
    dict(slug='national-assembly-open-day', title='국회 개방행사 2만 명 — 기획 · 대행부터 에어바운스 놀이존까지', cat='대형행사 · 관공서', date='2024 · 2026',
         place='대한민국 국회 (서울 영등포구 여의도)', area='yeongdeungpo',
         lead='국회 개방행사를 프로이벤트가 기획 · 대행했습니다. 참가 규모는 20,000명. 같은 행사의 에어바운스 놀이존 운영도 프로이벤트가 맡았습니다.',
         facts=[('행사', '국회 개방행사'), ('주최', '대한민국 국회'), ('규모', '20,000명'), ('맡은 일', '행사 기획 · 대행, 에어바운스 놀이존 대행')],
         body=['프로이벤트 포트폴리오에는 국회 개방행사가 두 번 기록돼 있습니다. 2024년 「국회 개방행사 기획 및 대행 (20,000명)」, 그리고 2026년 「국회 개방행사 에어바운스 놀이 존 대행 (20,000명)」입니다.',
               '놀이존에는 대형 에어바운스 놀이기구를 세워 운영했습니다. 에어바운스 · 천막 · 의자 · 테이블 같은 행사 물품은 프로이벤트가 직접 대여하고 설치합니다.',
               '절차와 의전이 중요한 관공서 행사, 그리고 수만 명이 오가는 대형 현장은 프로이벤트가 가장 자신 있는 분야입니다.'],
         photos=['w13', 'w11', 'b8'], blog='', video='', quote=['p4', 'h1', 'a3', 'f5']),
    dict(slug='samsung-display-festival', title='삼성 모바일디스플레이 임직원 페스티벌 18,000명', cat='기업행사 · 대형행사', date='2026',
         place='', area='',
         lead='삼성 모바일디스플레이 임직원 18,000명이 함께한 페스티벌을 프로이벤트가 대행했습니다. 프로이벤트가 맡은 기업행사 가운데 가장 큰 규모입니다.',
         facts=[('행사', '삼성 모바일디스플레이 임직원 페스티벌'), ('규모', '18,000명'), ('맡은 일', '행사 대행')],
         body=['송년회 · 신년회 · 창립행사 · 전진대회 · 페스티벌 같은 기업행사는 프로이벤트의 첫 번째 사업 분야입니다. 삼성 모바일디스플레이 임직원 페스티벌은 그중 참여 인원이 18,000명에 이른 현장이었습니다.',
               '프로이벤트는 음향 · 조명 · 무대 · LED 를 외주에 맡기지 않고 자체 장비와 자체 인력으로 세팅합니다. MC · 개그맨 · 가수 · 강사 섭외도 행사 성격과 예산에 맞춰 함께 제안합니다.'],
         photos=['w9', 'b1'], blog='', video='', quote=['p1', 'a3', 'b2', 'b3', 'f2']),
    dict(slug='gwangju-childrens-day', title='광주 어린이날 행사 5,000명 총기획 · 대행', cat='지자체행사 · 대형행사', date='2024',
         place='', area='',
         lead='5,000명이 모인 광주 어린이날 행사를 프로이벤트가 총기획 · 대행했습니다. 현장 영상은 프로이벤트 유튜브 채널에서 보실 수 있습니다.',
         facts=[('행사', '광주 어린이날 행사'), ('규모', '5,000명'), ('맡은 일', '총기획 · 대행')],
         body=['지역축제 · 시 · 군 · 구민의 날 · 테마축제 · 공연행사 같은 지자체행사는 프로이벤트의 주요 사업 분야입니다. 광주 어린이날 행사는 5,000명 규모로 진행됐습니다.',
               '현장 분위기는 아래 「행사 영상 보기」에서 프로이벤트가 직접 올린 영상으로 확인하실 수 있습니다.'],
         photos=['w12', 'b3'], blog='', video='NGP2fyARgCg', quote=['p3', 'a3', 'b1', 'h1']),
    dict(slug='suwon-changyong-sports-day', title='수원 창용초등학교 운동회 — 학년을 묶어 기다리는 시간을 줄였습니다', cat='학교행사', date='2026.09',
         place='수원 창용초등학교 운동장', area='suwon',
         lead='오전 9시부터 12시까지 약 3시간. 학생 수가 많지 않은 학교라 1 · 2학년, 3 · 4학년, 5 · 6학년을 한 그룹씩 묶어 경기를 진행했습니다.',
         facts=[('행사', '초등학교 운동회'), ('장소', '수원 창용초등학교'), ('시간', '오전 9시 ~ 12시 (약 3시간)'), ('진행', '학년 통합 3그룹 · 학생 중심 프로그램')],
         body=['아침부터 학생들과 선생님들이 운동장에 모이고, 학부모님들도 학교를 찾아 아이들을 응원했습니다. 이번에는 따로 학부모 경기를 넣지 않고 학생 중심으로 프로그램을 짰습니다.',
               '한 학년씩 차례로 진행하면 경기하는 학생보다 기다리는 학생이 더 많아집니다. 그래서 두 학년씩 묶어 한 번에 더 많은 학생이 뛰게 했고, 덕분에 학생들이 참여하는 게임 수도 늘릴 수 있었습니다.',
               '운동회는 학교마다 똑같이 하기보다 학생 수 · 운동장 크기 · 학년별 인원을 보고 구성해야 한다는 것을 다시 확인한 현장이었습니다.'],
         photos=['cy1', 'cy2', 'cy3', 'cy4', 'cy5', 'cy6'], blog='224419848372', video='', quote=['p5', 'h3', 'h1', 'f1', 'a2']),
    dict(slug='university-ot-recreation', title='대학교 신입생 OT 레크리에이션 — 조명을 더한 50명의 무대', cat='레크리에이션 · OT', date='2026.03.13',
         place='충남 대천 한화리조트', area='',
         lead='동남보건대학교 뷰티케어학과 신입생 약 50명과 함께한 OT 레크리에이션입니다. 지난해엔 조명 없이 진행했던 행사라, 올해는 무대 조명을 더했습니다.',
         facts=[('행사', '대학교 신입생 OT 레크리에이션'), ('대상', '동남보건대학교 뷰티케어학과 신입생 약 50명'), ('장소', '충남 대천 한화리조트'), ('맡은 일', '전문 진행자 · 음향 · 조명')],
         body=['같은 행사를 지난해에도 맡았는데, 그때는 조명 없이 운영해 장기자랑처럼 집중이 필요한 순서에서 무대가 다소 밋밋했습니다.',
               '그래서 올해는 전문 진행자와 음향에 무대 조명을 더해 세팅했습니다. 진행자의 입담과 음악에 맞춰 바뀌는 조명 덕분에 장기자랑 시간이 작은 콘서트처럼 살아났습니다.',
               '이 현장 뒤로 프로이벤트는 대학교 OT 상담에 조명을 서비스로 넣어 드리기로 했습니다.'],
         photos=['ot1', 'ot2', 'ot3', 'ot4', 'ot5', 'ot6'], blog='224218210536', video='', quote=['p8', 'f6', 'a1', 'b2']),
]

# ── 지역 ────────────────────────────────────────────────────
# 분 · km: 서울 본사(강남구 역삼동 — 좌표는 역삼동 중심)에서 각 구청 · 시청까지 OSRM(막히지 않을 때) 2026-10-03 조회, 5분 단위 반올림
# done 은 기록이 있는 것만: 홈페이지 포트폴리오 · 원본 사이트 영상 · 블로그 · 홈페이지 「TRUSTED BY」 고객 목록
AREAS = [
    dict(slug='gangnam', name='강남구', hall='구청', min=0, km=0, hq=True, done=[], photos=['w16', 'b7', 'w9']),
    dict(slug='seocho', name='서초구', hall='구청', min=5, km=2.6, done=['서초구 — 프로이벤트 주요 고객'], photos=['w15', 'w16', 'b4']),
    dict(slug='yeongdeungpo', name='영등포구', hall='구청', min=15, km=15.4,
         done=['국회 개방행사 기획 및 대행 (20,000명, 2024)', '국회 개방행사 에어바운스 놀이존 대행 (20,000명, 2026)'], photos=['w13', 'w11', 'b8']),
    dict(slug='gangseo', name='강서구', hall='구청', min=25, km=22.2, done=['강서가족지원센터 송년회 (2026)'], photos=['w17', 'b4', 'w15']),
    dict(slug='yangcheon', name='양천구', hall='구청', min=20, km=18.8, done=['양천구 어린이집 한마당 (2014)', '양천구 — 프로이벤트 주요 고객'], photos=['b5', 'w12', 'w18']),
    dict(slug='seongbuk', name='성북구', hall='구청', min=10, km=11.0, done=['성북구 — 프로이벤트 주요 고객'], photos=['b3', 'w4', 'w15']),
    dict(slug='suwon', name='수원', hall='시청', min=30, km=30.6, done=['수원 창용초등학교 운동회 (2026.09)'], photos=['cy1', 'cy3', 'cy4']),
    dict(slug='hwaseong', name='화성', hall='시청', min=45, km=46.3, branch=True, done=[], photos=['b5', 'w10', 'w18']),
    dict(slug='chuncheon', name='춘천', hall='시청', min=80, km=92.3,
         done=['제22회 춘천시 양성평등대회 총기획 (2023)', '춘천시 양성평등행사 송년회 · MC · 음향 · 조명 (2026)'], photos=['w3', 'w15', 'b7']),
]

SERVICES = [('기업행사', '송년회 · 신년회 · 창립행사 · 페스티벌'), ('워크샵 기획 · 대행', '대관 · 프로그램 · 섭외'), ('지자체 · 관공서행사', '지역축제 · 시민의 날 · 의전 · 기념식'),
            ('학교행사', '운동회 · 체육대회 · 학예회 · 축제'), ('기공식 · 준공식', '의전 · 테이프 커팅 · 공연'), ('음향 · 조명 · 무대 · LED', '자체 장비 · 자체 인력으로 세팅'),
            ('MC · 가수 · 강사 섭외', '전문 MC 8인 · 섭외 라인업 60+'), ('에어바운스 · 물놀이', '놀이존 · 워터슬라이드 대여'), ('레크리에이션 · OT', '대학 OT · 수련회 · 워크샵')]


def shell():
    """index.html 의 머리 · 머리글 · 바닥글을 빌린다. 대문 전용 커튼 · 라이트박스는 빼고, 메뉴의 #섹션 링크는 index.html#섹션 으로."""
    s = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
    head_end = s.index('<main id="top">')
    main_end = s.index('</main>') + len('</main>')
    top, bottom = s[:head_end], s[main_end:]
    top = re.sub(r'<div class="curtain"[^>]*>.*?<i class="bar"></i>\s*</div>\n', '', top, count=1, flags=re.S)
    top = re.sub(r'href="#(?!top")([a-z]+)"', r'href="index.html#\1"', top)
    top = top.replace('<a class="logo" href="#top"', '<a class="logo" href="index.html"')
    # 대문에 없는 canonical · og:url 자리
    top = top.replace('<meta property="og:image"', '<link rel="canonical" href="">\n<meta property="og:url" content="">\n<meta property="og:image"', 1)
    bottom = re.sub(r'\n<!-- 라이트박스 -->.*?</div>\n', '\n', bottom, count=1, flags=re.S)
    return top, bottom


def page(path, title, desc, main, img='assets/img/hero_poster.webp', depth=1):
    top, bottom = shell()
    url = BASE + path
    top = re.sub(r'<title>.*?</title>', '<title>' + E(title) + '</title>', top, count=1)
    for prop in ('name="description"', 'property="og:description"'):
        top = re.sub(r'(<meta ' + prop + r' content=")[^"]*', lambda m: m.group(1) + E(desc), top, count=1)
    top = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + E(title), top, count=1)
    top = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + url, top, count=1)
    top = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, top, count=1)
    top = re.sub(r'(<meta property="og:image" content=")[^"]*', lambda m: m.group(1) + BASE + img, top, count=1)
    out = top + '<main id="top">\n' + main + '\n</main>' + bottom
    pre = '../' * depth
    out = re.sub(r'(href|src|poster)="(?!https?:|mailto:|tel:|sms:|data:|#|/|\.\./|@@)([^"]*)"', lambda m: m.group(1) + '="' + pre + m.group(2) + '"', out)
    out = re.sub(r"url\((?!https?:|data:)(assets/[^)]+)\)", lambda m: 'url(' + pre + m.group(1) + ')', out)
    out = out.replace('@@', pre)
    full = os.path.join(SITE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8', newline='\n').write(out)
    return url


def pic(f):
    if f.startswith(('cy', 'ot')):
        return 'assets/img/stories/' + f + '.webp'
    return 'assets/img/' + ('works/' if f[0] == 'w' else 'biz/') + f + '.webp'


ARR = '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'


def cta(title='행사 날짜가 잡히셨나요?', sub='행사 목적 · 인원 · 날짜만 알려 주시면 됩니다. 담당자가 확인 후 1영업일 안에 1차 제안과 견적으로 답합니다.', bg='w14'):
    return ('<section class="callband" style="background-image:url(' + pic(bg) + ')"><div class="wrap"><div class="reveal"><p class="eyebrow">Contact · Get a Quote</p><h2 style="margin-top:16px">' + title +
            '<br><em>프로이벤트</em>가 기획부터 운영까지.</h2><p>' + sub + '</p></div><div class="reveal"><a class="num" href="tel:' + TEL + '">' + TEL + '<small>서울본사 · 평일 09:00 ~ 18:00</small></a>'
            '<a class="num" href="tel:' + TEL_M + '" style="margin-top:14px">' + TEL_M + '<small>대표 직통 · 화성지사</small></a>'
            '<div class="btns"><a class="btn btn-pri" href="quote.html">자동 견적서' + ARR + '</a><a class="btn btn-ghost" href="index.html#contact">견적 문의 폼</a></div></div></div></section>')


def card(o, cls='scard', extra=False):
    meta = ' · '.join(x for x in (o['cat'], o['date'], o['place'] if extra else '') if x)
    return ('<a class="' + cls + '" href="@@stories/' + o['slug'] + '.html"><img src="' + pic(o['photos'][0]) + '" alt="" loading="lazy" width="800" height="500"><span><small>' + E(meta) + '</small>' + E(o['title']) +
            (('<em>' + E(o['lead'][:60]) + '…</em>') if extra else '') + '</span></a>')


def story_pages():
    urls = []
    for st in STORIES:
        facts = ''.join('<dt>' + E(a) + '</dt><dd>' + E(b) + '</dd>' for a, b in st['facts'])
        body = ''.join('<p>' + E(p) + '</p>' for p in st['body'])
        photos = ''.join('<a href="' + pic(f) + '" target="_blank" rel="noopener"><img src="' + pic(f) + '" alt="' + E(st['title']) + ' 현장" loading="lazy" width="800" height="600"></a>' for f in st['photos'])
        area = next((a for a in AREAS if a['slug'] == st['area']), None)
        others = [o for o in STORIES if o['slug'] != st['slug']][:3]
        more = ''.join(card(o) for o in others)
        btns = ''
        if st['blog']: btns += '<a class="btn btn-ghost" href="' + BLOG + st['blog'] + '" target="_blank" rel="noopener">블로그 원문 보기 ↗</a>'
        if st['video']: btns += '<a class="btn btn-ghost" href="' + YOUTUBE + st['video'] + '" target="_blank" rel="noopener">행사 영상 보기 ↗</a>'
        btns += '<a class="btn btn-ghost" href="index.html#works">포트폴리오 더 보기</a>'
        alink = ('<a class="alink" href="@@areas/' + area['slug'] + '.html">' + E(area['name']) + ' 행사 안내 →</a>') if area else '<a class="alink" href="@@areas/index.html">운영 지역 보기 →</a>'
        main = ('<section class="phead" style="background-image:url(' + pic(st['photos'][0]) + ')"><div class="wrap"><p class="crumb"><a href="index.html">홈</a> · <a href="@@stories/index.html">행사 이야기</a> · <b>' + E(st['cat']) + '</b></p>'
                '<h1>' + E(st['title']) + '</h1><p>' + E(st['lead']) + '</p></div></section>'
                '<section class="sec tight"><div class="wrap story">'
                '<aside class="reveal"><p class="eyebrow">Event File</p><dl>' + facts + '<dt>날짜</dt><dd>' + E(st['date']) + '</dd></dl>'
                '<a class="btn btn-pri" href="quote.html">비슷한 행사 견적 받기</a>' + alink + '</aside>'
                '<div class="reveal sbody">' + body + '<div class="sgrid' + (' two' if len(st['photos']) < 3 else '') + '">' + photos + '</div><div class="sbtns">' + btns + '</div></div>'
                '</div></section>'
                '<section class="sec tight gray"><div class="wrap"><div class="head reveal"><div><p class="eyebrow">More Stories</p><h2>다른 <em>현장 이야기</em></h2></div><a class="more" href="@@stories/index.html">전체 보기 →</a></div><div class="scards">' + more + '</div></div></section>'
                + cta())
        urls.append(page('stories/' + st['slug'] + '.html', st['title'] + ' | 프로이벤트 행사 이야기', st['lead'][:120], main, img=pic(st['photos'][0])))
    cards = ''.join(card(o, 'scard reveal', True) for o in STORIES)
    main = ('<section class="phead" style="background-image:url(' + pic('w13') + ')"><div class="wrap"><p class="crumb"><a href="index.html">홈</a> · <b>행사 이야기</b></p><h1>행사 이야기</h1><p>프로이벤트가 맡은 행사를 한 편씩 기록했습니다. 어떤 행사였는지, 현장에서 무엇을 준비했는지 사진과 함께 보실 수 있습니다.</p></div></section>'
            '<section class="sec tight"><div class="wrap"><div class="scards big">' + cards + '</div><p class="snote">더 많은 현장 기록은 <a href="' + BLOG + '" target="_blank" rel="noopener">프로이벤트 네이버 블로그</a>와 <a href="index.html#works">포트폴리오</a>에 있습니다.</p></div></section>' + cta())
    urls.insert(0, page('stories/index.html', '행사 이야기 | 프로이벤트 — 국회 개방행사 · 기업 페스티벌 · 어린이날 · 운동회 · OT 현장 기록', '프로이벤트가 맡은 행사를 한 편씩 기록했습니다. 국회 개방행사 20,000명, 삼성 임직원 페스티벌 18,000명, 광주 어린이날 5,000명, 초등학교 운동회, 대학 OT.', main, img=pic('w13')))
    return urls


def area_pages():
    urls = []
    for a in AREAS:
        n = a['name']
        short = n[:-1] if n.endswith('구') else n
        if a.get('hq'):
            how = '<b>프로이벤트 서울본사</b>가 있는 곳입니다. 서울시 강남구 역삼동 778-3 — 서울 어디든 본사에서 바로 출발합니다.'
        else:
            how = '서울 본사(강남구 역삼동)에서 ' + short + ' ' + a['hall'] + '까지 차로 약 <b>' + str(a['min']) + '분 · ' + ('%g' % a['km']) + 'km</b>(막히지 않을 때 기준)입니다.'
            if a.get('branch'):
                how += ' 화성에는 <b>프로이벤트 화성지사</b>(경기도 화성시 효행구 정남면 문학리 85-5)가 있습니다.'
        if a['done']:
            done = '<ul class="alist">' + ''.join('<li>' + E(x) + '</li>' for x in a['done']) + '</ul>'
        else:
            done = '<p class="muted">아직 이 페이지에 적을 만큼 정리된 기록이 없습니다. ' + short + ' 행사도 같은 팀이 똑같이 준비합니다.</p>'
        stories = [s for s in STORIES if s['area'] == a['slug']]
        sl = ''.join(card(s) for s in stories)
        svc = ''.join('<li><b>' + E(x) + '</b><span>' + E(y) + '</span></li>' for x, y in SERVICES)
        photos = ''.join('<img src="' + pic(f) + '" alt="프로이벤트 행사 현장" loading="lazy" width="800" height="600">' for f in a['photos'])
        others = ' · '.join('<a href="@@areas/' + o['slug'] + '.html">' + o['name'] + '</a>' for o in AREAS if o['slug'] != a['slug'])
        title = short + ' 행사대행 · 기업행사 · 체육대회 · 학교행사 | 프로이벤트'
        desc = short + ' 기업행사 · 워크샵 · 지자체 · 관공서 · 학교행사 · 기공식, 음향 · 조명 · 무대 · LED, MC · 가수 · 강사 섭외까지. ' + ('프로이벤트 서울본사 — 2006년부터.' if a.get('hq') else '서울 본사에서 차로 약 ' + str(a['min']) + '분. 2006년부터 행사를 기획 · 연출해 온 프로이벤트.')
        main = ('<section class="phead" style="background-image:url(' + pic(a['photos'][0]) + ')"><div class="wrap"><p class="crumb"><a href="index.html">홈</a> · <a href="@@areas/index.html">운영 지역</a> · <b>' + n + '</b></p>'
                '<h1>' + short + ' 행사, 프로이벤트가 갑니다</h1><p>기업행사 · 워크샵 · 지자체 · 관공서 · 학교행사 · 기공식. 2006년부터 행사를 기획하고 연출해 온 프로이벤트가 ' + short + ' 현장도 기획부터 운영 · 철수까지 한 팀으로 맡습니다.</p></div></section>'
                '<section class="sec tight"><div class="wrap area3"><div class="reveal"><p class="eyebrow">How Far</p><h2 class="h2s">' + n + (' — 서울본사' if a.get('hq') else '까지') + '</h2><p>' + how + '</p>'
                '<h3 class="h3s">' + n + '에서 한 행사</h3>' + done + ('<div class="scards sm">' + sl + '</div>' if sl else '') + '</div>'
                '<div class="reveal"><div class="apics">' + photos + '</div></div></div></section>'
                '<section class="sec tight gray"><div class="wrap"><div class="head reveal"><div><p class="eyebrow">What We Do</p><h2>' + short + '에서도 <em>이런 행사</em>를 맡습니다</h2></div></div><ul class="asvc">' + svc + '</ul>'
                '<p class="snote">다른 지역: ' + others + ' · <a href="@@areas/index.html">운영 지역 전체</a></p></div></section>' + cta(short + ' 행사 날짜가 잡히셨나요?'))
        urls.append(page('areas/' + a['slug'] + '.html', title, desc, main, img=pic(a['photos'][0])))
    rows = ''.join('<a class="arow" href="@@areas/' + a['slug'] + '.html"><b>' + a['name'] + '</b><span>' + ('서울본사' if a.get('hq') else '차로 약 ' + str(a['min']) + '분 · ' + ('%g' % a['km']) + 'km') + '</span><em>' + (E(a['done'][0]) if a['done'] else ('서울본사 · 역삼동 778-3' if a.get('hq') else '화성지사 · 정남면 문학리' if a.get('branch') else '출장 진행')) + '</em></a>' for a in AREAS)
    main = ('<section class="phead" style="background-image:url(' + pic('b7') + ')"><div class="wrap"><p class="crumb"><a href="index.html">홈</a> · <b>운영 지역</b></p><h1>운영 지역</h1><p>서울 강남 본사와 화성지사에서 서울 · 경기 어디든 달려갑니다. 지역을 누르면 그 지역에서 한 행사와 이동 시간을 보실 수 있습니다.</p></div></section>'
            '<section class="sec tight"><div class="wrap"><div class="arows reveal">' + rows + '</div><p class="anote">이동 시간은 서울 본사(강남구 역삼동)에서 각 구청 · 시청까지 차로 걸리는 시간(막히지 않을 때 기준)입니다. 출퇴근 시간에는 더 걸릴 수 있고, 표에 없는 지역도 전화 주시면 상담해 드립니다.</p></div></section>' + cta())
    urls.insert(0, page('areas/index.html', '운영 지역 | 프로이벤트 — 강남 · 서초 · 영등포 · 강서 · 양천 · 성북 · 수원 · 화성 · 춘천 행사대행', '서울 강남 본사와 화성지사에서 서울 · 경기 어디든. 지역별 이동 시간과 그 지역에서 한 행사를 보실 수 있습니다.', main, img=pic('b7')))
    return urls


def sitemap(extra):
    today = datetime.date.today().isoformat()
    urls = [BASE, BASE + 'quote.html'] + extra
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>' + u + '</loc><lastmod>' + today + '</lastmod></url>\n' for u in urls) + '</urlset>\n'
    open(os.path.join(SITE, 'sitemap.xml'), 'w', encoding='utf-8', newline='\n').write(xml)


if __name__ == '__main__':
    a = story_pages(); b = area_pages(); sitemap(a + b)
    print('행사 이야기', len(a), '· 지역', len(b), '· sitemap.xml 갱신')
