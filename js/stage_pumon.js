/* 단계별 기능 공개 — 품온(이웃 나눔 개편): 4개 서비스, 점검 규칙, 체험 3회, 거점 맡기기, 안심 만남, 3단계 평가, 시간품 */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES, T = function () { return S.st; }, f = G.feat, C = CLUB;
  var $ = function (id) { return document.getElementById(id); };
  var val = function (id) { var e = $(id); return e ? String(e.value || '').trim() : ''; };
  var uid = function () { return S.user ? S.user.id : ''; };
  var nm = function (id) { return G.nbMember(id).name; };

  var SVC = G.PUMON = {
    TALENT: { name: '재능품', ico: 'star', line: '무료로 나누는 솜씨', rule: '요리·수선·배우기처럼 솜씨를 무료로 나눠요. 재료비 같은 실비만 1건 3만 원까지 받을 수 있고, 영수증을 공개해요.' },
    HELP: { name: '서로품', ico: 'handshake', line: '함께하고 가르쳐 주기', rule: '정리·식물·반찬처럼 \'함께 하거나 가르쳐 주는\' 일이에요. 유료는 1회 3시간·20만 원까지 안전결제로만, 수수료는 10%(PLUS 이상 5%). 대신 해 주는 대행은 안 되고, 한 달 5건을 넘으면 협력업체 심사를 안내해요.' },
    GIVE: { name: '나눔품', ico: 'gift', line: '안 쓰는 물건을 무료로', rule: '깨끗한 물건을 무료로 나눠요. 식품·의약품·개봉 화장품·주류·살아 있는 동물·유아 카시트는 안 돼요.' },
    SWAP: { name: '바꿈품', ico: 'swap', line: '물건끼리 바꾸기', rule: '돈 없이 물건끼리 바꿔요. 나눔품과 같은 금지 품목이 적용돼요.' }
  };
  var TALENT_CATS = ['배우기·재능', '요리·반찬', '수선·리폼'];
  G.pumonSvc = function (p) { return p.svc || (p.pay === 'PAID' ? 'HELP' : TALENT_CATS.indexOf(p.cat) >= 0 ? 'TALENT' : 'HELP'); };
  /* 한 달에 유료 서로품을 5건 넘게 제공하는 회원 → 협력업체 심사 안내 */
  G.repeatProvider = function (u) { var m = SITE.today.slice(0, 7); return S.club.deals.filter(function (d) { var p = G.nbPost(d.post); return d.prov === u && p && p.pay === 'PAID' && String(d.at).slice(0, 7) === m && ['CANCELLED', 'DECLINED', 'BLOCKED'].indexOf(d.status) < 0; }).length; };
  var svcBd = function (k) { return '<span class="bd bd-pm bd-pm-' + k + '">' + SVC[k].name + '</span>'; };
  var payBd = function (pay) { var m = C.PAY[pay]; return '<span class="bd bd-' + m.tone + '">' + m.name + '</span>'; };
  var kindBd = function (k) { return '<span class="bd ' + (k === 'OFFER' ? 'bd-kind-o' : 'bd-kind-r') + '">' + (k === 'OFFER' ? '드려요' : '찾아요') + '</span>'; };
  var money = function (p) { return p.pay === 'FREE' ? '무료' : (p.pay === 'COST' ? '실비 ' : '') + G.fmt(p.price); };
  var BAN_ITEM = /(식품|음식|반찬|김치|의약|약품|영양제|건강기능|화장품|담배|술|주류|와인|강아지|고양이|햄스터|분양|카시트|분유)/;
  var BAN_HELP = /(대행|대신\s?(해|해\s?드|처리|결제|송금|입금|가|다녀)|대리\s?(운전|결제|수령|서명)|심부름|돈\s?(빌려|빌림)|보증)/;

  /* ---------- 체험 3회 ---------- */
  G.trialInfo = function (u) {
    u = u || uid(); var l = (T().trial[u] || []).filter(function (d) { return G.dayDiff(d, SITE.today) < 60; });
    var give = (T().trialGive || {})[u] || 0;
    var bonus = (T().trialBonus || {})[u] || 0;
    return { regular: G.isRegular(u), used: l.length, left: Math.max(0, 3 + bonus - l.length), give: give, total: 3 + bonus };
  };
  function trialOn() { return f('trial3') && S.user && !G.isRegular(uid()); }
  var timeBal = function (u) { return (T().timeBank || {})[u] || 0; };

  /* ---------- 목록 (품온) ---------- */
  var fs = { s: '', k: '', mine: false };
  var oClub = P.club;
  P.club = function (arg) {
    arg = arg || '';
    if (!f('pumon')) return oClub(arg);
    if (arg === '' && S.user) return list();
    var o = oClub(arg);
    try {
      if (arg === 'new' || arg.indexOf('edit-') === 0) o = formPlus(o, arg);
      else if (arg.indexOf('deal-') === 0) o = dealPlus(o, arg.slice(5));
      else if (arg === 'rules') o = rulesPlus(o);
      else if (['mine', 'recv', 'sent', 'pay'].indexOf(arg) < 0 && arg && S.user) o = postPlus(o, arg);
      if (!S.user && o.html) o.html = o.html.replace(/<h1 class="ph-t">이웃 나눔은<br>/, '<h1 class="ph-t">품온은<br>');
    } catch (e) { console.error(e); }
    return o;
  };
  function status() {
    var u = uid(), m = G.memInfo(u), b = f('branches') && m.branch ? G.branch(m.branch) : null, o = [];
    if (f('memberLink')) {
      if (G.isRegular(u)) o.push('<span class="bd bd-ok">품온 정회원</span> ' + esc(PLANS[G.planOf(u)][0]) + (f('gradeFee') ? ' · 유료 재능 수수료 ' + G.feeRate(u) + '%' : ''));
      else if (f('trial3')) { var t = G.trialInfo(u); o.push('<span class="bd bd-warn">체험 회원</span> 60일 ' + t.total + '회 중 <b>' + t.used + '회</b> 사용 · 남은 ' + t.left + '회 <a class="lnk-i" href="#plans">정회원 되기</a>'); }
      else o.push('<span class="bd bd-mute">무료 회원</span> <a class="lnk-i" href="#plans">정회원 혜택 보기</a>');
    }
    if (b) o.push(ico('pin', 14) + ' 우리 동네 ' + esc(b.name.replace(' (예시)', '')) + (f('localBadge') ? (T().localOk[u] ? ' <span class="bd bd-ok">동네 확인</span>' : ' <span class="small">· 가맹점에 들르면 동네 확인 배지를 드려요</span>') : ''));
    if (f('timePum')) o.push(ico('clock', 14) + ' 시간품 <b>' + timeBal(u) + '시간</b> <span class="small">(현금으로 바꿀 수 없어요)</span>');
    return o.length ? '<div class="pm-status">' + o.map(function (x) { return '<p>' + x + '</p>'; }).join('') + '</div>' : '';
  }
  function list() {
    var posts = S.club.posts.filter(function (p) { return p.status === 'PUBLISHED'; }), todo = G.nbTodo();
    var cards = posts.map(function (p) {
      var k = G.pumonSvc(p), t = G.nbTrust(p.owner);
      return '<article class="nb" data-s="' + k + '" data-k="' + p.kind + '" data-o="' + p.owner + '" data-q="' + esc((p.title + ' ' + p.body + ' ' + p.area + ' ' + p.cat).toLowerCase()) + '"><div class="nb-t">' + svcBd(k) + kindBd(p.kind) + payBd(p.pay) + '</div><h3><a href="#club-' + p.id + '">' + esc(p.title) + '</a></h3><p>' + esc(p.body.length > 70 ? p.body.slice(0, 70) + '…' : p.body) + '</p>' +
        '<ul class="nb-m"><li>' + ico('pin', 15) + esc(p.area) + '</li>' + (p.delivery === 'HUB' && f('hubOps') ? '<li>' + ico('lock', 15) + '거점 맡기기</li>' : '<li>' + ico('clock', 15) + esc(p.when) + '</li>') + '</ul><div class="nb-f"><span class="nb-who"><span class="av" aria-hidden="true">' + esc(nm(p.owner).charAt(0)) + '</span><span>' + esc(nm(p.owner)) + '<small>' + (t.done ? '품온 ' + t.done + '회 완료' : '새 이웃') + (f('localBadge') && T().localOk[p.owner] ? ' · 동네 확인' : '') + '</small></span></span><b>' + money(p) + '</b></div></article>';
    }).join('');
    var tabs = '<div class="pm-svcs" role="group" aria-label="품온 서비스">' + [['', '전체', 'grid', '모든 품온']].concat(Object.keys(SVC).map(function (k) { return [k, SVC[k].name, SVC[k].ico, SVC[k].line]; })).map(function (s) { return '<button class="pm-svc' + (fs.s === s[0] ? ' on' : '') + '" data-act="pmSvc" data-v="' + s[0] + '">' + ico(s[2], 22) + '<b>' + s[1] + '</b><span>' + s[3] + '</span></button>'; }).join('') +
      '<a class="pm-svc pm-doran" href="' + (f('events') ? '#events' : '#club') + '">' + ico('calendar', 22) + '<b>공식 도란품</b><span>' + (f('events') ? '더가넷이 여는 모임' : '곧 열려요') + '</span></a></div>';
    var bar = '<div class="nb-bar"><div class="chips" role="group" aria-label="구분">' + [['', '전체'], ['OFFER', '드려요'], ['REQUEST', '찾아요']].map(function (c) { return '<button class="chip' + (fs.k === c[0] ? ' on' : '') + '" data-act="pmK" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>' +
      (f('branches') ? '<label class="tgl"><input type="checkbox" data-on="change:pmMine"' + (fs.mine ? ' checked' : '') + '> 우리 동네 이웃만</label>' : '') + '<label class="srch">' + ico('search', 18) + '<input id="pmq" type="search" placeholder="제목·내용 검색" data-on="input:pmQ"></label></div>';
    var rule = fs.s ? '<div class="callout">' + ico(SVC[fs.s].ico, 20) + '<div><strong>' + SVC[fs.s].name + ' 기준</strong><p>' + SVC[fs.s].rule + '</p></div></div>' : '';
    var ev = f('events') ? T().events.filter(function (e) { return !e.pending && e.date.slice(0, 7) === SITE.today.slice(0, 7) || (!e.pending && e.date.slice(0, 10) >= SITE.today && G.dayDiff(SITE.today, e.date) <= 31); }).sort(function (a, b) { return a.date > b.date ? 1 : -1; }).slice(0, 3) : [];
    var monthly = ev.length ? '<div class="pm-ev"><p class="kick">이달의 공식 모임</p><ul>' + ev.map(function (e) { return '<li><a href="#event-' + e.id + '"><b>' + e.date.slice(5, 10).replace('-', '/') + '</b> ' + esc(e.title) + ' <span class="small">' + esc((G.hub(e.hub) || {}).name || '') + '</span></a></li>'; }).join('') + '</ul></div>' : '';
    var role = '<p class="pm-role">' + ico('info', 16) + ' <b>더가넷은 맡기는 곳, 품온은 함께하는 곳이에요.</b> 전문 작업과 책임 보상이 필요하면 더가넷 서비스를, 이웃과 함께하고 배우려면 품온을 이용하세요.</p>';
    var pre = f('preorder') ? '<a class="callout nb-strip" href="#preorder">' + ico('bell', 20) + '<div><strong>우리 동네 품온이 열리면 알려 드릴까요?</strong><p>창립회원 100인에게 평생 창립 배지와 첫해 회비 할인을 드려요.</p></div>' + ico('chev-right', 18) + '</a>' : '';
    return { title: '품온', html: G.pageHead('품온', '가넷 회원끼리 솜씨·시간·물건을 품앗이처럼 주고받는 곳이에요. 모든 글은 운영자가 먼저 확인하고, 약속은 안전 검증을 거쳐 연결돼요.', [['품온', '']], 'PUMON <span class="pm-by">by THE GARNET</span>') +
      '<section class="sec-tight"><div class="wrap">' + status() + role + tabs + rule + monthly + pre +
      '<div class="nb-top"><div class="nb-top-l"></div><div class="nb-top-r"><div class="fa"><a class="btn btn-fill" href="#club-new">' + ico('plus', 18) + ' 품온 글 올리기</a><a class="btn btn-line" href="#club-mine">내 품온' + (todo ? ' <i class="dot-n">' + todo + '</i>' : '') + '</a></div><p class="small mt"><a class="lnk" href="#club-rules">이용 기준 ' + ico('arrow-right', 16) + '</a></p></div></div>' +
      bar + '<p class="cat-cnt" id="pmn"></p><div class="grid-sc nb-grid" id="pmg">' + cards + '</div><p class="empty" id="pme" hidden>조건에 맞는 글이 아직 없어요. 첫 글을 올려 보세요.</p>' +
      '<div class="gap"><div class="callout">' + ico('shield', 20) + '<div><strong>더가넷은 안전 확인을 돕는 곳이에요</strong><p>품온은 회원 사이의 약속이에요. 더가넷은 글과 약속을 검토하고 중개하지만 거래 당사자는 아니에요. 유료 재능은 더가넷 안전결제로만 주고받아요. (시연 화면에는 실제 결제가 없습니다.)</p></div></div></div></div></section>', mount: filt };
  }
  function filt() {
    var q = (val('pmq') || '').toLowerCase(), n = 0, my = G.memInfo(uid()).branch;
    document.querySelectorAll('#pmg .nb').forEach(function (a) { var ok = (!fs.s || a.dataset.s === fs.s) && (!fs.k || a.dataset.k === fs.k) && (!q || a.dataset.q.indexOf(q) >= 0) && (!fs.mine || G.memInfo(a.dataset.o).branch === my); a.hidden = !ok; if (ok) n++; });
    var c = $('pmn'); if (c) c.textContent = n + '개의 글'; var e = $('pme'); if (e) e.hidden = n > 0;
  }
  G.ACT.pmSvc = function (el) { fs.s = el.dataset.v; G.rerender(); };
  G.ACT.pmK = function (el) { fs.k = el.dataset.v; document.querySelectorAll('[data-act=pmK]').forEach(function (b) { b.classList.toggle('on', b.dataset.v === fs.k); }); filt(); };
  G.INP.pmMine = function (el) { fs.mine = el.checked; filt(); };
  G.INP.pmQ = function () { filt(); };

  /* ---------- 글쓰기 ---------- */
  function formPlus(o, arg) {
    if (!o.html || o.html.indexOf('data-sub="nbPost"') < 0) return o;
    var p = arg.indexOf('edit-') === 0 ? G.nbPost(arg.slice(5)) : null, k = p ? G.pumonSvc(p) : 'TALENT', item = k === 'GIVE' || k === 'SWAP';
    var hubs = f('places') ? T().hubs : [];
    var add = '<div class="fg full"><span class="lb">어떤 품온인가요 <em class="req">필수</em></span><div class="pills pm-pills" role="radiogroup">' + Object.keys(SVC).map(function (x) { return '<label class="pill"><input type="radio" name="psvc" value="' + x + '"' + (k === x ? ' checked' : '') + ' data-on="change:psvc"><span>' + ico(SVC[x].ico, 16) + ' ' + SVC[x].name + '</span></label>'; }).join('') + '</div><p class="hint-s" id="ps-rule">' + SVC[k].rule + '</p></div>' +
      '<div class="fg full" id="ps-help"' + (k === 'HELP' ? '' : ' hidden') + '><label class="chk"><input type="checkbox" id="ps-nd"' + (p && p.svc === 'HELP' ? ' checked' : '') + '><span><b>[서로품 필수]</b> 대신 해 주는 일(대행)이 아니라 함께 하거나 가르쳐 주는 일이에요. 1회 3시간을 넘기지 않아요.</span></label>' + (G.repeatProvider(uid()) >= 5 ? '<p class="hint-s">이번 달 유료 서로품이 5건을 넘었어요. 계속하시려면 더가넷 협력업체 심사를 안내해 드려요. <a class="lnk-i" href="#inquiry">문의하기</a></p>' : '') + '</div>' +
      '<div class="fg full pm-item" id="ps-item"' + (item ? '' : ' hidden') + '><div class="fgrid"><div class="fg"><label class="lb" for="ps-c">물건 상태</label><select id="ps-c">' + ['새것', '거의 새것', '상태 좋음', '사용감 있음'].map(function (x) { return '<option' + (p && p.item === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
      '<div class="fg"><span class="lb">주고받는 방법</span><div class="pills"><label class="pill"><input type="radio" name="ps-d" value="MEET"' + (!p || p.delivery !== 'HUB' ? ' checked' : '') + ' data-on="change:psD"><span>직접 만나기</span></label>' + (f('hubOps') ? '<label class="pill"><input type="radio" name="ps-d" value="HUB"' + (p && p.delivery === 'HUB' ? ' checked' : '') + ' data-on="change:psD"><span>거점에 맡기기</span></label>' : '') + '</div></div>' +
      '<div class="fg"><label class="lb" for="ps-ph">물건 사진</label><input id="ps-ph" type="file" accept="image/*" multiple><p class="hint-s">앞·뒤·흠집 사진을 올려 주세요. (시연: 파일 이름만 저장)</p></div>' +
      (hubs.length ? '<div class="fg"><label class="lb" for="ps-h">거점</label><select id="ps-h"><option value="">선택해 주세요</option>' + hubs.map(function (h) { return '<option value="' + h.id + '"' + (p && p.hub === h.id ? ' selected' : '') + '>' + esc(h.name) + '</option>'; }).join('') + '</select></div>' : '') + '</div></div>';
    o.html = o.html.replace('<div class="fgrid"><div class="fg full"><span class="lb">어떤 글인가요', '<div class="fgrid">' + add + '<div class="fg full"><span class="lb">어떤 글인가요');
    o.html = o.html.replace('<h4>올릴 수 없는 글</h4>', '<h4>품온 4가지</h4><ul class="ul">' + Object.keys(SVC).map(function (x) { return '<li><b>' + SVC[x].name + '</b> ' + SVC[x].line + '</li>'; }).join('') + '</ul><h4>올릴 수 없는 글</h4>');
    o.mount = function () { G.INP.psvc(document.querySelector('[name=psvc]:checked')); };
    return o;
  }
  G.INP.psvc = function (el) {
    if (!el) return; var k = el.value, item = k === 'GIVE' || k === 'SWAP', r = $('ps-rule'), b = $('ps-item'); if (r) r.textContent = SVC[k].rule; if (b) b.hidden = !item;
    var hb = $('ps-help'); if (hb) hb.hidden = k !== 'HELP';
    document.querySelectorAll('[name=pay]').forEach(function (x) { var dis = (item && x.value !== 'FREE') || (k === 'TALENT' && x.value === 'PAID'); x.disabled = dis; x.closest('.pill').classList.toggle('off', dis); if (dis && x.checked) { var fr = document.querySelector('[name=pay][value=FREE]'); fr.checked = true; G.INP.nbPay(fr); } });
  };
  G.INP.psD = function () { };
  var oPost = G.SUB.nbPost;
  G.SUB.nbPost = function (fm) {
    if (!f('pumon')) return oPost(fm);
    var k = (document.querySelector('[name=psvc]:checked') || {}).value, pay = (document.querySelector('[name=pay]:checked') || {}).value, e = $('n-e');
    var txt = val('n-t') + ' ' + val('n-b'), dl = (document.querySelector('[name=ps-d]:checked') || {}).value || 'MEET', hub = val('ps-h');
    var fail = function (m) { e.textContent = m; e.hidden = false; e.scrollIntoView({ block: 'center' }); };
    if (!k) return fail('어떤 품온인지 골라 주세요.');
    if (f('pumonCheck')) {
      if ((k === 'GIVE' || k === 'SWAP') && pay !== 'FREE') return fail(SVC[k].name + '은 돈을 주고받지 않아요. 무료로 바꿔 주세요.');
      if ((k === 'GIVE' || k === 'SWAP') && BAN_ITEM.test(txt)) return fail('나눔품·바꿈품에 올릴 수 없는 물건이 있어요: 식품·의약품·건강기능식품·개봉 화장품·주류·담배·살아 있는 동물·유아 카시트·분유');
      if (k === 'TALENT' && pay === 'PAID') return fail('재능품은 무료로 나눠요(실비만 3만 원까지). 돈을 받는 \'함께하기·가르쳐 주기\'는 서로품으로 올려 주세요.');
      if (k === 'HELP' && BAN_HELP.test(txt)) return fail('서로품은 \'대신 해 주는 일(대행)\'은 올릴 수 없어요. 함께 하거나 가르쳐 주는 일로 바꿔 주세요. 대신 맡기려면 더가넷 서비스를 이용하세요.');
      if (k === 'HELP' && !($('ps-nd') || {}).checked) return fail('서로품은 대행이 아니라는 확인에 체크해 주세요.');
    }
    if ((k === 'GIVE' || k === 'SWAP') && dl === 'HUB' && !hub) return fail('맡길 거점을 골라 주세요.');
    var id = fm.dataset.id, before = S.club.posts.length; oPost(fm);
    var p = id ? G.nbPost(id) : (S.club.posts.length > before ? S.club.posts[0] : null);
    if (p) { p.svc = k; if (k === 'GIVE' || k === 'SWAP') { p.item = val('ps-c'); p.delivery = dl; p.hub = hub; var ph = $('ps-ph'); if (ph && ph.files.length) p.photos = Array.prototype.map.call(ph.files, function (x) { return x.name; }); } if (k === 'HELP') p.notProxy = true; G.save(); }
  };
  function rulesPlus(o) {
    o.html = o.html.replace('<h2 class="h3 gap">결제와 수수료</h2>', '<h2 class="h3 gap">품온 4가지</h2><div class="card"><table class="tbl"><tbody>' + Object.keys(SVC).map(function (x) { return '<tr><td>' + svcBd(x) + '</td><td>' + SVC[x].rule + '</td></tr>'; }).join('') + '</tbody></table>' + (f('trial3') ? '<p class="small">무료 회원은 가입 후 60일 동안 3회까지 체험할 수 있어요(나눔품 받기는 1회). LIFE START 이상은 정회원으로 제한이 없어요.</p>' : '') + (f('timePum') ? '<p class="small">시간품: 서로품을 무료로 함께해 주면 1시간이 쌓이고, 내가 도움을 받을 때 쓸 수 있어요. 현금으로 바꾸거나 남에게 줄 수 없고, 동행·의료·돌봄 맡기기에는 쓸 수 없어요.</p>' : '') + '</div><h2 class="h3 gap">결제와 수수료</h2>');
    if (f('gradeFee')) o.html = o.html.replace(/<h2 class="h3 gap">결제와 수수료<\/h2>/, '<h2 class="h3 gap">결제와 수수료</h2><p class="small">유료 서로품 수수료는 LIFE START·BASIC 10%, LIFE PLUS 이상 5%예요.</p>');
    return o;
  }

  /* ---------- 글 상세 ---------- */
  function postPlus(o, id) {
    var p = G.nbPost(id); if (!p || !o.html) return o;
    var k = G.pumonSvc(p), h = o.html, own = p.owner === uid();
    h = h.replace('<div class="meta">', '<div class="meta">' + svcBd(k));
    var add = '<div class="pm-who">' + (G.badgesOf(p.owner).length ? G.badgeHtml(p.owner) : '') + (f('rating3') ? ratingSum(p.owner) : '') + '</div>';
    if ((k === 'GIVE' || k === 'SWAP') && p.item) add += '<dl class="sum"><div class="kv"><dt>물건 상태</dt><dd>' + esc(p.item) + '</dd></div><div class="kv"><dt>주고받기</dt><dd>' + (p.delivery === 'HUB' ? '거점에 맡기기 · <a class="lnk-i" href="#place-' + p.hub + '">' + esc((G.hub(p.hub) || {}).name || '') + '</a> (보관 7일)' : '직접 만나기') + '</dd></div></dl>';
    if (f('bridge') && (k === 'HELP' || k === 'TALENT')) { var M = { '집안일·정리': 'S03', '식물·꽃': 'S02', '반려동물(보호자 동반)': 'S06', '말벗·산책': 'S11' }; if (M[p.cat]) add += '<p class="small">' + ico('arrow-up-right', 14) + ' 전문 작업과 보상이 필요하면 <a class="lnk-i" href="#svc-' + M[p.cat] + '">더가넷 ' + esc(G.sv(M[p.cat]).name) + '</a>을 이용해 보세요.</p>'; }
    h = h.replace('<div class="blk"><h2>이야기</h2>', add + '<div class="blk"><h2>이야기</h2>');
    if (!own && h.indexOf('data-sub="nbReq"') >= 0) {
      if (trialOn()) {
        var t = G.trialInfo(), giveBlock = k === 'GIVE' && p.kind === 'OFFER' && t.give >= 1;
        if (t.left <= 0 || giveBlock) h = h.replace(/<form data-sub="nbReq"[\s\S]*?<\/form>/, '<div class="pm-up"><h3>' + (giveBlock ? '나눔품 받기 체험을 이미 썼어요' : '체험 3회를 모두 썼어요') + '</h3><p class="small">LIFE START(월 4,900원) 이상 정회원이 되면 횟수 제한 없이 품온을 이용할 수 있어요.</p><a class="btn btn-fill btn-block" href="#plans">정회원 되기</a></div>');
        else h = h.replace('<form data-sub="nbReq"', '<p class="pm-trial">' + ico('info', 14) + ' 체험 ' + t.left + '회 남았어요 (60일 3회' + (k === 'GIVE' ? ', 나눔품 받기 1회' : '') + ')</p><form data-sub="nbReq"');
      }
      if (f('places')) {
        var opts = T().hubs.map(function (x) { return '<option' + (p.hub === x.id ? ' selected' : '') + '>거점: ' + esc(x.name) + '</option>'; }).join('');
        h = h.replace('<option>동네 도서관·카페 등 공공장소</option>', opts + '<option>동네 도서관·카페 등 공공장소</option>');
      }
    }
    o.html = h; return o;
  }
  function ratingSum(u) {
    var r = G.pubRatings(u).filter(function (x) { return x.level >= 2; }); if (!r.length) return '';
    var chips = {}; r.forEach(function (x) { (x.chips || []).forEach(function (c) { chips[c] = (chips[c] || 0) + 1; }); });
    return ' <span class="small">추천 <b>' + r.length + '</b></span>' + Object.keys(chips).slice(0, 3).map(function (c) { return ' <span class="tag">' + esc(c) + ' ' + chips[c] + '</span>'; }).join('');
  }
  var oReq = G.SUB.nbReq;
  G.SUB.nbReq = function (fm) {
    if (!f('pumon')) return oReq(fm);
    var p = G.nbPost(fm.dataset.id), k = G.pumonSvc(p), e = $('rq-e');
    if (trialOn()) { var t = G.trialInfo(); if (t.left <= 0 || (k === 'GIVE' && p.kind === 'OFFER' && t.give >= 1)) { e.textContent = '체험 횟수를 모두 썼어요. 정회원이 되면 계속 이용할 수 있어요.'; e.hidden = false; return; } }
    var before = S.club.deals.length; oReq(fm);
    if (S.club.deals.length > before) {
      var d = S.club.deals[0], pl = d.place || '';
      d.svc = k; var hb = T().hubs.filter(function (x) { return pl === '거점: ' + x.name; })[0]; if (hb) d.hub = hb.id; else if (p.delivery === 'HUB') d.hub = p.hub;
      if (trialOn()) { (T().trial[uid()] = T().trial[uid()] || []).push(SITE.today); if (k === 'GIVE' && p.kind === 'OFFER') { T().trialGive = T().trialGive || {}; T().trialGive[uid()] = (T().trialGive[uid()] || 0) + 1; } }
      G.notify(p.owner, '[더가넷] 품온 "' + p.title + '"에 새 요청이 왔어요.'); G.save();
    }
  };

  /* ---------- 약속 상세 ---------- */
  function dealPlus(o, id) {
    var d = G.nbDeal(id); if (!d || !o.html) return o;
    var p = G.nbPost(d.post), k = G.pumonSvc(p), me = uid(), other = d.req === me ? d.prov : d.req, h = o.html, side = '';
    h = h.replace('<div class="meta">', '<div class="meta">' + svcBd(k));
    if (f('safeNumber')) h = h.replace(/(<p class="nb-contact">[\s\S]*?<\/svg>)[^<]*(<\/p>)<p class="small">[^<]*<\/p>/, '$1 안심번호 0507-' + (1000 + (id.charCodeAt(1) * 37) % 9000) + '-' + (1000 + (other.charCodeAt(1) * 53) % 9000) + '$2<p class="small">실제 번호 대신 안심번호로 연결돼요. 약속이 끝나고 7일이 지나면 연결이 끊겨요.</p>');
    if (f('hubOps') && d.hub && (k === 'GIVE' || k === 'SWAP') && (d.status === 'VERIFIED' || d.status === 'DONE')) {
      var st = T().storage.filter(function (x) { return x.deal === d.id; })[0], hub = G.hub(d.hub) || {};
      var giver = p.kind === 'OFFER' ? p.owner : (p.owner === d.req ? d.prov : d.req);
      var box = '<h4>' + ico('lock', 16) + ' 거점 맡기기 · ' + esc(hub.name || '') + '</h4>';
      if (!st) box += me === giver ? '<p class="small">거점 직원에게 글 번호 <b>' + p.id + '</b>를 알려 주고 보관함에 넣어 주세요.</p><label class="chk"><input type="checkbox" id="hd-ok"><span>보관은 7일이에요. 기한이 지나면 알림을 받고, 7일이 더 지나면 기부하거나 정리하는 데 동의해요. 거점은 보관만 돕고 물건 상태는 책임지지 않아요.</span></label><button class="btn btn-fill btn-block" data-act="hubDrop" data-id="' + d.id + '">거점에 맡겼어요</button>' : '<p class="small">상대가 거점에 맡기면 인증번호를 알림톡으로 보내 드려요.</p>';
      else box += (me === giver ? '<p class="small">' + esc(st.st) + ' · ' + st.due + '까지 보관</p>' : '<p class="pm-code">인증번호 <b>' + st.code + '</b></p><p class="small">' + esc(st.st) + ' · ' + st.due + '까지 찾아가세요</p>') + (st.st === '전달 대기' && me !== giver ? '<div class="inl"><input id="hp-c" placeholder="거점에서 받은 인증번호" aria-label="인증번호"><button class="btn btn-fill btn-sm" data-act="hubPick" data-id="' + d.id + '">찾아갔어요</button></div><p class="small">시연: 위 인증번호를 그대로 넣으세요. 실제로는 거점 직원이 QR로 확인해요.</p>' : '');
      side += '<div class="act-b">' + box + '<a class="lnk" href="#place-' + d.hub + '">거점 찾아가기 ' + ico('arrow-right', 16) + '</a></div>';
    }
    if (f('safeMeet') && d.status === 'VERIFIED' && !(d.hub && (k === 'GIVE' || k === 'SWAP'))) {
      var c = T().checkins[d.id] || {};
      var endAt = G.addHours ? G.addHours(String(d.date).slice(0, 16), 2) : '';
      side += '<div class="act-b"><h4>' + ico('shield', 16) + ' 안심 만남</h4><p class="small">종료 예정 ' + esc(endAt) + '</p>' + (!c.in ? '<p class="small">만나면 "만났어요"를, 헤어지면 "잘 끝났어요"를 눌러 주세요. 종료 예정 30분이 지나도 끝난 확인이 없으면 가맹점 매니저가 먼저 전화드려요.</p><button class="btn btn-line btn-block" data-act="meetIn" data-id="' + d.id + '">만났어요</button>' : !c.out ? '<p class="small">' + c.in + ' 만남 시작. 끝나면 꼭 눌러 주세요.</p><button class="btn btn-fill btn-block" data-act="meetOut" data-id="' + d.id + '">잘 끝났어요</button>' : '<p class="small">' + ico('check', 14) + ' ' + c.in + ' ~ ' + c.out + ' 안심 만남 확인</p>') + '<a class="btn btn-danger btn-block" href="tel:119">긴급 연락 119</a><p class="small">안심 만남은 확인과 연락을 돕는 기능이에요. 응급 상황에서는 바로 119에 연락하세요.</p></div>';
    }
    if (f('rating3') && d.status === 'DONE') {
      var mine = T().ratings.filter(function (r) { return r.deal === d.id && r.by === me; })[0];
      side += '<div class="act-b"><h4>' + esc(nm(other)) + '님은 어땠나요?</h4>' + (mine ? '<p class="small">' + ['', '아쉬워요', '좋아요', '최고예요'][mine.level] + '로 평가했어요.</p>' : rate3('rate3Deal', d.id)) + '</div>';
    }
    if (f('dispute') && ['VERIFIED', 'DONE'].indexOf(d.status) >= 0) side += '<a class="lnk" href="#my-dispute-' + d.id + '">' + ico('info', 16) + ' 문제 접수 (분쟁 신청)</a>';
    if (side) h = h.replace('<aside class="dt-r">', '<aside class="dt-r">' + side);
    o.html = h; return o;
  }
  var CHIPS = ['시간 약속', '친절해요', '설명이 쉬워요', '꼼꼼해요'], WHY = ['약속 시간', '설명과 달랐어요', '불친절', '기타'];
  function rate3(act, id) { return '<div class="r3">' + [[3, '최고예요', 'star'], [2, '좋아요', 'heart'], [1, '아쉬워요', 'info']].map(function (r) { return '<button class="r3-b r3-' + r[0] + '" data-act="' + act + '" data-id="' + id + '" data-v="' + r[0] + '">' + ico(r[2], 22) + '<span>' + r[1] + '</span></button>'; }).join('') + '</div>' +
    '<div class="r3-x"><p class="small">좋았던 점 (선택)</p><div class="cks">' + CHIPS.map(function (c) { return '<label class="chk"><input type="checkbox" name="r3c" value="' + c + '"> ' + c + '</label>'; }).join('') + '</div><p class="small">아쉬웠다면 이유 (본인과 관리자만 봐요)</p><select id="r3w"><option value="">선택 안 함</option>' + WHY.map(function (w) { return '<option>' + w + '</option>'; }).join('') + '</select></div><p class="small">평가는 두 분이 모두 남기거나 7일이 지나면 반영돼요. \'아쉬워요\'는 상대에게 보이지 않아요.</p>'; }
  G.r3Extra = function () { return { chips: Array.prototype.map.call(document.querySelectorAll('[name=r3c]:checked'), function (x) { return x.value; }), why: val('r3w') }; };
  G.rate3 = rate3;
  G.ACT.rate3Deal = function (el) { var d = G.nbDeal(el.dataset.id), me = uid(), to = d.req === me ? d.prov : d.req; var ex = G.r3Extra(); T().ratings.push({ deal: d.id, by: me, to: to, level: +el.dataset.v, chips: +el.dataset.v >= 2 ? ex.chips : [], why: +el.dataset.v === 1 ? ex.why : '', at: SITE.today }); G.save(); G.toast('평가를 남겼어요. 고마워요.'); G.rerender(); };
  G.ACT.hubDrop = function (el) {
    if (!($('hd-ok') || {}).checked) return G.toast('보관 기준에 동의해 주세요.');
    var d = G.nbDeal(el.dataset.id), p = G.nbPost(d.post), giver = uid(), recv = d.req === giver ? d.prov : d.req, code = 'GN-' + Math.floor(1000 + Math.random() * 8999);
    T().storage.unshift({ id: 'ST' + (T().storage.length + 1), deal: d.id, post: p.id, hub: d.hub, item: p.title, from: giver, to: recv, code: code, at: G.now(), due: G.addDays(SITE.today, 7), st: '전달 대기' });
    d.hist.push([d.status, G.now(), S.user.name, '거점 보관함에 맡겼어요. (보관 코드 ' + code + ')']);
    G.notify(recv, '[더가넷] ' + (G.hub(d.hub) || {}).name + '에 물건이 도착했어요. 보관 코드 ' + code + ', 7일 안에 찾아가세요.'); G.save(); G.toast('맡겼어요. 상대에게 보관 코드를 보냈어요.'); G.rerender();
  };
  G.ACT.hubPick = function (el) { var d = G.nbDeal(el.dataset.id), st = T().storage.filter(function (x) { return x.deal === d.id; })[0]; if (val('hp-c').toUpperCase() !== st.code) return G.toast('인증번호가 맞지 않아요.'); st.st = '전달 완료'; st.doneAt = G.now(); d.hist.push([d.status, G.now(), S.user.name, '거점에서 찾아갔어요.']); G.notify(st.from, '[더가넷] 맡기신 물건을 상대가 찾아갔어요.'); G.save(); G.toast('찾아간 것으로 표시했어요. 완료 확인도 눌러 주세요.'); G.rerender(); };
  G.ACT.meetIn = function (el) { var d = G.nbDeal(el.dataset.id); T().checkins[el.dataset.id] = { in: G.now(), end: G.addHours(String(d.date).slice(0, 16), 2) }; G.notify(uid(), '[더가넷] 안심 만남을 시작했어요. (' + G.nbPost(d.post).title + ')'); G.save(); G.toast('만남을 시작했어요. 안전하게 만나세요.'); G.rerender(); };
  G.ACT.meetOut = function (el) { T().checkins[el.dataset.id].out = G.now(); G.notify(uid(), '[더가넷] 안심 만남이 무사히 끝났어요.'); G.save(); G.toast('잘 끝났다고 기록했어요.'); G.rerender(); };

  var oDone = G.ACT.nbDone;
  G.ACT.nbDone = function (el) {
    oDone(el);
    var d = G.nbDeal(el.dataset.id);
    if (d && d.status === 'DONE' && !d.award) {
      d.award = true;
      if (f('points')) { G.addPoint(d.req, '품온 약속 완료', 100); G.addPoint(d.prov, '품온 약속 완료', 100); }
      if (f('timePum') && G.pumonSvc(G.nbPost(d.post)) === 'HELP' && G.nbPost(d.post).pay === 'FREE') { T().timeBank = T().timeBank || {}; T().timeBank[d.prov] = (T().timeBank[d.prov] || 0) + 1; }
      G.save();
    }
  };
})();
