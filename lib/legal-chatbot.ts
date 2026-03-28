// 법률정보 AI 챗봇 엔진 v2
// 컨텍스트 인식 + 법률 지식 기반 대화
// TODO: Claude API 연동 시 이 파일의 generateResponse를 API 호출로 교체

interface ConversationContext {
  messages: { role: 'user' | 'bot'; text: string }[];
  detectedCategories: Set<string>;
  collectedFacts: Record<string, string>;
  phase: 'initial' | 'exploring' | 'deepening' | 'advising' | 'actionable';
  questionCount: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  mentionedEvidence: string[];
  mentionedBehaviors: string[];
}

const contexts = new Map<string, ConversationContext>();

function getContext(sessionId: string): ConversationContext {
  if (!contexts.has(sessionId)) {
    contexts.set(sessionId, {
      messages: [],
      detectedCategories: new Set(),
      collectedFacts: {},
      phase: 'initial',
      questionCount: 0,
      urgencyLevel: 'low',
      mentionedEvidence: [],
      mentionedBehaviors: [],
    });
  }
  return contexts.get(sessionId)!;
}

// ─── 키워드 → 카테고리/행동 분류 ────────────────────────────

const BEHAVIOR_PATTERNS: { keywords: string[]; behavior: string; category: string; urgency: 'low' | 'medium' | 'high' | 'critical' }[] = [
  // 스토킹
  { keywords: ['따라', '미행', '추적', '쫓아', '감시', '지켜보', '기다리'], behavior: '미행/추적', category: 'stalking', urgency: 'high' },
  { keywords: ['직장에', '학교에', '집에 와', '집앞', '기다리고 있'], behavior: '주거지/직장 방문', category: 'stalking', urgency: 'high' },
  { keywords: ['찾아와', '찾아옴', '방문'], behavior: '방문/접촉', category: 'stalking', urgency: 'medium' },
  { keywords: ['전화', '문자', '카톡', '연락', 'DM', '메시지', '부재중'], behavior: '반복 연락', category: 'stalking', urgency: 'medium' },
  { keywords: ['SNS', '인스타', '페이스북', '트위터', '계정', '팔로우', '댓글'], behavior: 'SNS 접촉', category: 'stalking', urgency: 'medium' },
  { keywords: ['선물', '택배', '꽃', '편지', '우편'], behavior: '물품 전달', category: 'stalking', urgency: 'medium' },
  // 협박
  { keywords: ['죽이', '죽여', '가만 안', '가만안둬', '두고 봐', '후회', '복수'], behavior: '살해/보복 위협', category: 'threat', urgency: 'critical' },
  { keywords: ['자해', '자살', '죽겠', '없어지겠', '내가 죽', '같이 죽'], behavior: '자해/자살 협박', category: 'threat', urgency: 'critical' },
  { keywords: ['퍼뜨리', '유포', '올리', '뿌리', '공개', '폭로'], behavior: '유포 협박', category: 'ncii', urgency: 'critical' },
  // 디지털 성범죄
  { keywords: ['사진', '영상', '동영상', '촬영', '몰카', '몸캠', '누드'], behavior: '촬영물 관련', category: 'ncii', urgency: 'critical' },
  { keywords: ['딥페이크', 'AI 합성', '합성'], behavior: '딥페이크', category: 'ncii', urgency: 'critical' },
  // 폭행
  { keywords: ['때리', '때렸', '맞았', '폭행', '폭력', '밀었', '밀치', '잡았'], behavior: '신체적 폭력', category: 'violence', urgency: 'high' },
  { keywords: ['목', '조르', '숨', '못 쉬'], behavior: '목졸림', category: 'violence', urgency: 'critical' },
  { keywords: ['칼', '흉기', '가위', '던지', '부수', '깨뜨'], behavior: '흉기/재물손괴', category: 'violence', urgency: 'critical' },
  // 성적
  { keywords: ['강제', '성관계', '성폭력', '성추행', '동의 없', '강간'], behavior: '성적 폭력', category: 'sexual', urgency: 'critical' },
  // 심리적
  { keywords: ['가스라이팅', '미쳤', '미친', '예민', '과민', '네 잘못', '네가 문제'], behavior: '가스라이팅', category: 'psychological', urgency: 'medium' },
  { keywords: ['고립', '친구 못 만나', '가족 못 만나', '연락 끊', '만나지 마'], behavior: '고립 유도', category: 'psychological', urgency: 'medium' },
  { keywords: ['돈', '통장', '월급', '카드', '빚', '대출', '일 못하'], behavior: '경제적 통제', category: 'financial', urgency: 'medium' },
  // 이별
  { keywords: ['헤어지', '이별', '끝내', '그만하', '관계 정리'], behavior: '이별 의사', category: 'breakup', urgency: 'low' },
  { keywords: ['무서워', '두려워', '불안', '겁나', '걱정', '떨려'], behavior: '공포/불안', category: 'emotional', urgency: 'medium' },
];

