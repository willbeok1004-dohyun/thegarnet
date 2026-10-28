/* 마이페이지 */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES;

  var NAVI = [['apps', '신청 내역', 'list'], ['inq', '1:1 문의', 'message'], ['plan', '멤버십', 'gem'], ['favs', '찜한 서비스', 'heart'], ['club', '이웃 나눔', 'swap', 'club-mine'], ['reviews', '후기', 'star'], ['profile', '마이 라이프 프로필', 'user'], ['info', '내 정보', 'lock']];
  function myApps() { return S.apps.filter(function (a) { return S.user && a.user === S.user.id; }); }
  function shell(cur, title, body, sub) {
    var u = S.user, apps = myApps(), todo = apps.filter(function (a) { return a.status === 'WAITING_APPROVAL' || a.status === 'NEED_INFO'; }).length;
    return { title: title, html: '<section class="mp-h"><div class="wrap"><p class="kick">MY GARNET</p><h1 class="h2">' + esc(u.name) + '님의 공간</h1><p class="lead">' + (todo ? '확인이 필요한 신청이 <b>' + todo + '건</b> 있어요.' : '지금 확인할 일이 없어요. 천천히 둘러보세요.') + '</p></div></section>' +
      '<section class="sec sec-tight"><div class="wrap mp"><nav class="mp-nav" aria-label="마이페이지">' + NAVI.map(function (n) { return '<a href="#' + (n[3] || 'my-' + n[0]) + '" class="' + (cur === n[0] ? 'on' : '') + '">' + ico(n[2], 18) + '<span>' + n[1] + '</span>' + (n[0] === 'apps' && todo ? '<i class="dot-n">' + todo + '</i>' : '') + '</a>'; }).join('') + '</nav><div class="mp-main"><h2 class="h3">' + title + '</h2>' + (sub ? '<p class="small mb">' + sub + '</p>' : '') + body + '</div></div></section>' };
  }
  P.my = function (arg) {
    if (!S.user) { S.ret = 'my' + (arg ? '-' + arg : ''); G.save(); var l = P.login(); l.title = '로그인'; return l; }
    var a = arg || 'apps';
    if (a.indexOf('app-') === 0) return detail(a.slice(4));
    return ({ apps: apps, inq: inq, plan: plan, favs: favs, reviews: reviews, profile: profile, info: info }[a] || apps)();
  };

  function apps() {
    var list = myApps(), todo = list.filter(function (a) { return a.status === 'WAITING_APPROVAL' || a.status === 'NEED_INFO'; });
    var body = (todo.length ? '<div class="callout warn">' + ico('bell', 20) + '<div><strong>확인이 필요한 신청</strong><ul class="ul">' + todo.map(function (a) { return '<li><a href="#my-app-' + a.no + '">' + esc(G.sv(a.svc).name) + '</a> · ' + (a.status === 'WAITING_APPROVAL' ? '견적을 확인하고 승인해 주세요.' : '운영자가 추가 정보를 요청했어요.') + '</li>'; }).join('') + '</ul></div></div>' : '') +
      (list.length ? '<div class="alist">' + list.map(function (a) {
        var s = G.sv(a.svc), q = a.quote ? G.fmt(a.quote.total) : '견적 전';
        return '<a class="ai" href="#my-app-' + a.no + '"><img src="img/' + s.id + '.jpg" alt=""><div class="ai-b"><div class="ai-t"><b>' + esc(s.name) + '</b>' + G.stBadge(a.status) + '</div><p>' + a.no + ' · 접수 ' + G.dshort(a.at) + (a.schedule ? ' · 일정 ' + a.schedule.slice(0, 16) : '') + '</p>' + G.progress(a) + '</div><span class="ai-q">' + q + '</span></a>';
      }).join('') + '</div>' : G.empty('아직 신청 내역이 없어요. 마음에 드는 돌봄을 골라 시작해 보세요.', '<a class="btn btn-fill btn-sm" href="#apply">서비스 신청하기</a>'));
    return shell('apps', '신청 내역', body, '신청한 서비스의 진행 상태를 확인하고, 견적을 승인하거나 취소할 수 있어요.');
  }

  function detail(no) {
    var a = G.app(no); if (!a || a.user !== S.user.id) return shell('apps', '신청 내역', G.empty('해당 신청을 찾을 수 없어요.', '<a class="btn btn-line btn-sm" href="#my-apps">목록으로</a>'));
    var s = G.sv(a.svc), st = a.status, partner = a.partner ? PARTNERS.filter(function (p) { return p.id === a.partner; })[0] : null;
    var rev = S.reviews.filter(function (r) { return r.app === a.no; })[0];
    var act = '';
    if (st === 'WAITING_APPROVAL') act += '<div class="act-b"><h4>견적을 확인해 주세요</h4><p class="small">승인하시면 승인한 범위 안에서만 일정 조율과 진행이 시작돼요. 마음에 걸리는 점은 수정 요청으로 남길 수 있어요.</p><button class="btn btn-fill btn-block" data-act="mApprove" data-no="' + no + '">견적 승인하기</button><button class="btn btn-line btn-block" data-act="mRevise" data-no="' + no + '">수정 요청하기</button></div>';
    if (st === 'QUOTED') act += '<div class="act-b"><h4>견적이 준비됐어요</h4><p class="small">운영자가 승인 요청을 보내면 이곳에서 바로 승인할 수 있어요.</p></div>';
    if (st === 'NEED_INFO') act += '<div class="act-b"><h4>추가 정보를 알려주세요</h4><textarea id="reply" rows="4" placeholder="운영자 요청에 대한 답변을 적어 주세요."></textarea><p class="err" id="replyE" hidden>답변을 3자 이상 적어 주세요.</p><button class="btn btn-fill btn-block" data-act="mReply" data-no="' + no + '">답변 보내기</button></div>';
    if (CUST_CANCELLABLE.indexOf(st) >= 0) act += '<div class="act-b"><button class="btn btn-ghost btn-block" data-act="mCancelAsk" data-no="' + no + '">' + (PRE_APPROVAL.indexOf(st) >= 0 ? '신청 취소하기' : '취소 요청하기') + '</button><div class="cfm" id="cfm" hidden><p class="small">' + (PRE_APPROVAL.indexOf(st) >= 0 ? '승인 이전이라 별도 비용 없이 바로 취소돼요.' : '운영자가 진행 단계에 따라 환불 기준을 확인해 처리해요. <a href="#refund">환불 정책</a>') + '</p><div class="fa"><button class="btn btn-danger btn-sm" data-act="mCancelDo" data-no="' + no + '">네, 취소할게요</button><button class="btn btn-line btn-sm" data-act="mCancelAsk" data-no="' + no + '">그대로 둘게요</button></div></div></div>';
    if (st === 'COMPLETED') {
      act += rev ? '<div class="act-b"><h4>남기신 후기</h4><div>' + G.starFill(rev.stars) + '</div><p class="small">' + esc(rev.text) + '</p></div>'
        : '<div class="act-b"><h4>후기를 남겨 주세요</h4><div class="stars" id="rvStars" data-v="5" role="radiogroup" aria-label="별점">' + [1, 2, 3, 4, 5].map(function (i) { return '<button type="button" data-act="rvStar" data-v="' + i + '" aria-label="' + i + '점" class="' + (i <= 5 ? 'on' : '') + '">' + G.starFill(1).replace('star on', 'star on') + '</button>'; }).join('') + '</div><textarea id="rvText" rows="4" placeholder="이용 경험을 10자 이상 적어 주세요."></textarea><p class="err" id="rvE" hidden>후기를 10자 이상 적어 주세요.</p><button class="btn btn-fill btn-block" data-act="mReview" data-no="' + no + '">후기 등록</button></div>';
    }
    var kv = Object.keys(a.data).map(function (k) { return '<div class="kv"><dt>' + esc(k) + '</dt><dd>' + esc(a.data[k]) + '</dd></div>'; }).join('');
    var body = '<div class="dt"><div class="dt-l">' + '<div class="dt-top"><img src="img/' + s.id + '.jpg" alt=""><div><p class="small">' + a.no + '</p><h3>' + esc(s.name) + '</h3>' + G.stBadge(st) + '</div></div>' + G.progress(a) +
      (a.status === 'REJECTED' || a.status === 'CANCELLED' || a.status === 'REFUNDED' ? '' : '') +
      '<h4>신청 내용</h4><dl class="sum"><div class="kv"><dt>접수 시각</dt><dd>' + a.at + '</dd></div>' + (a.region ? '<div class="kv"><dt>희망 지역</dt><dd>' + esc(a.region) + '</dd></div>' : '') + (a.date ? '<div class="kv"><dt>희망 일자</dt><dd>' + a.date + (a.time ? ' · ' + esc(a.time) : '') + '</dd></div>' : '') + kv + '<div class="kv"><dt>연락처</dt><dd>' + esc(a.phone) + '</dd></div><div class="kv"><dt>요청 사항</dt><dd>' + G.nl(a.note) + '</dd></div></dl>' +
      (a.quote ? '<h4>견적</h4><table class="tbl"><tbody>' + a.quote.items.map(function (i) { return '<tr><td>' + esc(i[0]) + '</td><td class="r">' + G.fmt(i[1]) + '</td></tr>'; }).join('') + '<tr class="tot"><td>합계</td><td class="r">' + G.fmt(a.quote.total) + '</td></tr></tbody></table>' + (a.quote.memo ? '<p class="small">' + esc(a.quote.memo) + '</p>' : '') + '<p class="small">견적은 승인하기 전까지 확정된 주문이 아니며 비용이 청구되지 않아요.</p>' : '') +
      (a.schedule ? '<h4>확정 일정</h4><p class="sched">' + ico('calendar', 18) + a.schedule + '</p>' : '') +
      (partner ? '<h4>담당 협력업체</h4><p class="small">' + esc(partner.name) + ' · 수행 범위와 책임은 승인 단계에서 안내한 내용을 따릅니다.</p>' : '') +
      '<h4>진행 이력</h4><ol class="hist">' + a.hist.slice().reverse().map(function (h) { return '<li><span class="hd-t">' + G.stBadge(h[0]) + '<time>' + h[1] + '</time><em>' + esc(h[2]) + '</em></span>' + (h[3] ? '<p>' + esc(h[3]) + '</p>' : '') + '</li>'; }).join('') + '</ol></div><aside class="dt-r">' + (act || '<div class="act-b"><p class="small">지금 필요한 작업은 없어요.</p></div>') + '<a class="lnk" href="#svc-' + s.id + '">서비스 상세 보기 ' + ico('arrow-right', 16) + '</a></aside></div>';
    var out = shell('apps', '신청 상세', '<p class="mb"><a class="lnk" href="#my-apps">' + ico('arrow-left', 16) + ' 신청 내역</a></p>' + body);
    out.mount = function () { };
    return out;
  }
  function chg(no, to, memo, by) { var a = G.app(no); if (!a) return; G.addHist(a, to, by || '고객', memo); G.rerender(); }
  G.ACT.mApprove = function (el) { chg(el.dataset.no, 'APPROVED', '견적을 승인했습니다.'); G.toast('견적을 승인했어요. 일정은 운영자가 조율해 안내드려요.'); };
  G.ACT.mRevise = function (el) { chg(el.dataset.no, 'REVIEWING', '견적 수정을 요청했습니다.'); G.toast('수정 요청을 보냈어요.'); };
  G.ACT.mReply = function (el) { var t = document.getElementById('reply'); if (t.value.trim().length < 3) { document.getElementById('replyE').hidden = false; return; } chg(el.dataset.no, 'REVIEWING', t.value.trim()); G.toast('답변을 보냈어요. 운영자가 다시 검토합니다.'); };
  G.ACT.mCancelAsk = function () { var c = document.getElementById('cfm'); if (c) c.hidden = !c.hidden; };
  G.ACT.mCancelDo = function (el) { var a = G.app(el.dataset.no); var pre = PRE_APPROVAL.indexOf(a.status) >= 0; chg(a.no, pre ? 'CANCELLED' : 'CANCEL_REQUESTED', pre ? '승인 이전 고객 취소' : '고객이 취소를 요청했습니다.'); G.toast(pre ? '신청을 취소했어요.' : '취소 요청을 접수했어요.'); };
  G.ACT.rvStar = function (el) { var box = document.getElementById('rvStars'), v = +el.dataset.v; box.dataset.v = v; box.querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('on', i < v); var s = b.querySelector('svg'); s.setAttribute('fill', i < v ? 'currentColor' : 'none'); }); };
  G.ACT.mReview = function (el) {
    var a = G.app(el.dataset.no), t = document.getElementById('rvText').value.trim(); if (t.replace(/\s/g, '').length < 10) { document.getElementById('rvE').hidden = false; return; }
    S.reviews.unshift({ id: 'R' + (S.reviews.length + 1), svc: a.svc, app: a.no, stars: +document.getElementById('rvStars').dataset.v, text: t, who: S.user.name.slice(0, 1) + '*' + S.user.name.slice(-1), at: SITE.today }); G.toast('후기를 등록했어요. 고맙습니다.'); G.rerender();
  };

  function inq() {
    var mine = S.inquiries.filter(function (q) { return q.user === S.user.id; });
    return shell('inq', '1:1 문의', (mine.length ? '<ul class="nl">' + mine.map(function (q) { return '<li class="q"><div><span class="bd bd-' + (q.status === '답변 완료' ? 'ok' : 'warn') + '">' + q.status + '</span><b>' + esc(q.type) + '</b><time>' + q.at + '</time></div><p>' + esc(q.text) + '</p>' + (q.answer ? '<p class="ans"><b>답변</b> ' + esc(q.answer) + '</p>' : '') + '</li>'; }).join('') + '</ul>' : G.empty('남긴 문의가 없어요.')) + '<p class="fa"><a class="btn btn-fill btn-sm" href="#inquiry">새 문의 남기기</a></p>');
  }
  function plan() {
    var p = PLANS[S.plan];
    return shell('plan', '멤버십', '<div class="card plan-now"><p class="kick">현재 등급 (시연)</p><h3>' + p[0] + '</h3><p class="pl-p">' + (p[1] ? '<b>' + G.fmt(p[1]) + '</b><span>/월</span>' : '<b>무료</b>') + '</p><p>' + p[2] + '</p><a class="btn btn-line btn-sm" href="#plans">등급 비교하고 바꿔 보기</a></div><p class="small">시범 가격이며 실제 결제는 이루어지지 않아요. 무료 등급이어도 건별 구매와 신청은 모두 가능합니다.</p>');
  }
  function favs() {
    var l = S.favs.map(G.sv).filter(Boolean);
    return shell('favs', '찜한 서비스', l.length ? '<div class="grid-sc g2">' + l.map(function (s) { return G.svcCard(s); }).join('') + '</div>' : G.empty('아직 찜한 서비스가 없어요. 마음에 드는 서비스의 하트를 눌러 보세요.', '<a class="btn btn-fill btn-sm" href="#services">서비스 둘러보기</a>'), '찜은 구매나 신청이 아니라 관심 기록이에요.');
  }
  function reviews() {
    var mine = S.reviews.filter(function (r) { var a = G.app(r.app); return a && a.user === S.user.id; });
    var wait = myApps().filter(function (a) { return a.status === 'COMPLETED' && !S.reviews.some(function (r) { return r.app === a.no; }); });
    return shell('reviews', '후기', (wait.length ? '<div class="callout">' + ico('star', 20) + '<div><strong>후기를 기다리고 있어요</strong><ul class="ul">' + wait.map(function (a) { return '<li><a href="#my-app-' + a.no + '">' + esc(G.sv(a.svc).name) + '</a> · 이용을 마친 서비스예요.</li>'; }).join('') + '</ul></div></div>' : '') +
      (mine.length ? mine.map(function (r) { return '<div class="rv"><div>' + G.starFill(r.stars) + '</div><p>' + esc(r.text) + '</p><small>' + esc(G.sv(r.svc).name) + ' · ' + r.at + '</small></div>'; }).join('') : G.empty('작성한 후기가 없어요.')), '실제로 이용을 마친 서비스에만 후기를 남길 수 있어요.');
  }
  function profile() {
    var p = S.profile;
    return shell('profile', '마이 라이프 프로필', '<form class="card form" data-sub="profile"><p class="small mb">선물과 맞춤 제작에 쓰이는 선택 정보예요. 입력하지 않아도 모든 서비스를 이용할 수 있고, 언제든 수정·삭제할 수 있어요.</p><div class="fgrid"><div class="fg"><label class="lb" for="p-c">의류 사이즈</label><select id="p-c"><option value="">선택하지 않음</option>' + ['SS', 'S', 'M', 'L', 'XL', 'XXL'].map(function (x) { return '<option' + (p.clothes === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div><div class="fg"><label class="lb" for="p-s">신발 사이즈 (mm)</label><select id="p-s"><option value="">선택하지 않음</option>' + Array.apply(null, Array(21)).map(function (_, i) { var v = String(200 + i * 5); return '<option' + (p.shoe === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></div><div class="fg"><label class="lb" for="p-r">반지 호수</label><input id="p-r" value="' + esc(p.ring) + '" placeholder="예: 12호"></div><div class="fg"><label class="lb" for="p-col">선호 색상</label><select id="p-col"><option value="">선택 안 함</option>' + ['아이보리', '가넷', '그린', '파스텔', '블랙'].map(function (x) { return '<option' + (p.color === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div><div class="fg full"><label class="lb" for="p-m">기념일 메모</label><textarea id="p-m" rows="3" placeholder="가족·지인의 실명이나 상세 정보는 적지 마세요.">' + esc(p.memo) + '</textarea></div></div><div class="fa"><button class="btn btn-fill" type="submit">저장하기</button></div></form>');
  }
  G.SUB.profile = function () { S.profile = { clothes: document.getElementById('p-c').value, shoe: document.getElementById('p-s').value, ring: document.getElementById('p-r').value, color: document.getElementById('p-col').value, memo: document.getElementById('p-m').value }; G.save(); G.toast('프로필을 저장했어요.'); };
  function info() {
    var u = S.user;
    return shell('info', '내 정보', '<form class="card form" data-sub="info"><div class="fgrid"><div class="fg"><label class="lb" for="i-n">이름</label><input id="i-n" value="' + esc(u.name) + '"></div><div class="fg"><label class="lb" for="i-e">이메일</label><input id="i-e" value="' + esc(u.email) + '" disabled></div><div class="fg"><label class="lb" for="i-p">연락처</label><input id="i-p" value="' + esc(u.phone || '') + '" inputmode="tel"></div></div><label class="chk"><input type="checkbox"><span>소식과 혜택 안내를 받겠습니다. (언제든 철회할 수 있어요)</span></label><div class="fa"><button class="btn btn-fill" type="submit">저장하기</button></div></form>' +
      '<div class="card danger"><h3>회원 탈퇴</h3><p class="small">진행 중인 신청이 있으면 완료 또는 취소 후 탈퇴할 수 있어요. 법정 보관이 필요한 이력은 개인정보를 비식별 처리해 보관합니다.</p><button class="btn btn-ghost btn-sm" data-act="wdAsk">탈퇴 안내 보기</button><div id="wd" hidden><p class="small">시연 화면에서는 로그아웃만 진행해요.</p><button class="btn btn-danger btn-sm" data-act="wdDo">탈퇴하기 (시연)</button></div></div>');
  }
  G.SUB.info = function () { S.user.name = document.getElementById('i-n').value.trim() || S.user.name; S.user.phone = document.getElementById('i-p').value.trim(); G.toast('내 정보를 저장했어요.'); G.rerender(); };
  G.ACT.wdAsk = function () { document.getElementById('wd').hidden = false; };
  G.ACT.wdDo = function () { S.user = null; G.save(); G.toast('시연용 탈퇴를 마쳤어요.'); G.go('home'); G.render(true); };
})();
