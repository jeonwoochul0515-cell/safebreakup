// 고소장 자동 작성 시스템 상수
// 검토: 김창희 변호사 (법률사무소 청송)

import { ComplaintPhase, CrimeType, ApplicableStatute } from '../types/database';

// ─── 7단계 진행 정보 ────────────────────────────────────────────────────────

export const COMPLAINT_PHASES: {
  key: ComplaintPhase;
  step: number;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    key: 'safety',
    step: 1,
    label: '안전 확인',
    description: '현재 안전한 상황인지 먼저 확인합니다',
    icon: 'shield-checkmark',
  },
  {
    key: 'complainant',
    step: 2,
    label: '고소인 정보',
    description: '고소장에 필요한 기본 인적사항을 수집합니다',
    icon: 'person',
  },
  {
    key: 'suspect',
    step: 3,
    label: '피고소인 정보',
    description: '가해자에 대해 알고 계신 정보를 수집합니다',
    icon: 'person-circle',
  },
  {
    key: 'crime_facts',
    step: 4,
    label: '범죄사실',
    description: '어떤 피해를 입으셨는지 구체적으로 정리합니다',
    icon: 'document-text',
  },
  {
    key: 'evidence',
    step: 5,
    label: '증거 현황',
    description: '갖고 계신 증거를 확인하고 정리합니다',
    icon: 'folder-open',
  },
  {
    key: 'damage',
    step: 6,
    label: '피해 결과',
    description: '신체적·정신적·경제적 피해를 정리합니다',
    icon: 'heart-dislike',
  },
  {
    key: 'punishment',
    step: 7,
    label: '처벌 희망',
    description: '원하시는 처벌 수위와 보호조치를 정합니다',
    icon: 'hammer',
  },
];

// ─── 사무장 공감 문구 ───────────────────────────────────────────────────────

export const EMPATHY_RESPONSES: Record<ComplaintPhase, string[]> = {
  safety: [
    '안녕하세요, 법률사무장입니다. 오늘 용기 내어 찾아와 주셔서 감사합니다.',
    '먼저 가장 중요한 걸 여쭤볼게요. 지금 안전한 곳에 계신가요?',
    '당신의 안전이 무엇보다 우선이에요.',
  ],
  complainant: [
    '고소장에 들어갈 기본 정보를 여쭤볼게요.',
    '법적 서류에 필요한 부분이라 좀 딱딱하게 느껴지실 수 있는데, 정확하게 적어야 절차가 순탄하게 진행돼요.',
    '모르시는 부분은 나중에 보완할 수 있으니 걱정 마세요.',
  ],
  suspect: [
    '이제 상대방에 대해 알고 계신 정보를 여쭤볼게요.',
    '알고 계신 만큼만 말씀해 주시면 돼요.',
    '이름을 모르더라도 고소는 가능하니 걱정 마세요.',
  ],
  crime_facts: [
    '이 부분이 가장 중요한 단계예요. 천천히 진행할게요.',
    '힘드시면 언제든 잠시 쉬어가셔도 돼요.',
    '말씀하시기 어려운 부분은 건너뛸 수 있어요.',
  ],
  evidence: [
    '갖고 계신 증거에 대해 여쭤볼게요.',
    '증거가 많을수록 유리하지만, 지금 당장 없어도 괜찮아요.',
    '나중에 추가로 확보하실 수도 있어요.',
  ],
  damage: [
    '겪으신 피해에 대해 정리해 볼게요.',
    '있는 그대로 말씀해 주시면 돼요.',
    '피해 사실을 명확히 정리하는 것이 법적으로 중요해요.',
  ],
  punishment: [
    '마지막 단계예요. 정말 잘 해주셨어요.',
    '어떤 처벌을 원하시는지 여쭤볼게요.',
    '여기까지 오신 것만으로도 대단한 용기예요.',
  ],
};

// ─── 적용 법조 자동 매칭 테이블 ─────────────────────────────────────────────

