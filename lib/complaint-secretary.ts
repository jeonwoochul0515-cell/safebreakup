// 고소장 작성 사무장 대화 엔진
// 법률사무장이 피해자와 대화하며 고소장 작성에 필요한 사실관계를 수집
// 기존 ai-secretary.ts의 Map 기반 세션 패턴 준수

import type {
  ComplaintPhase,
  CrimeType,
  ComplaintDraftData,
  Stage1Data,
  Stage2Data,
  Stage3Data,
  Stage4Data,
  Stage5Data,
  Stage6Data,
  Stage7Data,
} from '@/types/database';

// ─── 타입 정의 ──────────────────────────────────────────────────

export interface ComplaintMessage {
  text: string;
  phase: ComplaintPhase;
  questionId: string;
  inputType: 'text' | 'select' | 'multiselect' | 'date' | 'skip_allowed';
  options?: { label: string; value: string }[];
  isEmergency?: boolean;
}

/** 범죄사실 수집 서브 단계 */
type CrimeSubStage =
  | 'type_select'
  | 'stalking_behavior' | 'stalking_start' | 'stalking_frequency' | 'stalking_location' | 'stalking_latest'
  | 'threat_content' | 'threat_method' | 'threat_date' | 'threat_harm'
  | 'assault_date' | 'assault_location' | 'assault_method' | 'assault_injury'
  | 'sexual_confirm' | 'sexual_date' | 'sexual_location'
  | 'digital_filming' | 'digital_distribution' | 'digital_threat' | 'digital_channel'
  | 'other_describe'
  | 'crime_done';

/** 내부 세션 상태 */
interface ComplaintSession {
  phase: ComplaintPhase;
  questionIndex: number;
  crimeSubStage: CrimeSubStage;
  selectedCrimeTypes: CrimeType[];
  currentCrimeTypeIndex: number;
  paused: boolean;

  // 수집된 데이터
  data: {
    stage1: Partial<Stage1Data>;
    stage2: Partial<Stage2Data>;
    stage3: Partial<Stage3Data>;
    stage4: Partial<Stage4Data>;
    stage5: Partial<Stage5Data>;
    stage6: Partial<Stage6Data>;
    stage7: Partial<Stage7Data>;
  };

  createdAt: string;
  lastUpdatedAt: string;
}

// ─── 상수 ───────────────────────────────────────────────────────

const PHASE_ORDER: ComplaintPhase[] = [
  'safety', 'complainant', 'suspect', 'crime_facts', 'evidence', 'damage', 'punishment',
];

const PHASE_LABELS: Record<ComplaintPhase, string> = {
  safety: '안전 확인',
  complainant: '고소인 정보',
  suspect: '피고소인 정보',
  crime_facts: '범죄사실',
  evidence: '증거 현황',
  damage: '피해 결과',
  punishment: '처벌 희망',
};

/** 감정 감지 키워드 패턴 */
const EMOTION_PATTERNS: {
  keywords: string[];
  type: 'crying' | 'fear' | 'self_blame' | 'give_up' | 'self_harm';
}[] = [
  { keywords: ['ㅠㅠ', 'ㅜㅜ', '눈물', '울었', '울고', '울어', '우네'], type: 'crying' },
  { keywords: ['무서워', '두려워', '겁나', '떨려', '공포', '불안해'], type: 'fear' },
  { keywords: ['내 잘못', '제 잘못', '내가 잘못', '제가 잘못', '나 때문', '저 때문'], type: 'self_blame' },
  { keywords: ['못하겠', '그만할래', '포기', '관두', '못 하겠', '그만 할래', '안 할래'], type: 'give_up' },
  { keywords: ['죽고 싶', '죽겠', '자해', '자살', '없어지고', '사라지고'], type: 'self_harm' },
];

/** 감정 대응 메시지 */
const EMOTION_RESPONSES: Record<string, { prefix: string; action: 'pause' | 'reassure' | 'correct' | 'save' | 'emergency' }> = {
  crying: {
    prefix: '괜찮아요. 울어도 돼요. 충분히 그럴 수 있어요.\n천천히 하셔도 되니까, 준비되시면 말씀해 주세요.',
    action: 'pause',
  },
  fear: {
    prefix: '무서우신 게 당연해요. 지금 이 대화는 안전하고, 법이 보호해 줄 거예요.\n계속 진행해도 괜찮으신가요?',
    action: 'reassure',
  },
  self_blame: {
    prefix: '절대 본인 잘못이 아니에요. 잘못은 전적으로 가해자에게 있습니다.\n용기 내어 이 자리까지 오신 것 자체가 대단한 거예요.',
    action: 'correct',
  },
  give_up: {
    prefix: '지금까지 하신 것만으로도 정말 충분해요.\n여기까지 내용은 안전하게 저장해 둘 테니, 언제든 이어서 하실 수 있어요.\n어떠세요, 잠시 쉬었다 할까요?',
    action: 'save',
  },
  self_harm: {
    prefix: '혼자 감당하지 마세요. 지금 정말 힘드시다면, 꼭 도움을 받으세요.\n\n' +
      '지금 바로 연락해 주세요:\n' +
      '- 자살예방상담전화: 1393 (24시간)\n' +
      '- 정신건강위기상담: 1577-0199\n' +
      '- 여성긴급전화: 1366\n\n' +
      '저도 여기서 기다리고 있을게요.',
    action: 'emergency',
  },
};

/** 위험 상황 키워드 */
const DANGER_KEYWORDS = [
  '지금 앞에', '들어왔', '쫓아오', '문 두드', '밖에 있', '찾아왔',
  '같이 있', '못 나가', '갇혀', '잡혀', '때리고 있',
];

// ─── 세션 저장소 ─────────────────────────────────────────────────

const sessions = new Map<string, ComplaintSession>();

