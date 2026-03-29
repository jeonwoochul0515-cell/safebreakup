import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { LEGAL } from '@/constants/legal';

// ---------------------------------------------------------------------------
// Plan Data
// ---------------------------------------------------------------------------

const FREE_FEATURES = [
  'AI 사무장 상담 (3회/월)',
  '위험도 자가진단',
  'SOS 긴급 연락처',
  '안전 이별 체크리스트',
];

const STANDARD_FEATURES = [
  'AI 사무장 24시간 무제한 상담',
  '위험도 자가진단',
  'SOS 긴급 연락처',
  '안전 이별 체크리스트',
  '증거보관함 무제한',
  'AI 법률 서류 무제한 생성',
  '고소장 / 경고장 / 내용증명',
  '디지털 안전 점검',
];

const ADDON_SERVICES = [
  { id: 'consult', name: '변호사 상담 (1회)', price: '29,000원', icon: 'call-outline' as const },
  { id: 'letter_email', name: '법률 경고장 (이메일/SNS)', price: '49,000원', icon: 'mail-outline' as const },
  { id: 'letter_mail', name: '내용증명 (우편)', price: '99,000원', icon: 'document-text-outline' as const },
  { id: 'lawyer_review', name: '변호사 서류 검토', price: '199,000원', icon: 'shield-checkmark-outline' as const },
];

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSubscribe = useCallback(() => {
    Alert.alert('안내', '서비스 출시 준비 중입니다.');
  }, []);

  const handleAddon = useCallback((_name: string) => {
    Alert.alert('안내', '서비스 출시 준비 중입니다.');
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Navigation header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>구독 플랜</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + SPACING.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================= */}
        {/* Header */}
        {/* ============================================================= */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={44} color={COLORS.gold} />
          <Text style={styles.title}>나에게 맞는 보호를 선택하세요</Text>
        </View>

        {/* ============================================================= */}
        {/* 2-Tier Comparison */}
        {/* ============================================================= */}
        <View style={styles.comparisonRow}>
          {/* ── Free ── */}
          <View style={styles.planCard}>
            <Text style={styles.planName}>무료</Text>
            <Text style={styles.planPrice}>0원</Text>
            <Text style={styles.planPeriod}>/월</Text>

            <View style={styles.featureList}>
              {FREE_FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.sage} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
              {/* Features only in standard — shown as X */}
              {['증거보관함 무제한', 'AI 법률 서류 무제한', '디지털 안전 점검'].map((f, i) => (
                <View key={`no-${i}`} style={styles.featureRow}>
                  <Ionicons name="close-circle" size={16} color={COLORS.lightText} />
                  <Text style={[styles.featureText, { color: COLORS.lightText }]}>{f}</Text>
                </View>
              ))}
            </View>

            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>현재 플랜</Text>
            </View>
          </View>

          {/* ── Standard ── */}
          <View style={[styles.planCard, styles.standardCard]}>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>추천</Text>
            </View>
            <Text style={[styles.planName, { color: COLORS.white }]}>스탠다드</Text>
            <Text style={[styles.planPrice, { color: COLORS.gold }]}>9,900원</Text>
            <Text style={[styles.planPeriod, { color: COLORS.goldLight }]}>/월</Text>

            <View style={styles.featureList}>
              {STANDARD_FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.gold} />
                  <Text style={[styles.featureText, { color: COLORS.white }]}>{f}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.standardCta}
              onPress={handleSubscribe}
              activeOpacity={0.85}
            >
              <Text style={styles.standardCtaText}>스탠다드 시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================= */}
        {/* 책임 한계 고지 */}
        {/* ============================================================= */}
        <View style={styles.disclaimerWarningCard}>
          <View style={styles.disclaimerWarningHeader}>
            <Ionicons name="warning" size={22} color="#B91C1C" />
            <Text style={styles.disclaimerWarningTitle}>책임 한계 고지</Text>
          </View>
          <Text style={styles.disclaimerWarningBody}>
            본 서비스에서 AI가 생성하는 법률 서류(고소장, 경고장 등)는 자동 생성된 초안이며, 변호사의 개별 검토를 거치지 않았습니다.
          </Text>
          <Text style={styles.disclaimerWarningBody}>
            법적 효력을 보장하지 않으며, 실제 제출 전 반드시 전문가 검토를 권장합니다. 구독 시 이에 동의한 것으로 간주합니다.
          </Text>
        </View>

        {/* ============================================================= */}
        {/* Add-on (건별 유료 서비스) */}
        {/* ============================================================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>건별 유료 서비스</Text>
          <Text style={styles.sectionSub}>필요할 때 개별적으로 이용할 수 있습니다</Text>
          <View style={styles.addonGrid}>
            {ADDON_SERVICES.map((addon) => (
              <TouchableOpacity
                key={addon.id}
                style={styles.addonCard}
                onPress={() => handleAddon(addon.name)}
                activeOpacity={0.8}
              >
                <View style={styles.addonIconCircle}>
                  <Ionicons name={addon.icon} size={22} color={COLORS.gold} />
                </View>
                <View style={styles.addonInfo}>
                  <Text style={styles.addonName}>{addon.name}</Text>
                  <Text style={styles.addonPrice}>{addon.price}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ============================================================= */}
        {/* Footer */}
        {/* ============================================================= */}
        <View style={styles.footer}>
          <Text style={styles.footerFirm}>{LEGAL.firmFull}</Text>
          <Text style={styles.footerDisclaimer}>{LEGAL.disclaimer}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  // Nav
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    textAlign: 'center',
  },

  // ===== Comparison Row =====
  comparisonRow: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  // Plan Card (shared)
  planCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  standardCard: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.gold,
    borderWidth: 2,
  },

  planName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  planPrice: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '800',
    color: COLORS.darkText,
  },
  planPeriod: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    marginBottom: SPACING.md,
  },

  // Features
  featureList: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    flex: 1,
    lineHeight: FONT_SIZE.sm * 1.5,
  },

  // Badges
  recommendedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  recommendedText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  currentBadge: {
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  currentBadgeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.slate,
  },

  // Standard CTA
  standardCta: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    ...SHADOW.sm,
  },
  standardCtaText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ===== Disclaimer Warning Card =====
  disclaimerWarningCard: {
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
    marginBottom: SPACING.xl,
  },
  disclaimerWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  disclaimerWarningTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#B91C1C',
  },
  disclaimerWarningBody: {
    fontSize: FONT_SIZE.sm,
    color: '#991B1B',
    lineHeight: FONT_SIZE.sm * 1.6,
    marginBottom: SPACING.xs,
  },

  // ===== Section =====
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  sectionSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    marginBottom: SPACING.md,
  },

  // ===== Add-on Services =====
  addonGrid: {
    gap: SPACING.sm,
  },
  addonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  addonIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.gold}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  addonInfo: {
    flex: 1,
  },
  addonName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  addonPrice: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.gold,
  },

  // ===== Footer =====
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  footerFirm: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.slate,
  },
  footerDisclaimer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
  },
});
