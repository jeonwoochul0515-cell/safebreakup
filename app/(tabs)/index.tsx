import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import TrustSignalBar from '@/components/TrustSignalBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Data ────────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    key: 'diagnosis',
    label: '위험도 자가진단',
    desc: '10문항 간편 진단',
    icon: 'shield-checkmark' as const,
    color: COLORS.coral,
    bgColor: COLORS.blush,
    route: '/diagnosis',
  },
  {
    key: 'warning',
    label: '법률 경고장',
    desc: '변호사 명의 발송',
    icon: 'document-text' as const,
    color: COLORS.gold,
    bgColor: COLORS.lavender,
    route: '/legal-info',
  },
  {
    key: 'evidence',
    label: '증거보관함',
    desc: '암호화 안전 저장',
    icon: 'folder-open' as const,
    color: COLORS.blue,
    bgColor: COLORS.warmGray,
    route: '/evidence',
  },
  {
    key: 'consult',
    label: 'AI 사무장 상담',
    desc: '24시간 법률 상담',
    icon: 'chatbubbles' as const,
    color: COLORS.sage,
    bgColor: '#EFF5F0',
    route: '/ai-secretary',
  },
];

const TESTIMONIALS = [
  {
    id: '1',
    text: '이별 과정에서 협박을 받았는데, 법적 대응 방법을 알게 되어 큰 도움이 되었습니다. 혼자가 아니라는 느낌이 들었어요.',
    author: '20대 A님',
    stars: 5,
  },
  {
    id: '2',
    text: '증거 보관 기능 덕분에 중요한 카톡 내용을 안전하게 저장할 수 있었습니다. 상담받을 때도 정리가 되어 있어서 편했어요.',
    author: '30대 B님',
    stars: 5,
  },
  {
    id: '3',
    text: '자가진단으로 제 상황이 심각하다는 걸 깨달았어요. 빠르게 법률 상담을 받을 수 있어서 정말 감사합니다.',
    author: '20대 C님',
    stars: 5,
  },
  {
    id: '4',
    text: '경고장 발송 후 상대방의 연락이 멈췄습니다. 법의 힘을 실감했어요. 이 서비스가 없었다면 계속 힘들었을 거예요.',
    author: '30대 D님',
    stars: 4,
  },
];

const FAQ_DATA = [
  {
    q: '안전이별는 어떤 서비스인가요?',
    a: '안전이별는 이별 과정에서 발생할 수 있는 법적 위험(스토킹, 협박, 사생활 침해 등)으로부터 안전하게 보호받을 수 있도록 돕는 법률 서비스입니다. 대표변호사가 직접 운영합니다.',
  },
  {
    q: '위험도 자가진단은 어떻게 이용하나요?',
    a: '위험도 자가진단은 별도 비용 없이 이용하실 수 있습니다. 10개 문항에 답변하시면 진단 결과에 따라 맞춤형 법률 안내와 대응 방법을 제공합니다.',
  },
  {
    q: '증거는 안전하게 보관되나요?',
    a: '네, 모든 증거 자료는 암호화되어 안전하게 보관됩니다. 기기 내 로컬 저장과 클라우드 백업을 함께 지원하여 분실 위험을 최소화합니다.',
  },
  {
    q: '법률 상담은 어떻게 받을 수 있나요?',
    a: '앱 내 상담 요청 또는 카카오톡 채널을 통해 상담을 예약하실 수 있습니다. 긴급한 경우 SOS 기능을 통해 빠르게 연결해 드립니다.',
  },
  {
    q: '상대방에게 이 앱 사용이 알려질 수 있나요?',
    a: '절대 알려지지 않습니다. 스텔스 모드(계산기 위장)를 지원하며, 알림도 비공개로 처리됩니다. 개인정보 보호를 최우선으로 설계되었습니다.',
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < count ? 'star' : 'star-outline'}
          size={14}
          color={COLORS.gold}
        />
      ))}
    </View>
  );
}

