// 어드민 Mock 데이터
// 실제 운영 시 Supabase에서 조회

export const ADMIN_PIN = '9999'; // 어드민 접근 PIN

export type ConsultationStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Consultation {
  id: string;
  type: string;
  userName: string;
  phone: string;
  status: ConsultationStatus;
  date: string;
  time: string;
  method: string;
  notes: string;
}

export const MOCK_CONSULTATIONS: Consultation[] = [
  { id: 'c1', type: '법률상담', userName: '김**', phone: '010-****-1234', status: 'pending', date: '2026-03-24', time: '14:00', method: '전화', notes: '이별 후 스토킹 지속, 접근금지 문의' },
  { id: 'c2', type: '경호상담', userName: '이**', phone: '010-****-5678', status: 'confirmed', date: '2026-03-25', time: '18:00', method: '안전보호', notes: '내일 이별 통보 예정, 강남역 카페' },
  { id: 'c3', type: '법률상담', userName: '박**', phone: '010-****-9012', status: 'completed', date: '2026-03-23', time: '10:00', method: '카카오톡', notes: '디지털 성범죄 삭제요청' },
  { id: 'c4', type: '경호상담', userName: '최**', phone: '010-****-3456', status: 'pending', date: '2026-03-26', time: '15:00', method: '완전보호', notes: '동거 해지, 짐 빼는 날 경호 필요' },
  { id: 'c5', type: 'AI사무장상담', userName: '정**', phone: '010-****-7890', status: 'in_progress', date: '2026-03-24', time: '11:00', method: '앱 내 채팅', notes: 'AI 사무장 상담 후 법률상담 연계 예정' },
  { id: 'c6', type: '법률상담', userName: '한**', phone: '010-****-2345', status: 'pending', date: '2026-03-24', time: '16:00', method: '방문', notes: '가스라이팅 + 경제적 학대 상담' },
];

export const MOCK_USERS = [
  { id: 'u1', nickname: '용감한사자', tier: 'standard' as const, joinDate: '2026-01-15', lastActive: '2026-03-24', diagnosisScore: 42, stalkingLogs: 12, evidenceCount: 8 },
  { id: 'u2', nickname: '밤하늘별', tier: 'standard' as const, joinDate: '2026-02-03', lastActive: '2026-03-24', diagnosisScore: 28, stalkingLogs: 5, evidenceCount: 3 },
  { id: 'u3', nickname: '따뜻한봄', tier: 'free' as const, joinDate: '2026-03-10', lastActive: '2026-03-23', diagnosisScore: 15, stalkingLogs: 0, evidenceCount: 1 },
  { id: 'u4', nickname: '새벽달', tier: 'standard' as const, joinDate: '2025-12-20', lastActive: '2026-03-24', diagnosisScore: 55, stalkingLogs: 23, evidenceCount: 15 },
  { id: 'u5', nickname: '파란나비', tier: 'standard' as const, joinDate: '2026-02-28', lastActive: '2026-03-22', diagnosisScore: 31, stalkingLogs: 8, evidenceCount: 4 },
  { id: 'u6', nickname: '햇살', tier: 'free' as const, joinDate: '2026-03-20', lastActive: '2026-03-24', diagnosisScore: null, stalkingLogs: 0, evidenceCount: 0 },
  { id: 'u7', nickname: '꽃길', tier: 'standard' as const, joinDate: '2026-01-05', lastActive: '2026-03-24', diagnosisScore: 38, stalkingLogs: 17, evidenceCount: 11 },
  { id: 'u8', nickname: '무지개', tier: 'free' as const, joinDate: '2026-03-22', lastActive: '2026-03-24', diagnosisScore: 22, stalkingLogs: 2, evidenceCount: 0 },
];

