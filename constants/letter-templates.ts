// 내용증명/경고장 템플릿 시스템
// 검토: 김창희 변호사 (법률사무소 청송)

// ─── 선택지 A 선택 후 추가 수집 질문 ──────────────────────────

export const OPTION_A_FOLLOWUP_QUESTIONS = [
  {
    id: 'sender_name',
    phase: 'sender',
    question: '경고장을 보내는 분(본인)의 성함을 알려주세요.',
    placeholder: '예: 홍길동',
    type: 'text' as const,
    required: true,
  },
  {
    id: 'sender_address',
    phase: 'sender',
    question: '본인의 주소를 알려주세요. (내용증명 발신인 란에 기재됩니다)',
    placeholder: '예: 서울특별시 강남구 테헤란로 123, 456호',
    type: 'text' as const,
    required: true,
  },
  {
    id: 'sender_phone',
    phase: 'sender',
    question: '본인의 연락처를 알려주세요.',
    placeholder: '예: 010-1234-5678',
    type: 'phone' as const,
    required: true,
  },
  {
    id: 'recipient_name',
    phase: 'recipient',
    question: '상대방(경고 대상자)의 성함을 알려주세요.',
    placeholder: '예: 김철수',
    type: 'text' as const,
    required: true,
  },
  {
    id: 'recipient_address',
    phase: 'recipient',
    question: '상대방의 주소를 알려주세요. (내용증명 수신인 란에 기재됩니다. 우편 발송 시 필수)',
    placeholder: '예: 서울특별시 서초구 서초대로 789, 101동 102호',
    type: 'text' as const,
    required: false,
    helpText: '주소를 모르는 경우 이메일/SNS 경고장으로 진행할 수 있습니다.',
  },
  {
    id: 'recipient_phone',
    phase: 'recipient',
    question: '상대방의 연락처를 알려주세요. (알고 있는 경우)',
    placeholder: '예: 010-9876-5432',
    type: 'phone' as const,
    required: false,
  },
  {
    id: 'recipient_email',
    phase: 'recipient',
    question: '상대방의 이메일 또는 SNS 아이디를 알려주세요. (이메일/SNS 발송 시)',
    placeholder: '예: example@email.com 또는 @카카오톡ID',
    type: 'text' as const,
    required: false,
  },
  {
    id: 'relationship',
    phase: 'situation',
    question: '상대방과의 관계를 선택해주세요.',
    type: 'select' as const,
    options: ['전 연인', '현재 연인', '전 배우자', '동거인', '직장 동료', '지인', '기타'],
    required: true,
  },
  {
    id: 'breakup_date',
    phase: 'situation',
    question: '이별(관계 종료)한 날짜가 언제인가요?',
    placeholder: '예: 2026년 2월 15일',
    type: 'text' as const,
    required: false,
  },
  {
    id: 'harassment_types',
    phase: 'situation',
    question: '상대방의 문제 행동을 모두 선택해주세요. (복수 선택 가능)',
    type: 'multiselect' as const,
    options: [
      '반복적인 전화/문자',
      '미행/추적/감시',
      '주거지/직장 방문',
      '협박/위협적 언행',
      '자해/자살 협박',
      '사진/영상 유포 협박',
      '재물 손괴',
      '폭행/신체적 폭력',
      '명예훼손/모욕',
      'SNS 등을 통한 접촉 시도',
      '제3자를 통한 접근',
      '선물/택배 반복 전송',
    ],
    required: true,
  },
  {
    id: 'harassment_detail',
    phase: 'situation',
    question: '구체적인 피해 사실을 적어주세요. (날짜, 횟수, 구체적 내용 등)',
    placeholder: '예: 2026년 3월 1일부터 하루 평균 30회 이상 전화, 3월 5일 직장 앞에서 3시간 대기, 3월 10일 "가만 안 두겠다" 문자 발송 등',
    type: 'textarea' as const,
    required: true,
    helpText: '구체적일수록 경고장의 법적 효력이 높아집니다.',
  },
  {
    id: 'evidence_summary',
    phase: 'evidence',
    question: '확보된 증거를 선택해주세요. (복수 선택 가능)',
    type: 'multiselect' as const,
    options: [
      '카카오톡/문자 캡처',
      '통화 녹음',
      'CCTV 영상',
      '사진/영상',
      '목격자 진술',
      '경찰 신고 기록',
      '진단서/의료 기록',
      '안전이별 증거보관함 기록',
    ],
    required: true,
  },
  {
    id: 'demands',
    phase: 'demands',
    question: '상대방에게 요구할 사항을 선택해주세요. (복수 선택 가능)',
    type: 'multiselect' as const,
    options: [
      '일체의 연락 중단',
      '주거지/직장 접근 금지',
      'SNS 접촉 중단',
      '제3자를 통한 접근 금지',
      '유포된 콘텐츠 삭제',
      '촬영물/사진 일체 삭제',
      '공유 계정/위치추적 해제',
      '개인 소지품 반환',
      '금전 손해배상',
    ],
    required: true,
  },
  {
    id: 'send_method',
    phase: 'delivery',
    question: '경고장 발송 방법을 선택해주세요.',
    type: 'select' as const,
    options: [
      '이메일 발송 (49,000원)',
      'SNS/카카오톡 발송 (49,000원)',
      '내용증명 우편 발송 (99,000원)',
    ],
    required: true,
  },
];

