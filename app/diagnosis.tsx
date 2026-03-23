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
import { DIAGNOSIS_QUESTIONS, LEGAL } from '@/constants/legal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ANSWER_OPTIONS = [
  { label: '전혀 없다', value: 0 },
  { label: '가끔 있다', value: 1 },
  { label: '자주 있다', value: 2 },
  { label: '항상 있다', value: 3 },
];

const SKIP_OPTION = { label: '지금은 대답하고 싶지 않아요', value: -1 };

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  '통제 행동': { bg: COLORS.blush, text: '#B5716C' },
  '언어적 폭력': { bg: '#FDEEE8', text: COLORS.coral },
  '협박': { bg: COLORS.lavender, text: COLORS.plum },
  '물리적 폭력': { bg: '#FAE5E1', text: COLORS.coralDark },
  '스토킹': { bg: '#EDE8F5', text: '#7B61A8' },
  '디지털 폭력': { bg: '#E4EDF8', text: COLORS.blue },
  '경제적 통제': { bg: '#E8F0E9', text: '#5A7F5E' },
};

export default function DiagnosisScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const totalQuestions = DIAGNOSIS_QUESTIONS.length;
  const currentQuestion = DIAGNOSIS_QUESTIONS[currentIndex];
  const progress = (currentIndex + 1) / totalQuestions;

  const animateTransition = useCallback(
    (direction: 'next' | 'prev', callback: () => void) => {
      const toValue = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => {
        callback();
        slideAnim.setValue(direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [slideAnim, fadeAnim],
  );

  const handleSelectAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      animateTransition('next', () => {
        setCurrentIndex((prev) => prev + 1);
      });
    } else {
      let totalScore = 0;
      DIAGNOSIS_QUESTIONS.forEach((q) => {
        const answerValue = answers[q.id] ?? 0;
        totalScore += (answerValue < 0 ? 0 : answerValue) * q.weight;
      });
      totalScore = Math.round(totalScore * 10) / 10;

      router.push({
        pathname: '/diagnosis-result',
        params: {
          score: totalScore,
          answers: JSON.stringify(answers),
        },
      });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      animateTransition('prev', () => {
        setCurrentIndex((prev) => prev - 1);
      });
    } else {
      router.back();
    }
  };

  const isAnswered = answers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = DIAGNOSIS_QUESTIONS.every((q) => answers[q.id] !== undefined);
  const categoryStyle = CATEGORY_COLORS[currentQuestion.category] ?? {
    bg: COLORS.blush,
    text: COLORS.gold,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrev} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{LEGAL.diagnosisLabel}</Text>
        <View style={styles.headerBackButton} />
      </View>

      {/* Progress Bar — thin, rose gold */}
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
            {
              transform: [{ translateX: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Reviewer Badge — centered above question */}
          <View style={styles.reviewerBadge}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
            <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사</Text>
          </View>

          {/* Category Badge — pill shape */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg }]}>
            <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
              {currentQuestion.category}
            </Text>
          </View>

          {/* Question Text — 22px, centered, generous line-height */}
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {/* Answer Options */}
          <View style={styles.answersContainer}>
            {ANSWER_OPTIONS.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.answerCard,
                    isSelected && styles.answerCardSelected,
                  ]}
                  onPress={() => handleSelectAnswer(currentQuestion.id, option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.answerLabel,
                      isSelected && styles.answerLabelSelected,
                    ]}
                  >
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

            {/* Skip option — separated, lighter styling */}
            <View style={{ height: 12 }} />
            {(() => {
              const isSkipSelected = answers[currentQuestion.id] === SKIP_OPTION.value;
              return (
                <TouchableOpacity
                  style={[
                    styles.skipCard,
                    isSkipSelected && styles.skipCardSelected,
                  ]}
                  onPress={() => handleSelectAnswer(currentQuestion.id, SKIP_OPTION.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.skipLabel,
                      isSkipSelected && styles.skipLabelSelected,
                    ]}
                  >
                    {SKIP_OPTION.label}
                  </Text>
                  {isSkipSelected && (
                    <View style={styles.skipCheckCircle}>
                      <Ionicons name="checkmark" size={14} color={COLORS.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })()}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Navigation Buttons */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={handlePrev}
            style={styles.navButtonBack}
            activeOpacity={0.7}
          >
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

        {/* Footer disclaimer */}
        <Text style={styles.disclaimerText}>
          이 진단은 일반적인 안내이며, 법률 조언을 대체할 수 없습니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

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

  // Progress — thin, rose gold
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
    minWidth: 45,
    textAlign: 'right',
  },

  // Scroll
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    flexGrow: 1,
  },

  // Question
  questionContainer: {
    flex: 1,
    alignItems: 'center',
  },

  // Reviewer badge — gold, centered
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

  // Category badge — pill
  categoryBadge: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.md + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
  },
  categoryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },

  // Question text — 22px, centered
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
  answersContainer: {
    width: '100%',
  },
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
  answerCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: '#FDF5F3',
  },
  answerLabel: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.darkText,
    fontWeight: '500',
    flex: 1,
  },
  answerLabelSelected: {
    fontWeight: '700',
    color: COLORS.darkText,
  },
  answerCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },

  // Skip option — distinct lighter styling
  skipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md + 4,
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.slate + '40',
    marginBottom: SPACING.sm,
  },
  skipCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.slate,
    backgroundColor: COLORS.warmGray,
  },
  skipLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    fontWeight: '500',
    fontStyle: 'italic',
    flex: 1,
  },
  skipLabelSelected: {
    fontWeight: '700',
    color: COLORS.darkText,
  },
  skipCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.slate,
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  // Back button — outline, slate border
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

  // Next button — rose gold pill, full width
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

  // Disclaimer — very small, lightText, centered
  disclaimerText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    lineHeight: 16,
  },
});