const EVIDENCE_KEYWORDS: { keywords: string[]; evidence: string }[] = [
  { keywords: ['캡처', '스크린샷', '화면', '저장'], evidence: '메시지 캡처' },
  { keywords: ['녹음', '녹취', '통화 녹음'], evidence: '통화 녹음' },
  { keywords: ['CCTV', '카메라', '영상'], evidence: 'CCTV/영상' },
  { keywords: ['진단서', '병원', '치료', '상처'], evidence: '의료 기록/진단서' },
  { keywords: ['신고', '경찰', '112'], evidence: '경찰 신고 기록' },
  { keywords: ['목격', '증인', '본 사람'], evidence: '목격자' },
];

// ─── 법률 지식 베이스 ────────────────────────────────────────

const LEGAL_KNOWLEDGE: Record<string, { laws: string; penalty: string; keyPoints: string[]; actionSteps: string[] }> = {
  stalking: {
    laws: '스토킹범죄의 처벌 등에 관한 법률 제18조',
    penalty: '3년 이하 징역 또는 3,000만원 이하 벌금 (흉기 사용 시 5년/5,000만원)',
    keyPoints: [
      '2024.1.12. 개정: 반의사불벌죄 폐지 — 합의 없이도 처벌 진행',
      '경찰이 즉시 긴급응급조치 가능 (100m 접근금지)',
      '법원 잠정조치: 전자발찌 부착 가능 (최대 9개월)',
      '피해자보호명령: 법원에 직접 신청 가능 (2024 신설)',
      '국선변호사 무료 선임 가능',
      '부재중 전화 수십 회만으로도 유죄 (대법원 2023.5.18.)',
    ],
    actionSteps: [
      '모든 접촉을 기록하세요 (날짜, 시간, 방법, 내용)',
      '문자/카톡은 반드시 캡처해두세요',
      '112에 신고하면 긴급응급조치가 즉시 발동됩니다',
      '안전이별에서 스토킹 사건 기록을 시작하세요',
      '변호사 경고장을 발송하면 대부분 행위가 중단됩니다',
    ],
  },
  threat: {
    laws: '형법 제283조 (협박죄) / 스토킹처벌법',
    penalty: '협박: 3년 이하 징역 또는 500만원 이하 벌금',
    keyPoints: [
      '직접적 위협뿐 아니라 암시적 위협도 협박죄 성립',
      '자해/자살 협박도 정서적 협박으로 처벌 가능',
      '"가만 안 두겠다" 같은 간접 표현도 협박에 해당',
      '반복되면 스토킹처벌법도 동시 적용 가능',
    ],
    actionSteps: [
      '위협 메시지를 절대 삭제하지 마세요 — 최고의 증거입니다',
      '전화 위협은 녹음하세요 (본인 대화 녹음은 합법)',
      '즉각적 위험이 있으면 112에 신고하세요',
      '증거를 모아 변호사 경고장 발송을 추천합니다',
    ],
  },
  ncii: {
    laws: '성폭력처벌법 제14조 / 제14조의2 / 제14조의3',
    penalty: '촬영: 7년 이하 징역, 유포: 7년 이하, 협박: 1년 이상, 강요: 3년 이상',
    keyPoints: [
      '동의 없는 촬영 자체가 범죄 (성폭력처벌법 제14조)',
      '유포 협박만으로도 1년 이상 징역 (제14조의3)',
      '딥페이크 합성/유포: 5년 이하 징역 (제14조의2)',
      'D4U센터(02-735-8994)에서 24시간 삭제 지원',
      'StopNCII.org에서 해시 등록하면 자동 차단',
      '2024년 딥페이크 568% 급증 — 적극 대응 필요',
    ],
    actionSteps: [
      '유포된 URL을 저장하고 스크린샷을 찍으세요',
      'D4U센터(02-735-8994)에 즉시 연락하세요',
      '가해자의 요구에 절대 응하지 마세요',
      '경찰에 신고하세요 (112)',
      '안전이별에서 삭제 요청 템플릿을 사용하세요',
    ],
  },
  violence: {
    laws: '형법 제260조 (폭행) / 제257조 (상해)',
    penalty: '폭행: 2년 이하 징역, 상해: 7년 이하 징역',
    keyPoints: [
      '밀치기, 물건 던지기도 폭행에 해당',
      '목졸림은 살인미수로 볼 수 있는 극도로 위험한 행위',
      '상처 사진, 진단서는 매우 강력한 증거',
      '가정폭력처벌법도 동시 적용 가능',
    ],
    actionSteps: [
      '안전한 곳으로 즉시 대피하세요',
      '상처가 있으면 사진을 찍고 병원에서 진단서를 받으세요',
      '112에 신고하세요',
      '1366 여성긴급전화로 쉼터 연계가 가능합니다',
    ],
  },
  sexual: {
    laws: '형법 제297조 (강간) / 성폭력처벌법',
    penalty: '강간: 3년 이상 징역, 강제추행: 10년 이하 징역',
    keyPoints: [
      '연인/배우자 사이에서도 동의 없는 성관계는 강간죄',
      '음주 상태에서의 동의는 유효하지 않을 수 있음',
      '피해 직후 해바라기센터 방문 시 증거채취+상담+의료 원스톱 지원',
    ],
    actionSteps: [
      '서울해바라기센터 02-3400-1700 (24시간)',
      '씻지 마시고 입고 있던 옷을 보관하세요 (증거)',
      '112 또는 1366에 연락하세요',
    ],
  },
  psychological: {
    laws: '정서적 학대 자체는 별도 처벌법 없으나, 스토킹/협박/모욕죄 적용 가능',
    penalty: '모욕: 1년 이하 징역, 명예훼손: 5년 이하 징역',
    keyPoints: [
      '가스라이팅은 심리적 학대의 대표적 형태',
      '지속적 모욕, 비하는 모욕죄(형법 제311조) 적용 가능',
      '제3자 앞에서의 비하는 명예훼손죄 적용 가능',
      '심리적 학대의 기록이 이후 스토킹/폭행 사건에서 중요한 맥락 증거',
    ],
    actionSteps: [
      '가스라이팅 자가테스트를 해보세요',
      '관계건강 저널에 매일 기록하세요 — 패턴이 보입니다',
      '전문 심리상담을 받으세요',
      '경제적/물리적 독립을 준비하세요',
    ],
  },
  financial: {
    laws: '재산범죄(횡령, 사기), 강요죄 등 적용 가능',
    penalty: '횡령: 5년 이하 징역, 사기: 10년 이하 징역',
    keyPoints: [
      '돈을 빌려가고 안 갚는 것은 사기죄 적용 가능',
      '강제로 대출을 받게 한 것은 강요죄',
      '통장/카드 압수는 재산권 침해',
    ],
    actionSteps: [
      '모든 금전 거래 내역을 확보하세요',
      '안전이별 경제적 학대 자가진단을 해보세요',
      '비밀 계좌를 준비하세요',
      '정부 지원 프로그램을 확인하세요',
    ],
  },
  breakup: {
    laws: '이별 자체는 법적 사안이 아니나, 이별 과정의 폭력/협박/스토킹은 모두 처벌 대상',
    penalty: '상황에 따라 다양한 법률 적용',
    keyPoints: [
      '이별 후 1개월이 가장 위험한 시기 (살인의 30%)',
      '안전한 장소, 안전한 방법으로 이별하는 것이 중요',
      '이별 의사는 명확하게, 한 번만 전달',
      '이별 후 모든 연락을 차단해도 법적으로 문제없음',
    ],
    actionSteps: [
      '위험도 진단을 먼저 해보세요',
      '안전 탈출 계획을 세우세요',
      '공공장소에서 이별하고, 혼자 가지 마세요',
      '이별 경호 서비스도 이용할 수 있습니다',
    ],
  },
  emotional: {
    laws: '',
    penalty: '',
    keyPoints: [
      '지금 느끼시는 두려움과 불안은 완전히 정상적인 반응입니다',
      '당신의 감각을 믿으세요 — 피해자의 직감은 매우 정확합니다',
      '혼자 감당하지 않아도 됩니다',
    ],
    actionSteps: [
      '안전이별 그라운딩 & 호흡법을 사용해보세요',
      '1366 여성긴급전화 (24시간) 상담 가능',
      '전문 상담사 연결도 가능합니다',
    ],
  },
};

