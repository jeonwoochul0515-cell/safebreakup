import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';

interface LeadMagnetPopupProps {
  visible: boolean;
  onClose: () => void;
}

const FEATURES = [
  { icon: 'shield-checkmark', label: '위험도 자가진단', desc: '10문항으로 내 상황 파악', color: COLORS.coral },
  { icon: 'lock-closed', label: '디지털 성범죄 대응', desc: '삭제 요청 & 증거 수집', color: COLORS.plum },
  { icon: 'analytics', label: '가스라이팅 테스트', desc: '15문항 심리 패턴 분석', color: '#D4A373' },
  { icon: 'heart', label: '트라우마 회복', desc: '그라운딩 & 호흡법', color: COLORS.sage },
];

export default function LeadMagnetPopup({ visible, onClose }: LeadMagnetPopupProps) {
  const handleStartDiagnosis = () => {
    onClose();
    router.push('/diagnosis' as any);
  };

  const handleKakao = () => {
    onClose();
    Linking.openURL('https://pf.kakao.com/_xfLxbxj').catch(() => {});
  };

  const handleViewAll = () => {
    onClose();
    router.push('/landing' as any);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlayPress} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Close */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="닫기"
          >
            <Ionicons name="close" size={18} color={COLORS.slate} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={28} color={COLORS.gold} />
          </View>
          <Text style={styles.heading}>지금 바로 보호를 시작하세요</Text>
          <Text style={styles.subheading}>
            변호사가 직접 운영하는 안전이별 플랫폼
          </Text>

          {/* Feature Grid */}
          <View style={styles.featureGrid}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureItem}>
                <Ionicons name={f.icon as any} size={20} color={f.color} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.ctaPrimary}
            onPress={handleStartDiagnosis}
            activeOpacity={0.85}
          >
            <Ionicons name="shield-checkmark" size={18} color={COLORS.white} />
            <Text style={styles.ctaPrimaryText}>무료 위험도 진단 시작</Text>
          </TouchableOpacity>

          {/* Secondary CTAs */}
          <View style={styles.secondaryRow}>
            <TouchableOpacity style={styles.ctaSecondary} onPress={handleKakao} activeOpacity={0.7}>
              <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.gold} />
              <Text style={styles.ctaSecondaryText}>카카오톡 상담</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaSecondary} onPress={handleViewAll} activeOpacity={0.7}>
              <Ionicons name="apps" size={16} color={COLORS.gold} />
              <Text style={styles.ctaSecondaryText}>전체 서비스 보기</Text>
            </TouchableOpacity>
          </View>

          {/* Credit */}
          <Text style={styles.creditText}>
            법률사무소 청송 / 검토: 김창희 변호사
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold + '15',
    justifyContent: 'center',
    alignItems: 'center',
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
  featureGrid: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  featureDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
  },
  ctaPrimary: {
    alignSelf: 'stretch',
    height: 50,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: 8,
  },
  ctaPrimaryText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignSelf: 'stretch',
    marginBottom: SPACING.md,
  },
  ctaSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  ctaSecondaryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  creditText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
  },
});
