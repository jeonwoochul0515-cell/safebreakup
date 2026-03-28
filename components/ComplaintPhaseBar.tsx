import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { COMPLAINT_PHASES } from '@/constants/complaint';
import type { ComplaintPhase } from '@/types/database';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ComplaintPhaseBarProps {
  currentPhase: ComplaintPhase;
  completedPhases: ComplaintPhase[];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ComplaintPhaseBar({
  currentPhase,
  completedPhases,
}: ComplaintPhaseBarProps) {
  const scrollRef = useRef<ScrollView>(null);

  // 현재 단계로 자동 스크롤
  useEffect(() => {
    const currentIdx = COMPLAINT_PHASES.findIndex((p) => p.key === currentPhase);
    if (currentIdx > 0 && scrollRef.current) {
      // 각 아이템 너비(68) + 간격(8) 기준으로 스크롤 위치 계산
      const scrollX = Math.max(0, currentIdx * 76 - 60);
      scrollRef.current.scrollTo({ x: scrollX, animated: true });
    }
  }, [currentPhase]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {COMPLAINT_PHASES.map((phase, index) => {
          const isCompleted = completedPhases.includes(phase.key);
          const isCurrent = phase.key === currentPhase;
          const isFuture = !isCompleted && !isCurrent;

          return (
            <View key={phase.key} style={styles.phaseItemWrapper}>
              {/* 연결선 (첫 번째 아이템 제외) */}
              {index > 0 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted || isCurrent
                      ? styles.connectorActive
                      : styles.connectorInactive,
                  ]}
                />
              )}

              <View style={styles.phaseItem}>
                {/* 아이콘 원 */}
                <View
                  style={[
                    styles.iconCircle,
                    isCompleted && styles.iconCircleCompleted,
                    isCurrent && styles.iconCircleCurrent,
                    isFuture && styles.iconCircleFuture,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  ) : (
                    <Ionicons
                      name={phase.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={
                        isCurrent ? COLORS.white : COLORS.lightText
                      }
                    />
                  )}
                </View>

                {/* 단계 번호 */}
                <Text
                  style={[
                    styles.stepNumber,
                    isCurrent && styles.stepNumberCurrent,
                    isCompleted && styles.stepNumberCompleted,
                  ]}
                >
                  {phase.step}단계
                </Text>

                {/* 라벨 */}
                <Text
                  style={[
                    styles.label,
                    isCurrent && styles.labelCurrent,
                    isCompleted && styles.labelCompleted,
                    isFuture && styles.labelFuture,
                  ]}
                  numberOfLines={1}
                >
                  {phase.label}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.warmWhite,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOW.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },

  phaseItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // 연결선
  connector: {
    width: 12,
    height: 2,
    borderRadius: 1,
    marginRight: SPACING.xs,
  },
  connectorActive: {
    backgroundColor: COLORS.gold,
  },
  connectorInactive: {
    backgroundColor: COLORS.borderLight,
  },

  // 단계 아이템
  phaseItem: {
    alignItems: 'center',
    width: 56,
  },

  // 아이콘 원
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  iconCircleCurrent: {
    backgroundColor: COLORS.gold,
    ...SHADOW.sm,
  },
  iconCircleCompleted: {
    backgroundColor: COLORS.sage,
  },
  iconCircleFuture: {
    backgroundColor: COLORS.warmGray,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  // 단계 번호
  stepNumber: {
    fontSize: FONT_SIZE.xs - 1,
    color: COLORS.lightText,
    fontWeight: '500',
    marginBottom: 1,
  },
  stepNumberCurrent: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  stepNumberCompleted: {
    color: COLORS.sage,
    fontWeight: '600',
  },

  // 라벨
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelCurrent: {
    color: COLORS.darkText,
    fontWeight: '700',
  },
  labelCompleted: {
    color: COLORS.sage,
    fontWeight: '600',
  },
  labelFuture: {
    color: COLORS.lightText,
  },
});
