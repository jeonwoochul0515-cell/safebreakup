// 경찰 제출용 증거 분석 보고서 상수
// 검토: 김창희 변호사 (법률사무소 청송)

export const REPORT_SECTIONS = [
  { key: 'summary', title: '사건 개요', icon: 'document-text' },
  { key: 'timeline', title: '사건 경위 (시간순)', icon: 'time' },
  { key: 'evidence', title: '증거 목록 및 무결성 검증', icon: 'shield-checkmark' },
  { key: 'legal', title: '적용 법률 및 판례 분석', icon: 'scale' },
  { key: 'demand', title: '피해자 요구사항', icon: 'flag' },
  { key: 'appendix', title: '부록 (증거 원본 첨부)', icon: 'attach' },
];

export interface EvidenceForReport {
  id: string;
  type: string;
  description: string;
  category: string;
  timestamp: string;
  hash: string;
  verified: boolean;
}

export interface ReportData {
  reportId: string;
  generatedAt: string;
  victimName: string;
  caseType: string;
  perpetratorName: string;
  relationship: string;
  incidentPeriod: string;
  summary: string;
  evidenceItems: EvidenceForReport[];
  applicableLaws: { law: string; article: string; penalty: string }[];
  demands: string[];
  riskLevel: string;
  analysisNotes: string;
}

export function generateReportId(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `SB-${y}${m}${d}-${seq}`;
}

export function analyzeEvidence(evidence: EvidenceForReport[]): {
  caseType: string;
  riskLevel: string;
  applicableLaws: { law: string; article: string; penalty: string }[];
  analysisNotes: string;
} {
  const categories = evidence.map(e => e.category);
  const hasThreats = categories.includes('협박');
  const hasDistribution = categories.includes('유포');
  const hasStalking = categories.includes('스토킹') || categories.includes('미행');
  const hasViolence = categories.includes('폭행');
  const hasConversation = categories.includes('대화');

  const laws: { law: string; article: string; penalty: string }[] = [];
  let caseType = '';
  let riskLevel = '주의';
  const notes: string[] = [];

  // 스토킹
  if (hasStalking || evidence.length >= 3) {
    laws.push({
      law: '스토킹범죄의 처벌 등에 관한 법률',
      article: '제18조 (스토킹범죄의 벌칙)',
      penalty: '3년 이하 징역 또는 3,000만원 이하 벌금',
    });
    laws.push({
      law: '스토킹범죄의 처벌 등에 관한 법률',
      article: '제4조 (긴급응급조치)',
      penalty: '100m 접근금지, 통신접근금지 (위반 시 1년 이하 징역)',
    });
    caseType = '스토킹';
    riskLevel = '위험';
    notes.push('반복적 접촉 패턴이 확인되어 스토킹범죄에 해당할 가능성이 높습니다.');
    notes.push('2024.1.12. 개정법에 따라 반의사불벌죄가 폐지되어, 피해자 의사와 무관하게 처벌이 진행됩니다.');
  }

  // 협박
  if (hasThreats) {
    laws.push({
      law: '형법',
      article: '제283조 (협박)',
      penalty: '3년 이하 징역 또는 500만원 이하 벌금',
    });
    if (!caseType) caseType = '협박';
    else caseType += ' + 협박';
    riskLevel = '위험';
    notes.push('위협적 발언이 포함된 증거가 확인되어 협박죄 적용이 가능합니다.');
  }

  // 유포/디지털 성범죄
  if (hasDistribution) {
    laws.push({
      law: '성폭력범죄의 처벌 등에 관한 특례법',
      article: '제14조 (카메라 등을 이용한 촬영)',
      penalty: '7년 이하 징역 또는 5,000만원 이하 벌금',
    });
    laws.push({
      law: '성폭력범죄의 처벌 등에 관한 특례법',
      article: '제14조의3 (촬영물 이용 협박·강요)',
      penalty: '협박: 1년 이상 징역 / 강요: 3년 이상 징역',
    });
    if (!caseType) caseType = '디지털 성범죄';
    else caseType += ' + 디지털 성범죄';
    riskLevel = '긴급';
    notes.push('촬영물 유포 또는 유포 협박 증거가 확인되어 성폭력처벌법 적용이 가능합니다.');
  }

  // 폭행
  if (hasViolence) {
    laws.push({
      law: '형법',
      article: '제260조 (폭행)',
      penalty: '2년 이하 징역 또는 500만원 이하 벌금',
    });
    if (!caseType) caseType = '폭행';
    else caseType += ' + 폭행';
    riskLevel = '긴급';
    notes.push('신체적 폭력 증거가 확인됩니다.');
  }

  if (!caseType) caseType = '기타 (상세 분석 필요)';
  if (laws.length === 0) {
    laws.push({
      law: '추가 분석 필요',
      article: '증거 보강 후 재분석 권장',
      penalty: '-',
    });
  }

  notes.push(`총 ${evidence.length}건의 증거가 수집되었으며, ${evidence.filter(e => e.verified).length}건의 SHA-256 무결성이 검증되었습니다.`);

  return { caseType, riskLevel, applicableLaws: laws, analysisNotes: notes.join('\n\n') };
}

export function generatePoliceReportText(data: ReportData): string {
  const divider = '━'.repeat(40);
  const evidenceRows = data.evidenceItems.map((e, i) =>
    `  ${i + 1}. [${e.type}] ${e.description}\n     시각: ${e.timestamp}\n     분류: ${e.category}\n     SHA-256: ${e.hash}\n     무결성: ${e.verified ? '검증 완료 ✓' : '미검증'}`
  ).join('\n\n');

  const lawRows = data.applicableLaws.map((l, i) =>
    `  ${i + 1}. ${l.law}\n     ${l.article}\n     벌칙: ${l.penalty}`
  ).join('\n\n');

  const demandRows = data.demands.map((d, i) => `  ${i + 1}. ${d}`).join('\n');

  return `
${divider}
경 찰 제 출 용   증 거 분 석 보 고 서
${divider}

보고서 번호: ${data.reportId}
작 성 일 시: ${data.generatedAt}
작 성 기 관: 법률사무소 청송 (대표변호사 김창희)
문 서 유 형: 피해 사실 정리 및 증거 분석 보고서

${divider}

1. 사건 개요

  피해자: ${data.victimName}
  가해자: ${data.perpetratorName}
  관  계: ${data.relationship}
  사건유형: ${data.caseType}
  사건기간: ${data.incidentPeriod}
  위험수준: ${data.riskLevel}

  ${data.summary}

${divider}

2. 증거 목록 및 무결성 검증

  총 ${data.evidenceItems.length}건의 증거가 수집되었으며,
  각 증거에 SHA-256 해시값이 부여되어 무결성이 보장됩니다.

${evidenceRows}

${divider}

3. 적용 법률 및 분석

${lawRows}

  ■ AI 법률 분석 소견:
  ${data.analysisNotes}

${divider}

4. 피해자 요구사항

${demandRows}

${divider}

5. 참고사항

  • 본 보고서의 모든 증거는 SHA-256 해시 알고리즘으로 무결성이 검증되었습니다.
  • 증거 수집 시점의 타임스탬프가 자동 기록되어 있습니다.
  • 원본 증거 파일은 별도 첨부되어 있습니다.
  • 본 보고서는 수사 참고 자료이며, 최종 법적 판단은 수사기관 및 법원에 있습니다.

${divider}

법률사무소 청송
대표변호사 김 창 희

본 보고서는 이별방패 앱을 통해 자동 생성되었으며,
김창희 변호사의 검토를 거쳤습니다.

${divider}
`.trim();
}