// ─── 경고장 템플릿 (안 1: 강경, 안 2: 온건) ────────────────

export interface LetterData {
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  recipientEmail: string;
  relationship: string;
  breakupDate: string;
  harassmentTypes: string[];
  harassmentDetail: string;
  evidenceSummary: string[];
  demands: string[];
  sendMethod: string;
}

export function generateLetterDraft1(data: LetterData): string {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const harassmentList = data.harassmentTypes.map((h, i) => `  ${i + 1}. ${h}`).join('\n');
  const demandList = data.demands.map((d, i) => `  ${i + 1}. ${d}`).join('\n');
  const evidenceList = data.evidenceSummary.map((e, i) => `  ${i + 1}. ${e}`).join('\n');

  return `
법 률 경 고 장
(제1안 — 강경)

발신인: ${data.senderName}
주  소: ${data.senderAddress}
연락처: ${data.senderPhone}
대리인: 법률사무소 청송 대표변호사 김창희

수신인: ${data.recipientName}
주  소: ${data.recipientAddress || '(이메일/SNS 발송)'}

작성일: ${today}

제목: 스토킹 행위 등 즉시 중단 및 법적 조치 예고에 관한 경고

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

본 법률사무소는 ${data.senderName} 님(이하 "의뢰인")의 위임을 받아, 귀하(${data.recipientName})에게 아래와 같이 법률 경고장을 발송합니다.

1. 피해 사실

의뢰인과 귀하는 ${data.relationship} 관계${data.breakupDate ? `로, ${data.breakupDate} 관계가 종료되었습니다` : '였습니다'}. 그럼에도 불구하고 귀하는 의뢰인의 명시적 거부 의사에 반하여 아래와 같은 행위를 지속하고 있습니다.

${harassmentList}

구체적 내용:
${data.harassmentDetail}

2. 법적 근거

귀하의 위 행위는 아래 법률에 위반될 수 있습니다.

  ■ 「스토킹범죄의 처벌 등에 관한 법률」 제18조
    → 3년 이하의 징역 또는 3,000만 원 이하의 벌금
    → 흉기 등 위험한 물건 사용 시 5년 이하의 징역 또는 5,000만 원 이하의 벌금
    → 2024.1.12. 개정에 따라 피해자의 처벌불원 의사와 관계없이 처벌(반의사불벌죄 폐지)

  ■ 「형법」 제283조 (협박죄)
    → 3년 이하의 징역 또는 500만 원 이하의 벌금

  ■ 「성폭력범죄의 처벌 등에 관한 특례법」 제14조의3
    → 촬영물 등을 이용한 협박: 1년 이상의 유기징역

3. 확보된 증거

의뢰인은 아래와 같은 증거를 확보하고 있으며, 이는 수사기관 및 법원 제출용으로 보전되어 있습니다.

${evidenceList}

4. 요구 사항

본 경고장 수령 즉시 아래 사항을 이행할 것을 요구합니다.

${demandList}

5. 향후 조치 예고

본 경고장 수령일로부터 7일 이내에 위 요구사항이 이행되지 않을 경우, 의뢰인은 즉시 아래 조치를 취할 것임을 명확히 통보합니다.

  (1) 관할 경찰서에 스토킹범죄 고소장 접수
  (2) 법원에 긴급응급조치 및 잠정조치(접근금지, 전자발찌 부착) 청구
  (3) 민사상 손해배상 청구
  (4) 기타 필요한 일체의 법적 조치

이 경고장은 향후 법적 절차에서 의뢰인의 명시적 거부 의사를 입증하는 증거로 사용될 것입니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

법률사무소 청송
대표변호사 김 창 희
서울특별시 ○○구 ○○로 ○○
TEL: 02-XXX-XXXX
`.trim();
}

