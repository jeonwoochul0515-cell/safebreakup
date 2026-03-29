// 안전이별 데이터베이스 타입 정의

/** 감정 상태 */
export type EmotionState = 'crisis' | 'distressed' | 'anxious' | 'calm';

/** 사건 진행 상태 */
export type CaseStatus =
  | 'intake'        // 초기 접수
  | 'assessment'    // 상황 파악 중
  | 'evidence'      // 증거 확인 중
  | 'analysis'      // 법률 분석 중
  | 'options'       // 선택지 생성 완료
  | 'action'        // 조치 진행 중
  | 'resolved'      // 해결 완료
  | 'archived';     // 보관

/** AI 비서 대화 단계 (1~5) */
export type CasePhase = 1 | 2 | 3 | 4 | 5;

/** 사용자 */
export interface User {
  id: string;
  phone?: string;
  email?: string;
  nickname?: string;
  created_at: string;
  updated_at: string;
  subscription_tier: 'free' | 'standard';
  is_active: boolean;
}

/** 사용자 사건 */
export interface UserCase {
  id: string;
  user_id: string;
  title: string;
  status: CaseStatus;
  current_phase: CasePhase;
  risk_level: 'low' | 'medium' | 'high' | 'critical' | null;
  fact_summary: Record<string, string>;
  option_a: string | null;
  option_b: string | null;
  selected_option: 'A' | 'B' | null;
  created_at: string;
  updated_at: string;
}

/** 대화 세션 */
export interface Conversation {
  id: string;
  case_id: string;
  user_id: string;
  phase: CasePhase;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
}

/** 채팅 메시지 */
export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  phase: CasePhase;
  emotion_state?: EmotionState;
  metadata?: Record<string, unknown>;
  created_at: string;
}

/** 판례 (벡터 임베딩 포함) */
export interface CourtCase {
  id: string;
  case_number: string;       // 사건번호 (예: 2023도12345)
  court: string;             // 법원명
  date: string;              // 판결일
  category: string;          // 분류 (스토킹, 협박, 폭행 등)
  title: string;             // 판례 제목
  summary: string;           // 요약
  full_text: string;         // 전문
  ruling: string;            // 판결 결과
  keywords: string[];        // 키워드
  embedding?: number[];      // vector(1536) — pgvector
  created_at: string;
}

/** 판례 청크 (RAG용) */
export interface CaseChunk {
  id: string;
  court_case_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[];      // vector(1536)
  metadata?: Record<string, unknown>;
  created_at: string;
}

/** 법령 */
export interface Statute {
  id: string;
  law_name: string;          // 법률명 (예: 스토킹처벌법)
  article_number: string;    // 조항 번호
  article_title: string;     // 조항 제목
  content: string;           // 조문 내용
  penalty?: string;          // 벌칙
  effective_date: string;    // 시행일
  keywords: string[];
  embedding?: number[];      // vector(1536)
  created_at: string;
}

/** 법률 Q&A */
export interface LegalQA {
  id: string;
  question: string;
  answer: string;
  category: string;
  related_statutes: string[];
  embedding?: number[];
  created_at: string;
}

/** 변호사 정보 */
export interface Lawyer {
  id: string;
  name: string;
  firm: string;
  specialization: string[];
  phone: string;
  email: string;
  is_available: boolean;
  created_at: string;
}

/** 결제 정보 */
export interface Payment {
  id: string;
  user_id: string;
  case_id?: string;
  amount: number;
  currency: string;
  product_id: string;        // 구독 플랜 또는 경고장 건별
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: 'apple' | 'google' | 'toss' | 'manual';
  provider_transaction_id?: string;
  created_at: string;
}

/** 안전 설정 */
export interface SafetySettings {
  fakeIcon: string;                    // 위장 아이콘 (예: 'calculator')
  fakeNotificationText: string;        // 위장 알림 텍스트
  autoDeleteOnPinFail: boolean;        // PIN 실패 시 자동 삭제
  pinFailLimit: number;                // PIN 실패 허용 횟수
  quickExitTrigger: 'none' | 'shake' | 'volume' | 'power';  // 빠른 종료 트리거
  stealthPin: string;                  // 은폐 모드 진입 PIN
}

// ─── 고소장 자동 작성 시스템 ────────────────────────────────────────────────

/** 고소장 작성 7단계 */
export type ComplaintPhase =
  | 'safety'        // 1단계: 안전 확인 + 공감
  | 'complainant'   // 2단계: 고소인(피해자) 정보
  | 'suspect'       // 3단계: 피고소인(가해자) 정보
  | 'crime_facts'   // 4단계: 범죄사실 수집
  | 'evidence'      // 5단계: 증거 확보 현황
  | 'damage'        // 6단계: 피해 결과
  | 'punishment';   // 7단계: 처벌 희망

/** 범죄 유형 */
export type CrimeType =
  | 'stalking'         // 스토킹
  | 'threat'           // 협박
  | 'assault'          // 폭행/상해
  | 'sexual'           // 성범죄
  | 'digital_sexual'   // 디지털 성범죄
  | 'other';           // 기타

/** 1단계: 안전 확인 데이터 */
export interface Stage1Data {
  is_safe: boolean;                    // 현재 안전 여부
  safe_location?: string;              // 안전한 장소
  emergency_contact?: string;          // 긴급 연락처
  emotional_state?: EmotionState;      // 감정 상태
  confirmed_at?: string;               // 확인 시각
}

/** 2단계: 고소인(피해자) 정보 */
export interface Stage2Data {
  name: string;                        // 성명
  birth_date: string;                  // 생년월일
  address: string;                     // 주소
  phone: string;                       // 연락처
  occupation?: string;                 // 직업 (선택)
}

