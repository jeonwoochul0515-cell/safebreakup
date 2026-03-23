import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

const TOGGLE_WIDTH = 260;
const HALF_WIDTH = TOGGLE_WIDTH / 2;

export default function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  const slideAnim = useRef(new Animated.Value(isAnnual ? HALF_WIDTH : 0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isAnnual ? HALF_WIDTH : 0,
      useNativeDriver: true,
      tension: 68,
      friction: 10,
    }).start();
  }, [isAnnual, slideAnim]);

  return (
    <View style={styles.container}>
      {/* Sliding background */}
      <Animated.View
        style={[
          styles.slider,
          { transform: [{ translateX: slideAnim }] },
        ]}
      />

      <TouchableOpacity
        style={styles.option}
        onPress={() => onToggle(false)}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={[styles.optionText, !isAnnual && styles.optionTextActive]}>
          월간
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => onToggle(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={[styles.optionText, isAnnual && styles.optionTextActive]}>
          연간
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>2개월 절약</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TOGGLE_WIDTH,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmGray,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  slider: {
    position: 'absolute',
    left: 2,
    width: HALF_WIDTH - 4,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
  },
  option: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.slate,
  },
  optionTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 4,
    backgroundColor: COLORS.plum,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
  },
});
