// ─── 안전이별 보호 점수 시스템 ──────────────────────────────────────────────

import { loadAllEvidence } from './secure-evidence';
import { SAFETY_CHECKLIST, CHECKLIST_TOTAL } from '@/constants/checklist';
import type { CaseType } from '@/contexts/AppContext';

// ─── 타입 ───────────────────────────────────────────────────────────────────

export type ProtectionLevel = 'danger' | 'warning' | 'caution' | 'safe';

export interface ProtectionScoreBreakdown {
  evidence: number;     // 0~25
  checklist: number;    // 0~25
  safetyPlan: number;   // 0~25
  legalAction: number;  // 0~25
}

export interface ProtectionScoreResult {
  total: number;          // 0~100
  breakdown: ProtectionScoreBreakdown;
  level: ProtectionLevel;
  nextAction: string;     // 다음 행동 추천
}

// ─── 증거 점수 산출 (0~25) ──────────────────────────────────────────────────

function calculateEvidenceScore(evidenceCount: number): number {
  if (evidenceCount >= 10) return 25;
  if (evidenceCount >= 7) return 20;
  if (evidenceCount >= 5) return 15;
  if (evidenceCount >= 3) return 10;
  if (evidenceCount >= 1) return 5;
  return 0;
}

// ─── 체크리스트 점수 산출 (0~25) ────────────────────────────────────────────

function calculateChecklistScore(completedSteps: string[]): number {
  const completedCount = SAFETY_CHECKLIST.filter(
    (item) => completedSteps.includes(item.id),
  ).length;
  return Math.round((completedCount / CHECKLIST_TOTAL) * 25);
}

// ─── 안전 계획 점수 산출 (0~25) ─────────────────────────────────────────────

function calculateSafetyPlanScore(completedSteps: string[]): number {
  const safetyItems = SAFETY_CHECKLIST.filter(
    (item) => item.category === 'safety',
  );
  if (safetyItems.length === 0) return 0;

  const completedSafetyCount = safetyItems.filter(
    (item) => completedSteps.includes(item.id),
  ).length;
  return Math.round((completedSafetyCount / safetyItems.length) * 25);
}

// ─── 법적 조치 점수 산출 (0~25) ─────────────────────────────────────────────

function calculateLegalActionScore(caseType: CaseType): number {
  switch (caseType) {
    case 'complaint':
      return 25;
    case 'warning_letter':
      return 15;
    case 'self_protect':
      return 5;
    default:
      return 0;
  }
}

// ─── 보호 레벨 판정 ─────────────────────────────────────────────────────────

function determineLevel(total: number): ProtectionLevel {
  if (total >= 76) return 'safe';
  if (total >= 51) return 'caution';
  if (total >= 26) return 'warning';
  return 'danger';
}

// ─── 다음 행동 추천 ─────────────────────────────────────────────────────────

function recommendNextAction(breakdown: ProtectionScoreBreakdown): string {
  // 가장 점수가 낮은 영역 우선 추천
  const { evidence, checklist, safetyPlan, legalAction } = breakdown;

  if (evidence < 10) {
    return '증거를 더 수집하세요. 증거보관함에 3건 이상의 증거를 저장하면 보호 점수가 올라갑니다.';
  }
  if (legalAction === 0) {
    return '법률 상담을 받아보세요. 전문가의 도움으로 더 강력한 법적 보호를 받을 수 있습니다.';
  }
  if (safetyPlan < 15) {
    return '안전 계획을 세우세요. 긴급 연락처, 안전한 장소, 비상 탈출 계획을 준비하세요.';
  }
  if (checklist < 20) {
    return '안전 체크리스트를 완료하세요. 남은 항목을 하나씩 완료하면 보호가 강화됩니다.';
  }

  return '잘 하고 있어요! 보호 상태를 유지하며 필요 시 법률 전문가와 상담하세요.';
}

// ─── 메인 함수 ──────────────────────────────────────────────────────────────

export async function calculateProtectionScore(
  completedSteps: string[],
  caseType: CaseType,
): Promise<ProtectionScoreResult> {
  // 증거 수 가져오기
  const allEvidence = await loadAllEvidence();
  const evidenceCount = allEvidence.length;

  // 각 영역 점수 산출
  const breakdown: ProtectionScoreBreakdown = {
    evidence: calculateEvidenceScore(evidenceCount),
    checklist: calculateChecklistScore(completedSteps),
    safetyPlan: calculateSafetyPlanScore(completedSteps),
    legalAction: calculateLegalActionScore(caseType),
  };

  const total = breakdown.evidence + breakdown.checklist + breakdown.safetyPlan + breakdown.legalAction;
  const level = determineLevel(total);
  const nextAction = recommendNextAction(breakdown);

  return { total, breakdown, level, nextAction };
}
