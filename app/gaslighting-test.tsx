import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import {
  GASLIGHTING_TACTICS,
  GASLIGHTING_TEST_QUESTIONS,
  GASLIGHTING_SCORE_LEVELS,
} from '@/constants/gaslighting';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Phase = 'intro' | 'test' | 'result';

const ANSWER_OPTIONS = [
  { label: '전혀 아니다', value: 0 },
  { label: '가끔 그렇다', value: 1 },
  { label: '자주 그렇다', value: 2 },
  { label: '매우 그렇다', value: 4 },
];

export default function GaslightingTestScreen() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const totalQuestions = GASLIGHTING_TEST_QUESTIONS.length;
  const currentQuestion = GASLIGHTING_TEST_QUESTIONS[currentIndex];
  const progress = (currentIndex + 1) / totalQuestions;

  const animateTransition = useCallback(
    (direction: 'next' | 'prev', callback: () => void) => {
      const toValue = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      Animated.parallel([
        Animated.timing(slideAnim, { toValue, duration: 220, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start(() => {
        callback();
        slideAnim.setValue(direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH);
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        ]).start();
      });
    },
    [slideAnim, fadeAnim],
  );

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelectAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        animateTransition('next', () => setCurrentIndex((prev) => prev + 1));
      } else {
        setPhase('result');
      }
    }, 450);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      animateTransition('next', () => setCurrentIndex((prev) => prev + 1));
    } else {
      setPhase('result');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      animateTransition('prev', () => setCurrentIndex((prev) => prev - 1));
    } else {
      setPhase('intro');
    }
  };

  // Calculate scores
  const totalScore = GASLIGHTING_TEST_QUESTIONS.reduce(
    (sum, q) => sum + (answers[q.id] ?? 0),
    0,
  );

  const maxScore = totalQuestions * 4;

  const getScoreLevel = () => {
    return (
      GASLIGHTING_SCORE_LEVELS.find(
        (l) => totalScore >= l.range[0] && totalScore <= l.range[1],
      ) ?? GASLIGHTING_SCORE_LEVELS[0]
    );
  };

  const getTacticScores = () => {
    const tacticTotals: Record<string, { score: number; max: number }> = {};
    GASLIGHTING_TACTICS.forEach((t) => {
      tacticTotals[t.key] = { score: 0, max: 0 };
    });
    GASLIGHTING_TEST_QUESTIONS.forEach((q) => {
      if (tacticTotals[q.tactic]) {
        tacticTotals[q.tactic].score += answers[q.id] ?? 0;
        tacticTotals[q.tactic].max += 4;
      }
    });
    return tacticTotals;
  };

  const isAnswered = answers[currentQuestion?.id] !== undefined;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = GASLIGHTING_TEST_QUESTIONS.every((q) => answers[q.id] !== undefined);

  // ─── INTRO PHASE ───
  if (phase === 'intro') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>가스라이팅 자가진단</Text>
          <View style={styles.headerBackButton} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.introContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introTitleSection}>
            <Ionicons name="shield-half" size={40} color={COLORS.plum} />
            <Text style={styles.introTitle}>나의 관계는 건강한가요?</Text>
            <Text style={styles.introSubtitle}>
              가스라이팅은 상대방이 당신의 현실 인식을 왜곡하게 만드는 심리적 조종입니다.
              아래 6가지 유형을 확인해보세요.
            </Text>
          </View>

          {GASLIGHTING_TACTICS.map((tactic) => (
            <View key={tactic.key} style={styles.tacticCard}>
              <View style={[styles.tacticIconCircle, { backgroundColor: tactic.color + '20' }]}>
                <Ionicons name={tactic.icon as any} size={22} color={tactic.color} />
              </View>
              <View style={styles.tacticInfo}>
                <Text style={[styles.tacticName, { color: tactic.color }]}>{tactic.name}</Text>
                <Text style={styles.tacticDescription}>{tactic.description}</Text>
                <View style={styles.tacticExamples}>
                  {tactic.examples.map((ex, i) => (
                    <Text key={i} style={styles.tacticExample}>
                      {ex}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))}

          <Text style={styles.disclaimerText}>
            본 테스트는 전문 심리 진단을 대체하지 않습니다.
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setPhase('test')}
            activeOpacity={0.7}
          >
            <Text style={styles.startButtonText}>테스트 시작</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── RESULT PHASE ───
  if (phase === 'result') {
    const level = getScoreLevel();
    const tacticScores = getTacticScores();
    const gaugePercent = Math.min((totalScore / maxScore) * 100, 100);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setPhase('intro')} style={styles.headerBackButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>진단 결과</Text>
          <View style={styles.headerBackButton} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.resultContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Circular Gauge */}
          <View style={styles.gaugeContainer}>
            <View style={[styles.gaugeOuter, { borderColor: level.color + '30' }]}>
              <View style={[styles.gaugeInner, { borderColor: level.color }]}>
                <Text style={[styles.gaugeScore, { color: level.color }]}>{totalScore}</Text>
                <Text style={styles.gaugeMax}>/ {maxScore}</Text>
              </View>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
              <Text style={styles.levelBadgeText}>{level.label}</Text>
            </View>
          </View>

          {/* Level Description */}
          <View style={[styles.resultCard, { borderLeftColor: level.color }]}>
            <Text style={styles.resultDescription}>{level.description}</Text>
          </View>

          {/* NOT YOUR FAULT message */}
          <View style={styles.empathyCard}>
            <Ionicons name="heart" size={24} color={COLORS.plum} />
            <Text style={styles.empathyTitle}>이것은 당신의 잘못이 아닙니다</Text>
            <Text style={styles.empathyText}>
              가스라이팅은 상대방의 의도적인 조종 행위입니다.{'\n'}
              당신의 감각과 기억은 정확합니다.
            </Text>
          </View>

          {/* Tactic Breakdown */}
          <Text style={styles.sectionTitle}>유형별 분석</Text>
          {GASLIGHTING_TACTICS.map((tactic) => {
            const ts = tacticScores[tactic.key];
            const pct = ts && ts.max > 0 ? (ts.score / ts.max) * 100 : 0;
            return (
              <View key={tactic.key} style={styles.tacticScoreRow}>
                <View style={styles.tacticScoreLabel}>
                  <Ionicons name={tactic.icon as any} size={16} color={tactic.color} />
                  <Text style={styles.tacticScoreName}>{tactic.name}</Text>
                </View>
                <View style={styles.tacticBarBg}>
                  <View
                    style={[
                      styles.tacticBarFill,
                      { width: `${pct}%`, backgroundColor: tactic.color },
                    ]}
                  />
                </View>
                <Text style={styles.tacticScoreValue}>
                  {ts?.score ?? 0}/{ts?.max ?? 0}
                </Text>
              </View>
            );
          })}

          {/* Next Steps */}
          <Text style={styles.sectionTitle}>다음 단계</Text>
          <TouchableOpacity
            style={styles.nextStepCard}
            onPress={() => router.push('/gaslighting-journal' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.nextStepIcon, { backgroundColor: COLORS.sage + '20' }]}>
              <Ionicons name="journal" size={22} color={COLORS.sage} />
            </View>
            <View style={styles.nextStepInfo}>
              <Text style={styles.nextStepTitle}>관계건강 저널</Text>
              <Text style={styles.nextStepDesc}>패턴을 기록하고 현실을 앵커링하세요</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.slate} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextStepCard}
            onPress={() => router.push('/consultation')}
            activeOpacity={0.7}
          >
            <View style={[styles.nextStepIcon, { backgroundColor: COLORS.gold + '20' }]}>
              <Ionicons name="people" size={22} color={COLORS.gold} />
            </View>
            <View style={styles.nextStepInfo}>
              <Text style={styles.nextStepTitle}>변호사 상담</Text>
              <Text style={styles.nextStepDesc}>전문가의 도움을 받아보세요</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.slate} />
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            본 테스트는 전문 심리 진단을 대체하지 않습니다.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── TEST PHASE ───
  const tacticInfo = GASLIGHTING_TACTICS.find((t) => t.key === currentQuestion.tactic);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrev} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>가스라이팅 자가진단</Text>
        <View style={styles.headerBackButton} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {totalQuestions}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.questionContainer,
            { transform: [{ translateX: slideAnim }], opacity: fadeAnim },
          ]}
        >
          {/* Tactic Badge */}
          {tacticInfo && (
            <View style={[styles.categoryBadge, { backgroundColor: tacticInfo.color + '20' }]}>
              <Ionicons name={tacticInfo.icon as any} size={14} color={tacticInfo.color} />
              <Text style={[styles.categoryText, { color: tacticInfo.color }]}>
                {tacticInfo.name}
              </Text>
            </View>
          )}

          {/* Question */}
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {/* Answer Options */}
          <View style={styles.answersContainer}>
            {ANSWER_OPTIONS.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.answerCard, isSelected && styles.answerCardSelected]}
                  onPress={() => handleSelectAnswer(currentQuestion.id, option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.answerLabel, isSelected && styles.answerLabelSelected]}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.answerCheckCircle}>
                      <Ionicons name="checkmark" size={14} color={COLORS.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={handlePrev} style={styles.navButtonBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color={COLORS.slate} />
            <Text style={styles.navButtonBackText}>이전</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.navButtonNext,
              (isLastQuestion ? !allAnswered : !isAnswered) && styles.navButtonNextDisabled,
            ]}
            activeOpacity={0.7}
            disabled={isLastQuestion ? !allAnswered : !isAnswered}
          >
            <Text
              style={[
                styles.navButtonNextText,
                (isLastQuestion ? !allAnswered : !isAnswered) && styles.navButtonNextTextDisabled,
              ]}
            >
              {isLastQuestion ? '결과 확인' : '다음'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimerText}>
          전문 심리 진단을 대체하지 않습니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerBackButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText },

  // Progress
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: COLORS.plum, borderRadius: RADIUS.full },
  progressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'right',
  },

  // Scroll
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, flexGrow: 1 },

  // Question
  questionContainer: { flex: 1, alignItems: 'center' },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
    gap: 6,
  },
  categoryText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkText,
    lineHeight: 22 * 1.7,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },

  // Answers
  answersContainer: { width: '100%' },
  answerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md + 4,
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },
  answerCardSelected: { borderWidth: 2, borderColor: COLORS.plum, backgroundColor: COLORS.lavender },
  answerLabel: { fontSize: FONT_SIZE.lg, color: COLORS.darkText, fontWeight: '500', flex: 1 },
  answerLabelSelected: { fontWeight: '700', color: COLORS.darkText },
  answerCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.plum,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },

  // Footer
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.cream,
  },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  navButtonBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.slate + '40',
  },
  navButtonBackText: { fontSize: FONT_SIZE.md, color: COLORS.slate, fontWeight: '600', marginLeft: SPACING.xs },
  navButtonNext: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.plum,
  },
  navButtonNextDisabled: { backgroundColor: COLORS.warmGray },
  navButtonNextText: { fontSize: FONT_SIZE.md, color: COLORS.white, fontWeight: '700' },
  navButtonNextTextDisabled: { color: COLORS.lightText },

  // Intro
  introContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  introTitleSection: { alignItems: 'center', marginVertical: SPACING.xl },
  introTitle: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.darkText, marginTop: SPACING.md, textAlign: 'center' },
  introSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.7,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },

  // Tactic Cards
  tacticCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  tacticIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  tacticInfo: { flex: 1 },
  tacticName: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: 4 },
  tacticDescription: { fontSize: FONT_SIZE.sm, color: COLORS.slate, lineHeight: FONT_SIZE.sm * 1.6 },
  tacticExamples: { marginTop: SPACING.xs },
  tacticExample: { fontSize: FONT_SIZE.xs, color: COLORS.lightText, fontStyle: 'italic', marginTop: 2 },

  // Start Button
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: COLORS.plum,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  startButtonText: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white },

  // Result
  resultContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  gaugeContainer: { alignItems: 'center', marginVertical: SPACING.xl },
  gaugeOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBg,
  },
  gaugeScore: { fontSize: 42, fontWeight: '800' },
  gaugeMax: { fontSize: FONT_SIZE.md, color: COLORS.slate, fontWeight: '600', marginTop: -4 },
  levelBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
  },
  levelBadgeText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white },

  resultCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  resultDescription: { fontSize: FONT_SIZE.md, color: COLORS.darkText, lineHeight: FONT_SIZE.md * 1.7 },

  empathyCard: {
    alignItems: 'center',
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  empathyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.plum,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  empathyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.7,
    marginTop: SPACING.sm,
  },

  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },

  // Tactic Score Bars
  tacticScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tacticScoreLabel: { flexDirection: 'row', alignItems: 'center', width: 90, gap: 6 },
  tacticScoreName: { fontSize: FONT_SIZE.sm, color: COLORS.darkText, fontWeight: '600' },
  tacticBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginHorizontal: SPACING.sm,
  },
  tacticBarFill: { height: '100%', borderRadius: RADIUS.full },
  tacticScoreValue: { fontSize: FONT_SIZE.xs, color: COLORS.slate, fontWeight: '600', minWidth: 36, textAlign: 'right' },

  // Next Steps
  nextStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  nextStepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  nextStepInfo: { flex: 1 },
  nextStepTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText },
  nextStepDesc: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginTop: 2 },

  disclaimerText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    lineHeight: 16,
    marginTop: SPACING.lg,
  },
});