export const APPLICABLE_STATUTES: ApplicableStatute[] = [
  // 스토킹
  {
    crime_type: 'stalking',
    law_name: '스토킹범죄의 처벌 등에 관한 법률',
    article: '제18조 제1항',
    article_title: '스토킹범죄의 벌칙',
    penalty: '3년 이하 징역 또는 3,000만원 이하 벌금',
    keywords: ['반복연락', '미행', '배회', '스토킹', '따라다님', '기다림'],
  },
  {
    crime_type: 'stalking',
    law_name: '스토킹범죄의 처벌 등에 관한 법률',
    article: '제18조 제2항',
    article_title: '흉기 등 스토킹범죄',
    penalty: '5년 이하 징역 또는 5,000만원 이하 벌금',
    keywords: ['흉기', '칼', '무기', '위험한 물건'],
  },
  // 협박
  {
    crime_type: 'threat',
    law_name: '형법',
    article: '제283조 제1항',
    article_title: '협박',
    penalty: '3년 이하 징역 또는 500만원 이하 벌금',
    keywords: ['죽이겠다', '가만안둔다', '해치겠다', '협박', '위협'],
  },
  {
    crime_type: 'threat',
    law_name: '형법',
    article: '제284조',
    article_title: '특수협박',
    penalty: '7년 이하 징역 또는 1,000만원 이하 벌금',
    keywords: ['흉기', '칼', '위험한 물건', '협박'],
  },
  {
    crime_type: 'threat',
    law_name: '형법',
    article: '제324조',
    article_title: '강요',
    penalty: '5년 이하 징역',
    keywords: ['자해협박', '행동강요', '강요', '시키다', '하지않으면'],
  },
  // 폭행/상해
  {
    crime_type: 'assault',
    law_name: '형법',
    article: '제260조 제1항',
    article_title: '폭행',
    penalty: '2년 이하 징역 또는 500만원 이하 벌금',
    keywords: ['때림', '밀침', '폭행', '맞았다', '때렸다'],
  },
  {
    crime_type: 'assault',
    law_name: '형법',
    article: '제257조 제1항',
    article_title: '상해',
    penalty: '7년 이하 징역',
    keywords: ['상해', '진단서', '부상', '다쳤다', '피가났다'],
  },
  {
    crime_type: 'assault',
    law_name: '형법',
    article: '제261조',
    article_title: '특수폭행',
    penalty: '5년 이하 징역 또는 1,000만원 이하 벌금',
    keywords: ['흉기', '칼', '위험한 물건', '폭행'],
  },
  // 성범죄
  {
    crime_type: 'sexual',
    law_name: '형법',
    article: '제297조',
    article_title: '강간',
    penalty: '3년 이상 유기징역',
    keywords: ['강간', '성폭행', '성범죄'],
  },
  {
    crime_type: 'sexual',
    law_name: '성폭력범죄의 처벌 등에 관한 특례법',
    article: '제3조~제15조',
    article_title: '성폭력범죄',
    penalty: '범죄 유형에 따라 상이',
    keywords: ['성폭력', '강제추행', '성추행', '성적 수치심'],
  },
  // 디지털 성범죄
  {
    crime_type: 'digital_sexual',
    law_name: '성폭력범죄의 처벌 등에 관한 특례법',
    article: '제14조 제1항',
    article_title: '카메라 등을 이용한 촬영',
    penalty: '7년 이하 징역 또는 5,000만원 이하 벌금',
    keywords: ['불법촬영', '몰래카메라', '동의없는 촬영'],
  },
  {
    crime_type: 'digital_sexual',
    law_name: '성폭력범죄의 처벌 등에 관한 특례법',
    article: '제14조 제2항',
    article_title: '촬영물 유포',
    penalty: '7년 이하 징역 또는 5,000만원 이하 벌금',
    keywords: ['유포', '뿌리겠다', '퍼뜨리겠다', '공유'],
  },
  {
    crime_type: 'digital_sexual',
    law_name: '성폭력범죄의 처벌 등에 관한 특례법',
    article: '제14조의3 제1항',
    article_title: '촬영물 이용 협박',
    penalty: '1년 이상 징역',
    keywords: ['사진뿌리겠다', '영상유포협박', '촬영물협박'],
    note: '반의사불벌죄 아님 — 피해자 의사와 무관하게 처벌 진행',
  },
  {
    crime_type: 'digital_sexual',
    law_name: '성폭력범죄의 처벌 등에 관한 특례법',
    article: '제14조의2',
    article_title: '허위영상물 편집 등 (딥페이크)',
    penalty: '5년 이하 징역 또는 5,000만원 이하 벌금',
    keywords: ['딥페이크', '합성', 'AI생성', '허위영상'],
  },
  // 기타 — 명예훼손, 모욕, 주거침입, 재물손괴
  {
    crime_type: 'other',
    law_name: '형법',
    article: '제307조',
    article_title: '명예훼손',
    penalty: '2년 이하 징역 또는 500만원 이하 벌금',
    keywords: ['명예훼손', '사실적시', '소문'],
  },
  {
    crime_type: 'other',
    law_name: '정보통신망 이용촉진 및 정보보호 등에 관한 법률',
    article: '제70조',
    article_title: '사이버 명예훼손',
    penalty: '3년 이하 징역 또는 3,000만원 이하 벌금',
    keywords: ['SNS', '인터넷', '온라인', '명예훼손', '게시글'],
  },
  {
    crime_type: 'other',
    law_name: '형법',
    article: '제311조',
    article_title: '모욕',
    penalty: '1년 이하 징역 또는 200만원 이하 벌금',
    keywords: ['욕설', '모욕', '공연히'],
  },
  {
    crime_type: 'other',
    law_name: '형법',
    article: '제319조 제1항',
    article_title: '주거침입',
    penalty: '3년 이하 징역 또는 500만원 이하 벌금',
    keywords: ['집에 침입', '주거침입', '문 열고', '무단침입'],
  },
  {
    crime_type: 'other',
    law_name: '형법',
    article: '제366조',
    article_title: '재물손괴',
    penalty: '3년 이하 징역 또는 700만원 이하 벌금',
    keywords: ['물건 파손', '재물손괴', '부쉈다', '깨뜨렸다'],
  },
];

// ─── 주요 판례 ──────────────────────────────────────────────────────────────

export interface CaseReference {
  case_number: string;
  court: string;
  date: string;
  crime_type: CrimeType;
  title: string;
  summary: string;
  significance: string;
}

