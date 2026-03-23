import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import type { SafetySettings } from '@/types/database';

interface IncognitoSettingsProps {
  settings: SafetySettings;
  onUpdate: (updates: Partial<SafetySettings>) => void;
}

const ICON_OPTIONS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'calculator', label: '계산기', icon: 'calculator-outline' },
  { key: 'weather', label: '날씨', icon: 'partly-sunny-outline' },
  { key: 'memo', label: '메모', icon: 'document-text-outline' },
];

export default function IncognitoSettings({ settings, onUpdate }: IncognitoSettingsProps) {
  const [notifText, setNotifText] = useState(settings.fakeNotificationText);

  const selectedIcon = settings.fakeIcon;

  const handleNotifTextEnd = () => {
    if (notifText.trim()) {
      onUpdate({ fakeNotificationText: notifText.trim() });
    }
  };

  const appNameForIcon = (key: string) => {
    switch (key) {
      case 'calculator': return '계산기';
      case 'weather': return '날씨';
      case 'memo': return '메모';
      default: return '앱';
    }
  };

  return (
    <View style={styles.container}>
      {/* Icon selection */}
      <Text style={styles.label}>앱 위장 아이콘 선택</Text>
      <View style={styles.iconRow}>
        {ICON_OPTIONS.map((opt) => {
          const isSelected = selectedIcon === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.iconCard, isSelected && styles.iconCardSelected]}
              onPress={() => onUpdate({ fakeIcon: opt.key })}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${opt.label} 아이콘`}
            >
              <Ionicons
                name={opt.icon as any}
                size={32}
                color={isSelected ? COLORS.gold : COLORS.slate}
              />
              <Text style={[styles.iconLabel, isSelected && styles.iconLabelSelected]}>
                {opt.label}
              </Text>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Fake notification text */}
      <Text style={[styles.label, { marginTop: SPACING.lg }]}>알림 위장 텍스트</Text>
      <TextInput
        style={styles.textInput}
        value={notifText}
        onChangeText={setNotifText}
        onEndEditing={handleNotifTextEnd}
        placeholder="위장 알림 텍스트를 입력하세요"
        placeholderTextColor={COLORS.lightText}
        returnKeyType="done"
        maxLength={50}
      />

      {/* Preview */}
      <Text style={[styles.label, { marginTop: SPACING.md }]}>알림 미리보기</Text>
      <View style={styles.previewCard}>
        <Ionicons
          name={ICON_OPTIONS.find((o) => o.key === selectedIcon)?.icon as any ?? 'calculator-outline'}
          size={18}
          color={COLORS.slate}
        />
        <Text style={styles.previewText} numberOfLines={1}>
          <Text style={styles.previewAppName}>{appNameForIcon(selectedIcon)}</Text>
          {'  '}
          {notifText || settings.fakeNotificationText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.slate,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  iconRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
    minHeight: 100,
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  iconCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: '#faf6ec',
  },
  iconLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  iconLabelSelected: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  radioSelected: {
    borderColor: COLORS.gold,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },
  textInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    minHeight: 48,
  },
  previewCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  previewText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    flex: 1,
  },
  previewAppName: {
    fontWeight: '700',
  },
});
