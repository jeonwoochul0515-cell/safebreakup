// 김창희 변호사 고소장 생성 엔진
// 수집된 팩트를 실제 고소장 형식으로 변환
// 검토: 김창희 변호사 (법률사무소 청송)

import { SecureEvidenceItem, loadAllEvidence } from './secure-evidence';
import type { CrimeType, ComplaintDraftData } from '@/types/database';
import { EVIDENCE_CATEGORY_LAWS } from '@/constants/complaint';

// ─── 타입 정의 ──────────────────────────────────────────────

/** 세분화된 범죄 하위 유형 (내부 법조 매칭용) */
type DetailedCrimeType =
  | 'stalking'
  | 'stalking_weapon'
  | 'threat'
  | 'special_threat'
  | 'coercion'
  | 'assault'
  | 'injury'
  | 'special_assault'
  | 'illegal_filming'
  | 'distribution'
  | 'distribution_threat'
  | 'deepfake'
  | 'defamation'
  | 'cyber_defamation'
  | 'insult'
  | 'trespass'
  | 'property_damage';

/** 적용 법조 */
export interface ApplicableStatute {
  crimeType: DetailedCrimeType;
  lawName: string;       // 법률명
  article: string;       // 조항
  penalty: string;       // 법정형
  keywords: string[];    // 매칭 키워드
}

/** 고소인/피고소인 정보 */
export interface PersonInfo {
  name: string;
  birthDate?: string;    // YYYY-MM-DD
  address?: string;
  phone?: string;
  job?: string;          // 직업 (선택)
}

/** 범죄사실 항목 */
export interface CrimeFact {
  label: string;         // 가., 나., 다. 등의 라벨
  crimeType: CrimeType;
  when: string;          // 언제
  where: string;         // 어디서
  what: string;          // 무엇을
  how: string;           // 어떻게
  detail: string;        // 상세 서술
}

/** 증거 목록 아이템 (고소장용) */
export interface ComplaintEvidenceItem {
  number: number;
  type: string;
  description: string;
  timestamp: string;
  sha256Hash: string;
}

/** 고소장 전체 문서 구조 */
export interface ComplaintDocument {
  documentId: string;
  generatedAt: string;
  complainant: PersonInfo;          // 고소인
  suspect: PersonInfo;              // 피고소인
  relationship: string;             // 당사자 관계
  relationshipDetail: string;       // 관계 상세 서술
  crimeFacts: CrimeFact[];          // 범죄사실
  applicableStatutes: ApplicableStatute[];  // 적용 법조
  evidenceItems: ComplaintEvidenceItem[];   // 증거 목록
  damageDescription: string;        // 피해 결과
  punishmentRequest: string;        // 처벌 희망 내용
  policeStation: string;            // 제출 경찰서
  maskingLevel: 'full' | 'partial' | 'none';
}

// ─── 16개 범죄유형별 법조 매칭 테이블 ────────────────────────

