/* 레이아웃과 공통 컴포넌트 */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state;

  var NAV = [['services', '돌봄 둘러보기'], ['special', '특별한 날'], ['club', '이웃 나눔'], ['guide', '이용 방법'], ['plans', '멤버십'], ['faq', '고객센터']];
  var NAVMAP = { services: 'services', svc: 'services', apply: 'services', memo: 'services', find: 'services', done: 'services', special: 'special', club: 'club', guide: 'guide', plans: 'plans', faq: 'faq', notices: 'faq', notice: 'faq', inquiry: 'faq' };

  G.dockHtml = function () {
    var all = Object.keys(S.flags).every(function (k) { return S.flags[k].state === 'BOOKABLE'; });
    var area = G.parse().name;
    var cur = area === 'admin' ? 'admin' : area === 'partner' ? 'partner' : 'customer';
    return '<div class="dock" id="dock"><button class="dock-fab" data-act="dock" aria-label="미리보기 도구 열기" aria-expanded="false">' + ico('sliders', 20) + '<span>미리보기</span></button>' +
      '<div class="dock-panel" role="group" aria-label="미리보기 도구">' +
      '<p class="dock-t">화면 전환</p>' +
      '<div class="seg"><button class="' + (cur === 'customer' ? 'on' : '') + '" data-act="role" data-to="home">고객</button><button class="' + (cur === 'partner' ? 'on' : '') + '" data-act="role" data-to="partner">협력업체</button><button class="' + (cur === 'admin' ? 'on' : '') + '" data-act="role" data-to="admin">관리자</button></div>' +
      '<label class="dock-sw"><input type="checkbox" ' + (all ? 'checked' : '') + ' data-on="change:allBookable"><span>모든 서비스를 신청 가능으로 보기</span></label>' +
      (G.dockExtra ? G.dockExtra() : '') + '<button class="dock-reset" data-act="reset">시연 데이터 초기화</button>' +
      '<p class="dock-n">실제 결제·접수·저장은 없으며, 입력한 내용은 이 브라우저에만 남습니다.</p></div></div>';
  };

  G.siteLayout = function (out, r) {
    var u = S.user, act = (G.navMapExtra && G.navMapExtra[r.name]) || NAVMAP[r.name] || r.name;
    var nav = (G.siteNav ? G.siteNav(NAV) : NAV).map(function (n) { return '<a href="#' + n[0] + '" class="' + (act === n[0] ? 'on' : '') + '">' + n[1] + '</a>'; }).join('');
    var favN = S.favs.length;
    var right = u
      ? '<a class="hd-link" href="#my" title="마이페이지">' + ico('user', 18) + '<span>' + esc(u.name) + '님</span></a><button class="hd-link" data-act="logout">로그아웃</button>'
      : '<a class="hd-link" href="#login">로그인</a>';
    return '<div class="site' + (out.cls ? ' ' + out.cls : '') + '">' +
      '<header class="hd" id="hd"><div class="wrap hd-in">' +
      '<a class="logo" href="#home" aria-label="더가넷 홈"><span class="logo-m">THE GARNET<i>.</i></span><span class="logo-s">더가넷 · 생활과 공간을 돌보다</span></a>' +
      '<nav class="nav" aria-label="주요 메뉴">' + nav + '</nav>' +
      '<div class="hd-r">' + right + '<a class="btn btn-line btn-sm hd-cta" href="#find">나에게 맞는 돌봄</a>' +
      '<button class="burger" data-act="menu" aria-label="메뉴 열기" aria-expanded="false">' + ico('menu', 24) + '</button></div></div>' +
      '<div class="drawer" id="drawer"><nav aria-label="모바일 메뉴">' + nav + '<a href="#find">나에게 맞는 돌봄</a>' + (u ? '<a href="#my">마이페이지</a><button data-act="logout">로그아웃</button>' : '<a href="#login">로그인</a><a href="#signup">회원가입</a>') + '</nav></div></header>' +
      (G.siteTopExtra ? G.siteTopExtra(out, r) : '') + '<main id="main">' + out.html + '</main>' +
      '<footer class="ft"><div class="wrap">' +
      '<div class="ft-top"><div><div class="logo-m ft-logo">THE GARNET<i>.</i></div><p class="ft-tag">마음과 집, 반려동물과 지역을 잇는 다정한 돌봄.</p></div>' +
      '<nav class="ft-nav" aria-label="바로가기"><a href="#services">전체 서비스</a><a href="#home">운영 기준</a><a href="#memo">상담 메모 만들기</a><a href="#faq">자주 묻는 질문</a></nav></div>' +
      '<div class="ft-mid"><div><h4>고객센터</h4><p>' + esc(SITE.phone) + ' · ' + esc(SITE.email) + '</p><p>' + esc(SITE.hours) + '</p></div><div><h4>사업자 정보</h4><p>' + esc(SITE.address) + '</p></div><div class="ft-legal"><a href="#terms">이용약관</a><a href="#privacy"><strong>개인정보 처리방침</strong></a><a href="#refund">취소·환불 정책</a></div></div>' +
      '<p class="ft-c">© 2026 THE GARNET. 이 화면은 미리보기용 시안이며 실제 접수·결제·후원금 수령은 이루어지지 않습니다.</p></div></footer>' +
      (G.siteBottomExtra ? G.siteBottomExtra(out, r) : '') + G.dockHtml() + '<div class="toast" id="toast" role="status" aria-live="polite"></div></div>';
  };

  /* 관리자 레이아웃 */
  /* 메뉴 그룹: ['#h', 제목]은 구분 제목 */
  var ADM = [['admin', '대시보드', 'home'],
    ['#h', '운영'], ['admin-apps', '서비스 신청 관리', 'list'], ['admin-members', '회원 관리', 'users'], ['admin-inq', '상담·문의 관리', 'message'], ['admin-partners', '협력업체 관리', 'handshake'], ['admin-club', '이웃 나눔 검증', 'swap'], ['admin-settle', '정산 관리', 'receipt'],
    ['#h', '콘텐츠'], ['admin-notices', '공지사항·FAQ', 'bell'], ['admin-svcs', '서비스 관리', 'grid'],
    ['#h', '분석·시스템'], ['admin-stats', '통계·보고서', 'chart'], ['admin-accounts', '관리자 계정·권한', 'lock'], ['admin-audit', '감사 로그', 'shield']];
  G.adminLayout = function (out, r) {
    var PFX = [['admin-app-', 'admin-apps'], ['admin-club', 'admin-club'], ['admin-settle', 'admin-settle'], ['admin-member-', 'admin-members'], ['admin-partner-', 'admin-partners'], ['admin-notice-', 'admin-notices'], ['admin-faq-', 'admin-notices'], ['admin-svc-', 'admin-svcs']];
    var cur = r.raw; PFX.some(function (p) { if (r.raw.indexOf(p[0]) === 0) { cur = p[1]; return true; } return false; });
    if (G.admCurMap) { var c2 = G.admCurMap(r.raw); if (c2) cur = c2; }
    var nav = (G.admMenu ? G.admMenu() : ADM).map(function (n) { if (n[0] === '#h') return '<p class="adm-h">' + n[1] + '</p>'; return '<a href="#' + n[0] + '" class="' + (cur === n[0] ? 'on' : '') + '">' + ico(n[2], 18) + '<span>' + n[1] + '</span>' + (G.admBadge && G.admBadge(n[0]) ? '<i class="dot-n">' + G.admBadge(n[0]) + '</i>' : '') + (n[0] === 'admin-club' && G.clubTodoCount && G.clubTodoCount() ? '<i class="dot-n">' + G.clubTodoCount() + '</i>' : '') + (n[0] === 'admin-settle' && G.settleTodoCount && G.settleTodoCount() ? '<i class="dot-n">' + G.settleTodoCount() + '</i>' : '') + '</a>'; }).join('');
    var pend = S.apps.filter(function (a) { return a.status === 'SUBMITTED'; }).length;
    return '<div class="adm"><aside class="adm-side"><a class="adm-logo" href="#admin"><span class="logo-m">THE GARNET<i>.</i></span><small>운영 관리</small></a>' +
      '<nav aria-label="관리자 메뉴">' + nav + '</nav><div class="adm-foot"><p class="adm-h">바로가기</p><a href="#home">' + ico('eye', 16) + ' 고객 화면 보기</a><button data-act="adminOut">' + ico('logout', 16) + ' 로그아웃</button></div></aside>' +
      '<div class="adm-main"><header class="adm-top"><div><h1>' + esc(out.heading || out.title) + '</h1>' + (out.sub ? '<p>' + out.sub + '</p>' : '') + '</div><div class="adm-top-r">' + (pend ? '<a class="bd bd-warn" href="#admin-apps">신규 접수 ' + pend + '건</a>' : '') + (G.admTopExtra ? G.admTopExtra() : '') + '<span class="adm-user">' + ico('user', 16) + ' 더가넷 운영자</span></div></header>' +
      '<main id="main" class="adm-body">' + out.html + '</main></div>' + G.dockHtml() + '<div class="toast" id="toast" role="status" aria-live="polite"></div></div>';
  };

  /* ---------- 공통 컴포넌트 ---------- */
  G.pageHead = function (t, sub, crumb, kicker) {
    return '<section class="ph"><div class="wrap">' +
      (crumb ? '<nav class="crumb" aria-label="현재 위치"><a href="#home">홈</a>' + crumb.map(function (c) { return c[1] ? '<a href="#' + c[1] + '">' + esc(c[0]) + '</a>' : '<span>' + esc(c[0]) + '</span>'; }).join('') + '</nav>' : '') +
      (kicker ? '<p class="kick">' + kicker + '</p>' : '') + '<h1 class="ph-t">' + t + '</h1>' + (sub ? '<p class="ph-s">' + sub + '</p>' : '') + '</div></section>';
  };
  G.opChip = function (s) { return '<span class="op op-' + s.op + '">' + esc(s.tag) + '</span>'; };
  G.svcCard = function (s, opt) {
    opt = opt || {}; var f = G.flag(s.id), fav = S.favs.indexOf(s.id) >= 0;
    var stat = f.state === 'BOOKABLE' ? '<span class="st st-on">신청 가능</span>' : f.state === 'PAUSED' ? '<span class="st st-off">일시 중지</span>' : f.state === 'VISIBLE_INFO' ? '<span class="st">안내 공개</span>' : '<span class="st st-soon">준비 중</span>';
    return '<article class="sc" data-g="' + s.group + '" data-id="' + s.id + '" data-on-state="' + f.state + '" data-name="' + esc(s.name + ' ' + s.headline + ' ' + s.summary) + '"><a class="sc-img" href="#svc-' + s.id + '" tabindex="-1" aria-hidden="true"><img src="img/' + s.id + '.jpg" alt="" loading="lazy" width="1000" height="667"></a>' +
      '<button class="sc-fav' + (fav ? ' on' : '') + '" data-act="fav" data-id="' + s.id + '" aria-label="' + esc(s.name) + ' 찜' + (fav ? ' 해제' : '') + '" aria-pressed="' + fav + '">' + G.heartFill(fav) + '</button>' +
      '<div class="sc-b"><div class="sc-meta">' + G.opChip(s) + stat + '</div><h3><a href="#svc-' + s.id + '">' + esc(s.name) + '</a></h3><p>' + esc(s.headline) + '</p>' +
      '<div class="sc-f"><a class="lnk" href="#svc-' + s.id + '">자세히 보기 ' + ico('arrow-right', 16) + '</a></div></div></article>';
  };
  G.faqList = function (items) {
    return '<div class="faq">' + items.map(function (f) { return '<details><summary><span>' + esc(f.q) + '</span>' + ico('plus', 18, 'pl') + '</summary><div class="faq-a"><p>' + esc(f.a) + '</p></div></details>'; }).join('') + '</div>';
  };
  G.empty = function (msg, cta) { return '<div class="empty"><p>' + msg + '</p>' + (cta || '') + '</div>'; };
  G.stepper = function (steps, cur) {
    return '<ol class="stp">' + steps.map(function (s, i) { return '<li class="' + (i < cur ? 'done' : i === cur ? 'cur' : '') + '"><span class="stp-n">' + (i < cur ? ico('check', 14) : (i + 1)) + '</span><span class="stp-t">' + esc(s) + '</span></li>'; }).join('') + '</ol>';
  };

  /* ---------- 공통 액션 ---------- */
  G.ACT.menu = function (el) { var d = document.getElementById('hd'); var on = d.classList.toggle('open'); el.setAttribute('aria-expanded', on); };
  G.ACT.dock = function (el) { var d = document.getElementById('dock'); var on = d.classList.toggle('open'); el.setAttribute('aria-expanded', on); };
  G.ACT.role = function (el) {
    var to = el.getAttribute('data-to');
    if (to === 'admin') G.go(S.adminAuthed ? 'admin' : 'admin-login'); else G.go(to);
  };
  G.ACT.reset = function () { G.reset(); G.toast('시연 데이터를 처음 상태로 되돌렸습니다.'); G.go('home'); G.render(true); };
  G.ACT.logout = function () { S.user = null; G.save(); G.toast('로그아웃했습니다.'); G.go('home'); G.render(true); };
  G.ACT.adminOut = function () { S.adminAuthed = false; G.save(); G.go('admin-login'); };
  G.ACT.fav = function (el) {
    var id = el.getAttribute('data-id'), i = S.favs.indexOf(id);
    if (i >= 0) { S.favs.splice(i, 1); G.toast('찜을 해제했습니다.'); } else { S.favs.push(id); G.toast('찜 목록에 담았습니다.'); }
    G.rerender();
  };
  G.ACT.scroll = function (el) { var t = document.getElementById(el.getAttribute('data-to')); if (t) t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); };
  G.ACT.copy = function (el) {
    var t = document.getElementById(el.getAttribute('data-from')); if (!t) return; var txt = t.value != null && t.tagName === 'TEXTAREA' ? t.value : t.innerText;
    var ok = function () { G.toast('복사했습니다.'); }, fb = function () { try { var r = document.createRange(); r.selectNodeContents(t); var s = getSelection(); s.removeAllRanges(); s.addRange(r); G.toast('내용을 선택했습니다. 직접 복사해 주세요.'); } catch (e) { G.toast('복사하지 못했습니다. 직접 선택해 복사해 주세요.'); } };
    try { navigator.clipboard.writeText(txt).then(ok, fb); } catch (e) { fb(); }
  };
  G.INP.allBookable = function (el) {
    Object.keys(S.flags).forEach(function (k) { S.flags[k].state = el.checked ? 'BOOKABLE' : (WF_FLAGS[k] ? WF_FLAGS[k].state : 'COMING_SOON'); });
    G.toast(el.checked ? '모든 서비스를 신청 가능 상태로 보여 줍니다.' : '서비스 상태를 기본값으로 되돌렸습니다.'); G.rerender();
    var d = document.getElementById('dock'); if (d) d.classList.add('open');
  };
  /* 모바일 메뉴 바깥/이동 시 닫기 */
  window.addEventListener('hashchange', function () { var d = document.getElementById('hd'); if (d) d.classList.remove('open'); });
})();
