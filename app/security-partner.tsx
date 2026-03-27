import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import {
  SECURITY_PARTNERS,
  ANSIM_PACK_TIERS,
  INTEGRATION_FLOW,
} from '@/constants/security-partner';

// ─── FAQ Data ────────────────────────────────────────────────────────────────
const FAQ_SECURITY = [
  { q: '캡스 출동은 얼마나 빨리 오나요?', a: '평균 5분 이내 도착, 24시간 운영됩니다. 안전이별 SOS 신호 수신 즉시 가장 가까운 출동 요원이 배치됩니다.' },
  { q: '기존 캡스 고객도 할인되나요?', a: '기존 고객은 안전이별 구독만 추가하면 연동됩니다. 별도 캡스 재가입 없이 기존 서비스에 안전이별 SOS 연계 기능이 추가됩니다.' },
  { q: '계약 기간이 있나요?', a: '최소 6개월 계약이며, 이후 월단위로 자동 연장됩니다. 해지 시 1개월 전 통보하시면 위약금 없이 해지 가능합니다.' },
  { q: '설치 시 상대방에게 알려지나요?', a: '은밀하게 설치 가능합니다. 외부에서 보이지 않는 초소형 CCTV, 무선 도어센서 등 상대방이 인지할 수 없는 제품을 선택할 수 있습니다.' },
];

// ─── FAQ Item Component ──────────────────────────────────────────────────────
function FAQItem({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable style={styles.faqItem} onPress={() => setOpen(!open)}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ}>{item.q}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.lightText} />
      </View>
      {open && <Text style={styles.faqA}>{item.a}</Text>}
    </Pressable>
  );
}

