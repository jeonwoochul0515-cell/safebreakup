// 스토킹 대응 모듈 상수
// 검토: 김창희 변호사 (법률사무소 청송)

export const INCIDENT_CATEGORIES = [
  { key: 'approach', label: '대면 접근', icon: 'walk', color: '#C4634B' },
  { key: 'follow', label: '미행/추적', icon: 'footsteps', color: '#E07A5F' },
  { key: 'call', label: '전화/문자', icon: 'call', color: '#D4A373' },
  { key: 'online', label: 'SNS/온라인', icon: 'globe', color: '#6B8CC7' },
  { key: 'mail', label: '택배/우편/선물', icon: 'gift', color: '#8B6F8E' },
  { key: 'visit', label: '직장/학교 방문', icon: 'business', color: '#E07A5F' },
  { key: 'proxy', label: '제3자 이용', icon: 'people', color: '#D4A373' },
  { key: 'other', label: '기타', icon: 'ellipsis-horizontal', color: '#7A7584' },
];

export const SEVERITY_LEVELS = [
  { level: 1, label: '경미', emoji: '😐', color: '#7A9E7E' },
  { level: 2, label: '불안', emoji: '😟', color: '#D4A373' },
  { level: 3, label: '위협', emoji: '😰', color: '#E07A5F' },
  { level: 4, label: '위험', emoji: '😨', color: '#C4634B' },
  { level: 5, label: '긴급', emoji: '🆘', color: '#C4634B' },
];

export const DIGITAL_SECURITY_AUDIT = [
  {
    platform: '구글 계정',
    icon: 'logo-google',
    color: '#4285F4',
    items: [
      { id: 'g1', label: '비밀번호 변경', priority: 'high' as const },
      { id: 'g2', label: '2단계 인증 설정', priority: 'high' as const },
      { id: 'g3', label: '연결된 기기 확인 및 로그아웃', priority: 'high' as const },
      { id: 'g4', label: '위치 기록 끄기', priority: 'medium' as const },
      { id: 'g5', label: '계정 복구 이메일/번호 확인', priority: 'medium' as const },
    ],
  },
  {
    platform: '애플 계정',
    icon: 'logo-apple',
    color: '#333333',
    items: [
      { id: 'a1', label: 'Apple ID 비밀번호 변경', priority: 'high' as const },
      { id: 'a2', label: '나의 찾기(Find My) 공유 해제', priority: 'high' as const },
      { id: 'a3', label: '가족 공유 확인', priority: 'medium' as const },
      { id: 'a4', label: '신뢰하는 기기 목록 확인', priority: 'medium' as const },
    ],
  },
  {
    platform: '카카오톡',
    icon: 'chatbubble-ellipses',
    color: '#FEE500',
    items: [
      { id: 'k1', label: '카카오계정 비밀번호 변경', priority: 'high' as const },
      { id: 'k2', label: '다른 기기 로그인 확인', priority: 'high' as const },
      { id: 'k3', label: '프로필 공개 범위 설정', priority: 'medium' as const },
      { id: 'k4', label: '차단 및 신고', priority: 'medium' as const },
      { id: 'k5', label: '오픈채팅 프로필 확인', priority: 'low' as const },
    ],
  },
  {
    platform: '인스타그램',
    icon: 'logo-instagram',
    color: '#E1306C',
    items: [
      { id: 'i1', label: '비밀번호 변경', priority: 'high' as const },
      { id: 'i2', label: '비공개 계정 전환', priority: 'high' as const },
      { id: 'i3', label: '팔로워 목록 정리', priority: 'medium' as const },
      { id: 'i4', label: '위치 태그 제거', priority: 'medium' as const },
      { id: 'i5', label: '로그인 활동 확인', priority: 'high' as const },
    ],
  },
  {
    platform: '네이버',
    icon: 'reader',
    color: '#03C75A',
    items: [
      { id: 'n1', label: '비밀번호 변경', priority: 'high' as const },
      { id: 'n2', label: '로그인 이력 확인', priority: 'high' as const },
      { id: 'n3', label: '네이버 페이 설정 확인', priority: 'medium' as const },
      { id: 'n4', label: '블로그/카페 활동 확인', priority: 'low' as const },
    ],
  },
  {
    platform: '통신사',
    icon: 'cellular',
    color: '#E07A5F',
    items: [
      { id: 't1', label: '통신사 계정 비밀번호 변경', priority: 'high' as const },
      { id: 't2', label: '착신전환 설정 확인', priority: 'high' as const },
      { id: 't3', label: '부가서비스 확인 (위치추적 등)', priority: 'high' as const },
      { id: 't4', label: 'USIM 잠금 설정', priority: 'medium' as const },
    ],
  },
  {
    platform: '금융 계정',
    icon: 'card',
    color: '#6B8CC7',
    items: [
      { id: 'b1', label: '인터넷뱅킹 비밀번호 변경', priority: 'high' as const },
      { id: 'b2', label: '공동인증서 재발급', priority: 'medium' as const },
      { id: 'b3', label: '자동이체 내역 확인', priority: 'medium' as const },
      { id: 'b4', label: '카드 알림 설정 확인', priority: 'low' as const },
    ],
  },
  {
    platform: '스마트홈 기기',
    icon: 'home',
    color: '#8B6F8E',
    items: [
      { id: 's1', label: 'Wi-Fi 비밀번호 변경', priority: 'high' as const },
      { id: 's2', label: '스마트 도어락 비밀번호 변경', priority: 'high' as const },
      { id: 's3', label: 'CCTV/IP카메라 접근 권한 확인', priority: 'high' as const },
      { id: 's4', label: '블루투스 기기 페어링 해제', priority: 'medium' as const },
    ],
  },
];

