// 법률 규정 관련 상수 — 변호사법 & 광고 규정 준수
export const LEGAL = {
  // 법률사무소 정보
  firmName: '법률사무소 청송',
  lawyerName: '김창희',
  lawyerTitle: '대표변호사',
  firmFull: '법률사무소 청송 / 대표변호사 김창희',

  // 면책 조항
  disclaimer: '본 서비스에서 제공하는 정보는 일반적인 법률 안내이며, 구체적인 법률 조언을 대체할 수 없습니다. 정확한 법률자문은 변호사에게 문의하세요.',
  aiDisclaimer: '검토: 김창희 변호사 (법률사무소 청송)',
  chatbotDisclaimer: '이 챗봇은 법률정보 안내 챗봇입니다. AI가 생성한 답변은 김창희 변호사가 검토하였습니다.',

  // 서비스 명칭 규정
  // ❌ 금지: "무료 상담", "무료 진단", "AI 법률상담"
  // ✅ 허용: "위험도 자가진단", "법률정보 안내 챗봇", "변호사 명의 법률 경고장"
  diagnosisLabel: '위험도 자가진단',
  chatbotLabel: '법률정보 안내 챗봇',
  letterLabel: {
    email: '변호사 명의 법률 경고장',
    sns: '변호사 명의 법률 경고장',
    mail: '내용증명',
  },

  // 긴급 연락처
  emergency: {
    police: '112',
    womenHotline: '1366',
    stalkingReport: '112 (스토킹 신고)',
    legalAid: '132 (법률구조공단)',
  },
};

// SOS 긴급 연락처 목록
export const SOS_CONTACTS = [
  { label: '경찰 신고', number: '112', icon: 'shield', color: '#e85d4a' },
  { label: '여성긴급전화', number: '1366', icon: 'phone', color: '#c9a84c' },
  { label: '법률구조공단', number: '132', icon: 'scale', color: '#4a7fe0' },
  { label: '디지털성범죄 피해자 지원센터', number: '02-735-8994', icon: 'lock', color: '#7a9e7e' },
];

// 진단 질문 목록
export const DIAGNOSIS_QUESTIONS = [
  {
    id: 1,
    category: '통제 행동',
    question: '상대방이 당신의 휴대폰을 검사하거나 SNS를 감시합니까?',
    weight: 2,
  },
  {
    id: 2,
    category: '통제 행동',
    question: '상대방이 당신의 외출이나 친구 만남을 제한합니까?',
    weight: 2,
  },
  {
    id: 3,
    category: '언어적 폭력',
    question: '상대방이 당신을 모욕하거나 무시하는 말을 합니까?',
    weight: 1.5,
  },
  {
    id: 4,
    category: '협박',
    question: '"헤어지면 죽겠다" 또는 자해/자살을 암시합니까?',
    weight: 3,
  },
  {
    id: 5,
    category: '협박',
    question: '이별을 말하면 사진/영상 유포를 협박합니까?',
    weight: 3,
  },
  {
    id: 6,
    category: '물리적 폭력',
    question: '밀치기, 물건 던지기 등 물리적 폭력이 있었습니까?',
    weight: 3,
  },
  {
    id: 7,
    category: '스토킹',
    question: '이별 후 지속적으로 연락하거나 찾아옵니까?',
    weight: 2.5,
  },
  {
    id: 8,
    category: '스토킹',
    question: '당신의 위치를 추적하거나 미행합니까?',
    weight: 3,
  },
  {
    id: 9,
    category: '디지털 폭력',
    question: '동의 없이 사진/영상을 촬영하거나 보관합니까?',
    weight: 2.5,
  },
  {
    id: 10,
    category: '경제적 통제',
    question: '당신의 경제 활동을 통제하거나 빚을 강요합니까?',
    weight: 2,
  },
];

// 위험도 레벨 정의
export const RISK_LEVELS = {
  low: {
    label: '주의 단계',
    color: '#7a9e7e',
    emoji: '🟢',
    description: '현재 큰 위험은 아니지만, 관계 내 경계 설정이 필요합니다.',
    recommendation: '안전 이별 체크리스트를 확인하고, 이별 전 준비사항을 점검하세요.',
  },
  medium: {
    label: '경계 단계',
    color: '#e8a84c',
    emoji: '🟡',
    description: '데이트폭력의 초기 징후가 보입니다. 전문가 상담을 권합니다.',
    recommendation: '법률 경고장 발송을 고려하고, 증거를 수집하세요.',
  },
  high: {
    label: '위험 단계',
    color: '#e85d4a',
    emoji: '🔴',
    description: '즉각적인 법적 조치와 안전 확보가 필요합니다.',
    recommendation: '변호사 상담과 내용증명 발송을 즉시 진행하세요. 필요시 경찰에 신고하세요.',
  },
  critical: {
    label: '긴급 단계',
    color: '#c94535',
    emoji: '🚨',
    description: '생명의 위협이 있을 수 있습니다. 즉시 안전한 장소로 이동하세요.',
    recommendation: '지금 바로 112에 신고하고, 안전한 장소로 대피하세요.',
  },
};