// ─── Integration Flow Card ───────────────────────────────────────────────────
function FlowCard({ item }: { item: typeof INTEGRATION_FLOW[number] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      style={styles.flowCard}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.flowCardHeader}>
        <View style={[styles.flowIconWrap, { backgroundColor: item.color + '18' }]}>
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.flowCardTitle}>{item.title}</Text>
          <Text style={styles.flowCardDesc}>{item.description}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.lightText}
        />
      </View>
      {expanded && (
        <View style={styles.flowSteps}>
          {item.flow.map((step, idx) => (
            <View key={idx} style={styles.flowStepRow}>
              <View style={[styles.flowBadge, { backgroundColor: item.color }]}>
                <Text style={styles.flowBadgeText}>{idx + 1}</Text>
              </View>
              <Text style={styles.flowStepText}>{step}</Text>
              {idx < item.flow.length - 1 && (
                <View style={styles.flowArrow}>
                  <Ionicons name="arrow-down" size={12} color={COLORS.lightText} />
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function SecurityPartnerScreen() {
  const insets = useSafeAreaInsets();
  const adtCaps = SECURITY_PARTNERS.adtCaps;

  const handleConsultation = (tierName: string) => {
    Alert.alert(
      '상담 신청 완료',
      `캡스 보안 상담이 신청되었습니다.\n24시간 내 연락드립니다.\n\n선택 상품: ${tierName}`,
      [{ text: '확인' }]
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>보안 제휴 서비스</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>

        {/* ═══ Hero Section ═══ */}
        <View style={styles.hero}>
          <View style={styles.heroBrandRow}>
            <View style={styles.heroBrandIcon}>
              <Ionicons name="shield-half" size={28} color={COLORS.gold} />
            </View>
            <Text style={styles.heroBrandX}>×</Text>
            <View style={styles.heroBrandIcon}>
              <Ionicons name={adtCaps.logo as any} size={28} color={adtCaps.color} />
            </View>
          </View>
          <Text style={styles.heroTitle}>안전이별 × ADT캡스</Text>
          <Text style={styles.heroSub}>법률 보호 + 물리적 보안, 원스톱 안심 시스템</Text>
          <Text style={styles.heroTagline}>SOS 한 번이면 출동합니다</Text>
          <TouchableOpacity style={styles.heroCTA} activeOpacity={0.8}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.white} />
            <Text style={styles.heroCTAText}>안심팩 알아보기</Text>
          </TouchableOpacity>
          <View style={styles.legalBadge}>
            <Ionicons name="business" size={12} color={COLORS.gold} />
            <Text style={styles.legalBadgeText}>경비업법 등록 전문 보안업체</Text>
          </View>
        </View>

        {/* ═══ Integration Flow Section ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>통합 연동 시스템</Text>
          <Text style={styles.sectionSub}>안전이별와 ADT캡스가 하나로 연결됩니다</Text>
          {INTEGRATION_FLOW.map((item) => (
            <FlowCard key={item.step} item={item} />
          ))}
        </View>

        {/* ═══ Individual Services Section ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개별 서비스</Text>
          <Text style={styles.sectionSub}>필요한 보안 서비스만 개별로 이용할 수 있습니다</Text>
          {adtCaps.services.map((svc) => (
            <View key={svc.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={[styles.serviceIconWrap, { backgroundColor: COLORS.blue + '15' }]}>
                  <Ionicons name={svc.icon as any} size={22} color={COLORS.blue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName}>{svc.name}</Text>
                  <Text style={styles.serviceDesc}>{svc.desc}</Text>
                </View>
              </View>
              <View style={styles.servicePriceBadge}>
                <Ionicons name="pricetag" size={12} color={COLORS.gold} />
                <Text style={styles.servicePriceText}>{svc.price}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ═══ Ansim Pack Pricing Section ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>안심팩 가격</Text>
          <Text style={styles.sectionSub}>안전이별 + ADT캡스 통합 패키지</Text>
          {ANSIM_PACK_TIERS.map((tier) => (
            <View
              key={tier.id}
              style={[
                styles.tierCard,
                tier.recommended && styles.tierCardRecommended,
              ]}
            >
              {tier.recommended && (
                <View style={styles.recommendBadge}>
                  <Ionicons name="star" size={10} color={COLORS.white} />
                  <Text style={styles.recommendText}> 추천</Text>
                </View>
              )}
              <View style={[styles.tierColorBar, { backgroundColor: tier.color }]} />
              <Text style={styles.tierName}>{tier.name}</Text>
              <Text style={[styles.tierPrice, { color: tier.color }]}>{tier.monthlyPrice}</Text>
              <Text style={styles.tierDesc}>{tier.description}</Text>

              <View style={styles.tierFeatures}>
                {tier.includes.map((feat, idx) => (
                  <View key={idx} style={styles.tierFeatureRow}>
                    <Ionicons
                      name={feat.included ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={feat.included ? COLORS.success : COLORS.lightText}
                    />
                    <Text
                      style={[
                        styles.tierFeatureText,
                        !feat.included && styles.tierFeatureDisabled,
                      ]}
                    >
                      {feat.item}
                    </Text>
                    {feat.value ? (
                      <Text style={styles.tierFeatureValue}>{feat.value}</Text>
                    ) : null}
                  </View>
                ))}
              </View>

              {tier.savings ? (
                <View style={styles.savingsBadge}>
                  <Ionicons name="trending-down" size={14} color={COLORS.sage} />
                  <Text style={styles.savingsText}>{tier.savings}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.tierCTA, tier.recommended && styles.tierCTARecommended]}
                onPress={() => handleConsultation(tier.name)}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.white} />
                <Text style={styles.tierCTAText}>상담 신청</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ═══ Trust Section ═══ */}
        <View style={styles.trustSection}>
          <View style={styles.trustTitleRow}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.gold} />
            <Text style={styles.trustTitle}>ADT캡스: 대한민국 보안 1위</Text>
          </View>
          <Text style={styles.trustSubtitle}>전국 24시간 출동 체계</Text>
          <Text style={styles.trustSubtitle}>경비업법 등록 전문 보안업체</Text>

          <View style={styles.trustBadgesRow}>
            <View style={styles.trustBadge}>
              <Ionicons name="time" size={20} color={COLORS.gold} />
              <Text style={styles.trustBadgeLabel}>24시간</Text>
              <Text style={styles.trustBadgeSub}>연중무휴</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="location" size={20} color={COLORS.gold} />
              <Text style={styles.trustBadgeLabel}>전국망</Text>
              <Text style={styles.trustBadgeSub}>출동 체계</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="ribbon" size={20} color={COLORS.gold} />
              <Text style={styles.trustBadgeLabel}>보안 1위</Text>
              <Text style={styles.trustBadgeSub}>업계 최대</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="lock-closed" size={20} color={COLORS.gold} />
              <Text style={styles.trustBadgeLabel}>경비업법</Text>
              <Text style={styles.trustBadgeSub}>정식 등록</Text>
            </View>
          </View>
        </View>

        {/* ═══ FAQ Section ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
          {FAQ_SECURITY.map((item, i) => (
            <FAQItem key={i} item={item} />
          ))}
        </View>

        {/* ═══ Emergency Section ═══ */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>지금 위험한 상황이라면</Text>
          <View style={styles.emergencyRow}>
            <TouchableOpacity style={styles.emergencyBtn} onPress={() => Linking.openURL('tel:112')}>
              <Ionicons name="call" size={18} color={COLORS.white} />
              <Text style={styles.emergencyBtnText}>112 경찰</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.emergencyBtn, { backgroundColor: COLORS.gold }]}
              onPress={() => Linking.openURL('tel:1366')}
            >
              <Ionicons name="heart" size={18} color={COLORS.white} />
              <Text style={styles.emergencyBtnText}>1366 여성긴급</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.cream },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.navy, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white },

  // Hero
  hero: { backgroundColor: COLORS.navy, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, alignItems: 'center' },
  heroBrandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.lg },
  heroBrandIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  heroBrandX: { fontSize: FONT_SIZE.xl, fontWeight: '300', color: COLORS.goldLight, marginHorizontal: SPACING.md },
  heroTitle: { fontSize: FONT_SIZE.hero, fontWeight: '900', color: COLORS.white, textAlign: 'center' },
  heroSub: { fontSize: FONT_SIZE.md, color: COLORS.goldLight, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 24 },
  heroTagline: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white, textAlign: 'center', marginTop: SPACING.md },
  heroCTA: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gold, paddingVertical: 14, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.full, marginTop: SPACING.lg },
  heroCTAText: { color: COLORS.white, fontSize: FONT_SIZE.lg, fontWeight: '800', marginLeft: SPACING.sm },
  legalBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginTop: SPACING.md },
  legalBadgeText: { fontSize: FONT_SIZE.xs, color: COLORS.goldLight, marginLeft: 6 },

  // Section
  section: { paddingHorizontal: SPACING.md, paddingTop: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.darkText, marginBottom: SPACING.xs },
  sectionSub: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginBottom: SPACING.md, lineHeight: 20 },

  // Flow Cards
  flowCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOW.sm },
  flowCardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  flowIconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  flowCardTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText, marginBottom: 4 },
  flowCardDesc: { fontSize: FONT_SIZE.sm, color: COLORS.slate, lineHeight: 20 },
  flowSteps: { marginTop: SPACING.md, paddingLeft: SPACING.xs },
  flowStepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, position: 'relative' },
  flowBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  flowBadgeText: { fontSize: FONT_SIZE.xs, fontWeight: '800', color: COLORS.white },
  flowStepText: { fontSize: FONT_SIZE.sm, color: COLORS.darkText, flex: 1, fontWeight: '500' },
  flowArrow: { position: 'absolute', left: 6, top: 26 },

  // Service Cards
  serviceCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOW.sm },
  serviceHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  serviceIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  serviceName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText },
  serviceDesc: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginTop: 2, lineHeight: 20 },
  servicePriceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gold + '12', borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, marginTop: SPACING.sm, alignSelf: 'flex-start' },
  servicePriceText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.gold, marginLeft: 6 },

  // Tier Cards (Pricing)
  tierCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderLight, overflow: 'hidden', ...SHADOW.md },
  tierCardRecommended: { borderColor: COLORS.gold, borderWidth: 2 },
  tierColorBar: { height: 4, borderRadius: 2, marginBottom: SPACING.md },
  tierName: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.darkText },
  tierPrice: { fontSize: 32, fontWeight: '900', marginTop: SPACING.xs },
  tierDesc: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginTop: SPACING.xs, marginBottom: SPACING.md },
  tierFeatures: { marginBottom: SPACING.md },
  tierFeatureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tierFeatureText: { fontSize: FONT_SIZE.sm, color: COLORS.darkText, marginLeft: SPACING.sm, flex: 1 },
  tierFeatureDisabled: { color: COLORS.lightText, textDecorationLine: 'line-through' },
  tierFeatureValue: { fontSize: FONT_SIZE.xs, color: COLORS.slate, marginLeft: SPACING.xs },
  recommendBadge: { position: 'absolute', top: -1, right: 16, backgroundColor: COLORS.gold, borderBottomLeftRadius: RADIUS.sm, borderBottomRightRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', zIndex: 1 },
  recommendText: { fontSize: 11, fontWeight: '800', color: COLORS.white },
  savingsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.sage + '15', borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, marginBottom: SPACING.md, alignSelf: 'flex-start' },
  savingsText: { fontSize: FONT_SIZE.xs, color: COLORS.sage, fontWeight: '600', marginLeft: 6 },
  tierCTA: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.navy, paddingVertical: 14, borderRadius: RADIUS.md },
  tierCTARecommended: { backgroundColor: COLORS.gold },
  tierCTAText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: '700', marginLeft: 8 },

  // Trust Section
  trustSection: { alignItems: 'center', paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.lg, backgroundColor: COLORS.navy, marginTop: SPACING.xl },
  trustTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  trustTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.white, marginLeft: SPACING.sm },
  trustSubtitle: { fontSize: FONT_SIZE.md, color: COLORS.goldLight, marginTop: SPACING.xs },
  trustBadgesRow: { flexDirection: 'row', marginTop: SPACING.lg, flexWrap: 'wrap', justifyContent: 'center' },
  trustBadge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, marginHorizontal: SPACING.xs, marginBottom: SPACING.sm, minWidth: 76 },
  trustBadgeLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.white, marginTop: SPACING.xs },
  trustBadgeSub: { fontSize: FONT_SIZE.xs, color: COLORS.goldLight, marginTop: 2 },

  // FAQ
  faqItem: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.darkText, flex: 1, marginRight: SPACING.sm },
  faqA: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginTop: SPACING.sm, lineHeight: 22 },

  // Emergency
  emergencySection: { alignItems: 'center', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg, backgroundColor: COLORS.warmGray },
  emergencyTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText, marginBottom: SPACING.md },
  emergencyRow: { flexDirection: 'row' },
  emergencyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.coral, paddingVertical: 12, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, marginHorizontal: SPACING.xs },
  emergencyBtnText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: '700', marginLeft: 6 },
});
