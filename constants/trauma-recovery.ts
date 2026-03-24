// 트라우마 회복 모듈 상수

export const GROUNDING_EXERCISES = [
  {
    id: 'five-senses',
    title: '5-4-3-2-1 감각 기법',
    icon: 'hand-left',
    color: '#7A9E7E',
    duration: '5분',
    description: '다섯 가지 감각을 활용하여 현재 순간에 집중하는 기법입니다.',
    steps: [
      { sense: '시각', count: 5, instruction: '지금 보이는 것 5가지를 말해보세요.', example: '천장, 창문, 내 손, 책상, 컵' },
      { sense: '촉각', count: 4, instruction: '지금 만져지는 것 4가지를 느껴보세요.', example: '의자의 감촉, 옷의 질감, 바닥의 온도, 머리카락' },
      { sense: '청각', count: 3, instruction: '지금 들리는 소리 3가지를 찾아보세요.', example: '에어컨 소리, 시계 소리, 바깥 소리' },
      { sense: '후각', count: 2, instruction: '지금 맡을 수 있는 냄새 2가지를 찾아보세요.', example: '커피 향, 비누 냄새' },
      { sense: '미각', count: 1, instruction: '지금 느낄 수 있는 맛 1가지를 느껴보세요.', example: '물의 맛, 입안의 느낌' },
    ],
  },
  {
    id: 'box-breathing',
    title: '박스 호흡법',
    icon: 'fitness',
    color: '#6B8CC7',
    duration: '3~5분',
    description: '4초씩 네 단계로 호흡하여 자율신경계를 안정시키는 기법입니다.',
    phases: [
      { name: '들이쉬기', duration: 4, instruction: '코로 천천히 숨을 들이쉽니다.' },
      { name: '참기', duration: 4, instruction: '숨을 편안하게 참습니다.' },
      { name: '내쉬기', duration: 4, instruction: '입으로 천천히 숨을 내쉽니다.' },
      { name: '쉬기', duration: 4, instruction: '자연스럽게 쉽니다.' },
    ],
  },
  {
    id: 'butterfly-hug',
    title: '나비 포옹',
    icon: 'heart',
    color: '#E07A5F',
    duration: '3분',
    description: '양쪽 어깨를 교대로 두드려 양측성 자극을 주는 기법(EMDR 기반)입니다.',
    steps: [
      '편안한 자세로 앉으세요.',
      '양팔을 가슴 위에서 교차하여 손을 반대쪽 어깨에 올리세요.',
      '나비 날개처럼 양손을 번갈아 가볍게 두드리세요.',
      '천천히, 리듬감 있게 좌우를 번갈아 두드립니다.',
      '눈을 감고 안전한 장소를 떠올리며 계속하세요.',
      '마음이 편안해질 때까지 1~3분간 계속합니다.',
    ],
  },
  {
    id: 'safe-place',
    title: '안전한 장소 시각화',
    icon: 'sunny',
    color: '#D4A373',
    duration: '5분',
    description: '상상 속의 안전한 장소를 떠올려 마음의 안정을 찾는 기법입니다.',
    guide: [
      '편안한 자세로 앉거나 누워주세요.',
      '눈을 감고, 천천히 세 번 깊게 숨을 쉬세요.',
      '당신이 가장 안전하고 편안하다고 느끼는 장소를 떠올려보세요.',
      '그 장소의 색깔, 빛, 온도를 느껴보세요.',
      '그곳의 소리를 들어보세요. 어떤 소리가 들리나요?',
      '그곳의 향기를 맡아보세요.',
      '그곳에서 느끼는 평화로움을 온몸으로 느껴보세요.',
      '이 장소는 언제든 돌아올 수 있는 당신만의 공간입니다.',
    ],
  },
  {
    id: 'body-scan',
    title: '바디 스캔',
    icon: 'body',
    color: '#8B6F8E',
    duration: '5~10분',
    description: '몸의 각 부위에 순서대로 주의를 기울여 긴장을 풀어주는 명상입니다.',
    bodyParts: [
      { area: '머리', instruction: '머리 꼭대기에 주의를 기울여보세요. 긴장이 있다면 숨을 내쉬며 풀어주세요.' },
      { area: '얼굴', instruction: '이마, 눈, 볼, 턱의 긴장을 느껴보세요. 부드럽게 이완합니다.' },
      { area: '목/어깨', instruction: '목과 어깨에 쌓인 긴장을 느껴보세요. 어깨를 살짝 내려놓습니다.' },
      { area: '팔/손', instruction: '양팔과 손끝까지 따뜻한 에너지가 흐르는 것을 느껴보세요.' },
      { area: '가슴/등', instruction: '호흡에 따라 가슴이 오르내리는 것을 느껴보세요.' },
      { area: '배', instruction: '배에 손을 올리고, 호흡과 함께 부드럽게 움직이는 것을 느껴보세요.' },
      { area: '다리', instruction: '허벅지, 무릎, 종아리의 무게를 느껴보세요.' },
      { area: '발', instruction: '발바닥이 바닥에 닿는 감각을 느껴보세요. 안정감을 느낍니다.' },
    ],
  },
];

