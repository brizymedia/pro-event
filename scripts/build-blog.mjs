/**
 * 프로이벤트 블로그 — _blog/posts/*.json 을 홈페이지 글로 만든다
 * ──────────────────────────────────────────────────────
 *   blog/               글 목록 (최신순, 24개씩 → blog/page/2/)
 *   blog/<지역>/        지역별 모음 (예: blog/gangnam/)
 *   blog/<글주소>/      글 하나
 *   rss.xml             블로그 RSS
 *   sitemap.xml · llms.txt 의 블로그 부분도 같이 갱신한다
 *
 * 원본은 _blog/ 에 둔다. 밑줄로 시작하는 폴더는 GitHub Pages(Jekyll)가 공개하지 않는다.
 * blog/ 는 매번 지우고 새로 만든다 — 결과 HTML 을 손으로 고치지 말고 원본 JSON 이나 이 템플릿을 고친다.
 * (HD기획 scripts/build-blog.mjs 를 프로이벤트에 맞게 옮긴 것)
 *
 * 프로이벤트만의 차이
 *   - 사이트가 하위 폴더(https://brizymedia.github.io/pro-event/)에 있다. 글 JSON 의 주소는 저장소 루트 기준(/quote.html)으로 쓰고,
 *     여기서 페이지 깊이에 맞는 상대 주소(../../quote.html)로 바꾼다.
 *   - 머리 · 머리글 · 바닥글은 tools/make_pages.py 처럼 index.html 에서 빌려 온다 → 메뉴 · 폰 메뉴 · 바닥글 · robots(noindex) 가 대문과 같다.
 *     index.html 을 고치면 python tools/make_pages.py 와 이 스크립트를 다시 돌린다.
 *
 * 실행:  node scripts/build-blog.mjs      글 형식 · 규칙: _blog/GUIDE.md   ·   검사: node scripts/blog-check.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE = 'https://brizymedia.github.io/pro-event';
export const BRAND = '프로이벤트';
const TEL = '02-457-8262';
const TEL_M = '010-3999-8262';
const 쪽당 = 24;

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 루트 기준 주소(/quote.html) → 저장소 안 상대 주소(quote.html). 나중에 페이지 깊이만큼 ../ 가 붙는다. */
const 상대 = (u) => (u === '/' ? 'index.html' : u.startsWith('/') ? u.slice(1) : u);

