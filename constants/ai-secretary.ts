// AI 법률 사무장 상수 정의
import type { CasePhase } from '@/types/database';

/** 5단계 라벨 */
export const PHASE_LABELS: Record<CasePhase, string> = {
  1: '안전확인',
  2: '상황파악',
  3: '증거확인',
  4: '법률분석',
  5: '선택지생성',
};

/** 5단계 상세 설명 */
export const PHASE_DESCRIPTIONS: Record<CasePhase, string> = {
  1: '사용자의 현재 안전 상태를 확인합니다. 위기 상황일 경우 즉시 SOS 연결합니다.',
  2: '육하원칙(5W1H)에 따라 상황을 체계적으로 파악합니다.',
  3: '확보된 증거를 확인하고 추가 증거 수집을 안내합니다.',
  4: '관련 법률과 유사 판례를 분석하여 법적 대응 방안을 제시합니다.',
  5: '두 가지 대응 선택지(A/B)를 생성하여 사용자가 결정할 수 있도록 합니다.',
};

/** 위기 감지 키워드 */
export const CRISIS_KEYWORDS = [
  '죽고싶',
  '자살',
  '자해',
  '죽겠',
  '끝내고싶',
  '죽여버리겠',
  '칼',
  '목숨',
];

/** Phase 2: 육하원칙(5W1H) 질문 및 선택지 */
export const FIVE_W_ONE_H = [
  {
    id: 'who',
    label: '누가 (Who)',
    question: '상대방과의 관계가 어떻게 되시나요?',
    options: ['현재 교제 중인 연인', '전 연인', '배우자', '동거인', '기타'],
  },
  {
    id: 'what',
    label: '무엇을 (What)',
    question: '어떤 문제 행동을 겪고 계신가요?',
    options: [
      '반복적인 연락 (연락 폭탄)',
      '미행·추적·위치 감시',
      '협박 (자해/자살 협박 포함)',
      '폭행·물리적 폭력',
      '사진·영상 유포 협박',
      '경제적 통제·갈취',
      '명예훼손·모욕',
    ],
  },
  {
    id: 'when',
    label: '언제 (When)',
    question: '이 행동이 시작된 시기는 언제인가요?',
    options: ['최근 1주일 이내', '1~4주 전', '1~3개월 전', '3개월~1년 전', '1년 이상'],
  },
  {
    id: 'where',
    label: '어디서 (Where)',
    question: '주로 어디서 이런 일이 발생하나요?',
    options: ['온라인 (SNS, 메시지)', '집 근처', '직장/학교', '공공장소', '복합적'],
  },
  {
    id: 'why',
    label: '왜 (Why)',
    question: '상대방의 행동이 시작된 계기가 있나요?',
    options: [
      '이별을 통보한 후',
      '새로운 관계를 시작한 후',
      '관계 중 갈등 이후',
      '특별한 계기 없이 점진적으로',
      '잘 모르겠다',
    ],
  },
  {
    id: 'how',
    label: '어떻게 (How)',
    question: '현재 어떤 대응을 하고 계신가요?',
    options: [
      '아무 대응도 못하고 있다',
      '무시하고 있다',
      '직접 경고했다',
      '주변에 도움을 요청했다',
      '경찰에 신고했다',
      '법적 조치를 준비 중이다',
    ],
  },
];

/** Phase 3: 증거 확인 체크리스트 */
export const EVIDENCE_CHECKLIST = [
  {
    id: 'chat_capture',
    label: '카카오톡/문자 대화 캡처',
    description: '협박, 폭언, 스토킹 관련 대화 내용',
    required: true,
  },
  {
    id: 'call_recording',
    label: '통화 녹음',
    description: '위협적인 통화 내용 녹음 (본인이 대화 당사자인 경우 합법)',
    required: false,
  },
  {
    id: 'photo_evidence',
    label: '사진/영상 증거',
    description: '폭행 흔적, 재물 손괴, 미행 현장 사진',
    required: false,
  },
  {
    id: 'witness',
    label: '목격자/증인',
    description: '사건을 목격한 지인, 이웃 등',
    required: false,
  },
  {
    id: 'medical_record',
    label: '진단서/의료 기록',
    description: '폭행으로 인한 진단서, 상담 기록',
    required: false,
  },
  {
    id: 'police_report',
    label: '기존 신고 기록',
    description: '이전 경찰 신고 접수증, 사건 번호',
    required: false,
  },
  {
    id: 'digital_evidence',
    label: '디지털 증거',
    description: 'SNS 게시물 캡처, 이메일, 위치추적 앱 스크린샷',
    required: false,
  },
];

/** Phase 4: Mock 법률 분석 결과 */
export const MOCK_LEGAL_ANALYSIS = {
  applicable_laws: [
    {
      name: '스토킹처벌법 제18조',
      description: '스토킹범죄의 처벌',
      penalty: '3년 이하 징역 또는 3천만원 이하 벌금',
    },
    {
      name: '형법 제283조',
      description: '협박죄',
      penalty: '3년 이하 징역, 500만원 이하 벌금',
    },
    {
      name: '정보통신망법 제44조의7',
      description: '불법정보의 유통금지 (촬영물 유포)',
      penalty: '5년 이하 징역 또는 5천만원 이하 벌금',
    },
    {
      name: '성폭력처벌법 제14조의3',
      description: '촬영물 등을 이용한 협박·강요',
      penalty: '1년 이상 유기징역',
    },
  ],
  similar_cases: [
    {
      case_number: '2023도12345',
      summary: '이별 후 반복 연락 및 미행 → 스토킹죄 유죄',
      ruling: '징역 6개월, 집행유예 2년, 접근금지 2년',
    },
    {
      case_number: '2024고단678',
      summary: '사적 사진 유포 협박 → 촬영물 이용 협박죄',
      ruling: '징역 1년',
    },
    {
      case_number: '2023나9012',
      summary: '전 연인 직장 찾아가 소란 → 스토킹 + 업무방해',
      ruling: '징역 8개월, 전자발찌 부착 1년',
    },
  ],
  risk_assessment: '현재 상황은 스토킹처벌법 위반에 해당할 가능성이 높습니다. 조기에 법적 조치를 취하는 것이 권장됩니다.',
};

/** Phase 5: Mock 선택지 */
export const MOCK_OPTIONS = {
  optionA: {
    title: '법률 경고장 발송',
    description: '변호사 명의의 법률 경고장을 상대방에게 발송합니다.',
    details: [
      '이메일/SNS 발송: 49,000원',
      '내용증명 (우편): 99,000원',
      '발송 후 2~3일 내 효과 확인 가능',
      '대부분의 경우 경고장만으로 행위 중단',
    ],
    pros: ['비용이 적음', '빠른 처리', '법적 기록 남김'],
    cons: ['강제력 없음', '무시할 가능성 있음'],
    estimated_cost: '49,000원 ~ 99,000원',
    estimated_time: '1~3일',
  },
  optionB: {
    title: '경찰 신고 + 접근금지 가처분',
    description: '스토킹 신고 후 법원에 접근금지 가처분을 신청합니다.',
    details: [
      '경찰 신고: 무료 (112)',
      '접근금지 가처분 신청: 변호사 비용 별도',
      '긴급응급조치 즉시 발동 가능',
      '위반 시 형사처벌 가능',
    ],
    pros: ['법적 강제력', '위반 시 처벌', '공식 기록'],
    cons: ['시간 소요', '비용 높음', '상대방 자극 가능성'],
    estimated_cost: '변호사 상담비 + 인지대',
    estimated_time: '1~2주',
  },
};