// PHQ-9 한국어 검증 버전
export const PHQ9_QUESTIONS = [
  { id: 1, question: '일 또는 여가 활동을 하는 데 흥미나 즐거움을 느끼지 못함' },
  { id: 2, question: '기분이 가라앉거나, 우울하거나, 희망이 없음' },
  { id: 3, question: '잠이 들거나 계속 잠을 자는 것이 어려움, 또는 너무 많이 잠' },
  { id: 4, question: '피곤하다고 느끼거나 기운이 거의 없음' },
  { id: 5, question: '입맛이 없거나 과식을 함' },
  { id: 6, question: '자신을 부정적으로 봄 — 혹은 자신이 실패자라고 느끼거나 자신 또는 가족을 실망시킴' },
  { id: 7, question: '신문을 읽거나 텔레비전 보는 것과 같은 일에 집중하기 어려움' },
  { id: 8, question: '다른 사람들이 눈치챌 정도로 너무 느리게 움직이거나 말을 함. 또는 반대로 평상시보다 많이 움직여서 안절부절못하거나 들떠 있음' },
  { id: 9, question: '자신이 죽는 것이 더 낫다고 생각하거나 어떤 식으로든 자신을 해칠 것이라고 생각함' }, // CRITICAL - Q9
];

export const PHQ9_OPTIONS = [
  { value: 0, label: '전혀 아님' },
  { value: 1, label: '며칠간' },
  { value: 2, label: '절반 이상' },
  { value: 3, label: '거의 매일' },
];

export const PHQ9_LEVELS = [
  { key: 'minimal', label: '정상', range: [0, 4] as [number, number], color: '#7A9E7E', description: '현재 우울 증상이 거의 없습니다.', recommendation: '좋은 상태를 유지하세요.' },
  { key: 'mild', label: '경미한 우울', range: [5, 9] as [number, number], color: '#D4A373', description: '가벼운 우울 증상이 있습니다.', recommendation: '자기 돌봄을 실천하고, 증상이 지속되면 상담을 고려하세요.' },
  { key: 'moderate', label: '중등도 우울', range: [10, 14] as [number, number], color: '#E07A5F', description: '중등도의 우울 증상이 있습니다.', recommendation: '전문 상담사 또는 정신건강의학과 전문의 상담을 권장합니다.' },
  { key: 'moderately_severe', label: '중등도-심한 우울', range: [15, 19] as [number, number], color: '#C4634B', description: '심한 우울 증상이 있습니다.', recommendation: '정신건강의학과 전문의 상담이 필요합니다.' },
  { key: 'severe', label: '심한 우울', range: [20, 27] as [number, number], color: '#C4634B', description: '매우 심한 우울 증상이 있습니다.', recommendation: '즉시 전문의 상담을 받으세요. 자살예방상담전화 1393에 연락하세요.' },
];

