// 위험도 정밀진단 — Campbell Danger Assessment 한국판 20문항
// 검토: 김창희 변호사 (법률사무소 청송)

export interface DangerQuestion {
  id: number;
  category: string;
  question: string;
  weight: number;
  helpText: string;
  dangerSignal: boolean;
}

export interface RiskLevel {
  key: string;
  label: string;
  range: [number, number];
  color: string;
  emoji: string;
  description: string;
  recommendation: string;
}

export const DANGER_QUESTIONS: DangerQuestion[] = [
  { id: 1, category: '목졸림', question: '상대방이 당신의 목을 조르거나 숨을 못 쉬게 한 적이 있습니까?', weight: 5, helpText: '목졸림은 살인의 가장 강력한 예측 인자입니다.', dangerSignal: true },
  { id: 2, category: '살해위협', question: '상대방이 당신을 죽이겠다고 위협한 적이 있습니까?', weight: 5, helpText: '직접적 또는 암시적 살해 위협 모두 포함됩니다.', dangerSignal: true },
  { id: 3, category: '무기접근', question: '상대방이 칼, 흉기 등 위험한 물건을 소지하거나 위협에 사용한 적이 있습니까?', weight: 5, helpText: '흉기 사용 위협은 실제 행동으로 이어질 가능성이 높습니다.', dangerSignal: true },
  { id: 4, category: '폭력 에스컬레이션', question: '지난 1년간 폭력의 빈도나 심각성이 증가했습니까?', weight: 4, helpText: '폭력이 점점 심해지는 것은 매우 위험한 신호입니다.', dangerSignal: true },
  { id: 5, category: '강제 성관계', question: '상대방이 당신의 의사에 반하여 성관계를 강요한 적이 있습니까?', weight: 4, helpText: '성적 강압은 그 자체로 범죄이며 위험도를 높입니다.', dangerSignal: true },
  { id: 6, category: '집착/질투', question: '상대방이 병적으로 질투하거나 당신의 모든 행동을 통제하려 합니까?', weight: 3, helpText: '"넌 내 거야"와 같은 소유욕적 발언을 포함합니다.', dangerSignal: false },
  { id: 7, category: '스토킹', question: '상대방이 당신을 미행하거나, 감시하거나, 반복적으로 연락합니까?', weight: 4, helpText: '헤어진 후에도 지속되는 접촉 시도를 포함합니다.', dangerSignal: true },
  { id: 8, category: '약물/음주', question: '상대방이 술이나 약물에 문제가 있습니까?', weight: 3, helpText: '음주/약물 문제는 폭력 위험을 크게 높입니다.', dangerSignal: false },
  { id: 9, category: '통제행동', question: '상대방이 당신의 휴대폰, SNS, 외출, 친구관계를 통제합니까?', weight: 3, helpText: '일상을 통제하는 것은 강압적 통제의 핵심 징후입니다.', dangerSignal: false },
  { id: 10, category: '고립', question: '상대방이 당신을 가족이나 친구로부터 고립시킵니까?', weight: 3, helpText: '지원 네트워크를 차단하는 것은 위험을 높이는 행동입니다.', dangerSignal: false },
  { id: 11, category: '경제적 통제', question: '상대방이 당신의 돈, 직업, 경제활동을 통제합니까?', weight: 2, helpText: '경제적 학대는 탈출을 어렵게 만드는 핵심 수단입니다.', dangerSignal: false },
  { id: 12, category: '자녀 위협', question: '상대방이 자녀를 이용하여 위협하거나 자녀에게 해를 가한 적이 있습니까?', weight: 4, helpText: '자녀를 볼모로 삼는 행동은 매우 위험합니다.', dangerSignal: true },
  { id: 13, category: '폭력 에스컬레이션', question: '상대방이 물건을 던지거나 부수는 등 재물을 파괴한 적이 있습니까?', weight: 2, helpText: '물건에 대한 폭력은 사람에 대한 폭력으로 이어질 수 있습니다.', dangerSignal: false },
  { id: 14, category: '자살 위협', question: '상대방이 자살하겠다고 위협한 적이 있습니까?', weight: 3, helpText: '자살 위협은 상대를 통제하려는 수단일 수 있으며, 동반자살 위험이 있습니다.', dangerSignal: true },
  { id: 15, category: '이별 시 위험', question: '이별을 시도했을 때 폭력이 더 심해진 적이 있습니까?', weight: 5, helpText: '이별 시도 후 1개월이 가장 위험한 시기입니다.', dangerSignal: true },
  { id: 16, category: '신체적 폭력', question: '상대방이 당신을 때리거나, 밀거나, 발로 찬 적이 있습니까?', weight: 3, helpText: '어떤 형태의 신체적 폭력이든 심각하게 받아들여야 합니다.', dangerSignal: false },
  { id: 17, category: '디지털 폭력', question: '상대방이 당신의 사적인 사진/영상을 유포하겠다고 위협한 적이 있습니까?', weight: 4, helpText: '디지털 성범죄 위협은 그 자체로 범죄입니다 (성폭력처벌법 14조의3).', dangerSignal: true },
  { id: 18, category: '보호명령 위반', question: '상대방이 과거 접근금지명령이나 보호명령을 위반한 적이 있습니까?', weight: 5, helpText: '법적 명령을 무시하는 것은 극도로 위험한 신호입니다.', dangerSignal: true },
  { id: 19, category: '집착/질투', question: '상대방이 "네가 떠나면 아무도 못 만나게 하겠다"는 식의 말을 한 적이 있습니까?', weight: 4, helpText: '소유욕적 발언은 분리 후 폭력의 강력한 예측 인자입니다.', dangerSignal: true },
  { id: 20, category: '직감', question: '당신은 상대방이 자신을 심각하게 해칠 수 있다고 느낍니까?', weight: 3, helpText: '당신의 직감을 믿으세요. 피해자의 위험 인지는 매우 정확합니다.', dangerSignal: false },
];

