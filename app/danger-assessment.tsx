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
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import {
  DANGER_QUESTIONS,
  RISK_LEVELS,
  DANGER_CATEGORIES,
  type DangerQuestion,
  type RiskLevel,
} from '@/constants/danger-assessment';
import RiskMeter from '@/components/RiskMeter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ANSWER_OPTIONS = [
  { label: '전혀 아니다', value: 0 },
  { label: '거의 아니다', value: 1 },
  { label: '가끔 그렇다', value: 2 },
  { label: '자주 그렇다', value: 3 },
  { label: '매우 그렇다', value: 4 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRiskLevel(score: number): RiskLevel {
  return RISK_LEVELS.find((r) => score >= r.range[0] && score <= r.range[1]) ?? RISK_LEVELS[0];
}

function getCategoryColor(category: string): string {
  return DANGER_CATEGORIES.find((c) => c.key === category)?.color ?? COLORS.slate;
}

function getCategoryIcon(category: string): string {
  return DANGER_CATEGORIES.find((c) => c.key === category)?.icon ?? 'alert-circle';
}

function computeCategoryScores(answers: Record<number, number>): { category: string; score: number; maxScore: number; color: string }[] {
  const categoryMap: Record<string, { score: number; maxScore: number }> = {};
  DANGER_QUESTIONS.forEach((q) => {
    if (!categoryMap[q.category]) categoryMap[q.category] = { score: 0, maxScore: 0 };
    const answerRaw = answers[q.id] ?? 0;
    const answerFraction = answerRaw / 4;
    categoryMap[q.category].score += answerFraction * q.weight;
    categoryMap[q.category].maxScore += q.weight;
  });
  return Object.entries(categoryMap).map(([category, { score, maxScore }]) => ({
    category,
    score: Math.round(score * 10) / 10,
    maxScore,
    color: getCategoryColor(category),
  }));
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function DangerAssessmentScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [expandedHelp, setExpandedHelp] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const totalQuestions = DANGER_QUESTIONS.length;
  const currentQuestion = DANGER_QUESTIONS[currentIndex];
  const progress = (currentIndex + 1) / totalQuestions;

  // Compute total score
  const totalScore = DANGER_QUESTIONS.reduce((acc, q) => {
    const answerRaw = answers[q.id] ?? 0;
    const fraction = answerRaw / 4;
    return acc + fraction * q.weight;
  }, 0);
  const roundedScore = Math.round(totalScore);
  const maxPossibleScore = DANGER_QUESTIONS.reduce((acc, q) => acc + q.weight, 0);

  const riskLevel = getRiskLevel(roundedScore);
  const categoryScores = computeCategoryScores(answers);

  // ---------------------------------------------------------------------------
  // Animation
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelectAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // 선택 표시 후 0.45초 뒤 자동 다음 문항
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        animateTransition('next', () => {
          setCurrentIndex((prev) => prev + 1);
          setExpandedHelp(false);
        });
      } else {
        setShowResult(true);
      }
    }, 450);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      animateTransition('next', () => {
        setCurrentIndex((prev) => prev + 1);
        setExpandedHelp(false);
      });
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (showResult) {
      setShowResult(false);
      return;
    }
    if (currentIndex > 0) {
      animateTransition('prev', () => {
        setCurrentIndex((prev) => prev - 1);
        setExpandedHelp(false);
      });
    } else {
      router.back();
    }
  };

  const isAnswered = answers[currentQuestion?.id] !== undefined;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = DANGER_QUESTIONS.every((q) => answers[q.id] !== undefined);

  // ---------------------------------------------------------------------------
  // Result View
  // ---------------------------------------------------------------------------

  if (showResult) {
    const dangerSignalCount = DANGER_QUESTIONS.filter(
      (q) => q.dangerSignal && (answers[q.id] ?? 0) >= 3,
    ).length;

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrev} style={styles.headerBackButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>위험도 분석 결과</Text>
          <View style={styles.headerBackButton} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Lawyer Badge */}
          <View style={styles.reviewerBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.gold} />
            <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사 (법률사무소 청송)</Text>
          </View>

          {/* Risk Meter */}
          <RiskMeter
            score={roundedScore}
            maxScore={maxPossibleScore}
            riskLevel={riskLevel.label}
            riskColor={riskLevel.color}
          />

          {/* Danger Signals Warning */}
          {dangerSignalCount > 0 && (
            <View style={[styles.warningCard, { borderLeftColor: COLORS.coral }]}>
              <Ionicons name="warning" size={20} color={COLORS.coral} />
              <Text style={styles.warningText}>
                {dangerSignalCount}개의 치명적 위험 신호가 감지되었습니다
              </Text>
            </View>
          )}

          {/* Risk Description */}
          <View style={styles.descriptionCard}>
            <View style={[styles.descriptionAccent, { backgroundColor: riskLevel.color }]} />
            <Text style={styles.descriptionTitle}>상황 분석</Text>
            <Text style={styles.descriptionText}>{riskLevel.description}</Text>
            <View style={styles.divider} />
            <Text style={styles.descriptionTitle}>권고 사항</Text>
            <Text style={styles.descriptionText}>{riskLevel.recommendation}</Text>
          </View>

          {/* Category Breakdown */}
          <Text style={styles.sectionTitle}>항목별 분석</Text>
          <View style={styles.categoryBreakdownCard}>
            {categoryScores
              .filter((c) => c.score > 0)
              .sort((a, b) => b.score - a.score)
              .map((cat) => {
                const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
                return (
                  <View key={cat.category} style={styles.categoryRow}>
                    <View style={styles.categoryRowHeader}>
                      <Ionicons
                        name={getCategoryIcon(cat.category) as any}
                        size={16}
                        color={cat.color}
                      />
                      <Text style={styles.categoryRowLabel}>{cat.category}</Text>
                      <Text style={[styles.categoryRowScore, { color: cat.color }]}>
                        {cat.score}/{cat.maxScore}
                      </Text>
                    </View>
                    <View style={styles.categoryBarBg}>
                      <View
                        style={[
                          styles.categoryBarFill,
                          { width: `${pct}%`, backgroundColor: cat.color },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            {categoryScores.filter((c) => c.score > 0).length === 0 && (
              <Text style={styles.emptyCategoryText}>해당 항목이 없습니다</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => router.push('/safety-planner' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
              <Text style={styles.primaryActionText}>안전계획 만들기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => router.push('/consultation' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.gold} />
              <Text style={styles.secondaryActionText}>변호사 상담</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sosButton}
              onPress={() => Linking.openURL('tel:112')}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={20} color={COLORS.white} />
              <Text style={styles.sosButtonText}>SOS 긴급전화</Text>
            </TouchableOpacity>
          </View>

          {/* Safety Disclaimers */}
          <View style={styles.disclaimerCard}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.lightText} />
            <Text style={styles.disclaimerCardText}>
              이 평가는 Campbell Danger Assessment를 기반으로 한 참고용 도구이며, 전문적인 법률·의료 조언을 대체하지 않습니다. 위급 상황에서는 즉시 112(경찰) 또는 1366(여성긴급전화)에 연락하세요.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Question View
  // ---------------------------------------------------------------------------

  const categoryColor = getCategoryColor(currentQuestion.category);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrev} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>위험도 정밀진단</Text>
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

      {/* Question Area */}
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
          {/* Reviewer Badge */}
          <View style={styles.reviewerBadge}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
            <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사</Text>
          </View>

          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Ionicons
              name={getCategoryIcon(currentQuestion.category) as any}
              size={14}
              color={categoryColor}
            />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {currentQuestion.category}
            </Text>
          </View>

          {/* Danger Signal Indicator */}
          {currentQuestion.dangerSignal && (
            <View style={styles.dangerSignalBadge}>
              <Ionicons name="alert-circle" size={12} color={COLORS.coral} />
              <Text style={styles.dangerSignalText}>치명적 위험 신호</Text>
            </View>
          )}

          {/* Question Text */}
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {/* Help Text (expandable) */}
          <TouchableOpacity
            style={styles.helpToggle}
            onPress={() => setExpandedHelp(!expandedHelp)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={expandedHelp ? 'chevron-up-circle-outline' : 'help-circle-outline'}
              size={18}
              color={COLORS.slate}
            />
            <Text style={styles.helpToggleText}>
              {expandedHelp ? '도움말 접기' : '왜 이 질문을 하나요?'}
            </Text>
          </TouchableOpacity>
          {expandedHelp && (
            <View style={styles.helpCard}>
              <Text style={styles.helpCardText}>{currentQuestion.helpText}</Text>
            </View>
          )}

          {/* Answer Options — 5-point scale */}
          <View style={styles.answersContainer}>
            {ANSWER_OPTIONS.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              const answerWeight = option.value === 4 ? currentQuestion.weight : option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.answerCard, isSelected && styles.answerCardSelected]}
                  onPress={() => handleSelectAnswer(currentQuestion.id, option.value)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.answerDot, isSelected && { backgroundColor: categoryColor }]}>
                    {isSelected && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                  </View>
                  <Text style={[styles.answerLabel, isSelected && styles.answerLabelSelected]}>
                    {option.label}
                  </Text>
                  <View style={styles.answerWeightBadge}>
                    <Text style={styles.answerWeightText}>{option.value}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
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
          이 진단은 일반적인 안내이며, 법률 조언을 대체할 수 없습니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },

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
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },

  // Scroll
  scrollArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    flexGrow: 1,
  },
  resultScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Question
  questionContainer: {
    flex: 1,
    alignItems: 'center',
  },

  // Reviewer badge
  reviewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  reviewerBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },

  // Category badge
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: SPACING.md + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
    gap: 6,
  },
  categoryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },

  // Danger signal
  dangerSignalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.md,
  },
  dangerSignalText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.coral,
    fontWeight: '600',
  },

  // Question text
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkText,
    lineHeight: 22 * 1.7,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },

  // Help text
  helpToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  helpToggleText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    fontWeight: '500',
  },
  helpCard: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    width: '100%',
  },
  helpCardText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    lineHeight: 20,
  },

  // Answers
  answersContainer: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  answerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md + 4,
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },
  answerCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: '#FDF5F3',
  },
  answerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  answerLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    fontWeight: '500',
    flex: 1,
  },
  answerLabelSelected: {
    fontWeight: '700',
  },
  answerWeightBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerWeightText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    fontWeight: '600',
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
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
  navButtonBackText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  navButtonNext: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
  },
  navButtonNextDisabled: {
    backgroundColor: COLORS.warmGray,
  },
  navButtonNextText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    fontWeight: '700',
  },
  navButtonNextTextDisabled: {
    color: COLORS.lightText,
  },
  disclaimerText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    lineHeight: 16,
  },

  // ---- Result Styles ----
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  // Warning card
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF0ED',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.coralDark,
    fontWeight: '600',
    lineHeight: 22,
  },

  // Description card
  descriptionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg + 4,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  descriptionAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
  descriptionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },

  // Category breakdown
  categoryBreakdownCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  categoryRow: {
    marginBottom: SPACING.md,
  },
  categoryRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  categoryRowLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  categoryRowScore: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  categoryBarBg: {
    height: 6,
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  emptyCategoryText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },

  // Action buttons
  actionButtonsContainer: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  primaryActionText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.gold,
    gap: SPACING.sm,
  },
  secondaryActionText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gold,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.coral,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  sosButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Disclaimer card
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  disclaimerCardText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    lineHeight: 18,
  },
});