// PCL-5 간소화 8문항
export const PCL5_QUESTIONS = [
  { id: 1, question: '스트레스 경험에 대한 반복적이고 원치 않는 괴로운 기억' },
  { id: 2, question: '스트레스 경험에 대한 반복적인 괴로운 꿈' },
  { id: 3, question: '스트레스 경험이 실제로 다시 일어나는 것처럼 느끼거나 행동함' },
  { id: 4, question: '스트레스 경험을 떠올리게 하는 것을 피하려고 노력함' },
  { id: 5, question: '매우 경계하거나 주의를 기울이거나 방어적임' },
  { id: 6, question: '쉽게 놀람' },
  { id: 7, question: '집중하는 것이 어려움' },
  { id: 8, question: '자신이나 세상에 대한 강한 부정적 신념 (예: "나는 나쁜 사람이다", "세상은 완전히 위험하다")' },
];

export const PCL5_OPTIONS = [
  { value: 0, label: '전혀 아님' },
  { value: 1, label: '약간' },
  { value: 2, label: '보통' },
  { value: 3, label: '상당히' },
  { value: 4, label: '매우 심함' },
];

export const RECOVERY_MILESTONES = [
  {
    phase: '안전 확보',
    icon: 'shield-checkmark',
    color: '#6B8CC7',
    milestones: [
      { id: 'm1', title: '안전한 곳 확보', description: '물리적으로 안전한 공간을 마련했습니다.' },
      { id: 'm2', title: '긴급연락처 설정', description: '믿을 수 있는 사람들에게 상황을 알렸습니다.' },
      { id: 'm3', title: '법적 보호조치', description: '접근금지명령 등 법적 보호를 시작했습니다.' },
    ],
  },
  {
    phase: '안정화',
    icon: 'heart',
    color: '#7A9E7E',
    milestones: [
      { id: 'm4', title: '일상 루틴 수립', description: '규칙적인 수면, 식사, 활동 패턴을 만들었습니다.' },
      { id: 'm5', title: '감정 조절 연습', description: '그라운딩, 호흡법 등을 꾸준히 실천합니다.' },
      { id: 'm6', title: '지지 네트워크 구축', description: '상담사, 지지 그룹 등 도움을 줄 수 있는 사람들과 연결되었습니다.' },
    ],
  },
  {
    phase: '치유',
    icon: 'flower',
    color: '#D4A373',
    milestones: [
      { id: 'm7', title: '트라우마 인식', description: '겪은 일이 트라우마였음을 인정하고 받아들입니다.' },
      { id: 'm8', title: '전문 상담 시작', description: '전문 심리상담 또는 치료를 시작했습니다.' },
      { id: 'm9', title: '자기 돌봄 실천', description: '나를 위한 시간과 활동을 꾸준히 합니다.' },
    ],
  },
  {
    phase: '성장',
    icon: 'sunny',
    color: '#C4956A',
    milestones: [
      { id: 'm10', title: '새로운 목표 설정', description: '미래에 대한 새로운 목표와 꿈을 가집니다.' },
      { id: 'm11', title: '건강한 관계 이해', description: '건강한 관계가 무엇인지 이해하고 경계를 세울 수 있습니다.' },
      { id: 'm12', title: '자기 확신 회복', description: '나의 감각, 기억, 판단을 믿을 수 있습니다.' },
    ],
  },
];

export const MOOD_SCALE = [
  { value: 1, emoji: '😢', label: '매우 힘듦', color: '#C4634B' },
  { value: 2, emoji: '😔', label: '힘듦', color: '#E07A5F' },
  { value: 3, emoji: '😐', label: '보통', color: '#D4A373' },
  { value: 4, emoji: '🙂', label: '괜찮음', color: '#7A9E7E' },
  { value: 5, emoji: '😊', label: '좋음', color: '#6B8CC7' },
];