export const RISK_LEVELS: RiskLevel[] = [
  {
    key: 'safe',
    label: '저위험',
    range: [0, 15],
    color: '#7A9E7E',
    emoji: '🟢',
    description: '현재 즉각적인 위험 징후는 낮은 수준입니다.',
    recommendation: '하지만 불안감이 있다면 전문 상담을 받아보세요. 안전이별 체크리스트를 확인해두는 것도 좋습니다.',
  },
  {
    key: 'caution',
    label: '경계',
    range: [16, 30],
    color: '#D4A373',
    emoji: '🟡',
    description: '주의가 필요한 위험 요소가 감지되었습니다.',
    recommendation: '안전계획을 세우고, 신뢰할 수 있는 사람에게 상황을 알려주세요. 증거를 안전하게 보관하세요.',
  },
  {
    key: 'danger',
    label: '위험',
    range: [31, 50],
    color: '#E07A5F',
    emoji: '🟠',
    description: '심각한 위험 요소가 다수 감지되었습니다.',
    recommendation: '즉시 안전계획을 수립하고, 변호사 상담을 받으세요. 혼자 이별을 시도하지 마세요.',
  },
  {
    key: 'extreme',
    label: '긴급',
    range: [51, 100],
    color: '#C4634B',
    emoji: '🔴',
    description: '생명에 위협이 될 수 있는 극도로 위험한 상황입니다.',
    recommendation: '지금 즉시 안전한 장소로 대피하고, 112(경찰) 또는 1366(여성긴급전화)에 연락하세요.',
  },
];

