/* 머리말 메뉴: 마우스를 올리면 소분류가 펼쳐져 바로 이동 (마지막에 불러와서 최종 화면을 다듬어요) */
(function () {
  'use strict';
  var S = G.state, f = G.feat, esc = G.esc;
  var lnk = function (l, h, x) { return { l: l, h: h, x: x || '' }; };

  function subs(key) {
    var u = !!S.user, it = [], ft = [], wide = false;
    if (key === 'services') {
      wide = true;
      Object.keys(S.flags || {}).sort().forEach(function (k) { var s = G.sv(k); if (s && S.flags[k].state !== 'HIDDEN') it.push(lnk(s.name, '#svc-' + k)); });
      ft = [lnk('전체 서비스 보기', '#services'), lnk('나에게 맞는 돌봄 찾기', '#find'), lnk('상담 메모 만들기', '#memo')];
    } else if (key === 'special') {
      it = [lnk('특별한 날 시작하기', '#special'), lnk('탄생상징 주얼리', '#svc-S13'), lnk('꽃·디퓨저', '#svc-S05'), lnk('맞춤 의류·신발', '#svc-S07'), lnk('수공예·포토북', '#svc-S08'), lnk('침구·소품', '#svc-S09')];
      ft = [lnk('내 사이즈·탄생 정보 입력', u ? '#my-profile' : '#login')];
    } else if (key === 'club') {
      it = [lnk('전체 글 보기', '#club')];
      if (f('pumon')) Object.keys(G.PUMON || {}).forEach(function (k) { it.push(lnk(G.PUMON[k].name, '#club', ' data-act="navClub" data-v="' + k + '"')); });
      ft = [lnk('글쓰기', '#club-new'), lnk('내 활동', '#club-mine'), lnk('이용 기준', '#club-rules')];
    } else if (key === 'share') {
      it = [lnk('나눔 허브 보기', '#share'), lnk('이웃 글 전체 보기', '#club')];
      if (f('pumon')) Object.keys(G.PUMON || {}).forEach(function (k) { it.push(lnk(G.PUMON[k].name, '#club', ' data-act="navClub" data-v="' + k + '"')); });
      ft = [lnk('글쓰기', '#club-new'), lnk('내 활동', '#club-mine'), lnk('이용 기준', '#club-rules')];
    } else if (key === 'life') {
      wide = true; it = [lnk('생활 서비스 허브', '#life')];
      (G.areaOf ? ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S12', 'S13'] : []).forEach(function (k) { var s = G.sv(k); if (s && S.flags[k] && S.flags[k].state !== 'HIDDEN') it.push(lnk(s.name, '#svc-' + k)); });
      ft = [lnk('특별한 날', '#special'), lnk('나에게 맞는 돌봄 찾기', '#find'), lnk('상담 메모 만들기', '#memo')];
      if (f('petShop')) ft.splice(1, 0, lnk('반려동물 물품', '#petshop'));
    } else if (key === 'nature') {
      it = [lnk('자연 허브', '#nature'), lnk('명상·산책·마음휴식', '#svc-S11'), lnk('숙박·관광·계절여행', '#svc-S14')];
      ft = [lnk('상담 메모 남기기', '#memo')];
    } else if (key === 'hope') {
      it = [lnk('후원 허브', '#hope'), lnk('후원 사업 보기', '#giving'), lnk('더가넷 나눔', '#giving-thegarnet'), lnk('마음품 연결', '#giving-maeum')];
      if (f('campaign')) it.push(lnk('공동 캠페인', '#giving-campaign'));
      if (f('givingNominate')) it.push(lnk('나눔 추천·신청', '#giving-nominate'));
      if (f('givingReport')) it.push(lnk('나눔 보고서', '#giving-report'));
      if (u) ft = [lnk('나의 나눔', '#my-giving')];
    } else if (key === 'town') {
      [['places', '거점 찾기', 'places'], ['events', '모임·이벤트', 'events'], ['news', '동네 소식', 'news'], ['groupbuy', '공동구매', 'groupbuy'], ['preorder', '창립회원 사전 신청', 'preorder']].forEach(function (x) { if (f(x[2])) it.push(lnk(x[1], '#' + x[0])); });
    } else if (key === 'guide') {
      it = [lnk('이용 순서와 신청 상태', '#guide'), lnk('서비스 신청하기', '#apply'), lnk('상담 메모 써 보기', '#memo'), lnk('취소·환불 정책', '#refund')];
      if (f('promise')) it.push(lnk('가넷 안심 약속', '#promise'));
    } else if (key === 'plans') {
      it = [lnk('멤버십 등급 안내', '#plans')];
      if (u) it.push(lnk('내 멤버십', '#my-plan'));
      if (u && f('points')) it.push(lnk('포인트·이용권', '#my-points'));
      if (f('corp')) it.push(lnk('기업·기관 회원', '#corp'));
    } else if (key === 'giving') {
      it = [lnk('나눔 사업 보기', '#giving'), lnk('더가넷 나눔', '#giving-thegarnet'), lnk('마음품 연결', '#giving-maeum')];
      if (f('campaign')) it.push(lnk('공동 캠페인', '#giving-campaign'));
      if (f('givingNominate')) it.push(lnk('나눔 추천·신청', '#giving-nominate'));
      if (f('givingReport')) it.push(lnk('나눔 보고서', '#giving-report'));
      if (u) ft = [lnk('나의 나눔', '#my-giving')];
    } else if (key === 'faq') {
      it = [lnk('자주 묻는 질문', '#faq'), lnk('1:1 문의', '#inquiry'), lnk('공지사항', '#notices')];
      ft = [lnk('카톡 상담', '#inquiry', ' data-act="kakaoTalk"')];
    }
    return it.length ? { it: it, ft: ft, wide: wide } : null;
  }
  var a = function (x) { return '<a role="menuitem" href="' + x.h + '"' + x.x + '>' + esc(x.l) + '</a>'; };

  var oLayout = G.siteLayout;
  G.siteLayout = function (out, r) {
    var h = oLayout(out, r), i = h.indexOf('<nav class="nav'), j = i < 0 ? -1 : h.indexOf('</nav>', i);
    if (i < 0 || j < 0) return h;
    var open = h.slice(i, h.indexOf('>', i) + 1), inner = h.slice(i + open.length, j), items = [], re = /<a href="#([^"]+)" class="([^"]*)">([^<]+)<\/a>/g, m;
    while ((m = re.exec(inner))) items.push({ k: m[1], on: m[2], t: m[3] });
    if (!items.length) return h;
    var out2 = items.map(function (n, idx) {
      var s = subs(n.k), top = '<a href="#' + n.k + '" class="' + n.on + '"' + (s ? ' aria-haspopup="true"' : '') + '>' + n.t + '</a>';
      if (!s) return top;
      var right = idx >= items.length - 3;
      return '<div class="nv-i' + (right ? ' nv-r' : '') + '">' + top + '<div class="nv-p' + (s.wide ? ' nv-w' : '') + '" role="menu" aria-label="' + esc(n.t) + ' 바로가기"><div class="nv-g">' + s.it.map(a).join('') + '</div>' + (s.ft.length ? '<div class="nv-f">' + s.ft.map(a).join('') + '</div>' : '') + '</div></div>';
    }).join('');
    return h.slice(0, i) + open + out2 + h.slice(j);
  };

  /* 품온 4개 서비스 중 하나를 골라 바로 이동 */
  G.ACT.navClub = function (el, e) {
    if (e && e.preventDefault) e.preventDefault();
    if (G.ACT.pmSvc) G.ACT.pmSvc({ dataset: { v: el.dataset.v } });
    G.go('club');
  };

  /* 한 번 고르면 메뉴가 닫히고, 다시 위 메뉴에 올리면 열려요 */
  document.addEventListener('click', function (e) { var t = e.target; if (t.closest && t.closest('.nv-i a')) document.body.classList.add('nv-shut'); }, true);
  document.addEventListener('mouseover', function (e) { var t = e.target; if (document.body.classList.contains('nv-shut') && t.closest && t.closest('.nv-i > a')) document.body.classList.remove('nv-shut'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { document.body.classList.add('nv-shut'); if (document.activeElement && document.activeElement.blur && document.activeElement.closest && document.activeElement.closest('.nv-i')) document.activeElement.blur(); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab') document.body.classList.remove('nv-shut'); }, true);
})();
