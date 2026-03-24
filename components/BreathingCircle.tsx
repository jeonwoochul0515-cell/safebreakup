import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT_SIZE } from '@/constants/theme';

interface BreathingCircleProps {
  phase: 'inhale' | 'hold' | 'exhale' | 'rest';
  seconds: number;
  totalSeconds: number;
  isActive: boolean;
}

const PHASE_LABELS: Record<string, string> = {
  inhale: '들이쉬기',
  hold: '참기',
  exhale: '내쉬기',
  rest: '쉬기',
};

const PHASE_COLORS: Record<string, string> = {
  inhale: COLORS.sage,
  hold: '#6B8CC7',
  exhale: COLORS.sageLight,
  rest: '#D4A373',
};

export default function BreathingCircle({ phase, seconds, totalSeconds, isActive }: BreathingCircleProps) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!isActive) {
      scaleAnim.setValue(0.6);
      opacityAnim.setValue(0.3);
      return;
    }

    const targetScale = phase === 'inhale' ? 1 : phase === 'hold' ? 1 : phase === 'exhale' ? 0.6 : 0.6;
    const targetOpacity = phase === 'inhale' ? 0.8 : phase === 'hold' ? 0.8 : phase === 'exhale' ? 0.4 : 0.3;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: totalSeconds * 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: targetOpacity,
        duration: totalSeconds * 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [phase, isActive, totalSeconds]);

  const color = PHASE_COLORS[phase] || COLORS.sage;

  return (
    <View style={styles.container}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            backgroundColor: color + '15',
            transform: [{ scale: Animated.add(scaleAnim, new Animated.Value(0.15)) }],
            opacity: opacityAnim,
          },
        ]}
      />
      {/* Main circle */}
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: color + '30',
            borderColor: color,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={[styles.phaseText, { color }]}>{PHASE_LABELS[phase]}</Text>
        <Text style={[styles.secondsText, { color }]}>{seconds}</Text>
      </Animated.View>
    </View>
  );
}

const SIZE = 220;

const styles = StyleSheet.create({
  container: {
    width: SIZE + 40,
    height: SIZE + 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: SIZE + 40,
    height: SIZE + 40,
    borderRadius: (SIZE + 40) / 2,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    marginBottom: 4,
  },
  secondsText: {
    fontSize: 48,
    fontWeight: '800',
  },
});