export const DANGER_CATEGORIES = [
  { key: '목졸림', icon: 'alert-circle', color: '#C4634B' },
  { key: '살해위협', icon: 'warning', color: '#C4634B' },
  { key: '무기접근', icon: 'shield', color: '#E07A5F' },
  { key: '폭력 에스컬레이션', icon: 'trending-up', color: '#E07A5F' },
  { key: '강제 성관계', icon: 'close-circle', color: '#C4634B' },
  { key: '집착/질투', icon: 'eye', color: '#D4A373' },
  { key: '스토킹', icon: 'locate', color: '#E07A5F' },
  { key: '약물/음주', icon: 'wine', color: '#D4A373' },
  { key: '통제행동', icon: 'lock-closed', color: '#D4A373' },
  { key: '고립', icon: 'people', color: '#D4A373' },
  { key: '경제적 통제', icon: 'card', color: '#6B8CC7' },
  { key: '자녀 위협', icon: 'heart-dislike', color: '#E07A5F' },
  { key: '자살 위협', icon: 'alert', color: '#E07A5F' },
  { key: '이별 시 위험', icon: 'exit', color: '#C4634B' },
  { key: '신체적 폭력', icon: 'hand-left', color: '#E07A5F' },
  { key: '디지털 폭력', icon: 'phone-portrait', color: '#8B6F8E' },
  { key: '보호명령 위반', icon: 'document-text', color: '#C4634B' },
  { key: '직감', icon: 'heart', color: '#D4A373' },
];

// 강압적 통제 평가 (CCB 기반 간소화 10문항)
export interface CoerciveControlQuestion {
  id: number;
  category: string;
  question: string;
  examples: string[];
}

export const COERCIVE_CONTROL_CATEGORIES = [
  { key: '신체적 학대', icon: 'hand-left', color: '#C4634B' },
  { key: '성적 학대', icon: 'close-circle', color: '#E07A5F' },
  { key: '경제적 학대', icon: 'card', color: '#6B8CC7' },
  { key: '고립', icon: 'people', color: '#D4A373' },
  { key: '협박/위협', icon: 'warning', color: '#E07A5F' },
  { key: '감정적 학대', icon: 'sad', color: '#8B6F8E' },
];

export const COERCIVE_CONTROL_QUESTIONS: CoerciveControlQuestion[] = [
  { id: 1, category: '신체적 학대', question: '상대방이 화가 나면 물건을 던지거나 부수나요?', examples: ['벽을 치거나 구멍을 냄', '당신의 물건을 부숨', '반려동물에게 해를 가함'] },
  { id: 2, category: '신체적 학대', question: '상대방이 당신의 몸에 직접적으로 힘을 가한 적이 있나요?', examples: ['밀기, 잡기, 꼬집기', '때리기, 발로 차기', '목 조르기'] },
  { id: 3, category: '성적 학대', question: '원하지 않는 성적 행위를 강요받은 적이 있나요?', examples: ['거부했는데 강요함', '잠든 사이 행위', '촬영 강요'] },
  { id: 4, category: '경제적 학대', question: '상대방이 당신의 돈이나 경제활동을 통제하나요?', examples: ['월급을 가져감', '지출을 일일이 보고하게 함', '일하지 못하게 함'] },
  { id: 5, category: '고립', question: '상대방이 가족이나 친구를 만나지 못하게 하나요?', examples: ['특정인과 연락 금지', '외출 시 허락 요구', '친구 관계를 비난'] },
  { id: 6, category: '고립', question: '상대방이 당신의 휴대폰이나 SNS를 감시하나요?', examples: ['카톡 검사', 'SNS 팔로잉 제한', '위치 추적'] },
  { id: 7, category: '협박/위협', question: '상대방이 당신을 위협하는 말이나 행동을 하나요?', examples: ['"떠나면 죽이겠다"', '"아이를 못 보게 하겠다"', '"사진을 퍼뜨리겠다"'] },
  { id: 8, category: '감정적 학대', question: '상대방이 당신을 지속적으로 비하하거나 모욕하나요?', examples: ['"넌 아무것도 못해"', '"네가 미쳤어"', '공개적 망신'] },
  { id: 9, category: '감정적 학대', question: '상대방이 당신의 기억이나 인식을 의심하게 만드나요?', examples: ['"그런 적 없어"', '"네가 과민한 거야"', '"아무도 안 믿을 거야"'] },
  { id: 10, category: '협박/위협', question: '이별을 언급하면 상대방이 극단적으로 반응하나요?', examples: ['자해/자살 위협', '극도의 분노', '보복 위협'] },
];
