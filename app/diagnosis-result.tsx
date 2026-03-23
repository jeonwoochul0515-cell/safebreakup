import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { RISK_LEVELS, LEGAL } from '@/constants/legal';

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

function getRiskLevel(score: number): RiskLevel {
  if (score <= 8) return 'low';
  if (score <= 16) return 'medium';
  if (score <= 24) return 'high';
  return 'critical';
}

const PRIMARY_ACTIONS: Record<
  RiskLevel,
  { label: string; route: string; isExternal?: boolean }
> = {
  low: { label: '안전 이별 체크리스트 확인', route: '/checklist' },
  medium: { label: '법률 경고장 발송 검토', route: '/letter' },
  high: { label: '변호사 상담 신청', route: '/consultation' },
  critical: { label: '지금 바로 112 신고', route: 'tel:112', isExternal: true },
};

const SECONDARY_ACTIONS = [
  { label: 'AI 사무장과 상담 시작', route: '/ai-secretary', icon: 'chatbubble-ellipses-outline' as const },
  { label: '증거보관함 시작하기', route: '/(tabs)/evidence', icon: 'folder-outline' as const },
  { label: '보호 플랜 알아보기', route: '/subscription', icon: 'shield-outline' as const },
  { label: '체크리스트 확인하기', route: '/checklist', icon: 'checkbox-outline' as const },
];

// ---------------------------------------------------------------------------
// Gauge constants
// ---------------------------------------------------------------------------

const GAUGE_SIZE = 200;
const RING_WIDTH = 14;

// Softer gauge segment colors matching new palette
const GAUGE_SEGMENT_COLORS: Record<RiskLevel, string> = {
  low: COLORS.sage,
  medium: '#D4A373',
  high: COLORS.coral,
  critical: '#C94535',
};

// ---------------------------------------------------------------------------
// Circular gauge built purely from RN Views.
// ---------------------------------------------------------------------------

const SEGMENT_COUNT = 72;

function CircularGauge({
  progress,
  color,
  bgColor,
}: {
  progress: number;
  color: string;
  bgColor: string;
}) {
  const segments = [];
  const filledCount = Math.round(progress * SEGMENT_COUNT);

  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const angle = (i / SEGMENT_COUNT) * 360 - 90;
    const isFilled = i < filledCount;
    segments.push(
      <View
        key={i}
        style={[
          segmentStyles.segment,
          {
            backgroundColor: isFilled ? color : bgColor,
            transform: [
              { rotate: `${angle}deg` },
              { translateY: -(GAUGE_SIZE / 2 - RING_WIDTH / 2) },
            ],
          },
        ]}
      />,
    );
  }

  return (
    <View style={segmentStyles.container}>
      {segments}
      <View style={segmentStyles.innerCircle} />
    </View>
  );
}

