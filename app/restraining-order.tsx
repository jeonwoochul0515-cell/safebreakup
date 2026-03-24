import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import PageHeader from '@/components/PageHeader';
import StepWizard from '@/components/StepWizard';
import { LEGAL_PROCESS_STEPS } from '@/constants/stalking';

// ─── Related Law Summary ─────────────────────────────────────────────────────

const LAW_ARTICLES = [
  {
    article: '제2조',
    title: '스토킹 행위의 정의',
    content: '상대방의 의사에 반하여 정당한 이유 없이 접근, 미행, 감시, 연락, 물건 전달 등의 행위',
  },
  {
    article: '제18조',
    title: '스토킹 처벌',
    content: '3년 이하의 징역 또는 3,000만원 이하의 벌금',
  },
  {
    article: '제18조의2',
    title: '흉기 등 사용 가중처벌',
    content: '5년 이하의 징역 또는 5,000만원 이하의 벌금',
  },
  {
    article: '제9조',
    title: '잠정조치 (접근금지)',
    content: '법원이 접근금지, 통신제한, 거주지 퇴거 등을 명령',
  },
  {
    article: '제9조의2',
    title: '전자발찌 부착 (2024 개정)',
    content: '잠정조치 위반 시 전자장치 부착 명령 가능',
  },
];

const STEP_ICONS = [
  'document-text',
  'call',
  'create',
  'briefcase',
  'people',
  'shield-checkmark',
];

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function RestrainingOrderScreen() {
  const insets = useSafeAreaInsets();

  const wizardSteps = LEGAL_PROCESS_STEPS.map((step, idx) => ({
    number: step.step,
    title: step.title,
    icon: STEP_ICONS[idx] || 'ellipse',
    color: COLORS.gold,
    content: (
      <View>
        <Text style={styles.stepDesc}>{step.description}</Text>

        {/* Duration badge */}
        <View style={styles.durationBadge}>
          <Ionicons name="time" size={14} color={COLORS.gold} />
          <Text style={styles.durationText}>소요기간: {step.duration}</Text>
        </View>

        {/* Required documents */}
        <Text style={styles.docsTitle}>필요 서류</Text>
        {step.documents.map((doc, di) => (
          <View key={di} style={styles.docRow}>
            <Ionicons name="document" size={14} color={COLORS.slate} />
            <Text style={styles.docText}>{doc}</Text>
          </View>
        ))}
      </View>
    ),
  }));

  return (
    <View style={styles.root}>
      <PageHeader title="접근금지명령" subtitle="스토킹처벌법 법적 절차" showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introSection}>
          <View style={styles.introIconWrap}>
            <Ionicons name="ban" size={32} color={COLORS.coral} />
          </View>
          <Text style={styles.introTitle}>접근금지명령 신청 절차</Text>
          <Text style={styles.introDesc}>
            스토킹처벌법에 따라 법원에 접근금지 가처분을 신청할 수 있습니다.{'\n'}
            2024년 개정법으로 보호가 더욱 강화되었습니다.
          </Text>
        </View>

        {/* Lawyer badge */}
        <View style={styles.lawyerBadge}>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.gold} />
          <Text style={styles.lawyerBadgeText}>검토: 김창희 변호사 (법률사무소 청송)</Text>
        </View>

        {/* Step Wizard */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>신청 절차 (6단계)</Text>
          <StepWizard steps={wizardSteps} />
        </View>

        {/* Related Law Summary */}
        <View style={styles.lawSection}>
          <Text style={styles.sectionTitle}>스토킹처벌법 주요 조항</Text>
          <Text style={styles.lawSubtitle}>
            스토킹범죄의 처벌 등에 관한 법률 (2024 개정)
          </Text>

          {LAW_ARTICLES.map((law, idx) => (
            <View key={idx} style={styles.lawCard}>
              <View style={styles.lawArticleBadge}>
                <Text style={styles.lawArticleText}>{law.article}</Text>
              </View>
              <Text style={styles.lawTitle}>{law.title}</Text>
              <Text style={styles.lawContent}>{law.content}</Text>
            </View>
          ))}
        </View>

        {/* Key info box */}
        <View style={styles.infoBox}>
          <View style={styles.infoBoxHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.blue} />
            <Text style={styles.infoBoxTitle}>알아두세요</Text>
          </View>
          <Text style={styles.infoBoxText}>
            {'\u2022'} 2024년 개정법: 피해자 동의 없이도 수사 진행 가능{'\n'}
            {'\u2022'} 잠정조치 위반 시 전자발찌 부착 가능{'\n'}
            {'\u2022'} 스토킹은 반의사불벌죄가 아닙니다 (합의해도 처벌){'\n'}
            {'\u2022'} 디지털 스토킹(SNS, 이메일 등)도 포함됩니다
          </Text>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaPrimary}
            activeOpacity={0.85}
            onPress={() => router.push('/consultation' as any)}
          >
            <Ionicons name="chatbubbles" size={20} color={COLORS.white} />
            <Text style={styles.ctaPrimaryText}>변호사와 함께 준비하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctaSecondary}
            activeOpacity={0.7}
            onPress={() => router.push('/stalking-log' as any)}
          >
            <Ionicons name="create" size={18} color={COLORS.gold} />
            <Text style={styles.ctaSecondaryText}>스토킹 기록 시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctaSecondary}
            activeOpacity={0.7}
            onPress={() => router.push('/evidence' as any)}
          >
            <Ionicons name="folder-open" size={18} color={COLORS.gold} />
            <Text style={styles.ctaSecondaryText}>증거 보관함으로 이동</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            본 안내는 일반적인 법률 정보이며, 구체적인 사안에 대해서는{'\n'}
            변호사 상담을 받으시기 바랍니다.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scroll: {
    flex: 1,
  },

  /* Intro */
  introSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
  },
  introIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  introTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.navy,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  introDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.65,
    marginTop: SPACING.md,
  },

  /* Lawyer badge */
  lawyerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(196,149,106,0.08)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(196,149,106,0.2)',
  },
  lawyerBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gold,
  },

  /* Steps */
  stepsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.md,
  },

  stepDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    lineHeight: FONT_SIZE.md * 1.6,
    marginBottom: SPACING.md,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(196,149,106,0.1)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  durationText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },
  docsTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs + 2,
  },
  docText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },

  /* Law articles */
  lawSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  lawSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.lg,
  },
  lawCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.navy,
    ...SHADOW.sm,
  },
  lawArticleBadge: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  lawArticleText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  lawTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  lawContent: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: FONT_SIZE.sm * 1.6,
  },

  /* Info box */
  infoBox: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  infoBoxTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  infoBoxText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: FONT_SIZE.sm * 1.8,
  },

  /* CTA */
  ctaSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    minHeight: 56,
    ...SHADOW.md,
  },
  ctaPrimaryText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.cardBg,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    minHeight: 56,
  },
  ctaSecondaryText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.gold,
  },

  /* Footer */
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: FONT_SIZE.xs * 1.6,
  },
});