/** 3단계: 피고소인(가해자) 정보 */
export interface Stage3Data {
  name: string | null;                 // 성명 (null = 인적사항 불상)
  address?: string;                    // 주소
  phone?: string;                      // 연락처
  sns_accounts?: string[];             // SNS 계정
  relationship: string;                // 관계 (교제, 혼인, 직장 등)
  dating_period?: string;              // 교제 기간
  breakup_date?: string;               // 이별 시기
  appearance_description?: string;     // 외형 특징 (이름 모를 경우)
}

/** 4단계: 범죄사실 데이터 */
export interface Stage4Data {
  crime_types: CrimeType[];            // 선택된 범죄 유형
  stalking?: {
    behavior_types: string[];          // 행위 유형 (반복연락, 미행 등)
    start_date: string;                // 시작 시기
    frequency: string;                 // 빈도
    locations: string[];               // 장소
    latest_incident: string;           // 최근 사건
  };
  threat?: {
    content: string;                   // 협박 내용 (원문)
    method: string;                    // 수단 (문자, 전화, 대면 등)
    date_range: string;                // 시기
    count: number;                     // 횟수
    harm_type: string;                 // 위해 유형
  };
  assault?: {
    date: string;                      // 일시
    location: string;                  // 장소
    method: string;                    // 방법
    injury_level: string;              // 상해 정도
    medical_treatment: boolean;        // 치료 여부
    witnesses?: string[];              // 목격자
  };
  sexual?: {
    occurred: boolean;                 // 발생 여부
    date?: string;                     // 시기
    location?: string;                 // 장소
    skipped?: boolean;                 // 건너뛰기 선택
  };
  digital_sexual?: {
    illegal_filming: boolean;          // 불법촬영 여부
    distribution: boolean;             // 유포 여부
    distribution_threat: boolean;      // 유포 협박 여부
    distribution_channel?: string;     // 유포 경로
  };
  other_description?: string;          // 기타 범죄 설명
  incidents: {                         // 개별 사건 목록 (6하원칙)
    who: string;
    when: string;
    where: string;
    what: string;
    how: string;
    detail?: string;
  }[];
}

/** 5단계: 증거 확보 현황 */
export interface Stage5Data {
  evidence_types: string[];            // 보유 증거 유형
  messenger_captures: boolean;         // 문자/메신저 캡처
  recordings: boolean;                 // 녹음
  cctv: boolean;                       // CCTV
  medical_records: boolean;            // 진단서
  witnesses: string[];                 // 목격자
  police_report_history: boolean;      // 112 신고 이력
  vault_evidence_ids: string[];        // 증거보관함 연동 ID
  additional_notes?: string;           // 추가 메모
}

/** 6단계: 피해 결과 */
export interface Stage6Data {
  physical_damage?: {
    description: string;               // 상해 내용
    under_treatment: boolean;          // 치료 중 여부
  };
  mental_damage?: {
    symptoms: string[];                // 불안, 공포, 불면, 우울, PTSD 등
    counseling: boolean;               // 상담/치료 여부
  };
  financial_damage?: {
    items: { category: string; amount: number }[];  // 이사비, 치료비 등
    total_amount: number;              // 총 피해 금액
  };
  social_damage?: {
    description: string;               // 직장, 학업, 대인관계 피해
  };
}

/** 7단계: 처벌 희망 */
export interface Stage7Data {
  severe_punishment: boolean;          // 엄벌 희망 여부
  protection_orders: string[];         // 접근금지, 연락금지, 전자장치 부착
  additional_requests?: string;        // 추가 요청사항
  target_police_station?: string;      // 제출 경찰서
}

/** 고소장 전체 데이터 */
export interface ComplaintDraftData {
  session_id: string;
  user_id: string;
  created_at: string;
  last_updated_at: string;
  current_phase: ComplaintPhase;
  completion_status: 'in_progress' | 'completed' | 'paused';

  stage1_safety: Stage1Data;
  stage2_complainant: Stage2Data;
  stage3_suspect: Stage3Data;
  stage4_crime: Stage4Data;
  stage5_evidence: Stage5Data;
  stage6_damage: Stage6Data;
  stage7_punishment: Stage7Data;

  applicable_laws: ApplicableStatute[];
  consent: SensitiveDataConsent;
  draft_text?: string;
}

/** 민감정보 동의 상태 */
export interface SensitiveDataConsent {
  general_consent: boolean;            // 일반 개인정보 수집 동의
  sensitive_consent: boolean;          // 민감정보 수집 별도 동의 (개인정보보호법 제23조)
  third_party_consent: boolean;        // 제3자 제공 동의
  timestamp: string;                   // 동의 시각
  ip_hash?: string;                    // 동의 기록용 IP 해시
}

/** 적용 법조 */
export interface ApplicableStatute {
  crime_type: CrimeType;              // 범죄 유형
  law_name: string;                    // 법률명
  article: string;                     // 조항
  article_title: string;              // 조항 제목
  penalty: string;                     // 법정형
  keywords: string[];                  // 매칭 키워드
  note?: string;                       // 참고사항
}

/** 생성된 고소장 구조 */
export interface ComplaintDocument {
  document_id: string;                 // 문서 ID
  generated_at: string;                // 생성 시각
  complainant: Stage2Data;             // 고소인 정보
  suspect: Stage3Data;                 // 피고소인 정보
  crime_facts: Stage4Data;             // 범죄사실
  evidence_summary: Stage5Data;        // 증거 요약
  damage_summary: Stage6Data;          // 피해 결과
  punishment_request: Stage7Data;      // 처벌 희망
  applicable_statutes: ApplicableStatute[];  // 적용 법조
  full_text: string;                   // 고소장 전문
  masking_level: 'full' | 'partial' | 'none';  // 마스킹 레벨
  disclaimer: string;                  // 면책 고지
}
