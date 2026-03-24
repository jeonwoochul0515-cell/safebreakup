import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import PageHeader from '@/components/PageHeader';
import {
  COERCIVE_CONTROL_QUESTIONS,
  COERCIVE_CONTROL_CATEGORIES,
} from '@/constants/danger-assessment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Scale Options ───────────────────────────────────────────────────────────

const SCALE_OPTIONS = [
  { value: 0, label: '전혀 없다', color: COLORS.sage },
  { value: 1, label: '가끔 있다', color: COLORS.warning },
  { value: 2, label: '자주 있다', color: COLORS.coral },
  { value: 3, label: '항상 그렇다', color: COLORS.coralDark },
];

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function CoerciveControlScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const totalQuestions = COERCIVE_CONTROL_QUESTIONS.length;
  const currentQuestion = COERCIVE_CONTROL_QUESTIONS[currentIndex];
  const progress = Object.keys(answers).length / totalQuestions;

  const handleAnswer = useCallback(
    (value: number) => {
      const newAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(newAnswers);

      if (currentIndex < totalQuestions - 1) {
        setTimeout(() => setCurrentIndex(currentIndex + 1), 450);
      } else {
        setTimeout(() => setShowResult(true), 450);
      }
    },
    [answers, currentIndex, currentQuestion, totalQuestions]
  );

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
  };

  // ─── Compute Results ────────────────────────────────────────────────────────

  const categoryScores = COERCIVE_CONTROL_CATEGORIES.map((cat) => {
    const catQuestions = COERCIVE_CONTROL_QUESTIONS.filter(
      (q) => q.category === cat.key
    );
    const maxScore = catQuestions.length * 3;
    const score = catQuestions.reduce(
      (sum, q) => sum + (answers[q.id] ?? 0),
      0
    );
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    return { ...cat, score, maxScore, percentage };
  });

  const totalScore = Object.values(answers).reduce((s, v) => s + v, 0);
  const maxTotal = totalQuestions * 3;
  const totalPercentage = (totalScore / maxTotal) * 100;

  const getRiskLabel = () => {
    if (totalPercentage < 25) return { label: '저위험', color: COLORS.sage, desc: '현재 강압적 통제 징후가 낮습니다.' };
    if (totalPercentage < 50) return { label: '주의', color: COLORS.warning, desc: '강압적 통제 패턴이 일부 감지됩니다.' };
    if (totalPercentage < 75) return { label: '위험', color: COLORS.coral, desc: '심각한 강압적 통제 패턴이 감지됩니다.' };
    return { label: '긴급', color: COLORS.coralDark, desc: '매우 심각한 강압적 통제 상황입니다.' };
  };

  // ─── Result View ────────────────────────────────────────────────────────────

  if (showResult) {
    const risk = getRiskLabel();

    return (
      <View style={styles.root}>
        <PageHeader title="진단 결과" subtitle="강압적 통제 평가" showBack />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Overall score */}
          <View style={styles.resultTop}>
            <View style={[styles.resultBadge, { backgroundColor: risk.color + '18' }]}>
              <Text style={[styles.resultBadgeText, { color: risk.color }]}>{risk.label}</Text>
            </View>
            <Text style={styles.resultScore}>{totalScore}점</Text>
            <Text style={styles.resultMaxScore}>/ {maxTotal}점</Text>
            <Text style={styles.resultDesc}>{risk.desc}</Text>
          </View>

          {/* Message */}
          <View style={styles.messageCard}>
            <Ionicons name="heart" size={24} color={COLORS.coral} />
            <Text style={styles.messageText}>
              이것은 당신의 잘못이 아닙니다.{'\n'}
              강압적 통제는 보이지 않는 폭력입니다.{'\n'}
              당신은 안전해질 자격이 있습니다.
            </Text>
          </View>

          {/* Category breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>항목별 분석</Text>
            {categoryScores.map((cat, idx) => (
              <View key={idx} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                  <Text style={styles.barLabel}>{cat.key}</Text>
                  <Text style={styles.barScore}>
                    {cat.score}/{cat.maxScore}
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Lawyer badge */}
          <View style={styles.lawyerBadge}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.gold} />
            <Text style={styles.lawyerBadgeText}>검토: 김창희 변호사</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              activeOpacity={0.85}
              onPress={() => router.push('/diagnosis' as any)}
            >
              <Ionicons name="shield-checkmark" size={18} color={COLORS.white} />
              <Text style={styles.actionBtnPrimaryText}>위험도 정밀진단 받기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              activeOpacity={0.7}
              onPress={() => router.push('/consultation' as any)}
            >
              <Ionicons name="chatbubbles" size={18} color={COLORS.gold} />
              <Text style={styles.actionBtnSecondaryText}>변호사 상담 연결</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restartBtn}
              activeOpacity={0.7}
              onPress={handleRestart}
            >
              <Text style={styles.restartBtnText}>다시 진단하기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Question View ──────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <PageHeader
        title="강압적 통제 평가"
        subtitle={`${currentIndex + 1} / ${totalQuestions}`}
        showBack
      />

      <View style={styles.content}>
        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Question number */}
        <View style={styles.qNumberWrap}>
          <Text style={styles.qNumber}>Q{currentIndex + 1}</Text>
          <View style={[styles.qCategoryChip, { backgroundColor: COLORS.navy + '10' }]}>
            <Text style={styles.qCategoryText}>{currentQuestion.category}</Text>
          </View>
        </View>

        {/* Question text */}
        <Text style={styles.qText}>{currentQuestion.question}</Text>

        {/* Examples */}
        <View style={styles.examplesWrap}>
          <Text style={styles.examplesLabel}>예시:</Text>
          {currentQuestion.examples.map((ex, idx) => (
            <View key={idx} style={styles.exampleRow}>
              <Text style={styles.exampleBullet}>  ·  </Text>
              <Text style={styles.exampleText}>{ex}</Text>
            </View>
          ))}
        </View>

        {/* Scale options */}
        <View style={styles.scaleWrap}>
          {SCALE_OPTIONS.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.scaleBtn,
                  isSelected && { backgroundColor: opt.color, borderColor: opt.color },
                ]}
                activeOpacity={0.75}
                onPress={() => handleAnswer(opt.value)}
              >
                <View
                  style={[
                    styles.scaleRadio,
                    isSelected && { backgroundColor: COLORS.white, borderColor: COLORS.white },
                  ]}
                >
                  {isSelected && <View style={[styles.scaleRadioDot, { backgroundColor: opt.color }]} />}
                </View>
                <Text
                  style={[
                    styles.scaleBtnText,
                    isSelected && { color: COLORS.white, fontWeight: '700' },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === 0 && { opacity: 0.3 }]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={COLORS.slate} />
            <Text style={styles.navBtnText}>이전</Text>
          </TouchableOpacity>

          <Text style={styles.navCounter}>
            {currentIndex + 1} / {totalQuestions}
          </Text>

          {currentIndex < totalQuestions - 1 && answers[currentQuestion.id] !== undefined && (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setCurrentIndex(currentIndex + 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.navBtnText}>다음</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.slate} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },

  /* Progress */
  progressWrap: {
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },

  /* Question */
  qNumberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  qNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.gold,
  },
  qCategoryChip: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  qCategoryText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.navy,
  },
  qText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    lineHeight: FONT_SIZE.xl * 1.55,
    marginBottom: SPACING.lg,
  },

  /* Examples */
  examplesWrap: {
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  examplesLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.slate,
    marginBottom: SPACING.sm,
  },
  exampleRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  exampleBullet: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
  },
  exampleText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    flex: 1,
    lineHeight: FONT_SIZE.sm * 1.5,
  },

  /* Scale */
  scaleWrap: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  scaleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    minHeight: 52,
  },
  scaleRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scaleBtnText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    fontWeight: '500',
  },

  /* Navigation */
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  navBtnText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    fontWeight: '600',
  },
  navCounter: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    fontWeight: '500',
  },

  /* Result */
  resultTop: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  resultBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  resultBadgeText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: -1,
  },
  resultMaxScore: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.lightText,
    marginTop: 2,
  },
  resultDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: FONT_SIZE.md * 1.6,
  },

  messageCard: {
    backgroundColor: COLORS.blush,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  messageText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.7,
    fontWeight: '600',
  },

  breakdownSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  breakdownTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.lg,
  },
  barRow: {
    marginBottom: SPACING.md,
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs + 2,
  },
  barLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
    flex: 1,
  },
  barScore: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  barTrack: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },

  lawyerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(196,149,106,0.08)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(196,149,106,0.2)',
  },
  lawyerBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gold,
  },

  actionSection: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    minHeight: 54,
    ...SHADOW.md,
  },
  actionBtnPrimaryText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.cardBg,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    minHeight: 54,
  },
  actionBtnSecondaryText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gold,
  },
  restartBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  restartBtnText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.lightText,
    fontWeight: '600',
  },
});
