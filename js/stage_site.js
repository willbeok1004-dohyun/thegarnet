/* 단계별 기능 공개 — 고객 화면: 우리 동네(거점·모임·소식·공동구매·사전 신청), 안심 약속, 기업·기관, 나눔, 화면 덧붙이기 */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES, T = function () { return S.st; }, f = G.feat;
  var byId = function (arr, id) { return (arr || []).filter(function (x) { return String(x.id) === String(id); })[0]; };
  var $ = function (id) { return document.getElementById(id); };
  var val = function (id) { var e = $(id); return e ? String(e.value || '').trim() : ''; };
  var uid = function () { return S.user ? S.user.id : ''; };
  var sec = function (inner, cls) { return '<section class="sec sec-tight' + (cls ? ' ' + cls : '') + '"><div class="wrap">' + inner + '</div></section>'; };
  var page = function (title, head, body) { return { title: title, html: head + sec(body) }; };
  var offPage = function (t) { return page(t, G.pageHead(t, '아직 준비 중인 서비스예요. 열리면 이 자리에서 바로 안내드릴게요.', [[t]]), G.empty('조금만 기다려 주세요.', '<a class="btn btn-line btn-sm" href="#home">홈으로</a>')); };
  var needLogin = function (ret) { S.ret = ret; G.save(); return '<div class="callout">' + ico('user', 20) + '<div><strong>로그인이 필요해요</strong><p>가넷 회원이 되면 바로 이용할 수 있어요.</p><p class="fa"><a class="btn btn-fill btn-sm" href="#login">로그인</a><a class="btn btn-line btn-sm" href="#signup">회원가입</a></p></div></div>'; };
  var fg = function (id, label, input, cls) { return '<div class="fg' + (cls ? ' ' + cls : '') + '"><label class="lb" for="' + id + '">' + label + '</label>' + input + '</div>'; };
  var sel = function (id, opts, cur, attr) { return '<select id="' + id + '"' + (attr || '') + '>' + opts.map(function (o) { o = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(o[0]) + '"' + (String(cur) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; };
  var mapLinks = function (addr, name) { var q = encodeURIComponent(addr); return '<a class="btn btn-line btn-sm" href="https://map.kakao.com/link/search/' + q + '" target="_blank" rel="noopener">' + ico('pin', 16) + ' 카카오맵 길찾기</a><a class="btn btn-line btn-sm" href="https://map.naver.com/p/search/' + q + '" target="_blank" rel="noopener">' + ico('pin', 16) + ' 네이버지도</a>'; };

  /* ---------- 공통: 시연 데이터 적용 ---------- */
  var S15 = G.sv('S15'), S15o = { cost: S15.cost.slice(), cancel: S15.cancel.slice(), price: S15.wf.price };
  var ITEM_POSTS = [
    { id: 'N51', svc: 'GIVE', kind: 'OFFER', pay: 'FREE', price: 0, cat: '생활 물품', owner: 'u4', area: '서울 마포구', when: '평일 오후', status: 'PUBLISHED', at: '2026-10-25 10:00', title: '유아 그림책 20권 나눠요', body: '아이가 커서 읽지 않는 그림책이에요. 상태는 깨끗하고, 마포점 매장 보관함에 맡겨 둘게요. 보관 코드로 찾아가시면 돼요.', item: '상태 좋음', delivery: 'HUB', hub: 'H1', hist: [['PUBLISHED', '2026-10-25 10:00', '운영자', '기준 확인 후 공개']] },
    { id: 'N52', svc: 'SWAP', kind: 'OFFER', pay: 'FREE', price: 0, cat: '생활 물품', owner: 'u2', area: '서울 마포구', when: '주말', status: 'PUBLISHED', at: '2026-10-26 09:00', title: '겨울 코트(66) ↔ 패딩 조끼 바꿔요', body: '한 번 입은 울 코트예요. 비슷한 크기의 패딩 조끼와 바꾸고 싶어요. 작은도서관에서 만나요.', item: '거의 새것', delivery: 'MEET', hub: 'H2', hist: [['PUBLISHED', '2026-10-26 09:00', '운영자', '기준 확인 후 공개']] },
    { id: 'N53', svc: 'HELP', kind: 'REQUEST', pay: 'FREE', price: 0, cat: '집안일·정리', owner: 'u6', area: '서울 마포구', when: '토요일 오전', status: 'PUBLISHED', at: '2026-10-27 08:30', title: '장 본 짐 같이 들어 주실 분', body: '시장에서 김장 재료를 사는데 짐이 많아요. 시장 입구에서 집 앞까지 30분 정도 같이 들어 주시면 고맙겠어요.', hist: [['PUBLISHED', '2026-10-27 08:30', '운영자', '기준 확인 후 공개']] }
  ];
  G.stageApply = function () {
    if (!T()) return;
    if (f('fixGiving')) {
      S15.cost = ['후원금은 더가넷의 서비스 매출이 아니에요. 견적·결제 없이 기관의 공식 창구로 바로 연결해요.', '금액과 방식(일시·정기)은 후원하실 기관에서 직접 정해요.', '기부금 영수증은 기부금단체로 지정된 기관이 발급해요.'];
      S15.cancel = ['후원 취소·변경·환불은 후원하신 기관의 규정을 따라요.', '더가넷은 후원금을 보관하지 않아요. 궁금한 점은 1:1 문의로 연결해 드려요.'];
      S15.wf.price = '후원기관이 정하는 후원금 (더가넷 서비스 매출 아님)';
    } else { S15.cost = S15o.cost.slice(); S15.cancel = S15o.cancel.slice(); S15.wf.price = S15o.price; }
    if (f('pumon')) ITEM_POSTS.forEach(function (p) { if (!S.club.posts.some(function (x) { return x.id === p.id; })) S.club.posts.push(JSON.parse(JSON.stringify(p))); });
    G.save();
  };
  G.stageApply();
  var oReset = G.reset; G.reset = function () { oReset(); G.stageApply(); };

  /* ---------- 레이아웃: 메뉴·머리·발·떠 있는 버튼 ---------- */
  var townKeys = function () { return [['places', '거점 찾기', 'places'], ['events', '모임·이벤트', 'events'], ['news', '동네 소식', 'news'], ['groupbuy', '공동구매', 'groupbuy'], ['preorder', '창립회원 사전 신청', 'preorder']].filter(function (x) { return f(x[2]); }); };
  G.siteNav = function (NAV) {
    var n = NAV.slice(), t = townKeys();
    if (t.length) n.splice(3, 0, ['town', '우리 동네']);
    if (f('giving')) n.splice(n.length - 1, 0, ['giving', '나눔']);
    return n;
  };
  G.navMapExtra = { town: 'town', places: 'town', place: 'town', events: 'town', event: 'town', news: 'town', groupbuy: 'town', gb: 'town', preorder: 'town', giving: 'giving', give: 'giving', promise: 'faq', corp: 'plans' };
  P.town = function () { var t = townKeys(); return t.length ? P[t[0][0]]('') : offPage('우리 동네'); };
  function townTabs(cur) { var t = townKeys(); return t.length > 1 ? '<div class="tabs town-tabs">' + t.map(function (x) { return '<a href="#' + x[0] + '" class="' + (cur === x[0] ? 'on' : '') + '">' + x[1] + '</a>'; }).join('') + '</div>' : ''; }
  var oSite = G.siteLayout;
  G.siteLayout = function (out, r) {
    var h = oSite(out, r);
    if (G.siteNav(['a', 'b', 'c', 'd', 'e', 'f']).length > 6) h = h.replace('<nav class="nav" aria-label="주요 메뉴">', '<nav class="nav nav-many" aria-label="주요 메뉴">');
    if (f('bigText')) h = h.replace('<nav aria-label="모바일 메뉴">', '<nav aria-label="모바일 메뉴"><button data-act="bigText">' + (T().bigText ? '글자 보통으로' : '글자 크게 보기') + '</button>');
    if (f('bigText')) h = h.replace('<div class="hd-r">', '<div class="hd-r"><button class="hd-link big-tg" data-act="bigText" aria-pressed="' + !!T().bigText + '">' + (T().bigText ? '글자 보통' : '글자 크게') + '</button>');
    var ft = '';
    if (f('promise')) ft += '<a href="#promise">가넷 안심 약속</a>';
    if (f('corp')) ft += '<a href="#corp">기업·기관 회원</a>';
    if (f('givingReport')) ft += '<a href="#giving-report">나눔 보고서</a>';
    if (f('phoneApply')) ft += '<a href="tel:' + SITE.phone.replace(/[^\d]/g, '') + '">전화로 신청 ' + esc(SITE.phone) + '</a>';
    if (ft) h = h.replace('<nav class="ft-nav" aria-label="바로가기">', '<nav class="ft-nav" aria-label="바로가기">' + ft);
    return h;
  };
  G.siteBottomExtra = function () {
    var o = '';
    if (f('bigText')) {
      o += '<a class="kakao-fab" href="#inquiry" data-act="kakaoTalk">' + ico('message', 20) + '<span>카톡 상담</span></a>';
      o += '<nav class="mnav" aria-label="빠른 메뉴"><a href="#home">' + ico('home', 22) + '<span>홈</span></a><a href="#services">' + ico('grid', 22) + '<span>서비스</span></a><a href="#club">' + ico('swap', 22) + '<span>' + (f('pumon') ? '품온' : '나눔') + '</span></a><a href="#my">' + ico('user', 22) + '<span>마이</span></a><a href="tel:' + SITE.phone.replace(/[^\d]/g, '') + '">' + ico('phone', 22) + '<span>전화</span></a></nav>';
    }
    return o;
  };
  G.ACT.bigText = function () { T().bigText = !T().bigText; G.toast(T().bigText ? '글자를 크게 했어요.' : '글자를 보통으로 했어요.'); G.rerender(); };
  G.ACT.kakaoTalk = function (el, e) { e.preventDefault(); G.toast('카카오톡 채널 상담으로 연결돼요. (시연에서는 1:1 문의로 이동해요)'); setTimeout(function () { G.go('inquiry'); }, 600); };
  G.dockExtra = function () { return S.adminAuthed && G.adminMe && G.adminMe().role === 'ADMIN' ? '<a class="dock-reset dock-ft" href="#admin-features">' + ico('sliders', 16) + ' 단계별 기능 공개</a>' : '<a class="dock-reset dock-ft" href="#admin-login">' + ico('sliders', 16) + ' 단계별 기능 공개 (관리자)</a>'; };

  /* ================= 거점 찾기 ================= */
  var hubFilter = '';
  function hubCard(h) {
    var b = G.branch(h.branch) || {};
    return '<article class="hub" data-b="' + h.branch + '"><div class="hub-h"><span class="bd bd-' + (h.kind === '가맹점' ? 'dark' : 'info') + '">' + esc(h.kind) + '</span><span class="small">' + esc(b.name || '') + '</span></div><h3><a href="#place-' + h.id + '">' + esc(h.name) + '</a></h3>' +
      '<p class="hub-near">' + ico('pin', 16) + esc(h.near) + '</p><ul class="nb-m"><li>' + ico('clock', 15) + esc(h.hours) + '</li><li>' + ico('phone', 15) + esc(h.phone) + '</li></ul><p>' + h.facil.map(function (x) { return '<span class="tag">' + esc(x) + '</span>'; }).join('') + '</p>' +
      '<div class="fa"><a class="btn btn-fill btn-sm" href="#place-' + h.id + '">자세히 · 찾아가기</a><a class="btn btn-line btn-sm" href="tel:' + h.phone.replace(/[^\d]/g, '') + '">' + ico('phone', 16) + ' 전화</a></div></article>';
  }
  function mapSvg(hubs, cur) {
    return '<figure class="hub-map" aria-label="거점 약도"><svg viewBox="0 0 600 300" role="img"><title>거점 약도 (실제 지도가 아닌 위치 안내용 그림)</title><rect width="600" height="300" rx="14" fill="var(--sand)"/><path d="M0 190 C120 160 220 230 340 190 S520 150 600 175" stroke="#cfe0e6" stroke-width="16" fill="none"/><path d="M80 0 L140 300 M360 0 L320 300 M0 90 L600 120" stroke="#fff" stroke-width="10"/>' +
      hubs.map(function (h) { var x = Math.round(h.x * 560 + 20), y = Math.round(h.y * 240 + 30), on = h.id === cur; return '<a href="#place-' + h.id + '"><g transform="translate(' + x + ',' + y + ')"><circle r="' + (on ? 13 : 10) + '" fill="' + (h.kind === '가맹점' ? 'var(--garnet)' : 'var(--info)') + '" stroke="#fff" stroke-width="3"/><text y="-18" text-anchor="middle" font-size="13" fill="var(--ink)">' + esc(h.name.replace(/ \(.*\)/, '')) + '</text></g></a>'; }).join('') +
      '</svg><figcaption class="small">' + ico('info', 14) + ' 위치를 이해하기 쉽게 그린 약도예요. 정확한 길은 지도 앱 버튼으로 확인하세요. 내 위치(GPS)는 쓰지 않아요.</figcaption></figure>';
  }
  P.places = function () {
    if (!f('places')) return offPage('거점 찾기');
    var hubs = T().hubs, my = S.user ? G.memInfo(uid()).branch : '';
    var chips = '<div class="chips" role="group" aria-label="동네">' + [['', '전체 동네']].concat(T().branches.map(function (b) { return [b.id, b.name.replace(' (예시)', '') + (b.id === my ? ' · 내 동네' : '')]; })).map(function (c) { return '<button class="chip' + (hubFilter === c[0] ? ' on' : '') + '" data-act="hubF" data-v="' + c[0] + '">' + esc(c[1]) + '</button>'; }).join('') + '</div>';
    var l = hubs.filter(function (h) { return !hubFilter || h.branch === hubFilter; });
    return page('거점 찾기', G.pageHead('가까운 거점을 찾아보세요', '물건을 맡기고 찾는 곳, 이웃과 모이는 곳이에요. 큰 건물과 지하철 출구를 기준으로 길을 알려 드려요.', [['우리 동네', 'town'], ['거점 찾기']], 'PLACES'),
      townTabs('places') + chips + mapSvg(l, '') + '<div class="hub-grid">' + l.map(hubCard).join('') + '</div>' + (f('hubOps') ? '<div class="callout">' + ico('lock', 20) + '<div><strong>거점 보관함 이용 기준</strong><p>품온 나눔품·바꿈품은 거점 보관함에 맡기고 보관 코드로 찾아가요. 보관은 7일까지, 식품·의약품·고가품은 맡길 수 없어요.</p></div></div>' : ''));
  };
  G.ACT.hubF = function (el) { hubFilter = el.dataset.v; G.rerender(); };
  P.place = function (id) {
    var h = G.hub(id); if (!f('places') || !h) return offPage('거점');
    var b = G.branch(h.branch) || {}, ev = f('events') ? T().events.filter(function (e) { return e.hub === h.id && e.date.slice(0, 10) >= SITE.today && !e.pending; }) : [];
    var nw = f('news') ? T().news.filter(function (n) { return n.branch === h.branch; }).slice(0, 3) : [];
    return { title: h.name, html: '<section class="sd"><div class="wrap"><nav class="crumb crumb-row" aria-label="현재 위치"><a href="#home">홈</a><a href="#places">거점 찾기</a><span>' + esc(h.name) + '</span></nav><div class="sd-in"><div>' +
      '<p class="meta"><span class="bd bd-' + (h.kind === '가맹점' ? 'dark' : 'info') + '">' + esc(h.kind) + '</span><span class="grp">' + esc(b.name || '') + '</span></p><h1 class="h2">' + esc(h.name) + '</h1>' +
      mapSvg(T().hubs.filter(function (x) { return x.branch === h.branch; }), h.id) +
      '<div class="blk"><h2>찾아오는 길</h2><ol class="tl"><li><span>1</span><b>' + esc(h.near) + '</b></li><li><span>2</span><b>주소: ' + esc(h.addr) + '</b></li><li><span>3</span><b>도착하면 ' + (h.kind === '가맹점' ? '매장 직원' : '안내 데스크') + '에게 "더가넷 품온"이라고 말씀해 주세요.</b></li></ol><div class="fa">' + mapLinks(h.addr, h.name) + '<button class="btn btn-ghost btn-sm" data-act="copyAddr" data-v="' + esc(h.addr) + '">' + ico('copy', 16) + ' 주소 복사</button></div></div>' +
      '<div class="blk"><h2>이용 안내</h2><dl class="sum"><div class="kv"><dt>운영 시간</dt><dd>' + esc(h.hours) + '</dd></div><div class="kv"><dt>연락처</dt><dd>' + esc(h.phone) + '</dd></div><div class="kv"><dt>편의</dt><dd>' + h.facil.map(esc).join(' · ') + '</dd></div>' + (f('hubOps') ? '<div class="kv"><dt>보관함</dt><dd>' + h.lockers + '칸 · 7일 보관</dd></div>' : '') + '<div class="kv"><dt>모임</dt><dd>' + (h.meet ? '이웃 모임 장소로 쓸 수 있어요' : '모임 장소는 아니에요') + '</dd></div></dl></div>' +
      (ev.length ? '<div class="blk"><h2>이곳에서 열리는 모임</h2><ul class="mng">' + ev.map(function (e) { return '<li><div><b>' + esc(e.title) + '</b><small>' + e.date + ' · ' + e.joined.length + '/' + e.cap + '명</small></div><a class="btn btn-line btn-sm" href="#event-' + e.id + '">보기</a></li>'; }).join('') + '</ul></div>' : '') +
      (nw.length ? '<div class="blk"><h2>동네 소식</h2><ul class="mng">' + nw.map(function (n) { return '<li><div><b>' + esc(n.title) + '</b><small>' + esc(n.cat) + ' · ' + n.date + '</small></div></li>'; }).join('') + '</ul></div>' : '') +
      '</div><aside class="sd-aside"><div class="buy"><p class="buy-k">' + esc(b.name || '') + '</p><h2>' + esc(h.name) + '</h2><a class="btn btn-fill btn-block" href="tel:' + h.phone.replace(/[^\d]/g, '') + '">' + ico('phone', 18) + ' 전화하기</a>' + mapLinks(h.addr, h.name).replace(/btn-sm/g, 'btn-block') + '<dl class="buy-dl"><div><dt>운영</dt><dd>' + esc(h.hours) + '</dd></div><div><dt>가맹점</dt><dd>' + esc(b.phone || '') + '</dd></div></dl></div></aside></div></div></section>' };
  };
  G.ACT.copyAddr = function (el) { var v = el.dataset.v; try { navigator.clipboard.writeText(v).then(function () { G.toast('주소를 복사했어요.'); }, function () { G.toast(v); }); } catch (e) { G.toast(v); } };

  /* ================= 창립회원 사전 신청 ================= */
  P.preorder = function () {
    if (!f('preorder')) return offPage('사전 신청');
    var cnt = function (b) { return T().preorders.filter(function (r) { return r.branch === b; }).length + (T().preorderBase[b] || 0); };
    var bars = T().branches.map(function (b) { var n = cnt(b.id); return '<li><span>' + esc(b.name.replace(' (예시)', '')) + '</span><i><em style="width:' + Math.min(100, n * 2) + '%"></em></i><b>' + n + ' / 50명</b></li>'; }).join('');
    var wants = ['재능품', '서로품', '나눔품', '바꿈품', '공식 모임'];
    var form = '<form class="card form" data-sub="preSave" novalidate><h2 class="h3">사전 신청</h2><div class="fgrid">' + fg('po-n', '이름', '<input id="po-n" autocomplete="name">') + fg('po-p', '휴대폰 번호', '<input id="po-p" type="tel" inputmode="tel" placeholder="010-0000-0000">') +
      fg('po-b', '우리 동네', sel('po-b', T().branches.map(function (b) { return [b.id, b.name + ' (' + b.area.join('·') + ')']; }), '')) + '<div class="fg full"><span class="lb">관심 있는 것 (여러 개 가능)</span><div class="cks">' + wants.map(function (w) { return '<label class="chk"><input type="checkbox" name="po-w" value="' + w + '"> ' + w + '</label>'; }).join('') + '</div></div></div>' +
      '<label class="chk"><input type="checkbox" id="po-a"><span><b>[필수]</b> 오픈 안내를 위해 이름·휴대폰 번호·동네를 받는 데 동의해요. 오픈 후 3개월이 지나면 가입하지 않은 분의 정보는 지워요.</span></label><p class="err" id="po-e" hidden></p><button class="btn btn-fill btn-block" type="submit">창립회원 신청하기</button></form>';
    return page('창립회원 사전 신청', G.pageHead('우리 동네 품온,<br>창립회원이 되어 주세요', '동네마다 50명이 모이면 품온을 열어요. 창립회원에게는 첫 3개월 LIFE START 혜택과 창립회원 배지를 드려요.', [['우리 동네', 'town'], ['사전 신청']], 'FOUNDING MEMBERS'),
      townTabs('preorder') + '<div class="two"><div><ul class="mt-bars big">' + bars + '</ul><div class="callout">' + ico('gift', 20) + '<div><strong>창립회원 혜택</strong><p>첫 3개월 LIFE START 무료 · 창립회원 배지 · 오픈 기념 나눔데이 초대</p></div></div></div>' + form + '</div>');
  };
  G.SUB.preSave = function () {
    var n = val('po-n'), p = val('po-p'), w = Array.prototype.map.call(document.querySelectorAll('[name=po-w]:checked'), function (x) { return x.value; }), e = $('po-e');
    var err = !n ? '이름을 적어 주세요.' : !/^01\d-?\d{3,4}-?\d{4}$/.test(p) ? '휴대폰 번호를 010-0000-0000처럼 적어 주세요.' : !w.length ? '관심 있는 것을 하나 이상 골라 주세요.' : !$('po-a').checked ? '필수 동의에 체크해 주세요.' : '';
    if (err) { e.textContent = err; e.hidden = false; return; }
    T().preorders.unshift({ id: 'R' + (T().preorders.length + 10), name: n.charAt(0) + '*' + n.slice(-1), phone: p.replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, '$1-****-$3'), branch: val('po-b'), want: w, at: G.now() });
    G.log('창립회원 사전 신청: ' + val('po-b')); G.save(); G.toast('사전 신청을 받았어요. 오픈하면 문자로 알려 드릴게요.'); G.rerender();
  };

  /* ================= 모임 · 이벤트 ================= */
  function evCard(e) {
    var h = G.hub(e.hub) || {}, mine = e.joined.indexOf(uid()) >= 0, full = e.joined.length >= e.cap;
    return '<article class="ev"><div class="ev-d"><b>' + e.date.slice(5, 7).replace(/^0/, '') + '월 ' + e.date.slice(8, 10).replace(/^0/, '') + '일</b><span>' + e.date.slice(11) + '</span></div><div class="ev-b"><p class="meta"><span class="bd bd-' + (e.official === false ? 'info' : 'kind-o') + '">' + (e.official === false ? '회원 주최' : '공식 도란품') + '</span><span class="tag">' + esc(e.kind) + '</span>' + (mine ? '<span class="bd bd-ok">신청함</span>' : '') + '</p><h3><a href="#event-' + e.id + '">' + esc(e.title) + '</a></h3><p class="small">' + ico('pin', 14) + esc(h.name || '') + ' · ' + e.joined.length + '/' + e.cap + '명' + (e.benefit ? ' · 혜택: ' + esc(e.benefit) : '') + '</p></div><a class="btn btn-' + (full && !mine ? 'ghost' : 'line') + ' btn-sm" href="#event-' + e.id + '">' + (full && !mine ? '마감' : '보기') + '</a></article>';
  }
  P.events = function () {
    if (!f('events')) return offPage('모임·이벤트');
    var up = T().events.filter(function (e) { return e.date.slice(0, 10) >= SITE.today && !e.pending; }).sort(function (a, b) { return a.date > b.date ? 1 : -1; });
    var meet = f('memberMeet') ? (S.user ? (G.isRegular(uid()) ? '<form class="card form" data-sub="meetPropose" novalidate><h2 class="h3">모임 제안하기 (회원 주최 도란품)</h2><div class="fgrid">' + fg('mp-t', '모임 이름', '<input id="mp-t" placeholder="예: 아침 걷기 모임">') + fg('mp-d', '일시', '<input id="mp-d" type="datetime-local" min="' + SITE.today + 'T00:00">') + fg('mp-h', '장소 (거점만 가능)', sel('mp-h', T().hubs.filter(function (h) { return h.meet; }).map(function (h) { return [h.id, h.name]; }), '')) + fg('mp-c', '정원 (최대 12명)', '<input id="mp-c" type="number" min="2" max="12" value="6">') + fg('mp-x', '소개', '<textarea id="mp-x" rows="2" placeholder="회비·판매·종교·정치 권유가 없는 모임만 열 수 있어요."></textarea>', 'full') + '</div><p class="err" id="mp-e" hidden></p><button class="btn btn-fill btn-sm" type="submit">제안하기</button><p class="small">운영자가 확인한 뒤 공개해요. 첫 모임에는 가맹점 매니저가 함께해요.</p></form>' : '<p class="small mt">회원 주최 모임은 LIFE START 이상 정회원이 제안할 수 있어요.</p>') : '') : '';
    return page('모임·이벤트', G.pageHead('이웃과 만나는 자리', '더가넷이 여는 공식 도란품 모임과 회원 혜택 이벤트예요. 모두 거점에서 열려 처음이어도 안심이에요.', [['우리 동네', 'town'], ['모임·이벤트']], 'GATHERINGS'),
      townTabs('events') + (up.length ? '<div class="ev-list">' + up.map(evCard).join('') + '</div>' : G.empty('예정된 모임이 없어요.')) + meet);
  };
  G.SUB.meetPropose = function () {
    var t = val('mp-t'), d = val('mp-d'), x = val('mp-x'), e = $('mp-e'), c = Math.min(12, +val('mp-c') || 6);
    var err = t.length < 3 ? '모임 이름을 적어 주세요.' : !d ? '일시를 골라 주세요.' : /(회비|판매|투자|교회|전도|정당|선거)/.test(t + x) ? '회비·판매·종교·정치 권유가 있는 모임은 열 수 없어요.' : '';
    if (err) { e.textContent = err; e.hidden = false; return; }
    var hb = G.hub(val('mp-h')); T().events.push({ id: 'E' + (T().events.length + 10), branch: hb.branch, hub: hb.id, title: t, kind: '회원 주최', date: d.replace('T', ' '), cap: c, joined: [uid()], benefit: '', official: false, pending: true, host: uid(), desc: x });
    G.log('회원 주최 모임 제안: ' + t); G.save(); G.toast('모임을 제안했어요. 운영자가 확인하면 알려 드려요.'); G.rerender();
  };
  P.event = function (id) {
    var e = byId(T().events, id); if (!f('events') || !e) return offPage('모임');
    var h = G.hub(e.hub) || {}, mine = e.joined.indexOf(uid()) >= 0, full = e.joined.length >= e.cap, past = e.date.slice(0, 10) < SITE.today;
    var cta = !S.user ? needLogin('event-' + id) : past ? '<p class="hold">끝난 모임이에요.</p>' : mine ? '<p class="small">' + ico('check', 14) + ' 신청했어요. 하루 전에 알림을 드려요.</p><button class="btn btn-line btn-block" data-act="evJoin" data-id="' + id + '" data-v="0">참여 취소</button>' : full ? '<p class="hold">정원이 찼어요.</p>' : '<button class="btn btn-fill btn-block" data-act="evJoin" data-id="' + id + '" data-v="1">참여 신청</button>';
    return { title: e.title, html: '<section class="sd"><div class="wrap"><nav class="crumb crumb-row" aria-label="현재 위치"><a href="#home">홈</a><a href="#events">모임·이벤트</a><span>' + esc(e.title) + '</span></nav><div class="sd-in"><div><p class="meta"><span class="bd bd-' + (e.official === false ? 'info' : 'kind-o') + '">' + (e.official === false ? '회원 주최' : '공식 도란품') + '</span><span class="tag">' + esc(e.kind) + '</span></p><h1 class="h2">' + esc(e.title) + '</h1>' +
      '<ul class="nb-m nb-m-l"><li>' + ico('calendar', 16) + esc(e.date) + '</li><li>' + ico('pin', 16) + '<a class="lnk-i" href="#place-' + h.id + '">' + esc(h.name || '') + '</a></li><li>' + ico('users', 16) + e.joined.length + ' / ' + e.cap + '명</li></ul>' +
      '<div class="blk"><h2>안내</h2><p class="prose">' + G.nl(e.desc) + '</p>' + (e.benefit ? '<div class="callout">' + ico('gift', 20) + '<div><strong>참여 혜택</strong><p>' + esc(e.benefit) + '</p></div></div>' : '') + '</div><div class="blk"><h2>오시는 길</h2><p>' + esc(h.near || '') + '</p><div class="fa">' + mapLinks(h.addr || '', h.name) + '</div></div></div>' +
      '<aside class="sd-aside"><div class="buy"><p class="buy-k">' + esc(e.kind) + '</p><h2>' + esc(e.date) + '</h2>' + cta + '</div></aside></div></div></section>' };
  };
  G.ACT.evJoin = function (el) {
    var e = byId(T().events, el.dataset.id), on = el.dataset.v === '1', u = uid();
    if (on) { if (e.joined.length >= e.cap) return G.toast('정원이 찼어요.'); e.joined.push(u); G.notify(u, '[더가넷] "' + e.title + '" 참여 신청을 받았어요. ' + e.date + ', ' + (G.hub(e.hub) || {}).name); }
    else e.joined = e.joined.filter(function (x) { return x !== u; });
    G.save(); G.toast(on ? '참여를 신청했어요.' : '참여를 취소했어요.'); G.rerender();
  };

  /* ================= 동네 소식 ================= */
  var newsB = '';
  P.news = function () {
    if (!f('news')) return offPage('동네 소식');
    var l = T().news.filter(function (n) { return !newsB || n.branch === newsB; });
    return page('동네 소식', G.pageHead('동네 소식', '가맹점이 확인한 공공 서비스·주민센터 프로그램·지역 행사 소식이에요.', [['우리 동네', 'town'], ['동네 소식']], 'LOCAL NEWS'),
      townTabs('news') + '<div class="chips">' + [['', '전체']].concat(T().branches.map(function (b) { return [b.id, b.name.replace(' (예시)', '')]; })).map(function (c) { return '<button class="chip' + (newsB === c[0] ? ' on' : '') + '" data-act="newsF" data-v="' + c[0] + '">' + esc(c[1]) + '</button>'; }).join('') + '</div>' +
      (l.length ? '<div class="faq news-l">' + l.map(function (n) { return '<details><summary><span><span class="tag">' + esc(n.cat) + '</span> ' + esc(n.title) + ' <small class="small">' + n.date + '</small></span>' + ico('plus', 18, 'pl') + '</summary><div class="faq-a"><p>' + G.nl(n.body) + '</p></div></details>'; }).join('') + '</div>' : G.empty('아직 소식이 없어요.')));
  };
  G.ACT.newsF = function (el) { newsB = el.dataset.v; G.rerender(); };

  /* ================= 공동구매 ================= */
  P.groupbuy = function () {
    if (!f('groupbuy')) return offPage('공동구매');
    var l = T().groupbuys;
    return page('공동구매', G.pageHead('가넷 공동구매', '더가넷이 한꺼번에 사서 정회원에게만 예약으로 나눠 드려요. 최소 수량이 안 모이면 전액 돌려 드려요.', [['우리 동네', 'town'], ['공동구매']], 'GROUP BUY'),
      townTabs('groupbuy') + '<div class="gb-grid">' + l.map(function (g) {
        var q = g.orders.reduce(function (s, o) { return s + o[1]; }, 0) + g.base, mine = g.orders.filter(function (o) { return o[0] === uid(); })[0];
        return '<article class="card gb"><p class="meta"><span class="bd bd-' + (g.status === '모집 중' ? 'info' : 'mute') + '">' + esc(g.status) + '</span>' + (mine ? '<span class="bd bd-ok">예약 ' + mine[1] + '개</span>' : '') + '</p><h3>' + esc(g.title) + '</h3><p class="gb-p"><b>' + G.fmt(g.price) + '</b> <s>' + G.fmt(g.list) + '</s> <em>' + Math.round((1 - g.price / g.list) * 100) + '%</em></p>' +
          '<div class="ft-bar"><i style="width:' + Math.min(100, Math.round(q / g.min * 100)) + '%"></i></div><p class="small">' + q + '개 예약 · 최소 ' + g.min + '개 · ' + g.until + ' 마감 · ' + g.supply + ' 거점 수령</p>' +
          (g.status !== '모집 중' ? '' : !S.user ? '<a class="btn btn-line btn-sm" href="#login">로그인하고 예약</a>' : !G.isRegular(uid()) ? '<p class="small">LIFE START 이상 정회원만 예약할 수 있어요.</p><a class="btn btn-line btn-sm" href="#plans">멤버십 보기</a>' :
            '<form class="inl gb-f" data-sub="gbOrder" data-id="' + g.id + '">' + sel('gq-' + g.id, [1, 2, 3, 4, 5].map(function (n) { return [n, n + '개']; }), mine ? mine[1] : 1, ' aria-label="수량"') + sel('gh-' + g.id, g.pickup.map(function (h) { return [h, (G.hub(h) || {}).name]; }), '', ' aria-label="수령 거점"') + '<button class="btn btn-fill btn-sm" type="submit">' + (mine ? '예약 변경' : '예약하기') + '</button>' + (mine ? '<button class="btn btn-ghost btn-sm" type="button" data-act="gbCancel" data-id="' + g.id + '">취소</button>' : '') + '</form>') + '</article>';
      }).join('') + '</div><p class="small mt">공동구매 대금은 마감 후 수량이 확정되면 결제해요(시연). 품온 거래·후원금과는 따로 관리해요.</p>');
  };
  G.SUB.gbOrder = function (fm) { var g = byId(T().groupbuys, fm.dataset.id), n = +val('gq-' + g.id); g.orders = g.orders.filter(function (o) { return o[0] !== uid(); }); g.orders.push([uid(), n, val('gh-' + g.id)]); G.notify(uid(), '[더가넷] 공동구매 "' + g.title + '" ' + n + '개 예약했어요. 수령: ' + (G.hub(val('gh-' + g.id)) || {}).name); G.save(); G.toast('예약했어요.'); G.rerender(); };
  G.ACT.gbCancel = function (el) { var g = byId(T().groupbuys, el.dataset.id); g.orders = g.orders.filter(function (o) { return o[0] !== uid(); }); G.save(); G.toast('예약을 취소했어요.'); G.rerender(); };

  /* ================= 가넷 안심 약속 ================= */
  P.promise = function () {
    if (!f('promise')) return offPage('가넷 안심 약속');
    var pr = [['shield', '확인된 사람만 가요', '방문 인력은 신원·건강·안심 교육·배상 보험 배지를 갖추고, 방문 전에 누가 오는지 미리 알려 드려요.'], ['receipt', '승인한 만큼만 받아요', '예상 비용을 승인하기 전에는 아무것도 진행하지 않고, 추가 비용은 다시 승인받아요.'], ['clock', '진행을 그때그때 알려요', '시작·중간·끝 작업 일지와 사진을 남기고, 원하시면 가족에게도 함께 알려요.'], ['phone', '하루 안에 연락해요', '문제가 생기면 24시간 안에 담당자가 먼저 연락하고, 7일 안에 결과를 알려 드려요.'], ['users', '양쪽 이야기를 다 들어요', '분쟁은 상대방 이야기까지 들은 뒤 정해진 기준표대로 결정해요.'], ['lock', '연락처는 지켜요', '안심번호로 연결하고, 일이 끝나면 연결을 끊어요.']];
    return page('가넷 안심 약속', G.pageHead('가넷 안심 약속', '처음 맡기는 분도 마음 놓을 수 있도록, 더가넷이 지키는 여섯 가지 약속과 보상 기준이에요.', [['가넷 안심 약속']], 'OUR PROMISE'),
      '<div class="pr-grid">' + pr.map(function (p, i) { return '<article class="card-soft"><p class="kick">PROMISE ' + (i + 1) + '</p><h3>' + ico(p[0], 18) + ' ' + p[1] + '</h3><p>' + p[2] + '</p></article>'; }).join('') + '</div>' +
      '<h2 class="h3 gap">보상 기준표</h2><div class="card"><table class="tbl"><thead><tr><th>이럴 때</th><th>이렇게 보상해요</th></tr></thead><tbody>' + G.COMP.map(function (c) { return '<tr><td>' + c[0] + '</td><td>' + c[1] + '</td></tr>'; }).join('') + '</tbody></table><p class="small">보상은 분쟁 신청 후 상대방 진술을 들은 뒤 결정해요. 품온(회원 사이 약속)은 더가넷이 당사자가 아니어서 안전결제 대금 보관·환불 범위 안에서 도와드려요.</p>' + (f('dispute') ? '<p class="fa"><a class="btn btn-fill btn-sm" href="#my-dispute">문제 접수하기</a></p>' : '') + '</div>');
  };

  /* ================= 기업 · 기관 ================= */
  P.corp = function () {
    if (!f('corp')) return offPage('기업·기관 회원');
    var CF = [['cp-n', '기업·기관명 *'], ['cp-b', '사업자등록번호 / 고유번호 *'], ['cp-c', '대표자 *'], ['cp-t', '업종·기관 유형 *'], ['cp-a', '주소 *'], ['cp-m', '담당자 *'], ['cp-p', '담당자 연락처 *'], ['cp-e', '담당자 이메일 *'], ['cp-s', '이용 예정 인원']];
    return page('기업·기관 회원', G.pageHead('기업·기관과 함께하는 더가넷', '임직원 복지로, 또는 주민·이용자를 위한 협약으로 더가넷 서비스와 품온을 연결해요.', [['기업·기관 회원']], 'FOR TEAMS'),
      '<div class="two"><div><div class="card-soft"><h3>기업 복지 계정</h3><p>임직원에게 복지 코드를 나눠 드려요. 가입할 때 코드를 넣으면 회사가 정한 등급 혜택이 적용되고, 회사는 사용 인원과 금액만 보고 받아요(개인 이용 내용은 보지 않아요).</p></div><div class="card-soft mt"><h3>기관 협약</h3><p>주민센터·복지관 같은 기관은 협약으로 연결돼요. 스마트폰이 어려운 분은 기관 담당자나 가맹점이 대신 신청을 도와요. 나눔 사업을 여는 기관은 기부금단체 지정과 영수증 발급 여부를 확인해요.</p></div></div>' +
      '<form class="card form" data-sub="corpApply" novalidate><h2 class="h3">계정 신청</h2>' + fg('cp-k', '구분', sel('cp-k', ['기업', '기관', '단체'], '기업')) + '<div class="fgrid">' + CF.map(function (x) { return fg(x[0], x[1], '<input id="' + x[0] + '"' + (x[0] === 'cp-b' ? ' placeholder="000-00-00000"' : '') + '>'); }).join('') + '</div><label class="chk"><input type="checkbox" id="cp-g"><span><b>[필수]</b> 계정 심사를 위해 위 정보를 받는 데 동의해요.</span></label><p class="err" id="cp-x" hidden></p><button class="btn btn-fill btn-block" type="submit">신청하기</button><p class="small">운영자가 확인한 뒤 담당자 이메일로 복지 코드를 보내 드려요(시연).</p></form></div>');
  };
  G.SUB.corpApply = function () {
    var g = function (id) { return val(id); }, miss = [['cp-n', '이름'], ['cp-b', '사업자등록번호'], ['cp-c', '대표자'], ['cp-t', '업종'], ['cp-a', '주소'], ['cp-m', '담당자'], ['cp-p', '연락처'], ['cp-e', '이메일']].filter(function (x) { return !g(x[0]); }).map(function (x) { return x[1]; }), e = $('cp-x');
    if (!miss.length && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g('cp-e'))) miss.push('이메일 형식');
    if (!miss.length && !$('cp-g').checked) miss.push('필수 동의');
    if (miss.length) { e.textContent = '확인해 주세요: ' + miss.join(', '); e.hidden = false; return; }
    T().corps.push({ id: 'C' + (T().corps.length + 1), kind: g('cp-k'), name: g('cp-n'), bizNo: g('cp-b'), ceo: g('cp-c'), bizType: g('cp-t'), addr: g('cp-a'), manager: g('cp-m'), phone: g('cp-p'), email: g('cp-e'), seats: +g('cp-s') || 0, period: '심사 중', code: '', used: 0, pending: true });
    G.log('기업·기관 계정 신청: ' + g('cp-n')); G.save(); G.toast('신청을 받았어요. 확인 후 연락드릴게요.'); G.go('home');
  };

  /* ================= 나눔 ================= */
  var TG = ['보호가 필요한 아동', '혼자 사시는 어르신', '한부모·미혼모 가정', '소년소녀 가장', '경제적 어려움이 큰 이웃', '장애가 있는 이웃'];
  var tgF = '';
  var org = function (id) { return byId(T().orgs, id) || {}; };
  function gTabs(cur) { var t = [['giving', '나눔 사업'], ['giving-thegarnet', '더가넷 나눔'], ['giving-maeum', '마음품']]; if (f('givingNominate')) t.push(['giving-nominate', '추천·신청']); if (f('givingReport')) t.push(['giving-report', '나눔 보고서']); if (S.user) t.push(['my-giving', '나의 나눔']); return '<div class="tabs">' + t.map(function (x) { return '<a href="#' + x[0] + '" class="' + (cur === x[0] ? 'on' : '') + '">' + x[1] + '</a>'; }).join('') + '</div>'; }
  function pCard(p) {
    var r = G.projRaised(p.id), pct = Math.min(100, Math.round(r / p.goal * 100));
    return '<article class="card gv" data-t="' + esc(p.target) + '"><p class="meta"><span class="tag">' + esc(p.target) + '</span><span class="bd bd-' + (p.status === '모금 중' ? 'info' : 'ok') + '">' + esc(p.status) + '</span></p><h3><a href="#give-' + p.id + '">' + esc(p.title) + '</a></h3><p class="small">' + ico('shield', 14) + ' ' + esc(org(p.org).name) + ' · 검증 기관 · 영수증은 기관 발급</p>' +
      '<div class="ft-bar"><i style="width:' + pct + '%"></i></div><p class="gv-n"><b>' + G.fmt(r) + '</b> <span class="small">/ ' + G.fmt(p.goal) + ' · ' + pct + '%</span></p>' + (p.service ? '<p class="small">' + ico('handshake', 14) + ' 더가넷 손길 나눔: ' + esc(p.service) + '</p>' : '') + '<a class="btn btn-line btn-sm" href="#give-' + p.id + '">자세히 · 함께하기</a></article>';
  }
  P.giving = function (arg) {
    if (!f('giving')) return P.svc('S15');
    if (arg === 'thegarnet') return givingGarnet();
    if (arg === 'maeum') return givingMaeum();
    if (arg === 'nominate') return f('givingNominate') ? nominatePage() : offPage('나눔 추천');
    if (arg === 'report') return f('givingReport') ? reportPage() : offPage('나눔 보고서');
    var l = T().projects.filter(function (p) { return !tgF || p.target === tgF; });
    return page('나눔', G.pageHead('나눔이 어디에 닿는지<br>끝까지 보여 드려요', '검증한 기관이 도움이 필요한 분을 정하고, 모인 돈이 전달·집행되는 과정을 장부로 공개해요. 개인의 이름과 얼굴은 공개하지 않아요.', [['나눔']], 'GIVING'),
      gTabs('giving') + '<div class="chips">' + [''].concat(TG).map(function (t) { return '<button class="chip' + (tgF === t ? ' on' : '') + '" data-act="tgF" data-v="' + esc(t) + '">' + esc(t || '모든 대상') + '</button>'; }).join('') + '</div>' +
      (l.length ? '<div class="gv-grid">' + l.map(pCard).join('') + '</div>' : G.empty('이 대상의 나눔 사업이 아직 없어요.')) +
      '<div class="callout">' + ico('info', 20) + '<div><strong>왜 받는 분을 직접 고를 수 없나요?</strong><p>도움을 받는 분의 사생활과 안전을 지키기 위해, 사실 확인과 선정은 검증한 기관이 해요. 회원은 대상과 사업을 골라 함께하고, 결과는 보고서로 확인해요. (시연 화면에서는 실제 후원금이 오가지 않아요.)</p></div></div>');
  };
  G.ACT.tgF = function (el) { tgF = el.dataset.v; G.rerender(); };
  function givingGarnet() {
    var c = T().giveCfg, sum = function (w) { return T().ledger.filter(function (x) { return x.type === '모금' && x.who === w; }).reduce(function (s, x) { return s + x.amt; }, 0); };
    return page('더가넷 나눔', G.pageHead('더가넷이 직접 하는 나눔', '회원 후원과 별도로, 더가넷이 매출 일부와 손길을 나눠요. 더가넷 돈과 회원 후원금은 장부에서 따로 보여요.', [['나눔', 'giving'], ['더가넷 나눔']], 'OUR SHARE'),
      gTabs('giving-thegarnet') + '<div class="kpis k3"><div class="kpi"><span>매출 나눔 (매출의 ' + c.revenueRate + '%)</span><b>' + G.fmt(sum('더가넷')) + '</b></div><div class="kpi"><span>매칭 기부 (1:' + c.matchRatio + ', 사업별 ' + G.fmt(c.matchCap) + '까지)</span><b>' + G.fmt(sum('매칭')) + '</b></div><div class="kpi"><span>손길 나눔 (서비스)</span><b>' + T().projects.filter(function (p) { return p.service; }).length + '개 사업</b></div></div>' +
      '<div class="two"><div class="card-soft"><h3>매칭 기부</h3><p>회원이 1만 원을 후원하면 더가넷도 같은 금액을 더해요. 사업마다 한도가 있고, 한도가 차면 사업 화면에 알려 드려요.</p></div><div class="card-soft"><h3>손길 나눔</h3><p>정리수납·동행 같은 더가넷 서비스를 기관이 고른 가정에 무료로 제공해요. 방문 기록은 기관에만 공유해요.</p></div></div>');
  }
  function givingMaeum() {
    var wish = [['O2', '겨울 내복 (새 제품)', 20], ['O1', '아동 도서 (깨끗한 것)', 50], ['O3', '아기 옷 0~2세 (세탁한 것)', 30]];
    return page('마음품', G.pageHead('마음품: 물건으로 나누기', '기관이 꼭 필요하다고 알려 준 물건만 받아요. 품온 나눔품으로 올리고 거점 보관함에 맡기면 기관이 찾아가요.', [['나눔', 'giving'], ['마음품']], 'GOODS'),
      gTabs('giving-maeum') + '<div class="card"><table class="tbl"><thead><tr><th>기관</th><th>필요한 물건</th><th class="r">필요 수량</th><th></th></tr></thead><tbody>' + wish.map(function (w) { return '<tr><td>' + esc(org(w[0]).name) + '</td><td>' + esc(w[1]) + '</td><td class="r">' + w[2] + '</td><td>' + (f('pumon') ? '<a class="btn btn-line btn-sm" href="#club-new">나눔품으로 올리기</a>' : '') + '</td></tr>'; }).join('') + '</tbody></table><p class="small">물건 기부는 기부금 영수증 대상이 아닐 수 있어요. 식품·의약품·중고 속옷은 받지 않아요.</p></div>');
  }
  P.give = function (id) {
    var p = byId(T().projects, id); if (!f('giving') || !p) return offPage('나눔 사업');
    var o = org(p.org), led = T().ledger.filter(function (x) { return x.proj === id; }), rep = T().reports[id], r = G.projRaised(id), c = T().giveCfg;
    var mt = led.filter(function (x) { return x.who === '매칭'; }).reduce(function (s, x) { return s + x.amt; }, 0), left = Math.max(0, c.matchCap - mt);
    var flow = [['모금', r], ['기관 전달', G.projSpent(id, '전달')], ['집행', G.projSpent(id)]];
    var form = p.status !== '모금 중' ? '<p class="hold">모금이 끝난 사업이에요. 아래에서 결과를 확인하세요.</p>' : !S.user ? needLogin('give-' + id) :
      '<form data-sub="giveSave" data-id="' + id + '" novalidate><div class="pills amt">' + [10000, 30000, 50000, 100000].map(function (a, i) { return '<label class="pill"><input type="radio" name="gv-a" value="' + a + '"' + (i === 1 ? ' checked' : '') + '><span>' + (a / 10000) + '만 원</span></label>'; }).join('') + '</div>' + fg('gv-x', '직접 입력 (원)', '<input id="gv-x" type="number" min="1000" step="1000" placeholder="비우면 위 금액">') +
      '<div class="pills">' + [['일시', '한 번'], ['정기', '매달']].map(function (k, i) { return '<label class="pill"><input type="radio" name="gv-k" value="' + k[0] + '"' + (i === 0 ? ' checked' : '') + '><span>' + k[1] + '</span></label>'; }).join('') + '</div><label class="chk"><input type="checkbox" id="gv-o"> 후원자 명단에 이름(가운데 가림)을 공개해요</label>' +
      '<label class="chk"><input type="checkbox" id="gv-g"><span><b>[필수]</b> 후원금은 ' + esc(o.name) + ' 공식 계좌로 바로 가고, 기부금 영수증은 기관이 발급한다는 것을 확인했어요. 기관에 영수증 발급용 이름·연락처가 제공돼요.</span></label><p class="err" id="gv-e" hidden></p><button class="btn btn-fill btn-block" type="submit">함께하기 (시연)</button>' + (left ? '<p class="small">지금 후원하면 더가넷이 같은 금액을 더해요 (남은 매칭 ' + G.fmt(left) + ').</p>' : '<p class="small">이 사업의 매칭 한도가 다 찼어요.</p>') + '</form>';
    return { title: p.title, html: '<section class="sd"><div class="wrap"><nav class="crumb crumb-row" aria-label="현재 위치"><a href="#home">홈</a><a href="#giving">나눔</a><span>' + esc(p.title) + '</span></nav><div class="sd-in"><div><p class="meta"><span class="tag">' + esc(p.target) + '</span><span class="bd bd-info">' + esc(p.status) + '</span></p><h1 class="h2">' + esc(p.title) + '</h1>' +
      '<div class="blk"><h2>이야기</h2><p class="prose">' + G.nl(p.story) + '</p></div>' +
      '<div class="blk"><h2>함께하는 기관</h2><dl class="sum"><div class="kv"><dt>기관</dt><dd>' + esc(o.name) + ' <span class="bd bd-ok">검증 ' + esc(o.verified) + '</span></dd></div><div class="kv"><dt>유형</dt><dd>' + esc(o.type) + '</dd></div><div class="kv"><dt>기부금 영수증</dt><dd>' + (o.receipt ? '기관이 발급해요' : '발급 불가') + '</dd></div><div class="kv"><dt>받는 분 선정</dt><dd>기관이 사실을 확인해 정해요</dd></div></dl></div>' +
      '<div class="blk"><h2>사용 계획</h2><table class="tbl"><tbody>' + p.plan.map(function (x) { return '<tr><td>' + esc(x[0]) + '</td><td class="r">' + G.fmt(x[1]) + '</td></tr>'; }).join('') + '<tr class="tot"><td>목표</td><td class="r">' + G.fmt(p.goal) + '</td></tr></tbody></table></div>' +
      '<div class="blk"><h2>돈의 흐름</h2><ol class="gv-flow">' + flow.map(function (x) { return '<li><span>' + x[0] + '</span><b>' + G.fmt(x[1]) + '</b></li>'; }).join('') + '</ol><table class="tbl"><thead><tr><th>날짜</th><th>구분</th><th>출처</th><th class="r">금액</th><th>메모</th></tr></thead><tbody>' + led.map(function (x) { return '<tr><td>' + x.at + '</td><td>' + x.type + '</td><td>' + x.who + '</td><td class="r">' + G.fmt(x.amt) + '</td><td>' + esc(x.note) + '</td></tr>'; }).join('') + '</tbody></table><p class="small">장부를 고치면 이유와 함께 변경 기록이 남아요.</p></div>' +
      (rep && rep.approved ? '<div class="blk"><h2>결과 보고</h2><div class="callout">' + ico('check', 20) + '<div><strong>' + esc(o.name) + ' 보고 · ' + rep.approved + '</strong><p>' + G.nl(rep.text) + '</p></div></div></div>' : '') +
      '</div><aside class="sd-aside"><div class="buy"><p class="buy-k">' + esc(p.target) + '</p><h2>' + G.fmt(r) + '</h2><div class="ft-bar"><i style="width:' + Math.min(100, Math.round(r / p.goal * 100)) + '%"></i></div><p class="small">목표 ' + G.fmt(p.goal) + ' · ' + p.until + ' 마감</p>' + form + '</div></aside></div></div></section>' };
  };
  G.SUB.giveSave = function (fm) {
    var id = fm.dataset.id, p = byId(T().projects, id), a = +val('gv-x') || +(document.querySelector('[name=gv-a]:checked') || {}).value, k = (document.querySelector('[name=gv-k]:checked') || {}).value, e = $('gv-e');
    if (!(a >= 1000)) { e.textContent = '1,000원 이상으로 정해 주세요.'; e.hidden = false; return; }
    if (!$('gv-g').checked) { e.textContent = '필수 확인에 체크해 주세요.'; e.hidden = false; return; }
    var c = T().giveCfg, mt = T().ledger.filter(function (x) { return x.proj === id && x.who === '매칭'; }).reduce(function (s, x) { return s + x.amt; }, 0), m = Math.min(Math.round(a * c.matchRatio), Math.max(0, c.matchCap - mt));
    T().gifts.unshift({ id: 'GF' + (T().gifts.length + 10), user: uid(), proj: id, amt: a, match: m, kind: k, open: $('gv-o').checked, at: G.now() });
    T().ledger.push({ id: 'L' + Date.now() % 100000, proj: id, at: SITE.today, type: '모금', who: '회원', amt: a, note: '회원 후원 (' + k + ')' });
    if (m) T().ledger.push({ id: 'L' + (Date.now() + 1) % 100000, proj: id, at: SITE.today, type: '모금', who: '매칭', amt: m, note: '더가넷 매칭 기부' });
    G.notify(uid(), '[더가넷] "' + p.title + '"에 ' + G.fmt(a) + ' 함께해 주셨어요' + (m ? ' (더가넷 매칭 ' + G.fmt(m) + ')' : '') + '. 전달·집행되면 알려 드릴게요.');
    G.log('나눔 후원(시연): ' + id + ' ' + G.fmt(a)); G.save(); G.toast('고마워요. 나의 나눔에서 흐름을 볼 수 있어요.'); G.go('my-giving');
  };
  function nominatePage() {
    var form = !S.user ? needLogin('giving-nominate') : '<form class="card form" data-sub="nomSave" novalidate><div class="pills">' + ['이웃 추천', '본인 신청'].map(function (k, i) { return '<label class="pill"><input type="radio" name="nm-k" value="' + k + '"' + (i === 0 ? ' checked' : '') + '><span>' + k + '</span></label>'; }).join('') + '</div><div class="fgrid">' + fg('nm-t', '어떤 분인가요', sel('nm-t', TG, '')) + fg('nm-o', '연결할 기관', sel('nm-o', T().orgs.map(function (o) { return [o.id, o.name]; }), '')) + fg('nm-x', '상황 설명 (이름·주소·연락처는 적지 마세요)', '<textarea id="nm-x" rows="4"></textarea>', 'full') + '</div><label class="chk"><input type="checkbox" id="nm-c"><span><b>[필수]</b> (이웃 추천이면) 추천받는 분께 기관 연락에 대한 동의를 받았어요.</span></label><p class="err" id="nm-e" hidden></p><button class="btn btn-fill btn-block" type="submit">보내기</button></form>';
    return page('나눔 추천·신청', G.pageHead('도움이 필요한 이웃을 알려 주세요', '추천과 본인 신청은 기관이 먼저 사실을 확인하고, 외부 위원이 함께하는 심사위원회가 결정해요. 결과는 신청한 분에게만 알려요.', [['나눔', 'giving'], ['추천·신청']], 'NOMINATE'),
      gTabs('giving-nominate') + '<div class="two"><div><ol class="proc">' + [['접수', '이름 없이 상황만 받아요.'], ['기관 확인', '연결 기관이 직접 연락해 사실을 확인해요.'], ['심사', '심사위원회(3인 이상)가 기준표로 정해요.'], ['선정·지원', '선정되면 기관 사업으로 지원해요.']].map(function (s, i) { return '<li><span class="proc-n">' + (i + 1) + '</span><h3>' + s[0] + '</h3><p>' + s[1] + '</p></li>'; }).join('') + '</ol></div>' + form + '</div>');
  }
  G.SUB.nomSave = function () {
    var x = val('nm-x'), e = $('nm-e'), k = (document.querySelector('[name=nm-k]:checked') || {}).value;
    var err = x.length < 15 ? '상황을 15자 이상 적어 주세요.' : /(010-?\d{3,4}|\d{6}-\d|[가-힣]+(동|로|길)\s?\d+)/.test(x) ? '연락처·주민번호·자세한 주소는 적지 말아 주세요. 기관이 직접 확인해요.' : (k === '이웃 추천' && !$('nm-c').checked) ? '추천받는 분의 동의를 먼저 받아 주세요.' : '';
    if (err) { e.textContent = err; e.hidden = false; return; }
    T().nominations.unshift({ id: 'NM' + (T().nominations.length + 1), kind: k, target: val('nm-t'), org: val('nm-o'), text: x, by: uid(), at: SITE.today, st: '접수' });
    G.log('나눔 ' + k + ' 접수'); G.save(); G.toast('보냈어요. 기관이 확인하면 알려 드릴게요.'); G.rerender();
  };
  function reportPage() {
    var t = T(), tot = function (type, who) { return t.ledger.filter(function (x) { return x.type === type && (!who || x.who === who); }).reduce(function (s, x) { return s + x.amt; }, 0); };
    return page('나눔 보고서', G.pageHead('2026 나눔 보고서', '모인 돈, 기관에 전달된 돈, 실제로 쓰인 돈을 사업별로 공개해요.', [['나눔', 'giving'], ['나눔 보고서']], 'REPORT'),
      gTabs('giving-report') + '<div class="kpis k4"><div class="kpi"><span>모금</span><b>' + G.fmt(tot('모금')) + '</b></div><div class="kpi"><span>그중 더가넷 (매칭·매출 나눔)</span><b>' + G.fmt(tot('모금', '매칭') + tot('모금', '더가넷')) + '</b></div><div class="kpi"><span>기관 전달</span><b>' + G.fmt(tot('전달')) + '</b></div><div class="kpi"><span>집행 확인</span><b>' + G.fmt(tot('집행')) + '</b></div></div>' +
      '<div class="card mt"><table class="tbl"><thead><tr><th>사업</th><th>기관</th><th class="r">모금</th><th class="r">전달</th><th class="r">집행</th><th>보고</th></tr></thead><tbody>' + t.projects.map(function (p) { var rp = t.reports[p.id]; return '<tr><td><a class="lnk-i" href="#give-' + p.id + '">' + esc(p.title) + '</a></td><td>' + esc(org(p.org).name) + '</td><td class="r">' + G.fmt(G.projRaised(p.id)) + '</td><td class="r">' + G.fmt(G.projSpent(p.id, '전달')) + '</td><td class="r">' + G.fmt(G.projSpent(p.id)) + '</td><td>' + (rp && rp.approved ? '<span class="bd bd-ok">공개</span>' : '<span class="bd bd-mute">준비 중</span>') + '</td></tr>'; }).join('') + '</tbody></table><p class="small">장부 변경 ' + t.ledgerHist.length + '건은 모두 이유와 함께 기록돼 있어요. 외부 회계 검토 결과는 연 1회 함께 올려요.</p></div>');
  }

  /* ================= 기존 고객 화면 덧붙이기 ================= */
  function ins(h, marker, add, after) { var i = h.indexOf(marker); if (i < 0) return h; if (after) i += marker.length; return h.slice(0, i) + add + h.slice(i); }
  var oSvc = P.svc;
  P.svc = function (id) {
    var o = oSvc(id), s = G.sv(id); if (!s || !o.html) return o;
    var h = o.html;
    if (id === 'S15' && f('fixGiving')) {
      h = h.replace(/<a class="btn btn-fill btn-block" href="#apply-S15">신청하기<\/a>/, '').replace(/<a class="btn btn-(fill|line) btn-block" href="#memo-S15">상담 메모 남기기<\/a>/, '');
      h = h.replace('<p class="buy-p">신청 접수 후 운영자가 범위·일정·비용을 확인해 안내하며, 고객님이 승인하신 뒤에 진행됩니다. 승인 전에는 비용이 청구되지 않아요.</p>', '<p class="buy-p">기부·후원은 신청서와 견적으로 받지 않아요. 검증한 기관의 공식 창구로 바로 연결하고, 영수증은 기관이 발급해요.</p>' + (f('giving') ? '<a class="btn btn-fill btn-block" href="#giving">나눔 사업 둘러보기</a>' : '<a class="btn btn-fill btn-block" href="#inquiry">기관 안내 받기 (1:1 문의)</a>'));
      h = h.replace('<p class="small">모든 신청은 접수 → 운영자 검토 → 범위·비용 안내 → 고객 승인 → 진행 → 완료 보고 순서로 확인됩니다.</p>', '<p class="small">기부·후원은 견적·승인 절차 없이 기관 공식 창구로 연결돼요.</p>');
    }
    if (f('rating3')) {
      var rt = T().ratings.filter(function (r) { return r.svc === id; }), c = [0, 0, 0, 0]; rt.forEach(function (r) { c[r.level]++; });
      if (rt.length) h = ins(h, '<div class="two">', '<div class="sat"><b>' + Math.round((c[3] + c[2]) / rt.length * 100) + '%</b><span>회원 만족도</span><em>최고예요 ' + c[3] + ' · 좋아요 ' + c[2] + ' · 아쉬워요 ' + c[1] + '</em></div>');
    }
    if (f('priceTable') && T().prices[id]) {
      var pr = T().prices[id];
      h = ins(h, '<div class="blk"><h2>비용 안내</h2>', '<div class="blk pt-blk"><h2>정찰 예상 가격</h2><div class="pt-calc" data-per="' + pr.per + '"><span>' + esc(pr.unit) + '</span><div class="num"><button type="button" data-act="ptN" data-d="-1" aria-label="줄이기">' + ico('minus', 16) + '</button><input id="pt-n" type="number" min="' + pr.min + '" max="' + pr.max + '" value="' + pr.def + '" data-on="input:ptCalc" aria-label="' + esc(pr.unit) + '"><button type="button" data-act="ptN" data-d="1" aria-label="늘리기">' + ico('plus', 16) + '</button></div><b id="pt-t">' + G.fmt(pr.per * pr.def) + '</b></div><p class="small">' + esc(pr.unit) + '당 ' + G.fmt(pr.per) + ' · ' + esc(pr.note) + '. 현장 상황이 다르면 방문 전에 다시 알려 드리고 승인받아요.' + (S.user && f('coupons') && G.couponRate(uid())[0] ? ' 내 이용권 ' + G.couponRate(uid())[0] + '% 적용 가능.' : '') + '</p></div>');
    }
    var aside = '';
    if (f('phoneApply') && id !== 'S15') aside += '<a class="btn btn-line btn-block" href="tel:' + SITE.phone.replace(/[^\d]/g, '') + '">' + ico('phone', 18) + ' 전화로 신청 ' + esc(SITE.phone) + '</a>';
    if (f('promise')) aside += '<a class="lnk mt" href="#promise">' + ico('shield', 16) + ' 가넷 안심 약속 보기</a>';
    if (f('staff') && s.op !== 'PARTNER') aside += '<p class="small">' + ico('check', 14) + ' 방문 전에 담당자와 인증 배지를 미리 알려 드려요.</p>';
    if (aside) h = ins(h, '<button class="buy-fav', aside);
    if (f('bridge')) {
      var BR = { S03: '집안일·정리', S02: '식물·꽃', S06: '반려동물(보호자 동반)', S11: '말벗·산책' };
      if (BR[id] && f('pumon')) h = ins(h, '<div class="blk"><h2>유의사항</h2>', '<div class="callout">' + ico('swap', 20) + '<div><strong>가벼운 일이라면 이웃에게 부탁해 볼 수도 있어요</strong><p>품온에서 같은 동네 회원이 무료·실비로 도와줄 수 있어요. 전문 작업과 책임 보상이 필요하면 더가넷 서비스를 이용하세요.</p><p><a class="lnk" href="#club">품온 둘러보기 ' + ico('arrow-right', 16) + '</a></p></div></div>');
      if (id === 'S12') h = ins(h, '<div class="blk"><h2>유의사항</h2>', '<div class="callout warn">' + ico('info', 20) + '<div><strong>장기요양등급이 있으신가요?</strong><p>등급이 있으면 방문요양·방문목욕 같은 장기요양 급여를 먼저 확인하세요. 국민건강보험공단 1577-1000에서 안내받을 수 있고, 더가넷 동행은 급여로 안 되는 부분을 채워 드려요.</p></div></div>');
    }
    o.html = h; return o;
  };
  G.INP.ptCalc = function (el) { var box = el.closest('.pt-calc'), n = Math.max(+el.min, Math.min(+el.max, +el.value || 0)); $('pt-t').textContent = G.fmt(n * +box.dataset.per); };
  G.ACT.ptN = function (el) { var i = $('pt-n'), v = Math.max(+i.min, Math.min(+i.max, (+i.value || 0) + +el.dataset.d)); i.value = v; G.INP.ptCalc(i); };

  var oApply = P.apply;
  P.apply = function (id) {
    if (id === 'S15' && f('fixGiving')) return page('기부·후원', G.pageHead('기부·후원은 신청서로 받지 않아요', '후원금은 더가넷 매출이 아니어서 견적·결제 대신 검증 기관의 공식 창구로 연결해요.', [['서비스 신청', 'apply'], ['기부·후원']]), '<div class="fa">' + (f('giving') ? '<a class="btn btn-fill" href="#giving">나눔 사업 보기</a>' : '<a class="btn btn-fill" href="#inquiry">1:1 문의로 기관 안내 받기</a>') + '<a class="btn btn-line" href="#svc-S15">서비스 안내로</a></div>');
    var o = oApply(id);
    if (id && o.html && f('regular') && S.drafts[id] && S.drafts[id].step === 1) {
      var c = S.drafts[id].c, prev = T().staff.filter(function (w) { return S.apps.some(function (a) { return a.user === uid() && T().appStaff[a.no] === w.id; }); });
      o.html = ins(o.html, '<div class="fg"><label class="lb" for="c-budget">', '<div class="fg"><label class="lb" for="c-reg">정기 예약 <em class="opt">선택</em></label>' + sel('c-reg', [['', '한 번만'], ['매주', '매주'], ['격주', '격주'], ['매월', '매월']], c.regular || '', ' data-k="regular" data-on="change:drc2"') + '</div><div class="fg"><label class="lb" for="c-stf">담당자 지정 요청 <em class="opt">선택</em></label>' + sel('c-stf', [['', '요청 없음']].concat(prev.map(function (w) { return [w.name + ' ' + w.role, '지난번 ' + w.name + ' ' + w.role]; })), c.staffReq || '', ' data-k="staffReq" data-on="change:drc2"') + '</div>');
    }
    return o;
  };
  var oSubmit = G.ACT.asubmit;
  G.ACT.asubmit = function (el) {
    var id = el.dataset.id, d = S.drafts[id], c = d ? JSON.parse(JSON.stringify(d.c)) : {}, before = S.apps.length;
    oSubmit(el);
    if (S.apps.length > before) { var a = S.apps[0]; if (f('regular') && (c.regular || c.staffReq)) a.regular = { cycle: c.regular || '한 번', staff: c.staffReq || '' }; G.notify(a.user, '[더가넷] ' + G.sv(a.svc).name + ' 신청을 받았어요. 신청번호 ' + a.no); G.save(); }
  };

  var oHome = P.home;
  P.home = function () {
    var o = oHome(), tiles = [];
    if (f('pumon')) tiles.push(['club', 'swap', '품온', '이웃과 솜씨·시간·물건 나누기']);
    if (f('places')) tiles.push(['places', 'pin', '거점 찾기', '맡기고 모이는 동네 장소']);
    if (f('events')) tiles.push(['events', 'calendar', '모임·이벤트', '더가넷이 여는 공식 모임']);
    if (f('giving')) tiles.push(['giving', 'gift', '나눔', '어디에 닿는지 끝까지']);
    if (f('preorder')) tiles.push(['preorder', 'users', '창립회원 신청', '동네 50명이 모이면 오픈']);
    if (f('phoneApply')) tiles.push(['tel', 'phone', '전화로 신청', SITE.phone]);
    var strip = tiles.length ? '<section class="sec-tight home-tiles"><div class="wrap"><div class="tiles">' + tiles.map(function (t) { return '<a class="tile" href="' + (t[0] === 'tel' ? 'tel:' + SITE.phone.replace(/[^\d]/g, '') : '#' + t[0]) + '">' + ico(t[1], 26) + '<b>' + t[2] + '</b><span>' + esc(t[3]) + '</span></a>'; }).join('') + '</div></div></section>' : '';
    if (f('pwa')) strip += '<section class="sec-tight"><div class="wrap"><details class="card pwa"><summary>' + ico('phone', 20) + ' <b>휴대폰 홈 화면에 더가넷 추가하기</b> <span class="small">앱처럼 한 번에 열려요</span></summary><div class="two"><div><h3>아이폰</h3><ol class="ul"><li>사파리로 이 화면을 열어요.</li><li>아래 가운데 <b>공유</b> 버튼을 눌러요.</li><li><b>홈 화면에 추가</b>를 눌러요.</li></ol></div><div><h3>안드로이드</h3><ol class="ul"><li>크롬으로 이 화면을 열어요.</li><li>오른쪽 위 <b>점 세 개</b>를 눌러요.</li><li><b>홈 화면에 추가</b>를 눌러요.</li></ol></div></div></details></div></section>';
    if (strip) { var i = o.html.indexOf('</section>'); o.html = o.html.slice(0, i + 10) + strip + o.html.slice(i + 10); }
    return o;
  };

  var oPlans = P.plans;
  P.plans = function () {
    var o = oPlans();
    if (!(f('memberLink') || f('points') || f('coupons') || f('gradeFee'))) return o;
    var i = -1;
    o.html = o.html.replace(/<button class="btn (btn-fill|btn-line) btn-sm btn-block" data-act="plan"/g, function (m) {
      i++; var cr = i >= 7 ? 20 : i >= 5 ? 15 : i >= 3 ? 10 : i >= 1 ? 5 : 0, li = [];
      if (f('memberLink')) li.push(i >= 1 ? '품온 정회원' : '품온 60일 3회 체험');
      if (f('gradeFee')) li.push('유료 재능 수수료 ' + (i >= 3 ? '5%' : '10%'));
      if (f('points')) li.push('포인트 ' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 10][i] + '% 적립');
      if (f('coupons') && cr) li.push('월 이용권 ' + cr + '%');
      if (f('groupbuy') && i >= 1) li.push('공동구매 예약');
      return '<ul class="pl-x">' + li.map(function (x) { return '<li>' + ico('check', 14) + esc(x) + '</li>'; }).join('') + '</ul>' + m;
    });
    o.html = ins(o.html, '<div class="callout warn">', '<div class="card pl-tbl"><h2 class="h3">등급별 품온·혜택 한눈에</h2><table class="tbl"><thead><tr><th>구분</th><th>LIFE FREE</th><th>LIFE START~</th><th>상위 등급 (4등급~)</th></tr></thead><tbody>' +
      (f('memberLink') ? '<tr><td>품온</td><td>60일 동안 3회 체험 (나눔품 받기 1회 포함)</td><td>정회원 · 횟수 제한 없음</td><td>정회원</td></tr>' : '') + (f('gradeFee') ? '<tr><td>유료 재능 수수료</td><td>10%</td><td>10%</td><td>5%</td></tr>' : '') + (f('coupons') ? '<tr><td>이용권</td><td>-</td><td>5% (최대 1만 원)</td><td>10~20% (협력업체 서비스는 10%까지)</td></tr>' : '') + (f('points') ? '<tr><td>가넷 포인트</td><td>-</td><td>1~3%</td><td>4~10%</td></tr>' : '') +
      '</tbody></table>' + (f('corp') ? '<p class="small">회사·기관 복지로 이용하시나요? <a class="lnk-i" href="#corp">기업·기관 회원 안내</a></p>' : '') + '</div>');
    return o;
  };

  var oSignup = P.signup;
  P.signup = function () {
    var o = oSignup();
    if (!(f('memberTypes') || f('branches') || f('corp'))) return o;
    var add = '';
    if (f('memberTypes')) add += '<div class="fg"><span class="lb">회원 유형</span><div class="pills">' + [['개인', '개인'], ['기업', '기업'], ['기관', '기관·단체']].map(function (t, i) { return '<label class="pill"><input type="radio" name="s-type" value="' + t[0] + '"' + (i === 0 ? ' checked' : '') + ' data-on="change:sType"><span>' + t[1] + '</span></label>'; }).join('') + '</div></div>' +
      '<div id="s-org" hidden><p class="hint-s">기업·기관은 아래 필수 정보를 확인한 뒤 계정을 열어요.</p>' + [['s-on', '기업·기관명'], ['s-bn', '사업자등록번호 / 고유번호'], ['s-ceo', '대표자'], ['s-bt', '업종·기관 유형'], ['s-ad', '주소'], ['s-mg', '담당자']].map(function (x) { return fg(x[0], x[1] + ' <em class="req">필수</em>', '<input id="' + x[0] + '"' + (x[0] === 's-bn' ? ' placeholder="000-00-00000"' : '') + '>'); }).join('') + '</div>' +
      '<p class="hint-s">만 14세 미만은 법정대리인 동의가 있어야 가입할 수 있어요. 가맹점이나 1:1 문의로 도와 드려요.</p>';
    if (f('branches')) add += fg('s-br', '우리 동네 (가까운 가맹점)', sel('s-br', [['', '나중에 정할게요']].concat(T().branches.map(function (b) { return [b.id, b.name + ' (' + b.area.join('·') + ')']; })), ''));
    if (f('corp')) add += fg('s-cc', '기업·기관 복지 코드 <em class="opt">선택</em>', '<input id="s-cc" placeholder="회사·기관에서 받은 코드">');
    o.html = ins(o.html, '<label class="chk"><input type="checkbox" id="s-a1">', add);
    return o;
  };
  G.INP.sType = function (el) { var b = $('s-org'); if (b) b.hidden = el.value === '개인'; };
  var oSign = G.SUB.signup;
  G.SUB.signup = function (fm) {
    var type = (document.querySelector('[name=s-type]:checked') || { value: '개인' }).value, extra = null;
    if (f('memberTypes') && type !== '개인') {
      var need = [['s-on', '기업·기관명'], ['s-bn', '번호'], ['s-ceo', '대표자'], ['s-bt', '업종'], ['s-ad', '주소'], ['s-mg', '담당자']], miss = need.filter(function (x) { return !val(x[0]); }).map(function (x) { return x[1]; });
      if (!miss.length && type === '기업' && !/^\d{3}-\d{2}-\d{5}$/.test(val('s-bn'))) miss.push('사업자등록번호 형식');
      if (!miss.length && !val('s-ph')) miss.push('연락처');
      if (miss.length) { G.toast('기업·기관 필수 정보를 확인해 주세요: ' + miss.join(', ')); return; }
      extra = { '기업·기관명': val('s-on'), '사업자·고유번호': val('s-bn'), '대표자': val('s-ceo'), '업종': val('s-bt'), '주소': val('s-ad'), '담당자': val('s-mg') };
    }
    var br = val('s-br'), cc = val('s-cc'), corp = cc ? T().corps.filter(function (c) { return c.code && c.code.toLowerCase() === cc.toLowerCase(); })[0] : null;
    if (cc && f('corp') && !corp) { G.toast('복지 코드를 찾을 수 없어요. 다시 확인해 주세요.'); return; }
    var before = S.joined && S.joined.name; oSign(fm);
    if (S.joined && S.user === S.joined) {
      var m = G.memInfo(S.joined.id); m.type = type; m.branch = br; m.verified = false; if (extra) m.extra = extra; if (corp) { m.corp = corp.id; corp.used++; m.plan = 1; }
      if (extra && f('corp')) T().corps.push({ id: 'C' + (T().corps.length + 1), kind: type === '기업' ? '기업' : '기관', name: extra['기업·기관명'], bizNo: extra['사업자·고유번호'], ceo: extra['대표자'], bizType: extra['업종'], addr: extra['주소'], manager: extra['담당자'], phone: val('s-ph'), email: S.joined.email, seats: 0, period: '심사 중', code: '', used: 0, pending: true });
      G.save();
    }
  };
})();
