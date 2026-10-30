/* 단계별 기능 공개 — 결정안 최종 점검 보완: 가입·로그인, 서비스 상세 연결, 가격표, 방문 인력 자동 배정, 동네·지표·사전 신청, 기업·기관, 안심 관리, 나눔 심사, 공동 캠페인, 쉬운 말 등 */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES, T = function () { return S.st; }, f = G.feat;
  var A = function (o) { o.layout = 'admin'; return o; };
  var card = function (t, body, extra) { return '<section class="ac ' + (extra || '') + '">' + (t ? '<h2>' + t + '</h2>' : '') + body + '</section>'; };
  var byId = function (arr, id) { return (arr || []).filter(function (x) { return String(x.id) === String(id); })[0]; };
  var $ = function (id) { return document.getElementById(id); };
  var val = function (id) { var e = $(id); return e ? String(e.value || '').trim() : ''; };
  var uid = function () { return S.user ? S.user.id : ''; };
  var nm = function (id) { return G.nbMember ? G.nbMember(id).name : id; };
  var fg = function (id, label, input, cls) { return '<div class="fg' + (cls ? ' ' + cls : '') + '"><label class="lb" for="' + id + '">' + label + '</label>' + input + '</div>'; };
  var sel = function (id, opts, cur, attr) { return '<select id="' + id + '"' + (attr || '') + '>' + opts.map(function (o) { o = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(o[0]) + '"' + (String(cur) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; };
  var tbl = function (head, rows, empty) { return rows.length ? '<div class="tw"><table class="tbl"><thead><tr>' + head.map(function (h) { return '<th' + (h.charAt(0) === '>' ? ' class="r"' : '') + '>' + h.replace(/^>/, '') + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>' : '<p class="small">' + (empty || '아직 없어요.') + '</p>'; };
  var kpis = function (arr, cls) { return '<div class="kpis ' + (cls || 'k4') + '">' + arr.map(function (k) { return '<div class="kpi ' + (k[2] || '') + '"><span>' + k[0] + '</span><b>' + k[1] + '</b></div>'; }).join('') + '</div>'; };
  var ins = function (h, marker, add, after) { var i = h.indexOf(marker); if (i < 0) return h; if (after) i += marker.length; return h.slice(0, i) + add + h.slice(i); };
  var me = function () { return G.adminMe ? G.adminMe() : { role: 'ADMIN', loginId: 'admin' }; };
  var myBranch = function () { return me().role === 'BRANCH' ? (me().branch || 'B1') : ''; };
  var done = function (msg, to) { G.save(); G.toast(msg); if (to) G.go(to); else G.rerender(); };
  var pct = function (a, b) { return b ? Math.round(a / b * 100) + '%' : '-'; };

  /* ---------- 데이터 보강 (예전 저장본에도 적용) ---------- */
  function ensure() {
    var t = T(); if (!t) return;
    var PB = { PJ1: 'B1', PJ2: 'B1', PJ3: 'B2' };
    t.projects.forEach(function (p) { if (!p.branch) p.branch = PB[p.id] || 'B1'; });
    if (!t.campaigns) t.campaigns = [{ id: 'CA1', title: '겨울 이불 300채 함께 덮어요 (예시)', org: 'O2', proj: 'PJ1', until: '2026-12-20', goal: 300, unit: '채', ways: ['후원 1만 원 = 이불 반 채', '새 이불을 거점에 맡기기', '배달·정리 손길(서로품)'], joined: { u2: '물건', u4: '손길' }, base: 112, garnet: '더가넷이 이불 50채와 정리수납 손길 5가구를 더해요' }];
    if (!t.neighbors) t.neighbors = [{ id: 'NB1', helper: 'u4', senior: 'u6', branch: 'B1', cycle: '주 1회 전화', since: '2026-10-15', last: '2026-10-26', st: '연결됨' }];
    if (!t.neighborApply) t.neighborApply = [];
    if (!t.geo) t.geo = { H1: [37.5563, 126.9236], H2: [37.5612, 126.9310], H3: [37.5650, 126.9440], H4: [37.5110, 127.0980] };
    if (!t.trialBonus) t.trialBonus = {};
    if (!t.opened) t.opened = {};
    if (!t.verified) t.verified = { u1: '2026-09-30', u2: '2026-10-02', u3: '2026-10-05', u4: '2026-10-09', u6: '2026-10-21' };
    if (!t.lastActive) t.lastActive = { u1: '2026-10-27', u2: '2026-10-27', u3: '2026-10-27', u4: '2026-10-26', u5: '2026-10-05', u6: '2026-10-12' };
    if (!t.staffReq) t.staffReq = {};
    var h1 = G.hub('H1'); if (h1 && !h1.closed) { h1.closed = '일요일·공휴일'; } var h2 = G.hub('H2'); if (h2 && !h2.closed) h2.closed = '일·월요일';
    var h3 = G.hub('H3'); if (h3 && !h3.closed) h3.closed = '설·추석 당일'; var h4 = G.hub('H4'); if (h4 && !h4.closed) h4.closed = '없음 (보관함 24시간)';
    t.storage.forEach(function (x) { if (x.st === '보관 중') x.st = '전달 대기'; if (x.st === '수령 완료') x.st = '전달 완료'; });
    t.coupons.forEach(function (c) { if (c.src === '첫 나눔 배지' && c.exp < '2027-01-26' && !c.fixed) { c.exp = '2027-01-26'; c.fixed = true; } });
  }
  ensure();
  var oReset = G.reset; G.reset = function () { oReset(); ensure(); G.save(); };
  var oApply = G.stageApply; G.stageApply = function () { oApply(); ensure(); };

  /* ---------- 쉬운 말 · 이름 바꾸기 (알림 문구까지) ---------- */
  var oRender = G.render;
  G.render = function (top) {
    oRender(top);
    if (!f('easyWords') || document.body.getAttribute('data-area') === 'admin') return;
    var root = $('app'), rep = [[/정산 내역/g, '받을 금액 내역'], [/정산 예정일/g, '받는 날'], [/제공자 정산액/g, '제공자가 받을 금액'], [/정산 대기/g, '받을 금액 준비 중'], [/정산 완료/g, '받기 완료']];
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, l = []; while ((n = w.nextNode())) l.push(n);
    l.forEach(function (t) { var v = t.nodeValue, o = v; rep.forEach(function (r) { v = v.replace(r[0], r[1]); }); if (v !== o) t.nodeValue = v; });
  };
  var oToast = G.toast;
  G.toast = function (m) { m = String(m); if (f('pumon')) m = m.replace(/이웃 나눔/g, '품온'); if (f('easyWords') && document.body.getAttribute('data-area') !== 'admin') m = m.replace(/견적/g, '예상 비용'); oToast(m); };

  /* ---------- 활동 기록 (2주 무활동 안부 기준) ---------- */
  var oSave = G.save;
  G.save = function () { if (T() && S.user && T().lastActive) T().lastActive[S.user.id] = SITE.today; oSave(); };

  /* ================= 고객: 로그인 · 가입 ================= */
  var oLogin = P.login;
  P.login = function () {
    var o = oLogin();
    if (f('memberTypes')) o.html = ins(o.html, '<button class="btn btn-line btn-block" data-act="demoLogin"', '<div class="sns"><button class="btn btn-block sns-k" data-act="snsLogin" data-v="카카오" data-ret="' + esc(S.ret || '') + '">카카오로 시작하기</button><button class="btn btn-block sns-n" data-act="snsLogin" data-v="네이버" data-ret="' + esc(S.ret || '') + '">네이버로 시작하기</button><p class="small c">간편 로그인 뒤 휴대폰 본인확인을 한 번 하면 비밀번호를 외울 필요가 없어요. (시연: 데모 회원으로 들어가요)</p></div>');
    return o;
  };
  G.ACT.snsLogin = function (el) { G.toast(el.dataset.v + ' 간편 로그인(시연)으로 들어왔어요.'); G.ACT.demoLogin(el); };
  var oSignupP = P.signup;
  P.signup = function () {
    var o = oSignupP(); if (!(f('memberTypes') || f('events'))) return o;
    var add = '';
    if (f('memberTypes')) add += '<div class="fg"><span class="lb">휴대폰 본인확인 <em class="req">필수</em></span><div class="inl"><button type="button" class="btn btn-line btn-sm" data-act="idVerify">' + (S.tmpVerified ? '본인확인 완료' : '본인확인 하기 (시연)') + '</button>' + (S.tmpVerified ? '<span class="bd bd-ok">완료</span>' : '') + '</div><p class="hint-s">1인 1계정을 위해 확인해요. 생년월일은 만 19세 이상인지만 보고 저장하지 않아요.</p></div><label class="chk"><input type="checkbox" id="s-19"><span><b>[필수]</b> 만 19세 이상이에요. (품온 정회원은 만 19세 이상만 가입해요)</span></label>';
    if (f('events')) add += fg('s-inv', '친구 초대 코드 <em class="opt">선택</em>', '<input id="s-inv" placeholder="예: GNU1">');
    o.html = ins(o.html, '<label class="chk"><input type="checkbox" id="s-a1">', add);
    return o;
  };
  G.ACT.idVerify = function () { S.tmpVerified = true; G.toast('휴대폰 본인확인을 마쳤어요. (시연)'); var b = document.querySelector('[data-act=idVerify]'); if (b) { b.textContent = '본인확인 완료'; b.insertAdjacentHTML('afterend', '<span class="bd bd-ok">완료</span>'); } };
  var oSign = G.SUB.signup;
  G.SUB.signup = function (fm) {
    var type = (document.querySelector('[name=s-type]:checked') || { value: '개인' }).value;
    if (f('memberTypes')) {
      if (!val('s-ph')) return G.toast('휴대폰 번호를 적어 주세요. 본인확인과 알림에 필요해요.');
      if (!S.tmpVerified) return G.toast('휴대폰 본인확인을 먼저 해 주세요.');
      if (type === '개인' && !($('s-19') || {}).checked) return G.toast('만 19세 이상인지 확인해 주세요.');
    }
    if (f('branches') && $('s-br') && !val('s-br')) return G.toast('우리 동네(가까운 가맹점)를 골라 주세요. 품온 글과 모임이 이 동네 기준으로 보여요.');
    var inv = val('s-inv').toUpperCase(), invU = inv && /^GN/.test(inv) ? inv.slice(2).toLowerCase() : '';
    var before = S.joined ? S.joined.id + S.joined.email : ''; oSign(fm);
    if (S.joined && S.user === S.joined && before !== S.joined.id + S.joined.email) {
      var u = S.joined.id, m = G.memInfo(u);
      if (S.tmpVerified) { T().verified[u] = SITE.today; delete S.tmpVerified; }
      if (m.corp) { m.plan = 4; S.plan = 4; G.toast('회사 코드가 확인돼 LIFE FAMILY가 적용됐어요.'); }
      if (invU && invU !== u && (MEMBERS.some(function (x) { return x.id === invU; }))) { T().trialBonus[u] = (T().trialBonus[u] || 0) + 1; T().trialBonus[invU] = (T().trialBonus[invU] || 0) + 1; G.notify(invU, '[더가넷] 초대한 친구가 가입했어요. 품온 체험이 1회 늘었어요.'); }
      G.save();
    }
  };

  /* ================= 고객: 서비스 상세 연결 ================= */
  var oSvc = P.svc;
  P.svc = function (id) {
    var o = oSvc(id), s = G.sv(id); if (!s || !o.html) return o;
    var h = o.html;
    if (id === 'S15' && f('fixGiving')) {
      h = h.replace(/<div class="blk"><h2>신청서에서 입력하는 항목<\/h2>[\s\S]*?<\/ul><h3 class="mt">신청 전 준비사항<\/h3>/, '<div class="blk"><h2>후원 전에 정해 두면 좋아요</h2><p class="small">기부·후원은 신청서를 받지 않아요. 아래만 정해 두면 기관 창구에서 바로 후원할 수 있어요.</p><ul class="ul"><li>관심 대상 (아동·어르신·한부모 가정 등)</li><li>후원 방식 (한 번·매달)</li><li>이름 공개 여부</li></ul><h3 class="mt">미리 준비할 것</h3>');
      if (f('giving')) h = ins(h, '<div class="blk"><h2>유의사항</h2>', '<div class="callout">' + ico('gift', 20) + '<div><strong>물건으로 나누고 싶다면 · 마음품</strong><p>기관이 꼭 필요하다고 알려 준 물건만 받아요. 거점에 맡기면 기관이 찾아가요.</p><p><a class="lnk" href="#giving-maeum">마음품 창구 ' + ico('arrow-right', 16) + '</a></p></div></div>');
    }
    if (f('bridge') && f('pumon') && (id === 'S09' || id === 'S07')) h = ins(h, '<div class="blk"><h2>유의사항</h2>', '<div class="callout">' + ico('gift', 20) + '<div><strong>바꾸고 남은 물건, 품온에 나눠 보세요</strong><p>' + (id === 'S09' ? '침구·커튼을 바꾸고 남은 물건은 품온 나눔품으로 이웃에게 나눌 수 있어요.' : '리폼하고 남은 천·소품은 품온 나눔품으로, 나눔 받은 물건은 리폼으로 새로 태어나요.') + '</p><p><a class="lnk" href="#club-new">남은 물건 품온에 나누기 ' + ico('arrow-right', 16) + '</a></p></div></div>');
    if (f('rating3')) {
      h = h.replace(/<div class="sat">[\s\S]*?<\/div>/, function () {
        var rt = T().ratings.filter(function (r) { return r.svc === id; }), g = rt.filter(function (r) { return r.level >= 2; }).length;
        return rt.length >= 5 ? '<div class="sat"><b>' + Math.round(g / rt.length * 100) + '%</b><span>회원 만족도</span><em>최고예요·좋아요 비율 · ' + rt.length + '명 평가</em></div>' : '<div class="sat"><span>회원 만족도는 평가 5건이 모이면 공개해요 (지금 ' + rt.length + '건)</span></div>';
      });
      S.reviews.filter(function (r) { return r.svc === id && r.reply; }).forEach(function (r) { var m = '<p>' + esc(r.text) + '</p><small>' + esc(r.who) + ' · ' + r.at + '</small>'; h = h.replace(m, m + '<p class="rv-re"><b>업체 답글</b> ' + esc(r.reply) + '</p>'); });
    }
    if (f('promise')) h = h.replace('<p class="meta">' + G.opChip(s), '<p class="meta">' + G.opChip(s) + '<a class="bd bd-ok" href="#promise">가넷 안심 약속</a>');
    if (f('priceTable') && T().prices[id]) h = h.replace(/(<b id="pt-t">[^<]*<\/b><\/div>)/, '$1<button class="btn btn-fill btn-sm" data-act="ptBook" data-id="' + id + '">이 가격으로 바로 예약 요청</button>');
    o.html = h; return o;
  };
  G.ACT.ptBook = function (el) {
    var id = el.dataset.id, pr = T().prices[id], n = +val('pt-n') || pr.def, d = S.drafts[id] || (S.drafts[id] = { v: {}, step: 0, c: { phone: '', time: '', budget: '', note: '', agree: false, share: false } });
    d.c.budget = '정찰 ' + G.fmt(pr.per * n) + ' (' + n + pr.unit + ')'; d.c.note = d.c.note || ('정찰 예상 가격으로 예약 요청해요: ' + n + pr.unit + ' · ' + G.fmt(pr.per * n));
    G.save(); G.toast('예상 가격을 담아 신청서로 이동해요.'); G.go(G.bookable(id) ? 'apply-' + id : 'memo-' + id);
  };
  var oApplyP = P.apply;
  P.apply = function (id) {
    var o = oApplyP(id);
    if (id && o.html && f('phoneApply') && o.html.indexOf('id="apForm"') >= 0) o.html = ins(o.html, '<form', '<div class="callout ph-ap">' + ico('phone', 20) + '<div><strong>입력이 어려우신가요?</strong><p>상담원이 전화로 대신 접수해 드려요. 동의는 문자 링크로 받아요.</p><p class="fa"><a class="btn btn-line btn-sm" href="tel:' + SITE.phone.replace(/[^\d]/g, '') + '">' + ico('phone', 16) + ' 전화로 신청할게요 ' + esc(SITE.phone) + '</a></p></div></div>');
    if (id && o.html && f('coupons') && S.user) { var cp = T().coupons.filter(function (c) { return c.owner === uid() && !c.used && c.exp >= SITE.today; }); if (cp.length) o.html = ins(o.html, '<form', '<p class="small cp-note">' + ico('tag', 14) + ' 쓸 수 있는 이용권 ' + cp.length + '장이 있어요. 예상 비용을 승인할 때 결제 화면에서 고를 수 있어요.</p>'); }
    return o;
  };
  var oFaq = P.faq;
  P.faq = function () { var o = oFaq(); if (f('bigText')) o.html = ins(o.html, '<section class="sec', '<div class="wrap"><a class="callout nb-strip kakao-strip" href="#inquiry" data-act="kakaoTalk">' + ico('message', 20) + '<div><strong>카카오톡 채널로 상담하기</strong><p>평일 10:00–17:00 · 시니어가 가장 편한 방법이에요. (시연에서는 1:1 문의로 연결돼요)</p></div>' + ico('chev-right', 18) + '</a></div>'); return o; };

  /* 공동구매: 청약철회·공급일 고지 동의 */
  var oGb = P.groupbuy;
  P.groupbuy = function (a) { var o = oGb(a); if (o.html) o.html = o.html.replace(/(<form class="inl gb-f" data-sub="gbOrder" data-id="(GB\d+)">)/g, '$1<label class="chk gb-ok"><input type="checkbox" id="gc-$2"><span>공급 예정일과 7일 청약철회 기준을 확인했어요</span></label>'); return o; };
  var oGbOrder = G.SUB.gbOrder;
  G.SUB.gbOrder = function (fm) { if (!($('gc-' + fm.dataset.id) || {}).checked) return G.toast('공급 예정일과 청약철회(7일) 안내를 확인해 주세요.'); oGbOrder(fm); };

  /* 회원 주최 모임: 실비 3만 원까지 */
  var oEv = P.events;
  P.events = function (a) { var o = oEv(a); if (o.html) o.html = ins(o.html, '<div class="fg full"><label class="lb" for="mp-x">', fg('mp-m', '참가 실비 (원, 3만 원까지)', '<input id="mp-m" type="number" min="0" max="30000" step="1000" value="0">')); return o; };
  var oMeet = G.SUB.meetPropose;
  G.SUB.meetPropose = function (fm) { var m = +val('mp-m') || 0; if (m > 30000) { var e = $('mp-e'); e.textContent = '회원 주최 모임 실비는 3만 원까지예요.'; e.hidden = false; return; } var n = T().events.length; oMeet(fm); if (T().events.length > n) { T().events[T().events.length - 1].cost = m; G.save(); } };

  /* 정기 예약: 건너뛰기 · 일시정지 */
  var oMy = P.my;
  P.my = function (arg) {
    var o = oMy(arg); var a = arg && arg.indexOf('app-') === 0 ? G.app(arg.slice(4)) : null;
    if (a && f('regular') && a.regular && a.regular.cycle && a.regular.cycle !== '한 번' && o.html) {
      var r = a.regular, ctl = '<div class="act-b"><h4>' + ico('calendar', 16) + ' 정기 예약 · ' + esc(r.cycle) + (r.paused ? ' <span class="bd bd-warn">일시정지</span>' : '') + '</h4>' + (r.skip ? '<p class="small">다음 회차 건너뛰기를 요청했어요.</p>' : '') + '<div class="fa">' + (r.paused ? '<button class="btn btn-line btn-sm" data-act="regSet" data-no="' + a.no + '" data-k="resume">다시 시작</button>' : '<button class="btn btn-line btn-sm" data-act="regSet" data-no="' + a.no + '" data-k="skip">다음 회차 건너뛰기</button><button class="btn btn-ghost btn-sm" data-act="regSet" data-no="' + a.no + '" data-k="pause">일시정지</button>') + '</div><p class="small">결제는 회차마다 승인한 금액으로만 해요.</p></div>';
      o.html = o.html.replace('<aside class="dt-r">', '<aside class="dt-r">' + ctl);
    }
    return o;
  };
  G.ACT.regSet = function (el) { var a = G.app(el.dataset.no), r = a.regular, k = el.dataset.k; if (k === 'skip') r.skip = true; if (k === 'pause') r.paused = true; if (k === 'resume') { r.paused = false; r.skip = false; } a.hist.push([a.status, G.now(), '고객', k === 'skip' ? '정기 예약 다음 회차 건너뛰기 요청' : k === 'pause' ? '정기 예약 일시정지' : '정기 예약 다시 시작']); G.log(a.no + ' 정기 예약 ' + k); done(k === 'skip' ? '다음 회차를 건너뛰어요.' : k === 'pause' ? '정기 예약을 잠시 멈췄어요.' : '정기 예약을 다시 시작했어요.'); };

  /* ================= 방문 인력 자동 배정 (일정 확정 시) · 동행 알림 ================= */
  var oHist = G.addHist;
  G.addHist = function (a, st, by, memo) {
    oHist(a, st, by, memo);
    if (!T() || !a || !a.no) return;
    if (st === 'SCHEDULED' && f('staff') && !T().appStaff[a.no]) {
      var s = G.sv(a.svc), pref = T().staffReq[a.no] || (a.regular && a.regular.staff) || '';
      var ok = function (w) { return ['id', 'health', 'ins'].every(function (k) { var v = w.badges[k]; return v && v >= SITE.today; }); };
      var cands = T().staff.filter(function (w) { return ok(w) && (a.partner ? w.org === a.partner : s.op === 'DIRECT' ? w.org.charAt(0) === 'B' : true); });
      var w = cands.filter(function (x) { return pref && pref.indexOf(x.name) === 0; })[0] || cands[0];
      if (w) { T().appStaff[a.no] = w.id; G.notify(a.user, '[더가넷] 일정이 확정됐어요. 방문하는 분은 ' + w.name + ' ' + w.role + '예요. 사진과 인증 배지를 마이페이지에서 미리 확인하세요.'); }
    }
  };

  /* ================= 협력업체 답글 ================= */
  G.partnerReplies = function (pid) {
    var l = S.reviews.filter(function (r) { var a = G.app(r.app); return a && a.partner === pid; });
    return l.length ? '<ul class="mng rv-mng">' + l.map(function (r) { return '<li><div><b>' + esc(r.text) + '</b><small>' + esc(r.who) + ' · ' + r.at + (r.reply ? ' · 답글: ' + esc(r.reply) : '') + '</small></div>' + (r.reply ? '' : '<form class="inl" data-sub="rvReply" data-id="' + r.id + '"><input id="rr-' + r.id + '" placeholder="고마움이나 개선 약속을 짧게" aria-label="답글"><button class="btn btn-line btn-sm" type="submit">답글</button></form>') + '</li>'; }).join('') + '</ul>' : '<p class="small">후기가 아직 없어요.</p>';
  };
  G.SUB.rvReply = function (fm) { var r = byId(S.reviews, fm.dataset.id), t = val('rr-' + r.id); if (t.length < 3) return G.toast('답글을 적어 주세요.'); r.reply = t; G.log('협력업체 후기 답글: ' + r.id); done('답글을 달았어요. 서비스 상세 후기 아래에 보여요.'); };

  /* ================= 관리자 ================= */
  var oMenu = G.admMenu;
  G.admMenu = function () {
    var m = oMenu();
    if (f('campaign')) { var i = -1; m.forEach(function (x, k) { if (x[0] === 'admin-giving') i = k; }); if (i >= 0) m.splice(i + 1, 0, ['admin-campaigns', '공동 캠페인', 'heart']); }
    return m;
  };
  var oCur = G.admCurMap; G.admCurMap = function (raw) { if (raw.indexOf('admin-campaign') === 0) return 'admin-campaigns'; return oCur(raw); };
  var oAdmin = P.admin;
  P.admin = function (arg, r) {
    if (S.adminAuthed && arg !== 'login') {
      var br = myBranch();
      if (arg === 'metrics' && f('metrics') && !br) return metrics();
      if (arg === 'preorders' && f('preorder')) return preorders();
      if (arg === 'nominate' && f('givingNominate') && !br) return nominate();
      if (arg === 'campaigns' && !br && f('campaign')) return campaigns();
    }
    var o = oAdmin(arg, r);
    if (!S.adminAuthed || !o || !o.html) return o;
    try { return post(arg, o); } catch (e) { console.error(e); return o; }
  };
  function post(arg, o) {
    var h = o.html;
    if (arg === '') {
      if (f('pumonCheck') || f('pumon')) {
        var k = S.club, by = {}; k.posts.filter(function (p) { return p.status === 'PENDING_REVIEW'; }).forEach(function (p) { var s = G.PUMON[G.pumonSvc(p)].name; by[s] = (by[s] || 0) + 1; });
        var dv = k.deals.filter(function (d) { return d.status === 'ACCEPTED' || d.status === 'HELD'; }).length, rp = k.reports.filter(function (x) { return x.status === '접수'; }).length;
        h = h.replace('<p>등록 검토, 거래 안전 검증, 신고 확인을 처리해 주세요.</p>', '<p>등록 검토 ' + (Object.keys(by).map(function (s) { return s + ' ' + by[s]; }).join(' · ') || '0') + ' · 거래 검증 ' + dv + ' · 신고 ' + rp + '</p>');
        var cw = k.deals.filter(function (d) { return d.pay && (d.pay.st === 'RELEASE_WAIT' || d.pay.st === 'DISPUTED'); }).length, pw = G.partnerSettle ? G.partnerSettle().filter(function (x) { return x.st === 'WAIT'; }).length : 0;
        h = h.replace('<p>이웃 나눔 정산과 분쟁, 협력업체 정산을 확인해 주세요.</p>', '<p>품온 서로품 ' + cw + '건 · 협력업체 ' + pw + '건 · 할인 부담은 정산표에서 함께 확인해요.</p>');
      }
    }
    if (arg.indexOf('club') === 0 && f('pumon')) {
      h = h.replace(/<small>(N\d+)<\/small>/g, function (m0, id) { var p = G.nbPost(id); if (!p) return m0; var sv = G.pumonSvc(p); return '<small>' + id + ' · <span class="bd bd-pm bd-pm-' + sv + '">' + G.PUMON[sv].name + '</span>' + (sv === 'HELP' && G.repeatProvider(p.owner) >= 5 ? ' <span class="bd bd-warn">반복 제공자 · 협력업체 심사 안내</span>' : '') + '</small>'; });
      h = h.replace(/(<a href="#admin-club-post-(N\d+)"><span>)/g, function (m0, a0, id) { var p = G.nbPost(id); return p ? a0 + '<span class="bd bd-pm bd-pm-' + G.pumonSvc(p) + '">' + G.PUMON[G.pumonSvc(p)].name + '</span>' : m0; });
      if (arg === 'club-posts') h = ins(h, '<div class="tw">', '<div class="chips adm-svc-f">' + [['', '전체']].concat(Object.keys(G.PUMON).map(function (x) { return [G.PUMON[x].name, G.PUMON[x].name]; })).map(function (c, i) { return '<button class="chip' + (i ? '' : ' on') + '" data-act="admSvcF" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>');
      if (arg === 'club') {
        var rp2 = {}; S.club.deals.forEach(function (d) { var p = G.nbPost(d.post); if (p && p.pay === 'PAID' && G.pumonSvc(p) === 'HELP') rp2[d.prov] = 1; });
        var rows = Object.keys(rp2).map(function (u) { var n = G.repeatProvider(u); return '<tr><td>' + esc(nm(u)) + '</td><td class="r">' + n + '건</td><td>' + (n >= 5 ? '<span class="bd bd-warn">협력업체 심사 안내 대상</span>' : '<span class="bd bd-ok">기준 안</span>') + '</td></tr>'; });
        h += card('반복 제공자 점검 (유료 서로품 · 이번 달)', tbl(['회원', '>건수', '판단'], rows, '유료 서로품 제공자가 없어요.') + '<p class="small">한 달 5건을 넘으면 사업으로 보고 더가넷 협력업체 심사를 안내해요. 1회 3시간·20만 원 상한도 함께 확인해요.</p>');
      }
    }
    if (arg.indexOf('settle') === 0 && f('coupons') && (arg === 'settle-partner' || arg === 'settle')) h += discountCard();
    if (arg === 'stats' && f('giving')) { var tot = function (type) { return T().ledger.filter(function (x) { return x.type === type; }).reduce(function (s0, x) { return s0 + x.amt; }, 0); }; h += card('나눔 장부 (매출과 따로 집계)', kpis([['모금', G.fmt(tot('모금'))], ['기관 전달', G.fmt(tot('전달'))], ['집행', G.fmt(tot('집행'))], ['더가넷 서비스 매출에 포함', '0원']]) + '<p class="small">후원금은 기관 계좌로 바로 가고 더가넷 매출·수수료·정산과 섞지 않아요. 더가넷이 낸 매출 나눔·매칭·포인트 기부는 회사 기부금으로 따로 처리해요.</p>'); }
    if (arg === 'svcs' && f('priceTable')) h += priceCard();
    if (arg.indexOf('hub-') === 0 && f('places')) h = hubExtra(arg.slice(4), h);
    if (arg.indexOf('app-') === 0 && f('workLog')) { var ap = G.app(arg.slice(4)); if (ap && ap.svc === 'S12') h = h.replace('<option value="특이사항">특이사항</option>', '<option value="병원 도착">병원 도착</option><option value="진료 끝">진료 끝</option><option value="귀가">귀가</option><option value="특이사항">특이사항</option>'); }
    if (arg.indexOf('app-') === 0 && f('staff')) { var ap2 = G.app(arg.slice(4)); if (ap2) h = h.replace('<p class="small">아직 배정하지 않았어요.</p>', '<p class="small">아직 배정하지 않았어요. 일정 확정(SCHEDULED)으로 바꾸면 인증 배지가 유효한 인력을 자동으로 배정하고 고객에게 미리 알려요.</p>'); }
    if (arg.indexOf('member-') === 0) h = memberMore(arg.slice(7), h);
    if (arg === 'members' && (f('memberTypes') || f('branches'))) { h = memberFilters(h); }
    if (arg === 'partners' && f('partnerInfo')) h = ins(h, '<div class="tw">', '<div class="filt"><label class="tgl"><input type="checkbox" data-on="change:ptExp"> 보험·자격 만료 30일 안 업체만</label></div>');
    if (arg.indexOf('pinfo-') === 0 && f('partnerInfo')) h = pinfoMore(arg.slice(6), h);
    if (arg.indexOf('branch-') === 0 && f('branches')) h = branchMore(arg.slice(7), h);
    if (arg.indexOf('corp-') === 0 && f('corp') && arg !== 'corp-new') h = corpMore(arg.slice(5), h);
    if (arg === 'safety' && f('safety')) h = safetyMore(h);
    if (arg === 'events' || arg.indexOf('event-') === 0) h = h.replace('<p class="small">추첨 결과와 시각은 감사 로그에 남아요.</p>', '<p class="small">추첨 결과와 시각은 감사 로그에 남아요. 고가 경품은 제세공과금 처리를 확인하고, 이벤트 안내는 마케팅 수신 동의 회원에게만 보내요.</p>');
    o.html = h; return o;
  }
  G.ACT.admSvcF = function (el) { document.querySelectorAll('.adm-svc-f .chip').forEach(function (b) { b.classList.toggle('on', b === el); }); var v = el.dataset.v; document.querySelectorAll('.adm-body .tbl tbody tr').forEach(function (tr) { tr.hidden = !!v && tr.textContent.indexOf(v) < 0; }); };

  /* 이벤트 혜택: 이용권 지급 */
  var oAttend = G.ACT.evAttend;
  G.ACT.evAttend = function (el) {
    var e = byId(T().events, el.dataset.id), u = el.dataset.u; oAttend(el);
    if (e && /이용권/.test(e.benefit || '') && f('coupons')) { var r0 = +((e.benefit.match(/(\d+)%/) || [0, 5])[1]); T().coupons.push({ id: 'CP' + (T().coupons.length + 1), owner: u, rate: r0, cap: 10000, exp: G.addDays(SITE.today, 90), used: false, src: '이벤트: ' + e.title }); G.notify(u, '[더가넷] 모임 참여 혜택으로 이용권 ' + r0 + '%를 드렸어요.'); G.save(); }
  };

  /* ---------- 정산표 · 할인 부담 ---------- */
  function discountCard() {
    var rows = T().payments.map(function (p) { var a = G.app(p.app) || {}, s = G.sv(a.svc || 'S01'), partner = s.op !== 'DIRECT' && a.partner, disc = p.coupon || 0, pb = partner ? Math.round(disc / 2) : 0, gb = disc - pb; return '<tr><td><a href="#admin-app-' + p.app + '">' + p.app + '</a><small>' + esc(s.name) + '</small></td><td>' + (partner ? '협력업체' : '직접 수행') + '</td><td class="r">' + G.fmt(p.gross) + '</td><td class="r">' + G.fmt(disc) + '</td><td class="r">' + G.fmt(p.point || 0) + '</td><td class="r">' + G.fmt(gb + (p.point || 0)) + '</td><td class="r">' + G.fmt(pb) + '</td><td class="r"><b>' + G.fmt(p.paid) + '</b></td></tr>'; });
    return card('정산표 · 할인 부담 칸', tbl(['결제', '수행', '>승인 금액', '>이용권 할인', '>포인트', '>더가넷 부담', '>업체 부담', '>고객 결제액'], rows, '아직 결제가 없어요.') + '<p class="small">협력업체 서비스 이용권은 10%까지이고, 할인액은 더가넷과 업체가 반씩 나눠요. 포인트는 더가넷이 부담해요. 업체 부담분은 업체 정산액에서 빠져요. 본사 이벤트 이용권은 본사 부담이 원칙이에요.</p>');
  }

  /* ---------- 가격표 편집 ---------- */
  function priceCard() {
    var pr = T().prices, ids = Object.keys(pr);
    return card('가격표 (정찰형 서비스)', tbl(['서비스', '단위', '>단가', '선택 범위', '안내', ''], ids.map(function (id) { var x = pr[id]; return '<tr><td>' + esc(G.sv(id).name) + '</td><td><input id="pu-' + id + '" value="' + esc(x.unit) + '" size="6" aria-label="단위"></td><td class="r"><input id="pp-' + id + '" type="number" step="1000" value="' + x.per + '" aria-label="단가"></td><td><input id="pn-' + id + '" type="number" value="' + x.min + '" aria-label="최소"> ~ <input id="px-' + id + '" type="number" value="' + x.max + '" aria-label="최대"></td><td><input id="pt-' + id + '" value="' + esc(x.note) + '" aria-label="안내"></td><td><div class="inl"><button class="btn btn-line btn-sm" data-act="prSave" data-id="' + id + '">저장</button><button class="btn btn-ghost btn-sm" data-act="prDel" data-id="' + id + '">견적형으로</button></div></td></tr>'; })) +
      '<form class="inl mt" data-sub="prAdd">' + sel('pa-s', SV.filter(function (s) { return !pr[s.id] && s.id !== 'S15'; }).map(function (s) { return [s.id, s.name]; }), '', ' aria-label="서비스"') + '<button class="btn btn-fill btn-sm" type="submit">정찰형으로 추가</button></form><p class="small">정찰형은 고객이 시간·횟수를 고르면 예상 가격이 바로 보이고 바로 예약 요청할 수 있어요. 나머지는 기존처럼 견적형이에요.</p>', 'pr-card');
  }
  G.ACT.prSave = function (el) { var id = el.dataset.id, x = T().prices[id]; x.unit = val('pu-' + id); x.per = +val('pp-' + id) || x.per; x.min = +val('pn-' + id) || 1; x.max = Math.max(x.min, +val('px-' + id) || x.max); x.def = Math.min(Math.max(x.def, x.min), x.max); x.note = val('pt-' + id); G.log('가격표 저장: ' + id); done('가격표를 저장했어요.'); };
  G.ACT.prDel = function (el) { delete T().prices[el.dataset.id]; G.log('정찰형 해제: ' + el.dataset.id); done('견적형으로 바꿨어요.'); };
  G.SUB.prAdd = function () { var id = val('pa-s'); if (!id) return; T().prices[id] = { unit: '회', per: 30000, min: 1, max: 4, def: 1, note: '기본 범위 기준' }; G.log('정찰형 추가: ' + id); done('정찰형으로 추가했어요. 단가를 고쳐 주세요.'); };

  /* ---------- 거점 사진·휴무·좌표 ---------- */
  function hubExtra(id, h) {
    var x = id === 'new' ? {} : (G.hub(id) || {}), g = T().geo[id];
    return ins(h, '</div><p class="err" id="hf-e"', fg('hf-closed', '휴무일', '<input id="hf-closed" value="' + esc(x.closed || '') + '" placeholder="예: 일요일·공휴일">') + fg('hf-photo', '입구 사진', '<input id="hf-photo" type="file" accept="image/*"><p class="hint-s">' + (x.photo ? '등록됨' : '시니어가 찾기 쉽게 입구가 보이는 사진을 올려요.') + '</p>') +
      '<div class="fg"><span class="lb">지도 좌표</span><div class="inl"><button type="button" class="btn btn-line btn-sm" data-act="hubGeo" data-id="' + id + '">주소로 좌표 찾기 (시연)</button><span class="small" id="hf-geo">' + (g ? g[0].toFixed(4) + ', ' + g[1].toFixed(4) : '아직 없음') + '</span></div><p class="hint-s">실제 운영에서는 카카오·네이버 주소→좌표 변환 API를 서버에서 써요.</p></div>');
  }
  var pendingGeo = null;
  G.ACT.hubGeo = function () { var a = val('hf-addr'); if (!a) return G.toast('주소를 먼저 적어 주세요.'); var n = 0; for (var i = 0; i < a.length; i++) n = (n * 31 + a.charCodeAt(i)) % 100000; pendingGeo = [37.45 + (n % 1000) / 5000, 126.85 + (Math.floor(n / 1000) % 100) / 400]; $('hf-geo').textContent = pendingGeo[0].toFixed(4) + ', ' + pendingGeo[1].toFixed(4); G.toast('좌표를 찾았어요. (시연)'); };
  var oHub = G.SUB.hubSave;
  G.SUB.hubSave = function (fm) {
    var id = fm.dataset.id, closed = val('hf-closed'), ph = $('hf-photo'), photo = ph && ph.files && ph.files[0] ? URL.createObjectURL(ph.files[0]) : '', name = val('hf-name'), geo = pendingGeo; pendingGeo = null;
    oHub(fm);
    var h = id === 'new' ? T().hubs.filter(function (x) { return x.name === name; }).slice(-1)[0] : G.hub(id);
    if (h) { if (closed) h.closed = closed; if (photo) h.photo = photo; if (geo) T().geo[h.id] = geo; G.save(); }
  };

  /* ---------- 회원 상세 · 목록 ---------- */
  function memberMore(u, h) {
    var t = T(), fam = t.family[u] || {}, recv = (fam.consent && fam.receivers) || [], ti = G.trialInfo ? G.trialInfo(u) : null;
    var phone = (MEMBERS.filter(function (m) { return m.id === u; })[0] || {}).phone || '';
    var c = card('권한 · 안심 · 연락처', '<dl class="sum"><div class="kv"><dt>본인확인</dt><dd>' + (t.verified[u] ? '<span class="bd bd-ok">완료 ' + t.verified[u] + '</span>' : '<span class="bd bd-warn">미완료</span>') + '</dd></div>' +
      (f('trial3') && ti && !ti.regular ? '<div class="kv"><dt>품온 체험</dt><dd>' + ti.left + '회 남음 / ' + ti.total + '회</dd></div>' : '') +
      '<div class="kv"><dt>안심 수신자</dt><dd>' + (recv.length ? recv.map(function (r) { return esc(r.name) + '(' + esc(r.rel) + ')'; }).join(', ') : '<span class="bd bd-warn">없음 → 안심 매니저가 받음</span>') + '</dd></div>' +
      '<div class="kv"><dt>마지막 활동</dt><dd>' + esc((t.lastActive || {})[u] || '-') + '</dd></div>' +
      '<div class="kv"><dt>연락처</dt><dd><span id="ph-' + u + '">' + esc(phone.replace(/\d{4}$/, '****').replace(/(\d{3})-\d{3,4}-/, '$1-****-')) + '</span> <span class="inl">' + sel('pr-' + u, [['', '열람 사유 선택'], ['분쟁 확인', '분쟁 확인'], ['일정 조율', '일정 조율'], ['안심 확인', '안심 확인'], ['본인 요청', '본인 요청']], '', ' aria-label="열람 사유"') + '<button class="btn btn-ghost btn-sm" data-act="phView" data-u="' + u + '">연락처 보기</button></span></dd></div></dl><p class="small">연락처를 열면 열람 사유와 함께 감사 로그에 남아요.</p>');
    h = ins(h, '<section class="ac "><h2>신청 내역</h2>', c);
    if (f('memberHistory')) h = h.replace('<h2>통합 이용 이력</h2>', '<h2>통합 이용 이력</h2><div class="fa top"><button class="btn btn-ghost btn-sm" data-act="csvOut" data-name="회원이력_' + u + '">' + ico('upload', 14) + ' CSV 내려받기</button></div>');
    return h;
  }
  G.ACT.phView = function (el) { var u = el.dataset.u, why = val('pr-' + u); if (!why) return G.toast('열람 사유를 골라 주세요.'); var m = MEMBERS.filter(function (x) { return x.id === u; })[0] || {}; $('ph-' + u).textContent = (m.phone || '').replace(/\*{4}/, '1234') + ' (시연)'; G.log(nm(u) + ' 연락처 열람 · 사유: ' + why, 'VIEW'); G.save(); G.toast('연락처를 열었어요. 감사 로그에 남았어요.'); };
  G.ACT.csvOut = function (el) {
    var tb = el.closest('section').querySelector('table'); if (!tb) return G.toast('내려받을 표가 없어요.');
    var rows = Array.prototype.map.call(tb.querySelectorAll('tr'), function (tr) { if (tr.hidden) return null; return Array.prototype.map.call(tr.children, function (td) { return '"' + td.textContent.replace(/"/g, '""').trim() + '"'; }).join(','); }).filter(Boolean);
    try { var blob = new Blob(['﻿' + rows.join('\n')], { type: 'text/csv' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = el.dataset.name + '.csv'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) {}
    G.log('이력 CSV 내려받기: ' + el.dataset.name, 'VIEW'); G.save(); G.toast('CSV로 내려받았어요. 감사 로그에 남았어요.');
  };
  function memberFilters(h) {
    h = h.replace(/<tr class="lk" data-act="goto" data-to="admin-member-(u\d+)"/g, function (m0, u) { var x = G.memInfo(u); return m0 + ' data-ty="' + esc(x.type) + '" data-br="' + esc(x.branch || '') + '" data-pl="' + (G.planOf(u) >= 1 ? 'reg' : 'free') + '" data-vf="' + (T().verified[u] ? 'y' : 'n') + '"'; });
    var add = (f('memberTypes') ? sel('mf-ty', [['', '모든 유형'], ['개인', '개인'], ['기업', '기업'], ['기관', '기관·단체']], '', ' data-on="change:mFilter" aria-label="유형"') : '') + (f('branches') ? sel('mf-br', [['', '모든 동네']].concat(T().branches.map(function (b) { return [b.id, b.name.replace(' (예시)', '')]; })), '', ' data-on="change:mFilter" aria-label="동네"') : '') + sel('mf-pl', [['', '모든 등급'], ['reg', 'START 이상 (정회원)'], ['free', 'LIFE FREE']], '', ' data-on="change:mFilter" aria-label="등급"') + sel('mf-vf', [['', '본인확인 전체'], ['y', '본인확인 완료'], ['n', '본인확인 전']], '', ' data-on="change:mFilter" aria-label="본인확인"');
    return h.replace('<select id="mst"', add + '<select id="mst"');
  }
  var oMF = G.INP.mFilter;
  G.INP.mFilter = function (el) {
    oMF(el); var ty = val('mf-ty'), br = val('mf-br'), pl = val('mf-pl'), vf = val('mf-vf'); if (!ty && !br && !pl && !vf) return; var n = 0;
    document.querySelectorAll('#mtbl tbody tr').forEach(function (r) { if (r.hidden) return; var ok = (!ty || r.dataset.ty === ty) && (!br || r.dataset.br === br) && (!pl || r.dataset.pl === pl) && (!vf || r.dataset.vf === vf); r.hidden = !ok; if (ok) n++; });
    var c = $('mcnt'); if (c) c.textContent = n + '명';
  };
  G.INP.ptExp = function (el) {
    document.querySelectorAll('.adm-body .tbl tbody tr').forEach(function (tr) { var m = (tr.getAttribute('data-to') || '').match(/admin-pinfo-(P\d+)/); if (!m) return; var x = (T().pinfo || {})[m[1]] || {}, e = x.insExp || ''; var soon = e && G.dayDiff(SITE.today, e) <= 30; tr.hidden = el.checked && !soon; });
  };

  /* ---------- 협력업체 상세: 보험 만료 · 진위 확인 ---------- */
  function pinfoMore(id, h) {
    T().pinfo = T().pinfo || {}; var x = T().pinfo[id] || (T().pinfo[id] = {}); if (!x.insExp) x.insExp = { P1: '2027-03-31', P2: '2026-11-20', P3: '', P4: '2027-01-31', P5: '', P6: '2026-11-15' }[id] || '';
    var soon = x.insExp && G.dayDiff(SITE.today, x.insExp) <= 30;
    return ins(h, '<section class="ac "><h2>필수 정보</h2>', card('확인 · 만료', '<dl class="sum"><div class="kv"><dt>사업자 진위</dt><dd>' + (x.bizOk ? '<span class="bd bd-ok">정상 사업자 ' + x.bizOk + '</span>' : '<button class="btn btn-line btn-sm" data-act="bizCheck" data-id="' + id + '">국세청 상태 확인 (시연)</button>') + '</dd></div><div class="kv"><dt>보험 만료일</dt><dd><input id="ie-' + id + '" type="date" value="' + esc(x.insExp) + '"> <button class="btn btn-ghost btn-sm" data-act="insSave" data-id="' + id + '">저장</button>' + (soon ? ' <span class="bd bd-warn">만료 임박</span>' : '') + '</dd></div><div class="kv"><dt>방문 인력</dt><dd>' + T().staff.filter(function (w) { return w.org === id; }).map(function (w) { return esc(w.name) + ' ' + G.staffBadges(w); }).join('<br>') + '</dd></div></dl><p class="small">정산 계좌는 예금주가 업체명과 같은지 확인하고, 암호화해 저장하며 끝 4자리만 보여요.</p>'));
  }
  G.ACT.bizCheck = function (el) { T().pinfo[el.dataset.id].bizOk = SITE.today; G.log('사업자 진위 확인: ' + el.dataset.id); done('계속사업자로 확인됐어요. (시연)'); };
  G.ACT.insSave = function (el) { T().pinfo[el.dataset.id].insExp = val('ie-' + el.dataset.id); G.log('보험 만료일 저장: ' + el.dataset.id); done('저장했어요.'); };

  /* ---------- 가맹점 상세: 요약 지표 · 이력 거르기 · CSV ---------- */
  function memOf(bid) { return Object.keys(T().mem).filter(function (u) { return T().mem[u].branch === bid; }); }
  function branchStats(bid) {
    var t = T(), mem = memOf(bid), deals = S.club.deals.filter(function (d) { return mem.indexOf(d.req) >= 0 || mem.indexOf(d.prov) >= 0; });
    var act = mem.filter(function (u) { return deals.some(function (d) { return (d.req === u || d.prov === u) && G.dayDiff(d.at, SITE.today) <= 30; }); }).length;
    var apps = S.apps.filter(function (a) { return G.branchOfRegion(a.region) === bid || mem.indexOf(a.user) >= 0; });
    var sales = apps.filter(function (a) { return a.quote && ['APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].indexOf(a.status) >= 0; }).reduce(function (s0, a) { return s0 + a.quote.total; }, 0);
    var valid = deals.filter(function (d) { return ['DECLINED', 'CANCELLED', 'BLOCKED'].indexOf(d.status) < 0; }).length, dn = deals.filter(function (d) { return d.status === 'DONE'; }).length;
    var fee = deals.filter(function (d) { return d.pay && d.pay.fee && d.pay.st === 'PAID_OUT'; }).reduce(function (s0, d) { return s0 + d.pay.fee; }, 0);
    var dsp = t.disputes.filter(function (d) { var a = G.app(d.app), dl = G.nbDeal(d.deal); return (a && apps.indexOf(a) >= 0) || (dl && deals.indexOf(dl) >= 0); }).length;
    return { mem: mem.length, act: act, sales: sales, valid: valid, done: dn, ev: t.events.filter(function (e) { return e.branch === bid; }).length, dsp: dsp, trades: apps.length + deals.length, share: Math.round(sales * 0.1 + fee * 0.3), apps: apps, deals: deals };
  }
  G.branchStats = branchStats;
  function branchMore(id, h) {
    if (!G.branch(id)) return h; var st = branchStats(id);
    h = h.replace(/<div class="kpis k5">(?:<div class="kpi [^"]*"><span>[^<]*<\/span><b>[^<]*<\/b><\/div>)+<\/div>/, kpis([['동네 회원', st.mem], ['활동 회원 비율 (30일)', pct(st.act, st.mem)], ['서비스 매출', G.fmt(st.sales)], ['품온 성사율', pct(st.done, st.valid)], ['모임 개최', st.ev + '회'], ['분쟁률', pct(st.dsp, st.trades)], ['수익 배분 (예시)', G.fmt(st.share)]], 'k7') + '<p class="small">수익 배분 예시: 동네 서비스 매출의 10% + 품온 수수료의 30%. 실제 비율은 가맹계약으로 정해요.</p>');
    h = h.replace('<h2>상세 이력 (최신순)</h2>', '<h2>상세 이력 (최신순)</h2><div class="nb-bar"><div class="chips">' + ['전체', '서비스 신청', '품온 약속', '이벤트', '사전 신청', '거점 보관'].map(function (c, i) { return '<button class="chip' + (i ? '' : ' on') + '" data-act="brHistF" data-v="' + (i ? c : '') + '">' + c + '</button>'; }).join('') + '</div><button class="btn btn-ghost btn-sm" data-act="csvOut" data-name="가맹점이력_' + id + '">' + ico('upload', 14) + ' CSV</button></div>');
    return h;
  }
  G.ACT.brHistF = function (el) { var sec = el.closest('section'); sec.querySelectorAll('.chip').forEach(function (b) { b.classList.toggle('on', b === el); }); sec.querySelectorAll('tbody tr').forEach(function (tr) { var tg = tr.querySelector('.tag'); tr.hidden = !!el.dataset.v && (!tg || tg.textContent !== el.dataset.v); }); };

  /* ---------- 품온 지표 (결정안 7개 지표, 동네별) ---------- */
  function metrics() {
    var t = T(), rows = t.branches.filter(function (b) { return !myBranch() || b.id === myBranch(); }).map(function (b) {
      var st = branchStats(b.id), mem = memOf(b.id);
      var trial = mem.filter(function (u) { return (t.trial[u] || []).length || G.planOf(u) === 0; }), conv = mem.filter(function (u) { return (t.trial[u] || []).length && G.isRegular(u); });
      var first = mem.map(function (u) { var v = t.verified[u]; var d = st.deals.filter(function (x) { return (x.req === u || x.prov === u) && x.status === 'DONE'; }).map(function (x) { return x.hist.filter(function (hh) { return hh[0] === 'DONE'; }).map(function (hh) { return hh[1]; })[0] || x.at; }).sort()[0]; return v && d ? Math.max(0, G.dayDiff(v, d)) : null; }).filter(function (x) { return x != null; });
      var noshow = st.deals.filter(function (d) { return d.status === 'CANCELLED' && d.hist.some(function (hh) { return /노쇼|나타나지/.test(hh[3] || ''); }); }).length;
      var link = S.apps.filter(function (a) { return mem.indexOf(a.user) >= 0 && (a.from === 'pumon' || /품온/.test(a.note || '')); }).length;
      var renew = mem.filter(function (u) { return G.isRegular(u); }).length;
      return '<tr class="lk" data-act="goto" data-to="admin-branch-' + b.id + '"><td>' + esc(b.name.replace(' (예시)', '')) + '</td><td class="r">' + pct(st.act, st.mem) + '</td><td class="r">' + pct(st.done, st.valid) + '</td><td class="r">' + (first.length ? Math.round(first.reduce(function (a, c) { return a + c; }, 0) / first.length) + '일' : '-') + '</td><td class="r">' + pct(conv.length, trial.length) + '</td><td class="r">' + pct(renew, renew) + '</td><td class="r">' + pct(st.dsp + noshow, st.trades) + '</td><td class="r">' + link + '</td></tr>';
    });
    var k = S.club, dn = k.deals.filter(function (d) { return d.status === 'DONE'; }).length, valid = k.deals.filter(function (d) { return ['DECLINED', 'CANCELLED', 'BLOCKED'].indexOf(d.status) < 0; }).length;
    return A({ title: '품온 지표', heading: '품온 지표 대시보드', sub: SITE.today + ' 기준 · 동네(가맹점)별로 보고, 기준을 넘는 동네부터 다음 가맹점으로 확장해요.', html:
      kpis([['거래 성사율 (전체)', pct(dn, valid)], ['정회원', MEMBERS.filter(function (m) { return G.isRegular(m.id); }).length + '명'], ['분쟁', T().disputes.length + '건'], ['사전 신청', T().preorders.length + Object.keys(T().preorderBase).reduce(function (s0, b) { return s0 + T().preorderBase[b]; }, 0) + '명']]) +
      card('동네별 7개 지표', tbl(['가맹점', '>활동 회원 비율', '>거래 성사율', '>첫 거래까지', '>체험→유료 전환', '>갱신률', '>분쟁·노쇼율', '>더가넷 연결'], rows) + '<ul class="ul small"><li>활동 회원 비율 = 최근 30일 거래를 요청·완료한 회원 ÷ 전체 회원</li><li>거래 성사율 = 완료 거래 ÷ 유효 요청 · 첫 거래까지 = 본인확인 → 첫 거래 완료 (목표 30일 안)</li><li>체험→유료 전환 = 유료 전환 회원 ÷ 체험 회원 · 갱신률 = 만기 회원 중 다시 낸 비율 (시연은 만기 데이터가 없어 정회원 유지로 표시)</li><li>분쟁·노쇼율 = 분쟁·노쇼 ÷ 거래 · 더가넷 연결 = 품온에서 더가넷 전문 서비스로 이어진 신청</li><li>성사율·분쟁률·갱신률이 낮으면 확장보다 문제 해결이 먼저예요.</li></ul>') });
  }

  /* ---------- 사전 신청 (관리자) ---------- */
  function preorders() {
    var t = T(), goal = G.PRE_GOAL || 30, list = t.preorders.filter(function (r) { return !myBranch() || r.branch === myBranch(); });
    var cards = t.branches.filter(function (b) { return !myBranch() || b.id === myBranch(); }).map(function (b) {
      var l = t.preorders.filter(function (r) { return r.branch === b.id; }), n = l.length + (t.preorderBase[b.id] || 0), dist = {};
      l.forEach(function (r) { r.want.forEach(function (w) { dist[w] = (dist[w] || 0) + 1; }); });
      var mx = Math.max.apply(null, Object.keys(dist).map(function (k) { return dist[k]; }).concat([1]));
      return card(esc(b.name), '<p><b>' + n + '</b> / ' + goal + '명 ' + (t.opened[b.id] ? '<span class="bd bd-ok">개설 ' + t.opened[b.id] + '</span>' : n >= goal ? '<span class="bd bd-ok">개설 기준 달성</span>' : '<span class="bd bd-mute">' + (goal - n) + '명 남음</span>') + '</p><div class="ft-bar"><i style="width:' + Math.min(100, Math.round(n / goal * 100)) + '%"></i></div><ul class="mt-bars">' + Object.keys(dist).map(function (k) { return '<li><span>' + k + '</span><i><em style="width:' + Math.round(dist[k] / mx * 100) + '%"></em></i><b>' + dist[k] + '</b></li>'; }).join('') + '</ul>' +
        (n >= goal && !t.opened[b.id] ? '<button class="btn btn-fill btn-sm" data-act="preOpen" data-id="' + b.id + '">개설 알림 보내기</button>' : '<p class="small">관심 서비스 분포는 이 동네에 새로 들어온 신청 기준이에요.</p>'));
    }).join('');
    return A({ title: '사전 신청', heading: '창립회원 사전 신청', sub: '동네별 ' + goal + '명이 모이면 품온을 열어요. 연락처는 개설 알림에만 쓰고 가려서 보여요.', html: '<div class="ag2c">' + cards + '</div>' +
      card('신청 목록', tbl(['신청일', '이름', '연락처', '동네', '관심 서비스', '연락'], list.map(function (r) { return '<tr><td>' + esc(r.at) + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.phone) + '</td><td>' + esc((G.branch(r.branch) || {}).name || '') + '</td><td>' + r.want.map(function (w) { return '<span class="tag">' + esc(w) + '</span>'; }).join('') + '</td><td>' + (r.called ? '<span class="bd bd-ok">' + esc(r.called) + '</span>' : '<button class="btn btn-line btn-sm" data-act="preCall" data-id="' + r.id + '">안내 완료</button>') + '</td></tr>'; })) + '<div class="fa top"><button class="btn btn-ghost btn-sm" data-act="csvOut" data-name="사전신청">' + ico('upload', 14) + ' CSV</button></div><p class="small">개설 후 3개월이 지나면 가입하지 않은 분의 정보는 지워요.</p>') });
  }
  G.ACT.preOpen = function (el) { var b = el.dataset.id, t = T(); t.opened[b] = SITE.today; t.preorders.filter(function (r) { return r.branch === b; }).forEach(function (r) { r.called = r.called || SITE.today + ' 개설 알림'; if (r.user) G.notify(r.user, '[더가넷] 우리 동네 품온이 열렸어요! 창립회원 혜택을 확인하세요.'); }); G.log('동네 개설 알림 발송: ' + b); done('개설 알림을 보냈어요. (시연)'); };

  /* ---------- 기업·기관 상세: 월 청구서 · 이용 현황 · 도움 요청 대리 등록 ---------- */
  function corpMore(id, h) {
    var c = byId(T().corps, id); if (!c) return h;
    var staff = Object.keys(T().mem).filter(function (u) { return T().mem[u].corp === id; }), used = Math.max(c.used, staff.length);
    var add = '';
    if (c.kind === '기업') {
      var price = PLANS[4][1], seats = c.seats || used;
      add += card('이용 현황 · ' + SITE.today.slice(0, 7) + ' 청구서', kpis([['계약 좌석', seats], ['연결된 직원', used], ['적용 등급', 'LIFE FAMILY'], ['이번 달 청구 (예시)', G.fmt(used * price)]]) + tbl(['항목', '>수량', '>단가', '>금액'], ['<tr><td>LIFE FAMILY 복지 (사용 좌석)</td><td class="r">' + used + '</td><td class="r">' + G.fmt(price) + '</td><td class="r">' + G.fmt(used * price) + '</td></tr>']) + '<p class="small">회사에는 사용 인원과 금액만 보고하고, 직원 개인의 이용 내용은 보여 주지 않아요. 세금계산서는 담당자 이메일로 보내요.</p><button class="btn btn-line btn-sm" data-act="invSend" data-id="' + id + '">청구서 보내기 (시연)</button>');
    } else {
      var reqs = T().nominations.filter(function (n) { return n.corp === id; });
      add += card('도움 요청 대리 등록 (기관 담당자)', '<form class="form" data-sub="orgReq" data-id="' + id + '"><div class="fgrid">' + fg('or-t', '대상 유형', sel('or-t', ['혼자 사시는 어르신', '한부모·미혼모 가정', '보호가 필요한 아동', '경제적 어려움이 큰 이웃', '장애가 있는 이웃'], '')) + fg('or-k', '필요한 도움', sel('or-k', ['물품', '재능·서비스 (마음품)', '안부·방문', '공공 지원 연결'], '')) + fg('or-x', '상황 (가명 번호로, 실명·주소 없이)', '<textarea id="or-x" rows="3" placeholder="예: 가명 A-0312, 겨울 난방용품이 필요해요"></textarea>', 'full') + '</div><button class="btn btn-fill btn-sm" type="submit">등록</button></form>' + tbl(['접수', '대상', '도움', '단계'], reqs.map(function (n) { return '<tr><td>' + n.at + '</td><td>' + esc(n.target) + '</td><td>' + esc(n.need || '') + '</td><td>' + esc(n.st) + '</td></tr>'; }), '등록한 요청이 없어요.') + '<p class="small">원본 정보(실명·주소·소득·건강)는 기관만 갖고, 더가넷에는 가명 번호와 지원 기록만 남겨요.</p>');
    }
    return h + add;
  }
  G.ACT.invSend = function (el) { G.log('기업 월 청구서 발송: ' + el.dataset.id); done('청구서를 보냈어요. (시연)'); };
  G.SUB.orgReq = function (fm) { var x = val('or-x'); if (x.length < 5) return G.toast('상황을 적어 주세요.'); if (/(010-?\d{3,4}|\d{6}-\d)/.test(x)) return G.toast('연락처·주민번호는 적지 말아 주세요.'); T().nominations.unshift({ id: 'NM' + (T().nominations.length + 1), kind: '기관 대리 등록', target: val('or-t'), need: val('or-k'), org: '', corp: fm.dataset.id, text: x, by: 'org', at: SITE.today, st: (G.NM_ST || ['추천 접수', '기관 확인'])[1], coi: [] }); G.log('기관 도움 요청 대리 등록: ' + fm.dataset.id); done('등록했어요. 기관 확인 단계부터 시작해요.'); };

  /* ---------- 나눔 심사 (6단계 · 이해충돌) ---------- */
  function nominate() {
    var STP = G.NM_ST || ['추천 접수', '기관 확인', '위원회 심사', '지원 계획', '전달', '점검·종결'], l = T().nominations;
    var cnt = STP.map(function (s0) { return [s0, l.filter(function (n) { return n.st === s0; }).length]; });
    return A({ title: '추천·심사', heading: '나눔 추천 · 기관 확인 · 위원회 심사', sub: '추천은 누구나, 확인은 협약 기관, 결정은 외부 위원이 과반인 위원회, 전달은 기관이 해요. 더가넷은 가명 번호와 지원 기록만 가져요.', html:
      kpis(cnt.concat([['보류', l.filter(function (n) { return n.st === '보류'; }).length]]).map(function (c) { return [c[0], c[1]]; }), 'k7') +
      card('접수함', tbl(['접수', '구분', '상황', '급한 정도', '연결', '내용', '이해충돌', '단계'], l.map(function (n) { return '<tr><td>' + n.at + '<small class="blk">' + n.id + '</small></td><td>' + esc(n.kind) + '</td><td>' + esc(n.target) + '</td><td>' + esc(n.urgent || '-') + '</td><td>' + esc((byId(T().orgs, n.org) || byId(T().corps, n.corp) || {}).name || '-') + '</td><td>' + esc(n.text) + '</td><td><label class="chk"><input type="checkbox" data-on="change:nmCoi" data-id="' + n.id + '"' + (n.coiOk ? ' checked' : '') + '> 확인</label></td><td>' + sel('nm-' + n.id, STP.concat(['보류']), n.st, ' data-on="change:nmSt" data-id="' + n.id + '" aria-label="단계"') + '</td></tr>'; }), '아직 추천·신청이 없어요.')) +
      card('심사 원칙', '<ul class="ul"><li>위원회: 외부 위원 과반(사회복지사·협약 기관·회원 대표), 더가넷 직원 1명 이하. 추천자와 관계가 있는 위원은 빠지고 \'이해충돌 확인\'에 체크해요.</li><li>추천 보상 없음 · 중복 지원 확인 · 양도·판매 금지 동의 · 익명 제보 창구 · 6개월마다 다시 확인.</li><li>생명·안전이 급하면 심사를 기다리지 않고 119·129·주민센터로 바로 연결해요.</li></ul>') });
  }
  G.INP.nmCoi = function (el) { var n = byId(T().nominations, el.dataset.id); n.coiOk = el.checked; G.log('나눔 심사 이해충돌 확인: ' + n.id); G.save(); };
  G.INP.nmSt = function (el) {
    var n = byId(T().nominations, el.dataset.id), STP = G.NM_ST || [];
    if (el.value === '위원회 심사' || STP.indexOf(el.value) > STP.indexOf('위원회 심사')) { if (!n.coiOk) { el.value = n.st; return G.toast('위원회 심사 전에 이해충돌 확인에 체크해 주세요.'); } }
    n.st = el.value; if (n.by && n.by !== 'org') G.notify(n.by, '[더가넷] 보내 주신 나눔 추천·신청(' + n.id + ') 단계: ' + n.st); G.log('나눔 추천 ' + n.id + ' → ' + n.st); done('단계를 바꿨어요.');
  };

  /* ---------- 공동 캠페인 (관리자) ---------- */
  function campaigns() {
    var l = T().campaigns;
    return A({ title: '공동 캠페인', heading: '공동 캠페인', sub: '더가넷·검증 기관·회원이 함께 채우는 캠페인이에요. 모금은 기관 계좌로, 물건은 거점으로, 손길은 품온으로 모여요.', html:
      card('진행 중', tbl(['캠페인', '기관', '>진행', '참여 방식', '마감'], l.map(function (c) { var by = {}; Object.keys(c.joined).forEach(function (u) { by[c.joined[u]] = (by[c.joined[u]] || 0) + 1; }); return '<tr><td><b>' + esc(c.title) + '</b><small class="blk">' + esc(c.garnet) + '</small></td><td>' + esc((byId(T().orgs, c.org) || {}).name || '') + '</td><td class="r">' + (c.base + Object.keys(c.joined).length) + ' / ' + c.goal + c.unit + '</td><td>' + Object.keys(by).map(function (k) { return '<span class="tag">' + k + ' ' + by[k] + '</span>'; }).join('') + '</td><td>' + c.until + '</td></tr>'; }))) +
      card('캠페인 만들기', '<form class="form" data-sub="cpAdd" novalidate><div class="fgrid">' + fg('ca-t', '제목', '<input id="ca-t">', 'full') + fg('ca-o', '함께하는 기관', sel('ca-o', T().orgs.map(function (o) { return [o.id, o.name]; }), '')) + fg('ca-p', '연결 사업 (모금)', sel('ca-p', T().projects.map(function (p) { return [p.id, p.title]; }), '')) + fg('ca-g', '목표', '<input id="ca-g" type="number" value="100">') + fg('ca-u', '단위', '<input id="ca-u" value="개">') + fg('ca-d', '마감일', '<input id="ca-d" type="date">') + fg('ca-x', '더가넷이 더하는 것', '<input id="ca-x" placeholder="예: 물품 30개와 정리 손길 3가구">', 'full') + '</div><button class="btn btn-fill btn-sm" type="submit">만들기</button></form>') });
  }
  G.SUB.cpAdd = function () { var t = val('ca-t'); if (!t) return G.toast('제목을 적어 주세요.'); T().campaigns.unshift({ id: 'CA' + (T().campaigns.length + 1), title: t, org: val('ca-o'), proj: val('ca-p'), until: val('ca-d') || G.addDays(SITE.today, 30), goal: +val('ca-g') || 100, unit: val('ca-u') || '개', ways: ['후원', '물건 맡기기', '손길 보태기'], joined: {}, base: 0, garnet: val('ca-x') || '더가넷이 함께해요' }); G.log('공동 캠페인 생성: ' + t); done('캠페인을 만들었어요.'); };

  /* ---------- 안심 관리: 수신자 없음 · 2주 무활동 · 안부 이웃 ---------- */
  function safetyMore(h) {
    var t = T(), br = myBranch(), mem = MEMBERS.filter(function (m) { return !br || G.memInfo(m.id).branch === br; });
    var noRecv = mem.filter(function (m) { var fm = t.family[m.id]; return !(fm && fm.consent && (fm.receivers || []).length); });
    var idle = mem.filter(function (m) { var la = (t.lastActive || {})[m.id]; return la && G.dayDiff(la, SITE.today) >= 14; });
    h += card('안심 수신자 없음 → 안심 매니저가 받는 회원', tbl(['회원', '동네', '마지막 활동', '안심콜'], noRecv.map(function (m) { var fm = t.family[m.id] || {}; return '<tr><td><a href="#admin-member-' + m.id + '">' + esc(m.name) + '</a></td><td>' + esc(((G.branch(G.memInfo(m.id).branch) || {}).name || '-').replace(' (예시)', '')) + '</td><td>' + esc((t.lastActive || {})[m.id] || '-') + '</td><td>' + (fm.alone ? esc(fm.cycle || '주 1회') + (fm.lastCall ? ' · 최근 ' + fm.lastCall : '') : '-') + '</td></tr>'; })) + '<p class="small">이 회원들의 알림은 동네 가맹점 매니저(없으면 본사 운영자)가 함께 받아요.</p>');
    h += card('2주 넘게 활동·연락 없음', idle.length ? '<ul class="mng">' + idle.map(function (m) { return '<li><div><b>' + esc(m.name) + '</b><small>마지막 활동 ' + esc(t.lastActive[m.id]) + ' · ' + G.dayDiff(t.lastActive[m.id], SITE.today) + '일 전</small></div><button class="btn btn-line btn-sm" data-act="safeCall" data-id="' + m.id + '" data-k="idle">안부 전화 완료</button></li>'; }).join('') + '</ul>' : '<p class="small">해당 회원이 없어요.</p>');
    if (f('neighborCare')) {
      var helpers = MEMBERS.filter(function (m) { var b = G.badgesOf(m.id); return b.indexOf('가넷 품') >= 0 || b.indexOf('따뜻한 품') >= 0; });
      h += card('안부 이웃 (2차)', tbl(['신청', '회원', '동네', '연결'], (t.neighborApply || []).filter(function (a) { return a.st === '신청' && (!br || a.branch === br); }).map(function (a) { return '<tr><td>' + a.at + '</td><td>' + esc(nm(a.senior)) + '</td><td>' + esc(((G.branch(a.branch) || {}).name || '-').replace(' (예시)', '')) + '</td><td><form class="inl" data-sub="nbcLink" data-id="' + a.id + '">' + sel('nl-' + a.id, helpers.map(function (m) { return [m.id, m.name + ' · ' + G.badgesOf(m.id).filter(function (x) { return /품/.test(x); }).slice(-1)[0]]; }), '', ' aria-label="이웃"') + sel('nc-' + a.id, ['주 1회 전화', '2주 1회 방문', '월 1회 방문'], '', ' aria-label="주기"') + '<button class="btn btn-fill btn-sm" type="submit">연결</button></form></td></tr>'; }), '새 신청이 없어요.') +
        tbl(['안부 이웃', '회원', '주기', '최근', ''], (t.neighbors || []).map(function (n) { return '<tr><td>' + esc(nm(n.helper)) + '</td><td>' + esc(nm(n.senior)) + '</td><td>' + esc(n.cycle) + '</td><td>' + esc(n.last) + '</td><td><button class="btn btn-ghost btn-sm" data-act="nbcLog" data-id="' + n.id + '">안부 기록</button></td></tr>'; }), '연결된 안부 이웃이 없어요.') + '<p class="small">\'따뜻한 품\'·\'가넷 품\' 배지를 가진 검증된 이웃만 연결하고, 첫 만남에는 매니저가 함께해요.</p>');
    }
    return h;
  }
  var oSafe = G.ACT.safeCall;
  G.ACT.safeCall = function (el) { if (el.dataset.k === 'idle') { T().lastActive[el.dataset.id] = SITE.today; T().safeCalls.unshift({ at: G.now(), who: nm(el.dataset.id), what: '2주 무활동 안부 전화', by: me().loginId }); G.log('안부 전화: ' + el.dataset.id); return done('안부 전화를 기록했어요.'); } oSafe(el); };
  G.SUB.nbcLink = function (fm) { var a = byId(T().neighborApply, fm.dataset.id), hlp = val('nl-' + a.id); if (!hlp) return G.toast('이웃을 골라 주세요.'); a.st = '연결'; T().neighbors.unshift({ id: 'NB' + (T().neighbors.length + 2), helper: hlp, senior: a.senior, branch: a.branch, cycle: val('nc-' + a.id), since: SITE.today, last: '-', st: '연결됨' }); G.notify(a.senior, '[더가넷] 안부 이웃 ' + nm(hlp) + '님과 연결됐어요. 첫 만남에는 매니저가 함께해요.'); G.log('안부 이웃 연결: ' + a.senior + ' ← ' + hlp); done('연결했어요.'); };
  G.ACT.nbcLog = function (el) { var n = byId(T().neighbors, el.dataset.id); n.last = SITE.today; G.log('안부 이웃 기록: ' + n.id); done('안부를 기록했어요.'); };

  /* ================= 마이 라이프 프로필: 사이즈 + 특별한 날 정보 + 사는 곳 ================= */
  var HOURS = [['', '선택 안 함'], ['모름', '모름'], ['자시', '자시 (23:30~01:29)'], ['축시', '축시 (01:30~03:29)'], ['인시', '인시 (03:30~05:29)'], ['묘시', '묘시 (05:30~07:29)'], ['진시', '진시 (07:30~09:29)'], ['사시', '사시 (09:30~11:29)'], ['오시', '오시 (11:30~13:29)'], ['미시', '미시 (13:30~15:29)'], ['신시', '신시 (15:30~17:29)'], ['유시', '유시 (17:30~19:29)'], ['술시', '술시 (19:30~21:29)'], ['해시', '해시 (21:30~23:29)']];
  var STONE_TONE = ['딥 레드·버건디', '퍼플·라벤더', '아쿠아·민트', '화이트·클리어', '그린·올리브', '아이보리·펄', '레드·코랄', '라임·연두', '네이비·블루', '오팔 파스텔', '골드·옐로', '터키 블루'];
  var HOUR_DIR = { 자시: '북쪽', 축시: '북북동', 인시: '동북동', 묘시: '동쪽', 진시: '동남동', 사시: '남남동', 오시: '남쪽', 미시: '남남서', 신시: '서남서', 유시: '서쪽', 술시: '서북서', 해시: '북북서' };
  G.birthText = function (pf) {
    pf = pf || S.profile || {}; if (!pf.bm || !pf.bd) return '';
    return (pf.by ? pf.by + '년 ' : '') + pf.bm + '월 ' + pf.bd + '일 (' + (pf.cal || '양력') + ')' + (pf.bh && pf.bh !== '' ? ' · 태어난 시 ' + pf.bh : '');
  };
  function symHtml(pf) {
    var m = +pf.bm, d = +pf.bd; if (!m || !d) return '<p class="small">생일 월·일을 넣으면 탄생 상징과 공간 제안이 나와요.</p>';
    var lunar = pf.cal === '음력', unk = pf.cal === '모름';
    var dir = HOUR_DIR[pf.bh];
    return '<ul class="sym-l"><li><span>탄생석</span><b>' + STONES[m - 1] + '</b></li><li><span>탄생화</span><b>' + FLOWERS[m - 1] + '</b></li><li><span>탄생목</span><b>' + TREES[m - 1] + '</b></li><li><span>별자리</span><b>' + zodiac(m, d) + '</b></li></ul>' +
      (lunar ? '<p class="small">' + ico('info', 14) + ' 음력 생일이에요. 탄생 상징은 양력 날짜 기준이라, 연도를 넣어 주시면 상담 때 양력으로 바꿔 정확히 맞춰 드려요. 지금은 입력한 날짜 기준 참고값이에요.</p>' : unk ? '<p class="small">' + ico('info', 14) + ' 양력·음력을 모르셔도 괜찮아요. 입력한 날짜를 양력으로 보고 참고값을 보여 드려요.</p>' : '') +
      '<div class="sp-sug"><h4>' + ico('home', 16) + ' 공간 배치·소품 제안 (참고)</h4><ul class="ul"><li>포인트 색: <b>' + STONE_TONE[m - 1] + '</b> (탄생석 ' + STONES[m - 1] + ' 톤) — 쿠션·커튼·디퓨저 병에 적용</li><li>꽃·식물: <b>' + FLOWERS[m - 1] + '</b> 중심 구성, 탄생목 <b>' + TREES[m - 1] + '</b> 소재의 소품·액자</li>' +
      (dir ? '<li>태어난 시(' + esc(pf.bh) + ') 기준 포인트 소품 방향: <b>' + dir + '</b> 벽·창가</li>' : pf.bh === '모름' ? '<li>태어난 시를 몰라도 색·꽃 제안은 그대로 쓸 수 있어요.</li>' : '') + '</ul><p class="small">사주·풍수·탄생 상징은 참고 정보이고 결과를 보장하지 않아요. 인테리어·소품 공급 때 고객이 원하는 경우에만 반영해요.</p></div>';
  }
  G.myPages.profile = function () {
    var pf = S.profile || (S.profile = {}), t = G.sizeText ? G.sizeText() : '';
    var yrs = [['', '선택 안 함']]; for (var y = 2008; y >= 1925; y--) yrs.push([String(y), y + '년']);
    var form = '<form class="card form" data-sub="profile2" novalidate>' +
      '<h3 class="pf-h">' + ico('user', 18) + ' 선물·맞춤 사이즈</h3><p class="small mb">\'특별한 날\'과 주얼리·꽃·리폼·침구 신청서에서 <b>함께 보내기</b>를 체크할 때만 전달돼요.</p><div class="fgrid">' +
      fg('p-c', '의류 사이즈', sel('p-c', [['', '선택하지 않음']].concat(['SS', 'S', 'M', 'L', 'XL', 'XXL']), pf.clothes || '')) +
      fg('p-s', '신발 사이즈 (mm)', sel('p-s', [['', '선택하지 않음']].concat(Array.apply(null, Array(21)).map(function (_, i) { return String(200 + i * 5); })), pf.shoe || '')) +
      fg('p-r', '반지 호수', '<input id="p-r" value="' + esc(pf.ring || '') + '" placeholder="예: 12호">') +
      fg('p-col', '선호 색상', sel('p-col', [['', '선택 안 함']].concat(['아이보리', '가넷', '그린', '파스텔', '블랙']), pf.color || '')) + '</div>' +
      '<h3 class="pf-h mt">' + ico('gift', 18) + ' 특별한 날 정보 <em class="opt">선택</em></h3><p class="small mb">탄생 상징 선물, 탄생일을 반영한 공간 배치, 인테리어·소품 제안에 써요. 입력하지 않아도 모든 서비스를 이용할 수 있어요.</p><div class="fgrid">' +
      fg('p-bm', '생일 월', sel('p-bm', [['', '선택']].concat(Array.apply(null, Array(12)).map(function (_, i) { return [String(i + 1), (i + 1) + '월']; })), pf.bm || '', ' data-on="change:pfPrev"')) +
      fg('p-bd', '생일 일', sel('p-bd', [['', '선택']].concat(Array.apply(null, Array(31)).map(function (_, i) { return [String(i + 1), (i + 1) + '일']; })), pf.bd || '', ' data-on="change:pfPrev"')) +
      fg('p-by', '태어난 해 <em class="opt">선택</em>', sel('p-by', yrs, pf.by || '')) +
      '<div class="fg"><span class="lb">양력·음력</span><div class="pills">' + ['양력', '음력', '모름'].map(function (c) { return '<label class="pill"><input type="radio" name="p-cal" value="' + c + '"' + ((pf.cal || '양력') === c ? ' checked' : '') + ' data-on="change:pfPrev"><span>' + c + '</span></label>'; }).join('') + '</div></div>' +
      fg('p-bh', '태어난 시 <em class="opt">선택</em>', sel('p-bh', HOURS, pf.bh || '', ' data-on="change:pfPrev"')) +
      fg('p-m', '기념일 메모', '<textarea id="p-m" rows="2" placeholder="가족·지인의 실명이나 상세 정보는 적지 마세요.">' + esc(pf.memo || '') + '</textarea>', 'full') + '</div>' +
      '<label class="chk"><input type="checkbox" id="p-bok"' + (pf.birthOk ? ' checked' : '') + '><span><b>[선택 동의]</b> 생일·태어난 시를 탄생 상징 선물과 공간 배치·소품 제안에만 쓰고, 신청서에서 <b>함께 보내기</b>를 체크한 신청에만 전달하는 데 동의해요. 언제든 지울 수 있어요.</span></label>' +
      '<p class="err" id="p-e" hidden></p><div class="fa"><button class="btn btn-fill" type="submit">저장하기</button>' + (pf.bm ? '<button class="btn btn-ghost" type="button" data-act="pfBirthDel">특별한 날 정보 지우기</button>' : '') + '</div></form>';
    var side = '<aside class="pf-side"><div class="card"><h3>' + ico('gem', 18) + ' 나의 탄생 상징</h3><div id="pf-prev">' + symHtml(pf) + '</div></div>' +
      '<div class="card"><h3>' + ico('heart', 18) + ' 바로 쓰기</h3><ul class="pf-links"><li><a class="lnk" href="#special">특별한 날 · 선물 고르기 ' + ico('arrow-right', 16) + '</a></li><li><a class="lnk" href="#svc-S13">탄생상징 주얼리 ' + ico('arrow-right', 16) + '</a></li><li><a class="lnk" href="#svc-S05">꽃·디퓨저·인테리어 ' + ico('arrow-right', 16) + '</a></li><li><a class="lnk" href="#svc-S09">침구·홈패션 ' + ico('arrow-right', 16) + '</a></li></ul><p class="small">저장한 사이즈: ' + esc(t || '없음') + '</p></div></aside>';
    return G.myShell('profile', '마이 라이프 프로필', '<div class="pf-grid">' + form + side + '</div>', '사이즈와 특별한 날 정보는 선택이에요. 체크한 신청에만 전달하고, 다른 곳에는 쓰지 않아요.');
  };
  function readPf() { var c = document.querySelector('[name=p-cal]:checked'); return { bm: val('p-bm'), bd: val('p-bd'), by: val('p-by'), cal: c ? c.value : '양력', bh: val('p-bh') }; }
  G.INP.pfPrev = function () { var x = readPf(), o = $('pf-prev'); if (o) o.innerHTML = symHtml(x); };
  G.SUB.profile2 = function () {
    var x = readPf(), e = $('p-e');
    if ((x.bm && !x.bd) || (!x.bm && x.bd)) { e.textContent = '생일은 월과 일을 함께 골라 주세요.'; e.hidden = false; return; }
    if (x.bm && new Date(2024, +x.bm - 1, +x.bd).getMonth() !== +x.bm - 1) { e.textContent = '존재하지 않는 날짜예요.'; e.hidden = false; return; }
    if (x.bm && !$('p-bok').checked) { e.textContent = '특별한 날 정보를 저장하려면 선택 동의에 체크해 주세요. 원하지 않으면 생일 칸을 비워 두세요.'; e.hidden = false; return; }
    var pf = S.profile || (S.profile = {});
    pf.clothes = val('p-c'); pf.shoe = val('p-s'); pf.ring = val('p-r'); pf.color = val('p-col'); pf.memo = val('p-m');
    pf.bm = x.bm; pf.bd = x.bd; pf.by = x.bm ? x.by : ''; pf.cal = x.cal; pf.bh = x.bm ? x.bh : ''; pf.birthOk = !!x.bm && $('p-bok').checked;
    done('프로필을 저장했어요.');
  };
  G.SUB.profile = G.SUB.profile2;
  G.ACT.pfBirthDel = function () { var pf = S.profile; ['bm', 'bd', 'by', 'bh'].forEach(function (k) { pf[k] = ''; }); pf.cal = '양력'; pf.birthOk = false; done('특별한 날 정보를 지웠어요.'); };

  /* 특별한 날: 프로필 생일로 채우기 */
  var oSpecial = P.special;
  P.special = function () {
    var o = oSpecial(), pf = S.profile || {};
    if (S.user && pf.bm && pf.bd && pf.birthOk) {
      o.html = o.html.replace('연도와 시간은 필요하지 않고, 어디에도 저장하지 않습니다.', '마이 라이프 프로필의 생일(' + esc(G.birthText(pf)) + ')로 채웠어요. 다른 날짜로 바꿔 봐도 저장되지 않아요.');
      var m0 = o.mount; o.mount = function () { if (m0) m0(); var bm = $('bm'), bd = $('bd'); if (bm && bd) { bm.value = pf.bm; bd.value = pf.bd; G.INP.sym(); } };
    }
    o.html = o.html.replace('<a class="btn btn-line btn-sm" href="#my-profile">사이즈 고치기</a>', '<a class="btn btn-line btn-sm" href="#my-profile">사이즈·생일 고치기</a>').replace('<a class="btn btn-fill btn-sm" href="#my-profile">사이즈 입력하기</a>', '<a class="btn btn-fill btn-sm" href="#my-profile">사이즈·생일 입력하기</a>');
    if (S.user && pf.bm && pf.birthOk) o.html = o.html.replace('<p class="small mt">선물 받는 분 사이즈는', '<p class="small">특별한 날: ' + esc(G.birthText(pf)) + '</p><p class="small mt">선물 받는 분 사이즈는');
    return o;
  };

  /* 신청서: 특별한 날 정보 함께 보내기 · 주소(시·군·구) 미리 채우기 */
  var BIRTH_SVC = ['S13', 'S05', 'S09'];
  var oApply2 = P.apply;
  P.apply = function (id) {
    if (id && S.user && S.profile && S.profile.region) {
      var sv = G.sv(id); if (sv) { var d = S.drafts[id] || (S.drafts[id] = { v: {}, step: 0, c: { phone: '', time: '', budget: '', note: '', agree: false, share: false } }); sv.wf.fields.forEach(function (x) { if (x[1] === 'address' && !d.v[x[0]]) d.v[x[0]] = S.profile.region; }); }
    }
    var o = oApply2(id), pf = S.profile || {};
    if (id && o.html && S.user && BIRTH_SVC.indexOf(id) >= 0 && S.drafts[id] && S.drafts[id].step === 1 && pf.bm && pf.birthOk) {
      var c0 = S.drafts[id].c;
      o.html = ins(o.html, '<div class="fg"><label class="lb" for="c-budget">', '<div class="fg full sz-box"><label class="chk"><input type="checkbox" data-on="change:birthShare" data-id="' + id + '"' + (c0.birthShare ? ' checked' : '') + '><span>내 특별한 날 정보를 이 신청에 함께 보내요 <b>(' + esc(G.birthText(pf)) + ')</b> — ' + (id === 'S13' ? '탄생 상징·상담에 반영' : '탄생일을 반영한 공간 배치·소품 제안에 반영') + '</span></label></div>');
    }
    if (id === 'S13' && o.html && S.user && pf.bm && pf.birthOk && S.drafts[id] && S.drafts[id].step === 0) o.html = ins(o.html, '<div class="fgrid">', '<p class="small pf-fill">' + ico('gift', 14) + ' 프로필에 저장한 특별한 날 정보가 있어요. 두 번째 단계에서 <b>함께 보내기</b>를 체크하면 출생정보 칸을 비워 둬도 돼요.</p>');
    return o;
  };
  G.INP.birthShare = function (el) { var d = S.drafts[el.dataset.id]; if (d) { d.c.birthShare = el.checked; G.save(); } };
  var oSub2 = G.ACT.asubmit;
  G.ACT.asubmit = function (el) {
    var id = el.dataset.id, d = S.drafts[id], share = d && d.c.birthShare, before = S.apps.length;
    oSub2(el);
    if (S.apps.length > before && share && S.profile && S.profile.birthOk) { S.apps[0].data['특별한 날 정보 (프로필)'] = G.birthText(); G.save(); }
  };

  /* 내 정보: 사는 곳 (시·군·구) · 우리 동네 */
  var oMy2 = P.my;
  P.my = function (arg) {
    var o = oMy2(arg);
    if ((arg === 'info') && S.user && o.html) {
      var pf = S.profile || {}, br = G.memInfo(uid()).branch;
      var add = fg('i-rg', '사는 곳 (시·군·구) <em class="opt">선택</em>', '<input id="i-rg" value="' + esc(pf.region || '') + '" placeholder="예: 서울 마포구"><p class="hint-s">신청서 주소 칸에 미리 채워 드려요. 도로명·동·호수 같은 상세 주소는 계정에 저장하지 않고, 서비스를 승인한 뒤 그 신청에만 받아요.</p>') +
        (f('branches') ? fg('i-br', '우리 동네 (가까운 가맹점)', sel('i-br', [['', '선택 안 함']].concat(T().branches.map(function (b) { return [b.id, b.name + ' (' + b.area.join('·') + ')']; })), br || '')) : '');
      o.html = o.html.replace('inputmode="tel"></div></div><label class="chk">', 'inputmode="tel"></div>' + add + '</div><label class="chk">');
    }
    return o;
  };
  var oInfo = G.SUB.info;
  G.SUB.info = function (fm) { var pf = S.profile || (S.profile = {}); if ($('i-rg')) pf.region = val('i-rg').replace(/\s*\d.*$/, ''); if ($('i-br')) G.memInfo(uid()).branch = val('i-br'); oInfo(fm); };
})();
