import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '@/constants/theme';

interface RiskMeterProps {
  score: number;
  maxScore: number;
  riskLevel: string;
  riskColor: string;
  animated?: boolean;
}

export default function RiskMeter({ score, maxScore, riskLevel, riskColor, animated = true }: RiskMeterProps) {
  const animValue = useRef(new Animated.Value(0)).current;
  const percentage = Math.min((score / maxScore) * 100, 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(animValue, {
        toValue: percentage,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    } else {
      animValue.setValue(percentage);
    }
  }, [percentage, animated]);

  const rotation = animValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.gaugeContainer}>
        {/* Background semicircle */}
        <View style={styles.gaugeBackground}>
          <View style={[styles.gaugeHalf, { backgroundColor: COLORS.borderLight }]} />
        </View>
        {/* Animated fill */}
        <Animated.View style={[styles.gaugeFill, { transform: [{ rotate: rotation }] }]}>
          <View style={[styles.gaugeHalf, { backgroundColor: riskColor }]} />
        </Animated.View>
        {/* Center circle */}
        <View style={styles.gaugeCenter}>
          <Text style={[styles.scoreText, { color: riskColor }]}>{score}</Text>
          <Text style={styles.maxScoreText}>/ {maxScore}</Text>
        </View>
      </View>
      <View style={[styles.levelBadge, { backgroundColor: riskColor + '20' }]}>
        <View style={[styles.levelDot, { backgroundColor: riskColor }]} />
        <Text style={[styles.levelText, { color: riskColor }]}>{riskLevel}</Text>
      </View>
    </View>
  );
}

const GAUGE_SIZE = 200;

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: SPACING.lg },
  gaugeContainer: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
  },
  gaugeBackground: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    borderRadius: GAUGE_SIZE / 2,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
  },
  gaugeHalf: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE / 2,
    borderTopLeftRadius: GAUGE_SIZE / 2,
    borderTopRightRadius: GAUGE_SIZE / 2,
  },
  gaugeFill: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    borderRadius: GAUGE_SIZE / 2,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    transformOrigin: 'center bottom',
  },
  gaugeCenter: {
    position: 'absolute',
    bottom: 0,
    left: GAUGE_SIZE / 2 - 45,
    width: 90,
    height: 45,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: { fontSize: FONT_SIZE.xxl, fontWeight: '800' },
  maxScoreText: { fontSize: FONT_SIZE.xs, color: COLORS.lightText },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginTop: SPACING.md,
  },
  levelDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.sm },
  levelText: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
});
