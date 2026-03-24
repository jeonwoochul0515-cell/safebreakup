// 경제적 학대 모듈 상수
// 검토: 김창희 변호사 (법률사무소 청송)

export const FINANCIAL_ABUSE_QUESTIONS = [
  { id: 1, question: '상대방이 당신의 월급이나 수입을 가져가거나 관리하나요?', weight: 3 },
  { id: 2, question: '생활비를 주지 않거나 극도로 제한하나요?', weight: 3 },
  { id: 3, question: '당신 명의로 빚을 지게 하나요?', weight: 3 },
  { id: 4, question: '지출 내역을 일일이 보고하게 하나요?', weight: 2 },
  { id: 5, question: '취업이나 경제활동을 방해하나요?', weight: 3 },
  { id: 6, question: '당신의 통장이나 카드를 압수했나요?', weight: 3 },
  { id: 7, question: '중요한 재정 결정에서 당신을 배제하나요?', weight: 2 },
  { id: 8, question: '당신의 재산이나 소유물을 함부로 처분하나요?', weight: 2 },
  { id: 9, question: '돈을 이용해 당신의 행동을 통제하나요?', weight: 3 },
  { id: 10, question: '당신에게 경제적 능력이 없다고 비하하나요?', weight: 2 },
  { id: 11, question: '공과금이나 생활비를 당신에게만 부담시키나요?', weight: 2 },
  { id: 12, question: '당신의 교육이나 자기개발을 막나요?', weight: 2 },
];

export const FINANCIAL_RISK_LEVELS = [
  { key: 'low', label: '경미', range: [0, 8] as [number, number], color: '#7A9E7E', description: '경제적 학대 징후가 낮습니다.' },
  { key: 'moderate', label: '주의', range: [9, 16] as [number, number], color: '#D4A373', description: '경제적 통제의 징후가 있습니다. 재정 독립을 준비하세요.' },
  { key: 'severe', label: '심각', range: [17, 24] as [number, number], color: '#E07A5F', description: '심각한 경제적 학대가 진행 중입니다. 전문가 상담이 필요합니다.' },
  { key: 'extreme', label: '긴급', range: [25, 36] as [number, number], color: '#C4634B', description: '극심한 경제적 착취 상황입니다. 즉시 법률 지원을 받으세요.' },
];

export const ESSENTIAL_DOCUMENTS = [
  {
    category: '신분증류',
    icon: 'id-card' as const,
    items: [
      { id: 'd1', label: '주민등록증/운전면허증', checked: false },
      { id: 'd2', label: '여권', checked: false },
      { id: 'd3', label: '주민등록등본/초본', checked: false },
      { id: 'd4', label: '가족관계증명서', checked: false },
    ],
  },
  {
    category: '금융 서류',
    icon: 'card' as const,
    items: [
      { id: 'f1', label: '본인 명의 통장/카드', checked: false },
      { id: 'f2', label: '신용정보 조회 내역', checked: false },
      { id: 'f3', label: '보험 증서', checked: false },
      { id: 'f4', label: '급여명세서/소득증명', checked: false },
    ],
  },
  {
    category: '부동산/계약',
    icon: 'home' as const,
    items: [
      { id: 'r1', label: '임대차계약서', checked: false },
      { id: 'r2', label: '등기부등본', checked: false },
      { id: 'r3', label: '자동차 등록증', checked: false },
    ],
  },
  {
    category: '기타 중요 서류',
    icon: 'document-text' as const,
    items: [
      { id: 'o1', label: '의료기록/진단서', checked: false },
      { id: 'o2', label: '경찰 신고 접수증', checked: false },
      { id: 'o3', label: '법원 보호명령서', checked: false },
      { id: 'o4', label: '아이 학교/어린이집 서류', checked: false },
    ],
  },
];

export const WELFARE_PROGRAMS = [
  {
    name: '긴급복지지원',
    description: '위기 상황에 처한 사람에게 생계·의료·주거 등 긴급 지원',
    eligibility: '가정폭력 피해자, 소득 기준 충족 시',
    contact: '129 (보건복지콜센터)',
    icon: 'heart' as const,
  },
  {
    name: '한부모가족 지원',
    description: '아동양육비, 교육비, 생활보조금 지원',
    eligibility: '만 18세 미만 자녀를 양육하는 한부모',
    contact: '여성가족부 1644-6621',
    icon: 'people' as const,
  },
  {
    name: '폭력피해여성 쉼터',
    description: '안전한 주거 공간 및 상담, 법률 지원',
    eligibility: '가정폭력·성폭력 피해 여성',
    contact: '1366 (여성긴급전화)',
    icon: 'home' as const,
  },
  {
    name: '국민취업지원제도',
    description: '취업 상담, 직업훈련, 구직촉진수당 지원',
    eligibility: '취업을 희망하는 만 15-69세',
    contact: '고용노동부 1350',
    icon: 'briefcase' as const,
  },
  {
    name: '법률구조공단 무료 법률 지원',
    description: '소송 대리, 법률 상담 무료 지원',
    eligibility: '기초생활수급자, 가정폭력 피해자',
    contact: '132 (법률구조공단)',
    icon: 'scale' as const,
  },
  {
    name: '피해자 국선변호사',
    description: '성폭력·가정폭력 피해자 전담 국선변호사 선정',
    eligibility: '성폭력·가정폭력 피해자',
    contact: '대한법률구조공단 132',
    icon: 'person' as const,
  },
];

export const SECRET_SAVINGS_TIPS = [
  {
    title: '비밀 계좌 개설',
    description: '새로운 은행에서 비대면으로 본인 명의 계좌를 개설하세요. 우편물 수령지를 신뢰할 수 있는 가족 주소로 설정하세요.',
    icon: 'wallet' as const,
    warning: '기존 은행 앱에서 다른 은행 계좌가 보이지 않도록 주의하세요.',
  },
  {
    title: '소액 분산 저축',
    description: '장보기, 생활비 등에서 소액(5,000~10,000원)씩 현금을 확보하고, 안전한 곳에 보관하세요.',
    icon: 'cash' as const,
    warning: '한 번에 큰 금액을 인출하면 의심받을 수 있습니다.',
  },
  {
    title: '신뢰할 수 있는 사람에게 맡기기',
    description: '가족이나 친한 친구에게 비상금을 맡겨두세요. 구두가 아닌 서면(메모)으로 금액을 기록해두세요.',
    icon: 'people' as const,
    warning: '상대방이 아는 사람에게는 맡기지 마세요.',
  },
  {
    title: '디지털 흔적 관리',
    description: '비밀 계좌의 앱을 설치하지 않거나, 이별방패 은밀모드 안에서만 접근하세요. 브라우저 기록을 삭제하세요.',
    icon: 'eye-off' as const,
    warning: '자동 로그인, 알림 설정을 반드시 해제하세요.',
  },
  {
    title: '정부 지원금 확인',
    description: '긴급복지지원, 한부모가족 지원 등 정부 보조금을 미리 확인하고, 탈출 후 즉시 신청할 수 있도록 준비하세요.',
    icon: 'flag' as const,
    warning: '지원금 신청은 안전한 상황이 확보된 후에 진행하세요.',
  },
];
