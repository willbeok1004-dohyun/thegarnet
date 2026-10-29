/* 관리자 운영 기능 확장 — 스프링부트 관리자 콘솔(lifestyle-solution)의 기능을 이식
   견적 이력·다중 일정·업체 배정 상태·내부 메모/고객 안내/완료 보고, 회원 상세, 협력업체 등록·수정,
   공지·FAQ 편집, 문의 필터·답변 수정, 서비스 소개 편집, 기간 통계, 관리자 계정·권한, 로그인 잠금, 감사 로그 구분 */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES;
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var A = function (o) { o.layout = 'admin'; return o; };
  var card = function (t, body, extra) { return '<section class="ac ' + (extra || '') + '">' + (t ? '<h2>' + t + '</h2>' : '') + body + '</section>'; };
  var byId = function (arr, id) { return arr.filter(function (x) { return String(x.id) === String(id); })[0]; };
  var $ = function (id) { return document.getElementById(id); };
  var val = function (id) { var e = $(id); return e ? String(e.value || '') : ''; };
  var chk = function (id) { var e = $(id); return !!(e && e.checked); };
  var bd = function (m, k) { var x = m[k] || [k, 'mute']; return '<span class="bd bd-' + x[1] + '">' + esc(x[0]) + '</span>'; };
  var allMembers = function () { var l = MEMBERS.slice(); if (S.joined && !byId(l, S.joined.id)) l.push({ id: S.joined.id, name: S.joined.name, email: S.joined.email || '-', phone: S.joined.phone || '-', joined: SITE.today, status: '활성', role: '회원' }); return l; };
  var uname = function (id) { var m = byId(allMembers(), id); return m ? m.name : '방문자'; };
  var pname = function (id) { var p = byId(PARTNERS, id); return p ? p.name : id; };

  var MST = { ACTIVE: ['활성', 'ok'], DORMANT: ['휴면', 'mute'], SUSPENDED: ['이용 정지', 'bad'], WITHDRAWN: ['탈퇴', 'mute'] };
  var ROLE = { ADMIN: '최고관리자', MANAGER: '운영담당' };
  var ASG = { ASSIGNED: ['배정', 'info'], CONFIRMED: ['업체 확정', 'ok'], DONE: ['수행 완료', 'dark'], CANCELLED: ['배정 취소', 'mute'] };
  var SCH = { PLANNED: ['예정', 'info'], DONE: ['완료', 'dark'], CANCELLED: ['취소', 'mute'] };
  var KIND = { LOGIN: ['로그인', 'info'], VIEW: ['열람', 'mute'], CHANGE: ['변경', 'warn'] };
  var NEED_REASON = ['NEED_INFO', 'REJECTED', 'CANCELLED', 'REFUNDING', 'REFUNDED', 'APPROVED'];
  var QUOTABLE = ['REVIEWING', 'QUOTED', 'WAITING_APPROVAL'];
  var SVC_FIELDS = ['name', 'headline', 'summary', 'lead', 'points', 'standard'];
  var PEXTRA = {
    P1: { type: '식품 공급업체', phone: '02-000-0101', qual: '식품 통신판매업 신고, 원산지 표시 점검', verified: '2026-09-08', ins: true },
    P2: { type: '식물 관리 업체', phone: '02-000-0102', qual: '사업자 등록, 방문 작업자 신원 확인', verified: '2026-09-10', ins: true },
    P3: { type: '리폼 공방', phone: '031-000-0103', qual: '사업자 등록 서류 접수, 작업 보험 확인 중', verified: '', ins: false },
    P4: { type: '동행 전문인력 기관', phone: '02-000-0104', qual: '요양보호사·동행 인력 자격 확인, 배상책임보험', verified: '2026-08-20', ins: true },
    P5: { type: '이사·묘지관리 업체', phone: '041-000-0105', qual: '화물자동차 운송사업 허가 서류 접수', verified: '', ins: false },
    P6: { type: '펫시터 업체', phone: '032-000-0106', qual: '동물위탁관리업 등록, 배상책임보험', verified: '2026-09-12', ins: true }
  };

  /* ---------- 원본 보관과 상태 준비 ---------- */
  var ORIG = {
    partners: clone(PARTNERS), members: clone(MEMBERS),
    sv: SV.map(function (s) { var o = {}; SVC_FIELDS.forEach(function (k) { o[k] = clone(s[k] == null ? '' : s[k]); }); return o; })
  };

  function ensure() {
    if (!S.ops) S.ops = {};
    var o = S.ops;
    if (!o.admins) o.admins = [
      { id: 's1', loginId: 'admin', name: '더가넷 운영자', role: 'ADMIN', active: true, pw: 'Admin!2345', fails: 0, locked: false, at: '2026-09-01' },
      { id: 's2', loginId: 'manager', name: '운영 담당 (예시)', role: 'MANAGER', active: true, pw: 'Manager!2345', fails: 0, locked: false, at: '2026-10-01' }
    ];
    if (!o.who) o.who = 's1';
    if (!o.mem) { o.mem = {}; ORIG.members.forEach(function (m) { o.mem[m.id] = { status: 'ACTIVE', locked: m.status.indexOf('잠김') === 0, mkt: m.id === 'u1' || m.id === 'u3' }; }); }
    if (S.joined && !o.mem[S.joined.id]) o.mem[S.joined.id] = { status: 'ACTIVE', locked: false, mkt: false };
    Object.keys(o.mem).forEach(function (k) { if (S['unl' + k]) { o.mem[k].locked = false; delete S['unl' + k]; } });
    if (!o.partners) o.partners = ORIG.partners.map(function (p) { var x = clone(p), e = PEXTRA[p.id] || {}; x.type = e.type || ''; x.phone = e.phone || ''; x.qual = e.qual || ''; x.verified = e.verified || ''; x.ins = !!e.ins; x.active = true; return x; });
    if (!o.svc) o.svc = {};
    S.notices.forEach(function (n) { if (n.views == null) n.views = [0, 41, 27, 18, 9][n.id] || 0; if (n.hidden == null) n.hidden = false; });
    S.faqs.forEach(function (f, i) { if (f.order == null) f.order = (i + 1) * 10; });
    S.inquiries.forEach(function (q) { if (q.answer && !q.ansBy) { q.ansBy = 'admin'; q.ansAt = q.at + ' 15:00'; } });
  }
  function apply() {
    var o = S.ops;
    PARTNERS.length = 0; o.partners.forEach(function (p) { PARTNERS.push(p); });
    MEMBERS.forEach(function (m) { var x = o.mem[m.id]; if (!x) return; m.status = x.locked ? '잠김(로그인 5회 실패)' : MST[x.status][0]; });
    SV.forEach(function (s, i) { var e = o.svc[s.id] || {}, b = ORIG.sv[i]; SVC_FIELDS.forEach(function (k) { s[k] = clone(e[k] != null ? e[k] : b[k]); }); });
  }
  /* 신청 데이터에 견적 이력·일정·배정·메모 필드를 붙이고, 다른 화면에서 바뀐 값과 맞춰요 */
  function sync(a) {
    var lastHist = function (st) { var h = a.hist.filter(function (x) { return x[0] === st; }); return h.length ? h[h.length - 1][1] : a.at; };
    if (!a.quotes) a.quotes = [];
    if (a.quote && (!a.quotes.length || JSON.stringify(a.quotes[a.quotes.length - 1].items) !== JSON.stringify(a.quote.items))) a.quotes.push({ at: a.quotes.length ? G.now() : lastHist('QUOTED'), items: clone(a.quote.items), total: a.quote.total, memo: a.quote.memo || '', by: '운영자' });
    if (a.partner && a.share == null) a.share = true;
    if (!a.assigns) a.assigns = [];
    if (a.partner && !a.assigns.some(function (x) { return x.partner === a.partner && x.st !== 'CANCELLED'; })) a.assigns.push({ id: a.assigns.length + 1, partner: a.partner, note: '', st: a.status === 'COMPLETED' ? 'DONE' : 'CONFIRMED', at: lastHist('APPROVED') });
    if (!a.scheds) a.scheds = [];
    if (a.schedule && !a.scheds.some(function (x) { return x.start === a.schedule; })) a.scheds.push({ id: a.scheds.length + 1, start: a.schedule, end: '', place: a.region ? a.region + ' (고객 지정 장소)' : '', who: a.partner ? pname(a.partner) : '더가넷 담당', st: a.status === 'COMPLETED' ? 'DONE' : 'PLANNED' });
    if (a.memo == null) a.memo = '';
    if (a.msg == null) a.msg = '';
    if (a.report == null) { var h = a.hist[a.hist.length - 1]; a.report = a.status === 'COMPLETED' ? ((h && h[3]) || '서비스를 마쳤습니다.') : ''; }
  }
  function syncSchedule(a) {
    var pl = a.scheds.filter(function (x) { return x.st === 'PLANNED'; }).sort(function (x, y) { return x.start > y.start ? 1 : -1; });
    var dn = a.scheds.filter(function (x) { return x.st === 'DONE'; });
    a.schedule = pl.length ? pl[0].start : dn.length ? dn[dn.length - 1].start : null;
  }
  function syncPartner(a) { var act = a.assigns.filter(function (x) { return x.st !== 'CANCELLED'; }); a.partner = act.length ? act[act.length - 1].partner : null; }
  function boot() { ensure(); apply(); S.apps.forEach(sync); }
  boot();
  var origReset = G.reset;
  G.reset = function () { origReset(); boot(); G.save(); };

  /* ---------- 현재 관리자, 로그 ---------- */
  var me = G.adminMe = function () { return byId(S.ops.admins, S.ops.who) || S.ops.admins[0]; };
  var isAdmin = function () { return me().role === 'ADMIN'; };
  G.log = function (what, kind) {
    S.audit.unshift({ at: G.now(), who: S.adminAuthed ? me().loginId : (S.user ? S.user.name : '방문자'), what: what, kind: kind || 'CHANGE' });
    S.audit = S.audit.slice(0, 200);
  };

  /* ---------- 로그인 (계정별 · 5회 실패 시 잠금) ---------- */
  G.SUB.adminLogin = function () {
    var id = val('a-id').trim(), pw = val('a-pw'), e = $('a-e');
    var fail = function (m) { e.textContent = m; e.hidden = false; };
    var acc = S.ops.admins.filter(function (x) { return x.loginId === id; })[0];
    if (!acc) return fail('아이디 또는 비밀번호가 맞지 않아요.');
    if (!acc.active) return fail('정지된 계정이에요. 최고관리자에게 문의해 주세요.');
    if (acc.locked) return fail('로그인 5회 실패로 잠긴 계정이에요. 최고관리자가 [계정·권한]에서 잠금을 풀어야 해요. (시연 데이터 초기화로도 풀려요)');
    if (acc.pw !== pw) {
      acc.fails = (acc.fails || 0) + 1;
      if (acc.fails >= 5) { acc.locked = true; S.audit.unshift({ at: G.now(), who: acc.loginId, what: '로그인 5회 실패로 계정 잠금', kind: 'LOGIN' }); }
      G.save(); return fail(acc.locked ? '로그인 5회 실패로 계정을 잠갔어요.' : '아이디 또는 비밀번호가 맞지 않아요. (' + acc.fails + '/5회)');
    }
    acc.fails = 0; S.ops.who = acc.id; S.adminAuthed = true; G.log('관리자 로그인', 'LOGIN'); G.save(); G.go('admin'); G.render(true);
  };

  /* ---------- 관리자 레이아웃: 계정 표시와 역할별 메뉴 ---------- */
  var origLayout = G.adminLayout;
  G.adminLayout = function (out, r) {
    var h = origLayout(out, r), m = me();
    h = h.replace('<span class="adm-user">' + ico('user', 16) + ' 더가넷 운영자</span>', '<span class="adm-user">' + ico('user', 16) + ' ' + esc(m.name) + ' <em class="bd bd-' + (m.role === 'ADMIN' ? 'bad' : 'info') + '">' + ROLE[m.role] + '</em></span>');
    if (!isAdmin()) h = h.replace(/<a href="#admin-(svcs|accounts|audit)"[^>]*>[\s\S]*?<\/a>/g, '');
    h = h.replace(/<p class="adm-h">[^<]*<\/p>(?=<p class="adm-h">|<\/nav>)/g, '');
    return h;
  };

  /* ---------- 라우팅 ---------- */
  var origAdmin = P.admin, lastView = '';
  P.admin = function (arg, r) {
    boot();
    if (arg === 'login' || !S.adminAuthed) {
      var o = origAdmin(arg, r);
      o.html = o.html.replace('<p class="small">시연용 관리자 계정이 미리 입력되어 있어요.</p>', '<p class="small">시연 계정: <b>admin</b> / Admin!2345 (최고관리자) · <b>manager</b> / Manager!2345 (운영담당). 5회 틀리면 계정이 잠겨요.</p>');
      return o;
    }
    var only = ['svcs', 'svc-', 'accounts', 'audit'];
    if (!isAdmin() && only.some(function (g) { return arg === g || (g.slice(-1) === '-' && arg.indexOf(g) === 0); })) return denied();
    viewLog(arg);
    if (arg.indexOf('app-') === 0) return appDetail(arg.slice(4));
    if (arg.indexOf('member-') === 0) return memberDetail(arg.slice(7));
    if (arg.indexOf('partner-') === 0) return partnerForm(arg.slice(8));
    if (arg.indexOf('notice-') === 0) return noticeForm(arg.slice(7));
    if (arg.indexOf('faq-') === 0) return faqForm(arg.slice(4));
    if (arg.indexOf('svc-') === 0) return svcForm(arg.slice(4));
    var own = { members: members, partners: partners, notices: notices, inq: inq, accounts: accounts, audit: audit }[arg];
    if (own) return own();
    if (arg === 'stats') return statsPlus(origAdmin(arg, r));
    if (arg === 'svcs') return svcsPlus(origAdmin(arg, r));
    return origAdmin(arg, r);
  };
  function viewLog(arg) {
    if (arg === lastView) return; lastView = arg;
    if (arg.indexOf('app-') === 0) { G.log(arg.slice(4) + ' 신청 상세 열람', 'VIEW'); G.save(); }
    else if (arg.indexOf('member-') === 0) { G.log(uname(arg.slice(7)) + ' 회원 상세 열람 (개인정보)', 'VIEW'); G.save(); }
  }
  window.addEventListener('hashchange', function () { if (G.parse().name !== 'admin') lastView = ''; });
  function denied() { return A({ title: '권한 없음', heading: '접근 권한이 없어요', sub: '역할: ' + ROLE[me().role], html: card('', '<p>서비스 관리, 계정·권한, 감사 로그는 <b>최고관리자</b>만 볼 수 있어요. 운영담당은 신청·회원·문의·협력업체·공지 업무를 처리해요.</p><p class="fa"><a class="btn btn-line btn-sm" href="#admin">대시보드로</a></p>') }); }

  /* ---------- 대시보드에서 넘어온 필터 ---------- */
  var preset = null;
  G.ACT.aPreset = function (el) { preset = el.dataset.st ? el.dataset.st.split(',') : null; };
  G.ACT.aPresetClear = function () { preset = null; G.INP.aFilter(); };
  G.INP.aFilter = function (el) {
    if (el && el.id === 'ast') preset = null;
    var stEl = $('ast'); if (preset && preset.length === 1 && stEl) { stEl.value = preset[0]; preset = null; }
    var q = val('aq').trim().toLowerCase(), st = stEl ? stEl.value : '', sv = val('asv'), n = 0;
    document.querySelectorAll('#atbl tbody tr').forEach(function (r) {
      var okSt = st ? r.dataset.st === st : (!preset || preset.indexOf(r.dataset.st) >= 0);
      var ok = okSt && (!sv || r.dataset.sv === sv) && (!q || r.dataset.q.indexOf(q) >= 0); r.hidden = !ok; if (ok) n++;
    });
    var c = $('acnt'); if (c) c.innerHTML = n + '건' + (preset && !st ? ' · 대시보드 필터: ' + preset.map(G.stName).join(', ') + ' <button class="btn btn-ghost btn-sm" data-act="aPresetClear">필터 해제</button>' : '');
    var e = $('aemp'); if (e) e.hidden = n > 0;
  };
  var inqTab = 'all';
  G.ACT.iTab = function (el) { inqTab = el.dataset.v; };

  /* ================= 신청 상세 ================= */
  var NLAB = { REVIEWING: '검토 시작', NEED_INFO: '추가 정보 요청', QUOTED: '견적 안내', WAITING_APPROVAL: '고객에게 승인 요청', APPROVED: '관리자 대행 승인', SCHEDULED: '일정 확정', IN_PROGRESS: '진행 시작', COMPLETED: '완료 처리', CANCEL_REQUESTED: '취소 요청 접수', CANCELLED: '취소 처리', REJECTED: '진행 불가 처리', REFUNDING: '환불 처리 시작', REFUNDED: '환불 완료' };
  function quoteApprovedAt(a, i) {
    if (i !== a.quotes.length - 1) return null;
    var q = a.quotes[i], h = a.hist.filter(function (x) { return x[0] === 'APPROVED' && x[1] >= q.at; })[0];
    return h ? h[1] : null;
  }
  function appDetail(no) {
    var a = G.app(no); if (!a) return A({ title: '신청 관리', heading: '신청을 찾을 수 없어요', html: '<a class="lnk" href="#admin-apps">목록으로</a>' });
    sync(a);
    var s = G.sv(a.svc), nxt = APP_NEXT[a.status] || [], canAssign = PARTNER_ASSIGNABLE.indexOf(a.status) >= 0, canQuote = QUOTABLE.indexOf(a.status) >= 0;
    var cands = PARTNERS.filter(function (p) { return p.active !== false && p.svc.indexOf(a.svc) >= 0; }); if (!cands.length) cands = PARTNERS.filter(function (p) { return p.active !== false; });
    var kv = Object.keys(a.data).map(function (k) { return '<div class="kv"><dt>' + esc(k) + '</dt><dd>' + esc(a.data[k]) + '</dd></div>'; }).join('');

    var form = nxt.length ? '<form class="stf" data-sub="aStatus" data-no="' + no + '"><div class="fg"><label class="lb" for="as-to">다음 상태</label><select id="as-to" data-on="change:aTo">' + nxt.map(function (k) { return '<option value="' + k + '">' + NLAB[k] + ' (' + APP_STATUS[k][0] + ')</option>'; }).join('') + '</select></div>' +
      '<div class="fg" id="as-q" hidden><label class="lb" for="as-amt">견적 금액 (원) <small>' + (a.quote ? '비우면 등록된 최근 견적 ' + G.fmt(a.quote.total) + '을 안내해요' : '') + '</small></label><input id="as-amt" type="number" min="0" step="1000" placeholder="예: 190000"><label class="lb" for="as-item">견적 항목명</label><input id="as-item" placeholder="예: 정리수납 기본 (2인·4시간)"></div>' +
      '<div class="fg" id="as-s" hidden><label class="lb" for="as-dt">확정 일시 <small>' + (a.scheds.some(function (x) { return x.st === 'PLANNED'; }) ? '비우면 등록된 일정으로 확정해요' : '') + '</small></label><input id="as-dt" type="datetime-local" min="' + SITE.today + 'T00:00"></div>' +
      '<div class="fg"><label class="lb" for="as-m">사유 · 고객에게 보이는 메모</label><textarea id="as-m" rows="3" placeholder="처리 내용이나 요청 사항을 적어 주세요."></textarea><p class="small">추가 정보 요청·진행 불가·취소·환불·관리자 대행 승인은 사유가 꼭 필요해요. 완료 처리는 완료 보고를 먼저 저장해야 해요.</p></div><p class="err" id="as-e" hidden></p><button class="btn btn-fill btn-block" type="submit">상태 변경하기</button></form>'
      : '<p class="small">이 상태에서는 더 변경할 수 있는 단계가 없어요.</p>';

    var qTbl = a.quotes.length ? '<div class="tw"><table class="tbl"><thead><tr><th>등록</th><th>내역</th><th class="r">금액</th><th>고객 승인</th></tr></thead><tbody>' + a.quotes.map(function (q, i) {
      var ap = quoteApprovedAt(a, i), last = i === a.quotes.length - 1;
      return '<tr' + (last ? '' : ' class="old"') + '><td>' + esc(q.at.slice(5, 16)) + '<small class="blk">' + esc(q.by || '운영자') + '</small></td><td>' + q.items.map(function (it) { return esc(it[0]) + ' <span class="small">' + G.fmt(it[1]) + '</span>'; }).join('<br>') + (q.memo ? '<small class="blk">' + esc(q.memo) + '</small>' : '') + '</td><td class="r">' + G.fmt(q.total) + '</td><td>' + (ap ? '<span class="bd bd-ok">승인 ' + esc(ap.slice(5, 16)) + '</span>' : last ? '<span class="bd bd-mute">미승인</span>' : '<span class="bd bd-mute">이전 견적</span>') + '</td></tr>';
    }).join('') + '</tbody></table></div>' : '<p class="small">등록된 견적이 없어요.</p>';
    var qForm = canQuote ? '<form class="form" data-sub="aQuote" data-no="' + no + '"><h3>견적 ' + (a.quotes.length ? '수정 등록' : '등록') + '</h3><div class="fg"><label class="lb" for="q-items">견적 내역 <small>한 줄에 "항목명 | 금액"</small></label><textarea id="q-items" rows="3" placeholder="정리수납 기본 (2인·4시간) | 160000&#10;수납 용품 (고객 승인 항목) | 30000"></textarea></div><div class="fg"><label class="lb" for="q-memo">고객 안내 문구 <small>선택</small></label><input id="q-memo" placeholder="예: 수납 용품은 승인하신 경우에만 준비합니다."></div><p class="err" id="q-e" hidden></p><button class="btn btn-fill btn-sm" type="submit">견적 등록</button><p class="small">검토 중에 등록하면 상태가 \'견적 안내\'로 바뀌어요. 이후 \'고객에게 승인 요청\'으로 넘기면 고객이 승인할 수 있어요.</p></form>'
      : '<p class="small">견적은 검토 중·견적 안내·고객 승인 대기 상태에서만 등록할 수 있어요.</p>';

    var sTbl = a.scheds.length ? '<div class="tw"><table class="tbl"><thead><tr><th>일시</th><th>장소 요약</th><th>담당</th><th>상태</th></tr></thead><tbody>' + a.scheds.map(function (x) {
      return '<tr><td>' + esc(x.start.slice(5, 16)) + (x.end ? ' ~ ' + esc(x.end.slice(11, 16)) : '') + '</td><td>' + esc(x.place || '-') + '</td><td>' + esc(x.who || '-') + '</td><td><div class="inl"><select id="sch-' + x.id + '" aria-label="일정 상태">' + Object.keys(SCH).map(function (k) { return '<option value="' + k + '"' + (x.st === k ? ' selected' : '') + '>' + SCH[k][0] + '</option>'; }).join('') + '</select><button class="btn btn-line btn-sm" data-act="aSchSt" data-no="' + no + '" data-id="' + x.id + '">저장</button></div></td></tr>';
    }).join('') + '</tbody></table></div>' : '<p class="small">등록된 일정이 없어요.</p>';
    var sForm = canAssign ? '<form class="form" data-sub="aSched" data-no="' + no + '"><h3>일정 등록</h3><div class="fgrid"><div class="fg"><label class="lb" for="sc-s">시작</label><input id="sc-s" type="datetime-local" min="' + SITE.today + 'T00:00"></div><div class="fg"><label class="lb" for="sc-e">종료 <small>선택</small></label><input id="sc-e" type="datetime-local"></div><div class="fg"><label class="lb" for="sc-p">장소 요약</label><input id="sc-p" placeholder="예: 마포구 고객 자택 (상세 주소·출입정보는 적지 않아요)"></div><div class="fg"><label class="lb" for="sc-w">담당자</label><input id="sc-w" placeholder="예: 정리수납 2인 팀 / 업체명"></div></div><p class="err" id="sc-er" hidden></p><button class="btn btn-fill btn-sm" type="submit">일정 등록</button><p class="small">고객 승인 이후에만 등록할 수 있어요. 승인 상태에서 등록하면 \'일정 확정\'으로 바뀌어요.</p></form>'
      : '<p class="small">일정은 <b>고객 승인 이후</b>(승인·일정 확정·진행 중)에 등록할 수 있어요.</p>';

    var aTbl = a.assigns.length ? '<div class="tw"><table class="tbl"><thead><tr><th>업체</th><th>업종 · 연락처</th><th>전달 메모</th><th>상태</th></tr></thead><tbody>' + a.assigns.map(function (x) {
      var p = byId(PARTNERS, x.partner) || { name: x.partner, type: '', phone: '' };
      return '<tr><td><b>' + esc(p.name) + '</b><small class="blk">' + esc((x.at || '').slice(0, 10)) + '</small></td><td>' + esc(p.type || '-') + '<small class="blk">' + esc(p.phone || '-') + '</small></td><td>' + esc(x.note || '-') + '</td><td><div class="inl"><select id="asg-' + x.id + '" aria-label="배정 상태">' + Object.keys(ASG).map(function (k) { return '<option value="' + k + '"' + (x.st === k ? ' selected' : '') + '>' + ASG[k][0] + '</option>'; }).join('') + '</select><button class="btn btn-line btn-sm" data-act="aAsgSt" data-no="' + no + '" data-id="' + x.id + '">저장</button></div></td></tr>';
    }).join('') + '</tbody></table></div>' : '<p class="small">배정된 업체가 없어요.</p>';
    var needShare = !a.share;
    var aForm = canAssign ? '<form class="form" data-sub="aAssign2" data-no="' + no + '"><h3>업체 배정</h3><div class="fgrid"><div class="fg"><label class="lb" for="pa">업체</label><select id="pa"><option value="">선택해 주세요</option>' + cands.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + (p.type ? ' (' + esc(p.type) + ')' : '') + (p.state !== '승인' ? ' · ' + esc(p.state) : '') + '</option>'; }).join('') + '</select></div><div class="fg"><label class="lb" for="pa-n">업체에 전달하는 정보 범위</label><input id="pa-n" maxlength="300" placeholder="예: 시·군·구, 방문 일시, 반려동물 성향만 전달"></div></div>' +
      (needShare ? '<label class="chk"><input type="checkbox" id="pa-c"> 고객의 <b>협력업체 정보 제공(선택) 동의</b>를 받았어요 (유선·서면 확인)</label>' : '<p class="small">' + ico('check', 14) + ' 고객이 협력업체 정보 제공에 동의했어요.</p>') +
      '<p class="err" id="pa-e" hidden></p><button class="btn btn-fill btn-sm" type="submit">배정하기</button></form>'
      : '<p class="small">협력업체는 <b>고객 승인 이후</b>에, 고객의 정보 제공 동의가 있을 때만 배정할 수 있어요.</p>';

    var notes = '<form class="form nt-f" data-sub="aNotes" data-no="' + no + '"><div class="fg"><label class="lb" for="nt-m">관리자 내부 메모 <span class="bd bd-bad">고객 비공개</span></label><textarea id="nt-m" rows="3" maxlength="3000">' + esc(a.memo) + '</textarea></div>' +
      '<div class="fg"><label class="lb" for="nt-c">고객 안내 메시지 <span class="bd bd-ok">고객에게 표시</span></label><textarea id="nt-c" rows="3" maxlength="3000" placeholder="예: 방문 전날 오후에 담당자가 연락드려요.">' + esc(a.msg) + '</textarea></div>' +
      '<div class="fg"><label class="lb" for="nt-r">완료 보고 <span class="bd bd-warn">완료 처리 전 필수</span></label><textarea id="nt-r" rows="3" maxlength="3000" placeholder="수행한 내용, 사용한 재료, 다음 관리 방법">' + esc(a.report) + '</textarea></div><button class="btn btn-fill btn-sm" type="submit">저장</button></form>';

    return A({ title: '신청 ' + no, heading: '신청 ' + no, sub: esc(s.name) + ' · ' + esc(uname(a.user)), html: '<p class="mb"><a class="lnk" href="#admin-apps">' + ico('arrow-left', 16) + ' 신청 목록</a></p><div class="ag ag2"><div>' +
      card('진행 상태', '<div class="ad-st">' + G.stBadge(a.status) + '<span class="small">접수 ' + a.at + '</span></div>' + G.progress(a)) +
      card('신청 내용', '<dl class="sum"><div class="kv"><dt>서비스</dt><dd>' + esc(s.name) + ' <span class="op op-' + s.op + '">' + esc(s.tag) + '</span></dd></div><div class="kv"><dt>회원</dt><dd><a class="lnk-i" href="#admin-member-' + a.user + '">' + esc(uname(a.user)) + '</a> · ' + esc(a.phone) + '</dd></div>' + (a.region ? '<div class="kv"><dt>희망 지역</dt><dd>' + esc(a.region) + '</dd></div>' : '') + (a.date ? '<div class="kv"><dt>희망 일자</dt><dd>' + a.date + (a.time ? ' · ' + esc(a.time) : '') + '</dd></div>' : '') + (a.headcount ? '<div class="kv"><dt>인원</dt><dd>' + esc(a.headcount) + '</dd></div>' : '') + (a.budget ? '<div class="kv"><dt>예산</dt><dd>' + esc(a.budget) + '</dd></div>' : '') + kv + '<div class="kv"><dt>요청 사항</dt><dd>' + G.nl(a.note) + '</dd></div><div class="kv"><dt>수행 구분</dt><dd>' + esc(s.opLabel) + '</dd></div><div class="kv"><dt>협력 제공 동의</dt><dd>' + (a.share ? '<span class="bd bd-ok">동의</span>' : s.op === 'DIRECT' ? '해당 없음' : '<span class="bd bd-mute">미동의</span>') + '</dd></div></dl>') +
      card('견적', qTbl + qForm) +
      card('일정 · 담당자', sTbl + sForm) +
      card('협력업체 배정', aTbl + aForm) +
      card('이 서비스의 운영 기준 (와이어프레임)', '<dl class="sum"><div class="kv"><dt>협력업체 역할</dt><dd>' + esc(s.wf.partner) + '</dd></div><div class="kv"><dt>관리자 확인</dt><dd>' + esc(s.wf.admin) + '</dd></div><div class="kv"><dt>운영 규칙</dt><dd>' + esc(s.wf.rule) + '</dd></div></dl>') + '</div>' +
      '<div>' + card('상태 변경', form) + card('메모 · 안내 · 완료 보고', notes) +
      card('진행 이력', '<ol class="hist">' + a.hist.slice().reverse().map(function (h) { return '<li><span class="hd-t">' + G.stBadge(h[0]) + '<time>' + h[1] + '</time><em>' + esc(h[2]) + '</em></span>' + (h[3] ? '<p>' + esc(h[3]) + '</p>' : '') + '</li>'; }).join('') + '</ol>') + '</div></div>', mount: function () { G.INP.aTo(); } });
  }

  G.SUB.aStatus = function (f) {
    var a = G.app(f.dataset.no), to = val('as-to'), memo = val('as-m').trim(), e = $('as-e');
    var fail = function (m) { e.textContent = m; e.hidden = false; }; e.hidden = true;
    if (to === 'QUOTED') {
      var amt = +val('as-amt');
      if (amt > 0) { a.quote = { items: [[val('as-item').trim() || '서비스 이용', amt]], total: amt, memo: '' }; a.quotes.push({ at: G.now(), items: clone(a.quote.items), total: amt, memo: '', by: me().loginId }); }
      else if (!a.quote) return fail('견적 금액을 입력하거나 견적 카드에서 먼저 등록해 주세요.');
    }
    if (to === 'SCHEDULED') {
      var dt = val('as-dt');
      if (dt) { a.scheds.push({ id: a.scheds.length + 1, start: dt.replace('T', ' '), end: '', place: '', who: a.partner ? pname(a.partner) : '더가넷 담당', st: 'PLANNED' }); syncSchedule(a); }
      else if (!a.scheds.some(function (x) { return x.st === 'PLANNED'; })) return fail('확정 일시를 선택하거나 일정 카드에서 먼저 등록해 주세요.');
    }
    if (NEED_REASON.indexOf(to) >= 0 && memo.length < 3) return fail((to === 'APPROVED' ? '관리자 대행 승인' : G.stName(to)) + ' 사유를 적어 주세요.');
    if (to === 'COMPLETED') {
      if (!String(a.report || '').trim()) return fail('완료 보고를 먼저 작성하고 저장해 주세요.');
      a.scheds.forEach(function (x) { if (x.st === 'PLANNED') x.st = 'DONE'; }); syncSchedule(a);
    }
    G.addHist(a, to, '운영자', memo || (to === 'COMPLETED' ? a.report : ''));
    G.log(a.no + ' 상태 변경: ' + G.stName(to) + (memo ? ' (' + memo.slice(0, 40) + ')' : '')); G.toast('상태를 ' + G.stName(to) + '(으)로 변경했어요.'); G.rerender();
  };
  G.SUB.aQuote = function (f) {
    var a = G.app(f.dataset.no), e = $('q-e'), items = [];
    val('q-items').split('\n').forEach(function (ln) {
      ln = ln.trim(); if (!ln) return; var p = ln.split('|'), amt = +(String(p.length > 1 ? p[p.length - 1] : ln).replace(/[^0-9]/g, ''));
      var name = (p.length > 1 ? p.slice(0, -1).join('|') : ln.replace(/[0-9,원₩\s]+$/, '')).trim() || '서비스 이용'; if (amt > 0) items.push([name, amt]);
    });
    if (!items.length) { e.textContent = '"항목명 | 금액" 형식으로 한 줄 이상 입력해 주세요.'; e.hidden = false; return; }
    var total = items.reduce(function (s, x) { return s + x[1]; }, 0), memo = val('q-memo').trim();
    a.quote = { items: items, total: total, memo: memo }; a.quotes.push({ at: G.now(), items: clone(items), total: total, memo: memo, by: me().loginId });
    if (a.status === 'REVIEWING') G.addHist(a, 'QUOTED', '운영자', '견적을 등록했습니다. (합계 ' + G.fmt(total) + ')');
    else a.hist.push([a.status, G.now(), '운영자', '견적을 수정 등록했습니다. (합계 ' + G.fmt(total) + ')']);
    G.log(a.no + ' 견적 등록 ' + G.fmt(total)); G.toast('견적을 등록했어요.'); G.rerender();
  };
  G.SUB.aSched = function (f) {
    var a = G.app(f.dataset.no), e = $('sc-er'), st = val('sc-s'), en = val('sc-e');
    var fail = function (m) { e.textContent = m; e.hidden = false; };
    if (!st) return fail('시작 일시를 선택해 주세요.');
    if (en && en <= st) return fail('종료 일시는 시작보다 뒤여야 해요.');
    var place = val('sc-p').trim();
    if (/\d+\s*(동|호)\b|비밀번호|현관/.test(place)) return fail('상세 주소·출입 정보는 적지 말고 장소를 요약해 주세요.');
    a.scheds.push({ id: a.scheds.length + 1, start: st.replace('T', ' '), end: en ? en.replace('T', ' ') : '', place: place, who: val('sc-w').trim(), st: 'PLANNED' }); syncSchedule(a);
    if (a.status === 'APPROVED') G.addHist(a, 'SCHEDULED', '운영자', st.replace('T', ' ') + ' 일정으로 확정했습니다.');
    else a.hist.push([a.status, G.now(), '운영자', '일정을 추가했습니다: ' + st.replace('T', ' ')]);
    G.log(a.no + ' 일정 등록 ' + st.replace('T', ' ')); G.toast('일정을 등록했어요.'); G.rerender();
  };
  G.ACT.aSchSt = function (el) { var a = G.app(el.dataset.no), x = byId(a.scheds, el.dataset.id); x.st = val('sch-' + x.id); syncSchedule(a); G.log(a.no + ' 일정 상태: ' + SCH[x.st][0]); G.toast('일정 상태를 바꿨어요.'); G.rerender(); };
  G.SUB.aAssign2 = function (f) {
    var a = G.app(f.dataset.no), e = $('pa-e'), pid = val('pa'), fail = function (m) { e.textContent = m; e.hidden = false; };
    if (!pid) return fail('업체를 선택해 주세요.');
    if (!a.share) { if (!chk('pa-c')) return fail('고객의 정보 제공 동의가 있어야 배정할 수 있어요.'); a.share = true; G.log(a.no + ' 협력업체 정보 제공 동의 확인 (관리자)'); }
    if (a.assigns.some(function (x) { return x.partner === pid && x.st !== 'CANCELLED'; })) return fail('이미 배정된 업체예요.');
    a.assigns.push({ id: a.assigns.length + 1, partner: pid, note: val('pa-n').trim(), st: 'ASSIGNED', at: G.now() }); syncPartner(a);
    a.hist.push([a.status, G.now(), '운영자', '협력업체를 배정했습니다: ' + pname(pid)]);
    G.log(a.no + ' 협력업체 배정: ' + pname(pid)); G.toast('협력업체를 배정했어요.'); G.rerender();
  };
  G.ACT.aAsgSt = function (el) { var a = G.app(el.dataset.no), x = byId(a.assigns, el.dataset.id); x.st = val('asg-' + x.id); syncPartner(a); G.log(a.no + ' 배정 상태: ' + pname(x.partner) + ' ' + ASG[x.st][0]); G.toast('배정 상태를 바꿨어요.'); G.rerender(); };
  G.SUB.aNotes = function (f) { var a = G.app(f.dataset.no); a.memo = val('nt-m'); a.msg = val('nt-c'); a.report = val('nt-r'); G.log(a.no + ' 메모·안내·완료 보고 저장'); G.toast('저장했어요.'); G.rerender(); };
  var oPDone = G.ACT.pDone;
  G.ACT.pDone = function (el) { var a = G.app(el.dataset.no); if (a && !String(a.report || '').trim()) a.report = pname(a.partner) + ' 완료 보고: 작업을 마쳤습니다.'; oPDone(el); };

  /* 고객 화면에서 쓰는 조각 */
  G.custMsg = function (a) { return a.msg ? '<div class="callout">' + ico('message', 20) + '<div><strong>운영자 안내</strong><p>' + G.nl(a.msg) + '</p></div></div>' : ''; };
  G.custSched = function (a) {
    var l = (a.scheds || []).filter(function (x) { return x.st !== 'CANCELLED'; });
    var out = l.length ? '<h4>일정</h4><ul class="schl">' + l.map(function (x) { return '<li>' + ico('calendar', 18) + '<div><b>' + esc(x.start) + (x.end ? ' ~ ' + esc(x.end.slice(11, 16)) : '') + '</b> ' + bd(SCH, x.st) + '<small>' + esc([x.place, x.who].filter(Boolean).join(' · ')) + '</small></div></li>'; }).join('') + '</ul>'
      : (a.schedule ? '<h4>확정 일정</h4><p class="sched">' + ico('calendar', 18) + a.schedule + '</p>' : '');
    if (a.status === 'COMPLETED' && a.report) out += '<h4>완료 보고</h4><p class="small">' + G.nl(a.report) + '</p>';
    return out;
  };

  /* ================= 회원 ================= */
  function members() {
    var l = allMembers();
    var rows = l.map(function (m) {
      var x = S.ops.mem[m.id] || { status: 'ACTIVE' }, n = S.apps.filter(function (a) { return a.user === m.id; }).length;
      return '<tr class="lk" data-act="goto" data-to="admin-member-' + m.id + '" data-st="' + x.status + (x.locked ? ' LOCKED' : '') + '" data-q="' + esc((m.name + ' ' + m.email + ' ' + m.id).toLowerCase()) + '"><td><a href="#admin-member-' + m.id + '"><b>' + esc(m.name) + '</b></a><small class="blk">' + m.id + '</small></td><td>' + esc(m.email) + '</td><td>' + esc(m.phone) + '</td><td>' + m.joined + '</td><td class="r">' + n + '</td><td>' + bd(MST, x.status) + (x.locked ? ' <span class="bd bd-bad">로그인 잠금</span>' : '') + '</td><td>' + (x.mkt ? '수신' : '-') + '</td></tr>';
    }).join('');
    return A({ title: '회원', heading: '회원 관리', sub: '이름과 연락처는 일부만 보여요. 상세를 열면 열람 기록이 남아요.', html: card('', '<div class="filt"><label class="srch">' + ico('search', 18) + '<input id="mq" type="search" placeholder="이름·이메일·ID 검색" data-on="input:mFilter"></label><select id="mst" data-on="change:mFilter" aria-label="상태"><option value="">전체 상태</option>' + Object.keys(MST).map(function (k) { return '<option value="' + k + '">' + MST[k][0] + '</option>'; }).join('') + '<option value="LOCKED">로그인 잠금</option></select><span class="small" id="mcnt"></span></div><div class="tw"><table class="tbl" id="mtbl"><thead><tr><th>이름</th><th>이메일</th><th>연락처</th><th>가입일</th><th class="r">신청</th><th>상태</th><th>마케팅</th></tr></thead><tbody>' + rows + '</tbody></table></div>'), mount: function () { G.INP.mFilter(); } });
  }
  G.INP.mFilter = function () {
    var q = val('mq').trim().toLowerCase(), st = val('mst'), n = 0;
    document.querySelectorAll('#mtbl tbody tr').forEach(function (r) { var ok = (!st || r.dataset.st.split(' ').indexOf(st) >= 0) && (!q || r.dataset.q.indexOf(q) >= 0); r.hidden = !ok; if (ok) n++; });
    var c = $('mcnt'); if (c) c.textContent = n + '명';
  };
  var tempPw = null;
  function consents(m) {
    var x = S.ops.mem[m.id] || {}, t = m.joined + ' 10:00', r = [['이용약관 (필수)', 'v1.0', '-', 'Y', t], ['개인정보 수집·이용 (필수)', 'v1.0', '-', 'Y', t], ['마케팅 정보 수신 (선택)', 'v1.0', '-', x.mkt ? 'Y' : 'N', t]];
    S.apps.filter(function (a) { return a.user === m.id; }).forEach(function (a) { r.push(['서비스 신청 개인정보 수집 (필수)', 'v1.0', a.no, 'Y', a.at]); if (a.share) r.push(['협력업체 정보 제공 (선택)', 'v1.0', a.no, 'Y', a.at]); });
    return r.sort(function (p, q) { return p[4] < q[4] ? 1 : -1; });
  }
  function memberDetail(id) {
    var m = byId(allMembers(), id); if (!m) return A({ title: '회원', heading: '회원을 찾을 수 없어요', html: '<a class="lnk" href="#admin-members">목록으로</a>' });
    var x = S.ops.mem[id] || (S.ops.mem[id] = { status: 'ACTIVE', locked: false, mkt: false });
    var apps = S.apps.filter(function (a) { return a.user === id; }), qs = S.inquiries.filter(function (q) { return q.user === id; });
    var club = S.club ? { p: S.club.posts.filter(function (p) { return p.owner === id; }).length, d: S.club.deals.filter(function (d) { return d.req === id || d.prov === id; }).length, r: S.club.reports.filter(function (r) { return r.by === id; }).length } : null;
    if (tempPw && tempPw.id !== id) tempPw = null;
    var acct = '<form class="form" data-sub="mStatus" data-id="' + id + '"><div class="fg"><label class="lb" for="ms">회원 상태</label><div class="inl"><select id="ms">' + Object.keys(MST).map(function (k) { return '<option value="' + k + '"' + (x.status === k ? ' selected' : '') + '>' + MST[k][0] + '</option>'; }).join('') + '</select><button class="btn btn-fill btn-sm" type="submit">변경</button></div></div><p class="err" id="ms-e" hidden></p></form>' +
      (x.locked ? '<button class="btn btn-line btn-sm btn-block" data-act="mUnlock" data-id="' + id + '">로그인 잠금 해제</button>' : '<p class="small">로그인 잠금 없음</p>') +
      '<div class="tp"><button class="btn btn-ghost btn-sm btn-block" data-act="mTempAsk">임시 비밀번호 발급</button><div class="cfm" id="tp-c" hidden><p class="small">본인 확인을 마쳤나요? 발급하면 기존 비밀번호는 쓸 수 없어요.</p><div class="fa"><button class="btn btn-danger btn-sm" data-act="mTemp" data-id="' + id + '">본인 확인 완료, 발급</button><button class="btn btn-line btn-sm" data-act="mTempAsk">취소</button></div></div></div>' +
      (tempPw ? '<div class="callout warn">' + ico('lock', 20) + '<div><strong>임시 비밀번호: <code class="sel">' + esc(tempPw.pw) + '</code></strong><p>고객에게 안전한 방법으로 전달하세요. 이 화면을 벗어나면 다시 볼 수 없어요.</p></div></div>' : '');
    return A({ title: '회원 ' + m.name, heading: m.name + ' 회원', sub: id + ' · 가입 ' + m.joined, html: '<p class="mb"><a class="lnk" href="#admin-members">' + ico('arrow-left', 16) + ' 회원 목록</a></p><div class="ag ag2"><div>' +
      card('신청 내역', apps.length ? '<div class="tw"><table class="tbl"><thead><tr><th>신청번호</th><th>서비스</th><th>상태</th><th>신청일</th></tr></thead><tbody>' + apps.map(function (a) { return '<tr class="lk" data-act="goto" data-to="admin-app-' + a.no + '"><td><a href="#admin-app-' + a.no + '">' + a.no + '</a></td><td>' + esc(G.sv(a.svc).name) + '</td><td>' + G.stBadge(a.status) + '</td><td>' + G.dshort(a.at) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="small">신청 내역이 없어요.</p>') +
      card('1:1 문의', qs.length ? '<ul class="mng">' + qs.map(function (q) { return '<li><div><b>' + esc(q.type) + '</b> <span class="bd bd-' + (q.status === '답변 완료' ? 'ok' : 'warn') + '">' + q.status + '</span><small>' + q.id + ' · ' + q.at + ' · ' + esc(q.text.slice(0, 40)) + '</small></div><a class="btn btn-line btn-sm" href="#admin-inq" data-act="iTab" data-v="all">문의로</a></li>'; }).join('') + '</ul>' : '<p class="small">문의가 없어요.</p>') +
      card('동의 이력', '<div class="tw"><table class="tbl"><thead><tr><th>구분</th><th>버전</th><th>신청번호</th><th>동의</th><th>일시</th></tr></thead><tbody>' + consents(m).map(function (c) { return '<tr><td>' + c[0] + '</td><td>' + c[1] + '</td><td>' + c[2] + '</td><td>' + c[3] + '</td><td>' + c[4] + '</td></tr>'; }).join('') + '</tbody></table></div><p class="small">동의 이력은 고객 본인만 바꿀 수 있어요. 관리자는 조회만 해요.</p>') + '</div><div>' +
      card('기본 정보', '<dl class="sum"><div class="kv"><dt>이름</dt><dd>' + esc(m.name) + '</dd></div><div class="kv"><dt>이메일</dt><dd>' + esc(m.email) + '</dd></div><div class="kv"><dt>연락처</dt><dd>' + esc(m.phone) + '</dd></div><div class="kv"><dt>구분</dt><dd>' + esc(m.role || '회원') + '</dd></div><div class="kv"><dt>상태</dt><dd>' + bd(MST, x.status) + (x.locked ? ' <span class="bd bd-bad">로그인 잠금</span>' : '') + '</dd></div><div class="kv"><dt>마케팅 수신</dt><dd>' + (x.mkt ? '동의' : '미동의') + '</dd></div><div class="kv"><dt>가입일</dt><dd>' + m.joined + '</dd></div></dl>') +
      card('계정 관리', acct) +
      (club ? card('이웃 나눔 활동', '<div class="kpis k3"><div class="kpi"><span>등록 글</span><b>' + club.p + '</b></div><div class="kpi"><span>참여 거래</span><b>' + club.d + '</b></div><div class="kpi"><span>신고 접수</span><b>' + club.r + '</b></div></div>') : '') + '</div></div>' });
  }
  G.SUB.mStatus = function (f) {
    var id = f.dataset.id, to = val('ms'), x = S.ops.mem[id], e = $('ms-e');
    var live = S.apps.filter(function (a) { return a.user === id && ['APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'CANCEL_REQUESTED', 'REFUNDING'].indexOf(a.status) >= 0; });
    if (to === 'WITHDRAWN' && live.length) { e.textContent = '진행 중인 신청(' + live.map(function (a) { return a.no; }).join(', ') + ')이 있어 탈퇴 처리할 수 없어요.'; e.hidden = false; return; }
    x.status = to; apply(); G.log(uname(id) + ' 회원 상태 변경: ' + MST[to][0]); G.toast('회원 상태를 ' + MST[to][0] + '(으)로 바꿨어요.'); G.rerender();
  };
  G.ACT.mUnlock = function (el) { S.ops.mem[el.dataset.id].locked = false; apply(); G.log(uname(el.dataset.id) + ' 로그인 잠금 해제'); G.toast('잠금을 해제했어요.'); G.rerender(); };
  G.ACT.mTempAsk = function () { var c = $('tp-c'); if (c) c.hidden = !c.hidden; };
  G.ACT.mTemp = function (el) {
    var cs = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789', pw = '', arr = new Uint32Array(10);
    try { crypto.getRandomValues(arr); } catch (e) { for (var i = 0; i < 10; i++) arr[i] = Math.floor(Math.random() * 1e9); }
    for (var j = 0; j < 10; j++) pw += cs[arr[j] % cs.length]; pw += '!' + (arr[0] % 10);
    tempPw = { id: el.dataset.id, pw: pw }; S.ops.mem[el.dataset.id].locked = false; apply();
    G.log(uname(el.dataset.id) + ' 임시 비밀번호 발급 (본인 확인 완료)'); G.rerender();
  };

  /* ================= 협력업체 ================= */
  function partners() {
    var live = function (pid) { return S.apps.filter(function (a) { return (a.assigns || []).some(function (x) { return x.partner === pid && (x.st === 'ASSIGNED' || x.st === 'CONFIRMED'); }); }).length; };
    return A({ title: '협력업체', heading: '협력업체', sub: '자격·보험 확인 내역과 사용 여부를 관리해요. 기본 업체명은 모두 예시예요.', html: card('', '<div class="fa top"><a class="btn btn-fill btn-sm" href="#admin-partner-new">' + ico('plus', 16) + ' 협력업체 등록</a></div><div class="tw"><table class="tbl"><thead><tr><th>업체</th><th>담당 서비스</th><th>지역</th><th>담당 / 연락처</th><th>보험</th><th>자격 검증일</th><th>심사</th><th>사용</th><th class="r">진행 배정</th></tr></thead><tbody>' +
      PARTNERS.map(function (p) { return '<tr class="lk' + (p.active === false ? ' old' : '') + '" data-act="goto" data-to="admin-partner-' + p.id + '"><td><a href="#admin-partner-' + p.id + '"><b>' + esc(p.name) + '</b></a><small class="blk">' + esc(p.type || '-') + '</small></td><td>' + p.svc.map(function (id) { return '<span class="tag">' + esc(G.sv(id).name) + '</span>'; }).join('') + '</td><td>' + esc(p.area) + '</td><td>' + esc(p.contact) + '<small class="blk">' + esc(p.phone || '-') + '</small></td><td>' + (p.ins ? '<span class="bd bd-ok">확인</span>' : '<span class="bd bd-warn">미확인</span>') + '</td><td>' + esc(p.verified || '-') + '</td><td><span class="bd bd-' + (p.state === '승인' ? 'ok' : 'warn') + '">' + esc(p.state) + '</span></td><td>' + (p.active === false ? '<span class="bd bd-mute">중지</span>' : '<span class="bd bd-ok">사용</span>') + '</td><td class="r">' + live(p.id) + '</td></tr>'; }).join('') +
      '</tbody></table></div><p class="small">업체 심사(사업자 등록, 보험, 업종별 자격)와 계약은 실제 운영 단계에서 서버와 전자계약으로 처리합니다.</p>') });
  }
  function partnerForm(id) {
    var isNew = id === 'new', p = isNew ? { name: '', type: '', svc: [], area: '', contact: '', phone: '', qual: '', verified: '', ins: false, state: '심사 중', active: true } : byId(PARTNERS, id);
    if (!p) return A({ title: '협력업체', heading: '업체를 찾을 수 없어요', html: '<a class="lnk" href="#admin-partners">목록으로</a>' });
    var f = function (k, label, ph, type) { return '<div class="fg"><label class="lb" for="pf-' + k + '">' + label + '</label><input id="pf-' + k + '" type="' + (type || 'text') + '" value="' + esc(p[k] || '') + '" placeholder="' + esc(ph || '') + '"></div>'; };
    return A({ title: isNew ? '협력업체 등록' : '협력업체 수정', heading: isNew ? '협력업체 등록' : p.name, sub: isNew ? '심사 중으로 등록한 뒤 자격·보험을 확인하면 승인해요.' : p.id + ' · 등록 ' + p.since, html: '<p class="mb"><a class="lnk" href="#admin-partners">' + ico('arrow-left', 16) + ' 협력업체 목록</a></p>' +
      card('', '<form class="form" data-sub="pSave" data-id="' + id + '" novalidate><div class="fgrid">' + f('name', '업체·기관명 *', '예: 초록손 식물케어') + f('type', '업종 구분 *', '여행사 / 이사업체 / 동물병원 / 후원기관 등') + f('area', '활동 지역', '예: 서울 서남권') + f('contact', '담당자', '예: 방문관리 담당') + f('phone', '연락처', '02-000-0000') + f('verified', '자격 검증일', '', 'date') +
        '<div class="fg full"><span class="lb">담당 서비스</span><div class="cks">' + SV.map(function (s) { return '<label class="chk"><input type="checkbox" name="pf-svc" value="' + s.id + '"' + (p.svc.indexOf(s.id) >= 0 ? ' checked' : '') + '> ' + esc(s.name) + '</label>'; }).join('') + '</div></div>' +
        '<div class="fg full"><label class="lb" for="pf-qual">자격·등록 메모</label><textarea id="pf-qual" rows="3" placeholder="해당 업종에 필요한 자격·등록 사항만 적어요">' + esc(p.qual || '') + '</textarea></div>' +
        '<div class="fg"><label class="lb" for="pf-state">심사 상태</label><select id="pf-state"><option' + (p.state === '심사 중' ? ' selected' : '') + '>심사 중</option><option' + (p.state === '승인' ? ' selected' : '') + '>승인</option></select></div>' +
        '<div class="fg"><span class="lb">확인</span><label class="chk"><input type="checkbox" id="pf-ins"' + (p.ins ? ' checked' : '') + '> 보험 확인 완료</label><label class="chk"><input type="checkbox" id="pf-active"' + (p.active !== false ? ' checked' : '') + '> 사용 (배정 후보에 노출)</label></div></div>' +
        '<p class="err" id="pf-e" hidden></p><div class="fa"><button class="btn btn-fill" type="submit">저장</button><a class="btn btn-line" href="#admin-partners">취소</a></div></form>') });
  }
  G.SUB.pSave = function (f) {
    var id = f.dataset.id, e = $('pf-e'), name = val('pf-name').trim(), type = val('pf-type').trim();
    var svc = Array.prototype.map.call(document.querySelectorAll('input[name="pf-svc"]:checked'), function (x) { return x.value; });
    var fail = function (m) { e.textContent = m; e.hidden = false; };
    if (!name || !type) return fail('업체명과 업종 구분을 입력해 주세요.');
    if (!svc.length) return fail('담당 서비스를 하나 이상 골라 주세요.');
    if (val('pf-state') === '승인' && !chk('pf-ins')) return fail('보험 확인 전에는 승인할 수 없어요.');
    var p = id === 'new' ? null : byId(S.ops.partners, id);
    if (!p) { var n = S.ops.partners.reduce(function (mx, x) { return Math.max(mx, +String(x.id).slice(1) || 0); }, 0) + 1; p = { id: 'P' + n, since: SITE.today.slice(0, 7) }; S.ops.partners.push(p); }
    p.name = name; p.type = type; p.svc = svc; p.area = val('pf-area').trim() || '-'; p.contact = val('pf-contact').trim() || '-'; p.phone = val('pf-phone').trim(); p.verified = val('pf-verified'); p.qual = val('pf-qual').trim(); p.state = val('pf-state'); p.ins = chk('pf-ins'); p.active = chk('pf-active');
    apply(); G.log((id === 'new' ? '협력업체 등록: ' : '협력업체 수정: ') + name); G.save(); G.toast('저장했어요.'); G.go('admin-partners');
  };

  /* ================= 공지 · FAQ ================= */
  function notices() {
    var nl = S.notices.slice().sort(function (a, b) { return (b.pinned - a.pinned) || (b.date > a.date ? 1 : -1); });
    var fl = S.faqs.slice().sort(function (a, b) { return a.order - b.order; });
    return A({ title: '공지·FAQ', heading: '공지·FAQ', sub: '고객센터에 보이는 내용이에요. 숨긴 글은 고객 화면에 나오지 않아요.', html:
      card('공지사항', '<div class="filt"><label class="srch">' + ico('search', 18) + '<input id="nq" type="search" placeholder="제목 검색" data-on="input:nFilter"></label><a class="btn btn-fill btn-sm" href="#admin-notice-new">' + ico('plus', 16) + ' 공지 작성</a></div><div class="tw"><table class="tbl" id="ntbl"><thead><tr><th>제목</th><th>상단 고정</th><th>게시</th><th class="r">조회</th><th>등록일</th><th></th></tr></thead><tbody>' +
        nl.map(function (n) { return '<tr data-q="' + esc(n.title.toLowerCase()) + '"' + (n.hidden ? ' class="old"' : '') + '><td><a href="#admin-notice-' + n.id + '"><b>' + esc(n.title) + '</b></a></td><td>' + (n.pinned ? '<span class="bd bd-bad">고정</span>' : '-') + '</td><td>' + (n.hidden ? '<span class="bd bd-mute">숨김</span>' : '<span class="bd bd-ok">게시</span>') + '</td><td class="r">' + (n.views || 0) + '</td><td>' + n.date + '</td><td><div class="inl"><a class="btn btn-line btn-sm" href="#admin-notice-' + n.id + '">수정</a><button class="btn btn-ghost btn-sm" data-act="aDelN" data-id="' + n.id + '">삭제</button></div></td></tr>'; }).join('') + '</tbody></table></div>') +
      card('자주 묻는 질문', '<div class="fa top"><a class="btn btn-fill btn-sm" href="#admin-faq-new">' + ico('plus', 16) + ' FAQ 등록</a></div><div class="tw"><table class="tbl"><thead><tr><th>구분</th><th>질문</th><th class="r">순서</th><th>게시</th><th></th></tr></thead><tbody>' +
        fl.map(function (f) { return '<tr' + (f.show ? '' : ' class="old"') + '><td>' + esc(f.cat) + '</td><td><a href="#admin-faq-' + f.id + '">' + esc(f.q) + '</a></td><td class="r">' + f.order + '</td><td>' + (f.show ? '<span class="bd bd-ok">게시</span>' : '<span class="bd bd-mute">숨김</span>') + '</td><td><div class="inl"><a class="btn btn-line btn-sm" href="#admin-faq-' + f.id + '">수정</a><button class="btn btn-ghost btn-sm" data-act="aDelF" data-id="' + f.id + '">삭제</button></div></td></tr>'; }).join('') + '</tbody></table></div>') });
  }
  G.INP.nFilter = function () { var q = val('nq').trim().toLowerCase(); document.querySelectorAll('#ntbl tbody tr').forEach(function (r) { r.hidden = !!q && r.dataset.q.indexOf(q) < 0; }); };
  function noticeForm(id) {
    var isNew = id === 'new', n = isNew ? { title: '', body: '', pinned: false, hidden: false } : byId(S.notices, id);
    if (!n) return A({ title: '공지', heading: '공지를 찾을 수 없어요', html: '<a class="lnk" href="#admin-notices">목록으로</a>' });
    return A({ title: isNew ? '공지 작성' : '공지 수정', heading: isNew ? '공지 작성' : '공지 수정', sub: isNew ? '' : n.date + ' 등록 · 조회 ' + (n.views || 0), html: '<p class="mb"><a class="lnk" href="#admin-notices">' + ico('arrow-left', 16) + ' 공지·FAQ</a></p>' +
      card('', '<form class="form" data-sub="nSave" data-id="' + id + '" novalidate><div class="fg"><label class="lb" for="nf-t">제목</label><input id="nf-t" maxlength="120" value="' + esc(n.title) + '"></div><div class="fg"><label class="lb" for="nf-b">내용</label><textarea id="nf-b" rows="10">' + esc(n.body) + '</textarea></div><div class="cks"><label class="chk"><input type="checkbox" id="nf-p"' + (n.pinned ? ' checked' : '') + '> 상단 고정</label><label class="chk"><input type="checkbox" id="nf-s"' + (!n.hidden ? ' checked' : '') + '> 게시</label></div><p class="err" id="nf-e" hidden>제목과 내용을 모두 입력해 주세요.</p><div class="fa"><button class="btn btn-fill" type="submit">저장</button><a class="btn btn-line" href="#admin-notices">취소</a></div></form>') });
  }
  G.SUB.nSave = function (f) {
    var t = val('nf-t').trim(), b = val('nf-b').trim(); if (!t || !b) { $('nf-e').hidden = false; return; }
    var n = f.dataset.id === 'new' ? null : byId(S.notices, f.dataset.id);
    if (!n) { n = { id: S.notices.reduce(function (m, x) { return Math.max(m, x.id); }, 0) + 1, date: SITE.today, views: 0 }; S.notices.unshift(n); }
    n.title = t; n.body = b; n.pinned = chk('nf-p'); n.hidden = !chk('nf-s');
    G.log((f.dataset.id === 'new' ? '공지 등록: ' : '공지 수정: ') + t); G.save(); G.toast('공지를 저장했어요.'); G.go('admin-notices');
  };
  function faqForm(id) {
    var isNew = id === 'new', fq = isNew ? { cat: '', q: '', a: '', show: true, order: (S.faqs.reduce(function (m, x) { return Math.max(m, x.order || 0); }, 0) + 10) } : byId(S.faqs, id);
    if (!fq) return A({ title: 'FAQ', heading: 'FAQ를 찾을 수 없어요', html: '<a class="lnk" href="#admin-notices">목록으로</a>' });
    var cats = S.faqs.reduce(function (a, x) { if (a.indexOf(x.cat) < 0) a.push(x.cat); return a; }, []);
    return A({ title: isNew ? 'FAQ 등록' : 'FAQ 수정', heading: isNew ? 'FAQ 등록' : 'FAQ 수정', html: '<p class="mb"><a class="lnk" href="#admin-notices">' + ico('arrow-left', 16) + ' 공지·FAQ</a></p>' +
      card('', '<form class="form" data-sub="fSave" data-id="' + id + '" novalidate><div class="fgrid"><div class="fg"><label class="lb" for="ff-c">구분</label><input id="ff-c" list="ff-cl" value="' + esc(fq.cat) + '" placeholder="서비스 준비 / 비용·환불 / 회원·계정"><datalist id="ff-cl">' + cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist></div><div class="fg"><label class="lb" for="ff-o">표시 순서 <small>작을수록 위</small></label><input id="ff-o" type="number" step="1" value="' + fq.order + '"></div>' +
        '<div class="fg full"><label class="lb" for="ff-q">질문</label><input id="ff-q" value="' + esc(fq.q) + '"></div><div class="fg full"><label class="lb" for="ff-a">답변</label><textarea id="ff-a" rows="6">' + esc(fq.a) + '</textarea></div></div><label class="chk"><input type="checkbox" id="ff-s"' + (fq.show ? ' checked' : '') + '> 게시</label><p class="err" id="ff-e" hidden>구분, 질문, 답변을 모두 입력해 주세요.</p><div class="fa"><button class="btn btn-fill" type="submit">저장</button><a class="btn btn-line" href="#admin-notices">취소</a></div></form>') });
  }
  G.SUB.fSave = function (f) {
    var c = val('ff-c').trim(), q = val('ff-q').trim(), a = val('ff-a').trim(); if (!c || !q || !a) { $('ff-e').hidden = false; return; }
    var x = f.dataset.id === 'new' ? null : byId(S.faqs, f.dataset.id);
    if (!x) { x = { id: S.faqs.reduce(function (m, y) { return Math.max(m, y.id); }, 0) + 1 }; S.faqs.push(x); }
    x.cat = c; x.q = q; x.a = a; x.order = +val('ff-o') || 0; x.show = chk('ff-s');
    S.faqs.sort(function (p, r) { return p.order - r.order; });
    G.log((f.dataset.id === 'new' ? 'FAQ 등록: ' : 'FAQ 수정: ') + q); G.save(); G.toast('FAQ를 저장했어요.'); G.go('admin-notices');
  };

  /* ================= 1:1 문의 ================= */
  function inq() {
    var open = S.inquiries.filter(function (q) { return q.status !== '답변 완료'; }).length, done = S.inquiries.length - open;
    var l = S.inquiries.filter(function (q) { return inqTab === 'all' || (inqTab === 'open' ? q.status !== '답변 완료' : q.status === '답변 완료'); });
    var tab = function (v, t, n) { return '<a href="#admin-inq" data-act="iTab" data-v="' + v + '" class="' + (inqTab === v ? 'on' : '') + '">' + t + ' <small>' + n + '</small></a>'; };
    return A({ title: '1:1 문의', heading: '1:1 문의', sub: '답변은 고객 마이페이지 문의 내역에 바로 표시돼요.', html: card('', '<div class="tabs">' + tab('all', '전체', S.inquiries.length) + tab('open', '미답변', open) + tab('done', '답변 완료', done) + '</div>' +
      (l.length ? '<ul class="qa">' + l.map(function (q) {
        var m = byId(allMembers(), q.user);
        return '<li><div class="qa-h"><span class="bd bd-' + (q.status === '답변 완료' ? 'ok' : 'warn') + '">' + q.status + '</span><b>' + esc(q.type) + '</b>' + (q.svc ? '<span class="tag">' + esc(G.sv(q.svc).name) + '</span>' : '') + '<small>' + q.id + ' · ' + q.at + '</small></div>' +
          '<p class="small">문의자 <a class="lnk-i" href="#admin-member-' + q.user + '">' + esc(uname(q.user)) + '</a>' + (m ? ' · ' + esc(m.email) + ' · ' + esc(m.phone) : '') + '</p><p>' + esc(q.text) + '</p>' +
          '<div class="qa-f"><textarea id="ans-' + q.id + '" rows="2" placeholder="답변을 입력하세요.">' + esc(q.answer || '') + '</textarea><button class="btn btn-fill btn-sm" data-act="aAns" data-id="' + q.id + '">' + (q.answer ? '답변 수정' : '답변 등록') + '</button></div>' +
          (q.answer ? '<p class="small">답변 ' + esc(q.ansBy || 'admin') + ' · ' + esc(q.ansAt || '') + (q.edited ? ' (수정됨)' : '') + '</p>' : '') + '</li>';
      }).join('') + '</ul>' : '<p class="small">해당하는 문의가 없어요.</p>') + '<p class="small">비밀번호 재설정 요청은 본인 확인 후 회원 상세에서 \'임시 비밀번호 발급\'을 이용하세요.</p>') });
  }
  G.ACT.aAns = function (el) {
    var q = byId(S.inquiries, el.dataset.id), t = val('ans-' + q.id).trim(); if (t.length < 3) { G.toast('답변을 3자 이상 입력해 주세요.'); return; }
    if (q.answer) q.edited = true; q.answer = t; q.status = '답변 완료'; q.ansBy = me().loginId; q.ansAt = G.now();
    G.log('문의 답변 ' + q.id); G.toast('답변을 저장했어요.'); G.rerender();
  };

  /* ================= 서비스 소개 편집 ================= */
  function svcsPlus(o) {
    o.html += card('서비스 소개 문구 편집', '<p class="small">서비스명과 소개 문구를 고치면 고객 화면(목록·상세)에 바로 반영돼요. 서비스 코드는 바꿀 수 없고, 기존 신청 이력에는 영향이 없어요.</p><ul class="mng">' + SV.map(function (s) { var ed = !!S.ops.svc[s.id]; return '<li><div><b>' + esc(s.name) + '</b> ' + (ed ? '<span class="bd bd-info">수정됨</span>' : '') + '<small>' + s.id + ' · ' + esc(s.headline) + '</small></div><a class="btn btn-line btn-sm" href="#admin-svc-' + s.id + '">' + ico('edit', 14) + ' 수정</a></li>'; }).join('') + '</ul>');
    return o;
  }
  function svcForm(id) {
    var s = G.sv(id); if (!s) return A({ title: '서비스', heading: '서비스를 찾을 수 없어요', html: '<a class="lnk" href="#admin-svcs">목록으로</a>' });
    var ed = !!S.ops.svc[id];
    return A({ title: '서비스 수정', heading: s.name, sub: '서비스 코드 ' + id + ' · ' + esc(s.opLabel), html: '<p class="mb"><a class="lnk" href="#admin-svcs">' + ico('arrow-left', 16) + ' 서비스 관리</a></p>' +
      card('', '<form class="form" data-sub="sSave" data-id="' + id + '" novalidate><div class="fgrid"><div class="fg"><label class="lb" for="sf-name">서비스명</label><input id="sf-name" maxlength="40" value="' + esc(s.name) + '"></div><div class="fg"><label class="lb" for="sf-headline">한 줄 소개</label><input id="sf-headline" maxlength="80" value="' + esc(s.headline) + '"></div>' +
        '<div class="fg full"><label class="lb" for="sf-summary">요약</label><textarea id="sf-summary" rows="2">' + esc(s.summary) + '</textarea></div><div class="fg full"><label class="lb" for="sf-lead">상세 도입 문단</label><textarea id="sf-lead" rows="3">' + esc(s.lead) + '</textarea></div>' +
        '<div class="fg"><label class="lb" for="sf-points">핵심 포인트 <small>한 줄에 하나</small></label><textarea id="sf-points" rows="4">' + esc((s.points || []).join('\n')) + '</textarea></div><div class="fg"><label class="lb" for="sf-standard">제공하지 않는 범위 · 기준</label><textarea id="sf-standard" rows="4">' + esc(s.standard) + '</textarea></div></div>' +
        '<p class="err" id="sf-e" hidden>서비스명과 한 줄 소개는 비울 수 없어요.</p><div class="fa"><button class="btn btn-fill" type="submit">저장</button>' + (ed ? '<button class="btn btn-line" type="button" data-act="sRestore" data-id="' + id + '">기본 문구로 되돌리기</button>' : '') + '<a class="btn btn-line" href="#svc-' + id + '">고객 화면에서 보기</a></div></form>') });
  }
  G.SUB.sSave = function (f) {
    var id = f.dataset.id, name = val('sf-name').trim(), hl = val('sf-headline').trim(); if (!name || !hl) { $('sf-e').hidden = false; return; }
    S.ops.svc[id] = { name: name, headline: hl, summary: val('sf-summary').trim(), lead: val('sf-lead').trim(), points: val('sf-points').split('\n').map(function (x) { return x.trim(); }).filter(Boolean), standard: val('sf-standard').trim() };
    apply(); G.log(id + ' 서비스 소개 수정: ' + name); G.save(); G.toast('서비스 소개를 저장했어요.'); G.go('admin-svcs');
  };
  G.ACT.sRestore = function (el) { delete S.ops.svc[el.dataset.id]; apply(); G.log(el.dataset.id + ' 서비스 소개 기본값 복원'); G.save(); G.toast('기본 문구로 되돌렸어요.'); G.go('admin-svcs'); };

  /* ================= 통계: 기간별 KPI ================= */
  function statsPlus(o) {
    var t = SITE.today, d7 = G.addDays(t, -7), d30 = G.addDays(t, -30);
    var n7 = S.apps.filter(function (a) { return a.at.slice(0, 10) > d7; }).length, n30 = S.apps.filter(function (a) { return a.at.slice(0, 10) > d30; }).length;
    var act = allMembers().filter(function (m) { var x = S.ops.mem[m.id]; return !x || x.status === 'ACTIVE'; }).length;
    var done = S.apps.filter(function (a) { return a.status === 'COMPLETED'; }).length, closed = S.apps.filter(function (a) { return ['COMPLETED', 'CANCELLED', 'REJECTED', 'REFUNDED'].indexOf(a.status) >= 0; }).length;
    o.html = '<div class="kpis k5 mb">' + [['전체 신청', S.apps.length], ['최근 7일', n7], ['최근 30일', n30], ['활성 회원', act], ['완료율 (종료 건 기준)', closed ? Math.round(done / closed * 100) + '%' : '-']].map(function (k) { return '<div class="kpi"><span>' + k[0] + '</span><b>' + k[1] + '</b></div>'; }).join('') + '</div>' + o.html;
    return o;
  }

  /* ================= 관리자 계정 · 권한 ================= */
  function accounts() {
    var who = me();
    return A({ title: '계정·권한', heading: '관리자 계정 · 권한', sub: '최고관리자는 전체 메뉴를, 운영담당은 신청·회원·문의·협력업체·공지 업무를 다뤄요.', html: '<div class="ag"><div>' +
      card('관리자 계정', '<div class="tw"><table class="tbl"><thead><tr><th>아이디</th><th>이름</th><th>역할</th><th>상태</th><th>생성일</th><th></th></tr></thead><tbody>' + S.ops.admins.map(function (x) {
        var self = x.id === who.id;
        return '<tr' + (x.active ? '' : ' class="old"') + '><td><b>' + esc(x.loginId) + '</b>' + (self ? ' <span class="small">(나)</span>' : '') + '</td><td>' + esc(x.name) + '</td><td>' + ROLE[x.role] + '</td><td>' + (x.active ? '<span class="bd bd-ok">사용</span>' : '<span class="bd bd-mute">정지</span>') + (x.locked ? ' <span class="bd bd-bad">잠금</span>' : '') + '</td><td>' + x.at + '</td><td><div class="inl">' + (x.locked ? '<button class="btn btn-line btn-sm" data-act="acUnlock" data-id="' + x.id + '">잠금 해제</button>' : '') + (self ? '' : '<button class="btn btn-ghost btn-sm" data-act="acToggle" data-id="' + x.id + '">' + (x.active ? '정지' : '복구') + '</button>') + '</div></td></tr>';
      }).join('') + '</tbody></table></div><p class="small">본인 계정은 정지할 수 없어요. 로그인에 5회 실패하면 자동으로 잠겨요.</p>') +
      card('역할별 권한', '<div class="tw"><table class="tbl"><thead><tr><th>메뉴</th><th>최고관리자</th><th>운영담당</th></tr></thead><tbody>' + [['대시보드 · 신청 · 회원 · 문의', 1, 1], ['협력업체 · 공지·FAQ · 이웃 나눔 · 정산 · 통계', 1, 1], ['서비스 관리 (공개 상태 · 소개 문구)', 1, 0], ['관리자 계정 · 권한', 1, 0], ['감사 로그', 1, 0]].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + (r[1] ? ico('check', 16) : '-') + '</td><td>' + (r[2] ? ico('check', 16) : '-') + '</td></tr>'; }).join('') + '</tbody></table></div>') + '</div><div>' +
      card('계정 추가', '<form class="form" data-sub="acAdd" novalidate><div class="fg"><label class="lb" for="ac-id">로그인 ID</label><input id="ac-id" autocomplete="off"></div><div class="fg"><label class="lb" for="ac-n">이름</label><input id="ac-n"></div><div class="fg"><label class="lb" for="ac-p">비밀번호 <small>영문과 숫자 포함 10자 이상</small></label><input id="ac-p" type="password" autocomplete="new-password"></div><div class="fg"><label class="lb" for="ac-r">역할</label><select id="ac-r"><option value="MANAGER">운영담당 (신청·회원·문의 처리)</option><option value="ADMIN">최고관리자 (전체 권한)</option></select></div><p class="err" id="ac-e" hidden></p><button class="btn btn-fill btn-block" type="submit">추가</button><p class="small">시연용 화면이라 비밀번호가 이 브라우저에만 저장돼요. 실제 운영에서는 서버에서 암호화해 보관합니다.</p></form>') + '</div></div>' });
  }
  G.SUB.acAdd = function () {
    var id = val('ac-id').trim(), n = val('ac-n').trim(), pw = val('ac-p'), role = val('ac-r'), e = $('ac-e'), fail = function (m) { e.textContent = m; e.hidden = false; };
    if (!id || !n) return fail('로그인 ID와 이름을 입력해 주세요.');
    if (!/^[a-z0-9._-]{4,20}$/i.test(id)) return fail('로그인 ID는 영문·숫자 4~20자로 만들어 주세요.');
    if (S.ops.admins.some(function (x) { return x.loginId === id; })) return fail('이미 있는 로그인 ID예요.');
    if (pw.length < 10 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return fail('비밀번호는 영문과 숫자를 포함해 10자 이상이어야 해요.');
    S.ops.admins.push({ id: 's' + (S.ops.admins.length + 1) + Date.now() % 1000, loginId: id, name: n, role: role, active: true, pw: pw, fails: 0, locked: false, at: SITE.today });
    G.log('관리자 계정 생성: ' + id + ' (' + ROLE[role] + ')'); G.toast('계정을 추가했어요.'); G.rerender();
  };
  G.ACT.acToggle = function (el) {
    var x = byId(S.ops.admins, el.dataset.id); if (x.id === me().id) return;
    if (x.active && x.role === 'ADMIN' && S.ops.admins.filter(function (y) { return y.active && y.role === 'ADMIN'; }).length < 2) { G.toast('활성 최고관리자가 최소 1명은 있어야 해요.'); return; }
    x.active = !x.active; G.log('관리자 계정 ' + (x.active ? '복구' : '정지') + ': ' + x.loginId); G.toast(x.active ? '복구했어요.' : '정지했어요.'); G.rerender();
  };
  G.ACT.acUnlock = function (el) { var x = byId(S.ops.admins, el.dataset.id); x.locked = false; x.fails = 0; G.log('관리자 계정 잠금 해제: ' + x.loginId); G.toast('잠금을 해제했어요.'); G.rerender(); };

  /* ================= 감사 로그 ================= */
  function audit() {
    var base = [['2026-10-26 18:00', 'admin', 'G2610-0007 상태 변경: 검토 중', 'CHANGE'], ['2026-10-24 11:05', 'admin', 'G2610-0004 상태 변경: 고객 승인 대기', 'CHANGE'], ['2026-10-20 09:00', 'admin', '공지 등록: [안내] 더가넷 웹사이트를 열었습니다', 'CHANGE']];
    var rows = S.audit.map(function (x) { return [x.at, x.who, x.what, x.kind || (/로그인/.test(x.what) ? 'LOGIN' : 'CHANGE')]; }).concat(base);
    return A({ title: '감사 로그', heading: '감사 로그', sub: '관리자 로그인, 개인정보 열람, 변경 작업이 모두 기록돼요.', html: card('', '<div class="filt"><label class="srch">' + ico('search', 18) + '<input id="lq" type="search" placeholder="계정·내용 검색" data-on="input:lFilter"></label><select id="lk" data-on="change:lFilter" aria-label="구분"><option value="">전체 구분</option>' + Object.keys(KIND).map(function (k) { return '<option value="' + k + '">' + KIND[k][0] + '</option>'; }).join('') + '</select><span class="small" id="lcnt"></span></div><div class="tw"><table class="tbl" id="ltbl"><thead><tr><th>시각</th><th>계정</th><th>구분</th><th>내용</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr data-k="' + r[3] + '" data-q="' + esc((r[1] + ' ' + r[2]).toLowerCase()) + '"><td>' + r[0] + '</td><td>' + esc(r[1]) + '</td><td>' + bd(KIND, r[3]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') + '</tbody></table></div>'), mount: function () { G.INP.lFilter(); } });
  }
  G.INP.lFilter = function () {
    var q = val('lq').trim().toLowerCase(), k = val('lk'), n = 0;
    document.querySelectorAll('#ltbl tbody tr').forEach(function (r) { var ok = (!k || r.dataset.k === k) && (!q || r.dataset.q.indexOf(q) >= 0); r.hidden = !ok; if (ok) n++; });
    var c = $('lcnt'); if (c) c.textContent = n + '건';
  };

  /* 공지 조회수 (고객 화면) */
  var origNotice = P.notice;
  P.notice = function (id) { var n = byId(S.notices, id); if (!n || n.hidden) return P.notfound(); var o = origNotice(id); if (lastNotice !== id) { n.views = (n.views || 0) + 1; lastNotice = id; G.save(); } return o; };
  var lastNotice = '';
  window.addEventListener('hashchange', function () { if (G.parse().name !== 'notice') lastNotice = ''; });
})();
