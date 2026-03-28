import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';

const TRACK_STEPS = {
  self_protect: [
    '상황 파악',
    '증거 수집',
    '안전 계획',
    '전문가 상담',
    '지속 모니터링',
  ],
  warning_letter: [
    '사실관계 정리',
    '변호사 검토',
    '경고장 작성',
    '발송 완료',
    '수령 확인',
    '답변 대기',
    '후속 조치',
  ],
  complaint: [
    '증거 정리',
    '고소장 작성',
    '고소장 접수',
    '수사 진행',
    '검찰 송치',
    '기소 결정',
    '재판 진행',
    '판결/종결',
  ],
} as const;

type TrackType = keyof typeof TRACK_STEPS;

interface StatusTrackerProps {
  currentStatus: string;
  caseType?: TrackType;
  onStatusPress?: (status: string, index: number) => void;
}

function PulsingCircle() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.35, duration: 800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: COLORS.gold,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

export default function StatusTracker({ currentStatus, caseType = 'self_protect', onStatusPress }: StatusTrackerProps) {
  const steps = TRACK_STEPS[caseType] as readonly string[];
  const currentIndex = steps.indexOf(currentStatus);
  // If status not found, try mapping common values
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <View style={[styles.container, SHADOW.sm]}>
      {steps.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isCurrent = index === activeIndex;
        const isLast = index === steps.length - 1;

        return (
          <TouchableOpacity
            key={step}
            style={styles.stepRow}
            activeOpacity={onStatusPress ? 0.65 : 1}
            onPress={() => onStatusPress?.(step, index)}
            disabled={!onStatusPress}
          >
            {/* Left: circle + connecting line */}
            <View style={styles.leftColumn}>
              <View style={styles.circleWrapper}>
                {isCurrent && <PulsingCircle />}
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isCurrent && styles.circleCurrent,
                  ]}
                >
                  {isCompleted && (
                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                  )}
                </View>
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    (isCompleted) && styles.lineCompleted,
                  ]}
                />
              )}
            </View>

            {/* Right: text area */}
            <View style={styles.textArea}>
              <View style={styles.labelRow}>
                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                >
                  {step}
                </Text>
                {isCurrent && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>진행 중</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    paddingLeft: SPACING.md + 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftColumn: {
    alignItems: 'center',
    width: 28,
    marginRight: SPACING.sm + 4,
  },
  circleWrapper: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.cardBg,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCompleted: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  circleCurrent: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.gold,
    borderWidth: 2.5,
  },
  line: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.borderLight,
  },
  lineCompleted: {
    backgroundColor: COLORS.gold,
  },
  textArea: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stepLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.lightText,
  },
  stepLabelCompleted: {
    color: COLORS.darkText,
    fontWeight: '700',
  },
  stepLabelCurrent: {
    color: COLORS.darkText,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: COLORS.gold + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },
});