export const CASE_REFERENCES: CaseReference[] = [
  {
    case_number: '2007도7257',
    court: '대법원',
    date: '2008-07-24',
    crime_type: 'threat',
    title: '협박죄 해악 고지 기준',
    summary: '해악의 고지는 반드시 명시적일 필요 없고, 암시적이거나 행동에 의한 것도 포함된다.',
    significance: '문자·메신저를 통한 간접적 협박도 협박죄 성립 가능',
  },
  {
    case_number: '2017도13263',
    court: '대법원',
    date: '2018-03-15',
    crime_type: 'digital_sexual',
    title: '촬영물 유포 협박 양형 기준',
    summary: '피해자의 성적 촬영물을 이용한 협박은 그 자체로 중대한 법익 침해로서 엄한 처벌이 필요하다.',
    significance: '디지털 성범죄 유포 협박에 대한 양형 강화 기준 제시',
  },
  {
    case_number: '2015도1900',
    court: '대법원',
    date: '2015-09-10',
    crime_type: 'stalking',
    title: '스토킹 행위의 반복성 판단 기준',
    summary: '상대방의 의사에 반하여 반복적으로 접근하는 행위는 그 수단이나 방법을 불문하고 스토킹에 해당한다.',
    significance: '온라인 접근, 제3자를 통한 간접 접근도 스토킹으로 인정',
  },
  {
    case_number: '2021도15574',
    court: '대법원',
    date: '2022-04-14',
    crime_type: 'stalking',
    title: '스토킹처벌법 최초 적용 사례',
    summary: '스토킹처벌법 시행 이후 반복적 접근행위에 대한 처벌 기준을 명확히 한 판결.',
    significance: '2021년 스토킹처벌법 제정 이후 양형 기준 정립',
  },
  {
    case_number: '2019도16258',
    court: '대법원',
    date: '2020-01-30',
    crime_type: 'digital_sexual',
    title: '불법촬영물 소지 처벌',
    summary: '불법 촬영물을 소지하는 것만으로도 처벌 대상이며, 유포 의사 여부와 무관하다.',
    significance: '촬영물 소지 자체의 위법성 확인',
  },
  {
    case_number: '2018도9775',
    court: '대법원',
    date: '2019-02-14',
    crime_type: 'assault',
    title: '데이트폭력 상해죄 양형',
    summary: '교제 관계에서의 폭력은 신뢰관계를 이용한 것으로 가중처벌 사유에 해당한다.',
    significance: '데이트폭력에 대한 엄격한 양형 기준 제시',
  },
];

// ─── 감정 대응 프로토콜 ─────────────────────────────────────────────────────

export interface EmotionalProtocol {
  trigger_id: string;
  trigger_keywords: string[];
  trigger_description: string;
  response: string;
  action: 'pause' | 'continue' | 'correct' | 'save_session' | 'emergency';
  emergency_number?: string;
}

export const EMOTIONAL_PROTOCOLS: EmotionalProtocol[] = [
  {
    trigger_id: 'crying',
    trigger_keywords: ['ㅠㅠ', 'ㅜㅜ', '눈물', '울고', '울어', '울었'],
    trigger_description: '울음',
    response: '괜찮아요. 울어도 돼요. 천천히 하세요. 준비되시면 말씀해 주세요.',
    action: 'pause',
  },
  {
    trigger_id: 'fear',
    trigger_keywords: ['무서워', '두려워', '공포', '겁나', '떨려', '불안해'],
    trigger_description: '공포',
    response: '무서우신 게 당연해요. 그 감정은 자연스러운 거예요. 법이 반드시 보호해 줄 거예요.',
    action: 'continue',
  },
  {
    trigger_id: 'self_blame',
    trigger_keywords: ['내 잘못', '내가 잘못', '나 때문', '내가 그때', '내가 먼저'],
    trigger_description: '자기비난',
    response: '절대 본인 잘못이 아니에요. 어떤 상황에서든 폭력과 위협의 책임은 전적으로 가해자에게 있습니다.',
    action: 'correct',
  },
  {
    trigger_id: 'giving_up',
    trigger_keywords: ['못하겠다', '그만할래', '포기', '그만두고', '안할래', '힘들어서'],
    trigger_description: '포기',
    response: '지금까지 하신 것만으로도 정말 대단한 용기예요. 지금까지 입력하신 내용은 안전하게 저장해 둘 테니, 나중에 언제든 이어서 하실 수 있어요.',
    action: 'save_session',
  },
  {
    trigger_id: 'self_harm',
    trigger_keywords: ['죽고 싶', '자살', '죽을래', '사라지고', '없어지고', '끝내고'],
    trigger_description: '자해/자살 위험',
    response: '지금 많이 힘드시죠. 혼자 감당하지 마세요. 지금 바로 자살예방상담전화 1393으로 전화해 주세요. 24시간 상담 가능합니다. 당신은 소중한 사람이에요.',
    action: 'emergency',
    emergency_number: '1393',
  },
];

// ─── 고소장 섹션 구조 ───────────────────────────────────────────────────────

export const COMPLAINT_TEMPLATE_SECTIONS = [
  { key: 'header', title: '고 소 장', icon: 'document' },
  { key: 'complainant', title: '고 소 인', icon: 'person' },
  { key: 'suspect', title: '피 고 소 인', icon: 'person-circle' },
  { key: 'purpose', title: '고 소 취 지', icon: 'flag' },
  { key: 'crime_facts', title: '범 죄 사 실', icon: 'document-text' },
  { key: 'statutes', title: '적 용 법 조', icon: 'scale' },
  { key: 'evidence', title: '증 거 자 료', icon: 'folder-open' },
  { key: 'closing', title: '결    어', icon: 'checkmark-circle' },
  { key: 'signature', title: '서명/날인', icon: 'create' },
];

// ─── 사무장 질문 시나리오 ───────────────────────────────────────────────────