export const MOCK_REVENUE = {
  monthly: [
    { month: '2025-10', subscription: 1200000, perCase: 890000, escort: 0, total: 2090000 },
    { month: '2025-11', subscription: 2400000, perCase: 1470000, escort: 250000, total: 4120000 },
    { month: '2025-12', subscription: 4800000, perCase: 2350000, escort: 500000, total: 7650000 },
    { month: '2026-01', subscription: 8500000, perCase: 3920000, escort: 1200000, total: 13620000 },
    { month: '2026-02', subscription: 14200000, perCase: 5840000, escort: 2400000, total: 22440000 },
    { month: '2026-03', subscription: 22800000, perCase: 8960000, escort: 4800000, total: 36560000 },
  ],
  tierBreakdown: { free: 3420, standard: 2830 },
  conversionRate: { freeToStandard: 8.5, trialToPaid: 38.5 },
  topServices: [
    { name: '고소장/서류 AI 생성', count: 156, revenue: 23244000 },
    { name: '법률 경고장 (내용증명)', count: 89, revenue: 8811000 },
    { name: '경호 서비스', count: 32, revenue: 8000000 },
    { name: '법률 경고장 (이메일)', count: 134, revenue: 6566000 },
    { name: 'NCII 삭제 대응', count: 67, revenue: 6633000 },
    { name: '고소장 변호사 검토', count: 23, revenue: 4577000 },
  ],
};

export type EvidenceReviewStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface EvidenceReview {
  id: string;
  userName: string;
  type: string;
  itemCount: number;
  status: EvidenceReviewStatus;
  requestDate: string;
  caseType: string;
}

export const MOCK_EVIDENCE_REVIEWS: EvidenceReview[] = [
  { id: 'e1', userName: '용감한사자', type: '법정 제출용 PDF', itemCount: 12, status: 'pending', requestDate: '2026-03-24', caseType: '스토킹' },
  { id: 'e2', userName: '새벽달', type: '법정 제출용 PDF', itemCount: 23, status: 'reviewing', requestDate: '2026-03-23', caseType: '스토킹 + 협박' },
  { id: 'e3', userName: '꽃길', type: '증거 패키지', itemCount: 8, status: 'approved', requestDate: '2026-03-22', caseType: 'NCII' },
  { id: 'e4', userName: '파란나비', type: '법정 제출용 PDF', itemCount: 5, status: 'pending', requestDate: '2026-03-24', caseType: '데이트폭력' },
];

export const CONSULTATION_STATUS_CONFIG = {
  pending: { label: '대기', color: '#D4A373', icon: 'time' },
  confirmed: { label: '확정', color: '#6B8CC7', icon: 'checkmark-circle' },
  in_progress: { label: '진행중', color: '#C4956A', icon: 'arrow-forward-circle' },
  completed: { label: '완료', color: '#7A9E7E', icon: 'checkmark-done-circle' },
  cancelled: { label: '취소', color: '#9B95A5', icon: 'close-circle' },
};

export const EVIDENCE_STATUS_CONFIG = {
  pending: { label: '검토 대기', color: '#D4A373', icon: 'time' },
  reviewing: { label: '검토 중', color: '#6B8CC7', icon: 'eye' },
  approved: { label: '승인', color: '#7A9E7E', icon: 'checkmark-circle' },
  rejected: { label: '반려', color: '#E07A5F', icon: 'close-circle' },
};

export const TIER_CONFIG = {
  free: { label: '무료', color: '#7A9E7E' },
  standard: { label: '유료회원', color: '#C4956A' },
};

// ─── SOS 로그 ────────────────────────────────────────────────

export type SOSType = '긴급신고' | '위기감지';
export type SOSStatus = 'resolved' | 'in_progress' | 'auto_closed';

export interface SOSLog {
  id: string;
  userName: string;
  timestamp: string;
  type: SOSType;
  status: SOSStatus;
  result: string;
  location: string;
}

export const SOS_STATUS_CONFIG: Record<SOSStatus, { label: string; color: string; icon: string }> = {
  resolved: { label: '해결', color: '#7A9E7E', icon: 'checkmark-circle' },
  in_progress: { label: '대응중', color: '#E07A5F', icon: 'alert-circle' },
  auto_closed: { label: '자동종료', color: '#9B95A5', icon: 'time' },
};

