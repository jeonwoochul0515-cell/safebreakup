import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Section 2 Stats ─────────────────────────────────────────────────────────

const STATS = [
  {
    number: '37명',
    label: '매일',
    sub: '데이트폭력 검거 (2024)',
    icon: 'alert-circle' as const,
  },
  {
    number: '2.22%',
    label: '구속률',
    sub: '경찰이 잡아주지 않습니다',
    icon: 'lock-open' as const,
  },
  {
    number: '568%↑',
    label: '딥페이크',
    sub: '디지털 성범죄 폭발 증가',
    icon: 'trending-up' as const,
  },
];

// ─── Section 3 Value Props ───────────────────────────────────────────────────

const VALUE_PROPS = [
  {
    icon: 'chatbubbles' as const,
    title: 'AI 법률사무장',
    desc: '24시간 법률 상담 AI가\n당신의 상황을 분석합니다',
    color: COLORS.gold,
  },
  {
    icon: 'shield-checkmark' as const,
    title: '위험도 정밀진단',
    desc: '캠벨 위험도 평가 기반\n20문항 과학적 진단',
    color: COLORS.coral,
  },
  {
    icon: 'folder-open' as const,
    title: '법정증거 포렌식',
    desc: '타임스탬프·해시 검증\n법적 효력 있는 증거 보관',
    color: COLORS.blue,
  },
  {
    icon: 'eye-off' as const,
    title: '은밀모드',
    desc: '계산기로 위장, 알림 숨김\n상대방이 절대 모릅니다',
    color: COLORS.sage,
  },
];

// ─── Section 4 Module Groups ─────────────────────────────────────────────────

const MODULE_GROUPS = [
  {
    title: '이별 전 보호',
    subtitle: '안전한 이별 준비',
    icon: 'shield-half' as const,
    gradient: ['#2D2B3D', '#3D3A5E'],
    modules: ['위험도진단', '가스라이팅테스트', '안전계획', '법률경고장', 'AI상담'],
  },
  {
    title: '이별 후 보호',
    subtitle: '스토킹·협박 대응',
    icon: 'shield' as const,
    gradient: ['#C4956A', '#E0C4A8'],
    modules: ['스토킹기록', '접근금지명령', '증거보관함', '보안감사', '경고장발송', '안전장소', '디지털보안'],
  },
  {
    title: '디지털 성범죄',
    subtitle: '불법촬영·딥페이크 대응',
    icon: 'phone-portrait' as const,
    gradient: ['#8B6F8E', '#B5A0C0'],
    modules: ['불법촬영대응', '삭제요청', '딥페이크신고', '디지털포렌식'],
  },
  {
    title: '마음 치유',
    subtitle: '트라우마 회복 프로그램',
    icon: 'heart' as const,
    gradient: ['#7A9E7E', '#B5D1B8'],
    modules: ['트라우마회복', '감정일기', '호흡명상', '자존감회복', '상담연결', '커뮤니티'],
  },
  {
    title: '증거·법률',
    subtitle: '전문 법률 서비스',
    icon: 'document-text' as const,
    gradient: ['#6B8CC7', '#9BB4DB'],
    modules: ['증거포렌식', '법률상담', '경고장', '고소장작성', '손해배상'],
  },
  {
    title: '강압적 통제',
    subtitle: '보이지 않는 폭력 진단',
    icon: 'lock-closed' as const,
    gradient: ['#E07A5F', '#F0A08C'],
    modules: ['통제진단', '경제적학대', '고립평가', '감정적학대'],
  },
];

// ─── Section 5 Testimonials ──────────────────────────────────────────────────

const TESTIMONIALS_BA = [
  {
    before: '두렵고 막막했어요.\n어디서부터 시작해야 할지...',
    after: '법적 대응을 시작했어요.\n변호사님이 함께하니 용기가 생겼습니다.',
    author: '20대 A님',
  },
  {
    before: '증거가 없었어요.\n카톡도 다 삭제했는데...',
    after: '체계적으로 증거를 수집했어요.\n포렌식으로 삭제된 것도 복구했습니다.',
    author: '30대 B님',
  },
  {
    before: '혼자였어요.\n아무에게도 말할 수 없었죠.',
    after: '변호사와 함께합니다.\n더 이상 혼자가 아닙니다.',
    author: '20대 C님',
  },
];

