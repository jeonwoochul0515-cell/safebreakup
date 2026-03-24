import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import PageHeader from '@/components/PageHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Tier Badge Colors ───────────────────────────────────────────────────────

const TIER_CONFIG = {
  free: { label: '무료', bg: COLORS.sage + '18', color: COLORS.sage },
  lite: { label: '라이트', bg: COLORS.gold + '18', color: COLORS.gold },
  care: { label: '케어', bg: COLORS.plum + '18', color: COLORS.plum },
} as const;

type TierKey = keyof typeof TIER_CONFIG;

// ─── Service Definitions ─────────────────────────────────────────────────────

interface ServiceItem {
  icon: string;
  title: string;
  subtitle: string;
  tier: TierKey;
  route: string;
}

interface ServiceCategory {
  key: string;
  label: string;
  icon: string;
  color: string;
  services: ServiceItem[];
}

const CATEGORIES: ServiceCategory[] = [
  {
    key: 'before',
    label: '이별 전 보호',
    icon: 'shield-half',
    color: COLORS.coral,
    services: [
      { icon: 'shield-checkmark', title: '위험도 자가진단', subtitle: '10문항 간편 위험도 평가', tier: 'free', route: '/diagnosis' },
      { icon: 'help-buoy', title: '가스라이팅 테스트', subtitle: '심리적 조종 패턴 진단', tier: 'free', route: '/gaslighting' },
      { icon: 'lock-closed', title: '강압적 통제 평가', subtitle: '보이지 않는 폭력 10문항 진단', tier: 'free', route: '/coercive-control' },
      { icon: 'map', title: '안전이별 계획', subtitle: '단계별 안전한 이별 가이드', tier: 'lite', route: '/safe-breakup-plan' },
      { icon: 'chatbubbles', title: 'AI 법률사무장', subtitle: '24시간 AI 법률 상담', tier: 'free', route: '/ai-secretary' },
    ],
  },
  {
    key: 'after',
    label: '이별 후 보호',
    icon: 'shield',
    color: COLORS.gold,
    services: [
      { icon: 'footsteps', title: '스토킹 기록', subtitle: '스토킹 행위 체계적 기록', tier: 'lite', route: '/stalking-log' },
      { icon: 'ban', title: '접근금지명령', subtitle: '법적 접근금지 절차 안내', tier: 'free', route: '/restraining-order' },
      { icon: 'folder-open', title: '증거보관함', subtitle: '암호화 증거 안전 저장', tier: 'free', route: '/evidence' },
      { icon: 'key', title: '디지털 보안감사', subtitle: '계정·기기 보안 점검', tier: 'lite', route: '/security-audit' },
      { icon: 'document-text', title: '법률 경고장', subtitle: '변호사 명의 경고장 발송', tier: 'lite', route: '/legal-info' },
      { icon: 'location', title: '안전 장소', subtitle: '쉼터·경찰서·상담센터 안내', tier: 'free', route: '/safe-places' },
      { icon: 'phone-portrait', title: '디지털 보안 가이드', subtitle: 'SNS·계정 보안 체크리스트', tier: 'lite', route: '/digital-security' },
    ],
  },
  {
    key: 'digital',
    label: '디지털 성범죄',
    icon: 'phone-portrait',
    color: COLORS.plum,
    services: [
      { icon: 'camera-reverse', title: '불법촬영 대응', subtitle: '불법 촬영물 대응 가이드', tier: 'lite', route: '/ncii-response' },
      { icon: 'trash', title: '삭제 요청 템플릿', subtitle: '플랫폼별 삭제 요청 양식', tier: 'care', route: '/deletion-template' },
      { icon: 'warning', title: '딥페이크 신고', subtitle: '딥페이크 피해 대응 절차', tier: 'lite', route: '/deepfake-report' },
      { icon: 'search', title: '디지털 포렌식', subtitle: '증거 추출 및 분석', tier: 'care', route: '/digital-forensics' },
    ],
  },
  {
    key: 'healing',
    label: '마음 치유',
    icon: 'heart',
    color: COLORS.sage,
    services: [
      { icon: 'flower', title: '트라우마 회복', subtitle: '단계별 회복 프로그램', tier: 'care', route: '/trauma-recovery' },
      { icon: 'journal', title: '감정 일기', subtitle: '감정 기록 및 패턴 분석', tier: 'lite', route: '/emotion-diary' },
      { icon: 'leaf', title: '호흡 명상', subtitle: '불안 완화 호흡법', tier: 'free', route: '/breathing' },
      { icon: 'happy', title: '자존감 회복', subtitle: '자기 가치 재발견 워크북', tier: 'care', route: '/self-esteem' },
      { icon: 'people', title: '상담 연결', subtitle: '전문 상담사·변호사 연결', tier: 'care', route: '/consultation' },
      { icon: 'chatbubble-ellipses', title: '커뮤니티', subtitle: '익명 피해자 커뮤니티', tier: 'care', route: '/community' },
    ],
  },
  {
    key: 'legal',
    label: '증거·법률',
    icon: 'document-text',
    color: COLORS.blue,
    services: [
      { icon: 'finger-print', title: '증거 포렌식', subtitle: '증거 해시·타임스탬프 검증', tier: 'care', route: '/evidence-forensics' },
      { icon: 'briefcase', title: '법률 상담', subtitle: '김창희 변호사 직접 상담', tier: 'care', route: '/consultation' },
      { icon: 'mail', title: '경고장 발송', subtitle: '변호사 명의 내용증명', tier: 'lite', route: '/legal-info' },
      { icon: 'clipboard', title: '고소장 작성', subtitle: '고소장 양식 및 가이드', tier: 'care', route: '/complaint-form' },
      { icon: 'cash', title: '손해배상 청구', subtitle: '정신적·물질적 손해배상', tier: 'care', route: '/damages-claim' },
    ],
  },
];