export function generateLetterDraft2(data: LetterData): string {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const harassmentList = data.harassmentTypes.map((h, i) => `  ${i + 1}. ${h}`).join('\n');
  const demandList = data.demands.map((d, i) => `  ${i + 1}. ${d}`).join('\n');

  return `
법 률 경 고 장
(제2안 — 온건)

발신인: ${data.senderName}
주  소: ${data.senderAddress}
연락처: ${data.senderPhone}
대리인: 법률사무소 청송 대표변호사 김창희

수신인: ${data.recipientName}
주  소: ${data.recipientAddress || '(이메일/SNS 발송)'}

작성일: ${today}

제목: 연락 중단 및 접근 금지 요청

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.recipientName} 귀하,

본 법률사무소는 ${data.senderName} 님의 위임을 받아 아래와 같이 안내드립니다.

의뢰인은 귀하와의 ${data.relationship} 관계가 종료되었음을 분명히 밝힌 바 있습니다. 그러나 귀하는 의뢰인의 뜻에 반하여 아래와 같은 행위를 계속하고 있습니다.

${harassmentList}

의뢰인은 이러한 행위로 인해 심각한 불안과 공포를 느끼고 있습니다.

귀하께 알려드리고자 하는 점은 다음과 같습니다:

  ■ 상대방의 의사에 반하여 반복적으로 접근하거나 연락하는 행위는
    「스토킹범죄의 처벌 등에 관한 법률」에 따라 처벌 대상입니다.
    (3년 이하 징역 또는 3,000만 원 이하 벌금)

  ■ 2024년 1월 12일부터 스토킹범죄는 피해자의 처벌 의사와 무관하게
    수사 및 처벌이 진행됩니다. (반의사불벌죄 폐지)

  ■ 경찰은 즉시 접근금지 등 긴급응급조치를 취할 수 있으며,
    법원은 전자발찌 부착을 명할 수 있습니다.

따라서 귀하에게 아래 사항의 이행을 정중히 요청드립니다.

${demandList}

귀하가 자발적으로 위 사항을 이행하신다면, 의뢰인은 별도의 법적 절차를 진행하지 않을 의향이 있습니다.

다만, 본 경고 이후에도 동일한 행위가 계속될 경우, 의뢰인은 형사 고소, 접근금지 가처분 신청 등 가능한 모든 법적 수단을 강구할 수밖에 없음을 알려드립니다.

이 서면은 의뢰인의 명시적 거부 의사 표시로서, 향후 법적 절차에서 증거로 사용될 수 있습니다.

원만한 해결을 기대합니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

법률사무소 청송
대표변호사 김 창 희
서울특별시 ○○구 ○○로 ○○
TEL: 02-XXX-XXXX
`.trim();
}

// ─── 경고장 상태 ─────────────────────────────────────────

export type LetterStatus = 'collecting' | 'draft_ready' | 'lawyer_review' | 'approved' | 'sent';

export const LETTER_STATUS_CONFIG = {
  collecting: { label: '정보 수집 중', color: '#D4A373', icon: 'create' },
  draft_ready: { label: '초안 생성 완료', color: '#6B8CC7', icon: 'document-text' },
  lawyer_review: { label: '변호사 검토 중', color: '#C4956A', icon: 'eye' },
  approved: { label: '승인 완료', color: '#7A9E7E', icon: 'checkmark-circle' },
  sent: { label: '발송 완료', color: '#7A9E7E', icon: 'paper-plane' },
};