// ─── Section 8 FAQ ───────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: '은밀모드란 무엇인가요?',
    a: '앱 아이콘을 계산기로 위장하고, 모든 알림을 숨겨서 상대방이 이 앱의 존재를 절대 알 수 없도록 하는 기능입니다. 비밀번호로 잠겨 있으며, 앱 내 모든 데이터는 암호화됩니다.',
  },
  {
    q: '수집한 증거가 법적 효력이 있나요?',
    a: '네. 안전이별에서 보관하는 증거는 타임스탬프와 해시값이 자동 생성되어 위변조 여부를 검증할 수 있습니다. 변호사가 직접 검토하여 법정에서 활용 가능한 형태로 정리해 드립니다.',
  },
  {
    q: '내 개인정보는 안전한가요?',
    a: '모든 데이터는 AES-256 암호화로 저장되며, 서버에도 암호화된 상태로 전송됩니다. 개인정보는 법률사무소 수준의 보안으로 관리되며, 제3자에게 절대 공유되지 않습니다.',
  },
  {
    q: '구독을 해약하고 싶으면 어떻게 하나요?',
    a: '설정 > 구독 관리에서 언제든 해약할 수 있습니다. 해약 후에도 현재 결제 기간까지는 모든 기능을 이용하실 수 있으며, 보관된 증거 자료는 삭제되지 않습니다.',
  },
  {
    q: '상대방에게 이 앱 사용이 알려질 수 있나요?',
    a: '절대 알려지지 않습니다. 은밀모드(계산기 위장), 알림 숨김, 앱 이름 변경 기능을 제공합니다. 상대방의 기기에 어떤 알림이나 흔적도 남지 않습니다.',
  },
];

// ─── FAQ Item Component ──────────────────────────────────────────────────────

