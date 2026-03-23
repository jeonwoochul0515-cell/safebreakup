// AI 법률 사무장 대화 관리자 (Mock)
// TODO: 실제 AI API 연동 시 교체

import type { ChatMessage, CasePhase } from '@/types/database';

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
    '■ 적용 가능 법률:\n' +
    '• 스토킹처벌법 제18조: 3년 이하 징역 또는 3천만원 이하 벌금\n' +
    '• 정보통신망법 제44조의7: 불법 촬영물 유포 시 5년 이하 징역\n\n' +
    '■ 유사 판례:\n' +
    '• 2023도12345: 이별 후 반복 연락 → 스토킹죄 유죄, 징역 6개월\n' +
    '• 2024고단678: 사진 유포 협박 → 징역 1년',
    '추가적인 법률 분석이 필요하시면 말씀해 주세요.',
  ],
  5: [
    '분석이 완료되었습니다. 두 가지 선택지를 준비했습니다.\n\n' +
    '【선택지 A: 법률 경고장 발송】\n' +
    '• 변호사 명의 법률 경고장을 상대방에게 발송합니다\n' +
    '• 비용: 49,000원 (이메일/SNS) 또는 99,000원 (내용증명)\n' +
    '• 예상 효과: 대부분의 경우 경고장만으로 행위가 중단됩니다\n\n' +
    '【선택지 B: 경찰 신고 + 접근금지 가처분】\n' +
    '• 스토킹 신고 후 법원에 접근금지 가처분을 신청합니다\n' +
    '• 비용: 변호사 상담 별도\n' +
    '• 예상 효과: 법적 강제력 있는 접근금지 명령',
    '어떤 선택지를 원하시나요? 또는 추가 질문이 있으시면 말씀해 주세요.',
  ],
};

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
      '경찰 신고 + 접근금지 가처분 신청\n' +
      '→ 법적 강제력, 위반 시 처벌 가능',
  };
}
