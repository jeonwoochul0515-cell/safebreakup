// AI 법률 사무장 대화 관리자 (Mock)
// TODO: 실제 AI API 연동 시 교체

import type { ChatMessage, CasePhase } from '@/types/database';
import { OPTION_A_FOLLOWUP_QUESTIONS } from '@/constants/letter-templates';

// 단계별 mock 응답
const PHASE_RESPONSES: Record<CasePhase, string[]> = {
  1: [
    '안녕하세요, 이별방패 법률 사무장입니다. 먼저 지금 안전한 곳에 계신지 확인드려도 될까요?',
    '현재 위험한 상황에 놓여 계신 건 아닌지 확인이 필요합니다. 지금 안전하신가요?',
    '안전이 확인되었습니다. 감사합니다. 그럼 상황을 파악해 보겠습니다.',
  ],
  2: [
    '상대방과의 관계가 어떤 상태인지 여쭤봐도 될까요? (교제 중 / 이별 통보 후 / 이별 후)',
    '상대방의 문제 행동이 언제부터 시작되었나요?',
    '구체적으로 어떤 행동이 가장 힘드신가요? (연락 폭탄 / 미행·추적 / 협박 / 폭행 / 사진·영상 유포 협박)',
    '혹시 주변에 도움을 요청할 수 있는 가족이나 지인이 계신가요?',
  ],
  3: [
    '지금까지 증거를 확보하신 게 있으신가요? (카카오톡 캡처, 녹음, 사진 등)',
    '상대방의 협박이나 폭력이 담긴 메시지를 캡처해 두셨나요?',
    '통화 녹음이나 현장 녹음 파일이 있으신가요?',
    '증거 확인이 완료되었습니다. 법률 분석을 진행하겠습니다.',
  ],
  4: [
    '말씀하신 상황을 바탕으로 법률 분석 결과를 알려드리겠습니다.\n\n' +
    '■ 적용 가능 법률 (2024.1.12 개정 시행):\n' +
    '• 스토킹처벌법 제18조: 3년 이하 징역 / 3천만원 이하 벌금\n' +
    '  → 흉기 사용 시 5년 이하 징역 / 5천만원 이하 벌금\n' +
    '• 반의사불벌죄 폐지: 합의 없이도 처벌 진행\n' +
    '• 전자발찌 부착 가능 (제9조 제3호의2 신설)\n' +
    '• 성폭력처벌법 제14조의3: 촬영물 협박 시 1년 이상 징역\n\n' +
    '■ 유사 판례:\n' +
    '• 대법원 2023.5.18.: 부재중 전화 수십 회 → 스토킹 성립\n' +
    '• 2023도12345: 이별 후 반복 연락+미행 → 징역 6월, 집행유예 2년\n' +
    '• 2024고단678: 사진 유포 협박 → 징역 1년',
    '추가적인 법률 분석이 필요하시면 말씀해 주세요.',
  ],
  5: [
    '분석이 완료되었습니다. 두 가지 선택지를 준비했습니다.\n\n' +
    '【선택지 A: 법률 경고장 발송】\n' +
    '• 변호사 명의 법률 경고장을 상대방에게 발송\n' +
    '• 비용: 49,000원 (이메일/SNS) / 99,000원 (내용증명)\n' +
    '• 대부분의 경우 경고장만으로 행위 중단\n' +
    '• 추후 법적 대응의 증거로 활용 가능\n\n' +
    '【선택지 B: 스토킹처벌법 기반 법적 대응】\n' +
    '• 112 신고 → 긴급응급조치 즉시 발동 (100m 접근금지)\n' +
    '• 법원 잠정조치: 접근금지 + 통신금지 + 전자발찌 (최대 9개월)\n' +
    '• 피해자보호명령: 법원에 직접 신청 가능 (2024 신설)\n' +
    '• 국선변호사 무료 선임 가능\n' +
    '• 위반 시 2년 이하 징역 / 형사처벌 3년 이하 징역',
    '어떤 선택지를 원하시나요? 또는 추가 질문이 있으시면 말씀해 주세요.',
  ],
};

// Option A 후속 질문 세션 상태
const optionAState = new Map<string, {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  started: boolean;
  complete: boolean;
}>();

function getOrCreateOptionASession(sessionId: string) {
  if (!optionAState.has(sessionId)) {
    optionAState.set(sessionId, {
      currentQuestionIndex: 0,
      answers: {},
      started: false,
      complete: false,
    });
  }
  return optionAState.get(sessionId)!;
}

// 세션별 상태 저장 (메모리 내 mock)
const sessionState = new Map<string, {
  phase: CasePhase;
  messageIndex: Record<CasePhase, number>;
  facts: Record<string, string>;
}>();

function getOrCreateSession(sessionId: string) {
  if (!sessionState.has(sessionId)) {
    sessionState.set(sessionId, {
      phase: 1,
      messageIndex: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      facts: {},
    });
  }
  return sessionState.get(sessionId)!;
}

/**
 * 메시지 전송 → mock AI 응답 반환
 */
