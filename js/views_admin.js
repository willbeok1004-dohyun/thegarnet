/* 관리자 / 협력업체 */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES;
  var uname = function (id) { var m = MEMBERS.filter(function (x) { return x.id === id; })[0]; return m ? m.name : (S.joined && S.joined.id === id ? S.joined.name : '방문자'); };
  var A = function (o) { o.layout = 'admin'; return o; };
  var card = function (t, body, extra) { return '<section class="ac ' + (extra || '') + '">' + (t ? '<h2>' + t + '</h2>' : '') + body + '</section>'; };

  P['admin'] = function (arg) {
    if (arg === 'login') return login();
    if (!S.adminAuthed) { var l = login(); return l; }
    if (arg === '') return dash();
    if (arg.indexOf('club') === 0 && G.adminClub) return G.adminClub(arg);
    if (arg.indexOf('settle') === 0 && G.adminSettle) return G.adminSettle(arg);
    if (arg.indexOf('app-') === 0) return appDetail(arg.slice(4));
    return ({ apps: apps, svcs: svcs, partners: partners, members: members, notices: notices, inq: inq, stats: stats, audit: audit }[arg] || dash)();
  };

  function login() {
    return { title: '관리자 로그인', layout: 'bare', html: '<div class="adm-login"><div class="al-ph"><img src="img/hero.jpg" alt=""></div><form class="al-f" data-sub="adminLogin" novalidate><p class="logo-m">THE GARNET<i>.</i></p><h1>운영 관리 로그인</h1><p class="small">시연용 관리자 계정이 미리 입력되어 있어요.</p><div class="fg"><label class="lb" for="a-id">아이디</label><input id="a-id" value="admin" autocomplete="username"></div><div class="fg"><label class="lb" for="a-pw">비밀번호</label><input id="a-pw" type="password" value="Admin!2345" autocomplete="current-password"><p class="err" id="a-e" hidden></p></div><button class="btn btn-fill btn-block" type="submit">로그인</button><a class="lnk" href="#home">' + ico('arrow-left', 16) + ' 고객 화면으로</a></form></div>' + G.dockHtml() + '<div class="toast" id="toast" role="status" aria-live="polite"></div>' };
  }
  G.SUB.adminLogin = function () {
    var ok = document.getElementById('a-id').value.trim() === 'admin' && document.getElementById('a-pw').value === 'Admin!2345';
    if (!ok) { var e = document.getElementById('a-e'); e.textContent = '아이디 또는 비밀번호가 맞지 않아요. (admin / Admin!2345)'; e.hidden = false; return; }
    S.adminAuthed = true; G.log('관리자 로그인'); G.save(); G.go('admin'); G.render(true);
  };

  /* ----- 대시보드 ----- */
  function dash() {
    var c = function (st) { return S.apps.filter(function (a) { return a.status === st; }).length; };
    var kp = [['신규 접수', c('SUBMITTED'), 'warn'], ['검토 중', c('REVIEWING') + c('NEED_INFO'), ''], ['고객 승인 대기', c('WAITING_APPROVAL'), 'warn'], ['진행 중', c('SCHEDULED') + c('IN_PROGRESS'), ''], ['취소 요청', c('CANCEL_REQUESTED'), c('CANCEL_REQUESTED') ? 'bad' : ''], ['미답변 문의', S.inquiries.filter(function (q) { return q.status === '접수'; }).length, '']];
    var recent = S.apps.slice(0, 6), up = S.apps.filter(function (a) { return a.schedule && a.schedule.slice(0, 10) >= SITE.today && ['SCHEDULED', 'IN_PROGRESS'].indexOf(a.status) >= 0; }).sort(function (a, b) { return a.schedule > b.schedule ? 1 : -1; });
    var sc = {}; Object.keys(S.flags).forEach(function (k) { var s = S.flags[k].state; sc[s] = (sc[s] || 0) + 1; });
    var need = S.apps.filter(function (a) { return ['SUBMITTED', 'CANCEL_REQUESTED'].indexOf(a.status) >= 0; });
    return A({ title: '대시보드', heading: '오늘의 운영 현황', sub: SITE.today + ' 기준 · 시연 데이터', html:
      '<div class="kpis">' + kp.map(function (k) { return '<div class="kpi ' + k[2] + '"><span>' + k[0] + '</span><b>' + k[1] + '</b></div>'; }).join('') + '</div>' +
      (G.settleTodoCount && G.settleTodoCount() ? '<a class="callout warn nb-strip" href="#admin-settle">' + ico('receipt', 20) + '<div><strong>정산 승인이 ' + G.settleTodoCount() + '건 기다려요</strong><p>이웃 나눔 정산과 분쟁, 협력업체 정산을 확인해 주세요.</p></div>' + ico('chev-right', 18) + '</a>' : '') + (G.clubTodoCount && G.clubTodoCount() ? '<a class="callout warn nb-strip" href="#admin-club">' + ico('swap', 20) + '<div><strong>이웃 나눔 검증이 ' + G.clubTodoCount() + '건 기다려요</strong><p>등록 검토, 거래 안전 검증, 신고 확인을 처리해 주세요.</p></div>' + ico('chev-right', 18) + '</a>' : '') + '<div class="ag"><div>' + card('처리가 필요한 일', need.length ? '<ul class="todo">' + need.map(function (a) { return '<li><a href="#admin-app-' + a.no + '"><span>' + G.stBadge(a.status) + '<b>' + esc(G.sv(a.svc).name) + '</b></span><em>' + a.no + ' · ' + uname(a.user) + '</em>' + ico('chev-right', 16) + '</a></li>'; }).join('') + '</ul>' : '<p class="small">지금 처리할 일이 없어요.</p>') +
      card('최근 신청', '<div class="tw"><table class="tbl"><thead><tr><th>신청번호</th><th>서비스</th><th>회원</th><th>접수</th><th>상태</th></tr></thead><tbody>' + recent.map(function (a) { return '<tr class="lk" data-act="goto" data-to="admin-app-' + a.no + '"><td><a href="#admin-app-' + a.no + '">' + a.no + '</a></td><td>' + esc(G.sv(a.svc).name) + '</td><td>' + esc(uname(a.user)) + '</td><td>' + G.dshort(a.at) + '</td><td>' + G.stBadge(a.status) + '</td></tr>'; }).join('') + '</tbody></table></div><a class="lnk" href="#admin-apps">전체 신청 보기 ' + ico('arrow-right', 16) + '</a>') + '</div>' +
      '<div>' + card('다가오는 일정', up.length ? '<ul class="sch">' + up.map(function (a) { return '<li><time>' + a.schedule.slice(5, 16).replace('-', '/') + '</time><div><b>' + esc(G.sv(a.svc).name) + '</b><span>' + uname(a.user) + ' · ' + a.no + '</span></div></li>'; }).join('') + '</ul>' : '<p class="small">예정된 일정이 없습니다.</p>') +
      card('서비스 공개 상태', '<ul class="bars">' + ['BOOKABLE', 'COMING_SOON', 'VISIBLE_INFO', 'PAUSED', 'HIDDEN'].map(function (k) { var n = sc[k] || 0; return '<li><span>' + G.stateName(k) + '</span><div><i style="width:' + (n / 15 * 100) + '%"></i></div><b>' + n + '</b></li>'; }).join('') + '</ul><a class="lnk" href="#admin-svcs">서비스 관리 ' + ico('arrow-right', 16) + '</a>') + '</div></div>' });
  }
  G.ACT.goto = function (el, e) { if (e.target.closest('a')) return; G.go(el.dataset.to); };

  /* ----- 신청 관리 ----- */
  function apps() {
    var sts = Object.keys(APP_STATUS);
    return A({ title: '신청 관리', heading: '신청 관리', sub: '접수된 신청을 검토하고 견적·일정·진행 상태를 관리해요.', html:
      card('', '<div class="filt"><label class="srch">' + ico('search', 18) + '<input id="aq" type="search" placeholder="신청번호·회원·서비스 검색" data-on="input:aFilter"></label><select id="ast" data-on="change:aFilter" aria-label="상태"><option value="">전체 상태</option>' + sts.map(function (k) { return '<option value="' + k + '">' + APP_STATUS[k][0] + '</option>'; }).join('') + '</select><select id="asv" data-on="change:aFilter" aria-label="서비스"><option value="">전체 서비스</option>' + SV.map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + '</option>'; }).join('') + '</select><span class="small" id="acnt"></span></div>' +
        '<div class="tw"><table class="tbl" id="atbl"><thead><tr><th>신청번호</th><th>서비스</th><th>회원</th><th>접수일</th><th>희망일</th><th>견적</th><th>상태</th></tr></thead><tbody>' + S.apps.map(function (a) { var s = G.sv(a.svc); return '<tr class="lk" data-act="goto" data-to="admin-app-' + a.no + '" data-st="' + a.status + '" data-sv="' + a.svc + '" data-q="' + esc((a.no + ' ' + uname(a.user) + ' ' + s.name).toLowerCase()) + '"><td><a href="#admin-app-' + a.no + '">' + a.no + '</a></td><td>' + esc(s.name) + '</td><td>' + esc(uname(a.user)) + '</td><td>' + G.dshort(a.at) + '</td><td>' + (a.date || '-') + '</td><td class="r">' + (a.quote ? G.fmt(a.quote.total) : '-') + '</td><td>' + G.stBadge(a.status) + '</td></tr>'; }).join('') + '</tbody></table></div><p class="empty empty-s" id="aemp" hidden>조건에 맞는 신청이 없어요.</p>'), mount: function () { G.INP.aFilter(); } });
  }
  G.INP.aFilter = function () {
    var q = (document.getElementById('aq') || {}).value, st = (document.getElementById('ast') || {}).value, sv = (document.getElementById('asv') || {}).value, n = 0;
    q = (q || '').trim().toLowerCase();
    document.querySelectorAll('#atbl tbody tr').forEach(function (r) { var ok = (!st || r.dataset.st === st) && (!sv || r.dataset.sv === sv) && (!q || r.dataset.q.indexOf(q) >= 0); r.hidden = !ok; if (ok) n++; });
    var c = document.getElementById('acnt'); if (c) c.textContent = n + '건'; var e = document.getElementById('aemp'); if (e) e.hidden = n > 0;
  };

  function appDetail(no) {
    var a = G.app(no); if (!a) return A({ title: '신청 관리', heading: '신청을 찾을 수 없어요', html: '<a class="lnk" href="#admin-apps">목록으로</a>' });
    var s = G.sv(a.svc), nxt = APP_NEXT[a.status] || [], canAssign = PARTNER_ASSIGNABLE.indexOf(a.status) >= 0, partner = a.partner ? PARTNERS.filter(function (p) { return p.id === a.partner; })[0] : null;
    var cands = PARTNERS.filter(function (p) { return p.svc.indexOf(a.svc) >= 0; }); if (!cands.length) cands = PARTNERS;
    var kv = Object.keys(a.data).map(function (k) { return '<div class="kv"><dt>' + esc(k) + '</dt><dd>' + esc(a.data[k]) + '</dd></div>'; }).join('');
    var NLAB = { REVIEWING: '검토 시작', NEED_INFO: '추가 정보 요청', QUOTED: '견적 입력', WAITING_APPROVAL: '고객에게 승인 요청', APPROVED: '승인 처리', SCHEDULED: '일정 확정', IN_PROGRESS: '진행 시작', COMPLETED: '완료 처리', CANCEL_REQUESTED: '취소 요청 접수', CANCELLED: '취소 처리', REJECTED: '진행 불가 처리', REFUNDING: '환불 처리 시작', REFUNDED: '환불 완료' };
    var form = nxt.length ? '<form class="stf" data-sub="aStatus" data-no="' + no + '"><div class="fg"><label class="lb" for="as-to">다음 상태</label><select id="as-to" data-on="change:aTo">' + nxt.map(function (k) { return '<option value="' + k + '">' + NLAB[k] + ' (' + APP_STATUS[k][0] + ')</option>'; }).join('') + '</select></div>' +
      '<div class="fg" id="as-q" hidden><label class="lb" for="as-amt">견적 금액 (원)</label><input id="as-amt" type="number" min="0" step="1000" placeholder="예: 190000"><label class="lb" for="as-item">견적 항목명</label><input id="as-item" placeholder="예: 정리수납 기본 (2인·4시간)"></div>' +
      '<div class="fg" id="as-s" hidden><label class="lb" for="as-dt">확정 일시</label><input id="as-dt" type="datetime-local" min="' + SITE.today + 'T00:00"></div>' +
      '<div class="fg"><label class="lb" for="as-m">고객에게 보이는 메모</label><textarea id="as-m" rows="3" placeholder="처리 내용이나 요청 사항을 적어 주세요."></textarea></div><p class="err" id="as-e" hidden></p><button class="btn btn-fill btn-block" type="submit">상태 변경하기</button></form>' : '<p class="small">이 상태에서는 더 변경할 수 있는 단계가 없어요.</p>';
    var pa = canAssign ? '<div class="fg"><label class="lb" for="pa">협력업체 배정</label><select id="pa"><option value="">선택해 주세요</option>' + cands.map(function (p) { return '<option value="' + p.id + '"' + (a.partner === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select></div><button class="btn btn-line btn-block" data-act="aAssign" data-no="' + no + '">배정하기</button>' + (a.share ? '' : '<p class="small">고객이 협력업체 정보 제공(선택)에 동의했는지 확인하세요.</p>') : '<p class="small">협력업체는 <b>고객 승인 이후</b>(승인·일정 확정·진행 중)에만 배정할 수 있어요.</p>';
    return A({ title: '신청 ' + no, heading: '신청 ' + no, sub: esc(s.name) + ' · ' + esc(uname(a.user)), html: '<p class="mb"><a class="lnk" href="#admin-apps">' + ico('arrow-left', 16) + ' 신청 목록</a></p><div class="ag ag2"><div>' +
      card('진행 상태', '<div class="ad-st">' + G.stBadge(a.status) + '<span class="small">접수 ' + a.at + '</span></div>' + G.progress(a)) +
      card('신청 내용', '<dl class="sum"><div class="kv"><dt>서비스</dt><dd>' + esc(s.name) + ' <span class="op op-' + s.op + '">' + esc(s.tag) + '</span></dd></div><div class="kv"><dt>회원</dt><dd>' + esc(uname(a.user)) + ' · ' + esc(a.phone) + '</dd></div>' + (a.region ? '<div class="kv"><dt>희망 지역</dt><dd>' + esc(a.region) + '</dd></div>' : '') + (a.date ? '<div class="kv"><dt>희망 일자</dt><dd>' + a.date + (a.time ? ' · ' + esc(a.time) : '') + '</dd></div>' : '') + (a.budget ? '<div class="kv"><dt>예산</dt><dd>' + esc(a.budget) + '</dd></div>' : '') + kv + '<div class="kv"><dt>요청 사항</dt><dd>' + G.nl(a.note) + '</dd></div><div class="kv"><dt>협력 제공 동의</dt><dd>' + (a.share ? '동의' : s.op === 'DIRECT' ? '해당 없음' : '미동의/미확인') + '</dd></div></dl>') +
      (a.quote ? card('견적', '<table class="tbl"><tbody>' + a.quote.items.map(function (i) { return '<tr><td>' + esc(i[0]) + '</td><td class="r">' + G.fmt(i[1]) + '</td></tr>'; }).join('') + '<tr class="tot"><td>합계</td><td class="r">' + G.fmt(a.quote.total) + '</td></tr></tbody></table>') : '') +
      card('이 서비스의 운영 기준 (와이어프레임)', '<dl class="sum"><div class="kv"><dt>협력업체 역할</dt><dd>' + esc(s.wf.partner) + '</dd></div><div class="kv"><dt>관리자 확인</dt><dd>' + esc(s.wf.admin) + '</dd></div><div class="kv"><dt>운영 규칙</dt><dd>' + esc(s.wf.rule) + '</dd></div></dl>') +
      card('진행 이력', '<ol class="hist">' + a.hist.slice().reverse().map(function (h) { return '<li><span class="hd-t">' + G.stBadge(h[0]) + '<time>' + h[1] + '</time><em>' + esc(h[2]) + '</em></span>' + (h[3] ? '<p>' + esc(h[3]) + '</p>' : '') + '</li>'; }).join('') + '</ol>') + '</div>' +
      '<div>' + card('상태 변경', form, 'sticky') + card('협력업체', (partner ? '<p class="small">현재 배정: <b>' + esc(partner.name) + '</b></p>' : '<p class="small">배정된 업체가 없어요.</p>') + pa) + '</div></div>', mount: function () { G.INP.aTo(); } });
  }
  G.INP.aTo = function () { var t = document.getElementById('as-to'); if (!t) return; document.getElementById('as-q').hidden = t.value !== 'QUOTED'; document.getElementById('as-s').hidden = t.value !== 'SCHEDULED'; };
  G.SUB.aStatus = function (f) {
    var a = G.app(f.dataset.no), to = document.getElementById('as-to').value, memo = document.getElementById('as-m').value.trim(), e = document.getElementById('as-e');
    var fail = function (m) { e.textContent = m; e.hidden = false; }; e.hidden = true;
    if (to === 'QUOTED') { var amt = +document.getElementById('as-amt').value; if (!(amt > 0)) return fail('견적 금액을 입력해 주세요.'); a.quote = { items: [[document.getElementById('as-item').value.trim() || '서비스 이용', amt]], total: amt, memo: '' }; }
    if (to === 'SCHEDULED') { var dt = document.getElementById('as-dt').value; if (!dt) return fail('확정 일시를 선택해 주세요.'); a.schedule = dt.replace('T', ' '); }
    if ((to === 'NEED_INFO' || to === 'REJECTED') && memo.length < 3) return fail('고객에게 보이는 메모를 적어 주세요.');
    G.addHist(a, to, '운영자', memo); G.log(a.no + ' 상태 변경: ' + G.stName(to)); G.toast('상태를 ' + G.stName(to) + '(으)로 변경했어요.'); G.rerender();
  };
  G.ACT.aAssign = function (el) { var v = document.getElementById('pa').value; if (!v) { G.toast('협력업체를 선택해 주세요.'); return; } var a = G.app(el.dataset.no); a.partner = v; a.hist.push([a.status, G.now(), '운영자', '협력업체를 배정했습니다.']); G.log(a.no + ' 협력업체 배정: ' + v); G.toast('협력업체를 배정했어요.'); G.rerender(); };

  /* ----- 서비스 관리 ----- */
  function svcs() {
    var cnt = {}; Object.keys(S.flags).forEach(function (k) { var s = S.flags[k].state; cnt[s] = (cnt[s] || 0) + 1; });
    var order = ['BOOKABLE', 'COMING_SOON', 'VISIBLE_INFO', 'PAUSED', 'HIDDEN'];
    return A({ title: '서비스 관리', heading: '서비스 공개 상태', sub: '여기서 바꾸면 고객 화면의 표시와 신청 가능 여부가 함께 바뀌어요.', html:
      '<div class="kpis k5">' + order.map(function (k) { return '<div class="kpi"><span>' + G.stateName(k) + '</span><b>' + (cnt[k] || 0) + '</b></div>'; }).join('') + '</div>' +
      card('15종 서비스', '<div class="tw"><table class="tbl"><thead><tr><th>서비스</th><th>수행 주체</th><th>출시</th><th>공개 상태</th><th>후기</th><th>견적</th><th>특별한 날</th></tr></thead><tbody>' + SV.map(function (s) {
        var f = S.flags[s.id]; return '<tr><td><img class="th" src="img/' + s.id + '.jpg" alt=""><b>' + esc(s.name) + '</b><small>' + s.id + '</small></td><td><span class="op op-' + s.op + '">' + esc(s.opLabel) + '</span></td><td>' + s.wf.phase + '차</td><td><select data-on="change:aState" data-id="' + s.id + '" aria-label="' + esc(s.name) + ' 공개 상태">' + order.map(function (k) { return '<option value="' + k + '"' + (f.state === k ? ' selected' : '') + '>' + G.stateName(k) + '</option>'; }).join('') + '</select></td>' +
          ['reviews', 'quote', 'gifts'].map(function (k) { return '<td><label class="sw"><input type="checkbox" data-on="change:aFlag" data-id="' + s.id + '" data-k="' + k + '"' + (f[k] ? ' checked' : '') + ' aria-label="' + esc(s.name) + ' ' + k + '"><i></i></label></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
        '<div class="rule"><b>상태 규칙</b><ul class="ul"><li><b>비공개</b> 목록·검색·상세에서 보이지 않아요.</li><li><b>준비 중</b> 목록에는 보이지만 신청은 받지 않고 상담 메모만 가능해요.</li><li><b>안내만 공개</b> 상세 정보만 보여요.</li><li><b>신청 가능</b> 신청서를 받아요.</li><li><b>일시 중지</b> 기존 신청은 계속 조회되고 새 신청만 막아요.</li></ul></div><div class="fa"><button class="btn btn-line btn-sm" data-act="aAllOn">모두 신청 가능으로(시연)</button><button class="btn btn-line btn-sm" data-act="aDefault">기본값으로 되돌리기</button><a class="btn btn-fill btn-sm" href="#services">고객 화면에서 확인</a></div>') +
      card('서비스별 운영 구조', '<div class="ops">' + SV.map(function (s) { return '<details><summary><b>' + esc(s.name) + '</b><span>' + esc(s.wf.type) + '</span>' + ico('chev-down', 16, 'pl') + '</summary><dl class="sum"><div class="kv"><dt>협력업체 역할</dt><dd>' + esc(s.wf.partner) + '</dd></div><div class="kv"><dt>관리자 확인</dt><dd>' + esc(s.wf.admin) + '</dd></div><div class="kv"><dt>운영 규칙</dt><dd>' + esc(s.wf.rule) + '</dd></div><div class="kv"><dt>비용 산식</dt><dd>' + esc(s.wf.price) + '</dd></div><div class="kv"><dt>연동 API(예정)</dt><dd><code>' + esc(s.wf.api) + '</code></dd></div></dl></details>'; }).join('') + '</div>') });
  }
  G.INP.aState = function (el) { S.flags[el.dataset.id].state = el.value; G.log(el.dataset.id + ' 공개 상태: ' + G.stateName(el.value)); G.toast(G.sv(el.dataset.id).name + ': ' + G.stateName(el.value)); G.rerender(); };
  G.INP.aFlag = function (el) { S.flags[el.dataset.id][el.dataset.k] = el.checked; G.log(el.dataset.id + ' ' + el.dataset.k + ' ' + (el.checked ? '켬' : '끔')); G.save(); };
  G.ACT.aAllOn = function () { Object.keys(S.flags).forEach(function (k) { S.flags[k].state = 'BOOKABLE'; }); G.log('전체 서비스 신청 가능(시연)'); G.rerender(); };
  G.ACT.aDefault = function () { Object.keys(S.flags).forEach(function (k) { S.flags[k] = JSON.parse(JSON.stringify(WF_FLAGS[k])); }); G.log('서비스 상태 기본값 복원'); G.rerender(); };

  /* ----- 협력업체 / 회원 ----- */
  function partners() {
    return A({ title: '협력업체', heading: '협력업체', sub: '심사 중이거나 승인된 업체예요. 업체명은 모두 예시입니다.', html: card('', '<div class="tw"><table class="tbl"><thead><tr><th>업체</th><th>담당 서비스</th><th>지역</th><th>담당자</th><th>상태</th><th>등록</th></tr></thead><tbody>' + PARTNERS.map(function (p) { return '<tr><td><b>' + esc(p.name) + '</b></td><td>' + p.svc.map(function (id) { return '<span class="tag">' + esc(G.sv(id).name) + '</span>'; }).join('') + '</td><td>' + p.area + '</td><td>' + p.contact + '</td><td><span class="bd bd-' + (p.state === '승인' ? 'ok' : 'warn') + '">' + p.state + '</span></td><td>' + p.since + '</td></tr>'; }).join('') + '</tbody></table></div><p class="small">업체 적격 심사(사업자 등록, 보험, 자격)와 계약은 실제 운영 단계에서 서버 연동으로 구현합니다.</p>') });
  }
  function members() {
    return A({ title: '회원', heading: '회원 관리', sub: '이름과 연락처는 일부만 보여요.', html: card('', '<div class="tw"><table class="tbl"><thead><tr><th>이름</th><th>이메일</th><th>연락처</th><th>가입일</th><th>상태</th><th></th></tr></thead><tbody>' + MEMBERS.map(function (m) { var lk = m.status.indexOf('잠김') === 0 && !S['unl' + m.id]; return '<tr><td><b>' + esc(m.name) + '</b></td><td>' + esc(m.email) + '</td><td>' + m.phone + '</td><td>' + m.joined + '</td><td>' + (lk ? '<span class="bd bd-bad">' + m.status + '</span>' : '<span class="bd bd-ok">활성</span>') + '</td><td>' + (lk ? '<button class="btn btn-line btn-sm" data-act="aUnlock" data-id="' + m.id + '">잠금 해제</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>') });
  }
  G.ACT.aUnlock = function (el) { S['unl' + el.dataset.id] = true; G.log('회원 잠금 해제 ' + el.dataset.id); G.toast('잠금을 해제했어요.'); G.rerender(); };

  /* ----- 공지/FAQ ----- */
  function notices() {
    return A({ title: '공지·FAQ', heading: '공지·FAQ', sub: '고객 화면 고객센터에 보이는 내용이에요.', html: '<div class="ag"><div>' + card('공지사항', '<ul class="mng">' + S.notices.map(function (n) { return '<li><div><b>' + (n.pinned ? '<span class="bd bd-bad">상단 고정</span> ' : '') + esc(n.title) + '</b><small>' + n.date + '</small></div><div class="fa"><button class="btn btn-line btn-sm" data-act="aPin" data-id="' + n.id + '">' + (n.pinned ? '고정 해제' : '상단 고정') + '</button><button class="btn btn-ghost btn-sm" data-act="aDelN" data-id="' + n.id + '">삭제</button></div></li>'; }).join('') + '</ul>' +
      '<form class="form" data-sub="aNotice"><h3>새 공지 쓰기</h3><div class="fg"><label class="lb" for="n-t">제목</label><input id="n-t"></div><div class="fg"><label class="lb" for="n-b">내용</label><textarea id="n-b" rows="4"></textarea></div><p class="err" id="n-e" hidden>제목과 내용을 모두 입력해 주세요.</p><button class="btn btn-fill btn-sm" type="submit">공지 등록</button></form>') + '</div><div>' +
      card('자주 묻는 질문', '<ul class="mng">' + S.faqs.map(function (f) { return '<li><div><b>' + esc(f.q) + '</b><small>' + esc(f.cat) + ' · ' + (f.show ? '노출' : '숨김') + '</small></div><div class="fa"><button class="btn btn-line btn-sm" data-act="aFaq" data-id="' + f.id + '">' + (f.show ? '숨기기' : '노출') + '</button><button class="btn btn-ghost btn-sm" data-act="aDelF" data-id="' + f.id + '">삭제</button></div></li>'; }).join('') + '</ul>') + '</div></div>' });
  }
  G.SUB.aNotice = function () { var t = document.getElementById('n-t').value.trim(), b = document.getElementById('n-b').value.trim(); if (!t || !b) { document.getElementById('n-e').hidden = false; return; } var id = Math.max.apply(null, S.notices.map(function (n) { return n.id; })) + 1; S.notices.unshift({ id: id, pinned: false, title: t, date: SITE.today, body: b }); G.log('공지 등록: ' + t); G.toast('공지를 등록했어요.'); G.rerender(); };
  G.ACT.aPin = function (el) { var n = S.notices.filter(function (x) { return String(x.id) === el.dataset.id; })[0]; n.pinned = !n.pinned; G.rerender(); };
  G.ACT.aDelN = function (el) { S.notices = S.notices.filter(function (x) { return String(x.id) !== el.dataset.id; }); G.log('공지 삭제 ' + el.dataset.id); G.rerender(); };
  G.ACT.aFaq = function (el) { var f = S.faqs.filter(function (x) { return String(x.id) === el.dataset.id; })[0]; f.show = !f.show; G.rerender(); };
  G.ACT.aDelF = function (el) { S.faqs = S.faqs.filter(function (x) { return String(x.id) !== el.dataset.id; }); G.log('FAQ 삭제 ' + el.dataset.id); G.rerender(); };

  /* ----- 1:1 문의 ----- */
  function inq() {
    return A({ title: '1:1 문의', heading: '1:1 문의', sub: '접수된 문의에 답변해요.', html: card('', '<ul class="qa">' + S.inquiries.map(function (q) { return '<li><div class="qa-h"><span class="bd bd-' + (q.status === '답변 완료' ? 'ok' : 'warn') + '">' + q.status + '</span><b>' + esc(q.type) + '</b>' + (q.svc ? '<span class="tag">' + esc(G.sv(q.svc).name) + '</span>' : '') + '<small>' + q.id + ' · ' + q.at + ' · ' + esc(uname(q.user)) + '</small></div><p>' + esc(q.text) + '</p>' + (q.answer ? '<p class="ans"><b>답변</b> ' + esc(q.answer) + '</p>' : '<div class="qa-f"><textarea id="ans-' + q.id + '" rows="2" placeholder="답변을 입력하세요."></textarea><button class="btn btn-fill btn-sm" data-act="aAns" data-id="' + q.id + '">답변 등록</button></div>') + '</li>'; }).join('') + '</ul>') });
  }
  G.ACT.aAns = function (el) { var q = S.inquiries.filter(function (x) { return x.id === el.dataset.id; })[0], t = document.getElementById('ans-' + q.id).value.trim(); if (t.length < 3) { G.toast('답변을 입력해 주세요.'); return; } q.answer = t; q.status = '답변 완료'; G.log('문의 답변 ' + q.id); G.toast('답변을 등록했어요.'); G.rerender(); };

  /* ----- 통계·정산 ----- */
  function stats() {
    var by = {}, st = {}; S.apps.forEach(function (a) { by[a.svc] = (by[a.svc] || 0) + 1; st[a.status] = (st[a.status] || 0) + 1; });
    var mx = Math.max.apply(null, Object.keys(by).map(function (k) { return by[k]; }).concat([1])), mx2 = Math.max.apply(null, Object.keys(st).map(function (k) { return st[k]; }).concat([1]));
    var rows = S.apps.filter(function (a) { return a.quote && ['APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].indexOf(a.status) >= 0; });
    var tot = rows.reduce(function (s, a) { return s + a.quote.total; }, 0);
    return A({ title: '통계·정산', heading: '통계와 정산', sub: '신청 현황과 승인된 견적 기준의 정산 예시예요.', html: '<div class="ag"><div>' + card('상태별 신청', '<ul class="bars">' + Object.keys(st).map(function (k) { return '<li><span>' + G.stName(k) + '</span><div><i style="width:' + (st[k] / mx2 * 100) + '%"></i></div><b>' + st[k] + '</b></li>'; }).join('') + '</ul>') + '</div><div>' +
      card('서비스별 신청', Object.keys(by).length ? '<ul class="bars">' + Object.keys(by).sort(function (a, b) { return by[b] - by[a]; }).map(function (k) { return '<li><span>' + esc(G.sv(k).name) + '</span><div><i style="width:' + (by[k] / mx * 100) + '%"></i></div><b>' + by[k] + '</b></li>'; }).join('') + '</ul>' : '<p class="small">신청이 없어요.</p>') + '</div></div>' +
      card('정산 요약 (예시 산식)', '<div class="kpis k3"><div class="kpi"><span>승인된 견적 합계</span><b>' + G.fmt(tot) + '</b></div><div class="kpi"><span>정산 대상</span><b>' + rows.length + '건</b></div><div class="kpi"><span>실제 지급</span><b>₩0</b></div></div><div class="tw"><table class="tbl"><thead><tr><th>신청</th><th>서비스</th><th>공급 유형</th><th class="r">총 거래액</th><th>가정 비용·수수료</th></tr></thead><tbody>' + rows.map(function (a) { var s = G.sv(a.svc); return '<tr><td>' + a.no + '</td><td>' + esc(s.name) + '</td><td>' + (a.partner ? '협력업체' : s.op === 'DIRECT' ? '직접 수행' : '미배정') + '</td><td class="r">' + G.fmt(a.quote.total) + '</td><td>' + (a.partner ? '협력업체 계약 수수료 별도' : '인건비·재료비 실비 필요') + '</td></tr>'; }).join('') + '</tbody></table></div><p class="small">거래액과 플랫폼 수익은 다릅니다. 후원금은 매출이 아니며 회계를 분리합니다. PG 정산 대사, 환불 조정, 세금계산서는 서버 연동 후 구현합니다.</p>') });
  }
  function audit() {
    var base = [['2026-10-26 18:00', 'admin', 'G2610-0007 상태 변경: 검토 중'], ['2026-10-24 11:05', 'admin', 'G2610-0004 상태 변경: 고객 승인 대기'], ['2026-10-20 09:00', 'admin', '공지 등록: [안내] 더가넷 웹사이트를 열었습니다']];
    var rows = S.audit.map(function (x) { return [x.at, x.who, x.what]; }).concat(base);
    return A({ title: '감사 로그', heading: '감사 로그', sub: '관리자 작업 기록이에요.', html: card('', '<div class="tw"><table class="tbl"><thead><tr><th>시각</th><th>계정</th><th>내용</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') + '</tbody></table></div>') });
  }

  /* ----- 협력업체 포털 ----- */
  P.partner = function () {
    var me = PARTNERS.filter(function (p) { return p.id === S.partnerView; })[0] || PARTNERS[0];
    var mine = S.apps.filter(function (a) { return a.partner === me.id || (['REVIEWING'].indexOf(a.status) >= 0 && me.svc.indexOf(a.svc) >= 0 && !a.quote); });
    var rows = mine.map(function (a) {
      var s = G.sv(a.svc), act = '';
      if (a.status === 'REVIEWING') act = '<div class="pa"><input type="number" min="0" step="1000" id="pq-' + a.no + '" placeholder="견적 금액" aria-label="견적 금액"><button class="btn btn-fill btn-sm" data-act="pQuote" data-no="' + a.no + '">견적 회신</button></div>';
      else if (a.status === 'APPROVED') act = '<div class="pa"><input type="datetime-local" id="pd-' + a.no + '" aria-label="일정"><button class="btn btn-fill btn-sm" data-act="pSched" data-no="' + a.no + '">일정 확정</button></div>';
      else if (a.status === 'SCHEDULED') act = '<button class="btn btn-fill btn-sm" data-act="pStart" data-no="' + a.no + '">진행 시작</button>';
      else if (a.status === 'IN_PROGRESS') act = '<button class="btn btn-fill btn-sm" data-act="pDone" data-no="' + a.no + '">완료 보고</button>';
      else act = '<span class="small">처리할 작업 없음</span>';
      return '<tr><td>' + a.no + '</td><td><b>' + esc(s.name) + '</b><small>' + esc(a.region || '-') + '</small></td><td>' + G.stBadge(a.status) + '</td><td>' + (a.schedule ? a.schedule.slice(0, 16) : '-') + '</td><td>' + act + '</td></tr>';
    }).join('');
    var html = '<div class="pt"><header class="pt-h"><div class="wrap pt-in"><a class="logo-m" href="#home">THE GARNET<i>.</i></a><span class="pt-t">협력업체 포털 (시연)</span><label class="pt-s"><span class="sr">업체 선택</span><select data-on="change:pPick">' + PARTNERS.map(function (p) { return '<option value="' + p.id + '"' + (p.id === me.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select></label></div></header>' +
      '<main id="main" class="wrap pt-b"><h1 class="h2">' + esc(me.name) + '</h1><p class="lead">담당 서비스 ' + me.svc.map(function (id) { return '<span class="tag">' + esc(G.sv(id).name) + '</span>'; }).join('') + ' · 승인 전에는 고객 개인정보를 최소로만 보여 줍니다.</p>' +
      '<section class="ac"><h2>요청과 작업</h2>' + (rows ? '<div class="tw"><table class="tbl"><thead><tr><th>신청</th><th>서비스·지역</th><th>상태</th><th>일정</th><th>작업</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : G.empty('지금 처리할 요청이 없어요. 관리자 화면에서 협력업체를 배정하면 이곳에 나타나요.')) + '<p class="small">견적 회신 → 고객 승인 → 일정 확정 → 진행 → 완료 보고 순서로 이어져요. 실제 운영에서는 견적 버전, 작업 지시, 사진 보고, 정산이 서버에서 처리됩니다.</p></section></main></div>' + G.dockHtml() + '<div class="toast" id="toast" role="status" aria-live="polite"></div>';
    return { title: '협력업체 포털', layout: 'bare', html: html.replace('</main>', (G.partnerSettleHtml ? G.partnerSettleHtml(me) : '') + '</main>') };
  };
  G.INP.pPick = function (el) { S.partnerView = el.value; G.rerender(); };
  G.ACT.pQuote = function (el) { var a = G.app(el.dataset.no), v = +document.getElementById('pq-' + a.no).value; if (!(v > 0)) { G.toast('견적 금액을 입력해 주세요.'); return; } a.quote = { items: [['협력업체 회신 견적', v]], total: v, memo: '' }; G.addHist(a, 'QUOTED', '협력업체', '협력업체가 견적을 회신했습니다.'); G.toast('견적을 회신했어요. 운영자가 확인해 고객에게 안내합니다.'); G.rerender(); };
  G.ACT.pSched = function (el) { var a = G.app(el.dataset.no), v = document.getElementById('pd-' + a.no).value; if (!v) { G.toast('일정을 선택해 주세요.'); return; } a.schedule = v.replace('T', ' '); G.addHist(a, 'SCHEDULED', '협력업체', '일정을 확정했습니다.'); G.toast('일정을 확정했어요.'); G.rerender(); };
  G.ACT.pStart = function (el) { G.addHist(G.app(el.dataset.no), 'IN_PROGRESS', '협력업체', '작업을 시작했습니다.'); G.toast('진행을 시작했어요.'); G.rerender(); };
  G.ACT.pDone = function (el) { G.addHist(G.app(el.dataset.no), 'COMPLETED', '협력업체', '작업 완료를 보고했습니다.'); G.toast('완료를 보고했어요.'); G.rerender(); };
})();
