import { Platform } from 'react-native';

// ─── 안전이별 디자인 시스템 v2 ──────────────────────────────────────────────
// 2030 여성 타겟 — 신뢰, 안정감, 따뜻함, 프리미엄
// Inspired by: 토스(금융 신뢰), 트로스트(심리 안정), 지그재그(여성 트렌디)
// ──────────────────────────────────────────────────────────────────────────────

export const COLORS = {
  // Primary — 따뜻한 다크톤 (보호·신뢰·전문성)
  navy: '#2D2B3D',          // 워밍 차콜 퍼플 (기존 차가운 네이비 → 따뜻한 다크)
  deepNavy: '#1E1C2E',      // 더 깊은 다크
  gold: '#C4956A',           // 로즈골드 (기존 옐로골드 → 여성스러운 로즈골드)
  goldLight: '#E0C4A8',      // 연한 로즈골드
  goldGradientStart: '#C4956A',
  goldGradientEnd: '#E0C4A8',

  // Backgrounds — 부드럽고 따뜻한 톤
  cream: '#FAF7F5',          // 워밍 오프화이트 (기존 누런 크림 → 깨끗한 워밍톤)
  warmWhite: '#FFFFFF',      // 퓨어 화이트
  cardBg: '#FFFFFF',         // 카드 배경
  borderLight: '#F0EBE6',    // 부드러운 테두리

  // Accent — 차분하고 세련된 포인트
  coral: '#E07A5F',          // 소프트 코랄 (기존 강렬한 빨강 → 차분한 테라코타)
  coralDark: '#C4634B',
  coralLight: '#F0A08C',
  sage: '#7A9E7E',           // 세이지 그린 (유지 — 안전·치유)
  sageLight: '#B5D1B8',
  blue: '#6B8CC7',           // 소프트 블루 (기존 강한 파랑 → 차분한 블루)
  blueLight: '#9BB4DB',

  // Text — 따뜻한 다크 계열
  darkText: '#3A3541',       // 워밍 다크그레이 (순수 검정X)
  lightText: '#9B95A5',      // 부드러운 라벤더 그레이
  slate: '#7A7584',          // 중간 톤
  white: '#ffffff',
  black: '#000000',

  // Functional — 부드러운 알림 톤
  success: '#7A9E7E',
  warning: '#D4A373',
  danger: '#E07A5F',
  info: '#6B8CC7',

  // Stealth mode (Calculator)
  stealthBg: '#1c1c1e',
  stealthText: '#ffffff',
  stealthButton: '#333333',
  stealthButtonOrange: '#ff9f0a',

  // Overlay
  overlay: 'rgba(45,43,61,0.7)',     // 따뜻한 오버레이
  overlayLight: 'rgba(45,43,61,0.3)',

  // Kakao
  kakaoYellow: '#FEE500',
  kakaoBrown: '#3C1E1E',

  // Subscription tier
  tierFree: '#7A9E7E',
  tierPaid: '#C4956A',
  tierPremium: '#9B7EC8',    // 소프트 퍼플 (기존 비비드 → 차분)

  // 추가 — v2 신규 색상
  blush: '#F5E6E0',          // 연한 블러시 핑크 (하이라이트)
  lavender: '#E8E4F0',       // 라벤더 (서브 배경)
  warmGray: '#F5F3F1',       // 따뜻한 그레이 배경
  plum: '#8B6F8E',           // 플럼 (액센트)
};

export const Colors = {
  light: {
    text: COLORS.darkText,
    background: COLORS.cream,
    tint: COLORS.gold,
    icon: COLORS.slate,
    tabIconDefault: COLORS.slate,
    tabIconSelected: COLORS.gold,
    card: COLORS.cardBg,
    border: COLORS.borderLight,
    header: COLORS.navy,
    headerText: COLORS.white,
  },
  dark: {
    text: COLORS.white,
    background: COLORS.deepNavy,
    tint: COLORS.goldLight,
    icon: COLORS.lightText,
    tabIconDefault: COLORS.lightText,
    tabIconSelected: COLORS.goldLight,
    card: COLORS.navy,
    border: '#3D3A4F',
    header: COLORS.deepNavy,
    headerText: COLORS.white,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'Roboto',
    mono: 'monospace',
  },
  default: {
    sans: "'Noto Sans KR', system-ui, -apple-system, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'Noto Sans KR', system-ui, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  web: {
    sans: "'Noto Sans KR', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Noto Serif KR', 'Times New Roman', serif",
    rounded: "'Noto Sans KR', system-ui, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Spacing scale (4px base) — 더 여유로운 간격
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius — 더 부드러운 곡선
export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

// Font sizes — 가독성 강화
export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 21,
  xxl: 26,
  hero: 34,
};

// Shadow presets — 더 부드럽고 넓은 그림자
export const SHADOW = {
  sm: {
    shadowColor: '#2D2B3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D2B3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2D2B3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
};
