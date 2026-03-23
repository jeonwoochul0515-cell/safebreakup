import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';

interface ROICalculatorProps {
  monthlyPrice: number;
}

export default function ROICalculator({ monthlyPrice }: ROICalculatorProps) {
  const dailyPrice = Math.round(monthlyPrice / 30);
  const formattedMonthly = monthlyPrice.toLocaleString('ko-KR');

  return (
    <View style={styles.card}>
      <Text style={styles.dailyPrice}>
        하루 약 {dailyPrice}원
      </Text>
      <Text style={styles.headline}>
        24시간 법률 보호
      </Text>
      <View style={styles.divider} />
      <Text style={styles.comparison}>
        전문 변호사 상담 1회 30만원+ {'\u2192'} 이별방패 월 {formattedMonthly}원
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.blush,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg + 4,
    alignItems: 'center',
  },
  dailyPrice: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  headline: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: SPACING.md,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.goldLight,
    borderRadius: 1,
    marginBottom: SPACING.md,
  },
  comparison: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: 20,
  },
});