export interface SecretaryQuestion {
  id: string;
  phase: ComplaintPhase;
  order: number;
  question: string;
  input_type: 'text' | 'select' | 'multi_select' | 'date' | 'boolean' | 'number' | 'free_text';
  options?: { value: string; label: string }[];
  field_key: string;
  required: boolean;
  skip_label?: string;
  sensitive?: boolean;
  follow_up?: string;
}

export const SECRETARY_QUESTIONS: SecretaryQuestion[] = [
  // ─── STAGE 1: 안전 확인 ─────────────────────────────────────────────────
  {
    id: 'Q1-1',
    phase: 'safety',
    order: 1,
    question: '지금 안전한 곳에 계신가요?',
    input_type: 'boolean',
    field_key: 'stage1_safety.is_safe',
    required: true,
    follow_up: '가해자가 접근할 수 없는 곳에 계신 거죠?',
  },
  {
    id: 'Q1-2',
    phase: 'safety',
    order: 2,
    question: '지금 계신 곳은 어디인가요? (집, 카페, 지인 집 등)',
    input_type: 'text',
    field_key: 'stage1_safety.safe_location',
    required: false,
    skip_label: '말하고 싶지 않아요',
  },
  {
    id: 'Q1-3',
    phase: 'safety',
    order: 3,
    question: '혹시 급한 상황이 생기면 연락할 수 있는 분이 계신가요? (가족, 친구 등)',
    input_type: 'text',
    field_key: 'stage1_safety.emergency_contact',
    required: false,
    skip_label: '없어요 / 건너뛰기',
  },

  // ─── STAGE 2: 고소인 정보 ───────────────────────────────────────────────
  {
    id: 'Q2-1',
    phase: 'complainant',
    order: 1,
    question: '고소장에 기재할 성명을 알려주세요.',
    input_type: 'text',
    field_key: 'stage2_complainant.name',
    required: true,
  },
  {
    id: 'Q2-2',
    phase: 'complainant',
    order: 2,
    question: '생년월일을 알려주세요. (예: 1995-03-15)',
    input_type: 'date',
    field_key: 'stage2_complainant.birth_date',
    required: true,
  },
  {
    id: 'Q2-3',
    phase: 'complainant',
    order: 3,
    question: '주소를 알려주세요. (고소장에 기재됩니다)',
    input_type: 'text',
    field_key: 'stage2_complainant.address',
    required: true,
  },
  {
    id: 'Q2-4',
    phase: 'complainant',
    order: 4,
    question: '연락 가능한 전화번호를 알려주세요.',
    input_type: 'text',
    field_key: 'stage2_complainant.phone',
    required: true,
  },
  {
    id: 'Q2-5',
    phase: 'complainant',
    order: 5,
    question: '직업을 알려주실 수 있나요? (선택사항이에요)',
    input_type: 'text',
    field_key: 'stage2_complainant.occupation',
    required: false,
    skip_label: '건너뛰기',
  },

  // ─── STAGE 3: 피고소인 정보 ─────────────────────────────────────────────
  {
    id: 'Q3-1',
    phase: 'suspect',
    order: 1,
    question: '상대방(가해자)의 이름을 아시나요?',
    input_type: 'text',
    field_key: 'stage3_suspect.name',
    required: false,
    skip_label: '이름을 몰라요',
    follow_up: '이름을 모르셔도 고소는 가능해요. "인적사항 불상"으로 접수할 수 있어요.',
  },
  {
    id: 'Q3-2',
    phase: 'suspect',
    order: 2,
    question: '상대방의 주소나 거주지를 아시나요?',
    input_type: 'text',
    field_key: 'stage3_suspect.address',
    required: false,
    skip_label: '몰라요',
  },
  {
    id: 'Q3-3',
    phase: 'suspect',
    order: 3,
    question: '상대방의 연락처(전화번호)를 아시나요?',
    input_type: 'text',
    field_key: 'stage3_suspect.phone',
    required: false,
    skip_label: '몰라요',
  },
  {
    id: 'Q3-4',
    phase: 'suspect',
    order: 4,
    question: '상대방의 SNS 계정을 알고 계신가요? (인스타그램, 카카오톡 ID 등)',
    input_type: 'text',
    field_key: 'stage3_suspect.sns_accounts',
    required: false,
    skip_label: '몰라요 / 없어요',
  },
  {
    id: 'Q3-5',
    phase: 'suspect',
    order: 5,
    question: '상대방과 어떤 관계인가요/였나요?',
    input_type: 'select',
    options: [
      { value: '교제', label: '연인/교제 관계' },
      { value: '혼인', label: '배우자 (혼인 관계)' },
      { value: '동거', label: '동거 관계' },
      { value: '직장', label: '직장 동료/상사' },
      { value: '지인', label: '지인/아는 사람' },
      { value: '온라인', label: '온라인에서 알게 된 사람' },
      { value: '모르는사람', label: '모르는 사람' },
      { value: '기타', label: '기타' },
    ],
    field_key: 'stage3_suspect.relationship',
    required: true,
  },
  {
    id: 'Q3-6',
    phase: 'suspect',
    order: 6,
    question: '교제 기간은 어느 정도였나요?',
    input_type: 'text',
    field_key: 'stage3_suspect.dating_period',
    required: false,
    skip_label: '해당 없음',
  },
  {
    id: 'Q3-7',
    phase: 'suspect',
    order: 7,
    question: '이별 시기가 언제였나요?',
    input_type: 'text',
    field_key: 'stage3_suspect.breakup_date',
    required: false,
    skip_label: '해당 없음',
  },
  {
    id: 'Q3-8',
    phase: 'suspect',
    order: 8,
    question: '상대방의 외형적 특징이 있나요? (이름을 모르실 경우 수사에 도움이 됩니다)',
    input_type: 'free_text',
    field_key: 'stage3_suspect.appearance_description',
    required: false,
    skip_label: '건너뛰기',
  },

  // ─── STAGE 4: 범죄사실 ─────────────────────────────────────────────────
  {
    id: 'Q4-0',
    phase: 'crime_facts',
    order: 0,
    question: '어떤 종류의 피해를 겪으셨나요? (여러 개 선택 가능해요)',
    input_type: 'multi_select',
    options: [
      { value: 'stalking', label: '반복적 연락/따라다님 (스토킹)' },
      { value: 'threat', label: '해치겠다/퍼뜨리겠다 등 위협 (협박)' },
      { value: 'assault', label: '신체적 폭력 (폭행/상해)' },
      { value: 'sexual', label: '성적 피해 (성범죄)' },
      { value: 'digital_sexual', label: '사진/영상 촬영·유포·협박 (디지털 성범죄)' },
      { value: 'other', label: '기타 (명예훼손, 재물손괴 등)' },
    ],
    field_key: 'stage4_crime.crime_types',
    required: true,
  },
  // 스토킹 서브 질문
  {
    id: 'Q4-S1',
    phase: 'crime_facts',
    order: 1,
    question: '어떤 행위를 당하셨나요? (여러 개 선택 가능)',
    input_type: 'multi_select',
    options: [
      { value: '반복전화', label: '반복적 전화' },
      { value: '반복문자', label: '반복적 문자/메시지' },
      { value: '미행', label: '미행/따라다님' },
      { value: '배회', label: '집/직장 주변 배회' },
      { value: '대기', label: '집/직장 앞에서 기다림' },
      { value: '선물', label: '원치 않는 선물/물건 배송' },
      { value: '제3자접촉', label: '주변 사람에게 연락' },
      { value: 'SNS감시', label: 'SNS 감시/접근' },
    ],
    field_key: 'stage4_crime.stalking.behavior_types',
    required: false,
  },
  {
    id: 'Q4-S2',
    phase: 'crime_facts',
    order: 2,
    question: '이런 행위가 언제부터 시작되었나요?',
    input_type: 'text',
    field_key: 'stage4_crime.stalking.start_date',
    required: false,
  },
  {
    id: 'Q4-S3',
    phase: 'crime_facts',
    order: 3,
    question: '얼마나 자주 일어나나요? (매일, 일주일에 몇 번 등)',
    input_type: 'text',
    field_key: 'stage4_crime.stalking.frequency',
    required: false,
  },
  {
    id: 'Q4-S4',
    phase: 'crime_facts',
    order: 4,
    question: '주로 어디에서 일어나나요?',
    input_type: 'text',
    field_key: 'stage4_crime.stalking.locations',
    required: false,
  },
  {
    id: 'Q4-S5',
    phase: 'crime_facts',
    order: 5,
    question: '가장 최근에 일어난 사건을 말씀해 주세요.',
    input_type: 'free_text',
    field_key: 'stage4_crime.stalking.latest_incident',
    required: false,
  },
  // 협박 서브 질문
  {
    id: 'Q4-T1',
    phase: 'crime_facts',
    order: 10,
    question: '어떤 내용으로 협박을 받으셨나요? 가능하면 원문 그대로 적어주세요.',
    input_type: 'free_text',
    field_key: 'stage4_crime.threat.content',
    required: false,
    follow_up: '원문 그대로 적어주시면 증거력이 높아져요.',
  },
  {
    id: 'Q4-T2',
    phase: 'crime_facts',
    order: 11,
    question: '어떤 방법으로 협박을 받으셨나요?',
    input_type: 'select',
    options: [
      { value: '문자', label: '문자/카카오톡' },
      { value: '전화', label: '전화 통화' },
      { value: '대면', label: '직접 만나서' },
      { value: 'SNS', label: 'SNS/DM' },
      { value: '제3자', label: '다른 사람을 통해' },
      { value: '기타', label: '기타' },
    ],
    field_key: 'stage4_crime.threat.method',
    required: false,
  },
  {
    id: 'Q4-T3',
    phase: 'crime_facts',
    order: 12,
    question: '협박이 언제부터 있었고, 몇 번 정도 있었나요?',
    input_type: 'text',
    field_key: 'stage4_crime.threat.date_range',
    required: false,
  },
  // 폭행 서브 질문
  {
    id: 'Q4-A1',
    phase: 'crime_facts',
    order: 20,
    question: '폭행이 발생한 일시를 알려주세요.',
    input_type: 'text',
    field_key: 'stage4_crime.assault.date',
    required: false,
  },
  {
    id: 'Q4-A2',
    phase: 'crime_facts',
    order: 21,
    question: '어디에서 일어났나요?',
    input_type: 'text',
    field_key: 'stage4_crime.assault.location',
    required: false,
  },
  {
    id: 'Q4-A3',
    phase: 'crime_facts',
    order: 22,
    question: '어떤 방식으로 폭행을 당하셨나요? (밀침, 뺨 때림, 발로 참 등)',
    input_type: 'free_text',
    field_key: 'stage4_crime.assault.method',
    required: false,
  },
  {
    id: 'Q4-A4',
    phase: 'crime_facts',
    order: 23,
    question: '다치신 정도는 어떤가요? (멍, 골절, 찰과상 등)',
    input_type: 'text',
    field_key: 'stage4_crime.assault.injury_level',
    required: false,
  },
  {
    id: 'Q4-A5',
    phase: 'crime_facts',
    order: 24,
    question: '병원 치료를 받으셨나요?',
    input_type: 'boolean',
    field_key: 'stage4_crime.assault.medical_treatment',
    required: false,
  },
  {
    id: 'Q4-A6',
    phase: 'crime_facts',
    order: 25,
    question: '목격자가 있나요?',
    input_type: 'text',
    field_key: 'stage4_crime.assault.witnesses',
    required: false,
    skip_label: '없어요',
  },
  // 성범죄 서브 질문 (매우 조심스럽게)
  {
    id: 'Q4-X1',
    phase: 'crime_facts',
    order: 30,
    question: '이 부분은 말씀하시기 정말 힘드실 수 있어요. 절대 무리하지 않으셔도 돼요. "건너뛰기"라고 하시면 바로 다음으로 넘어갈게요. 잘못은 전적으로 가해자에게 있습니다.\n\n성적 피해가 있으셨나요?',
    input_type: 'boolean',
    field_key: 'stage4_crime.sexual.occurred',
    required: false,
    skip_label: '건너뛰기',
    sensitive: true,
  },
  {
    id: 'Q4-X2',
    phase: 'crime_facts',
    order: 31,
    question: '대략적인 시기를 알려주실 수 있나요?',
    input_type: 'text',
    field_key: 'stage4_crime.sexual.date',
    required: false,
    skip_label: '건너뛰기',
    sensitive: true,
  },
  {
    id: 'Q4-X3',
    phase: 'crime_facts',
    order: 32,
    question: '어디에서 발생했나요?',
    input_type: 'text',
    field_key: 'stage4_crime.sexual.location',
    required: false,
    skip_label: '건너뛰기',
    sensitive: true,
  },
  // 디지털 성범죄 서브 질문
  {
    id: 'Q4-D1',
    phase: 'crime_facts',
    order: 40,
    question: '동의 없이 촬영된 사진이나 영상이 있나요?',
    input_type: 'boolean',
    field_key: 'stage4_crime.digital_sexual.illegal_filming',
    required: false,
  },
  {
    id: 'Q4-D2',
    phase: 'crime_facts',
    order: 41,
    question: '촬영물이 유포된 적이 있나요?',
    input_type: 'boolean',
    field_key: 'stage4_crime.digital_sexual.distribution',
    required: false,
  },
  {
    id: 'Q4-D3',
    phase: 'crime_facts',
    order: 42,
    question: '촬영물을 유포하겠다고 협박을 받은 적이 있나요?',
    input_type: 'boolean',
    field_key: 'stage4_crime.digital_sexual.distribution_threat',
    required: false,
  },
  {
    id: 'Q4-D4',
    phase: 'crime_facts',
    order: 43,
    question: '어떤 경로로 유포되었거나 유포 협박을 받으셨나요? (카카오톡, 텔레그램, SNS 등)',
    input_type: 'text',
    field_key: 'stage4_crime.digital_sexual.distribution_channel',
    required: false,
    skip_label: '잘 모르겠어요',
  },
  // 기타 범죄 질문
  {
    id: 'Q4-O1',
    phase: 'crime_facts',
    order: 50,
    question: '어떤 피해를 입으셨는지 자유롭게 말씀해 주세요. (명예훼손, 재물손괴, 주거침입 등)',
    input_type: 'free_text',
    field_key: 'stage4_crime.other_description',
    required: false,
  },

  // ─── STAGE 5: 증거 확보 현황 ───────────────────────────────────────────
  {
    id: 'Q5-1',
    phase: 'evidence',
    order: 1,
    question: '어떤 증거를 갖고 계신가요? (여러 개 선택 가능)',
    input_type: 'multi_select',
    options: [
      { value: '메신저캡처', label: '문자/카카오톡 캡처' },
      { value: '녹음', label: '녹음 파일' },
      { value: 'CCTV', label: 'CCTV 영상' },
      { value: '진단서', label: '병원 진단서' },
      { value: '사진', label: '사진 (상처, 현장 등)' },
      { value: '목격자', label: '목격자 진술' },
      { value: '112신고', label: '112 신고 이력' },
      { value: 'SNS', label: 'SNS 게시글/DM 캡처' },
      { value: '기타', label: '기타' },
    ],
    field_key: 'stage5_evidence.evidence_types',
    required: false,
  },
  {
    id: 'Q5-2',
    phase: 'evidence',
    order: 2,
    question: '안전이별 증거보관함에 저장한 증거가 있으시면 자동으로 불러올 수 있어요. 불러올까요?',
    input_type: 'boolean',
    field_key: 'stage5_evidence.vault_evidence_ids',
    required: false,
    follow_up: '증거보관함에서 고소장에 포함할 증거를 선택해 주세요.',
  },
  {
    id: 'Q5-3',
    phase: 'evidence',
    order: 3,
    question: '추가로 말씀하실 내용이 있나요? (증거 관련)',
    input_type: 'free_text',
    field_key: 'stage5_evidence.additional_notes',
    required: false,
    skip_label: '없어요',
  },

  // ─── STAGE 6: 피해 결과 ─────────────────────────────────────────────────
  {
    id: 'Q6-1',
    phase: 'damage',
    order: 1,
    question: '신체적으로 다치신 부분이 있나요? 있다면 어떤 상태인가요?',
    input_type: 'free_text',
    field_key: 'stage6_damage.physical_damage.description',
    required: false,
    skip_label: '없어요',
  },
  {
    id: 'Q6-2',
    phase: 'damage',
    order: 2,
    question: '현재 치료 중이신가요?',
    input_type: 'boolean',
    field_key: 'stage6_damage.physical_damage.under_treatment',
    required: false,
  },
  {
    id: 'Q6-3',
    phase: 'damage',
    order: 3,
    question: '정신적으로 겪고 계신 증상이 있나요? (여러 개 선택 가능)',
    input_type: 'multi_select',
    options: [
      { value: '불안', label: '불안/초조' },
      { value: '공포', label: '공포/두려움' },
      { value: '불면', label: '불면/수면장애' },
      { value: '우울', label: '우울' },
      { value: 'PTSD', label: '트라우마/PTSD 증상' },
      { value: '대인기피', label: '대인기피' },
      { value: '집중력저하', label: '집중력 저하' },
    ],
    field_key: 'stage6_damage.mental_damage.symptoms',
    required: false,
  },
  {
    id: 'Q6-4',
    phase: 'damage',
    order: 4,
    question: '심리상담이나 정신과 치료를 받고 계신가요?',
    input_type: 'boolean',
    field_key: 'stage6_damage.mental_damage.counseling',
    required: false,
  },
  {
    id: 'Q6-5',
    phase: 'damage',
    order: 5,
    question: '경제적 피해가 있으신가요? (이사비, 치료비, 수입 감소 등)',
    input_type: 'free_text',
    field_key: 'stage6_damage.financial_damage.items',
    required: false,
    skip_label: '없어요',
  },
  {
    id: 'Q6-6',
    phase: 'damage',
    order: 6,
    question: '직장, 학업, 대인관계 등 일상생활에 영향이 있으셨나요?',
    input_type: 'free_text',
    field_key: 'stage6_damage.social_damage.description',
    required: false,
    skip_label: '없어요',
  },

  // ─── STAGE 7: 처벌 희망 ─────────────────────────────────────────────────
  {
    id: 'Q7-1',
    phase: 'punishment',
    order: 1,
    question: '가해자에 대해 엄한 처벌을 원하시나요?',
    input_type: 'boolean',
    field_key: 'stage7_punishment.severe_punishment',
    required: true,
  },
  {
    id: 'Q7-2',
    phase: 'punishment',
    order: 2,
    question: '어떤 보호조치를 원하시나요? (여러 개 선택 가능)',
    input_type: 'multi_select',
    options: [
      { value: '접근금지', label: '접근금지 명령' },
      { value: '연락금지', label: '연락금지 명령' },
      { value: '전자장치', label: '전자장치(GPS) 부착' },
      { value: '피해자보호', label: '피해자 보호명령' },
    ],
    field_key: 'stage7_punishment.protection_orders',
    required: false,
  },
  {
    id: 'Q7-3',
    phase: 'punishment',
    order: 3,
    question: '추가로 요청하실 사항이 있나요?',
    input_type: 'free_text',
    field_key: 'stage7_punishment.additional_requests',
    required: false,
    skip_label: '없어요',
  },
];

