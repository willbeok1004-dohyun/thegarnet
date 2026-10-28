/* 이웃 나눔 — 관리자 안전 검증 (등록 검토 · 거래 검증 · 신고 조치) */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, C = CLUB;
  var K = function () { return S.club; };
  var A = function (o) { o.layout = 'admin'; return o; };
  var card = function (t, body, extra) { return '<section class="ac ' + (extra || '') + '">' + (t ? '<h2>' + t + '</h2>' : '') + body + '</section>'; };
  var nm = function (id) { return G.nbMember(id).name; };
  var money = function (p) { return p.pay === 'FREE' ? '무료' : G.fmt(p.price); };
  var payBd = function (pay) { var m = C.PAY[pay]; return '<span class="bd bd-' + m.tone + '">' + m.name + '</span>'; };
  var RISK = /(선입금|먼저\s*(보내|입금)|계좌|카카오|카톡|오픈\s*채팅|https?:|010-?\d{3,4}-?\d{4}|현금)/;

  function tabs(cur) {
    var k = K(), np = k.posts.filter(function (p) { return p.status === 'PENDING_REVIEW'; }).length, nd = k.deals.filter(function (d) { return d.status === 'ACCEPTED' || d.status === 'HELD'; }).length, nr = k.reports.filter(function (r) { return r.status === '접수'; }).length;
    var t = [['club', '개요', 0], ['club-posts', '등록 검토', np], ['club-deals', '거래 검증', nd], ['club-reports', '신고', nr], ['club-rules', '기준', 0]];
    return '<nav class="tabs" aria-label="이웃 나눔 관리">' + t.map(function (x) { return '<a href="#admin-' + x[0] + '" class="' + (cur === x[0] ? 'on' : '') + '">' + x[1] + (x[2] ? ' <i class="dot-n">' + x[2] + '</i>' : '') + '</a>'; }).join('') + '</nav>';
  }
  function wrap(cur, title, sub, html) { return A({ title: title, heading: title, sub: sub, html: tabs(cur) + html }); }

  G.adminClub = function (arg) {
    if (arg === 'club') return overview();
    if (arg === 'club-posts') return posts();
    if (arg === 'club-deals') return deals();
    if (arg === 'club-reports') return reports();
    if (arg === 'club-rules') return rulesP();
    if (arg.indexOf('club-post-') === 0) return postDetail(arg.slice(10));
    if (arg.indexOf('club-deal-') === 0) return dealDetail(arg.slice(10));
    return overview();
  };

  /* ----- 개요 ----- */
  function overview() {
    var k = K(), c = function (f) { return k.posts.filter(f).length; };
    var kp = [['등록 검토 대기', c(function (p) { return p.status === 'PENDING_REVIEW'; }), 'warn'], ['거래 검증 대기', k.deals.filter(function (d) { return d.status === 'ACCEPTED' || d.status === 'HELD'; }).length, 'warn'], ['신고 접수', k.reports.filter(function (r) { return r.status === '접수'; }).length, 'bad'], ['공개 중인 글', c(function (p) { return p.status === 'PUBLISHED'; }), ''], ['완료된 나눔', k.deals.filter(function (d) { return d.status === 'DONE'; }).length, '']];
    var qp = k.posts.filter(function (p) { return p.status === 'PENDING_REVIEW'; }), qd = k.deals.filter(function (d) { return d.status === 'ACCEPTED' || d.status === 'HELD'; });
    return wrap('club', '이웃 나눔 검증', '회원끼리 주고받는 나눔이 안전한지 두 번 확인해요. 글이 공개되기 전과, 연락처가 열리기 전이에요.', '<div class="kpis k5">' + kp.map(function (x) { return '<div class="kpi ' + x[2] + '"><span>' + x[0] + '</span><b>' + x[1] + '</b></div>'; }).join('') + '</div>' +
      '<div class="ag"><div>' + card('1단계 · 등록 검토 대기', qp.length ? '<ul class="todo">' + qp.map(function (p) { return '<li><a href="#admin-club-post-' + p.id + '"><span><b>' + esc(p.title) + '</b>' + payBd(p.pay) + (RISK.test(p.body) ? '<span class="bd bd-bad">의심 표현</span>' : '') + '</span><em>' + p.id + ' · ' + esc(nm(p.owner)) + '</em>' + ico('chev-right', 16) + '</a></li>'; }).join('') + '</ul>' : '<p class="small">검토할 글이 없어요.</p>') +
      card('2단계 · 거래 검증 대기', qd.length ? '<ul class="todo">' + qd.map(function (d) { var p = G.nbPost(d.post); return '<li><a href="#admin-club-deal-' + d.id + '"><span><b>' + esc(p.title) + '</b>' + G.nbDealBd(d.status) + '</span><em>' + d.id + ' · ' + esc(nm(d.req)) + ' ↔ ' + esc(nm(d.prov)) + '</em>' + ico('chev-right', 16) + '</a></li>'; }).join('') + '</ul>' : '<p class="small">검증할 거래가 없어요.</p>') + '</div>' +
      '<div>' + card('검증 흐름', '<ol class="tl tl-s"><li><span></span><b>회원이 글 등록 → 관리자 등록 검토</b></li><li><span></span><b>공개 후 이웃이 참여 요청 → 글쓴이 수락</b></li><li><span></span><b>관리자 거래 검증(회원·금액·장소) → 연락처 공개</b></li><li><span></span><b>양쪽 완료 확인 → 이웃 나눔 완료</b></li><li><span></span><b>문제가 생기면 신고 → 조치 기록</b></li></ol>') +
      card('유·무료 기준', criteriaTable()) + '</div></div>');
  }
  function criteriaTable() {
    return '<table class="tbl"><tbody>' + Object.keys(C.PAY).map(function (x) { return '<tr><td>' + payBd(x) + '</td><td>' + esc(C.PAY[x].rule) + '</td></tr>'; }).join('') + '</tbody></table>';
  }

  /* ----- 등록 검토 ----- */
  function posts() {
    var k = K(), order = { PENDING_REVIEW: 0, NEED_FIX: 1, PUBLISHED: 2, PAUSED: 3, REJECTED: 4, CLOSED: 5 };
    var rows = k.posts.slice().sort(function (a, b) { return order[a.status] - order[b.status]; });
    return wrap('club-posts', '등록 검토', '글이 공개되기 전에 금지 항목과 금액 기준을 확인해요.', card('', '<div class="tw"><table class="tbl"><thead><tr><th>글</th><th>작성</th><th>유·무료</th><th class="r">금액</th><th>등록</th><th>상태</th></tr></thead><tbody>' + rows.map(function (p) {
      return '<tr class="lk" data-act="goto" data-to="admin-club-post-' + p.id + '"><td><a href="#admin-club-post-' + p.id + '">' + esc(p.title) + '</a><small>' + p.id + '</small></td><td>' + esc(nm(p.owner)) + '</td><td>' + payBd(p.pay) + '</td><td class="r">' + money(p) + '</td><td>' + p.at.slice(0, 10) + '</td><td>' + G.nbPostBd(p.status) + '</td></tr>';
    }).join('') + '</tbody></table></div>'));
  }
  function autoChecks(p) {
    var out = [];
    out.push(RISK.test(p.body + ' ' + p.title) ? ['bad', '외부 결제·연락처 유도로 보이는 표현이 있어요.'] : ['ok', '외부 결제·연락처 유도 표현이 없어요.']);
    var lim = p.pay === 'COST' ? C.LIMIT.COST : p.pay === 'PAID' ? C.LIMIT.PAID : 0;
    out.push(p.pay === 'FREE' ? (p.price ? ['bad', '무료인데 금액이 입력돼 있어요.'] : ['ok', '무료 글이고 금액이 없어요.']) : p.price > lim ? ['bad', '금액이 기준(' + G.fmt(lim) + ')을 넘어요.'] : ['ok', '금액이 기준(' + G.fmt(lim) + ') 안에 있어요.']);
    var m = G.nbMember(p.owner); out.push(m.status === '활성' ? ['ok', '작성 회원 상태가 정상이에요.'] : ['bad', '작성 회원 상태: ' + m.status]);
    var rc = K().reports.filter(function (r) { return r.post && G.nbPost(r.post) && G.nbPost(r.post).owner === p.owner; }).length; out.push(rc ? ['warn', '작성 회원이 받은 신고 ' + rc + '건'] : ['ok', '작성 회원의 신고 이력이 없어요.']);
    return '<ul class="nb-auto">' + out.map(function (o) { return '<li class="' + o[0] + '">' + ico(o[0] === 'ok' ? 'check' : 'info', 16) + '<span>' + o[1] + '</span></li>'; }).join('') + '</ul>';
  }
  function postDetail(id) {
    var p = G.nbPost(id); if (!p) return wrap('club-posts', '글을 찾을 수 없어요', '', '<a class="lnk" href="#admin-club-posts">목록으로</a>');
    var open = p.status === 'PENDING_REVIEW', t = G.nbTrust(p.owner);
    var form = open ? '<form class="stf" data-sub="acPost" data-id="' + p.id + '" novalidate><div class="fg"><span class="lb">검토 확인 항목</span>' + C.POST_CHECK.map(function (c, i) { return '<label class="chk"><input type="checkbox" class="ck-p" id="cp' + i + '"><span>' + esc(c) + '</span></label>'; }).join('') + '</div>' +
      '<div class="fg"><label class="lb" for="ap-d">결정</label><select id="ap-d"><option value="PUBLISHED">승인 · 공개</option><option value="NEED_FIX">보완 요청</option><option value="REJECTED">등록 불가</option></select></div><div class="fg"><label class="lb" for="ap-m">작성 회원에게 보이는 메모</label><textarea id="ap-m" rows="3" placeholder="보완·반려 사유는 꼭 적어 주세요."></textarea></div><p class="err" id="ap-e" hidden></p><button class="btn btn-fill btn-block" type="submit">검토 결과 저장</button></form>' : '<p class="small">이미 처리된 글이에요. 현재 상태: ' + G.nbPostBd(p.status) + '</p>' + (p.status === 'PUBLISHED' ? '<button class="btn btn-ghost btn-block" data-act="acPause" data-id="' + p.id + '">게시 중지하기</button>' : p.status === 'PAUSED' ? '<button class="btn btn-line btn-block" data-act="acResume" data-id="' + p.id + '">게시 다시 열기</button>' : '');
    return A({ title: '글 ' + p.id, heading: '등록 검토 · ' + p.id, sub: esc(p.title), html: '<p class="mb"><a class="lnk" href="#admin-club-posts">' + ico('arrow-left', 16) + ' 등록 검토 목록</a></p><div class="ag ag2"><div>' +
      card('글 내용', '<div class="ad-st">' + G.nbPostBd(p.status) + payBd(p.pay) + '<span class="bd bd-mute">' + (p.kind === 'OFFER' ? '드려요' : '찾아요') + '</span></div><dl class="sum"><div class="kv"><dt>제목</dt><dd>' + esc(p.title) + '</dd></div><div class="kv"><dt>분야</dt><dd>' + esc(p.cat) + '</dd></div><div class="kv"><dt>지역·시간</dt><dd>' + esc(p.area) + ' · ' + esc(p.when) + '</dd></div><div class="kv"><dt>금액</dt><dd>' + money(p) + '</dd></div><div class="kv"><dt>이야기</dt><dd>' + G.nl(p.body) + '</dd></div></dl>') +
      card('자동 점검', autoChecks(p) + '<p class="small">자동 점검은 참고용이에요. 최종 판단은 운영자가 해요.</p>') +
      card('작성 회원', '<dl class="sum"><div class="kv"><dt>이름</dt><dd>' + esc(nm(p.owner)) + ' <span class="small">(' + p.owner + ')</span></dd></div><div class="kv"><dt>상태</dt><dd>' + esc(G.nbMember(p.owner).status) + '</dd></div><div class="kv"><dt>이웃 나눔 이력</dt><dd>완료 ' + t.done + '회 · 안전 검증 ' + t.ver + '회</dd></div></dl>') +
      card('처리 이력', '<ol class="hist">' + p.hist.slice().reverse().map(function (h) { return '<li><span class="hd-t">' + G.nbPostBd(h[0]) + '<time>' + h[1] + '</time><em>' + esc(h[2]) + '</em></span>' + (h[3] ? '<p>' + esc(h[3]) + '</p>' : '') + '</li>'; }).join('') + '</ol>') + '</div>' +
      '<div>' + card('검토 결정', form, 'sticky') + '</div></div>' });
  }
  function pch(p, st, memo) { p.status = st; p.hist.push([st, G.now(), '운영자', memo || '']); }
  G.SUB.acPost = function (f) {
    var p = G.nbPost(f.dataset.id), d = document.getElementById('ap-d').value, m = document.getElementById('ap-m').value.trim(), e = document.getElementById('ap-e');
    var all = [].every.call(document.querySelectorAll('.ck-p'), function (c) { return c.checked; });
    if (d === 'PUBLISHED' && !all) { e.textContent = '모든 확인 항목을 체크해야 공개할 수 있어요.'; e.hidden = false; return; }
    if (d !== 'PUBLISHED' && m.length < 5) { e.textContent = '보완·반려 사유를 5자 이상 적어 주세요.'; e.hidden = false; return; }
    pch(p, d, d === 'PUBLISHED' ? (m || '기준 확인 후 공개') : m); G.log('이웃 나눔 글 ' + p.id + ' 검토: ' + C.POST_ST[d][0]); G.save(); G.toast('검토 결과를 저장했어요.'); G.go('admin-club-posts'); G.render(true);
  };
  G.ACT.acPause = function (el) { var p = G.nbPost(el.dataset.id); pch(p, 'PAUSED', '운영자가 게시를 중지했어요.'); G.log('이웃 나눔 글 ' + p.id + ' 게시 중지'); G.toast('게시를 중지했어요.'); G.rerender(); };
  G.ACT.acResume = function (el) { var p = G.nbPost(el.dataset.id); pch(p, 'PUBLISHED', '게시를 다시 열었어요.'); G.log('이웃 나눔 글 ' + p.id + ' 게시 재개'); G.toast('게시를 다시 열었어요.'); G.rerender(); };

  /* ----- 거래 검증 ----- */
  function deals() {
    var k = K(), order = { ACCEPTED: 0, HELD: 1, REQUESTED: 2, VERIFIED: 3, DONE: 4, BLOCKED: 5, DECLINED: 6, CANCELLED: 7 };
    var rows = k.deals.slice().sort(function (a, b) { return order[a.status] - order[b.status]; });
    return wrap('club-deals', '거래 검증', '글쓴이가 수락한 약속을 확인하고, 안전하면 연락처를 열어 줘요.', card('', '<div class="tw"><table class="tbl"><thead><tr><th>약속</th><th>도움 ↔ 받음</th><th>유·무료</th><th class="r">금액</th><th>희망 일시</th><th>상태</th></tr></thead><tbody>' + rows.map(function (d) {
      var p = G.nbPost(d.post);
      return '<tr class="lk" data-act="goto" data-to="admin-club-deal-' + d.id + '"><td><a href="#admin-club-deal-' + d.id + '">' + esc(p.title) + '</a><small>' + d.id + '</small></td><td>' + esc(nm(d.prov)) + ' ↔ ' + esc(nm(d.req)) + '</td><td>' + payBd(p.pay) + '</td><td class="r">' + (d.price > 0 ? G.fmt(d.price) : '-') + '</td><td>' + esc(String(d.date).slice(0, 16)) + '</td><td>' + G.nbDealBd(d.status) + '</td></tr>';
    }).join('') + '</tbody></table></div>'));
  }
  function dealAuto(d, p) {
    var out = [], lim = p.pay === 'COST' ? C.LIMIT.COST : p.pay === 'PAID' ? C.LIMIT.PAID : 0;
    ['req', 'prov'].forEach(function (s) { var m = G.nbMember(d[s]); var rc = K().reports.filter(function (r) { var rp = G.nbPost(r.post); return r.by === d[s] || (rp && rp.owner === d[s]); }).length; out.push(m.status === '활성' ? (rc ? ['warn', nm(d[s]) + '님: 활성 · 신고 관련 ' + rc + '건'] : ['ok', nm(d[s]) + '님: 활성 · 신고 이력 없음']) : ['bad', nm(d[s]) + '님 상태: ' + m.status]); });
    out.push(p.pay === 'FREE' ? ['ok', '무료 약속이에요.'] : d.price > lim ? ['bad', '금액이 기준(' + G.fmt(lim) + ')을 넘어요.'] : ['ok', '금액 ' + G.fmt(d.price) + ' · 기준 안에 있어요.']);
    if (p.pay === 'PAID') { var mc = K().deals.filter(function (x) { return x.prov === d.prov && x.id !== d.id && G.nbPost(x.post).pay === 'PAID' && ['DONE', 'VERIFIED'].indexOf(x.status) >= 0; }).length; out.push(mc >= C.LIMIT.MONTHLY ? ['warn', '이번 달 유료 거래가 ' + C.LIMIT.MONTHLY + '건 이상이에요. 사업자 전환을 안내해 주세요.'] : ['ok', '제공자의 이번 달 유료 거래 ' + mc + '건 (' + C.LIMIT.MONTHLY + '건 미만)']); }
    out.push(/공공장소|주민센터|2인/.test(d.place) ? ['ok', '만남 방식: ' + d.place] : ['warn', '만남 방식 확인이 필요해요: ' + d.place]);
    out.push(RISK.test(d.msg) ? ['bad', '요청 메시지에 외부 결제·연락처 유도 표현이 있어요.'] : ['ok', '요청 메시지에 위험 표현이 없어요.']);
    return '<ul class="nb-auto">' + out.map(function (o) { return '<li class="' + o[0] + '">' + ico(o[0] === 'ok' ? 'check' : 'info', 16) + '<span>' + o[1] + '</span></li>'; }).join('') + '</ul>';
  }
  function dealDetail(id) {
    var d = G.nbDeal(id); if (!d) return wrap('club-deals', '약속을 찾을 수 없어요', '', '<a class="lnk" href="#admin-club-deals">목록으로</a>');
    var p = G.nbPost(d.post), open = d.status === 'ACCEPTED' || d.status === 'HELD';
    var form = open ? '<form class="stf" data-sub="acDeal" data-id="' + d.id + '" novalidate><div class="fg"><span class="lb">검증 확인 항목</span>' + C.DEAL_CHECK.map(function (c, i) { return '<label class="chk"><input type="checkbox" class="ck-d" id="cd' + i + '"><span>' + esc(c) + '</span></label>'; }).join('') + '</div>' +
      '<div class="fg"><label class="lb" for="ad-d">결정</label><select id="ad-d" data-on="change:acDealTo"><option value="VERIFIED">검증 완료 · 연락처 공개</option><option value="HELD">추가 확인 요청</option><option value="BLOCKED">진행 불가</option></select></div>' +
      '<div class="fg"><label class="lb" for="ad-m">회원에게 보이는 메모</label><textarea id="ad-m" rows="3" placeholder="추가 확인·진행 불가 사유는 꼭 적어 주세요."></textarea></div><p class="err" id="ad-e" hidden></p><button class="btn btn-fill btn-block" type="submit">검증 결과 저장</button></form>' : '<p class="small">현재 상태: ' + G.nbDealBd(d.status) + '</p>' + (d.status === 'REQUESTED' ? '<p class="small">글쓴이가 아직 수락하지 않았어요. 수락되면 이곳에서 검증할 수 있어요.</p>' : '');
    return A({ title: '약속 ' + d.id, heading: '거래 검증 · ' + d.id, sub: esc(p.title), html: '<p class="mb"><a class="lnk" href="#admin-club-deals">' + ico('arrow-left', 16) + ' 거래 검증 목록</a></p><div class="ag ag2"><div>' +
      card('약속 내용', '<div class="ad-st">' + G.nbDealBd(d.status) + payBd(p.pay) + '</div><dl class="sum"><div class="kv"><dt>도움을 주는 분</dt><dd>' + esc(nm(d.prov)) + '</dd></div><div class="kv"><dt>도움을 받는 분</dt><dd>' + esc(nm(d.req)) + '</dd></div><div class="kv"><dt>글</dt><dd><a class="lnk" href="#admin-club-post-' + p.id + '">' + esc(p.title) + '</a></dd></div><div class="kv"><dt>금액</dt><dd>' + (d.price > 0 ? G.fmt(d.price) : '금액 없음') + '</dd></div><div class="kv"><dt>희망 일시</dt><dd>' + esc(String(d.date).slice(0, 16)) + '</dd></div><div class="kv"><dt>만남 방식</dt><dd>' + esc(d.place) + '</dd></div><div class="kv"><dt>요청 메시지</dt><dd>' + G.nl(d.msg) + '</dd></div></dl>') +
      card('자동 점검', dealAuto(d, p) + '<p class="small">자동 점검은 참고용이에요. 최종 판단은 운영자가 해요.</p>') +
      card('처리 이력', '<ol class="hist">' + d.hist.slice().reverse().map(function (h) { return '<li><span class="hd-t">' + G.nbDealBd(h[0]) + '<time>' + h[1] + '</time><em>' + esc(h[2]) + '</em></span>' + (h[3] ? '<p>' + esc(h[3]) + '</p>' : '') + '</li>'; }).join('') + '</ol>') + '</div>' +
      '<div>' + card('검증 결정', form, 'sticky') + '</div></div>' });
  }
  G.SUB.acDeal = function (f) {
    var d = G.nbDeal(f.dataset.id), v = document.getElementById('ad-d').value, m = document.getElementById('ad-m').value.trim(), e = document.getElementById('ad-e');
    var all = [].every.call(document.querySelectorAll('.ck-d'), function (c) { return c.checked; });
    if (v === 'VERIFIED' && !all) { e.textContent = '모든 확인 항목을 체크해야 검증을 완료할 수 있어요.'; e.hidden = false; return; }
    if (v !== 'VERIFIED' && m.length < 5) { e.textContent = '사유를 5자 이상 적어 주세요.'; e.hidden = false; return; }
    d.status = v; d.hist.push([v, G.now(), '운영자', v === 'VERIFIED' ? (m || '회원 상태·금액·만남 장소 안전 확인 완료') : m]);
    G.log('이웃 나눔 약속 ' + d.id + ' 검증: ' + C.DEAL_ST[v][0]); G.save(); G.toast(v === 'VERIFIED' ? '검증을 완료했어요. 연락처가 열려요.' : '결과를 저장했어요.'); G.go('admin-club-deals'); G.render(true);
  };
  G.INP.acDealTo = function () { };

  /* ----- 신고 ----- */
  function reports() {
    var k = K();
    return wrap('club-reports', '신고', '회원이 접수한 문제를 확인하고 조치를 남겨요.', card('', k.reports.length ? '<ul class="qa">' + k.reports.map(function (r) {
      var p = G.nbPost(r.post), open = r.status === '접수';
      return '<li><div class="qa-h"><span class="bd bd-' + (open ? 'bad' : 'ok') + '">' + r.status + '</span><b>' + esc(r.why) + '</b><small>' + r.id + ' · ' + r.at + ' · 신고 ' + esc(nm(r.by)) + '</small></div><p>글: <a class="lnk" href="#admin-club-post-' + p.id + '">' + esc(p.title) + '</a> (' + esc(nm(p.owner)) + ')</p><p>' + G.nl(r.note) + '</p>' +
        (open ? '<form class="qa-f" data-sub="acReport" data-id="' + r.id + '"><select id="rr-' + r.id + '" aria-label="조치"><option value="경고">작성 회원 경고</option><option value="중지">게시 중지</option><option value="무혐의">문제 없음으로 종결</option></select><textarea id="rm-' + r.id + '" rows="2" placeholder="조치 메모"></textarea><button class="btn btn-fill btn-sm" type="submit">조치 저장</button></form>' : '<p class="ans"><b>조치</b>' + esc(r.result) + '</p>') + '</li>';
    }).join('') + '</ul>' : '<p class="small">접수된 신고가 없어요.</p>'));
  }
  G.SUB.acReport = function (f) {
    var k = K(), r = k.reports.filter(function (x) { return x.id === f.dataset.id; })[0], a = document.getElementById('rr-' + r.id).value, m = document.getElementById('rm-' + r.id).value.trim();
    if (m.length < 3) { G.toast('조치 메모를 적어 주세요.'); return; }
    r.status = '처리 완료'; r.result = a + ' · ' + m;
    if (a === '중지') { var p = G.nbPost(r.post); if (p && p.status === 'PUBLISHED') pch(p, 'PAUSED', '신고 확인 후 게시 중지: ' + m); }
    G.log('이웃 나눔 신고 ' + r.id + ' 조치: ' + a); G.toast('조치를 저장했어요.'); G.rerender();
  };

  /* ----- 기준 ----- */
  function rulesP() {
    return wrap('club-rules', '이웃 나눔 기준', '시연용 기준값이에요. 운영 정책에 맞게 조정해요.', card('유·무료 기준', criteriaTable() + '<p class="small mt">월 유료 거래 ' + C.LIMIT.MONTHLY + '건 초과 시 사업자 전환 또는 협력업체 심사를 안내해요.</p>') +
      '<div class="ag"><div>' + card('등록 검토 확인 항목', '<ul class="ul">' + C.POST_CHECK.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>') + card('올릴 수 없는 글', '<ul class="ul no">' + C.BANNED.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>') + '</div>' +
      '<div>' + card('거래 검증 확인 항목', '<ul class="ul">' + C.DEAL_CHECK.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>') + card('운영 원칙', '<ul class="ul"><li>더가넷은 결제를 대신 받지 않고, 검증 전에는 연락처를 열지 않아요.</li><li>보완·반려·중지 사유는 회원에게 보이는 메모로 남겨요.</li><li>모든 처리는 감사 로그에 기록돼요.</li></ul>') + '</div></div>');
  }
})();
