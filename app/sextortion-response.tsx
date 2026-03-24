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
import { SEXTORTION_PROTOCOL, LEGAL_REFERENCES, D4U_CENTER } from '@/constants/ncii';

export default function SextortionResponseScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>섹스토션 대응</Text>
        <View style={styles.headerBackBtn} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CRITICAL WARNING BANNER */}
        <View style={styles.criticalBanner}>
          <Ionicons name="warning" size={36} color={COLORS.white} />
          <Text style={styles.criticalTitle}>절대 요구에 응하지 마세요</Text>
          <Text style={styles.criticalSubtext}>
            돈이나 추가 이미지를 보내면 요구가 멈추지 않습니다.{'\n'}
            응할수록 피해는 커집니다.
          </Text>
        </View>

        {/* Empathy message */}
        <View style={styles.empathyCard}>
          <Ionicons name="heart" size={24} color={COLORS.sage} />
          <Text style={styles.empathyTitle}>내 잘못이 아닙니다</Text>
          <Text style={styles.empathyText}>
            섹스토션은 범죄자의 잘못입니다. 피해자인 당신에게는 어떠한 잘못도 없습니다.
            도움을 요청하는 것은 용기 있는 행동입니다.
          </Text>
        </View>

        {/* Reviewer badge */}
        <View style={styles.reviewerBadge}>
          <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
          <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사</Text>
        </View>

        {/* 6-Step Protocol */}
        <Text style={styles.headingText}>대응 프로토콜 6단계</Text>
        <View style={styles.stepsContainer}>
          {SEXTORTION_PROTOCOL.map((step) => (
            <View
              key={step.step}
              style={[styles.stepCard, { borderLeftColor: step.color }]}
            >
              <View style={styles.stepHeaderRow}>
                <View style={[styles.stepIconWrap, { backgroundColor: step.color + '18' }]}>
                  <Ionicons name={step.icon as any} size={20} color={step.color} />
                </View>
                <View style={styles.stepNumBadge}>
                  <Text style={styles.stepNumText}>단계 {step.step}</Text>
                </View>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.description}</Text>
            </View>
          ))}
        </View>

        {/* Legal Penalties */}
        <Text style={styles.headingText}>가해자 처벌 규정</Text>
        <View style={styles.legalCard}>
          {/* Threat */}
          <View style={styles.legalSection}>
            <Text style={styles.legalLaw}>{LEGAL_REFERENCES.threat.law}</Text>
            <Text style={styles.legalTitle}>{LEGAL_REFERENCES.threat.title}</Text>
            <View style={styles.penaltyRow}>
              <Ionicons name="alert-circle" size={14} color={COLORS.coralDark} />
              <Text style={styles.penaltyText}>{LEGAL_REFERENCES.threat.penalty}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Distribution */}
          <View style={styles.legalSection}>
            <Text style={styles.legalLaw}>{LEGAL_REFERENCES.distribution.law}</Text>
            <Text style={styles.legalTitle}>{LEGAL_REFERENCES.distribution.title}</Text>
            <View style={styles.penaltyRow}>
              <Ionicons name="alert-circle" size={14} color={COLORS.coralDark} />
              <Text style={styles.penaltyText}>{LEGAL_REFERENCES.distribution.penalty}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Illegal filming */}
          <View style={styles.legalSection}>
            <Text style={styles.legalLaw}>{LEGAL_REFERENCES.illegalFilming.law}</Text>
            <Text style={styles.legalTitle}>{LEGAL_REFERENCES.illegalFilming.title}</Text>
            <View style={styles.penaltyRow}>
              <Ionicons name="alert-circle" size={14} color={COLORS.coralDark} />
              <Text style={styles.penaltyText}>{LEGAL_REFERENCES.illegalFilming.penalty}</Text>
            </View>
          </View>
        </View>

        {/* Emergency Contacts */}
        <Text style={styles.headingText}>긴급 연락처</Text>
        <View style={styles.contactsContainer}>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL('tel:112')}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIconWrap, { backgroundColor: COLORS.coralDark }]}>
              <Ionicons name="shield" size={22} color={COLORS.white} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>경찰 신고</Text>
              <Text style={styles.contactNum}>112</Text>
            </View>
            <Ionicons name="call" size={20} color={COLORS.coralDark} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL(`tel:${D4U_CENTER.phone}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIconWrap, { backgroundColor: '#0088CC' }]}>
              <Ionicons name="call" size={22} color={COLORS.white} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>D4U센터</Text>
              <Text style={styles.contactNum}>{D4U_CENTER.phone}</Text>
              <Text style={styles.contactHours}>{D4U_CENTER.hours}</Text>
            </View>
            <Ionicons name="call" size={20} color={'#0088CC'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL('tel:1366')}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIconWrap, { backgroundColor: COLORS.sage }]}>
              <Ionicons name="heart" size={22} color={COLORS.white} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>여성긴급전화</Text>
              <Text style={styles.contactNum}>1366</Text>
              <Text style={styles.contactHours}>24시간 상담</Text>
            </View>
            <Ionicons name="call" size={20} color={COLORS.sage} />
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          이 가이드는 일반적인 안내이며, 법률 조언을 대체할 수 없습니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.coral,
  },
  headerBackBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white },

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },

  // Critical warning banner
  criticalBanner: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  criticalTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.white,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  criticalSubtext: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    opacity: 0.92,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: SPACING.sm,
  },

  // Empathy message
  empathyCard: {
    backgroundColor: COLORS.sage + '18',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.sage + '30',
  },
  empathyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.sage,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  empathyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Reviewer badge
  reviewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    marginBottom: SPACING.md,
  },
  reviewerBadgeText: { fontSize: FONT_SIZE.xs, color: COLORS.gold, fontWeight: '600' },

  headingText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.md,
  },

  // Steps
  stepsContainer: { gap: SPACING.sm, marginBottom: SPACING.lg },
  stepCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOW.sm,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  stepIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumBadge: {
    backgroundColor: COLORS.warmGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  stepNumText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.slate },
  stepTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText, marginBottom: 4 },
  stepDesc: { fontSize: FONT_SIZE.sm, color: COLORS.slate, lineHeight: 20 },

  // Legal
  legalCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  legalSection: { marginBottom: SPACING.xs },
  legalLaw: { fontSize: FONT_SIZE.xs, color: COLORS.coral, fontWeight: '700', marginBottom: 2 },
  legalTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText, marginBottom: SPACING.xs },
  penaltyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.coral + '12',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  penaltyText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.coralDark },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: SPACING.md },

  // Contacts
  contactsContainer: { gap: SPACING.sm, marginBottom: SPACING.lg },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText },
  contactNum: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.darkText },
  contactHours: { fontSize: FONT_SIZE.xs, color: COLORS.slate },

  disclaimer: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    lineHeight: 18,
    marginTop: SPACING.md,
  },
});