export const STALKERWARE_SIGNS = [
  { id: 1, title: '비정상적 배터리 소모', description: '평소보다 배터리가 빠르게 줄어듭니다.', icon: 'battery-dead', checkMethod: '설정 > 배터리에서 앱별 사용량을 확인하세요.' },
  { id: 2, title: '데이터 사용량 급증', description: '모르는 사이 데이터가 많이 사용됩니다.', icon: 'cellular', checkMethod: '설정 > 데이터 사용량에서 의심스러운 앱을 확인하세요.' },
  { id: 3, title: '기기 과열', description: '사용하지 않는데도 기기가 뜨거워집니다.', icon: 'thermometer', checkMethod: '백그라운드에서 실행 중인 앱을 확인하세요.' },
  { id: 4, title: '낯선 앱 발견', description: '설치하지 않은 앱이 있습니다.', icon: 'apps', checkMethod: '설치된 앱 목록을 주의 깊게 확인하세요. 시스템 앱처럼 위장한 앱이 있을 수 있습니다.' },
  { id: 5, title: '기기 자동 재시작', description: '기기가 저절로 꺼지거나 켜집니다.', icon: 'power', checkMethod: '원격으로 기기를 제어하는 앱이 설치되어 있을 수 있습니다.' },
  { id: 6, title: '이상한 소리/알림', description: '통화 중 이상한 소리가 들리거나 의심스러운 알림이 옵니다.', icon: 'volume-high', checkMethod: '통화 녹음 앱이 설치되어 있을 수 있습니다.' },
  { id: 7, title: '알 수 없는 문자', description: '의미 없는 숫자나 기호가 포함된 문자를 받습니다.', icon: 'chatbox', checkMethod: '이는 스토커웨어의 원격 명령일 수 있습니다.' },
  { id: 8, title: '상대방이 알 수 없는 정보를 앎', description: '말하지 않은 내용을 상대방이 알고 있습니다.', icon: 'eye', checkMethod: '이는 감시 소프트웨어가 설치되어 있다는 가장 확실한 증거입니다.' },
];

