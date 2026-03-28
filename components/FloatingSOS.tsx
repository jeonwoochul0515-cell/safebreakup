import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { COLORS, SHADOW } from '@/constants/theme';

interface FloatingSOSProps {
  onPress: () => void;
  style?: ViewStyle;
}

export default function FloatingSOS({ onPress, style }: FloatingSOSProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: pulseAnim }] },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="긴급 도움 요청"
        aria-label="긴급 도움 요청"
      >
        <Text style={styles.text}>SOS</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    zIndex: 9999,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  text: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
