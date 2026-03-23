import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

interface PhaseIndicatorProps {
  currentPhase: 1 | 2 | 3 | 4 | 5;
  phases: string[];
}

function PulseDot({ active }: { active: boolean }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      opacity.setValue(1);
    }
  }, [active, opacity]);

  return active ? (
    <Animated.View style={[styles.dot, styles.dotCurrent, { opacity }]} />
  ) : null;
}

export default function PhaseIndicator({
  currentPhase,
  phases,
}: PhaseIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {phases.map((_, idx) => {
          const phaseNum = idx + 1;
          const isCompleted = phaseNum < currentPhase;
          const isCurrent = phaseNum === currentPhase;

          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <View
                  style={[
                    styles.line,
                    isCompleted ? styles.lineCompleted : styles.lineUpcoming,
                  ]}
                />
              )}
              <View style={styles.dotWrap}>
                {isCompleted ? (
                  <View style={[styles.dot, styles.dotCompleted]}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                ) : isCurrent ? (
                  <PulseDot active />
                ) : (
                  <View style={[styles.dot, styles.dotUpcoming]} />
                )}
              </View>
            </React.Fragment>
          );
        })}
      </View>

      <View style={styles.labelsRow}>
        {phases.map((label, idx) => {
          const phaseNum = idx + 1;
          const isCompleted = phaseNum < currentPhase;
          const isCurrent = phaseNum === currentPhase;
          const isActive = isCompleted || isCurrent;
          return (
            <Text
              key={idx}
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const DOT_SIZE = 10;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 4,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DOT_SIZE + 6,
    height: DOT_SIZE + 6,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: COLORS.gold,
  },
  dotCurrent: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  dotUpcoming: {
    backgroundColor: COLORS.warmGray,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: '700',
  },
  line: {
    flex: 1,
    height: 1,
    marginHorizontal: 2,
  },
  lineCompleted: {
    backgroundColor: COLORS.gold,
  },
  lineUpcoming: {
    backgroundColor: COLORS.borderLight,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.lightText,
  },
  labelActive: {
    color: COLORS.darkText,
    fontWeight: '600',
  },
});
