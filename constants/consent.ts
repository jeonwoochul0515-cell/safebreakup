// 민감정보 동의 및 개인정보보호 상수
// 개인정보보호법 제15조, 제23조 준거

// ─── 민감정보 유형 ──────────────────────────────────────────────────────────

export interface SensitiveDataType {
  key: string;
  label: string;
  description: string;
  legal_basis: string;
}

export const SENSITIVE_DATA_TYPES: SensitiveDataType[] = [
  {
    key: 'health',
    label: '건강정보',
    description: '상해 내역, 진단서, 치료 기록, 정신건강 상태 등',
    legal_basis: '개인정보보호법 제23조 (민감정보의 처리 제한)',
  },
  {
    key: 'sexual_life',
    label: '성생활 정보',
    description: '성범죄 피해 사실, 성적 촬영물 관련 정보 등',
    legal_basis: '개인정보보호법 제23조 (민감정보의 처리 제한)',
  },
  {
    key: 'criminal_record',
    label: '범죄피해 정보',
    description: '범죄 피해 경위, 수사 이력, 신고 이력 등',
    legal_basis: '개인정보보호법 제23조 (민감정보의 처리 제한)',
  },
  {
    key: 'mental_health',
    label: '정신건강 정보',
    description: '우울, 불안, PTSD 증상, 상담/치료 이력 등',
    legal_basis: '개인정보보호법 제23조 (민감정보의 처리 제한)',
  },
];

// ─── 동의 문구 ──────────────────────────────────────────────────────────────

export const CONSENT_TEXTS = {
  /** 일반 개인정보 수집·이용 동의 (제15조) */
  general: {
    title: '개인정보 수집·이용 동의',
    legal_basis: '개인정보보호법 제15조 (개인정보의 수집·이용)',
    content:
      '안전이별은 고소장 작성을 위해 아래의 개인정보를 수집·이용합니다.\n\n' +
      '■ 수집 항목: 성명, 생년월일, 주소, 연락처, 직업(선택)\n' +
      '■ 수집 목적: 고소장 초안 작성 및 법률 서비스 제공\n' +
      '■ 보유 기간: 고소장 작성 완료 후 사용자가 직접 삭제 시까지 (기기 내 저장)\n\n' +
      '※ 동의를 거부하실 수 있으며, 동의 거부 시 고소장 작성 서비스를 이용하실 수 없습니다.',
    required: true,
  },

  /** 민감정보 수집·이용 별도 동의 (제23조) */
  sensitive: {
    title: '민감정보 수집·이용 동의 (별도 동의)',
    legal_basis: '개인정보보호법 제23조 (민감정보의 처리 제한)',
    content:
      '고소장 작성 과정에서 아래의 민감정보가 포함될 수 있습니다.\n' +
      '민감정보는 정보주체의 별도 동의가 있어야만 처리할 수 있습니다.\n\n' +
      '■ 수집 항목: 건강정보(상해 내역, 진단서), 성생활 정보(성범죄 피해 사실), ' +
      '범죄피해 정보, 정신건강 정보\n' +
      '■ 수집 목적: 고소장 범죄사실 및 피해결과 기재\n' +
      '■ 보유 기간: 고소장 작성 완료 후 사용자가 직접 삭제 시까지 (기기 내 저장)\n\n' +
      '※ 민감정보 동의를 거부하시면 해당 항목을 건너뛰고 고소장을 작성할 수 있으나, ' +
      '범죄사실 기재가 제한될 수 있습니다.\n' +
      '※ 모든 데이터는 사용자의 기기에만 저장되며 서버로 전송되지 않습니다.',
    required: true,
  },

  /** 제3자 정보 (가해자 정보) 수집 안내 */
  third_party: {
    title: '제3자 정보 수집 안내',
    legal_basis: '개인정보보호법 제15조 제1항 제6호 (정당한 이익)',
    content:
      '고소장 작성을 위해 피고소인(가해자)의 정보를 수집합니다.\n\n' +
      '■ 수집 항목: 성명, 주소, 연락처, SNS 계정, 관계, 외형 특징\n' +
      '■ 수집 목적: 고소장 피고소인 특정\n' +
      '■ 법적 근거: 개인정보보호법 제15조 제1항 제6호 ' +
      '(개인정보처리자의 정당한 이익 달성을 위해 필요한 경우)\n\n' +
      '※ 가해자 정보는 고소장 제출 목적으로만 사용되며, ' +
      '마스킹 옵션을 통해 미리보기 시 정보를 숨길 수 있습니다.',
    required: true,
  },
};