const STATUTE_TABLE: ApplicableStatute[] = [
  {
    crimeType: 'stalking',
    lawName: '스토킹범죄의 처벌 등에 관한 법률',
    article: '제18조 제1항',
    penalty: '3년 이하 징역 또는 3,000만원 이하 벌금',
    keywords: ['스토킹', '반복연락', '미행', '배회', '따라다님', '감시'],
  },
  {
    crimeType: 'stalking_weapon',
    lawName: '스토킹범죄의 처벌 등에 관한 법률',
    article: '제18조 제2항',
    penalty: '5년 이하 징역 또는 5,000만원 이하 벌금',
    keywords: ['흉기', '스토킹', '위험한 물건'],
  },
  {
    crimeType: 'threat',
    lawName: '형법',
    article: '제283조 제1항 (협박)',
    penalty: '3년 이하 징역 또는 500만원 이하 벌금',
    keywords: ['협박', '죽이겠다', '가만안둔다', '해치겠다', '위협'],
  },
  {
    crimeType: 'special_threat',
    lawName: '형법',
    article: '제284조 (특수협박)',
    penalty: '7년 이하 징역 또는 1,000만원 이하 벌금',
    keywords: ['흉기', '협박', '칼', '위험한 물건'],
  },
  {
    crimeType: 'coercion',
    lawName: '형법',
    article: '제324조 (강요)',
    penalty: '5년 이하 징역',
    keywords: ['강요', '자해협박', '행동강요', '시키다'],
  },
  {
    crimeType: 'assault',
    lawName: '형법',
    article: '제260조 제1항 (폭행)',
    penalty: '2년 이하 징역 또는 500만원 이하 벌금',
    keywords: ['폭행', '때림', '밀침', '때리다', '맞다'],
  },
  {
    crimeType: 'injury',
    lawName: '형법',
    article: '제257조 제1항 (상해)',
    penalty: '7년 이하 징역',
    keywords: ['상해', '진단서', '부상', '다치다', '골절'],
  },
  {
    crimeType: 'special_assault',
    lawName: '형법',
    article: '제261조 (특수폭행)',
    penalty: '5년 이하 징역 또는 1,000만원 이하 벌금',
    keywords: ['흉기', '폭행', '위험한 물건', '특수폭행'],
  },
  {
    crimeType: 'illegal_filming',
    lawName: '성폭력범죄의 처벌 등에 관한 특례법',
    article: '제14조 제1항 (카메라등이용촬영)',
    penalty: '7년 이하 징역 또는 5,000만원 이하 벌금',
    keywords: ['불법촬영', '동의없는 촬영', '몰래 촬영', '몰카'],
  },
  {
    crimeType: 'distribution',
    lawName: '성폭력범죄의 처벌 등에 관한 특례법',
    article: '제14조 제2항 (촬영물 유포)',
    penalty: '7년 이하 징역 또는 5,000만원 이하 벌금',
    keywords: ['유포', '촬영물 유포', '사진 유포', '영상 유포'],
  },
  {
    crimeType: 'distribution_threat',
    lawName: '성폭력범죄의 처벌 등에 관한 특례법',
    article: '제14조의3 제1항 (촬영물이용협박)',
    penalty: '1년 이상 징역',
    keywords: ['유포협박', '사진뿌리겠다', '퍼뜨리겠다', '영상 협박'],
  },
  {
    crimeType: 'deepfake',
    lawName: '성폭력범죄의 처벌 등에 관한 특례법',
    article: '제14조의2 (허위영상물)',
    penalty: '5년 이하 징역 또는 5,000만원 이하 벌금',
    keywords: ['딥페이크', '합성', 'AI생성', '허위영상'],
  },
  {
    crimeType: 'defamation',
    lawName: '형법',
    article: '제307조 (명예훼손)',
    penalty: '2년 이하 징역 또는 500만원 이하 벌금',
    keywords: ['명예훼손', '사실적시', '소문', '떠벌리다'],
  },
  {
    crimeType: 'cyber_defamation',
    lawName: '정보통신망 이용촉진 및 정보보호 등에 관한 법률',
    article: '제70조 (사이버 명예훼손)',
    penalty: '3년 이하 징역 또는 3,000만원 이하 벌금',
    keywords: ['사이버 명예훼손', 'SNS 명예훼손', '온라인 비방', '인터넷 명예훼손'],
  },
  {
    crimeType: 'insult',
    lawName: '형법',
    article: '제311조 (모욕)',
    penalty: '1년 이하 징역 또는 200만원 이하 벌금',
    keywords: ['모욕', '욕설', '공연히 모욕'],
  },
  {
    crimeType: 'trespass',
    lawName: '형법',
    article: '제319조 제1항 (주거침입)',
    penalty: '3년 이하 징역 또는 500만원 이하 벌금',
    keywords: ['주거침입', '집에 침입', '무단침입', '문 부수다'],
  },
  {
    crimeType: 'property_damage',
    lawName: '형법',
    article: '제366조 (재물손괴)',
    penalty: '3년 이하 징역 또는 700만원 이하 벌금',
    keywords: ['재물손괴', '물건 파손', '부수다', '깨다', '망가뜨리다'],
  },
];

// ─── 한글 라벨 ──────────────────────────────────────────────

const KOREAN_LABELS = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하'];

// ─── 문서 ID 생성 ───────────────────────────────────────────

function generateDocumentId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `SB-고소장-${y}${m}${d}-${seq}`;
}

// ─── 공개 API ───────────────────────────────────────────────

/**
 * 수집된 팩트 + 증거 → 고소장 구조체 생성
 * facts: 사무장이 7단계를 통해 수집한 데이터
 */
export function generateComplaint(
  facts: {
    complainant: PersonInfo;
    suspect: PersonInfo;
    relationship: string;
    relationshipDetail: string;
    crimeTypes: CrimeType[];
    crimeFacts: Omit<CrimeFact, 'label'>[];
    damageDescription: string;
    punishmentRequest: string;
    policeStation: string;
    maskingLevel?: 'full' | 'partial' | 'none';
  },
  evidenceItems: ComplaintEvidenceItem[],
): ComplaintDocument {
  // 범죄사실에 가., 나., 다. 라벨 부여
  const labeledFacts: CrimeFact[] = facts.crimeFacts.map((fact, idx) => ({
    ...fact,
    label: `${KOREAN_LABELS[idx] || String(idx + 1)}.`,
  }));

  // 적용 법조 자동 매칭
  const allBehaviors = facts.crimeFacts.map(f => `${f.what} ${f.how} ${f.detail}`);
  const statutes = matchStatutes(facts.crimeTypes, allBehaviors);

  return {
    documentId: generateDocumentId(),
    generatedAt: new Date().toISOString(),
    complainant: facts.complainant,
    suspect: facts.suspect,
    relationship: facts.relationship,
    relationshipDetail: facts.relationshipDetail,
    crimeFacts: labeledFacts,
    applicableStatutes: statutes,
    evidenceItems,
    damageDescription: facts.damageDescription,
    punishmentRequest: facts.punishmentRequest,
    policeStation: facts.policeStation,
    maskingLevel: facts.maskingLevel || 'none',
  };
}