export const MOCK_SOS_LOGS: SOSLog[] = [
  { id: 's1', userName: '용감한사자', timestamp: '2026-03-27 02:15', type: '긴급신고', status: 'resolved', result: '112 연결됨, 경찰 출동 완료', location: '서울 강남구' },
  { id: 's2', userName: '새벽달', timestamp: '2026-03-27 08:30', type: '위기감지', status: 'in_progress', result: '자살예방 1393 안내', location: '서울 서초구' },
  { id: 's3', userName: '꽃길', timestamp: '2026-03-26 23:45', type: '긴급신고', status: 'resolved', result: '112 연결됨, 현장 안전 확인', location: '서울 마포구' },
  { id: 's4', userName: '파란나비', timestamp: '2026-03-26 19:20', type: '위기감지', status: 'auto_closed', result: '사용자 직접 해제', location: '경기 성남시' },
  { id: 's5', userName: '밤하늘별', timestamp: '2026-03-26 14:00', type: '긴급신고', status: 'resolved', result: '112 연결됨, 접근금지 위반 신고', location: '서울 송파구' },
  { id: 's6', userName: '햇살', timestamp: '2026-03-25 22:10', type: '위기감지', status: 'resolved', result: '여성긴급전화 1366 안내', location: '서울 영등포구' },
  { id: 's7', userName: '무지개', timestamp: '2026-03-25 16:30', type: '긴급신고', status: 'resolved', result: '112 연결됨, 경호원 동시 출동', location: '서울 강남구' },
];

// ─── 서류 검토 관리 ──────────────────────────────────────────

export type DocumentType = '고소장' | '경고장' | '내용증명' | '접근금지요청서' | '연락중지요청서' | '증거분석보고서';
export type DocumentStatus = 'draft' | 'lawyer_review' | 'approved' | 'revision_requested' | 'sent';

export interface DocumentReview {
  id: string;
  type: DocumentType;
  userName: string;
  status: DocumentStatus;
  createdDate: string;
  lawyer: string;
  caseType: string;
  notes: string;
}

export const DOCUMENT_STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; icon: string }> = {
  draft: { label: '초안', color: '#9B95A5', icon: 'create-outline' },
  lawyer_review: { label: '변호사 검토중', color: '#6B8CC7', icon: 'eye' },
  approved: { label: '변호사 승인', color: '#7A9E7E', icon: 'checkmark-circle' },
  revision_requested: { label: '수정 요청', color: '#D4A373', icon: 'arrow-undo' },
  sent: { label: '발송 완료', color: '#C4956A', icon: 'paper-plane' },
};

export const MOCK_DOCUMENTS: DocumentReview[] = [
  { id: 'd1', type: '경고장', userName: '김**', status: 'lawyer_review', createdDate: '2026-03-24', lawyer: '김창희', caseType: '스토킹', notes: '반복 연락 중단 요청 경고장' },
  { id: 'd2', type: '접근금지요청서', userName: '이**', status: 'draft', createdDate: '2026-03-25', lawyer: '', caseType: '스토킹 + 협박', notes: '직장 앞 대기, 접근금지 요청' },
  { id: 'd3', type: '내용증명', userName: '박**', status: 'approved', createdDate: '2026-03-22', lawyer: '김창희', caseType: '데이트폭력', notes: '위자료 청구 내용증명' },
  { id: 'd4', type: '고소장', userName: '최**', status: 'draft', createdDate: '2026-03-26', lawyer: '', caseType: 'NCII', notes: '디지털 성범죄 고소장 초안' },
  { id: 'd5', type: '연락중지요청서', userName: '한**', status: 'sent', createdDate: '2026-03-20', lawyer: '김창희', caseType: '스토킹', notes: '이메일 발송 완료' },
  { id: 'd6', type: '증거분석보고서', userName: '정**', status: 'revision_requested', createdDate: '2026-03-23', lawyer: '김창희', caseType: '스토킹 + 협박', notes: '증거 보완 필요 - 녹음파일 추가 요청' },
];