// ─── 긴급 연락처 ────────────────────────────────────────────────────────────

export const EMERGENCY_CONTACTS = [
  { name: '경찰', number: '112', description: '긴급 신고' },
  { name: '여성긴급전화', number: '1366', description: '가정폭력/성폭력 상담 (24시간)' },
  { name: '해바라기센터', number: '1899-3075', description: '성폭력 통합지원' },
  { name: '자살예방상담', number: '1393', description: '위기 상담 (24시간)' },
  { name: '정신건강위기', number: '1577-0199', description: '정신건강 상담' },
  { name: 'D4U센터', number: '02-735-8994', description: '불법촬영물 삭제 지원' },
  { name: '법률구조공단', number: '132', description: '무료 법률 상담' },
];

// ─── 면책 고지 ──────────────────────────────────────────────────────────────

export const COMPLAINT_DISCLAIMER =
  '본 문서는 AI가 작성한 초안이며, 법률사무소 청송 담당 변호사의 검토를 거쳐 최종 확정됩니다. ' +
  '본 문서는 법률 자문이 아닌 참고용 초안이며, 최종 법적 판단은 담당 변호사와 수사기관에 있습니다.';

// ─── 증거 카테고리별 법률 분석 매핑 (police-report.ts 로직 통합) ────────────────