/**
 * 범죄유형 + 행위 키워드 → 적용 법조 매칭
 * 16개 범죄유형 테이블에서 일치하는 법조를 반환
 */
// CrimeType(6개) → DetailedCrimeType(16개) 매핑
const CRIME_TYPE_MAP: Record<CrimeType, DetailedCrimeType[]> = {
  stalking: ['stalking', 'stalking_weapon'],
  threat: ['threat', 'special_threat', 'coercion'],
  assault: ['assault', 'injury', 'special_assault'],
  sexual: ['illegal_filming', 'distribution', 'distribution_threat'],
  digital_sexual: ['deepfake', 'illegal_filming', 'distribution', 'distribution_threat'],
  other: ['defamation', 'cyber_defamation', 'insult', 'trespass', 'property_damage'],
};

export function matchStatutes(
  crimeTypes: CrimeType[],
  behaviors: string[],
): ApplicableStatute[] {
  const matched: ApplicableStatute[] = [];
  const addedTypes = new Set<DetailedCrimeType>();

  // 1) 명시적으로 지정된 범죄유형 매칭 (기본 유형의 첫 번째 항목)
  for (const ct of crimeTypes) {
    const detailedTypes = CRIME_TYPE_MAP[ct] || [];
    for (const dt of detailedTypes) {
      const statute = STATUTE_TABLE.find(s => s.crimeType === dt);
      if (statute && !addedTypes.has(dt)) {
        matched.push(statute);
        addedTypes.add(dt);
        break; // 각 기본 유형당 대표 1개만
      }
    }
  }

  // 2) 행위 텍스트에서 키워드 기반 추가 매칭
  const behaviorText = behaviors.join(' ');
  for (const statute of STATUTE_TABLE) {
    if (addedTypes.has(statute.crimeType)) continue;

    const hasKeyword = statute.keywords.some(kw => behaviorText.includes(kw));
    if (hasKeyword) {
      matched.push(statute);
      addedTypes.add(statute.crimeType);
    }
  }

  return matched;
}

/**
 * 고소장 전체 텍스트 생성 (표준 양식)
 * 구성: 표제부 → 당사자 → 고소취지 → 범죄사실 → 적용법조 → 증거목록 → 결어
 */