const ALL_CATEGORY_KEY = 'all';

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ServicesHubScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY_KEY);
  const [searchText, setSearchText] = useState('');

  const filteredCategories = useMemo(() => {
    let cats = CATEGORIES;

    if (selectedCategory !== ALL_CATEGORY_KEY) {
      cats = cats.filter((c) => c.key === selectedCategory);
    }

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      cats = cats
        .map((cat) => ({
          ...cat,
          services: cat.services.filter(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.subtitle.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.services.length > 0);
    }

    return cats;
  }, [selectedCategory, searchText]);

  return (
    <View style={styles.root}>
      <PageHeader title="전체 서비스" subtitle="이별방패 보호 모듈" showBack />

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.lightText} />
        <TextInput
          style={styles.searchInput}
          placeholder="서비스 검색..."
          placeholderTextColor={COLORS.lightText}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={COLORS.lightText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <TouchableOpacity
          style={[styles.filterTab, selectedCategory === ALL_CATEGORY_KEY && styles.filterTabActive]}
          onPress={() => setSelectedCategory(ALL_CATEGORY_KEY)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterTabText, selectedCategory === ALL_CATEGORY_KEY && styles.filterTabTextActive]}>
            전체
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.filterTab, selectedCategory === cat.key && styles.filterTabActive]}
            onPress={() => setSelectedCategory(cat.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={cat.icon as any}
              size={14}
              color={selectedCategory === cat.key ? COLORS.white : COLORS.slate}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.filterTabText, selectedCategory === cat.key && styles.filterTabTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Services list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.map((cat) => (
          <View key={cat.key} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIconWrap, { backgroundColor: cat.color + '18' }]}>
                <Ionicons name={cat.icon as any} size={18} color={cat.color} />
              </View>
              <Text style={styles.categoryTitle}>{cat.label}</Text>
              <Text style={styles.categoryCount}>{cat.services.length}</Text>
            </View>

            {cat.services.map((service, idx) => {
              const tier = TIER_CONFIG[service.tier];
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.serviceCard}
                  activeOpacity={0.7}
                  onPress={() => router.push(service.route as any)}
                >
                  <View style={[styles.serviceIconWrap, { backgroundColor: cat.color + '12' }]}>
                    <Ionicons name={service.icon as any} size={22} color={cat.color} />
                  </View>
                  <View style={styles.serviceTextArea}>
                    <Text style={styles.serviceTitle}>{service.title}</Text>
                    <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
                  </View>
                  <View style={[styles.tierChip, { backgroundColor: tier.bg }]}>
                    <Text style={[styles.tierChipText, { color: tier.color }]}>{tier.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.lightText} />
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {filteredCategories.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={40} color={COLORS.lightText} />
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          </View>
        )}
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

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    paddingVertical: SPACING.xs,
  },

  filterScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 1,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmGray,
  },
  filterTabActive: {
    backgroundColor: COLORS.navy,
  },
  filterTabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.slate,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },

  scroll: {
    flex: 1,
  },

  categorySection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    flex: 1,
  },
  categoryCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    fontWeight: '600',
  },

  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  serviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTextArea: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  serviceSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginTop: 2,
  },
  tierChip: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  tierChipText: {
    fontSize: 10,
    fontWeight: '700',
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.lightText,
  },
});
