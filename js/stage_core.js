/* 단계별 기능 공개 — 기능 스위치, 시연 데이터, 공통 도우미, 메뉴 구성 */
(function () {
  'use strict';
  var esc = G.esc, S = G.state;
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  /* ---------- 단계와 기능 ---------- */
  var STAGES = [
    { id: 's0', name: '지금 바로', why: '고객에게 잘못된 안내가 보이는 오류라 단계와 상관없이 먼저 고쳐요.', items: [
      ['fixGiving', '기부·후원 안내 문구 수정, 견적 흐름에서 분리']] },
    { id: 's1', name: '1단계 · 이름·구조·동네', why: '모든 기능이 동네·거점을 기준으로 움직여서 가장 먼저 있어야 해요.', items: [
      ['pumon', '이웃 나눔 → 품온 이름과 4개 서비스(재능품·서로품·나눔품·바꿈품)'],
      ['pumonCheck', '서로품 대행 금지·나눔품 금지 품목·실비 상한 점검'],
      ['branches', '가맹점 단위 동네와 가맹점 필수 정보'],
      ['places', '거점 찾기·상세·길찾기'],
      ['hubOps', '전달 거점 보관함 운영(맡기기·찾기·보관 기한)'],
      ['preorder', '창립회원 사전 신청'],
      ['localBadge', '오프라인 동네 확인 배지'],
      ['menuGroups', '관리자 메뉴 그룹: 커뮤니티 / 결제·정산']] },
    { id: 's2', name: '2단계 · 권한·멤버십·회원', why: '등급·포인트·체험 횟수가 생기는 단계라 회원 정보·이력을 함께 설계해요.', items: [
      ['memberLink', '멤버십 연결(LIFE START 이상 품온 정회원)'],
      ['trial3', '무료 회원 60일 3회 체험(나눔품 받기 1회)'],
      ['gradeFee', '등급별 서로품 수수료 10% / 5%'],
      ['points', '가넷 포인트 적립·사용'],
      ['memberTypes', '회원 유형(개인·기업·기관)과 필수 정보'],
      ['memberHistory', '회원 검색·상세 이력'],
      ['branchManager', '가맹점 매니저 역할·대리 가입'],
      ['staff', '방문 인력 프로필·인증 배지·사전 공개']] },
    { id: 's3', name: '3단계 · 이벤트·모임·평가·안심', why: '신뢰 장치를 한 단계에 모아야 작업 일지 → 평가 → 분쟁이 하나로 이어져요.', items: [
      ['events', '공식 모임·이벤트·배지'],
      ['rating3', '3단계 평가(최고예요·좋아요·아쉬워요)와 만족도 %'],
      ['safeMeet', '안심 만남(체크인·체크아웃)'],
      ['promise', '가넷 안심 약속'],
      ['workLog', '작업 일지·진행 알림'],
      ['dispute', '분쟁 신청·상대방 진술·보상 기준표'],
      ['news', '동네 소식 게시판']] },
    { id: 's4', name: '4단계 · 결제·정산·기업·나눔', why: '돈이 오가는 기능을 한 단계에 모아 매출·수수료·할인·후원금을 한 번에 분리해요.', items: [
      ['pay', '간편결제 선택·결제 시트(시연)'],
      ['coupons', '등급별 이용권(협력업체 서비스 10% 상한)'],
      ['priceTable', '정찰형 예상 가격'],
      ['groupbuy', '가넷 공동구매(예약형)'],
      ['corp', '기업·기관 계정과 필수 정보'],
      ['partnerInfo', '협력업체 필수 정보·상세 이력·검색'],
      ['safeNumber', '안심번호(시연)'],
      ['bridge', '더가넷↔품온 연결 버튼, 장기요양 안내'],
      ['giving', '나눔: 사업 페이지·내 나눔·더가넷 직접 후원·기관 관리']] },
    { id: 's5', name: '5단계 · 쉬운 사용·안심·지표', why: '앞 단계 데이터가 모여야 리포트·지표·통합 검색을 보여 줄 수 있어요.', items: [
      ['bigText', '글자 크게·모바일 하단 메뉴·카톡 상담 버튼'],
      ['phoneApply', '전화로 신청·상담원 대리 접수'],
      ['family', '가족 역할·가넷 안심 리포트·가족 일정'],
      ['alimtalk', '알림톡 미리보기(받은 알림)'],
      ['easyWords', '쉬운 말(견적 → 예상 비용 등)'],
      ['homeLog', '우리 집 생활 기록'],
      ['metrics', '품온 지표·가맹점 상세 이력'],
      ['adminSearch', '관리자 통합 검색'],
      ['safety', '안심 관리(수신자 없음·미확인 알림·안심콜)'],
      ['givingReport', '나눔 보고서']] },
    { id: 's6', name: '운영 후 2차', why: '법률 검토·운영 데이터·교육 자료가 먼저 필요한 기능이에요.', items: [
      ['timePum', '시간품(현금 전환 불가)'],
      ['memberMeet', '회원 주최 모임'],
      ['givingNominate', '나눔 추천·본인 신청·심사위원회'],
      ['regular', '정기 예약·담당자 지정·할부·결제 영수증'],
      ['gps', '내 위치로 가까운 거점 찾기 (위치정보 동의)'],
      ['campaign', '공동 캠페인 (더가넷·기관·회원)'],
      ['neighborCare', '안부 이웃 (이웃이 안부 전화·방문)'],
      ['pwa', '홈 화면에 추가 안내']] }
  ];
  var DEPS = { pumonCheck: ['pumon'], places: ['branches'], hubOps: ['places', 'pumon'], preorder: ['branches'], localBadge: ['branches', 'pumon'],
    trial3: ['memberLink', 'pumon'], gradeFee: ['memberLink', 'pumon'], branchManager: ['branches'], corp: ['memberTypes'], safeMeet: ['pumon'],
    news: ['branches'], coupons: ['pay'], family: ['alimtalk'], metrics: ['branches', 'pumon'], givingReport: ['giving'], givingNominate: ['giving'],
    timePum: ['pumon'], memberMeet: ['events'], regular: ['staff'], gps: ['places'], campaign: ['giving'], neighborCare: ['pumon', 'safety', 'localBadge'] };
  G.STAGES = STAGES;
  G.FEAT_DEPS = DEPS;
  G.featName = function (k) { var n = ''; STAGES.forEach(function (s) { s.items.forEach(function (i) { if (i[0] === k) n = i[1]; }); }); return n; };

  /* ---------- 시연 데이터 ---------- */
  function seed() {
    return {
      flags: { fixGiving: true },
      flagLog: [],
      branches: [
        { id: 'B1', name: '더가넷 마포점 (예시)', code: 'GN-MP01', bizNo: '000-00-00001', owner: '가맹점주 (예시)', bizType: '서비스업', bizItem: '생활돌봄', addr: '서울 마포구 ○○로 12, 1층', phone: '02-000-1001', manager: '마포 매니저', email: 'mapo@thegarnet.example', hours: '평일 10:00–19:00 · 토 10:00–15:00', contract: '2026-11-01 ~ 2029-10-31', area: ['마포', '서대문', '은평'], kind: '매장형' },
        { id: 'B2', name: '더가넷 송파점 (예시)', code: 'GN-SP01', bizNo: '000-00-00002', owner: '가맹점주 (예시)', bizType: '서비스업', bizItem: '생활돌봄', addr: '서울 송파구 ○○대로 34, 2층', phone: '02-000-1002', manager: '송파 매니저', email: 'songpa@thegarnet.example', hours: '평일 10:00–19:00', contract: '2026-12-01 ~ 2029-11-30', area: ['송파', '성동', '강서', '성남'], kind: '사무실형' }
      ],
      hubs: [
        { id: 'H1', branch: 'B1', name: '마포점 매장 (예시)', kind: '가맹점', addr: '서울 마포구 ○○로 12, 1층', near: '○○역 2번 출구에서 걸어서 5분, ○○약국 옆 1층', hours: '평일 10:00–19:00 · 토 10:00–15:00', phone: '02-000-1001', facil: ['엘리베이터 없음(1층)', '경사로', '화장실', '보관함 12칸', '모임 10명'], lockers: 12, meet: true, x: 0.32, y: 0.42 },
        { id: 'H2', branch: 'B1', name: '○○동 작은도서관 (제휴·예시)', kind: '제휴', addr: '서울 마포구 ○○동 주민센터 3층', near: '○○동 주민센터 건물 3층, 엘리베이터 이용', hours: '화–토 10:00–18:00', phone: '02-000-2001', facil: ['엘리베이터', '화장실', '보관 선반', '모임 20명'], lockers: 6, meet: true, x: 0.58, y: 0.30 },
        { id: 'H3', branch: 'B1', name: '서대문 동네 카페 (제휴·예시)', kind: '제휴', addr: '서울 서대문구 ○○길 5', near: '○○시장 정문 맞은편', hours: '매일 09:00–21:00', phone: '02-000-2002', facil: ['1층', '화장실', '보관 선반'], lockers: 4, meet: false, x: 0.70, y: 0.62 },
        { id: 'H4', branch: 'B2', name: '송파점 무인 보관함 (예시)', kind: '가맹점', addr: '서울 송파구 ○○대로 34, 1층 입구', near: '○○역 4번 출구 앞 건물 1층 입구', hours: '24시간 (보관함)', phone: '02-000-1002', facil: ['1층', '보관함 8칸'], lockers: 8, meet: false, x: 0.25, y: 0.70 }
      ],
      storage: [],
      preorders: [
        { id: 'R1', name: '이*희', phone: '010-****-2201', branch: 'B1', want: ['나눔품', '재능품'], at: '2026-10-20 11:00' },
        { id: 'R2', name: '박*수', phone: '010-****-7710', branch: 'B1', want: ['서로품'], at: '2026-10-22 14:00' },
        { id: 'R3', name: '정*미', phone: '010-****-0302', branch: 'B2', want: ['바꿈품'], at: '2026-10-25 09:30' }
      ],
      preorderBase: { B1: 26, B2: 11 },
      mem: { u1: { type: '개인', branch: 'B1', verified: true, plan: null }, u2: { type: '개인', branch: 'B1', verified: true, plan: 1 }, u3: { type: '개인', branch: 'B1', verified: true, plan: 3 }, u4: { type: '개인', branch: 'B1', verified: true, plan: 2 }, u5: { type: '개인', branch: 'B2', verified: false, plan: 0 }, u6: { type: '개인', branch: 'B1', verified: true, plan: 0 } },
      localOk: { u2: '2026-10-21', u4: '2026-10-23' },
      trial: { u6: ['2026-10-08'] },
      staff: [
        { id: 'W1', name: '김*선', org: 'B1', role: '정리수납 매니저', since: '2025-03', badges: { id: '2027-03-31', cert: '정리수납 2급', health: '2027-01-15', edu: '안심 방문 교육 2026-09', ins: '2027-02-28' }, done: 42 },
        { id: 'W2', name: '오*진', org: 'P6', role: '펫시터', since: '2024-11', badges: { id: '2027-05-31', cert: '반려동물관리사', health: '2026-12-20', edu: '안심 방문 교육 2026-08', ins: '2027-01-31' }, done: 87 },
        { id: 'W3', name: '한*우', org: 'P2', role: '식물 관리사', since: '2025-06', badges: { id: '2027-06-30', cert: '', health: '2027-03-01', edu: '', ins: '2027-04-30' }, done: 19 },
        { id: 'W4', name: '서*경', org: 'P4', role: '병원 동행 매니저', since: '2025-01', badges: { id: '2027-01-31', cert: '요양보호사', health: '2026-11-30', edu: '안심 방문 교육 2026-07', ins: '2027-01-31' }, done: 55 }
      ],
      appStaff: { 'G2610-0002': 'W1', 'G2610-0003': 'W2' },
      worklog: { 'G2610-0003': [['시작', '2026-10-27 10:02', '방문 시작. 고양이 상태 양호.', '입구_사진.jpg'], ['중간', '2026-10-27 10:30', '급식·급수 교체, 화장실 정리.', '급식.jpg']] },
      events: [
        { id: 'E1', branch: 'B1', hub: 'H1', title: '품온 나눔데이 11월', kind: '나눔데이', date: '2026-11-15 14:00', cap: 30, joined: ['u2', 'u4'], benefit: '참여 회원 첫 나눔 배지', official: true, desc: '안 쓰는 물건을 가져와 현장에서 나누고 바꿔요. 식품·의약품은 받지 않아요.' },
        { id: 'E2', branch: 'B1', hub: 'H2', title: '재능 원데이: 스마트폰 사진 정리', kind: '재능 원데이', date: '2026-11-22 10:30', cap: 12, joined: ['u3'], benefit: '이용권 5%', official: true, desc: '재능품 회원이 스마트폰 사진 정리와 공유 방법을 알려 드려요.' },
        { id: 'E3', branch: 'B1', hub: 'H1', title: '가을 옷장 바꿈장 + 정리수납 상담', kind: '계절', date: '2026-11-29 13:00', cap: 40, joined: [], benefit: '정리수납 상담 무료', official: true, desc: '옷·소품을 바꾸고, 정리수납 매니저에게 수납 상담을 받아요.' }
      ],
      draws: [],
      badges: { u2: ['첫 나눔'], u4: ['첫 나눔', '따뜻한 품'] },
      news: [
        { id: 'NW1', branch: 'B1', cat: '공공 서비스', title: '마포구 어르신 독감 무료 접종 안내 (예시)', date: '2026-10-28', body: '보건소와 지정 의료기관에서 접종할 수 있어요. 신분증을 챙겨 주세요.' },
        { id: 'NW2', branch: 'B1', cat: '주민센터 프로그램', title: '○○동 주민센터 스마트폰 교실 (예시)', date: '2026-10-26', body: '매주 목요일 오후 2시, 무료. 주민센터에 전화로 신청해요.' },
        { id: 'NW3', branch: 'B2', cat: '지역 행사', title: '송파 가을 벼룩시장 (예시)', date: '2026-10-24', body: '11월 둘째 주 토요일, ○○공원에서 열려요.' }
      ],
      ratings: [],
      checkins: {},
      disputes: [
        { id: 'DS1', app: 'G2609-0002', user: 'u2', type: '작업 불만족', text: '산책 시간이 약속보다 짧았어요.', file: '산책기록.png', at: '2026-10-05 10:00', status: '상대방 진술', counter: '', decision: '', comp: '', contactAt: '2026-10-05 15:00' }
      ],
      payments: [],
      points: { u1: [['2026-10-04', '명상·산책 이용 적립', 600], ['2026-10-12', '첫 나눔 배지 보상', 1000]] },
      coupons: [
        { id: 'CP1', owner: 'u1', rate: 5, cap: 10000, exp: '2026-12-31', used: false, src: '첫 나눔 배지' }
      ],
      couponPartnerCap: 10,
      prices: {
        S03: { unit: '시간', per: 45000, min: 2, max: 8, def: 4, note: '2인 1팀 기준, 수납 용품 별도' },
        S02: { unit: '회 방문', per: 40000, min: 1, max: 4, def: 1, note: '화분 10개까지, 분갈이 별도' },
        S06: { unit: '회 방문', per: 30000, min: 1, max: 14, def: 3, note: '1회 40분, 고양이·소형견 기준' },
        S11: { unit: '회 (1인)', per: 30000, min: 1, max: 8, def: 2, note: '1대1 60분 기준' }
      },
      groupbuys: [
        { id: 'GB1', title: '겨울 극세사 차렵이불 Q (예시)', price: 59000, list: 89000, min: 20, until: '2026-11-10', supply: '2026-11-20', pickup: ['H1', 'H4'], orders: [['u2', 1], ['u4', 2], ['u3', 1]], base: 12, status: '모집 중' },
        { id: 'GB2', title: '제철 사과 5kg 공동구매 (예시)', price: 32000, list: 41000, min: 30, until: '2026-11-05', supply: '2026-11-08', pickup: ['H1'], orders: [['u4', 1]], base: 33, status: '모집 중' }
      ],
      corps: [
        { id: 'C1', kind: '기업', name: '○○테크 주식회사 (예시)', bizNo: '000-00-10001', ceo: '대표자 (예시)', bizType: '정보통신업', addr: '서울 영등포구 ○○로 1', manager: '인사팀 복지 담당', phone: '02-000-3001', email: 'hr@corp.example', seats: 120, period: '2026-11 ~ 2027-10', code: 'GNCORP-2026A', used: 14 },
        { id: 'C2', kind: '기관', name: '○○동 주민센터 (예시)', bizNo: '고유번호 000-83-00001', ceo: '동장', bizType: '공공기관', addr: '서울 마포구 ○○동', manager: '복지팀 담당', phone: '02-000-4001', email: 'welfare@gov.example', seats: 0, period: '협약 2026-10 ~', code: 'GNORG-0001', used: 0 }
      ],
      orgs: [
        { id: 'O1', name: '○○지역아동센터 (예시)', type: '지역아동센터', receipt: true, verified: '2026-10-01', mou: '2026-10-01' },
        { id: 'O2', name: '○○노인복지관 (예시)', type: '노인복지관', receipt: true, verified: '2026-09-20', mou: '2026-09-20' },
        { id: 'O3', name: '○○한부모가족지원단체 (예시)', type: '한부모가족 지원', receipt: true, verified: '2026-10-10', mou: '2026-10-10' }
      ],
      projects: [
        { id: 'PJ1', org: 'O2', target: '혼자 사시는 어르신', title: '마포 어르신 겨울나기 20가구 (예시)', goal: 4000000, story: '난방비와 겨울 이불, 안부 방문을 함께 지원해요. 대상 가구는 복지관이 확인해 선정했어요.', plan: [['난방비 지원', 2000000], ['겨울 이불', 1200000], ['안부 방문 활동비', 800000]], until: '2026-12-15', status: '모금 중', service: '더가넷 정리수납 손길 나눔 5가구' },
        { id: 'PJ2', org: 'O1', target: '보호가 필요한 아동', title: '지역아동센터 겨울방학 급식 (예시)', goal: 3000000, story: '방학 동안 센터 아이들의 점심을 지원해요. 아이들의 이름·얼굴은 공개하지 않아요.', plan: [['급식 재료비', 2700000], ['조리 소모품', 300000]], until: '2026-12-31', status: '모금 중', service: '' },
        { id: 'PJ3', org: 'O3', target: '한부모·미혼모 가정', title: '한부모 가정 겨울 생필품 상자 (예시)', goal: 2000000, story: '분유·기저귀·내의를 담은 상자를 단체를 통해 전달해요.', plan: [['생필품 상자 40개', 2000000]], until: '2026-11-30', status: '집행 완료', service: '' }
      ],
      gifts: [
        { id: 'GF1', user: 'u1', proj: 'PJ3', amt: 30000, match: 30000, kind: '일시', open: false, at: '2026-10-05 20:00' }
      ],
      ledger: [
        { id: 'L1', proj: 'PJ1', at: '2026-10-20', type: '모금', who: '회원', amt: 1240000, note: '회원 후원 누적' },
        { id: 'L2', proj: 'PJ1', at: '2026-10-20', type: '모금', who: '매칭', amt: 600000, note: '더가넷 매칭 기부' },
        { id: 'L3', proj: 'PJ1', at: '2026-10-20', type: '모금', who: '더가넷', amt: 300000, note: '9월 매출 나눔 1%' },
        { id: 'L4', proj: 'PJ2', at: '2026-10-22', type: '모금', who: '회원', amt: 860000, note: '회원 후원 누적' },
        { id: 'L5', proj: 'PJ3', at: '2026-10-01', type: '모금', who: '회원', amt: 1400000, note: '회원 후원 누적' },
        { id: 'L6', proj: 'PJ3', at: '2026-10-01', type: '모금', who: '매칭', amt: 600000, note: '더가넷 매칭 기부' },
        { id: 'L7', proj: 'PJ3', at: '2026-10-06', type: '전달', who: '기관', amt: 2000000, note: '기관 접수 확인' },
        { id: 'L8', proj: 'PJ3', at: '2026-10-20', type: '집행', who: '기관', amt: 2000000, note: '생필품 상자 40개 전달' }
      ],
      ledgerHist: [],
      reports: { PJ3: { text: '40가구에 생필품 상자를 전달했어요. 사진은 상자와 포장 활동만 공개해요.', approved: '2026-10-25' } },
      giveCfg: { revenueRate: 1, matchRatio: 1, matchCap: 1000000 },
      nominations: [],
      family: {},
      notify: [
        { at: '2026-10-27 10:02', to: 'u2', text: '[더가넷] 방문 돌봄을 시작했어요. 담당 오*진 매니저' }
      ],
      safeCalls: [],
      bigText: false,
      proxyLog: [],
      geo: { H1: [37.5563, 126.9236], H2: [37.5612, 126.9310], H3: [37.5650, 126.9440], H4: [37.5110, 127.0980] },
      campaigns: [
        { id: 'CA1', title: '겨울 이불 300채 함께 덮어요 (예시)', org: 'O2', proj: 'PJ1', until: '2026-12-20', goal: 300, unit: '채', ways: ['후원 1만 원 = 이불 반 채', '새 이불을 거점에 맡기기', '배달·정리 손길(서로품)'], joined: { u2: '물건', u4: '손길' }, base: 112, garnet: '더가넷이 이불 50채와 정리수납 손길 5가구를 더해요' }
      ],
      neighbors: [
        { id: 'NB1', helper: 'u4', senior: 'u6', branch: 'B1', cycle: '주 1회 전화', since: '2026-10-15', last: '2026-10-26', st: '연결됨' }
      ],
      neighborApply: []
    };
  }
  function ensure() {
    var d = seed();
    if (!S.st) S.st = d;
    else Object.keys(d).forEach(function (k) { if (S.st[k] == null) S.st[k] = d[k]; });
  }
  ensure();
  var oReset = G.reset;
  G.reset = function () { oReset(); ensure(); G.save(); };
  G.stEnsure = ensure;

  /* ---------- 도우미 ---------- */
  G.feat = function (k) { return !!(S.st && S.st.flags[k]); };
  G.setFeat = function (k, on) {
    var f = S.st.flags, changed = [];
    var turn = function (key, v) { if (!!f[key] !== v) { f[key] = v; changed.push(key); } };
    if (on) { (function walk(key) { turn(key, true); (DEPS[key] || []).forEach(walk); })(k); }
    else { turn(k, false); Object.keys(DEPS).forEach(function (x) { if (f[x] && DEPS[x].indexOf(k) >= 0) G.setFeat(x, false); }); }
    return changed;
  };
  G.branch = function (id) { return S.st.branches.filter(function (b) { return b.id === id; })[0]; };
  G.hub = function (id) { return S.st.hubs.filter(function (h) { return h.id === id; })[0]; };
  G.branchOfRegion = function (txt) {
    txt = String(txt || ''); var hit = S.st.branches.filter(function (b) { return b.area.some(function (a) { return txt.indexOf(a) >= 0; }); })[0];
    return hit ? hit.id : '';
  };
  G.memInfo = function (uid) { if (!uid) return {}; if (!S.st.mem[uid]) S.st.mem[uid] = { type: '개인', branch: '', verified: true, plan: 0 }; return S.st.mem[uid]; };
  /* 현재 사용자의 멤버십 등급(0~9). 데모 회원은 S.plan, 다른 회원은 시연 값 */
  G.planOf = function (uid) { if (S.user && uid === S.user.id) return S.plan || 0; var m = S.st.mem[uid]; return m && m.plan != null ? m.plan : 0; };
  G.isRegular = function (uid) { return G.planOf(uid) >= 1; };
  G.feeRate = function (uid) { if (!G.feat('gradeFee')) return G.fees().club; return G.planOf(uid) >= 3 ? 5 : 10; };
  G.pointRate = function (uid) { return [0, 1, 2, 3, 4, 5, 6, 7, 8, 10][G.planOf(uid)] || 0; };
  G.couponRate = function (uid) { var p = G.planOf(uid); return p >= 7 ? [20, 50000] : p >= 5 ? [15, 30000] : p >= 3 ? [10, 20000] : p >= 1 ? [5, 10000] : [0, 0]; };
  G.pointBal = function (uid) { return (S.st.points[uid] || []).reduce(function (s, x) { return s + x[2]; }, 0); };
  G.addPoint = function (uid, why, amt) { if (!uid || !amt) return; (S.st.points[uid] = S.st.points[uid] || []).push([G.now().slice(0, 10), why, amt]); };
  G.notify = function (to, text) {
    if (!S.st) return;
    /* 안심 수신자가 없거나 공유 동의가 없으면 동네 가맹점 매니저(안심 매니저)가 함께 받아요 */
    var fam0 = S.st.family[to], hasRecv = fam0 && fam0.consent && (fam0.receivers || []).length, mgr = G.feat('safety') && to && !hasRecv;
    S.st.notify.unshift({ at: G.now(), to: to, text: text, urgent: mgr || undefined, mgr: mgr ? ((G.branch(G.memInfo(to).branch) || {}).manager || '본사 운영자') : undefined }); S.st.notify = S.st.notify.slice(0, 160);
    if (G.feat('alimtalk')) G.toast('알림톡(시연) · ' + text.replace(/^\[더가넷\]\s*/, ''));
    var fam = S.st.family[to];
    if (G.feat('family') && fam && fam.receivers && fam.receivers.length && fam.consent) fam.receivers.forEach(function (r) { S.st.notify.unshift({ at: G.now(), to: to, via: r.name, text: '(' + r.name + '님께 함께 발송) ' + text }); });
  };
  G.addHours = function (str, h) { var d = new Date(String(str).replace(' ', 'T')); if (isNaN(d)) return ''; d.setHours(d.getHours() + h); var p = function (x) { return String(x).padStart(2, '0'); }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); };
  G.dayDiff = function (a, b) { return Math.round((Date.parse(String(b).slice(0, 10)) - Date.parse(String(a).slice(0, 10))) / 864e5); };
  G.badgesOf = function (uid) {
    var b = (S.st.badges[uid] || []).slice();
    var done = S.club ? S.club.deals.filter(function (d) { return d.status === 'DONE' && (d.req === uid || d.prov === uid); }).length : 0;
    var rs = G.pubRatings(uid), good = rs.filter(function (r) { return r.level >= 2; }).length + done, low = rs.filter(function (r) { return r.level === 1; }).length;
    if (done && b.indexOf('새싹 품') < 0) b.unshift('새싹 품');
    if (good >= 10 && b.indexOf('따뜻한 품') < 0) b.push('따뜻한 품');
    if (good >= 30 && (!rs.length || low / rs.length < 0.1) && b.indexOf('가넷 품') < 0) b.push('가넷 품');
    if (G.feat('localBadge') && S.st.localOk[uid]) b.push('동네 확인');
    return b;
  };
  /* 평판 규칙: 양쪽이 모두 평가했거나 7일이 지난 평가만 반영, 3년 지난 평가는 빼요 */
  G.pubRatings = function (uid) {
    return S.st.ratings.filter(function (r) {
      if (r.to !== uid) return false;
      var age = G.dayDiff(r.at, SITE.today); if (age > 365 * 3) return false;
      if (!r.deal) return true;
      return age >= 7 || S.st.ratings.some(function (x) { return x.deal === r.deal && x.by === r.to; });
    });
  };
  G.badgeHtml = function (uid) { return G.badgesOf(uid).map(function (x) { return '<span class="bd bd-' + (x === '동네 확인' ? 'ok' : 'info') + '">' + esc(x) + '</span>'; }).join(' '); };

  /* ---------- 화면 후처리: 이름·쉬운 말 ---------- */
  var oRender = G.render;
  G.render = function (top) {
    oRender(top);
    try { post(); } catch (e) { console.error(e); }
  };
  function post() {
    var root = document.getElementById('app'); if (!root) return;
    var admin = document.body.getAttribute('data-area') === 'admin';
    document.body.classList.toggle('big-text', !!(G.feat('bigText') && S.st.bigText && !admin));
    var rep = [];
    if (G.feat('pumon')) rep.push([/이웃 나눔/g, '품온'], [/유료 재능/g, '유료']);
    if (G.feat('easyWords') && !admin) { rep.push([/견적 안내/g, '예상 비용 안내'], [/견적/g, '예상 비용'], [/청약철회/g, '취소하기']); }
    if (!rep.length) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (t) { var v = t.nodeValue, o = v; rep.forEach(function (r) { v = v.replace(r[0], r[1]); }); if (v !== o) t.nodeValue = v; });
    root.querySelectorAll('[placeholder],[aria-label]').forEach(function (el) { ['placeholder', 'aria-label'].forEach(function (a) { var v = el.getAttribute(a); if (!v) return; var o = v; rep.forEach(function (r) { v = v.replace(r[0], r[1]); }); if (v !== o) el.setAttribute(a, v); }); });
    var tt = document.title, ot = tt; rep.forEach(function (r) { tt = tt.replace(r[0], r[1]); }); if (tt !== ot) document.title = tt;
  }

  /* ---------- 관리자 메뉴 ---------- */
  G.admMenu = function () {
    var f = G.feat, isAdmin = !G.adminMe || G.adminMe().role === 'ADMIN';
    var m = [['admin', '대시보드', 'home'], ['#h', '운영'], ['admin-apps', '서비스 신청 관리', 'list'], ['admin-members', '회원 관리', 'users'], ['admin-inq', '상담·문의 관리', 'message'], ['admin-partners', '협력업체 관리', 'handshake']];
    if (f('staff')) m.push(['admin-staff', '방문 인력 관리', 'shield']);
    if (f('phoneApply') || f('branchManager')) m.push(['admin-proxy', f('phoneApply') && f('branchManager') ? '대리 가입·전화 접수' : f('phoneApply') ? '전화 대리 접수' : '대리 가입', 'phone']);
    if (f('dispute')) m.push(['admin-disputes', '분쟁 처리', 'info']);
    if (f('safety')) m.push(['admin-safety', '안심 관리', 'bell']);
    var comm = [['admin-club', '이웃 나눔 검증', 'swap']];
    if (f('events')) comm.push(['admin-events', '이벤트·모임', 'calendar']);
    if (f('news')) comm.push(['admin-news', '동네 소식', 'file']);
    if (f('preorder')) comm.push(['admin-preorders', '사전 신청', 'users']);
    if (f('metrics')) comm.push(['admin-metrics', '품온 지표', 'chart']);
    var money = [['admin-settle', '정산 관리', 'receipt']];
    if (f('coupons')) money.push(['admin-coupons', '이용권·할인 부담', 'tag']);
    if (f('groupbuy')) money.push(['admin-groupbuy', '공동구매', 'truck']);
    if (f('corp')) money.push(['admin-corps', '기업·기관 계정', 'grid']);
    if (f('menuGroups')) { m.push(['#h', '커뮤니티']); m = m.concat(comm); m.push(['#h', '결제·정산']); m = m.concat(money); }
    else { m = m.concat(comm, money); }
    if (f('branches')) { m.push(['#h', '가맹점']); m.push(['admin-branches', '가맹점·거점', 'pin']); }
    if (f('giving')) { m.push(['#h', '나눔']); m.push(['admin-giving', '나눔 사업·장부', 'gift']); if (f('givingNominate')) m.push(['admin-nominate', '추천·심사', 'users']); }
    m.push(['#h', '콘텐츠'], ['admin-notices', '공지사항·FAQ', 'bell'], ['admin-svcs', '서비스 관리', 'grid']);
    m.push(['#h', '분석·시스템'], ['admin-stats', '통계·보고서', 'chart'], ['admin-accounts', '관리자 계정·권한', 'lock'], ['admin-audit', '감사 로그', 'shield']);
    if (isAdmin) m.push(['admin-features', '단계별 기능 공개', 'sliders']);
    return m;
  };
  var CUR = [['admin-app-', 'admin-apps'], ['admin-club', 'admin-club'], ['admin-settle', 'admin-settle'], ['admin-member-', 'admin-members'], ['admin-partner-', 'admin-partners'], ['admin-pinfo-', 'admin-partners'], ['admin-notice-', 'admin-notices'], ['admin-faq-', 'admin-notices'], ['admin-svc-', 'admin-svcs'],
    ['admin-branch', 'admin-branches'], ['admin-hub', 'admin-branches'], ['admin-staff', 'admin-staff'], ['admin-event', 'admin-events'], ['admin-dispute', 'admin-disputes'], ['admin-gb', 'admin-groupbuy'], ['admin-corp', 'admin-corps'], ['admin-give', 'admin-giving'], ['admin-proj', 'admin-giving'], ['admin-nom', 'admin-nominate']];
  G.admCurMap = function (raw) { var c = ''; CUR.some(function (p) { if (raw.indexOf(p[0]) === 0) { c = p[1]; return true; } return false; }); return c; };
})();
