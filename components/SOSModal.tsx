import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { LEGAL } from '@/constants/legal';

interface SOSModalProps {
  visible: boolean;
  onClose: () => void;
  onEnableStealthMode?: () => void;
}

const CONTACTS = [
  {
    label: '경찰 신고',
    number: '112',
    icon: '🛡️',
    bg: COLORS.coral,
  },
  {
    label: '여성긴급전화',
    number: '1366',
    icon: '📞',
    bg: COLORS.gold,
  },
  {
    label: '법률구조공단',
    number: '132',
    icon: '⚖️',
    bg: COLORS.blue,
  },
  {
    label: '디지털성범죄 피해자 지원센터',
    number: '02-735-8994',
    icon: '🔒',
    bg: COLORS.sage,
  },
];

export default function SOSModal({
  visible,
  onClose,
  onEnableStealthMode,
}: SOSModalProps) {
  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Heading */}
            <Text style={styles.heading}>긴급 도움이 필요하신가요?</Text>
            <Text style={styles.subtitle}>당신은 혼자가 아닙니다</Text>

            {/* Emergency contact cards */}
            <View style={styles.contactList}>
              {CONTACTS.map((contact) => (
                <TouchableOpacity
                  key={contact.number}
                  onPress={() => handleCall(contact.number)}
                  activeOpacity={0.7}
                  style={[styles.contactCard, { backgroundColor: contact.bg }]}
                  accessibilityRole="button"
                  accessibilityLabel={`${contact.label} ${contact.number} 전화걸기`}
                >
                  <Text style={styles.contactIcon}>{contact.icon}</Text>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>{contact.label}</Text>
                    <Text style={styles.contactNumber}>{contact.number}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stealth mode button */}
            {onEnableStealthMode && (
              <TouchableOpacity
                onPress={onEnableStealthMode}
                activeOpacity={0.7}
                style={styles.stealthButton}
                accessibilityRole="button"
                accessibilityLabel="은밀모드 켜기"
              >
                <Text style={styles.stealthButtonText}>🔇 은밀모드 켜기</Text>
                <Text style={styles.stealthDescription}>
                  앱을 계산기로 위장합니다
                </Text>
              </TouchableOpacity>
            )}

            {/* Safety settings link */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                router.push('/safety-settings');
              }}
              activeOpacity={0.7}
              style={styles.safetySettingsLink}
            >
              <Text style={styles.safetySettingsText}>
                은밀모드 세부 설정 →
              </Text>
            </TouchableOpacity>

            {/* Legal footer */}
            <Text style={styles.legalText}>{LEGAL.firmFull}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45,43,61,0.8)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.warmWhite,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '92%',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.lg,
    fontWeight: '400',
  },
  content: {
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  heading: {
    color: COLORS.navy,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  contactList: {
    gap: SPACING.sm + 4,
    marginBottom: SPACING.xl,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    ...SHADOW.sm,
  },
  contactIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    flexShrink: 1,
  },
  contactNumber: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  stealthButton: {
    borderWidth: 1.5,
    borderColor: COLORS.plum,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stealthButtonText: {
    color: COLORS.plum,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  stealthDescription: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.sm,
  },
  safetySettingsLink: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  safetySettingsText: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.sm,
  },
  legalText: {
    color: COLORS.lightText,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
});