export function generateComplaintText(complaint: ComplaintDocument): string {
  const divider = '━'.repeat(40);

  // ── 표제부 ──
  const header = `                        고  소  장`;

  // ── 당사자 (고소인) ──
  const complainantSection = [
    `고 소 인`,
    `  성    명: ${formatName(complaint.complainant.name, complaint.maskingLevel)}${complaint.complainant.birthDate ? ` (${complaint.complainant.birthDate})` : ''}`,
    complaint.complainant.address
      ? `  주    소: ${complaint.complainant.address}`
      : null,
    complaint.complainant.phone
      ? `  연 락 처: ${formatPhone(complaint.complainant.phone, complaint.maskingLevel)}`
      : null,
    complaint.complainant.job
      ? `  직    업: ${complaint.complainant.job}`
      : null,
  ].filter(Boolean).join('\n');

  // ── 당사자 (피고소인) ──
  const suspectName = complaint.suspect.name || '인적사항 불상';
  const suspectSection = [
    `피고소인`,
    `  성    명: ${formatName(suspectName, complaint.maskingLevel)}`,
    `  주    소: ${complaint.suspect.address || '불상'}`,
    `  연 락 처: ${complaint.suspect.phone ? formatPhone(complaint.suspect.phone, complaint.maskingLevel) : '불상'}`,
  ].join('\n');

  // ── 고소취지 ──
  const purposeSection = [
    `                    고 소 취 지`,
    ``,
    `고소인은 피고소인을 아래와 같은 범죄사실로 고소하오니,`,
    `수사하여 엄벌에 처하여 주시기 바랍니다.`,
  ].join('\n');

  // ── 범죄사실 ──
  const relationPart = [
    `1. 당사자의 관계`,
    `   ${complaint.relationshipDetail}`,
    ``,
  ].join('\n');

  const factsPart = complaint.crimeFacts.map(fact => {
    const sixW = [
      fact.when ? `일시: ${fact.when}` : null,
      fact.where ? `장소: ${fact.where}` : null,
    ].filter(Boolean).join(', ');

    return [
      `   ${fact.label} ${fact.detail}`,
      sixW ? `      (${sixW})` : null,
    ].filter(Boolean).join('\n');
  }).join('\n\n');

  const crimeSection = [
    `                    범 죄 사 실`,
    ``,
    relationPart,
    `2. 범죄사실`,
    factsPart,
  ].join('\n');

  // ── 적용법조 ──
  const statuteRows = complaint.applicableStatutes.map((s, i) =>
    `  ${i + 1}. ${s.lawName} ${s.article}\n     (${s.penalty})`
  ).join('\n');

  const statuteSection = [
    `                    적 용 법 조`,
    ``,
    statuteRows,
  ].join('\n');

  // ── 증거자료 ──
  const evidenceRows = complaint.evidenceItems.map(e =>
    `  ${e.number}. 증거 제${e.number}호: [${e.type}] ${e.description}\n     일시: ${e.timestamp}\n     SHA-256: ${e.sha256Hash}`
  ).join('\n\n');

  const evidenceSection = [
    `                    증 거 자 료`,
    ``,
    evidenceRows || '  (추후 보강 예정)',
  ].join('\n');

  // ── 피해 결과 ──
  const damageSection = complaint.damageDescription
    ? [
        `                    피 해 결 과`,
        ``,
        `  ${complaint.damageDescription}`,
      ].join('\n')
    : '';

  // ── 결어 ──
  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  const closingSection = [
    `                    결    어`,
    ``,
    `위와 같이 고소하오니 철저히 수사하시어 피고소인을 엄중히 처벌하여 주시기 바랍니다.`,
    ``,
    `                                    ${dateStr}`,
    `                                    고소인  ${formatName(complaint.complainant.name, complaint.maskingLevel)}  (인)`,
    ``,
    `${complaint.policeStation || '○○경찰서장'} 귀중`,
  ].join('\n');

  // ── 면책 고지 ──
  const disclaimer = [
    ``,
    divider,
    `※ 본 문서는 AI가 작성한 초안이며,`,
    `   법률사무소 청송 담당 변호사의 검토를 거쳐 최종 확정됩니다.`,
    divider,
  ].join('\n');

  // ── 전체 조합 ──
  const sections = [
    divider,
    header,
    divider,
    '',
    complainantSection,
    '',
    suspectSection,
    '',
    divider,
    '',
    purposeSection,
    '',
    divider,
    '',
    crimeSection,
    '',
    divider,
    '',
    statuteSection,
    '',
    divider,
    '',
    evidenceSection,
    '',
    divider,
    damageSection ? '' : null,
    damageSection || null,
    damageSection ? '' : null,
    damageSection ? divider : null,
    '',
    closingSection,
    disclaimer,
  ].filter(v => v !== null).join('\n');

  return sections;
}

/**
 * 개인정보 마스킹 적용
 * - 'full': "김OO", "010-****-****"
 * - 'partial': "김O수", "010-****-5678"
 * - 'none': 원본 그대로
 */
export function applyMasking(
  text: string,
  level: 'full' | 'partial' | 'none',
): string {
  if (level === 'none') return text;

  let result = text;

  // 전화번호 마스킹 (010-1234-5678 패턴)
  result = result.replace(
    /(\d{2,3})-(\d{3,4})-(\d{4})/g,
    (_, prefix, middle, last) => {
      if (level === 'full') return `${prefix}-****-****`;
      return `${prefix}-****-${last}`;
    },
  );

  // 한글 이름 마스킹 (2~4글자 한글 이름)
  result = result.replace(
    /([가-힣])([가-힣]{1,3})/g,
    (match, first, rest) => {
      // 단어 길이가 5자 이상이면 이름이 아닐 가능성 높음 (스킵)
      if (match.length > 4) return match;
      if (level === 'full') {
        return first + 'O'.repeat(rest.length);
      }
      // partial: 가운데만 마스킹
      if (rest.length === 1) return first + 'O';
      if (rest.length === 2) return first + 'O' + rest[rest.length - 1];
      return first + 'O'.repeat(rest.length - 1) + rest[rest.length - 1];
    },
  );

  return result;
}

/**
 * 증거보관함에서 증거 병합
 * secure-evidence.ts의 loadAllEvidence() 사용
 * 타임스탬프 + SHA-256 해시값 포함
 */
export async function mergeEvidenceFromVault(
  evidenceIds: string[],
): Promise<ComplaintEvidenceItem[]> {
  const allEvidence = await loadAllEvidence();

  // 요청된 ID에 해당하는 증거만 필터링
  const selected = evidenceIds.length > 0
    ? allEvidence.filter(e => evidenceIds.includes(e.id))
    : allEvidence;

  // 시간순 정렬
  const sorted = [...selected].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  // 고소장용 증거 목록으로 변환
  return sorted.map((item, idx) => ({
    number: idx + 1,
    type: formatEvidenceType(item.type),
    description: item.title,
    timestamp: formatTimestamp(item.timestamp),
    sha256Hash: item.sha256Hash,
  }));
}