// ─── 자해/자살 위기 키워드 ────────────────────────────────────

const SELF_HARM_KEYWORDS = ['죽고 싶', '자살', '자해', '죽겠', '없어지고', '사라지고', '끝내고'];

// ─── 응답 생성 엔진 ──────────────────────────────────────────

export interface ChatbotResponse {
  text: string;
  isEmergency: boolean;
}

export function generateResponse(sessionId: string, userMessage: string): ChatbotResponse {
  const ctx = getContext(sessionId);
  ctx.messages.push({ role: 'user', text: userMessage });
  ctx.questionCount++;

  const lower = userMessage.toLowerCase();

  // 자해/자살 키워드 감지 → 즉시 위기 응답
  const hasSelfHarmKeyword = SELF_HARM_KEYWORDS.some(kw => lower.includes(kw));
  if (hasSelfHarmKeyword) {
    const crisisResponse =
      '💛 지금 많이 힘드시죠. 당신의 마음이 걱정됩니다.\n\n' +
      '당신은 소중한 사람이고, 도움을 받으실 수 있습니다.\n\n' +
      '📞 지금 바로 연락해주세요:\n' +
      '• 자살예방상담전화 1393 (24시간)\n' +
      '• 정신건강위기상담전화 1577-0199 (24시간)\n' +
      '• 생명의전화 1588-9191\n\n' +
      '전문 상담사가 24시간 기다리고 있습니다. 혼자 감당하지 않으셔도 됩니다.';
    ctx.messages.push({ role: 'bot', text: crisisResponse });
    return { text: crisisResponse, isEmergency: true };
  }

  // 행동 패턴 감지
  const detectedBehaviors: string[] = [];
  for (const pattern of BEHAVIOR_PATTERNS) {
    if (pattern.keywords.some(kw => lower.includes(kw))) {
      ctx.detectedCategories.add(pattern.category);
      if (!ctx.mentionedBehaviors.includes(pattern.behavior)) {
        ctx.mentionedBehaviors.push(pattern.behavior);
        detectedBehaviors.push(pattern.behavior);
      }
      // 긴급도 업데이트
      const urgencyOrder = ['low', 'medium', 'high', 'critical'];
      if (urgencyOrder.indexOf(pattern.urgency) > urgencyOrder.indexOf(ctx.urgencyLevel)) {
        ctx.urgencyLevel = pattern.urgency;
      }
    }
  }

  // 증거 감지
  for (const ep of EVIDENCE_KEYWORDS) {
    if (ep.keywords.some(kw => lower.includes(kw))) {
      if (!ctx.mentionedEvidence.includes(ep.evidence)) {
        ctx.mentionedEvidence.push(ep.evidence);
      }
    }
  }

  // 숫자 감지 (횟수, 기간)
  const numberMatch = userMessage.match(/(\d+)\s*(번|회|일|개월|달|주|년)/);
  if (numberMatch) {
    ctx.collectedFacts['frequency'] = numberMatch[0];
  }

  // 날짜 감지
  const dateMatch = userMessage.match(/(\d{1,2})\s*월|(\d{4})\s*년|어제|오늘|그제|지난\s*(주|달|해)/);
  if (dateMatch) {
    ctx.collectedFacts['timeframe'] = dateMatch[0];
  }

  // ─── 긴급 상황 우선 처리 (첫 메시지에서는 상황 파악 우선) ───
  if (ctx.urgencyLevel === 'critical' && ctx.phase !== 'advising' && ctx.questionCount > 1) {
    ctx.phase = 'advising';
    const cats = Array.from(ctx.detectedCategories);
    let urgentResponse = '⚠️ 지금 말씀하신 상황은 매우 심각합니다. 당신의 안전이 가장 중요합니다.\n\n';

    if (cats.includes('violence') && ctx.mentionedBehaviors.includes('목졸림')) {
      urgentResponse += '🔴 목졸림은 살인의 가장 강력한 예측 인자입니다. 즉시 안전한 곳으로 대피해주세요.\n\n';
    }

    urgentResponse += '📞 지금 즉시:\n';
    urgentResponse += '• 112 (경찰) — 신고 즉시 긴급응급조치 발동\n';
    urgentResponse += '• 1366 (여성긴급전화) — 24시간 상담 + 쉼터 연계\n\n';
    urgentResponse += '안전한 상태가 확인되면, 구체적인 법적 대응을 안내해드리겠습니다. 지금 안전하신가요?';

    ctx.messages.push({ role: 'bot', text: urgentResponse });
    return { text: urgentResponse, isEmergency: true };
  }

  // ─── 대화 단계별 응답 ───

  // Phase: initial → exploring
  if (ctx.phase === 'initial') {
    ctx.phase = 'exploring';

    if (detectedBehaviors.length > 0) {
      const primaryCategory = Array.from(ctx.detectedCategories)[0];
      const knowledge = LEGAL_KNOWLEDGE[primaryCategory];

      let response = getEmpathyMessage(primaryCategory) + '\n\n';

      if (knowledge) {
        response += `📌 알아두세요:\n${knowledge.keyPoints.slice(0, 2).map(p => `• ${p}`).join('\n')}\n\n`;
      }

      response += getFollowUpQuestion(ctx);

      ctx.messages.push({ role: 'bot', text: response });
      return { text: response, isEmergency: false };
    }

    // 키워드 매칭 실패 시
    let response = '말씀 감사합니다. 상황을 좀 더 이해하고 싶어요.\n\n';
    response += '혹시 다음 중 해당하는 것이 있으신가요?\n\n';
    response += '• 상대방이 계속 연락하거나 찾아와요\n';
    response += '• 위협적인 말이나 행동을 해요\n';
    response += '• 사진이나 영상으로 협박해요\n';
    response += '• 때리거나 신체적 폭력이 있었어요\n';
    response += '• 이별을 준비하고 있어요\n';
    response += '• 심리적으로 힘든 상황이에요\n\n';
    response += '어떤 상황이든 편하게 말씀해주세요. 천천히 들을게요.';

    ctx.messages.push({ role: 'bot', text: response });
    return { text: response, isEmergency: ctx.urgencyLevel === 'critical' };
  }

  // Phase: exploring → deepening
  if (ctx.phase === 'exploring') {
    if (detectedBehaviors.length > 0 || ctx.detectedCategories.size > 0) {
      ctx.phase = 'deepening';
    }

    const allCategories = Array.from(ctx.detectedCategories);
    let response = '확인했습니다. ';

    if (ctx.mentionedBehaviors.length > 0) {
      response += `지금까지 말씀해주신 내용을 정리하면:\n\n`;
      response += ctx.mentionedBehaviors.map(b => `• ${b}`).join('\n');
      response += '\n\n';
    }

    // 법률 정보 제공
    if (allCategories.length > 0) {
      const primaryCat = allCategories[allCategories.length - 1];
      const knowledge = LEGAL_KNOWLEDGE[primaryCat];
      if (knowledge && knowledge.laws) {
        response += `⚖️ 법적으로:\n`;
        response += `• ${knowledge.laws}\n`;
        response += `• ${knowledge.penalty}\n\n`;
        response += knowledge.keyPoints.slice(0, 3).map(p => `📌 ${p}`).join('\n') + '\n\n';
      }
    }

    response += getFollowUpQuestion(ctx);

    ctx.messages.push({ role: 'bot', text: response });
    return { text: response, isEmergency: ctx.urgencyLevel === 'critical' };
  }

  // Phase: deepening → advising
  if (ctx.phase === 'deepening') {
    ctx.phase = 'advising';

    const allCategories = Array.from(ctx.detectedCategories);
    let response = '';

    // 증거 상황 파악
    if (ctx.mentionedEvidence.length > 0) {
      response += `👍 확보하신 증거:\n${ctx.mentionedEvidence.map(e => `✅ ${e}`).join('\n')}\n\n`;
    }

    // 추가 필요 증거 안내
    const missingEvidence = ['메시지 캡처', '통화 녹음', '목격자', '경찰 신고 기록']
      .filter(e => !ctx.mentionedEvidence.includes(e));
    if (missingEvidence.length > 0) {
      response += `📋 추가로 확보하면 좋은 증거:\n${missingEvidence.slice(0, 3).map(e => `• ${e}`).join('\n')}\n\n`;
    }

    // 종합 행동 안내
    response += '─────────────────\n';
    response += '🛡️ 지금 할 수 있는 것들:\n\n';

    for (const cat of allCategories) {
      const knowledge = LEGAL_KNOWLEDGE[cat];
      if (knowledge) {
        response += knowledge.actionSteps.slice(0, 3).map(s => `• ${s}`).join('\n') + '\n';
      }
    }

    response += '\n안전이별에서 바로 도와드릴 수 있습니다:\n';
    response += '✅ 변호사 명의 법률 경고장 발송 (49,000원~)\n';
    response += '✅ 경찰 제출용 증거 보고서 작성 (99,000원)\n';
    response += '✅ 증거 수집 & 포렌식 보관\n';

    if (allCategories.includes('stalking')) {
      response += '✅ 스토킹 사건 체계적 기록\n';
    }
    if (allCategories.includes('ncii')) {
      response += '✅ 플랫폼별 삭제 요청 템플릿\n';
    }
    if (allCategories.includes('breakup')) {
      response += '✅ 이별 경호 서비스 (전문 경호원 동행)\n';
    }

    response += '\n어떤 도움부터 시작할까요?';

    ctx.messages.push({ role: 'bot', text: response });
    return { text: response, isEmergency: ctx.urgencyLevel === 'critical' };
  }

  // Phase: advising → actionable
  if (ctx.phase === 'advising') {
    ctx.phase = 'actionable';

    let response = '';

    // 사용자가 특정 서비스를 선택한 경우
    if (lower.includes('경고장') || lower.includes('내용증명')) {
      response = '경고장 발송을 진행해 보시겠어요?\n\n';
      response += '📋 경고장 종류:\n';
      response += '• 이메일/SNS 경고장: 49,000원\n';
      response += '• 내용증명 우편 발송: 99,000원\n\n';
      response += '경고장만으로 80% 이상의 경우에서 행위가 중단됩니다.\n';
      response += 'AI 사무장이 필요한 정보를 안내해드릴게요.\n\n';
      response += '👉 AI 사무장에서 바로 시작하시겠어요?';
    } else if (lower.includes('증거') || lower.includes('기록') || lower.includes('보관')) {
      response = '증거 수집부터 시작하는 건 아주 좋은 판단이에요.\n\n';
      response += '안전이별 증거보관함에서:\n';
      response += '• 텍스트/사진/음성/파일 저장 가능\n';
      response += '• SHA-256 해시로 무결성 자동 보장\n';
      response += '• 타임스탬프 자동 기록\n';
      response += '• 법정 제출용 PDF 자동 생성\n\n';
      response += '👉 증거보관함으로 이동할까요?';
    } else if (lower.includes('신고') || lower.includes('경찰')) {
      response = '경찰 신고를 결심하셨군요. 용기 있는 결정이에요.\n\n';
      response += '📞 112에 신고하면:\n';
      response += '1. 즉시 긴급응급조치 발동 (100m 접근금지)\n';
      response += '2. 48시간 내 법원 승인\n';
      response += '3. 최대 1개월간 보호\n\n';
      response += '신고 전 준비:\n';
      response += '• 증거 정리 (캡처, 녹음 등)\n';
      response += '• 피해 사실 정리 (날짜, 횟수)\n';
      response += '• 신분증 지참\n\n';
      response += '안전이별에서 경찰 제출용 보고서를 만들어드릴까요? (99,000원)';
    } else if (lower.includes('상담') || lower.includes('변호사')) {
      response = '전문가 상담은 현명한 선택이에요.\n\n';
      response += '📞 무료 상담:\n';
      response += '• 1366 여성긴급전화 (24시간)\n';
      response += '• 132 법률구조공단 (무료 법률 상담)\n\n';
      response += '👨‍⚖️ 법률사무소 청송 상담:\n';
      response += '• 전화/카카오톡/방문 상담 가능\n';
      response += '• 대표변호사 김창희 직접 상담\n\n';
      response += '👉 상담 예약을 도와드릴까요?';
    } else {
      // 일반적인 추가 질문
      response = '감사합니다. 추가로 궁금하신 점이 있으시면 편하게 물어보세요.\n\n';
      response += '이런 것들도 도와드릴 수 있어요:\n';
      response += '• "경고장 보내고 싶어요" → AI 사무장이 안내\n';
      response += '• "증거 모으고 싶어요" → 증거보관함 안내\n';
      response += '• "경찰에 신고하고 싶어요" → 신고 준비 안내\n';
      response += '• "상담 받고 싶어요" → 상담 예약 안내\n';
    }

    ctx.messages.push({ role: 'bot', text: response });
    return { text: response, isEmergency: ctx.urgencyLevel === 'critical' };
  }

  // Phase: actionable — 계속 안내
  let response = '';
  if (detectedBehaviors.length > 0) {
    // 새로운 행동이 감지되면 추가 법률 정보 제공
    const latestCat = Array.from(ctx.detectedCategories).pop() || '';
    const knowledge = LEGAL_KNOWLEDGE[latestCat];
    if (knowledge) {
      response = '추가로 말씀해주신 부분도 중요합니다.\n\n';
      response += `⚖️ ${knowledge.laws}\n`;
      response += `• ${knowledge.penalty}\n\n`;
      response += knowledge.actionSteps.slice(0, 2).map(s => `• ${s}`).join('\n');
      response += '\n\n이 부분도 함께 대응하시겠어요?';
    }
  } else {
    response = '네, 알겠습니다. ';
    response += '더 궁금하신 점이 있으시면 언제든 물어보세요. ';
    response += '안전이별가 끝까지 함께하겠습니다. 💛';
  }

  ctx.messages.push({ role: 'bot', text: response });
  return { text: response, isEmergency: ctx.urgencyLevel === 'critical' };
}