function FAQItem({ item, isLast }: { item: { q: string; a: string }; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setOpen(!open)}
      style={[styles.faqItem, !isLast && styles.faqItemBorder]}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.q}</Text>
        <View style={styles.faqChevron}>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={COLORS.lightText}
          />
        </View>
      </View>
      {open && <Text style={styles.faqAnswer}>{item.a}</Text>}
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [sosVisible, setSosVisible] = useState(false);
  const testimonialRef = useRef<ScrollView>(null);

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  const handleKakao = () => {
    Linking.openURL('https://pf.kakao.com/_xfLxbxj').catch(() => {});
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <View style={styles.logoIconWrap}>
              <Ionicons name="shield" size={22} color={COLORS.gold} />
            </View>
            <View>
              <Text style={styles.logoText}>안전이별</Text>
              <Text style={styles.headerSubtitle}>법률사무소 청송</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setSosVisible(true)}
            style={styles.sosChip}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.sosDot} />
            <Text style={styles.sosChipText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroShieldBadge}>
            <Ionicons name="shield-checkmark" size={28} color={COLORS.gold} />
          </View>

          <Text style={styles.heroHeadline}>
            {'안전한 이별,\n법이 지켜드립니다'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {'대표변호사 김창희가 직접 운영하는\n당신을 위한 법률 보호 서비스'}
          </Text>

          <TrustSignalBar phase={1} compact />

          <TouchableOpacity
            style={styles.ctaPrimary}
            activeOpacity={0.85}
            onPress={() => router.push('/diagnosis' as any)}
          >
            <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
            <Text style={styles.ctaPrimaryText}>위험도 자가진단 시작</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctaSecondary}
            activeOpacity={0.7}
            onPress={() => setSosVisible(true)}
          >
            <Text style={styles.ctaSecondaryText}>
              긴급 도움이 필요하다면
            </Text>
            <Ionicons name="arrow-forward" size={15} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 서비스</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.quickCard}
                activeOpacity={0.75}
                onPress={() => handleQuickAction(action.route)}
              >
                <View
                  style={[
                    styles.quickIconWrap,
                    { backgroundColor: action.bgColor },
                  ]}
                >
                  <Ionicons
                    name={action.icon}
                    size={32}
                    color={action.color}
                  />
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
                <Text style={styles.quickDesc}>{action.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Kakao Banner ── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.kakaoBanner}
            activeOpacity={0.85}
            onPress={handleKakao}
          >
            <View style={styles.kakaoContent}>
              <View style={styles.kakaoIconWrap}>
                <Text style={styles.kakaoIcon}>💬</Text>
              </View>
              <View style={styles.kakaoTextArea}>
                <Text style={styles.kakaoBannerTitle}>
                  카카오톡 채널 추가하기
                </Text>
                <Text style={styles.kakaoBannerSub}>
                  최신 법률 소식과 보호 팁을 받아보세요
                </Text>
              </View>
              <View style={styles.kakaoArrow}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.kakaoBrown} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── v3 Protection Modules ── */}
        <View style={styles.section}>
          <View style={styles.v3Header}>
            <Text style={styles.sectionTitle}>종합 보호 시스템</Text>
            <TouchableOpacity onPress={() => router.push('/services-hub' as any)} activeOpacity={0.7}>
              <Text style={{ fontSize: FONT_SIZE.sm, color: COLORS.gold, fontWeight: '600' }}>전체보기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.md }}>
            {[
              { title: '위험도 정밀진단', sub: '캠벨 기반 20문항', icon: 'analytics' as const, color: COLORS.coral, route: '/danger-assessment', isNew: true },
              { title: '스토킹 대응', sub: '사건기록 & 증거수집', icon: 'eye-off' as const, color: COLORS.blue, route: '/stalking-log', isNew: true },
              { title: '디지털 성범죄', sub: '긴급 대응 & 삭제요청', icon: 'lock-closed' as const, color: COLORS.plum, route: '/ncii-response', isNew: true },
              { title: '가스라이팅 테스트', sub: '15문항 자가진단', icon: 'bulb' as const, color: '#D4A373', route: '/gaslighting-test', isNew: true },
              { title: '트라우마 회복', sub: '그라운딩 & 호흡법', icon: 'heart' as const, color: COLORS.sage, route: '/grounding', isNew: true },
              { title: '증거 포렌식', sub: 'SHA-256 무결성 보장', icon: 'finger-print' as const, color: COLORS.gold, route: '/evidence-forensics', isNew: true },
              { title: '이별 안전 경호', sub: '전문 경호원 현장 동행', icon: 'shield' as const, color: COLORS.coralDark, route: '/escort-service', isNew: true },
              // { title: 'ADT캡스 안심팩', sub: 'SOS→긴급출동 연계', icon: 'shield-checkmark' as const, color: '#0066CC', route: '/security-partner', isNew: true },
            ].map((m, i) => (
              <TouchableOpacity key={i} style={styles.v3Card} onPress={() => router.push(m.route as any)} activeOpacity={0.75}>
                {m.isNew && <View style={styles.v3NewBadge}><Text style={styles.v3NewText}>NEW</Text></View>}
                <View style={[styles.v3IconWrap, { backgroundColor: m.color + '18' }]}>
                  <Ionicons name={m.icon} size={24} color={m.color} />
                </View>
                <Text style={styles.v3Title}>{m.title}</Text>
                <Text style={styles.v3Sub}>{m.sub}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Premium Banner ── */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.premiumBanner} onPress={() => router.push('/landing' as any)} activeOpacity={0.85}>
            <View>
              <Text style={styles.premiumTitle}>보호우산 케어 플랜</Text>
              <Text style={styles.premiumSub}>커피 한 잔 값으로 법적 보호를 · 월 4,900원</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* ── Testimonials ── */}
        <View style={styles.sectionFull}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: SPACING.lg }]}>
            이용 후기
          </Text>
          <ScrollView
            ref={testimonialRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialScroll}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH * 0.8 + SPACING.md}
          >
            {TESTIMONIALS.map((t) => (
              <View key={t.id} style={styles.testimonialCard}>
                <Text style={styles.testimonialQuoteMark}>"</Text>
                <StarRating count={t.stars} />
                <Text style={styles.testimonialText}>{t.text}</Text>
                <View style={styles.testimonialFooter}>
                  <View style={styles.testimonialAvatar}>
                    <Ionicons name="person" size={14} color={COLORS.gold} />
                  </View>
                  <Text style={styles.testimonialAuthor}>{t.author}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── FAQ ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
          <View style={styles.faqContainer}>
            {FAQ_DATA.map((item, idx) => (
              <FAQItem key={idx} item={item} isLast={idx === FAQ_DATA.length - 1} />
            ))}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerTitle}>
            법률사무소 청송
          </Text>
          <Text style={styles.footerLawyer}>
            대표변호사 김창희
          </Text>
          <Text style={styles.footerDisclaimer}>
            본 서비스에서 제공하는 정보는 일반적인 법률 안내이며,{'\n'}
            구체적인 법률 조언을 대체할 수 없습니다.
          </Text>
          <Text style={styles.footerCopy}>
            © 2026 안전이별. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* ── SOS Modal ── */}
      <Modal
        visible={sosVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSosVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSosVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />

            <View style={styles.modalIconWrap}>
              <Ionicons name="heart" size={32} color={COLORS.coral} />
            </View>

            <Text style={styles.modalTitle}>긴급 도움이 필요하신가요?</Text>
            <Text style={styles.modalDesc}>
              위험한 상황이라면 즉시 아래 번호로 연락하세요.{'\n'}
              당신은 혼자가 아닙니다.
            </Text>

            <View style={styles.sosButtonGroup}>
              <TouchableOpacity
                style={styles.sosButton}
                activeOpacity={0.85}
                onPress={() => {
                  Linking.openURL('tel:112');
                  setSosVisible(false);
                }}
              >
                <View style={[styles.sosButtonIcon, { backgroundColor: COLORS.coral }]}>
                  <Ionicons name="call" size={20} color={COLORS.white} />
                </View>
                <View style={styles.sosButtonTextArea}>
                  <Text style={styles.sosButtonTitle}>경찰 신고</Text>
                  <Text style={styles.sosButtonNumber}>112</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sosButton}
                activeOpacity={0.85}
                onPress={() => {
                  Linking.openURL('tel:1366');
                  setSosVisible(false);
                }}
              >
                <View style={[styles.sosButtonIcon, { backgroundColor: COLORS.sage }]}>
                  <Ionicons name="heart" size={20} color={COLORS.white} />
                </View>
                <View style={styles.sosButtonTextArea}>
                  <Text style={styles.sosButtonTitle}>여성긴급전화</Text>
                  <Text style={styles.sosButtonNumber}>1366</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sosButton}
                activeOpacity={0.85}
                onPress={() => {
                  Linking.openURL('tel:1644-8422');
                  setSosVisible(false);
                }}
              >
                <View style={[styles.sosButtonIcon, { backgroundColor: COLORS.navy }]}>
                  <Ionicons name="chatbubbles" size={20} color={COLORS.gold} />
                </View>
                <View style={styles.sosButtonTextArea}>
                  <Text style={styles.sosButtonTitle}>법률사무소 청송 상담</Text>
                  <Text style={styles.sosButtonNumber}>1644-8422</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSosVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const CARD_GAP = SPACING.md;
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  // ── Header ──
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md + 4,
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
  },
  logoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(196,149,106,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: 1,
    letterSpacing: 0.3,
  },
  sosChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(224,122,95,0.15)',
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(224,122,95,0.3)',
    minHeight: 40,
  },
  sosDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.coral,
  },
  sosChipText: {
    color: COLORS.coralLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },

  // ── Hero ──
  hero: {
    backgroundColor: COLORS.warmWhite,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.xl + SPACING.sm,
    alignItems: 'center',
  },
  heroShieldBadge: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  heroHeadline: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '800',
    color: COLORS.navy,
    textAlign: 'center',
    lineHeight: FONT_SIZE.hero * 1.3,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.slate,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: FONT_SIZE.lg * 1.6,
  },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl + SPACING.sm,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    marginTop: SPACING.lg + SPACING.sm,
    minHeight: 56,
    ...SHADOW.md,
  },
  ctaPrimaryText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginLeft: SPACING.sm,
  },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md + SPACING.xs,
    paddingVertical: SPACING.sm + 2,
    minHeight: 44,
  },
  ctaSecondaryText: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },

  // ── Sections ──
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  sectionFull: {
    paddingTop: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: SPACING.lg,
    letterSpacing: -0.3,
  },

  // ── Quick Actions ──
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickCard: {
    width: '48%',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  quickIconWrap: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  quickDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: FONT_SIZE.xs * 1.5,
    marginTop: SPACING.xs,
  },

  // ── Kakao Banner ──
  kakaoBanner: {
    backgroundColor: '#FFF8DB',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#FEE500',
  },
  kakaoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  kakaoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.kakaoYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoIcon: {
    fontSize: 24,
  },
  kakaoTextArea: {
    flex: 1,
  },
  kakaoBannerTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.kakaoBrown,
  },
  kakaoBannerSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.kakaoBrown,
    opacity: 0.6,
    marginTop: 3,
  },
  kakaoArrow: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(60,30,30,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Testimonials ──
  testimonialScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  testimonialCard: {
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    gap: SPACING.sm,
    ...SHADOW.sm,
    position: 'relative',
  },
  testimonialQuoteMark: {
    position: 'absolute',
    top: 8,
    left: SPACING.lg,
    fontSize: 48,
    color: COLORS.goldLight,
    fontWeight: '800',
    lineHeight: 52,
    opacity: 0.6,
  },
  testimonialText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: FONT_SIZE.md * 1.6,
    marginTop: SPACING.xs,
  },
  testimonialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  testimonialAvatar: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAuthor: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    fontWeight: '600',
  },

  // ── FAQ ──
  faqContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  faqItem: {
    padding: SPACING.lg,
  },
  faqItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: 28,
  },
  faqChevron: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
    lineHeight: FONT_SIZE.md * 1.5,
  },
  faqAnswer: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    lineHeight: FONT_SIZE.md * 1.6,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },

  // ── Footer ──
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  footerDivider: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.borderLight,
    borderRadius: 1,
    marginBottom: SPACING.lg,
  },
  footerTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.slate,
    letterSpacing: 0.3,
  },
  footerLawyer: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.lightText,
  },
  footerDisclaimer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: FONT_SIZE.xs * 1.6,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  footerCopy: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: SPACING.xs,
    opacity: 0.7,
  },

  // ── SOS Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45,43,61,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.warmWhite,
    borderTopLeftRadius: RADIUS.xl + 4,
    borderTopRightRadius: RADIUS.xl + 4,
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.navy,
    letterSpacing: -0.3,
  },
  modalDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.6,
    marginBottom: SPACING.md,
  },
  sosButtonGroup: {
    width: '100%',
    gap: SPACING.sm,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmGray,
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    minHeight: 64,
  },
  sosButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButtonTextArea: {
    flex: 1,
  },
  sosButtonTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  sosButtonNumber: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    marginTop: 2,
  },
  sosButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  modalClose: {
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.xxl,
    marginTop: SPACING.sm,
  },
  modalCloseText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.lightText,
    fontWeight: '600',
  },

  // v3 Module Cards
  v3Header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.sm,
  },
  v3Card: {
    width: 140,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    ...SHADOW.sm,
  },
  v3NewBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    backgroundColor: COLORS.coral,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  v3NewText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: COLORS.white,
  },
  v3IconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.sm,
  },
  v3Title: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700' as const,
    color: COLORS.darkText,
  },
  v3Sub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: 2,
  },
  premiumBanner: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  premiumTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700' as const,
    color: COLORS.gold,
  },
  premiumSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.goldLight,
    marginTop: 2,
  },
});
