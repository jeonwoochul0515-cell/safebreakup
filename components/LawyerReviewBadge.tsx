import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING } from '@/constants/theme';
import { LEGAL } from '@/constants/legal';

interface LawyerReviewBadgeProps {
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export default function LawyerReviewBadge({ size = 'md', style }: LawyerReviewBadgeProps) {
  const fontSize = size === 'sm' ? FONT_SIZE.xs : FONT_SIZE.sm;
  const iconSize = size === 'sm' ? 12 : 15;

  return (
    <View style={[styles.container, style]}>
      <Ionicons name="shield-checkmark" size={iconSize} color={COLORS.gold} />
      <Text style={[styles.text, { fontSize }]}>
        {LEGAL.lawyerName} 변호사 검토 완료
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  text: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});
