// ─── AI 증거 분석 엔진 ─────────────────────────────────────────────────────
// TODO: 실제 운영 시 Claude API + Whisper API 연동
// 현재는 키워드 기반 Mock 분석

import { APPLICABLE_STATUTES } from '@/constants/complaint';
import type { SecureEvidenceItem } from '@/lib/secure-evidence';
import { decryptContent } from '@/lib/secure-evidence';

// ─── 타입 ──────────────────────────────────────────────────────────────────

export type AnalysisCategory =
  | 'stalking'
  | 'threat'
  | 'assault'
  | 'sexual'
  | 'digital_sexual'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AIAnalysisResult {
  category: AnalysisCategory;
  riskLevel: RiskLevel;
  detectedKeywords: string[];
  applicableLaw: string;
  summary: string;
  recommendation: string;
  confidence: number;
  analyzedAt: string;
}

// ─── 키워드 사전 ───────────────────────────────────────────────────────────

const THREAT_KEYWORDS = [
  '죽이', '죽여', '가만 안', '두고 봐', '후회', '복수',
  '죽이겠', '해치', '가만안둔', '위협', '협박',
];

const STALKING_KEYWORDS = [
  '찾아가', '기다리', '따라', '감시', '전화', '문자',
  '미행', '배회', '스토킹', '따라다', '몰래',
];

const NCII_KEYWORDS = [
  '사진', '영상', '유포', '뿌리', '퍼뜨리',
  '촬영물', '딥페이크', '합성', '뿌리겠',
];

const VIOLENCE_KEYWORDS = [
  '때리', '맞았', '폭행', '밀었', '잡았',
  '때림', '밀침', '상해', '부상', '피가',
];

const SEXUAL_KEYWORDS = [
  '강간', '성폭행', '성범죄', '성추행', '강제추행',
  '성폭력', '성적 수치심',
];

// ─── 카테고리별 권장 행동 ──────────────────────────────────────────────────

const RECOMMENDATIONS: Record<AnalysisCategory, Record<RiskLevel, string>> = {
  threat: {
    critical: '즉시 112에 신고하세요. 생명에 위협이 될 수 있는 협박입니다.',
    high: '경찰에 협박 사실을 신고하고, 이 증거를 보전하세요.',
    medium: '협박 정황이 감지되었습니다. 추가 증거를 확보하세요.',
    low: '주의가 필요합니다. 상황을 지켜보며 증거를 보관하세요.',
  },
  stalking: {
    critical: '즉시 112에 신고하세요. 스토킹 피해가 심각한 수준입니다.',
    high: '스토킹처벌법에 따라 경찰에 신고를 권장합니다.',
    medium: '스토킹 정황이 감지되었습니다. 반복 시 즉시 신고하세요.',
    low: '주의 관찰이 필요합니다. 추가 접근 시 기록을 남기세요.',
  },
  assault: {
    critical: '즉시 119/112에 신고하세요. 병원 진료 및 진단서를 확보하세요.',
    high: '폭행 사실을 경찰에 신고하고, 진단서를 확보하세요.',
    medium: '폭행 정황이 감지되었습니다. 진단서 및 사진 증거를 확보하세요.',
    low: '상황을 기록하고, 재발 시 즉시 신고하세요.',
  },
  sexual: {
    critical: '즉시 112에 신고하세요. 증거를 보전하고 병원을 방문하세요.',
    high: '성범죄 피해 사실을 경찰에 신고하세요. 원스톱지원센터(1899-3075)를 이용하세요.',
    medium: '성범죄 정황이 감지되었습니다. 전문 상담을 권장합니다.',
    low: '주의가 필요합니다. 불쾌한 상황이 반복되면 기록하세요.',
  },
  digital_sexual: {
    critical: '디지털 성범죄 피해 핫라인(02-735-8994)에 즉시 연락하세요.',
    high: '유포 차단 요청을 위해 디지털성범죄피해자지원센터에 연락하세요.',
    medium: '촬영물 관련 정황이 감지되었습니다. 증거를 보전하세요.',
    low: '주의가 필요합니다. 추가 정황 발생 시 기록하세요.',
  },
  other: {
    critical: '즉시 112에 신고하세요.',
    high: '경찰에 신고를 권장합니다.',
    medium: '추가 증거를 확보하세요.',
    low: '상황을 지켜보며 기록을 남기세요.',
  },
};