export const THERAPIST_DATA = [
  { id: 't1', name: '박지연 상담사', credentials: '임상심리전문가, 한국심리학회', specializations: ['데이트폭력', 'PTSD', '우울증'], location: '서울 강남구', type: '대면/비대면', phone: '02-555-1234', bio: '15년간 폭력피해 여성 전문 상담. 트라우마 중심 인지행동치료(TF-CBT) 전문.' },
  { id: 't2', name: '김수현 심리사', credentials: '정신건강임상심리사 1급', specializations: ['스토킹', '불안장애', 'PTSD'], location: '서울 마포구', type: '대면/비대면', phone: '02-333-5678', bio: '스토킹 피해자 전문. EMDR 치료 인증 전문가.' },
  { id: 't3', name: '이하나 상담사', credentials: '전문상담사 1급, 한국상담학회', specializations: ['성폭력', '가정폭력', '트라우마'], location: '서울 종로구', type: '대면', phone: '02-111-2345', bio: '해바라기센터 10년 근무 경력. 성폭력 피해자 전문 상담.' },
  { id: 't4', name: '최윤아 정신과 전문의', credentials: '정신건강의학과 전문의', specializations: ['PTSD', '우울증', '불안장애'], location: '서울 서초구', type: '대면', phone: '02-444-6789', bio: '약물치료와 상담치료를 병행하는 통합적 접근.' },
  { id: 't5', name: '정미라 상담사', credentials: '임상심리전문가', specializations: ['데이트폭력', '가스라이팅', '자존감'], location: '서울 송파구', type: '비대면', phone: '02-222-3456', bio: '온라인 상담 전문. 가스라이팅 피해 회복 프로그램 운영.' },
  { id: 't6', name: '한소윤 상담사', credentials: '전문상담사 1급', specializations: ['디지털성범죄', '트라우마', 'PTSD'], location: '서울 영등포구', type: '대면/비대면', phone: '02-666-7890', bio: '디지털 성범죄 피해자 전문. 인지처리치료(CPT) 전문가.' },
  { id: 't7', name: '오지은 심리사', credentials: '정신건강임상심리사 1급', specializations: ['가정폭력', '아동학대', '부모상담'], location: '경기 성남시', type: '대면', phone: '031-777-1234', bio: '가정폭력 가정의 아동 및 부모 상담 전문.' },
  { id: 't8', name: '서다은 상담사', credentials: '전문상담사 2급, 미술치료사', specializations: ['트라우마', '우울증', '자기표현'], location: '서울 용산구', type: '대면', phone: '02-888-2345', bio: '미술치료를 활용한 트라우마 회복 전문.' },
  { id: 't9', name: '윤채원 정신과 전문의', credentials: '정신건강의학과 전문의', specializations: ['PTSD', '공황장애', '수면장애'], location: '서울 강동구', type: '대면', phone: '02-999-3456', bio: '외상 후 스트레스 장애 약물 치료 전문.' },
  { id: 't10', name: '배수연 상담사', credentials: '임상심리전문가', specializations: ['성폭력', '데이트폭력', '회복탄력성'], location: '경기 수원시', type: '대면/비대면', phone: '031-111-4567', bio: '폭력 피해 여성의 회복탄력성 연구 및 상담.' },
  { id: 't11', name: '임나영 상담사', credentials: '전문상담사 1급', specializations: ['스토킹', '불안', '경계설정'], location: '서울 관악구', type: '비대면', phone: '02-222-5678', bio: '스토킹 피해 후 일상 회복 및 경계 설정 전문.' },
  { id: 't12', name: '강예진 심리사', credentials: '정신건강임상심리사 2급', specializations: ['우울증', '자존감', '관계'], location: '서울 노원구', type: '대면/비대면', phone: '02-333-6789', bio: '건강한 관계 패턴 형성을 위한 상담.' },
];

export const MENTAL_HEALTH_RESOURCES = [
  { name: '자살예방상담전화', phone: '1393', hours: '24시간', description: '위기 상담 및 자살 예방' },
  { name: '정신건강위기상담전화', phone: '1577-0199', hours: '24시간', description: '정신건강 위기 상담' },
  { name: '여성긴급전화', phone: '1366', hours: '24시간', description: '폭력 피해 여성 긴급 상담' },
  { name: '경찰', phone: '112', hours: '24시간', description: '긴급 신고' },
];
