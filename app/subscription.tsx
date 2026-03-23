import React, { useState, useCallback } from 'react';
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
import { SUBSCRIPTION_PLANS, ADDON_SERVICES, LEGAL } from '@/constants/legal';
import PricingToggle from '@/components/PricingToggle';
import ROICalculator from '@/components/ROICalculator';

// ---------------------------------------------------------------------------
// Trust Signals
// ---------------------------------------------------------------------------

const TRUST_SIGNALS = [
  { icon: 'business-outline' as const, text: '법률사무소 직접 운영' },
  { icon: 'person-outline' as const, text: '변호사 직접 검토' },
  { icon: 'lock-closed-outline' as const, text: '안전한 결제' },
];

// ---------------------------------------------------------------------------
// Payment Methods
// ---------------------------------------------------------------------------

const PAYMENT_METHODS = ['토스페이', '카카오페이', '네이버페이'];

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isAnnual, setIsAnnual] = useState(false);

  const lightPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'light')!;
  const carePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'care')!;

  const currentPrice = isAnnual ? lightPlan.annualMonthlyPrice : lightPlan.monthlyPrice;
  const currentPriceLabel = isAnnual ? lightPlan.annualPriceLabel : lightPlan.priceLabel;

  const handleSubscribe = useCallback(() => {
    Alert.alert('안내', '서비스 출시 준비 중입니다.');
  }, []);

  const handleNotify = useCallback(() => {
    Alert.alert('알림 등록', '케어플랜 출시 시 알림을 보내드리겠습니다.');
  }, []);

  const handleAddon = useCallback((name: string) => {
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
        <Text style={styles.navTitle}>보호우산</Text>
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
          <Text style={styles.headerEmoji}>{'\u2602\uFE0F'}</Text>
          <Text style={styles.title}>보호우산</Text>
          <Text style={styles.subtitle}>나에게 맞는 보호를 선택하세요</Text>
        </View>

        {/* Pricing Toggle */}
        <View style={styles.toggleWrapper}>
          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
        </View>

        {/* ============================================================= */}
        {/* 보호우산 라이트 — Main Plan Card */}
        {/* ============================================================= */}
        <View style={styles.mainCard}>
          {/* Rose gold left accent line */}
          <View style={styles.mainCardAccent} />

          {/* Recommended badge */}
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>추천</Text>
          </View>

          <Text style={styles.mainCardName}>{lightPlan.name}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.pricePrefix}>월 </Text>
            <Text style={styles.priceValue}>{currentPriceLabel}</Text>
          </View>
          {isAnnual && (
            <Text style={styles.annualNote}>
              연간 결제 시 (월 {lightPlan.priceLabel} {'\u2192'} {lightPlan.annualPriceLabel})
            </Text>
          )}

          <Text style={styles.mainCardTagline}>{lightPlan.tagline}</Text>

          {/* Features */}
          <View style={styles.featureList}>
            {lightPlan.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View style={styles.featureCheckCircle}>
                  <Ionicons name="checkmark" size={11} color={COLORS.white} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.mainCta}
            onPress={handleSubscribe}
            activeOpacity={0.85}
          >
            <Text style={styles.mainCtaText}>시작하기</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================= */}
        {/* 케어플랜 — Coming Soon Card */}
        {/* ============================================================= */}
        <View style={styles.comingSoonCard}>
          {/* Coming soon badge */}
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonBadgeText}>{carePlan.comingSoonLabel}</Text>
          </View>

          <Text style={styles.comingSoonName}>{carePlan.name}</Text>
          <Text style={styles.comingSoonTagline}>{carePlan.tagline}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[styles.pricePrefix, { color: COLORS.slate }]}>월 </Text>
            <Text style={[styles.priceValue, { color: COLORS.slate, fontSize: FONT_SIZE.xxl }]}>
              {isAnnual ? carePlan.annualPriceLabel : carePlan.priceLabel}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featureList}>
            {carePlan.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View style={[styles.featureCheckCircle, { backgroundColor: `${COLORS.plum}60` }]}>
                  <Ionicons name="checkmark" size={11} color={COLORS.white} />
                </View>
                <Text style={[styles.featureText, { color: COLORS.slate }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Notify CTA */}
          <TouchableOpacity
            style={styles.notifyCta}
            onPress={handleNotify}
            activeOpacity={0.85}
          >
            <Text style={styles.notifyCtaText}>출시 알림 받기</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================= */}
        {/* ROI Section */}
        {/* ============================================================= */}
        <View style={styles.section}>
          <ROICalculator monthlyPrice={currentPrice} />
        </View>

        {/* ============================================================= */}
        {/* Add-on Services */}
        {/* ============================================================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>필요할 때 개별 이용</Text>
          <View style={styles.addonGrid}>
            {ADDON_SERVICES.map((addon) => (
              <View key={addon.id} style={styles.addonCard}>
                <View style={styles.addonIconCircle}>
                  <Ionicons
                    name={addon.icon as any}
                    size={22}
                    color={COLORS.gold}
                  />
                </View>
                <View style={styles.addonInfo}>
                  <Text style={styles.addonName}>{addon.name}</Text>
                  <Text style={styles.addonPrice}>{addon.priceLabel}</Text>
                </View>
                <TouchableOpacity
                  style={styles.addonCta}
                  onPress={() => handleAddon(addon.name)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.addonCtaText}>신청하기</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* ============================================================= */}
        {/* Trust Section */}
        {/* ============================================================= */}
        <View style={styles.trustRow}>
          {TRUST_SIGNALS.map((signal, idx) => (
            <View key={idx} style={styles.trustItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.gold} />
              <Text style={styles.trustText}>{signal.text}</Text>
            </View>
          ))}
        </View>

        {/* ============================================================= */}
        {/* Payment Methods */}
        {/* ============================================================= */}
        <View style={styles.paymentRow}>
          {PAYMENT_METHODS.map((method, idx) => (
            <React.Fragment key={method}>
              {idx > 0 && <Text style={styles.paymentDot}>{'\u00B7'}</Text>}
              <Text style={styles.paymentLabel}>{method}</Text>
            </React.Fragment>
          ))}
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
    paddingBottom: SPACING.md,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
  },

  // Toggle wrapper
  toggleWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  // ===== Main Plan Card (Light) =====
  mainCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: 28,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  mainCardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.gold,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  recommendedText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  mainCardName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  mainCardTagline: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    marginBottom: SPACING.xs,
  },

  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  pricePrefix: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  priceValue: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '800',
    color: COLORS.darkText,
  },
  annualNote: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },

  // Features (shared)
  featureList: {
    gap: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
  },
  featureCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm + 4,
  },
  featureText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    flex: 1,
    lineHeight: 22,
  },

  // Main CTA
  mainCta: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    ...SHADOW.sm,
  },
  mainCtaText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ===== Coming Soon Card (Care Plan) =====
  comingSoonCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.lavender,
    padding: 28,
    marginBottom: SPACING.xl,
    opacity: 0.85,
  },
  comingSoonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.plum,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  comingSoonBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  comingSoonName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  comingSoonTagline: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    marginBottom: SPACING.md,
  },

  // Notify CTA
  notifyCta: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.plum,
    backgroundColor: 'transparent',
  },
  notifyCtaText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.plum,
  },

  // ===== Section =====
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
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
  addonCta: {
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addonCtaText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.gold,
  },

  // ===== Trust =====
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.slate,
  },

  // ===== Payment Methods =====
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  paymentLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.lightText,
  },
  paymentDot: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.lightText,
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