export const LEGAL_PROCESS_STEPS = [
  { step: 1, title: '증거 수집 및 정리', description: '모든 스토킹 행위를 날짜, 시간, 장소와 함께 기록하세요. 문자, 카톡, CCTV 영상, 목격자 진술 등을 확보하세요.', duration: '1~2주', documents: ['사건 기록 일지', '스크린샷/녹음 파일', '목격자 연락처'] },
  { step: 2, title: '경찰 신고 (112)', description: '스토킹 행위를 112에 신고하세요. 2024년 개정법에 따라 피해자 동의 없이도 수사가 진행됩니다.', duration: '당일', documents: ['신분증', '증거 자료', '피해 경위서'] },
  { step: 3, title: '스토킹 피해 진술서 작성', description: '경찰에서 상세한 피해 진술서를 작성합니다. 구체적인 날짜와 행위를 중심으로 진술하세요.', duration: '1~3일', documents: ['사건 기록 일지', '타임라인 정리'] },
  { step: 4, title: '접근금지 가처분 신청', description: '법원에 스토킹 행위자에 대한 접근금지 가처분을 신청합니다. 변호사의 도움을 받으면 더 효과적입니다.', duration: '1~2주', documents: ['신청서', '증거 서류', '진단서(있는 경우)'] },
  { step: 5, title: '법원 심리', description: '법원이 양측의 의견을 듣고 접근금지명령 여부를 결정합니다.', duration: '2~4주', documents: ['추가 증거', '진술서'] },
  { step: 6, title: '명령 발부 및 이행 감시', description: '접근금지명령이 발부되면, 위반 시 형사처벌(2년 이하 징역)됩니다. 2024년 개정법에 따라 전자발찌 부착도 가능합니다.', duration: '즉시', documents: ['명령서 사본 보관'] },
];

export const SAFE_PLACES_DATA = [
  {
    category: '쉼터',
    icon: 'home',
    color: '#E07A5F',
    places: [
      { name: '서울 여성긴급전화 1366센터', address: '서울특별시 중구', phone: '1366', hours: '24시간', description: '긴급 상담 및 쉼터 연계' },
      { name: '한국여성의전화 쉼터', address: '서울특별시 마포구', phone: '02-2263-6464', hours: '24시간', description: '가정폭력 피해여성 보호시설' },
      { name: '서울시 여성보호시설', address: '서울특별시 영등포구', phone: '02-2670-7800', hours: '24시간', description: '긴급 대피 및 중장기 보호' },
    ],
  },
  {
    category: '경찰서',
    icon: 'shield',
    color: '#6B8CC7',
    places: [
      { name: '서울경찰청 여성청소년수사팀', address: '서울특별시 종로구', phone: '112', hours: '24시간', description: '스토킹/데이트폭력 전담 수사' },
      { name: '서울 강남경찰서', address: '서울특별시 강남구 테헤란로 114길', phone: '02-3461-0112', hours: '24시간', description: '여성안전 전담팀 운영' },
      { name: '서울 서초경찰서', address: '서울특별시 서초구', phone: '02-3475-0112', hours: '24시간', description: '스토킹 전담 수사관 배치' },
    ],
  },
  {
    category: '병원',
    icon: 'medkit',
    color: '#7A9E7E',
    places: [
      { name: '서울해바라기센터 (거점)', address: '서울특별시 송파구', phone: '02-3400-1700', hours: '24시간', description: '성폭력/가정폭력 통합 지원 (의료·상담·법률)' },
      { name: '은평해바라기센터', address: '서울특별시 은평구', phone: '02-3141-9781', hours: '월-금 9-18시', description: '의료·심리·법률 통합 지원' },
      { name: '서울대병원 응급실', address: '서울특별시 종로구', phone: '02-2072-2114', hours: '24시간', description: '외상 치료 및 진단서 발급' },
    ],
  },
  {
    category: '상담센터',
    icon: 'chatbubble-ellipses',
    color: '#8B6F8E',
    places: [
      { name: '서울 스토킹피해자 원스톱지원센터', address: '서울특별시 중구', phone: '02-2100-2994', hours: '월-금 9-18시', description: '상담·법률·의료 원스톱 지원' },
      { name: '한국여성인권진흥원', address: '서울특별시 중구', phone: '02-735-8994', hours: '24시간', description: '디지털 성범죄 피해자 지원(D4U)' },
      { name: '서울시 여성안심특별시 상담센터', address: '서울특별시 중구', phone: '02-120', hours: '월-금 9-18시', description: '여성 안전 관련 종합 상담' },
    ],
  },
  {
    category: '24시간 공공장소',
    icon: 'storefront',
    color: '#D4A373',
    places: [
      { name: '편의점 (GS25, CU, 세븐일레븐)', address: '전국', phone: '112', hours: '24시간', description: 'CCTV 있음, 직원에게 도움 요청 가능' },
      { name: '지하철역 안전지킴이', address: '서울 지하철 전역', phone: '112', hours: '운행시간', description: '비상벨, 안전지킴이 상주' },
      { name: '소방서', address: '전국', phone: '119', hours: '24시간', description: '응급 상황 시 대피 가능' },
    ],
  },
];
