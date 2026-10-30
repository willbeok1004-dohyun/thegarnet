/* 단계별 기능 공개 — 마이페이지: 결제, 포인트·이용권, 가족·안심 리포트, 받은 알림, 우리 집 기록, 나의 나눔, 문제 접수, 신청 상세 덧붙이기 */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES, T = function () { return S.st; }, f = G.feat;
  var byId = function (arr, id) { return (arr || []).filter(function (x) { return String(x.id) === String(id); })[0]; };
  var $ = function (id) { return document.getElementById(id); };
  var val = function (id) { var e = $(id); return e ? String(e.value || '').trim() : ''; };
  var uid = function () { return S.user ? S.user.id : ''; };
  var shell = function (c, t, b, s) { return G.myShell(c, t, b, s); };
  var fg = function (id, label, input, cls) { return '<div class="fg' + (cls ? ' ' + cls : '') + '"><label class="lb" for="' + id + '">' + label + '</label>' + input + '</div>'; };
  var sel = function (id, opts, cur) { return '<select id="' + id + '">' + opts.map(function (o) { o = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(o[0]) + '"' + (String(cur) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; };
  var tbl = function (head, rows, empty) { return rows.length ? '<div class="tw"><table class="tbl"><thead><tr>' + head.map(function (h) { return '<th' + (h.charAt(0) === '>' ? ' class="r"' : '') + '>' + h.replace(/^>/, '') + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>' : G.empty(empty || '아직 없어요.'); };

  G.myNavExtra = function () {
    var n = [];
    if (f('points') || f('coupons')) n.push(['points', '포인트·이용권', 'tag']);
    if (f('giving')) n.push(['giving', '나의 나눔', 'gift']);
    if (f('family')) n.push(['family', '가족·안심', 'users']);
    if (f('alimtalk')) { var c = T().notify.filter(function (x) { return x.to === uid() && !x.read; }).length; n.push(['notify', '받은 알림' + (c ? ' (' + c + ')' : ''), 'bell']); }
    if (f('homeLog')) n.push(['homelog', '우리 집 기록', 'home']);
    if (f('dispute')) n.push(['dispute', '문제 접수', 'info']);
    return n;
  };
  G.myPages = {
    points: function () { return f('points') || f('coupons') ? points() : null; },
    giving: function () { return f('giving') ? giving() : null; },
    family: function () { return f('family') ? family() : null; },
    notify: function () { return f('alimtalk') ? notify() : null; },
    homelog: function () { return f('homeLog') ? homelog() : null; },
    dispute: function (ref) { return f('dispute') ? dispute(ref === 'dispute' ? '' : ref) : null; },
    pay: function (no) { return f('pay') ? pay(no) : null; }
  };
  Object.keys(G.myPages).forEach(function (k) { var fn = G.myPages[k]; G.myPages[k] = function (a) { return fn(a) || shell('apps', '준비 중', G.empty('아직 열지 않은 기능이에요.', '<a class="btn btn-line btn-sm" href="#my">마이페이지로</a>')); }; });

  /* ---------- 포인트·이용권 ---------- */
  function points() {
    var u = uid(), bal = G.pointBal(u), cr = G.couponRate(u), ym = SITE.today.slice(0, 7), cps = T().coupons.filter(function (c) { return c.owner === u; });
    var got = cps.some(function (c) { return c.src === ym + ' 등급 이용권'; });
    var body = (f('points') ? '<div class="kpis k3"><div class="kpi"><span>가넷 포인트</span><b>' + bal.toLocaleString('ko-KR') + 'P</b></div><div class="kpi"><span>적립률 (' + esc(PLANS[G.planOf(u)][0]) + ')</span><b>' + G.pointRate(u) + '%</b></div><div class="kpi"><span>사용 기준</span><b>1P = 1원</b></div></div>' +
      tbl(['날짜', '내용', '>포인트'], (T().points[u] || []).slice().reverse().map(function (p) { return '<tr><td>' + p[0] + '</td><td>' + esc(p[1]) + '</td><td class="r">' + (p[2] > 0 ? '+' : '') + p[2].toLocaleString('ko-KR') + 'P</td></tr>'; }), '아직 쌓인 포인트가 없어요.') + '<p class="small">서비스 이용을 마치면 결제 금액의 적립률만큼, 품온 약속을 마치면 100P를 드려요. 포인트는 결제할 때 쓸 수 있고 현금으로 바꿀 수 없어요. 유효기간은 적립 후 2년이에요.</p>' : '') +
      (f('coupons') ? '<h3 class="h3 mt">이용권</h3>' + (cr[0] ? (got ? '' : '<div class="callout">' + ico('gift', 20) + '<div><strong>이달 등급 이용권 ' + cr[0] + '%를 받을 수 있어요</strong><p>최대 ' + G.fmt(cr[1]) + ' 할인 · 협력업체 서비스는 10%까지 적용돼요.</p><p class="fa"><button class="btn btn-fill btn-sm" data-act="cpGet">이용권 받기</button></p></div></div>') : '<p class="small">LIFE START 이상이면 매달 5~20% 이용권을 드려요. <a class="lnk-i" href="#plans">멤버십 보기</a></p>') +
        tbl(['이용권', '할인', '최대', '기한', '상태'], cps.map(function (c) { return '<tr><td>' + esc(c.src) + '</td><td>' + c.rate + '%</td><td>' + G.fmt(c.cap) + '</td><td>' + c.exp + '</td><td>' + (c.used ? '<span class="bd bd-mute">사용함</span>' : '<span class="bd bd-ok">사용 가능</span>') + '</td></tr>'; }), '받은 이용권이 없어요.') : '');
    return shell('points', '포인트·이용권', body, '등급별 혜택은 멤버십 화면에서 비교할 수 있어요.');
  }
  G.ACT.cpGet = function () { var u = uid(), cr = G.couponRate(u); T().coupons.push({ id: 'CP' + (T().coupons.length + 1), owner: u, rate: cr[0], cap: cr[1], exp: G.addDays(SITE.today, 30), used: false, src: SITE.today.slice(0, 7) + ' 등급 이용권' }); G.save(); G.toast('이용권을 받았어요.'); G.rerender(); };

  /* ---------- 결제 (시연) ---------- */
  G.payOptions = function () { return f('pay') ? ['네이버페이', '토스페이', '카카오페이', '신용·체크카드', '계좌이체'].map(function (x) { return '<option>' + x + '</option>'; }).join('') : '<option>카드</option><option>계좌이체</option><option>간편결제</option>'; };
  function pay(no) {
    var a = G.app(no); if (!a || a.user !== uid() || a.status !== 'WAITING_APPROVAL' || !a.quote) return shell('apps', '결제', G.empty('결제할 수 있는 신청이 아니에요.', '<a class="btn btn-line btn-sm" href="#my-apps">신청 내역</a>'));
    var s = G.sv(a.svc), q = a.quote.total, cps = f('coupons') ? T().coupons.filter(function (c) { return c.owner === uid() && !c.used; }) : [], bal = f('points') ? G.pointBal(uid()) : 0;
    var methods = [['네이버페이', 'N'], ['토스페이', 'T'], ['카카오페이', 'K'], ['신용·체크카드', ''], ['계좌이체', '']];
    var body = '<div class="pay"><div class="card"><h3>' + esc(s.name) + '</h3><table class="tbl"><tbody>' + a.quote.items.map(function (i) { return '<tr><td>' + esc(i[0]) + '</td><td class="r">' + G.fmt(i[1]) + '</td></tr>'; }).join('') + '<tr class="tot"><td>승인할 금액</td><td class="r">' + G.fmt(q) + '</td></tr></tbody></table>' +
      '<h4>결제 수단</h4><div class="pay-m">' + methods.map(function (m, i) { return '<label class="pay-o"><input type="radio" name="pm" value="' + m[0] + '"' + (i === 0 ? ' checked' : '') + '><span>' + (m[1] ? '<i class="pm-' + m[1] + '">' + m[1] + '</i>' : ico('receipt', 18)) + m[0] + '</span></label>'; }).join('') + '</div>' +
      (f('regular') ? fg('pm-inst', '할부 (카드 5만 원 이상)', sel('pm-inst', [['', '일시불'], ['2개월', '2개월'], ['3개월', '3개월'], ['6개월', '6개월']], '')) : '') +
      (cps.length ? fg('pm-cp', '이용권', sel('pm-cp', [['', '쓰지 않음']].concat(cps.map(function (c) { return [c.id, c.src + ' ' + c.rate + '% (최대 ' + G.fmt(c.cap) + ')']; })), cps[0].id)) : '') +
      (bal ? fg('pm-pt', '포인트 사용 (보유 ' + bal.toLocaleString('ko-KR') + 'P)', '<input id="pm-pt" type="number" min="0" max="' + bal + '" step="100" value="0" data-on="input:payCalc">') : '') +
      '</div><aside class="card pay-s"><h3>최종 결제</h3><dl class="sum"><div class="kv"><dt>금액</dt><dd>' + G.fmt(q) + '</dd></div><div class="kv"><dt>이용권 할인</dt><dd id="ps-c">-</dd></div><div class="kv"><dt>포인트</dt><dd id="ps-p">-</dd></div><div class="kv"><dt><b>결제할 금액</b></dt><dd><b id="ps-t">' + G.fmt(q) + '</b></dd></div></dl>' +
      '<label class="chk"><input type="checkbox" id="pm-a"><span><b>[필수]</b> 견적 내용과 취소·환불 기준을 확인했어요.</span></label><p class="err" id="pm-e" hidden>확인에 체크해 주세요.</p><button class="btn btn-fill btn-block" data-act="payDo" data-no="' + no + '">승인하고 결제하기</button><p class="small">시연 화면이라 실제로 결제되지 않아요. 결제는 승인과 함께 이루어지고, 승인 전에는 아무것도 청구되지 않아요.' + (f('family') ? ' 가족이 대신 결제하도록 링크를 보낼 수도 있어요.' : '') + '</p>' + (f('family') ? '<button class="btn btn-line btn-block" data-act="payFamily" data-no="' + no + '">가족에게 결제 요청 보내기</button>' : '') + '</aside></div>';
    var out = shell('apps', '승인하고 결제하기', '<p class="mb"><a class="lnk" href="#my-app-' + no + '">' + ico('arrow-left', 16) + ' 신청 상세</a></p>' + body);
    out.mount = function () { var c = $('pm-cp'); if (c) c.addEventListener('change', G.INP.payCalc); G.INP.payCalc(); };
    return out;
  }
  function calc(no) {
    var a = G.app(no), q = a.quote.total, cp = byId(T().coupons, val('pm-cp')), s = G.sv(a.svc), disc = 0;
    if (cp) { var rate = s.op === 'DIRECT' ? cp.rate : Math.min(cp.rate, T().couponPartnerCap); disc = Math.min(Math.round(q * rate / 100), cp.cap); }
    var pt = Math.max(0, Math.min(+val('pm-pt') || 0, G.pointBal(uid()), q - disc));
    return { q: q, disc: disc, pt: pt, cp: cp, total: q - disc - pt };
  }
  G.INP.payCalc = function () { var b = document.querySelector('[data-act=payDo]'); if (!b) return; var c = calc(b.dataset.no); $('ps-c').textContent = c.disc ? '-' + G.fmt(c.disc) : '-'; $('ps-p').textContent = c.pt ? '-' + G.fmt(c.pt) : '-'; $('ps-t').textContent = G.fmt(c.total); };
  G.ACT.payDo = function (el) {
    if (!$('pm-a').checked) { $('pm-e').hidden = false; return; }
    var no = el.dataset.no, a = G.app(no), c = calc(no), m = (document.querySelector('[name=pm]:checked') || {}).value;
    if (c.cp) c.cp.used = true; if (c.pt) G.addPoint(uid(), a.no + ' 결제에 사용', -c.pt);
    T().payments.unshift({ app: no, user: uid(), at: G.now(), method: m, inst: val('pm-inst'), gross: c.q, coupon: c.disc, point: c.pt, paid: c.total });
    G.addHist(a, 'APPROVED', '고객', '견적을 승인하고 ' + m + '로 ' + G.fmt(c.total) + ' 결제했어요. (시연)'); G.log(no + ' 고객 승인·결제 (시연)');
    G.save(); G.toast('승인하고 결제했어요. 일정은 운영자가 조율해 안내드려요.'); G.go('my-app-' + no);
  };
  G.ACT.payFamily = function (el) { var fam = T().family[uid()], r = fam && (fam.receivers || []).filter(function (x) { return x.roles.indexOf('결제 대신') >= 0; })[0]; if (!r) { G.toast('결제를 대신할 가족을 가족·안심에서 먼저 등록해 주세요.'); return; } G.notify(uid(), '[더가넷] ' + r.name + '님에게 결제 요청 링크를 보냈어요. (시연)'); G.save(); G.rerender(); };

  /* ---------- 가족·안심 ---------- */
  function famOf(u) { return T().family[u] || (T().family[u] = { receivers: [], consent: false, alone: false }); }
  function family() {
    var u = uid(), fam = famOf(u), apps = S.apps.filter(function (a) { return a.user === u; });
    var month = SITE.today.slice(0, 7), mApps = apps.filter(function (a) { return a.hist.some(function (h) { return h[1].slice(0, 7) === month; }); });
    var cal = [];
    apps.forEach(function (a) { var l = a.scheds && a.scheds.length ? a.scheds.filter(function (x) { return x.st === 'PLANNED'; }).map(function (x) { return x.start; }) : a.schedule ? [a.schedule] : []; l.forEach(function (t) { if (t.slice(0, 10) >= SITE.today && ['CANCELLED', 'REJECTED', 'COMPLETED'].indexOf(a.status) < 0) cal.push([t, G.sv(a.svc).name, '#my-app-' + a.no]); }); });
    if (f('events')) T().events.filter(function (e) { return e.joined.indexOf(u) >= 0 && e.date.slice(0, 10) >= SITE.today; }).forEach(function (e) { cal.push([e.date, '모임 · ' + e.title, '#event-' + e.id]); });
    S.club.deals.filter(function (d) { return (d.req === u || d.prov === u) && ['VERIFIED', 'ACCEPTED'].indexOf(d.status) >= 0 && d.date >= SITE.today; }).forEach(function (d) { cal.push([String(d.date).slice(0, 16), '품온 약속 · ' + G.nbPost(d.post).title, '#club-deal-' + d.id]); });
    cal.sort(function (a, b) { return a[0] > b[0] ? 1 : -1; });
    var rec = '<ul class="mng">' + fam.receivers.map(function (r, i) { return '<li><div><b>' + esc(r.name) + '</b> <span class="tag">' + esc(r.rel) + '</span><small>' + esc(r.phone) + ' · ' + r.roles.join(', ') + '</small></div><button class="btn btn-ghost btn-sm" data-act="famDel" data-i="' + i + '">빼기</button></li>'; }).join('') + '</ul>';
    var body = '<div class="two fam"><div class="card form"><h3>' + ico('users', 18) + ' 함께 알림 받을 가족·지인</h3>' + (fam.receivers.length ? rec : '<p class="small">아직 없어요. 최대 3명까지 등록할 수 있어요.</p>') +
      '<form data-sub="famAdd" novalidate><div class="fgrid">' + fg('fm-n', '이름', '<input id="fm-n">') + fg('fm-r', '관계', sel('fm-r', ['자녀', '배우자', '형제·자매', '친구·지인', '기타'], '자녀')) + fg('fm-p', '휴대폰', '<input id="fm-p" type="tel" placeholder="010-0000-0000">') + '</div><div class="cks">' + ['진행 알림', '결제 대신', '일정 보기'].map(function (r, i) { return '<label class="chk"><input type="checkbox" name="fm-role" value="' + r + '"' + (i === 0 ? ' checked' : '') + '> ' + r + '</label>'; }).join('') + '</div><p class="err" id="fm-e" hidden></p><button class="btn btn-line btn-sm" type="submit">추가</button></form>' +
      '<label class="chk mt"><input type="checkbox" data-on="change:famConsent"' + (fam.consent ? ' checked' : '') + '><span><b>본인 동의</b> 위 분들에게 내 신청 진행과 일정을 함께 알리는 데 동의해요. 언제든 끌 수 있어요.</span></label></div>' +
      '<div class="card"><h3>' + ico('phone', 18) + ' 알림 받을 사람이 없나요?</h3><p class="small">가족이나 지인이 없어도 괜찮아요. 가맹점 매니저가 한 달에 한 번 안부 전화를 드리고, 중요한 알림을 확인하지 않으면 직접 전화로 알려 드려요.</p><label class="chk"><input type="checkbox" data-on="change:famAlone"' + (fam.alone ? ' checked' : '') + '><span>가맹점 안심콜을 받을게요' + (fam.lastCall ? ' · 최근 안부 전화 ' + fam.lastCall : '') + '</span></label>' +
      '<h3 class="mt">' + ico('file', 18) + ' 가넷 안심 리포트 · ' + month.replace('-', '년 ') + '월</h3><dl class="sum"><div class="kv"><dt>이용한 서비스</dt><dd>' + (mApps.length ? mApps.map(function (a) { return esc(G.sv(a.svc).name) + ' (' + G.stName(a.status) + ')'; }).join(', ') : '없음') + '</dd></div><div class="kv"><dt>방문한 사람</dt><dd>' + (mApps.map(function (a) { var w = byId(T().staff, T().appStaff[a.no]); return w ? w.name + ' ' + w.role : ''; }).filter(Boolean).join(', ') || '-') + '</dd></div><div class="kv"><dt>다가오는 일정</dt><dd>' + cal.length + '건</dd></div><div class="kv"><dt>안심 만남</dt><dd>' + Object.keys(T().checkins).filter(function (k) { var d = G.nbDeal(k); return d && (d.req === u || d.prov === u); }).length + '회 확인</dd></div></dl><p class="small">리포트는 매달 1일 본인' + (fam.consent && fam.receivers.length ? '과 등록한 가족' : '') + '에게 알림톡으로 보내요. 부모님이 직접 결제하셔도, 가족이 대신 결제해도 리포트는 같이 받아요.</p></div></div>' +
      '<h3 class="h3 mt">가족 일정</h3>' + (cal.length ? '<ul class="mng">' + cal.map(function (c) { return '<li><div><b>' + esc(c[1]) + '</b><small>' + esc(c[0]) + '</small></div><a class="btn btn-line btn-sm" href="' + c[2] + '">보기</a></li>'; }).join('') + '</ul>' : G.empty('다가오는 일정이 없어요.'));
    return shell('family', '가족·안심', body, '가족 역할은 진행 알림 받기 · 결제 대신 하기 · 일정 보기 중에서 골라요.');
  }
  G.SUB.famAdd = function () {
    var fam = famOf(uid()), n = val('fm-n'), p = val('fm-p'), roles = Array.prototype.map.call(document.querySelectorAll('[name=fm-role]:checked'), function (x) { return x.value; }), e = $('fm-e');
    var err = fam.receivers.length >= 3 ? '최대 3명까지 등록할 수 있어요.' : !n ? '이름을 적어 주세요.' : !/^01\d-?\d{3,4}-?\d{4}$/.test(p) ? '휴대폰 번호를 확인해 주세요.' : !roles.length ? '역할을 하나 이상 골라 주세요.' : '';
    if (err) { e.textContent = err; e.hidden = false; return; }
    fam.receivers.push({ name: n, rel: val('fm-r'), phone: p.replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, '$1-****-$3'), roles: roles }); G.save(); G.toast('추가했어요. 본인 동의를 켜면 알림이 함께 가요.'); G.rerender();
  };
  G.ACT.famDel = function (el) { famOf(uid()).receivers.splice(+el.dataset.i, 1); G.save(); G.rerender(); };
  G.INP.famConsent = function (el) { famOf(uid()).consent = el.checked; G.save(); G.toast(el.checked ? '가족과 함께 알림을 받아요.' : '가족 알림을 껐어요.'); };
  G.INP.famAlone = function (el) { famOf(uid()).alone = el.checked; G.save(); G.toast(el.checked ? '가맹점 안심콜을 신청했어요.' : '안심콜을 껐어요.'); };

  /* ---------- 받은 알림 ---------- */
  function notify() {
    var l = T().notify.filter(function (x) { return x.to === uid(); });
    l.forEach(function (x) { x.read = true; }); G.save();
    return shell('notify', '받은 알림', l.length ? '<div class="kt">' + l.map(function (x) { return '<div class="kt-m"><p class="kt-h"><b>더가넷</b> 알림톡' + (x.via ? ' · ' + esc(x.via) + '님께도' : '') + '</p><p>' + esc(x.text) + '</p><time>' + esc(x.at) + '</time></div>'; }).join('') + '</div>' : G.empty('받은 알림이 없어요.'), '실제 서비스에서는 카카오 알림톡으로 보내고, 받지 못하면 문자로 다시 보내요. (시연)');
  }

  /* ---------- 우리 집 기록 ---------- */
  var NEXT = { S02: 30, S03: 180, S06: 0, S05: 30, S01: 14, S11: 30 };
  function homelog() {
    var u = uid(), auto = S.apps.filter(function (a) { return a.user === u && a.status === 'COMPLETED'; }).map(function (a) { var d = (a.hist[a.hist.length - 1] || [])[1] || a.at, w = byId(T().staff, T().appStaff[a.no]); return { at: d.slice(0, 10), what: G.sv(a.svc).name, memo: a.report || (a.quote ? a.quote.items.map(function (i) { return i[0]; }).join(', ') : ''), who: w ? w.name : (a.partner ? (byId(PARTNERS, a.partner) || {}).name : '더가넷'), next: NEXT[a.svc] ? G.addDays(d, NEXT[a.svc]) : '', svc: a.svc }; });
    var own = (T().homelog || {})[u] || [], all = auto.concat(own).sort(function (a, b) { return a.at < b.at ? 1 : -1; });
    var due = all.filter(function (x) { return x.next && x.next <= G.addDays(SITE.today, 14); });
    var body = (due.length ? '<div class="callout">' + ico('bell', 20) + '<div><strong>곧 챙길 때가 됐어요</strong><ul class="ul">' + due.map(function (x) { return '<li>' + esc(x.what) + ' · ' + x.next + (x.svc ? ' <a class="lnk-i" href="#svc-' + x.svc + '">다시 신청</a>' : '') + '</li>'; }).join('') + '</ul></div></div>' : '') +
      tbl(['날짜', '한 일', '누가', '메모', '다음 점검'], all.map(function (x) { return '<tr><td>' + x.at + '</td><td><b>' + esc(x.what) + '</b></td><td>' + esc(x.who || '직접') + '</td><td>' + esc(x.memo || '') + '</td><td>' + (x.next || '-') + '</td></tr>'; }), '아직 기록이 없어요.') +
      '<form class="card form mt" data-sub="hlAdd" novalidate><h3>직접 기록하기</h3><div class="fgrid">' + fg('hl-w', '한 일', '<input id="hl-w" placeholder="예: 보일러 점검, 정수기 필터 교체">') + fg('hl-d', '날짜', '<input id="hl-d" type="date" value="' + SITE.today + '">') + fg('hl-n', '다음 점검일', '<input id="hl-n" type="date">') + fg('hl-m', '메모', '<input id="hl-m">') + '</div><button class="btn btn-line btn-sm" type="submit">기록</button></form>';
    return shell('homelog', '우리 집 기록', body, '더가넷 서비스를 마치면 자동으로 쌓이고, 직접 적을 수도 있어요. 이사하거나 집을 팔 때 관리 이력으로 쓸 수 있어요.');
  }
  G.SUB.hlAdd = function () { var w = val('hl-w'); if (!w) return G.toast('한 일을 적어 주세요.'); T().homelog = T().homelog || {}; (T().homelog[uid()] = T().homelog[uid()] || []).push({ at: val('hl-d') || SITE.today, what: w, memo: val('hl-m'), next: val('hl-n'), who: '직접' }); G.save(); G.toast('기록했어요.'); G.rerender(); };

  /* ---------- 나의 나눔 ---------- */
  function giving() {
    var l = T().gifts.filter(function (g) { return g.user === uid(); }), tot = l.reduce(function (s, g) { return s + g.amt; }, 0), mt = l.reduce(function (s, g) { return s + (g.match || 0); }, 0);
    var body = '<div class="kpis k3"><div class="kpi"><span>내가 함께한 금액</span><b>' + G.fmt(tot) + '</b></div><div class="kpi"><span>더가넷이 더한 매칭</span><b>' + G.fmt(mt) + '</b></div><div class="kpi"><span>함께한 사업</span><b>' + l.length + '</b></div></div>' +
      (l.length ? l.map(function (g) {
        var p = byId(T().projects, g.proj) || {}, o = byId(T().orgs, p.org) || {}, sent = G.projSpent(g.proj, '전달'), used = G.projSpent(g.proj), rp = T().reports[g.proj];
        var st = used ? 3 : sent ? 2 : 1;
        return '<article class="card gv-my"><p class="meta"><span class="tag">' + esc(p.target) + '</span><span class="small">' + esc(g.at) + ' · ' + esc(g.kind) + '</span></p><h3><a href="#give-' + p.id + '">' + esc(p.title) + '</a></h3><p>' + G.fmt(g.amt) + (g.match ? ' + 더가넷 매칭 ' + G.fmt(g.match) : '') + '</p>' +
          '<ol class="stp">' + ['후원', '모금', '기관 전달', '집행·보고'].map(function (s, i) { return '<li class="' + (i < st ? 'done' : i === st ? 'cur' : '') + '"><span class="stp-n">' + (i < st ? ico('check', 14) : i + 1) + '</span><span class="stp-t">' + s + '</span></li>'; }).join('') + '</ol>' +
          (rp && rp.approved ? '<p class="small">' + ico('file', 14) + ' 결과 보고: ' + esc(rp.text) + '</p>' : '') + '<p class="small">기부금 영수증: ' + esc(o.name || '') + '에서 발급 (연말정산 간소화 자료로 등록돼요)</p></article>';
      }).join('') : G.empty('아직 함께한 나눔이 없어요.', '<a class="btn btn-fill btn-sm" href="#giving">나눔 사업 보기</a>'));
    return shell('giving', '나의 나눔', body, '내 후원이 기관에 전달되고 쓰이는 과정을 단계별로 보여 드려요.');
  }

  /* ---------- 문제 접수 ---------- */
  function dispute(ref) {
    var u = uid(), mine = T().disputes.filter(function (d) { return d.user === u; });
    var refs = S.apps.filter(function (a) { return a.user === u && ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED'].indexOf(a.status) >= 0; }).map(function (a) { return [a.no, a.no + ' · ' + G.sv(a.svc).name]; })
      .concat(S.club.deals.filter(function (d) { return (d.req === u || d.prov === u) && ['VERIFIED', 'DONE'].indexOf(d.status) >= 0; }).map(function (d) { return [d.id, '품온 ' + d.id + ' · ' + G.nbPost(d.post).title]; }));
    var form = '<form class="card form" data-sub="dspAdd" novalidate><div class="fgrid">' + fg('dp-r', '어떤 이용인가요', sel('dp-r', refs, ref)) + fg('dp-t', '어떤 문제인가요', sel('dp-t', G.COMP.map(function (c) { return [c[0], c[0]]; }).concat([['기타', '기타']]), '')) + fg('dp-x', '자세한 내용', '<textarea id="dp-x" rows="4" placeholder="언제, 무엇이, 어떻게 달랐는지 적어 주세요. (10자 이상)"></textarea>', 'full') + fg('dp-f', '사진·자료 (시연: 파일 이름)', '<input id="dp-f" placeholder="예: 파손부위.jpg">') + '</div><p class="err" id="dp-e" hidden></p><button class="btn btn-fill" type="submit">접수하기</button><p class="small">24시간 안에 담당자가 먼저 연락드리고, 상대방 이야기까지 들은 뒤 7일 안에 결과를 알려 드려요. <a class="lnk-i" href="#promise">보상 기준표</a></p></form>';
    var list = mine.length ? '<h3 class="h3 mt">접수한 문제</h3><ul class="nl">' + mine.map(function (d) { return '<li class="q"><div><span class="bd bd-' + (d.status === '종결' ? 'ok' : 'warn') + '">' + d.status + '</span><b>' + esc(d.type) + '</b><time>' + d.at + '</time></div><p>' + esc(d.text) + '</p>' + (d.decision ? '<p class="ans"><b>결과</b> ' + esc(d.decision) + (d.comp ? ' · ' + esc(d.comp) : '') + '</p>' : '<p class="small">결정 기한 ' + G.addDays(d.at, 7) + '</p>') + '</li>'; }).join('') + '</ul>' : '';
    return shell('dispute', '문제 접수', (refs.length ? form : G.empty('문제를 접수할 수 있는 이용이 없어요.')) + list, '이용 중 불편하거나 약속과 달랐던 일을 알려 주세요.');
  }
  G.SUB.dspAdd = function () {
    var x = val('dp-x'), e = $('dp-e'); if (x.length < 10) { e.textContent = '내용을 10자 이상 적어 주세요.'; e.hidden = false; return; }
    var r = val('dp-r'), isApp = !!G.app(r);
    T().disputes.unshift({ id: 'DS' + (T().disputes.length + 1), app: isApp ? r : '', deal: isApp ? '' : r, user: uid(), type: val('dp-t'), text: x, file: val('dp-f'), at: G.now(), status: '접수', counter: '', decision: '', comp: '', contactAt: '' });
    if (!isApp) { var d = G.nbDeal(r); if (d && d.pay && d.pay.st === 'HELD') { d.pay.st = 'DISPUTED'; d.pay.disputeNote = x; } }
    G.notify(uid(), '[더가넷] 문제 접수를 받았어요. 24시간 안에 담당자가 연락드릴게요.'); G.log('분쟁 접수: ' + r); G.save(); G.toast('접수했어요.'); G.rerender();
  };

  /* ---------- 신청 상세·멤버십 덧붙이기 ---------- */
  var oMy = P.my;
  P.my = function (arg) {
    var o = oMy(arg); if (!S.user || !o.html) return o;
    try {
      var a = arg || 'apps';
      if (a.indexOf('app-') === 0) o.html = appPlus(a.slice(4), o.html);
      if (a === 'plan' && (f('memberLink') || f('gradeFee'))) o.html = o.html.replace('<p class="small">시범 가격이며', '<div class="card-soft mt"><h3>품온</h3><p>' + (G.isRegular(uid()) ? '품온 정회원이에요. 횟수 제한 없이 이용하고' + (f('gradeFee') ? ' 유료 재능 수수료는 ' + G.feeRate(uid()) + '%예요.' : '요.') : '체험 회원이에요. 60일 동안 3회 이용할 수 있어요. LIFE START 이상이면 정회원이 돼요.') + '</p></div><p class="small">시범 가격이며');
      if (a === 'apps' && f('phoneApply')) o.html = o.html.replace('<h2 class="h3">신청 내역</h2>', '<h2 class="h3">신청 내역</h2><p class="small">' + ico('phone', 14) + ' 화면이 어려우면 ' + esc(SITE.phone) + '로 전화하세요. 상담원이 대신 신청해 드려요.</p>');
    } catch (e) { console.error(e); }
    return o;
  };
  function appPlus(no, h) {
    var a = G.app(no); if (!a) return h;
    var add = '';
    if (f('staff')) { var w = byId(T().staff, T().appStaff[no]); if (w) add += '<h4>방문하는 분 (미리 알려 드려요)</h4><div class="staff-c"><span class="av">' + esc(w.name.charAt(0)) + '</span><div><b>' + esc(w.name) + '</b> · ' + esc(w.role) + '<p class="small">' + w.since + '부터 · 완료 ' + w.done + '건</p><p>' + G.staffBadges(w) + '</p></div></div>'; }
    if (f('workLog')) { var wl = T().worklog[no] || []; if (wl.length) add += '<h4>작업 일지</h4><ol class="hist">' + wl.slice().reverse().map(function (x) { return '<li><span class="hd-t"><span class="tag">' + esc(x[0]) + '</span><time>' + esc(x[1]) + '</time></span><p>' + esc(x[2]) + (x[3] ? ' <span class="small">' + ico('file', 12) + esc(x[3]) + '</span>' : '') + '</p></li>'; }).join('') + '</ol>'; }
    if (f('pay')) { var py = T().payments.filter(function (p) { return p.app === no; })[0]; if (py) add += '<h4>결제</h4><p class="small">' + esc(py.at) + ' · ' + esc(py.method) + (py.inst ? ' ' + py.inst : '') + ' · <b>' + G.fmt(py.paid) + '</b>' + (py.coupon ? ' (이용권 -' + G.fmt(py.coupon) + ')' : '') + (py.point ? ' (포인트 -' + G.fmt(py.point) + ')' : '') + '</p>'; }
    if (f('regular') && a.regular) add += '<h4>정기 예약</h4><p class="small">' + esc(a.regular.cycle) + (a.regular.staff ? ' · 담당자 요청: ' + esc(a.regular.staff) : '') + '</p>';
    if (add) h = h.replace('<h4>진행 이력</h4>', add + '<h4>진행 이력</h4>');
    if (f('safeNumber') && a.partner) h = h.replace(/(<h4>담당 협력업체<\/h4><p class="small">[^<]*)<\/p>/, '$1</p><p class="small">' + ico('phone', 14) + ' 연락은 안심번호 0507-' + (1000 + (+no.slice(-4) * 7) % 9000) + '-' + (2000 + +no.slice(-4)) + '로 해요. 서비스가 끝나면 연결이 끊겨요.</p>');
    if (f('pay') && a.status === 'WAITING_APPROVAL' && a.quote) h = h.replace(/<button class="btn btn-fill btn-block" data-act="mApprove" data-no="[^"]+">[^<]*<\/button>/, '<a class="btn btn-fill btn-block" href="#my-pay-' + no + '">승인하고 결제하기</a><p class="small">네이버페이·토스페이·카카오페이·카드' + (f('coupons') ? ' · 이용권' : '') + (f('points') ? ' · 포인트' : '') + '</p>');
    if (f('rating3') && a.status === 'COMPLETED') {
      var r = T().ratings.filter(function (x) { return x.app === no; })[0];
      h = h.replace(/<div class="act-b"><h4>후기를 남겨 주세요<\/h4>[\s\S]*?후기 등록<\/button><\/div>/, '<div class="act-b"><h4>이용은 어떠셨나요?</h4>' + (r ? '<p class="small">' + ['', '아쉬워요', '좋아요', '최고예요'][r.level] + '로 평가했어요.</p>' : G.rate3('rate3App', no) + '<textarea id="rvText" rows="3" placeholder="한마디 남겨 주세요 (선택)"></textarea>') + '</div>');
    }
    var extra = '';
    if (f('dispute') && ['APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].indexOf(a.status) >= 0) extra += '<a class="lnk" href="#my-dispute-' + no + '">' + ico('info', 16) + ' 문제가 있어요 (분쟁 신청)</a>';
    if (f('regular') && a.status === 'COMPLETED') extra += '<a class="lnk" href="#apply-' + a.svc + '">' + ico('calendar', 16) + ' 같은 서비스 다시 · 정기 예약</a>';
    if (extra) h = h.replace('<a class="lnk" href="#svc-', extra + '<a class="lnk" href="#svc-');
    return h;
  }
  G.ACT.rate3App = function (el) {
    var a = G.app(el.dataset.id), lv = +el.dataset.v, t = val('rvText');
    T().ratings.push({ app: a.no, svc: a.svc, partner: a.partner || '', by: uid(), to: a.partner || 'thegarnet', level: lv, at: G.now() });
    if (!S.reviews.some(function (r) { return r.app === a.no; })) S.reviews.unshift({ id: 'R' + (S.reviews.length + 1), svc: a.svc, app: a.no, stars: [0, 2, 4, 5][lv], text: (['', '아쉬워요', '좋아요', '최고예요'][lv]) + (t ? ' · ' + t : ''), who: S.user.name.slice(0, 1) + '*' + S.user.name.slice(-1), at: SITE.today });
    G.save(); G.toast('평가를 남겼어요. 고마워요.'); G.rerender();
  };

  /* ---------- 진행 알림 · 포인트 적립 ---------- */
  var oHist = G.addHist;
  G.addHist = function (a, st, by, memo) {
    var prev = a.status; oHist(a, st, by, memo);
    if (!T() || !a.no || prev === st) return;
    if ((f('alimtalk') || f('workLog')) && by !== '고객') G.notify(a.user, '[더가넷] ' + G.sv(a.svc).name + ' 진행 상태가 "' + G.stName(st) + '"(으)로 바뀌었어요.' + (memo ? ' ' + memo : ''));
    if (f('points') && st === 'COMPLETED' && a.quote) { var py = T().payments.filter(function (p) { return p.app === a.no; })[0], base = py ? py.paid : a.quote.total; G.addPoint(a.user, G.sv(a.svc).name + ' 이용 적립 (' + G.pointRate(a.user) + '%)', Math.round(base * G.pointRate(a.user) / 100)); }
  };
})();