const segmentStyles = StyleSheet.create({
  container: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    position: 'absolute',
    width: 6,
    height: RING_WIDTH,
    borderRadius: 3,
  },
  innerCircle: {
    position: 'absolute',
    width: GAUGE_SIZE - RING_WIDTH * 2 - 12,
    height: GAUGE_SIZE - RING_WIDTH * 2 - 12,
    borderRadius: (GAUGE_SIZE - RING_WIDTH * 2 - 12) / 2,
    backgroundColor: COLORS.cream,
  },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function DiagnosisResultScreen() {
  const params = useLocalSearchParams<{ score: string; answers: string }>();
  const score = Number(params.score) || 0;
  const level = getRiskLevel(score);
  const riskInfo = RISK_LEVELS[level];
  const gaugeColor = GAUGE_SEGMENT_COLORS[level];

  // Animated fill progress (0 -> target)
  const [progress, setProgress] = useState(0);
  const maxScore = 30;
  const targetProgress = Math.min(score / maxScore, 1);

  useEffect(() => {
    let frame: ReturnType<typeof setTimeout>;
    const duration = 1200;
    const steps = 40;
    const stepDuration = duration / steps;
    let current = 0;

    const animate = () => {
      current += 1;
      const t = current / steps;
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased * targetProgress);
      if (current < steps) {
        frame = setTimeout(animate, stepDuration);
      }
    };
    frame = setTimeout(animate, 300);
    return () => clearTimeout(frame);
  }, [targetProgress]);

  // ------ handlers ------

  const handlePrimaryAction = () => {
    const action = PRIMARY_ACTIONS[level];
    if (action.isExternal) {
      Linking.openURL(action.route);
    } else {
      router.push(action.route as any);
    }
  };

  const handleSecondaryAction = (route: string) => {
    router.push(route as any);
  };

  // ------ render ------

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>진단 결과</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Lawyer review badge */}
        <View style={styles.lawyerBadge}>
          <Ionicons name="shield-checkmark" size={15} color={COLORS.gold} />
          <Text style={styles.lawyerBadgeText}>
            이 결과는 김창희 변호사가 검토하여 안내합니다
          </Text>
        </View>

        {/* Header subtitle */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>당신의 상황을 분석했습니다</Text>
        </View>

        {/* ---- Risk Gauge ---- */}
        <View style={styles.gaugeSection}>
          <View style={styles.gaugeWrapper}>
            <CircularGauge
              progress={progress}
              color={gaugeColor}
              bgColor={COLORS.borderLight}
            />
            {/* Center overlay */}
            <View style={styles.gaugeCenter}>
              <Text style={styles.gaugeEmoji}>{riskInfo.emoji}</Text>
              <Text style={[styles.gaugeScore, { color: riskInfo.color }]}>
                {score}점
              </Text>
              <Text style={[styles.gaugeLabel, { color: riskInfo.color }]}>
                {riskInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* ---- Description & Recommendation Card ---- */}
        <View style={styles.descriptionCard}>
          <View style={[styles.descriptionAccent, { backgroundColor: riskInfo.color }]} />
          <Text style={styles.descriptionTitle}>상황 분석</Text>
          <Text style={styles.descriptionText}>{riskInfo.description}</Text>
          <View style={styles.divider} />
          <Text style={styles.recommendationTitle}>권고 사항</Text>
          <Text style={styles.recommendationText}>
            {riskInfo.recommendation}
          </Text>
        </View>

        {/* ---- Primary Action Card ---- */}
        <View style={styles.primaryActionCard}>
          <Text style={styles.primaryActionLabel}>최우선 1가지</Text>
          <Text style={styles.primaryActionDescription}>
            지금 가장 먼저 해야 할 일이에요
          </Text>
          <TouchableOpacity
            style={[
              styles.primaryActionButton,
              level === 'critical' && styles.primaryActionButtonCritical,
            ]}
            onPress={handlePrimaryAction}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryActionButtonText}>
              {PRIMARY_ACTIONS[level].label}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---- Secondary Actions ---- */}
        <View style={styles.secondarySection}>
          <Text style={styles.secondarySectionTitle}>추가 조치</Text>
          {SECONDARY_ACTIONS.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.secondaryActionCard}
              onPress={() => handleSecondaryAction(action.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={action.icon}
                size={20}
                color={COLORS.gold}
                style={styles.secondaryActionIcon}
              />
              <Text style={styles.secondaryActionLabel}>{action.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ---- Footer ---- */}
        <View style={styles.footer}>
          <View style={styles.footerReviewBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.gold} />
            <Text style={styles.footerReview}>{LEGAL.aiDisclaimer}</Text>
          </View>
          <Text style={styles.footerDisclaimer}>{LEGAL.disclaimer}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.retakeButton}
          >
            <Text style={styles.retakeButtonText}>다시 진단하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    height: 56,
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
    color: COLORS.white,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Lawyer badge
  lawyerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xs,
  },
  lawyerBadgeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gold,
    fontWeight: '600',
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
  },

  // Gauge
  gaugeSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  gaugeWrapper: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeEmoji: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  gaugeScore: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '800',
  },
  gaugeLabel: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginTop: 2,
  },

  // Description Card
  descriptionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg + 4,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  descriptionAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
  descriptionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  recommendationTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  recommendationText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 26,
  },

  // Primary Action Card
  primaryActionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg + 4,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  primaryActionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  primaryActionDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  primaryActionButton: {
    backgroundColor: COLORS.gold,
    height: 52,
    borderRadius: RADIUS.full,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  primaryActionButtonCritical: {
    backgroundColor: COLORS.coral,
  },
  primaryActionButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Secondary Actions
  secondarySection: {
    marginBottom: SPACING.lg,
  },
  secondarySectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  secondaryActionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  secondaryActionIcon: {
    marginRight: SPACING.md,
  },
  secondaryActionLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.darkText,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerReviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  footerReview: {
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
    marginBottom: SPACING.lg,
  },
  retakeButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    minHeight: 56,
    justifyContent: 'center',
  },
  retakeButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gold,
    textDecorationLine: 'underline',
  },
});