export interface EvidenceCategoryLaw {
  category: string;
  laws: { law: string; article: string; penalty: string }[];
  riskLevel: '주의' | '위험' | '긴급';
  analysisNote: string;
}

export const EVIDENCE_CATEGORY_LAWS: EvidenceCategoryLaw[] = [
  {
    category: '스토킹',
    laws: [
      {
        law: '스토킹범죄의 처벌 등에 관한 법률',
        article: '제18조 (스토킹범죄의 벌칙)',
        penalty: '3년 이하 징역 또는 3,000만원 이하 벌금',
      },
      {
        law: '스토킹범죄의 처벌 등에 관한 법률',
        article: '제4조 (긴급응급조치)',
        penalty: '100m 접근금지, 통신접근금지 (위반 시 1년 이하 징역)',
      },
    ],
    riskLevel: '위험',
    analysisNote:
      '반복적 접촉 패턴이 확인되어 스토킹범죄에 해당할 가능성이 높습니다.\n' +
      '2024.1.12. 개정법에 따라 반의사불벌죄가 폐지되어, 피해자 의사와 무관하게 처벌이 진행됩니다.',
  },
  {
    category: '미행',
    laws: [
      {
        law: '스토킹범죄의 처벌 등에 관한 법률',
        article: '제18조 (스토킹범죄의 벌칙)',
        penalty: '3년 이하 징역 또는 3,000만원 이하 벌금',
      },
      {
        law: '스토킹범죄의 처벌 등에 관한 법률',
        article: '제4조 (긴급응급조치)',
        penalty: '100m 접근금지, 통신접근금지 (위반 시 1년 이하 징역)',
      },
    ],
    riskLevel: '위험',
    analysisNote: '미행 행위는 스토킹범죄의 전형적인 유형에 해당합니다.',
  },
  {
    category: '협박',
    laws: [
      {
        law: '형법',
        article: '제283조 (협박)',
        penalty: '3년 이하 징역 또는 500만원 이하 벌금',
      },
    ],
    riskLevel: '위험',
    analysisNote: '위협적 발언이 포함된 증거가 확인되어 협박죄 적용이 가능합니다.',
  },
  {
    category: '유포',
    laws: [
      {
        law: '성폭력범죄의 처벌 등에 관한 특례법',
        article: '제14조 (카메라 등을 이용한 촬영)',
        penalty: '7년 이하 징역 또는 5,000만원 이하 벌금',
      },
      {
        law: '성폭력범죄의 처벌 등에 관한 특례법',
        article: '제14조의3 (촬영물 이용 협박·강요)',
        penalty: '협박: 1년 이상 징역 / 강요: 3년 이상 징역',
      },
    ],
    riskLevel: '긴급',
    analysisNote: '촬영물 유포 또는 유포 협박 증거가 확인되어 성폭력처벌법 적용이 가능합니다.',
  },
  {
    category: '폭행',
    laws: [
      {
        law: '형법',
        article: '제260조 (폭행)',
        penalty: '2년 이하 징역 또는 500만원 이하 벌금',
      },
    ],
    riskLevel: '긴급',
    analysisNote: '신체적 폭력 증거가 확인됩니다.',
  },
];

