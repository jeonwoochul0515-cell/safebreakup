import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Linking,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, Fonts, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { LEGAL } from '@/constants/legal';
import { SAFETY_CHECK, SOS_NUMBERS, QUICK_GUIDE_CARDS } from '@/constants/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_PAGES = 4;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SituationType =
  | 'breakup_prep'
  | 'stalking'
  | 'dating_violence'
  | 'digital_crime';

interface SituationCard {
  id: SituationType;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  bgColor: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const SITUATIONS: SituationCard[] = [
  {
    id: 'breakup_prep',
    icon: 'heart-dislike-outline',
    title: '이별을 준비하고 있어요',
    description: '안전하게 관계를 정리하고 싶어요',
    bgColor: COLORS.blush,
  },
  {
    id: 'stalking',
    icon: 'eye-off-outline',
    title: '이별 후 스토킹/연락이 계속돼요',
    description: '헤어졌지만 연락, 미행이 멈추지 않아요',
    bgColor: COLORS.lavender,
  },
  {
    id: 'dating_violence',
    icon: 'shield-outline',
    title: '데이트폭력을 겪고 있어요',
    description: '신체적·정서적 폭력으로 힘들어요',
    bgColor: COLORS.warmGray,
  },
  {
    id: 'digital_crime',
    icon: 'lock-closed-outline',
    title: '디지털 성범죄 피해를 받고 있어요',
    description: '불법촬영, 유포 협박 등으로 고통받고 있어요',
    bgColor: COLORS.blush,
  },
];

const EMPATHY_MESSAGES: Record<SituationType, { title: string; body: string }> =
  {
    breakup_prep: {
      title: '이별을 준비하는 당신,\n정말 용기 있는 결정이에요.',
      body: '안전한 이별을 위해 법적 보호장치를 미리 준비하면\n훨씬 안심하고 진행할 수 있어요.',
    },
    stalking: {
      title: '끝나지 않는 연락과 감시,\n충분히 두려울 수 있어요.',
      body: '스토킹처벌법이 당신을 보호합니다.\n증거를 확보하고 법적 조치를 취할 수 있어요.',
    },
    dating_violence: {
      title: '아프고 힘든 시간을\n견뎌온 당신은 강합니다.',
      body: '데이트폭력은 명백한 범죄입니다.\n전문가의 도움으로 안전하게 벗어날 수 있어요.',
    },
    digital_crime: {
      title: '당신의 잘못이 아닙니다.\n절대로요.',
      body: '디지털 성범죄는 엄중한 처벌 대상입니다.\n삭제 요청부터 법적 대응까지 함께할게요.',
    },
  };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSituation, setSelectedSituation] =
    useState<SituationType | null>(null);
  const [isSafe, setIsSafe] = useState<boolean | null>(null);
  const [showSOS, setShowSOS] = useState(false);

  // Fade animation for SOS section
  const sosOpacity = useRef(new Animated.Value(0)).current;

  // ---- navigation helpers ----

  const goToPage = useCallback((page: number) => {
    scrollRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
    setCurrentPage(page);
  }, []);

  const handleNext = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, goToPage]);

  const handleSkip = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const handleStart = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (page !== currentPage) setCurrentPage(page);
    },
    [currentPage],
  );

  const handleSafeAnswer = useCallback(() => {
    setIsSafe(true);
    setShowSOS(false);
    setTimeout(() => goToPage(1), 350);
  }, [goToPage]);

  const handleUnsafeAnswer = useCallback(() => {
    setIsSafe(false);
    setShowSOS(true);
    Animated.timing(sosOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [sosOpacity]);

  const handleCallSOS = useCallback((number: string) => {
    Linking.openURL(`tel:${number}`);
  }, []);

  const canScroll = currentPage > 0 || isSafe === true;

  // ---- Step 1: Safety Check ----

  const renderStep1SafetyCheck = () => (
    <View style={[styles.page, { paddingTop: insets.top + 80 }]}>
      {/* Shield icon in rose gold circle */}
      <View style={styles.safetyIconCircle}>
        <Ionicons name="shield-checkmark" size={72} color={COLORS.gold} />
      </View>

      <Text style={styles.safetyQuestion}>{SAFETY_CHECK.question}</Text>

      {/* Safe button — sage green pill */}
      <TouchableOpacity
        style={styles.safeButton}
        onPress={handleSafeAnswer}
        activeOpacity={0.8}
      >
        <Text style={styles.safeButtonText}>{SAFETY_CHECK.safeAnswer}</Text>
      </TouchableOpacity>

      {/* Unsafe button — soft coral pill */}
      <TouchableOpacity
        style={styles.unsafeButton}
        onPress={handleUnsafeAnswer}
        activeOpacity={0.8}
      >
        <Text style={styles.unsafeButtonText}>{SAFETY_CHECK.unsafeAnswer}</Text>
      </TouchableOpacity>

      {/* SOS contacts — fade in when unsafe */}
      {showSOS && (
        <Animated.View style={[styles.sosContainer, { opacity: sosOpacity }]}>
          <Text style={styles.sosTitle}>지금 바로 도움을 받을 수 있어요</Text>
          {SOS_NUMBERS.map((contact) => (
            <TouchableOpacity
              key={contact.number}
              style={styles.sosCard}
              onPress={() => handleCallSOS(contact.number)}
              activeOpacity={0.7}
            >
              <View style={styles.sosIconCircle}>
                <Ionicons name="call" size={20} color={COLORS.white} />
              </View>
              <View style={styles.sosTextWrap}>
                <Text style={styles.sosLabel}>{contact.label}</Text>
                <Text style={styles.sosNumber}>{contact.number}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.coralLight} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.sosContinueButton}
            onPress={() => {
              setIsSafe(true);
              setShowSOS(false);
              goToPage(1);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.sosContinueText}>
              괜찮아요, 계속 진행할게요
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );

  // ---- Step 2: Situation Selection ----

  const renderStep2Situation = () => (
    <View style={[styles.page, { paddingTop: insets.top + 60 }]}>
      {/* Skip button top right */}
      <TouchableOpacity
        style={styles.step2Skip}
        onPress={handleNext}
        activeOpacity={0.6}
      >
        <Text style={styles.step2SkipText}>건너뛰기</Text>
      </TouchableOpacity>

      <Text style={styles.stepLabel}>STEP 1</Text>
      <Text style={styles.heading}>어떤 상황인가요?</Text>
      <Text style={styles.subheading}>
        해당하는 상황을 선택해주세요.{'\n'}맞춤 보호 방법을 안내해 드릴게요.
      </Text>

      <View style={styles.cardsContainer}>
        {SITUATIONS.map((item) => {
          const selected = selectedSituation === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              style={[
                styles.card,
                { backgroundColor: item.bgColor },
                selected && styles.cardSelected,
              ]}
              onPress={() => setSelectedSituation(item.id)}
            >
              <View
                style={[
                  styles.cardIconWrap,
                  selected && styles.cardIconWrapSelected,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={26}
                  color={selected ? COLORS.white : COLORS.gold}
                />
              </View>
              <View style={styles.cardTextWrap}>
                <Text
                  style={[styles.cardTitle, selected && styles.cardTitleSelected]}
                >
                  {item.title}
                </Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
              </View>
              {selected && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.gold}
                  style={styles.cardCheck}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.ctaButton,
          !selectedSituation && styles.ctaButtonDisabled,
        ]}
        disabled={!selectedSituation}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>다음</Text>
      </TouchableOpacity>
    </View>
  );

  // ---- Step 3: Empathy ----

  const renderStep3Empathy = () => {
    const situation = selectedSituation ?? 'breakup_prep';
    const msg = EMPATHY_MESSAGES[situation];

    return (
      <View style={[styles.page, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.stepLabel}>STEP 2</Text>

        {/* Warm illustration placeholder — large emoji in soft circle */}
        <View style={styles.empathyCircle}>
          <Text style={styles.empathyEmoji}>🤍</Text>
        </View>

        <Text style={styles.empathyTitle}>{msg.title}</Text>
        <Text style={styles.empathyBody}>{msg.body}</Text>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>88,379건</Text>
          <Text style={styles.statLabel}>
            2024년 데이트폭력 신고 건수{'\n'}
            <Text style={styles.statLabelBold}>— 당신만의 일이 아닙니다</Text>
          </Text>
        </View>

        <Text style={styles.lawyerIntro}>
          {LEGAL.firmName}의{' '}
          <Text style={styles.lawyerName}>{LEGAL.lawyerName} 변호사</Text>가
          함께합니다
        </Text>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>다음</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ---- Step 4: Quick Guide ----

  const renderStep4QuickGuide = () => (
    <View style={[styles.page, { paddingTop: insets.top + 60 }]}>
      <Text style={styles.stepLabel}>STEP 3</Text>
      <Text style={styles.heading}>안전이별가{'\n'}도와드릴 수 있는 것</Text>

      <View style={styles.guideCardsContainer}>
        {QUICK_GUIDE_CARDS.map((card, idx) => (
          <View key={idx} style={styles.guideCard}>
            <View style={styles.guideIconWrap}>
              <Ionicons name={card.icon} size={24} color={COLORS.gold} />
            </View>
            <View style={styles.guideTextWrap}>
              <Text style={styles.guideTitle}>{card.title}</Text>
              <Text style={styles.guideDesc}>{card.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.ctaButtonPrimary}
        onPress={handleStart}
        activeOpacity={0.8}
      >
        <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
        <Text style={styles.ctaText}>보호 시작하기</Text>
      </TouchableOpacity>

      <Text style={styles.firmCredit}>{LEGAL.firmFull}</Text>
    </View>
  );

  // ---- render ----

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Skip button — only on pages 1+ (not safety check, not situation which has its own) */}
      {currentPage > 1 && (
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + SPACING.md }]}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      )}

      {/* Pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onScroll}
        bounces={false}
        scrollEnabled={canScroll}
      >
        {renderStep1SafetyCheck()}
        {renderStep2Situation()}
        {renderStep3Empathy()}
        {renderStep4QuickGuide()}
      </ScrollView>

      {/* Page dots — rose gold active (wider), borderLight inactive */}
      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.dot, currentPage === i && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmWhite,
  },

  // Skip (global, top right)
  skipButton: {
    position: 'absolute',
    right: SPACING.lg,
    zIndex: 10,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    fontWeight: '500',
  },

  // Page
  page: {
    width: SCREEN_WIDTH,
    paddingHorizontal: SPACING.lg,
  },

  stepLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },

  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
    lineHeight: 38,
  },

  subheading: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },

  // ── Step 1: Safety Check ──────────────────────────────────────────────

  safetyIconCircle: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.blush,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  safetyQuestion: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    lineHeight: 40,
  },

  safeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.sage,
    borderRadius: RADIUS.full,
    height: 60,
    marginBottom: SPACING.md,
  },
  safeButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },

  unsafeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.full,
    height: 60,
    marginBottom: SPACING.lg,
  },
  unsafeButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },

  // SOS inline
  sosContainer: {
    marginTop: SPACING.sm,
  },
  sosTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF0EC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    minHeight: 60,
  },
  sosIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosTextWrap: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  sosLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  sosNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.coral,
    marginTop: 2,
  },
  sosContinueButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  sosContinueText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // ── Step 2: Situation Cards ───────────────────────────────────────────

  step2Skip: {
    position: 'absolute',
    right: SPACING.lg,
    top: 0,
    zIndex: 5,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  step2SkipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    fontWeight: '500',
  },

  cardsContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: 20,
    minHeight: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: '#FDF5F3',
  },

  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardIconWrapSelected: {
    backgroundColor: COLORS.gold,
  },

  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  cardTitleSelected: {
    color: COLORS.darkText,
  },
  cardDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: 18,
  },
  cardCheck: {
    marginLeft: SPACING.sm,
  },

  // ── Step 3: Empathy ───────────────────────────────────────────────────

  empathyCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.blush,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.goldLight,
  },
  empathyEmoji: {
    fontSize: 48,
  },

  empathyTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.darkText,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: SPACING.md,
  },

  empathyBody: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },

  statBox: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOW.sm,
  },
  statNumber: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '800',
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: 20,
  },
  statLabelBold: {
    fontWeight: '700',
    color: COLORS.darkText,
  },

  lawyerIntro: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
    fontFamily: Fonts?.serif,
  },
  lawyerName: {
    fontWeight: '700',
    color: COLORS.gold,
  },

  // ── Step 4: Quick Guide ───────────────────────────────────────────────

  guideCardsContainer: {
    gap: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    padding: SPACING.md + 4,
    minHeight: 76,
    ...SHADOW.sm,
  },
  guideIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.blush,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  guideTextWrap: {
    flex: 1,
  },
  guideTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  guideDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: 18,
  },

  firmCredit: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: SPACING.md,
    letterSpacing: 0.3,
  },

  // ── CTA Buttons ───────────────────────────────────────────────────────

  ctaButton: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto' as any,
  },
  ctaButtonPrimary: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.full,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto' as any,
  },
  ctaButtonDisabled: {
    backgroundColor: COLORS.warmGray,
  },
  ctaText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── Dots ──────────────────────────────────────────────────────────────

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.borderLight,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
});
