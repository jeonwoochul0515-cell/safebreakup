// 가스라이팅 감지 모듈 상수

export const GASLIGHTING_TACTICS = [
  {
    key: 'denial',
    name: '현실 부정',
    icon: 'close-circle',
    color: '#C4634B',
    description: '실제로 일어난 일을 부정하며, 당신이 겪은 경험 자체를 없던 일로 만듭니다.',
    examples: ['"그런 일은 없었어"', '"네가 상상한 거야"', '"내가 언제 그랬어?"'],
  },
  {
    key: 'trivializing',
    name: '감정 무시',
    icon: 'thumbs-down',
    color: '#E07A5F',
    description: '당신의 감정과 반응을 과장되었다고 치부하며, 정당한 감정을 무시합니다.',
    examples: ['"너무 예민하게 구는 거야"', '"별것도 아닌 걸로 왜 그래"', '"그냥 농담이었잖아"'],
  },
  {
    key: 'withholding',
    name: '대화 거부',
    icon: 'volume-mute',
    color: '#D4A373',
    description: '대화 자체를 거부하거나, 이해하지 못하는 척하며 소통을 차단합니다.',
    examples: ['"무슨 소리야, 이해를 못하겠네"', '"또 시작이야? 나 바빠"', '"대화할 가치가 없어"'],
  },
  {
    key: 'diverting',
    name: '화제 전환',
    icon: 'arrow-redo',
    color: '#6B8CC7',
    description: '문제를 직면하는 대신 화제를 돌리거나, 당신의 신뢰성을 공격합니다.',
    examples: ['"또 그 얘기야? 네 친구들이 시킨 거지?"', '"네 엄마가 그렇게 가르쳤구나"', '"인터넷에서 이상한 거 봤지?"'],
  },
  {
    key: 'countering',
    name: '기억 왜곡',
    icon: 'swap-horizontal',
    color: '#8B6F8E',
    description: '당신의 기억을 의심하게 만들어, 실제 있었던 일에 대한 확신을 흔듭니다.',
    examples: ['"네가 기억을 잘못하고 있는 거야"', '"그때 분위기는 전혀 그렇지 않았어"', '"넌 항상 기억을 왜곡해"'],
  },
  {
    key: 'isolation',
    name: '고립 유도',
    icon: 'people',
    color: '#C4634B',
    description: '주변 사람들과의 관계를 단절시켜, 당신이 오직 상대에게만 의존하게 만듭니다.',
    examples: ['"네 주변 사람들이 우리 사이를 이간질하는 거야"', '"그 친구는 너한테 나쁜 영향을 줘"', '"나만 널 진심으로 생각해"'],
  },
];

export const GASLIGHTING_TEST_QUESTIONS = [
  { id: 1, tactic: 'denial', question: '상대방과 다툰 후, 상대방이 "그런 적 없다"고 하면 내 기억을 의심하게 됩니다.' },
  { id: 2, tactic: 'trivializing', question: '내 감정을 표현하면 "예민하다", "과하다"는 반응을 듣습니다.' },
  { id: 3, tactic: 'withholding', question: '중요한 이야기를 하려 하면 상대방이 대화를 거부하거나 무시합니다.' },
  { id: 4, tactic: 'diverting', question: '문제를 제기하면 상대방이 다른 사람(친구, 가족) 탓으로 돌립니다.' },
  { id: 5, tactic: 'countering', question: '과거에 있었던 일에 대해 상대방과 기억이 다를 때, 내가 틀렸다고 느낍니다.' },
  { id: 6, tactic: 'isolation', question: '상대방이 내 친구나 가족을 부정적으로 이야기하여 관계가 소원해졌습니다.' },
  { id: 7, tactic: 'denial', question: '분명히 들은 말을 상대방이 "한 적 없다"고 하면 혼란스럽습니다.' },
  { id: 8, tactic: 'trivializing', question: '상대방의 행동으로 상처받았다고 하면 "농담도 못해?"라는 반응을 합니다.' },
  { id: 9, tactic: 'countering', question: '나의 판단력이나 기억력에 점점 자신이 없어집니다.' },
  { id: 10, tactic: 'isolation', question: '예전에 비해 만나는 사람이 줄었고, 주로 상대방과만 시간을 보냅니다.' },
  { id: 11, tactic: 'diverting', question: '상대방에게 문제를 이야기하면 오히려 내 잘못으로 돌아옵니다.' },
  { id: 12, tactic: 'withholding', question: '상대방이 며칠씩 무시하거나 냉전으로 대응하여 불안해집니다.' },
  { id: 13, tactic: 'denial', question: '"내가 미쳤나" 또는 "내가 이상한 건가"라는 생각을 자주 합니다.' },
  { id: 14, tactic: 'trivializing', question: '상대방 앞에서는 내 의견을 말하기 어렵습니다.' },
  { id: 15, tactic: 'isolation', question: '상대방이 없으면 아무것도 할 수 없다는 느낌이 듭니다.' },
];

export const GASLIGHTING_SCORE_LEVELS = [
  { key: 'minimal', label: '경미', range: [0, 15] as [number, number], color: '#7A9E7E', description: '가스라이팅 징후가 낮습니다. 하지만 불편한 감정이 있다면 주의를 기울여주세요.' },
  { key: 'moderate', label: '주의', range: [16, 30] as [number, number], color: '#D4A373', description: '가스라이팅 패턴이 감지됩니다. 관계 건강 저널을 시작하여 패턴을 기록해보세요.' },
  { key: 'severe', label: '심각', range: [31, 45] as [number, number], color: '#E07A5F', description: '심각한 가스라이팅이 진행되고 있을 수 있습니다. 전문 상담을 받아보세요.' },
  { key: 'extreme', label: '위험', range: [46, 60] as [number, number], color: '#C4634B', description: '지속적인 심리적 학대 상황일 수 있습니다. 당신의 감각은 정확합니다. 즉시 도움을 받으세요.' },
];

export const JOURNAL_PROMPTS = [
  { id: 1, prompt: '오늘 상대방과 나눈 대화 중 불편했던 순간이 있었나요? 어떤 말이 불편했나요?' },
  { id: 2, prompt: '최근 상대방의 말 때문에 내 기억이나 판단을 의심한 적이 있나요?' },
  { id: 3, prompt: '오늘 나의 감정은 어떤가요? 이 감정이 들게 된 구체적인 상황을 적어보세요.' },
  { id: 4, prompt: '상대방이 나에 대해 한 말 중, 사실이 아니라고 느끼는 것이 있나요?' },
  { id: 5, prompt: '최근 친구나 가족과의 관계에 변화가 있나요? 상대방이 영향을 미쳤나요?' },
  { id: 6, prompt: '상대방 앞에서 자유롭게 의견을 말할 수 있나요? 그렇지 않다면 왜 그런가요?' },
  { id: 7, prompt: '오늘 있었던 일 중 상대방과 기억이 다를 수 있는 일이 있나요? 지금 기억을 기록해두세요.' },
  { id: 8, prompt: '상대방과 함께 있을 때와 혼자 있을 때의 내 모습은 어떻게 다른가요?' },
  { id: 9, prompt: '내가 정말 원하는 것은 무엇인가요? 그것을 상대방에게 말할 수 있나요?' },
  { id: 10, prompt: '1년 전의 나와 지금의 나는 어떻게 달라졌나요? 어떤 변화가 불편한가요?' },
];
