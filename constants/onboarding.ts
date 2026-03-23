// 온보딩 상수 — 트라우마 인폼드 디자인
import { Ionicons } from '@expo/vector-icons';

export const SAFETY_CHECK = {
  question: '지금 안전한 곳에 계신가요?',
  safeAnswer: '네, 안전해요',
  unsafeAnswer: '지금 위험해요',
  safeEmoji: '🛡️',
  unsafeEmoji: '🚨',
};

export const SOS_NUMBERS = [
  { label: '경찰 신고', number: '112', color: '#e85d4a' },
  { label: '여성긴급전화', number: '1366', color: '#c9a84c' },
];

export const QUICK_GUIDE_CARDS: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}[] = [
  {
    icon: 'chatbubble-outline',
    title: 'AI 사무장이 상황을 파악합니다',
    description: '따뜻하게 공감하며 사실관계를 정리합니다',
  },
  {
    icon: 'person-outline',
    title: '변호사가 직접 검토합니다',
    description: '김창희 변호사가 최적의 법적 대응을 안내합니다',
  },
  {
    icon: 'shield-outline',
    title: '안전한 이별을 함께 준비합니다',
    description: '증거 수집부터 법적 조치까지 한번에',
  },
];