// ─── 카테고리 한글 라벨 ────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<AnalysisCategory, string> = {
  stalking: '스토킹',
  threat: '협박',
  assault: '폭행/상해',
  sexual: '성범죄',
  digital_sexual: '디지털 성범죄',
  other: '기타',
};

// ─── 헬퍼 함수 ─────────────────────────────────────────────────────────────

function getRecommendation(category: AnalysisCategory, riskLevel: RiskLevel): string {
  return RECOMMENDATIONS[category]?.[riskLevel] ?? RECOMMENDATIONS.other[riskLevel];
}

function findApplicableLaw(category: AnalysisCategory): string {
  // APPLICABLE_STATUTES에서 해당 카테고리의 첫 번째 법조를 가져옴
  const categoryMap: Record<AnalysisCategory, string> = {
    stalking: 'stalking',
    threat: 'threat',
    assault: 'assault',
    sexual: 'sexual',
    digital_sexual: 'digital_sexual',
    other: 'other',
  };

  const crimeType = categoryMap[category];
  const statute = APPLICABLE_STATUTES.find((s) => s.crime_type === crimeType);

  if (statute) {
    return `${statute.law_name} ${statute.article} (${statute.article_title})`;
  }
  return '해당 법조항 확인 필요';
}

function matchKeywords(text: string, keywords: string[]): string[] {
  return keywords.filter((kw) => text.includes(kw));
}

// ─── 텍스트 증거 분석 (문자/카톡 내용) ────────────────────────────────────

export async function analyzeTextEvidence(text: string): Promise<AIAnalysisResult> {
  // TODO: 실제 운영 시 Claude API로 교체
  // const response = await fetch('https://api.anthropic.com/v1/messages', { ... });

  let category: AnalysisCategory = 'other';
  let riskLevel: RiskLevel = 'low';
  let detectedKeywords: string[] = [];
  let confidence = 0.6;

  // 우선순위: threat > sexual > digital_sexual > assault > stalking > other
  // 더 위험한 카테고리가 우선

  const threatMatches = matchKeywords(text, THREAT_KEYWORDS);
  const stalkingMatches = matchKeywords(text, STALKING_KEYWORDS);
  const nciiMatches = matchKeywords(text, NCII_KEYWORDS);
  const violenceMatches = matchKeywords(text, VIOLENCE_KEYWORDS);
  const sexualMatches = matchKeywords(text, SEXUAL_KEYWORDS);

  // 가장 많이 매칭된 카테고리 + 위험도 결정
  const scores: { cat: AnalysisCategory; matches: string[]; baseRisk: RiskLevel }[] = [
    { cat: 'threat', matches: threatMatches, baseRisk: 'critical' },
    { cat: 'sexual', matches: sexualMatches, baseRisk: 'critical' },
    { cat: 'digital_sexual', matches: nciiMatches, baseRisk: 'high' },
    { cat: 'assault', matches: violenceMatches, baseRisk: 'high' },
    { cat: 'stalking', matches: stalkingMatches, baseRisk: 'high' },
  ];

  // 매칭 수가 가장 많은 카테고리 선택
  let bestScore = scores[0];
  for (const s of scores) {
    if (s.matches.length > bestScore.matches.length) {
      bestScore = s;
    }
  }

  if (bestScore.matches.length > 0) {
    category = bestScore.cat;
    detectedKeywords = bestScore.matches;

    // 매칭 키워드 수에 따른 위험도 결정
    if (bestScore.matches.length >= 3) {
      riskLevel = bestScore.baseRisk;
      confidence = 0.85;
    } else if (bestScore.matches.length >= 2) {
      riskLevel = bestScore.baseRisk === 'critical' ? 'high' : 'medium';
      confidence = 0.75;
    } else {
      riskLevel = 'medium';
      confidence = 0.65;
    }

    // 복합 유형 (여러 카테고리 동시 감지) → 위험도 상승
    const totalMatches = scores.reduce((sum, s) => sum + s.matches.length, 0);
    if (totalMatches >= 5 && riskLevel !== 'critical') {
      riskLevel = 'critical';
      confidence = Math.min(confidence + 0.1, 0.95);
      // 모든 감지된 키워드 합산
      detectedKeywords = scores.flatMap((s) => s.matches);
    }
  }

  const applicableLaw = findApplicableLaw(category);

  return {
    category,
    riskLevel,
    detectedKeywords: [...new Set(detectedKeywords)],
    applicableLaw,
    summary: category !== 'other'
      ? `AI 분석 결과: ${CATEGORY_LABELS[category]} 유형으로 분류됨 (키워드 ${detectedKeywords.length}개 감지)`
      : 'AI 분석 결과: 명확한 법적 유형이 감지되지 않았습니다.',
    recommendation: getRecommendation(category, riskLevel),
    confidence,
    analyzedAt: new Date().toISOString(),
  };
}

