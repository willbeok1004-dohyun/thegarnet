/* 반려동물 성장 기록책 · 택배 배송지 연결(공동구매·신청서) */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES, T = function () { return S.st; }, f = G.feat;
  var byId = function (arr, id) { return (arr || []).filter(function (x) { return String(x.id) === String(id); })[0]; };
  var $ = function (id) { return document.getElementById(id); };
  var val = function (id) { var e = $(id); return e ? String(e.value || '').trim() : ''; };
  var uid = function () { return S.user ? S.user.id : ''; };
  var fg = function (id, label, input, cls) { return '<div class="fg' + (cls ? ' ' + cls : '') + '"><label class="lb" for="' + id + '">' + label + '</label>' + input + '</div>'; };
  var sel = function (id, opts, cur, attr) { return '<select id="' + id + '"' + (attr || '') + '>' + opts.map(function (o) { o = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(o[0]) + '"' + (String(cur) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; };
  var inp = function (id, v, ph, type) { return '<input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(v == null ? '' : v) + '" placeholder="' + esc(ph || '') + '">'; };
  var done = function (msg, to) { G.save(); G.toast(msg); if (to) G.go(to); else G.rerender(); };
  var dot = function (d) { return String(d || '').replace(/-/g, '.'); };

  /* ---------- 단계 스위치: 5단계에 '성장 기록책' ---------- */
  var s5 = G.STAGES.filter(function (s) { return s.id === 's5'; })[0];
  if (s5 && !s5.items.some(function (i) { return i[0] === 'petBook'; })) s5.items.push(['petBook', '반려동물 성장 기록책 (인쇄·다운로드·제본)']);

  var TYPES = [['태어난 날', 'star'], ['집에 온 날', 'home'], ['첫 만남', 'heart'], ['첫 산책', 'leaf'], ['생일', 'gift'], ['몸무게', 'chart'], ['성장 모습', 'eye'], ['일상', 'calendar'], ['여행·나들이', 'pin'], ['아팠을 때', 'info'], ['병원·건강검진', 'shield'], ['마지막 모습', 'heart'], ['하늘나라 편지', 'mail']];
  var tIco = function (t) { return (TYPES.filter(function (x) { return x[0] === t; })[0] || ['', 'star'])[1]; };
  var THEMES = { garnet: ['가넷', '#6b3242', '#f3e6e8'], sage: ['세이지', '#4f6b55', '#e7efe8'], sky: ['스카이', '#3b5a74', '#e4ebf1'], mono: ['모노', '#352f2b', '#efebe5'] };

  function ensure() {
    var t = T(); if (!t) return;
    if (!t.petbook) t.petbook = { PET1: { entries: [
      { id: 'E1', date: '2022-04-10', type: '태어난 날', title: '나비가 태어났어요', text: '보호소 선생님 말로는 봄비가 오던 날 태어났대요. 정확한 날짜는 추정이에요.', photos: [], weight: '' },
      { id: 'E2', date: '2022-06-18', type: '집에 온 날', title: '우리 집에 온 날', text: '작은 상자 속에서 한참을 나오지 않다가, 밤이 되어서야 소파 밑에서 고개를 내밀었어요.', photos: [], weight: '0.9' },
      { id: 'E3', date: '2022-06-20', type: '첫 만남', title: '할머니와 첫 만남', text: '할머니 무릎 위에서 처음으로 골골송을 불렀어요.', photos: [], weight: '' },
      { id: 'E4', date: '2022-10-02', type: '몸무게', title: '2.5kg 돌파', text: '사료를 바꾸고 쑥쑥 컸어요.', photos: [], weight: '2.5' },
      { id: 'E5', date: '2023-04-10', type: '생일', title: '첫 번째 생일', text: '닭가슴살 케이크를 반쯤 먹고 낮잠을 잤어요.', photos: [], weight: '3.8' },
      { id: 'E6', date: '2024-01-15', type: '아팠을 때', title: '감기로 고생한 겨울', text: '재채기를 많이 해서 병원에 다녀왔어요. 일주일 약을 먹고 나았어요.', photos: [], weight: '3.9' },
      { id: 'E7', date: '2025-05-03', type: '성장 모습', title: '창가 자리 주인', text: '이제는 아침마다 창가에서 새를 구경하는 게 일과예요.', photos: [], weight: '4.1' },
      { id: 'E8', date: '2026-09-20', type: '일상', title: '돌봄 매니저와 친해졌어요', text: '출장 간 동안 오*진 매니저님이 와 주셨어요. 사진을 보내 주셔서 마음이 놓였어요.', photos: [], weight: '4.2' }
    ], books: [{ id: 'BK1', title: '나비의 첫 4년', sub: '2022 – 2026', from: '2022-04-01', to: '2026-10-31', mode: 'grow', theme: 'garnet', layout: 1, chart: true, toc: true, cover: '', st: '정리 중', at: '2026-10-28' }] } };
    /* 시연 계정(u1)에도 예시 반려동물 · 기록 · 책을 한 번만 넣어 둔다 */
    if (t.pets && !t.pets.u1 && !t.petbook.PET2) {
      t.pets.u1 = [{ id: 'PET2', name: '보리', type: '강아지', breed: '말티즈', age: '3살', weight: '4.6', neck: '', chest: '', back: '', care: '천둥소리를 무서워해요.', birth: '2023-03-05', birthGuess: false, home: '2023-05-20' }];
      t.petbook.PET2 = { entries: [
        { id: 'E1', date: '2023-03-05', type: '태어난 날', title: '보리가 태어났어요', text: '다섯 남매 중 막내로 태어났어요.', photos: [], weight: '' },
        { id: 'E2', date: '2023-05-20', type: '집에 온 날', title: '우리 집에 온 날', text: '처음 현관을 들어서며 꼬리를 힘껏 흔들었어요.', photos: [], weight: '1.2' },
        { id: 'E3', date: '2023-06-03', type: '첫 산책', title: '첫 산책', text: '풀냄새에 놀라 한참을 서 있다가 용기를 냈어요.', photos: [], weight: '1.8' },
        { id: 'E4', date: '2024-03-05', type: '생일', title: '첫 번째 생일', text: '가족이 모여 노래를 불러 줬어요.', photos: [], weight: '4.1' },
        { id: 'E5', date: '2026-03-05', type: '생일', title: '세 번째 생일', text: '이제는 의젓한 형아가 되었어요.', photos: [], weight: '4.6' }
      ], books: [] };
    }
    var pp = t.petProducts; if (pp && !byId(pp, 'PC06')) pp.push({ id: 'PC06', kind: '주문제작', cat: '기념·메모리얼', name: '성장 기록책 인쇄·제본', pets: (t.petTypes || ['강아지', '고양이']).slice(), price: 25000, priceNote: '부터 · 페이지 수·표지에 따라 확정', opts: [{ n: '표지', v: ['소프트커버', '하드커버'] }, { n: '크기', v: ['A5', 'B5'] }], req: ['책 제목', '페이지 수'], lead: '확정 후 7일', stock: 0, partner: 'P3', active: true, desc: '성장 기록책을 종이책으로 인쇄·제본해 보내 드려요. 마이페이지 \'성장 기록책\'에서 바로 주문할 수 있어요.', notice: '사진 해상도가 낮으면 인쇄 전에 알려 드려요.' });
  }
  ensure();
  var oReset = G.reset; G.reset = function () { oReset(); ensure(); G.save(); };
  var oApply = G.stageApply; G.stageApply = function () { oApply(); ensure(); };
  var pb = function (pid) { var b = T().petbook; return b[pid] || (b[pid] = { entries: [], books: [] }); };
  var myPet = function (pid) { return byId(T().pets[uid()] || [], pid); };

  /* ---------- 사진 줄이기 · 저장 공간 확인 ---------- */
  function shrink(file, cb) {
    var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var m = 900, w = im.width, h = im.height, k = Math.min(1, m / Math.max(w, h)), c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', 0.72)); }; im.onerror = function () { cb(''); }; im.src = r.result; }; r.onerror = function () { cb(''); }; r.readAsDataURL(file);
  }
  function roomLeft() { try { return 4.6e6 - JSON.stringify(S).length; } catch (e) { return 0; } }

  /* ---------- 마이페이지 연결 ---------- */
  var oNav = G.myNavExtra;
  G.myNavExtra = function () { var n = oNav ? oNav() : []; if (f('petBook')) { var i = -1; n.forEach(function (x, k) { if (x[0] === 'pets') i = k; }); n.splice(i >= 0 ? i + 1 : n.length, 0, ['petbook', '성장 기록책', 'file']); } return n; };
  var oPets = G.myPages.pets;
  G.myPages.pets = function (a) {
    var o = oPets(a); if (f('petBook') && o.html) o.html = o.html.replace(/<button class="btn btn-ghost btn-sm" data-act="petEdit" data-id="(PET\d+)">고치기<\/button>/g, '<a class="btn btn-line btn-sm" href="#my-petbook-$1">' + ico('file', 14) + ' 성장 기록책</a><button class="btn btn-ghost btn-sm" data-act="petEdit" data-id="$1">고치기</button>');
    return o;
  };
  G.myPages.petbook = function (arg) {
    if (!f('petBook')) return G.myShell('petbook', '성장 기록책', G.empty('아직 열지 않은 서비스예요.'));
    var pets = T().pets[uid()] || [], pid = arg && arg !== 'petbook' ? arg : (pets[0] || {}).id;
    if (!pets.length) return G.myShell('petbook', '성장 기록책', G.empty('먼저 반려동물을 등록해 주세요.', '<a class="btn btn-fill btn-sm" href="#my-pets">우리 반려동물 등록</a>'));
    var pet = myPet(pid) || pets[0]; return editor(pet);
  };

  /* ---------- 기록 편집 화면 ---------- */
  var editing = '', pending = [];
  function chart(entries, color) {
    var pts = entries.filter(function (e) { return +e.weight > 0; }).sort(function (a, b) { return a.date > b.date ? 1 : -1; });
    if (pts.length < 2) return '<p class="small">몸무게를 두 번 이상 적으면 성장 그래프가 그려져요.</p>';
    var W = 560, H = 200, pad = 34, t0 = Date.parse(pts[0].date), t1 = Date.parse(pts[pts.length - 1].date), mx = Math.max.apply(null, pts.map(function (p) { return +p.weight; })) * 1.15;
    var X = function (d) { return pad + (Date.parse(d) - t0) / Math.max(1, t1 - t0) * (W - pad * 2); }, Y = function (w) { return H - pad - (+w) / mx * (H - pad * 2); };
    var path = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p.date).toFixed(1) + ' ' + Y(p.weight).toFixed(1); }).join(' ');
    return '<svg class="bk-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="몸무게 변화 그래프"><line x1="' + pad + '" y1="' + (H - pad) + '" x2="' + (W - pad) + '" y2="' + (H - pad) + '" stroke="#d9cfc4"/><path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="2.5"/>' +
      pts.map(function (p) { return '<circle cx="' + X(p.date).toFixed(1) + '" cy="' + Y(p.weight).toFixed(1) + '" r="4" fill="' + color + '"/><text x="' + X(p.date).toFixed(1) + '" y="' + (Y(p.weight) - 10).toFixed(1) + '" text-anchor="middle" font-size="11" fill="#352f2b">' + p.weight + 'kg</text><text x="' + X(p.date).toFixed(1) + '" y="' + (H - pad + 16) + '" text-anchor="middle" font-size="10" fill="#8a7f75">' + p.date.slice(2, 7).replace('-', '.') + '</text>'; }).join('') + '</svg>';
  }
  function editor(pet) {
    var b = pb(pet.id), es = b.entries.slice().sort(function (a, c) { return a.date > c.date ? 1 : -1; }), e = editing ? byId(b.entries, editing) || {} : {};
    var photos = b.entries.reduce(function (s0, x) { return s0 + (x.photos || []).length; }, 0), since = pet.home || pet.birth || (es[0] || {}).date;
    var years = {}; es.forEach(function (x) { (years[x.date.slice(0, 4)] = years[x.date.slice(0, 4)] || []).push(x); });
    var tl = Object.keys(years).map(function (y) { return '<h3 class="pb-y">' + y + '</h3><ol class="pb-tl">' + years[y].map(function (x) { return '<li><div class="pb-d"><b>' + x.date.slice(5).replace('-', '.') + '</b><span class="bd bd-pm">' + ico(tIco(x.type), 12) + ' ' + esc(x.type) + '</span></div><div class="pb-c"><h4>' + esc(x.title || x.type) + (x.weight ? ' <small>' + esc(x.weight) + 'kg</small>' : '') + '</h4>' + (x.text ? '<p>' + G.nl(x.text) + '</p>' : '') + ((x.photos || []).length ? '<div class="pb-ph">' + x.photos.map(function (src) { return '<img src="' + src + '" alt="">'; }).join('') + '</div>' : '') + '<div class="inl"><button class="btn btn-ghost btn-sm" data-act="pbEdit" data-id="' + x.id + '">고치기</button><button class="btn btn-ghost btn-sm" data-act="pbDel" data-id="' + x.id + '" data-pet="' + pet.id + '">지우기</button></div></div></li>'; }).join('') + '</ol>'; }).join('');
    var form = '<form class="card form pb-form" data-sub="pbSave" data-pet="' + pet.id + '" novalidate><h3>' + (editing ? '기록 고치기' : '새 기록 남기기') + '</h3><div class="fgrid">' +
      fg('pb-dt', '날짜 *', inp('pb-dt', e.date || SITE.today, '', 'date')) + fg('pb-tp', '어떤 순간인가요', sel('pb-tp', TYPES.map(function (t) { return t[0]; }), e.type || '일상')) +
      fg('pb-tt', '제목', inp('pb-tt', e.title, '예: 처음 산책 나간 날')) + fg('pb-w', '몸무게 (kg)', inp('pb-w', e.weight, '재었다면 적어 주세요', 'number')) +
      fg('pb-tx', '이야기', '<textarea id="pb-tx" rows="4" placeholder="그날의 모습, 했던 말, 기억하고 싶은 것을 적어요.">' + esc(e.text || '') + '</textarea>', 'full') +
      fg('pb-ph', '사진 (최대 4장)', '<input id="pb-ph" type="file" accept="image/*" multiple data-on="change:pbPhoto"><p class="hint-s" id="pb-phn">' + ((e.photos || []).length ? '지금 ' + e.photos.length + '장 · 새로 고르면 바뀌어요' : '휴대폰 사진은 자동으로 줄여서 저장해요.') + '</p>', 'full') +
      '</div><div class="fa"><button class="btn btn-fill" type="submit">' + (editing ? '고친 내용 저장' : '기록 저장') + '</button>' + (editing ? '<button class="btn btn-ghost" type="button" data-act="pbEdit" data-id="">취소</button>' : '') + '</div></form>';
    var books = b.books.map(function (k) { var n = pages(pet, b, k).length; return '<li><div><b>' + esc(k.title) + '</b> <span class="bd bd-' + (k.st === '완성' ? 'ok' : 'warn') + '">' + esc(k.st) + '</span><small>' + (k.mode === 'memorial' ? '추억 완성본' : '성장 기록') + ' · ' + dot(k.from) + ' ~ ' + dot(k.to) + ' · ' + n + '쪽 · ' + THEMES[k.theme][0] + '</small></div><div class="fa"><a class="btn btn-line btn-sm" href="#petbook-' + pet.id + '-' + k.id + '">미리보기·인쇄</a><button class="btn btn-line btn-sm" data-act="pbPdf" data-pet="' + pet.id + '" data-id="' + k.id + '">PDF 받기</button><button class="btn btn-ghost btn-sm" data-act="pbDown" data-pet="' + pet.id + '" data-id="' + k.id + '">웹 파일</button>' + (k.st !== '완성' ? '<button class="btn btn-ghost btn-sm" data-act="pbDone" data-pet="' + pet.id + '" data-id="' + k.id + '">완성하기</button>' : '') + (f('petShop') ? '<button class="btn btn-ghost btn-sm" data-act="pbOrder" data-pet="' + pet.id + '" data-id="' + k.id + '">제본 주문</button>' : '') + '<button class="btn btn-ghost btn-sm" data-act="pbBookDel" data-pet="' + pet.id + '" data-id="' + k.id + '">지우기</button></div></li>'; }).join('');
    var yrs = Object.keys(years);
    var make = '<form class="card form" data-sub="pbBook" data-pet="' + pet.id + '" novalidate><h3>' + ico('file', 18) + ' 책 만들기</h3><div class="fgrid">' +
      fg('bk-r', '기간', sel('bk-r', [['all', '처음부터 지금까지']].concat(yrs.map(function (y) { return ['y' + y, y + '년']; })).concat([['custom', '직접 고르기']]), 'all', ' data-on="change:bkRange"')) +
      fg('bk-m', '책 종류', sel('bk-m', [['grow', '성장 기록 (진행 중)'], ['memorial', '추억 완성본 (마지막 모습까지)']], 'grow')) +
      '<div class="fg" id="bk-cu" hidden><label class="lb" for="bk-f">시작</label>' + inp('bk-f', since, '', 'date') + '</div><div class="fg" id="bk-cu2" hidden><label class="lb" for="bk-t">끝</label>' + inp('bk-t', SITE.today, '', 'date') + '</div>' +
      fg('bk-ti', '책 제목', inp('bk-ti', pet.name + '와 함께한 날들', '')) + fg('bk-su', '부제', inp('bk-su', '', '예: 2022 – 2026, 우리 집 막내')) +
      fg('bk-th', '표지 색', sel('bk-th', Object.keys(THEMES).map(function (k) { return [k, THEMES[k][0]]; }), 'garnet')) + fg('bk-ly', '한 쪽에 담을 기록', sel('bk-ly', [['1', '1개 (사진 크게)'], ['2', '2개 (쪽수 줄이기)']], '1')) +
      '<div class="fg full"><label class="chk"><input type="checkbox" id="bk-ch" checked> 몸무게 성장 그래프 쪽 넣기</label><label class="chk"><input type="checkbox" id="bk-tc" checked> 차례 넣기</label></div></div><button class="btn btn-fill" type="submit">책으로 정리하기</button><p class="small">정리한 책은 계속 고칠 수 있고, [완성하기]를 누르면 그때 모습으로 고정돼요. 인쇄 창에서 \'PDF로 저장\'을 고르면 PDF 파일로도 받을 수 있어요.</p></form>';
    var tabs = (T().pets[uid()] || []).length > 1 ? '<div class="chips">' + T().pets[uid()].map(function (x) { return '<a class="chip' + (x.id === pet.id ? ' on' : '') + '" href="#my-petbook-' + x.id + '">' + esc(x.name) + '</a>'; }).join('') + '</div>' : '';
    var body = tabs + '<div class="pb-head card"><div><p class="kick">GROWTH BOOK</p><h3>' + esc(pet.name) + '의 성장 기록</h3><p class="small">' + esc([pet.type, pet.breed, pet.birth ? dot(pet.birth) + ' 생' + (pet.birthGuess ? '(추정)' : '') : '', pet.home ? dot(pet.home) + ' 우리 집에' : ''].filter(Boolean).join(' · ')) + '</p></div><div class="kpis k3"><div class="kpi"><span>기록</span><b>' + b.entries.length + '</b></div><div class="kpi"><span>사진</span><b>' + photos + '</b></div><div class="kpi"><span>함께한 날</span><b>' + (since ? G.dayDiff(since, SITE.today) + '일' : '-') + '</b></div></div></div>' +
      '<div class="ag2c pb-cols"><div>' + form + '<div class="card"><h3>' + ico('chart', 18) + ' 몸무게 변화</h3>' + chart(b.entries, THEMES.garnet[1]) + '</div>' + make + (books ? '<div class="card"><h3>' + ico('file', 18) + ' 만든 책</h3><ul class="mng">' + books + '</ul></div>' : '') + '</div><div class="card pb-list"><h3>' + ico('calendar', 18) + ' 함께한 시간</h3>' + (tl || G.empty('첫 기록을 남겨 보세요. 집에 온 날, 첫 산책, 생일처럼요.')) + '</div></div>';
    return G.myShell('petbook', '성장 기록책', body, '처음 집에 온 날부터 마지막 모습까지, 사진과 글로 남기고 책으로 엮어요.');
  }
  G.ACT.pbEdit = function (el) { editing = el.dataset.id; pending = []; G.rerender(); var f0 = document.querySelector('.pb-form'); if (f0 && editing) f0.scrollIntoView({ block: 'center' }); };
  G.ACT.pbDel = function (el) { var b = pb(el.dataset.pet); b.entries = b.entries.filter(function (x) { return x.id !== el.dataset.id; }); done('기록을 지웠어요.'); };
  G.INP.pbPhoto = function (el) {
    var fs = Array.prototype.slice.call(el.files || [], 0, 4), n = $('pb-phn'); pending = []; if (!fs.length) return;
    if (roomLeft() < 400000) { n.textContent = '시연 화면의 저장 공간이 거의 찼어요. 사진은 실제 서비스에서 서버에 저장해요.'; el.value = ''; return; }
    n.textContent = '사진을 줄이는 중…'; var left = fs.length;
    fs.forEach(function (fl, i) { shrink(fl, function (d) { if (d) pending[i] = d; if (--left === 0) { pending = pending.filter(Boolean); n.textContent = pending.length + '장 준비됐어요.'; } }); });
  };
  G.SUB.pbSave = function (fm) {
    var pid = fm.dataset.pet, b = pb(pid), d = val('pb-dt'); if (!d) return G.toast('날짜를 골라 주세요.'); if (d > SITE.today) return G.toast('미래 날짜는 고를 수 없어요.');
    var o = { date: d, type: val('pb-tp'), title: val('pb-tt'), weight: val('pb-w'), text: val('pb-tx') };
    if (!o.title && !o.text && !pending.length) return G.toast('제목이나 이야기, 사진 중 하나는 남겨 주세요.');
    if (pending.length) { if (roomLeft() < pending.join('').length + 50000) return G.toast('저장 공간이 부족해요. 사진 수를 줄여 주세요.'); o.photos = pending.slice(); }
    if (editing) Object.assign(byId(b.entries, editing), o); else { o.id = 'E' + Date.now() % 1000000; o.photos = o.photos || []; b.entries.push(o); }
    if (o.type === '몸무게' || o.weight) { var pet = myPet(pid); if (pet && o.weight && d >= (pet.wAt || '')) { pet.weight = o.weight; pet.wAt = d; } }
    editing = ''; pending = []; G.log('성장 기록 저장: ' + pid); done('기록을 남겼어요.');
  };
  G.INP.bkRange = function (el) { $('bk-cu').hidden = $('bk-cu2').hidden = el.value !== 'custom'; };
  G.SUB.pbBook = function (fm) {
    var pid = fm.dataset.pet, b = pb(pid), pet = myPet(pid), r = val('bk-r'), from, to;
    var es = b.entries.slice().sort(function (a, c) { return a.date > c.date ? 1 : -1; });
    if (r === 'all') { from = (es[0] || {}).date || SITE.today; to = SITE.today; } else if (r === 'custom') { from = val('bk-f'); to = val('bk-t'); } else { from = r.slice(1) + '-01-01'; to = r.slice(1) + '-12-31'; }
    if (!from || !to || from > to) return G.toast('기간을 다시 골라 주세요.');
    var mode = val('bk-m');
    if (mode === 'memorial' && !es.some(function (x) { return x.type === '마지막 모습' || x.type === '하늘나라 편지'; })) G.toast('추억 완성본은 \'마지막 모습\'이나 \'하늘나라 편지\' 기록을 넣으면 마지막 장이 채워져요.');
    var k = { id: 'BK' + Date.now() % 100000, title: val('bk-ti') || pet.name + '의 기록', sub: val('bk-su'), from: from, to: to, mode: mode, theme: val('bk-th'), layout: +val('bk-ly') || 1, chart: $('bk-ch').checked, toc: $('bk-tc').checked, cover: '', st: '정리 중', at: SITE.today };
    var withPh = es.filter(function (x) { return (x.photos || []).length && x.date >= from && x.date <= to; }); if (withPh.length) k.cover = withPh[0].id;
    b.books.unshift(k); G.log('성장 기록책 정리: ' + pid); done('책으로 정리했어요. 미리보기에서 확인하세요.', 'petbook-' + pid + '-' + k.id);
  };
  G.ACT.pbDone = function (el) { var b = pb(el.dataset.pet), k = byId(b.books, el.dataset.id); k.snap = JSON.parse(JSON.stringify(b.entries.filter(function (x) { return x.date >= k.from && x.date <= k.to; }))); k.st = '완성'; k.doneAt = SITE.today; G.log('성장 기록책 완성: ' + k.id); done('책을 완성했어요. 이제 이 모습으로 고정돼요.'); };
  G.ACT.pbBookDel = function (el) { var b = pb(el.dataset.pet); b.books = b.books.filter(function (x) { return x.id !== el.dataset.id; }); done('책을 지웠어요. 기록은 그대로 남아 있어요.'); };

  /* ---------- 책 페이지 만들기 ---------- */
  function pages(pet, b, k) {
    var th = THEMES[k.theme] || THEMES.garnet, es = (k.snap || b.entries.filter(function (x) { return x.date >= k.from && x.date <= k.to; })).slice().sort(function (a, c) { return a.date > c.date ? 1 : -1; });
    var cover = byId(es, k.cover) || es.filter(function (x) { return (x.photos || []).length; })[0];
    var art = function (t) { return '<div class="bk-art" style="background:' + th[2] + ';color:' + th[1] + '">' + ico(tIco(t), 44) + '</div>'; };
    var out = [];
    out.push('<section class="bk-page bk-cover" style="--bk:' + th[1] + ';--bk2:' + th[2] + '"><div class="bk-cv-in">' + (cover && cover.photos[0] ? '<img class="bk-cv-img" src="' + cover.photos[0] + '" alt="">' : art('star')) + '<h1>' + esc(k.title) + '</h1>' + (k.sub ? '<p class="bk-sub">' + esc(k.sub) + '</p>' : '') + '<p class="bk-who">' + esc(pet.name) + ' · ' + dot(k.from) + ' – ' + dot(k.to) + '</p></div><p class="bk-brand">THE GARNET · 성장 기록책</p></section>');
    out.push('<section class="bk-page" style="--bk:' + th[1] + ';--bk2:' + th[2] + '"><h2 class="bk-h">' + esc(pet.name) + '를 소개해요</h2><dl class="bk-prof">' + [['이름', pet.name], ['종류', [pet.type, pet.breed].filter(Boolean).join(' · ')], ['태어난 날', pet.birth ? dot(pet.birth) + (pet.birthGuess ? ' (추정)' : '') : '-'], ['우리 집에 온 날', pet.home ? dot(pet.home) : '-'], ['지금 몸무게', pet.weight ? pet.weight + 'kg' : '-'], ['성격', pet.care || '-']].map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl><p class="bk-note">기록 ' + es.length + '개 · 사진 ' + es.reduce(function (s0, x) { return s0 + (x.photos || []).length; }, 0) + '장</p></section>');
    if (k.toc) { var ys = {}; es.forEach(function (x) { ys[x.date.slice(0, 4)] = (ys[x.date.slice(0, 4)] || 0) + 1; }); out.push('<section class="bk-page" style="--bk:' + th[1] + ';--bk2:' + th[2] + '"><h2 class="bk-h">차례</h2><ol class="bk-toc">' + Object.keys(ys).map(function (y) { return '<li><span>' + y + '년의 기록</span><b>' + ys[y] + '개</b></li>'; }).join('') + (k.chart ? '<li><span>몸무게가 자란 모습</span></li>' : '') + (k.mode === 'memorial' ? '<li><span>함께해 줘서 고마워</span></li>' : '') + '</ol></section>'); }
    var lastY = '', main = es.filter(function (x) { return k.mode !== 'memorial' || (x.type !== '마지막 모습' && x.type !== '하늘나라 편지'); });
    var entryHtml = function (x) { var big = k.layout === 1; return '<article class="bk-e' + (big ? '' : ' sm') + '"><p class="bk-date">' + dot(x.date) + ' · ' + esc(x.type) + '</p><h3>' + esc(x.title || x.type) + (x.weight ? ' <small>' + esc(x.weight) + 'kg</small>' : '') + '</h3>' + ((x.photos || []).length ? '<div class="bk-imgs n' + Math.min(x.photos.length, big ? 4 : 2) + '">' + x.photos.slice(0, big ? 4 : 2).map(function (s0) { return '<img src="' + s0 + '" alt="">'; }).join('') + '</div>' : art(x.type)) + (x.text ? '<p class="bk-txt">' + G.nl(x.text) + '</p>' : '') + '</article>'; };
    for (var i = 0; i < main.length; i += k.layout) {
      var grp = main.slice(i, i + k.layout), y = grp[0].date.slice(0, 4), head = y !== lastY ? '<p class="bk-yr">' + y + '</p>' : ''; lastY = y;
      out.push('<section class="bk-page" style="--bk:' + th[1] + ';--bk2:' + th[2] + '">' + head + grp.map(entryHtml).join('') + '</section>');
    }
    if (k.chart) out.push('<section class="bk-page" style="--bk:' + th[1] + ';--bk2:' + th[2] + '"><h2 class="bk-h">몸무게가 자란 모습</h2>' + chart(es, th[1]) + '</section>');
    if (k.mode === 'memorial') { var last = es.filter(function (x) { return x.type === '마지막 모습' || x.type === '하늘나라 편지'; }); out.push('<section class="bk-page bk-end" style="--bk:' + th[1] + ';--bk2:' + th[2] + '"><h2 class="bk-h">함께해 줘서 고마워</h2>' + (last.length ? last.map(entryHtml).join('') : '<p class="bk-txt">' + esc(pet.name) + '와 함께한 모든 날이 선물이었어요.</p>') + '</section>'); }
    out.push('<section class="bk-page bk-back" style="--bk:' + th[1] + ';--bk2:' + th[2] + '"><p>' + esc(pet.name) + '와 함께한 ' + (pet.home || pet.birth ? G.dayDiff(pet.home || pet.birth, k.to < SITE.today ? k.to : SITE.today) + '일' : '시간') + '</p><p class="bk-brand">THE GARNET · ' + (k.st === '완성' ? dot(k.doneAt) + ' 완성' : '정리 중') + '</p></section>');
    return out;
  }
  var BOOK_CSS = '.bk{display:flex;flex-direction:column;align-items:center;gap:22px;padding:24px 12px;background:#e9e4dc}.bk-page{width:148mm;min-height:210mm;background:#fffdf9;box-shadow:0 6px 24px rgba(0,0,0,.12);padding:16mm 14mm;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;font-family:"Noto Serif KR",serif;color:#352f2b;position:relative}' +
    '.bk-cover{background:var(--bk);color:#fff;justify-content:space-between}.bk-cv-in{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;margin-top:10mm}.bk-cv-img{width:100%;max-height:105mm;object-fit:cover;border-radius:6px}.bk-cover h1{font-weight:400;font-size:26px;line-height:1.35;margin:6px 0 0}.bk-sub{opacity:.85;margin:0}.bk-who{font-size:13px;opacity:.85;margin:0}.bk-brand{font-family:"Cormorant Garamond",serif;letter-spacing:.18em;font-size:11px;text-align:center;opacity:.8;margin:0}' +
    '.bk-h{font-weight:400;font-size:20px;color:var(--bk);border-bottom:1px solid var(--bk2);padding-bottom:8px;margin:0 0 6px}.bk-prof div{display:flex;gap:12px;padding:8px 0;border-bottom:1px dashed #e2d9ce}.bk-prof dt{width:30mm;color:#8a7f75;font-size:13px}.bk-prof dd{margin:0;font-size:14px}.bk-note{font-size:12px;color:#8a7f75;margin-top:auto}' +
    '.bk-toc{list-style:none;padding:0;margin:0}.bk-toc li{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed #e2d9ce}.bk-yr{font-family:"Cormorant Garamond",serif;font-size:30px;color:var(--bk);margin:0}.bk-e{display:flex;flex-direction:column;gap:8px;flex:1}.bk-e.sm{flex:none}.bk-date{font-size:11.5px;letter-spacing:.06em;color:var(--bk);margin:0}.bk-e h3{font-weight:400;font-size:18px;margin:0}.bk-e h3 small{font-size:12px;color:#8a7f75}' +
    '.bk-imgs{display:grid;gap:4px}.bk-imgs.n2,.bk-imgs.n4{grid-template-columns:1fr 1fr}.bk-imgs.n3{grid-template-columns:1fr 1fr 1fr}.bk-imgs img{width:100%;height:100%;max-height:95mm;object-fit:cover;border-radius:4px}.bk-e.sm .bk-imgs img{max-height:48mm}.bk-art{height:46mm;border-radius:6px;display:flex;align-items:center;justify-content:center}.bk-e.sm .bk-art{height:26mm}.bk-txt{font-size:13.5px;line-height:1.9;margin:0;white-space:normal}.bk-chart{width:100%;height:auto;margin-top:8mm}' +
    '.bk-back{justify-content:center;align-items:center;text-align:center;background:var(--bk2)}.bk-back p:first-child{font-size:18px;color:var(--bk)}' +
    '@media print{@page{size:148mm 210mm;margin:0}html,body{background:#fff!important}body *{visibility:hidden}.bk,.bk *{visibility:visible}.bk{position:absolute;left:0;top:0;padding:0;gap:0;background:#fff}.bk-page{box-shadow:none;page-break-after:always;break-after:page;width:148mm;height:210mm;min-height:0;overflow:hidden}.bk-bar,.dock,.toast{display:none!important}}' +
    '@media (max-width:640px){.bk-page{width:100%;min-height:0;aspect-ratio:148/210;padding:7% 6%}}';
  G.bookCss = BOOK_CSS;

  /* ---------- 미리보기·인쇄 (전체 화면) ---------- */
  P.petbook = function (arg) {
    var a = String(arg || '').split('-'), pet = myPet(a[0]), b = pet ? pb(pet.id) : null, k = b ? byId(b.books, a[1]) : null;
    if (!S.user || !f('petBook') || !k) return { title: '성장 기록책', html: G.pageHead('성장 기록책', '책을 찾을 수 없어요.', [['성장 기록책']]) + '<section class="sec sec-tight"><div class="wrap">' + G.empty('마이페이지에서 다시 열어 주세요.', '<a class="btn btn-line btn-sm" href="#my-petbook">성장 기록책으로</a>') + '</div></section>' };
    var pg = pages(pet, b, k);
    return { title: k.title, layout: 'bare', html: '<style>' + BOOK_CSS + '</style><div class="bk-bar"><a class="btn btn-ghost btn-sm" href="#my-petbook-' + pet.id + '">' + ico('arrow-left', 16) + ' 돌아가기</a><b>' + esc(k.title) + '</b><span class="small">' + pg.length + '쪽 · ' + esc(k.st) + '</span><button class="btn btn-fill btn-sm" data-act="pbPdf" data-pet="' + pet.id + '" data-id="' + k.id + '">' + ico('file', 16) + ' PDF 파일 받기</button><button class="btn btn-line btn-sm" data-act="pbPrint">' + ico('file', 16) + ' 인쇄하기</button><button class="btn btn-line btn-sm" data-act="pbDown" data-pet="' + pet.id + '" data-id="' + k.id + '">' + ico('upload', 16) + ' 웹 파일(HTML)</button>' + (f('petShop') ? '<button class="btn btn-line btn-sm" data-act="pbOrder" data-pet="' + pet.id + '" data-id="' + k.id + '">종이책 제본 주문</button>' : '') + '</div><div class="bk">' + pg.join('') + '</div>' + G.dockHtml() + '<div class="toast" id="toast" role="status" aria-live="polite"></div>' };
  };

  /* ---------- PDF 파일 만들기 (외부 도구 없이 쪽마다 그림으로 만들어 PDF로 묶어요) ---------- */
  var enc = new TextEncoder();
  function pdfFile(jp, title) {
    var W = 419.53, H = 595.28, parts = [], offs = [], len = 0, N = jp.length;
    var push = function (x) { var b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
    var obj = function (n, body) { offs[n] = len; push(n + ' 0 obj\n'); push(body); push('\nendobj\n'); };
    var hex = ''; for (var i = 0; i < title.length; i++) hex += ('0000' + title.charCodeAt(i).toString(16)).slice(-4);
    var info = 3 + N * 3, kids = []; for (i = 0; i < N; i++) kids.push((3 + i * 3) + ' 0 R');
    push('%PDF-1.4\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + N + ' >>');
    jp.forEach(function (j, i) {
      var pg = 3 + i * 3, ct = pg + 1, im = pg + 2, cs = 'q ' + W + ' 0 0 ' + H + ' 0 0 cm /Im0 Do Q';
      obj(pg, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /XObject << /Im0 ' + im + ' 0 R >> >> /Contents ' + ct + ' 0 R >>');
      obj(ct, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream');
      offs[im] = len; push(im + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + j.w + ' /Height ' + j.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + j.data.length + ' >>\nstream\n'); push(j.data); push('\nendstream\nendobj\n');
    });
    obj(info, '<< /Title <FEFF' + hex + '> /Producer (THE GARNET) >>');
    var xr = len, total = info + 1;
    push('xref\n0 ' + total + '\n0000000000 65535 f \n');
    for (i = 1; i < total; i++) push(('0000000000' + offs[i]).slice(-10) + ' 00000 n \n');
    push('trailer\n<< /Size ' + total + ' /Root 1 0 R /Info ' + info + ' 0 R >>\nstartxref\n' + xr + '\n%%EOF');
    return new Blob(parts, { type: 'application/pdf' });
  }
  function pageToJpeg(pageHtml, scale) {
    return new Promise(function (ok, no) {
      var box = document.createElement('div'); box.innerHTML = '<div class="bk">' + pageHtml + '</div>';
      var xml = new XMLSerializer().serializeToString(box.firstChild);
      var css = BOOK_CSS.replace(/]]>/g, '') + '.bk{display:block!important;padding:0!important;gap:0!important;background:#fff!important}.bk-page{box-shadow:none!important;width:148mm!important;height:210mm!important;min-height:0!important;aspect-ratio:auto!important;padding:16mm 14mm!important;overflow:hidden!important;margin:0!important}';
      var w = 560, h = 794, svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><style><![CDATA[' + css + ']]></style><foreignObject x="0" y="0" width="' + w + '" height="' + h + '">' + xml + '</foreignObject></svg>';
      var im = new Image(); im.onerror = function () { no(new Error('page image')); };
      im.onload = function () {
        try {
          var c = document.createElement('canvas'); c.width = Math.round(w * scale); c.height = Math.round(h * scale);
          var cx = c.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height); cx.drawImage(im, 0, 0, c.width, c.height);
          c.toBlob(function (bl) { if (!bl) return no(new Error('blob')); bl.arrayBuffer().then(function (ab) { ok({ data: new Uint8Array(ab), w: c.width, h: c.height }); }, no); }, 'image/jpeg', 0.9);
        } catch (e) { no(e); }
      };
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }
  var pdfBusy = false;
  G.ACT.pbPdf = function (el) {
    if (pdfBusy) return G.toast('PDF를 만드는 중이에요. 잠시만 기다려 주세요.');
    var pet = myPet(el.dataset.pet), b = pb(pet.id), k = byId(b.books, el.dataset.id), pg = pages(pet, b, k), out = [], i = 0;
    pdfBusy = true; G.toast('PDF를 만들고 있어요. 쪽이 많으면 조금 걸려요. (총 ' + pg.length + '쪽)');
    (function next() {
      if (i >= pg.length) {
        try {
          var bl = pdfFile(out, k.title), a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = (pet.name + '_' + k.title).replace(/[\\/:*?"<>|]/g, '') + '.pdf'; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
          G.toast('PDF 파일을 내려받았어요. (' + pg.length + '쪽 · A5)'); G.log('성장 기록책 PDF 저장: ' + k.id); G.save();
        } catch (e) { G.toast('PDF를 저장하지 못했어요. \'인쇄하기\'에서 PDF로 저장을 골라 주세요.'); }
        pdfBusy = false; return;
      }
      pageToJpeg(pg[i], 3).then(function (j) { out.push(j); i++; setTimeout(next, 0); }, function () { pdfBusy = false; G.toast('이 브라우저에서는 PDF를 만들 수 없어요. \'인쇄하기\'에서 PDF로 저장을 골라 주세요.'); });
    })();
  };
  G.ACT.pbPrint = function () { G.toast('인쇄 창을 열어요. 용지는 A5예요.'); setTimeout(function () { try { window.print(); } catch (e) { G.toast('이 화면에서는 인쇄 창을 열 수 없어요. \'PDF 파일 받기\'를 눌러 주세요.'); } }, 300); };
  G.ACT.pbDown = function (el) {
    var pet = myPet(el.dataset.pet), b = pb(pet.id), k = byId(b.books, el.dataset.id), pg = pages(pet, b, k);
    var html = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(k.title) + '</title><style>body{margin:0}.ic{display:inline-block}' + BOOK_CSS + '</style></head><body><div class="bk">' + pg.join('') + '</div><p style="text-align:center;font:13px sans-serif;color:#8a7f75;padding:16px">인쇄하려면 Ctrl+P (맥은 ⌘+P) · A5 용지</p></body></html>';
    try { var blob = new Blob([html], { type: 'text/html' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = pet.name + '_' + k.title.replace(/[\\/:*?"<>|]/g, '') + '.html'; document.body.appendChild(a); a.click(); a.remove(); G.toast('책 파일을 내려받았어요. 브라우저로 열어 인쇄할 수 있어요.'); } catch (e) { G.toast('다운로드할 수 없어요.'); }
    G.log('성장 기록책 다운로드: ' + k.id); G.save();
  };
  G.ACT.pbOrder = function (el) {
    var pet = myPet(el.dataset.pet), b = pb(pet.id), k = byId(b.books, el.dataset.id), n = pages(pet, b, k).length, prod = byId(T().petProducts, 'PC06');
    if (!prod || !prod.active) return G.toast('제본 주문은 아직 열리지 않았어요.');
    S.pbPending = { pet: pet.id, book: k.id, title: k.title, pages: n }; G.save(); G.go('pet-PC06');
  };
  /* 제본 상품 화면에 책 정보 미리 채우기 */
  var oPet = P.pet;
  P.pet = function (id) {
    var o = oPet(id), q = S.pbPending;
    if (id === 'PC06' && q && o.html) { var m0 = o.mount; o.mount = function () { if (m0) m0(); var a = $('po-r0'), c = $('po-r1'); if (a) a.value = q.title; if (c) c.value = q.pages + '쪽'; }; o.html = o.html.replace('<form data-sub="poSave"', '<p class="small pb-q">' + ico('file', 14) + ' "' + esc(q.title) + '" ' + q.pages + '쪽을 제본해요. 확정 금액은 표지·페이지 수를 보고 알려 드려요.</p><form data-sub="poSave"'); }
    return o;
  };

  /* ================= 택배 배송지: 공동구매 · 신청서 ================= */
  var oGb = P.groupbuy;
  P.groupbuy = function (a) {
    var o = oGb(a); if (!o.html || !S.user) return o;
    var def = (G.shipBook ? G.shipBook() : []).filter(function (x) { return x.def; })[0];
    o.html = o.html.replace(/(<select id="gh-(GB\d+)"[^>]*>)/g, '$1<option value="ship">택배로 받기' + (def ? ' (' + esc(def.label) + ')' : ' (배송지 등록 필요)') + '</option>');
    return o;
  };
  var oGbOrder = G.SUB.gbOrder;
  G.SUB.gbOrder = function (fm) {
    var id = fm.dataset.id;
    if (val('gh-' + id) !== 'ship') return oGbOrder(fm);
    if (!($('gc-' + id) || {}).checked) return G.toast('공급 예정일과 청약철회(7일) 안내를 확인해 주세요.');
    var def = G.shipBook().filter(function (x) { return x.def; })[0] || G.shipBook()[0]; if (!def) { G.toast('내 정보 → 배송지 관리에서 배송지를 먼저 저장해 주세요.'); return G.go('my-info'); }
    var g = byId(T().groupbuys, id), n = +val('gq-' + id) || 1; g.orders = g.orders.filter(function (x) { return x[0] !== uid(); }); g.orders.push([uid(), n, '', JSON.parse(JSON.stringify(def))]);
    G.notify(uid(), '[더가넷] 공동구매 "' + g.title + '" ' + n + '개 예약했어요. 택배: ' + G.shipText(def)); G.save(); G.toast('예약했어요. 기본 배송지로 보내 드려요.'); G.rerender();
  };
  var SHIP_SVC = ['S01', 'S05', 'S09', 'S13'];
  var oApplyP = P.apply;
  P.apply = function (id) {
    var o = oApplyP(id);
    if (id && o.html && S.user && SHIP_SVC.indexOf(id) >= 0 && S.drafts[id] && S.drafts[id].step === 1 && G.shipPicker) {
      var c = S.drafts[id].c;
      o.html = o.html.replace('<div class="fg"><label class="lb" for="c-budget">', '<div class="fg full ship-ap"><label class="chk"><input type="checkbox" data-on="change:apShip" data-id="' + id + '"' + (c.shipOn ? ' checked' : '') + '><span><b>택배로 받아요</b> · 상품·선물을 택배로 받을 배송지를 정해요 (방문 설치·현장 작업은 승인 뒤 따로 확인해요)</span></label><div id="ap-ship"' + (c.shipOn ? '' : ' hidden') + '>' + G.shipPicker('ap') + '</div></div><div class="fg"><label class="lb" for="c-budget">');
    }
    return o;
  };
  G.INP.apShip = function (el) { var d = S.drafts[el.dataset.id]; d.c.shipOn = el.checked; G.save(); var b = $('ap-ship'); if (b) b.hidden = !el.checked; };
  var oNext = G.ACT.anext;
  G.ACT.anext = function (el) {
    var id = el.dataset.id, d = S.drafts[id];
    if (d && d.step === 1 && d.c.shipOn && SHIP_SVC.indexOf(id) >= 0 && document.querySelector('[name=ap-sb]')) { var r = G.shipRead('ap'); if (!r.ok) return G.toast(r.msg); d.c.ship = r.x; G.save(); }
    oNext(el);
  };
  var oSubmit = G.ACT.asubmit;
  G.ACT.asubmit = function (el) {
    var id = el.dataset.id, d = S.drafts[id], ship = d && d.c.shipOn && SHIP_SVC.indexOf(id) >= 0 ? d.c.ship : null;
    var n = S.apps.length; oSubmit(el);
    if (S.apps.length > n && ship) { S.apps[0].ship = ship; S.apps[0].data['받는 방법'] = '택배'; G.save(); }
  };
  var oMy = P.my;
  P.my = function (arg) {
    var o = oMy(arg), a = arg && arg.indexOf('app-') === 0 ? G.app(arg.slice(4)) : null;
    if (a && a.ship && o.html) o.html = o.html.replace('<h4>진행 이력</h4>', '<h4>배송지</h4><p class="small">' + esc(a.ship.name) + ' · ' + esc(a.ship.phone) + '<br>' + esc(G.shipText(a.ship)) + (a.ship.memo ? ' · ' + esc(a.ship.memo) : '') + '</p><h4>진행 이력</h4>');
    return o;
  };
  var oAdmin = P.admin;
  P.admin = function (arg, r) {
    var o = oAdmin(arg, r), a = S.adminAuthed && arg && arg.indexOf('app-') === 0 ? G.app(arg.slice(4)) : null;
    if (a && a.ship && o && o.html) o.html = o.html.replace('<section class="ac "><h2>상태 변경</h2>', '<section class="ac "><h2>택배 배송지</h2><dl class="sum"><div class="kv"><dt>받는 분</dt><dd>' + esc(a.ship.name) + ' · ' + esc(a.ship.phone) + '</dd></div><div class="kv"><dt>주소</dt><dd>' + esc(G.shipText(a.ship)) + '</dd></div><div class="kv"><dt>메모</dt><dd>' + esc(a.ship.memo || '-') + '</dd></div></dl><p class="small">배송 업무 담당자만 보고, 배송이 끝나면 목록에서는 가려서 보여요.</p></section><section class="ac "><h2>상태 변경</h2>');
    if (S.adminAuthed && arg === 'groupbuy' && o && o.html) {
      var rows = []; T().groupbuys.forEach(function (g) { g.orders.forEach(function (x) { rows.push('<tr><td>' + esc(g.title) + '</td><td>' + esc(G.nbMember(x[0]).name) + '</td><td class="r">' + x[1] + '</td><td>' + (x[3] ? '택배 · ' + G.shipMask(x[3]) : esc((G.hub(x[2]) || {}).name || '거점')) + '</td></tr>'); }); });
      o.html += '<section class="ac "><h2>예약자 · 받는 방법</h2>' + (rows.length ? '<div class="tw"><table class="tbl"><thead><tr><th>상품</th><th>회원</th><th class="r">수량</th><th>받는 방법</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div>' : '<p class="small">예약이 없어요.</p>') + '<p class="small">목록에서는 받는 분·연락처·주소를 가려서 보여요. 송장 출력 때만 전체 주소를 열람하고 감사 로그에 남겨요.</p></section>';
    }
    return o;
  };

  /* ---------- 기본 상태: 모든 단계 스위치 ON · 모든 서비스 예약 가능 (한 번만 적용, 이후 관리자가 끈 것은 유지) ---------- */
  function allOn() {
    if (!S.st || S.st.allOnV === 1) return;
    G.STAGES.forEach(function (st) { st.items.forEach(function (i) { S.st.flags[i[0]] = true; }); });
    Object.keys(S.flags || {}).forEach(function (k) { S.flags[k].state = 'BOOKABLE'; });
    S.st.allOnV = 1;
    if (G.stageApply) G.stageApply();
    G.save();
  }
  var oReset2 = G.reset; G.reset = function () { oReset2(); allOn(); };
  allOn();
})();