function getOrCreateSession(sessionId: string): ComplaintSession {
  if (!sessions.has(sessionId)) {
    const now = new Date().toISOString();
    sessions.set(sessionId, {
      phase: 'safety',
      questionIndex: 0,
      crimeSubStage: 'type_select',
      selectedCrimeTypes: [],
      currentCrimeTypeIndex: 0,
      paused: false,
      data: {
        stage1: {},
        stage2: {},
        stage3: {},
        stage4: { crime_types: [], incidents: [] },
        stage5: { evidence_types: [], witnesses: [], vault_evidence_ids: [] },
        stage6: {},
        stage7: { severe_punishment: false, protection_orders: [] },
      },
      createdAt: now,
      lastUpdatedAt: now,
    });
  }
  return sessions.get(sessionId)!;
}

// ─── 감정 감지 ───────────────────────────────────────────────────

function detectEmotion(message: string): string | null {
  const lower = message.toLowerCase();
  for (const pattern of EMOTION_PATTERNS) {
    if (pattern.keywords.some(kw => lower.includes(kw))) {
      return pattern.type;
    }
  }
  return null;
}

function detectDanger(message: string): boolean {
  const lower = message.toLowerCase();
  return DANGER_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── 메시지 빌더 ─────────────────────────────────────────────────

function buildMessage(
  phase: ComplaintPhase,
  questionId: string,
  text: string,
  inputType: ComplaintMessage['inputType'],
  options?: ComplaintMessage['options'],
  isEmergency?: boolean,
): ComplaintMessage {
  return { text, phase, questionId, inputType, options, isEmergency };
}

function withEmpathy(empathy: string, question: string): string {
  return `${empathy}\n\n${question}`;
}

// ─── 단계별 질문 생성 ────────────────────────────────────────────

function generateSafetyQuestion(session: ComplaintSession): ComplaintMessage {
  const idx = session.questionIndex;

  if (idx === 0) {
    return buildMessage('safety', 'safety_greeting',
      '안녕하세요, 법률사무장입니다.\n' +
      '오늘 용기 내어 찾아와 주셔서 감사합니다.\n' +
      '저와 함께 고소장 작성에 필요한 내용을 차근차근 정리해 볼 거예요.\n\n' +
      '먼저 가장 중요한 걸 여쭤볼게요.\n지금 안전한 곳에 계신가요?',
      'select',
      [
        { label: '네, 안전해요', value: 'safe' },
        { label: '잘 모르겠어요', value: 'unsure' },
        { label: '아니요, 위험해요', value: 'danger' },
      ],
    );
  }

  if (idx === 1) {
    const isSafe = session.data.stage1.is_safe;
    if (isSafe === false) {
      return buildMessage('safety', 'safety_emergency',
        '지금 안전이 가장 우선이에요.\n\n' +
        '즉시 연락해 주세요:\n' +
        '- 경찰: 112 (긴급 신고)\n' +
        '- 여성긴급전화: 1366 (24시간 상담 + 쉼터 연계)\n\n' +
        '안전한 상태가 되시면 언제든 다시 찾아와 주세요.\n' +
        '저장해 둘 테니 이어서 진행할 수 있어요.',
        'select',
        [
          { label: '안전해졌어요, 계속할게요', value: 'continue' },
          { label: '나중에 할게요', value: 'later' },
        ],
        true,
      );
    }
    // 안전 확인됨 → 다음 단계로
    session.data.stage1.confirmed_at = new Date().toISOString();
    return buildMessage('safety', 'safety_confirmed',
      withEmpathy(
        '안전하시다니 다행이에요.',
        '그럼 고소장 작성을 시작해 볼게요.\n' +
        '모든 질문에 "건너뛰기"가 가능하고, 언제든 쉬었다 할 수 있어요.\n' +
        '준비되셨나요?',
      ),
      'select',
      [
        { label: '네, 시작할게요', value: 'ready' },
        { label: '잠시만요', value: 'wait' },
      ],
    );
  }

  // 준비 확인 후 → complainant로 전환
  advancePhase(session);
  return generateComplainantQuestion(session);
}

function generateComplainantQuestion(session: ComplaintSession): ComplaintMessage {
  const idx = session.questionIndex;

  if (idx === 0) {
    return buildMessage('complainant', 'comp_intro',
      withEmpathy(
        '고소장에 들어갈 기본 정보를 여쭤볼게요.',
        '법적 서류에 필요한 부분이라 좀 딱딱하게 느껴지실 수 있는데,\n' +
        '정확하게 적어야 절차가 순탄하게 진행돼요.\n\n' +
        '성함이 어떻게 되세요?',
      ),
      'text',
    );
  }
  if (idx === 1) {
    return buildMessage('complainant', 'comp_birth',
      '생년월일을 알려주세요. (예: 1990-01-15)',
      'date',
    );
  }
  if (idx === 2) {
    return buildMessage('complainant', 'comp_address',
      '주소를 알려주세요.\n고소장에 기재되는 주소예요. 현재 거주지면 됩니다.',
      'text',
    );
  }
  if (idx === 3) {
    return buildMessage('complainant', 'comp_phone',
      '연락 가능한 전화번호를 알려주세요.',
      'text',
    );
  }
  if (idx === 4) {
    return buildMessage('complainant', 'comp_occupation',
      '직업을 알려주세요. (선택사항이에요, 건너뛰어도 돼요)',
      'skip_allowed',
    );
  }

  // 모든 정보 수집 완료 → suspect 단계로
  advancePhase(session);
  return generateSuspectQuestion(session);
}

function generateSuspectQuestion(session: ComplaintSession): ComplaintMessage {
  const idx = session.questionIndex;

  if (idx === 0) {
    return buildMessage('suspect', 'sus_intro',
      withEmpathy(
        '잘하고 계세요. 이제 상대방(피고소인) 정보를 여쭤볼게요.',
        '알고 계신 만큼만 말씀해 주시면 돼요.\n' +
        '이름을 모르더라도 고소는 가능하니 걱정 마세요.\n\n' +
        '상대방의 이름을 알고 계신가요?',
      ),
      'select',
      [
        { label: '네, 알고 있어요', value: 'known' },
        { label: '이름을 몰라요', value: 'unknown' },
      ],
    );
  }
  if (idx === 1) {
    if (session.data.stage3.name === null) {
      return buildMessage('suspect', 'sus_appearance',
        '이름은 모르셔도 괜찮아요. "인적사항 불상"으로 기재하면 됩니다.\n' +
        '혹시 외형 특징(키, 나이대, 인상착의 등)을 알려주실 수 있나요?',
        'skip_allowed',
      );
    }
    return buildMessage('suspect', 'sus_name',
      '상대방의 성명을 알려주세요.',
      'text',
    );
  }
  if (idx === 2) {
    return buildMessage('suspect', 'sus_relationship',
      '상대방과의 관계가 어떤 건가요?',
      'select',
      [
        { label: '연인/교제 상대', value: '교제' },
        { label: '전 연인 (이별 후)', value: '전 교제상대' },
        { label: '배우자', value: '혼인' },
        { label: '전 배우자', value: '전 혼인관계' },
        { label: '직장 동료/상사', value: '직장' },
        { label: '지인/아는 사람', value: '지인' },
        { label: '모르는 사람', value: '불상' },
        { label: '기타', value: '기타' },
      ],
    );
  }
  if (idx === 3) {
    return buildMessage('suspect', 'sus_period',
      '교제 기간은 대략 어느 정도인가요? (예: 약 1년 6개월)',
      'skip_allowed',
    );
  }
  if (idx === 4) {
    return buildMessage('suspect', 'sus_breakup',
      '이별 시기는 언제인가요? (예: 2025년 12월)',
      'skip_allowed',
    );
  }

  // → crime_facts 단계로
  advancePhase(session);
  return generateCrimeFactsQuestion(session);
}

function generateCrimeFactsQuestion(session: ComplaintSession): ComplaintMessage {
  const sub = session.crimeSubStage;

  // ─── 4-0: 피해 유형 선별 ──────
  if (sub === 'type_select') {
    return buildMessage('crime_facts', 'crime_type_select',
      withEmpathy(
        '여기까지 정말 잘해 주셨어요.',
        '이제 어떤 피해를 겪으셨는지 여쭤볼게요.\n' +
        '해당하는 것을 모두 선택해 주세요.',
      ),
      'multiselect',
      [
        { label: '반복적 연락/따라다님 (스토킹)', value: 'stalking' },
        { label: '해치겠다/퍼뜨리겠다 등 위협 (협박)', value: 'threat' },
        { label: '신체적 폭력 (폭행/상해)', value: 'assault' },
        { label: '성적 피해 (성범죄)', value: 'sexual' },
        { label: '사진/영상 촬영, 유포, 협박 (디지털 성범죄)', value: 'digital_sexual' },
        { label: '기타', value: 'other' },
      ],
    );
  }

  // ─── 4-A: 스토킹 ─────────────
  if (sub === 'stalking_behavior') {
    return buildMessage('crime_facts', 'stk_behavior',
      withEmpathy(
        '스토킹 피해에 대해 좀 더 자세히 여쭤볼게요.',
        '어떤 행위를 겪으셨나요? 해당하는 것을 모두 골라주세요.',
      ),
      'multiselect',
      [
        { label: '반복적 전화/문자/메시지', value: '반복연락' },
        { label: '미행, 뒤따라다님', value: '미행' },
        { label: '집/직장/학교 주변 배회', value: '배회' },
        { label: '원치 않는 선물/택배', value: '물품전달' },
        { label: 'SNS 계정 감시/접촉', value: 'SNS감시' },
        { label: '지인을 통한 접촉 시도', value: '간접접촉' },
        { label: '기타', value: '기타' },
      ],
    );
  }
  if (sub === 'stalking_start') {
    return buildMessage('crime_facts', 'stk_start',
      '이런 행위가 언제부터 시작되었나요? (예: 2025년 10월부터)',
      'text',
    );
  }
  if (sub === 'stalking_frequency') {
    return buildMessage('crime_facts', 'stk_frequency',
      '얼마나 자주 이런 일이 있나요?',
      'select',
      [
        { label: '매일', value: '매일' },
        { label: '일주일에 여러 번', value: '주수회' },
        { label: '일주일에 한두 번', value: '주1-2회' },
        { label: '한 달에 몇 번', value: '월수회' },
        { label: '불규칙적', value: '불규칙' },
      ],
    );
  }
  if (sub === 'stalking_location') {
    return buildMessage('crime_facts', 'stk_location',
      '주로 어디에서 이런 일이 발생하나요? (예: 집 앞, 직장 근처, 온라인 등)',
      'text',
    );
  }
  if (sub === 'stalking_latest') {
    return buildMessage('crime_facts', 'stk_latest',
      '가장 최근에 있었던 사건을 알려주세요.\n구체적일수록 고소장에 도움이 돼요.',
      'text',
    );
  }

  // ─── 4-B: 협박 ──────────────
  if (sub === 'threat_content') {
    return buildMessage('crime_facts', 'thr_content',
      withEmpathy(
        '협박 피해에 대해 여쭤볼게요. 기억나시는 만큼만 말씀해 주시면 돼요.',
        '어떤 말로 위협을 받으셨나요?\n가능하면 원문 그대로 적어주시면 증거력이 높아져요.',
      ),
      'text',
    );
  }
  if (sub === 'threat_method') {
    return buildMessage('crime_facts', 'thr_method',
      '어떤 방법으로 협박했나요?',
      'multiselect',
      [
        { label: '문자/카카오톡/메시지', value: '메시지' },
        { label: '전화', value: '전화' },
        { label: '직접 대면', value: '대면' },
        { label: 'SNS 메시지/댓글', value: 'SNS' },
        { label: '제3자를 통해', value: '제3자' },
        { label: '기타', value: '기타' },
      ],
    );
  }
  if (sub === 'threat_date') {
    return buildMessage('crime_facts', 'thr_date',
      '협박이 있었던 시기와 대략적인 횟수를 알려주세요.\n(예: 2025년 11월부터 약 10회 이상)',
      'text',
    );
  }
  if (sub === 'threat_harm') {
    return buildMessage('crime_facts', 'thr_harm',
      '어떤 종류의 위협이었나요?',
      'multiselect',
      [
        { label: '신체적 해를 가하겠다', value: '신체위해' },
        { label: '사진/영상을 퍼뜨리겠다', value: '유포위협' },
        { label: '직장/학교에 알리겠다', value: '사회적위협' },
        { label: '자해/자살하겠다', value: '자해협박' },
        { label: '가족에게 해를 가하겠다', value: '가족위협' },
        { label: '재산/물건을 부수겠다', value: '재산위협' },
        { label: '기타', value: '기타' },
      ],
    );
  }

  // ─── 4-C: 폭행/상해 ─────────
  if (sub === 'assault_date') {
    return buildMessage('crime_facts', 'ast_date',
      withEmpathy(
        '폭행/상해 피해에 대해 여쭤볼게요.\n힘드시면 언제든 "건너뛰기"라고 하셔도 돼요.',
        '폭행이 있었던 날짜(또는 대략적 시기)를 알려주세요.',
      ),
      'skip_allowed',
    );
  }
  if (sub === 'assault_location') {
    return buildMessage('crime_facts', 'ast_location',
      '어디에서 폭행이 발생했나요? (예: 집, 차 안, 길거리 등)',
      'text',
    );
  }
  if (sub === 'assault_method') {
    return buildMessage('crime_facts', 'ast_method',
      '어떤 방식의 폭력이었나요?',
      'multiselect',
      [
        { label: '주먹으로 때림', value: '구타' },
        { label: '밀침', value: '밀침' },
        { label: '물건을 던짐', value: '물건투척' },
        { label: '목을 조름', value: '목조름' },
        { label: '흉기(칼, 가위 등) 사용', value: '흉기' },
        { label: '잡아서 못 나가게 함', value: '감금' },
        { label: '기타', value: '기타' },
      ],
    );
  }
  if (sub === 'assault_injury') {
    return buildMessage('crime_facts', 'ast_injury',
      '어느 정도의 상해를 입으셨나요?\n병원에서 진단서를 받으셨으면 알려주세요.',
      'select',
      [
        { label: '멍/찰과상 정도', value: '경미' },
        { label: '치료가 필요한 부상', value: '중등' },
        { label: '입원이 필요했음', value: '중상' },
        { label: '외상 없이 통증만', value: '통증' },
        { label: '진단서 있음', value: '진단서있음' },
        { label: '건너뛰기', value: 'skip' },
      ],
    );
  }

  // ─── 4-D: 성범죄 (조심스럽게) ──
  if (sub === 'sexual_confirm') {
    return buildMessage('crime_facts', 'sex_confirm',
      '이 부분은 말씀하시기 정말 힘드실 수 있어요.\n' +
      '절대 무리하지 않으셔도 돼요.\n' +
      '"건너뛰기"라고 하시면 바로 다음으로 넘어갈게요.\n\n' +
      '잘못은 전적으로 가해자에게 있습니다.\n\n' +
      '성적 피해에 대해 이야기하실 수 있으신가요?',
      'select',
      [
        { label: '네, 말할 수 있어요', value: 'yes' },
        { label: '건너뛰고 싶어요', value: 'skip' },
      ],
    );
  }
  if (sub === 'sexual_date') {
    return buildMessage('crime_facts', 'sex_date',
      '대략적인 시기를 알려주세요. 정확하지 않아도 괜찮아요.',
      'skip_allowed',
    );
  }
  if (sub === 'sexual_location') {
    return buildMessage('crime_facts', 'sex_location',
      '발생 장소를 알려주세요. 말하기 어려우시면 건너뛰셔도 돼요.',
      'skip_allowed',
    );
  }

  // ─── 4-E: 디지털 성범죄 ──────
  if (sub === 'digital_filming') {
    return buildMessage('crime_facts', 'dig_filming',
      withEmpathy(
        '디지털 성범죄 피해에 대해 여쭤볼게요.',
        '동의 없이 촬영된 사진이나 영상이 있나요?',
      ),
      'select',
      [
        { label: '네', value: 'yes' },
        { label: '아니요', value: 'no' },
        { label: '잘 모르겠어요', value: 'unsure' },
      ],
    );
  }
  if (sub === 'digital_distribution') {
    return buildMessage('crime_facts', 'dig_distribution',
      '사진이나 영상이 유포된 적이 있나요?',
      'select',
      [
        { label: '네, 유포되었어요', value: 'yes' },
        { label: '아직 유포되지는 않았어요', value: 'no' },
        { label: '잘 모르겠어요', value: 'unsure' },
      ],
    );
  }
  if (sub === 'digital_threat') {
    return buildMessage('crime_facts', 'dig_threat',
      '사진이나 영상으로 협박을 받은 적이 있나요?\n(예: "뿌리겠다", "올리겠다" 등)',
      'select',
      [
        { label: '네, 협박받았어요', value: 'yes' },
        { label: '아니요', value: 'no' },
      ],
    );
  }
  if (sub === 'digital_channel') {
    return buildMessage('crime_facts', 'dig_channel',
      '유포 또는 유포 협박의 경로를 알려주세요.',
      'multiselect',
      [
        { label: '카카오톡/메시지', value: '메시지' },
        { label: '인스타그램/SNS', value: 'SNS' },
        { label: '텔레그램', value: '텔레그램' },
        { label: '불법 사이트', value: '불법사이트' },
        { label: '잘 모르겠어요', value: '불상' },
        { label: '기타', value: '기타' },
      ],
    );
  }

  // ─── 기타 ────────────────────
  if (sub === 'other_describe') {
    return buildMessage('crime_facts', 'other_describe',
      '어떤 피해를 겪으셨는지 자유롭게 말씀해 주세요.',
      'text',
    );
  }

  // crime_done → 다음 단계로 이동
  advancePhase(session);
  return generateEvidenceQuestion(session);
}

function generateEvidenceQuestion(session: ComplaintSession): ComplaintMessage {
  const idx = session.questionIndex;

  if (idx === 0) {
    return buildMessage('evidence', 'evi_intro',
      withEmpathy(
        '범죄사실 정리가 잘 되었어요. 정말 잘하고 계세요.',
        '이제 갖고 계신 증거에 대해 여쭤볼게요.\n' +
        '증거가 많을수록 유리하지만, 지금 당장 없어도 괜찮아요.\n\n' +
        '혹시 갖고 계신 증거가 있나요? 해당하는 것을 모두 골라주세요.',
      ),
      'multiselect',
      [
        { label: '문자/카카오톡/메시지 캡처', value: 'messenger' },
        { label: '통화 녹음/현장 녹음', value: 'recording' },
        { label: 'CCTV 영상', value: 'cctv' },
        { label: '의료 진단서/소견서', value: 'medical' },
        { label: '목격자가 있어요', value: 'witness' },
        { label: '112 신고 이력', value: 'police' },
        { label: '안전이별 증거보관함에 저장한 것이 있어요', value: 'vault' },
        { label: '증거가 없어요', value: 'none' },
      ],
    );
  }
  if (idx === 1 && session.data.stage5.witnesses && session.data.stage5.witnesses.length === 0
    && (session.data.stage5.evidence_types ?? []).includes('witness')) {
    return buildMessage('evidence', 'evi_witness',
      '목격자가 누구인지 알려주세요. (관계, 연락처 등)',
      'text',
    );
  }
  if (idx === 1 || idx === 2) {
    return buildMessage('evidence', 'evi_additional',
      '추가로 알려주실 증거나 메모가 있으신가요?',
      'skip_allowed',
    );
  }

  advancePhase(session);
  return generateDamageQuestion(session);
}

function generateDamageQuestion(session: ComplaintSession): ComplaintMessage {
  const idx = session.questionIndex;

  if (idx === 0) {
    return buildMessage('damage', 'dmg_intro',
      withEmpathy(
        '거의 다 왔어요. 조금만 더 힘내주세요.',
        '이제 피해 결과에 대해 여쭤볼게요.\n' +
        '해당하는 피해 유형을 모두 선택해 주세요.',
      ),
      'multiselect',
      [
        { label: '신체적 피해 (상해, 통증 등)', value: 'physical' },
        { label: '정신적 피해 (불안, 공포, 불면, 우울 등)', value: 'mental' },
        { label: '경제적 피해 (이사비, 치료비, 수입 감소 등)', value: 'financial' },
        { label: '사회적 피해 (직장, 학업, 대인관계 등)', value: 'social' },
      ],
    );
  }
  if (idx === 1) {
    return buildMessage('damage', 'dmg_physical',
      '신체적 피해에 대해 알려주세요.\n현재 치료 중이신 부분이 있으면 함께 말씀해 주세요.',
      'skip_allowed',
    );
  }
  if (idx === 2) {
    return buildMessage('damage', 'dmg_mental',
      '정신적으로 어떤 증상이 있으신가요?',
      'multiselect',
      [
        { label: '불안/초조', value: '불안' },
        { label: '공포', value: '공포' },
        { label: '불면증', value: '불면' },
        { label: '우울감', value: '우울' },
        { label: 'PTSD 증상', value: 'PTSD' },
        { label: '대인기피', value: '대인기피' },
        { label: '상담/치료 받고 있어요', value: '상담중' },
        { label: '건너뛰기', value: 'skip' },
      ],
    );
  }
  if (idx === 3) {
    return buildMessage('damage', 'dmg_financial',
      '경제적 피해가 있으시면 항목과 대략적 금액을 알려주세요.\n(예: 이사비 200만원, 치료비 50만원)',
      'skip_allowed',
    );
  }
  if (idx === 4) {
    return buildMessage('damage', 'dmg_social',
      '직장, 학업, 대인관계 등에 영향이 있으셨나요?',
      'skip_allowed',
    );
  }

  advancePhase(session);
  return generatePunishmentQuestion(session);
}

function generatePunishmentQuestion(session: ComplaintSession): ComplaintMessage {
  const idx = session.questionIndex;

  if (idx === 0) {
    return buildMessage('punishment', 'pun_intro',
      withEmpathy(
        '마지막 단계예요. 정말 잘 해주셨어요.',
        '가해자에 대한 처벌을 어떻게 원하시나요?',
      ),
      'select',
      [
        { label: '엄벌을 원합니다', value: 'severe' },
        { label: '선처를 구합니다', value: 'lenient' },
        { label: '잘 모르겠어요', value: 'unsure' },
      ],
    );
  }
  if (idx === 1) {
    return buildMessage('punishment', 'pun_protection',
      '피해자 보호를 위해 원하시는 조치가 있나요?',
      'multiselect',
      [
        { label: '접근금지 명령', value: '접근금지' },
        { label: '연락금지 명령', value: '연락금지' },
        { label: '전자장치(전자발찌) 부착', value: '전자장치' },
        { label: '100m 내 접근금지', value: '거리제한' },
        { label: '기타', value: '기타' },
      ],
    );
  }
  if (idx === 2) {
    return buildMessage('punishment', 'pun_additional',
      '추가로 원하시는 것이 있으면 자유롭게 말씀해 주세요.',
      'skip_allowed',
    );
  }
  if (idx === 3) {
    return buildMessage('punishment', 'pun_station',
      '고소장을 제출할 경찰서를 알고 계신가요?\n모르시면 건너뛰셔도 돼요.',
      'skip_allowed',
    );
  }

  // 완료
  return buildMessage('punishment', 'pun_complete',
    '모든 질문이 끝났습니다. 정말 수고 많으셨어요.\n\n' +
    '지금까지 말씀해 주신 내용을 바탕으로 고소장 초안을 작성해 드리겠습니다.\n' +
    '이 초안은 법률사무소 청송 담당 변호사의 검토를 거쳐 최종 확정됩니다.\n\n' +
    '본 문서는 AI가 작성한 초안이며, 법적 효력을 위해 변호사 검토가 필수입니다.',
    'select',
    [
      { label: '고소장 초안 확인하기', value: 'view_draft' },
      { label: '나중에 확인할게요', value: 'later' },
    ],
  );
}

// ─── 응답 처리 ───────────────────────────────────────────────────

function processSafetyResponse(session: ComplaintSession, message: string): void {
  const idx = session.questionIndex;
  const lower = message.toLowerCase();

  if (idx === 0) {
    if (lower.includes('danger') || lower.includes('위험') || lower.includes('아니')) {
      session.data.stage1.is_safe = false;
    } else if (lower.includes('unsure') || lower.includes('모르')) {
      session.data.stage1.is_safe = false;
    } else {
      session.data.stage1.is_safe = true;
    }
  }
  if (idx === 1 && session.data.stage1.is_safe === false) {
    if (lower.includes('continue') || lower.includes('계속') || lower.includes('안전')) {
      session.data.stage1.is_safe = true;
    }
  }

  session.questionIndex++;
}

function processComplainantResponse(session: ComplaintSession, message: string): void {
  const idx = session.questionIndex;
  const trimmed = message.trim();

  if (idx === 0) session.data.stage2.name = trimmed;
  if (idx === 1) session.data.stage2.birth_date = trimmed;
  if (idx === 2) session.data.stage2.address = trimmed;
  if (idx === 3) session.data.stage2.phone = trimmed;
  if (idx === 4 && trimmed && !isSkip(trimmed)) session.data.stage2.occupation = trimmed;

  session.questionIndex++;
}

function processSuspectResponse(session: ComplaintSession, message: string): void {
  const idx = session.questionIndex;
  const trimmed = message.trim();

  if (idx === 0) {
    if (trimmed.includes('unknown') || trimmed.includes('몰라')) {
      session.data.stage3.name = null;
    } else {
      // 이름 입력은 다음 단계에서
    }
  }
  if (idx === 1) {
    if (session.data.stage3.name === null) {
      if (!isSkip(trimmed)) session.data.stage3.appearance_description = trimmed;
    } else {
      session.data.stage3.name = trimmed;
    }
  }
  if (idx === 2) session.data.stage3.relationship = trimmed;
  if (idx === 3 && !isSkip(trimmed)) session.data.stage3.dating_period = trimmed;
  if (idx === 4 && !isSkip(trimmed)) session.data.stage3.breakup_date = trimmed;

  session.questionIndex++;
}

function processCrimeFactsResponse(session: ComplaintSession, message: string): void {
  const trimmed = message.trim();
  const sub = session.crimeSubStage;

  if (!session.data.stage4) {
    session.data.stage4 = { crime_types: [], incidents: [] };
  }

  // 4-0: 유형 선택
  if (sub === 'type_select') {
    const types = parseMultiSelect(trimmed) as CrimeType[];
    session.data.stage4.crime_types = types;
    session.selectedCrimeTypes = types.filter(t => t !== 'other');
    if (types.includes('other')) session.selectedCrimeTypes.push('other' as CrimeType);
    session.currentCrimeTypeIndex = 0;
    session.crimeSubStage = getFirstSubStageForCrimeType(session);
    return;
  }

  // 스토킹 서브
  if (sub === 'stalking_behavior') {
    if (!session.data.stage4.stalking) session.data.stage4.stalking = { behavior_types: [], start_date: '', frequency: '', locations: [], latest_incident: '' };
    session.data.stage4.stalking.behavior_types = parseMultiSelect(trimmed);
    session.crimeSubStage = 'stalking_start';
    return;
  }
  if (sub === 'stalking_start') {
    session.data.stage4.stalking!.start_date = trimmed;
    session.crimeSubStage = 'stalking_frequency';
    return;
  }
  if (sub === 'stalking_frequency') {
    session.data.stage4.stalking!.frequency = trimmed;
    session.crimeSubStage = 'stalking_location';
    return;
  }
  if (sub === 'stalking_location') {
    session.data.stage4.stalking!.locations = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    session.crimeSubStage = 'stalking_latest';
    return;
  }
  if (sub === 'stalking_latest') {
    session.data.stage4.stalking!.latest_incident = trimmed;
    advanceCrimeType(session);
    return;
  }

  // 협박 서브
  if (sub === 'threat_content') {
    if (!session.data.stage4.threat) session.data.stage4.threat = { content: '', method: '', date_range: '', count: 0, harm_type: '' };
    session.data.stage4.threat.content = trimmed;
    session.crimeSubStage = 'threat_method';
    return;
  }
  if (sub === 'threat_method') {
    session.data.stage4.threat!.method = trimmed;
    session.crimeSubStage = 'threat_date';
    return;
  }
  if (sub === 'threat_date') {
    session.data.stage4.threat!.date_range = trimmed;
    const numMatch = trimmed.match(/(\d+)/);
    session.data.stage4.threat!.count = numMatch ? parseInt(numMatch[1], 10) : 0;
    session.crimeSubStage = 'threat_harm';
    return;
  }
  if (sub === 'threat_harm') {
    session.data.stage4.threat!.harm_type = trimmed;
    advanceCrimeType(session);
    return;
  }

  // 폭행 서브
  if (sub === 'assault_date') {
    if (!session.data.stage4.assault) session.data.stage4.assault = { date: '', location: '', method: '', injury_level: '', medical_treatment: false };
    if (!isSkip(trimmed)) session.data.stage4.assault.date = trimmed;
    session.crimeSubStage = 'assault_location';
    return;
  }
  if (sub === 'assault_location') {
    session.data.stage4.assault!.location = trimmed;
    session.crimeSubStage = 'assault_method';
    return;
  }
  if (sub === 'assault_method') {
    session.data.stage4.assault!.method = trimmed;
    session.crimeSubStage = 'assault_injury';
    return;
  }
  if (sub === 'assault_injury') {
    if (trimmed.includes('진단서')) session.data.stage4.assault!.medical_treatment = true;
    session.data.stage4.assault!.injury_level = trimmed;
    advanceCrimeType(session);
    return;
  }

  // 성범죄 서브
  if (sub === 'sexual_confirm') {
    if (!session.data.stage4.sexual) session.data.stage4.sexual = { occurred: false };
    if (trimmed.includes('skip') || trimmed.includes('건너')) {
      session.data.stage4.sexual.skipped = true;
      advanceCrimeType(session);
      return;
    }
    session.data.stage4.sexual.occurred = true;
    session.crimeSubStage = 'sexual_date';
    return;
  }
  if (sub === 'sexual_date') {
    if (!isSkip(trimmed)) session.data.stage4.sexual!.date = trimmed;
    session.crimeSubStage = 'sexual_location';
    return;
  }
  if (sub === 'sexual_location') {
    if (!isSkip(trimmed)) session.data.stage4.sexual!.location = trimmed;
    advanceCrimeType(session);
    return;
  }

  // 디지털 성범죄 서브
  if (sub === 'digital_filming') {
    if (!session.data.stage4.digital_sexual) session.data.stage4.digital_sexual = { illegal_filming: false, distribution: false, distribution_threat: false };
    session.data.stage4.digital_sexual.illegal_filming = trimmed.includes('yes') || trimmed.includes('네');
    session.crimeSubStage = 'digital_distribution';
    return;
  }
  if (sub === 'digital_distribution') {
    session.data.stage4.digital_sexual!.distribution = trimmed.includes('yes') || trimmed.includes('네') || trimmed.includes('유포');
    session.crimeSubStage = 'digital_threat';
    return;
  }
  if (sub === 'digital_threat') {
    session.data.stage4.digital_sexual!.distribution_threat = trimmed.includes('yes') || trimmed.includes('네') || trimmed.includes('협박');
    if (session.data.stage4.digital_sexual!.distribution || session.data.stage4.digital_sexual!.distribution_threat) {
      session.crimeSubStage = 'digital_channel';
    } else {
      advanceCrimeType(session);
    }
    return;
  }
  if (sub === 'digital_channel') {
    session.data.stage4.digital_sexual!.distribution_channel = trimmed;
    advanceCrimeType(session);
    return;
  }

  // 기타
  if (sub === 'other_describe') {
    session.data.stage4.other_description = trimmed;
    advanceCrimeType(session);
    return;
  }
}

function processEvidenceResponse(session: ComplaintSession, message: string): void {
  const idx = session.questionIndex;
  const trimmed = message.trim();

  if (idx === 0) {
    const selected = parseMultiSelect(trimmed);
    session.data.stage5.evidence_types = selected;
    session.data.stage5.messenger_captures = selected.includes('messenger');
    session.data.stage5.recordings = selected.includes('recording');
    session.data.stage5.cctv = selected.includes('cctv');
    session.data.stage5.medical_records = selected.includes('medical');
    session.data.stage5.police_report_history = selected.includes('police');
    if (selected.includes('witness')) {
      // 목격자 정보는 다음 질문에서 수집
    }
  }
  if (idx === 1 && (session.data.stage5.evidence_types ?? []).includes('witness')) {
    session.data.stage5.witnesses = [trimmed];
  }
  if ((idx === 1 || idx === 2) && !isSkip(trimmed)) {
    session.data.stage5.additional_notes = trimmed;
  }

  session.questionIndex++;
}

function processDamageResponse(session: ComplaintSession, message: string): void {
  const idx = session.questionIndex;
  const trimmed = message.trim();

  if (idx === 0) {
    // 피해 유형 선택 — 이후 질문에서 상세 수집
  }
  if (idx === 1 && !isSkip(trimmed)) {
    session.data.stage6.physical_damage = { description: trimmed, under_treatment: trimmed.includes('치료') };
  }
  if (idx === 2) {
    const symptoms = parseMultiSelect(trimmed).filter(s => s !== 'skip');
    if (symptoms.length > 0) {
      session.data.stage6.mental_damage = {
        symptoms,
        counseling: symptoms.includes('상담중'),
      };
    }
  }
  if (idx === 3 && !isSkip(trimmed)) {
    session.data.stage6.financial_damage = {
      items: [{ category: trimmed, amount: 0 }],
      total_amount: 0,
    };
  }
  if (idx === 4 && !isSkip(trimmed)) {
    session.data.stage6.social_damage = { description: trimmed };
  }

  session.questionIndex++;
}

function processPunishmentResponse(session: ComplaintSession, message: string): void {
  const idx = session.questionIndex;
  const trimmed = message.trim();

  if (idx === 0) {
    session.data.stage7.severe_punishment = trimmed.includes('severe') || trimmed.includes('엄벌');
  }
  if (idx === 1) {
    session.data.stage7.protection_orders = parseMultiSelect(trimmed);
  }
  if (idx === 2 && !isSkip(trimmed)) {
    session.data.stage7.additional_requests = trimmed;
  }
  if (idx === 3 && !isSkip(trimmed)) {
    session.data.stage7.target_police_station = trimmed;
  }

  session.questionIndex++;
}

// ─── 헬퍼 ────────────────────────────────────────────────────────

function isSkip(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return lower === 'skip' || lower === '건너뛰기' || lower === '건너뛸게요'
    || lower === '패스' || lower === '다음' || lower === '';
}

function parseMultiSelect(input: string): string[] {
  // 쉼표 구분 또는 값 자체
  return input.split(',').map(s => s.trim()).filter(Boolean);
}

function advancePhase(session: ComplaintSession): void {
  const currentIndex = PHASE_ORDER.indexOf(session.phase);
  if (currentIndex < PHASE_ORDER.length - 1) {
    session.phase = PHASE_ORDER[currentIndex + 1];
    session.questionIndex = 0;
  }
  session.lastUpdatedAt = new Date().toISOString();
}

function getFirstSubStageForCrimeType(session: ComplaintSession): CrimeSubStage {
  if (session.currentCrimeTypeIndex >= session.selectedCrimeTypes.length) {
    return 'crime_done';
  }
  const crimeType = session.selectedCrimeTypes[session.currentCrimeTypeIndex];
  switch (crimeType) {
    case 'stalking': return 'stalking_behavior';
    case 'threat': return 'threat_content';
    case 'assault': return 'assault_date';
    case 'sexual': return 'sexual_confirm';
    case 'digital_sexual': return 'digital_filming';
    case 'other': return 'other_describe';
    default: return 'crime_done';
  }
}

function advanceCrimeType(session: ComplaintSession): void {
  session.currentCrimeTypeIndex++;
  session.crimeSubStage = getFirstSubStageForCrimeType(session);
}

function generateCurrentQuestion(session: ComplaintSession): ComplaintMessage {
  switch (session.phase) {
    case 'safety': return generateSafetyQuestion(session);
    case 'complainant': return generateComplainantQuestion(session);
    case 'suspect': return generateSuspectQuestion(session);
    case 'crime_facts': return generateCrimeFactsQuestion(session);
    case 'evidence': return generateEvidenceQuestion(session);
    case 'damage': return generateDamageQuestion(session);
    case 'punishment': return generatePunishmentQuestion(session);
    default: return generateSafetyQuestion(session);
  }
}

function processCurrentResponse(session: ComplaintSession, message: string): void {
  switch (session.phase) {
    case 'safety': processSafetyResponse(session, message); break;
    case 'complainant': processComplainantResponse(session, message); break;
    case 'suspect': processSuspectResponse(session, message); break;
    case 'crime_facts': processCrimeFactsResponse(session, message); break;
    case 'evidence': processEvidenceResponse(session, message); break;
    case 'damage': processDamageResponse(session, message); break;
    case 'punishment': processPunishmentResponse(session, message); break;
  }
}

// ─── Export 함수 ─────────────────────────────────────────────────

/**
 * 고소장 작성 세션 시작 → 첫 번째 질문(안전 확인) 반환
 */
export function startComplaintSession(sessionId: string): ComplaintMessage {
  // 기존 세션이 있으면 초기화
  sessions.delete(sessionId);
  const session = getOrCreateSession(sessionId);
  return generateCurrentQuestion(session);
}

/**
 * 사용자 응답 처리 → 다음 질문 반환
 * 감정 감지 시 감정 대응 메시지를 우선 반환
 */
export function handleResponse(sessionId: string, userMessage: string): ComplaintMessage {
  const session = getOrCreateSession(sessionId);
  session.lastUpdatedAt = new Date().toISOString();

  // 일시정지 상태 처리
  if (session.paused) {
    return buildMessage(session.phase, 'paused_notice',
      '세션이 일시정지 상태예요.\n"계속할게요"라고 말씀하시면 이어서 진행할게요.',
      'select',
      [
        { label: '계속할게요', value: 'resume' },
        { label: '다음에 할게요', value: 'later' },
      ],
    );
  }

  // 긴급 위험 감지
  if (detectDanger(userMessage)) {
    return buildMessage(session.phase, 'danger_detected',
      '지금 위험한 상황인 것 같아요!\n\n' +
      '즉시 연락해 주세요:\n' +
      '- 경찰: 112\n' +
      '- 여성긴급전화: 1366 (24시간)\n\n' +
      '안전해지시면 다시 말씀해 주세요. 여기서 기다리고 있을게요.',
      'select',
      [
        { label: '안전해졌어요', value: 'safe' },
        { label: '112에 신고했어요', value: 'reported' },
      ],
      true,
    );
  }

  // 감정 감지
  const emotion = detectEmotion(userMessage);
  if (emotion) {
    const response = EMOTION_RESPONSES[emotion];
    if (response) {
      if (response.action === 'emergency') {
        return buildMessage(session.phase, `emotion_${emotion}`, response.prefix, 'text', undefined, true);
      }
      if (response.action === 'save') {
        session.paused = true;
        return buildMessage(session.phase, `emotion_${emotion}`, response.prefix, 'select', [
          { label: '계속할게요', value: 'resume' },
          { label: '저장하고 나중에 할게요', value: 'save_exit' },
        ]);
      }
      if (response.action === 'pause') {
        return buildMessage(session.phase, `emotion_${emotion}`, response.prefix, 'select', [
          { label: '계속할게요', value: 'continue' },
          { label: '잠시 쉴게요', value: 'pause' },
        ]);
      }
      // reassure, correct → 감정 대응 후 현재 질문 다시 표시
      const currentQ = generateCurrentQuestion(session);
      return buildMessage(session.phase, `emotion_${emotion}`,
        response.prefix + '\n\n' + currentQ.text,
        currentQ.inputType,
        currentQ.options,
      );
    }
  }

  // 일반 응답 처리
  processCurrentResponse(session, userMessage);

  // 다음 질문 생성
  return generateCurrentQuestion(session);
}

/**
 * 현재 대화 단계 조회
 */
export function getCurrentPhase(sessionId: string): ComplaintPhase {
  return getOrCreateSession(sessionId).phase;
}

/**
 * 수집된 데이터 조회
 */
export function getCollectedData(sessionId: string): Partial<ComplaintDraftData> {
  const session = getOrCreateSession(sessionId);
  return {
    session_id: sessionId,
    created_at: session.createdAt,
    last_updated_at: session.lastUpdatedAt,
    current_phase: session.phase,
    completion_status: session.paused ? 'paused' : (isComplete(sessionId) ? 'completed' : 'in_progress'),
    stage1_safety: session.data.stage1 as Stage1Data,
    stage2_complainant: session.data.stage2 as Stage2Data,
    stage3_suspect: session.data.stage3 as Stage3Data,
    stage4_crime: session.data.stage4 as Stage4Data,
    stage5_evidence: session.data.stage5 as Stage5Data,
    stage6_damage: session.data.stage6 as Stage6Data,
    stage7_punishment: session.data.stage7 as Stage7Data,
  };
}

/**
 * 세션 완료 여부 확인
 */
export function isComplete(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  return session.phase === 'punishment' && session.questionIndex >= 4;
}

/**
 * 세션 일시정지
 */
export function pauseSession(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.paused = true;
    session.lastUpdatedAt = new Date().toISOString();
  }
}

/**
 * 세션 재개 → 현재 단계의 질문 반환
 */
export function resumeSession(sessionId: string): ComplaintMessage {
  const session = getOrCreateSession(sessionId);
  session.paused = false;
  session.lastUpdatedAt = new Date().toISOString();

  const phaseLabel = PHASE_LABELS[session.phase];
  const currentQ = generateCurrentQuestion(session);

  return buildMessage(session.phase, 'resume',
    `다시 오셨군요. 환영해요.\n현재 "${phaseLabel}" 단계까지 진행되어 있어요.\n이어서 진행할게요.\n\n` + currentQ.text,
    currentQ.inputType,
    currentQ.options,
  );
}

/**
 * 세션 초기화
 */
export function resetSession(sessionId: string): void {
  sessions.delete(sessionId);
}
