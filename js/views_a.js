/* 고객 화면 A: 홈, 서비스 목록/상세, 찾기, 상담 메모 */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES;

  /* ---------- 카탈로그(필터) ---------- */
  G.catalog = function (opt) {
    opt = opt || {};
    var list = G.visible();
    var chips = [['all', '전체 서비스']].concat(Object.keys(GROUPS).map(function (k) { return [k, GROUPS[k]]; }));
    return '<div class="cat" id="cat">' +
      '<div class="cat-bar"><div class="chips" role="group" aria-label="분야 선택">' + chips.map(function (c, i) { return '<button class="chip' + (i === 0 ? ' on' : '') + '" data-act="grp" data-v="' + c[0] + '" aria-pressed="' + (i === 0) + '">' + c[1] + '</button>'; }).join('') + '</div>' +
      (opt.search ? '<div class="cat-tools"><label class="srch">' + ico('search', 18) + '<input id="q" type="search" placeholder="서비스 이름으로 찾기" data-on="input:filter" autocomplete="off"><span class="sr">서비스 검색</span></label>' +
        '<label class="tgl"><input type="checkbox" id="onlyOn" data-on="change:filter"><span>신청 가능한 서비스만</span></label></div>' : '') + '</div>' +
      '<p class="cat-cnt" id="cnt" aria-live="polite">전체 서비스 · ' + list.length + '개 항목</p>' +
      '<div class="grid-sc" id="grid">' + list.map(function (s) { return G.svcCard(s); }).join('') + '</div>' +
      '<div class="empty" id="catEmpty" hidden><p>조건에 맞는 서비스가 없습니다. 검색어를 지우거나 다른 분야를 선택해 보세요.</p></div></div>';
  };
  G.applyFilter = function () {
    var root = document.getElementById('cat'); if (!root) return;
    var g = (root.querySelector('.chip.on') || {}).dataset ? root.querySelector('.chip.on').dataset.v : 'all';
    var q = (document.getElementById('q') || { value: '' }).value.trim().toLowerCase(); var only = (document.getElementById('onlyOn') || {}).checked;
    var n = 0;
    root.querySelectorAll('.sc').forEach(function (c) {
      var ok = (g === 'all' || c.dataset.g === g) && (!q || c.dataset.name.toLowerCase().indexOf(q) >= 0) && (!only || c.dataset.onState === 'BOOKABLE');
      c.hidden = !ok; if (ok) n++;
    });
    var label = g === 'all' ? '전체 서비스' : GROUPS[g];
    document.getElementById('cnt').textContent = label + ' · ' + n + '개 항목';
    document.getElementById('catEmpty').hidden = n > 0;
  };
  G.ACT.grp = function (el) {
    el.parentNode.querySelectorAll('.chip').forEach(function (c) { var on = c === el; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
    G.applyFilter();
  };
  G.INP.filter = function () { G.applyFilter(); };

  /* ---------- 찾기(지금 필요한 것) ---------- */
  var mood = 0;
  G.moodPanel = function (i) {
    var m = MOODS[i], s = m[1] ? G.sv(m[1]) : null;
    var memoTo = s ? 'memo-' + s.id : 'memo';
    var main = s
      ? '<div class="fp-ph"><img src="img/' + s.id + '.jpg" alt="' + esc(s.alt) + '"></div><div class="fp-b"><p class="fp-k">당신을 위한 첫 제안</p><h3>' + esc(s.headline) + '</h3><p>' + esc(m[2]) + '</p><p class="fp-n">' + ico('info', 16) + '<span>' + esc(s.standard) + '</span></p>' +
        '<div class="fp-a"><a class="btn btn-fill" href="#svc-' + s.id + '">' + esc(s.name) + ' 자세히 보기</a><a class="btn btn-line" href="#' + memoTo + '">이 내용으로 상담 메모 만들기</a></div></div>'
      : '<div class="fp-b fp-b-solo"><p class="fp-k">당신을 위한 첫 제안</p><h3>천천히, 하나씩 정해도 괜찮아요.</h3><p>' + esc(m[2]) + '</p>' +
        '<div class="fp-a"><a class="btn btn-fill" href="#services">전체 서비스 둘러보기</a><a class="btn btn-line" href="#memo">상담 메모 먼저 써 보기</a></div></div>';
    return main;
  };
  G.finder = function (name) {
    return '<div class="finder"><fieldset class="fd-list"><legend class="sr">지금 내 하루에 필요한 것</legend>' + MOODS.map(function (m, i) {
      return '<label class="fd-opt"><input type="radio" name="' + name + '" value="' + i + '" data-on="change:mood"' + (i === mood ? ' checked' : '') + '><span>' + esc(m[0]) + '</span>' + '<i class="fd-dot" aria-hidden="true"></i></label>';
    }).join('') + '</fieldset><div class="fd-panel" id="fdPanel" aria-live="polite">' + G.moodPanel(mood) + '</div></div>';
  };
  G.INP.mood = function (el) { mood = +el.value; var p = document.getElementById('fdPanel'); if (p) p.innerHTML = G.moodPanel(mood); };

  /* ---------- 홈 ---------- */
  function nbTeaser() {
    var ps = (S.club ? S.club.posts : []).filter(function (p) { return p.status === 'PUBLISHED'; }).slice(0, 3);
    var pay = function (k) { return CLUB.PAY[k].name; };
    return '<section class="sec sec-sand nb-home"><div class="wrap nb-home-in"><div><p class="kick">NEIGHBORS</p><h2 class="h2">가입한 이웃끼리,<br>솜씨와 시간을 나눠요.</h2><p class="lead">분갈이, 반찬, 수선, 글씨 연습까지. 회원끼리 무료·실비·유료로 주고받는 작은 품앗이예요. 모든 글은 운영자가 먼저 확인하고, 약속은 안전 검증을 거친 뒤에 연락처가 열려요.</p><div class="fa"><a class="btn btn-fill" href="#club">이웃 나눔 둘러보기</a><a class="lnk" href="#club-rules">이용 기준 ' + ico('arrow-right', 16) + '</a></div></div>' +
      '<ul class="nb-home-l">' + ps.map(function (p) { return '<li><a href="#club-' + p.id + '"><span class="bd ' + (p.kind === 'OFFER' ? 'bd-kind-o' : 'bd-kind-r') + '">' + (p.kind === 'OFFER' ? '드려요' : '찾아요') + '</span><b>' + esc(p.title) + '</b><em>' + pay(p.pay) + ' · ' + esc(p.area) + '</em></a></li>'; }).join('') + '</ul></div></section>';
  }

  P.home = function () {
    var vis = G.visible();
    var html =
      '<section class="hero"><div class="wrap hero-in"><div class="hero-l">' +
      '<p class="eyebrow"><i></i>HUMAN · HOME · PET</p>' +
      '<h1 class="hero-h">나의 일상에,<br><em>다정한 변화.</em></h1>' +
      '<p class="hero-p">지금의 마음과 생활을 있는 그대로 존중합니다.<br>쉬어가는 시간부터 집과 반려동물의 일상까지,<br>필요한 도움을 하나씩 함께 찾아갑니다.</p>' +
      '<div class="hero-cta"><a class="btn btn-fill" href="#services">필요한 도움 살펴보기</a><button class="lnk-u" data-act="scroll" data-to="about">더가넷을 시작하는 마음</button></div>' +
      '<p class="hero-note">지금 모든 것을 정하지 않아도 괜찮아요.</p>' +
      '<ul class="hero-trio"><li>마음을 쉬다</li><li>집을 돌보다</li><li>함께 연결하다</li></ul></div>' +
      '<figure class="hero-r"><span class="hero-no">01 / EVERYDAY CARE</span><div class="hero-ph"><img src="img/hero.jpg" alt="볕이 드는 거실의 가넷빛 화병과 목련 가지" width="1000" height="977">' +
      '<div class="hero-card"><small>천천히, 나의 속도로</small><b>A little care.<br>A gentle day.</b></div><figcaption class="hero-cap">공간 연출 콘셉트 이미지</figcaption></div></figure></div></section>' +

      '<section class="room"><div class="wrap"><p class="kick c">ROOM TO BREATHE</p><h2 class="h2 c">오늘은 둘러보기만 해도<br><em>괜찮아요.</em></h2><p class="lead c">모든 이야기를 설명하지 않아도 됩니다.<br>원하는 도움 한 가지부터, 편안한 방식으로 시작해 주세요.</p>' +
      '<ul class="dots"><li>당신의 선택을 존중해요</li><li>작은 도움부터 정해요</li><li>서두르지 않고 안내해요</li></ul></div></section>' +

      '<section class="sec sec-find"><div class="wrap"><div class="sec-h"><div><p class="kick">A LITTLE GUIDE</p><h2 class="h2">지금 내 하루에<br>필요한 것은?</h2></div><p class="sec-p">정답을 찾지 않아도 됩니다. 지금 마음에 가까운 상황 하나만 골라 보세요. 선택에 맞춰 첫 제안이 달라지고, 상담 메모로도 이어집니다.</p></div>' + G.finder('mood-home') + '</div></section>' +

      '<section class="sec" id="care"><div class="wrap"><div class="sec-h"><div><p class="kick">FIFTEEN WAYS TO CARE</p><h2 class="h2">내 삶에 맞춰 고르는<br>15가지 돌봄과 연결.</h2></div><p class="sec-p">마음에 닿는 장면과 설명을 살펴보고,<br>지금 필요한 도움을 천천히 골라보세요.</p></div>' +
      '<div class="note-box"><div><p><strong>서비스별 안내 이미지와 설명, 첫 상담에서 확인할 내용을 함께 담았습니다.</strong></p><p>서비스와 협력 체계는 준비 중입니다. 제공 가능 여부·지역·일정·비용은 확인 후 안내하며, 메모 작성으로 예약이 확정되지는 않습니다. 안내 이미지는 서비스 이해를 위한 연출 장면입니다.</p></div><a class="lnk-u" href="#home" data-act="scroll" data-to="standards">제공 기준을 함께 확인해요</a></div>' +
      G.catalog({}) + '<p class="more"><a class="btn btn-line" href="#services">검색과 필터로 더 찾아보기 ' + ico('arrow-right', 18) + '</a></p></div></section>' +

      '<section class="studio"><div class="studio-in"><div class="studio-ph"><img src="img/studio.jpg" alt="가넷빛과 아이보리색 대형 종이 꽃" loading="lazy"><span class="cap">자이언트 플라워 연출 콘셉트</span></div>' +
      '<div class="studio-b"><p class="studio-k">THE GARNET STUDIO</p><h2>공간에 꽃을,<br>순간에 특별함을.</h2><p>일상의 작은 꽃부터,<br>오래 기억될 자이언트 플라워까지.<br>공간의 쓰임과 이야기에 맞는 연출을 구상합니다.</p>' +
      '<ul class="tags"><li>꽃 · 디퓨저 · 소품</li><li>자이언트 플라워</li><li>수공예 주문 · 클래스</li></ul><a class="btn btn-ivory" href="#memo-S05">꽃과 공간 상담 메모 만들기</a><p class="studio-n">제품·향·위치는 고객 승인 후 정하고, 맞춤 제작의 납기·수정 횟수·안전을 먼저 확인합니다.</p></div></div></section>' +

      '<section class="sec"><div class="wrap"><div class="sec-h"><div><p class="kick">A THOUGHTFUL PROCESS</p><h2 class="h2">처음부터 끝까지,<br>나의 속도를 존중합니다.</h2></div><p class="sec-p">직접 제공과 전문기관 연계를 구분하고,<br>시작 전에 고객의 선택과 책임을 확인합니다.</p></div>' +
      '<ol class="proc">' + PROCESS.map(function (p, i) { return '<li><span class="proc-n">0' + (i + 1) + '</span><h3>' + p[0] + '</h3><p>' + p[1] + '</p></li>'; }).join('') + '</ol></div></section>' +

      '<section class="sec sec-sand" id="standards"><div class="wrap"><div class="sec-h"><div><p class="kick">OUR STANDARDS</p><h2 class="h2">돌봄의 마음만큼,<br>운영 기준도 분명하게.</h2></div><p class="sec-p">고객의 선택을 존중하고<br>비용과 책임을 시작 전에 구분합니다.</p></div>' +
      '<div class="std">' + PRINCIPLES.map(function (p) { return '<article><p class="std-k">' + p[0] + '</p><h3>' + p[1] + '</h3><p>' + p[2] + '</p></article>'; }).join('') + '</div>' +
      '<div class="callout">' + ico('shield', 20) + '<div><strong>확인을 거쳐 안내하는 연결</strong><p>일상 펫케어는 산책·방문돌봄·생활관리의 범위를 먼저 정합니다. 보호자 부재·긴급상황은 등록기관·지정 보호자 연계를 준비하며, 자동 돌봄 이전과 평생 보장은 약속하지 않습니다. 숙박·여행은 적법한 숙소·여행사와 협력을 준비하고 알선의 등록 요건도 검토합니다.</p></div></div></div></section>' +

      nbTeaser() +
      '<section class="sec"><div class="wrap duo"><a class="duo-card" href="#special"><div class="duo-ph"><img src="img/S13.jpg" alt="리넨 천과 가넷색 샘플" loading="lazy"></div><div class="duo-b"><p class="kick">SPECIAL DAYS</p><h3>특별한 날, 특별하게</h3><p>생일·기념일에 맞춘 탄생상징 주얼리, 꽃, 수공예 선물을 한곳에서 살펴보세요. 월·일만으로 탄생석과 탄생화를 찾아볼 수 있어요.</p><span class="lnk">선물 둘러보기 ' + ico('arrow-right', 16) + '</span></div></a>' +
      '<a class="duo-card" href="#plans"><div class="duo-b duo-b-full"><p class="kick">MEMBERSHIP</p><h3>10단계 멤버십</h3><p>무료 등급부터 시작해, 필요할 때 예약과 관리 편의를 더하세요. 모든 등급에서 상품 구매가 가능합니다.</p><ul class="mini-plans">' + PLANS.slice(0, 4).map(function (p) { return '<li><span>' + p[0] + '</span><b>' + (p[1] ? G.fmt(p[1]) + '/월' : '무료') + '</b></li>'; }).join('') + '</ul><span class="lnk">등급 비교하기 ' + ico('arrow-right', 16) + '</span></div></a></div></section>' +

      '<section class="about" id="about"><div class="wrap about-in"><div class="mono" aria-hidden="true"><b>G.</b><small>THE GARNET<br>BY DOHYEON</small></div><div class="about-b"><p class="kick">더가넷을 시작하는 마음</p><h2 class="h2 q">“사람을 돌보고, 집을 살피고,<br>다정한 연결을 만드는 일.”</h2>' +
      '<p>안녕하세요, 더가넷을 준비하는 도현입니다.<br>누군가의 마음과 생활을 서둘러 판단하지 않고, 작지만 필요한 도움을 건네는 브랜드를 만들고 싶습니다.</p><p>꽃과 공간, 일상과 반려동물, 함께 걷는 시간과 나눔. 어떤 도움을 고르든 당신의 선택을 존중하고, 비용과 책임을 분명히 안내하는 것. 더가넷이 지키고 싶은 마음입니다.</p><p class="sign"><b>도현</b><span>더가넷 기획 · 운영</span></p></div></div></section>' +

      '<section class="sec"><div class="wrap faq-sec"><div><p class="kick">BEFORE WE BEGIN</p><h2 class="h2">궁금하실 이야기</h2><p class="sec-p">서비스 준비 상태부터 이용 방식, 비용과 책임, 필요한 정보까지 안내합니다.</p><a class="btn btn-line" href="#faq">질문 모두 보기</a>' +
      '<div class="news"><h3>소식</h3><ul>' + S.notices.slice().sort(function (a, b) { return b.date > a.date ? 1 : -1; }).slice(0, 3).map(function (n) { return '<li><a href="#notice-' + n.id + '"><span>' + esc(n.title) + '</span><time>' + n.date + '</time></a></li>'; }).join('') + '</ul></div></div>' +
      G.faqList(S.faqs.filter(function (f) { return f.show; }).slice(0, 6)) + '</div></section>';
    return { title: '', html: html, cls: 'home' };
  };

  /* ---------- 서비스 목록 ---------- */
  P.services = function () {
    return { title: '돌봄 둘러보기', html: G.pageHead('내 삶에 맞춰 고르는<br>15가지 돌봄과 연결.', '마음에 닿는 장면과 설명을 살펴보고, 지금 필요한 도움을 천천히 골라보세요. 신청이 열리지 않은 서비스는 상담 메모로 먼저 남길 수 있어요.', [['돌봄 둘러보기']], 'CARE · 15 SERVICES') +
      '<section class="sec sec-tight"><div class="wrap"><div class="legend"><span class="op op-DIRECT">직접 제공 준비</span><span class="op op-MIXED">직접 + 전문기관 연계</span><span class="op op-PARTNER">전문기관·업체 연계 준비</span><span class="legend-n">카드의 라벨은 누가 서비스를 수행하는지 보여 줍니다.</span></div>' + G.catalog({ search: true }) + '</div></section>' };
  };

  /* ---------- 서비스 상세 ---------- */
  var BADGE = { '필수': 'req', '선택': 'opt', '조건부': 'cond' };
  P.svc = function (id) {
    var s = G.sv(id), f = G.flag(id);
    if (!s || f.state === 'HIDDEN') return { title: '서비스를 찾을 수 없어요', html: G.pageHead('서비스를 찾을 수 없어요', '요청하신 서비스는 공개되어 있지 않습니다.', [['돌봄 둘러보기', 'services']]) + '<section class="sec"><div class="wrap">' + G.empty('전체 서비스 목록으로 돌아가 다른 돌봄을 살펴보세요.', '<a class="btn btn-fill" href="#services">서비스 목록 보기</a>') + '</div></section>' };
    var fav = S.favs.indexOf(id) >= 0, st = f.state;
    var cta;
    if (st === 'BOOKABLE') cta = '<a class="btn btn-fill btn-block" href="#apply-' + id + '">신청하기</a><a class="btn btn-line btn-block" href="#memo-' + id + '">상담 메모 남기기</a>';
    else if (st === 'PAUSED') cta = '<p class="hold">현재 새 신청을 받지 않습니다. 기존 신청은 마이페이지에서 계속 확인할 수 있어요.</p><a class="btn btn-line btn-block" href="#inquiry">1:1 문의하기</a>';
    else cta = '<p class="hold">' + (st === 'VISIBLE_INFO' ? '지금은 안내만 공개된 서비스입니다.' : '서비스와 협력 체계를 준비하고 있어요.') + ' 신청은 열리면 이 자리에서 바로 하실 수 있습니다.</p><a class="btn btn-fill btn-block" href="#memo-' + id + '">상담 메모 남기기</a>';
    var wf = s.wf, rel = SV.filter(function (x) { return x.group === s.group && x.id !== id && G.flag(x.id).state !== 'HIDDEN'; }).slice(0, 3);
    if (rel.length < 3) rel = rel.concat(SV.filter(function (x) { return x.group !== s.group && G.flag(x.id).state !== 'HIDDEN'; }).slice(0, 3 - rel.length));
    var revs = f.reviews ? S.reviews.filter(function (r) { return r.svc === id; }) : [];
    var fields = wf.fields.map(function (x) { return '<li><span>' + esc(x[0]) + '</span><em class="' + (BADGE[x[2]] || 'opt') + '">' + esc(x[2]) + '</em></li>'; }).join('');
    var html =
      '<div class="wrap crumb-row"><nav class="crumb" aria-label="현재 위치"><a href="#home">홈</a><a href="#services">돌봄 둘러보기</a><span>' + esc(s.name) + '</span></nav></div>' +
      '<section class="sd"><div class="wrap sd-in"><div class="sd-main">' +
      '<div class="sd-hero"><img src="img/' + id + '.jpg" alt="' + esc(s.alt) + '" width="1000" height="667"><span class="cap">연출 콘셉트 이미지</span></div>' +
      '<div class="sd-title"><p class="meta">' + G.opChip(s) + G.stateBadge(st) + '<span class="grp">' + GROUPS[s.group] + '</span></p><h1>' + esc(s.name) + '</h1><p class="sd-head">' + esc(s.headline) + '</p><p class="sd-lead">' + esc(s.lead) + '</p>' +
      '<ul class="pts">' + s.points.map(function (p) { return '<li>' + ico('check', 16) + esc(p) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="two"><article class="card-soft"><h3>이렇게 시작해요</h3><p>' + esc(s.start) + '</p></article><article class="card-soft"><h3>제공 방식</h3><p>' + esc(s.provide) + '</p><h3 class="mt">운영 기준</h3><p>' + esc(s.standard) + '</p></article></div>' +
      '<div class="blk"><h2>서비스 소개</h2>' + s.detail.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + (s.partner ? '<div class="callout">' + ico('info', 20) + '<div><strong>수행 주체 안내</strong><p>' + esc(s.partner) + '</p></div></div>' : '') + '</div>' +
      '<div class="blk"><h2>이 서비스의 핵심 포인트</h2><div class="hl">' + s.highlights.map(function (h) { return '<div><b>' + esc(h[0]) + '</b><span>' + esc(h[1]) + '</span></div>'; }).join('') + '</div></div>' +
      '<div class="blk"><h2>이런 분께 추천합니다</h2><ul class="checks">' + s.suitable.map(function (x) { return '<li>' + ico('check', 16) + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="blk two"><div><h2>제공 범위</h2><ul class="ul">' + s.scope.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div><div><h2>제공하지 않는 범위</h2><ul class="ul no">' + s.notProvided.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>' +
      '<div class="blk"><h2>진행 절차</h2><ol class="tl">' + wf.steps.map(function (x, i) { return '<li><span>' + (i + 1) + '</span><b>' + esc(x) + '</b></li>'; }).join('') + '</ol><p class="small">모든 신청은 접수 → 운영자 검토 → 범위·비용 안내 → 고객 승인 → 진행 → 완료 보고 순서로 확인됩니다.</p></div>' +
      '<div class="blk"><h2>신청서에서 입력하는 항목</h2><p class="small">미리 생각해 두면 접수가 훨씬 빨라져요. 사진·상세 주소는 견적 단계에서 필요할 때만 받습니다.</p><ul class="fld">' + fields + '</ul><h3 class="mt">신청 전 준비사항</h3><ul class="ul">' + s.prepare.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="blk"><h2>고객 선택 항목</h2><div class="chips-s">' + s.options.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div></div>' +
      '<div class="blk"><h2>비용 안내</h2><div class="price"><span>비용 구성</span><b>' + esc(wf.price) + '</b></div><ul class="ul">' + s.cost.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><h3 class="mt">일정 변경 · 취소 · 환불</h3><ul class="ul">' + s.cancel.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><a class="lnk" href="#refund">취소·환불 정책 전문 보기 ' + ico('arrow-right', 16) + '</a></div>' +
      '<div class="blk"><h2>유의사항</h2><ul class="ul">' + s.caution.concat([wf.rule]).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      (f.reviews ? '<div class="blk"><h2>이용 후기</h2>' + (revs.length ? revs.map(function (r) { return '<div class="rv"><div>' + G.starFill(r.stars) + '</div><p>' + esc(r.text) + '</p><small>' + esc(r.who) + ' · ' + r.at + '</small></div>'; }).join('') : '<p class="small">아직 등록된 후기가 없습니다. 실제로 이용을 마친 고객님의 후기만 게시하며, 샘플 후기는 싣지 않습니다.</p>') + '</div>' : '') +
      '</div>' +
      '<aside class="sd-aside"><div class="buy"><p class="buy-k">' + esc(s.opLabel) + '</p><h2>' + esc(s.name) + '</h2><p class="buy-p">신청 접수 후 운영자가 범위·일정·비용을 확인해 안내하며, 고객님이 승인하신 뒤에 진행됩니다. 승인 전에는 비용이 청구되지 않아요.</p>' + cta +
      '<button class="buy-fav' + (fav ? ' on' : '') + '" data-act="fav" data-id="' + id + '" aria-pressed="' + fav + '">' + G.heartFill(fav) + '<span>' + (fav ? '찜한 서비스' : '찜하기') + '</span></button>' +
      '<dl class="buy-dl"><div><dt>수행 주체</dt><dd>' + esc(s.opLabel) + '</dd></div><div><dt>제공 형태</dt><dd>' + esc(wf.type) + '</dd></div><div><dt>문의</dt><dd>' + esc(SITE.phone) + '</dd></div></dl></div></aside></div></section>' +
      '<section class="sec sec-sand"><div class="wrap"><h2 class="h3">함께 둘러보면 좋은 돌봄</h2><div class="grid-sc">' + rel.map(function (x) { return G.svcCard(x); }).join('') + '</div></div></section>';
    return { title: s.name, html: html };
  };

  /* ---------- 지금 필요한 것 ---------- */
  P.find = function () {
    return { title: '나에게 맞는 돌봄', html: G.pageHead('지금 내 하루에<br>필요한 것은?', '정답을 찾지 않아도 됩니다. 지금 마음에 가까운 상황 하나만 골라 보세요.', [['나에게 맞는 돌봄']], 'A LITTLE GUIDE') + '<section class="sec sec-tight"><div class="wrap">' + G.finder('mood-page') + '</div></section>' };
  };

  /* ---------- 상담 메모 ---------- */
  P.memo = function (id) {
    var list = G.visible(), sel = id && G.sv(id) ? id : '';
    var html = G.pageHead('작은 이야기에서<br>시작해 볼까요?', '긴 이야기를 쓰지 않아도 괜찮아요. 어떤 도움이 필요한지 한 가지부터 적어 주세요. 메모를 복사해 두실 수 있으며 담당자에게 자동 전송되지는 않습니다.', [['돌봄 둘러보기', 'services'], ['상담 메모']], 'CONSULTATION MEMO') +
      '<section class="sec sec-tight"><div class="wrap memo"><form class="card form" data-sub="memo" novalidate>' +
      '<div class="fg"><label for="m-svc">어떤 서비스가 궁금하신가요?</label><select id="m-svc" name="svc"><option value="">서비스를 선택해 주세요</option>' + list.map(function (s) { return '<option value="' + s.id + '"' + (s.id === sel ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select><p class="err" data-e="svc" hidden></p></div>' +
      '<div class="fg"><label for="m-txt">필요한 도움을 적어 주세요 <small>(5~700자)</small></label><textarea id="m-txt" name="txt" rows="7" maxlength="700" placeholder="예: 출장으로 3일 집을 비우는데, 고양이 급식과 화장실 정리를 도와줄 분이 있는지 궁금해요."></textarea><p class="cnt"><span id="m-n">0</span> / 700</p><p class="err" data-e="txt" hidden></p></div>' +
      '<p class="hint">' + ico('lock', 16) + '<span>실명, 전화번호, 상세 주소를 입력하지 않아도 됩니다. 입력한 내용은 이 화면 안에서만 사용되며 화면을 닫으면 사라집니다.</span></p>' +
      '<div class="fa"><button class="btn btn-fill" type="submit">상담 메모 만들기</button><a class="btn btn-line" href="#services">서비스 둘러보기</a></div></form>' +
      '<div class="memo-out" id="memoOut" aria-live="polite"><div class="empty empty-s"><p>메모를 만들면 이곳에 정리된 내용이 나타나요.<br>서비스 설명, 첫 상담 안내, 제공 방식과 운영 기준이 함께 들어갑니다.</p></div></div></div></section>';
    return { title: '상담 메모', html: html, mount: function () { var t = document.getElementById('m-txt'); if (t) t.addEventListener('input', function () { document.getElementById('m-n').textContent = t.value.length; }); } };
  };
  G.SUB.memo = function (f) {
    var svc = f.svc.value, txt = f.txt.value.trim(), ok = true;
    var e1 = f.querySelector('[data-e=svc]'), e2 = f.querySelector('[data-e=txt]');
    e1.hidden = !!svc; if (!svc) { e1.textContent = '서비스를 선택해 주세요.'; ok = false; }
    var okLen = txt.replace(/\s/g, '').length >= 5; e2.hidden = okLen; if (!okLen) { e2.textContent = '필요한 도움을 5자 이상 적어 주세요.'; ok = false; }
    if (!ok) return;
    var s = G.sv(svc);
    var memo = '[더가넷 상담 메모]\n서비스: ' + s.name + ' (' + s.tag + ')\n\n요청 내용\n' + txt + '\n\n첫 상담에서 확인할 내용\n' + s.start + '\n\n제공 방식\n' + s.provide + '\n\n운영 기준\n' + s.standard + '\n\n※ 이 메모는 접수되지 않았으며, 작성만으로 예약·결제·후원이 확정되지 않습니다.';
    var out = document.getElementById('memoOut');
    out.innerHTML = '<div class="card memo-card"><p class="kick">메모가 만들어졌어요</p><h3>' + esc(s.name) + '</h3><pre id="memoTxt" class="memo-pre">' + esc(memo) + '</pre><div class="fa"><button class="btn btn-fill" data-act="copy" data-from="memoTxt">메모 복사하기</button>' +
      (G.bookable(svc) ? '<a class="btn btn-line" href="#apply-' + svc + '">이 서비스 신청하기</a>' : '<a class="btn btn-line" href="#svc-' + svc + '">서비스 자세히 보기</a>') + '</div><p class="small">복사한 메모는 신청서나 1:1 문의에 붙여넣어 그대로 쓰실 수 있어요.</p></div>';
    if (window.innerWidth < 900) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
})();
