// 안전이별 가격 정책 (중앙 관리)
// 법률사무소 청송

/** 구독 티어 */
export const SUBSCRIPTION_TIERS = {
  free: {
    name: '무료',
    price: 0,
    features: [
      '증거 보관 (로컬 암호화)',
      'SOS 긴급 연결',
      '법률 정보 챗봇 (일 3회)',
      '위험도 자가진단',
      '은밀모드 (계산기 위장)',
    ],
  },
  standard: {
    name: '유료회원',
    price: 9900,
    priceLabel: '월 9,900원',
    features: [
      'AI 챗봇 무제한',
      '고소장/경고장 AI 초안 (변호사 검토 없음)',
      '증거 AI 분석',
      '보호 점수',
      '클라우드 백업',
    ],
    disclaimer: '유료회원 플랜의 고소장/경고장은 AI가 자동 생성한 초안이며, 변호사의 검토를 거치지 않았습니다. 법적 효력을 보장하지 않으며, 정확한 법률 조언을 위해서는 별도 변호사 상담(건별 유료)을 이용해 주세요.',
  },
} as const;

/** 건별 유료 서비스 */
export const PAID_SERVICES = {
  consultation: {
    name: '변호사 상담',
    price: 70000,
    priceLabel: '10분 70,000원',
    description: '김창희 변호사 직접 상담',
  },
  complaint_review: {
    name: '고소장 변호사 검토',
    price: 199000,
    priceLabel: '199,000원',
    description: 'AI 초안 + 변호사 수정/확정',
  },
  certified_mail: {
    name: '내용증명 발송',
    price: 99000,
    priceLabel: '99,000원',
    description: '변호사 명의 작성 + 우체국 발송',
  },
  warning_letter: {
    name: '경고장 발송',
    price: 49000,
    priceLabel: '49,000원',
    description: '변호사 명의 작성 + 이메일/SNS 발송',
  },
  escort: {
    name: '경호 서비스',
    price: 150000,
    priceLabel: '150,000원~',
    description: '전문 경호원 현장 동행',
  },
} as const;

/** 유료회원 책임 한계 고지 (서류 생성 시 필수 표시) */
export const STANDARD_DISCLAIMER = '본 서류는 AI가 자동 생성한 초안이며, 변호사의 검토를 거치지 않았습니다. 법적 효력을 보장하지 않으며, 제출 전 전문가 검토를 권장합니다.';
