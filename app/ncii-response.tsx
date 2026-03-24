import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { EMERGENCY_STEPS } from '@/constants/ncii';
import StepWizard from '@/components/StepWizard';

const QUICK_LINKS = [
  { label: '삭제요청 템플릿', icon: 'document-text', route: '/takedown-templates', color: COLORS.blue },
  { label: '딥페이크 대응', icon: 'warning', route: '/deepfake-response', color: '#9B7EC8' },
  { label: '섹스토션 대응', icon: 'shield-half', route: '/sextortion-response', color: COLORS.coral },
  { label: '증거 수집', icon: 'finger-print', route: '/evidence-forensics', color: COLORS.gold },
] as const;

export default function NciiResponseScreen() {
  const wizardSteps = EMERGENCY_STEPS.map((es) => ({
    number: es.step,
    title: es.title,
    icon: es.icon,
    color: es.color,
    content: (
      <View>
        {/* Do list */}
        <Text style={styles.listHeader}>
          <Ionicons name="checkmark-circle" size={14} color={COLORS.success} /> 이렇게 하세요
        </Text>
        {es.doList.map((item, i) => (
          <View key={`do-${i}`} style={styles.listItem}>
            <Ionicons name="checkmark" size={14} color={COLORS.success} />
            <Text style={styles.listItemText}>{item}</Text>
          </View>
        ))}

        {/* Don't list */}
        <Text style={[styles.listHeader, { marginTop: SPACING.md }]}>
          <Ionicons name="close-circle" size={14} color={COLORS.danger} /> 하지 마세요
        </Text>
        {es.dontList.map((item, i) => (
          <View key={`dont-${i}`} style={styles.listItem}>
            <Ionicons name="close" size={14} color={COLORS.danger} />
            <Text style={styles.listItemText}>{item}</Text>
          </View>
        ))}
      </View>
    ),
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>긴급 대응</Text>
        <View style={styles.headerBackBtn} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Ionicons name="alert-circle" size={32} color={COLORS.white} />
          <Text style={styles.heroTitle}>디지털 성범죄 긴급 대응</Text>
          <Text style={styles.heroSubtitle}>
            침착하게, 단계별로 대응하세요. 당신은 혼자가 아닙니다.
          </Text>
        </View>

        {/* Emergency Call Buttons */}
        <View style={styles.emergencyRow}>
          <TouchableOpacity
            style={styles.callBtnD4U}
            onPress={() => Linking.openURL('tel:02-735-8994')}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={20} color={COLORS.white} />
            <View>
              <Text style={styles.callBtnLabel}>D4U센터</Text>
              <Text style={styles.callBtnNum}>02-735-8994</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callBtn112}
            onPress={() => Linking.openURL('tel:112')}
            activeOpacity={0.7}
          >
            <Ionicons name="shield" size={20} color={COLORS.white} />
            <View>
              <Text style={styles.callBtnLabel}>경찰 신고</Text>
              <Text style={styles.callBtnNum}>112</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Reviewer badge */}
        <View style={styles.reviewerBadge}>
          <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
          <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사</Text>
        </View>

        {/* 4-Step Emergency Protocol */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>긴급 대응 4단계</Text>
          <StepWizard steps={wizardSteps} />
        </View>

        {/* Quick Links Grid */}
        <Text style={styles.sectionTitle}>관련 가이드</Text>
        <View style={styles.quickGrid}>
          {QUICK_LINKS.map((link, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickCard}
              onPress={() => router.push(link.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: link.color + '18' }]}>
                <Ionicons name={link.icon as any} size={22} color={link.color} />
              </View>
              <Text style={styles.quickLabel}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.lightText} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          이 가이드는 일반적인 안내이며, 법률 조언을 대체할 수 없습니다.{'\n'}
          긴급 상황 시 즉시 112 또는 D4U센터에 연락하세요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  // Header — urgent coral
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.coral,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Scroll
  scrollArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Hero
  heroBanner: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Emergency buttons
  emergencyRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  callBtnD4U: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#0088CC',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOW.md,
  },
  callBtn112: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.coralDark,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOW.md,
  },
  callBtnLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.white,
    opacity: 0.85,
    fontWeight: '500',
  },
  callBtnNum: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    fontWeight: '800',
  },

  // Reviewer badge
  reviewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    marginBottom: SPACING.md,
  },
  reviewerBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },

  // Section
  sectionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.md,
  },

  // Do/Don't lists
  listHeader: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  listItemText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    lineHeight: 20,
  },

  // Quick links grid
  quickGrid: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },

  // Disclaimer
  disclaimer: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    lineHeight: 18,
    marginTop: SPACING.md,
  },
});
