import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';

interface LeadMagnetPopupProps {
  visible: boolean;
  onClose: () => void;
}

const BULLET_ITEMS = [
  '증거 수집 방법',
  '법적 대응 절차',
  '디지털 안전 점검',
  '긴급 상황 대처법',
];

export default function LeadMagnetPopup({ visible, onClose }: LeadMagnetPopupProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    Alert.alert('안내', '가이드가 이메일로 발송됩니다. (서비스 준비 중)');
    setEmail('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.overlayPress} onPress={onClose}>
          <Pressable style={styles.card} onPress={() => {}}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="닫기"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {/* Shield icon & heading */}
            <Text style={styles.shieldIcon}>🛡️</Text>
            <Text style={styles.heading}>안전이별 가이드 PDF</Text>
            <Text style={styles.subheading}>
              변호사가 알려주는 안전한 이별 준비 7단계
            </Text>

            {/* Bullet points */}
            <View style={styles.bulletContainer}>
              {BULLET_ITEMS.map((item) => (
                <View key={item} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Email input */}
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력하세요"
              placeholderTextColor={COLORS.lightText}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            {/* CTA button */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>가이드 받기</Text>
            </TouchableOpacity>

            {/* Lawyer credit */}
            <Text style={styles.creditText}>
              법률사무소 청송 / 검토: 김창희 변호사
            </Text>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayPress: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
  },
  closeText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    fontWeight: '600',
  },
  shieldIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  heading: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  bulletContainer: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  bulletDot: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gold,
    marginRight: SPACING.sm,
    fontWeight: '700',
  },
  bulletText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
  },
  input: {
    alignSelf: 'stretch',
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    backgroundColor: COLORS.warmWhite,
    marginBottom: SPACING.md,
  },
  ctaButton: {
    alignSelf: 'stretch',
    height: 50,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ctaText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  creditText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
  },
});
