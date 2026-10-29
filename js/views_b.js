/* 고객 화면 B: 신청, 완료, 이용방법, 특별한 날, 멤버십, 고객센터, 인증, 약관 */
(function () {
  'use strict';
  var esc = G.esc, ico = G.ico, S = G.state, P = G.PAGES;

  /* ---------- 신청: 서비스 선택 ---------- */
  P.apply = function (id) {
    if (id) return applyForm(id);
    var list = G.visible();
    var html = G.pageHead('나에게 맞는 돌봄<br>신청하기', '신청할 서비스를 고르면 필요한 항목만 순서대로 안내해 드려요. 아직 신청이 열리지 않은 서비스는 상담 메모로 먼저 남길 수 있습니다.', [['돌봄 둘러보기', 'services'], ['서비스 신청']], 'APPLY') +
      '<section class="sec sec-tight"><div class="wrap"><div class="paths"><article><h3>서비스 신청서</h3><p>로그인 후 접수합니다. 운영자가 가능 범위와 비용을 확인해 안내하고, 승인하기 전에는 아무것도 진행되지 않아요.</p></article><article><h3>상담 메모</h3><p>가입 없이 이야기를 정리해 복사해 두는 기능입니다. 전송·저장되지 않고 예약도 확정되지 않아요.</p><a class="lnk" href="#memo">메모 먼저 써 보기 ' + ico('arrow-right', 16) + '</a></article></div>' +
      '<div class="pick">' + list.map(function (s) {
        var ok = G.bookable(s.id), st = G.flag(s.id).state;
        return '<a class="pk' + (ok ? '' : ' off') + '" href="#' + (ok ? 'apply-' : 'memo-') + s.id + '"><img src="img/' + s.id + '.jpg" alt="" loading="lazy"><div><b>' + esc(s.name) + '</b><span>' + esc(s.tag) + '</span></div><em>' + (ok ? '신청하기' : st === 'PAUSED' ? '일시 중지' : '상담 메모') + ico('arrow-right', 16) + '</em></a>';
      }).join('') + '</div></div></section>';
    return { title: '서비스 신청', html: html };
  };

  /* ---------- 신청서(동적) ---------- */
  var OVR = { 'S14|여행 지역': ['서울·경기', '강원', '충청', '전라', '경상', '제주'], 'S15|제휴기관': ['기관 확인 후 안내 (준비 중)'] };
  var DEP = { '출생정보': '출생정보 제공 동의' };
  function fopts(sid, f) { var k = sid + '|' + f[0]; if (OVR[k]) return OVR[k]; return f[3] && f[3].indexOf(' / ') > 0 ? f[3].split(' / ') : null; }
  function draft(id) { return S.drafts[id] || (S.drafts[id] = { v: {}, step: 0, c: { phone: '', time: '', budget: '', note: '', agree: false, share: false } }); }
  var STEPS = ['서비스 정보', '연락과 요청', '확인과 동의'];

  function fieldHtml(sid, f, i, d) {
    var label = f[0], type = f[1], req = f[2], hint = f[3], v = d.v[label], opts = fopts(sid, f), id = 'f' + i;
    var dep = DEP[label] ? ' data-dep="' + esc(DEP[label]) + '"' : '', hid = DEP[label] && !d.v[DEP[label]] ? ' hidden' : '';
    var badge = req === '필수' ? '<em class="req">필수</em>' : req === '조건부' ? '<em class="cond">해당 시</em>' : '<em class="opt">선택</em>';
    var inp = '', k = ' data-k="' + esc(label) + '" data-on="input:dr"';
    if (type === 'select' && opts) inp = '<select id="' + id + '"' + k + '><option value="">선택해 주세요</option>' + opts.map(function (o) { return '<option' + (v === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
    else if (type === 'radio' && opts) inp = '<div class="pills" role="radiogroup" aria-label="' + esc(label) + '">' + opts.map(function (o, j) { return '<label class="pill"><input type="radio" name="' + id + '" value="' + esc(o) + '"' + (v === o ? ' checked' : '') + k.replace('input:dr', 'change:dr') + '><span>' + esc(o) + '</span></label>'; }).join('') + '</div>';
    else if ((type === 'multi' || (type === 'checkbox' && opts)) && opts) inp = '<div class="pills">' + opts.map(function (o) { return '<label class="pill"><input type="checkbox" name="' + id + '" value="' + esc(o) + '"' + ((v || []).indexOf(o) >= 0 ? ' checked' : '') + k.replace('input:dr', 'change:drm') + '><span>' + esc(o) + '</span></label>'; }).join('') + '</div>';
    else if (type === 'checkbox') inp = '<label class="chk"><input type="checkbox" id="' + id + '"' + (v ? ' checked' : '') + k.replace('input:dr', 'change:drc') + '><span>' + esc(hint) + '</span></label>';
    else if (type === 'date') inp = '<input type="date" id="' + id + '" min="' + SITE.today + '" value="' + esc(v || '') + '"' + k + '>';
    else if (type === 'datetime') inp = '<input type="datetime-local" id="' + id + '" min="' + SITE.today + 'T00:00" value="' + esc(v || '') + '"' + k + '>';
    else if (type === 'number') { var m = /(\d+)\s*~\s*(\d+)/.exec(hint || ''), mn = m ? m[1] : 1, mx = m ? m[2] : 99, u = (/[^\d~\s]+$/.exec(hint || '') || [''])[0]; inp = '<div class="num"><button type="button" data-act="num" data-d="-1" aria-label="줄이기">' + ico('minus', 16) + '</button><input type="number" id="' + id + '" min="' + mn + '" max="' + mx + '" inputmode="numeric" value="' + esc(v || '') + '" placeholder="' + mn + '~' + mx + '"' + k + '><button type="button" data-act="num" data-d="1" aria-label="늘리기">' + ico('plus', 16) + '</button>' + (u && !/^\d/.test(u) ? '<span class="u">' + esc(u) + '</span>' : '') + '</div>'; }
    else if (type === 'address') inp = '<input type="text" id="' + id + '" placeholder="시·군·구까지만 입력 (예: 서울 마포구)" value="' + esc(v || '') + '"' + k + ' autocomplete="off">';
    else if (type === 'upload') inp = '<label class="upl">' + ico('upload', 18) + '<span id="' + id + 'n">' + (v && v.length ? esc(v.join(', ')) : '사진·파일 선택 (견적 단계에서 나중에 보내도 괜찮아요)') + '</span><input type="file" id="' + id + '" multiple accept="image/*,.pdf" data-k="' + esc(label) + '" data-on="change:drf"></label>';
    else if (type === 'tel') inp = '<input type="tel" id="' + id + '" inputmode="tel" placeholder="010-0000-0000" value="' + esc(v || '') + '"' + k + '>';
    else if (type === 'textarea') inp = '<textarea id="' + id + '" rows="3" placeholder="' + esc(hint || '') + '"' + k + '>' + esc(v || '') + '</textarea>';
    else inp = '<input type="text" id="' + id + '" placeholder="' + esc(hint || '') + '" value="' + esc(v || '') + '"' + k + '>';
    var sub = (type === 'select' || type === 'radio' || type === 'multi' || type === 'checkbox') ? '' : (hint && type !== 'text' && type !== 'textarea' ? '<p class="hint-s">' + esc(hint) + '</p>' : '');
    if (type === 'address') sub = '<p class="hint-s">상세 주소는 승인 이후 안내 단계에서 확인합니다. ' + (hint ? esc(hint) : '') + '</p>';
    if (DEP[label]) sub = '<p class="hint-s">연도·시간은 입력하지 않아요. 월·일만 적어 주세요.</p>';
    var lab = type === 'checkbox' && !opts ? '<span class="lb">' + esc(label) + ' ' + badge + '</span>' : '<label class="lb" for="' + id + '">' + esc(label) + ' ' + badge + '</label>';
    return '<div class="fg" data-label="' + esc(label) + '" data-req="' + (req === '필수' ? 1 : 0) + '" data-type="' + type + '"' + dep + hid + '>' + lab + inp + sub + '<p class="err" hidden></p></div>';
  }

  function applyForm(id) {
    var s = G.sv(id);
    if (!s || G.flag(id).state === 'HIDDEN') return P.notfound();
    var f = G.flag(id);
    if (f.state !== 'BOOKABLE') {
      return { title: s.name + ' 신청', html: G.pageHead(esc(s.name), '이 서비스는 아직 신청을 받지 않아요.', [['서비스 신청', 'apply'], [s.name]]) +
        '<section class="sec sec-tight"><div class="wrap narrow">' + G.empty('<strong>' + G.stateName(f.state) + '</strong> 상태입니다. 신청이 열리기 전에는 상담 메모로 궁금한 점을 정리해 두실 수 있어요.', '<div class="fa c"><a class="btn btn-fill" href="#memo-' + id + '">상담 메모 남기기</a><a class="btn btn-line" href="#svc-' + id + '">서비스 보기</a></div>') + '</div></section>' };
    }
    var d = draft(id), step = d.step, wf = s.wf;
    var main;
    if (step === 0) {
      main = '<h2 class="fh">' + esc(wf.view) + '</h2><p class="fh-s">' + esc(wf.headline) + ' 필요한 것부터 천천히 채워 주세요. <em class="req">필수</em> 표시만 꼭 입력하면 됩니다.</p><div class="fgrid">' + wf.fields.map(function (x, i) { return fieldHtml(id, x, i, d); }).join('') + '</div>';
    } else if (step === 1) {
      main = '<h2 class="fh">연락과 요청</h2><p class="fh-s">운영자가 확인한 뒤 이 연락처로 안내드려요. 승인하기 전에는 아무것도 진행되지 않습니다.</p><div class="fgrid">' +
        '<div class="fg"><label class="lb" for="c-phone">연락처 <em class="req">필수</em></label><input type="tel" id="c-phone" inputmode="tel" placeholder="010-0000-0000" value="' + esc(d.c.phone || (S.user ? S.user.phone : '')) + '" data-k="phone" data-on="input:drc2"><p class="err" hidden></p></div>' +
        '<div class="fg"><label class="lb" for="c-time">연락 가능 시간 <em class="opt">선택</em></label><select id="c-time" data-k="time" data-on="change:drc2"><option value="">선택 안 함</option>' + ['오전 (9~12시)', '오후 (12~18시)', '저녁 (18시 이후)', '시간 협의'].map(function (o) { return '<option' + (d.c.time === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></div>' +
        '<div class="fg"><label class="lb" for="c-budget">예산 <em class="opt">선택</em></label><input type="text" id="c-budget" placeholder="예: 10만원 이내" value="' + esc(d.c.budget) + '" data-k="budget" data-on="input:drc2"></div>' +
        '<div class="fg full"><label class="lb" for="c-note">요청 사항 <em class="req">필수</em> <small>(5~700자)</small></label><textarea id="c-note" rows="6" maxlength="700" placeholder="' + esc(s.hint) + '" data-k="note" data-on="input:drc2">' + esc(d.c.note) + '</textarea><p class="hint-s">주소 상세·출입 방법·비밀번호·주민등록번호 등 민감한 정보는 적지 마세요.</p><p class="err" hidden></p></div></div>';
    } else {
      var rows = wf.fields.filter(function (x) { var v = d.v[x[0]]; return v && (!v.length || v.length); }).map(function (x) { var v = d.v[x[0]]; return '<div class="kv"><dt>' + esc(x[0]) + '</dt><dd>' + esc(Array.isArray(v) ? v.join(', ') : v === true ? '확인함' : v) + '</dd></div>'; }).join('');
      var login = S.user ? '' : '<div class="callout warn">' + ico('lock', 20) + '<div><strong>접수하려면 로그인이 필요해요</strong><p>입력하신 내용은 그대로 남아 있어요. 로그인한 뒤 바로 이어서 접수할 수 있습니다.</p><div class="fa"><button class="btn btn-fill btn-sm" data-act="demoLogin" data-ret="apply-' + id + '">데모 계정으로 바로 입장</button><a class="btn btn-line btn-sm" href="#login" data-act="setRet" data-ret="apply-' + id + '">로그인 · 회원가입</a></div></div></div>';
      main = '<h2 class="fh">확인과 동의</h2><p class="fh-s">입력한 내용을 한 번 더 살펴보세요. 수정하려면 이전 단계로 돌아가면 됩니다.</p><dl class="sum">' + rows +
        '<div class="kv"><dt>연락처</dt><dd>' + esc(d.c.phone) + '</dd></div>' + (d.c.time ? '<div class="kv"><dt>연락 가능 시간</dt><dd>' + esc(d.c.time) + '</dd></div>' : '') + (d.c.budget ? '<div class="kv"><dt>예산</dt><dd>' + esc(d.c.budget) + '</dd></div>' : '') + '<div class="kv"><dt>요청 사항</dt><dd>' + G.nl(d.c.note) + '</dd></div></dl>' +
        '<div class="agree"><label class="chk"><input type="checkbox" id="ag1" data-on="change:ag"' + (d.c.agree ? ' checked' : '') + '><span><b>[필수]</b> 서비스 제공을 위한 개인정보 수집·이용에 동의합니다. (<a href="#privacy" target="_blank" rel="noopener">전문 보기</a>)</span></label><p class="err" id="agErr" hidden>필수 동의 항목을 체크해 주세요.</p>' +
        (s.op !== 'DIRECT' ? '<label class="chk"><input type="checkbox" id="ag2" data-on="change:ag2"' + (d.c.share ? ' checked' : '') + '><span><b>[선택]</b> 서비스 연계를 위해 협력업체·전문기관에 필요한 최소 정보(이름·연락처·요청 내용)를 제공하는 데 동의합니다. 동의하지 않으면 협력 연계가 필요한 진행이 제한될 수 있어요.</span></label>' : '') + '</div>' + login;
    }
    var nav = '<div class="fnav">' + (step > 0 ? '<button class="btn btn-line" data-act="astep" data-id="' + id + '" data-to="' + (step - 1) + '">' + ico('arrow-left', 18) + ' 이전</button>' : '<a class="btn btn-line" href="#svc-' + id + '">취소</a>') +
      (step < 2 ? '<button class="btn btn-fill" data-act="anext" data-id="' + id + '">다음 단계 ' + ico('arrow-right', 18) + '</button>' : '<button class="btn btn-fill" data-act="asubmit" data-id="' + id + '"' + (S.user ? '' : ' disabled') + '>신청서 제출하기</button>') + '</div>';
    var html = G.pageHead(esc(s.name) + ' 신청', null, [['서비스 신청', 'apply'], [s.name, 'svc-' + id], ['신청서']], 'APPLY').replace(/<p class="ph-s">.*?<\/p>/, '') +
      '<section class="sec sec-tight"><div class="wrap ap"><div class="ap-main">' + G.stepper(STEPS, step) + '<div class="card form" id="apForm">' + main + nav + '</div></div>' +
      '<aside class="ap-side"><div class="card side"><div class="side-ph"><img src="img/' + id + '.jpg" alt="' + esc(s.alt) + '"></div><h3>' + esc(s.name) + '</h3><p class="meta">' + G.opChip(s) + '</p>' +
      '<div class="callout"><div><strong>승인 전에는 비용이 청구되지 않아요</strong><p>접수 후 운영자가 범위·일정·비용을 안내하고, 고객님이 승인하신 뒤에 진행됩니다.</p></div></div>' +
      '<h4>이 서비스는 이렇게 진행돼요</h4><ol class="tl tl-s">' + wf.steps.map(function (x) { return '<li><span></span><b>' + esc(x) + '</b></li>'; }).join('') + '</ol>' +
      '<h4>비용 구성</h4><p class="small">' + esc(wf.price) + '</p><p class="small">' + esc(wf.rule) + '</p><a class="lnk" href="#svc-' + id + '">서비스 상세 보기 ' + ico('arrow-right', 16) + '</a></div></aside></div></section>';
    return { title: s.name + ' 신청', html: html };
  }

  /* 입력 핸들러 */
  function curId() { var r = G.parse(); return r.name === 'apply' ? r.arg : ''; }
  G.INP.dr = function (el) { var d = draft(curId()); d.v[el.dataset.k] = el.type === 'number' ? el.value : el.value; G.save(); };
  G.INP.drm = function (el) { var d = draft(curId()), k = el.dataset.k, a = d.v[k] || []; var i = a.indexOf(el.value); if (el.checked && i < 0) a.push(el.value); if (!el.checked && i >= 0) a.splice(i, 1); d.v[k] = a; G.save(); };
  G.INP.drc = function (el) {
    var d = draft(curId()), k = el.dataset.k; d.v[k] = el.checked; G.save();
    document.querySelectorAll('[data-dep="' + k + '"]').forEach(function (n) { n.hidden = !el.checked; });
  };
  G.INP.drf = function (el) { var d = draft(curId()), names = Array.prototype.map.call(el.files, function (f) { return f.name; }); d.v[el.dataset.k] = names; G.save(); var sp = document.getElementById(el.id + 'n'); if (sp) sp.textContent = names.length ? names.join(', ') : '사진·파일 선택 (견적 단계에서 나중에 보내도 괜찮아요)'; };
  G.INP.drc2 = function (el) { var d = draft(curId()); d.c[el.dataset.k] = el.value; G.save(); };
  G.INP.ag = function (el) { var d = draft(curId()); d.c.agree = el.checked; G.save(); document.getElementById('agErr').hidden = el.checked; };
  G.INP.ag2 = function (el) { var d = draft(curId()); d.c.share = el.checked; G.save(); };
  G.ACT.num = function (el) { var inp = el.parentNode.querySelector('input'); var v = parseInt(inp.value || '0', 10) + parseInt(el.dataset.d, 10); var mn = +inp.min, mx = +inp.max; if (v < mn) v = mn; if (v > mx) v = mx; inp.value = v; inp.dispatchEvent(new Event('input', { bubbles: true })); };

  function validate(id, step) {
    var s = G.sv(id), d = draft(id), first = null, ok = true;
    var err = function (node, msg) { var p = node.querySelector('.err'); if (p) { p.textContent = msg; p.hidden = false; } node.classList.add('bad'); if (!first) first = node; ok = false; };
    document.querySelectorAll('#apForm .fg').forEach(function (n) { n.classList.remove('bad'); var p = n.querySelector('.err'); if (p) p.hidden = true; });
    if (step === 0) {
      document.querySelectorAll('#apForm .fg[data-req="1"]').forEach(function (n) {
        if (n.dataset.type === 'upload' || n.hidden) return;
        var v = d.v[n.dataset.label]; var empty = v == null || v === '' || v === false || (Array.isArray(v) && !v.length);
        if (empty) err(n, n.dataset.type === 'checkbox' ? '확인이 필요한 항목이에요.' : '이 항목을 입력해 주세요.');
      });
    } else if (step === 1) {
      var ph = document.getElementById('c-phone').closest('.fg'), nt = document.getElementById('c-note').closest('.fg');
      if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test((d.c.phone || '').trim())) err(ph, '연락처를 010-0000-0000 형식으로 입력해 주세요.');
      if ((d.c.note || '').replace(/\s/g, '').length < 5) err(nt, '요청 사항을 5자 이상 적어 주세요.');
    }
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return ok;
  }
  G.ACT.anext = function (el) { var id = el.dataset.id, d = draft(id); if (!validate(id, d.step)) return; d.step++; G.rerender(); };
  G.ACT.astep = function (el) { var d = draft(el.dataset.id); d.step = +el.dataset.to; G.rerender(); };
  G.ACT.asubmit = function (el) {
    var id = el.dataset.id, d = draft(id), s = G.sv(id);
    if (!S.user) { G.toast('로그인 후 접수할 수 있어요.'); return; }
    if (!d.c.agree) { document.getElementById('agErr').hidden = false; return; }
    var data = {}, region = '', date = '', head = 1;
    s.wf.fields.forEach(function (x) { var v = d.v[x[0]]; if (v == null || v === '' || v === false || (Array.isArray(v) && !v.length)) return; data[x[0]] = Array.isArray(v) ? v.join(', ') : v === true ? '확인함' : v; if (x[1] === 'address' && !region) region = v; if ((x[1] === 'date' || x[1] === 'datetime') && !date) date = String(v).slice(0, 10); if (x[1] === 'number' && /인원|수/.test(x[0])) head = v; });
    var no = G.nextNo();
    S.apps.unshift({ no: no, user: S.user.id, svc: id, status: 'SUBMITTED', at: G.now(), region: region, date: date, time: d.c.time, phone: d.c.phone, budget: d.c.budget, headcount: head, data: data, note: d.c.note, quote: null, schedule: null, partner: null, share: d.c.share, hist: [['SUBMITTED', G.now(), '고객', '']] });
    delete S.drafts[id]; G.save(); G.go('done-' + no);
  };
  G.ACT.demoLogin = function (el) { S.user = { id: 'u1', name: '김도현', email: 'demo@thegarnet.example', phone: '010-0000-0000' }; G.save(); G.toast('데모 회원으로 입장했어요.'); var r = el.dataset.ret; if (r) G.go(r); else G.go('my'); G.render(false); };
  G.ACT.setRet = function (el) { S.ret = el.dataset.ret; G.save(); };

  /* ---------- 접수 완료 ---------- */
  P.done = function (no) {
    var a = G.app(no); if (!a) return P.notfound(); var s = G.sv(a.svc);
    return { title: '접수 완료', html: '<section class="done-page"><div class="wrap narrow"><div class="done-ic">' + ico('check', 32) + '</div><p class="kick c">RECEIVED</p><h1 class="h2 c">신청서를 받았어요.</h1><p class="lead c">운영자가 가능 범위와 일정, 비용을 확인한 뒤 연락처로 안내드릴게요.<br>고객님이 승인하기 전에는 서비스가 진행되거나 비용이 청구되지 않습니다.</p>' +
      '<div class="card done-card"><dl class="sum"><div class="kv"><dt>접수번호</dt><dd><b>' + a.no + '</b></dd></div><div class="kv"><dt>서비스</dt><dd>' + esc(s.name) + '</dd></div><div class="kv"><dt>접수 시각</dt><dd>' + a.at + '</dd></div><div class="kv"><dt>현재 상태</dt><dd>' + G.stBadge(a.status) + '</dd></div></dl>' +
      '<h3>이다음엔 이렇게 진행돼요</h3>' + progress(a) + '</div><div class="fa c"><a class="btn btn-fill" href="#my-app-' + a.no + '">신청 내역 보기</a><a class="btn btn-line" href="#home">홈으로</a></div></div></section>' };
  };
  function progress(a) {
    var order = PROGRESS_STEPS.map(function (x) { return x[0]; }), idx = order.indexOf(a.status);
    if (idx < 0) { var h = a.hist.map(function (x) { return x[0]; }).filter(function (x) { return order.indexOf(x) >= 0; }); idx = h.length ? order.indexOf(h[h.length - 1]) : 0; }
    return '<ol class="prog">' + PROGRESS_STEPS.map(function (x, i) { return '<li class="' + (i < idx ? 'done' : i === idx ? 'cur' : '') + '"><span>' + (i < idx ? ico('check', 12) : '') + '</span><b>' + x[1] + '</b></li>'; }).join('') + '</ol>';
  }
  G.progress = progress;

  /* ---------- 이용 방법 ---------- */
  P.guide = function () {
    var steps = [['회원가입·로그인', '이메일로 가입하고 로그인합니다. 상담 메모는 가입 없이도 쓸 수 있어요.'], ['서비스 선택·신청서 작성', '필요한 서비스를 고르고, 서비스별 항목을 입력합니다.'], ['운영자 검토·추가 문의', '가능한 범위를 확인하고, 필요하면 추가 정보를 요청합니다.'], ['범위·일정·비용 안내', '견적과 일정을 안내합니다. 이때까지 비용은 청구되지 않아요.'], ['고객 승인 후 진행', '승인한 범위 안에서만 진행합니다.'], ['완료 보고·후기', '완료 내용과 관리 방법을 정리해 드리고, 후기를 남길 수 있어요.']];
    var keys = [['선택형 서비스', '서비스 범위, 방식, 일정, 선호 사항을 고객님이 직접 선택합니다.'], ['사전 확인', '신청 접수 후 운영자가 가능 범위와 비용을 확인해 안내합니다.'], ['고객 승인', '구매·교체·배치·업체 연결 등은 승인 후에만 진행합니다.'], ['전문영역 분리', '의료행위, 여행상품 판매, 기부금 모집, 현장 작업 등은 자격·등록·보험을 갖춘 전문기관·업체와 협력합니다.'], ['투명한 비용', '서비스 비용, 재료비, 출장비, 제휴업체 비용, 취소·환불 기준을 신청 전에 안내합니다.'], ['개인정보 최소 수집', '서비스 제공에 꼭 필요한 정보만 수집합니다.']];
    return { title: '이용 방법', html: G.pageHead('처음이어도 괜찮아요,<br>이렇게 진행됩니다.', '접수부터 완료까지 여섯 단계로 확인하고, 매 단계에서 고객님이 결정합니다.', [['이용 방법']], 'HOW IT WORKS') +
      '<section class="sec sec-tight"><div class="wrap"><ol class="g6">' + steps.map(function (x, i) { return '<li><span>' + (i + 1) + '</span><h3>' + x[0] + '</h3><p>' + x[1] + '</p></li>'; }).join('') + '</ol>' +
      '<h2 class="h3 gap">신청 상태, 이렇게 읽어요</h2><div class="states">' + Object.keys(APP_STATUS).map(function (k) { var m = { SUBMITTED: '신청서를 받았어요.', REVIEWING: '운영자가 가능 범위를 확인하고 있어요.', NEED_INFO: '추가로 알려주실 내용이 있어요.', QUOTED: '견적을 산정했어요.', WAITING_APPROVAL: '고객님의 승인을 기다리고 있어요.', APPROVED: '승인하신 범위로 진행을 준비해요.', SCHEDULED: '일정이 확정되었어요.', IN_PROGRESS: '서비스가 진행 중이에요.', COMPLETED: '모든 진행이 끝났어요.', CANCEL_REQUESTED: '취소 요청을 확인하고 있어요.', CANCELLED: '취소되었어요.', REJECTED: '아쉽게도 진행하기 어려워요.', REFUNDING: '환불을 처리하고 있어요.', REFUNDED: '환불이 끝났어요.' }[k]; return '<div>' + G.stBadge(k) + '<span>' + m + '</span></div>'; }).join('') + '</div>' +
      '<h2 class="h3 gap">꼭 알아두세요</h2><div class="keys">' + keys.map(function (k) { return '<article><h3>' + k[0] + '</h3><p>' + k[1] + '</p></article>'; }).join('') + '</div>' +
      '<div class="fa c gap"><a class="btn btn-fill" href="#apply">서비스 신청하기</a><a class="btn btn-line" href="#memo">상담 메모 써 보기</a></div></div></section>' };
  };

  /* ---------- 특별한 날 ---------- */
  var GIFT = { '탄생상징 주얼리': 'S13', '꽃·디퓨저': 'S05', '의류': 'S07', '신발': 'S07', '수공예·포토북': 'S08' };
  P.special = function () {
    var html = G.pageHead('특별한 날,<br>특별하게.', '생일과 기념일에 맞춘 탄생상징 주얼리, 꽃, 수공예 선물을 연결합니다. 마음에 드는 방향만 골라 보세요.', [['특별한 날']], 'SPECIAL DAYS') +
      '<section class="sec sec-tight"><div class="wrap sp"><div class="card form"><h2 class="fh">나의 탄생 상징 찾기</h2><p class="fh-s">태어난 월과 일만 고르면 탄생석·탄생화·탄생목·별자리를 보여 드려요. 연도와 시간은 필요하지 않고, 어디에도 저장하지 않습니다.</p>' +
      '<div class="fgrid"><div class="fg"><label class="lb" for="bm">월</label><select id="bm" data-on="change:sym"><option value="">선택</option>' + Array.apply(null, Array(12)).map(function (_, i) { return '<option value="' + (i + 1) + '">' + (i + 1) + '월</option>'; }).join('') + '</select></div><div class="fg"><label class="lb" for="bd">일</label><select id="bd" data-on="change:sym"><option value="">선택</option>' + Array.apply(null, Array(31)).map(function (_, i) { return '<option value="' + (i + 1) + '">' + (i + 1) + '일</option>'; }).join('') + '</select></div></div>' +
      '<div class="sym" id="symOut" aria-live="polite"><p>월과 일을 모두 고르면 상징 정보가 나타나요.</p></div>' +
      '<hr class="sep"><h2 class="fh">선물 방향 고르기</h2><div class="fgrid"><div class="fg"><label class="lb" for="g-occ">기념일 종류</label><select id="g-occ">' + ['생일', '결혼기념일', '졸업·입학', '부모님 생신', '취업·승진', '나만의 특별한 날'].map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>' +
      '<div class="fg"><label class="lb" for="g-cat">선물 카테고리</label><select id="g-cat">' + Object.keys(GIFT).map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>' +
      '<div class="fg"><label class="lb" for="g-bud">예산</label><select id="g-bud">' + ['5만원 미만', '5~10만원', '10~20만원', '20만원 이상'].map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>' +
      '<div class="fg"><label class="lb" for="g-mk">제작 방식</label><select id="g-mk">' + ['제작 방법 비교', '자체 제작', '협력업체 제작', '혼합 제작'].map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>' +
      '<div class="fg full"><label class="lb" for="g-note">원하는 디자인·각인 <em class="opt">선택</em></label><textarea id="g-note" rows="2" placeholder="예: 가넷 목걸이, 생일 축하 각인"></textarea></div></div>' +
      '<div class="fa"><button class="btn btn-fill" data-act="gift">선물 조합 미리보기</button></div><div id="giftOut" aria-live="polite"></div></div>' +
      '<aside class="sp-side"><div class="card"><h3>이렇게 운영해요</h3><dl class="kvs"><div><dt>상품 공급</dt><dd>자체 제작 · 협력업체</dd></div><div><dt>고객 선택</dt><dd>기념일 · 예산 · 사이즈</dd></div><div><dt>최종 계약</dt><dd>시안 승인 후 결제</dd></div><div><dt>사후 관리</dt><dd>후기 · 수선 · 재구매</dd></div></dl></div>' +
      '<div class="card"><h3>알림 원칙</h3><p class="small">마케팅 알림은 별도로 수신 동의한 경우에만 보냅니다. 비밀 선물 주문은 선물 받는 분께 자동 알림을 보내지 않아요. 가족·선물 대상자 정보는 본인 동의 없이 저장하지 않습니다.</p></div>' +
      '<div class="sp-ph"><img src="img/S13.jpg" alt="리넨 천과 가넷색 샘플" loading="lazy"></div></aside></div></section>';
    return { title: '특별한 날', html: html };
  };
  G.INP.sym = function () {
    var m = +document.getElementById('bm').value, d = +document.getElementById('bd').value, o = document.getElementById('symOut'); if (!o) return;
    if (!m || !d) { o.innerHTML = '<p>월과 일을 모두 고르면 상징 정보가 나타나요.</p>'; return; }
    if (new Date(2024, m - 1, d).getMonth() !== m - 1) { o.innerHTML = '<p class="err">존재하지 않는 날짜예요. 다시 선택해 주세요.</p>'; return; }
    o.innerHTML = '<p class="sym-t">' + m + '월 ' + d + '일 기준</p><ul><li><span>탄생석</span><b>' + STONES[m - 1] + '</b></li><li><span>탄생화</span><b>' + FLOWERS[m - 1] + '</b></li><li><span>탄생목</span><b>' + TREES[m - 1] + '</b></li><li><span>별자리</span><b>' + zodiac(m, d) + '</b></li></ul><p class="small">월별 탄생화·탄생목은 더가넷의 큐레이션 예시이며 국가·전통마다 다를 수 있어요. 주문 전 소재·사이즈·시안을 확인합니다.</p>';
  };
  G.ACT.gift = function () {
    var cat = document.getElementById('g-cat').value, sid = GIFT[cat], s = G.sv(sid), occ = document.getElementById('g-occ').value, bud = document.getElementById('g-bud').value, mk = document.getElementById('g-mk').value;
    document.getElementById('giftOut').innerHTML = '<div class="gift"><img src="img/' + sid + '.jpg" alt=""><div><p class="kick">' + esc(occ) + ' · ' + esc(bud) + '</p><h3>' + esc(s.name) + '으로 시작해 보세요</h3><p>' + esc(cat) + ' 방향으로 ' + esc(mk) + ' 방식을 검토합니다. 사이즈·소재·시안은 주문 전에 반드시 다시 확인하며, 시안을 승인한 뒤에 결제합니다.</p><div class="fa"><a class="btn btn-fill btn-sm" href="#svc-' + sid + '">서비스 보기</a><a class="btn btn-line btn-sm" href="#' + (G.bookable(sid) ? 'apply-' : 'memo-') + sid + '">' + (G.bookable(sid) ? '신청하기' : '상담 메모 남기기') + '</a></div></div></div>';
  };

  /* ---------- 멤버십 ---------- */
  P.plans = function () {
    var html = G.pageHead('10단계 멤버십', '무료 등급부터 시작해요. 모든 등급에서 상품과 서비스를 건별로 이용할 수 있고, 상위 등급은 예약·관리의 편의를 더합니다.', [['멤버십']], 'MEMBERSHIP') +
      '<section class="sec sec-tight"><div class="wrap"><div class="plans">' + PLANS.map(function (p, i) {
        var on = S.plan === i;
        return '<article class="pl' + (on ? ' on' : '') + (i >= 8 ? ' hi' : '') + '"><p class="pl-n">등급 ' + (i + 1) + '</p><h3>' + p[0] + '</h3><p class="pl-p">' + (p[1] ? '<b>' + G.fmt(p[1]) + '</b><span>/월</span>' : '<b>무료</b>') + '</p><p class="pl-b">' + p[2] + '</p><button class="btn ' + (on ? 'btn-fill' : 'btn-line') + ' btn-sm btn-block" data-act="plan" data-i="' + i + '" aria-pressed="' + on + '">' + (on ? '선택한 등급' : '이 등급 미리보기') + '</button></article>';
      }).join('') + '</div><div class="callout warn">' + ico('info', 20) + '<div><strong>시범 가격입니다</strong><p>구독·해지·할인 금액은 시범 가격이며 실제 결제는 이루어지지 않아요. 할인 대상, 월 한도, 수수료 부담은 운영 정책 확정 후 안내합니다.</p></div></div></div></section>';
    return { title: '멤버십', html: html };
  };
  G.ACT.plan = function (el) { S.plan = +el.dataset.i; G.toast(PLANS[S.plan][0] + ' 등급을 선택했어요. (시연)'); G.rerender(); };

  /* ---------- 고객센터 ---------- */
  function tabs(cur) { return '<div class="tabs" role="tablist">' + [['faq', '자주 묻는 질문'], ['notices', '공지사항'], ['inquiry', '1:1 문의']].map(function (t) { return '<a role="tab" aria-selected="' + (t[0] === cur) + '" class="' + (t[0] === cur ? 'on' : '') + '" href="#' + t[0] + '">' + t[1] + '</a>'; }).join('') + '</div>'; }
  P.faq = function () {
    var cats = ['전체'].concat(S.faqs.reduce(function (a, f) { if (f.show && a.indexOf(f.cat) < 0) a.push(f.cat); return a; }, []));
    return { title: '자주 묻는 질문', html: G.pageHead('궁금하실 이야기', '서비스 준비 상태부터 이용 방식, 비용과 책임, 필요한 정보까지 안내합니다.', [['고객센터']], 'SUPPORT') + '<section class="sec sec-tight"><div class="wrap narrow2">' + tabs('faq') +
      '<div class="chips" role="group" aria-label="질문 분류">' + cats.map(function (c, i) { return '<button class="chip' + (i === 0 ? ' on' : '') + '" data-act="faqcat" data-v="' + c + '" aria-pressed="' + (i === 0) + '">' + c + '</button>'; }).join('') + '</div>' +
      '<div id="faqBox">' + G.faqList(S.faqs.filter(function (f) { return f.show; })) + '</div>' +
      '<div class="callout">' + ico('message', 20) + '<div><strong>찾는 답이 없으신가요?</strong><p>1:1 문의로 남겨 주시면 영업일 기준 1~2일 안에 답변드려요. 고객센터 ' + esc(SITE.phone) + '</p><a class="lnk" href="#inquiry">문의 남기기 ' + ico('arrow-right', 16) + '</a></div></div></div></section>' };
  };
  G.ACT.faqcat = function (el) {
    el.parentNode.querySelectorAll('.chip').forEach(function (c) { var on = c === el; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
    var v = el.dataset.v; document.getElementById('faqBox').innerHTML = G.faqList(S.faqs.filter(function (f) { return f.show && (v === '전체' || f.cat === v); }));
  };
  P.notices = function () {
    var l = S.notices.filter(function (n) { return !n.hidden; }).sort(function (a, b) { return (b.pinned - a.pinned) || (b.date > a.date ? 1 : -1); });
    return { title: '공지사항', html: G.pageHead('공지사항', '더가넷의 소식과 운영 안내를 전해 드려요.', [['고객센터', 'faq'], ['공지사항']], 'NOTICE') + '<section class="sec sec-tight"><div class="wrap narrow2">' + tabs('notices') + '<ul class="nl">' + l.map(function (n) { return '<li><a href="#notice-' + n.id + '">' + (n.pinned ? '<span class="bd bd-bad">공지</span>' : '') + '<span class="nt">' + esc(n.title) + '</span><time>' + n.date + '</time></a></li>'; }).join('') + '</ul></div></section>' };
  };
  P.notice = function (id) {
    var n = S.notices.filter(function (x) { return String(x.id) === id; })[0]; if (!n) return P.notfound();
    return { title: n.title, html: G.pageHead(esc(n.title), n.date, [['고객센터', 'faq'], ['공지사항', 'notices'], ['상세']], 'NOTICE') + '<section class="sec sec-tight"><div class="wrap narrow2"><article class="card prose">' + G.nl(n.body) + '</article><p class="fa"><a class="btn btn-line" href="#notices">' + ico('arrow-left', 18) + ' 목록으로</a></p></div></section>' };
  };
  P.inquiry = function () {
    var u = S.user, mine = S.inquiries.filter(function (q) { return u && q.user === u.id; });
    return { title: '1:1 문의', html: G.pageHead('1:1 문의', '궁금한 점을 남겨 주세요. 영업일 기준 1~2일 안에 답변드립니다.', [['고객센터', 'faq'], ['1:1 문의']], 'SUPPORT') + '<section class="sec sec-tight"><div class="wrap narrow2">' + tabs('inquiry') +
      '<form class="card form" data-sub="inquiry" novalidate><div class="fgrid"><div class="fg"><label class="lb" for="q-type">문의 유형</label><select id="q-type">' + ['서비스 이용', '가격·견적', '제작·배송', '취소·환불', '상품 하자·사고', '멤버십', '기타'].map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>' +
      '<div class="fg"><label class="lb" for="q-svc">연결 서비스 <em class="opt">선택</em></label><select id="q-svc"><option value="">공통 문의</option>' + SV.map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + '</option>'; }).join('') + '</select></div>' +
      '<div class="fg"><label class="lb" for="q-name">이름</label><input id="q-name" type="text" value="' + esc(u ? u.name : '') + '" autocomplete="name"><p class="err" hidden></p></div><div class="fg"><label class="lb" for="q-mail">이메일</label><input id="q-mail" type="email" value="' + esc(u ? u.email : '') + '" autocomplete="email"><p class="err" hidden></p></div>' +
      '<div class="fg full"><label class="lb" for="q-txt">문의 내용 <small>(10자 이상)</small></label><textarea id="q-txt" rows="6" placeholder="접수번호 등 비민감 정보 위주로 적어 주세요."></textarea><p class="err" hidden></p></div></div>' +
      '<label class="chk"><input type="checkbox" id="q-ag"><span><b>[필수]</b> 문의 응대를 위한 개인정보 수집·이용에 동의합니다.</span></label><p class="err" id="q-agE" hidden>동의가 필요해요.</p><div class="fa"><button class="btn btn-fill" type="submit">문의 접수하기</button></div></form>' +
      '<h2 class="h3 gap">나의 문의 내역</h2>' + (mine.length ? '<ul class="nl">' + mine.map(function (q) { return '<li class="q"><div><span class="bd bd-' + (q.status === '답변 완료' ? 'ok' : 'warn') + '">' + q.status + '</span><b>' + esc(q.type) + '</b><time>' + q.at + '</time></div><p>' + esc(q.text) + '</p>' + (q.answer ? '<p class="ans"><b>답변</b> ' + esc(q.answer) + '</p>' : '') + '</li>'; }).join('') + '</ul>' : G.empty(u ? '등록한 문의가 없습니다.' : '로그인하면 내가 남긴 문의와 답변을 이곳에서 볼 수 있어요.', u ? '' : '<a class="btn btn-line btn-sm" href="#login">로그인</a>')) + '</div></section>' };
  };
  G.SUB.inquiry = function (f) {
    var ok = true, set = function (id, msg) { var n = document.getElementById(id), p = n.parentNode.querySelector('.err'); if (msg) { p.textContent = msg; p.hidden = false; ok = false; } else p.hidden = true; };
    set('q-name', document.getElementById('q-name').value.trim() ? '' : '이름을 입력해 주세요.');
    set('q-mail', /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(document.getElementById('q-mail').value.trim()) ? '' : '이메일 형식을 확인해 주세요.');
    set('q-txt', document.getElementById('q-txt').value.replace(/\s/g, '').length >= 10 ? '' : '문의 내용을 10자 이상 적어 주세요.');
    var ag = document.getElementById('q-ag').checked; document.getElementById('q-agE').hidden = ag; if (!ag) ok = false;
    if (!ok) return;
    S.qseq++; S.inquiries.unshift({ id: 'Q-' + S.qseq, user: S.user ? S.user.id : 'guest', type: document.getElementById('q-type').value, svc: document.getElementById('q-svc').value, text: document.getElementById('q-txt').value.trim(), at: SITE.today, status: '접수', answer: '' });
    G.save(); G.toast('문의를 접수했어요. 답변은 이메일로 알려 드립니다.'); G.render(false);
  };

  /* ---------- 인증 ---------- */
  function authShell(title, sub, body) { return { title: title, html: '<section class="auth"><div class="auth-in"><div class="auth-ph"><img src="img/hero.jpg" alt=""><div><p class="kick">THE GARNET</p><h2>천천히, 나의 속도로.</h2></div></div><div class="auth-f"><h1 class="h2">' + title + '</h1><p class="lead">' + sub + '</p>' + body + '</div></div></section>' }; }
  P.login = function () {
    return authShell('로그인', '신청 내역과 찜한 서비스를 한곳에서 확인하세요.', '<form class="form" data-sub="login" novalidate><div class="fg"><label class="lb" for="l-id">이메일</label><input id="l-id" type="email" value="demo@thegarnet.example" autocomplete="username"></div><div class="fg"><label class="lb" for="l-pw">비밀번호</label><input id="l-pw" type="password" value="Garnet!2345" autocomplete="current-password"><p class="err" id="l-e" hidden></p></div><button class="btn btn-fill btn-block" type="submit">로그인</button></form>' +
      '<button class="btn btn-line btn-block" data-act="demoLogin" data-ret="' + esc(S.ret || '') + '">데모 계정으로 바로 입장</button><p class="auth-l"><a href="#signup">회원가입</a><span>·</span><a href="#reset">비밀번호 재설정 요청</a></p><p class="small c">시연 화면이라 위 데모 계정이 미리 입력되어 있어요.</p>');
  };
  G.SUB.login = function () {
    var id = document.getElementById('l-id').value.trim(), pw = document.getElementById('l-pw').value, e = document.getElementById('l-e');
    if (!id || !pw) { e.textContent = '이메일과 비밀번호를 모두 입력해 주세요.'; e.hidden = false; return; }
    var other = S.members && S.members.filter(function (m) { return m.email === id; })[0];
    if (id !== 'demo@thegarnet.example' && !(S.joined && S.joined.email === id)) { e.textContent = '가입된 계정을 찾을 수 없어요. 데모 계정으로 입장하거나 회원가입을 해 주세요.'; e.hidden = false; return; }
    if (id === 'demo@thegarnet.example' && pw !== 'Garnet!2345') { e.textContent = '비밀번호가 맞지 않아요. 데모 비밀번호는 Garnet!2345 입니다.'; e.hidden = false; return; }
    S.user = id === 'demo@thegarnet.example' ? { id: 'u1', name: '김도현', email: id, phone: '010-0000-0000' } : S.joined; G.save(); var r = S.ret; S.ret = ''; G.toast(S.user.name + '님, 어서 오세요.'); G.go(r || 'my'); G.render(false);
  };
  P.signup = function () {
    return authShell('회원가입', '이메일만 있으면 1분 안에 시작할 수 있어요.', '<form class="form" data-sub="signup" novalidate><div class="fg"><label class="lb" for="s-name">이름</label><input id="s-name" type="text" autocomplete="name"><p class="err" hidden></p></div><div class="fg"><label class="lb" for="s-mail">이메일 (로그인 ID)</label><input id="s-mail" type="email" autocomplete="email"><p class="err" hidden></p></div><div class="fg"><label class="lb" for="s-ph">연락처 <em class="opt">선택</em></label><input id="s-ph" type="tel" inputmode="tel" placeholder="010-0000-0000"></div><div class="fg"><label class="lb" for="s-pw">비밀번호</label><input id="s-pw" type="password" autocomplete="new-password"><p class="hint-s">8자 이상, 영문과 숫자를 함께 써 주세요.</p><p class="err" hidden></p></div><div class="fg"><label class="lb" for="s-pw2">비밀번호 확인</label><input id="s-pw2" type="password" autocomplete="new-password"><p class="err" hidden></p></div>' +
      '<label class="chk"><input type="checkbox" id="s-a1"><span><b>[필수]</b> <a href="#terms" target="_blank" rel="noopener">이용약관</a> 및 <a href="#privacy" target="_blank" rel="noopener">개인정보 처리방침</a>에 동의합니다.</span></label><p class="err" id="s-a1e" hidden>필수 동의가 필요해요.</p><label class="chk"><input type="checkbox"><span><b>[선택]</b> 소식과 혜택 안내를 받겠습니다.</span></label><button class="btn btn-fill btn-block" type="submit">가입하기</button></form><p class="auth-l"><a href="#login">이미 계정이 있어요</a></p>');
  };
  G.SUB.signup = function () {
    var ok = true, set = function (id, bad, msg) { var p = document.getElementById(id).parentNode.querySelector('.err'); p.textContent = msg; p.hidden = !bad; if (bad) ok = false; };
    var pw = document.getElementById('s-pw').value;
    set('s-name', !document.getElementById('s-name').value.trim(), '이름을 입력해 주세요.');
    set('s-mail', !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(document.getElementById('s-mail').value.trim()), '이메일 형식을 확인해 주세요.');
    set('s-pw', !(pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw)), '8자 이상, 영문과 숫자를 함께 써 주세요.');
    set('s-pw2', pw !== document.getElementById('s-pw2').value, '비밀번호가 서로 달라요.');
    var a = document.getElementById('s-a1').checked; document.getElementById('s-a1e').hidden = a; if (!a) ok = false;
    if (!ok) return;
    S.joined = { id: 'u9', name: document.getElementById('s-name').value.trim(), email: document.getElementById('s-mail').value.trim(), phone: document.getElementById('s-ph').value.trim() };
    S.user = S.joined; G.save(); G.toast('가입을 환영해요, ' + S.user.name + '님.'); var r = S.ret; S.ret = ''; G.go(r || 'my'); G.render(false);
  };
  P.reset = function () {
    return authShell('비밀번호 재설정', '가입한 이메일을 알려 주시면 본인 확인 후 안내드려요.', '<form class="form" data-sub="reset" novalidate><div class="fg"><label class="lb" for="r-mail">이메일</label><input id="r-mail" type="email"><p class="err" hidden></p></div><button class="btn btn-fill btn-block" type="submit">재설정 요청</button></form><p class="auth-l"><a href="#login">로그인으로 돌아가기</a></p>');
  };
  G.SUB.reset = function () { var i = document.getElementById('r-mail'), p = i.parentNode.querySelector('.err'); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value.trim())) { p.textContent = '이메일 형식을 확인해 주세요.'; p.hidden = false; return; } p.hidden = true; G.toast('재설정 요청을 접수했어요. (시연)'); G.go('login'); };

  /* ---------- 약관 ---------- */
  function legal(title, kicker, body) { return { title: title, html: G.pageHead(title, '시행일 2026-10-13', [[title]], kicker) + '<section class="sec sec-tight"><div class="wrap narrow2"><div class="callout warn">' + ico('info', 20) + '<div><p>본 문서는 기본 초안입니다. 실제 사업 운영 방식과 국내 법령에 맞게 전문가 검토 후 확정하여 게시하세요.</p></div></div><article class="card prose legal">' + body + '</article></div></section>' }; }
  P.terms = function () { return legal('이용약관', 'TERMS', '<h3>제1조 (목적)</h3><p>이 약관은 더가넷(이하 "회사")이 제공하는 생활돌봄 서비스의 이용과 관련하여 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p><h3>제2조 (서비스의 내용과 수행 주체)</h3><p>회사는 서비스 안내 페이지에 게시된 서비스를 제공합니다. 회사가 직접 수행하는 서비스와 적격 전문기관·업체에 연계하는 서비스는 각 서비스 상세 페이지에 구분하여 표시합니다. 연계 서비스의 수행 주체와 책임 범위는 견적 안내 시 함께 고지합니다.</p><h3>제3조 (신청과 승인)</h3><p>회원은 신청서를 작성하여 서비스를 신청할 수 있으며, 회사는 신청 내용을 검토하여 가능 범위·일정·비용을 안내합니다. 견적은 회원이 승인하기 전에는 확정된 주문으로 보지 않으며, 회사는 회원의 승인 없이 구매·교체·예약·업체 배정·추가 비용이 발생하는 작업을 진행하지 않습니다.</p><h3>제4조 (서비스의 제외 범위)</h3><p>회사는 의료행위, 심리치료, 법률·재정 자문 등 전문 자격이 필요한 행위를 제공하지 않으며, 사주·풍수 상담은 참고 정보로서 결과를 보장하지 않습니다.</p><h3>제5조 (취소·환불)</h3><p>취소·환불은 별도의 <a href="#refund">취소·환불 정책</a>에 따릅니다.</p><h3>제6조 (회원의 의무)</h3><p>회원은 정확한 정보를 제공해야 하며, 계정 정보를 타인에게 양도·대여할 수 없습니다.</p><h3>제7조 (책임의 제한과 분쟁 해결)</h3><p>천재지변, 회원의 귀책사유 등 회사의 통제 범위를 벗어난 사유로 인한 손해에 대해서는 관련 법령이 허용하는 범위에서 책임이 제한될 수 있습니다. 서비스 중 사고·분쟁이 발생한 경우 고객센터를 통해 접수하며 회사는 성실히 대응합니다.</p>'); };
  P.privacy = function () { return legal('개인정보 처리방침', 'PRIVACY', '<h3>1. 수집 항목과 목적</h3><table class="tbl"><thead><tr><th>구분</th><th>수집 항목</th><th>목적</th></tr></thead><tbody><tr><td>회원가입</td><td>이메일(로그인 ID), 이름, 비밀번호(해시 저장), 연락처(선택)</td><td>회원 식별, 계정 관리, 고객 응대</td></tr><tr><td>서비스 신청</td><td>희망 일시·지역(시·군·구), 인원, 예산, 요청 사항, 연락처 등 서비스 제공에 필요한 정보</td><td>서비스 제공, 견적·일정 안내</td></tr><tr><td>문의</td><td>이름, 이메일, 문의 내용</td><td>문의 응대</td></tr></tbody></table><h3>2. 보유 및 이용 기간</h3><p>회원 탈퇴 시 지체 없이 파기(비식별 처리)하며, 관계 법령에 따라 보관이 필요한 신청·계약·결제 관련 기록은 해당 기간 동안 분리 보관합니다.</p><h3>3. 제3자 제공 및 처리위탁</h3><p>연계 서비스 진행을 위해 협력업체·전문기관에 정보를 제공하는 경우, 신청 단계에서 별도 동의를 받으며 제공 항목·목적·보유기간을 안내합니다. 동의하지 않으셔도 연계가 필요하지 않은 서비스 이용에는 제한이 없습니다.</p><h3>4. 민감할 수 있는 정보</h3><p>상세 주소, 사진, 출생 월·일 등은 서비스 진행에 꼭 필요한 경우에 한해 별도 동의를 받아 선택적으로 수집합니다. 의료·금융 정보는 요청하지 않습니다.</p><h3>5. 이용자의 권리</h3><p>이용자는 마이페이지에서 개인정보를 열람·수정하고 마케팅 수신 동의를 철회하거나 회원 탈퇴를 요청할 수 있습니다.</p><h3>6. 안전성 확보 조치</h3><p>비밀번호 암호화 저장, 접근 권한 분리, 접속·변경 기록 관리, 전송 구간 암호화(HTTPS) 등을 적용합니다.</p><h3>7. 개인정보 보호 문의</h3><p>고객센터 ' + esc(SITE.phone) + ' / ' + esc(SITE.email) + '</p>'); };
  P.refund = function () { return legal('취소·환불 정책', 'REFUND', '<h3>1. 승인 이전</h3><p>고객 승인 이전(접수·검토·추가 정보 요청·견적 안내·승인 대기 단계)에는 별도 비용 없이 취소할 수 있습니다.</p><h3>2. 승인 이후</h3><p>승인 이후에는 마이페이지에서 \'취소 요청\'을 접수하며, 서비스 진행 단계와 아래 기준에 따라 운영자가 확인 후 처리합니다.</p><ul><li>일정 확정 전: 발생한 실비(재료 구매·예약금 등)를 제외하고 환불 (세부 기준은 운영 정책 확정 후 기재)</li><li>일정 확정 후·진행 중: 진행 단계에 따라 일부 환불 또는 환불 불가 (세부 기준은 운영 정책 확정 후 기재)</li><li>맞춤 제작·구매 대행 등은 제작·구매 착수 후 변경·환불이 제한될 수 있으며 신청 전에 고지합니다.</li></ul><h3>3. 연계 서비스</h3><p>여행·숙박 등 연계 업체가 수행하는 서비스는 해당 업체의 약관·취소 규정이 함께 적용되며, 견적 안내 시 예약 확정 주체와 규정을 표시합니다.</p><h3>4. 환불 절차</h3><p>취소 요청 접수 → 운영자 확인 → 환불 처리 중 → 환불 완료 순서로 진행되며 각 단계는 신청 내역에서 확인할 수 있습니다.</p>'); };

  P.notfound = function () { return { title: '페이지를 찾을 수 없어요', html: G.pageHead('페이지를 찾을 수 없어요', '주소가 바뀌었거나 더 이상 공개되지 않는 페이지예요.', null, '404') + '<section class="sec sec-tight"><div class="wrap">' + G.empty('홈이나 서비스 목록에서 다시 찾아보세요.', '<div class="fa c"><a class="btn btn-fill" href="#home">홈으로</a><a class="btn btn-line" href="#services">서비스 목록</a></div>') + '</div></section>' }; };
})();