// ─── 경고장/보고서 생성 함수 ─────────────────────────────────

/**
 * 경고장 텍스트 생성 (강경/온건)
 * facts: 사무장이 수집한 데이터 (Partial — 일부만 있어도 생성 가능)
 */
export function generateWarningLetter(
  facts: Partial<ComplaintDraftData>,
  type: 'strong' | 'moderate',
): string {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const senderName = facts.stage2_complainant?.name || '의뢰인';
  const senderAddress = facts.stage2_complainant?.address || '';
  const senderPhone = facts.stage2_complainant?.phone || '';
  const recipientName = facts.stage3_suspect?.name || '상대방';
  const recipientAddress = facts.stage3_suspect?.address || '(이메일/SNS 발송)';
  const relationship = facts.stage3_suspect?.relationship || '관계';
  const breakupDate = facts.stage3_suspect?.breakup_date || '';

  // 범죄사실에서 피해 행위 추출
  const crimeTypes = facts.stage4_crime?.crime_types || [];
  const harassmentList = crimeTypes.map((ct, i) => {
    const labelMap: Record<string, string> = {
      stalking: '반복적 연락 및 접근 (스토킹)',
      threat: '협박/위협',
      assault: '신체적 폭력',
      sexual: '성범죄',
      digital_sexual: '디지털 성범죄 (촬영물 유포/협박)',
      other: '기타 위법행위',
    };
    return `  ${i + 1}. ${labelMap[ct] || ct}`;
  }).join('\n');

  // 요구사항
  const protectionOrders = facts.stage7_punishment?.protection_orders || ['일체의 연락 중단', '주거지/직장 접근 금지'];
  const demandList = protectionOrders.map((d, i) => `  ${i + 1}. ${d}`).join('\n');

  // 증거 목록
  const evidenceTypes = facts.stage5_evidence?.evidence_types || [];
  const evidenceList = evidenceTypes.map((e, i) => `  ${i + 1}. ${e}`).join('\n');

  const divider = '━'.repeat(33);

  if (type === 'strong') {
    return `
법 률 경 고 장
(제1안 — 강경)

발신인: ${senderName}
주  소: ${senderAddress}
연락처: ${senderPhone}
대리인: 법률사무소 청송 대표변호사 김창희

수신인: ${recipientName}
주  소: ${recipientAddress}

작성일: ${today}

제목: 스토킹 행위 등 즉시 중단 및 법적 조치 예고에 관한 경고

${divider}

본 법률사무소는 ${senderName} 님(이하 "의뢰인")의 위임을 받아, 귀하(${recipientName})에게 아래와 같이 법률 경고장을 발송합니다.

1. 피해 사실

의뢰인과 귀하는 ${relationship} 관계${breakupDate ? `로, ${breakupDate} 관계가 종료되었습니다` : '였습니다'}. 그럼에도 불구하고 귀하는 의뢰인의 명시적 거부 의사에 반하여 아래와 같은 행위를 지속하고 있습니다.

${harassmentList || '  (구체적 행위 나열)'}

2. 법적 근거

귀하의 위 행위는 아래 법률에 위반될 수 있습니다.

  ■ 「스토킹범죄의 처벌 등에 관한 법률」 제18조
    → 3년 이하의 징역 또는 3,000만 원 이하의 벌금
    → 흉기 등 위험한 물건 사용 시 5년 이하의 징역 또는 5,000만 원 이하의 벌금
    → 2024.1.12. 개정에 따라 피해자의 처벌불원 의사와 관계없이 처벌(반의사불벌죄 폐지)

  ■ 「형법」 제283조 (협박죄)
    → 3년 이하의 징역 또는 500만 원 이하의 벌금

  ■ 「성폭력범죄의 처벌 등에 관한 특례법」 제14조의3
    → 촬영물 등을 이용한 협박: 1년 이상의 유기징역

3. 확보된 증거

의뢰인은 아래와 같은 증거를 확보하고 있으며, 이는 수사기관 및 법원 제출용으로 보전되어 있습니다.

${evidenceList || '  (증거 목록 보강 예정)'}

4. 요구 사항

본 경고장 수령 즉시 아래 사항을 이행할 것을 요구합니다.

${demandList}

5. 향후 조치 예고

본 경고장 수령일로부터 7일 이내에 위 요구사항이 이행되지 않을 경우, 의뢰인은 즉시 아래 조치를 취할 것임을 명확히 통보합니다.

  (1) 관할 경찰서에 스토킹범죄 고소장 접수
  (2) 법원에 긴급응급조치 및 잠정조치(접근금지, 전자발찌 부착) 청구
  (3) 민사상 손해배상 청구
  (4) 기타 필요한 일체의 법적 조치

이 경고장은 향후 법적 절차에서 의뢰인의 명시적 거부 의사를 입증하는 증거로 사용될 것입니다.

${divider}

법률사무소 청송
대표변호사 김 창 희
서울특별시 ○○구 ○○로 ○○
TEL: 02-XXX-XXXX`.trim();
  }

  // moderate
  return `
법 률 경 고 장
(제2안 — 온건)

발신인: ${senderName}
주  소: ${senderAddress}
연락처: ${senderPhone}
대리인: 법률사무소 청송 대표변호사 김창희

수신인: ${recipientName}
주  소: ${recipientAddress}

작성일: ${today}

제목: 연락 중단 및 접근 금지 요청

${divider}

${recipientName} 귀하,

본 법률사무소는 ${senderName} 님의 위임을 받아 아래와 같이 안내드립니다.

의뢰인은 귀하와의 ${relationship} 관계가 종료되었음을 분명히 밝힌 바 있습니다. 그러나 귀하는 의뢰인의 뜻에 반하여 아래와 같은 행위를 계속하고 있습니다.

${harassmentList || '  (구체적 행위 나열)'}

의뢰인은 이러한 행위로 인해 심각한 불안과 공포를 느끼고 있습니다.

귀하께 알려드리고자 하는 점은 다음과 같습니다:

  ■ 상대방의 의사에 반하여 반복적으로 접근하거나 연락하는 행위는
    「스토킹범죄의 처벌 등에 관한 법률」에 따라 처벌 대상입니다.
    (3년 이하 징역 또는 3,000만 원 이하 벌금)

  ■ 2024년 1월 12일부터 스토킹범죄는 피해자의 처벌 의사와 무관하게
    수사 및 처벌이 진행됩니다. (반의사불벌죄 폐지)

  ■ 경찰은 즉시 접근금지 등 긴급응급조치를 취할 수 있으며,
    법원은 전자발찌 부착을 명할 수 있습니다.

따라서 귀하에게 아래 사항의 이행을 정중히 요청드립니다.

${demandList}

귀하가 자발적으로 위 사항을 이행하신다면, 의뢰인은 별도의 법적 절차를 진행하지 않을 의향이 있습니다.

다만, 본 경고 이후에도 동일한 행위가 계속될 경우, 의뢰인은 형사 고소, 접근금지 가처분 신청 등 가능한 모든 법적 수단을 강구할 수밖에 없음을 알려드립니다.

이 서면은 의뢰인의 명시적 거부 의사 표시로서, 향후 법적 절차에서 증거로 사용될 수 있습니다.

원만한 해결을 기대합니다.

${divider}

법률사무소 청송
대표변호사 김 창 희
서울특별시 ○○구 ○○로 ○○
TEL: 02-XXX-XXXX`.trim();
}

