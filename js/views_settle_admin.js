/* 정산 관리 (관리자) + 협력업체 포털 정산 내역
   - 이웃 나눔(회원↔회원): 더가넷은 중개자. 안전결제 → 완료 확인 → 수수료 공제 후 정산
   - 협력업체 서비스(고객→더가넷→협력업체): 더가넷이 계약 당사자. 완료 + 이의 기간 후 연계 수수료 공제 정산 */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, C = CLUB;
  var A = function (o) { o.layout = 'admin'; return o; };
  var card = function (t, body, extra) { return '<section class="ac ' + (extra || '') + '">' + (t ? '<h2>' + t + '</h2>' : '') + body + '</section>'; };
  var nm = function (id) { return G.nbMember(id).name; };
  var pname = function (id) { var p = PARTNERS.filter(function (x) { return x.id === id; })[0]; return p ? p.name : '-'; };
  var K = function () { return S.club; };

  function clubPays() { return K().deals.filter(function (d) { return d.pay; }); }
  function sums() {
    var cp = clubPays(), pp = G.partnerSettle(), s = { held: 0, wait: 0, dispute: 0, out: 0, fee: 0, waitN: 0 };
    cp.forEach(function (d) {
      var p = d.pay;
      if (p.st === 'HELD') s.held += p.gross;
      if (p.st === 'DISPUTED') { s.held += p.gross; s.dispute += 1; }
      if (p.st === 'RELEASE_WAIT') { s.wait += p.net; s.waitN += 1; }
      if (p.st === 'PAID_OUT') { s.out += p.net; s.fee += p.fee; }
    });
    pp.forEach(function (r) { if (r.st === 'WAIT') { s.wait += r.net; s.waitN += 1; } else { s.out += r.net; s.fee += r.fee; } });
    return s;
  }
  function tabs(cur) {
    var t = [['settle', '개요', 0], ['settle-club', '이웃 나눔 정산', K().deals.filter(function (d) { return d.pay && (d.pay.st === 'RELEASE_WAIT' || d.pay.st === 'DISPUTED'); }).length], ['settle-partner', '협력업체 정산', G.partnerSettle().filter(function (r) { return r.st === 'WAIT'; }).length], ['settle-rules', '정산 기준', 0]];
    return '<nav class="tabs" aria-label="정산 관리">' + t.map(function (x) { return '<a href="#admin-' + x[0] + '" class="' + (cur === x[0] ? 'on' : '') + '">' + x[1] + (x[2] ? ' <i class="dot-n">' + x[2] + '</i>' : '') + '</a>'; }).join('') + '</nav>';
  }
  function wrap(cur, title, sub, html) { return A({ title: title, heading: title, sub: sub, html: tabs(cur) + html }); }

  G.adminSettle = function (arg) {
    if (arg === 'settle-club') return clubP();
    if (arg === 'settle-partner') return partnerP();
    if (arg === 'settle-rules') return rulesP();
    return overview();
  };

  /* ----- 개요 ----- */
  function overview() {
    var s = sums(), f = G.fees();
    var kp = [['대금 보관 중', G.fmt(s.held), ''], ['정산 대기 (지급 예정)', G.fmt(s.wait), s.waitN ? 'warn' : ''], ['분쟁 접수', s.dispute + '건', s.dispute ? 'bad' : ''], ['정산 완료 누계', G.fmt(s.out), ''], ['더가넷 수수료 수익', G.fmt(s.fee), '']];
    var two = '<div class="ag2c">' +
      card('이웃 나눔 정산 · 회원 ↔ 회원', '<dl class="sum"><div class="kv"><dt>거래 당사자</dt><dd>두 회원 (더가넷은 중개자)</dd></div><div class="kv"><dt>결제</dt><dd>받는 분이 안전결제(제휴 PG 에스크로)로 대금을 맡김</dd></div><div class="kv"><dt>수수료</dt><dd><b>' + f.club + '%</b> (최소 ' + G.fmt(f.minFee) + ') · 제공자 부담<br><span class="small">무료·실비 나눔은 수수료 없음</span></dd></div><div class="kv"><dt>정산 시점</dt><dd>두 회원이 완료를 확인한 뒤 ' + f.cycle + '일 이내, 운영자 승인</dd></div><div class="kv"><dt>분쟁</dt><dd>정산 전 접수 → 운영자가 환불 또는 정산 결정</dd></div></dl><a class="lnk" href="#admin-settle-club">이웃 나눔 정산 보기 ' + ico('arrow-right', 16) + '</a>') +
      card('협력업체 정산 · 고객 → 더가넷 → 협력업체', '<dl class="sum"><div class="kv"><dt>거래 당사자</dt><dd>고객과 더가넷 (협력업체는 위탁 수행)</dd></div><div class="kv"><dt>결제</dt><dd>고객이 견적을 승인한 뒤 더가넷에 결제</dd></div><div class="kv"><dt>연계 수수료</dt><dd>협력 연계형 <b>' + f.partnerP + '%</b> · 공동 수행형 <b>' + f.partnerM + '%</b><br><span class="small">직접 수행 서비스는 더가넷 매출이라 정산 대상이 아님</span></dd></div><div class="kv"><dt>정산 시점</dt><dd>완료 보고 + 이의 기간 ' + f.cycle + '일 뒤, 운영자 승인</dd></div><div class="kv"><dt>증빙</dt><dd>세금계산서·부가세는 세무사 확인 필요</dd></div></dl><a class="lnk" href="#admin-settle-partner">협력업체 정산 보기 ' + ico('arrow-right', 16) + '</a>') + '</div>';
    var qc = clubPays().filter(function (d) { return d.pay.st === 'RELEASE_WAIT' || d.pay.st === 'DISPUTED'; }), qp = G.partnerSettle().filter(function (r) { return r.st === 'WAIT'; });
    var q = '<div class="ag"><div>' + card('정산 승인 대기 · 이웃 나눔', qc.length ? '<ul class="todo">' + qc.map(function (d) { var p = G.nbPost(d.post); return '<li><a href="#admin-settle-club"><span><b>' + esc(p.title) + '</b>' + G.nbPayBd(d.pay.st) + '</span><em>' + d.id + ' · ' + G.fmt(d.pay.net) + '</em>' + ico('chev-right', 16) + '</a></li>'; }).join('') + '</ul>' : '<p class="small">승인할 정산이 없어요.</p>') + '</div><div>' +
      card('정산 승인 대기 · 협력업체', qp.length ? '<ul class="todo">' + qp.map(function (r) { return '<li><a href="#admin-settle-partner"><span><b>' + esc(G.sv(r.app.svc).name) + '</b><span class="bd bd-warn">정산 대기</span></span><em>' + r.app.no + ' · ' + G.fmt(r.net) + '</em>' + ico('chev-right', 16) + '</a></li>'; }).join('') + '</ul>' : '<p class="small">승인할 정산이 없어요.</p>') + '</div></div>';
    return wrap('settle', '정산 관리', '이웃 나눔과 협력업체 서비스는 정산 구조가 달라요. 시연용 수치이며 실제 지급은 없어요.', '<div class="kpis k5">' + kp.map(function (x) { return '<div class="kpi ' + x[2] + '"><span>' + x[0] + '</span><b>' + x[1] + '</b></div>'; }).join('') + '</div>' + two + q);
  }

  /* ----- 이웃 나눔 정산 ----- */
  function clubP() {
    var rows = clubPays().slice().sort(function (a, b) { var o = { DISPUTED: 0, RELEASE_WAIT: 1, HELD: 2, PAID_OUT: 3, REFUNDED: 4 }; return o[a.pay.st] - o[b.pay.st]; });
    var disputes = rows.filter(function (d) { return d.pay.st === 'DISPUTED'; });
    var table = '<div class="tw"><table class="tbl"><thead><tr><th>약속</th><th>제공자 ↔ 받는 분</th><th class="r">금액</th><th class="r">수수료</th><th class="r">정산액</th><th>상태</th><th></th></tr></thead><tbody>' + rows.map(function (d) {
      var p = G.nbPost(d.post), pay = d.pay;
      return '<tr><td><a href="#admin-club-deal-' + d.id + '">' + esc(p.title) + '</a><small>' + d.id + (pay.due && pay.st === 'RELEASE_WAIT' ? ' · 정산 예정 ' + pay.due : '') + (pay.outAt ? ' · ' + pay.outAt.slice(0, 10) + ' 지급' : '') + '</small></td><td>' + esc(nm(d.prov)) + ' ↔ ' + esc(nm(d.req)) + '</td><td class="r">' + G.fmt(pay.gross) + '</td><td class="r">' + G.fmt(pay.fee) + ' <small>' + pay.rate + '%</small></td><td class="r"><b>' + G.fmt(pay.net) + '</b></td><td>' + G.nbPayBd(pay.st) + '</td><td>' +
        (pay.st === 'RELEASE_WAIT' ? '<button class="btn btn-fill btn-sm" data-act="acSettleClub" data-id="' + d.id + '">정산 승인</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
    var dsp = disputes.length ? card('분쟁 처리', '<ul class="qa">' + disputes.map(function (d) {
      var p = G.nbPost(d.post);
      return '<li><div class="qa-h"><span class="bd bd-bad">분쟁 접수</span><b>' + esc(p.title) + '</b><small>' + d.id + ' · ' + (d.pay.disputeAt || '') + '</small></div><p>접수 내용: ' + esc(d.pay.disputeNote || '') + '</p><p class="small">보관 금액 ' + G.fmt(d.pay.gross) + ' · 제공자 ' + esc(nm(d.prov)) + ' · 받는 분 ' + esc(nm(d.req)) + '</p><form class="qa-f" data-sub="acDispute" data-id="' + d.id + '"><select id="dd-' + d.id + '" aria-label="결정"><option value="REFUND">환불 (받는 분에게 반환)</option><option value="PAYOUT">정산 진행 (제공자에게 지급)</option></select><textarea id="dm-' + d.id + '" rows="2" placeholder="확인 내용과 결정 사유"></textarea><button class="btn btn-fill btn-sm" type="submit">결정 저장</button></form></li>';
    }).join('') + '</ul>') : '';
    return wrap('settle-club', '이웃 나눔 정산', '유료 나눔의 대금 보관·정산 상태예요. 무료·실비는 수수료와 정산이 없어요.', dsp + card('안전결제 내역', rows.length ? table : '<p class="small">안전결제 내역이 없어요.</p>'));
  }
  G.ACT.acSettleClub = function (el) {
    var d = G.nbDeal(el.dataset.id); d.pay.st = 'PAID_OUT'; d.pay.outAt = G.now(); d.hist.push([d.status, G.now(), '운영자', '정산을 승인했어요. ' + G.fmt(d.pay.net) + ' 지급 (시연)']);
    G.log('이웃 나눔 ' + d.id + ' 정산 승인 ' + G.fmt(d.pay.net) + ' / 수수료 ' + G.fmt(d.pay.fee)); G.toast('정산을 승인했어요. 지급 처리됐습니다. (시연)'); G.rerender();
  };
  G.SUB.acDispute = function (f) {
    var d = G.nbDeal(f.dataset.id), v = document.getElementById('dd-' + d.id).value, m = document.getElementById('dm-' + d.id).value.trim();
    if (m.length < 5) { G.toast('결정 사유를 5자 이상 적어 주세요.'); return; }
    if (v === 'REFUND') { d.pay.st = 'REFUNDED'; d.pay.refundAt = G.now(); d.status = 'CANCELLED'; d.hist.push(['CANCELLED', G.now(), '운영자', '분쟁 확인 후 환불: ' + m]); }
    else { d.pay.st = 'PAID_OUT'; d.pay.outAt = G.now(); d.done = { req: true, prov: true }; d.status = 'DONE'; d.hist.push(['DONE', G.now(), '운영자', '분쟁 확인 후 정산: ' + m]); }
    G.log('이웃 나눔 ' + d.id + ' 분쟁 처리: ' + (v === 'REFUND' ? '환불' : '정산')); G.toast('분쟁 결과를 저장했어요.'); G.rerender();
  };

  /* ----- 협력업체 정산 ----- */
  function partnerP() {
    var rows = G.partnerSettle().sort(function (a, b) { return (a.st === 'WAIT' ? 0 : 1) - (b.st === 'WAIT' ? 0 : 1); });
    var direct = S.apps.filter(function (a) { return a.status === 'COMPLETED' && a.quote && G.sv(a.svc).op === 'DIRECT'; });
    var tot = rows.reduce(function (t, r) { if (r.st === 'WAIT') t.w += r.net; else t.o += r.net; t.fee += r.fee; return t; }, { w: 0, o: 0, fee: 0 });
    var kp = '<div class="kpis k4"><div class="kpi"><span>정산 대기</span><b>' + G.fmt(tot.w) + '</b></div><div class="kpi"><span>정산 완료</span><b>' + G.fmt(tot.o) + '</b></div><div class="kpi"><span>연계 수수료 (전체)</span><b>' + G.fmt(tot.fee) + '</b></div><div class="kpi"><span>직접 수행 매출</span><b>' + G.fmt(direct.reduce(function (t, a) { return t + a.quote.total; }, 0)) + '</b></div></div>';
    var table = '<div class="tw"><table class="tbl"><thead><tr><th>신청</th><th>협력업체</th><th class="r">고객 결제액</th><th class="r">연계 수수료</th><th class="r">정산액</th><th>상태</th><th></th></tr></thead><tbody>' + rows.map(function (r) {
      var a = r.app, s = G.sv(a.svc);
      return '<tr><td><a href="#admin-app-' + a.no + '">' + esc(s.name) + '</a><small>' + a.no + ' · <span class="op op-' + s.op + '">' + esc(s.tag) + '</span></small></td><td>' + esc(pname(a.partner)) + '</td><td class="r">' + G.fmt(r.gross) + '</td><td class="r">' + G.fmt(r.fee) + ' <small>' + r.rate + '%</small></td><td class="r"><b>' + G.fmt(r.net) + '</b></td><td>' + (r.st === 'WAIT' ? '<span class="bd bd-warn">정산 대기</span><small>예정 ' + r.due + '</small>' : '<span class="bd bd-ok">정산 완료</span><small>' + r.outAt.slice(0, 10) + '</small>') + '</td><td>' + (r.st === 'WAIT' ? '<button class="btn btn-fill btn-sm" data-act="acSettlePartner" data-no="' + a.no + '">정산 승인</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
    return wrap('settle-partner', '협력업체 정산', '협력업체가 수행한 서비스는 고객이 더가넷에 결제하고, 더가넷이 연계 수수료를 뺀 금액을 협력업체에 정산해요.',
      kp + card('정산 내역', rows.length ? table : '<p class="small">정산 대상이 없어요. 협력업체가 완료 보고를 하면 이곳에 나타나요.</p>') +
      card('알아두세요', '<ul class="ul"><li>직접 수행(DIRECT) 서비스는 협력업체가 없어 정산 대상이 아니고, 더가넷 매출로 잡혀요.</li><li>정산액 = 고객 결제액 − 연계 수수료. 고객 결제는 승인한 견적 범위 안에서만 이뤄져요.</li><li>하자·분쟁이 접수되면 해당 건의 정산을 보류해요.</li><li>세금계산서 발행, 부가세, 협력업체 원천징수 여부는 세무사 확인이 필요해요.</li></ul>'));
  }
  G.ACT.acSettlePartner = function (el) {
    var a = G.app(el.dataset.no), c = G.partnerCalc(a); S.settle.partner[a.no] = { st: 'PAID_OUT', gross: c.gross, rate: c.rate, fee: c.fee, net: c.net, outAt: G.now() };
    G.log(a.no + ' 협력업체 정산 승인 ' + G.fmt(c.net) + ' / 수수료 ' + G.fmt(c.fee)); G.toast('정산을 승인했어요. 지급 처리됐습니다. (시연)'); G.rerender();
  };

  /* ----- 정산 기준 ----- */
  function rulesP() {
    var f = G.fees();
    var num = function (id, lab, val, unit, min, max, hint) { return '<div class="fg"><label class="lb" for="' + id + '">' + lab + '</label><div class="num"><input id="' + id + '" type="number" min="' + min + '" max="' + max + '" value="' + val + '"><span class="u">' + unit + '</span></div><p class="hint-s">' + hint + '</p></div>'; };
    var form = '<form class="stf" data-sub="acFees" novalidate>' +
      num('fe-c', '이웃 나눔 수수료율 (유료 · 제공자 부담)', f.club, '%', 0, 30, '결제 비용(PG)을 포함한 총 수수료로 가정해요. 무료·실비는 항상 0%예요.') +
      num('fe-m', '이웃 나눔 최소 수수료', f.minFee, '원', 0, 5000, '소액 거래에서 결제 고정비를 보전해요.') +
      num('fe-p', '협력 연계형 수수료율', f.partnerP, '%', 0, 40, '협력업체가 수행하고 더가넷은 연계·고객관리를 맡는 서비스예요.') +
      num('fe-x', '공동 수행형 수수료율', f.partnerM, '%', 0, 40, '더가넷이 일부 직접 수행하고 품질을 함께 책임지는 서비스예요.') +
      num('fe-d', '정산 주기 (완료 후)', f.cycle, '일', 1, 14, '완료 확인 또는 완료 보고 뒤 이의 기간을 거쳐 지급해요.') +
      '<p class="err" id="fe-e" hidden></p><div class="fa"><button class="btn btn-fill" type="submit">기준 저장</button><button class="btn btn-ghost" type="button" data-act="acFeesReset">기본값으로</button></div></form>';
    var ex = G.calcFee(25000, f.club, f.minFee), ex2 = G.calcFee(200000, f.club, f.minFee), px = G.partnerCalc({ svc: 'S06', quote: { total: 120000 } });
    var market = '<table class="tbl"><thead><tr><th>비교 대상</th><th>수수료</th></tr></thead><tbody><tr><td>크몽 (소액 구간)</td><td>16.4% + 결제망 3.3%, 금액이 클수록 인하</td></tr><tr><td>탈잉</td><td>14~20% (결제 수수료 포함)</td></tr><tr><td>청소 중개 앱</td><td>업체 주장 10~20%, 기사 계산 30~35% (2019)</td></tr><tr><td>결제(PG)</td><td>카드 약 3.2~3.5%, 계좌이체 약 1.8~2%</td></tr></tbody></table><p class="small">시연용 가정값이에요. 일부 수치는 제3자 자료·과거 기사 기준이라 운영 전에 공식 요율표와 세무 검토가 필요해요.</p>';
    return wrap('settle-rules', '정산 기준', '수수료율과 정산 주기를 바꾸면 이후 새로 발생하는 결제와 정산에 적용돼요. 이미 보관 중인 건은 결제 당시 기준을 유지해요.',
      '<div class="ag"><div>' + card('수수료·정산 기준', form) + '</div><div>' + card('계산 예시', '<dl class="sum"><div class="kv"><dt>이웃 나눔 25,000원</dt><dd>수수료 ' + G.fmt(ex.fee) + ' → 제공자 ' + G.fmt(ex.net) + '</dd></div><div class="kv"><dt>이웃 나눔 200,000원</dt><dd>수수료 ' + G.fmt(ex2.fee) + ' → 제공자 ' + G.fmt(ex2.net) + '</dd></div><div class="kv"><dt>협력업체 120,000원 (반려동물 돌봄)</dt><dd>연계 수수료 ' + G.fmt(px.fee) + ' (' + px.rate + '%) → 협력업체 ' + G.fmt(px.net) + '</dd></div></dl>') + card('시장 비교 (참고)', market) + '</div></div>');
  }
  G.SUB.acFees = function () {
    var g = function (id) { return Number(document.getElementById(id).value); }, v = { club: g('fe-c'), minFee: g('fe-m'), partnerP: g('fe-p'), partnerM: g('fe-x'), cycle: g('fe-d') }, e = document.getElementById('fe-e');
    var bad = isNaN(v.club) || v.club < 0 || v.club > 30 ? '이웃 나눔 수수료율은 0~30% 사이로 입력해 주세요.' : v.minFee < 0 || v.minFee > 5000 ? '최소 수수료는 0~5,000원 사이로 입력해 주세요.' : v.partnerP < 0 || v.partnerP > 40 || v.partnerM < 0 || v.partnerM > 40 ? '협력업체 수수료율은 0~40% 사이로 입력해 주세요.' : !(v.cycle >= 1 && v.cycle <= 14) ? '정산 주기는 1~14일 사이로 입력해 주세요.' : '';
    if (bad) { e.textContent = bad; e.hidden = false; return; }
    Object.assign(S.settle.fees, v); G.log('정산 기준 변경: 이웃 나눔 ' + v.club + '% · 협력 ' + v.partnerP + '/' + v.partnerM + '% · ' + v.cycle + '일'); G.toast('정산 기준을 저장했어요.'); G.rerender();
  };
  G.ACT.acFeesReset = function () { S.settle.fees = JSON.parse(JSON.stringify(C.FEES)); G.log('정산 기준 기본값 복원'); G.toast('기본값으로 되돌렸어요.'); G.rerender(); };

  /* ----- 협력업체 포털: 정산 내역 ----- */
  G.partnerSettleHtml = function (me) {
    var rows = G.partnerSettle().filter(function (r) { return r.app.partner === me.id; }), f = G.fees();
    var wait = rows.filter(function (r) { return r.st === 'WAIT'; }).reduce(function (t, r) { return t + r.net; }, 0), out = rows.filter(function (r) { return r.st !== 'WAIT'; }).reduce(function (t, r) { return t + r.net; }, 0);
    return '<section class="ac"><h2>정산 내역</h2><div class="kpis k3"><div class="kpi"><span>정산 예정</span><b>' + G.fmt(wait) + '</b></div><div class="kpi"><span>정산 완료</span><b>' + G.fmt(out) + '</b></div><div class="kpi"><span>정산 주기</span><b>완료 후 ' + f.cycle + '일</b></div></div>' +
      (rows.length ? '<div class="tw"><table class="tbl"><thead><tr><th>신청·서비스</th><th class="r">고객 결제액</th><th class="r">연계 수수료</th><th class="r">정산액</th><th>상태</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + esc(G.sv(r.app.svc).name) + '<small>' + r.app.no + '</small></td><td class="r">' + G.fmt(r.gross) + '</td><td class="r">' + G.fmt(r.fee) + ' <small>' + r.rate + '%</small></td><td class="r"><b>' + G.fmt(r.net) + '</b></td><td>' + (r.st === 'WAIT' ? '<span class="bd bd-warn">정산 예정</span><small>' + r.due + '</small>' : '<span class="bd bd-ok">정산 완료</span><small>' + r.outAt.slice(0, 10) + '</small>') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="small">완료 보고를 하면 이곳에 정산 내역이 생겨요.</p>') +
      '<p class="small">정산액은 고객이 승인한 견적 금액에서 연계 수수료를 뺀 금액이에요. 하자·분쟁이 접수되면 해당 건의 정산이 보류돼요. (시연)</p></section>';
  };
})();
