// 이별방패 데이터베이스 타입 정의

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
  subscription_tier: 'free' | 'basic' | 'premium';
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