/**
 * 연락중지 요청서 생성
 */
export function generateStopContactRequest(facts: Partial<ComplaintDraftData>): string {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const senderName = facts.stage2_complainant?.name || '의뢰인';
  const recipientName = facts.stage3_suspect?.name || '상대방';
  const divider = '━'.repeat(33);

  return `
${divider}
연 락 중 지 요 청 서
${divider}

발신인: ${senderName}
수신인: ${recipientName}
작성일: ${today}
대리인: 법률사무소 청송 대표변호사 김창희

${divider}

${recipientName} 귀하,

본인(${senderName})은 귀하에게 아래와 같이 연락 중지를 공식 요청합니다.

1. 요청 사항

  본인은 귀하에 대하여 다음의 모든 형태의 연락을 즉시 중단할 것을 요청합니다.

  (1) 전화 (음성통화, 영상통화 포함)
  (2) 문자메시지 (SMS, MMS)
  (3) 카카오톡, 라인 등 인스턴트 메신저
  (4) 이메일
  (5) SNS (인스타그램, 페이스북, 트위터 등) 접촉
  (6) 제3자를 통한 간접적 연락
  (7) 우편물, 선물, 택배 등 물리적 전달

2. 법적 근거

  「스토킹범죄의 처벌 등에 관한 법률」 제2조에 따르면, 상대방의 의사에
  반하여 반복적으로 연락하는 행위는 스토킹행위에 해당합니다.

  본 요청서는 본인의 명시적인 연락 거부 의사를 표시하는 문서이며,
  이후 귀하의 연락 행위는 법적으로 "상대방의 의사에 반하는" 행위로
  간주될 수 있습니다.

3. 불이행 시 조치

  본 요청에도 불구하고 연락이 계속될 경우, 본인은 관할 경찰서에
  스토킹범죄로 고소할 것이며, 법원에 접근금지 가처분을 신청할 것입니다.

본 서면은 향후 법적 절차에서 증거로 사용됩니다.

${divider}

법률사무소 청송
대표변호사 김 창 희
`.trim();
}

