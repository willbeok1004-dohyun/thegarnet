/* 이웃 나눔 — 회원 화면 (둘러보기·상세·등록·참여·내 나눔) */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES, C = CLUB;
  var K = function () { return S.club; };

  /* ---------- 조회 ---------- */
  var post = G.nbPost = function (id) { return K().posts.filter(function (p) { return p.id === id; })[0]; };
  var deal = G.nbDeal = function (id) { return K().deals.filter(function (d) { return d.id === id; })[0]; };
  var uid = function () { return S.user ? S.user.id : null; };
  var member = G.nbMember = function (id) { return MEMBERS.filter(function (m) { return m.id === id; })[0] || (S.joined && S.joined.id === id ? { id: id, name: S.joined.name, phone: S.joined.phone, status: '활성' } : { id: id, name: '탈퇴 회원', phone: '', status: '-' }); };
  var nm = function (id) { return member(id).name; };
  var acceptor = function (d) { return post(d.post).owner; };
  var initiator = function (d) { var o = acceptor(d); return d.req === o ? d.prov : d.req; };
  var mine = function (d) { return d.req === uid() || d.prov === uid(); };
  var other = function (d) { return d.req === uid() ? d.prov : d.req; };
  var trust = G.nbTrust = function (id) {
    var done = K().deals.filter(function (d) { return d.status === 'DONE' && (d.req === id || d.prov === id); }).length;
    var ver = K().deals.filter(function (d) { return (d.status === 'VERIFIED' || d.status === 'DONE') && (d.req === id || d.prov === id); }).length;
    return { done: done, ver: ver };
  };
  var trustTxt = function (id) { var t = trust(id); return t.done ? '이웃 나눔 ' + t.done + '회 완료' : t.ver ? '안전 검증 ' + t.ver + '회' : '새 이웃'; };
  var money = function (p) { return p.pay === 'FREE' ? '무료' : (p.pay === 'COST' ? '실비 ' : '') + G.fmt(p.price) + (p.pay === 'PAID' ? '' : ''); };
  var payBd = function (pay) { var m = C.PAY[pay]; return '<span class="bd bd-' + m.tone + '">' + m.name + '</span>'; };
  var kindBd = function (k) { return '<span class="bd ' + (k === 'OFFER' ? 'bd-kind-o' : 'bd-kind-r') + '">' + (k === 'OFFER' ? '드려요' : '찾아요') + '</span>'; };
  var postBd = function (s) { var a = C.POST_ST[s] || [s, 'mute']; return '<span class="bd bd-' + a[1] + '">' + a[0] + '</span>'; };
  var dealBd = G.nbDealBd = function (s) { var a = C.DEAL_ST[s] || [s, 'mute']; return '<span class="bd bd-' + a[1] + '">' + a[0] + '</span>'; };
  G.nbPostBd = postBd;
  var av = function (id) { return '<span class="av" aria-hidden="true">' + esc(nm(id).charAt(0)) + '</span>'; };
  var hasActiveDeal = function (pid) { return K().deals.filter(function (d) { return d.post === pid && mine(d) && ['REQUESTED', 'ACCEPTED', 'HELD', 'VERIFIED'].indexOf(d.status) >= 0; })[0]; };
  var payBdS = function (st) { var a = C.PAY_ST[st] || [st, 'mute']; return '<span class="bd bd-' + a[1] + '">' + a[0] + '</span>'; };
  G.nbPayBd = payBdS;
  var isPaid = function (d) { var p = post(d.post); return p && p.pay === 'PAID' && d.price > 0; };
  var feeLine = function (gross, prov) { var f = G.fees(), r = G.feeRate ? G.feeRate(prov || uid()) : f.club, c = G.calcFee(gross, r, f.minFee); return { rate: r, fee: c.fee, net: c.net }; };
  function addHist(o, st, by, memo) { o.status = st; o.hist.push([st, G.now(), by, memo || '']); }

  /* 해야 할 일 개수 (마이페이지·헤더용) */
  G.nbTodo = function () {
    if (!S.user) return 0; var me = uid();
    var recv = K().deals.filter(function (d) { return acceptor(d) === me && d.status === 'REQUESTED'; }).length;
    var fix = K().posts.filter(function (p) { return p.owner === me && p.status === 'NEED_FIX'; }).length;
    var done = K().deals.filter(function (d) { return mine(d) && d.status === 'VERIFIED' && !d.done[d.req === me ? 'req' : 'prov'] && false; }).length;
    return recv + fix + done;
  };
  G.clubTodoCount = function () {
    return K().posts.filter(function (p) { return p.status === 'PENDING_REVIEW'; }).length + K().deals.filter(function (d) { return d.status === 'ACCEPTED' || d.status === 'HELD'; }).length + K().reports.filter(function (r) { return r.status === '접수'; }).length;
  };

  /* ---------- 라우팅 ---------- */
  P.club = function (arg) {
    arg = arg || '';
    if (arg === 'rules') return rules();
    if (arg === '') return list();
    if (!S.user) return gate(arg);
    if (arg === 'new') return form(null);
    if (arg.indexOf('edit-') === 0) { var ep = post(arg.slice(5)); return ep && ep.owner === uid() && ep.status === 'NEED_FIX' ? form(ep) : mineP('mine'); }
    if (arg === 'mine' || arg === 'recv' || arg === 'sent' || arg === 'pay') return mineP(arg);
    if (arg.indexOf('deal-') === 0) return dealP(arg.slice(5));
    return postP(arg);
  };

  /* ---------- 안내 블록 ---------- */
  function flow() {
    var st = [['글 올리기', '드려요·찾아요 중 하나를 골라 유·무료와 금액을 적어요.'], ['등록 검토', '운영자가 금지 항목과 금액 기준을 먼저 확인한 뒤 공개해요.'], ['참여와 수락', '관심 있는 이웃이 요청하고, 글쓴이가 수락해요.'], ['안전 검증', '운영자가 두 분의 상태와 약속 장소를 확인하면 연락처가 열려요.']];
    return '<ol class="proc nb-flow">' + st.map(function (s, i) { return '<li><span class="proc-n">' + (i + 1) + '</span><h3>' + s[0] + '</h3><p>' + s[1] + '</p></li>'; }).join('') + '</ol>';
  }
  function payCards() {
    return '<div class="nb-pay">' + Object.keys(C.PAY).map(function (k) { var m = C.PAY[k]; return '<article><p>' + payBd(k) + '</p><p class="small">' + esc(m.rule) + '</p></article>'; }).join('') + '</div>';
  }
  function disclaimer() {
    return '<div class="callout">' + ico('shield', 20) + '<div><strong>더가넷은 안전 확인을 돕는 곳이에요</strong><p>이웃 나눔은 회원 사이의 약속이에요. 더가넷은 글과 약속을 검토하고 중개하지만 거래 당사자는 아니에요. 무료·실비는 만나서 직접 나누고, 유료는 더가넷 안전결제로만 주고받아요. 안전결제 밖의 선입금 요구는 신고 대상입니다. (시연 화면에는 실제 결제가 없습니다.)</p></div></div>';
  }

  /* ---------- 비회원 안내 ---------- */
  function gate(arg) {
    S.ret = 'club' + (arg ? '-' + arg : ''); G.save();
    var n = K().posts.filter(function (p) { return p.status === 'PUBLISHED'; }).length;
    return { title: '이웃 나눔', html: G.pageHead('이웃 나눔은<br>가입한 회원들만의 공간이에요.', '가넷 회원끼리 서로의 솜씨와 시간을 다정하게 나눕니다. 안전을 위해 회원이 된 뒤에 글과 이웃 정보를 볼 수 있어요.', [['이웃 나눔', 'club']], 'MEMBERS ONLY') +
      '<section class="sec-tight"><div class="wrap narrow2"><div class="card c nb-gate">' + ico('lock', 28) + '<h2 class="h3">지금 ' + n + '개의 나눔이 이웃을 기다려요</h2><p class="lead">로그인하면 바로 둘러볼 수 있어요. 처음이라면 가입은 1분이면 충분해요.</p><div class="fa c"><button class="btn btn-fill" data-act="demoLogin" data-ret="' + esc(S.ret) + '">데모 계정으로 입장</button><a class="btn btn-line" href="#login" data-act="setRet" data-ret="' + esc(S.ret) + '">로그인 · 회원가입</a></div></div>' +
      '<h2 class="h3 gap">이렇게 안전하게 주고받아요</h2>' + flow() + '<h2 class="h3 gap">유·무료 기준</h2>' + payCards() + '<p class="mt"><a class="lnk" href="#club-rules">이용 기준 전체 보기 ' + ico('arrow-right', 16) + '</a></p></div></section>' };
  }

  /* ---------- 목록 ---------- */
  function list() {
    if (!S.user) return gate('');
    var posts = K().posts.filter(function (p) { return p.status === 'PUBLISHED'; });
    var todo = G.nbTodo();
    var head = G.pageHead('이웃 나눔', '가넷 회원끼리 서로의 솜씨와 시간을 주고받는 공간이에요. 모든 글은 운영자가 먼저 확인하고, 약속은 안전 검증을 거쳐 연결돼요.', [['이웃 나눔', '']], 'NEIGHBORS');
    var bar = '<div class="nb-bar"><div class="chips" id="nbk" role="group" aria-label="구분">' + [['', '전체'], ['OFFER', '드려요'], ['REQUEST', '찾아요']].map(function (c, i) { return '<button class="chip' + (i === 0 ? ' on' : '') + '" data-act="nbChip" data-grp="k" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>' +
      '<div class="chips" id="nbp" role="group" aria-label="유·무료">' + [['', '모든 유형'], ['FREE', '무료'], ['COST', '실비'], ['PAID', '유료']].map(function (c, i) { return '<button class="chip' + (i === 0 ? ' on' : '') + '" data-act="nbChip" data-grp="p" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>' +
      '<select id="nbc" data-on="change:nbFilter" aria-label="분야"><option value="">모든 분야</option>' + C.CATS.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select>' +
      '<label class="srch">' + ico('search', 18) + '<input id="nbq" type="search" placeholder="제목·내용 검색" data-on="input:nbFilter"></label></div>';
    var cards = posts.map(function (p) {
      return '<article class="nb" data-k="' + p.kind + '" data-p="' + p.pay + '" data-c="' + esc(p.cat) + '" data-q="' + esc((p.title + ' ' + p.body + ' ' + p.area + ' ' + p.cat).toLowerCase()) + '"><div class="nb-t">' + kindBd(p.kind) + payBd(p.pay) + '</div><h3><a href="#club-' + p.id + '">' + esc(p.title) + '</a></h3><p>' + esc(p.body.length > 74 ? p.body.slice(0, 74) + '…' : p.body) + '</p>' +
        '<ul class="nb-m"><li>' + ico('pin', 15) + esc(p.area) + '</li><li>' + ico('tag', 15) + esc(p.cat) + '</li><li>' + ico('clock', 15) + esc(p.when) + '</li></ul><div class="nb-f"><span class="nb-who">' + av(p.owner) + '<span>' + esc(nm(p.owner)) + '<small>' + trustTxt(p.owner) + '</small></span></span><b>' + money(p) + '</b></div></article>';
    }).join('');
    return { title: '이웃 나눔', html: head + '<section class="sec-tight"><div class="wrap">' +
      '<div class="nb-top"><div class="nb-top-l"><p class="small">안내</p>' + payCards() + '</div><div class="nb-top-r"><div class="fa"><a class="btn btn-fill" href="#club-new">' + ico('plus', 18) + ' 나눔 글 올리기</a><a class="btn btn-line" href="#club-mine">내 나눔' + (todo ? ' <i class="dot-n">' + todo + '</i>' : '') + '</a></div><p class="small mt"><a class="lnk" href="#club-rules">이용 기준 ' + ico('arrow-right', 16) + '</a></p></div></div>' +
      bar + '<p class="cat-cnt" id="nbn"></p><div class="grid-sc nb-grid" id="nbg">' + cards + '</div><p class="empty" id="nbe" hidden>조건에 맞는 나눔이 아직 없어요. 첫 글을 올려 보세요.</p>' + '<div class="gap">' + disclaimer() + '</div></div></section>', mount: function () { filt(); } };
  }
  var fs = { k: '', p: '' };
  function filt() {
    var q = ((document.getElementById('nbq') || {}).value || '').trim().toLowerCase(), c = (document.getElementById('nbc') || {}).value || '', n = 0;
    document.querySelectorAll('#nbg .nb').forEach(function (a) { var ok = (!fs.k || a.dataset.k === fs.k) && (!fs.p || a.dataset.p === fs.p) && (!c || a.dataset.c === c) && (!q || a.dataset.q.indexOf(q) >= 0); a.hidden = !ok; if (ok) n++; });
    var e = document.getElementById('nbe'); if (e) e.hidden = n > 0; var t = document.getElementById('nbn'); if (t) t.textContent = n + '개의 나눔';
    ['k', 'p'].forEach(function (g) { var box = document.getElementById('nb' + g); if (box) box.querySelectorAll('.chip').forEach(function (b) { b.classList.toggle('on', b.dataset.v === fs[g]); }); });
  }
  G.INP.nbFilter = filt;
  G.ACT.nbChip = function (el) { fs[el.dataset.grp] = el.dataset.v; filt(); };

  function feeCard() {
    var f = G.fees(), ex = feeLine(25000);
    return '<div class="card"><table class="tbl"><thead><tr><th>구분</th><th>결제 방식</th><th>수수료</th></tr></thead><tbody>' +
      '<tr><td>' + payBd('FREE') + '</td><td>대가 없음</td><td>없음</td></tr>' +
      '<tr><td>' + payBd('COST') + '</td><td>만나서 실비만 직접 나눠요</td><td>없음</td></tr>' +
      '<tr><td>' + payBd('PAID') + '</td><td>더가넷 안전결제(에스크로)</td><td>' + f.club + '% (최소 ' + G.fmt(f.minFee) + ') · 제공자 부담</td></tr></tbody></table>' +
      '<ol class="tl tl-s"><li><span></span><b>연락처가 열린 뒤, 받는 분이 안전결제로 대금을 맡겨요</b></li><li><span></span><b>활동이 끝나면 두 분이 완료를 확인해요</b></li><li><span></span><b>수수료를 뺀 금액이 완료 후 ' + f.cycle + '일 안에 제공자에게 정산돼요</b></li></ol>' +
      '<p class="small">예) 25,000원 → 수수료 ' + G.fmt(ex.fee) + ' · 제공자 정산 ' + G.fmt(ex.net) + '. 문제가 생기면 정산 전에 분쟁을 접수할 수 있고, 운영자가 확인해 환불하거나 정산해요. 협력업체가 수행하는 돌봄 서비스는 이 구조와 별개로 정산돼요. (시연 화면에는 실제 결제가 없습니다.)</p></div>';
  }

  /* ---------- 이용 기준(공개) ---------- */
  function rules() {
    var rows = Object.keys(C.PAY).map(function (k) { var m = C.PAY[k]; return '<tr><td>' + payBd(k) + '</td><td>' + esc(m.rule) + '</td></tr>'; }).join('');
    return { title: '이웃 나눔 이용 기준', html: G.pageHead('이웃 나눔 이용 기준', '서로 안심하고 주고받기 위한 약속이에요. 시연용 기준값이며, 운영하면서 조정돼요.', [['이웃 나눔', 'club'], ['이용 기준', '']], 'RULES') +
      '<section class="sec-tight"><div class="wrap narrow2"><h2 class="h3">이렇게 진행돼요</h2>' + flow() +
      '<div class="callout warn"><span>' + ico('lock', 20) + '</span><div><strong>연락처는 안전 검증이 끝난 뒤에 열려요</strong><p>수락만으로는 서로의 연락처가 보이지 않아요. 운영자가 두 회원의 상태·금액·만남 장소를 확인해 검증 완료로 바꾸면 그때 연락할 수 있어요.</p></div></div>' +
      '<h2 class="h3 gap">유·무료 기준</h2><div class="card"><table class="tbl"><thead><tr><th>구분</th><th>기준</th></tr></thead><tbody>' + rows + '</tbody></table><p class="small">한 달에 유료 거래가 ' + C.LIMIT.MONTHLY + '건을 넘으면 사업자 전환 또는 협력업체 심사를 안내해요.</p></div>' +
      '<h2 class="h3 gap">결제와 수수료</h2>' + feeCard() + '<h2 class="h3 gap">올릴 수 없는 글</h2><div class="card legal"><ul class="ul no">' + C.BANNED.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></div>' +
      '<h2 class="h3 gap">안전하게 만나는 방법</h2><div class="card legal"><ul class="ul"><li>처음에는 도서관·카페·주민센터 같은 공공장소를 권해요.</li><li>집 방문이 필요하면 2인 이상, 또는 보호자·가족이 함께해 주세요.</li><li>돈은 무료·실비는 만나서 직접 나누고, 유료는 더가넷 안전결제로만 보내요. 안전결제 밖으로 미리 보내 달라는 요청에는 응하지 마세요.</li><li>불편하거나 위험하다고 느끼면 바로 중단하고 신고해 주세요.</li></ul></div>' +
      '<div class="gap">' + disclaimer() + '</div><div class="fa c"><a class="btn btn-fill" href="#club">이웃 나눔 둘러보기</a></div></div></section>' };
  }

  /* ---------- 글 상세 ---------- */
  function postP(id) {
    var p = post(id); if (!p) return { title: '이웃 나눔', html: '<section class="sec-tight"><div class="wrap narrow">' + G.empty('글을 찾을 수 없어요.', '<a class="btn btn-line btn-sm" href="#club">목록으로</a>') + '</div></section>' };
    var me = uid(), own = p.owner === me;
    if (p.status !== 'PUBLISHED' && !own) return { title: '이웃 나눔', html: '<section class="sec-tight"><div class="wrap narrow">' + G.empty('지금은 볼 수 없는 글이에요.', '<a class="btn btn-line btn-sm" href="#club">목록으로</a>') + '</div></section>' };
    var d = hasActiveDeal(p.id), box;
    if (own) {
      box = '<h2>내가 올린 글이에요</h2><p class="small">상태 ' + postBd(p.status) + '</p>' + (p.status === 'NEED_FIX' ? '<div class="callout warn">' + ico('info', 18) + '<div><strong>보완 요청</strong><p>' + esc(p.hist[p.hist.length - 1][3]) + '</p></div></div><a class="btn btn-fill btn-block" href="#club-edit-' + p.id + '">고쳐서 다시 제출</a>' : '') + '<a class="btn btn-line btn-block" href="#club-recv">받은 요청 보기</a>';
    } else if (p.status !== 'PUBLISHED') box = '<p class="small">' + postBd(p.status) + '</p>';
    else if (d) box = '<h2>이미 요청한 글이에요</h2><p class="small">진행 상황은 약속 화면에서 확인해요.</p>' + dealBd(d.status) + '<a class="btn btn-fill btn-block" href="#club-deal-' + d.id + '">약속 보기</a>';
    else {
      var verb = p.kind === 'OFFER' ? '참여 요청' : '도와주기';
      box = '<h2>' + (p.kind === 'OFFER' ? '이 나눔에 참여할래요' : '이 글을 도와줄래요') + '</h2><form data-sub="nbReq" data-id="' + p.id + '" novalidate>' +
        '<div class="fg"><label class="lb" for="rq-m">이웃에게 한마디 <em class="req">필수</em></label><textarea id="rq-m" rows="3" placeholder="어떤 도움이 필요한지, 또는 가능한 점을 10자 이상 적어 주세요."></textarea></div>' +
        '<div class="fg"><label class="lb" for="rq-d">희망 일시 <em class="req">필수</em></label><input id="rq-d" type="datetime-local" min="' + SITE.today + 'T00:00"></div>' +
        '<div class="fg"><label class="lb" for="rq-p">만남 방식 <em class="req">필수</em></label><select id="rq-p"><option value="">선택해 주세요</option><option>동네 도서관·카페 등 공공장소</option><option>주민센터·공유공간</option><option>집 방문 (2인 이상 함께)</option></select></div>' +
        '<p class="err" id="rq-e" hidden></p><dl class="buy-dl"><div><dt>약속 금액</dt><dd>' + money(p) + '</dd></div></dl><button class="btn btn-fill btn-block" type="submit">' + verb + ' 보내기</button><p class="small">수락 후에도 운영자 안전 검증이 끝나야 연락처가 열려요. 안전결제 밖으로 미리 돈을 보내지 마세요.</p></form>';
    }
    var rep = !own && p.status === 'PUBLISHED' ? '<p class="c"><button class="lnk-u" data-act="nbRepOpen">이 글에 문제가 있나요? 신고하기</button></p>' + reportForm(p.id, '') : '';
    return { title: p.title, html: '<section class="sd"><div class="wrap"><nav class="crumb crumb-row" aria-label="현재 위치"><a href="#home">홈</a><a href="#club">이웃 나눔</a><span>' + esc(p.title) + '</span></nav><div class="sd-in"><div>' +
      '<div class="meta">' + kindBd(p.kind) + payBd(p.pay) + '<span class="grp">' + esc(p.cat) + '</span></div><h1 class="h2">' + esc(p.title) + '</h1>' +
      '<ul class="nb-m nb-m-l"><li>' + ico('pin', 16) + esc(p.area) + '</li><li>' + ico('clock', 16) + esc(p.when) + '</li><li>' + ico('calendar', 16) + p.at.slice(0, 10) + ' 등록</li></ul>' +
      '<div class="nb-who nb-who-l">' + av(p.owner) + '<span>' + esc(nm(p.owner)) + '<small>' + trustTxt(p.owner) + ' · 가넷 회원</small></span></div>' +
      '<div class="blk"><h2>이야기</h2><p class="prose">' + G.nl(p.body) + '</p></div>' +
      '<div class="blk two"><div class="card-soft"><h3>' + C.PAY[p.pay].name + ' 기준</h3><p>' + esc(C.PAY[p.pay].rule) + (p.pay === 'PAID' ? ' 수수료 ' + G.fees().club + '%는 제공자가 부담해요.' : '') + '</p></div><div class="card-soft"><h3>안전하게 만나요</h3><p>공공장소에서 시작하고, 집 방문은 2인 이상으로 해요. 유료는 안전결제로만, 실비는 만나서 약속한 금액만 나눠요.</p></div></div>' + rep +
      '</div><aside class="sd-aside"><div class="buy">' + box + '</div></aside></div></div></section>' };
  }
  G.SUB.nbReq = function (f) {
    var p = post(f.dataset.id), m = document.getElementById('rq-m').value.trim(), d = document.getElementById('rq-d').value, pl = document.getElementById('rq-p').value, e = document.getElementById('rq-e');
    var err = m.length < 10 ? '한마디를 10자 이상 적어 주세요.' : !d ? '희망 일시를 골라 주세요.' : !pl ? '만남 방식을 선택해 주세요.' : /(계좌|입금|카톡|오픈채팅|010-?\d{3,4}|http)/.test(m) ? '연락처나 계좌는 적을 수 없어요. 안전 검증 뒤에 열려요.' : '';
    if (err) { e.textContent = err; e.hidden = false; return; }
    var me = uid(), k = K(); k.seq.d += 1;
    var nd = { id: 'D' + k.seq.d, post: p.id, req: p.kind === 'OFFER' ? me : p.owner, prov: p.kind === 'OFFER' ? p.owner : me, status: 'REQUESTED', at: G.now(), msg: m, date: d.replace('T', ' '), place: pl, price: p.price, hist: [['REQUESTED', G.now(), S.user.name, '참여 요청']], done: { req: false, prov: false } };
    k.deals.unshift(nd); G.log('이웃 나눔 ' + nd.id + ' 요청: ' + p.id); G.save(); G.toast('요청을 보냈어요. 글쓴이가 수락하면 알려드려요.'); G.go('club-deal-' + nd.id);
  };

  /* ---------- 신고 ---------- */
  function reportForm(pid, did) {
    return '<form class="card nb-rep" id="nbrep" data-sub="nbReport" data-post="' + pid + '" data-deal="' + did + '" hidden novalidate><h3 class="h3">신고하기</h3><div class="fg"><label class="lb" for="rp-w">이유</label><select id="rp-w">' + C.REPORT_WHY.map(function (w) { return '<option>' + w + '</option>'; }).join('') + '</select></div><div class="fg"><label class="lb" for="rp-n">자세한 내용</label><textarea id="rp-n" rows="3" placeholder="어떤 일이 있었는지 10자 이상 적어 주세요."></textarea></div><p class="err" id="rp-e" hidden>내용을 10자 이상 적어 주세요.</p><div class="fa"><button class="btn btn-fill btn-sm" type="submit">신고 접수</button><button class="btn btn-ghost btn-sm" type="button" data-act="nbRepOpen">닫기</button></div><p class="small">운영자가 확인해 필요한 조치를 해요. 신고한 분의 정보는 상대에게 공개되지 않아요.</p></form>';
  }
  G.ACT.nbRepOpen = function () { var f = document.getElementById('nbrep'); if (f) f.hidden = !f.hidden; };
  G.SUB.nbReport = function (f) {
    var n = document.getElementById('rp-n').value.trim(); if (n.length < 10) { document.getElementById('rp-e').hidden = false; return; }
    var k = K(); k.seq.r += 1; k.reports.unshift({ id: 'R' + k.seq.r, post: f.dataset.post, by: uid(), why: document.getElementById('rp-w').value, note: n, status: '접수', at: G.now(), result: '' });
    G.log('이웃 나눔 신고 R' + k.seq.r); G.save(); G.toast('신고를 접수했어요. 운영자가 확인할게요.'); f.hidden = true; document.getElementById('rp-n').value = '';
  };

  /* ---------- 글쓰기 / 수정 ---------- */
  function form(p) {
    var edit = !!p, v = p || { kind: 'OFFER', pay: 'FREE', price: '', cat: '', title: '', area: '', when: '', body: '' };
    var pills = function (name, items, cur) { return '<div class="pills" role="radiogroup">' + items.map(function (i) { return '<label class="pill"><input type="radio" name="' + name + '" value="' + i[0] + '"' + (cur === i[0] ? ' checked' : '') + ' data-on="change:nbPay"><span>' + i[1] + '</span></label>'; }).join('') + '</div>'; };
    var why = edit && p.status === 'NEED_FIX' ? '<div class="callout warn">' + ico('info', 20) + '<div><strong>운영자가 보완을 요청했어요</strong><p>' + esc(p.hist[p.hist.length - 1][3]) + '</p></div></div>' : '';
    return { title: edit ? '나눔 글 고치기' : '나눔 글 올리기', html: G.pageHead(edit ? '나눔 글 고치기' : '나눔 글 올리기', '운영자가 먼저 확인한 뒤 공개돼요. 보통 하루 안에 결과를 알려드려요.', [['이웃 나눔', 'club'], [edit ? '고치기' : '글쓰기', '']], 'NEW') +
      '<section class="sec-tight"><div class="wrap"><div class="ap"><form class="card form" data-sub="nbPost" data-id="' + (edit ? p.id : '') + '" novalidate>' + why +
      '<div class="fgrid"><div class="fg full"><span class="lb">어떤 글인가요 <em class="req">필수</em></span>' + pills('kind', [['OFFER', '드려요 (내가 도와줄게요)'], ['REQUEST', '찾아요 (도움이 필요해요)']], v.kind) + '</div>' +
      '<div class="fg full"><label class="lb" for="n-t">제목 <em class="req">필수</em></label><input id="n-t" maxlength="40" value="' + esc(v.title) + '" placeholder="예: 베란다 화분 분갈이 같이 해요"></div>' +
      '<div class="fg"><label class="lb" for="n-c">분야 <em class="req">필수</em></label><select id="n-c"><option value="">선택해 주세요</option>' + C.CATS.map(function (c) { return '<option' + (v.cat === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></div>' +
      '<div class="fg"><label class="lb" for="n-a">활동 지역 <em class="req">필수</em></label><input id="n-a" value="' + esc(v.area) + '" placeholder="시·군·구까지만 (예: 서울 마포구)"></div>' +
      '<div class="fg full"><span class="lb">유·무료 <em class="req">필수</em></span>' + pills('pay', [['FREE', '무료 나눔'], ['COST', '실비 공유'], ['PAID', '유료 재능']], v.pay) + '<p class="hint-s" id="n-rule">' + esc(C.PAY[v.pay].rule) + '</p></div>' +
      '<div class="fg" id="n-pg"' + (v.pay === 'FREE' ? ' hidden' : '') + '><label class="lb" for="n-p">금액 (원) <em class="req">필수</em></label><input id="n-p" type="number" min="0" step="1000" value="' + (v.price || '') + '" placeholder="예: 25000" data-on="input:nbFee"><p class="hint-s" id="n-fee"></p></div>' +
      '<div class="fg"><label class="lb" for="n-w">가능한 때 <em class="req">필수</em></label><input id="n-w" value="' + esc(v.when) + '" placeholder="예: 주말 오전"></div>' +
      '<div class="fg full"><label class="lb" for="n-b">이야기 <em class="req">필수</em></label><textarea id="n-b" rows="6" maxlength="600" placeholder="무엇을 어떻게 나눌지, 소요 시간, 준비물, 만나는 방식을 적어 주세요. (20자 이상)">' + esc(v.body) + '</textarea></div></div>' +
      '<div class="agree"><label class="chk"><input type="checkbox" id="n-g1"><span><b>[필수]</b> 올릴 수 없는 글(자격이 필요한 행위·선입금·외부 결제 유도 등)이 아님을 확인했어요. <a href="#club-rules" target="_blank" rel="noopener">기준 보기</a></span></label><label class="chk"><input type="checkbox" id="n-g2"><span><b>[필수]</b> 연락처·계좌는 글에 적지 않고, 안전 검증이 끝난 뒤에 주고받는 데 동의해요.</span></label><p class="err" id="n-e" hidden></p></div>' +
      '<div class="fnav"><a class="btn btn-ghost" href="#club">취소</a><button class="btn btn-fill" type="submit">' + (edit ? '다시 제출하기' : '검토 요청하기') + '</button></div></form>' +
      '<aside class="card side nb-side"><h3>' + ico('shield', 18) + ' 올리기 전에 확인해요</h3><h4>유·무료 기준</h4>' + payCards() + '<h4>올릴 수 없는 글</h4><ul class="ul no">' + C.BANNED.slice(0, 3).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul><a class="lnk" href="#club-rules">전체 기준 ' + ico('arrow-right', 16) + '</a></aside></div></div></section>' };
  }
  G.INP.nbFee = function () {
    var pay = (document.querySelector('[name=pay]:checked') || {}).value, el = document.getElementById('n-fee'), v = Number((document.getElementById('n-p') || {}).value || 0); if (!el) return;
    if (pay === 'PAID' && v > 0) { var x = feeLine(v); el.textContent = '안전결제 수수료 ' + x.rate + '%(최소 ' + G.fmt(G.fees().minFee) + ') ' + G.fmt(x.fee) + ' · 정산받는 금액 ' + G.fmt(x.net); }
    else if (pay === 'PAID') el.textContent = '유료는 안전결제로만 받아요. 수수료 ' + G.fees().club + '%는 제공자가 부담해요.';
    else el.textContent = pay === 'COST' ? '실비는 만나서 직접 나누고 수수료가 없어요.' : '';
  };
  G.INP.nbPay = function (el) {
    if (el.name !== 'pay') return; var f = document.getElementById('n-pg'), r = document.getElementById('n-rule'); if (f) f.hidden = el.value === 'FREE'; if (r) r.textContent = C.PAY[el.value].rule; G.INP.nbFee();
  };
  G.SUB.nbPost = function (f) {
    var g = function (n) { var e = f.querySelector('[name=' + n + ']:checked'); return e ? e.value : ''; };
    var kind = g('kind'), pay = g('pay'), t = document.getElementById('n-t').value.trim(), c = document.getElementById('n-c').value, a = document.getElementById('n-a').value.trim(), w = document.getElementById('n-w').value.trim(), b = document.getElementById('n-b').value.trim(), pr = Number(document.getElementById('n-p').value || 0), e = document.getElementById('n-e');
    var err = !kind ? '구분을 선택해 주세요.' : t.length < 5 ? '제목을 5자 이상 적어 주세요.' : !c ? '분야를 선택해 주세요.' : !a ? '활동 지역을 적어 주세요.' : !pay ? '유·무료를 선택해 주세요.' :
      (pay !== 'FREE' && !(pr > 0)) ? '금액을 입력해 주세요.' : (pay === 'COST' && pr > C.LIMIT.COST) ? '실비는 ' + G.fmt(C.LIMIT.COST) + '까지예요.' : (pay === 'PAID' && pr > C.LIMIT.PAID) ? '유료는 ' + G.fmt(C.LIMIT.PAID) + '까지예요. 더 큰 일은 협력업체 심사를 문의해 주세요.' :
      !w ? '가능한 때를 적어 주세요.' : b.length < 20 ? '이야기를 20자 이상 적어 주세요.' : !document.getElementById('n-g1').checked || !document.getElementById('n-g2').checked ? '필수 확인 항목에 체크해 주세요.' : '';
    if (err) { e.textContent = err; e.hidden = false; e.scrollIntoView({ block: 'center' }); return; }
    var k = K(), id = f.dataset.id, o = id ? post(id) : null;
    if (o) { o.kind = kind; o.pay = pay; o.price = pay === 'FREE' ? 0 : pr; o.cat = c; o.title = t; o.area = a; o.when = w; o.body = b; addHist(o, 'PENDING_REVIEW', S.user.name, '보완해서 다시 제출'); G.log('이웃 나눔 ' + o.id + ' 재제출'); }
    else { k.seq.p += 1; o = { id: 'N0' + k.seq.p, kind: kind, pay: pay, price: pay === 'FREE' ? 0 : pr, cat: c, owner: uid(), area: a, when: w, status: 'PENDING_REVIEW', at: G.now(), title: t, body: b, hist: [['PENDING_REVIEW', G.now(), S.user.name, '등록']] }; k.posts.unshift(o); G.log('이웃 나눔 ' + o.id + ' 등록'); }
    G.save(); G.toast('검토를 요청했어요. 공개되면 알려드려요.'); G.go('club-mine');
  };

  /* ---------- 내 나눔 ---------- */
  function mineP(tab) {
    var me = uid(), k = K();
    var myp = k.posts.filter(function (p) { return p.owner === me; }), recv = k.deals.filter(function (d) { return acceptor(d) === me; }), sent = k.deals.filter(function (d) { return initiator(d) === me; });
    var payDeals = k.deals.filter(function (d) { return mine(d) && isPaid(d) && (d.pay || d.status === 'VERIFIED'); });
    var rq = recv.filter(function (d) { return d.status === 'REQUESTED'; }).length, fix = myp.filter(function (p) { return p.status === 'NEED_FIX'; }).length;
    var tabs = '<div class="tabs" role="tablist">' + [['mine', '내가 올린 글', myp.length + (fix ? '' : ''), fix], ['recv', '받은 요청', recv.length, rq], ['sent', '보낸 요청', sent.length, 0], ['pay', '정산 내역', payDeals.length, 0]].map(function (t) { return '<a href="#club-' + t[0] + '" class="' + (tab === t[0] ? 'on' : '') + '" role="tab" aria-selected="' + (tab === t[0]) + '">' + t[1] + ' <small>' + t[2] + '</small>' + (t[3] ? '<i class="dot-n">' + t[3] + '</i>' : '') + '</a>'; }).join('') + '</div>';
    var dealRow = function (d) {
      var p = post(d.post), o = other(d);
      return '<a class="nbr" href="#club-deal-' + d.id + '"><div><div class="nbr-t"><b>' + esc(p.title) + '</b>' + dealBd(d.status) + '</div><p>' + av(o) + esc(nm(o)) + ' · ' + payBd(p.pay).replace(/<[^>]+>/g, '') + ' · 희망 ' + esc(String(d.date).slice(0, 16)) + '</p></div>' + (acceptor(d) === me && d.status === 'REQUESTED' ? '<span class="btn btn-fill btn-sm">답하기</span>' : ico('chev-right', 18)) + '</a>';
    };
    var body;
    if (tab === 'mine') body = myp.length ? '<div class="nb-rows">' + myp.map(function (p) {
      return '<div class="nbr nbr-p"><div><div class="nbr-t"><b>' + esc(p.title) + '</b>' + postBd(p.status) + '</div><p>' + kindBd(p.kind) + ' ' + payBd(p.pay) + ' · ' + money(p) + ' · 등록 ' + p.at.slice(0, 10) + '</p>' + (p.status === 'NEED_FIX' || p.status === 'REJECTED' || p.status === 'PAUSED' ? '<p class="nb-note">' + ico('info', 15) + ' 운영자 메모: ' + esc(p.hist[p.hist.length - 1][3] || '') + '</p>' : '') + '</div><div class="fa">' +
        (p.status === 'NEED_FIX' ? '<a class="btn btn-fill btn-sm" href="#club-edit-' + p.id + '">고치기</a>' : '<a class="btn btn-line btn-sm" href="#club-' + p.id + '">보기</a>') + (p.status === 'PUBLISHED' ? '<button class="btn btn-ghost btn-sm" data-act="nbClose" data-id="' + p.id + '">마감</button>' : '') + '</div></div>';
    }).join('') + '</div>' : G.empty('아직 올린 글이 없어요.', '<a class="btn btn-fill btn-sm" href="#club-new">첫 글 올리기</a>');
    else if (tab === 'pay') body = payTab(payDeals, me);
    else body = (tab === 'recv' ? recv : sent).length ? '<div class="nb-rows">' + (tab === 'recv' ? recv : sent).map(dealRow).join('') + '</div>' : G.empty(tab === 'recv' ? '아직 받은 요청이 없어요.' : '아직 보낸 요청이 없어요. 마음에 드는 나눔을 찾아보세요.', '<a class="btn btn-line btn-sm" href="#club">이웃 나눔 둘러보기</a>');
    return { title: '내 나눔', html: G.pageHead('내 나눔', '올린 글과 주고받은 약속을 한곳에서 확인해요.', [['이웃 나눔', 'club'], ['내 나눔', '']], 'MY NEIGHBORS') + '<section class="sec-tight"><div class="wrap narrow2">' + tabs + '<div class="fa mb"><a class="btn btn-fill btn-sm" href="#club-new">' + ico('plus', 16) + ' 나눔 글 올리기</a></div>' + body + '</div></section>' };
  }
  function payTab(list, me) {
    var tot = { wait: 0, out: 0, fee: 0, paid: 0 };
    list.forEach(function (d) { var pay = d.pay; if (!pay) return; if (d.prov === me) { if (pay.st === 'HELD' || pay.st === 'RELEASE_WAIT' || pay.st === 'DISPUTED') tot.wait += pay.net; if (pay.st === 'PAID_OUT') { tot.out += pay.net; tot.fee += pay.fee; } } if (d.req === me && pay.st !== 'REFUNDED' && pay.st !== 'READY') tot.paid += pay.gross; });
    var kp = '<div class="kpis k4"><div class="kpi"><span>정산 예정 (받을 금액)</span><b>' + G.fmt(tot.wait) + '</b></div><div class="kpi"><span>정산 완료</span><b>' + G.fmt(tot.out) + '</b></div><div class="kpi"><span>낸 수수료</span><b>' + G.fmt(tot.fee) + '</b></div><div class="kpi"><span>안전결제로 낸 금액</span><b>' + G.fmt(tot.paid) + '</b></div></div>';
    var rows = list.length ? '<div class="nb-rows">' + list.map(function (d) {
      var p = post(d.post), pay = d.pay || { st: 'READY', gross: d.price, net: feeLine(d.price, d.prov).net }, prov = d.prov === me;
      return '<a class="nbr" href="#club-deal-' + d.id + '"><div><div class="nbr-t"><b>' + esc(p.title) + '</b>' + payBdS(pay.st) + '</div><p>' + (prov ? '받는 금액 <b>' + G.fmt(pay.net) + '</b> (수수료 ' + G.fmt(pay.gross - pay.net) + ' 제외)' : '낸 금액 <b>' + G.fmt(pay.gross) + '</b>') + ' · ' + (prov ? '제공자' : '받는 분') + ' · ' + esc(nm(other(d))) + (pay.st === 'RELEASE_WAIT' && prov ? ' · 정산 예정 ' + pay.due : '') + (pay.st === 'PAID_OUT' && prov ? ' · ' + pay.outAt.slice(0, 10) + ' 지급' : '') + '</p></div>' + ico('chev-right', 18) + '</a>';
    }).join('') + '</div>' : G.empty('아직 안전결제 내역이 없어요. 유료 나눔이 시작되면 이곳에 보여요.');
    return kp + '<div class="callout">' + ico('info', 20) + '<div><strong>수수료는 제공자가 부담해요</strong><p>안전결제 수수료 ' + G.fees().club + '%(최소 ' + G.fmt(G.fees().minFee) + ')를 뺀 금액이 완료 확인 후 ' + G.fees().cycle + '일 안에 정산돼요. 무료·실비 나눔은 수수료가 없어요. <a href="#club-rules">기준 보기</a></p></div></div>' + rows;
  }
  G.ACT.nbClose = function (el) { var p = post(el.dataset.id); addHist(p, 'CLOSED', S.user.name, '글쓴이가 마감'); G.log('이웃 나눔 ' + p.id + ' 마감'); G.toast('글을 마감했어요.'); G.rerender(); };

  /* ---------- 약속(거래) 상세 ---------- */
  function dealP(id) {
    var d = deal(id), me = uid();
    if (!d || !mine(d)) return { title: '약속', html: '<section class="sec-tight"><div class="wrap narrow">' + G.empty('약속을 찾을 수 없어요.', '<a class="btn btn-line btn-sm" href="#club-mine">내 나눔으로</a>') + '</div></section>' };
    var p = post(d.post), st = d.status, acc = acceptor(d) === me, o = other(d), side = d.req === me ? 'req' : 'prov';
    var cur = C.DEAL_AT[st], bad = ['DECLINED', 'CANCELLED', 'BLOCKED'].indexOf(st) >= 0;
    var steps = bad ? '' : '<ol class="stp nb-stp">' + C.DEAL_STEPS.map(function (s, i) { return '<li class="' + (i < cur ? 'done' : i === cur ? 'cur' : '') + '"><span class="stp-n">' + (i < cur ? ico('check', 14) : (i + 1)) + '</span><span class="stp-t">' + s + '</span></li>'; }).join('') + '</ol>';
    var note = st === 'REQUESTED' ? (acc ? '<div class="callout warn">' + ico('bell', 20) + '<div><strong>답을 기다리고 있어요</strong><p>수락하면 운영자 안전 검증으로 넘어가요. 맞지 않으면 정중히 거절해도 괜찮아요.</p></div></div>' : '<div class="callout">' + ico('clock', 20) + '<div><strong>글쓴이의 답을 기다리는 중이에요</strong><p>수락되면 알려드려요. 아직 연락처는 열리지 않았어요.</p></div></div>') :
      st === 'ACCEPTED' ? '<div class="callout">' + ico('shield', 20) + '<div><strong>운영자가 안전을 확인하고 있어요</strong><p>두 분의 상태, 금액 기준, 만남 장소를 확인해요. 보통 하루 안에 끝나요.</p></div></div>' :
      st === 'HELD' ? '<div class="callout warn">' + ico('info', 20) + '<div><strong>운영자가 추가 확인을 요청했어요</strong><p>' + esc(d.hist[d.hist.length - 1][3]) + '</p></div></div>' :
      st === 'BLOCKED' ? '<div class="callout warn">' + ico('info', 20) + '<div><strong>이 약속은 진행할 수 없어요</strong><p>' + esc(d.hist[d.hist.length - 1][3]) + '</p></div></div>' :
      st === 'VERIFIED' ? '<div class="callout">' + ico('check', 20) + '<div><strong>안전 검증이 끝났어요</strong><p>아래 연락처로 시간과 장소를 최종 확인하세요. 유료는 안전결제로만, 실비는 만나서 약속한 금액만 나눠요.</p></div></div>' : '';
    var contact = (st === 'VERIFIED' || st === 'DONE') ? '<h4>' + esc(nm(o)) + '님 연락처</h4><p class="nb-contact">' + ico('phone', 18) + esc(member(o).phone || '010-****-0000') + '</p><p class="small">시연에서는 가린 번호로 보여 드려요. 실제로는 안심번호로 연결돼요.</p>' : '<h4>연락처</h4><p class="nb-lock">' + ico('lock', 18) + ' 안전 검증이 끝나면 열려요</p>';
    var act = '';
    if (st === 'REQUESTED' && acc) act += '<button class="btn btn-fill btn-block" data-act="nbAccept" data-id="' + d.id + '">수락하기</button><button class="btn btn-line btn-block" data-act="nbDecline" data-id="' + d.id + '">정중히 거절하기</button>';
    var paid = isPaid(d), ps = d.pay ? d.pay.st : 'READY', canDone = !paid || ps === 'HELD';
    if (st === 'VERIFIED' && !d.done[side] && canDone) act += '<button class="btn btn-fill btn-block" data-act="nbDone" data-id="' + d.id + '">' + (paid ? '활동을 잘 마쳤어요' : '잘 마쳤어요') + '</button>' + (paid ? '<p class="small">두 분이 모두 확인하면 수수료를 뺀 금액이 제공자에게 정산돼요.</p>' : '');
    if (st === 'VERIFIED' && !d.done[side] && !canDone) act += '<p class="small">' + (ps === 'DISPUTED' ? '분쟁을 확인하는 동안 완료 확인은 잠시 멈춰요.' : '유료 약속은 안전결제로 대금을 맡긴 뒤에 완료를 확인할 수 있어요.') + '</p>';
    if (st === 'VERIFIED' && d.done[side]) act += '<p class="small">내 확인을 남겼어요. 상대 확인을 기다려요.</p>';
    if (['REQUESTED', 'ACCEPTED', 'HELD', 'VERIFIED'].indexOf(st) >= 0 && ps !== 'DISPUTED') act += '<button class="btn btn-ghost btn-block" data-act="nbCancelAsk">약속 취소하기</button><div class="cfm" id="nbcfm" hidden><p class="small">취소하면 상대에게 알려져요. 정말 취소할까요?</p><div class="fa"><button class="btn btn-danger btn-sm" data-act="nbCancel" data-id="' + d.id + '">네, 취소할게요</button><button class="btn btn-line btn-sm" data-act="nbCancelAsk">그대로 둘게요</button></div></div>';
    return { title: '약속 ' + d.id, html: '<section class="sd"><div class="wrap narrow2"><nav class="crumb crumb-row" aria-label="현재 위치"><a href="#club">이웃 나눔</a><a href="#club-sent">내 나눔</a><span>약속 ' + d.id + '</span></nav>' +
      '<div class="dt"><div class="dt-l"><div class="meta">' + dealBd(st) + payBd(p.pay) + '</div><h1 class="h2">' + esc(p.title) + '</h1>' + steps + note +
      '<h4>약속 내용</h4><dl class="sum"><div class="kv"><dt>도움을 주는 분</dt><dd>' + esc(nm(d.prov)) + (d.prov === me ? ' (나)' : '') + '</dd></div><div class="kv"><dt>도움을 받는 분</dt><dd>' + esc(nm(d.req)) + (d.req === me ? ' (나)' : '') + '</dd></div><div class="kv"><dt>유·무료</dt><dd>' + C.PAY[p.pay].name + ' · ' + (d.price > 0 ? G.fmt(d.price) : '금액 없음') + '</dd></div><div class="kv"><dt>희망 일시</dt><dd>' + esc(String(d.date).slice(0, 16)) + '</dd></div><div class="kv"><dt>만남 방식</dt><dd>' + esc(d.place) + '</dd></div><div class="kv"><dt>한마디</dt><dd>' + G.nl(d.msg) + '</dd></div></dl>' +
      paySec(d, p, me) + '<h4>진행 이력</h4><ol class="hist">' + d.hist.slice().reverse().map(function (h) { return '<li><span class="hd-t">' + dealBd(h[0]) + '<time>' + h[1] + '</time><em>' + esc(h[2]) + '</em></span>' + (h[3] ? '<p>' + esc(h[3]) + '</p>' : '') + '</li>'; }).join('') + '</ol>' +
      '<p class="mt"><button class="lnk-u" data-act="nbRepOpen">문제가 있어요 · 신고하기</button></p>' + reportForm(p.id, d.id) + '</div>' +
      '<aside class="dt-r"><div class="act-b">' + contact + '</div>' + (act ? '<div class="act-b">' + act + '</div>' : '') + '<a class="lnk" href="#club-' + p.id + '">글 보기 ' + ico('arrow-right', 16) + '</a></aside></div></div></section>' };
  }
  function dch(id, st, memo) { var d = deal(id); if (st === 'CANCELLED' && d.pay && d.pay.st === 'HELD') { d.pay.st = 'REFUNDED'; d.pay.refundAt = G.now(); memo += ' 보관 중이던 대금은 환불돼요.'; } addHist(d, st, S.user.name, memo); G.log('이웃 나눔 ' + id + ' → ' + (C.DEAL_ST[st] || [st])[0]); G.rerender(); }
  G.ACT.nbAccept = function (el) { dch(el.dataset.id, 'ACCEPTED', '요청을 수락했어요. 안전 검증을 기다려요.'); G.toast('수락했어요. 운영자가 안전을 확인해요.'); };
  G.ACT.nbDecline = function (el) { dch(el.dataset.id, 'DECLINED', '정중히 거절했어요.'); G.toast('정중히 거절했어요.'); };
  G.ACT.nbCancelAsk = function () { var c = document.getElementById('nbcfm'); if (c) c.hidden = !c.hidden; };
  G.ACT.nbCancel = function (el) { dch(el.dataset.id, 'CANCELLED', '약속을 취소했어요.'); G.toast('약속을 취소했어요.'); };
  G.ACT.nbDone = function (el) {
    var d = deal(el.dataset.id), side = d.req === uid() ? 'req' : 'prov';
    if (isPaid(d) && (!d.pay || d.pay.st !== 'HELD')) { G.toast('먼저 안전결제로 대금을 맡겨 주세요.'); return; }
    d.done[side] = true; d.hist.push([d.status, G.now(), S.user.name, '완료를 확인했어요.']);
    if (d.done.req && d.done.prov) {
      addHist(d, 'DONE', '시스템', '양쪽 모두 완료를 확인했어요.');
      if (d.pay && d.pay.st === 'HELD') { d.pay.st = 'RELEASE_WAIT'; d.pay.doneAt = G.now(); d.pay.due = G.addDays(SITE.today, G.fees().cycle); }
      G.toast(d.pay ? '완료됐어요. 수수료를 뺀 금액이 정산 예정이에요.' : '이웃 나눔이 완료됐어요. 고마워요!');
    } else G.toast('확인을 남겼어요. 상대 확인을 기다려요.');
    G.log('이웃 나눔 ' + d.id + ' 완료 확인(' + side + ')'); G.rerender();
  };
  /* 안전결제 (시연: 실제 결제는 일어나지 않아요) */
  function paySec(d, p, me) {
    if (p.pay === 'COST') return '<h4>실비 정산</h4><p class="small">실비는 만나서 약속한 금액만 직접 나눠요. 수수료는 없어요.</p>';
    if (!isPaid(d)) return '';
    var pay = d.pay || { st: 'READY' }, x = d.pay ? d.pay : (function () { var f = feeLine(d.price, d.prov); return { gross: d.price, rate: f.rate, fee: f.fee, net: f.net }; })();
    var idx = { READY: 0, HELD: 1, DISPUTED: 1, RELEASE_WAIT: 2, PAID_OUT: 3, REFUNDED: 0 }[pay.st], steps = ['대금 보관', '완료 확인', '정산'];
    var bar = pay.st === 'REFUNDED' ? '' : '<ol class="stp nb-stp">' + steps.map(function (s, i) { return '<li class="' + (i < idx ? 'done' : i === idx ? 'cur' : '') + '"><span class="stp-n">' + (i < idx ? ico('check', 14) : (i + 1)) + '</span><span class="stp-t">' + s + '</span></li>'; }).join('') + '</ol>';
    var body = '';
    if (pay.st === 'READY') body = d.status !== 'VERIFIED' ? '<p class="small">안전 검증이 끝나면 받는 분이 대금을 안전하게 맡길 수 있어요.</p>' : d.req === me ?
      '<div class="nb-hold"><label class="lb" for="pm-sel">결제 수단</label><select id="pm-sel">' + (G.payOptions ? G.payOptions() : '<option>카드</option><option>계좌이체</option><option>간편결제</option>') + '</select><button class="btn btn-fill" data-act="nbPayHold" data-id="' + d.id + '">' + G.fmt(x.gross) + ' 안전결제로 맡기기</button></div><p class="small">시연 화면이라 실제로 결제되지 않아요. 맡긴 대금은 두 분이 완료를 확인하기 전까지 제공자에게 전달되지 않아요.</p>' :
      '<p class="small">받는 분이 안전결제로 대금을 맡기면 알려드려요. 대금이 보관된 뒤에 활동을 시작해 주세요.</p>';
    else if (pay.st === 'HELD') body = '<div class="callout">' + ico('lock', 20) + '<div><strong>대금이 안전하게 보관되고 있어요</strong><p>활동이 끝나고 두 분이 완료를 확인하면 정산돼요. 약속과 다르면 정산 전에 분쟁을 접수해 주세요.</p></div></div>' + (d.status === 'VERIFIED' ? '<p><button class="lnk-u" data-act="nbDspOpen">문제가 있어요 · 분쟁 접수</button></p><div class="cfm" id="nbdsp" hidden><textarea id="nbdsp-t" rows="3" placeholder="어떤 문제가 있었는지 10자 이상 적어 주세요."></textarea><p class="err" id="nbdsp-e" hidden>10자 이상 적어 주세요.</p><div class="fa"><button class="btn btn-danger btn-sm" data-act="nbDispute" data-id="' + d.id + '">분쟁 접수</button><button class="btn btn-ghost btn-sm" data-act="nbDspOpen">닫기</button></div></div>' : '');
    else if (pay.st === 'DISPUTED') body = '<div class="callout warn">' + ico('info', 20) + '<div><strong>운영자가 분쟁을 확인하고 있어요</strong><p>접수 내용: ' + esc(pay.disputeNote || '') + '<br>확인 결과에 따라 환불하거나 정산해요. 그동안 대금은 계속 보관돼요.</p></div></div>';
    else if (pay.st === 'RELEASE_WAIT') body = '<div class="callout">' + ico('clock', 20) + '<div><strong>정산을 준비하고 있어요</strong><p>' + (d.prov === me ? '정산 예정일은 ' + pay.due + '이고, ' + G.fmt(pay.net) + '이 지급돼요.' : '두 분이 완료를 확인해 대금이 제공자에게 정산될 예정이에요.') + '</p></div></div>';
    else if (pay.st === 'PAID_OUT') body = '<div class="callout">' + ico('check', 20) + '<div><strong>정산이 끝났어요</strong><p>' + (d.prov === me ? G.fmt(pay.net) + '이 ' + pay.outAt.slice(0, 10) + '에 지급됐어요.' : '대금이 제공자에게 정산됐어요.') + '</p></div></div>';
    else if (pay.st === 'REFUNDED') body = '<div class="callout">' + ico('info', 20) + '<div><strong>환불이 끝났어요</strong><p>' + (d.prov === me ? '이 약속의 대금은 환불되어 정산되지 않아요.' : '맡기셨던 ' + G.fmt(pay.gross) + '이 환불됐어요.') + '</p></div></div>';
    return '<h4>안전결제 ' + payBdS(pay.st) + '</h4>' + bar + '<dl class="sum"><div class="kv"><dt>약속 금액</dt><dd>' + G.fmt(x.gross) + '</dd></div><div class="kv"><dt>안전결제 수수료</dt><dd>' + G.fmt(x.fee) + ' <span class="small">(' + x.rate + '% · 제공자 부담)</span></dd></div><div class="kv"><dt>제공자 정산액</dt><dd><b>' + G.fmt(x.net) + '</b></dd></div></dl>' + body;
  }
  G.ACT.nbPayHold = function (el) {
    var d = deal(el.dataset.id), m = document.getElementById('pm-sel').value, x = feeLine(d.price, d.prov);
    d.pay = { st: 'HELD', gross: d.price, rate: x.rate, fee: x.fee, net: x.net, method: m, heldAt: G.now() };
    d.hist.push([d.status, G.now(), S.user.name, '안전결제로 대금을 보관했어요. (' + m + ', 시연)']); G.log('이웃 나눔 ' + d.id + ' 대금 보관 ' + G.fmt(d.price)); G.toast('대금을 안전하게 맡겼어요.'); G.rerender();
  };
  G.ACT.nbDspOpen = function () { var c = document.getElementById('nbdsp'); if (c) c.hidden = !c.hidden; };
  G.ACT.nbDispute = function (el) {
    var t = document.getElementById('nbdsp-t').value.trim(); if (t.length < 10) { document.getElementById('nbdsp-e').hidden = false; return; }
    var d = deal(el.dataset.id); d.pay.st = 'DISPUTED'; d.pay.disputeNote = t; d.pay.disputeAt = G.now(); d.hist.push([d.status, G.now(), S.user.name, '분쟁을 접수했어요: ' + t]); G.log('이웃 나눔 ' + d.id + ' 분쟁 접수'); G.toast('분쟁을 접수했어요. 운영자가 확인할게요.'); G.rerender();
  };
})();
