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
import { DEEPFAKE_TIPS, LEGAL_REFERENCES, D4U_CENTER } from '@/constants/ncii';

const EVIDENCE_STEPS = [
  { text: '딥페이크 콘텐츠의 URL을 모두 저장하세요', icon: 'link' },
  { text: '스크린샷 촬영 시 날짜/시간이 보이게 하세요', icon: 'camera' },
  { text: '원본 이미지와 딥페이크 이미지를 함께 보관하세요', icon: 'images' },
  { text: '유포 경로 및 게시자 정보를 기록하세요', icon: 'document-text' },
  { text: '증거 파일의 해시값을 생성하여 무결성을 보장하세요', icon: 'finger-print' },
];

export default function DeepfakeResponseScreen() {
  const threatLaw = LEGAL_REFERENCES.threat;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>딥페이크 대응</Text>
        <View style={styles.headerBackBtn} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Reviewer badge */}
        <View style={styles.reviewerBadge}>
          <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
          <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사</Text>
        </View>

        {/* Stat Highlight */}
        <View style={styles.statBanner}>
          <Ionicons name="trending-up" size={28} color={COLORS.coral} />
          <Text style={styles.statNumber}>568%</Text>
          <Text style={styles.statLabel}>2024년 딥페이크 피해 급증률</Text>
          <Text style={styles.statSubtext}>
            딥페이크 성범죄는 빠르게 증가하고 있습니다.{'\n'}
            피해자는 절대 잘못이 없습니다.
          </Text>
        </View>

        {/* Educational Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="information-circle" size={20} color={COLORS.blue} />
            <Text style={styles.sectionTitle}>딥페이크란?</Text>
          </View>
          <Text style={styles.sectionBody}>
            딥페이크(Deepfake)는 인공지능 기술을 이용하여 사람의 얼굴이나 신체를 다른 영상에 합성하는 기술입니다.
            최근에는 피해자의 얼굴을 음란물에 합성하는 범죄가 급증하고 있으며,
            이는 성폭력범죄로 엄중히 처벌됩니다.
          </Text>
          <Text style={styles.sectionBody}>
            SNS, 메신저에 공개된 사진만으로도 딥페이크 피해를 입을 수 있으므로,
            개인 사진 공유에 주의가 필요합니다.
          </Text>
        </View>

        {/* Identification Tips */}
        <Text style={styles.headingText}>딥페이크 식별 방법</Text>
        <View style={styles.tipsContainer}>
          {DEEPFAKE_TIPS.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipIconWrap}>
                <Ionicons name={tip.icon as any} size={22} color={COLORS.blue} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Legal Framework */}
        <Text style={styles.headingText}>법적 근거</Text>
        <View style={styles.legalCard}>
          <View style={styles.legalHeaderRow}>
            <Ionicons name="scale" size={18} color={COLORS.coral} />
            <Text style={styles.legalLaw}>{threatLaw.law}</Text>
          </View>
          <Text style={styles.legalTitle}>{threatLaw.title}</Text>
          <Text style={styles.legalDesc}>{threatLaw.description}</Text>
          <View style={styles.penaltyBadge}>
            <Ionicons name="alert-circle" size={14} color={COLORS.coralDark} />
            <Text style={styles.penaltyText}>{threatLaw.penalty}</Text>
          </View>

          {/* Additional laws */}
          <View style={styles.divider} />
          <View style={styles.legalHeaderRow}>
            <Ionicons name="scale" size={18} color={COLORS.coral} />
            <Text style={styles.legalLaw}>{LEGAL_REFERENCES.distribution.law}</Text>
          </View>
          <Text style={styles.legalTitle}>{LEGAL_REFERENCES.distribution.title}</Text>
          <Text style={styles.legalDesc}>{LEGAL_REFERENCES.distribution.description}</Text>
          <View style={styles.penaltyBadge}>
            <Ionicons name="alert-circle" size={14} color={COLORS.coralDark} />
            <Text style={styles.penaltyText}>{LEGAL_REFERENCES.distribution.penalty}</Text>
          </View>
        </View>

        {/* D4U Center Services */}
        <Text style={styles.headingText}>D4U센터 딥페이크 전문 지원</Text>
        <View style={styles.d4uCard}>
          <Text style={styles.d4uName}>{D4U_CENTER.name}</Text>
          <Text style={styles.d4uHours}>{D4U_CENTER.hours}</Text>
          {D4U_CENTER.services.map((service, i) => (
            <View key={i} style={styles.d4uServiceRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.sage} />
              <Text style={styles.d4uServiceText}>{service}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.d4uCallBtn}
            onPress={() => Linking.openURL(`tel:${D4U_CENTER.phone}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={18} color={COLORS.white} />
            <Text style={styles.d4uCallText}>{D4U_CENTER.phone} 전화하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.d4uWebBtn}
            onPress={() => Linking.openURL(D4U_CENTER.website)}
            activeOpacity={0.7}
          >
            <Ionicons name="globe" size={18} color={COLORS.blue} />
            <Text style={styles.d4uWebText}>홈페이지 방문</Text>
          </TouchableOpacity>
        </View>

        {/* Evidence Collection Guide */}
        <Text style={styles.headingText}>증거 수집 가이드</Text>
        <View style={styles.evidenceCard}>
          {EVIDENCE_STEPS.map((step, i) => (
            <View key={i} style={styles.evidenceRow}>
              <View style={styles.evidenceNumWrap}>
                <Text style={styles.evidenceNum}>{i + 1}</Text>
              </View>
              <Ionicons name={step.icon as any} size={16} color={COLORS.gold} />
              <Text style={styles.evidenceText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Emergency Contacts */}
        <Text style={styles.headingText}>긴급 연락처</Text>
        <View style={styles.emergencyRow}>
          <TouchableOpacity
            style={styles.emergencyBtn}
            onPress={() => Linking.openURL('tel:112')}
            activeOpacity={0.7}
          >
            <Ionicons name="shield" size={20} color={COLORS.white} />
            <Text style={styles.emergencyBtnLabel}>경찰</Text>
            <Text style={styles.emergencyBtnNum}>112</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.emergencyBtn, { backgroundColor: '#0088CC' }]}
            onPress={() => Linking.openURL('tel:02-735-8994')}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={20} color={COLORS.white} />
            <Text style={styles.emergencyBtnLabel}>D4U센터</Text>
            <Text style={styles.emergencyBtnNum}>02-735-8994</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.emergencyBtn, { backgroundColor: COLORS.sage }]}
            onPress={() => Linking.openURL('tel:1366')}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={20} color={COLORS.white} />
            <Text style={styles.emergencyBtnLabel}>여성긴급전화</Text>
            <Text style={styles.emergencyBtnNum}>1366</Text>
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
    backgroundColor: COLORS.navy,
  },
  headerBackBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white },

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },

  reviewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  reviewerBadgeText: { fontSize: FONT_SIZE.xs, color: COLORS.gold, fontWeight: '600' },

  // Stat banner
  statBanner: {
    backgroundColor: COLORS.coral + '12',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.coral + '30',
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.coral,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.coralDark,
    marginTop: SPACING.xs,
  },
  statSubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: SPACING.sm,
  },

  // Section card
  sectionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  sectionBody: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },

  headingText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.md,
  },

  // Tips
  tipsContainer: { gap: SPACING.sm, marginBottom: SPACING.lg },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  tipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText, marginBottom: 2 },
  tipDesc: { fontSize: FONT_SIZE.sm, color: COLORS.slate, lineHeight: 20 },

  // Legal
  legalCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.coral,
    ...SHADOW.sm,
  },
  legalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.xs },
  legalLaw: { fontSize: FONT_SIZE.xs, color: COLORS.coral, fontWeight: '700' },
  legalTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText, marginBottom: SPACING.xs },
  legalDesc: { fontSize: FONT_SIZE.sm, color: COLORS.slate, lineHeight: 20, marginBottom: SPACING.sm },
  penaltyBadge: {
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

  // D4U
  d4uCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  d4uName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText, marginBottom: 2 },
  d4uHours: { fontSize: FONT_SIZE.sm, color: COLORS.sage, fontWeight: '600', marginBottom: SPACING.md },
  d4uServiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  d4uServiceText: { fontSize: FONT_SIZE.sm, color: COLORS.darkText },
  d4uCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#0088CC',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
  },
  d4uCallText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white },
  d4uWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.blue + '15',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
  },
  d4uWebText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.blue },

  // Evidence guide
  evidenceCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  evidenceNumWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceNum: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.gold },
  evidenceText: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.darkText, lineHeight: 20 },

  // Emergency contacts
  emergencyRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  emergencyBtn: {
    flex: 1,
    backgroundColor: COLORS.coralDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    ...SHADOW.sm,
  },
  emergencyBtnLabel: { fontSize: FONT_SIZE.xs, color: COLORS.white, opacity: 0.85 },
  emergencyBtnNum: { fontSize: FONT_SIZE.sm, fontWeight: '800', color: COLORS.white },

  disclaimer: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    lineHeight: 18,
    marginTop: SPACING.md,
  },
});