// ─── AI 분석 동의 ──────────────────────────────────────────────────────────

export const AI_ANALYSIS_CONSENT = {
  title: 'AI 증거 분석 동의',
  description: '증거 파일의 내용을 AI가 분석하여 법적 분류와 대응 방안을 안내합니다.',
  details: [
    '텍스트 내용에서 협박/스토킹/폭행 등 법적 키워드를 감지합니다.',
    '분석 결과는 참고용이며, 법적 조언에 해당하지 않습니다.',
    '향후 클라우드 AI 분석 시 별도 동의를 받습니다.',
  ],
  legalBasis: '개인정보보호법 제15조 제1항 제1호 (정보주체의 동의)',
};

// ─── 가해자 정보 마스킹 옵션 ────────────────────────────────────────────────

export interface MaskingOption {
  level: 'full' | 'partial' | 'none';
  label: string;
  description: string;
  example_name: string;
  example_phone: string;
  example_address: string;
}

export const MASKING_OPTIONS: MaskingOption[] = [
  {
    level: 'full',
    label: '전체 마스킹',
    description: '가해자 정보를 모두 가립니다 (미리보기/화면 표시용)',
    example_name: '김○○',
    example_phone: '010-****-****',
    example_address: '서울 ○○구 ○○동',
  },
  {
    level: 'partial',
    label: '부분 마스킹',
    description: '이름 일부와 연락처 일부를 가립니다',
    example_name: '김○현',
    example_phone: '010-****-5678',
    example_address: '서울 강남구 ○○동',
  },
  {
    level: 'none',
    label: '마스킹 없음',
    description: '모든 정보를 그대로 표시합니다 (최종 제출용)',
    example_name: '김도현',
    example_phone: '010-1234-5678',
    example_address: '서울 강남구 역삼동 123-45',
  },
];

// ─── 개인정보 수집·이용 안내문 ──────────────────────────────────────────────

export const PRIVACY_NOTICE = {
  title: '개인정보 처리 안내',
  sections: [
    {
      heading: '1. 데이터 저장 방식',
      content:
        '고소장 작성에 사용되는 모든 개인정보는 사용자의 기기(로컬)에만 저장됩니다. ' +
        '안전이별 서버로 전송되거나 클라우드에 업로드되지 않습니다.',
    },
    {
      heading: '2. 데이터 암호화',
      content:
        '저장된 데이터는 AES-256 암호화가 적용되며, ' +
        '사용자의 PIN 또는 생체인증을 통해서만 접근할 수 있습니다.',
    },
    {
      heading: '3. 데이터 삭제',
      content:
        '사용자는 언제든지 고소장 초안 및 관련 데이터를 삭제할 수 있습니다. ' +
        '삭제된 데이터는 복구할 수 없습니다.',
    },
    {
      heading: '4. PDF 생성',
      content:
        '고소장 PDF는 사용자의 기기에서 직접 생성됩니다. ' +
        '생성된 PDF는 사용자가 직접 다운로드하여 경찰서에 제출합니다. ' +
        '앱이 경찰서나 제3자에게 직접 전송하지 않습니다.',
    },
    {
      heading: '5. 변호사 검토',
      content:
        '변호사 검토를 요청하시는 경우에 한하여, ' +
        '사용자의 명시적 동의 하에 법률사무소 청송으로 데이터가 전송됩니다. ' +
        '이 경우 별도의 제3자 제공 동의를 받습니다.',
    },
    {
      heading: '6. 문의처',
      content:
        '개인정보 관련 문의: privacy@safebreakup.kr\n' +
        '법률사무소 청송 (대표변호사 김창희)',
    },
  ],
};
