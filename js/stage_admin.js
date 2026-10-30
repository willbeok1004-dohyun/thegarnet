/* 단계별 기능 공개 — 관리자 화면 (기능 스위치 · 가맹점·거점 · 사전 신청 · 방문 인력 · 이벤트 · 소식 · 분쟁 · 이용권 · 공동구매 · 기업·기관 · 나눔 · 대리 접수 · 안심 관리 · 지표 · 통합 검색) */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES, T = function () { return S.st; };
  var A = function (o) { o.layout = 'admin'; return o; };
  var card = function (t, body, extra) { return '<section class="ac ' + (extra || '') + '">' + (t ? '<h2>' + t + '</h2>' : '') + body + '</section>'; };
  var byId = function (arr, id) { return (arr || []).filter(function (x) { return String(x.id) === String(id); })[0]; };
  var $ = function (id) { return document.getElementById(id); };
  var val = function (id) { var e = $(id); return e ? String(e.value || '').trim() : ''; };
  var nm = function (id) { return G.nbMember ? G.nbMember(id).name : id; };
  var f = G.feat;
  var back = function (h, t) { return '<p class="mb"><a class="lnk" href="#' + h + '">' + ico('arrow-left', 16) + ' ' + t + '</a></p>'; };
  var tbl = function (head, rows, empty) { return rows.length ? '<div class="tw"><table class="tbl"><thead><tr>' + head.map(function (h) { return '<th' + (h.charAt(0) === '>' ? ' class="r"' : '') + '>' + h.replace(/^>/, '') + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>' : '<p class="small">' + (empty || '아직 없어요.') + '</p>'; };
  var kpis = function (arr, cls) { return '<div class="kpis ' + (cls || 'k4') + '">' + arr.map(function (k) { return (k[2] ? '<a class="kpi ' + (k[3] || '') + '" href="#' + k[2] + '">' : '<div class="kpi ' + (k[3] || '') + '">') + '<span>' + k[0] + '</span><b>' + k[1] + '</b>' + (k[2] ? '</a>' : '</div>'); }).join('') + '</div>'; };
  var me = function () { return G.adminMe ? G.adminMe() : { role: 'ADMIN', loginId: 'admin' }; };
  var isBranch = function () { return me().role === 'BRANCH'; };
  var myBranch = function () { return isBranch() ? (me().branch || 'B1') : ''; };
  var sel = function (id, opts, cur, attr) { return '<select id="' + id + '"' + (attr || '') + '>' + opts.map(function (o) { o = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(o[0]) + '"' + (String(cur) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; };
  var fg = function (id, label, input, cls) { return '<div class="fg' + (cls ? ' ' + cls : '') + '"><label class="lb" for="' + id + '">' + label + '</label>' + input + '</div>'; };
  var inp = function (id, v, ph, type) { return '<input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(v == null ? '' : v) + '" placeholder="' + esc(ph || '') + '">'; };
  var done = function (msg, to) { G.save(); G.toast(msg); if (to) G.go(to); else G.rerender(); };

  /* ---------- 가맹점 매니저 계정 ---------- */
  function ensureBranchAcc() {
    if (!S.ops || !S.ops.admins) return;
    if (!S.ops.admins.some(function (x) { return x.loginId === 'branch'; })) S.ops.admins.push({ id: 's3', loginId: 'branch', name: '마포점 매니저 (예시)', role: 'BRANCH', branch: 'B1', active: true, pw: 'Branch!2345', fails: 0, locked: false, at: '2026-10-28' });
  }
  var oLogin = G.SUB.adminLogin;
  G.SUB.adminLogin = function (form) {
    ensureBranchAcc();
    var acc = S.ops.admins.filter(function (x) { return x.loginId === val('a-id'); })[0];
    if (acc && acc.role === 'BRANCH' && !f('branchManager')) { var e = $('a-e'); e.textContent = '가맹점 매니저 계정은 [단계별 기능 공개 → 2단계 · 가맹점 매니저]를 켜야 쓸 수 있어요.'; e.hidden = false; return; }
    oLogin(form);
  };
  var BRANCH_OK = ['', 'apps', 'app-', 'members', 'member-', 'inq', 'preorders', 'branches', 'branch-', 'hub-', 'events', 'event-', 'news', 'proxy', 'safety', 'staff', 'search-'];
  var branchAllowed = function (arg) { return BRANCH_OK.some(function (g) { return arg === g || (g.slice(-1) === '-' && arg.indexOf(g) === 0); }); };
  var oMenu = G.admMenu;
  G.admMenu = function () {
    var m = oMenu();
    if (!isBranch()) return m;
    return m.filter(function (n) { return n[0] === '#h' || branchAllowed(n[0].replace(/^admin-?/, '')); });
  };
  G.admBadge = function (h) {
    var t = T();
    if (h === 'admin-disputes' && f('dispute')) return t.disputes.filter(function (d) { return d.status !== '종결'; }).length;
    if (h === 'admin-safety' && f('safety')) return safetyItems().length;
    if (h === 'admin-preorders' && f('preorder')) return t.preorders.filter(function (r) { return !r.called; }).length;
    if (h === 'admin-branches' && f('hubOps')) return t.storage.filter(function (x) { return x.st === '보관 중' && x.due < SITE.today; }).length;
    if (h === 'admin-nominate' && f('givingNominate')) return t.nominations.filter(function (x) { return x.st !== '선정' && x.st !== '보류'; }).length;
    return 0;
  };
  G.admTopExtra = function () {
    return f('adminSearch') ? '<form class="adm-srch" data-sub="admSearch" role="search"><label class="srch">' + ico('search', 16) + '<input id="adm-q" type="search" placeholder="회원·신청·업체·글·후원 통합 검색" aria-label="통합 검색"></label></form>' : '';
  };
  G.SUB.admSearch = function () { var q = val('adm-q'); if (q) G.go('admin-search-' + encodeURIComponent(q)); };

  /* ---------- 라우팅 ---------- */
  var oAdmin = P.admin;
  P.admin = function (arg, r) {
    if (!S.adminAuthed || arg === 'login') {
      var o = oAdmin(arg, r);
      if (f('branchManager')) o.html = o.html.replace('5회 틀리면 계정이 잠겨요.', '<b>branch</b> / Branch!2345 (가맹점 매니저). 5회 틀리면 계정이 잠겨요.');
      return o;
    }
    ensureBranchAcc();
    if (isBranch() && !f('branchManager')) { S.adminAuthed = false; G.save(); return oAdmin('login', r); }
    if (isBranch() && !branchAllowed(arg)) return A({ title: '권한 없음', heading: '접근 권한이 없어요', sub: '역할: 가맹점 매니저', html: card('', '<p>가맹점 매니저는 담당 동네의 신청·회원·사전 신청·거점·이벤트·소식·대리 접수·안심 관리만 다뤄요.</p><p class="fa"><a class="btn btn-line btn-sm" href="#admin">대시보드로</a></p>') });
    var seg = function (p) { return arg.indexOf(p) === 0 ? arg.slice(p.length) : null; }, x;
    var gate = function (k, fn) { return f(k) ? fn() : off(k); };
    if (arg === 'features') return me().role === 'ADMIN' ? features() : A({ title: '권한 없음', heading: '접근 권한이 없어요', html: card('', '<p>단계별 기능 공개는 최고관리자만 바꿀 수 있어요.</p>') });
    if (arg === 'branches') return gate('branches', branches);
    if ((x = seg('branch-')) !== null) return gate('branches', function () { return branchDetail(x); });
    if ((x = seg('branchedit-')) !== null) return gate('branches', function () { return branchForm(x); });
    if ((x = seg('hub-')) !== null) return gate('places', function () { return hubForm(x); });
    if (arg === 'preorders') return gate('preorder', preorders);
    if (arg === 'staff') return gate('staff', staff);
    if (arg === 'events') return gate('events', events);
    if ((x = seg('event-')) !== null) return gate('events', function () { return eventForm(x); });
    if (arg === 'news') return gate('news', news);
    if (arg === 'disputes') return gate('dispute', disputes);
    if ((x = seg('dispute-')) !== null) return gate('dispute', function () { return disputeDetail(x); });
    if (arg === 'coupons') return gate('coupons', coupons);
    if (arg === 'groupbuy') return gate('groupbuy', groupbuy);
    if (arg === 'corps') return gate('corp', corps);
    if ((x = seg('corp-')) !== null) return gate('corp', function () { return corpForm(x); });
    if (arg === 'giving') return gate('giving', giving);
    if ((x = seg('give-')) !== null) return gate('giving', function () { return givingTab(x); });
    if ((x = seg('proj-')) !== null) return gate('giving', function () { return projDetail(x); });
    if (arg === 'nominate') return gate('givingNominate', nominate);
    if (arg === 'proxy') return f('phoneApply') || f('branchManager') ? proxy() : off('phoneApply');
    if (arg === 'safety') return gate('safety', safety);
    if (arg === 'metrics') return gate('metrics', metrics);
    if ((x = seg('search-')) !== null) return gate('adminSearch', function () { return search(decodeURIComponent(x)); });
    if ((x = seg('pinfo-')) !== null) return gate('partnerInfo', function () { return partnerInfo(x); });
    var o2 = oAdmin(arg, r);
    try { return post(arg, o2); } catch (e) { console.error(e); return o2; }
  };
  function off(k) {
    var st = ''; G.STAGES.forEach(function (s) { s.items.forEach(function (i) { if (i[0] === k) st = s.name; }); });
    return A({ title: '꺼진 기능', heading: '아직 열지 않은 기능이에요', sub: st, html: card('', '<p><b>' + esc(G.featName(k)) + '</b> 기능이 꺼져 있어요. 진행 단계에 맞춰 [단계별 기능 공개]에서 켜 주세요.</p><p class="fa"><a class="btn btn-fill btn-sm" href="#admin-features">단계별 기능 공개로</a></p>') });
  }

  /* ================= 단계별 기능 공개 ================= */
  var WHERE = {
    fixGiving: ['svc-S15', '고객 · 기부·후원 상세'], pumon: ['club', '고객 · 품온'], pumonCheck: ['club-new', '고객 · 품온 글쓰기'], branches: ['admin-branches', '관리자 · 가맹점·거점'], places: ['places', '고객 · 거점 찾기'],
    hubOps: ['admin-branches', '관리자 · 보관함'], preorder: ['preorder', '고객 · 창립회원 사전 신청'], localBadge: ['admin-member-u1', '관리자 · 회원 상세'], menuGroups: ['admin', '관리자 메뉴'],
    memberLink: ['plans', '고객 · 멤버십'], trial3: ['club', '고객 · 품온'], gradeFee: ['club-rules', '고객 · 품온 기준'], points: ['my-points', '마이 · 포인트'], memberTypes: ['signup', '고객 · 회원가입'],
    memberHistory: ['admin-member-u1', '관리자 · 회원 상세'], branchManager: ['admin-proxy', '관리자 · 대리 가입'], staff: ['admin-staff', '관리자 · 방문 인력'],
    events: ['events', '고객 · 모임·이벤트'], rating3: ['my-app-G2609-0001', '마이 · 완료한 신청'], safeMeet: ['club-mine', '고객 · 약속'], promise: ['promise', '고객 · 안심 약속'], workLog: ['my-app-G2610-0003', '마이 · 진행 중 신청'],
    dispute: ['admin-disputes', '관리자 · 분쟁'], news: ['news', '고객 · 동네 소식'],
    pay: ['my-app-G2610-0004', '마이 · 승인 대기 신청'], coupons: ['my-points', '마이 · 이용권'], priceTable: ['svc-S03', '고객 · 정리수납 상세'], groupbuy: ['groupbuy', '고객 · 공동구매'], corp: ['corp', '고객 · 기업·기관'],
    partnerInfo: ['admin-partners', '관리자 · 협력업체'], safeNumber: ['my-app-G2610-0002', '마이 · 일정 확정 신청'], bridge: ['svc-S12', '고객 · 동행 상세'], giving: ['giving', '고객 · 나눔'],
    bigText: ['home', '고객 · 홈'], phoneApply: ['admin-proxy', '관리자 · 전화 접수'], family: ['my-family', '마이 · 가족·안심'], alimtalk: ['my-notify', '마이 · 받은 알림'], easyWords: ['my-apps', '마이 · 신청 내역'],
    homeLog: ['my-homelog', '마이 · 우리 집 기록'], metrics: ['admin-metrics', '관리자 · 품온 지표'], adminSearch: ['admin-search-김', '관리자 · 통합 검색'], safety: ['admin-safety', '관리자 · 안심 관리'], givingReport: ['giving-report', '고객 · 나눔 보고서'],
    timePum: ['club', '고객 · 품온'], memberMeet: ['events', '고객 · 모임'], givingNominate: ['giving-nominate', '고객 · 나눔 추천'], regular: ['apply-S03', '고객 · 신청서'], pwa: ['home', '고객 · 홈']
  };
  function features() {
    var fl = T().flags, total = 0, on = 0, cur = '아직 없음';
    G.STAGES.forEach(function (s) { var n = s.items.filter(function (i) { return fl[i[0]]; }).length; total += s.items.length; on += n; if (n === s.items.length) cur = s.name; });
    var rev = {}; Object.keys(G.FEAT_DEPS).forEach(function (k) { G.FEAT_DEPS[k].forEach(function (d) { (rev[d] = rev[d] || []).push(k); }); });
    var cards = G.STAGES.map(function (s, si) {
      var n = s.items.filter(function (i) { return fl[i[0]]; }).length;
      var rows = s.items.map(function (i) {
        var k = i[0], deps = (G.FEAT_DEPS[k] || []).map(G.featName), w = WHERE[k];
        return '<li class="ft-row' + (fl[k] ? ' on' : '') + '"><label class="sw"><input type="checkbox" data-on="change:featSw" data-k="' + k + '"' + (fl[k] ? ' checked' : '') + ' aria-label="' + esc(i[1]) + '"><i></i></label><div><b>' + esc(i[1]) + '</b>' +
          (deps.length ? '<small>함께 켜지는 기능: ' + deps.map(esc).join(', ') + '</small>' : '') + (rev[k] ? '<small>끄면 함께 꺼짐: ' + rev[k].map(G.featName).map(esc).join(', ') + '</small>' : '') + '</div>' +
          (w ? '<a class="lnk-i" href="#' + w[0] + '">' + esc(w[1]) + '</a>' : '') + '</li>';
      }).join('');
      return '<section class="ac ft-st" id="st-' + s.id + '"><div class="ft-h"><div><p class="kick">STAGE ' + (si === 0 ? 'NOW' : si === 6 ? '2ND' : si) + '</p><h2>' + esc(s.name) + '</h2><p class="small">' + esc(s.why) + '</p></div><div class="ft-c"><span class="bd bd-' + (n === s.items.length ? 'ok' : n ? 'warn' : 'mute') + '">' + n + ' / ' + s.items.length + ' 켜짐</span>' +
        '<div class="inl"><button class="btn btn-fill btn-sm" data-act="featStage" data-i="' + si + '" data-v="1">이 단계 실행</button><button class="btn btn-ghost btn-sm" data-act="featStage" data-i="' + si + '" data-v="0">이 단계 끄기</button></div></div></div>' +
        '<div class="ft-bar"><i style="width:' + Math.round(n / s.items.length * 100) + '%"></i></div><ul class="ft-list">' + rows + '</ul></section>';
    }).join('');
    var log = T().flagLog.slice(0, 12).map(function (l) { return '<tr><td>' + esc(l.at) + '</td><td>' + esc(l.who) + '</td><td>' + esc(l.what) + '</td></tr>'; });
    return A({ title: '단계별 기능 공개', heading: '단계별 기능 공개', sub: '결정안의 진행 단계대로 기능을 열고 닫아요. 켜는 즉시 고객·관리자 화면에 반영되고, 끄면 데이터는 남긴 채 화면에서만 숨겨요.', html:
      kpis([['켜진 기능', on + ' / ' + total], ['완료한 단계', cur], ['다음 할 일', nextStage()], ['변경 기록', T().flagLog.length + '건']]) +
      '<div class="callout">' + ico('sliders', 20) + '<div><strong>이렇게 쓰세요</strong><p>단계 카드의 <b>이 단계 실행</b>을 누르면 앞 단계까지 모두 켜져요. 기능 하나만 열려면 스위치를 켜세요. 필요한 앞선 기능은 자동으로 함께 켜지고, 끄면 그 기능에 기대는 기능도 함께 꺼져요.</p></div></div>' +
      '<div class="fa top mt"><button class="btn btn-line btn-sm" data-act="featAll" data-v="1">모두 켜기 (시연)</button><button class="btn btn-ghost btn-sm" data-act="featAll" data-v="0">처음 상태로 (지금 바로만)</button><a class="btn btn-ghost btn-sm" href="#home">' + ico('eye', 16) + ' 고객 화면 보기</a></div>' +
      '<div class="ft-grid">' + cards + '</div>' + card('변경 기록', tbl(['일시', '관리자', '내용'], log, '아직 바꾼 기능이 없어요.')) });
  }
  function nextStage() { var fl = T().flags, n = '모두 완료'; G.STAGES.some(function (s) { if (s.items.some(function (i) { return !fl[i[0]]; })) { n = s.name.split(' · ')[0]; return true; } return false; }); return n; }
  function flagLog(what) { T().flagLog.unshift({ at: G.now(), who: me().loginId, what: what }); T().flagLog = T().flagLog.slice(0, 80); G.log('단계별 기능: ' + what); }
  G.INP.featSw = function (el) {
    var k = el.dataset.k, ch = G.setFeat(k, el.checked);
    flagLog((el.checked ? '켬 · ' : '끔 · ') + ch.map(G.featName).join(', '));
    G.toast(el.checked ? (ch.length > 1 ? '함께 필요한 기능 ' + (ch.length - 1) + '개도 켰어요.' : '기능을 켰어요.') : (ch.length > 1 ? '이 기능에 기대는 ' + (ch.length - 1) + '개도 함께 껐어요.' : '기능을 껐어요.'));
    onChange(); G.rerender();
  };
  G.ACT.featStage = function (el) {
    var i = +el.dataset.i, on = el.dataset.v === '1', ch = [];
    G.STAGES.forEach(function (s, si) { if (on ? si <= i : si === i) s.items.forEach(function (it) { ch = ch.concat(G.setFeat(it[0], on)); }); });
    flagLog((on ? '단계 실행 · ' : '단계 끄기 · ') + G.STAGES[i].name + ' (' + ch.length + '개)');
    G.toast(on ? G.STAGES[i].name + '까지 실행했어요.' : G.STAGES[i].name + '를 껐어요.'); onChange(); G.rerender();
  };
  G.ACT.featAll = function (el) {
    var on = el.dataset.v === '1', fl = T().flags;
    G.STAGES.forEach(function (s) { s.items.forEach(function (it) { fl[it[0]] = on || it[0] === 'fixGiving'; }); });
    flagLog(on ? '모든 기능 켬 (시연)' : '처음 상태로 되돌림'); G.toast(on ? '모든 단계를 켰어요.' : '지금 바로 항목만 남겼어요.'); onChange(); G.rerender();
  };
  function onChange() { if (G.stageApply) G.stageApply(); ensureBranchAcc(); }

  /* ================= 가맹점 · 거점 ================= */
  function branchList() { return T().branches.filter(function (b) { return !myBranch() || b.id === myBranch(); }); }
  function memOf(bid) { return Object.keys(T().mem).filter(function (u) { return T().mem[u].branch === bid; }); }
  function branches() {
    var rows = branchList().map(function (b) {
      var hubs = T().hubs.filter(function (h) { return h.branch === b.id; });
      return '<tr class="lk" data-act="goto" data-to="admin-branch-' + b.id + '"><td><a href="#admin-branch-' + b.id + '"><b>' + esc(b.name) + '</b></a><small class="blk">' + b.code + ' · ' + esc(b.kind) + '</small></td><td>' + esc(b.bizNo) + '<small class="blk">' + esc(b.bizType + ' / ' + b.bizItem) + '</small></td><td>' + esc(b.manager) + '<small class="blk">' + esc(b.phone) + '</small></td><td>' + b.area.map(function (a) { return '<span class="tag">' + esc(a) + '</span>'; }).join('') + '</td><td class="r">' + memOf(b.id).length + '</td><td class="r">' + hubs.length + '</td></tr>';
    });
    var st = T().storage.filter(function (x) { return !myBranch() || (G.hub(x.hub) || {}).branch === myBranch(); });
    var hubRows = T().hubs.filter(function (h) { return !myBranch() || h.branch === myBranch(); }).map(function (h) {
      var used = st.filter(function (x) { return x.hub === h.id && x.st === '보관 중'; }).length;
      return '<tr class="lk" data-act="goto" data-to="admin-hub-' + h.id + '"><td><a href="#admin-hub-' + h.id + '"><b>' + esc(h.name) + '</b></a><small class="blk">' + esc(h.kind) + ' · ' + esc((G.branch(h.branch) || {}).name || '') + '</small></td><td>' + esc(h.addr) + '</td><td>' + esc(h.hours) + '</td><td class="r">' + used + ' / ' + h.lockers + '</td><td>' + (h.meet ? '모임 가능' : '-') + '</td></tr>';
    });
    var stRows = st.map(function (x) {
      var late = x.st === '보관 중' && x.due < SITE.today;
      return '<tr><td><b>' + esc(x.code) + '</b><small class="blk">' + esc(x.deal || '') + '</small></td><td>' + esc(x.item) + '</td><td>' + esc((G.hub(x.hub) || {}).name || '') + '</td><td>' + esc(nm(x.from)) + ' → ' + esc(nm(x.to)) + '</td><td>' + esc(x.at.slice(0, 10)) + '<small class="blk">기한 ' + x.due + '</small></td><td>' + (late ? '<span class="bd bd-bad">기한 지남</span>' : '<span class="bd bd-' + (x.st === '보관 중' ? 'info' : 'ok') + '">' + esc(x.st) + '</span>') + '</td><td>' + (x.st === '보관 중' ? '<div class="inl"><button class="btn btn-line btn-sm" data-act="stoSet" data-id="' + x.id + '" data-v="수령 완료">수령 확인</button><button class="btn btn-ghost btn-sm" data-act="stoSet" data-id="' + x.id + '" data-v="반환">반환</button></div>' : '') + '</td></tr>';
    });
    return A({ title: '가맹점·거점', heading: '가맹점 · 거점', sub: '가맹점 하나가 하나의 동네예요. 필수 정보와 거점·보관함을 함께 관리해요.', html:
      card('가맹점 (동네)', (isBranch() ? '' : '<div class="fa top"><a class="btn btn-fill btn-sm" href="#admin-branchedit-new">' + ico('plus', 16) + ' 가맹점 등록</a></div>') + tbl(['가맹점', '사업자등록번호 · 업태/종목', '매니저 · 연락처', '담당 동네', '>회원', '>거점'], rows)) +
      (f('places') ? card('거점 (전달·모임 장소)', (isBranch() ? '' : '<div class="fa top"><a class="btn btn-line btn-sm" href="#admin-hub-new">' + ico('plus', 16) + ' 거점 등록</a></div>') + tbl(['거점', '주소', '운영 시간', '>보관함 사용', '모임'], hubRows)) : '') +
      (f('hubOps') ? card('보관함 운영', tbl(['보관 코드', '물품', '거점', '맡긴 분 → 찾을 분', '맡긴 날 · 기한', '상태', ''], stRows, '보관 중인 물품이 없어요. 품온 약속에서 거점 맡기기를 하면 여기에 쌓여요.') + '<p class="small">보관 기한은 7일이에요. 기한이 지나면 맡긴 분에게 알리고, 3일 더 지나면 반환해요. 식품·의약품·고가품은 받지 않아요.</p>') : '') });
  }
  G.ACT.stoSet = function (el) { var x = byId(T().storage, el.dataset.id); x.st = el.dataset.v; x.doneAt = G.now(); G.log('거점 보관 ' + x.code + ' ' + x.st); G.notify(x.from, '[더가넷] 거점에 맡긴 물품(' + x.item + ')이 ' + x.st + ' 처리됐어요.'); done('처리했어요.'); };
  function branchDetail(id) {
    var b = G.branch(id); if (!b) return A({ title: '가맹점', heading: '가맹점을 찾을 수 없어요', html: back('admin-branches', '목록') });
    var mem = memOf(id), apps = S.apps.filter(function (a) { return G.branchOfRegion(a.region) === id; }), pre = T().preorders.filter(function (r) { return r.branch === id; });
    var posts = S.club.posts.filter(function (p) { return mem.indexOf(p.owner) >= 0; }), deals = S.club.deals.filter(function (d) { return mem.indexOf(d.req) >= 0 || mem.indexOf(d.prov) >= 0; });
    var ev = T().events.filter(function (e) { return e.branch === id; }), sto = T().storage.filter(function (x) { return (G.hub(x.hub) || {}).branch === id; });
    var hist = [];
    apps.forEach(function (a) { hist.push([a.at, '서비스 신청', a.no + ' · ' + G.sv(a.svc).name + ' · ' + G.stName(a.status), 'admin-app-' + a.no]); });
    deals.forEach(function (d) { hist.push([d.at, '품온 약속', d.id + ' · ' + nm(d.req) + ' ↔ ' + nm(d.prov), '']); });
    ev.forEach(function (e) { hist.push([e.date, '이벤트', e.title + ' · 신청 ' + e.joined.length + '명', 'admin-event-' + e.id]); });
    pre.forEach(function (r) { hist.push([r.at, '사전 신청', r.name + ' · ' + r.want.join(', '), 'admin-preorders']); });
    sto.forEach(function (x) { hist.push([x.at, '거점 보관', x.code + ' · ' + x.item + ' · ' + x.st, 'admin-branches']); });
    hist.sort(function (p, q) { return p[0] < q[0] ? 1 : -1; });
    var info = [['가맹점 코드', b.code], ['사업자등록번호', b.bizNo], ['대표자', b.owner], ['업태 / 종목', b.bizType + ' / ' + b.bizItem], ['주소', b.addr], ['대표 연락처', b.phone], ['매니저', b.manager], ['이메일', b.email], ['운영 시간', b.hours], ['계약 기간', b.contract], ['형태', b.kind]];
    return A({ title: b.name, heading: b.name, sub: b.code + ' · 담당 동네 ' + b.area.join(', '), html: back('admin-branches', '가맹점 목록') +
      kpis([['동네 회원', mem.length], ['서비스 신청', apps.length], ['품온 약속', deals.length], ['사전 신청', pre.length + (T().preorderBase[id] || 0)], ['이벤트', ev.length]], 'k5') +
      '<div class="ag ag2 mt"><div>' + card('상세 이력 (최신순)', tbl(['일시', '구분', '내용'], hist.slice(0, 30).map(function (h) { return '<tr' + (h[3] ? ' class="lk" data-act="goto" data-to="' + h[3] + '"' : '') + '><td>' + esc(String(h[0]).slice(0, 16)) + '</td><td><span class="tag">' + h[1] + '</span></td><td>' + esc(h[2]) + '</td></tr>'; }), '이력이 없어요.')) +
      card('동네 회원', tbl(['회원', '유형', '동네 확인', '등급'], mem.map(function (u) { var m = T().mem[u]; return '<tr class="lk" data-act="goto" data-to="admin-member-' + u + '"><td>' + esc(nm(u)) + '</td><td>' + esc(m.type) + '</td><td>' + (T().localOk[u] ? '<span class="bd bd-ok">' + T().localOk[u] + '</span>' : '-') + '</td><td>' + esc(PLANS[G.planOf(u)][0]) + '</td></tr>'; }))) + '</div><div>' +
      card('필수 정보', '<dl class="sum">' + info.map(function (i) { return '<div class="kv"><dt>' + i[0] + '</dt><dd>' + esc(i[1]) + '</dd></div>'; }).join('') + '</dl>' + (isBranch() ? '' : '<a class="btn btn-line btn-sm" href="#admin-branchedit-' + id + '">정보 수정</a>')) +
      card('거점', '<ul class="mng">' + T().hubs.filter(function (h) { return h.branch === id; }).map(function (h) { return '<li><div><b>' + esc(h.name) + '</b><small>' + esc(h.addr) + '</small></div><a class="btn btn-line btn-sm" href="#admin-hub-' + h.id + '">관리</a></li>'; }).join('') + '</ul>') + '</div></div>' });
  }
  var BF = [['name', '가맹점명 *'], ['code', '가맹점 코드 *'], ['bizNo', '사업자등록번호 *'], ['owner', '대표자 *'], ['bizType', '업태 *'], ['bizItem', '종목 *'], ['addr', '주소 *'], ['phone', '대표 연락처 *'], ['manager', '매니저(담당자) *'], ['email', '이메일 *'], ['hours', '운영 시간'], ['contract', '계약 기간'], ['kind', '형태 (매장형/사무실형/무점포)'], ['area', '담당 동네 (쉼표로 구분) *']];
  function branchForm(id) {
    var isNew = id === 'new', b = isNew ? { area: [] } : G.branch(id); if (!b) return off('branches');
    return A({ title: '가맹점 정보', heading: isNew ? '가맹점 등록' : b.name, sub: '사업자등록번호·업태·주소·연락처·담당자·이메일은 꼭 입력해요.', html: back('admin-branches', '가맹점 목록') + card('', '<form class="form" data-sub="brSave" data-id="' + id + '" novalidate><div class="fgrid">' + BF.map(function (x) { return fg('bf-' + x[0], x[1], inp('bf-' + x[0], x[0] === 'area' ? (b.area || []).join(', ') : b[x[0]], x[0] === 'bizNo' ? '000-00-00000' : '')); }).join('') + '</div><p class="err" id="bf-e" hidden></p><div class="fa"><button class="btn btn-fill" type="submit">저장</button></div></form>') });
  }
  G.SUB.brSave = function (fm) {
    var id = fm.dataset.id, o = {}, miss = [];
    BF.forEach(function (x) { o[x[0]] = val('bf-' + x[0]); if (x[1].indexOf('*') > 0 && !o[x[0]]) miss.push(x[1].replace(' *', '')); });
    if (!miss.length && !/^\d{3}-\d{2}-\d{5}$/.test(o.bizNo)) miss.push('사업자등록번호 형식(000-00-00000)');
    if (miss.length) { var e = $('bf-e'); e.textContent = '확인해 주세요: ' + miss.join(', '); e.hidden = false; return; }
    o.area = o.area.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (id === 'new') { o.id = 'B' + (T().branches.length + 1); T().branches.push(o); } else Object.assign(G.branch(id), o);
    G.log('가맹점 정보 저장: ' + o.name); done('저장했어요.', 'admin-branches');
  };
  var HF = [['name', '거점 이름 *'], ['kind', '구분 (가맹점/제휴) *'], ['addr', '주소 *'], ['near', '찾아오는 길 (큰 건물·출구 기준) *'], ['hours', '운영 시간 *'], ['phone', '연락처 *'], ['lockers', '보관함 칸 수'], ['facil', '편의 (쉼표로 구분: 엘리베이터, 경사로, 화장실 등)']];
  function hubForm(id) {
    var isNew = id === 'new', h = isNew ? { branch: myBranch() || 'B1', facil: [], lockers: 0, meet: false, x: 0.5, y: 0.5 } : G.hub(id); if (!h) return off('places');
    return A({ title: '거점', heading: isNew ? '거점 등록' : h.name, sub: '어르신도 찾기 쉽게 큰 건물·출구 기준으로 찾아오는 길을 적어요.', html: back('admin-branches', '가맹점·거점') + card('', '<form class="form" data-sub="hubSave" data-id="' + id + '" novalidate><div class="fgrid">' +
      fg('hf-branch', '가맹점', sel('hf-branch', T().branches.map(function (b) { return [b.id, b.name]; }), h.branch)) + HF.map(function (x) { return fg('hf-' + x[0], x[1], inp('hf-' + x[0], x[0] === 'facil' ? (h.facil || []).join(', ') : h[x[0]])); }).join('') +
      '<div class="fg"><span class="lb">모임</span><label class="chk"><input type="checkbox" id="hf-meet"' + (h.meet ? ' checked' : '') + '> 모임 장소로 쓸 수 있어요</label></div></div><p class="err" id="hf-e" hidden></p><div class="fa"><button class="btn btn-fill" type="submit">저장</button></div></form>') });
  }
  G.SUB.hubSave = function (fm) {
    var id = fm.dataset.id, o = { branch: val('hf-branch'), meet: $('hf-meet').checked }, miss = [];
    HF.forEach(function (x) { o[x[0]] = val('hf-' + x[0]); if (x[1].indexOf('*') > 0 && !o[x[0]]) miss.push(x[1].replace(' *', '')); });
    if (miss.length) { var e = $('hf-e'); e.textContent = '확인해 주세요: ' + miss.join(', '); e.hidden = false; return; }
    o.lockers = +o.lockers || 0; o.facil = o.facil.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (id === 'new') { o.id = 'H' + (T().hubs.length + 1); o.x = 0.2 + Math.random() * 0.6; o.y = 0.2 + Math.random() * 0.6; T().hubs.push(o); } else Object.assign(G.hub(id), o);
    G.log('거점 저장: ' + o.name); done('저장했어요.', 'admin-branches');
  };

  /* ================= 사전 신청 ================= */
  function preorders() {
    var l = T().preorders.filter(function (r) { return !myBranch() || r.branch === myBranch(); });
    var by = branchList().map(function (b) { var n = l.filter(function (r) { return r.branch === b.id; }).length + (T().preorderBase[b.id] || 0); return [b.name.replace(' (예시)', ''), n + ' / 50']; });
    return A({ title: '사전 신청', heading: '창립회원 사전 신청', sub: '동네별 50명이 모이면 품온을 열어요. 연락처는 가려서 보여요.', html: kpis(by.concat([['새 신청 (미연락)', l.filter(function (r) { return !r.called; }).length]]), 'k3') +
      card('신청 목록', tbl(['신청일', '이름', '연락처', '동네', '관심 서비스', '연락'], l.map(function (r) { return '<tr><td>' + esc(r.at) + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.phone) + '</td><td>' + esc((G.branch(r.branch) || {}).name || '') + '</td><td>' + r.want.map(function (w) { return '<span class="tag">' + esc(w) + '</span>'; }).join('') + '</td><td>' + (r.called ? '<span class="bd bd-ok">' + esc(r.called) + '</span>' : '<button class="btn btn-line btn-sm" data-act="preCall" data-id="' + r.id + '">안내 완료</button>') + '</td></tr>'; })) + '<p class="small">사전 신청 정보는 오픈 안내에만 쓰고, 오픈 후 3개월이 지나면 가입하지 않은 분의 정보는 지워요.</p>') });
  }
  G.ACT.preCall = function (el) { var r = byId(T().preorders, el.dataset.id); r.called = SITE.today; G.log('사전 신청 ' + r.id + ' 안내 완료'); done('안내 완료로 표시했어요.'); };

  /* ================= 방문 인력 ================= */
  var BADGE = [['id', '신원 확인'], ['cert', '자격'], ['health', '건강 확인'], ['edu', '안심 교육'], ['ins', '배상 보험']];
  G.staffBadges = function (w) {
    return BADGE.map(function (b) { var v = w.badges[b[0]], exp = /^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v : ''; var bad = !v || (exp && exp < SITE.today); var soon = exp && !bad && G.dayDiff(SITE.today, exp) <= 45; return '<span class="bd bd-' + (bad ? 'bad' : soon ? 'warn' : 'ok') + '" title="' + esc(v || '없음') + '">' + b[1] + (soon ? ' 갱신 임박' : bad ? ' 없음' : '') + '</span>'; }).join(' ');
  };
  function staff() {
    var pn = function (o) { return o.charAt(0) === 'B' ? (G.branch(o) || {}).name : (byId(PARTNERS, o) || {}).name; };
    return A({ title: '방문 인력', heading: '방문 인력 관리', sub: '고객 집에 가는 인력은 신원·자격·건강·교육·보험 배지를 갖추고, 방문 전에 고객에게 미리 공개해요.', html:
      card('인력 목록', tbl(['이름', '소속', '역할', '인증 배지', '>완료'], T().staff.map(function (w) { return '<tr><td><b>' + esc(w.name) + '</b><small class="blk">' + w.id + ' · ' + w.since + '부터</small></td><td>' + esc(pn(w.org) || w.org) + '</td><td>' + esc(w.role) + '</td><td>' + G.staffBadges(w) + '</td><td class="r">' + w.done + '</td></tr>'; }))) +
      card('배정 현황', tbl(['신청', '서비스', '고객', '방문 인력'], S.apps.filter(function (a) { return ['APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].indexOf(a.status) >= 0; }).map(function (a) { var w = byId(T().staff, T().appStaff[a.no]); return '<tr class="lk" data-act="goto" data-to="admin-app-' + a.no + '"><td>' + a.no + '</td><td>' + esc(G.sv(a.svc).name) + '</td><td>' + esc(nm(a.user)) + '</td><td>' + (w ? esc(w.name + ' · ' + w.role) : '<span class="bd bd-warn">미배정</span>') + '</td></tr>'; })) + '<p class="small">배정은 신청 상세의 [방문 인력] 카드에서 해요. 배지가 하나라도 없거나 만료되면 배정할 수 없어요.</p>') });
  }

  /* ================= 이벤트 · 모임 ================= */
  function events() {
    var l = T().events.filter(function (e) { return !myBranch() || e.branch === myBranch(); });
    return A({ title: '이벤트·모임', heading: '이벤트 · 모임', sub: '더가넷이 여는 공식 모임(공식 도란품)과 회원 혜택 이벤트를 관리해요.', html:
      card('', '<div class="fa top"><a class="btn btn-fill btn-sm" href="#admin-event-new">' + ico('plus', 16) + ' 이벤트 만들기</a></div>' + tbl(['일시', '이벤트', '장소', '>신청', '혜택', '상태'], l.map(function (e) { return '<tr class="lk" data-act="goto" data-to="admin-event-' + e.id + '"><td>' + esc(e.date) + '</td><td><b>' + esc(e.title) + '</b><small class="blk">' + esc(e.kind) + (e.official === false ? ' · 회원 주최' : '') + '</small></td><td>' + esc((G.hub(e.hub) || {}).name || '') + '</td><td class="r">' + e.joined.length + ' / ' + e.cap + '</td><td>' + esc(e.benefit || '-') + '</td><td>' + (e.pending ? '<span class="bd bd-warn">승인 대기</span>' : e.date.slice(0, 10) < SITE.today ? '<span class="bd bd-mute">종료</span>' : '<span class="bd bd-ok">모집 중</span>') + '</td></tr>'; }))) });
  }
  function eventForm(id) {
    var isNew = id === 'new', e = isNew ? { branch: myBranch() || 'B1', hub: 'H1', kind: '나눔데이', cap: 20, joined: [], official: true, date: '', title: '', benefit: '', desc: '' } : byId(T().events, id); if (!e) return off('events');
    var att = e.joined.map(function (u) { var got = (T().badges[u] || []).indexOf('모임 참여') >= 0; return '<li><div><b>' + esc(nm(u)) + '</b><small>' + u + '</small></div>' + (got ? '<span class="bd bd-ok">참석 확인</span>' : '<button class="btn btn-line btn-sm" data-act="evAttend" data-id="' + e.id + '" data-u="' + u + '">참석 확인 · 배지</button>') + '</li>'; }).join('');
    return A({ title: '이벤트', heading: isNew ? '이벤트 만들기' : e.title, sub: isNew ? '' : e.date, html: back('admin-events', '이벤트 목록') + '<div class="ag"><div>' + card('', '<form class="form" data-sub="evSave" data-id="' + id + '" novalidate><div class="fgrid">' +
      fg('ev-t', '제목 *', inp('ev-t', e.title), 'full') + fg('ev-k', '종류', sel('ev-k', ['나눔데이', '재능 원데이', '계절', '건강 걷기', '추첨 이벤트', '회원 주최'], e.kind)) + fg('ev-d', '일시 *', inp('ev-d', e.date.replace(' ', 'T'), '', 'datetime-local')) +
      fg('ev-h', '장소(거점)', sel('ev-h', T().hubs.map(function (h) { return [h.id, h.name]; }), e.hub)) + fg('ev-c', '정원', inp('ev-c', e.cap, '', 'number')) + fg('ev-b', '참여 혜택', inp('ev-b', e.benefit, '예: 이용권 5%, 첫 나눔 배지')) +
      fg('ev-x', '안내', '<textarea id="ev-x" rows="3">' + esc(e.desc) + '</textarea>', 'full') + '</div><p class="err" id="ev-e" hidden></p><div class="fa"><button class="btn btn-fill" type="submit">저장</button>' + (e.pending ? '<button class="btn btn-line" type="button" data-act="evApprove" data-id="' + e.id + '">회원 주최 승인</button>' : '') + '</div></form>') + '</div><div>' +
      (isNew ? '' : card('신청자 ' + e.joined.length + ' / ' + e.cap, att ? '<ul class="mng">' + att + '</ul>' : '<p class="small">아직 신청자가 없어요.</p>') + (e.kind === '추첨 이벤트' ? card('추첨', '<button class="btn btn-line btn-sm" data-act="evDraw" data-id="' + e.id + '">신청자 중 1명 추첨</button><p class="small">추첨 결과와 시각은 감사 로그에 남아요.</p>') : '')) + '</div></div>' });
  }
  G.SUB.evSave = function (fm) {
    var id = fm.dataset.id, t = val('ev-t'), d = val('ev-d'); if (!t || !d) { var er = $('ev-e'); er.textContent = '제목과 일시를 입력해 주세요.'; er.hidden = false; return; }
    var o = { title: t, kind: val('ev-k'), date: d.replace('T', ' '), hub: val('ev-h'), cap: +val('ev-c') || 20, benefit: val('ev-b'), desc: val('ev-x') }; o.branch = (G.hub(o.hub) || {}).branch || 'B1';
    if (id === 'new') { o.id = 'E' + (T().events.length + 1); o.joined = []; o.official = true; T().events.unshift(o); } else Object.assign(byId(T().events, id), o);
    G.log('이벤트 저장: ' + t); done('저장했어요.', 'admin-events');
  };
  G.ACT.evAttend = function (el) { var u = el.dataset.u, b = T().badges[u] = T().badges[u] || []; if (b.indexOf('모임 참여') < 0) b.push('모임 참여'); G.addPoint(u, '모임 참석', f('points') ? 500 : 0); G.notify(u, '[더가넷] 모임에 와 주셔서 고마워요. 모임 참여 배지를 드렸어요.'); G.log('이벤트 참석 확인: ' + nm(u)); done('참석을 확인했어요.'); };
  G.ACT.evApprove = function (el) { var e = byId(T().events, el.dataset.id); e.pending = false; G.notify(e.host, '[더가넷] 제안하신 모임 "' + e.title + '"이 승인됐어요.'); G.log('회원 주최 모임 승인: ' + e.title); done('승인했어요.'); };
  G.ACT.evDraw = function (el) { var e = byId(T().events, el.dataset.id); if (!e.joined.length) return G.toast('신청자가 없어요.'); var u = e.joined[Math.floor(Math.random() * e.joined.length)]; T().draws.unshift({ ev: e.id, u: u, at: G.now() }); G.log('추첨: ' + e.title + ' → ' + nm(u)); G.notify(u, '[더가넷] "' + e.title + '" 추첨에 당첨되셨어요!'); done(nm(u) + '님이 당첨됐어요.'); };

  /* ================= 동네 소식 ================= */
  function news() {
    var l = T().news.filter(function (n) { return !myBranch() || n.branch === myBranch(); });
    return A({ title: '동네 소식', heading: '동네 소식', sub: '공공 서비스·주민센터 프로그램·지역 행사처럼 확인된 소식만 올려요. 광고·정치·종교 글은 올리지 않아요.', html: '<div class="ag"><div>' +
      card('소식 목록', '<ul class="mng">' + l.map(function (n) { return '<li><div><b>' + esc(n.title) + '</b><small>' + esc(n.cat) + ' · ' + esc((G.branch(n.branch) || {}).name || '') + ' · ' + n.date + '</small></div><button class="btn btn-ghost btn-sm" data-act="newsDel" data-id="' + n.id + '">내리기</button></li>'; }).join('') + '</ul>') + '</div><div>' +
      card('소식 올리기', '<form class="form" data-sub="newsAdd" novalidate>' + fg('nw-b', '동네', sel('nw-b', branchList().map(function (b) { return [b.id, b.name]; }), myBranch())) + fg('nw-c', '분류', sel('nw-c', ['공공 서비스', '주민센터 프로그램', '지역 행사', '안전 알림'], '')) + fg('nw-t', '제목', inp('nw-t', '')) + fg('nw-x', '내용', '<textarea id="nw-x" rows="4"></textarea>') + '<p class="err" id="nw-e" hidden>제목과 내용을 적어 주세요.</p><button class="btn btn-fill btn-sm" type="submit">올리기</button></form>') + '</div></div>' });
  }
  G.SUB.newsAdd = function () { var t = val('nw-t'), x = val('nw-x'); if (!t || !x) { $('nw-e').hidden = false; return; } T().news.unshift({ id: 'NW' + (T().news.length + 10), branch: val('nw-b'), cat: val('nw-c'), title: t, date: SITE.today, body: x }); G.log('동네 소식 등록: ' + t); done('올렸어요.'); };
  G.ACT.newsDel = function (el) { T().news = T().news.filter(function (n) { return n.id !== el.dataset.id; }); G.log('동네 소식 내림: ' + el.dataset.id); done('내렸어요.'); };

  /* ================= 분쟁 ================= */
  var DSTEP = ['접수', '상대방 진술', '검토', '결정', '종결'];
  G.COMP = [['약속 시간 30분 이상 늦음', '해당 회차 10% 할인 또는 다음 이용 이용권'], ['약속한 범위의 일부를 하지 않음', '못한 부분 무료 재방문 또는 부분 환불'], ['작업 결과가 약속과 다름', '재작업 1회 무료, 재작업이 안 되면 해당 금액 환불'], ['물건 파손·분실', '수리비 또는 시가 보상 (배상 보험 처리)'], ['방문 인력의 불친절·불쾌한 언행', '사과와 인력 교체, 해당 회차 할인'], ['연락 없이 오지 않음', '전액 환불과 다음 이용 이용권']];
  function disputes() {
    var l = T().disputes;
    return A({ title: '분쟁 처리', heading: '분쟁 처리', sub: '24시간 안에 첫 연락, 7일 안에 결정을 원칙으로 해요. 상대방 진술을 꼭 받은 뒤 결정해요.', html:
      kpis([['진행 중', l.filter(function (d) { return d.status !== '종결'; }).length], ['기한 넘김', l.filter(function (d) { return d.status !== '종결' && G.addDays(d.at, 7) < SITE.today; }).length], ['종결', l.filter(function (d) { return d.status === '종결'; }).length], ['보상 기준', G.COMP.length + '개']]) +
      card('분쟁 목록', tbl(['접수', '대상', '유형', '단계', '결정 기한'], l.map(function (d) { var due = G.addDays(d.at, 7); return '<tr class="lk" data-act="goto" data-to="admin-dispute-' + d.id + '"><td>' + esc(d.at) + '<small class="blk">' + d.id + '</small></td><td>' + esc(d.app || d.deal || '') + ' · ' + esc(nm(d.user)) + '</td><td>' + esc(d.type) + '</td><td><span class="bd bd-' + (d.status === '종결' ? 'ok' : 'warn') + '">' + d.status + '</span></td><td>' + (d.status !== '종결' && due < SITE.today ? '<span class="bd bd-bad">' + due + '</span>' : due) + '</td></tr>'; }))) +
      card('보상 기준표 (가넷 안심 약속)', tbl(['상황', '보상'], G.COMP.map(function (c) { return '<tr><td>' + c[0] + '</td><td>' + c[1] + '</td></tr>'; }))) });
  }
  function disputeDetail(id) {
    var d = byId(T().disputes, id); if (!d) return off('dispute');
    var i = DSTEP.indexOf(d.status);
    return A({ title: '분쟁 ' + id, heading: '분쟁 ' + id, sub: d.type + ' · ' + nm(d.user), html: back('admin-disputes', '분쟁 목록') + '<div class="ag"><div>' +
      card('진행 단계', '<ol class="stp">' + DSTEP.map(function (s, k) { return '<li class="' + (k < i ? 'done' : k === i ? 'cur' : '') + '"><span class="stp-n">' + (k < i ? ico('check', 14) : k + 1) + '</span><span class="stp-t">' + s + '</span></li>'; }).join('') + '</ol>' +
        '<dl class="sum mt"><div class="kv"><dt>신청 내용</dt><dd>' + G.nl(d.text) + '</dd></div><div class="kv"><dt>첨부</dt><dd>' + esc(d.file || '-') + '</dd></div><div class="kv"><dt>첫 연락</dt><dd>' + esc(d.contactAt || '-') + '</dd></div><div class="kv"><dt>상대방 진술</dt><dd>' + (d.counter ? G.nl(d.counter) : '<span class="bd bd-warn">받기 전</span>') + '</dd></div><div class="kv"><dt>결정</dt><dd>' + (d.decision ? esc(d.decision) + (d.comp ? '<br><b>' + esc(d.comp) + '</b>' : '') : '-') + '</dd></div></dl>') + '</div><div>' +
      (d.status === '종결' ? card('', '<p class="small">종결된 분쟁이에요.</p>') : card('처리', '<form class="form" data-sub="dspStep" data-id="' + id + '" novalidate>' +
        (i <= 1 ? fg('ds-c', '상대방(업체·회원) 진술', '<textarea id="ds-c" rows="3" placeholder="상대방에게 받은 진술을 적어요.">' + esc(d.counter) + '</textarea>') : '') +
        (i >= 1 ? fg('ds-k', '보상 기준', sel('ds-k', [['', '해당 없음']].concat(G.COMP.map(function (c) { return [c[1], c[0]]; })), d.comp)) + fg('ds-m', '결정 내용 (고객에게 보여요)', '<textarea id="ds-m" rows="3">' + esc(d.decision) + '</textarea>') : '') +
        '<p class="err" id="ds-e" hidden></p><div class="fa"><button class="btn btn-fill btn-sm" type="submit">' + (i <= 1 ? '진술 저장 · 검토로' : '결정하고 종결') + '</button></div></form>')) + '</div></div>' });
  }
  G.SUB.dspStep = function (fm) {
    var d = byId(T().disputes, fm.dataset.id), i = DSTEP.indexOf(d.status), e = $('ds-e');
    if (i <= 1) { var c = val('ds-c'); if (c.length < 5) { e.textContent = '상대방 진술 없이 결정할 수 없어요. 진술을 적어 주세요.'; e.hidden = false; return; } d.counter = c; d.status = '검토'; if (!d.contactAt) d.contactAt = G.now(); }
    else { var m = val('ds-m'); if (m.length < 5) { e.textContent = '결정 내용을 적어 주세요.'; e.hidden = false; return; } d.decision = m; d.comp = val('ds-k'); d.status = '종결'; d.closedAt = G.now(); G.notify(d.user, '[더가넷] 접수하신 문제의 처리 결과가 나왔어요: ' + m); }
    G.log('분쟁 ' + d.id + ' → ' + d.status); done('저장했어요.');
  };

  /* ================= 이용권 · 할인 부담 ================= */
  function coupons() {
    var pays = T().payments;
    var rows = pays.map(function (p) { var a = G.app(p.app) || {}, s = G.sv(a.svc || 'S01'), partner = s.op !== 'DIRECT'; var disc = p.coupon || 0, gn = partner ? Math.round(disc / 2) : disc; return '<tr><td>' + esc(p.at) + '<small class="blk">' + esc(p.app) + '</small></td><td>' + esc(s.name) + '</td><td>' + esc(p.method) + (p.inst ? ' · ' + p.inst : '') + '</td><td class="r">' + G.fmt(p.gross) + '</td><td class="r">' + G.fmt(disc) + '</td><td class="r">' + G.fmt(p.point || 0) + '</td><td class="r">' + G.fmt(gn) + '</td><td class="r">' + G.fmt(disc - gn) + '</td><td class="r"><b>' + G.fmt(p.paid) + '</b></td></tr>'; });
    return A({ title: '이용권·할인 부담', heading: '이용권 · 할인 부담', sub: '등급별 이용권은 더가넷 직접 서비스에 5~20%, 협력업체 서비스는 10%까지예요. 협력업체 할인은 더가넷과 업체가 반씩 부담하고, 포인트는 더가넷이 부담해요.', html:
      card('등급별 이용권', tbl(['등급', '월 이용권', '할인 상한', '포인트 적립'], PLANS.map(function (p, i) { var c = G.couponRate('x'); var r = i >= 7 ? [20, 50000] : i >= 5 ? [15, 30000] : i >= 3 ? [10, 20000] : i >= 1 ? [5, 10000] : [0, 0]; return '<tr><td>' + p[0] + '</td><td>' + (r[0] ? r[0] + '%' : '-') + '</td><td>' + (r[1] ? G.fmt(r[1]) : '-') + '</td><td>' + ([0, 1, 2, 3, 4, 5, 6, 7, 8, 10][i]) + '%</td></tr>'; }))) +
      card('결제별 할인 부담 (정산 반영)', tbl(['결제', '서비스', '수단', '>금액', '>이용권 할인', '>포인트', '>더가넷 부담', '>업체 부담', '>결제액'], rows, '아직 결제가 없어요. 고객 화면에서 견적 승인 → 결제를 해 보세요.')) });
  }

  /* ================= 공동구매 ================= */
  var GBST = ['모집 중', '구매 확정', '입고', '수령 완료', '미달 취소'];
  function groupbuy() {
    return A({ title: '공동구매', heading: '가넷 공동구매', sub: '더가넷이 일괄 구매해 정회원(LIFE START 이상)에게만 예약 공급해요. 최소 수량에 못 미치면 전액 취소해요.', html:
      card('', tbl(['상품', '가격', '>예약 수량', '마감 · 공급', '수령 거점', '상태'], T().groupbuys.map(function (g) { var q = g.orders.reduce(function (s, o) { return s + o[1]; }, 0) + g.base; return '<tr><td><b>' + esc(g.title) + '</b></td><td>' + G.fmt(g.price) + '<small class="blk">정가 ' + G.fmt(g.list) + '</small></td><td class="r">' + q + ' / ' + g.min + '</td><td>' + g.until + '<small class="blk">공급 ' + g.supply + '</small></td><td>' + g.pickup.map(function (h) { return '<span class="tag">' + esc((G.hub(h) || {}).name || h) + '</span>'; }).join('') + '</td><td>' + sel('gb-' + g.id, GBST, g.status, ' data-on="change:gbSt" data-id="' + g.id + '" aria-label="상태"') + '</td></tr>'; })) + '<p class="small">공동구매 대금은 더가넷 상품 매출로 따로 기록하고, 품온 거래·후원금과 섞지 않아요.</p>') });
  }
  G.INP.gbSt = function (el) { var g = byId(T().groupbuys, el.dataset.id); g.status = el.value; g.orders.forEach(function (o) { G.notify(o[0], '[더가넷] 공동구매 "' + g.title + '" 상태: ' + g.status); }); G.log('공동구매 ' + g.id + ' → ' + g.status); done('상태를 바꿨어요.'); };

  /* ================= 기업 · 기관 ================= */
  function corps() {
    return A({ title: '기업·기관', heading: '기업 · 기관 계정', sub: '기업은 임직원 복지 코드로, 기관은 협약으로 연결해요. 필수 정보를 갖춰야 승인해요.', html:
      card('', '<div class="fa top"><a class="btn btn-fill btn-sm" href="#admin-corp-new">' + ico('plus', 16) + ' 계정 등록</a></div>' + tbl(['구분', '이름', '사업자·고유번호', '담당', '복지 코드', '>사용 / 좌석', '기간'], T().corps.map(function (c) { return '<tr class="lk" data-act="goto" data-to="admin-corp-' + c.id + '"><td><span class="tag">' + c.kind + '</span></td><td><b>' + esc(c.name) + '</b>' + (c.pending ? ' <span class="bd bd-warn">신청</span>' : '') + '</td><td>' + esc(c.bizNo) + '</td><td>' + esc(c.manager) + '<small class="blk">' + esc(c.phone) + '</small></td><td><code>' + esc(c.code || '-') + '</code></td><td class="r">' + c.used + ' / ' + (c.seats || '-') + '</td><td>' + esc(c.period) + '</td></tr>'; }))) });
  }
  var CF = [['name', '이름 *'], ['bizNo', '사업자등록번호 / 고유번호 *'], ['ceo', '대표자 *'], ['bizType', '업종·기관 유형 *'], ['addr', '주소 *'], ['manager', '담당자 *'], ['phone', '연락처 *'], ['email', '이메일 *'], ['seats', '복지 좌석 수'], ['period', '계약·협약 기간'], ['code', '복지 코드']];
  function corpForm(id) {
    var isNew = id === 'new', c = isNew ? { kind: '기업', used: 0 } : byId(T().corps, id); if (!c) return off('corp');
    return A({ title: '기업·기관', heading: isNew ? '기업·기관 등록' : c.name, html: back('admin-corps', '목록') + card('', '<form class="form" data-sub="corpSave" data-id="' + id + '" novalidate><div class="fgrid">' + fg('cf-kind', '구분', sel('cf-kind', ['기업', '기관', '단체'], c.kind)) + CF.map(function (x) { return fg('cf-' + x[0], x[1], inp('cf-' + x[0], c[x[0]])); }).join('') + '</div><p class="err" id="cf-e" hidden></p><div class="fa"><button class="btn btn-fill" type="submit">' + (c.pending ? '승인하고 저장' : '저장') + '</button></div></form>') });
  }
  G.SUB.corpSave = function (fm) {
    var id = fm.dataset.id, o = { kind: val('cf-kind') }, miss = [];
    CF.forEach(function (x) { o[x[0]] = val('cf-' + x[0]); if (x[1].indexOf('*') > 0 && !o[x[0]]) miss.push(x[1].replace(' *', '')); });
    if (miss.length) { var e = $('cf-e'); e.textContent = '필수 정보: ' + miss.join(', '); e.hidden = false; return; }
    o.seats = +o.seats || 0; if (!o.code) o.code = 'GN' + (o.kind === '기업' ? 'CORP' : 'ORG') + '-' + Math.floor(1000 + Math.random() * 8999); o.pending = false;
    if (id === 'new') { o.id = 'C' + (T().corps.length + 1); o.used = 0; T().corps.push(o); } else Object.assign(byId(T().corps, id), o);
    G.log('기업·기관 계정 저장: ' + o.name); done('저장했어요.', 'admin-corps');
  };

  /* ================= 나눔 ================= */
  G.projRaised = function (pid) { var l = T().ledger.filter(function (x) { return x.proj === pid && x.type === '모금'; }); return l.reduce(function (s, x) { return s + x.amt; }, 0); };
  G.projSpent = function (pid, type) { return T().ledger.filter(function (x) { return x.proj === pid && x.type === (type || '집행'); }).reduce(function (s, x) { return s + x.amt; }, 0); };
  var org = function (id) { return byId(T().orgs, id) || {}; };
  var gtabs = function (cur) { return '<div class="tabs">' + [['giving', '나눔 사업'], ['give-orgs', '기관'], ['give-ledger', '장부'], ['give-cfg', '더가넷 직접 후원']].map(function (t) { return '<a href="#admin-' + t[0] + '" class="' + (cur === t[0] ? 'on' : '') + '">' + t[1] + '</a>'; }).join('') + '</div>'; };
  function giving() {
    var t = T(), sum = function (who) { return t.ledger.filter(function (x) { return x.type === '모금' && (!who || x.who === who); }).reduce(function (s, x) { return s + x.amt; }, 0); };
    return A({ title: '나눔 사업', heading: '나눔 사업 · 장부', sub: '수혜자는 검증한 기관이 정해요. 더가넷은 후원금을 보관하지 않고 기관 공식 계좌로 바로 가게 해요(시연). 영수증은 기관이 발급해요.', html: gtabs('giving') +
      kpis([['회원 후원', G.fmt(sum('회원'))], ['더가넷 매칭', G.fmt(sum('매칭'))], ['더가넷 매출 나눔', G.fmt(sum('더가넷'))], ['집행 확인', G.fmt(t.ledger.filter(function (x) { return x.type === '집행'; }).reduce(function (s, x) { return s + x.amt; }, 0))]]) +
      card('사업 목록', '<div class="fa top"><a class="btn btn-fill btn-sm" href="#admin-proj-new">' + ico('plus', 16) + ' 사업 등록</a></div>' + tbl(['사업', '기관', '대상', '>모금 / 목표', '마감', '상태'], t.projects.map(function (p) { return '<tr class="lk" data-act="goto" data-to="admin-proj-' + p.id + '"><td><b>' + esc(p.title) + '</b></td><td>' + esc(org(p.org).name) + '</td><td>' + esc(p.target) + '</td><td class="r">' + G.fmt(G.projRaised(p.id)) + '<small class="blk">' + G.fmt(p.goal) + '</small></td><td>' + p.until + '</td><td><span class="bd bd-' + (p.status === '모금 중' ? 'info' : p.status === '집행 완료' ? 'ok' : 'mute') + '">' + p.status + '</span>' + (t.reports[p.id] && !t.reports[p.id].approved ? ' <span class="bd bd-warn">보고 승인 대기</span>' : '') + '</td></tr>'; }))) });
  }
  function givingTab(x) {
    var t = T();
    if (x === 'orgs') return A({ title: '나눔 기관', heading: '검증 기관', sub: '기부금단체 지정 여부·영수증 발급 가능·협약을 확인한 기관만 사업을 열 수 있어요.', html: gtabs('give-orgs') + card('', tbl(['기관', '유형', '영수증 발급', '검증일', '협약'], t.orgs.map(function (o) { return '<tr><td><b>' + esc(o.name) + '</b></td><td>' + esc(o.type) + '</td><td>' + (o.receipt ? '<span class="bd bd-ok">가능</span>' : '<span class="bd bd-warn">불가</span>') + '</td><td>' + o.verified + '</td><td>' + o.mou + '</td></tr>'; })) +
      '<form class="form" data-sub="orgAdd" novalidate><h3>기관 추가</h3><div class="fgrid">' + fg('og-n', '기관명', inp('og-n', '')) + fg('og-t', '유형', sel('og-t', ['지역아동센터', '노인복지관', '한부모가족 지원', '장애인복지관', '사회복지협의회', '기타'], '')) + '</div><label class="chk"><input type="checkbox" id="og-r"> 기부금단체 지정·영수증 발급 가능 확인</label><label class="chk"><input type="checkbox" id="og-m"> 협약서 확인</label><p class="err" id="og-e" hidden>기관명과 두 가지 확인이 필요해요.</p><button class="btn btn-fill btn-sm" type="submit">추가</button></form>') });
    if (x === 'ledger') return A({ title: '나눔 장부', heading: '나눔 장부', sub: '모금 → 기관 전달 → 집행을 한 줄씩 남겨요. 고칠 때는 이유를 적고, 바뀐 내용은 모두 기록돼요.', html: gtabs('give-ledger') +
      card('장부', tbl(['일자', '사업', '구분', '출처', '>금액', '메모', ''], t.ledger.map(function (l) { return '<tr><td>' + l.at + '</td><td>' + esc((byId(t.projects, l.proj) || {}).title || '') + '</td><td><span class="tag">' + l.type + '</span></td><td>' + l.who + '</td><td class="r">' + G.fmt(l.amt) + '</td><td>' + esc(l.note) + '</td><td><button class="btn btn-ghost btn-sm" data-act="ldEdit" data-id="' + l.id + '">고치기</button></td></tr>'; })) +
        '<form class="form" id="ld-f" data-sub="ldSave" hidden novalidate><h3>장부 고치기</h3><input type="hidden" id="ld-id"><div class="fgrid">' + fg('ld-a', '금액', inp('ld-a', '', '', 'number')) + fg('ld-n', '메모', inp('ld-n', '')) + fg('ld-r', '고치는 이유 (필수)', inp('ld-r', '', '예: 기관 확인서 금액과 맞춤'), 'full') + '</div><p class="err" id="ld-e" hidden>고치는 이유를 적어 주세요.</p><button class="btn btn-fill btn-sm" type="submit">저장</button></form>') +
      card('장부 변경 이력', tbl(['일시', '관리자', '항목', '이전 → 이후', '이유'], t.ledgerHist.map(function (h) { return '<tr><td>' + h.at + '</td><td>' + esc(h.who) + '</td><td>' + h.id + '</td><td>' + esc(h.before) + ' → ' + esc(h.after) + '</td><td>' + esc(h.why) + '</td></tr>'; }), '변경 이력이 없어요.')) });
    if (x === 'cfg') { var c = t.giveCfg; return A({ title: '더가넷 직접 후원', heading: '더가넷 직접 후원', sub: '더가넷이 매출 일부를 나누고, 회원 후원에 매칭해요. 더가넷 돈과 회원 후원금은 장부에서 따로 보여요.', html: gtabs('give-cfg') + card('', '<form class="form" data-sub="gcSave" novalidate><div class="fgrid">' + fg('gc-r', '매출 나눔 비율 (%)', inp('gc-r', c.revenueRate, '', 'number')) + fg('gc-m', '매칭 비율 (회원 1원당)', inp('gc-m', c.matchRatio, '', 'number')) + fg('gc-c', '사업별 매칭 한도 (원)', inp('gc-c', c.matchCap, '', 'number')) + '</div><button class="btn btn-fill btn-sm" type="submit">저장</button></form>') }); }
    return off('giving');
  }
  G.SUB.orgAdd = function () { var n = val('og-n'); if (!n || !$('og-r').checked || !$('og-m').checked) { $('og-e').hidden = false; return; } T().orgs.push({ id: 'O' + (T().orgs.length + 1), name: n, type: val('og-t'), receipt: true, verified: SITE.today, mou: SITE.today }); G.log('나눔 기관 추가: ' + n); done('기관을 추가했어요.'); };
  G.ACT.ldEdit = function (el) { var l = byId(T().ledger, el.dataset.id), fm = $('ld-f'); fm.hidden = false; $('ld-id').value = l.id; $('ld-a').value = l.amt; $('ld-n').value = l.note; fm.scrollIntoView({ block: 'center' }); };
  G.SUB.ldSave = function () { var r = val('ld-r'); if (r.length < 4) { $('ld-e').hidden = false; return; } var l = byId(T().ledger, val('ld-id')), before = G.fmt(l.amt) + ' / ' + l.note; l.amt = +val('ld-a') || 0; l.note = val('ld-n'); T().ledgerHist.unshift({ at: G.now(), who: me().loginId, id: l.id, before: before, after: G.fmt(l.amt) + ' / ' + l.note, why: r }); G.log('나눔 장부 수정 ' + l.id + ': ' + r); done('고쳤어요. 변경 이력에 남았어요.'); };
  G.SUB.gcSave = function () { var c = T().giveCfg; c.revenueRate = +val('gc-r'); c.matchRatio = +val('gc-m'); c.matchCap = +val('gc-c'); G.log('더가넷 직접 후원 설정 변경'); done('저장했어요.'); };
  function projDetail(id) {
    var t = T(), isNew = id === 'new', p = isNew ? { org: t.orgs[0].id, target: '혼자 사시는 어르신', title: '', goal: 1000000, story: '', plan: [], until: '', status: '모금 중', service: '' } : byId(t.projects, id); if (!p) return off('giving');
    var rep = t.reports[id];
    var form = '<form class="form" data-sub="projSave" data-id="' + id + '" novalidate><div class="fgrid">' + fg('pj-t', '사업명 *', inp('pj-t', p.title), 'full') + fg('pj-o', '기관 (수혜자 선정 주체)', sel('pj-o', t.orgs.map(function (o) { return [o.id, o.name]; }), p.org)) + fg('pj-g', '대상', sel('pj-g', ['보호가 필요한 아동', '혼자 사시는 어르신', '한부모·미혼모 가정', '소년소녀 가장', '경제적 어려움이 큰 이웃', '장애가 있는 이웃'], p.target)) + fg('pj-a', '목표 금액', inp('pj-a', p.goal, '', 'number')) + fg('pj-u', '마감일', inp('pj-u', p.until, '', 'date')) + fg('pj-s', '상태', sel('pj-s', ['모금 중', '모금 종료', '전달 완료', '집행 완료'], p.status)) + fg('pj-v', '더가넷 손길 나눔 (서비스)', inp('pj-v', p.service, '예: 정리수납 손길 나눔 5가구')) + fg('pj-x', '이야기 (개인을 알아볼 수 있는 내용 금지)', '<textarea id="pj-x" rows="3">' + esc(p.story) + '</textarea>', 'full') + fg('pj-p', '사용 계획 (한 줄에 "항목 | 금액")', '<textarea id="pj-p" rows="3">' + esc(p.plan.map(function (x) { return x[0] + ' | ' + x[1]; }).join('\n')) + '</textarea>', 'full') + '</div><p class="err" id="pj-e" hidden></p><button class="btn btn-fill btn-sm" type="submit">저장</button></form>';
    return A({ title: '나눔 사업', heading: isNew ? '사업 등록' : p.title, sub: isNew ? '' : org(p.org).name, html: back('admin-giving', '나눔 사업') + '<div class="ag"><div>' + card('', form) + '</div><div>' +
      (isNew ? '' : card('흐름', kpis([['모금', G.fmt(G.projRaised(id))], ['전달', G.fmt(G.projSpent(id, '전달'))], ['집행', G.fmt(G.projSpent(id))]], 'k3') + '<form class="form" data-sub="ldAdd" data-id="' + id + '" novalidate><h3>장부에 한 줄 더하기</h3><div class="fgrid">' + fg('la-t', '구분', sel('la-t', ['모금', '전달', '집행'], '전달')) + fg('la-w', '출처', sel('la-w', ['회원', '매칭', '더가넷', '기관'], '기관')) + fg('la-a', '금액', inp('la-a', '', '', 'number')) + fg('la-n', '메모 (증빙)', inp('la-n', '', '예: 기관 접수 확인서')) + '</div><button class="btn btn-line btn-sm" type="submit">더하기</button></form>') +
        card('결과 보고', rep ? '<p>' + G.nl(rep.text) + '</p><p class="small">' + (rep.approved ? '승인 ' + rep.approved : '<button class="btn btn-fill btn-sm" data-act="repOk" data-id="' + id + '">보고 승인 · 공개</button>') + '</p>' : '<form class="form" data-sub="repAdd" data-id="' + id + '"><textarea id="rp-t" rows="3" placeholder="기관이 보낸 결과 보고를 옮겨 적어요. 사진은 물품·활동만, 얼굴·이름은 넣지 않아요."></textarea><button class="btn btn-line btn-sm" type="submit">보고 등록</button></form>')) + '</div></div>' });
  }
  G.SUB.projSave = function (fm) {
    var id = fm.dataset.id, t = val('pj-t'), x = val('pj-x'); if (!t) { var e = $('pj-e'); e.textContent = '사업명을 적어 주세요.'; e.hidden = false; return; }
    if (/(\d{6}-\d|010-?\d{4}|[가-힣]{2,3}\s?(군|양|씨)\b)/.test(x)) { var e2 = $('pj-e'); e2.textContent = '이야기에 개인을 알아볼 수 있는 정보(이름·연락처 등)가 있어요. 빼고 적어 주세요.'; e2.hidden = false; return; }
    var o = { title: t, org: val('pj-o'), target: val('pj-g'), goal: +val('pj-a') || 0, until: val('pj-u'), status: val('pj-s'), service: val('pj-v'), story: x, plan: val('pj-p').split('\n').map(function (l) { var p = l.split('|'); return [String(p[0] || '').trim(), +String(p[1] || '').replace(/[^\d]/g, '') || 0]; }).filter(function (p) { return p[0]; }) };
    if (id === 'new') { o.id = 'PJ' + (T().projects.length + 1); T().projects.unshift(o); } else Object.assign(byId(T().projects, id), o);
    G.log('나눔 사업 저장: ' + t); done('저장했어요.', 'admin-giving');
  };
  G.SUB.ldAdd = function (fm) { var a = +val('la-a'); if (!a) return G.toast('금액을 적어 주세요.'); T().ledger.push({ id: 'L' + (T().ledger.length + 1) + Date.now() % 100, proj: fm.dataset.id, at: SITE.today, type: val('la-t'), who: val('la-w'), amt: a, note: val('la-n') }); G.log('나눔 장부 추가: ' + fm.dataset.id); done('장부에 더했어요.'); };
  G.SUB.repAdd = function (fm) { var x = val('rp-t'); if (x.length < 5) return; T().reports[fm.dataset.id] = { text: x, approved: '' }; G.log('나눔 결과 보고 등록: ' + fm.dataset.id); done('보고를 등록했어요.'); };
  G.ACT.repOk = function (el) { var id = el.dataset.id; T().reports[id].approved = SITE.today; T().gifts.filter(function (g) { return g.proj === id; }).forEach(function (g) { G.notify(g.user, '[더가넷] 후원하신 "' + byId(T().projects, id).title + '" 결과 보고가 올라왔어요.'); }); G.log('나눔 결과 보고 승인: ' + id); done('보고를 공개했어요. 후원자에게 알렸어요.'); };

  function nominate() {
    var ST = ['접수', '기관 확인', '심사', '선정', '보류'];
    return A({ title: '추천·심사', heading: '나눔 추천 · 본인 신청 심사', sub: '추천·신청 내용은 기관이 먼저 사실을 확인하고, 심사위원회(외부 위원 포함 3인 이상)가 결정해요. 결과는 신청한 분에게만 알려요.', html:
      card('', tbl(['접수', '구분', '대상', '연결 기관', '내용', '단계'], T().nominations.map(function (n) { return '<tr><td>' + n.at + '<small class="blk">' + n.id + '</small></td><td>' + n.kind + '</td><td>' + esc(n.target) + '</td><td>' + esc(org(n.org).name || '-') + '</td><td>' + esc(n.text) + '</td><td>' + sel('nm-' + n.id, ST, n.st, ' data-on="change:nomSt" data-id="' + n.id + '" aria-label="단계"') + '</td></tr>'; }), '아직 추천·신청이 없어요. 고객 화면 [나눔 → 추천·신청]에서 해 보세요.')) });
  }
  G.INP.nomSt = function (el) { var n = byId(T().nominations, el.dataset.id); n.st = el.value; G.notify(n.by, '[더가넷] 나눔 추천·신청(' + n.id + ') 진행 단계: ' + n.st); G.log('나눔 추천 ' + n.id + ' → ' + n.st); done('단계를 바꿨어요.'); };

  /* ================= 대리 가입 · 전화 접수 ================= */
  function proxy() {
    var log = T().proxyLog.map(function (p) { return '<tr><td>' + p.at + '</td><td>' + p.kind + '</td><td>' + esc(p.name) + '</td><td>' + esc(p.what) + '</td><td>' + esc(p.by) + '</td></tr>'; });
    var signup = f('branchManager') ? card('대리 가입 (가맹점 방문·전화)', '<form class="form" data-sub="pxJoin" novalidate><div class="fgrid">' + fg('px-n', '이름 *', inp('px-n', '')) + fg('px-p', '연락처 *', inp('px-p', '', '010-0000-0000')) + fg('px-b', '동네', sel('px-b', branchList().map(function (b) { return [b.id, b.name]; }), myBranch())) + fg('px-t', '유형', sel('px-t', ['개인', '기업', '기관'], '개인')) + '</div><label class="chk"><input type="checkbox" id="px-c"> 본인에게 약관·개인정보 수집 내용을 읽어 드리고 <b>동의를 녹취</b>했어요</label><label class="chk"><input type="checkbox" id="px-k"> 신분증으로 본인임을 확인했어요 (번호는 적지 않아요)</label><p class="err" id="px-e" hidden></p><button class="btn btn-fill btn-sm" type="submit">대리 가입</button></form><p class="small">가입 후 본인 휴대폰으로 확인 문자가 가요. 본인이 확인해야 계정이 열려요.</p>') : '';
    var phone = f('phoneApply') ? card('전화 접수 (상담원 대리 신청)', '<form class="form" data-sub="pxApply" novalidate><div class="fgrid">' + fg('pa-u', '회원', sel('pa-u', MEMBERS.map(function (m) { return [m.id, m.name + ' (' + m.id + ')']; }), 'u1')) + fg('pa-s', '서비스', sel('pa-s', SV.map(function (s) { return [s.id, s.name]; }), 'S03')) + fg('pa-r', '지역', inp('pa-r', '', '예: 서울 마포구')) + fg('pa-d', '희망 일자', inp('pa-d', '', '', 'date')) + fg('pa-x', '통화 내용 요약 *', '<textarea id="pa-x" rows="3"></textarea>', 'full') + '</div><label class="chk"><input type="checkbox" id="pa-c"> 통화 중 신청 내용을 다시 읽어 드리고 확인받았어요</label><p class="err" id="pa-e" hidden></p><button class="btn btn-fill btn-sm" type="submit">신청 등록</button></form>') : '';
    return A({ title: '대리 접수', heading: '대리 가입 · 전화 접수', sub: '스마트폰이 어려운 분도 같은 기준으로 이용하도록, 동의 녹취와 본인 확인을 남기고 대신 접수해요.', html: '<div class="ag"><div>' + phone + signup + '</div><div>' + card('대리 처리 기록', tbl(['일시', '구분', '대상', '내용', '처리자'], log, '기록이 없어요.')) + '</div></div>' });
  }
  G.SUB.pxJoin = function () {
    var n = val('px-n'), p = val('px-p'), e = $('px-e');
    if (!n || !/^01\d-?\d{3,4}-?\d{4}$/.test(p) || !$('px-c').checked || !$('px-k').checked) { e.textContent = '이름·연락처와 두 가지 확인이 필요해요.'; e.hidden = false; return; }
    var id = 'u' + (20 + T().proxyLog.length); MEMBERS.push({ id: id, name: n, email: '(대리 가입)', phone: p.replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, '$1-****-$3'), joined: SITE.today, status: '활성', role: '회원' });
    T().mem[id] = { type: val('px-t'), branch: val('px-b'), verified: false, plan: 0, proxy: true }; if (S.ops && S.ops.mem) S.ops.mem[id] = { status: 'ACTIVE', locked: false, mkt: false };
    T().proxyLog.unshift({ at: G.now(), kind: '대리 가입', name: n, what: val('px-t') + ' · ' + (G.branch(val('px-b')) || {}).name, by: me().loginId }); G.log('대리 가입: ' + n + ' (동의 녹취·본인 확인)'); done('대리 가입을 마쳤어요. 본인 확인 문자를 보냈어요(시연).');
  };
  G.SUB.pxApply = function () {
    var x = val('pa-x'), e = $('pa-e'); if (x.length < 5 || !$('pa-c').checked) { e.textContent = '통화 요약과 확인 체크가 필요해요.'; e.hidden = false; return; }
    var u = val('pa-u'), m = byId(MEMBERS, u), no = G.nextNo();
    S.apps.unshift({ no: no, user: u, svc: val('pa-s'), status: 'SUBMITTED', at: G.now(), region: val('pa-r'), date: val('pa-d'), time: '', phone: m.phone, budget: '', headcount: 1, data: { '접수 경로': '전화 (상담원 대리 접수)' }, note: x, quote: null, schedule: null, partner: null, channel: '전화', hist: [['SUBMITTED', G.now(), '상담원 ' + me().loginId, '전화로 대리 접수했어요.']] });
    T().proxyLog.unshift({ at: G.now(), kind: '전화 접수', name: m.name, what: no + ' · ' + G.sv(val('pa-s')).name, by: me().loginId }); G.notify(u, '[더가넷] 전화로 말씀하신 ' + G.sv(val('pa-s')).name + ' 신청을 접수했어요. 신청번호 ' + no);
    G.log('전화 대리 접수: ' + no); done('신청을 등록했어요.', 'admin-app-' + no);
  };

  /* ================= 안심 관리 ================= */
  function safetyItems() {
    var t = T(), out = [];
    MEMBERS.forEach(function (m) { var fam = t.family[m.id]; if (fam && fam.alone && !(fam.receivers || []).length) out.push(['알림 받을 사람 없음', m.name + ' · 가맹점 안심콜 대상', m.id, 'call']); });
    Object.keys(t.checkins).forEach(function (did) { var c = t.checkins[did]; if (c.in && !c.out) out.push(['만남 종료 미확인', '약속 ' + did + ' · 체크인 ' + c.in, did, 'meet']); });
    t.notify.filter(function (n) { return n.urgent && !n.read; }).forEach(function (n) { out.push(['중요 알림 미확인', nm(n.to) + ' · ' + n.text.slice(0, 30), n.to, 'notify']); });
    return out;
  }
  function safety() {
    var items = safetyItems();
    return A({ title: '안심 관리', heading: '안심 관리', sub: '알림 받을 가족이 없는 분, 끝났다는 확인이 없는 만남, 확인하지 않은 중요 알림을 모아 가맹점이 전화로 챙겨요.', html:
      kpis([['확인할 일', items.length], ['안심콜 기록', T().safeCalls.length], ['가족 연결 회원', Object.keys(T().family).filter(function (k) { return (T().family[k].receivers || []).length; }).length], ['혼자 이용 회원', Object.keys(T().family).filter(function (k) { return T().family[k].alone; }).length]]) +
      card('확인할 일', items.length ? '<ul class="mng">' + items.map(function (i) { return '<li><div><b>' + i[0] + '</b><small>' + esc(i[1]) + '</small></div><button class="btn btn-line btn-sm" data-act="safeCall" data-id="' + esc(i[2]) + '" data-k="' + i[3] + '">안심콜 완료</button></li>'; }).join('') + '</ul>' : '<p class="small">지금 확인할 일이 없어요.</p>') +
      card('안심콜 기록', tbl(['일시', '대상', '내용', '처리자'], T().safeCalls.map(function (c) { return '<tr><td>' + c.at + '</td><td>' + esc(c.who) + '</td><td>' + esc(c.what) + '</td><td>' + esc(c.by) + '</td></tr>'; }), '기록이 없어요.')) });
  }
  G.ACT.safeCall = function (el) {
    var id = el.dataset.id, k = el.dataset.k, t = T();
    if (k === 'meet') t.checkins[id].out = G.now() + ' (안심콜 확인)';
    if (k === 'notify') t.notify.forEach(function (n) { if (n.to === id && n.urgent) n.read = true; });
    if (k === 'call') { t.family[id].lastCall = SITE.today; }
    t.safeCalls.unshift({ at: G.now(), who: k === 'meet' ? '약속 ' + id : nm(id), what: k === 'meet' ? '만남 종료 확인' : k === 'notify' ? '중요 알림 전화 안내' : '정기 안부 전화', by: me().loginId });
    G.log('안심콜: ' + id); done('안심콜을 기록했어요.');
  };

  /* ================= 품온 지표 ================= */
  function metrics() {
    var k = S.club, t = T(), posts = k.posts, deals = k.deals, users = MEMBERS.length;
    var done_ = deals.filter(function (d) { return d.status === 'DONE'; }).length, closed = deals.filter(function (d) { return ['DONE', 'DECLINED', 'CANCELLED', 'BLOCKED'].indexOf(d.status) >= 0; }).length;
    var active = {}; deals.forEach(function (d) { active[d.req] = 1; active[d.prov] = 1; });
    var repeat = Object.keys(active).filter(function (u) { return deals.filter(function (d) { return d.req === u || d.prov === u; }).length >= 2; }).length;
    var reg = MEMBERS.filter(function (m) { return G.isRegular(m.id); }).length;
    var rt = t.ratings, good = rt.filter(function (r) { return r.level >= 2; }).length;
    var svcN = function (s) { return posts.filter(function (p) { return G.pumonSvc && G.pumonSvc(p) === s; }).length; };
    var byB = t.branches.map(function (b) { var mem = memOf(b.id); return '<tr class="lk" data-act="goto" data-to="admin-branch-' + b.id + '"><td>' + esc(b.name) + '</td><td class="r">' + mem.length + '</td><td class="r">' + posts.filter(function (p) { return mem.indexOf(p.owner) >= 0; }).length + '</td><td class="r">' + deals.filter(function (d) { return mem.indexOf(d.req) >= 0 || mem.indexOf(d.prov) >= 0; }).length + '</td><td class="r">' + t.events.filter(function (e) { return e.branch === b.id; }).reduce(function (s, e) { return s + e.joined.length; }, 0) + '</td><td class="r">' + (t.preorders.filter(function (r) { return r.branch === b.id; }).length + (t.preorderBase[b.id] || 0)) + '</td></tr>'; });
    var bars = [['재능품', svcN('TALENT')], ['서로품', svcN('HELP')], ['나눔품', svcN('GIVE')], ['바꿈품', svcN('SWAP')]], mx = Math.max.apply(null, bars.map(function (b) { return b[1]; }).concat([1]));
    return A({ title: '품온 지표', heading: '품온 지표', sub: SITE.today + ' 기준 · 시연 데이터', html:
      kpis([['정회원 전환', Math.round(reg / users * 100) + '%'], ['약속 완료율', closed ? Math.round(done_ / closed * 100) + '%' : '-'], ['2회 이상 참여', repeat + '명'], ['만족도', rt.length ? Math.round(good / rt.length * 100) + '%' : '-'], ['분쟁률', deals.length ? (t.disputes.length / (deals.length + S.apps.length) * 100).toFixed(1) + '%' : '-']], 'k5') +
      '<div class="ag mt"><div>' + card('동네별 현황', tbl(['가맹점', '>회원', '>글', '>약속', '>모임 참여', '>사전 신청'], byB)) + '</div><div>' +
      card('서비스별 글 수', '<ul class="mt-bars">' + bars.map(function (b) { return '<li><span>' + b[0] + '</span><i><em style="width:' + Math.round(b[1] / mx * 100) + '%"></em></i><b>' + b[1] + '</b></li>'; }).join('') + '</ul>') +
      card('체험 · 포인트', '<dl class="sum"><div class="kv"><dt>무료 체험 사용</dt><dd>' + Object.keys(t.trial).reduce(function (s, u) { return s + t.trial[u].length; }, 0) + '회</dd></div><div class="kv"><dt>적립 포인트 합계</dt><dd>' + Object.keys(t.points).reduce(function (s, u) { return s + G.pointBal(u); }, 0).toLocaleString('ko-KR') + 'P</dd></div><div class="kv"><dt>동네 확인 회원</dt><dd>' + Object.keys(t.localOk).length + '명</dd></div></dl>') + '</div></div>' });
  }

  /* ================= 통합 검색 ================= */
  function search(q) {
    var l = q.toLowerCase(), hit = function (s) { return String(s || '').toLowerCase().indexOf(l) >= 0; }, rows = [];
    MEMBERS.forEach(function (m) { if (hit(m.name) || hit(m.email) || hit(m.id) || hit(m.phone)) rows.push(['회원', m.name + ' · ' + m.id, 'admin-member-' + m.id]); });
    S.apps.forEach(function (a) { if (hit(a.no) || hit(G.sv(a.svc).name) || hit(nm(a.user)) || hit(a.region)) rows.push(['신청', a.no + ' · ' + G.sv(a.svc).name + ' · ' + nm(a.user), 'admin-app-' + a.no]); });
    PARTNERS.forEach(function (p) { if (hit(p.name) || hit(p.area) || hit(p.id)) rows.push(['협력업체', p.name, f('partnerInfo') ? 'admin-pinfo-' + p.id : 'admin-partner-' + p.id]); });
    S.club.posts.forEach(function (p) { if (hit(p.title) || hit(p.body) || hit(p.id)) rows.push(['품온 글', p.id + ' · ' + p.title, 'admin-club']); });
    T().branches.forEach(function (b) { if (hit(b.name) || hit(b.addr) || hit(b.bizNo)) rows.push(['가맹점', b.name, 'admin-branch-' + b.id]); });
    T().projects.forEach(function (p) { if (hit(p.title) || hit(p.target)) rows.push(['나눔 사업', p.title, 'admin-proj-' + p.id]); });
    T().corps.forEach(function (c) { if (hit(c.name) || hit(c.bizNo)) rows.push(['기업·기관', c.name, 'admin-corp-' + c.id]); });
    S.inquiries.forEach(function (x) { if (hit(x.text) || hit(x.id)) rows.push(['문의', x.id + ' · ' + x.text.slice(0, 30), 'admin-inq']); });
    if (myBranch()) rows = rows.filter(function (r) { return ['회원', '신청', '가맹점'].indexOf(r[0]) >= 0; });
    G.log('통합 검색: ' + q, 'VIEW');
    return A({ title: '통합 검색', heading: '"' + q + '" 검색 결과', sub: rows.length + '건 · 검색 기록은 감사 로그에 남아요.', html: card('', tbl(['구분', '내용'], rows.map(function (r) { return '<tr class="lk" data-act="goto" data-to="' + r[2] + '"><td><span class="tag">' + r[0] + '</span></td><td><a href="#' + r[2] + '">' + esc(r[1]) + '</a></td></tr>'; }), '찾는 내용이 없어요.')) });
  }

  /* ================= 협력업체 상세 이력 ================= */
  var PIF = [['bizNo', '사업자등록번호 *'], ['bizType', '업태 *'], ['bizItem', '종목 *'], ['addr', '사업장 주소 *'], ['manager', '담당자 *'], ['email', '이메일 *'], ['bank', '정산 계좌 (끝 4자리만)']];
  function pinfo(id) { T().pinfo = T().pinfo || {}; return T().pinfo[id] || (T().pinfo[id] = { bizNo: '000-00-1000' + id.slice(1), bizType: '서비스업', bizItem: '', addr: '', manager: '', email: '', bank: '****' }); }
  function partnerInfo(id) {
    var p = byId(PARTNERS, id); if (!p) return off('partnerInfo');
    var x = pinfo(id), apps = S.apps.filter(function (a) { return a.partner === id || (a.assigns || []).some(function (s) { return s.partner === id; }); });
    var sett = (G.partnerSettle ? G.partnerSettle() : []).filter(function (r) { return r.app.partner === id; });
    var rt = T().ratings.filter(function (r) { return r.partner === id; }), good = rt.filter(function (r) { return r.level >= 2; }).length;
    var miss = PIF.filter(function (f2) { return f2[1].indexOf('*') > 0 && !x[f2[0]]; }).map(function (f2) { return f2[1].replace(' *', ''); });
    return A({ title: p.name, heading: p.name, sub: id + ' · 등록 ' + p.since + ' · ' + p.area, html: back('admin-partners', '협력업체 목록') +
      kpis([['처리 신청', apps.length], ['완료', apps.filter(function (a) { return a.status === 'COMPLETED'; }).length], ['정산 금액', G.fmt(sett.reduce(function (s, r) { return s + r.net; }, 0))], ['만족도', rt.length ? Math.round(good / rt.length * 100) + '% (' + rt.length + ')' : '-']]) +
      '<div class="ag ag2 mt"><div>' + card('이용 상세 이력', tbl(['신청', '서비스', '고객', '상태', '금액'], apps.map(function (a) { return '<tr class="lk" data-act="goto" data-to="admin-app-' + a.no + '"><td>' + a.no + '<small class="blk">' + G.dshort(a.at) + '</small></td><td>' + esc(G.sv(a.svc).name) + '</td><td>' + esc(nm(a.user)) + '</td><td>' + G.stBadge(a.status) + '</td><td>' + (a.quote ? G.fmt(a.quote.total) : '-') + '</td></tr>'; }))) +
      card('정산 이력', tbl(['신청', '>매출', '>수수료', '>지급액', '상태'], sett.map(function (r) { return '<tr><td>' + r.app.no + '</td><td class="r">' + G.fmt(r.gross) + '</td><td class="r">' + G.fmt(r.fee) + '</td><td class="r">' + G.fmt(r.net) + '</td><td>' + r.st + '</td></tr>'; }))) + '</div><div>' +
      card('필수 정보', (miss.length ? '<div class="callout warn">' + ico('info', 18) + '<div><strong>빠진 필수 정보</strong><p>' + miss.join(', ') + '</p></div></div>' : '') + '<form class="form" data-sub="pinfoSave" data-id="' + id + '" novalidate>' + PIF.map(function (f2) { return fg('pi-' + f2[0], f2[1], inp('pi-' + f2[0], x[f2[0]])); }).join('') + '<p class="err" id="pi-e" hidden></p><div class="fa"><button class="btn btn-fill btn-sm" type="submit">저장</button><a class="btn btn-line btn-sm" href="#admin-partner-' + id + '">기본 정보 수정</a></div></form>') + '</div></div>' });
  }
  G.SUB.pinfoSave = function (fm) {
    var x = pinfo(fm.dataset.id), miss = [];
    PIF.forEach(function (f2) { x[f2[0]] = val('pi-' + f2[0]); if (f2[1].indexOf('*') > 0 && !x[f2[0]]) miss.push(f2[1].replace(' *', '')); });
    if (x.bank && /\d{5,}/.test(x.bank)) { x.bank = '****' + x.bank.slice(-4); }
    if (miss.length) { var e = $('pi-e'); e.textContent = '아직 빠진 정보: ' + miss.join(', ') + ' (저장은 했어요)'; e.hidden = false; G.save(); return; }
    G.log('협력업체 필수 정보 저장: ' + fm.dataset.id); done('저장했어요.');
  };

  /* ================= 기존 관리자 화면 덧붙이기 ================= */
  function insertAfter(h, marker, add) { var i = h.indexOf(marker); return i < 0 ? h : h.slice(0, i + marker.length) + add + h.slice(i + marker.length); }
  function insertBefore(h, marker, add) { var i = h.indexOf(marker); return i < 0 ? h : h.slice(0, i) + add + h.slice(i); }
  function post(arg, o) {
    if (arg === '' && o.html) {
      var fl = T().flags, on = Object.keys(fl).filter(function (k) { return fl[k]; }).length, tot = 0; G.STAGES.forEach(function (s) { tot += s.items.length; });
      var todo = [];
      if (f('dispute') && G.admBadge('admin-disputes')) todo.push(['admin-disputes', '분쟁 ' + G.admBadge('admin-disputes') + '건']);
      if (f('safety') && G.admBadge('admin-safety')) todo.push(['admin-safety', '안심 확인 ' + G.admBadge('admin-safety') + '건']);
      if (f('preorder') && G.admBadge('admin-preorders')) todo.push(['admin-preorders', '사전 신청 ' + G.admBadge('admin-preorders') + '건']);
      if (f('hubOps') && G.admBadge('admin-branches')) todo.push(['admin-branches', '보관 기한 지남 ' + G.admBadge('admin-branches') + '건']);
      var strip = '<a class="callout nb-strip ft-strip" href="#admin-features">' + ico('sliders', 20) + '<div><strong>단계별 기능 ' + on + ' / ' + tot + ' 켜짐 · 다음: ' + nextStage() + '</strong><p>' + (todo.length ? todo.map(function (x) { return x[1]; }).join(' · ') : '결정안의 진행 단계에 맞춰 기능을 열어 보세요.') + '</p></div>' + ico('chev-right', 18) + '</a>';
      if (me().role !== 'ADMIN') strip = todo.length ? '<div class="callout nb-strip">' + ico('bell', 20) + '<div><strong>확인할 일</strong><p>' + todo.map(function (x) { return '<a class="lnk-i" href="#' + x[0] + '">' + x[1] + '</a>'; }).join(' · ') + '</p></div></div>' : '';
      o.html = insertAfter(o.html, '</div>', strip);
    }
    if (arg.indexOf('app-') === 0) o.html = appExtra(arg.slice(4), o.html);
    if (arg.indexOf('member-') === 0) o.html = memberExtra(arg.slice(7), o.html);
    if (arg === 'members' && (f('memberTypes') || f('branches'))) {
      o.html = o.html.replace(/<small class="blk">(u\d+)<\/small>/g, function (m0, u) { var x = G.memInfo(u); return '<small class="blk">' + u + (f('memberTypes') ? ' · ' + esc(x.type) : '') + (f('branches') && x.branch ? ' · ' + esc((G.branch(x.branch) || {}).name || '').replace(' (예시)', '') : '') + (f('localBadge') && T().localOk[u] ? ' · 동네 확인' : '') + '</small>'; });
      o.html = o.html.replace(/data-q="([^"]*?)(u\d+)"/g, function (m0, q, u) { var x = G.memInfo(u); return 'data-q="' + q + u + ' ' + esc(x.type) + ' ' + esc(((G.branch(x.branch) || {}).name || '').toLowerCase()) + '"'; });
      o.html = o.html.replace('placeholder="이름·이메일·ID 검색"', 'placeholder="이름·이메일·ID·유형·가맹점 검색"');
      if (myBranch()) o.mount = (function (m0) { return function () { if (m0) m0(); document.querySelectorAll('#mtbl tbody tr').forEach(function (r) { var u = (r.getAttribute('data-to') || '').replace('admin-member-', ''); if (G.memInfo(u).branch !== myBranch()) r.remove(); }); }; })(o.mount);
    }
    if (arg === 'partners' && f('partnerInfo')) { o.html = o.html.replace(/data-to="admin-partner-/g, 'data-to="admin-pinfo-').replace(/href="#admin-partner-(P\d+)"/g, 'href="#admin-pinfo-$1"'); o.sub = '업체명을 누르면 필수 정보·이용 상세 이력·정산 이력을 볼 수 있어요.'; }
    if (arg === 'accounts' && f('branchManager')) { o.html = o.html.replace('<option value="ADMIN">최고관리자 (전체 권한)</option>', '<option value="ADMIN">최고관리자 (전체 권한)</option><option value="BRANCH">가맹점 매니저 (담당 동네)</option>'); }
    if (arg === 'apps' && myBranch()) o.sub = (o.sub || '') + ' · 담당 동네: ' + (G.branch(myBranch()) || {}).name;
    return o;
  }
  function appExtra(no, h) {
    var a = G.app(no); if (!a) return h;
    var add = '';
    if (a.channel) add += card('접수 경로', '<p><span class="bd bd-info">' + esc(a.channel) + '</span> 상담원이 대신 접수한 신청이에요. 진행 안내는 전화와 알림톡으로 함께 드려요.</p>');
    if (f('regular') && a.regular) add += card('정기 예약 · 담당자 요청', '<dl class="sum"><div class="kv"><dt>주기</dt><dd>' + esc(a.regular.cycle) + '</dd></div><div class="kv"><dt>담당자 요청</dt><dd>' + esc(a.regular.staff || '없음') + '</dd></div></dl>');
    if (f('staff')) {
      var w = byId(T().staff, T().appStaff[no]);
      add += card('방문 인력 (고객에게 미리 공개)', (w ? '<p><b>' + esc(w.name) + '</b> · ' + esc(w.role) + '</p><p>' + G.staffBadges(w) + '</p>' : '<p class="small">아직 배정하지 않았어요.</p>') +
        '<form class="form" data-sub="stfAsg" data-no="' + no + '"><div class="inl">' + sel('sa-w', [['', '선택해 주세요']].concat(T().staff.map(function (x) { return [x.id, x.name + ' · ' + x.role]; })), w ? w.id : '', ' aria-label="방문 인력"') + '<button class="btn btn-line btn-sm" type="submit">배정</button></div><p class="err" id="sa-e" hidden></p></form>');
    }
    if (f('workLog')) {
      var wl = T().worklog[no] || [];
      add += card('작업 일지', (wl.length ? '<ol class="hist">' + wl.slice().reverse().map(function (x) { return '<li><span class="hd-t"><span class="tag">' + esc(x[0]) + '</span><time>' + esc(x[1]) + '</time></span><p>' + esc(x[2]) + (x[3] ? ' <span class="small">📎 ' + esc(x[3]) + '</span>' : '') + '</p></li>'; }).join('') + '</ol>' : '<p class="small">아직 기록이 없어요.</p>') +
        '<form class="form" data-sub="wlAdd" data-no="' + no + '"><div class="fgrid">' + fg('wl-k', '구분', sel('wl-k', ['시작', '중간', '종료', '특이사항'], '시작')) + fg('wl-f', '사진 파일명 (시연)', inp('wl-f', '', '예: 작업전.jpg')) + fg('wl-t', '내용', inp('wl-t', ''), 'full') + '</div><label class="chk"><input type="checkbox" id="wl-n" checked> 고객(과 가족)에게 진행 알림 보내기</label><button class="btn btn-line btn-sm" type="submit">기록</button></form>');
    }
    if (f('pay')) { var py = T().payments.filter(function (p) { return p.app === no; })[0]; if (py) add += card('결제 (시연)', '<dl class="sum"><div class="kv"><dt>수단</dt><dd>' + esc(py.method) + (py.inst ? ' · ' + py.inst : '') + '</dd></div><div class="kv"><dt>견적</dt><dd>' + G.fmt(py.gross) + '</dd></div><div class="kv"><dt>이용권 · 포인트</dt><dd>-' + G.fmt(py.coupon || 0) + ' · -' + G.fmt(py.point || 0) + '</dd></div><div class="kv"><dt>결제액</dt><dd><b>' + G.fmt(py.paid) + '</b></dd></div></dl>'); }
    return add ? insertBefore(h, '<section class="ac "><h2>상태 변경</h2>', add) : h;
  }
  G.SUB.stfAsg = function (fm) {
    var w = byId(T().staff, val('sa-w')), e = $('sa-e'); if (!w) return;
    var bad = ['id', 'health', 'ins'].filter(function (k) { var v = w.badges[k]; return !v || v < SITE.today; });
    if (bad.length) { e.textContent = '신원·건강·보험 배지가 없거나 만료된 인력은 배정할 수 없어요.'; e.hidden = false; return; }
    var a = G.app(fm.dataset.no); T().appStaff[a.no] = w.id; G.notify(a.user, '[더가넷] ' + G.sv(a.svc).name + ' 방문 담당자는 ' + w.name + ' ' + w.role + '예요. 마이페이지에서 인증 배지를 확인하세요.'); G.log(a.no + ' 방문 인력 배정: ' + w.name); done('배정하고 고객에게 미리 알렸어요.');
  };
  G.SUB.wlAdd = function (fm) {
    var t = val('wl-t'); if (!t) return G.toast('내용을 적어 주세요.');
    var no = fm.dataset.no, a = G.app(no); (T().worklog[no] = T().worklog[no] || []).push([val('wl-k'), G.now(), t, val('wl-f')]);
    if ($('wl-n').checked) G.notify(a.user, '[더가넷] ' + G.sv(a.svc).name + ' ' + val('wl-k') + ': ' + t);
    G.log(no + ' 작업 일지 ' + val('wl-k')); done('기록했어요.');
  };
  function memberExtra(u, h) {
    var add = '', x = G.memInfo(u), t = T();
    if (f('memberTypes') || f('branches') || f('localBadge')) {
      var corp = x.corp ? byId(t.corps, x.corp) : null;
      add += card('회원 구분 · 동네', '<dl class="sum">' + (f('memberTypes') ? '<div class="kv"><dt>유형</dt><dd>' + esc(x.type) + (x.proxy ? ' <span class="bd bd-info">대리 가입</span>' : '') + '</dd></div>' + (x.extra ? Object.keys(x.extra).map(function (k) { return '<div class="kv"><dt>' + esc(k) + '</dt><dd>' + esc(x.extra[k]) + '</dd></div>'; }).join('') : '') + (corp ? '<div class="kv"><dt>소속 기업·기관</dt><dd>' + esc(corp.name) + '</dd></div>' : '') : '') +
        (f('branches') ? '<div class="kv"><dt>동네</dt><dd>' + esc((G.branch(x.branch) || {}).name || '미지정') + '</dd></div>' : '') + '<div class="kv"><dt>멤버십</dt><dd>' + esc(PLANS[G.planOf(u)][0]) + (f('memberLink') ? (G.isRegular(u) ? ' <span class="bd bd-ok">품온 정회원</span>' : ' <span class="bd bd-mute">체험 회원</span>') : '') + '</dd></div></dl>' +
        (f('localBadge') ? (t.localOk[u] ? '<p class="small">' + ico('check', 14) + ' ' + t.localOk[u] + ' 가맹점에서 동네 확인을 마쳤어요.</p>' : '<button class="btn btn-line btn-sm" data-act="localOk" data-u="' + u + '">가맹점 방문 · 동네 확인 완료</button><p class="small">주민등록증·우편물로 사는 동네만 보고 번호는 적지 않아요.</p>') : ''));
    }
    if (f('memberHistory')) {
      var rows = [];
      S.apps.filter(function (a) { return a.user === u; }).forEach(function (a) { rows.push([a.at, '서비스', a.no + ' · ' + G.sv(a.svc).name + ' · ' + G.stName(a.status)]); });
      S.club.posts.filter(function (p) { return p.owner === u; }).forEach(function (p) { rows.push([p.at, '품온 글', p.id + ' · ' + p.title]); });
      S.club.deals.filter(function (d) { return d.req === u || d.prov === u; }).forEach(function (d) { rows.push([d.at, '품온 약속', d.id + ' · ' + (G.nbDealBd ? (C_DEAL(d.status)) : d.status)]); });
      t.payments.filter(function (p) { return p.user === u; }).forEach(function (p) { rows.push([p.at, '결제', p.app + ' · ' + G.fmt(p.paid) + ' · ' + p.method]); });
      (t.points[u] || []).forEach(function (p) { rows.push([p[0], '포인트', p[1] + ' · ' + (p[2] > 0 ? '+' : '') + p[2] + 'P']); });
      t.events.filter(function (e) { return e.joined.indexOf(u) >= 0; }).forEach(function (e) { rows.push([e.date, '모임', e.title]); });
      t.gifts.filter(function (g) { return g.user === u; }).forEach(function (g) { rows.push([g.at, '나눔', ((byId(t.projects, g.proj) || {}).title || '') + ' · ' + G.fmt(g.amt)]); });
      t.disputes.filter(function (d) { return d.user === u; }).forEach(function (d) { rows.push([d.at, '분쟁', d.id + ' · ' + d.status]); });
      rows.sort(function (p, q) { return p[0] < q[0] ? 1 : -1; });
      add += card('통합 이용 이력', '<div class="filt"><label class="srch">' + ico('search', 16) + '<input type="search" placeholder="이력 검색" data-on="input:mhFilter"></label></div>' + tbl(['일시', '구분', '내용'], rows.map(function (r) { return '<tr class="mh"><td>' + esc(String(r[0]).slice(0, 16)) + '</td><td><span class="tag">' + r[1] + '</span></td><td>' + esc(r[2]) + '</td></tr>'; })));
    }
    return add ? insertBefore(h, '<section class="ac "><h2>신청 내역</h2>', add) : h;
  }
  function C_DEAL(s) { return (CLUB.DEAL_ST[s] || [s])[0]; }
  G.INP.mhFilter = function (el) { var q = el.value.trim().toLowerCase(); document.querySelectorAll('tr.mh').forEach(function (r) { r.hidden = q && r.textContent.toLowerCase().indexOf(q) < 0; }); };
  G.ACT.localOk = function (el) { var u = el.dataset.u; T().localOk[u] = SITE.today; G.notify(u, '[더가넷] 동네 확인을 마쳤어요. 품온 글에 "동네 확인" 배지가 붙어요.'); G.log(nm(u) + ' 동네 확인 완료'); done('동네 확인을 기록했어요.'); };
  G.ACT.goto = G.ACT.goto || function (el) { G.go(el.dataset.to); };
})();
