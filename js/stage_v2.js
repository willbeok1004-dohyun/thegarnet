/* V2 개편안 반영 (브랜드명은 그대로 · 더가넷)
   4개 영역(SHARE·LIFE·NATURE·HOPE) 메뉴·허브, 서비스 운영 정보, 시연 도구 숨김, 안내·정책 보강, 안전 규칙, 멤버십 3단계 시범, 관리자 우선 확인 */
(function () {
  'use strict';
  var S = G.state, P = G.PAGES, f = G.feat, esc = G.esc, ico = G.ico, T = function () { return S.st; };
  var $ = function (id) { return document.getElementById(id); };
  var uid = function () { return S.user ? S.user.id : ''; };
  var ins = function (h, anchor, add, after) { var i = h.indexOf(anchor); if (i < 0) return h; return after ? h.slice(0, i + anchor.length) + add + h.slice(i + anchor.length) : h.slice(0, i) + add + h.slice(i); };
  var lastIns = function (h, anchor, add) { var i = h.lastIndexOf(anchor); return i < 0 ? h : h.slice(0, i) + add + h.slice(i); };

  /* ---------- 단계·기능 스위치 ---------- */
  var ST = { id: 's7', name: '7단계 · 4개 영역·신뢰 개편 (V2)', why: '서비스를 나눔·생활·자연·후원 네 갈래로 보여 주고, 실제 운영 전 꼭 필요한 안내·안전·정책을 앞에 둬요.', items: [
    ['areas', '4개 영역(SHARE 나눔·LIFE 생활·NATURE 자연·HOPE 후원) 메뉴·허브·홈 첫 선택'],
    ['svcInfo', '서비스 목록 필터(영역·가격 형태)·상세 운영 정보(제공 주체·가격·취소·자격·위험·후기)'],
    ['demoHide', '공개 화면에서 시연 도구·데모 계정 숨김 (시연 모드: 주소 뒤에 ?demo=1)'],
    ['guideV2', '이용 안내·정책·상담 메모·품온 안전 규칙·프로필 권리 보강'],
    ['plan3', '멤버십 3단계(무료·플러스·케어) 시범 공개, 10단계 기획안은 보관'],
    ['adminV2', '관리자 대시보드 우선 확인 카드']] };
  if (!G.STAGES.some(function (x) { return x.id === 's7'; })) G.STAGES.push(ST);
  function ensure() { if (!S.st || !S.st.flags) return; ST.items.forEach(function (i) { if (S.st.flags[i[0]] === undefined) S.st.flags[i[0]] = true; }); }
  ensure(); G.save();
  var oReset = G.reset; G.reset = function () { oReset(); ensure(); G.save(); };
  var oApply = G.stageApply; G.stageApply = function () { oApply(); ensure(); };

  /* ---------- 4개 영역 ---------- */
  var AREA_SVC = { life: ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S12', 'S13'], nature: ['S11', 'S14'], hope: ['S15'] };
  var AREAS = [
    { k: 'share', en: 'SHARE', ko: '나눔', cta: '나누기', line: '이웃과 솜씨·시간·물건을 나눠요', sub: '가입한 이웃끼리 무료·실비·유료로 주고받아요.', ic: 'swap', to: '#share' },
    { k: 'life', en: 'LIFE', ko: '생활', cta: '도움받기', line: '집과 일상을 돌보는 전문 서비스', sub: '운영자 확인 후 견적을 안내해요. 승인 전에는 비용이 청구되지 않아요.', ic: 'home', to: '#life' },
    { k: 'nature', en: 'NATURE', ko: '자연', cta: '쉬기', line: '걷고 쉬며 회복하는 시간', sub: '명상·산책·계절여행. 일정과 안전을 먼저 안내해요.', ic: 'leaf', to: '#nature' },
    { k: 'hope', en: 'HOPE', ko: '후원', cta: '희망 전하기', line: '기관과 함께하는 후원', sub: '후원금은 더가넷 매출이 아니에요. 기관의 공식 창구로 연결해요.', ic: 'heart', to: '#hope' }
  ];
  var areaOf = G.areaOf = function (id) { var r = 'life'; Object.keys(AREA_SVC).forEach(function (k) { if (AREA_SVC[k].indexOf(id) >= 0) r = k; }); return r; };
  var areaInfo = function (k) { return AREAS.filter(function (a) { return a.k === k; })[0]; };
  var priceKind = G.priceKind = function (id) { return id === 'S15' ? '후원 · 기관이 금액을 정해요' : (id === 'S01' || id === 'S02') ? '정기 이용 · 견적 후 안내' : '견적 후 안내 · 승인 전 비용 없음'; };
  var svcList = function (ids) { return ids.filter(function (id) { var x = G.sv(id); return x && G.flag(id).state !== 'HIDDEN'; }); };
  var cards = function (ids) { var l = svcList(ids); return l.length ? '<div class="grid-sc" id="v2grid">' + l.map(function (id) { return G.svcCard(G.sv(id)); }).join('') + '</div>' : ''; };
  var sec = function (t, body, cls, sub) { return '<section class="sec ' + (cls || 'sec-tight') + '"><div class="wrap">' + (t ? '<h2 class="h3">' + t + '</h2>' : '') + (sub ? '<p class="small mb">' + sub + '</p>' : '') + body + '</div></section>'; };
  var box = function (ic, t, p) { return '<article class="v2-box">' + ico(ic, 22) + '<div><h3>' + t + '</h3><p>' + p + '</p></div></article>'; };
  var boxes = function (a) { return '<div class="v2-boxes">' + a.map(function (x) { return box(x[0], x[1], x[2]); }).join('') + '</div>'; };
  var pilot = function () { var b = (T() && T().branches) || []; return b.map(function (x) { return x.area && x.area[0] ? x.area[0] : ''; }).filter(Boolean).join('·') || '마포·송파'; };
  var head = function (kick, title, sub, crumb) { return G.pageHead(title, sub, [[crumb]], kick); };

  /* 메뉴 */
  var oSiteNav = G.siteNav;
  G.siteNav = function (NAV) {
    var n = oSiteNav ? oSiteNav(NAV) : NAV.slice();
    if (!f('areas')) return n;
    var keep = n.filter(function (x) { return ['town', 'guide', 'plans', 'faq'].indexOf(x[0]) >= 0; });
    return AREAS.map(function (a) { return [a.k, a.en + ' ' + a.ko]; }).concat(keep);
  };
  var MAP0 = null;
  var oLayout = G.siteLayout;
  G.siteLayout = function (out, r) {
    var m = G.navMapExtra = G.navMapExtra || {};
    if (!MAP0) { MAP0 = {}; ['club', 'services', 'svc', 'apply', 'memo', 'find', 'done', 'special', 'petshop', 'pet', 'petbook', 'giving', 'give', 'share', 'life', 'nature', 'hope'].forEach(function (k) { MAP0[k] = m[k]; }); }
    if (f('areas')) {
      m.club = 'share'; m.share = 'share'; ['services', 'apply', 'memo', 'find', 'done', 'special', 'petshop', 'pet', 'petbook', 'life'].forEach(function (k) { m[k] = 'life'; });
      m.svc = areaOf(String(r && r.arg || '')); m.nature = 'nature'; m.hope = 'hope'; m.giving = 'hope'; m.give = 'hope';
    } else Object.keys(MAP0).forEach(function (k) { if (MAP0[k] === undefined) delete m[k]; else m[k] = MAP0[k]; });
    var h = oLayout(out, r);
    if (f('areas')) h = h.replace('<nav class="nav" aria-label="주요 메뉴">', '<nav class="nav nav-many" aria-label="주요 메뉴">');
    /* 접근성: 본문 바로가기 · 시연 고지와 정책·고객센터 분리 */
    if (f('guideV2') || f('demoHide')) {
      h = h.replace('<header class="hd"', '<button type="button" class="skip" data-act="skipMain">본문 바로가기</button><header class="hd"');
      h = h.replace(/\s*이 화면은 미리보기용 시안이며 실제 접수·결제·후원금 수령은 이루어지지 않습니다\./, '');
      var note = '<div class="demo-note" role="note"><strong>시연 안내</strong><span>이 화면은 미리보기용 시안이에요. 실제 접수·결제·후원금 수령은 이루어지지 않고, 입력한 내용은 이 브라우저에만 저장돼요.</span></div>';
      var i = h.lastIndexOf('</footer>'); if (i >= 0) h = h.slice(0, i) + note + h.slice(i);
    }
    return h;
  };
  G.ACT.skipMain = function () { var m = $('main'); if (m) { m.setAttribute('tabindex', '-1'); m.focus(); m.scrollIntoView(); } };

  /* ---------- 허브 공통 ---------- */
  function svcHubFilters() {
    var chip = function (g, v, l, on) { return '<button class="chip' + (on ? ' on' : '') + '" data-act="v2hub" data-g="' + g + '" data-v="' + v + '" aria-pressed="' + !!on + '">' + l + '</button>'; };
    return '<div class="v2-fl" role="group" aria-label="탐색 조건"><div><b>제공 방식</b>' + chip('op', '', '전체', true) + chip('op', 'DIRECT', '직접 제공', false) + chip('op', 'MIXED', '직접 + 연계', false) + chip('op', 'PARTNER', '전문기관·업체 연계', false) + '</div>' +
      '<div><b>진행 상태</b>' + chip('st', '', '전체', true) + chip('st', 'BOOKABLE', '신청 가능', false) + chip('st', 'OTHER', '준비·안내', false) + '</div>' +
      '<div><b>가격 형태</b>' + chip('pk', '', '전체', true) + chip('pk', 'Q', '견적 후 안내', false) + chip('pk', 'R', '정기 이용', false) + chip('pk', 'H', '후원', false) + '</div></div><p class="cat-cnt" id="v2cnt" aria-live="polite"></p><div class="empty" id="v2empty" hidden><p>조건에 맞는 서비스가 없어요. 조건을 바꾸거나 상담 메모로 먼저 남겨 보세요.</p></div>';
  }
  var hubSt = { op: '', st: '', pk: '' };
  function hubApply() {
    var g = $('v2grid'); if (!g) return; var n = 0, tot = 0;
    g.querySelectorAll('.sc').forEach(function (c) {
      var id = c.dataset.id, s = G.sv(id), pk = id === 'S15' ? 'H' : (id === 'S01' || id === 'S02') ? 'R' : 'Q', on = c.dataset.onState === 'BOOKABLE';
      var ok = (!hubSt.op || s.op === hubSt.op) && (!hubSt.st || (hubSt.st === 'BOOKABLE' ? on : !on)) && (!hubSt.pk || pk === hubSt.pk);
      c.hidden = !ok; tot++; if (ok) n++;
    });
    var c = $('v2cnt'); if (c) c.textContent = tot + '개 중 ' + n + '개'; var e = $('v2empty'); if (e) e.hidden = n > 0;
  }
  G.ACT.v2hub = function (el) {
    hubSt[el.dataset.g] = el.dataset.v; el.parentNode.querySelectorAll('.chip').forEach(function (c) { var on = c === el; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); }); hubApply();
  };

  /* SHARE 허브 */
  P.share = function () {
    if (!f('areas')) return P.club('');
    var pm = f('pumon'), sv = pm && G.PUMON ? G.PUMON : {};
    var types = boxes([['gift', '무료 나눔', '금전·물품 등 어떤 대가도 받지 않아요. 수수료도 없어요.'], ['clock', '실비 공유', '재료비·교통비처럼 실제로 든 비용만 만나서 나눠요. 수수료는 없어요.'], ['shield', '유료', '금액을 글에 분명히 적고 안전결제로만 주고받아요.']]);
    var four = pm ? '<div class="v2-boxes">' + Object.keys(sv).map(function (k) { return '<a class="v2-box v2-lk" href="#club" data-act="navClub" data-v="' + k + '">' + ico(sv[k].ico || 'star', 22) + '<div><h3>' + esc(sv[k].name) + '</h3><p>' + esc(sv[k].line) + '</p></div></a>'; }).join('') + '</div>' : '';
    var html = head('SHARE', '이웃과 나누는<br>따뜻한 연결', '솜씨와 시간, 안 쓰는 물건을 가입한 이웃끼리 나눠요. 처음이어도 괜찮아요. 안전 수칙을 먼저 알려 드릴게요.', '나눔 SHARE') +
      sec('도움 주기 · 도움 받기', '<div class="v2-cta"><a class="btn btn-fill" href="#club">이웃 글 둘러보기</a><a class="btn btn-line" href="#club-new">나눔 글 올리기</a><a class="btn btn-line" href="#club-mine">내 활동</a></div>' +
        '<p class="small mt">무료 회원은 60일 동안 3회까지 참여를 체험할 수 있고, 정회원은 횟수 제한 없이 이용해요. (무료 참여 범위는 최종 정책 승인 후 고정돼요.)</p>') +
      sec('무료 · 실비 · 유료, 이렇게 달라요', types, 'sec-sand') +
      (four ? sec('4가지 나눔', four, 'sec-tight', '하나를 누르면 그 나눔의 글만 모아 보여 드려요.') : '') +
      sec('지역 활동', '<div class="v2-cta">' + (f('places') ? '<a class="btn btn-line" href="#places">가까운 거점 찾기</a>' : '') + (f('events') ? '<a class="btn btn-line" href="#events">모임·이벤트</a>' : '') + (f('news') ? '<a class="btn btn-line" href="#news">동네 소식</a>' : '') + '</div><p class="small mt">시범 운영 동네: ' + esc(pilot()) + '</p>', 'sec-tight') +
      sec('안전 수칙', boxes([['pin', '공공장소에서 만나요', '처음 만남은 거점·공공장소에서 시작하고, 집 방문은 2인 이상으로 해요.'], ['lock', '연락처는 검증 뒤에', '수락만으로는 연락처가 보이지 않아요. 운영자가 확인하면 열려요.'], ['info', '문제가 생기면 바로 신고', '글·사람이 불편하면 신고하기를 눌러 주세요. 응급 상황은 119, 위협은 112입니다.']]) + '<div class="v2-cta mt"><a class="btn btn-line btn-sm" href="#club-rules">이용 기준 전체 보기</a></div>', 'sec-sand');
    return { title: '나눔 SHARE', html: html };
  };

  /* LIFE 허브 */
  P.life = function () {
    if (!f('areas')) return P.services();
    hubSt = { op: '', st: '', pk: '' };
    var personal = '<div class="v2-boxes"><a class="v2-box v2-lk" href="#special">' + ico('gift', 22) + '<div><h3>특별한 날</h3><p>탄생 상징·사이즈를 연결해 기념일 선물을 준비해요.</p></div></a>' +
      (f('petShop') ? '<a class="v2-box v2-lk" href="#petshop">' + ico('heart', 22) + '<div><h3>반려동물 물품</h3><p>바로 사기와 치수 맞춤 제작 중에서 골라요.</p></div></a>' : '') +
      (f('petBook') ? '<a class="v2-box v2-lk" href="' + (S.user ? '#my-petbook' : '#login') + '">' + ico('file', 22) + '<div><h3>반려동물 성장 기록책</h3><p>사진과 글로 기록하고 책으로 엮어요.</p></div></a>' : '') + '</div>' +
      '<p class="small mt">맞춤 제작은 시안과 금액을 확인하고 <b>고객이 승인한 뒤에 시작</b>해요. 변경·승인 내용은 주문 내역에 기록으로 남아요. 제작·배송 기간은 확정 약속이 아니라 예상 일정으로 안내해요.</p>';
    var html = head('LIFE', '집과 일상을<br>돌보는 도움', '운영자가 가능 범위와 비용을 확인해 안내하고, 승인하기 전에는 아무것도 진행되지 않아요. 지역·진행 상태를 확인하고 골라 보세요.', '생활 LIFE') +
      sec('', svcHubFilters() + cards(AREA_SVC.life), 'sec-tight') +
      sec('개인 맞춤', personal, 'sec-sand') +
      sec('', '<div class="callout">' + ico('info', 20) + '<div><strong>진행 상태 안내</strong><p>시범 운영 동네는 ' + esc(pilot()) + '이에요. 이 미리보기에서는 신청 흐름을 모두 열어 두었고, 실제 운영에서는 관리자가 확인한 서비스만 “신청 가능”으로 열려요.</p></div></div>', 'sec-tight');
    return { title: '생활 LIFE', html: html };
  };

  /* NATURE 허브 */
  P.nature = function () {
    if (!f('areas')) return P.services();
    hubSt = { op: '', st: '', pk: '' };
    var html = head('NATURE', '걷고 쉬며<br>회복하는 시간', '회복·산책·계절여행을 천천히 골라 보세요. 일정·인원·안전과 우천 시 안내를 먼저 알려 드려요.', '자연 NATURE') +
      sec('', cards(AREA_SVC.nature), 'sec-tight') +
      sec('신청 전에 알아 두세요', boxes([['clock', '일정·인원', '프로그램마다 일정과 인원이 달라요. 신청 후 운영자가 가능한 날짜와 인원을 확인해 안내해요.'], ['shield', '안전', '건강 상태나 이동에 어려움이 있으면 미리 알려 주세요. 응급·의료 행위는 하지 않고, 응급 상황에서는 119에 연락해요.'], ['info', '우천·날씨', '비·폭염·한파처럼 안전이 걱정되면 일정 변경이나 취소를 먼저 안내해요. 변경·취소 비용은 서비스별 안내를 따라요.'], ['handshake', '책임 구분', '단순한 산책·휴식과 숙박·여행상품은 책임 주체가 달라요. 여행상품은 협력 여행사가 안내하는 조건을 따라요.']]), 'sec-sand') +
      sec('지역 제휴', '<p class="small">우리 동네 거점과 제휴 장소에서 모임이나 산책 프로그램을 열 수 있어요.</p><div class="v2-cta">' + (f('places') ? '<a class="btn btn-line" href="#places">거점 찾기</a>' : '') + (f('events') ? '<a class="btn btn-line" href="#events">모임·이벤트</a>' : '') + '<a class="btn btn-line" href="#memo">상담 메모 남기기</a></div>', 'sec-tight');
    return { title: '자연 NATURE', html: html };
  };

  /* HOPE 허브 */
  P.hope = function () {
    if (!f('areas')) return f('giving') ? P.giving('') : P.svc('S15');
    var links = [['gift', '후원 사업 보기', '기관이 올린 사업을 보고 직접 후원해요.', '#giving'], ['heart', '더가넷 나눔', '더가넷이 별도로 기부하는 내용을 확인해요.', '#giving-thegarnet'], ['swap', '마음품 연결', '기관이 필요한 물건을 직접 보내요.', '#giving-maeum']];
    if (f('campaign')) links.push(['users', '공동 캠페인', '더가넷·기관·회원이 함께하는 캠페인이에요.', '#giving-campaign']);
    if (f('givingNominate')) links.push(['message', '나눔 추천·신청', '도움이 필요한 분을 추천하거나 직접 신청해요.', '#giving-nominate']);
    if (f('givingReport')) links.push(['file', '나눔 보고서', '후원이 어디에 쓰였는지 결과를 확인해요.', '#giving-report']);
    var html = head('HOPE', '기관과 함께<br>희망을 전해요', '후원은 기관이 정한 방식으로 이루어지고, 더가넷은 연결과 안내를 맡아요. 후원금은 더가넷의 서비스 매출이 아니에요.', '후원 HOPE') +
      sec('후원하기', '<div class="v2-boxes">' + links.map(function (x) { return '<a class="v2-box v2-lk" href="' + x[3] + '">' + ico(x[0], 22) + '<div><h3>' + x[1] + '</h3><p>' + x[2] + '</p></div></a>'; }).join('') + '</div>', 'sec-tight') +
      (cards(AREA_SVC.hope) ? sec('후원 서비스 안내', cards(AREA_SVC.hope), 'sec-tight') : '') +
      sec('믿고 후원하실 수 있도록', boxes([['link', '기관 공식 창구', '금액과 방식은 후원하실 기관의 공식 창구에서 정해요. 더가넷이 대신 받지 않아요.'], ['file', '실적과 회계 투명성', '나눔 장부는 서비스 매출과 따로 관리하고, 결과 보고서로 공개해요.'], ['shield', '지원 사연 동의', '도움받는 분의 사연·사진은 본인(또는 보호자)이 동의한 경우에만 공개해요.'], ['info', '영수증과 취소', '기부금 영수증과 후원 취소·환불은 후원하신 기관의 규정을 따라요.']]), 'sec-sand');
    return { title: '후원 HOPE', html: html };
  };

  /* ---------- 홈: 첫 선택 4가지 + 안내 ---------- */
  var oHome = P.home;
  P.home = function () {
    var o = oHome.apply(this, arguments); if (!f('areas') || !o || !o.html) return o;
    var cta = '<div class="hero-cta v2-four">' + AREAS.map(function (a, i) { return '<a class="btn ' + (i === 1 ? 'btn-fill' : 'btn-line') + '" href="' + a.to + '">' + esc(a.cta) + '</a>'; }).join('') + '</div><p class="small v2-cta-n">하고 싶은 것을 하나 골라 보세요. 천천히 정해도 괜찮아요.</p>';
    o.html = o.html.replace(/<div class="hero-cta">[\s\S]*?<\/div>/, cta);
    var band = '<section class="sec sec-tight v2-areas"><div class="wrap"><div class="v2-ar">' + AREAS.map(function (a) { return '<a class="v2-ac" href="' + a.to + '">' + ico(a.ic, 26) + '<small>' + a.en + '</small><h3>' + a.ko + '</h3><p>' + esc(a.line) + '</p><span>' + esc(a.sub) + '</span></a>'; }).join('') + '</div>' +
      '<div class="v2-info"><div><h4>무료와 유료</h4><p>나눔은 무료·실비·유료로 나뉘어요. 생활 서비스는 견적을 확인하고 승인한 뒤에 시작하고, 승인 전에는 비용이 청구되지 않아요.</p></div>' +
      '<div><h4>시범 운영</h4><p>' + esc(pilot()) + ' 동네에서 시범으로 시작해요. 실제 제공 가능 여부는 서비스마다 확인 후 안내해요.</p></div>' +
      '<div><h4>쉽게 쓰기</h4><p><button class="lnk-u" data-act="bigText">글자 크게 보기</button> · 전화로 신청 ' + esc(SITE.phone) + ' · 키보드로도 모두 이동할 수 있어요.</p></div></div></div></section>';
    var i = o.html.indexOf('</section>'); if (i >= 0) o.html = o.html.slice(0, i + 10) + band + o.html.slice(i + 10);
    return o;
  };

  /* ---------- 찾기: 이유·대안·민감정보 안내 ---------- */
  var oMood = G.moodPanel;
  if (oMood) G.moodPanel = function (i) {
    var h = oMood(i); if (!f('areas')) return h;
    var m = /#svc-(S\d+)/.exec(h), id = m && m[1], add;
    if (!id) {
      add = '<div class="v2-why"><h4>무엇부터 할지 막막하다면, 마음에 가까운 것 하나만 골라요</h4><div class="v2-cta">' + AREAS.map(function (a) { return '<a class="btn btn-line btn-sm" href="' + a.to + '">' + esc(a.cta) + ' · ' + a.ko + '</a>'; }).join('') + '</div><p class="small">여기서 고른 내용은 저장하지 않아요. 이름·전화번호·병명 같은 민감한 정보는 묻지 않아요.</p></div>';
    } else {
      var s = G.sv(id), ar = areaInfo(areaOf(id)), alt = svcList(AREA_SVC[areaOf(id)]).filter(function (x) { return x !== id; }).slice(0, 2);
      add = '<div class="v2-why"><h4>이렇게 추천했어요</h4><p>고르신 상황과 가장 가까운 서비스예요. <span class="bd bd-info">' + ar.en + ' ' + ar.ko + '</span> <span class="bd bd-mute">' + esc(priceKind(id)) + '</span></p>' +
        '<p class="small">다른 선택지도 있어요: ' + alt.map(function (x) { return '<a href="#svc-' + x + '">' + esc(G.sv(x).name) + '</a>'; }).join(' · ') + (areaOf(id) !== 'hope' ? ' · <a href="#share">무료로 이웃과 나누기</a>' : '') + '</p>' +
        '<p class="small">선택 내용은 저장하지 않고, 실명·전화번호·병명 같은 민감한 정보는 묻지 않아요.</p></div>';
    }
    var j = h.lastIndexOf('</div>'); return j < 0 ? h + add : h.slice(0, j) + add + h.slice(j);
  };

  /* ---------- 서비스 목록: 영역·가격 형태 필터 ---------- */
  var v2f = { area: '', pk: '' };
  var oServices = P.services;
  P.services = function () {
    v2f = { area: '', pk: '' };
    var o = oServices.apply(this, arguments); if (!f('svcInfo') || !o || !o.html) return o;
    var chip = function (g, v, l, on) { return '<button class="chip' + (on ? ' on' : '') + '" data-act="v2svc" data-g="' + g + '" data-v="' + v + '" aria-pressed="' + !!on + '">' + l + '</button>'; };
    var bar = '<div class="v2-fl" role="group" aria-label="영역과 가격 형태"><div><b>영역</b>' + chip('area', '', '전체', true) + chip('area', 'life', 'LIFE 생활', false) + chip('area', 'nature', 'NATURE 자연', false) + chip('area', 'hope', 'HOPE 후원', false) + '</div>' +
      '<div><b>가격 형태</b>' + chip('pk', '', '전체', true) + chip('pk', 'Q', '견적 후 안내', false) + chip('pk', 'R', '정기 이용', false) + chip('pk', 'H', '후원', false) + '</div></div>' +
      '<p class="small v2-note">이 미리보기에서는 모든 서비스의 신청 흐름을 열어 두었어요. 실제 운영에서는 관리자가 확인한 서비스만 “신청 가능”으로 열려요. 시범 운영 동네: ' + esc(pilot()) + '</p>';
    o.html = ins(o.html, '<p class="cat-cnt"', bar);
    o.html = o.html.replace(/<article class="sc" data-g="([^"]*)" data-id="(S\d+)"/g, function (a, g, id) { return '<article class="sc" data-area="' + areaOf(id) + '" data-pk="' + (id === 'S15' ? 'H' : (id === 'S01' || id === 'S02') ? 'R' : 'Q') + '" data-g="' + g + '" data-id="' + id + '"'; });
    return o;
  };
  var oAF = G.applyFilter;
  G.applyFilter = function () {
    oAF(); var root = $('cat'); if (!root || !root.querySelector('[data-act=v2svc]')) return;
    var n = 0; root.querySelectorAll('.sc').forEach(function (c) { if (!c.hidden && ((v2f.area && c.dataset.area !== v2f.area) || (v2f.pk && c.dataset.pk !== v2f.pk))) c.hidden = true; if (!c.hidden) n++; });
    var cnt = $('cnt'); if (cnt) cnt.textContent = '조건에 맞는 서비스 · ' + n + '개 항목'; var e = $('catEmpty'); if (e) e.hidden = n > 0;
  };
  G.ACT.v2svc = function (el) { v2f[el.dataset.g] = el.dataset.v; el.parentNode.querySelectorAll('.chip').forEach(function (c) { var on = c === el; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); }); G.applyFilter(); };

  /* ---------- 서비스 상세: 운영 정보 ---------- */
  var oSvc = P.svc;
  P.svc = function (id) {
    var o = oSvc.apply(this, arguments); if (!f('svcInfo') || !o || !o.html || !G.sv(id)) return o;
    var s = G.sv(id), fl = G.flag(id), ar = areaInfo(areaOf(id)), stt = (window.WF_STATUS && WF_STATUS[fl.state] ? WF_STATUS[fl.state][0] : fl.state);
    var who = s.opLabel || '운영자 확인 후 안내', cancel = (s.cancel || [])[0] || '고객 승인 이전에는 비용 없이 취소할 수 있어요.';
    var qual = s.op === 'DIRECT' ? '더가넷이 직접 준비하는 서비스예요. 수행 인력의 확인·교육 내용은 신청 후 사전 안내에서 알려 드려요.' : '연계 업체·기관의 사업자 정보와 자격, 보험 가입 여부는 계약 전에 안내해요. 확인되지 않으면 연결하지 않아요.';
    var risk = ((s.notProvided || []).slice(0, 2).join(' / ')) || (s.standard || '');
    var rows = [['영역', ar.en + ' ' + ar.ko], ['운영 상태', stt + (fl.state === 'BOOKABLE' ? ' (미리보기 시연)' : '')], ['제공 주체', who], ['지역', '시범 운영 동네부터 · ' + pilot()], ['가격 기준', (s.wf && s.wf.price ? s.wf.price : priceKind(id)) + ' · ' + priceKind(id)], ['취소 규칙', cancel], ['자격·보험 안내', qual], ['위험 고지', (risk ? risk + ' · ' : '') + '효과나 결과를 약속하지 않고, 응급·의료 판단은 하지 않아요.'], ['후기 정책', '실제 이용한 분만 쓸 수 있고, 광고·허위·개인정보가 든 글은 신고할 수 있어요. 운영자가 확인 후 비공개로 돌릴 수 있어요.']];
    var card = '<div class="blk v2-op"><h2>이 서비스는 이렇게 운영돼요</h2><dl class="sum">' + rows.map(function (r) { return '<div class="kv"><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl></div>';
    o.html = ins(o.html, '<div class="blk"><h2>비용 안내</h2>', card);
    return o;
  };

  /* ---------- 상담 메모 · 신청 ---------- */
  var oMemo = P.memo;
  P.memo = function () {
    var o = oMemo.apply(this, arguments); if (!f('guideV2') || !o || !o.html) return o;
    var c = '<div class="v2-state"><span class="bd bd-warn">전송 전 · 임시 메모</span><p>이 메모는 이 화면에서만 만들어지고 <b>담당자에게 전송되지 않아요.</b> 예약도 확정되지 않아요. 접수하려면 아래 “문의로 접수하기”를 눌러 동의한 뒤 보내 주세요. 실명·전화번호·병명·계좌처럼 민감한 내용은 적지 않아도 돼요.</p><a class="btn btn-line btn-sm" href="#inquiry">문의로 접수하기</a></div>';
    o.html = ins(o.html, '<form', c);
    return o;
  };
  var oApplyP = P.apply;
  P.apply = function (arg) {
    var o = oApplyP.apply(this, arguments); if (!f('guideV2') || !o || !o.html) return o;
    if (!arg) o.html = lastIns(o.html, '</div></section>', '<div class="callout v2-pre">' + ico('info', 20) + '<div><strong>신청 전에 확인해요</strong><p>① 지역: 시범 운영 동네는 ' + esc(pilot()) + '이에요. ② 희망 일정을 대략 정해 두면 빨라요. ③ 비용: 서비스는 견적 확인 후 승인하면 시작하고, 나눔(SHARE)은 무료·실비·유료로 나뉘어요.</p></div></div>');
    else o.html = lastIns(o.html, '</form>', '<p class="small v2-save">작성 중인 내용은 이 브라우저에 임시 저장돼요. 같은 신청은 한 번만 접수돼요.</p>');
    return o;
  };
  var oAsub = G.ACT.asubmit, subBusy = false;
  if (oAsub) G.ACT.asubmit = function (el, e) { if (subBusy) return G.toast('접수 중이에요. 잠시만 기다려 주세요.'); subBusy = true; setTimeout(function () { subBusy = false; }, 1500); return oAsub.apply(this, arguments); };
  var oDone = P.done;
  if (oDone) P.done = function () {
    var o = oDone.apply(this, arguments); if (!f('guideV2') || !o || !o.html || o.html.indexOf('done-card') < 0) return o;
    var add = '<div class="v2-state"><h4>접수 뒤에는 이렇게 해요</h4><ul class="v2-ul"><li>문자·메일 안내는 발송이 성공한 뒤에 “발송됨”으로 표시돼요. 실패하면 마이페이지에서 상태를 확인할 수 있어요.</li><li>같은 신청이 두 번 들어가면 하나만 남기고 알려 드려요.</li><li>내용 수정은 운영자 확인 전까지 <a href="#my-apps">신청 내역</a>에서, 취소는 같은 화면에서 요청할 수 있어요.</li><li>궁금한 점은 <a href="#inquiry">1:1 문의</a>나 ' + esc(SITE.phone) + '로 알려 주세요.</li></ul></div>';
    o.html = lastIns(o.html, '</div></div></section>', add);
    return o;
  };

  /* ---------- 이용 방법 ---------- */
  var oGuide = P.guide;
  P.guide = function () {
    var o = oGuide.apply(this, arguments); if (!f('guideV2') || !o || !o.html) return o;
    var tb = function (head, rows) { return '<div class="tw"><table class="tbl"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i ? '<td>' + c + '</td>' : '<th scope="row">' + c + '</th>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'; };
    var add = '<h2 class="h3 gap">무료 · 실비 · 유료는 달라요</h2>' + tb(['구분', '비용', '수수료', '더가넷의 역할'], [['무료 나눔(SHARE)', '받는 대가 없음', '없음', '글 검토·안전 안내·신고 처리'], ['실비 공유', '재료비·교통비 등 실제 비용만', '없음', '내용 확인·안내'], ['유료(SHARE)', '글에 적은 금액', '안전결제 수수료 안내', '결제 보관·정산·분쟁 접수'], ['생활 서비스(LIFE)', '견적 확인 후 승인', '서비스별 안내', '접수·견적 안내·제공자 연결'], ['후원(HOPE)', '기관이 정함', '더가넷 수수료 없음', '기관 안내·연결']]) +
      '<h2 class="h3 gap">직접 수행과 중개는 달라요</h2>' + tb(['방식', '누가 하나요', '책임 주체'], [['직접 제공', '더가넷이 준비한 인력', '더가넷'], ['직접 + 연계', '일부는 직접, 일부는 전문기관', '구분해서 사전 안내'], ['연계(중개)', '전문기관·업체', '해당 업체. 계약 전에 안내'], ['이웃 나눔', '가입한 이웃끼리', '당사자. 더가넷은 검토·중개']]) +
      '<h2 class="h3 gap">누가 무엇을 하나요</h2><div class="v2-flow"><div><h4>고객</h4><ol><li>서비스 고르기</li><li>신청서 작성</li><li>견적 확인·승인</li><li>완료 확인·후기</li></ol></div><div><h4>제공자</h4><ol><li>의뢰 확인</li><li>가능 여부·일정 답변</li><li>서비스 수행</li><li>완료 보고</li></ol></div><div><h4>운영자(더가넷)</h4><ol><li>접수·범위 확인</li><li>견적·제공자 연결</li><li>진행 점검</li><li>정산·분쟁 대응</li></ol></div></div>' +
      '<h2 class="h3 gap">예외와 환불, 이런 경우에는</h2>' + boxes([['clock', '승인 전에 취소했어요', '고객 승인 이전에는 비용 없이 취소할 수 있어요.'], ['info', '승인 뒤 일정이 바뀌어요', '운영자가 확인해 변경하거나 취소·환불 정책에 따라 처리해요.'], ['shield', '서비스가 약속과 달랐어요', '문제 접수를 하면 24시간 안에 첫 연락을 드리고, 결정은 7일 안에 안내해요. (시연 기준)'], ['file', '환불은 어떻게 되나요', '환불 범위와 시기는 취소·환불 정책에 따라요. 최종 문구는 사업자 승인 후 확정돼요.']]);
    o.html = lastIns(o.html, '<div class="fa c gap">', add);
    return o;
  };

  /* ---------- 멤버십 3단계 시범 ---------- */
  var oPlans = P.plans;
  P.plans = function () {
    var o = oPlans.apply(this, arguments); if (!f('plan3') || !o || !o.html || !window.PLANS) return o;
    var pl = PLANS, won = function (n) { return n ? '₩' + n.toLocaleString('ko-KR') + '/월' : '무료'; };
    var t = [['무료', 0, '누구나 시작해요', ['서비스 둘러보기·신청·상담 메모·1:1 문의', '품온 60일 3회 체험', '포인트 적립 시작']], ['플러스', 1, '정기 이용에 편한 등급', ['품온 정회원 (횟수 제한 없음)', '월 이용권·포인트 적립', '공동구매 예약']], ['케어', 3, '우선 안내가 필요한 분', ['더 높은 이용권·포인트', '우선 예약 요청', '낮은 서로품 수수료']]];
    var three = '<section class="sec sec-tight"><div class="wrap"><p class="small v2-note">시범 공개 3단계예요. 아래 가격은 <b>시범 가격이며 확정이 아니에요.</b> 실제 회비·혜택은 사업자 승인 뒤에 정해져요.</p><div class="v2-t3">' + t.map(function (x) { var p = pl[x[1]]; return '<article class="v2-pl"><p class="kick">' + x[0] + '</p><h3>' + p[0] + '</h3><p class="v2-pr">' + won(p[1]) + ' <small>시범가</small></p><p class="small">' + x[2] + '</p><ul>' + x[3].map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul></article>'; }).join('') + '</div>' +
      '<div class="v2-boxes">' + box('gift', '무료로 되는 것', '서비스 둘러보기, 상담 메모, 서비스 신청, 1:1 문의, 품온 체험은 회비 없이 이용할 수 있어요.') + box('gem', '회비로 더해지는 것', '우선 예약·이용권·포인트·공동구매처럼 이용을 편하게 해 주는 혜택이에요. 월 한도는 등급마다 달라요.') + box('info', '해지와 환불', '마이페이지에서 언제든 해지를 요청할 수 있어요. 남은 기간 환불은 취소·환불 정책에 따라 안내해요.') + '</div></div></section>';
    var i = o.html.indexOf('<section class="sec sec-tight">');
    if (i < 0) return o;
    var rest = o.html.slice(i), head0 = o.html.slice(0, i);
    head0 = head0.replace(/<h1 class="ph-t">[^<]*<\/h1>/, '<h1 class="ph-t">멤버십 · 시범 3단계</h1>');
    o.html = head0 + three + '<section class="sec sec-tight"><div class="wrap"><details class="v2-keep"><summary>전체 10단계 기획안 보기 (보관·참고용)</summary><p class="small">초기에는 3단계로 시작하고, 10단계 기획안은 앞으로 테스트할 자료로 보관해요.</p></details></div></section>' + '<div class="v2-keep-body" hidden>' + rest + '</div>';
    return o;
  };
  /* 보관 중인 10단계 기획안은 접었다 펼 수 있게 한다 */
  document.addEventListener('toggle', function (e) {
    var d = e.target; if (!d || !d.classList || !d.classList.contains('v2-keep')) return;
    var b = document.querySelector('.v2-keep-body'); if (b) b.hidden = !d.open;
  }, true);

  /* ---------- 고객센터: 처리 시간·검색 ---------- */
  var oFaq = P.faq;
  P.faq = function () {
    var o = oFaq.apply(this, arguments); if (!f('guideV2') || !o || !o.html) return o;
    var add = '<div class="v2-state"><p><b>답변 시간 안내</b> · 1:1 문의는 ' + esc(SITE.hours) + ' 순서대로 답변해요. 주말·공휴일은 쉬어요. 급한 일은 전화 ' + esc(SITE.phone) + '로 알려 주세요.</p></div><label class="srch v2-fq">' + ico('search', 18) + '<input id="v2fq" type="search" placeholder="궁금한 말로 찾기" data-on="input:v2fq" autocomplete="off"><span class="sr">질문 검색</span></label>';
    o.html = ins(o.html, '<div class="chips" role="group" aria-label="질문 분류">', add);
    return o;
  };
  G.INP.v2fq = function (el) {
    var q = (el.value || '').trim().toLowerCase(), n = 0;
    document.querySelectorAll('#faqBox details').forEach(function (d) { var ok = !q || d.textContent.toLowerCase().indexOf(q) >= 0; d.hidden = !ok; if (ok) n++; });
    var box = $('faqBox'), ex = $('v2fqe'); if (box && !ex) { ex = document.createElement('p'); ex.id = 'v2fqe'; ex.className = 'small'; ex.hidden = true; ex.textContent = '찾는 질문이 없어요. 1:1 문의로 남겨 주세요.'; box.appendChild(ex); } if (ex) ex.hidden = n > 0;
  };

  /* ---------- 정책 페이지: 버전·변경 고지·철회·민원 ---------- */
  ['terms', 'privacy', 'refund'].forEach(function (k) {
    var o0 = P[k]; if (!o0) return;
    P[k] = function () {
      var o = o0.apply(this, arguments); if (!f('guideV2') || !o || !o.html) return o;
      var add = '<div class="card v2-pol"><h3>문서 정보</h3><dl class="sum"><div class="kv"><dt>문서 상태</dt><dd>시안 (법률 검토 전)</dd></div><div class="kv"><dt>동의 버전</dt><dd>v0.9 · 시행일은 확정 후 안내</dd></div><div class="kv"><dt>변경 고지</dt><dd>내용이 바뀌면 시행 전에 사이트 공지와 알림으로 알려 드려요. 이용자에게 불리한 변경은 더 일찍 알려요.</dd></div><div class="kv"><dt>청약철회</dt><dd>서비스 특성에 따라 달라요. 승인 전에는 비용 없이 취소할 수 있고, 승인 뒤는 취소·환불 정책에 따라 안내해요.</dd></div><div class="kv"><dt>민원 연락처</dt><dd>' + esc(SITE.phone) + ' · ' + esc(SITE.email) + ' · <a href="#inquiry">1:1 문의</a></dd></div></dl><p class="small">실제 사업자·계약 주체·처리 방식·환불 조건이 정해지면 법률 검토 뒤 이 문서를 확정해요.</p></div>';
      o.html = lastIns(o.html, '</div></section>', add);
      return o;
    };
  });

  /* ---------- 품온(SHARE): 목록 안전 안내·필터 · 등록 · 규칙 ---------- */
  var oClub = P.club;
  P.club = function (arg) {
    var o = oClub.apply(this, arguments); if (!f('guideV2') || !o || !o.html) return o;
    arg = String(arg || '');
    if (arg === '') {
      var bar = '<div class="v2-state v2-safe"><h4>안전하게 만나요</h4><p>처음 만남은 공공장소·거점에서, 연락처는 운영자 검증 뒤에 열려요. 대가를 요구하는 글은 신고해 주세요. <a href="#club-rules">이용 기준 보기</a></p></div>' +
        '<div class="v2-fl v2-clf" role="group" aria-label="더 찾기"><div><b>지역</b><select id="v2-ar" data-on="change:v2cl"><option value="">전체</option></select></div><div><b>종류</b><select id="v2-py" data-on="change:v2cl"><option value="">전체</option><option value="무료">무료 나눔</option><option value="실비">실비 공유</option><option value="유료">유료</option></select></div><div><b>만나는 방법</b><select id="v2-dl" data-on="change:v2cl"><option value="">전체</option><option value="hub">거점에 맡기기 (만나지 않아도 돼요)</option><option value="meet">직접 만나기</option></select></div></div>';
      o.html = o.html.replace(/<(div|ul|section)([^>]*) id="pmg"/, function (m0) { return bar + m0; });
    } else if (arg === 'new' || arg.indexOf('edit-') === 0) {
      o.html = ins(o.html, '<form', '<div class="v2-state"><p><b>올리기 전에 확인해요</b> · 품온은 개인 간 나눔이에요. 사업자 영업이나 전문 업종은 협력업체로 신청해 주세요. 사진과 글은 운영자가 확인한 뒤 공개되고, 고치면 다시 검토되며 수정 기록이 남아요. 금지 품목과 대가 요구는 올릴 수 없어요.</p><a class="btn btn-line btn-sm" href="#club-rules">금지 항목 보기</a></div>');
    } else if (arg === 'rules') {
      var add = '<div class="card v2-rules"><h3>금지 행위</h3><ul class="v2-ul"><li>어떤 형태로든 대가·선물을 요구하거나, 글에 없는 비용을 받는 일</li><li>의료·법률·금융 상담이나 위험한 작업(고소·전기·가스·약물·운전 대행)을 대신해 주는 일</li><li>연락처·주소·계좌 같은 개인정보를 먼저 요구하거나 다른 서비스로 유도하는 일</li></ul>' +
        '<h3>미성년 · 고위험 활동</h3><ul class="v2-ul"><li>가입은 만 19세 이상만 할 수 있어요. 미성년자와의 단독 만남·거래는 할 수 없어요.</li><li>어르신·아이·반려동물을 돌보는 일은 사전에 확인 가능한 범위로만 올릴 수 있어요.</li></ul>' +
        '<h3>긴급 상황</h3><p>더가넷은 응급 서비스가 아니에요. 응급·위급 상황은 119, 범죄·위협은 112에 먼저 연락해 주세요.</p>' +
        '<h3>사고·위기 대응 연락</h3><p>고객센터 ' + esc(SITE.phone) + ' · ' + esc(SITE.hours) + '. 접수 시간 밖에는 1:1 문의로 남겨 주시면 다음 운영 시간에 가장 먼저 확인해요.</p>' +
        '<h3>차단 · 제재</h3><p>단계: 주의 안내 → 글 비공개 → 일정 기간 이용 정지 → 영구 정지. 제재에 이의가 있으면 7일 안에 1:1 문의로 알려 주세요. (시연용 기준값)</p></div>';
      o.html = lastIns(o.html, '</div></section>', add);
    }
    return o;
  };
  function clApply() {
    var ar = ($('v2-ar') || {}).value, py = ($('v2-py') || {}).value, dl = ($('v2-dl') || {}).value, n = 0;
    document.querySelectorAll('#pmg .nb').forEach(function (a) {
      var tx = a.textContent, ok = (!ar || tx.indexOf(ar) >= 0) && (!py || tx.indexOf(py) >= 0) && (!dl || (dl === 'hub' ? tx.indexOf('거점') >= 0 : tx.indexOf('거점 맡기기') < 0));
      if (!ok) a.hidden = true; if (!a.hidden) n++;
    });
    var c = $('pmn'); if (c) c.textContent = n + '개의 글'; var e = $('pme'); if (e) e.hidden = n > 0;
  }
  G.INP.v2cl = function () { var f0 = G.INP.pmQ; if (f0) f0($('pmq') || document.body); else { document.querySelectorAll('#pmg .nb').forEach(function (a) { a.hidden = false; }); } clApply(); };
  ['pmK'].forEach(function (k) { var o = G.ACT[k]; if (o) G.ACT[k] = function () { var r = o.apply(this, arguments); clApply(); return r; }; });
  ['pmQ', 'pmMine'].forEach(function (k) { var o = G.INP[k]; if (o) G.INP[k] = function () { var r = o.apply(this, arguments); clApply(); return r; }; });
  /* 지역 선택칸은 화면이 그려질 때 글에서 뽑아 채운다 */
  var oRender = G.render;
  G.render = function () {
    var r = oRender.apply(this, arguments);
    try { var sel = $('v2-ar'); if (sel && sel.options.length < 2) { var seen = {}; document.querySelectorAll('#pmg .nb .nb-m li').forEach(function (li, i) { var t = li.textContent.trim(); if (/구|시|동/.test(t) && !/거점|맡기기|평일|주말|오전|오후/.test(t) && !seen[t]) { seen[t] = 1; var o = document.createElement('option'); o.value = t; o.textContent = t; sel.appendChild(o); } }); } } catch (e) { }
    return r;
  };

  /* ---------- 마이페이지: 프로필 권리 · 반려 기록책 정책 ---------- */
  var oMy = G.myPages || {};
  var wrapMy = function (k, fn) { var o = oMy[k]; if (o) oMy[k] = function () { var r = o.apply(this, arguments); return fn(r); }; };
  wrapMy('profile', function (r) {
    if (!f('guideV2') || !r || !r.html) return r;
    var p = S.profile || {}, a = ((T().addr || {})[uid()] || {}), fam = (T().family || {})[uid()] || {};
    var ck = function (on) { return on ? '<span class="bd bd-ok">동의함</span>' : '<span class="bd bd-mute">동의 안 함</span>'; };
    var add = '<div class="card v2-rights"><h3>내 정보 권리와 동의</h3><p class="small">필수로 받는 정보는 이름과 연락처뿐이에요. 사이즈·탄생 정보·주소·가족·반려동물은 모두 선택이고, 목적별로 따로 동의해요.</p><dl class="sum"><div class="kv"><dt>탄생 정보 활용</dt><dd>' + ck(p.birthOk) + '</dd></div><div class="kv"><dt>거주지 저장</dt><dd>' + ck(a.ok) + '</dd></div><div class="kv"><dt>택배 배송지 저장</dt><dd>' + ck((a.book || []).length > 0) + '</dd></div><div class="kv"><dt>안심 수신자 공유</dt><dd>' + ck(fam.consent) + '</dd></div></dl><ul class="v2-ul"><li><b>열람</b> · 이 화면과 내 정보에서 바로 볼 수 있어요.</li><li><b>정정</b> · 고치고 저장하면 바로 바뀌어요.</li><li><b>삭제·동의 철회</b> · 탄생 정보 지우기, 주소·배송지 삭제, 가족·반려동물 정보 삭제를 각 화면에서 할 수 있어요.</li><li><b>보관 기간</b> · 개인정보 처리방침에 따라요. 법령이 정한 거래 기록은 정해진 기간 보관해요.</li></ul><div class="v2-cta"><a class="btn btn-line btn-sm" href="#my-family">가족·안심 관리</a><a class="btn btn-line btn-sm" href="#my-pets">반려동물 관리</a><a class="btn btn-line btn-sm" href="#privacy">개인정보 처리방침</a></div></div>';
    r.html = lastIns(r.html, '</div></section>', add); return r;
  });
  wrapMy('petbook', function (r) {
    if (!f('guideV2') || !r || !r.html) return r;
    var add = '<div class="card v2-rules"><h3>사진·글 사용과 제작 안내</h3><ul class="v2-ul"><li><b>저작권</b> · 올린 사진과 글의 저작권은 올린 분에게 있어요. 더가넷은 책을 만들고 인쇄하는 데만 쓰고, 홍보에 쓰려면 따로 동의를 받아요.</li><li><b>초상</b> · 사람 얼굴이 나온 사진은 본인(또는 가족)이 동의한 사진만 올려 주세요.</li><li><b>인쇄 주문</b> · 시안을 확인하고 승인한 뒤에 제작해요. 수정은 시연 기준 2회까지 안내하고, 상태는 시안 확인 → 제작 → 인쇄 → 배송 순서로 보여 드려요.</li><li><b>해상도</b> · 사진이 너무 작으면 인쇄 전에 알려 드려요.</li></ul></div>';
    r.html = lastIns(r.html, '</div></section>', add); return r;
  });

  /* ---------- 관리자: 우선 확인 ---------- */
  var oAdmin = P.admin;
  P.admin = function (arg) {
    var o = oAdmin.apply(this, arguments); arg = String(arg || '');
    if (!f('adminV2') || arg !== '' || !o || !o.html) return o;
    var t = T(), K = S.club || { posts: [], deals: [], reports: [] }, late = (t.disputes || []).filter(function (d) { return G.dspLate && G.dspLate(d); }).length;
    var open = (t.disputes || []).filter(function (d) { return d.status !== '종결'; }).length;
    var pend = K.posts.filter(function (p) { return p.status === 'PENDING_REVIEW'; }).length, deals = K.deals.filter(function (d) { return d.status === 'ACCEPTED' || d.status === 'HELD'; }).length;
    var urg = (t.notify || []).filter(function (n) { return n.urgent; }).length, apps = S.apps.filter(function (a) { return a.status === 'SUBMITTED'; }).length;
    var rows = [['위험', '첫 연락 24시간 넘긴 분쟁', late, '#admin-disputes'], ['위험', '안심 수신자 없는 회원 알림', urg, '#admin-safety'], ['처리', '진행 중인 분쟁', open, '#admin-disputes'], ['처리', '안전 검증 기다리는 품온 거래', deals, '#admin-club'], ['처리', '등록 검토 기다리는 품온 글', pend, '#admin-club'], ['처리', '새로 접수된 서비스 신청', apps, '#admin-apps']].sort(function (a, b) { return (b[2] > 0) - (a[2] > 0); });
    var card = '<section class="ac v2-prio"><h2>우선 확인</h2><p class="small">위험과 미처리를 먼저 보여 드려요. 숫자는 이 브라우저의 시연 데이터 기준이에요.</p><ul class="v2-pl">' + rows.map(function (r) { return '<li class="' + (r[2] ? 'on' : '') + '"><span class="bd ' + (r[0] === '위험' ? 'bd-bad' : 'bd-info') + '">' + r[0] + '</span><a href="' + r[3] + '">' + esc(r[1]) + '</a><b>' + r[2] + '건</b></li>'; }).join('') + '</ul></section>';
    var i = o.html.indexOf('<section class="ac'); o.html = i < 0 ? card + o.html : o.html.slice(0, i) + card + o.html.slice(i);
    return o;
  };

  /* ---------- 시연 도구·데모 계정 숨기기 ---------- */
  var demoOn = function () { try { if (/[?&]demo=0/.test(location.search)) localStorage.removeItem('garnet.demo'); if (/[?&]demo=1/.test(location.search)) localStorage.setItem('garnet.demo', '1'); return localStorage.getItem('garnet.demo') === '1'; } catch (e) { return /[?&]demo=1/.test(location.search); } };
  G.demoMode = demoOn;
  var hide = function () { return f('demoHide') && !demoOn(); };
  var oDock = G.dockHtml; if (oDock) G.dockHtml = function () { return hide() ? '' : oDock.apply(this, arguments); };
  var oLogin = P.login;
  P.login = function () {
    var o = oLogin.apply(this, arguments); if (!hide() || !o || !o.html) return o;
    o.html = o.html.replace(/(<input id="l-id"[^>]*?) value="[^"]*"/, '$1').replace(/(<input id="l-pw"[^>]*?) value="[^"]*"/, '$1');
    o.html = o.html.replace(/<div class="sns">[\s\S]*?<\/div>/, '').replace(/<button class="btn btn-line btn-block" data-act="demoLogin"[^>]*>[^<]*<\/button>/, '').replace(/<p class="small c">시연 화면이라[^<]*<\/p>/, '');
    return o;
  };
  var oSl = G.SUB.login;
  G.SUB.login = function () { var r = oSl.apply(this, arguments); if (hide()) { var e = $('l-e'); if (e && !e.hidden) e.textContent = e.textContent.replace(/데모 비밀번호는[^.]*\.?/, '').replace('데모 계정으로 입장하거나 ', '').trim() || '이메일 또는 비밀번호가 맞지 않아요.'; } return r; };
  var oAdminP = P.admin;
  P.admin = function (arg) {
    var o = oAdminP.apply(this, arguments);
    if (hide() && o && o.html && /id="a-id"/.test(o.html)) o.html = o.html.replace(/(<input id="a-id"[^>]*?) value="[^"]*"/, '$1').replace(/(<input id="a-pw"[^>]*?) value="[^"]*"/, '$1').replace(/<p class="small[^"]*">시연용[^<]*<\/p>/, '');
    return o;
  };
  demoOn();
})();