// ─── 이미지 증거 분석 (캡처/사진) ─────────────────────────────────────────

export async function analyzeImageEvidence(
  _base64: string,
  description?: string,
): Promise<AIAnalysisResult> {
  // TODO: Claude Vision API 연동
  // const response = await anthropic.messages.create({
  //   model: 'claude-sonnet-4-20250514',
  //   messages: [{ role: 'user', content: [
  //     { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64 } },
  //     { type: 'text', text: '이 이미지에서 법적으로 문제가 될 수 있는 내용을 분석해주세요.' },
  //   ]}],
  // });

  // 현재는 description이 있으면 텍스트 분석으로 대체
  if (description) {
    const result = await analyzeTextEvidence(description);
    return {
      ...result,
      confidence: result.confidence * 0.8, // 이미지 직접 분석이 아니므로 신뢰도 하향
      summary: result.summary.replace('AI 분석 결과', 'AI 분석 결과 (설명 기반)'),
    };
  }

  return {
    category: 'other',
    riskLevel: 'low',
    detectedKeywords: [],
    applicableLaw: '해당 법조항 확인 필요',
    summary: 'AI 분석 결과: 이미지 직접 분석은 준비 중입니다. 설명을 추가하면 분석이 가능합니다.',
    recommendation: '이미지 내용에 대한 텍스트 설명을 추가해주세요.',
    confidence: 0,
    analyzedAt: new Date().toISOString(),
  };
}

// ─── 음성 증거 분석 ───────────────────────────────────────────────────────

export async function analyzeAudioEvidence(
  _fileUri: string,
): Promise<AIAnalysisResult> {
  // TODO: Whisper STT → 텍스트 변환 → 텍스트 분석
  // const transcription = await whisper.transcribe(fileUri);
  // return analyzeTextEvidence(transcription.text);

  return {
    category: 'other',
    riskLevel: 'low',
    detectedKeywords: [],
    applicableLaw: '해당 법조항 확인 필요',
    summary: 'AI 분석 결과: 음성 분석(STT)은 준비 중입니다.',
    recommendation: '음성 내용을 텍스트로 기록하여 별도 메모로 저장해주세요.',
    confidence: 0,
    analyzedAt: new Date().toISOString(),
  };
}

// ─── 통합 분석 함수 ───────────────────────────────────────────────────────

export async function analyzeEvidence(
  item: SecureEvidenceItem,
): Promise<AIAnalysisResult> {
  switch (item.type) {
    case 'text': {
      const plainText = await decryptContent(item);
      return analyzeTextEvidence(plainText);
    }
    case 'image': {
      const content = await decryptContent(item);
      return analyzeImageEvidence('', content);
    }
    case 'audio': {
      return analyzeAudioEvidence(item.content);
    }
    default: {
      // file 타입 등: 설명 텍스트가 있으면 분석
      const content = await decryptContent(item);
      return analyzeTextEvidence(content);
    }
  }
}
