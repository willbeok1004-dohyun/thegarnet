/* 이웃 나눔(회원 전용 서비스 교환) — 기준값, 상태 정의, 시연 데이터 */
window.CLUB = (function () {
  var PAY = {
    FREE: { name: '무료 나눔', tone: 'ok', rule: '금전·물품 등 어떤 대가도 받지 않아요. 감사 선물 요구도 할 수 없고, 수수료도 없어요.' },
    COST: { name: '실비 공유', tone: 'info', rule: '재료비·교통비처럼 실제로 든 비용만 만나서 직접 나눠요. 내역을 글에 적고, 1건 30,000원까지이며 수수료는 없어요.' },
    PAID: { name: '유료 재능', tone: 'warn', rule: '금액을 글에 분명히 적고 더가넷 안전결제로만 주고받아요. 1건 200,000원까지이며, 넘거나 자주 반복되면 협력업체 심사를 안내드려요.' }
  };
  var LIMIT = { COST: 30000, PAID: 200000, MONTHLY: 5 };
  var CATS = ['집안일·정리', '식물·꽃', '요리·반찬', '수선·리폼', '배우기·재능', '반려동물(보호자 동반)', '말벗·산책'];
  var POST_ST = {
    PENDING_REVIEW: ['검토 중', 'warn'], NEED_FIX: ['보완 요청', 'warn'], PUBLISHED: ['공개 중', 'ok'],
    REJECTED: ['등록 불가', 'bad'], PAUSED: ['게시 중지', 'bad'], CLOSED: ['마감', 'mute']
  };
  var DEAL_ST = {
    REQUESTED: ['제공자 확인 대기', 'info'], ACCEPTED: ['안전 검증 대기', 'warn'], HELD: ['추가 확인 중', 'warn'],
    VERIFIED: ['검증 완료', 'ok'], DONE: ['완료', 'dark'], DECLINED: ['정중히 거절', 'mute'], CANCELLED: ['취소', 'mute'], BLOCKED: ['진행 불가', 'bad']
  };
  var PAY_ST = {
    READY: ['결제 전', 'mute'], HELD: ['대금 보관 중', 'info'], DISPUTED: ['분쟁 접수', 'bad'],
    RELEASE_WAIT: ['정산 대기', 'warn'], PAID_OUT: ['정산 완료', 'ok'], REFUNDED: ['환불 완료', 'mute']
  };
  var FEES = { club: 10, minFee: 500, partnerP: 15, partnerM: 20, cycle: 3 };
  var DEAL_STEPS = ['요청', '수락', '안전 검증', '진행', '완료'];
  /* 상태 → 단계 인덱스(0~4) */
  var DEAL_AT = { REQUESTED: 0, ACCEPTED: 2, HELD: 2, VERIFIED: 3, DONE: 4 };
  var BANNED = [
    '의료·법률·세무·금융 등 자격이 필요한 행위와 투자·대출 권유',
    '현금 선입금, 외부 계좌·링크로의 결제 유도, 연락처 먼저 요구',
    '유상 운송, 주류·가공식품 판매, 허가가 필요한 영업',
    '미성년자·돌봄 취약 대상을 보호자 없이 혼자 맡는 일',
    '성인·유해 콘텐츠, 정치·종교 권유, 혐오와 차별 표현'
  ];
  var POST_CHECK = [
    '금지 항목(자격 필요 행위·선입금·외부 결제 유도·유상 운송 등)이 없어요',
    '유·무료 구분과 금액이 기준 안에 있어요 (실비 30,000원 · 유료 200,000원 이하)',
    '연락처·계좌·외부 링크가 글에 들어 있지 않아요',
    '만남 방식이 안전해요 (공공장소 또는 2인 이상 방문)',
    '작성 회원의 이용 상태와 신고 이력이 정상이에요'
  ];
  var DEAL_CHECK = [
    '두 회원 모두 활성 상태이고 제재·신고 이력이 없어요',
    '합의한 유·무료 구분과 금액이 글과 같고 기준 안에 있어요',
    '만남 장소와 시간이 안전해요 (공공장소 또는 2인 이상)',
    '자격·허가가 필요한 내용이 아니에요',
    '더가넷 밖으로 결제를 유도하는 말이 없어요'
  ];
  var REPORT_WHY = ['외부 결제·선입금 요구', '기준을 넘는 금액', '글과 다른 내용', '불쾌하거나 위험한 언행', '기타'];

  var seed = {
    seq: { p: 8, d: 9, r: 2 },
    posts: [
      { id: 'N01', kind: 'OFFER', pay: 'FREE', price: 0, cat: '식물·꽃', owner: 'u2', area: '서울 마포구', when: '주말 오전', status: 'PUBLISHED', at: '2026-10-20 09:30',
        title: '베란다 화분 분갈이, 같이 해요', body: '식물을 좋아하는 이웃을 위해 분갈이를 도와드려요. 흙과 화분은 각자 준비해 주시고, 저는 방법과 손만 보탤게요. 1~2시간 정도 걸려요.',
        hist: [['PENDING_REVIEW', '2026-10-19 21:10', '박*연', '등록'], ['PUBLISHED', '2026-10-20 09:30', '운영자', '기준 확인 후 공개']] },
      { id: 'N02', kind: 'OFFER', pay: 'COST', price: 8000, cat: '요리·반찬', owner: 'u3', area: '서울 서대문구', when: '토요일 오후', status: 'PUBLISHED', at: '2026-10-21 11:00',
        title: '주말 반찬 함께 만들어요', body: '제철 재료로 반찬 두세 가지를 같이 만들어 나눠 가져요. 재료비 8,000원만 나눠 내시면 돼요(영수증 공개). 알레르기는 미리 알려 주세요.',
        hist: [['PENDING_REVIEW', '2026-10-20 18:40', '이*준', '등록'], ['PUBLISHED', '2026-10-21 11:00', '운영자', '기준 확인 후 공개']] },
      { id: 'N03', kind: 'OFFER', pay: 'PAID', price: 25000, cat: '집안일·정리', owner: 'u4', area: '서울 마포구', when: '평일 저녁', status: 'PUBLISHED', at: '2026-10-22 15:20',
        title: '옷장 정리 코칭 1시간', body: '정리수납 경험을 살려 옷장을 같이 정리하며 방법을 알려드려요. 1시간 25,000원, 현장 방문은 2인 이상 또는 보호자 동석을 권해요.',
        hist: [['PENDING_REVIEW', '2026-10-22 10:05', '최*아', '등록'], ['PUBLISHED', '2026-10-22 15:20', '운영자', '금액 기준 확인 후 공개']] },
      { id: 'N04', kind: 'REQUEST', pay: 'COST', price: 5000, cat: '수선·리폼', owner: 'u6', area: '서울 은평구', when: '일정 협의', status: 'PUBLISHED', at: '2026-10-23 13:15',
        title: '원피스 허리 수선, 배우고 싶어요', body: '손바느질은 해 봤는데 허리 줄이는 법을 몰라요. 같이 하며 알려주실 분을 찾아요. 실 값 5,000원 정도는 제가 낼게요.',
        hist: [['PENDING_REVIEW', '2026-10-23 12:50', '한*라', '등록'], ['PUBLISHED', '2026-10-23 13:15', '운영자', '기준 확인 후 공개']] },
      { id: 'N05', kind: 'OFFER', pay: 'PAID', price: 180000, cat: '집안일·정리', owner: 'u3', area: '서울 서대문구', when: '협의', status: 'PENDING_REVIEW', at: '2026-10-27 22:10',
        title: '입주 청소 대행 해 드려요', body: '원룸·투룸 입주 청소를 해 드립니다. 18만원, 계좌로 먼저 보내 주시면 날짜를 잡을게요.',
        hist: [['PENDING_REVIEW', '2026-10-27 22:10', '이*준', '등록']] },
      { id: 'N06', kind: 'OFFER', pay: 'FREE', price: 0, cat: '배우기·재능', owner: 'u1', area: '서울 마포구', when: '수요일 저녁', status: 'PUBLISHED', at: '2026-10-24 19:00',
        title: '초보 캘리그라피, 같이 연습해요', body: '붓펜으로 글씨 쓰는 걸 좋아해요. 도구는 빌려드리고, 한 시간 정도 같이 연습해요. 동네 도서관 스터디룸에서 만나요.',
        hist: [['PENDING_REVIEW', '2026-10-24 18:20', '김도현', '등록'], ['PUBLISHED', '2026-10-24 19:00', '운영자', '기준 확인 후 공개']] },
      { id: 'N07', kind: 'OFFER', pay: 'FREE', price: 0, cat: '반려동물(보호자 동반)', owner: 'u1', area: '서울 마포구', when: '주말', status: 'NEED_FIX', at: '2026-10-26 10:10',
        title: '강아지 산책 같이 해요', body: '강아지 산책을 같이 하고 싶어요.',
        hist: [['PENDING_REVIEW', '2026-10-26 10:10', '김도현', '등록'], ['NEED_FIX', '2026-10-26 14:30', '운영자', '보호자가 함께하는 방식인지, 만날 장소와 시간대를 적어 주세요.']] }
    ],
    deals: [
      { id: 'D1', post: 'N03', req: 'u1', prov: 'u4', status: 'ACCEPTED', at: '2026-10-26 20:10', msg: '옷장이 좁아서 정리 방법이 궁금해요. 이번 주 금요일 저녁 가능할까요?', date: '2026-11-07 19:00', place: '마포구 도서관 1층 카페(공공장소)', price: 25000,
        hist: [['REQUESTED', '2026-10-26 20:10', '김도현', '참여 요청'], ['ACCEPTED', '2026-10-27 08:40', '최*아', '요청을 수락했어요. 안전 검증을 기다려요.']], done: { req: false, prov: false } },
      { id: 'D2', post: 'N01', req: 'u3', prov: 'u2', status: 'VERIFIED', at: '2026-10-22 09:00', msg: '고무나무 분갈이가 필요해요.', date: '2026-11-01 10:00', place: '마포구 동네 공원 입구(공공장소)', price: 0,
        hist: [['REQUESTED', '2026-10-22 09:00', '이*준', '참여 요청'], ['ACCEPTED', '2026-10-22 11:30', '박*연', '수락'], ['VERIFIED', '2026-10-23 10:00', '운영자', '회원 상태·장소 안전 확인 완료']], done: { req: false, prov: false } },
      { id: 'D3', post: 'N02', req: 'u1', prov: 'u3', status: 'REQUESTED', at: '2026-10-27 18:30', msg: '알레르기는 없어요. 토요일 오후에 참여하고 싶어요.', date: '2026-11-07 14:00', place: '서대문구 주민센터 공유주방(공공장소)', price: 8000,
        hist: [['REQUESTED', '2026-10-27 18:30', '김도현', '참여 요청']], done: { req: false, prov: false } },
      { id: 'D4', post: 'N01', req: 'u6', prov: 'u2', status: 'DONE', at: '2026-10-08 10:00', msg: '몬스테라 분갈이를 부탁드려요.', date: '2026-10-12 10:00', place: '은평구 동네 카페(공공장소)', price: 0,
        hist: [['REQUESTED', '2026-10-08 10:00', '한*라', '참여 요청'], ['ACCEPTED', '2026-10-08 12:00', '박*연', '수락'], ['VERIFIED', '2026-10-09 10:30', '운영자', '안전 확인 완료'], ['DONE', '2026-10-12 13:00', '박*연', '양쪽 모두 완료를 확인했어요.']], done: { req: true, prov: true } },
      { id: 'D6', post: 'N03', req: 'u6', prov: 'u4', status: 'DONE', at: '2026-10-09 10:00', msg: '옷장 정리 코칭을 받고 싶어요.', date: '2026-10-12 19:00', place: '은평구 동네 카페(공공장소)', price: 25000,
        hist: [['REQUESTED', '2026-10-09 10:00', '한*라', '참여 요청'], ['ACCEPTED', '2026-10-09 12:00', '최*아', '수락'], ['VERIFIED', '2026-10-10 10:30', '운영자', '안전 확인 완료'], ['VERIFIED', '2026-10-10 18:00', '한*라', '안전결제로 대금을 보관했어요.'], ['DONE', '2026-10-12 21:00', '최*아', '양쪽 모두 완료를 확인했어요.']], done: { req: true, prov: true },
        pay: { st: 'PAID_OUT', gross: 25000, rate: 10, fee: 2500, net: 22500, method: '카드', heldAt: '2026-10-10 18:00', doneAt: '2026-10-12 21:00', due: '2026-10-15', outAt: '2026-10-15 10:00' } },
      { id: 'D8', post: 'N03', req: 'u3', prov: 'u4', status: 'DONE', at: '2026-10-22 09:00', msg: '봄 옷 정리법이 궁금해요.', date: '2026-10-26 19:00', place: '서대문구 주민센터(공공장소)', price: 25000,
        hist: [['REQUESTED', '2026-10-22 09:00', '이*준', '참여 요청'], ['ACCEPTED', '2026-10-22 12:00', '최*아', '수락'], ['VERIFIED', '2026-10-23 10:30', '운영자', '안전 확인 완료'], ['VERIFIED', '2026-10-23 18:00', '이*준', '안전결제로 대금을 보관했어요.'], ['DONE', '2026-10-26 21:00', '이*준', '양쪽 모두 완료를 확인했어요.']], done: { req: true, prov: true },
        pay: { st: 'RELEASE_WAIT', gross: 25000, rate: 10, fee: 2500, net: 22500, method: '계좌이체', heldAt: '2026-10-23 18:00', doneAt: '2026-10-26 21:00', due: '2026-10-29' } },
      { id: 'D9', post: 'N03', req: 'u2', prov: 'u4', status: 'VERIFIED', at: '2026-10-24 09:00', msg: '급하게 옷장 정리가 필요해요.', date: '2026-10-27 19:00', place: '마포구 도서관 카페(공공장소)', price: 25000,
        hist: [['REQUESTED', '2026-10-24 09:00', '박*연', '참여 요청'], ['ACCEPTED', '2026-10-24 12:00', '최*아', '수락'], ['VERIFIED', '2026-10-25 10:30', '운영자', '안전 확인 완료'], ['VERIFIED', '2026-10-25 18:00', '박*연', '안전결제로 대금을 보관했어요.'], ['VERIFIED', '2026-10-27 22:00', '박*연', '분쟁을 접수했어요: 약속한 시간에 나오지 않았어요.']], done: { req: false, prov: false },
        pay: { st: 'DISPUTED', gross: 25000, rate: 10, fee: 2500, net: 22500, method: '카드', heldAt: '2026-10-25 18:00', disputeNote: '약속한 시간에 나오지 않았어요.', disputeAt: '2026-10-27 22:00' } },
      { id: 'D5', post: 'N06', req: 'u4', prov: 'u1', status: 'REQUESTED', at: '2026-10-27 21:00', msg: '글씨체가 예뻐지고 싶어요. 수요일 저녁에 갈 수 있어요.', date: '2026-11-04 19:00', place: '마포구 도서관 스터디룸(공공장소)', price: 0,
        hist: [['REQUESTED', '2026-10-27 21:00', '최*아', '참여 요청']], done: { req: false, prov: false } }
    ],
    reports: [
      { id: 'R1', post: 'N02', by: 'u5', why: '외부 결제·선입금 요구', note: '채팅에서 재료비를 먼저 계좌로 보내라고 했어요.', status: '접수', at: '2026-10-27 16:20', result: '' }
    ]
  };
  var settleSeed = { partner: { 'G2609-0003': { st: 'PAID_OUT', gross: 80000, rate: 20, fee: 16000, net: 64000, outAt: '2026-10-08 10:00' } } };
  return { settleSeed: settleSeed, PAY: PAY, LIMIT: LIMIT, CATS: CATS, POST_ST: POST_ST, DEAL_ST: DEAL_ST, PAY_ST: PAY_ST, FEES: FEES, DEAL_STEPS: DEAL_STEPS, DEAL_AT: DEAL_AT, BANNED: BANNED, POST_CHECK: POST_CHECK, DEAL_CHECK: DEAL_CHECK, REPORT_WHY: REPORT_WHY, seed: seed };
})();
