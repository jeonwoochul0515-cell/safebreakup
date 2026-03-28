// ─── 안전이별 보호 체크리스트 항목 정의 ─────────────────────────────────────

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'assessment' | 'evidence' | 'safety' | 'digital' | 'financial' | 'preparation' | 'legal';
  icon: string;
}

export const SAFETY_CHECKLIST: ChecklistItem[] = [
  { id: 'diagnosis', label: '위험도 자가진단 완료', category: 'assessment', icon: 'shield-checkmark' },
  { id: 'evidence_3', label: '증거 3건 이상 수집', category: 'evidence', icon: 'folder' },
  { id: 'emergency_contacts', label: '긴급 연락처 저장', category: 'safety', icon: 'call' },
  { id: 'safe_place', label: '안전한 장소 확보', category: 'safety', icon: 'home' },
  { id: 'trusted_person', label: '신뢰할 수 있는 사람에게 상황 공유', category: 'safety', icon: 'people' },
  { id: 'digital_security', label: '비밀번호 변경 / 위치 공유 해제', category: 'digital', icon: 'lock-closed' },
  { id: 'financial_independence', label: '비밀 계좌 / 경제적 독립 준비', category: 'financial', icon: 'card' },
  { id: 'documents_ready', label: '중요 서류 사본 확보 (신분증, 통장 등)', category: 'preparation', icon: 'document' },
  { id: 'escape_plan', label: '비상 탈출 계획 수립', category: 'safety', icon: 'exit' },
  { id: 'legal_consultation', label: '법률 상담 1회 이상 완료', category: 'legal', icon: 'chatbubbles' },
  { id: 'warning_letter', label: '경고장 또는 내용증명 발송', category: 'legal', icon: 'document-text' },
  { id: 'police_report', label: '경찰 신고 또는 고소 접수', category: 'legal', icon: 'shield' },
];

export const CHECKLIST_TOTAL = SAFETY_CHECKLIST.length; // 12