// ─── 헬퍼 함수들 ─────────────────────────────────────────

function getEmpathyMessage(category: string): string {
  const messages: Record<string, string> = {
    stalking: '원치 않는 연락이나 접촉이 계속되면 불안하실 수 있어요. 상황에 따라 법적으로 보호받으실 수 있습니다.',
    threat: '그런 위협을 받으셨다니 정말 두려우셨을 거예요. 당신의 안전이 가장 중요합니다. 도움을 받으실 수 있습니다.',
    ncii: '정말 힘든 상황이시네요. 이건 심각한 범죄이고, 절대 당신의 잘못이 아닙니다.',
    violence: '그런 일을 겪으셨다니 정말 마음이 아픕니다. 어떤 이유에서든 폭력은 절대 정당화될 수 없습니다.',
    sexual: '말씀하기 어려웠을 텐데 용기 내어 주셔서 감사합니다. 당신은 잘못이 없습니다.',
    psychological: '오래 지속된 심리적 압박은 보이지 않는 상처를 남깁니다. 당신의 감각이 맞습니다.',
    financial: '경제적 통제는 관계에서 벗어나기 어렵게 만드는 심각한 학대입니다. 탈출 방법이 있습니다.',
    breakup: '이별을 결심하셨군요. 그것만으로도 큰 용기입니다. 안전하게 진행하는 것이 가장 중요해요.',
    emotional: '지금 많이 힘드시죠. 그 감정은 너무나 자연스러운 거예요. 당신은 혼자가 아닙니다.',
  };
  return messages[category] || '말씀해주셔서 감사합니다. 충분히 이해합니다.';
}