function FAQAccordion({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen(!open)} style={styles.faqItem}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ}>{item.q}</Text>
        <View style={styles.faqChevron}>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.lightText}
          />
        </View>
      </View>
      {open && <Text style={styles.faqA}>{item.a}</Text>}
    </Pressable>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const [billingAnnual, setBillingAnnual] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleStart = () => {
    router.push('/diagnosis' as any);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* ================================================================ */}
        {/* SECTION 1 — HERO                                                  */}
        {/* ================================================================ */}
        <View style={styles.heroSection}>
          {/* Decorative shield */}
          <View style={styles.heroShieldOuter}>
            <View style={styles.heroShieldInner}>
              <Ionicons name="shield-checkmark" size={40} color={COLORS.gold} />
            </View>
          </View>

          <Text style={styles.heroTitle}>
            {'당신은\n혼자가 아닙니다'}
          </Text>

          <Text style={styles.heroSubtitle}>
            {'대한민국 최초, 변호사가 직접 운영하는\n안전이별 법률 플랫폼'}
          </Text>

          {/* Gold badge */}
          <View style={styles.heroBadge}>
            <Ionicons name="ribbon" size={16} color={COLORS.gold} />
            <Text style={styles.heroBadgeText}>법률사무소 청송 × AI 기술</Text>
          </View>

          <TouchableOpacity
            style={styles.heroCtaBtn}
            activeOpacity={0.85}
            onPress={handleStart}
          >
            <Text style={styles.heroCtaBtnText}>지금 시작하기</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>

          {/* Subtle trust line */}
          <Text style={styles.heroTrustLine}>
            10,000+ 이용자 · 변호사 직접 운영 · 암호화 보호
          </Text>
        </View>

        {/* ================================================================ */}
        {/* SECTION 2 — STATS (navy bg)                                       */}
        {/* ================================================================ */}
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>왜 안전이별가 필요한가요?</Text>
          <Text style={styles.statsSectionSub}>
            대한민국의 현실, 숫자로 말합니다
          </Text>

          <View style={styles.statsGrid}>
            {STATS.map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <View style={styles.statIconWrap}>
                  <Ionicons name={stat.icon} size={22} color={COLORS.gold} />
                </View>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statSub}>{stat.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ================================================================ */}
        {/* SECTION 3 — VALUE PROPS                                           */}
        {/* ================================================================ */}
        <View style={styles.valueSection}>
          <Text style={styles.sectionHeading}>핵심 보호 기능</Text>
          <Text style={styles.sectionSubheading}>
            법률과 기술이 결합된 완벽한 보호 시스템
          </Text>

          <View style={styles.valueGrid}>
            {VALUE_PROPS.map((vp, idx) => (
              <View key={idx} style={styles.valueCard}>
                <View style={[styles.valueIconWrap, { backgroundColor: vp.color + '18' }]}>
                  <Ionicons name={vp.icon} size={28} color={vp.color} />
                </View>
                <Text style={styles.valueTitle}>{vp.title}</Text>
                <Text style={styles.valueDesc}>{vp.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ================================================================ */}
        {/* SECTION 4 — MODULE SHOWCASE (horizontal scroll)                   */}
        {/* ================================================================ */}
        <View style={styles.moduleSection}>
          <Text style={[styles.sectionHeading, { paddingHorizontal: SPACING.lg }]}>
            전체 서비스 모듈
          </Text>
          <Text style={[styles.sectionSubheading, { paddingHorizontal: SPACING.lg }]}>
            이별의 모든 단계를 법률로 보호합니다
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moduleScroll}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH * 0.72 + SPACING.md}
          >
            {MODULE_GROUPS.map((group, idx) => (
              <View key={idx} style={[styles.moduleCard, { backgroundColor: group.gradient[0] }]}>
                <View style={styles.moduleCardHeader}>
                  <View style={styles.moduleIconBadge}>
                    <Ionicons name={group.icon} size={24} color={COLORS.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moduleCardTitle}>{group.title}</Text>
                    <Text style={styles.moduleCardSub}>{group.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.moduleChipRow}>
                  {group.modules.map((m, mi) => (
                    <View key={mi} style={styles.moduleChip}>
                      <Text style={styles.moduleChipText}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ================================================================ */}
        {/* SECTION 5 — TESTIMONIALS (Before / After)                         */}
        {/* ================================================================ */}
        <View style={styles.testimonialSection}>
          <Text style={styles.sectionHeading}>실제 이용 후기</Text>
          <Text style={styles.sectionSubheading}>
            안전이별와 함께한 분들의 변화
          </Text>

          {TESTIMONIALS_BA.map((t, idx) => (
            <View key={idx} style={styles.testimonialCard}>
              <View style={styles.testimonialRow}>
                {/* Before */}
                <View style={[styles.testimonialHalf, styles.testimonialBefore]}>
                  <Text style={styles.testimonialLabel}>BEFORE</Text>
                  <Text style={styles.testimonialBeforeText}>{t.before}</Text>
                </View>
                {/* Arrow */}
                <View style={styles.testimonialArrow}>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.gold} />
                </View>
                {/* After */}
                <View style={[styles.testimonialHalf, styles.testimonialAfter]}>
                  <Text style={[styles.testimonialLabel, { color: COLORS.gold }]}>AFTER</Text>
                  <Text style={styles.testimonialAfterText}>{t.after}</Text>
                </View>
              </View>
              <Text style={styles.testimonialAuthor}>— {t.author}</Text>
            </View>
          ))}
        </View>

        {/* ================================================================ */}
        {/* SECTION 6 — TRUST                                                 */}
        {/* ================================================================ */}
        <View style={styles.trustSection}>
          <Text style={styles.sectionHeading}>신뢰할 수 있는 이유</Text>

          {/* Lawyer profile */}
          <View style={styles.lawyerCard}>
            <View style={styles.lawyerAvatarWrap}>
              <Ionicons name="person" size={36} color={COLORS.gold} />
            </View>
            <View style={styles.lawyerInfo}>
              <Text style={styles.lawyerName}>김창희 변호사</Text>
              <Text style={styles.lawyerTitle}>법률사무소 청송 대표</Text>
              <Text style={styles.lawyerDesc}>
                가정폭력·스토킹·디지털성범죄 전문{'\n'}
                모든 콘텐츠 법률 검토 완료
              </Text>
            </View>
          </View>

          {/* Trust badges */}
          <View style={styles.trustBadgeRow}>
            {[
              { icon: 'lock-closed' as const, label: 'AES-256\n암호화' },
              { icon: 'eye-off' as const, label: '은밀모드\n계산기 위장' },
              { icon: 'document-text' as const, label: '변호사\n직접 검토' },
            ].map((b, idx) => (
              <View key={idx} style={styles.trustBadge}>
                <View style={styles.trustBadgeIcon}>
                  <Ionicons name={b.icon} size={22} color={COLORS.gold} />
                </View>
                <Text style={styles.trustBadgeLabel}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ================================================================ */}
        {/* SECTION 7 — PRICING                                               */}
        {/* ================================================================ */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionHeading}>요금제</Text>
          <Text style={styles.sectionSubheading}>
            커피 한잔 값으로 법적 보호를
          </Text>

          {/* Billing toggle */}
          <View style={styles.billingToggle}>
            <TouchableOpacity
              style={[styles.billingBtn, !billingAnnual && styles.billingBtnActive]}
              onPress={() => setBillingAnnual(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.billingBtnText, !billingAnnual && styles.billingBtnTextActive]}>
                월간
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.billingBtn, billingAnnual && styles.billingBtnActive]}
              onPress={() => setBillingAnnual(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.billingBtnText, billingAnnual && styles.billingBtnTextActive]}>
                연간
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>40% 할인</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Tier cards */}
          {/* FREE */}
          <View style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <View style={[styles.tierBadge, { backgroundColor: COLORS.sage + '20' }]}>
                <Text style={[styles.tierBadgeText, { color: COLORS.sage }]}>무료</Text>
              </View>
              <Text style={styles.tierPrice}>0원</Text>
              <Text style={styles.tierPeriod}>영구 무료</Text>
            </View>
            <View style={styles.tierFeatures}>
              {['10문항 위험도 진단', '가스라이팅 테스트', 'SOS 긴급연결', '증거보관 5건', 'AI 상담 월 3회'].map((f, i) => (
                <View key={i} style={styles.tierFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.sage} />
                  <Text style={styles.tierFeatureText}>{f}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.tierBtn} activeOpacity={0.8} onPress={handleStart}>
              <Text style={styles.tierBtnText}>무료로 시작하기</Text>
            </TouchableOpacity>
          </View>

          {/* LITE */}
          <View style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <View style={[styles.tierBadge, { backgroundColor: COLORS.gold + '20' }]}>
                <Text style={[styles.tierBadgeText, { color: COLORS.gold }]}>라이트</Text>
              </View>
              <Text style={styles.tierPrice}>
                {billingAnnual ? '1,700원' : '2,900원'}
              </Text>
              <Text style={styles.tierPeriod}>/월</Text>
            </View>
            <View style={styles.tierFeatures}>
              {[
                '무료 기능 전체 포함',
                '20문항 정밀진단',
                '무제한 증거보관',
                '스토킹 기록 관리',
                '디지털 보안감사',
                'AI 상담 무제한',
              ].map((f, i) => (
                <View key={i} style={styles.tierFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.gold} />
                  <Text style={styles.tierFeatureText}>{f}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.tierBtn, { backgroundColor: COLORS.gold }]}
              activeOpacity={0.8}
              onPress={handleStart}
            >
              <Text style={[styles.tierBtnText, { color: COLORS.white }]}>라이트 시작하기</Text>
            </TouchableOpacity>
          </View>

          {/* CARE - BEST */}
          <View style={[styles.tierCard, styles.tierCardBest]}>
            <View style={styles.bestRibbon}>
              <Text style={styles.bestRibbonText}>BEST</Text>
            </View>
            <View style={styles.tierHeader}>
              <View style={[styles.tierBadge, { backgroundColor: COLORS.plum + '20' }]}>
                <Text style={[styles.tierBadgeText, { color: COLORS.plum }]}>케어</Text>
              </View>
              <Text style={styles.tierPrice}>
                {billingAnnual ? '6,900원' : '9,900원'}
              </Text>
              <Text style={styles.tierPeriod}>/월</Text>
            </View>
            <View style={styles.tierFeatures}>
              {[
                '라이트 기능 전체 포함',
                '안전 체크인 기능',
                '연락 모니터링',
                '삭제 요청 템플릿',
                '증거 포렌식 리포트',
                '트라우마 회복 프로그램',
                '전문 상담 연결',
              ].map((f, i) => (
                <View key={i} style={styles.tierFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.plum} />
                  <Text style={styles.tierFeatureText}>{f}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.tierBtn, { backgroundColor: COLORS.plum }]}
              activeOpacity={0.8}
              onPress={handleStart}
            >
              <Text style={[styles.tierBtnText, { color: COLORS.white }]}>케어 시작하기</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.pricingNote}>
            변호사 상담 1회 = 30만원{'\n'}
            케어 플랜은 하루 97원에 법적 보호를 받을 수 있습니다
          </Text>
        </View>

        {/* ================================================================ */}
        {/* SECTION 8 — FAQ                                                   */}
        {/* ================================================================ */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionHeading}>자주 묻는 질문</Text>
          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item, idx) => (
              <FAQAccordion key={idx} item={item} />
            ))}
          </View>
        </View>

        {/* ================================================================ */}
        {/* SECTION 9 — FINAL CTA                                             */}
        {/* ================================================================ */}
        <View style={styles.finalCtaSection}>
          <View style={styles.finalCtaShield}>
            <Ionicons name="shield-checkmark" size={48} color={COLORS.gold} />
          </View>

          <Text style={styles.finalCtaTitle}>
            {'지금, 보호를\n시작하세요'}
          </Text>
          <Text style={styles.finalCtaSub}>
            {'당신의 안전이 가장 중요합니다.\n법이 당신 편에 서겠습니다.'}
          </Text>

          <TouchableOpacity
            style={styles.finalCtaBtn}
            activeOpacity={0.85}
            onPress={handleStart}
          >
            <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
            <Text style={styles.finalCtaBtnText}>보호 시작하기</Text>
          </TouchableOpacity>

          {/* Emergency contacts */}
          <View style={styles.emergencyRow}>
            <TouchableOpacity
              style={styles.emergencyBtn}
              activeOpacity={0.7}
              onPress={() => Linking.openURL('tel:112')}
            >
              <Ionicons name="call" size={16} color={COLORS.coral} />
              <Text style={styles.emergencyBtnText}>112 경찰</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.emergencyBtn}
              activeOpacity={0.7}
              onPress={() => Linking.openURL('tel:1366')}
            >
              <Ionicons name="heart" size={16} color={COLORS.sage} />
              <Text style={styles.emergencyBtnText}>1366 여성긴급전화</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerCopy}>
            © 2026 안전이별 · 법률사무소 청송{'\n'}All rights reserved.
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

  /* ── HERO ── */
  heroSection: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxl + SPACING.lg,
    alignItems: 'center',
  },
  heroShieldOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(196,149,106,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  heroShieldInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(196,149,106,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 34 * 1.5,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.goldLight,
    textAlign: 'center',
    lineHeight: FONT_SIZE.lg * 1.65,
    marginTop: SPACING.md,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(196,149,106,0.12)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(196,149,106,0.25)',
    marginTop: SPACING.lg,
  },
  heroBadgeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gold,
    fontWeight: '600',
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl + SPACING.md,
    paddingVertical: SPACING.md + 4,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xl,
    minHeight: 58,
    ...SHADOW.lg,
  },
  heroCtaBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroTrustLine: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: SPACING.lg,
    letterSpacing: 0.3,
  },

  /* ── STATS ── */
  statsSection: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl + SPACING.md,
  },
  statsSectionTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  statsSectionSub: {
    fontSize: FONT_SIZE.md,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,149,106,0.15)',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(196,149,106,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    fontWeight: '500',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: -0.5,
  },
  statSub: {
    fontSize: 10,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },

  /* ── VALUE PROPS ── */
  valueSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.lg,
  },
  sectionHeading: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.navy,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  sectionSubheading: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    lineHeight: FONT_SIZE.md * 1.5,
  },
  valueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  valueCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  valueIconWrap: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  valueTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  valueDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: FONT_SIZE.xs * 1.55,
  },

  /* ── MODULE SHOWCASE ── */
  moduleSection: {
    paddingTop: SPACING.xxl,
  },
  moduleScroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  moduleCard: {
    width: SCREEN_WIDTH * 0.72,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  moduleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  moduleIconBadge: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(196,149,106,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleCardTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  moduleCardSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.goldLight,
    marginTop: 2,
  },
  moduleChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
  },
  moduleChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
  },
  moduleChipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.white,
    fontWeight: '500',
  },

  /* ── TESTIMONIALS ── */
  testimonialSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.md,
  },
  testimonialCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  testimonialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testimonialHalf: {
    flex: 1,
    padding: SPACING.sm,
  },
  testimonialBefore: {
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.sm,
  },
  testimonialAfter: {
    backgroundColor: 'rgba(196,149,106,0.08)',
    borderRadius: RADIUS.sm,
  },
  testimonialLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.lightText,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  testimonialBeforeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: FONT_SIZE.sm * 1.6,
  },
  testimonialAfterText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    lineHeight: FONT_SIZE.sm * 1.6,
    fontWeight: '500',
  },
  testimonialArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
  },
  testimonialAuthor: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'right',
    marginTop: SPACING.sm,
    fontWeight: '600',
  },

  /* ── TRUST ── */
  trustSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.md,
  },
  lawyerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    gap: SPACING.md,
    ...SHADOW.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  lawyerAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lawyerInfo: {
    flex: 1,
  },
  lawyerName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  lawyerTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gold,
    fontWeight: '600',
    marginTop: 2,
  },
  lawyerDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: FONT_SIZE.sm * 1.6,
    marginTop: SPACING.sm,
  },
  trustBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
  },
  trustBadge: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  trustBadgeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(196,149,106,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBadgeLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: FONT_SIZE.xs * 1.5,
  },

  /* ── PRICING ── */
  pricingSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.md,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.full,
    padding: 3,
    marginBottom: SPACING.xl,
    alignSelf: 'center',
  },
  billingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  billingBtnActive: {
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  billingBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.lightText,
  },
  billingBtnTextActive: {
    color: COLORS.darkText,
  },
  saveBadge: {
    backgroundColor: COLORS.coral + '18',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.coral,
  },

  tierCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tierCardBest: {
    borderColor: COLORS.gold,
    borderWidth: 2,
    position: 'relative',
    overflow: 'visible',
  },
  bestRibbon: {
    position: 'absolute',
    top: -12,
    right: SPACING.lg,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    zIndex: 1,
  },
  bestRibbonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  tierBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  tierBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  tierPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: -1,
  },
  tierPeriod: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    marginTop: 2,
  },
  tierFeatures: {
    gap: SPACING.sm + 2,
    marginBottom: SPACING.lg,
  },
  tierFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tierFeatureText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    flex: 1,
  },
  tierBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmGray,
    minHeight: 50,
    justifyContent: 'center',
  },
  tierBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  pricingNote: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: FONT_SIZE.sm * 1.7,
    marginTop: SPACING.lg,
  },

  /* ── FAQ ── */
  faqSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.md,
  },
  faqList: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.lg,
    ...SHADOW.sm,
  },
  faqItem: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  faqQ: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
    lineHeight: FONT_SIZE.md * 1.5,
  },
  faqChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqA: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    lineHeight: FONT_SIZE.md * 1.65,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },

  /* ── FINAL CTA ── */
  finalCtaSection: {
    backgroundColor: COLORS.navy,
    marginTop: SPACING.xxl + SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  finalCtaShield: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(196,149,106,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  finalCtaTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 34 * 1.5,
    letterSpacing: -0.8,
  },
  finalCtaSub: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.goldLight,
    textAlign: 'center',
    lineHeight: FONT_SIZE.lg * 1.65,
    marginTop: SPACING.md,
  },
  finalCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl + SPACING.md,
    paddingVertical: SPACING.md + 4,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xl,
    minHeight: 58,
    ...SHADOW.lg,
  },
  finalCtaBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  emergencyRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emergencyBtnText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  footerCopy: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: SPACING.xxl,
    lineHeight: FONT_SIZE.xs * 1.6,
  },
});
