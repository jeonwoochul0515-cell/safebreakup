import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';

interface Option {
  id: string;
  label: string;
  icon?: string;
}

interface SelectionCardProps {
  type: 'single' | 'multi';
  options: Option[];
  selected: string[];
  onSelect: (selected: string[]) => void;
  allowCustom?: boolean;
}

export default function SelectionCard({
  type,
  options,
  selected,
  onSelect,
  allowCustom = false,
}: SelectionCardProps) {
  const [customText, setCustomText] = useState('');

  const handlePress = (id: string) => {
    if (type === 'single') {
      onSelect([id]);
    } else {
      if (selected.includes(id)) {
        onSelect(selected.filter((s) => s !== id));
      } else {
        onSelect([...selected, id]);
      }
    }
  };

  const handleCustomSubmit = () => {
    const trimmed = customText.trim();
    if (trimmed) {
      if (type === 'single') {
        onSelect([`custom:${trimmed}`]);
      } else {
        onSelect([...selected, `custom:${trimmed}`]);
      }
      setCustomText('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => handlePress(opt.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                {type === 'multi' && (
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </View>
                )}
                {type === 'single' && (
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                )}
                {opt.icon && <Text style={styles.icon}>{opt.icon}</Text>}
                <Text
                  style={[styles.label, isSelected && styles.labelSelected]}
                  numberOfLines={2}
                >
                  {opt.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {allowCustom && (
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            placeholder="직접 입력"
            placeholderTextColor={COLORS.lightText}
            value={customText}
            onChangeText={setCustomText}
            onSubmitEditing={handleCustomSubmit}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.customBtn, !customText.trim() && styles.customBtnDisabled]}
            onPress={handleCustomSubmit}
            disabled={!customText.trim()}
          >
            <Text style={styles.customBtnText}>추가</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  card: {
    minHeight: 56,
    minWidth: 56,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardBg,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    flexGrow: 1,
    flexBasis: '45%',
    ...SHADOW.sm,
  },
  cardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  checkIcon: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.gold,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },
  icon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    flex: 1,
  },
  labelSelected: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    backgroundColor: COLORS.cardBg,
  },
  customBtn: {
    height: 44,
    paddingHorizontal: SPACING.md,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBtnDisabled: {
    opacity: 0.4,
  },
  customBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
