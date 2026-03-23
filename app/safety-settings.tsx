import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { SOS_CONTACTS, LEGAL } from '@/constants/legal';
import { useAppContext } from '@/contexts/AppContext';
import PageHeader from '@/components/PageHeader';
import IncognitoSettings from '@/components/IncognitoSettings';

type QuickExitTrigger = 'volume' | 'shake' | 'none';

const EXIT_OPTIONS: { key: QuickExitTrigger; label: string; description: string }[] = [
  { key: 'volume', label: '볼륨 버튼 3회', description: '볼륨 버튼을 빠르게 3번 누르면 은밀모드로 전환됩니다' },
  { key: 'shake', label: '흔들기', description: '기기를 세게 흔들면 은밀모드로 전환됩니다' },
  { key: 'none', label: '사용 안함', description: '빠른 탈출 기능을 사용하지 않습니다' },
];

const PIN_FAIL_OPTIONS = [3, 5, 10] as const;

export default function SafetySettingsScreen() {
  const { safetySettings, setSafetySettings, setStealthMode, setUserOnboarded } = useAppContext();

  const [newPin, setNewPin] = useState('');
  const [pinFailLimit, setPinFailLimit] = useState(safetySettings.pinFailLimit);

  const handlePinChange = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      Alert.alert('오류', 'PIN은 4자리 숫자여야 합니다.');
      return;
    }
    setSafetySettings({ stealthPin: newPin });
    setNewPin('');
    Alert.alert('완료', 'PIN이 변경되었습니다.');
  };

  const handlePinFailLimitChange = (limit: number) => {
    setPinFailLimit(limit);
    setSafetySettings({ pinFailLimit: limit });
  };

  const handleEmergencyDelete = () => {
    Alert.alert(
      '긴급 데이터 삭제',
      '정말로 모든 데이터를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setUserOnboarded(false);
              setStealthMode(false);
              router.replace('/');
            } catch {
              Alert.alert('오류', '데이터 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleCallContact = (number: string) => {
    const { Linking } = require('react-native');
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.screen}>
      <PageHeader title="안전 설정" showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Incognito Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>은밀모드 설정</Text>
          <View style={styles.card}>
            <IncognitoSettings
              settings={safetySettings}
              onUpdate={setSafetySettings}
            />
          </View>
        </View>

        {/* Section 2: Quick Exit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 탈출</Text>
          <View style={styles.card}>
            {EXIT_OPTIONS.map((option) => {
              const isSelected = safetySettings.quickExitTrigger === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.radioRow, isSelected && styles.radioRowSelected]}
                  onPress={() => setSafetySettings({ quickExitTrigger: option.key })}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioCircleDot} />}
                  </View>
                  <View style={styles.radioContent}>
                    <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={styles.radioDesc}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Data Protection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터 보호</Text>
          <View style={styles.card}>
            {/* PIN Change */}
            <Text style={styles.fieldLabel}>PIN 변경</Text>
            <View style={styles.pinRow}>
              <TextInput
                style={styles.pinInput}
                value={newPin}
                onChangeText={setNewPin}
                placeholder="새 PIN 4자리"
                placeholderTextColor={COLORS.lightText}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
              <TouchableOpacity
                style={[styles.pinButton, newPin.length !== 4 && styles.pinButtonDisabled]}
                onPress={handlePinChange}
                disabled={newPin.length !== 4}
                activeOpacity={0.7}
              >
                <Text style={styles.pinButtonText}>변경</Text>
              </TouchableOpacity>
            </View>

            {/* Auto delete on PIN fail */}
            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <View style={styles.switchContent}>
                <Text style={styles.fieldLabel}>PIN 실패 시 자동 삭제</Text>
                <Text style={styles.fieldDesc}>
                  {pinFailLimit}회 실패 시 앱 데이터 자동 삭제
                </Text>
              </View>
              <Switch
                value={safetySettings.autoDeleteOnPinFail}
                onValueChange={(v) => setSafetySettings({ autoDeleteOnPinFail: v })}
                trackColor={{ false: COLORS.borderLight, true: COLORS.gold }}
                thumbColor={COLORS.white}
              />
            </View>

            {/* PIN fail limit */}
            {safetySettings.autoDeleteOnPinFail && (
              <View style={styles.limitRow}>
                {PIN_FAIL_OPTIONS.map((limit) => {
                  const isActive = pinFailLimit === limit;
                  return (
                    <TouchableOpacity
                      key={limit}
                      style={[styles.limitChip, isActive && styles.limitChipActive]}
                      onPress={() => handlePinFailLimitChange(limit)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.limitChipText, isActive && styles.limitChipTextActive]}>
                        {limit}회
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Section 4: Emergency Data Delete */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>긴급 데이터 삭제</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleEmergencyDelete}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="모든 데이터 즉시 삭제"
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.white} />
              <Text style={styles.dangerButtonText}>모든 데이터 즉시 삭제</Text>
            </TouchableOpacity>
            <Text style={styles.warningText}>
              삭제된 데이터는 복구할 수 없습니다
            </Text>
          </View>
        </View>

        {/* Section 5: Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>긴급 연락처</Text>
          <View style={styles.card}>
            {SOS_CONTACTS.map((contact) => (
              <TouchableOpacity
                key={contact.number}
                style={styles.contactRow}
                onPress={() => handleCallContact(contact.number)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${contact.label} ${contact.number} 전화걸기`}
              >
                <View style={[styles.contactDot, { backgroundColor: contact.color }]} />
                <Text style={styles.contactLabel}>{contact.label}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
                <Ionicons name="call-outline" size={18} color={COLORS.slate} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>{LEGAL.firmFull}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.sm,
  },

  // Radio rows (quick exit)
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    minHeight: 56,
  },
  radioRowSelected: {
    backgroundColor: '#faf6ec',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: SPACING.md,
  },
  radioCircleSelected: {
    borderColor: COLORS.gold,
  },
  radioCircleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gold,
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  radioLabelSelected: {
    color: COLORS.gold,
  },
  radioDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginTop: 2,
  },

  // Data protection
  fieldLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  fieldDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginTop: 2,
  },
  pinRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  pinInput: {
    flex: 1,
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    minHeight: 48,
    letterSpacing: 8,
    textAlign: 'center',
  },
  pinButton: {
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  pinButtonDisabled: {
    opacity: 0.4,
  },
  pinButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  switchContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  limitRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  limitChip: {
    flex: 1,
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  limitChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#faf6ec',
  },
  limitChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.slate,
  },
  limitChipTextActive: {
    color: COLORS.gold,
  },

  // Danger button
  dangerButton: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 56,
  },
  dangerButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  warningText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.coral,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Emergency contacts
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    minHeight: 56,
    gap: SPACING.sm,
  },
  contactDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  contactLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  contactNumber: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    marginRight: SPACING.sm,
  },

  // Footer
  footer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