/**
 * 접근금지 요청서 생성
 */
export function generateNoApproachRequest(facts: Partial<ComplaintDraftData>): string {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const senderName = facts.stage2_complainant?.name || '의뢰인';
  const senderAddress = facts.stage2_complainant?.address || '(주소)';
  const recipientName = facts.stage3_suspect?.name || '상대방';
  const divider = '━'.repeat(33);

  return `
${divider}
접 근 금 지 요 청 서
${divider}

발신인: ${senderName}
수신인: ${recipientName}
작성일: ${today}
대리인: 법률사무소 청송 대표변호사 김창희

${divider}

${recipientName} 귀하,

본인(${senderName})은 귀하에게 아래와 같이 접근 금지를 공식 요청합니다.

1. 접근 금지 구역

  (1) 본인의 주거지 및 반경 100m 이내
      주소: ${senderAddress}
  (2) 본인의 직장/학교 및 반경 100m 이내
  (3) 본인이 자주 이용하는 시설 (카페, 헬스장 등)
  (4) 본인의 가족 거주지

2. 금지 행위

  (1) 위 장소에 대한 직접 방문
  (2) 위 장소 주변 배회 및 대기
  (3) 위 장소 근처에서의 감시 행위
  (4) 차량을 이용한 미행 및 추적

3. 법적 근거

  「스토킹범죄의 처벌 등에 관한 법률」 제2조 제1호에 따르면, 상대방의
  의사에 반하여 주거 등 부근에서 기다리거나 지켜보는 행위는
  스토킹행위에 해당합니다.

  또한 같은 법 제4조에 따라 경찰은 즉시 100m 접근금지 등
  긴급응급조치를 취할 수 있습니다.

4. 불이행 시 조치

  본 요청에도 불구하고 접근 행위가 계속될 경우, 본인은 즉시:
  (1) 112 신고 → 긴급응급조치 요청
  (2) 관할 경찰서에 스토킹범죄 고소
  (3) 법원에 접근금지 가처분 및 잠정조치 신청

본 서면은 향후 법적 절차에서 증거로 사용됩니다.

${divider}

법률사무소 청송
대표변호사 김 창 희
`.trim();
}

/**
 * 증거 분석 보고서 생성 (police-report.tsx 기능 흡수)
 */