// ─── 경고장 템플릿 데이터 (letter-templates.ts 통합) ────────────────────────────

export interface WarningLetterTemplate {
  type: 'strong' | 'moderate';
  label: string;
  title: string;
  description: string;
}

export const WARNING_LETTER_TEMPLATES: WarningLetterTemplate[] = [
  {
    type: 'strong',
    label: '제1안 — 강경',
    title: '스토킹 행위 등 즉시 중단 및 법적 조치 예고에 관한 경고',
    description: '강력한 법적 경고와 구체적 처벌 조항을 명시하는 강경한 경고장입니다.',
  },
  {
    type: 'moderate',
    label: '제2안 — 온건',
    title: '연락 중단 및 접근 금지 요청',
    description: '정중하지만 단호한 어조로 자발적 이행을 유도하는 온건한 경고장입니다.',
  },
];

// ─── 서류 유형 정의 ─────────────────────────────────────────────────────────────

export type DocumentType =
  | 'warning_letter_strong'
  | 'warning_letter_moderate'
  | 'stop_contact_request'
  | 'no_approach_request'
  | 'complaint'
  | 'evidence_report';

export interface DocumentTypeInfo {
  type: DocumentType;
  label: string;
  icon: string;
  description: string;
  stage: number; // 대응 단계 (1~3)
}

