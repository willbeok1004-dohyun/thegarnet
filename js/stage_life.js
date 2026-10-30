/* 마이 라이프 프로필 확장(사이즈·탄생 정보·거주지)과 반려동물 물품(판매·주문제작) */
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
  var inp = function (id, v, ph, type) { return '<input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(v == null ? '' : v) + '" placeholder="' + esc(ph || '') + '">'; };
  var done = function (msg, to) { G.save(); G.toast(msg); if (to) G.go(to); else G.rerender(); };
  var me = function () { return G.adminMe ? G.adminMe() : { loginId: 'admin' }; };

  /* ================= 데이터 ================= */
  var SIJIN = [['자시', '23~01시'], ['축시', '01~03시'], ['인시', '03~05시'], ['묘시', '05~07시'], ['진시', '07~09시'], ['사시', '09~11시'], ['오시', '11~13시'], ['미시', '13~15시'], ['신시', '15~17시'], ['유시', '17~19시'], ['술시', '19~21시'], ['해시', '21~23시']];
  G.SIJIN = SIJIN;
  var PRODUCTS = [
    { id: 'PT01', kind: '판매', cat: '위생용품', name: '저자극 배변패드 100매 (예시)', pets: ['강아지'], price: 18000, priceNote: '', opts: [{ n: '규격', v: ['소형 (45×35)', '대형 (60×45)'] }], req: [], lead: '1~2일 안 발송', stock: 40, partner: 'P6', active: true, desc: '무향·저자극 흡수층, 샘 방지 테이프가 있어요.', notice: '' },
    { id: 'PT02', kind: '판매', cat: '위생용품', name: '두부 모래 7L (예시)', pets: ['고양이'], price: 15000, priceNote: '', opts: [{ n: '향', v: ['무향', '녹차'] }], req: [], lead: '1~2일 안 발송', stock: 30, partner: 'P6', active: true, desc: '변기에 버릴 수 있는 두부 모래예요.', notice: '' },
    { id: 'PT03', kind: '판매', cat: '장난감·놀이', name: '노즈워크 담요 (예시)', pets: ['강아지'], price: 24000, priceNote: '', opts: [{ n: '크기', v: ['S', 'M'] }], req: [], lead: '2~3일 안 발송', stock: 15, partner: 'P6', active: true, desc: '간식을 숨겨 냄새로 찾는 놀이 담요예요. 혼자 있는 시간이 덜 지루해요.', notice: '' },
    { id: 'PT04', kind: '판매', cat: '장난감·놀이', name: '스크래처 하우스 (예시)', pets: ['고양이'], price: 39000, priceNote: '', opts: [], req: [], lead: '2~3일 안 발송', stock: 8, partner: 'P6', active: true, desc: '골판지 스크래처와 숨숨집이 하나로 된 하우스예요.', notice: '' },
    { id: 'PT05', kind: '판매', cat: '산책·이동', name: '산책 하네스·리드줄 세트 (예시)', pets: ['강아지'], price: 32000, priceNote: '', opts: [{ n: '사이즈', v: ['S (가슴 30~40cm)', 'M (40~55cm)', 'L (55~70cm)'] }, { n: '색상', v: ['가넷', '아이보리', '네이비'] }], req: [], lead: '1~2일 안 발송', stock: 20, partner: 'P6', active: true, desc: '목에 부담이 적은 H형 하네스예요.', notice: '' },
    { id: 'PT06', kind: '판매', cat: '간식·사료', name: '동결건조 닭가슴살 간식 (예시)', pets: ['강아지', '고양이'], price: 12000, priceNote: '', opts: [{ n: '용량', v: ['50g', '100g'] }], req: [], lead: '1~2일 안 발송', stock: 50, partner: 'P6', active: true, desc: '닭가슴살 100%, 첨가물 없이 얼려 말렸어요.', notice: '사료관리법에 따라 등록된 제품만 팔아요. 개봉한 사료·간식은 교환·반품이 어려워요.' },
    { id: 'PT07', kind: '판매', cat: '산책·이동', name: '기내형 이동장 (예시)', pets: ['강아지', '고양이'], price: 45000, priceNote: '', opts: [], req: [], lead: '2~3일 안 발송', stock: 6, partner: 'P6', active: true, desc: '항공사 기내 반입 크기(가로 40cm 이하)예요.', notice: '' },
    { id: 'PT08', kind: '판매', cat: '식기·급수', name: '세라믹 높이 식기 (예시)', pets: ['강아지', '고양이'], price: 22000, priceNote: '', opts: [{ n: '높이', v: ['8cm', '12cm'] }], req: [], lead: '2~3일 안 발송', stock: 12, partner: '더가넷', active: true, desc: '목·관절 부담을 줄이는 높이 식기예요. 식기세척기를 쓸 수 있어요.', notice: '' },
    { id: 'PC01', kind: '주문제작', cat: '맞춤 의류·하네스', name: '치수 맞춤 하네스·옷 (예시)', pets: ['강아지', '고양이'], price: 38000, priceNote: '부터 · 치수·원단 확인 후 확정', opts: [{ n: '종류', v: ['하네스', '조끼형 옷', '겨울 패딩'] }, { n: '원단', v: ['면', '방수 원단', '극세사'] }], req: ['목둘레(cm)', '가슴둘레(cm)', '등길이(cm)', '체중(kg)'], lead: '확정 후 10일', stock: 0, partner: 'P3', active: true, desc: '치수를 재서 보내 주시면 몸에 맞게 지어 드려요. 시안과 금액을 먼저 확인한 뒤 결제해요.', notice: '' },
    { id: 'PC02', kind: '주문제작', cat: '인식표·이름표', name: '각인 인식표 (예시)', pets: ['강아지', '고양이'], price: 15000, priceNote: '', opts: [{ n: '모양', v: ['원형', '뼈다귀', '하트'] }, { n: '소재', v: ['스테인리스', '황동'] }], req: ['새길 이름', '보호자 연락처 (안심번호 권장)'], lead: '확정 후 5일', stock: 0, partner: 'P3', active: true, desc: '앞면에 이름, 뒷면에 연락처를 새겨요.', notice: '연락처는 안심번호를 새기는 걸 권해요.' },
    { id: 'PC03', kind: '주문제작', cat: '쿠션·하우스', name: '맞춤 방석·하우스 (예시)', pets: ['강아지', '고양이'], price: 55000, priceNote: '부터 · 크기·원단 확인 후 확정', opts: [{ n: '형태', v: ['원형 방석', '사각 매트', '숨숨집 하우스'] }, { n: '원단', v: ['면', '극세사', '쿨매트'] }], req: ['크기 (가로×세로 cm)', '체중(kg)'], lead: '확정 후 14일', stock: 0, partner: 'P3', active: true, desc: '집 공간과 아이 크기에 맞춰 지어요. 커버는 분리 세탁돼요.', notice: '' },
    { id: 'PC04', kind: '주문제작', cat: '기념·메모리얼', name: '반려동물 초상 액자 (예시)', pets: ['강아지', '고양이', '기타'], price: 49000, priceNote: '부터 · 사진 확인 후 확정', opts: [{ n: '크기', v: ['A5', 'A4'] }, { n: '방식', v: ['일러스트', '자수'] }], req: ['넣을 문구'], lead: '확정 후 14일', stock: 0, partner: 'P3', active: true, desc: '사진을 보고 일러스트나 자수로 남겨요. 추모용도 정성껏 만들어요.', notice: '' },
    { id: 'PC05', kind: '주문제작', cat: '수제 간식', name: '수제 생일 케이크 (예시)', pets: ['강아지'], price: 32000, priceNote: '부터', opts: [{ n: '크기', v: ['미니', '1호'] }], req: ['알레르기·못 먹는 재료', '받을 날짜'], lead: '확정 후 3일', stock: 0, partner: 'P1', active: false, desc: '반려동물용 재료로 만든 생일 케이크예요.', notice: '제조 허가를 받은 협력업체가 만들어요. 관리자가 업체 확인 후 공개해요.' }
  ];
  function ensure() {
    var t = T(); if (!t) return;
    if (!t.petProducts) t.petProducts = JSON.parse(JSON.stringify(PRODUCTS));
    if (!t.petOrders) t.petOrders = [{ id: 'PO1', user: 'u2', prod: 'PT02', kind: '판매', qty: 2, opts: { '향': '무향' }, req: {}, pet: '나비 (고양이)', price: 15000, total: 30000, how: '돌봄 방문 때 전달', hub: '', addr: '', note: '', at: '2026-10-25 20:10', st: '완료', hist: [['주문 접수', '2026-10-25 20:10'], ['결제 완료', '2026-10-25 20:11'], ['완료', '2026-10-27 10:40']], memo: '', eta: '', track: '' }];
    if (!t.pets) t.pets = { u2: [{ id: 'PET1', name: '나비', type: '고양이', breed: '코리안 숏헤어', age: '4살', weight: '4.2', neck: '', chest: '', back: '', care: '낯을 가려요. 간식은 닭고기만 먹어요.' }] };
    if (!t.addr) t.addr = {};
    if (!t.petCats) t.petCats = ['위생용품', '간식·사료', '장난감·놀이', '산책·이동', '식기·급수', '미용·목욕', '맞춤 의류·하네스', '인식표·이름표', '쿠션·하우스', '기념·메모리얼', '수제 간식'];
    if (!t.petTypes) t.petTypes = ['강아지', '고양이', '기타'];
    if (t.pets.u2 && t.pets.u2[0] && !t.pets.u2[0].birth) { t.pets.u2[0].birth = '2022-04-10'; t.pets.u2[0].home = '2022-06-18'; }
  }
  G.petTypes = function () { return T().petTypes; };
  G.petCats = function () { return T().petCats; };
  ensure();
  var oReset = G.reset; G.reset = function () { oReset(); ensure(); G.save(); };
  var oApply = G.stageApply; G.stageApply = function () { oApply(); ensure(); };
  /* 단계 스위치: 4단계에 '반려동물 물품' 추가 */
  var s4 = G.STAGES.filter(function (s) { return s.id === 's4'; })[0];
  if (s4 && !s4.items.some(function (i) { return i[0] === 'petShop'; })) s4.items.push(['petShop', '반려동물 물품 (판매·주문제작)']);

  /* ================= 마이 라이프 프로필 ================= */
  var prof = function () { return S.profile || (S.profile = {}); };
  function birthText(p) {
    p = p || prof(); if (!p.birth) return '';
    var d = p.birth.split('-'), cal = { solar: '양력', lunar: '음력', unknown: '양력·음력 모름' }[p.cal || 'solar'];
    var tm = p.btime && p.btime !== 'none' && p.btime !== 'unknown' ? ' · ' + p.btime + '(' + (SIJIN.filter(function (s) { return s[0] === p.btime; })[0] || ['', ''])[1] + ')' : p.btime === 'unknown' ? ' · 태어난 시 모름' : '';
    return d[0] + '년 ' + (+d[1]) + '월 ' + (+d[2]) + '일 (' + cal + ')' + (p.cal === 'lunar' && p.solar ? ' · 양력 ' + p.solar : '') + tm;
  }
  G.birthText = birthText;
  function symMD() { var p = prof(), s = p.cal === 'lunar' ? p.solar : p.birth; if (!s || p.cal === 'unknown' && !p.birth) return null; var d = s.split('-'); return d.length === 3 ? [+d[1], +d[2]] : null; }
  function symHtml() {
    var md = symMD(); if (!md) return '<p class="small">' + (prof().cal === 'lunar' ? '음력 생일은 탄생 상징(양력 기준)을 바로 계산할 수 없어요. 양력 날짜를 알면 함께 적어 주세요.' : '생년월일을 넣으면 탄생석·탄생화·탄생목·별자리를 보여 드려요.') + '</p>';
    var m = md[0], d = md[1];
    return '<ul class="sym-l"><li><span>탄생석</span><b>' + STONES[m - 1] + '</b></li><li><span>탄생화</span><b>' + FLOWERS[m - 1] + '</b></li><li><span>탄생목</span><b>' + TREES[m - 1] + '</b></li><li><span>별자리</span><b>' + zodiac(m, d) + '</b></li></ul>';
  }
  function profilePage() {
    var p = prof(), sz = G.sizeText ? G.sizeText() : '';
    var szs = '<div class="fgrid"><div class="fg"><label class="lb" for="p-c">의류 사이즈</label>' + sel('p-c', [['', '선택하지 않음']].concat(['SS', 'S', 'M', 'L', 'XL', 'XXL']), p.clothes || '') + '</div><div class="fg"><label class="lb" for="p-s">신발 사이즈 (mm)</label>' + sel('p-s', [['', '선택하지 않음']].concat(Array.apply(null, Array(21)).map(function (_, i) { return String(200 + i * 5); })), p.shoe || '') + '</div>' +
      fg('p-r', '반지 호수', inp('p-r', p.ring, '예: 12호')) + fg('p-col', '선호 색상', sel('p-col', [['', '선택 안 함']].concat(['아이보리', '가넷', '그린', '파스텔', '블랙']), p.color || '')) + fg('p-m', '기념일 메모', '<textarea id="p-m" rows="2" placeholder="가족·지인의 실명이나 상세 정보는 적지 마세요.">' + esc(p.memo || '') + '</textarea>', 'full') + '</div>';
    var birth = '<div class="fgrid">' + fg('p-b', '생년월일', inp('p-b', p.birth, '', 'date')) + fg('p-cal', '양력·음력', sel('p-cal', [['solar', '양력'], ['lunar', '음력'], ['unknown', '모름']], p.cal || 'solar', ' data-on="change:pCal"')) +
      '<div class="fg" id="p-sol-g"' + (p.cal === 'lunar' ? '' : ' hidden') + '><label class="lb" for="p-sol">양력 날짜 <em class="opt">알면</em></label>' + inp('p-sol', p.solar, '', 'date') + '</div>' +
      fg('p-t', '태어난 시', sel('p-t', [['none', '선택 안 함'], ['unknown', '모름']].concat(SIJIN.map(function (s) { return [s[0], s[0] + ' (' + s[1] + ')']; })), p.btime || 'none')) + '</div>' +
      '<label class="chk"><input type="checkbox" id="p-bok"' + (p.birthOk ? ' checked' : '') + '><span><b>[선택 동의]</b> 탄생 정보를 저장하고, 탄생 상징 주얼리·사주·풍수 상담, 꽃·인테리어 공간 배치, 침구·소품 제안 신청서에서 <b>함께 보내기</b>를 체크할 때만 전달하는 데 동의해요. 언제든 지울 수 있어요.</span></label>';
    var body = '<form class="card form" data-sub="profile"><p class="small mb">선물·맞춤 제작·공간 제안에 쓰이는 선택 정보예요. 입력하지 않아도 모든 서비스를 이용할 수 있고, 신청서에서 직접 체크할 때만 전달돼요.</p>' +
      '<h3 class="pf-h">' + ico('gift', 18) + ' 사이즈 <a class="lnk-i" href="#special">특별한 날에서 쓰여요</a></h3>' + szs +
      '<h3 class="pf-h">' + ico('star', 18) + ' 탄생 정보 <span class="small">탄생일 반영 공간 배치 · 인테리어·소품 공급 때 참고</span></h3>' + birth +
      '<div class="pf-sym">' + symHtml() + '</div>' +
      '<div class="fa"><button class="btn btn-fill" type="submit">저장하기</button>' + (p.birth ? '<button class="btn btn-ghost" type="button" data-act="pBirthDel">탄생 정보 지우기</button>' : '') + '</div></form>' +
      '<div class="card pf-links"><h3>' + ico('home', 18) + ' 거주지 · 배송지</h3><p class="small">거주지: ' + (addrText() || '아직 저장하지 않았어요.') + ' · 배송지 ' + book().length + '곳</p><a class="btn btn-line btn-sm" href="#my-info">내 정보에서 주소·배송지 관리</a>' +
      (f('petShop') || (T().pets[uid()] || []).length ? '<h3 class="mt">' + ico('heart', 18) + ' 우리 반려동물</h3><p class="small">' + ((T().pets[uid()] || []).map(function (x) { return esc(x.name) + '(' + esc(x.type) + ')'; }).join(', ') || '등록한 반려동물이 없어요.') + '</p><a class="btn btn-line btn-sm" href="#my-pets">반려동물 관리</a>' : '') + '</div>';
    return G.myShell('profile', '마이 라이프 프로필', body, '사이즈·탄생 정보는 \'특별한 날\'과 신청서에 연결돼요.');
  }
  G.myPages.profile = function () { return profilePage(); };
  G.INP.pCal = function (el) { var g = $('p-sol-g'); if (g) g.hidden = el.value !== 'lunar'; };
  G.SUB.profile = function () {
    var p = prof(), b = val('p-b'), ok = ($('p-bok') || {}).checked;
    if (b && !ok) return G.toast('탄생 정보를 저장하려면 선택 동의에 체크해 주세요.');
    if (b && b > SITE.today) return G.toast('생년월일을 다시 확인해 주세요.');
    Object.assign(p, { clothes: val('p-c'), shoe: val('p-s'), ring: val('p-r'), color: val('p-col'), memo: val('p-m'), birth: b, cal: val('p-cal') || 'solar', solar: val('p-cal') === 'lunar' ? val('p-sol') : '', btime: val('p-t') || 'none', birthOk: !!(b && ok) });
    G.log('마이 라이프 프로필 저장'); done('프로필을 저장했어요.');
  };
  G.ACT.pBirthDel = function () { var p = prof(); ['birth', 'cal', 'solar', 'btime', 'birthOk'].forEach(function (k) { delete p[k]; }); done('탄생 정보를 지웠어요.'); };

  /* 특별한 날: 저장한 생일로 탄생 상징 미리 채우기 */
  var oSpecial = P.special;
  P.special = function () {
    var o = oSpecial(), md = S.user && prof().birthOk ? symMD() : null;
    if (S.user && o.html) o.html = o.html.replace('<p class="small mt">선물 받는 분 사이즈는', '<p class="small">' + (prof().birthOk && prof().birth ? '탄생 정보: ' + esc(birthText()) + ' · <a class="lnk-i" href="#my-profile">고치기</a>' : '탄생 정보를 저장하면 탄생 상징을 바로 보여 드려요. <a class="lnk-i" href="#my-profile">입력하기</a>') + '</p><p class="small mt">선물 받는 분 사이즈는');
    if (md) { var m0 = o.mount; o.mount = function () { if (m0) m0(); var bm = $('bm'), bd = $('bd'); if (bm && bd) { bm.value = md[0]; bd.value = md[1]; G.INP.sym(); var out = $('symOut'); if (out) out.insertAdjacentHTML('afterbegin', '<p class="small">프로필에 저장한 생일로 채웠어요.</p>'); } }; }
    return o;
  };

  /* ================= 거주지 주소 (내 정보) ================= */
  function addrOf(u) { return T().addr[u] || {}; }
  function book(u) { var a = T().addr[u || uid()] = T().addr[u || uid()] || {}; return a.book || (a.book = []); }
  G.shipBook = book;
  function shipText(x) { return x ? '[' + x.zip + '] ' + x.road + (x.detail ? ' ' + x.detail : '') : ''; }
  G.shipText = shipText;
  G.shipMask = function (x) { return x ? esc(x.name.charAt(0) + '*' + (x.name.length > 2 ? x.name.slice(-1) : '')) + ' · ' + esc(String(x.phone).replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, '$1-****-$3')) + ' · [' + esc(x.zip) + '] ' + esc(x.road) + ' ***' : ''; };
  /* 배송지 고르기 · 새로 적기 (택배 주문 공통) */
  G.shipPicker = function (pfx) {
    var l = book(), def = l.filter(function (x) { return x.def; })[0] || l[0];
    return '<div class="ship" id="' + pfx + '-ship">' + (l.length ? '<div class="ship-l">' + l.map(function (x) { return '<label class="ship-o"><input type="radio" name="' + pfx + '-sb" value="' + x.id + '"' + (def && def.id === x.id ? ' checked' : '') + '><span><b>' + esc(x.label || '배송지') + (x.def ? ' · 기본' : '') + '</b><small>' + esc(x.name) + ' · ' + esc(x.phone) + '</small><small>' + esc(shipText(x)) + (x.memo ? ' · ' + esc(x.memo) : '') + '</small></span></label>'; }).join('') + '<label class="ship-o"><input type="radio" name="' + pfx + '-sb" value="new"' + (l.length ? '' : ' checked') + '><span><b>새 배송지 적기</b></span></label></div>' : '<input type="hidden" name="' + pfx + '-sb" value="new">') +
      '<div class="ship-new" id="' + pfx + '-new"' + (l.length ? ' hidden' : '') + '>' + shipFields(pfx, {}) + '<label class="chk"><input type="checkbox" id="' + pfx + '-keep" checked> 내 배송지에 저장</label></div></div>';
  };
  function shipFields(pfx, x) {
    return '<div class="fgrid">' + fg(pfx + '-nm', '받는 분 *', inp(pfx + '-nm', x.name || (S.user ? S.user.name : ''))) + fg(pfx + '-ph', '연락처 *', inp(pfx + '-ph', x.phone || (S.user ? S.user.phone : ''), '010-0000-0000', 'tel')) +
      '<div class="fg"><label class="lb" for="' + pfx + '-zip">우편번호 *</label><div class="inl">' + inp(pfx + '-zip', x.zip, '5자리') + '<button type="button" class="btn btn-line btn-sm" data-act="zipFind" data-p="' + pfx + '">주소 찾기</button></div></div>' +
      fg(pfx + '-road', '도로명 주소 *', inp(pfx + '-road', x.road, '예: 서울 마포구 ○○로 12'), 'full') + fg(pfx + '-det', '상세 주소', inp(pfx + '-det', x.detail, '동·호수')) + fg(pfx + '-memo', '배송 메모', inp(pfx + '-memo', x.memo, '예: 문 앞에 두세요, 공동현관 비밀번호는 전화로')) + '</div>';
  }
  G.shipRead = function (pfx) {
    var c = document.querySelector('[name=' + pfx + '-sb]:checked') || document.querySelector('[name=' + pfx + '-sb]'), v = c ? c.value : 'new';
    if (v !== 'new') return { ok: true, x: JSON.parse(JSON.stringify(byId(book(), v))) };
    var x = { name: val(pfx + '-nm'), phone: val(pfx + '-ph'), zip: val(pfx + '-zip'), road: val(pfx + '-road'), detail: val(pfx + '-det'), memo: val(pfx + '-memo') };
    if (!x.name || !x.road || !/^\d{5}$/.test(x.zip)) return { ok: false, msg: '받는 분, 5자리 우편번호, 도로명 주소를 적어 주세요.' };
    if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(x.phone)) return { ok: false, msg: '받는 분 연락처를 확인해 주세요.' };
    if (($(pfx + '-keep') || {}).checked && !book().some(function (y) { return y.name === x.name && y.road === x.road && y.detail === x.detail; })) { var l = book(); x.id = 'SB' + Date.now() % 100000; x.label = l.length ? '배송지 ' + (l.length + 1) : '우리 집'; x.def = !l.length; l.push(JSON.parse(JSON.stringify(x))); }
    return { ok: true, x: x };
  };
  G.INP.shipPick = function (el) { var pfx = el.name.replace(/-sb$/, ''), n = $(pfx + '-new'); if (n) n.hidden = el.value !== 'new'; };
  document.addEventListener('change', function (e) { if (e.target && /-sb$/.test(e.target.name || '')) G.INP.shipPick(e.target); });
  G.ACT.zipFind = function (el) { var pfx = el.dataset.p, r = $(pfx + '-road'); var q = r && r.value ? r.value : (addrOf(uid()).area || '서울 마포구'); var n = 0; for (var i = 0; i < q.length; i++) n = (n * 17 + q.charCodeAt(i)) % 90000; $(pfx + '-zip').value = String(10000 + n).slice(0, 5); if (r && !r.value) r.value = q + ' ○○로 12'; G.toast('우편번호를 찾았어요. (시연: 실제로는 주소 검색 창이 열려요)'); };
  function addrText(u) { var a = addrOf(u || uid()); return a.area ? a.area + (a.detail ? ' ' + a.detail : '') : ''; }
  G.addrText = addrText;
  var oMy = P.my;
  P.my = function (arg) {
    var o = oMy(arg); if (!S.user || !o || !o.html) return o;
    if (arg === 'info') {
      var a = addrOf(uid());
      var bk = book();
      o.html = o.html.replace('<div class="card danger">', '<div class="card ship-card"><h3>' + ico('truck', 18) + ' 배송지 관리 <span class="small">택배로 받는 물품·선물·공동구매에 써요</span></h3>' + (bk.length ? '<ul class="mng">' + bk.map(function (x) { return '<li><div><b>' + esc(x.label || '배송지') + (x.def ? ' <span class="bd bd-ok">기본</span>' : '') + '</b><small>' + esc(x.name) + ' · ' + esc(x.phone) + '</small><small>' + esc(shipText(x)) + (x.memo ? ' · ' + esc(x.memo) : '') + '</small></div><div class="fa">' + (x.def ? '' : '<button class="btn btn-ghost btn-sm" data-act="shipDef" data-id="' + x.id + '">기본으로</button>') + '<button class="btn btn-ghost btn-sm" data-act="shipDel" data-id="' + x.id + '">지우기</button></div></li>'; }).join('') + '</ul>' : '<p class="small">저장한 배송지가 없어요. 최대 5곳까지 저장할 수 있어요.</p>') +
        '<form class="form" data-sub="shipAdd" novalidate>' + fg('sb-label', '이름 붙이기', inp('sb-label', '', '예: 우리 집, 부모님 댁')) + shipFields('sb', {}) + '<label class="chk"><input type="checkbox" id="sb-ok"><span><b>[필수]</b> 택배 배송을 위해 받는 분 이름·연락처·주소를 저장하는 데 동의해요. 주문에 쓴 주소는 전자상거래법에 따라 거래 기록으로 5년 보관하고, 배송지 목록에서는 언제든 지울 수 있어요.</span></label><button class="btn btn-line btn-sm" type="submit">배송지 저장</button></form></div><div class="card danger">');
      o.html = o.html.replace('</div><label class="chk"><input type="checkbox"><span>소식과 혜택', '<div class="fg"><label class="lb" for="i-area">거주지 (시·군·구)</label>' + inp('i-area', a.area, '예: 서울 마포구') + '</div><div class="fg"><label class="lb" for="i-det">상세 주소 <em class="opt">선택</em></label>' + inp('i-det', a.detail, '방문 서비스 때만 쓰여요') + '</div></div><label class="chk"><input type="checkbox" id="i-aok"' + (a.ok ? ' checked' : '') + '><span>신청서의 지역 칸에 불러오는 데 동의해요. 방문 주소는 승인 이후 안내에만 쓰고, 택배 주소는 아래 배송지 관리에서 따로 저장해요.</span></label><label class="chk"><input type="checkbox"><span>소식과 혜택');
    }
    if (arg && arg.indexOf('app-') === 0) {
      var ap = G.app(arg.slice(4));
      if (ap && ap.data && ap.data['탄생 정보']) o.html = o.html.replace('<h4>진행 이력</h4>', '<p class="small">' + ico('star', 14) + ' 이 신청에는 탄생 정보를 함께 보냈어요.</p><h4>진행 이력</h4>');
    }
    return o;
  };
  G.SUB.shipAdd = function () {
    var l = book(); if (l.length >= 5) return G.toast('배송지는 5곳까지 저장할 수 있어요.');
    if (!($('sb-ok') || {}).checked) return G.toast('배송지 저장 동의에 체크해 주세요.');
    var x = { name: val('sb-nm'), phone: val('sb-ph'), zip: val('sb-zip'), road: val('sb-road'), detail: val('sb-det'), memo: val('sb-memo') };
    if (!x.name || !x.road || !/^\d{5}$/.test(x.zip)) return G.toast('받는 분, 5자리 우편번호, 도로명 주소를 적어 주세요.');
    if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(x.phone)) return G.toast('연락처를 확인해 주세요.');
    x.id = 'SB' + Date.now() % 100000; x.label = val('sb-label') || (l.length ? '배송지 ' + (l.length + 1) : '우리 집'); x.def = !l.length; l.push(x); done('배송지를 저장했어요.');
  };
  G.ACT.shipDef = function (el) { book().forEach(function (x) { x.def = x.id === el.dataset.id; }); done('기본 배송지로 정했어요.'); };
  G.ACT.shipDel = function (el) { var a = T().addr[uid()]; a.book = book().filter(function (x) { return x.id !== el.dataset.id; }); if (a.book.length && !a.book.some(function (x) { return x.def; })) a.book[0].def = true; done('배송지를 지웠어요.'); };
  var oInfo = G.SUB.info;
  G.SUB.info = function (fm) { var area = val('i-area'), det = val('i-det'), ok = ($('i-aok') || {}).checked; if (det && !area) return G.toast('상세 주소를 저장하려면 시·군·구를 먼저 적어 주세요.'); T().addr[uid()] = { area: area, detail: det, ok: !!ok }; if (area && f('branches')) { var b = G.branchOfRegion(area), m = G.memInfo(uid()); if (b && !m.branch) m.branch = b; } oInfo(fm); };

  /* ================= 신청서: 내 정보 불러오기 ================= */
  var BIRTH_SVC = ['S13', 'S05', 'S09', 'S03'];
  var oApplyP = P.apply;
  P.apply = function (id) {
    var o = oApplyP(id); if (!id || !o.html || !S.user || !S.drafts[id]) return o;
    var d = S.drafts[id], s = G.sv(id), tools = [];
    if (d.step === 0) {
      var a = addrOf(uid()), hasAddr = s.wf.fields.some(function (x) { return x[1] === 'address'; });
      if (hasAddr && a.area && a.ok) tools.push('<button type="button" class="btn btn-line btn-sm" data-act="apFill" data-id="' + id + '" data-k="addr">' + ico('home', 16) + ' 내 지역 불러오기 (' + esc(a.area) + ')</button>');
      if (id === 'S13' && prof().birthOk) tools.push('<button type="button" class="btn btn-line btn-sm" data-act="apFill" data-id="' + id + '" data-k="birth">' + ico('star', 16) + ' 내 탄생 정보 불러오기</button>');
      if (id === 'S06' && (T().pets[uid()] || []).length) tools.push('<button type="button" class="btn btn-line btn-sm" data-act="apFill" data-id="' + id + '" data-k="pet">' + ico('heart', 16) + ' 우리 반려동물 불러오기</button>');
      if (tools.length) o.html = o.html.replace('<div class="fgrid">', '<div class="ap-fill">' + tools.join('') + '<span class="small">프로필에 저장한 정보로 채워요. 고쳐도 프로필은 바뀌지 않아요.</span></div><div class="fgrid">');
    }
    if (d.step === 1 && BIRTH_SVC.indexOf(id) >= 0 && id !== 'S13' && prof().birthOk)
      o.html = o.html.replace('<div class="fg"><label class="lb" for="c-budget">', '<div class="fg full"><label class="chk"><input type="checkbox" data-on="change:birthShare" data-id="' + id + '"' + (d.c.birthShare ? ' checked' : '') + '><span>탄생 정보를 ' + (id === 'S09' ? '침구·소품 제안' : id === 'S05' ? '꽃·인테리어 공간 배치' : '공간 배치·정리') + '에 참고해 주세요 <b>(' + esc(birthText()) + ')</b></span></label></div><div class="fg"><label class="lb" for="c-budget">');
    return o;
  };
  G.INP.birthShare = function (el) { var d = S.drafts[el.dataset.id]; if (d) { d.c.birthShare = el.checked; G.save(); } };
  G.ACT.apFill = function (el) {
    var id = el.dataset.id, d = S.drafts[id], s = G.sv(id), k = el.dataset.k;
    if (k === 'addr') { var a = addrOf(uid()); s.wf.fields.forEach(function (x) { if (x[1] === 'address' && !d.v[x[0]]) d.v[x[0]] = a.area; }); }
    if (k === 'birth') { d.v['출생정보 제공 동의'] = true; d.v['출생정보'] = birthText(); }
    if (k === 'pet') { var l = T().pets[uid()] || [], p0 = l[0]; if (p0) { var opt = (s.wf.fields.filter(function (x) { return x[0] === '반려동물 종류'; })[0] || [])[3] || ''; var types = String(opt).split(' / '); d.v['반려동물 종류'] = types.indexOf(p0.type) >= 0 ? p0.type : (types[types.length - 1] || p0.type); d.v['반려동물 수'] = l.length; d.v['품종·연령'] = l.map(function (x) { return x.name + ' ' + x.breed + ' ' + x.age; }).join(', '); d.v['성향 및 주의사항'] = l.map(function (x) { return x.name + ': ' + (x.care || '-'); }).join(' / '); } }
    G.save(); G.toast('불러왔어요. 확인하고 고쳐 주세요.'); G.rerender();
  };
  var oSubmit = G.ACT.asubmit;
  G.ACT.asubmit = function (el) {
    var id = el.dataset.id, d = S.drafts[id], share = d && d.c.birthShare, n = S.apps.length; oSubmit(el);
    if (S.apps.length > n && share && prof().birthOk) { S.apps[0].data['탄생 정보'] = birthText(); G.save(); }
  };

  /* ================= 우리 반려동물 (마이페이지) ================= */
  var PET_ST = { '판매': ['주문 접수', '결제 완료', '준비 중', '배송·수령 대기', '완료'], '주문제작': ['제작 요청', '치수·시안 확인', '고객 승인·결제', '제작 중', '배송·수령 대기', '완료'] };
  G.PET_ST = PET_ST;
  var oNav = G.myNavExtra;
  G.myNavExtra = function () { var n = oNav ? oNav() : []; if (f('petShop') || (T().pets[uid()] || []).length) n.push(['pets', '우리 반려동물', 'heart']); return n; };
  G.myPages.pets = function () {
    var l = T().pets[uid()] || [], ord = T().petOrders.filter(function (o) { return o.user === uid(); });
    var petCard = function (x) { return '<li><div><b>' + esc(x.name) + '</b> <span class="tag">' + esc(x.type) + '</span><small>' + esc([x.breed, x.birth ? petAge(x.birth) + (x.birthGuess ? '(추정)' : '') + ' · ' + x.birth.replace(/-/g, '.') + ' 생' : x.age, x.home ? '집에 온 날 ' + x.home.replace(/-/g, '.') : '', x.weight ? x.weight + 'kg' : '', x.neck ? '목 ' + x.neck + 'cm' : '', x.chest ? '가슴 ' + x.chest + 'cm' : '', x.back ? '등 ' + x.back + 'cm' : ''].filter(Boolean).join(' · ')) + (x.care ? ' · ' + esc(x.care) : '') + '</small></div><div class="fa"><button class="btn btn-ghost btn-sm" data-act="petEdit" data-id="' + x.id + '">고치기</button><button class="btn btn-ghost btn-sm" data-act="petDel" data-id="' + x.id + '">빼기</button></div></li>'; };
    var e = petEditing ? byId(l, petEditing) || {} : {};
    var form = '<form class="card form" data-sub="petSave" novalidate><h3>' + (petEditing ? '반려동물 고치기' : '반려동물 등록') + '</h3><div class="fgrid">' + fg('pe-n', '이름 *', inp('pe-n', e.name)) + fg('pe-t', '종류 *', sel('pe-t', T().petTypes.concat(e.type && T().petTypes.indexOf(e.type) < 0 ? [e.type] : []), e.type || T().petTypes[0])) + fg('pe-b', '품종', inp('pe-b', e.breed, '예: 말티즈')) + fg('pe-bd', '출생일', inp('pe-bd', e.birth, '', 'date') + '<label class="chk sm"><input type="checkbox" id="pe-bx"' + (e.birthGuess ? ' checked' : '') + '> 정확히 몰라요 (추정)</label>') + fg('pe-hm', '집에 온 날', inp('pe-hm', e.home, '', 'date')) + fg('pe-w', '체중 (kg)', inp('pe-w', e.weight, '', 'number')) +
      fg('pe-nk', '목둘레 (cm)', inp('pe-nk', e.neck, '맞춤 제작 때 써요', 'number')) + fg('pe-ch', '가슴둘레 (cm)', inp('pe-ch', e.chest, '', 'number')) + fg('pe-bk', '등길이 (cm)', inp('pe-bk', e.back, '', 'number')) + fg('pe-c', '성향·주의사항·알레르기', '<textarea id="pe-c" rows="2">' + esc(e.care || '') + '</textarea>', 'full') + '</div><div class="fa"><button class="btn btn-fill btn-sm" type="submit">저장</button>' + (petEditing ? '<button class="btn btn-ghost btn-sm" type="button" data-act="petEdit" data-id="">취소</button>' : '') + '</div><p class="small">반려동물 돌봄 신청서와 맞춤 제작 주문서에 불러올 수 있어요.</p></form>';
    var orders = '<h3 class="h3 mt">물품 주문 내역</h3>' + (ord.length ? '<ul class="nl">' + ord.map(function (o) {
      var p = byId(T().petProducts, o.prod) || {}, act = '';
      if (o.kind === '주문제작' && o.st === '치수·시안 확인' && o.total) act = '<div class="fa"><button class="btn btn-fill btn-sm" data-act="poPay" data-id="' + o.id + '">' + G.fmt(o.total) + ' 승인하고 결제 (시연)</button></div>';
      if (o.st === '배송·수령 대기') act = '<div class="fa"><button class="btn btn-line btn-sm" data-act="poDone" data-id="' + o.id + '">받았어요</button></div>';
      if (canCancel(o)) act += '<div class="fa"><button class="btn btn-ghost btn-sm" data-act="poCancel" data-id="' + o.id + '">' + (o.kind === '판매' && o.st !== '주문 접수' ? '청약철회·취소' : '주문 취소') + '</button></div>';
      return '<li class="q"><div><span class="bd bd-' + (o.st === '완료' ? 'ok' : o.st === '취소' ? 'mute' : 'info') + '">' + esc(o.st) + '</span><b>' + esc(p.name || '') + '</b><time>' + esc(o.at) + '</time></div><p>' + esc(o.kind) + ' · ' + (o.qty || 1) + '개 · ' + (o.total ? G.fmt(o.total) : '금액 확인 중') + ' · ' + esc(o.how) + (o.pet ? ' · ' + esc(o.pet) : '') + '</p>' + (o.eta ? '<p class="small">예정일 ' + esc(o.eta) + (o.track ? ' · ' + esc(o.track) : '') + '</p>' : '') + (o.msg ? '<p class="ans"><b>안내</b> ' + esc(o.msg) + '</p>' : '') + act + '</li>';
    }).join('') + '</ul>' : G.empty('아직 주문이 없어요.', f('petShop') ? '<a class="btn btn-fill btn-sm" href="#petshop">반려동물 물품 보기</a>' : ''));
    return G.myShell('pets', '우리 반려동물', '<div class="card"><ul class="mng">' + (l.length ? l.map(petCard).join('') : '<li><div><small>아직 등록한 반려동물이 없어요.</small></div></li>') + '</ul></div>' + form + (f('petShop') ? orders : ''), '돌봄 신청과 물품 주문에 쓰는 정보예요.');
  };
  var petEditing = '';
  function petAge(b) { var d = G.dayDiff(b, SITE.today); if (d < 0) return ''; if (d < 60) return d + '일'; if (d < 730) return Math.floor(d / 30.4) + '개월'; return Math.floor(d / 365.25) + '살'; }
  G.petAge = petAge;
  G.ACT.petEdit = function (el) { petEditing = el.dataset.id; G.rerender(); };
  G.ACT.petDel = function (el) { T().pets[uid()] = (T().pets[uid()] || []).filter(function (x) { return x.id !== el.dataset.id; }); done('뺐어요.'); };
  G.SUB.petSave = function () {
    var n = val('pe-n'); if (!n) return G.toast('이름을 적어 주세요.');
    var l = T().pets[uid()] = T().pets[uid()] || [], bd = val('pe-bd'); if (bd && bd > SITE.today) return G.toast('출생일을 다시 확인해 주세요.'); var o = { name: n, type: val('pe-t'), breed: val('pe-b'), birth: bd, birthGuess: !!($('pe-bx') || {}).checked, home: val('pe-hm'), age: bd ? petAge(bd) : '', weight: val('pe-w'), neck: val('pe-nk'), chest: val('pe-ch'), back: val('pe-bk'), care: val('pe-c') };
    if (petEditing) Object.assign(byId(l, petEditing), o); else { o.id = 'PET' + Date.now() % 100000; l.push(o); }
    petEditing = ''; done('저장했어요.');
  };

  /* ================= 반려동물 물품 (고객) ================= */
  var pf = { kind: '', pet: '', cat: '' };
  var price = function (p) { return p.price ? G.fmt(p.price) + (p.priceNote ? ' <small>' + esc(p.priceNote) + '</small>' : '') : '<small>금액은 확인 후 안내</small>'; };
  P.petshop = function () {
    if (!f('petShop')) return { title: '반려동물 물품', html: G.pageHead('반려동물 물품', '준비하고 있어요. 열리면 반려동물 돌봄 화면에서 바로 안내드릴게요.', [['반려동물 물품']]) + '<section class="sec sec-tight"><div class="wrap">' + G.empty('조금만 기다려 주세요.', '<a class="btn btn-line btn-sm" href="#svc-S06">반려동물 돌봄 보기</a>') + '</div></section>' };
    var l = T().petProducts.filter(function (p) { return p.active && (!pf.kind || p.kind === pf.kind) && (!pf.pet || p.pets.indexOf(pf.pet) >= 0) && (!pf.cat || p.cat === pf.cat); });
    var cats = T().petCats.filter(function (c) { return T().petProducts.some(function (p) { return p.active && p.cat === c && (!pf.kind || p.kind === pf.kind); }); });
    var chips = function (k, arr) { return '<div class="chips">' + arr.map(function (c) { return '<button class="chip' + (pf[k] === c[0] ? ' on' : '') + '" data-act="pfF" data-k="' + k + '" data-v="' + esc(c[0]) + '">' + esc(c[1]) + '</button>'; }).join('') + '</div>'; };
    return { title: '반려동물 물품', html: G.pageHead('반려동물 물품', '돌봄과 함께 쓰는 물품을 사거나, 우리 아이 치수에 맞춰 지을 수 있어요. 돌봄 방문 때 함께 받아도 돼요.', [['돌봄 둘러보기', 'services'], ['반려동물 돌봄', 'svc-S06'], ['물품']], 'PET GOODS') +
      '<section class="sec-tight"><div class="wrap">' + chips('kind', [['', '전체'], ['판매', '바로 사기'], ['주문제작', '맞춤 제작']]) + chips('pet', [['', '모든 반려동물']].concat(T().petTypes.map(function (x) { return [x, x]; }))) + chips('cat', [['', '모든 분류']].concat(cats.map(function (c) { return [c, c]; }))) +
      (l.length ? '<div class="pet-grid">' + l.map(function (p) { return '<article class="card pet-c"><p class="meta"><span class="bd bd-' + (p.kind === '판매' ? 'info' : 'kind-o') + '">' + (p.kind === '판매' ? '바로 사기' : '맞춤 제작') + '</span><span class="tag">' + esc(p.cat) + '</span></p><h3><a href="#pet-' + p.id + '">' + esc(p.name) + '</a></h3><p class="small">' + esc(p.desc) + '</p><p class="pet-p">' + price(p) + '</p><p class="small">' + esc(p.pets.join('·')) + ' · ' + esc(p.lead) + '</p><a class="btn btn-line btn-sm" href="#pet-' + p.id + '">' + (p.kind === '판매' ? '주문하기' : '제작 요청하기') + '</a></article>'; }).join('') + '</div>' : G.empty('조건에 맞는 물품이 없어요.')) +
      '<div class="callout">' + ico('info', 20) + '<div><strong>알아두세요</strong><p>바로 사는 물품은 받은 날부터 7일 안에 청약철회할 수 있어요(개봉한 사료·간식 제외). 맞춤 제작은 시안과 금액을 승인한 뒤 결제하고, 제작이 시작되면 취소할 수 없어요(주문 전에 따로 동의를 받아요). 사료·간식은 등록된 제품만 팔아요.</p></div></div></div></section>' };
  };
  G.ACT.pfF = function (el) { pf[el.dataset.k] = el.dataset.v; if (el.dataset.k === 'kind') pf.cat = ''; G.rerender(); };
  P.pet = function (id) {
    var p = byId(T().petProducts, id); if (!f('petShop') || !p || !p.active) return P.petshop();
    var pets = T().pets[uid()] || [], custom = p.kind === '주문제작';
    var MAP = { '목둘레(cm)': 'neck', '가슴둘레(cm)': 'chest', '등길이(cm)': 'back', '체중(kg)': 'weight' };
    var form = !S.user ? '<a class="btn btn-fill btn-block" href="#login" data-act="setRet" data-ret="pet-' + id + '">로그인하고 ' + (custom ? '제작 요청' : '주문') + '하기</a>' :
      '<form data-sub="poSave" data-id="' + id + '" novalidate>' + (pets.length ? fg('po-pet', '어느 아이 것인가요', sel('po-pet', [['', '선택 안 함']].concat(pets.map(function (x) { return [x.id, x.name + ' (' + x.type + ')']; })), '', ' data-on="change:poPet" data-id="' + id + '"')) : '<p class="small"><a class="lnk-i" href="#my-pets">우리 반려동물</a>을 등록하면 치수를 불러올 수 있어요.</p>') +
      p.opts.map(function (o, i) { return fg('po-o' + i, esc(o.n), sel('po-o' + i, o.v, o.v[0])); }).join('') +
      p.req.map(function (r, i) { return fg('po-r' + i, esc(r) + ' <em class="req">필수</em>', '<input id="po-r' + i + '" data-map="' + (MAP[r] || '') + '">'); }).join('') +
      (custom ? fg('po-ph', '참고 사진', '<input id="po-ph" type="file" accept="image/*" multiple>') + fg('po-n', '요청 사항', '<textarea id="po-n" rows="2" placeholder="원하는 디자인·색·주의할 점"></textarea>') : fg('po-q', '수량', sel('po-q', [1, 2, 3, 4, 5].map(function (n) { return [n, n + '개']; }), 1))) +
      fg('po-how', '받는 방법', sel('po-how', ['택배'].concat(f('places') ? ['거점에서 받기'] : []).concat(S.apps.some(function (a) { return a.user === uid() && a.svc === 'S06' && ['APPROVED', 'SCHEDULED', 'IN_PROGRESS'].indexOf(a.status) >= 0; }) ? ['돌봄 방문 때 전달'] : []), '택배', ' data-on="change:poHow"')) +
      '<div id="po-hub-g" hidden>' + fg('po-hub', '받을 거점', sel('po-hub', T().hubs.map(function (h) { return [h.id, h.name]; }), '')) + '</div><div id="po-adr-g"><p class="lb">배송지</p>' + G.shipPicker('po') + '</div>' +
      (custom ? '<label class="chk"><input type="checkbox" id="po-ok"><span><b>[필수]</b> 맞춤 제작은 시안·금액을 승인하고 제작이 시작되면 취소·반품이 어렵다는 것을 확인했어요.</span></label>' : '<label class="chk"><input type="checkbox" id="po-ok"><span><b>[필수]</b> 받은 날부터 7일 안에 청약철회할 수 있고, 개봉한 사료·간식은 제외된다는 것을 확인했어요.</span></label>') +
      '<p class="err" id="po-e" hidden></p><button class="btn btn-fill btn-block" type="submit">' + (custom ? '제작 요청 보내기' : (p.price ? '주문하고 결제 (시연)' : '주문 요청')) + '</button><p class="small">' + (custom ? '요청을 보내면 담당자가 치수·시안과 확정 금액을 알려 드리고, 승인하신 뒤에 결제해요.' : '시연이라 실제로 결제되지 않아요.') + '</p></form>';
    return { title: p.name, html: '<section class="sd"><div class="wrap"><nav class="crumb crumb-row" aria-label="현재 위치"><a href="#home">홈</a><a href="#petshop">반려동물 물품</a><span>' + esc(p.name) + '</span></nav><div class="sd-in"><div>' +
      '<p class="meta"><span class="bd bd-' + (custom ? 'kind-o' : 'info') + '">' + (custom ? '맞춤 제작' : '바로 사기') + '</span><span class="grp">' + esc(p.cat) + '</span></p><h1 class="h2">' + esc(p.name) + '</h1>' + (p.img ? '<img class="pet-img" src="' + esc(p.img) + '" alt="">' : '') +
      '<div class="blk"><h2>소개</h2><p class="prose">' + G.nl(p.desc) + '</p>' + (p.notice ? '<div class="callout warn">' + ico('info', 18) + '<div><p>' + esc(p.notice) + '</p></div></div>' : '') + '</div>' +
      '<div class="blk"><h2>상세 정보</h2><dl class="sum"><div class="kv"><dt>대상</dt><dd>' + esc(p.pets.join(', ')) + '</dd></div>' + p.opts.map(function (o) { return '<div class="kv"><dt>' + esc(o.n) + '</dt><dd>' + o.v.map(esc).join(' / ') + '</dd></div>'; }).join('') + (p.req.length ? '<div class="kv"><dt>필요한 정보</dt><dd>' + p.req.map(esc).join(', ') + '</dd></div>' : '') + '<div class="kv"><dt>준비 기간</dt><dd>' + esc(p.lead) + '</dd></div><div class="kv"><dt>공급</dt><dd>' + esc(p.partner === '더가넷' ? '더가넷 직접' : ((byId(PARTNERS, p.partner) || {}).name || '협력업체')) + '</dd></div>' + (p.kind === '판매' ? '<div class="kv"><dt>재고</dt><dd>' + (p.stock > 0 ? p.stock + '개' : '품절 · 입고 알림') + '</dd></div>' : '') + '</dl></div>' +
      '</div><aside class="sd-aside"><div class="buy"><p class="buy-k">' + esc(p.cat) + '</p><h2>' + price(p) + '</h2>' + (p.kind === '판매' && p.stock <= 0 ? '<p class="hold">지금은 품절이에요.</p>' : form) + '</div></aside></div></div></section>' };
  };
  G.INP.poHow = function (el) { var h = $('po-hub-g'), a = $('po-adr-g'); if (h) h.hidden = el.value !== '거점에서 받기'; if (a) a.hidden = el.value !== '택배'; };
  G.INP.poPet = function (el) { var x = byId(T().pets[uid()] || [], el.value); if (!x) return; document.querySelectorAll('[data-map]').forEach(function (i) { var k = i.getAttribute('data-map'); if (k && x[k]) i.value = x[k]; }); var n = $('po-r0'); if (n && /이름/.test((n.closest('.fg').querySelector('label') || {}).textContent || '')) n.value = x.name; };
  G.SUB.poSave = function (fm) {
    var p = byId(T().petProducts, fm.dataset.id), custom = p.kind === '주문제작', e = $('po-e'), fail = function (m) { e.textContent = m; e.hidden = false; };
    var req = {}, miss = []; p.req.forEach(function (r, i) { var v = val('po-r' + i); req[r] = v; if (!v) miss.push(r); });
    if (miss.length) return fail('필요한 정보를 적어 주세요: ' + miss.join(', '));
    var how = val('po-how'), ship = null; if (how === '택배') { var sr = G.shipRead('po'); if (!sr.ok) return fail(sr.msg); ship = sr.x; }
    if (!($('po-ok') || {}).checked) return fail('필수 확인에 체크해 주세요.');
    var opts = {}; p.opts.forEach(function (o, i) { opts[o.n] = val('po-o' + i); });
    var qty = custom ? 1 : +val('po-q') || 1, pet = byId(T().pets[uid()] || [], val('po-pet')), ph = $('po-ph');
    var o = { id: 'PO' + (T().petOrders.length + 1) + Date.now() % 100, user: uid(), prod: p.id, kind: p.kind, qty: qty, opts: opts, req: req, pet: pet ? pet.name + ' (' + pet.type + ')' : '', price: p.price, total: custom ? 0 : p.price * qty, how: how, hub: how === '거점에서 받기' ? val('po-hub') : '', addr: ship ? shipText(ship) : '', ship: ship, note: val('po-n'), photos: ph && ph.files ? Array.prototype.map.call(ph.files, function (x) { return x.name; }) : [], at: G.now(), st: custom ? '제작 요청' : (p.price ? '결제 완료' : '주문 접수'), hist: [], memo: '', eta: '', track: '', msg: '' };
    o.hist.push([custom ? '제작 요청' : '주문 접수', G.now()]); if (!custom && p.price) { o.hist.push(['결제 완료', G.now()]); p.stock = Math.max(0, p.stock - qty); }
    T().petOrders.unshift(o); G.notify(uid(), '[더가넷] ' + p.name + ' ' + (custom ? '제작 요청을 받았어요. 담당자가 치수·시안과 금액을 알려 드릴게요.' : '주문을 받았어요.'));
    G.log('반려동물 물품 ' + (custom ? '제작 요청' : '주문') + ': ' + p.id); done(custom ? '제작 요청을 보냈어요.' : '주문했어요.', 'my-pets');
  };
  function canCancel(o) { return o.st !== '취소' && o.st !== '완료' && (o.kind === '판매' ? ['주문 접수', '결제 완료', '준비 중'].indexOf(o.st) >= 0 : ['제작 요청', '치수·시안 확인'].indexOf(o.st) >= 0); }
  function poStep(o, st, who) { o.st = st; o.hist.push([st, G.now(), who || '']); }
  G.ACT.poPay = function (el) { var o = byId(T().petOrders, el.dataset.id); poStep(o, '고객 승인·결제', '고객'); G.log('맞춤 제작 승인·결제: ' + o.id); done('승인하고 결제했어요. 제작을 시작해요. (시연)'); };
  G.ACT.poDone = function (el) { var o = byId(T().petOrders, el.dataset.id); poStep(o, '완료', '고객'); if (f('points') && o.total) G.addPoint(o.user, '반려동물 물품 적립', Math.round(o.total * G.pointRate(o.user) / 100)); done('받았다고 표시했어요.'); };
  G.ACT.poCancel = function (el) { var o = byId(T().petOrders, el.dataset.id); if (!canCancel(o)) return G.toast('지금은 취소할 수 없어요. 1:1 문의로 알려 주세요.'); poStep(o, '취소', '고객'); var p = byId(T().petProducts, o.prod); if (p && o.kind === '판매') p.stock += o.qty; done('취소했어요. 결제한 금액은 환불돼요. (시연)'); };

  /* 반려동물 돌봄 상세에 연결 */
  var oSvc = P.svc;
  P.svc = function (id) {
    var o = oSvc(id);
    if (id === 'S06' && f('petShop') && o.html) o.html = o.html.replace('<div class="blk"><h2>비용 안내</h2>', '<div class="blk"><h2>함께 쓰는 물품</h2><p>배변패드·모래·간식 같은 물품은 바로 사고, 하네스·옷·방석·인식표는 우리 아이 치수에 맞춰 지을 수 있어요. 돌봄 방문 때 함께 받아도 돼요.</p><div class="fa"><a class="btn btn-line btn-sm" href="#petshop">' + ico('gift', 16) + ' 반려동물 물품 보기</a><a class="btn btn-ghost btn-sm" href="#my-pets">우리 반려동물 등록</a></div></div><div class="blk"><h2>비용 안내</h2>');
    return o;
  };

  /* ================= 관리자: 반려동물 물품 ================= */
  var oMenu = G.admMenu;
  G.admMenu = function () { var m = oMenu(); if (f('petShop') && !(G.adminMe && G.adminMe().role === 'BRANCH')) { var i = -1; m.forEach(function (x, k) { if (x[0] === 'admin-settle') i = k; }); m.splice(i >= 0 ? i + 1 : m.length, 0, ['admin-petshop', '반려동물 물품', 'gift']); } return m; };
  var oCur = G.admCurMap; G.admCurMap = function (raw) { if (raw.indexOf('admin-pet') === 0) return 'admin-petshop'; return oCur(raw); };
  var oBadge = G.admBadge; G.admBadge = function (h) { if (h === 'admin-petshop' && f('petShop')) return T().petOrders.filter(function (o) { return ['제작 요청', '주문 접수', '결제 완료', '고객 승인·결제'].indexOf(o.st) >= 0; }).length; return oBadge ? oBadge(h) : 0; };
  var oAdmin = P.admin;
  P.admin = function (arg, r) {
    if (S.adminAuthed && arg !== 'login' && arg.indexOf('pet') === 0 && !(G.adminMe && G.adminMe().role === 'BRANCH')) {
      if (!f('petShop')) return A({ title: '꺼진 기능', heading: '아직 열지 않은 기능이에요', html: card('', '<p><b>반려동물 물품</b> 기능이 꺼져 있어요. [단계별 기능 공개 → 4단계]에서 켜 주세요.</p><p class="fa"><a class="btn btn-fill btn-sm" href="#admin-features">단계별 기능 공개로</a></p>') });
      if (arg === 'petshop') return shopAdmin();
      if (arg.indexOf('petprod-') === 0) return prodForm(arg.slice(8));
      if (arg.indexOf('petorder-') === 0) return orderAdmin(arg.slice(9));
    }
    return oAdmin(arg, r);
  };
  function shopAdmin() {
    var t = T(), ps = t.petProducts, os = t.petOrders;
    return A({ title: '반려동물 물품', heading: '반려동물 물품', sub: '판매 상품과 주문제작 항목을 관리해요. 이름과 종류만 필수이고, 나머지는 운영하면서 나중에 채워도 돼요.', html:
      '<div class="kpis k4"><div class="kpi"><span>공개 중 상품</span><b>' + ps.filter(function (p) { return p.active; }).length + ' / ' + ps.length + '</b></div><div class="kpi"><span>처리할 주문</span><b>' + G.admBadge('admin-petshop') + '</b></div><div class="kpi"><span>주문제작 진행</span><b>' + os.filter(function (o) { return o.kind === '주문제작' && ['완료', '취소'].indexOf(o.st) < 0; }).length + '</b></div><div class="kpi"><span>판매 금액 (완료)</span><b>' + G.fmt(os.filter(function (o) { return o.st === '완료'; }).reduce(function (s0, o) { return s0 + (o.total || 0); }, 0)) + '</b></div></div>' +
      card('주문', tbl(['주문', '상품', '회원', '받는 방법', '>금액', '상태'], os.map(function (o) { var p = byId(ps, o.prod) || {}; return '<tr class="lk" data-act="goto" data-to="admin-petorder-' + o.id + '"><td><a href="#admin-petorder-' + o.id + '">' + o.id + '</a><small class="blk">' + esc(o.at) + '</small></td><td>' + esc(p.name || '') + '<small class="blk">' + esc(o.kind) + '</small></td><td>' + esc(nm(o.user)) + '</td><td>' + esc(o.how) + '</td><td class="r">' + (o.total ? G.fmt(o.total) : '-') + '</td><td><span class="bd bd-' + (o.st === '완료' ? 'ok' : o.st === '취소' ? 'mute' : 'warn') + '">' + esc(o.st) + '</span></td></tr>'; }), '아직 주문이 없어요.')) +
      card('상품 · 주문제작 항목', '<div class="fa top"><a class="btn btn-fill btn-sm" href="#admin-petprod-new">' + ico('plus', 16) + ' 항목 추가</a></div>' + tbl(['항목', '구분 · 분류', '대상', '>가격', '재고 · 기간', '공개'], ps.map(function (p) { return '<tr class="lk" data-act="goto" data-to="admin-petprod-' + p.id + '"><td><a href="#admin-petprod-' + p.id + '"><b>' + esc(p.name) + '</b></a><small class="blk">' + p.id + ' · ' + esc(p.partner === '더가넷' ? '더가넷 직접' : ((byId(PARTNERS, p.partner) || {}).name || '-')) + '</small></td><td>' + esc(p.kind) + '<small class="blk">' + esc(p.cat || '-') + '</small></td><td>' + esc(p.pets.join('·') || '-') + '</td><td class="r">' + (p.price ? G.fmt(p.price) : '견적') + '</td><td>' + (p.kind === '판매' ? (p.stock || 0) + '개' : '-') + '<small class="blk">' + esc(p.lead || '-') + '</small></td><td><label class="sw"><input type="checkbox" data-on="change:ppAct" data-id="' + p.id + '"' + (p.active ? ' checked' : '') + ' aria-label="공개"><i></i></label></td></tr>'; })) +
        '<p class="small">사료·간식은 사료관리법에 따라 등록된 제품만, 수제 간식은 제조 허가를 받은 협력업체만 올려요. 통신판매업 신고와 상품 정보 표시, 맞춤 제작의 청약철회 제한 고지를 함께 확인해요.</p>') + catCard() });
  }
  function catCard() {
    var t = T(), use = function (c, k) { return t.petProducts.filter(function (p) { return k === 'cat' ? p.cat === c : p.pets.indexOf(c) >= 0; }).length; };
    var box = function (title, arr, k, ph) { return '<div><h3 class="pf-h">' + title + '</h3><ul class="cat-l">' + arr.map(function (c, i) { return '<li><span>' + esc(c) + ' <small>' + use(c, k) + '개</small></span><span class="inl"><button class="btn btn-ghost btn-sm" data-act="catMove" data-k="' + k + '" data-i="' + i + '" aria-label="위로">↑</button><button class="btn btn-ghost btn-sm" data-act="catDel" data-k="' + k + '" data-i="' + i + '">빼기</button></span></li>'; }).join('') + '</ul><form class="inl" data-sub="catAdd" data-k="' + k + '"><input id="ca-' + k + '" placeholder="' + ph + '" aria-label="' + title + ' 추가"><button class="btn btn-line btn-sm" type="submit">더하기</button></form></div>'; };
    return card('분류 · 동물 구분 관리', '<div class="ag2c">' + box('물품 분류', t.petCats, 'cat', '예: 노령견 용품') + box('동물 구분', t.petTypes, 'type', '예: 토끼, 앵무새') + '</div><p class="small">분류를 빼면 그 분류에 있던 물품은 \'분류 없음\'으로 바뀌고 고객 화면 거르기에서도 빠져요. 동물 구분을 빼도 이미 등록한 반려동물 정보는 그대로 남아요.</p>');
  }
  G.SUB.catAdd = function (fm) { var k = fm.dataset.k, v = val('ca-' + k), arr = k === 'cat' ? T().petCats : T().petTypes; if (!v) return G.toast('이름을 적어 주세요.'); if (arr.indexOf(v) >= 0) return G.toast('이미 있어요.'); arr.push(v); G.log('반려동물 ' + (k === 'cat' ? '분류' : '동물 구분') + ' 추가: ' + v); done('더했어요.'); };
  G.ACT.catDel = function (el) { var k = el.dataset.k, arr = k === 'cat' ? T().petCats : T().petTypes, v = arr[+el.dataset.i]; if (k === 'type' && arr.length <= 1) return G.toast('동물 구분은 하나 이상 있어야 해요.'); arr.splice(+el.dataset.i, 1); T().petProducts.forEach(function (p) { if (k === 'cat' && p.cat === v) p.cat = ''; if (k === 'type') p.pets = p.pets.filter(function (x) { return x !== v; }); }); G.log('반려동물 ' + (k === 'cat' ? '분류' : '동물 구분') + ' 삭제: ' + v); done('뺐어요.'); };
  G.ACT.catMove = function (el) { var k = el.dataset.k, arr = k === 'cat' ? T().petCats : T().petTypes, i = +el.dataset.i; if (i <= 0) return; var x = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = x; done('순서를 바꿨어요.'); };
  G.INP.ppAct = function (el) { var p = byId(T().petProducts, el.dataset.id); p.active = el.checked; G.log('반려동물 물품 ' + (p.active ? '공개' : '숨김') + ': ' + p.id); done(p.active ? '공개했어요.' : '숨겼어요.'); };
  function prodForm(id) {
    var isNew = id === 'new', p = isNew ? { kind: '판매', cat: '', name: '', pets: ['강아지'], price: '', priceNote: '', opts: [], req: [], lead: '', stock: 0, partner: 'P6', active: false, desc: '', notice: '' } : byId(T().petProducts, id);
    if (!p) return shopAdmin();
    var CATS = T().petCats;
    return A({ title: '반려동물 물품', heading: isNew ? '항목 추가' : p.name, sub: '이름과 종류만 필수예요. 가격을 비우면 \'확인 후 안내\'로 보여요.', html: '<p class="mb"><a class="lnk" href="#admin-petshop">' + ico('arrow-left', 16) + ' 반려동물 물품</a></p>' + card('', '<form class="form" data-sub="ppSave" data-id="' + id + '" novalidate><div class="fgrid">' +
      fg('pp-k', '종류 *', sel('pp-k', [['판매', '판매 (바로 사기)'], ['주문제작', '주문제작 (맞춤)']], p.kind)) + fg('pp-n', '이름 *', inp('pp-n', p.name)) +
      fg('pp-c', '분류', sel('pp-c', [['', '분류 없음']].concat(CATS.indexOf(p.cat) < 0 && p.cat ? [p.cat] : []).concat(CATS), p.cat) + '<p class="hint-s"><a class="lnk-i" href="#admin-petshop">분류 관리</a>에서 더하거나 뺄 수 있어요.</p>') +
      '<div class="fg"><span class="lb">대상</span><div class="cks">' + T().petTypes.map(function (x) { return '<label class="chk"><input type="checkbox" name="pp-pet" value="' + x + '"' + (p.pets.indexOf(x) >= 0 ? ' checked' : '') + '> ' + x + '</label>'; }).join('') + '</div></div>' +
      fg('pp-p', '가격 (원)', inp('pp-p', p.price || '', '비우면 확인 후 안내', 'number')) + fg('pp-pn', '가격 메모', inp('pp-pn', p.priceNote, '예: 부터 · 치수 확인 후 확정')) +
      fg('pp-o', '선택 옵션 (한 줄에 "이름: 값, 값")', '<textarea id="pp-o" rows="3" placeholder="사이즈: S, M, L&#10;색상: 가넷, 아이보리">' + esc(p.opts.map(function (o) { return o.n + ': ' + o.v.join(', '); }).join('\n')) + '</textarea>', 'full') +
      fg('pp-r', '주문 때 받을 정보 (쉼표로 구분)', inp('pp-r', p.req.join(', '), '예: 목둘레(cm), 가슴둘레(cm), 새길 이름'), 'full') +
      fg('pp-l', '준비·제작 기간', inp('pp-l', p.lead, '예: 확정 후 10일')) + fg('pp-s', '재고 (판매)', inp('pp-s', p.stock, '', 'number')) +
      fg('pp-pt', '공급', sel('pp-pt', [['더가넷', '더가넷 직접']].concat(PARTNERS.map(function (x) { return [x.id, x.name]; })), p.partner)) + fg('pp-img', '사진', '<input id="pp-img" type="file" accept="image/*">') +
      fg('pp-d', '소개', '<textarea id="pp-d" rows="3">' + esc(p.desc) + '</textarea>', 'full') + fg('pp-x', '주의·법규 안내', inp('pp-x', p.notice, '예: 등록된 사료만 판매'), 'full') +
      '<div class="fg"><span class="lb">공개</span><label class="chk"><input type="checkbox" id="pp-a"' + (p.active ? ' checked' : '') + '> 고객 화면에 공개</label></div></div><p class="err" id="pp-e" hidden></p><div class="fa"><button class="btn btn-fill" type="submit">저장</button>' + (isNew ? '' : '<button class="btn btn-ghost" type="button" data-act="ppDel" data-id="' + id + '">삭제</button>') + '</div></form>') });
  }
  G.SUB.ppSave = function (fm) {
    var id = fm.dataset.id, n = val('pp-n'); if (!n) { var e = $('pp-e'); e.textContent = '이름을 적어 주세요.'; e.hidden = false; return; }
    var o = { kind: val('pp-k'), name: n, cat: val('pp-c'), pets: Array.prototype.map.call(document.querySelectorAll('[name=pp-pet]:checked'), function (x) { return x.value; }), price: +val('pp-p') || 0, priceNote: val('pp-pn'),
      opts: val('pp-o').split('\n').map(function (l) { var i = l.indexOf(':'); if (i < 0) return null; return { n: l.slice(0, i).trim(), v: l.slice(i + 1).split(',').map(function (x) { return x.trim(); }).filter(Boolean) }; }).filter(function (x) { return x && x.n && x.v.length; }),
      req: val('pp-r').split(',').map(function (x) { return x.trim(); }).filter(Boolean), lead: val('pp-l'), stock: +val('pp-s') || 0, partner: val('pp-pt'), desc: val('pp-d'), notice: val('pp-x'), active: $('pp-a').checked };
    var im = $('pp-img'); if (im && im.files && im.files[0]) o.img = URL.createObjectURL(im.files[0]);
    if (id === 'new') { o.id = (o.kind === '판매' ? 'PT' : 'PC') + (T().petProducts.length + 1) + Date.now() % 10; T().petProducts.push(o); } else Object.assign(byId(T().petProducts, id), o);
    G.log('반려동물 물품 저장: ' + n); done('저장했어요.', 'admin-petshop');
  };
  G.ACT.ppDel = function (el) { if (T().petOrders.some(function (o) { return o.prod === el.dataset.id && ['완료', '취소'].indexOf(o.st) < 0; })) return G.toast('진행 중인 주문이 있어 삭제할 수 없어요. 대신 숨겨 주세요.'); T().petProducts = T().petProducts.filter(function (p) { return p.id !== el.dataset.id; }); G.log('반려동물 물품 삭제: ' + el.dataset.id); done('삭제했어요.', 'admin-petshop'); };
  function orderAdmin(id) {
    var o = byId(T().petOrders, id); if (!o) return shopAdmin();
    var p = byId(T().petProducts, o.prod) || {}, flow = PET_ST[o.kind] || PET_ST['판매'];
    var info = [['상품', p.name], ['회원', nm(o.user)], ['반려동물', o.pet || '-'], ['수량', o.qty], ['옵션', Object.keys(o.opts || {}).map(function (k) { return k + ' ' + o.opts[k]; }).join(', ') || '-']].concat(Object.keys(o.req || {}).map(function (k) { return [k, o.req[k]]; })).concat([['요청 사항', o.note || '-'], ['참고 사진', (o.photos || []).join(', ') || '-'], ['받는 방법', o.how + (o.hub ? ' · ' + ((G.hub(o.hub) || {}).name || '') : '')]].concat(o.ship ? [['받는 분', o.ship.name + ' · ' + o.ship.phone], ['배송지', G.shipText(o.ship)], ['배송 메모', o.ship.memo || '-']] : o.addr ? [['배송지', o.addr]] : []));
    return A({ title: '주문 ' + id, heading: '주문 ' + id, sub: o.kind + ' · ' + o.at, html: '<p class="mb"><a class="lnk" href="#admin-petshop">' + ico('arrow-left', 16) + ' 반려동물 물품</a></p><div class="ag"><div>' +
      card('주문 내용', '<ol class="stp">' + flow.map(function (s0, i) { var cur = flow.indexOf(o.st); return '<li class="' + (i < cur ? 'done' : i === cur ? 'cur' : '') + '"><span class="stp-n">' + (i < cur ? ico('check', 14) : i + 1) + '</span><span class="stp-t">' + s0 + '</span></li>'; }).join('') + '</ol><dl class="sum mt">' + info.map(function (x) { return '<div class="kv"><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>') +
      card('처리 이력', '<ol class="hist">' + o.hist.slice().reverse().map(function (h) { return '<li><span class="hd-t"><span class="tag">' + esc(h[0]) + '</span><time>' + esc(h[1]) + '</time>' + (h[2] ? '<em>' + esc(h[2]) + '</em>' : '') + '</span></li>'; }).join('') + '</ol>') + '</div><div>' +
      card('처리 (나중에 채워도 돼요)', '<form class="form" data-sub="poAdm" data-id="' + id + '" novalidate>' + fg('pa-st', '상태', sel('pa-st', flow.concat(['취소']), o.st)) + (o.kind === '주문제작' ? fg('pa-t', '확정 금액 (원)', inp('pa-t', o.total || '', '치수·시안 확인 후', 'number')) : '') + fg('pa-e', o.kind === '주문제작' ? '제작 완료 예정일' : '발송·수령 예정일', inp('pa-e', o.eta, '', 'date')) + fg('pa-k', '송장 번호 · 수령 안내', inp('pa-k', o.track, '예: CJ 1234-5678 / 거점 보관함 3번')) + fg('pa-m', '고객 안내 메시지', '<textarea id="pa-m" rows="2">' + esc(o.msg || '') + '</textarea>') + fg('pa-i', '내부 메모 (고객 비공개)', '<textarea id="pa-i" rows="2">' + esc(o.memo || '') + '</textarea>') + '<p class="err" id="pa-er" hidden></p><button class="btn btn-fill btn-sm" type="submit">저장하고 고객에게 알리기</button></form>') + '</div></div>' });
  }
  G.SUB.poAdm = function (fm) {
    var o = byId(T().petOrders, fm.dataset.id), st = val('pa-st'), tot = +val('pa-t') || o.total, e = $('pa-er');
    if (o.kind === '주문제작' && st === '치수·시안 확인' && !tot) { e.textContent = '고객에게 승인을 받으려면 확정 금액을 적어 주세요.'; e.hidden = false; return; }
    if (o.kind === '주문제작' && (PET_ST['주문제작'].indexOf(st) >= 3) && PET_ST['주문제작'].indexOf(o.st) < 2) { e.textContent = '고객 승인·결제 전에는 제작을 시작할 수 없어요.'; e.hidden = false; return; }
    if (o.kind === '주문제작') o.total = tot; o.eta = val('pa-e'); o.track = val('pa-k'); o.msg = val('pa-m'); o.memo = val('pa-i');
    if (st !== o.st) { o.st = st; o.hist.push([st, G.now(), me().loginId]); }
    G.notify(o.user, '[더가넷] 반려동물 물품 주문(' + o.id + ') ' + o.st + (o.kind === '주문제작' && o.st === '치수·시안 확인' ? ' · 확정 금액 ' + G.fmt(o.total) + ', 마이페이지에서 승인해 주세요.' : '') + (o.msg ? ' · ' + o.msg : ''));
    G.log('반려동물 주문 처리: ' + o.id + ' → ' + o.st); done('저장하고 고객에게 알렸어요.');
  };
})();
