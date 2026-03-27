// 보안업체 제휴 상수
// ADT캡스 / S1 에스원 연동 준비

export const SECURITY_PARTNERS = {
  adtCaps: {
    name: 'ADT캡스',
    logo: 'shield-checkmark',
    color: '#0066CC',
    phone: '1588-5400',
    website: 'https://www.adtcaps.co.kr',
    services: [
      { id: 'dispatch', name: '긴급 출동', desc: 'SOS 신호 시 가장 가까운 출동 요원 배치', price: '월 29,900원~', icon: 'car' },
      { id: 'cctv', name: 'CCTV 설치', desc: '주거지 현관/복도 CCTV 설치 및 모니터링', price: '설치비 무료 + 월 19,900원~', icon: 'videocam' },
      { id: 'doorlock', name: '스마트 도어락', desc: '침입 감지 + 비밀번호 원격 변경', price: '설치비 포함 199,000원~', icon: 'key' },
      { id: 'patrol', name: '순찰 서비스', desc: '주거지 주변 정기 순찰 (야간)', price: '월 39,900원~', icon: 'walk' },
      { id: 'personal', name: '신변 보호', desc: '전문 보안요원 개인 경호', price: '시간당 50,000원~', icon: 'person' },
    ],
  },
};

export const ANSIM_PACK_TIERS = [
  {
    id: 'basic',
    name: '안심 베이직',
    monthlyPrice: '34,800원/월',
    description: '안전이별 케어 + 캡스 긴급출동',
    color: '#6B8CC7',
    includes: [
      { item: '안전이별 케어 구독', value: '4,900원/월', included: true },
      { item: 'ADT캡스 긴급출동 서비스', value: '29,900원/월', included: true },
      { item: 'SOS → 캡스 출동 자동 연계', value: '', included: true },
      { item: '안전 체크인 미응답 → 출동', value: '', included: true },
      { item: 'CCTV 설치', value: '', included: false },
      { item: '스마트 도어락', value: '', included: false },
      { item: '야간 순찰', value: '', included: false },
    ],
    savings: '별도 가입 대비 월 5,000원 절약',
  },
  {
    id: 'standard',
    name: '안심 스탠다드',
    monthlyPrice: '54,800원/월',
    description: '베이직 + CCTV + 스마트 도어락',
    color: '#C4956A',
    includes: [
      { item: '안전이별 케어 구독', value: '4,900원/월', included: true },
      { item: 'ADT캡스 긴급출동 서비스', value: '29,900원/월', included: true },
      { item: 'SOS → 캡스 출동 자동 연계', value: '', included: true },
      { item: '안전 체크인 미응답 → 출동', value: '', included: true },
      { item: 'CCTV 1대 설치 + 모니터링', value: '19,900원/월', included: true },
      { item: '스마트 도어락 설치', value: '설치비 무료', included: true },
      { item: '야간 순찰', value: '', included: false },
    ],
    savings: '별도 가입 대비 월 15,000원 절약 + 도어락 설치비 무료',
    recommended: true,
  },
  {
    id: 'premium',
    name: '안심 프리미엄',
    monthlyPrice: '89,800원/월',
    description: '올인원 + 야간순찰 + 신변보호',
    color: '#8B6F8E',
    includes: [
      { item: '안전이별 케어 구독', value: '4,900원/월', included: true },
      { item: 'ADT캡스 긴급출동 서비스', value: '29,900원/월', included: true },
      { item: 'SOS → 캡스 출동 자동 연계', value: '', included: true },
      { item: '안전 체크인 미응답 → 출동', value: '', included: true },
      { item: 'CCTV 2대 설치 + 24시 모니터링', value: '', included: true },
      { item: '스마트 도어락 설치', value: '설치비 무료', included: true },
      { item: '야간 순찰 (주 3회)', value: '39,900원/월', included: true },
      { item: '신변보호 월 2회 (4시간)', value: '', included: true },
    ],
    savings: '별도 가입 대비 월 40,000원+ 절약',
  },
];

export const INTEGRATION_FLOW = [
  { step: 1, title: 'SOS 긴급 출동', icon: 'alert-circle', color: '#E07A5F',
    description: '앱에서 SOS 버튼을 누르면 GPS 좌표가 ADT캡스 관제센터에 즉시 전송되어 가장 가까운 출동 요원이 배치됩니다.',
    flow: ['SOS 버튼 클릭', 'GPS 좌표 전송', '캡스 관제센터 수신', '가장 가까운 요원 배치', '평균 5분 내 출동'] },
  { step: 2, title: '안전 체크인 연동', icon: 'alarm', color: '#D4A373',
    description: '설정된 시간에 체크인하지 않으면 자동으로 캡스 관제센터에 알림이 전송됩니다.',
    flow: ['체크인 시간 도래', '미응답 감지 (3분)', '긴급연락처 알림', '캡스 관제센터 통보', '출동 요원 파견'] },
  { step: 3, title: '주거지 보안', icon: 'home', color: '#6B8CC7',
    description: 'CCTV와 스마트 도어락으로 주거지 침입을 실시간 감지하고, 이상 감지 시 즉시 출동합니다.',
    flow: ['CCTV 이상 감지', '스마트 도어락 침입 시도 감지', '캡스 관제센터 자동 알림', '출동 + 경찰 동시 신고', '영상 증거 자동 보존'] },
  { step: 4, title: '이별 경호 연계', icon: 'shield', color: '#7A9E7E',
    description: '이별 경호 서비스 신청 시 캡스 신변보호 전문 요원이 배정됩니다.',
    flow: ['경호 서비스 신청', '캡스 보안요원 배정', '사전 장소 점검', '현장 동행 보호', '안전 귀가 확인'] },
];

export const PROPOSAL_STATS = {
  stalkingReports: '120,000+건/년',
  victimFemale: '76.2%',
  age2030: '78.7%',
  singleHousehold: '740만 가구',
  digitalCrime: '10,305명/년',
  marketGap: '물리적 보안 연계 법률 앱: 0개',
};