export function sendMessage(sessionId: string, message: string): ChatMessage {
  const session = getOrCreateSession(sessionId);
  const { phase } = session;
  const responses = PHASE_RESPONSES[phase];
  const idx = Math.min(session.messageIndex[phase], responses.length - 1);

  // 다음 메시지 인덱스 증가
  session.messageIndex[phase] = idx + 1;

  // 마지막 메시지에 도달하면 다음 단계로 자동 전환
  if (idx >= responses.length - 1 && phase < 5) {
    session.phase = (phase + 1) as CasePhase;
  }

  return {
    id: `msg-${Date.now()}`,
    conversation_id: sessionId,
    role: 'assistant',
    content: responses[idx],
    phase,
    created_at: new Date().toISOString(),
  };
}

/**
 * 현재 대화 단계 조회
 */
export function getCurrentPhase(sessionId: string): CasePhase {
  return getOrCreateSession(sessionId).phase;
}

/**
 * 수집된 사실관계 요약 조회
 */
export function getFactSummary(sessionId: string): Record<string, string> {
  // TODO: 실제 구현 시 AI가 추출한 사실관계 반환
  return {
    관계상태: '이별 후',
    문제행동: '반복 연락, 미행',
    기간: '약 2개월',
    증거: '카카오톡 캡처 5건, 녹음 2건',
    위험도: '높음',
  };
}

/**
 * 선택지 A/B 생성
 */
export function generateOptions(sessionId: string): { optionA: string; optionB: string } {
  // TODO: 실제 구현 시 AI 분석 기반 선택지 생성
  return {
    optionA:
      '변호사 명의 법률 경고장 발송 (이메일/SNS: 49,000원, 내용증명: 99,000원)\n' +
      '→ 법적 의사표시 기록, 대부분 경고장으로 행위 중단',
    optionB:
      '스토킹처벌법 기반 법적 대응 3단계\n' +
      '→ 112 신고 → 긴급응급조치(즉시 접근금지) → 잠정조치(전자발찌 + 최대 9개월)\n' +
      '→ 피해자보호명령 법원 직접 신청 가능 (2024 신설)\n' +
      '→ 국선변호사 무료, 반의사불벌죄 폐지로 합의 압박 차단',
  };
}

// ─── Option A 후속 질문 흐름 ────────────────────────────────────

/**
 * Option A 후속 질문 흐름 시작 → 첫 번째 질문 반환
 */
export function startOptionAFlow(sessionId: string): ChatMessage {
  const session = getOrCreateOptionASession(sessionId);
  session.started = true;
  session.currentQuestionIndex = 0;
  session.answers = {};
  session.complete = false;

  const firstQuestion = OPTION_A_FOLLOWUP_QUESTIONS[0];

  return {
    id: `msg-optA-${Date.now()}`,
    conversation_id: sessionId,
    role: 'assistant',
    content: `감사합니다. 경고장 작성에 필요한 몇 가지 정보를 여쭤볼게요. 불편하시면 건너뛸 수 있습니다.\n\n${firstQuestion.question}`,
    phase: 5,
    created_at: new Date().toISOString(),
  };
}

/**
 * Option A 후속 질문 응답 처리 → 다음 질문 또는 완료 메시지 반환
 */
export function handleOptionAResponse(
  sessionId: string,
  questionId: string,
  answer: string
): ChatMessage {
  const session = getOrCreateOptionASession(sessionId);

  // 답변 저장
  session.answers[questionId] = answer;

  // 다음 질문 인덱스
  const nextIndex = session.currentQuestionIndex + 1;
  session.currentQuestionIndex = nextIndex;

  // 모든 질문 완료
  if (nextIndex >= OPTION_A_FOLLOWUP_QUESTIONS.length) {
    session.complete = true;
    return {
      id: `msg-optA-${Date.now()}`,
      conversation_id: sessionId,
      role: 'assistant',
      content:
        '필요한 정보가 모두 수집되었습니다. 법률사무소 청송에서 경고장 초안을 작성하여 검토 후 발송해 드리겠습니다. 변호사 검토 후 1~2일 내에 결과를 안내드립니다.',
      phase: 5,
      created_at: new Date().toISOString(),
    };
  }

  // 다음 질문
  const nextQuestion = OPTION_A_FOLLOWUP_QUESTIONS[nextIndex];
  const ackPhrases = ['확인했습니다.', '감사합니다.'];
  const ack = ackPhrases[nextIndex % ackPhrases.length];

  return {
    id: `msg-optA-${Date.now()}`,
    conversation_id: sessionId,
    role: 'assistant',
    content: `${ack}\n\n${nextQuestion.question}`,
    phase: 5,
    created_at: new Date().toISOString(),
  };
}

/**
 * Option A 후속 질문이 모두 완료되었는지 확인
 */
export function isOptionAComplete(sessionId: string): boolean {
  const session = optionAState.get(sessionId);
  return session?.complete ?? false;
}

/**
 * Option A 에서 수집된 모든 답변 반환
 */
export function getCollectedLetterData(sessionId: string): Record<string, string> {
  const session = optionAState.get(sessionId);
  return session?.answers ?? {};
}

/**
 * 현재 Option A 질문 인덱스 반환
 */
export function getOptionACurrentIndex(sessionId: string): number {
  const session = optionAState.get(sessionId);
  return session?.currentQuestionIndex ?? 0;
}

/**
 * Option A 흐름이 시작되었는지 확인
 */
export function isOptionAStarted(sessionId: string): boolean {
  const session = optionAState.get(sessionId);
  return session?.started ?? false;
}