function getFollowUpQuestion(ctx: ConversationContext): string {
  const cats = Array.from(ctx.detectedCategories);

  // 기간을 아직 모르면
  if (!ctx.collectedFacts['timeframe']) {
    return '혹시 이런 상황이 언제부터 시작되었나요?';
  }

  // 빈도를 아직 모르면
  if (!ctx.collectedFacts['frequency'] && (cats.includes('stalking') || cats.includes('threat'))) {
    return '얼마나 자주 이런 일이 있나요? (예: 하루에 몇 번, 일주일에 몇 번)';
  }

  // 증거 파악
  if (ctx.mentionedEvidence.length === 0) {
    return '혹시 이런 행동의 증거(문자 캡처, 녹음, 사진 등)를 가지고 계신가요?';
  }

  // 이전 신고 여부
  if (!ctx.collectedFacts['priorReport']) {
    ctx.collectedFacts['priorReport'] = 'asked';
    return '이전에 경찰이나 상담센터에 신고하거나 상담하신 적이 있나요?';
  }

  // 원하는 조치
  return '가장 원하시는 건 어떤 건가요? 연락 차단, 법적 처벌, 안전 확보 중 어떤 게 가장 시급하신가요?';
}

export function resetSession(sessionId: string): void {
  contexts.delete(sessionId);
}
