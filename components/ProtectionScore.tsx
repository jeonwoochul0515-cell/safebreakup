import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import type { ProtectionScoreResult, ProtectionLevel } from '@/lib/protection-score';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ProtectionScoreProps {
  score: ProtectionScoreResult;
  onActionPress?: () => void;
}

// ─── 레벨별 색상 매핑 ──────────────────────────────────────────────────────

const LEVEL_COLORS: Record<ProtectionLevel, string> = {
  danger: COLORS.danger,
  warning: COLORS.warning,
  caution: '#D4B846',   // 노란 계열 (주의)
  safe: COLORS.success,
};

const LEVEL_LABELS: Record<ProtectionLevel, string> = {
  danger: '위험',
  warning: '경고',
  caution: '주의',
  safe: '안전',
};

const LEVEL_ICONS: Record<ProtectionLevel, keyof typeof Ionicons.glyphMap> = {
  danger: 'alert-circle',
  warning: 'warning',
  caution: 'information-circle',
  safe: 'checkmark-circle',
};

// ─── 영역 라벨 ─────────────────────────────────────────────────────────────

interface BreakdownItem {
  key: 'evidence' | 'checklist' | 'safetyPlan' | 'legalAction';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  max: number;
}

const BREAKDOWN_ITEMS: BreakdownItem[] = [
  { key: 'evidence', label: '증거 수집', icon: 'folder', max: 25 },
  { key: 'checklist', label: '체크리스트', icon: 'checkbox', max: 25 },
  { key: 'safetyPlan', label: '안전 계획', icon: 'shield-checkmark', max: 25 },
  { key: 'legalAction', label: '법적 조치', icon: 'document-text', max: 25 },
];

// ─── 원형 프로그레스 (View 기반) ────────────────────────────────────────────

const CIRCLE_SIZE = 160;
const STROKE_WIDTH = 12;

function CircularProgress({ total, level }: { total: number; level: ProtectionLevel }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const color = LEVEL_COLORS[level];

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: total,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [total]);

  // 왼쪽 반원 회전 (0~50점 → 0~180도)
  const leftRotation = animValue.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ['0deg', '180deg', '180deg'],
    extrapolate: 'clamp',
  });

  // 오른쪽 반원 회전 (50~100점 → 0~180도)
  const rightRotation = animValue.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ['0deg', '0deg', '180deg'],
    extrapolate: 'clamp',
  });

  return (
    <View style={circleStyles.container}>
      {/* 배경 원 */}
      <View style={[circleStyles.background, { borderColor: COLORS.borderLight }]} />

      {/* 왼쪽 반원 (0~50%) */}
      <View style={circleStyles.halfClipLeft}>
        <Animated.View
          style={[
            circleStyles.halfCircle,
            { borderColor: color, transform: [{ rotate: leftRotation }] },
          ]}
        />
      </View>

      {/* 오른쪽 반원 (50~100%) */}
      <View style={circleStyles.halfClipRight}>
        <Animated.View
          style={[
            circleStyles.halfCircle,
            { borderColor: color, transform: [{ rotate: rightRotation }] },
          ]}
        />
      </View>

      {/* 중앙 텍스트 */}
      <View style={circleStyles.center}>
        <Text style={[circleStyles.scoreNumber, { color }]}>{total}</Text>
        <Text style={circleStyles.scoreLabel}>/ 100</Text>
      </View>
    </View>
  );
}

const circleStyles = StyleSheet.create({
  container: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: STROKE_WIDTH,
  },
  halfClipLeft: {
    position: 'absolute',
    width: CIRCLE_SIZE / 2,
    height: CIRCLE_SIZE,
    left: 0,
    overflow: 'hidden',
  },
  halfClipRight: {
    position: 'absolute',
    width: CIRCLE_SIZE / 2,
    height: CIRCLE_SIZE,
    right: 0,
    overflow: 'hidden',
  },
  halfCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: STROKE_WIDTH,
    borderColor: 'transparent',
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    marginTop: -2,
  },
});

// ─── 가로 바 차트 항목 ─────────────────────────────────────────────────────

function BreakdownBar({ item, value, color }: { item: BreakdownItem; value: number; color: string }) {
  const animWidth = useRef(new Animated.Value(0)).current;
  const percentage = (value / item.max) * 100;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const widthInterpolation = animWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={barStyles.row}>
      <View style={barStyles.labelRow}>
        <Ionicons name={item.icon} size={16} color={COLORS.slate} />
        <Text style={barStyles.label}>{item.label}</Text>
        <Text style={barStyles.valueText}>
          {value} / {item.max}
        </Text>
      </View>
      <View style={barStyles.track}>
        <Animated.View
          style={[
            barStyles.fill,
            { width: widthInterpolation, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    marginBottom: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  valueText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
});

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────

export default function ProtectionScore({ score, onActionPress }: ProtectionScoreProps) {
  const color = LEVEL_COLORS[score.level];
  const levelLabel = LEVEL_LABELS[score.level];
  const levelIcon = LEVEL_ICONS[score.level];

  return (
    <View style={styles.container}>
      {/* 원형 프로그레스 + 레벨 뱃지 */}
      <View style={styles.circleSection}>
        <CircularProgress total={score.total} level={score.level} />
        <View style={[styles.levelBadge, { backgroundColor: color + '20' }]}>
          <Ionicons name={levelIcon} size={18} color={color} />
          <Text style={[styles.levelText, { color }]}>{levelLabel}</Text>
        </View>
      </View>

      {/* 4가지 항목 가로 바 차트 */}
      <View style={styles.breakdownSection}>
        {BREAKDOWN_ITEMS.map((item) => (
          <BreakdownBar
            key={item.key}
            item={item}
            value={score.breakdown[item.key]}
            color={color}
          />
        ))}
      </View>

      {/* 다음 행동 카드 */}
      <TouchableOpacity
        style={styles.actionCard}
        onPress={onActionPress}
        activeOpacity={0.7}
        disabled={!onActionPress}
      >
        <View style={styles.actionIconContainer}>
          <Ionicons name="arrow-forward-circle" size={24} color={COLORS.gold} />
        </View>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>다음 행동</Text>
          <Text style={styles.actionDescription}>{score.nextAction}</Text>
        </View>
        {onActionPress && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.lightText} />
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── 스타일 ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW.md,
  },
  circleSection: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  levelText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  breakdownSection: {
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    lineHeight: FONT_SIZE.sm * 1.5,
  },
});
