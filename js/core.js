/* 코어: 상태, 유틸, 아이콘, 라우터 */
(function () {
  'use strict';
  var LS = 'garnet.preview.v3';
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  function lsGet() { try { return JSON.parse(localStorage.getItem(LS)); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(LS, JSON.stringify(v)); } catch (e) {} }

  function initial() {
    var flags = {};
    Object.keys(WF_FLAGS).forEach(function (k) { flags[k] = clone(WF_FLAGS[k]); });
    return {
      user: null, adminAuthed: false, flags: flags, apps: clone(SEED_APPS), inquiries: clone(SEED_INQ), reviews: [],
      favs: ['S05'], plan: 0, drafts: {}, audit: [], seq: 8, qseq: 1019, memoUsed: 0,
      notices: clone(NOTICES), faqs: FAQS.map(function (f, i) { return { id: i + 1, cat: f[0], q: f[1], a: f[2], show: true }; }),
      profile: { clothes: '', shoe: '', ring: '', color: '', memo: '' }, partnerView: 'P6', ret: '', club: clone(CLUB.seed), settle: { fees: clone(CLUB.FEES), partner: clone(CLUB.settleSeed.partner) }
    };
  }
  var state = lsGet() || initial();
  if (!state.flags || !state.apps) state = initial();
  if (!state.club) state.club = clone(CLUB.seed);
  if (!state.settle) state.settle = { fees: clone(CLUB.FEES), partner: clone(CLUB.settleSeed.partner) };
  /* 이전 버전에서 저장된 시연 데이터에 새 시연 항목을 합쳐 넣기 */
  (function () {
    var seed = CLUB.seed;
    seed.posts.forEach(function (p) { if (!state.club.posts.some(function (x) { return x.id === p.id; })) state.club.posts.push(clone(p)); });
    seed.deals.forEach(function (d) { if (!state.club.deals.some(function (x) { return x.id === d.id; })) state.club.deals.push(clone(d)); });
    if (state.club.seq.d < seed.seq.d) state.club.seq.d = seed.seq.d;
    SEED_APPS.forEach(function (a) { if (!state.apps.some(function (x) { return x.no === a.no; })) state.apps.push(clone(a)); });
    Object.keys(CLUB.settleSeed.partner).forEach(function (k) { if (!state.settle.partner[k]) state.settle.partner[k] = clone(CLUB.settleSeed.partner[k]); });
  })();
  var G = window.G = { state: state };
  G.save = function () { lsSet(state); };
  G.reset = function () { var s = initial(); Object.keys(state).forEach(function (k) { delete state[k]; }); Object.assign(state, s); G.save(); };

  /* ---------- 유틸 ---------- */
  var esc = G.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  G.nl = function (s) { return esc(s).replace(/\n/g, '<br>'); };
  G.fmt = function (n) { return '₩' + Number(n || 0).toLocaleString('ko-KR'); };
  G.sv = function (id) { return SV.filter(function (s) { return s.id === id; })[0]; };
  G.flag = function (id) { return state.flags[id] || { state: 'COMING_SOON', reviews: true, quote: true, gifts: false }; };
  G.visible = function () { return SV.filter(function (s) { return G.flag(s.id).state !== 'HIDDEN'; }); };
  G.bookable = function (id) { return G.flag(id).state === 'BOOKABLE'; };
  G.app = function (no) { return state.apps.filter(function (a) { return a.no === no; })[0]; };
  G.stBadge = function (s) { var a = APP_STATUS[s] || [s, 'mute']; return '<span class="bd bd-' + a[1] + '">' + esc(a[0]) + '</span>'; };
  G.stName = function (s) { return (APP_STATUS[s] || [s])[0]; };
  G.stateBadge = function (st) {
    var m = { BOOKABLE: ['신청 가능', 'ok'], COMING_SOON: ['준비 중', 'warn'], VISIBLE_INFO: ['안내만 공개', 'mute'], PAUSED: ['일시 중지', 'bad'], HIDDEN: ['비공개', 'mute'] }[st] || [st, 'mute'];
    return '<span class="bd bd-' + m[1] + '">' + m[0] + '</span>';
  };
  G.stateName = function (st) { return { BOOKABLE: '신청 가능', COMING_SOON: '준비 중', VISIBLE_INFO: '안내만 공개', PAUSED: '일시 중지', HIDDEN: '비공개' }[st] || st; };
  G.now = function () { var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); }; return SITE.today + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); };
  G.dshort = function (s) { return String(s || '').slice(0, 10); };
  G.nextNo = function () { state.seq += 1; return 'G2610-' + String(state.seq).padStart(4, '0'); };
  G.log = function (what) { state.audit.unshift({ at: G.now(), who: state.adminAuthed ? 'admin' : (state.user ? state.user.name : '방문자'), what: what }); state.audit = state.audit.slice(0, 120); };
  G.addHist = function (a, status, by, memo) { a.status = status; a.hist.push([status, G.now(), by, memo || '']); };

  /* ---------- 정산 계산 ---------- */
  G.fees = function () { return state.settle.fees; };
  G.calcFee = function (gross, rate, min) { var f = Math.max(Math.round(gross * rate / 100), min || 0); f = Math.min(f, gross); return { fee: f, net: gross - f }; };
  G.addDays = function (str, n) { var d = new Date(String(str).slice(0, 10) + 'T00:00:00'); d.setDate(d.getDate() + n); var p = function (x) { return String(x).padStart(2, '0'); }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
  /* 협력업체 서비스 정산: 직접 수행(DIRECT)은 더가넷 매출이라 정산 대상이 아니에요 */
  G.partnerRate = function (svcId) { var s = G.sv(svcId), f = state.settle.fees; return s.op === 'MIXED' ? f.partnerM : f.partnerP; };
  G.partnerCalc = function (a) { var r = G.partnerRate(a.svc), g = a.quote ? a.quote.total : 0, fee = Math.round(g * r / 100); return { gross: g, rate: r, fee: fee, net: g - fee }; };
  G.partnerSettle = function () {
    return state.apps.filter(function (a) { return a.status === 'COMPLETED' && a.partner && a.quote && G.sv(a.svc).op !== 'DIRECT'; }).map(function (a) {
      var rec = state.settle.partner[a.no], c = rec ? rec : G.partnerCalc(a), done = (a.hist[a.hist.length - 1] || [])[1] || a.at;
      return { app: a, st: rec ? rec.st : 'WAIT', gross: c.gross, rate: c.rate, fee: c.fee, net: c.net, due: G.addDays(done, state.settle.fees.cycle), outAt: rec ? rec.outAt : '' };
    });
  };
  G.settleTodoCount = function () {
    return state.club.deals.filter(function (d) { return d.pay && (d.pay.st === 'RELEASE_WAIT' || d.pay.st === 'DISPUTED'); }).length + G.partnerSettle().filter(function (r) { return r.st === 'WAIT'; }).length;
  };

  /* ---------- 아이콘 ---------- */
  var P = {
    'arrow-right': 'M5 12h14M13 6l6 6-6 6', 'arrow-left': 'M19 12H5M11 6l-6 6 6 6', 'arrow-up-right': 'M7 17L17 7M8 7h9v9',
    'chev-down': 'M6 9l6 6 6-6', 'chev-right': 'M9 6l6 6-6 6', 'plus': 'M12 5v14M5 12h14', 'minus': 'M5 12h14', 'close': 'M6 6l12 12M18 6L6 18',
    'menu': 'M4 7h16M4 12h16M4 17h16', 'check': 'M5 12.5l4.5 4.5L19 7.5', 'user': 'M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20a7.5 7.5 0 0115 0',
    'heart': 'M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z', 'search': 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4',
    'calendar': 'M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1zM4 10h16M8 3v4M16 3v4',
    'phone': 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A15 15 0 014 5a1 1 0 011-1z',
    'mail': 'M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1zM3 7l9 6 9-6', 'clock': 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
    'pin': 'M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    'shield': 'M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3zM9 12l2 2 4-4', 'info': 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 8h.01',
    'copy': 'M9 9h10v11H9zM5 15V4h10', 'edit': 'M4 20h4L19 9l-4-4L4 16v4z', 'list': 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    'file': 'M7 3h7l5 5v13H7zM14 3v5h5', 'upload': 'M12 16V5M7 10l5-5 5 5M5 20h14',
    'star': 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z', 'home': 'M4 11l8-7 8 7M6 10v10h12V10',
    'grid': 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', 'users': 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 6.5M18 14a6.5 6.5 0 013.5 6',
    'message': 'M4 5h16v11H9l-5 4V5z', 'chart': 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8', 'lock': 'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',
    'gift': 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7C9.5 7 8 6 8 4.5S10 2.5 12 7zM12 7c2.5 0 4-1 4-2.5S14 2.5 12 7z',
    'bell': 'M6 17v-6a6 6 0 1112 0v6l2 2H4l2-2zM10 21h4', 'logout': 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9', 'gem': 'M12 3l7 6-7 12L5 9l7-6zM5 9h14M9 9l3 12 3-12M9 9l3-6 3 6',
    'eye': 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z', 'swap': 'M7 7h13l-4-4M17 17H4l4 4', 'receipt': 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6',
    'handshake': 'M3 11l4-4 4 3 3-3 4 4M3 11l5 6 2-1 2 2 3-2 4-5', 'leaf': 'M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l8-8', 'truck': 'M3 6h11v9H3zM14 9h4l3 3v3h-7M7 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
    'tag': 'M3 12V4h8l10 10-8 8L3 12zM7.5 8h.01', 'sliders': 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4', 'play': 'M8 5l11 7-11 7V5z', 'pause': 'M8 5v14M16 5v14'
  };
  G.ico = function (n, s, cls) {
    s = s || 20;
    return '<svg class="ic ' + (cls || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (P[n] || P.info) + '"/></svg>';
  };
  G.heartFill = function (on) { return on ? '<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="' + P.heart + '"/></svg>' : G.ico('heart', 20); };
  G.starFill = function (n) { var o = ''; for (var i = 1; i <= 5; i++) o += '<svg class="ic star ' + (i <= n ? 'on' : '') + '" width="16" height="16" viewBox="0 0 24 24" fill="' + (i <= n ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="' + P.star + '"/></svg>'; return o; };

  /* ---------- 토스트 ---------- */
  var tt;
  G.toast = function (msg) {
    var el = document.getElementById('toast'); if (!el) return;
    el.textContent = msg; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove('on'); }, 2800);
  };

  /* ---------- 액션/제출 위임 ---------- */
  G.ACT = {}; G.SUB = {}; G.INP = {};
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    var fn = G.ACT[el.getAttribute('data-act')]; if (!fn) return;
    if (el.tagName === 'A' && !el.getAttribute('href')) e.preventDefault();
    fn(el, e);
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('[data-sub]'); if (!f) return;
    e.preventDefault(); var fn = G.SUB[f.getAttribute('data-sub')]; if (fn) fn(f, e);
  });
  ['input', 'change'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      var el = e.target.closest('[data-on]'); if (!el) return;
      var spec = el.getAttribute('data-on').split(':'); if (spec[0] !== ev) return;
      var fn = G.INP[spec[1]]; if (fn) fn(el, e);
    });
  });

  /* ---------- 라우터 ---------- */
  G.PAGES = {};
  G.go = function (h) { if (location.hash === '#' + h) G.render(true); else location.hash = h; };
  G.parse = function () {
    var h = (location.hash || '').replace(/^#/, '') || 'home'; var i = h.indexOf('-');
    return { raw: h, name: i < 0 ? h : h.slice(0, i), arg: i < 0 ? '' : h.slice(i + 1) };
  };
  var lastRaw = null;
  G.render = function (top) {
    var r = G.parse(); var page = G.PAGES[r.name] || G.PAGES.notfound;
    var y = window.scrollY;
    var out = page(r.arg, r);
    var root = document.getElementById('app');
    var layout = out.layout === 'admin' ? G.adminLayout : out.layout === 'bare' ? function (o) { return o.html; } : G.siteLayout;
    root.innerHTML = layout(out, r);
    document.title = (out.title ? out.title + ' · ' : '') + '더가넷 THE GARNET';
    document.body.setAttribute('data-area', out.layout === 'admin' ? 'admin' : 'site');
    if (out.mount) out.mount();
    var isNew = r.raw !== lastRaw || top;
    lastRaw = r.raw;
    if (isNew) { window.scrollTo(0, 0); var m = document.getElementById('main'); if (m) { m.setAttribute('tabindex', '-1'); } }
    else window.scrollTo(0, y);
  };
  window.addEventListener('hashchange', function () { G.render(true); });
  G.rerender = function () { G.save(); G.render(false); };
})();