// 체크리스트 항목
export const SAFETY_CHECKLIST = [
  { id: 1, category: '증거 확보', text: '카카오톡/문자 대화 캡처 완료', icon: 'camera' },
  { id: 2, category: '증거 확보', text: '통화 녹음 확보 (합법적 범위)', icon: 'mic' },
  { id: 3, category: '증거 확보', text: '폭행/협박 증거 사진 확보', icon: 'image' },
  { id: 4, category: '법적 준비', text: '법률 경고장 발송 여부 검토', icon: 'mail' },
  { id: 5, category: '법적 준비', text: '경찰 신고 여부 검토', icon: 'shield' },
  { id: 6, category: '법적 준비', text: '접근금지 가처분 검토', icon: 'ban' },
  { id: 7, category: '안전 확보', text: '안전한 거처 확보 (가족/지인/쉼터)', icon: 'home' },
  { id: 8, category: '안전 확보', text: '비상 연락망 구성', icon: 'users' },
  { id: 9, category: '디지털 안전', text: 'SNS 비공개 설정', icon: 'lock' },
  { id: 10, category: '디지털 안전', text: '위치 공유 해제', icon: 'map-pin' },
  { id: 11, category: '디지털 안전', text: '비밀번호 전체 변경', icon: 'key' },
  { id: 12, category: '재정', text: '공동 계좌 분리', icon: 'dollar-sign' },
];

// 구독 플랜
export const SUBSCRIPTION_PLANS = [
  {
    id: 'light',
    name: '보호우산 라이트',
    monthlyPrice: 2900,
    annualMonthlyPrice: 2400,
    priceLabel: '2,900원',
    annualPriceLabel: '2,400원',
    period: '/월',
    tagline: '커피 한잔 값으로 법률 보호',
    features: [
      'AI 사무장 24시간 법률 상담',
      '위험도 자가진단',
      '증거보관함 무제한',
      '안전 이별 체크리스트',
      'SOS 긴급 연락처',
    ],
    color: '#c9a84c',
    recommended: true,
    active: true,
  },
  {
    id: 'care',
    name: '보호우산 케어플랜',
    monthlyPrice: 9900,
    annualMonthlyPrice: 6900,
    priceLabel: '9,900원',
    annualPriceLabel: '6,900원',
    period: '/월',
    tagline: '변호사 상담까지 한번에',
    features: [
      '보호우산 라이트 전체 포함',
      '월 1회 변호사 텍스트 상담',
      '우선 법률 상담 예약',
      '맞춤 법률문서 자동생성',
      '디지털 안전 점검',
    ],
    color: '#8b5cf6',
    recommended: false,
    active: false, // Phase 2에서 활성화
    comingSoonLabel: '곧 출시',
  },
];

export const ADDON_SERVICES = [
  { id: 'consult', name: '변호사 상담 (10분)', price: 70000, priceLabel: '70,000원', icon: 'call-outline' },
  { id: 'letter_email', name: '법률 경고장 (이메일/SNS)', price: 49000, priceLabel: '49,000원', icon: 'mail-outline' },
  { id: 'letter_mail', name: '내용증명 (우편)', price: 99000, priceLabel: '99,000원', icon: 'document-text-outline' },
];

// 챗봇 FAQ 데이터
export const CHATBOT_FAQ = [
  {
    id: 1,
    question: '데이트폭력을 당하고 있어요. 어떻게 해야 하나요?',
    answer: '먼저 안전한 장소를 확보하세요. 112에 신고하거나 여성긴급전화 1366에 연락하실 수 있습니다. 증거(대화 캡처, 사진, 녹음)를 확보하시고, 변호사에게 상담을 요청하시면 법적 대응 방법을 안내받을 수 있습니다.',
    category: '긴급',
  },
  {
    id: 2,
    question: '내용증명을 보내면 효과가 있나요?',
    answer: '내용증명은 법적 의사표시를 공식적으로 기록하는 효과가 있습니다. 상대방에게 법적 경고의 의미가 있으며, 향후 소송에서 증거로 활용됩니다. 많은 경우 내용증명 발송만으로도 상대방의 부당한 행위가 중단됩니다.',
    category: '법률경고장',
  },
  {
    id: 3,
    question: '스토킹처벌법이 어떻게 바뀌었나요?',
    answer: '2023년 개정 스토킹처벌법에 따르면, 스토킹 행위는 3년 이하의 징역 또는 3천만원 이하의 벌금에 처해질 수 있습니다. 반복적인 접근, 연락, 미행, 위치추적 등이 스토킹에 해당하며, 피해자가 신고하면 경찰이 즉시 긴급응급조치를 취할 수 있습니다.',
    category: '법률정보',
  },
  {
    id: 4,
    question: '헤어지자고 하면 "죽겠다"고 협박해요.',
    answer: '자해·자살 협박은 정서적 폭력이며 협박죄에 해당할 수 있습니다. 상대방의 협박 내용을 캡처/녹음하여 증거로 보관하세요. 변호사 명의 법률 경고장을 통해 법적 경고를 보낼 수 있으며, 상대방이 실제 자해 시 119에 신고하시면 됩니다. 상대방의 선택은 당신의 책임이 아닙니다.',
    category: '협박대응',
  },
  {
    id: 5,
    question: '사진/영상 유포 협박을 받고 있어요.',
    answer: '이는 성폭력처벌법상 촬영물 이용 협박죄에 해당하며, 최대 3년 이하 징역에 처해질 수 있습니다. 즉시 증거를 확보하고, 디지털성범죄 피해자 지원센터(02-735-8994)에 연락하세요. 변호사를 통한 법적 대응과 함께 유포 방지 조치를 취할 수 있습니다.',
    category: '디지털성범죄',
  },
  {
    id: 6,
    question: '이별 후 접근금지를 법적으로 요청할 수 있나요?',
    answer: '네, 스토킹처벌법에 따라 법원에 접근금지 가처분을 신청할 수 있습니다. 또한 경찰에 스토킹 신고 시 긴급응급조치로 접근금지가 가능합니다. 내용증명을 통해 접근금지 의사를 공식적으로 통보하는 것이 첫 단계입니다.',
    category: '법률정보',
  },
];