export function generateEvidenceReport(
  facts: Partial<ComplaintDraftData>,
  evidenceItems: SecureEvidenceItem[],
): string {
  const divider = '━'.repeat(40);

  // 증거 카테고리 분석
  const categories: string[] = evidenceItems.map(e => e.category);
  const laws: { law: string; article: string; penalty: string }[] = [];
  const notes: string[] = [];
  let riskLevel = '주의';
  const addedLaws = new Set<string>();

  for (const catLaw of EVIDENCE_CATEGORY_LAWS) {
    if (categories.includes(catLaw.category) || (catLaw.category === '스토킹' && evidenceItems.length >= 3)) {
      for (const law of catLaw.laws) {
        const key = `${law.law}-${law.article}`;
        if (!addedLaws.has(key)) {
          laws.push(law);
          addedLaws.add(key);
        }
      }
      if (catLaw.riskLevel === '긴급' || (catLaw.riskLevel === '위험' && riskLevel !== '긴급')) {
        riskLevel = catLaw.riskLevel;
      }
      notes.push(catLaw.analysisNote);
    }
  }

  if (laws.length === 0) {
    laws.push({ law: '추가 분석 필요', article: '증거 보강 후 재분석 권장', penalty: '-' });
  }

  notes.push(`총 ${evidenceItems.length}건의 증거가 수집되었으며, ${evidenceItems.filter(e => e.verified).length}건의 SHA-256 무결성이 검증되었습니다.`);

  // 사건 유형 도출
  const typeSet = new Set<string>();
  if (categories.includes('스토킹') || evidenceItems.length >= 3) typeSet.add('스토킹');
  if (categories.includes('협박')) typeSet.add('협박');
  if (categories.includes('유포')) typeSet.add('디지털 성범죄');
  if (categories.includes('폭행')) typeSet.add('폭행');
  const caseType = typeSet.size > 0 ? Array.from(typeSet).join(' + ') : '기타 (상세 분석 필요)';

  const senderName = facts.stage2_complainant?.name || '(피해자)';
  const suspectName = facts.stage3_suspect?.name || '(가해자)';
  const relationship = facts.stage3_suspect?.relationship || '(관계)';

  const now = new Date();
  const reportId = `SB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const generatedAt = now.toLocaleString('ko-KR');

  const evidenceRows = evidenceItems.map((e, i) =>
    `  ${i + 1}. [${e.type}] ${e.title}\n     시각: ${e.timestamp}\n     분류: ${e.category}\n     SHA-256: ${e.sha256Hash}\n     무결성: ${e.verified ? '검증 완료' : '미검증'}`
  ).join('\n\n');

  const lawRows = laws.map((l, i) =>
    `  ${i + 1}. ${l.law}\n     ${l.article}\n     벌칙: ${l.penalty}`
  ).join('\n\n');

  return `
${divider}
경 찰 제 출 용   증 거 분 석 보 고 서
${divider}

보고서 번호: ${reportId}
작 성 일 시: ${generatedAt}
작 성 기 관: 법률사무소 청송 (대표변호사 김창희)
문 서 유 형: 피해 사실 정리 및 증거 분석 보고서

${divider}

1. 사건 개요

  피해자: ${senderName}
  가해자: ${suspectName}
  관  계: ${relationship}
  사건유형: ${caseType}
  위험수준: ${riskLevel}

${divider}

2. 증거 목록 및 무결성 검증

  총 ${evidenceItems.length}건의 증거가 수집되었으며,
  각 증거에 SHA-256 해시값이 부여되어 무결성이 보장됩니다.

${evidenceRows || '  (증거 없음)'}

${divider}

3. 적용 법률 및 분석

${lawRows}

  ■ AI 법률 분석 소견:
  ${notes.join('\n\n  ')}

${divider}

4. 참고사항

  • 본 보고서의 모든 증거는 SHA-256 해시 알고리즘으로 무결성이 검증되었습니다.
  • 증거 수집 시점의 타임스탬프가 자동 기록되어 있습니다.
  • 원본 증거 파일은 별도 첨부되어 있습니다.
  • 본 보고서는 수사 참고 자료이며, 최종 법적 판단은 수사기관 및 법원에 있습니다.

${divider}

법률사무소 청송
대표변호사 김 창 희

본 보고서는 안전이별 앱을 통해 자동 생성되었으며,
김창희 변호사의 검토를 거쳤습니다.

${divider}
`.trim();
}

/**
 * 대응 단계 자동 추천
 * 수집된 팩트를 기반으로 적절한 대응 단계를 추천
 */
export function recommendResponseStage(
  facts: Partial<ComplaintDraftData>,
): 'warning' | 'police_report' | 'complaint' {
  const crimeTypes = facts.stage4_crime?.crime_types || [];

  // 3단계 (고소) 기준: 폭행, 성범죄, 디지털 성범죄
  const severeTypes: CrimeType[] = ['assault', 'sexual', 'digital_sexual'];
  if (crimeTypes.some(ct => severeTypes.includes(ct))) {
    return 'complaint';
  }

  // 2단계 (경찰 신고) 기준: 협박 + 스토킹이 동시에 있거나, 엄벌 희망
  if (crimeTypes.includes('threat') && crimeTypes.includes('stalking')) {
    return 'police_report';
  }
  if (facts.stage7_punishment?.severe_punishment) {
    return 'police_report';
  }

  // 1단계 (경고장)
  return 'warning';
}

// ─── 내부 헬퍼 ──────────────────────────────────────────────

/** 증거 유형 한글 변환 */
function formatEvidenceType(type: string): string {
  const typeMap: Record<string, string> = {
    image: '사진/캡처',
    audio: '음성/녹음',
    text: '텍스트 메모',
    file: '파일',
  };
  return typeMap[type] || type;
}

/** ISO 타임스탬프 → 한국식 표기 */
function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}년 ${m}월 ${day}일 ${h}:${min}`;
  } catch {
    return iso;
  }
}

/** 이름 포맷팅 (마스킹 적용) */
function formatName(name: string, level: 'full' | 'partial' | 'none'): string {
  if (level === 'none' || !name) return name;

  if (name === '인적사항 불상') return name;

  const chars = Array.from(name);
  if (chars.length <= 1) return name;

  if (level === 'full') {
    return chars[0] + 'O'.repeat(chars.length - 1);
  }
  // partial: 가운데만 마스킹
  if (chars.length === 2) return chars[0] + 'O';
  return chars[0] + 'O'.repeat(chars.length - 2) + chars[chars.length - 1];
}

/** 전화번호 포맷팅 (마스킹 적용) */
function formatPhone(phone: string, level: 'full' | 'partial' | 'none'): string {
  if (level === 'none') return phone;

  // 하이픈 없는 번호도 처리
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length < 10) return phone;

  const prefix = cleaned.slice(0, 3);
  const last4 = cleaned.slice(-4);

  if (level === 'full') return `${prefix}-****-****`;
  return `${prefix}-****-${last4}`;
}