export const DOCUMENT_TYPES: DocumentTypeInfo[] = [
  {
    type: 'warning_letter_strong',
    label: '경고장 (강경)',
    icon: 'warning',
    description: '법적 조치를 예고하는 강경한 경고장',
    stage: 1,
  },
  {
    type: 'warning_letter_moderate',
    label: '경고장 (온건)',
    icon: 'mail',
    description: '자발적 이행을 유도하는 온건한 경고장',
    stage: 1,
  },
  {
    type: 'stop_contact_request',
    label: '연락중지 요청서',
    icon: 'call',
    description: '일체의 연락 중단을 요청하는 서류',
    stage: 1,
  },
  {
    type: 'no_approach_request',
    label: '접근금지 요청서',
    icon: 'hand-left',
    description: '주거지/직장 접근 금지를 요청하는 서류',
    stage: 1,
  },
  {
    type: 'complaint',
    label: '고소장',
    icon: 'document-text',
    description: '경찰 제출용 형사 고소장',
    stage: 3,
  },
  {
    type: 'evidence_report',
    label: '증거 분석 보고서',
    icon: 'shield-checkmark',
    description: '수집된 증거의 법률 분석 보고서',
    stage: 2,
  },
];

// ─── 대응 단계 추천 기준 ────────────────────────────────────────────────────────

export const RESPONSE_STAGE_CRITERIA = {
  warning: {
    label: '1단계: 경고장/내용증명',
    description: '60~70%의 사건이 이 단계에서 해결됩니다',
    conditions: ['첫 번째 대응', '반복 연락', '가벼운 접근 시도'],
  },
  police_report: {
    label: '2단계: 경찰 신고/고소',
    description: '경고 후에도 행위가 계속되는 경우',
    conditions: ['경고장 발송 후 행위 계속', '직접적 위협', '물리적 접근', '유포 행위'],
  },
  complaint: {
    label: '3단계: 고소 + 가처분',
    description: '심각한 범죄 행위에 대한 법적 조치',
    conditions: ['폭행/상해', '성범죄', '흉기 사용', '유포 협박 실행'],
  },
};
