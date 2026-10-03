/* PRO EVENT — 공통 스크립트 (외부 라이브러리 없음)
   대문(index.html)과 생성 페이지(stories/ · areas/)가 같이 쓴다. 대문에만 있는 부분은 요소가 있을 때만 동작. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- 문의 폼 전송처 ----------
     공용 문의 서버(큰길브리지와 함께 쓰는 앱스 스크립트) → 대표님 메일 + 큰길브리지 메일.
     서버가 「ok」라고 답하지 않으면 휴대폰은 문자 앱(내용 채워짐), PC 는 내용을 복사해 준 뒤 전화 안내. */
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwvQ4UJRZklRX7bZB6C0s1yZgSvBAMCVccT580L_1BtiVDyh0DIxShCAvN9McZIB0b7FA/exec';
  var SMS_TO = '010-3999-8262';
  var COMPANY = '프로이벤트';

  /* ---------- 커튼 ---------- */
  var curtain = $('#curtain');
  function openCurtain() { if (curtain) curtain.classList.add('done'); }
  window.addEventListener('load', function () { setTimeout(openCurtain, 700); });
  setTimeout(openCurtain, 1900); // 로드가 늦어도 열어 준다

  /* ---------- 커서 빛 ---------- */
  var cursor = $('#cursor');
  if (fine && !reduce) {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy, moving = false;
    document.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; if (!moving) { moving = true; requestAnimationFrame(tick); } });
    function tick() { cx += (tx - cx) * .12; cy += (ty - cy) * .12; cursor.style.transform = 'translate(' + (cx - 260) + 'px,' + (cy - 260) + 'px)'; if (Math.abs(tx - cx) > .5 || Math.abs(ty - cy) > .5) requestAnimationFrame(tick); else moving = false; }
    cursor.style.transform = 'translate(' + (cx - 260) + 'px,' + (cy - 260) + 'px)';
  }

  /* ---------- 스크롤 진행 · 메뉴 상태 · 맨 위로 ---------- */
  var nav = $('#nav'), progress = $('#progress'), totop = $('#totop');
  var sections = $$('main section[id]');
  var menuLinks = $$('.menu a');
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (nav) nav.classList.toggle('on', y > 40);
    if (totop) totop.classList.toggle('on', y > 900);
    var cur = '';
    sections.forEach(function (s) { if (y + window.innerHeight * .4 >= s.offsetTop) cur = s.id; });
    menuLinks.forEach(function (a) { a.classList.toggle('act', a.getAttribute('href') === '#' + cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- 모바일 메뉴 ---------- */
  var burger = $('#burger'), sheet = $('#sheet');
  if (burger && sheet) burger.addEventListener('click', function () {
    var on = sheet.classList.toggle('on'); burger.classList.toggle('x', on); burger.setAttribute('aria-expanded', on);
    document.body.style.overflow = on ? 'hidden' : '';
  });
  if (sheet) $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { sheet.classList.remove('on'); burger.classList.remove('x'); document.body.style.overflow = ''; }); });

  /* ---------- 히어로 영상 · 시차 ---------- */
  var video = $('#heroVideo'), sound = $('#sound'), media = $('#media');
  if (video && sound && media) (function () {
  video.addEventListener('playing', function () { sound.classList.add('playing'); });
  video.addEventListener('pause', function () { sound.classList.remove('playing'); });
  sound.addEventListener('click', function () { if (video.paused) video.play(); else video.pause(); });
  var vw = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  video.src = vw < 900 ? video.getAttribute("data-src-sm") : vw < 1300 ? video.getAttribute("data-src-md") : video.getAttribute("data-src");
  video.muted = true; video.setAttribute("muted", "");
  function tryPlay() { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
  tryPlay(); video.addEventListener("canplay", tryPlay, { once: true });
  // 브라우저가 이유 없이 멈추면 몇 번만 다시 살린다 (사용자가 멈춘 건 그대로)
  var retry = 0;
  video.addEventListener("pause", function () { if (video.dataset.userPaused || video.ended || document.hidden || retry > 8) return; retry++; setTimeout(tryPlay, 400); });
  document.addEventListener("pointerdown", function () { if (video.paused) tryPlay(); }, { once: true });
  // 화면에 다시 들어오면 재생 보장 (밖에서는 브라우저가 알아서 쉼)
  new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && video.paused && !video.dataset.userPaused) tryPlay(); }); }, { threshold: .05 }).observe(video);
  sound.addEventListener("click", function () { video.dataset.userPaused = video.paused ? "" : "1"; });
  if (!reduce) {
    var hero = $('.hero');
    window.addEventListener('scroll', function () {
      var y = window.scrollY; if (y > window.innerHeight * 1.2) return;
      media.style.transform = 'translateY(' + (y * .25) + 'px)';
      hero.querySelector('.inner').style.opacity = Math.max(0, 1 - y / (window.innerHeight * .9));
    }, { passive: true });
    if (fine) {
      var h1 = $('#h1');
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect(), dx = (e.clientX - r.width / 2) / r.width, dy = (e.clientY - r.height / 2) / r.height;
        h1.style.transform = 'translate(' + (dx * -14) + 'px,' + (dy * -10) + 'px)';
      });
    }
  }
  })();
  // 티커 · 클라이언트 띠는 두 번 이어 붙여 끊김 없이
  ['#tickerTrack', '#clientTrack'].forEach(function (s) { var t = $(s); if (t) t.innerHTML += t.innerHTML; });

  /* ---------- 등장 애니메이션 ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  $$('.reveal, .line-draw, [data-hl]').forEach(function (el) { io.observe(el); });

  /* ---------- 숫자 카운터 ---------- */
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      var el = e.target, to = +el.getAttribute('data-count'), plain = el.hasAttribute('data-plain'), t0 = null, dur = 1800;
      if (reduce) { el.textContent = plain ? to : to.toLocaleString('ko-KR'); return; }
      (function step(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / dur); k = 1 - Math.pow(1 - k, 4); var v = Math.round(to * k); el.textContent = plain ? v : v.toLocaleString('ko-KR'); if (k < 1) requestAnimationFrame(step); })(performance.now());
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- 자석 단추 ---------- */
  if (fine && !reduce) $$('[data-mag]').forEach(function (b) {
    b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .25) + 'px,' + ((e.clientY - r.top - r.height / 2) * .35) + 'px)'; });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; });
  });

  /* ---------- 사업분야 무대 ---------- */
  var bizList = $('#bizList'), stage = $('#bizStage');
  if (bizList && stage) (function () {
  var imgs = $$('.img', stage), cur = 0, stageEn = $('#stageEn'), stageTitle = $('#stageTitle'), stageDesc = $('#stageDesc');
  var pre = {}; // 미리 읽기
  $$('li', bizList).forEach(function (li) { var im = new Image(); im.src = li.getAttribute('data-img'); pre[im.src] = im; });
  var narrow = window.matchMedia('(max-width: 900px)');
  function inlineBiz(li) { // 모바일: 누른 항목 바로 아래에 사진
    $$('.biz-inline', bizList).forEach(function (b) { b.remove(); });
    if (!narrow.matches || !li) return;
    var box = document.createElement('div'); box.className = 'biz-inline';
    box.innerHTML = '<img src="' + li.getAttribute('data-img') + '" alt="' + $('.t b', li).textContent + ' 현장"><div class="cap"><em>' + li.getAttribute('data-en') + '</em><p>' + li.getAttribute('data-desc') + '</p><a href="#contact">이 행사 견적 문의 →</a></div>';
    li.appendChild(box);
  }
  function showBiz(li) {
    if (li.classList.contains('on')) return;
    inlineBiz(li);
    $$('li', bizList).forEach(function (l) { l.classList.remove('on'); }); li.classList.add('on');
    var next = imgs[1 - cur]; next.style.backgroundImage = 'url(' + li.getAttribute('data-img') + ')';
    imgs[cur].classList.remove('on'); next.classList.add('on'); cur = 1 - cur;
    stageEn.textContent = li.getAttribute('data-en'); stageTitle.textContent = $('.t b', li).textContent; stageDesc.textContent = li.getAttribute('data-desc');
  }
  $$('li', bizList).forEach(function (li) {
    li.addEventListener('pointerenter', function () { if (fine) showBiz(li); });
    $('a', li).addEventListener('click', function (e) {
      if (narrow.matches) { // 모바일: 누르면 접었다 폈다
        e.preventDefault();
        if (li.classList.contains('on')) { li.classList.remove('on'); inlineBiz(null); } else showBiz(li);
      } else if (!li.classList.contains('on') && !fine) { e.preventDefault(); showBiz(li); }
    });
  });
  inlineBiz($('li.on', bizList));
  narrow.addEventListener('change', function () { inlineBiz($('li.on', bizList)); });
  })();

  /* ---------- 포트폴리오 ---------- */
  var WORKS = [
    { i: 13, t: '국회 개방행사 기획 및 대행', o: '대한민국 국회', n: 20000, c: 'big gov', s: 'big', y: '2024' },
    { i: 9, t: '삼성 모바일디스플레이 임직원 페스티벌', o: '삼성', n: 18000, c: 'big corp', s: '', y: '2026' },
    { i: 8, t: 'SK하이닉스 대축제 기획 및 대행', o: 'SK하이닉스', n: 7000, c: 'big corp', s: '', y: '2026' },
    { i: 11, t: '국회 개방행사 에어바운스 놀이존', o: '대한민국 국회', n: 20000, c: 'big gov', s: '', y: '2026' },
    { i: 12, t: '광주 어린이날 행사 총기획 · 대행', o: '광주시', n: 5000, c: 'big gov', s: '', y: '2024' },
    { i: 14, t: '대형 WATER BOM 기획 · 대행', o: '워터밤', n: 0, c: 'big', s: '', y: '2024' },
    { i: 2, t: '말레이시아 내무부장관 초청 기공식', o: 'C&B 코스메틱', n: 0, c: 'cer', s: 'wide', y: '2023' },
    { i: 19, t: '공기업 오징어게임 체육대회 · 개그콘서트 강연', o: '공기업', n: 0, c: 'corp sport', s: 'wide', y: '2026' },
    { i: 16, t: 'KAID 국제과학기술원 송년회', o: 'KAID', n: 0, c: 'corp', s: 'big', y: '2026' },
    { i: 6, t: '현대산업개발 전사 체육대회', o: '현대산업개발', n: 0, c: 'corp sport', s: '', y: '2026' },
    { i: 7, t: '삼성전자 중국사원 체육대회', o: '삼성전자', n: 0, c: 'corp sport', s: '', y: '2026' },
    { i: 10, t: '경기도 소방학교 신입사원 체육대회', o: '경기도 소방학교', n: 0, c: 'gov sport', s: '', y: '2026' },
    { i: 3, t: '제22회 춘천시 양성평등대회 총기획', o: '춘천시', n: 0, c: 'gov', s: '', y: '2023' },
    { i: 15, t: '춘천시 양성평등행사 송년회 · MC · 음향 · 조명', o: '춘천시', n: 0, c: 'gov', s: '', y: '2026' },
    { i: 4, t: '교육부 한국직업능력개발원 비대면 행사 20차수', o: '교육부', n: 0, c: 'gov', s: 'wide', y: '2024' },
    { i: 1, t: 'SK하이닉스 어린이날 대축제 총괄 기획', o: 'SK하이닉스', n: 0, c: 'corp big', s: 'wide', y: '2023' },
    { i: 17, t: '강서가족지원센터 송년회', o: '강서가족지원센터', n: 0, c: 'gov', s: 'wide', y: '2026' },
    { i: 18, t: '총동문회 체육대회 · 초대가수 섭외', o: '총동문회', n: 0, c: 'sport', s: 'wide', y: '2026' }
  ];
  /* 포트폴리오 = WORKS(위 배열) + 대표님이 upload.html 로 올린 사진(photos 가지의 photos.json)을 앞에 합쳐 보여준다 */
  var UP_LIST = 'https://raw.githubusercontent.com/brizymedia/pro-event/photos/photos/photos.json';
  var UP_IMG = 'https://cdn.jsdelivr.net/gh/brizymedia/pro-event@photos/';
  var UP_CAT = { big: '대형행사', corp: '기업행사', gov: '지자체 · 관공서', sport: '체육대회 · 학교행사', cer: '기공식 · 의전', etc: '장비 · 체험' };
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function srcOf(w) { return w.u || 'assets/img/works/w' + w.i + '.webp'; }
  var grid = $('#worksGrid'), list = WORKS.slice(), works = [];
  function applyFilter() {
    var act = $('#filters .act'), f = act ? act.getAttribute('data-f') : 'all';
    works.forEach(function (w) { w.classList.toggle('hide', f !== 'all' && w.getAttribute('data-c').split(' ').indexOf(f) < 0); });
  }
  function render() {
    grid.innerHTML = list.map(function (w, k) {
      return '<figure class="work ' + (w.s || '') + '" data-k="' + k + '" data-c="' + esc(w.c) + '">' +
        '<img src="' + esc(srcOf(w)) + '" alt="' + esc(w.t) + '" loading="lazy">' +
        (w.n ? '<span class="num">' + w.n.toLocaleString('ko-KR') + '<small>명</small></span>' : '') +
        '<i class="shine"></i><figcaption class="info"><em>' + esc(w.o) + (w.y ? ' · ' + esc(w.y) : '') + '</em><b>' + esc(w.t) + '</b></figcaption></figure>';
    }).join('');
    works = $$('.work', grid);
    if (fine && !reduce) works.forEach(function (w) {
      w.addEventListener('pointermove', function (e) { var r = w.getBoundingClientRect(); w.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); w.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); });
    });
    applyFilter();
  }
  if (grid) {
  render();
  fetch(UP_LIST + '?t=' + Math.floor(Date.now() / 300000), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j || !j.photos || !j.photos.length) return;
    var up = j.photos.filter(function (x) { return x && x.path; }).map(function (x) {
      return { u: UP_IMG + x.path.split('/').map(encodeURIComponent).join('/'), t: x.event || '행사 현장', o: [UP_CAT[x.cat] || '현장', x.place].filter(Boolean).join(' · '), y: (x.date || '').replace(/-/g, '.'), n: 0, c: x.cat || 'etc', s: '' };
    });
    list = up.concat(WORKS); render();
  }).catch(function () {});
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('button', e.currentTarget).forEach(function (x) { x.classList.remove('act'); }); b.classList.add('act');
    applyFilter();
  });
  // 라이트박스
  var lb = $('#lb'), lbImg = $('#lbImg'), lbTitle = $('#lbTitle'), lbMeta = $('#lbMeta'), lbK = 0;
  function visible() { return works.filter(function (w) { return !w.classList.contains('hide'); }).map(function (w) { return +w.getAttribute('data-k'); }); }
  function openLb(k) { var w = list[k]; lbK = k; lbImg.src = srcOf(w); lbImg.alt = w.t; lbTitle.textContent = w.t; lbMeta.textContent = w.o + (w.y ? ' · ' + w.y : '') + (w.n ? ' · ' + w.n.toLocaleString('ko-KR') + '명' : ''); lb.classList.add('on'); document.body.style.overflow = 'hidden'; }
  function closeLb() { lb.classList.remove('on'); document.body.style.overflow = ''; }
  function stepLb(d) { var v = visible(), i = v.indexOf(lbK); openLb(v[(i + d + v.length) % v.length]); }
  grid.addEventListener('click', function (e) { var w = e.target.closest('.work'); if (w) openLb(+w.getAttribute('data-k')); });
  $('#lbX').addEventListener('click', closeLb); $('#lbPrev').addEventListener('click', function () { stepLb(-1); }); $('#lbNext').addEventListener('click', function () { stepLb(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') stepLb(-1); if (e.key === 'ArrowRight') stepLb(1); });
  }

  /* ---------- 프로세스 선 ---------- */
  var steps = $('#steps');
  if (steps) { var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { steps.classList.add('in'); sio.disconnect(); } }); }, { threshold: .4 }); sio.observe(steps); }

  /* ---------- 카드 기울임 ---------- */
  if (fine && !reduce) $$('[data-tilt]').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = 'translateY(-6px) perspective(900px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 8) + 'deg)'; });
    c.addEventListener('pointerleave', function () { c.style.transform = ''; });
  });

  /* ---------- 유튜브 ---------- */
  $$('.vid').forEach(function (v) {
    v.addEventListener('click', function () {
      if ($('iframe', v)) return;
      var id = v.getAttribute('data-yt'), f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1'; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.title = $('.cap b', v).textContent;
      v.appendChild(f);
    });
    var im = $('img', v); im.addEventListener('error', function () { if (im.src.indexOf('maxres') > 0) im.src = im.src.replace('maxresdefault', 'hqdefault'); });
  });

  /* ---------- 문의 폼 ---------- */
  var form = $('#quoteForm'), done = $('#formDone');
  if (form && done) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = {}; ['name', 'tel', 'org', 'type', 'date', 'people', 'msg'].forEach(function (k) { d[k] = form.elements[k].value.trim(); });
    if (!d.name || !d.tel) { alert('담당자 이름과 연락처는 꼭 적어 주세요.'); (d.name ? form.elements.tel : form.elements.name).focus(); return; }
    if (!$('#fAgree').checked) { alert('개인정보 수집·이용에 동의해 주세요.'); return; }
    var text = '[프로이벤트 견적문의]\n담당자: ' + d.name + '\n연락처: ' + d.tel + '\n기관: ' + (d.org || '-') + '\n유형: ' + d.type + '\n예정일: ' + (d.date || '-') + '\n인원: ' + (d.people || '-') + '\n내용: ' + (d.msg || '-');
    function local() {
      var mobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      if (mobile) { location.href = 'sms:' + SMS_TO + (/iPhone|iPad/i.test(navigator.userAgent) ? '&' : '?') + 'body=' + encodeURIComponent(text); done.classList.add('on'); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
      done.classList.add('on');
      $('p', done).innerHTML = '전송이 원활하지 않아 내용을 복사해 두었습니다.<br><b>010-3999-8262</b> 로 문자·전화 주시면 바로 상담됩니다.';
    }
    if (!FORM_ENDPOINT) { local(); return; }
    /* 서버가 「ok」라고 답할 때만 보낸 것으로 친다. 서버는 page 주소의 레포 이름(pro-event)으로 회사를 알아본다 */
    var data = { name: d.name + (d.org ? ' (' + d.org + ')' : ''), phone: d.tel, tel: d.tel, org: d.org, type: d.type, date: d.date, people: d.people, msg: d.msg,
      message: text, page: location.href, service: '[' + COMPANY + '] ' + (d.type || '행사') + ' 문의', website: '',
      at: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) };
    fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.ok) done.classList.add('on'); else local(); })
      .catch(local);
  });
})();

/* ---------- 관리자 모드 — 바닥글 맨 끝 작은 메뉴 → office.html (대표 암호로 열림, 큰길브리지 2026-10-04) ---------- */
(function () {
  var cs = document.currentScript, base = cs && cs.src ? cs.src.replace(/assets\/app\.js(\?.*)?$/, '') : '';
  function add() {
    var ft = document.querySelector('footer'); if (!ft || ft.querySelector('.admin-entry')) return;
    var d = document.createElement('div'); d.className = 'admin-entry';
    d.style.cssText = 'text-align:center;padding:12px 0 16px;font-size:12px;line-height:1';
    d.innerHTML = '<a href="' + base + 'office.html" rel="nofollow" style="color:inherit;opacity:.55;text-decoration:none;display:inline-flex;align-items:center;gap:5px">' +
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>관리자 모드</a>';
    ft.appendChild(d);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