/** 글 안에서는 **굵게** 와 [글자](주소) 만 쓴다. 주소는 / 로 시작하거나 https:// 여야 한다. */
export function 인라인(글) {
  return esc(글)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s]*)\)/g, (m, t, u) =>
      u.startsWith('/') ? `<a href="${상대(u)}">${t}</a>` : `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
}
export const 글자만 = (글) => String(글 ?? '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
export const 날짜글 = (d) => { const m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? `${m[1]}년 ${+m[2]}월 ${+m[3]}일` : String(d || ''); };
export const 글주소 = (slug) => `/blog/${encodeURIComponent(slug)}/`;

export function 지역표(ROOT) {
  const j = JSON.parse(readFileSync(resolve(ROOT, '_blog', 'regions.json'), 'utf8'));
  const 표 = new Map(j.지역.map((r) => [r.slug, r]));
  표.set('common', { slug: 'common', 이름: '행사 준비 공통', 서비스페이지: '', 이동: '', 비중: 0 });
  return 표;
}

/** photos.json 의 묶음을 사진 한 장씩 풀어 경로 → 정보 로 */
export function 사진목록(ROOT) {
  const j = JSON.parse(readFileSync(resolve(ROOT, '_blog', 'photos.json'), 'utf8'));
  const 표 = new Map();
  j.묶음.forEach((g, i) => { (g.path || []).forEach((p) => 표.set(p, { ...g, path: p, 묶음번호: i })); });
  return 표;
}

export function 글읽기(ROOT) {
  const 폴더 = resolve(ROOT, '_blog', 'posts');
  if (!existsSync(폴더)) return [];
  return readdirSync(폴더).filter((f) => f.endsWith('.json')).map((f) => {
    const p = JSON.parse(readFileSync(resolve(폴더, f), 'utf8'));
    Object.defineProperty(p, '_파일', { value: f, enumerable: false });
    return p;
  }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1));
}

/** 본문 글자 — 읽는 시간·검사·중복 비교에 쓴다 */
export function 본문글(p) {
  const 조각 = [p.lead, ...(p.points || [])];
  for (const s of p.sections || []) {
    조각.push(s.h2);
    for (const b of s.blocks || []) {
      if (b.p) 조각.push(b.p);
      if (b.tip) 조각.push(b.tip);
      if (b.ul) 조각.push(...b.ul);
      if (b.ol) 조각.push(...b.ol);
      if (b.table) 조각.push(...(b.table.head || []), ...(b.table.rows || []).flat());
    }
  }
  for (const f of p.faq || []) 조각.push(f.q, f.a);
  return 조각.map(글자만).join('\n');
}

export function 글이미지들(p) {
  const 목록 = p.cover ? [p.cover] : [];
  for (const s of p.sections || []) for (const b of s.blocks || []) if (b.img) 목록.push(b.img);
  return 목록;
}

/* 사이트 style.css(어두운 바탕) 위에 블로그 글에만 필요한 것 */
const CSS = `
.bp{max-width:780px;margin:0 auto}
.bp .meta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 26px}
.bp .meta a,.bp .meta span{font-size:13px;font-weight:600;padding:6px 13px;border-radius:99px;border:1px solid var(--line-2);color:var(--muted)}
.bp .meta a{color:var(--txt);border-color:rgba(25,211,255,.35);text-decoration:none}.bp .meta a:hover{background:rgba(25,211,255,.08)}
.bp .lead{font-size:17.5px;line-height:1.9;color:var(--txt);margin:0 0 28px}
.bp a:not(.btn){color:var(--cyan);text-decoration:underline;text-underline-offset:3px}
.bp b{color:#fff}
.bp figure{margin:0 0 30px}.bp figure img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:16px;background:var(--surface)}
.bp figure.cover img{aspect-ratio:16/9}
.bp figcaption{font-size:13.5px;color:var(--muted);margin-top:9px;line-height:1.65}
.bp .points{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:20px 24px;margin:0 0 30px}
.bp .points>b,.bp .toc>b{display:block;font-family:var(--ff-disp);font-size:11px;letter-spacing:.24em;color:var(--cyan);margin-bottom:10px;font-weight:500}
.bp .points ul{list-style:disc;padding-left:20px}.bp .points li{line-height:1.8;margin:4px 0}
.bp .toc{border-left:2px solid var(--cyan);padding:2px 0 2px 18px;margin:0 0 40px}
.bp .toc ol{list-style:none;padding-left:0}.bp .toc li{line-height:1.95;color:var(--muted)}.bp .toc a{color:var(--muted);text-decoration:none}.bp .toc a:hover{color:var(--txt)}
.bp .body h2,.bp .faq h2{font-size:clamp(21px,2.6vw,25px);line-height:1.4;letter-spacing:-.025em;margin:46px 0 16px;font-weight:800;scroll-margin-top:96px}
.bp .body p,.bp .faq p{font-size:16.5px;line-height:1.95;color:#D5DAE5;margin:0 0 18px}
.bp .body ul,.bp .body ol{margin:0 0 22px;padding-left:22px;color:#D5DAE5}.bp .body ul{list-style:disc}.bp .body ol{list-style:decimal}.bp .body li{line-height:1.85;margin:6px 0}
.bp .tbl{overflow-x:auto;margin:0 0 24px;border:1px solid var(--line-2);border-radius:14px;background:var(--ink-2)}
.bp table{border-collapse:collapse;width:100%;font-size:14.5px;min-width:520px}
.bp th,.bp td{padding:11px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line);line-height:1.65}
.bp th{background:var(--surface);font-weight:700;white-space:nowrap;color:var(--txt)}.bp td{color:#D5DAE5}.bp tbody tr:last-child td{border-bottom:0}
.bp .tip{background:rgba(47,107,255,.12);border:1px solid rgba(47,107,255,.3);border-radius:14px;padding:15px 19px;margin:0 0 24px;font-size:15.5px;line-height:1.85;color:var(--txt)}
.bp .tip::before{content:'현장 메모';display:block;font-size:11px;font-weight:800;letter-spacing:.18em;color:var(--cyan);margin-bottom:4px}
.bp .faq details{background:var(--surface);border:1px solid var(--line);border-radius:14px;margin:0 0 9px;padding:0 18px}
.bp .faq summary{cursor:pointer;font-weight:700;padding:15px 0;line-height:1.6}.bp .faq details p{margin:0 0 16px}
.bp .src{margin-top:34px;font-size:13.5px;color:var(--muted);line-height:1.75}.bp .src ul{list-style:disc;padding-left:20px;margin:6px 0 0}.bp .src a{color:var(--muted)}
.bchips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 30px}
.bchips a{font-size:14px;font-weight:600;padding:9px 16px;border-radius:99px;border:1px solid var(--line-2);color:var(--muted)}
.bchips a:hover{color:var(--txt)}.bchips a[aria-current]{background:var(--txt);color:var(--ink);border-color:var(--txt)}.bchips small{margin-left:5px;opacity:.6;font-weight:600}
.bpager{display:flex;gap:8px;justify-content:center;margin-top:34px}
.bpager a,.bpager span{padding:9px 15px;border-radius:99px;border:1px solid var(--line-2);font-weight:700;font-size:14px}.bpager span{background:var(--txt);color:var(--ink)}
.bempty{border:1px dashed var(--line-2);border-radius:16px;padding:22px;color:var(--muted);line-height:1.8;margin-bottom:24px}
.bintro a{color:var(--txt);border-bottom:1.5px solid var(--cyan)}
.bp a:focus-visible,.bp summary:focus-visible,.bchips a:focus-visible{outline:2px solid var(--cyan);outline-offset:3px;border-radius:4px}
`.trim();

/** index.html 의 머리 · 머리글 · 바닥글을 빌린다 (tools/make_pages.py 의 shell() 과 같은 규칙) */
function 틀(ROOT) {
  const s = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
  let top = s.slice(0, s.indexOf('<main id="top">'));
  let bottom = s.slice(s.indexOf('</main>') + '</main>'.length);
  top = top.replace(/<div class="curtain"[^>]*>[\s\S]*?<i class="bar"><\/i>\s*<\/div>\n/, '');
  top = top.replace(/href="#(?!top")([a-z]+)"/g, 'href="index.html#$1"');
  top = top.replace('<a class="logo" href="#top"', '<a class="logo" href="index.html"');
  top = top.replace('<meta property="og:image"', '<link rel="canonical" href="">\n<meta property="og:url" content="">\n<meta property="og:image"');
  top = top.replace(/(<nav class="menu"[^>]*>[\s\S]*?)<a href="blog\/">/, '$1<a href="blog/" class="act" aria-current="page">');
  bottom = bottom.replace(/\n<!-- 라이트박스 -->[\s\S]*?<\/div>\n/, '\n');
  return { top, bottom };
}

export function buildBlog(옵션 = {}) {
  const ROOT = 옵션.ROOT;
  const 절대 = (path) => SITE + String(path).split('/').map(encodeURIComponent).join('/');   // og · JSON-LD 용
  const 지역 = 지역표(ROOT);
  const posts = 글읽기(ROOT);
  const 제이슨 = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
  const { top: 원top, bottom: 원bottom } = 틀(ROOT);
  const E = esc;

  rmSync(resolve(ROOT, 'blog'), { recursive: true, force: true });

  /** 폴더(blog/…) 에 index.html 을 쓴다. 상대 주소 앞에 깊이만큼 ../ 를 붙인다. */
  const 쓰기 = (폴더, { 제목, 설명, 이미지, 더넣기 = '', 색인 = true }, main) => {
    const 경로 = '/' + 폴더 + '/';
    const url = SITE + 경로.split('/').map(encodeURIComponent).join('/');
    let top = 원top
      .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${E(제목)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, (m, a) => a + E(설명))
      .replace(/(<meta property="og:description" content=")[^"]*/, (m, a) => a + E(설명))
      .replace(/(<meta property="og:title" content=")[^"]*/, (m, a) => a + E(제목))
      .replace(/(<meta property="og:type" content=")[^"]*/, (m, a) => a + (더넣기.includes('article:published_time') ? 'article' : 'website'))
      .replace(/(<link rel="canonical" href=")[^"]*/, (m, a) => a + url)
      .replace(/(<meta property="og:url" content=")[^"]*/, (m, a) => a + url)
      .replace(/(<meta property="og:image" content=")[^"]*/, (m, a) => a + E(이미지));
    // 대문이 noindex 면 그대로 물려받는다. 대문이 색인을 허용해도 빈 지역 모음은 noindex.
    if (!색인 && !/<meta name="robots"/.test(top)) top = top.replace('</head>', '<meta name="robots" content="noindex,follow">\n</head>');
    top = top.replace('</head>', `<link rel="alternate" type="application/rss+xml" title="${BRAND} 행사 준비 블로그" href="rss.xml">\n${더넣기}\n<style>${CSS}</style>\n</head>`);
    let out = top + '<main id="top">\n' + main + '\n</main>' + 원bottom;
    const 깊이 = 폴더.split('/').length;
    const pre = '../'.repeat(깊이);
    out = out.replace(/(href|src|poster)="(?!https?:|mailto:|tel:|sms:|data:|#|\/|\.\.\/)([^"]*)"/g, (m, a, b) => `${a}="${pre}${b}"`);
    out = out.replace(/url\((?!https?:|data:)(assets\/[^)]+)\)/g, (m, a) => `url(${pre}${a})`);
    const d = resolve(ROOT, 폴더);
    mkdirSync(d, { recursive: true });
    writeFileSync(resolve(d, 'index.html'), out, 'utf8');
  };

  const ARR = '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const 상담 = (제목 = '행사 날짜가 잡히셨나요?') => `<section class="callband" style="background-image:url(assets/img/works/w14.webp)"><div class="wrap"><div><p class="eyebrow">Contact · Get a Quote</p><h2 style="margin-top:16px">${E(제목)}<br><em>프로이벤트</em>가 기획부터 운영까지.</h2><p>행사 목적 · 인원 · 날짜만 알려 주시면 됩니다. 담당자가 확인 후 1영업일 안에 1차 제안과 견적으로 답합니다.</p></div><div><a class="num" href="tel:${TEL}">${TEL}<small>서울본사 · 평일 09:00 ~ 18:00</small></a><a class="num" href="tel:${TEL_M}" style="margin-top:14px">${TEL_M}<small>대표 직통 · 화성지사</small></a><div class="btns"><a class="btn btn-pri" href="quote.html">자동 견적서${ARR}</a><a class="btn btn-ghost" href="index.html#contact">견적 문의 폼</a></div></div></div></section>`;

  const 카드 = (p) => {
    const r = 지역.get(p.region);
    return `<a class="scard" href="${상대(글주소(p.slug))}"><img src="${E(상대(p.cover.path))}" alt="${E(p.cover.alt)}" loading="lazy" decoding="async" width="800" height="500"><span><small>${E(r ? r.이름 : '')} · ${E(날짜글(p.date))}</small>${E(p.title)}<em>${E(p.description)}</em></span></a>`;
  };

  const 개수 = new Map();
  posts.forEach((p) => 개수.set(p.region, (개수.get(p.region) || 0) + 1));
  const 칩 = (현재) => `<nav class="bchips" aria-label="지역별 글">
    <a href="blog/"${현재 === '' ? ' aria-current="page"' : ''}>전체<small>${posts.length}</small></a>
    ${[...지역.values()].filter((r) => 개수.get(r.slug)).map((r) =>
      `<a href="blog/${r.slug}/"${현재 === r.slug ? ' aria-current="page"' : ''}>${E(r.이름)}<small>${개수.get(r.slug)}</small></a>`).join('\n    ')}
  </nav>`;
  const 머리띠 = (사진, crumb, h1, 소개) => `<section class="phead" style="background-image:url(${E(상대(사진))})"><div class="wrap"><p class="crumb">${crumb}</p><h1>${E(h1)}</h1>${소개 ? `<p class="bintro">${소개}</p>` : ''}</div></section>`;

  /* ── 글 페이지 ── */
  const 이미지html = (im, 표지) => `<figure${표지 ? ' class="cover"' : ''}>
    <img src="${E(상대(im.path))}" alt="${E(im.alt)}" ${표지 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="${표지 ? 1600 : 1200}" height="900">
    <figcaption>${인라인(im.caption)}</figcaption>
  </figure>`;
  const 블록 = (b) => {
    if (b.p) return `<p>${인라인(b.p)}</p>`;
    if (b.tip) return `<div class="tip">${인라인(b.tip)}</div>`;
    if (b.ul) return `<ul>${b.ul.map((x) => `<li>${인라인(x)}</li>`).join('')}</ul>`;
    if (b.ol) return `<ol>${b.ol.map((x) => `<li>${인라인(x)}</li>`).join('')}</ol>`;
    if (b.table) return `<div class="tbl"><table><thead><tr>${b.table.head.map((h) => `<th scope="col">${인라인(h)}</th>`).join('')}</tr></thead><tbody>${
      b.table.rows.map((row) => `<tr>${row.map((c) => `<td>${인라인(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if (b.img) return 이미지html(b.img, false);
    return '';
  };

  for (const p of posts) {
    const r = 지역.get(p.region) || { 이름: '', 서비스페이지: '' };
    const 지역글 = p.region !== 'common';
    const 경로 = 글주소(p.slug);
    const 분 = Math.max(1, Math.round(본문글(p).length / 500));
    const 관련 = [...posts.filter((o) => o !== p && o.region === p.region),
                  ...posts.filter((o) => o !== p && o.region !== p.region && o.topic === p.topic),
                  ...posts.filter((o) => o !== p && o.region !== p.region && o.topic !== p.topic)].slice(0, 3);

    const ld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: '블로그', item: SITE + '/blog/' },
        ...(지역글 ? [{ '@type': 'ListItem', position: 3, name: r.이름 + ' 행사 준비', item: `${SITE}/blog/${p.region}/` }] : []),
        { '@type': 'ListItem', position: 지역글 ? 4 : 3, name: p.title, item: SITE + 경로 } ] },
      { '@type': 'BlogPosting', '@id': SITE + 경로, headline: p.title, description: p.description,
        image: 글이미지들(p).map((im) => 절대(im.path)),
        datePublished: p.date, dateModified: p.updated || p.date, inLanguage: 'ko',
        keywords: [p.keyword.main, ...(p.keyword.sub || [])].join(', '),
        author: { '@type': 'Organization', name: BRAND, url: SITE + '/' },
        publisher: { '@type': 'Organization', name: BRAND, url: SITE + '/', telephone: TEL, logo: SITE + '/assets/img/logo.png' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': SITE + 경로 },
        ...(지역글 ? { spatialCoverage: { '@type': 'Place', name: `${r.도} ${r.시군}` } } : {}) },
      ...((p.faq || []).length ? [{ '@type': 'FAQPage', '@id': SITE + 경로 + '#faq',
        mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: 글자만(f.a) } })) }] : []),
    ] };

    const crumb = `<a href="index.html">홈</a> · <a href="blog/">블로그</a>${지역글 ? ` · <a href="blog/${p.region}/">${E(r.이름)}</a>` : ''} · <b>${E(지역글 ? r.이름 + ' 행사 준비' : '행사 준비')}</b>`;
    const main = 머리띠(p.cover.path, crumb, p.title, `${E(날짜글(p.date))} · 읽는 시간 약 ${분}분`) + `
<section class="sec tight"><div class="wrap"><article class="bp">
  <div class="meta">
    ${지역글 ? `<a href="blog/${p.region}/">${E(r.이름)} 글 모음</a>` : ''}
    ${r.서비스페이지 ? `<a href="${상대(r.서비스페이지)}">${E(r.이름)} 행사 안내</a>` : ''}
    <a href="quote.html">자동 견적서</a>
  </div>
  <p class="lead">${인라인(p.lead)}</p>
  ${이미지html(p.cover, true)}
  <div class="points"><b>KEY POINTS · 이 글의 요점</b><ul>${p.points.map((x) => `<li>${인라인(x)}</li>`).join('')}</ul></div>
  <nav class="toc" aria-label="목차"><b>CONTENTS · 목차</b><ol>${p.sections.map((s, i) => `<li><a href="#s${i + 1}">${E(s.h2)}</a></li>`).join('')}</ol></nav>
  <div class="body">
${p.sections.map((s, i) => `<h2 id="s${i + 1}">${E(s.h2)}</h2>\n${s.blocks.map(블록).join('\n')}`).join('\n')}
  </div>
  ${(p.faq || []).length ? `<section class="faq" id="faq"><h2>자주 묻는 질문</h2>${p.faq.map((f) => `<details><summary>${E(f.q)}</summary><p>${인라인(f.a)}</p></details>`).join('')}</section>` : ''}
  ${(p.sources || []).length ? `<div class="src"><b>확인한 자료</b> (${E(날짜글(p.updated || p.date))} 기준)<ul>${p.sources.map((s) => `<li><a href="${E(s.url)}" target="_blank" rel="noopener">${E(s.name)}</a></li>`).join('')}</ul></div>` : ''}
</article></div></section>
${관련.length ? `<section class="sec tight gray"><div class="wrap"><div class="head"><div><p class="eyebrow">More Guides</p><h2>같이 보면 좋은 <em>글</em></h2></div><a class="more" href="blog/">전체 보기 →</a></div><div class="scards">${관련.map(카드).join('')}</div></div></section>` : ''}
${상담(지역글 ? `${r.이름} 행사 날짜가 잡히셨나요?` : undefined)}`;
    쓰기(`blog/${decodeURIComponent(경로.slice(6, -1))}`, { 제목: `${p.title} | ${BRAND}`, 설명: p.description, 이미지: 절대(p.cover.path),
      더넣기: `<meta property="article:published_time" content="${p.date}">\n${제이슨(ld)}` }, main);
  }

  /* ── 목록 (blog/, blog/page/N/) ── */
  const 대표이미지 = posts[0] ? 절대(posts[0].cover.path) : `${SITE}/assets/img/hero_poster.webp`;
  const 쪽수 = Math.max(1, Math.ceil(posts.length / 쪽당));
  for (let n = 1; n <= 쪽수; n++) {
    const 조각 = posts.slice((n - 1) * 쪽당, n * 쪽당);
    const 쪽나눔 = 쪽수 > 1 ? `<nav class="bpager" aria-label="쪽 이동">${Array.from({ length: 쪽수 }, (_, i) => i + 1).map((k) =>
      k === n ? `<span aria-current="page">${k}</span>` : `<a href="${k === 1 ? 'blog/' : `blog/page/${k}/`}">${k}</a>`).join('')}</nav>` : '';
    const ld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: '블로그', item: SITE + '/blog/' } ] },
      { '@type': 'Blog', '@id': SITE + '/blog/', name: `${BRAND} 행사 준비 블로그`, inLanguage: 'ko',
        publisher: { '@type': 'Organization', name: BRAND, url: SITE + '/' },
        blogPost: 조각.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: SITE + 글주소(p.slug), datePublished: p.date, image: 절대(p.cover.path) })) } ] };
    const main = 머리띠(posts[0] ? posts[0].cover.path : '/assets/img/hero_poster.webp', `<a href="index.html">홈</a> · <b>블로그</b>${n > 1 ? ` · ${n}쪽` : ''}`, '행사 준비 블로그',
      '행사를 맡은 담당자가 먼저 확인할 것들을 지역별로 정리합니다. 장소와 장비, 날씨와 안전, 섭외와 견적까지 현장 기준으로 씁니다.') + `
<section class="sec tight"><div class="wrap">
  ${칩('')}
  ${posts.length ? `<div class="scards">${조각.map(카드).join('\n')}</div>` : '<div class="bempty">첫 글을 준비하고 있습니다.</div>'}
  ${쪽나눔}
  <p class="snote">행사별 기록은 <a href="stories/index.html">행사 이야기</a>, 지역별 이동 시간은 <a href="areas/index.html">운영 지역</a>에 있습니다.</p>
</div></section>
${상담()}`;
    쓰기(n === 1 ? 'blog' : `blog/page/${n}`, {
      제목: n === 1 ? `행사 준비 블로그 — 서울 · 경기 지역별 행사 준비 정보 | ${BRAND}` : `행사 준비 블로그 ${n}쪽 | ${BRAND}`,
      설명: '서울 강남 · 서초 · 영등포 · 강서 · 양천 · 성북과 수원 · 화성 · 춘천에서 행사를 준비하는 담당자를 위한 글. 송년회 · 체육대회 · 운동회 · 워크샵 · 기념식 · 음향 · 조명 · 섭외 · 견적까지 현장 기준으로 정리합니다.',
      이미지: 대표이미지, 더넣기: 제이슨(ld) }, main);
  }

  /* ── 지역 모음 (blog/<지역>/) ── */
  const 허브 = [];
  for (const r of 지역.values()) {
    const 목록 = posts.filter((p) => p.region === r.slug);
    if (r.slug === 'common' && !목록.length) continue;
    const 경로 = `/blog/${r.slug}/`;
    const 허브제목 = r.slug === 'common' ? '행사 준비 공통 정보' : `${r.이름} 행사 준비 정보`;
    const 소개 = r.slug === 'common'
      ? '지역과 상관없이 행사 준비에 두루 쓰이는 글입니다.'
      : `${E(r.이름)}에서 행사를 준비하는 담당자를 위한 글입니다. ${E(r.이동)}.${r.서비스페이지 ? ` 서비스 안내는 <a href="${상대(r.서비스페이지)}">${E(r.이름)} 행사 안내 페이지</a>에 있습니다.` : ''}`;
    const ld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: '블로그', item: SITE + '/blog/' },
        { '@type': 'ListItem', position: 3, name: 허브제목, item: SITE + 경로 } ] },
      { '@type': 'CollectionPage', '@id': SITE + 경로, name: 허브제목, inLanguage: 'ko',
        hasPart: 목록.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: SITE + 글주소(p.slug) })) } ] };
    const main = 머리띠(목록[0] ? 목록[0].cover.path : '/assets/img/hero_poster.webp', `<a href="index.html">홈</a> · <a href="blog/">블로그</a> · <b>${E(r.이름)}</b>`, 허브제목, 소개) + `
<section class="sec tight"><div class="wrap">
  ${칩(r.slug)}
  ${목록.length ? `<div class="scards">${목록.map(카드).join('\n')}</div>`
    : `<div class="bempty">${E(r.이름)} 글은 곧 올라옵니다. 그동안 다른 지역 글을 참고해 보세요.</div>${posts.length ? `<div class="scards">${posts.slice(0, 6).map(카드).join('\n')}</div>` : ''}`}
</div></section>
${상담(r.slug === 'common' ? undefined : `${r.이름} 행사 날짜가 잡히셨나요?`)}`;
    쓰기(`blog/${r.slug}`, {
      제목: `${허브제목} — 송년회 · 체육대회 · 운동회 · 음향 · 조명 | ${BRAND}`,
      설명: r.slug === 'common' ? '지역과 상관없이 행사 준비에 두루 필요한 내용. 준비 순서 · 안전 · 견적 항목을 현장 기준으로 정리한 글 모음입니다.' : `${r.이름}에서 행사를 준비할 때 확인할 것들. 송년회 · 체육대회 · 운동회 같은 행사와 음향 · 조명 · 무대, 날씨와 안전, 섭외와 견적까지 현장 기준으로 정리한 글 모음입니다.`,
      이미지: 목록[0] ? 절대(목록[0].cover.path) : 대표이미지, 색인: 목록.length > 0, 더넣기: 제이슨(ld) }, main);
    if (목록.length) 허브.push({ loc: 경로, lastmod: 목록[0].updated || 목록[0].date });
  }

  /* ── sitemap.xml — 기존 항목은 두고 /blog/ 부분만 바꾼다 ── */
  const 블로그주소 = posts.length ? [
    { loc: '/blog/', lastmod: posts[0].updated || posts[0].date },
    ...허브,
    ...posts.map((p) => ({ loc: 글주소(p.slug), lastmod: p.updated || p.date })),
  ] : [];
  const sm = resolve(ROOT, 'sitemap.xml');
  if (existsSync(sm)) {
    let xml = readFileSync(sm, 'utf8');
    xml = xml.replace(/\s*<url><loc>[^<]*\/blog\/[^<]*<\/loc>[^]*?<\/url>/g, '');
    const 추가 = 블로그주소.map((u) => `  <url><loc>${SITE}${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>\n`).join('');
    xml = xml.replace(/\s*<\/urlset>\s*$/, '\n' + 추가 + '</urlset>\n');
    writeFileSync(sm, xml, 'utf8');
  }

  /* ── llms.txt — 「## 블로그」 절을 다시 쓴다 ── */
  const ll = resolve(ROOT, 'llms.txt');
  if (existsSync(ll) && posts.length) {
    let t = readFileSync(ll, 'utf8').replace(/\r\n/g, '\n');
    const 절 = `## 블로그 (행사 준비 정보, 지역별)\n- [행사 준비 블로그](${SITE}/blog/): 서울 · 경기 지역별 행사 준비 체크리스트\n` +
      posts.map((p) => `- [${p.title}](${SITE}${글주소(p.slug)}): ${p.description}`).join('\n') + '\n';
    /* 「## 블로그」부터 다음 「## 」 절 앞(없으면 끝)까지 바꾼다 — 옛 식은 m 플래그의 $ 가 줄 끝에 걸려 두 번째 실행부터 목록이 겹쳤다 (HD기획 고침 이식) */
    const 시작 = t.search(/^## 블로그/m);
    if (시작 < 0) t = t.trimEnd() + '\n\n' + 절;
    else {
      const 뒤 = t.slice(시작 + 1);
      const 다음 = 뒤.search(/^## /m);
      t = t.slice(0, 시작) + 절 + (다음 >= 0 ? '\n' + 뒤.slice(다음) : '');
    }
    writeFileSync(ll, t, 'utf8');
  }

  /* ── rss.xml ── */
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(BRAND)} 행사 준비 블로그</title><link>${SITE}/blog/</link><description>서울 · 경기에서 행사를 준비하는 담당자를 위한 글</description><language>ko</language>
${posts.slice(0, 50).map((p) => `<item><title>${esc(p.title)}</title><link>${SITE}${글주소(p.slug)}</link><guid>${SITE}${글주소(p.slug)}</guid><description>${esc(p.description)}</description><pubDate>${new Date(p.date + 'T09:00:00+09:00').toUTCString()}</pubDate></item>`).join('\n')}
</channel></rss>
`;
  writeFileSync(resolve(ROOT, 'rss.xml'), rss, 'utf8');

  return { posts, 블로그주소 };
}

/* 혼자 실행할 때 */
const 이파일 = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === 이파일) {
  const ROOT = resolve(dirname(이파일), '..');
  const { posts, 블로그주소 } = buildBlog({ ROOT });
  console.log(`blog/: 글 ${posts.length}개 · sitemap 항목 ${블로그주소.length}개 · rss.xml · llms.txt 갱신`);
}
