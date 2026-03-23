import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { LEGAL } from '@/constants/legal';

const PHASE_LABELS: Record<number, string> = {
  1: '상담접수',
  2: '사실관계정리',
  3: '변호사검토',
  4: '법적조치안내',
  5: '사후관리',
};

interface TrustSignalBarProps {
  phase: 1 | 2 | 3 | 4 | 5;
  lawyerName?: string;
  statusText?: string;
  compact?: boolean;
}

function PhaseDots({ phase, size = 8 }: { phase: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: size * 0.75 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const isDone = i < phase;
        const isCurrent = i === phase;
        return (
          <View
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor:
                isDone || isCurrent ? COLORS.gold : 'transparent',
              borderWidth: isDone || isCurrent ? 0 : 1,
              borderColor: COLORS.borderLight,
            }}
          />
        );
      })}
    </View>
  );
}

export default function TrustSignalBar({
  phase,
  lawyerName = LEGAL.lawyerName,
  statusText,
  compact = false,
}: TrustSignalBarProps) {
  const initial = lawyerName.charAt(0);
  const nextPhase = Math.min(phase + 1, 5);
  const displayStatus = statusText || `다음 단계: ${PHASE_LABELS[nextPhase]}`;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactAvatar}>
          <Text style={styles.compactAvatarText}>{initial}</Text>
        </View>
        <Text style={styles.compactLabel}>
          {lawyerName} 변호사가 함께합니다
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.fullContainer, SHADOW.sm]}>
      <View style={styles.avatarRing}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </View>
      <View style={styles.center}>
        <Text style={styles.lawyerLabel}>담당 변호사 {lawyerName}</Text>
        <PhaseDots phase={phase} />
      </View>
      <Text style={styles.statusText} numberOfLines={1}>
        {displayStatus}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full mode
  fullContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    marginHorizontal: SPACING.md,
    height: 64,
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm + 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  center: {
    flex: 1,
    gap: 4,
  },
  lawyerLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    maxWidth: 120,
    textAlign: 'right',
  },

  // Compact mode
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    backgroundColor: COLORS.blush,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm + 4,
    gap: SPACING.sm,
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
  compactAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  compactLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    fontWeight: '500',
  },
});
