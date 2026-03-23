import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function PageHeader({
  title,
  subtitle,
  showBack = false,
  rightElement,
}: PageHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left: back button or spacer */}
        <View style={styles.sideSlot}>
          {showBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="뒤로 가기"
            >
              <Text style={styles.backChevron}>‹</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center: title & subtitle */}
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Right: custom element or spacer */}
        <View style={[styles.sideSlot, styles.rightSlot]}>
          {rightElement ?? null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.navy,
    paddingTop: STATUS_BAR_HEIGHT + SPACING.sm,
    paddingBottom: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  sideSlot: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backChevron: {
    fontSize: 28,
    color: COLORS.white,
    fontWeight: '300',
    marginTop: -2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.goldLight,
    marginTop: 2,
  },
});
