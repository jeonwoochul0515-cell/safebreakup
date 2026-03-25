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
  { id: 'c2', type: '경호서비스', userName: '이**', phone: '010-****-5678', status: 'confirmed', date: '2026-03-25', time: '18:00', method: '안전보호', notes: '내일 이별 통보 예정, 강남역 카페' },
  { id: 'c3', type: '법률상담', userName: '박**', phone: '010-****-9012', status: 'completed', date: '2026-03-23', time: '10:00', method: '카카오톡', notes: '디지털 성범죄 삭제요청' },
  { id: 'c4', type: '경호서비스', userName: '최**', phone: '010-****-3456', status: 'pending', date: '2026-03-26', time: '15:00', method: '완전보호', notes: '동거 해지, 짐 빼는 날 경호 필요' },
  { id: 'c5', type: '법률경고장', userName: '정**', phone: '010-****-7890', status: 'in_progress', date: '2026-03-24', time: '11:00', method: '내용증명', notes: '반복 연락 중단 요청 경고장' },
  { id: 'c6', type: '법률상담', userName: '한**', phone: '010-****-2345', status: 'pending', date: '2026-03-24', time: '16:00', method: '방문', notes: '가스라이팅 + 경제적 학대 상담' },
];

export const MOCK_USERS = [
  { id: 'u1', nickname: '용감한사자', tier: 'care' as const, joinDate: '2026-01-15', lastActive: '2026-03-24', diagnosisScore: 42, stalkingLogs: 12, evidenceCount: 8 },
  { id: 'u2', nickname: '밤하늘별', tier: 'light' as const, joinDate: '2026-02-03', lastActive: '2026-03-24', diagnosisScore: 28, stalkingLogs: 5, evidenceCount: 3 },
  { id: 'u3', nickname: '따뜻한봄', tier: 'free' as const, joinDate: '2026-03-10', lastActive: '2026-03-23', diagnosisScore: 15, stalkingLogs: 0, evidenceCount: 1 },
  { id: 'u4', nickname: '새벽달', tier: 'care' as const, joinDate: '2025-12-20', lastActive: '2026-03-24', diagnosisScore: 55, stalkingLogs: 23, evidenceCount: 15 },
  { id: 'u5', nickname: '파란나비', tier: 'light' as const, joinDate: '2026-02-28', lastActive: '2026-03-22', diagnosisScore: 31, stalkingLogs: 8, evidenceCount: 4 },
  { id: 'u6', nickname: '햇살', tier: 'free' as const, joinDate: '2026-03-20', lastActive: '2026-03-24', diagnosisScore: null, stalkingLogs: 0, evidenceCount: 0 },
  { id: 'u7', nickname: '꽃길', tier: 'care' as const, joinDate: '2026-01-05', lastActive: '2026-03-24', diagnosisScore: 38, stalkingLogs: 17, evidenceCount: 11 },
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
  tierBreakdown: { free: 3420, light: 1850, care: 980 },
  conversionRate: { freeToLight: 4.2, lightToCare: 12.8, trialToPaid: 38.5 },
  topServices: [
    { name: '법정 증거 PDF', count: 156, revenue: 23244000 },
    { name: '법률 경고장 (내용증명)', count: 89, revenue: 8811000 },
    { name: '법률 경고장 (이메일)', count: 134, revenue: 6566000 },
    { name: 'NCII 삭제 대응', count: 67, revenue: 6633000 },
    { name: '경호 서비스', count: 32, revenue: 8000000 },
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
  light: { label: '라이트', color: '#C4956A' },
  care: { label: '케어', color: '#9B7EC8' },
};
