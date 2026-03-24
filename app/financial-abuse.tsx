import React, { useState } from 'react';
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
import {
  FINANCIAL_ABUSE_QUESTIONS,
  FINANCIAL_RISK_LEVELS,
  ESSENTIAL_DOCUMENTS,
  WELFARE_PROGRAMS,
  SECRET_SAVINGS_TIPS,
} from '@/constants/financial-abuse';

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

type TabKey = 'diagnosis' | 'savings' | 'documents' | 'welfare';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'diagnosis', label: '자가진단', icon: 'clipboard' },
  { key: 'savings', label: '비밀저축 가이드', icon: 'wallet' },
  { key: 'documents', label: '필수서류', icon: 'document-text' },
  { key: 'welfare', label: '정부지원', icon: 'flag' },
];

const ANSWER_OPTIONS = [
  { label: '전혀 아니다', value: 0 },
  { label: '가끔 그렇다', value: 1 },
  { label: '자주 그렇다', value: 2 },
  { label: '항상 그렇다', value: 3 },
];

function getFinancialRiskLevel(score: number) {
  return (
    FINANCIAL_RISK_LEVELS.find((r) => score >= r.range[0] && score <= r.range[1]) ??
    FINANCIAL_RISK_LEVELS[0]
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function FinancialAbuseScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('diagnosis');
  const [diagAnswers, setDiagAnswers] = useState<Record<number, number>>({});
  const [showDiagResult, setShowDiagResult] = useState(false);
  const [docChecks, setDocChecks] = useState<Record<string, boolean>>({});

  // Diagnosis score
  const diagScore = FINANCIAL_ABUSE_QUESTIONS.reduce((acc, q) => {
    const answerVal = diagAnswers[q.id] ?? 0;
    return acc + answerVal;
  }, 0);
  const weightedScore = FINANCIAL_ABUSE_QUESTIONS.reduce((acc, q) => {
    const answerVal = diagAnswers[q.id] ?? 0;
    const fraction = answerVal / 3;
    return acc + fraction * q.weight;
  }, 0);
  const roundedWeightedScore = Math.round(weightedScore);
  const riskLevel = getFinancialRiskLevel(roundedWeightedScore);

  // Documents progress
  const totalDocs = ESSENTIAL_DOCUMENTS.reduce((s, g) => s + g.items.length, 0);
  const checkedDocs = Object.values(docChecks).filter(Boolean).length;
  const docProgress = totalDocs > 0 ? checkedDocs / totalDocs : 0;

  // ---------------------------------------------------------------------------
  // Tab: Diagnosis
  // ---------------------------------------------------------------------------

  const renderDiagnosis = () => {
    if (showDiagResult) {
      return (
        <View>
          {/* Lawyer Badge */}
          <View style={styles.reviewerBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.gold} />
            <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사</Text>
          </View>

          {/* Score */}
          <View style={styles.scoreCard}>
            <Text style={[styles.scoreValue, { color: riskLevel.color }]}>
              {roundedWeightedScore}점
            </Text>
            <View style={[styles.scoreBadge, { backgroundColor: riskLevel.color + '20' }]}>
              <View style={[styles.scoreDot, { backgroundColor: riskLevel.color }]} />
              <Text style={[styles.scoreBadgeText, { color: riskLevel.color }]}>
                {riskLevel.label}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.resultDescCard}>
            <View style={[styles.resultAccent, { backgroundColor: riskLevel.color }]} />
            <Text style={styles.resultDescText}>{riskLevel.description}</Text>
          </View>

          {/* Retry */}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setShowDiagResult(false);
              setDiagAnswers({});
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>다시 진단하기</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const allAnswered = FINANCIAL_ABUSE_QUESTIONS.every((q) => diagAnswers[q.id] !== undefined);

    return (
      <View>
        {/* Lawyer Badge */}
        <View style={styles.reviewerBadge}>
          <Ionicons name="shield-checkmark" size={14} color={COLORS.gold} />
          <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사</Text>
        </View>

        {FINANCIAL_ABUSE_QUESTIONS.map((q) => (
          <View key={q.id} style={styles.diagQuestionCard}>
            <Text style={styles.diagQuestionText}>
              {q.id}. {q.question}
            </Text>
            <View style={styles.diagOptionsRow}>
              {ANSWER_OPTIONS.map((opt) => {
                const isSelected = diagAnswers[q.id] === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.diagOption, isSelected && styles.diagOptionSelected]}
                    onPress={() => setDiagAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.diagOptionText,
                        isSelected && styles.diagOptionTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, !allAnswered && styles.submitButtonDisabled]}
          onPress={() => setShowDiagResult(true)}
          activeOpacity={0.8}
          disabled={!allAnswered}
        >
          <Text style={[styles.submitButtonText, !allAnswered && styles.submitButtonTextDisabled]}>
            결과 확인
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // Tab: Secret Savings
  // ---------------------------------------------------------------------------

  const renderSavings = () => (
    <View>
      <Text style={styles.tabIntro}>
        경제적 독립을 위한 비밀 저축 전략입니다. 안전을 최우선으로 진행하세요.
      </Text>

      {SECRET_SAVINGS_TIPS.map((tip, idx) => (
        <View key={idx} style={styles.savingsCard}>
          <View style={styles.savingsCardHeader}>
            <View style={styles.savingsIconCircle}>
              <Ionicons name={tip.icon as any} size={22} color={COLORS.gold} />
            </View>
            <Text style={styles.savingsTitle}>{tip.title}</Text>
          </View>
          <Text style={styles.savingsDesc}>{tip.description}</Text>
          <View style={styles.savingsWarning}>
            <Ionicons name="alert-circle" size={14} color={COLORS.coral} />
            <Text style={styles.savingsWarningText}>{tip.warning}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  // ---------------------------------------------------------------------------
  // Tab: Documents
  // ---------------------------------------------------------------------------

  const renderDocuments = () => (
    <View>
      {/* Progress */}
      <View style={styles.docProgressCard}>
        <View style={styles.docProgressHeader}>
          <Text style={styles.docProgressLabel}>서류 준비 현황</Text>
          <Text style={styles.docProgressValue}>
            {checkedDocs} / {totalDocs}
          </Text>
        </View>
        <View style={styles.docProgressBarBg}>
          <View
            style={[styles.docProgressBarFill, { width: `${docProgress * 100}%` }]}
          />
        </View>
      </View>

      {/* Lawyer Badge */}
      <View style={styles.reviewerBadge}>
        <Ionicons name="shield-checkmark" size={14} color={COLORS.gold} />
        <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사</Text>
      </View>

      {ESSENTIAL_DOCUMENTS.map((group) => (
        <View key={group.category} style={styles.docGroup}>
          <View style={styles.docGroupHeader}>
            <Ionicons name={group.icon as any} size={18} color={COLORS.gold} />
            <Text style={styles.docGroupTitle}>{group.category}</Text>
          </View>
          {group.items.map((item) => {
            const isChecked = docChecks[item.id] ?? false;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.docItem, isChecked && styles.docItemChecked]}
                onPress={() =>
                  setDocChecks((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                }
                activeOpacity={0.7}
              >
                <View style={[styles.docCheckbox, isChecked && styles.docCheckboxChecked]}>
                  {isChecked && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                </View>
                <Text
                  style={[styles.docItemText, isChecked && styles.docItemTextChecked]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );

  // ---------------------------------------------------------------------------
  // Tab: Welfare
  // ---------------------------------------------------------------------------

  const renderWelfare = () => (
    <View>
      <Text style={styles.tabIntro}>
        가정폭력 피해자를 위한 정부 지원 프로그램입니다.
      </Text>

      {WELFARE_PROGRAMS.map((prog, idx) => (
        <View key={idx} style={styles.welfareCard}>
          <View style={styles.welfareHeader}>
            <View style={styles.welfareIconCircle}>
              <Ionicons name={prog.icon as any} size={22} color={COLORS.gold} />
            </View>
            <View style={styles.welfareHeaderText}>
              <Text style={styles.welfareName}>{prog.name}</Text>
              <Text style={styles.welfareEligibility}>{prog.eligibility}</Text>
            </View>
          </View>
          <Text style={styles.welfareDesc}>{prog.description}</Text>
          <TouchableOpacity
            style={styles.welfareContactButton}
            onPress={() => {
              const phoneMatch = prog.contact.match(/\d[\d-]+/);
              if (phoneMatch) Linking.openURL(`tel:${phoneMatch[0].replace(/-/g, '')}`);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={16} color={COLORS.gold} />
            <Text style={styles.welfareContactText}>{prog.contact}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>경제적 학대</Text>
        <View style={styles.headerBackButton} />
      </View>

      {/* Tab Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={isActive ? COLORS.gold : COLORS.slate}
              />
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'diagnosis' && renderDiagnosis()}
        {activeTab === 'savings' && renderSavings()}
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'welfare' && renderWelfare()}
      </ScrollView>
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

  // Tab Bar
  tabBar: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: COLORS.gold + '15',
    borderColor: COLORS.gold,
  },
  tabButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },

  // Scroll
  scrollArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Shared
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
  tabIntro: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },

  // ---- Diagnosis ----
  diagQuestionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  diagQuestionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  diagOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
  },
  diagOption: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmGray,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  diagOptionSelected: {
    backgroundColor: COLORS.gold + '20',
    borderColor: COLORS.gold,
  },
  diagOptionText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    fontWeight: '500',
  },
  diagOptionTextSelected: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  submitButton: {
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.warmGray,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  submitButtonTextDisabled: {
    color: COLORS.lightText,
  },

  // Diagnosis result
  scoreCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  scoreValue: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '800',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginTop: SPACING.sm,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  scoreBadgeText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  resultDescCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  resultAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
  resultDescText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 26,
  },
  retryButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  retryButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gold,
    textDecorationLine: 'underline',
  },

  // ---- Savings ----
  savingsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  savingsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  savingsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    flex: 1,
  },
  savingsDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  savingsWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FDF0ED',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    gap: 6,
  },
  savingsWarningText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.coralDark,
    lineHeight: 18,
  },

  // ---- Documents ----
  docProgressCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  docProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  docProgressLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  docProgressValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.sage,
  },
  docProgressBarBg: {
    height: 6,
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  docProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.sage,
    borderRadius: RADIUS.full,
  },
  docGroup: {
    marginBottom: SPACING.md,
  },
  docGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  docGroupTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  docItemChecked: {
    backgroundColor: COLORS.sage + '10',
    borderColor: COLORS.sage + '40',
  },
  docCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  docCheckboxChecked: {
    backgroundColor: COLORS.sage,
    borderColor: COLORS.sage,
  },
  docItemText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    fontWeight: '500',
  },
  docItemTextChecked: {
    color: COLORS.sage,
  },

  // ---- Welfare ----
  welfareCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  welfareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  welfareIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welfareHeaderText: {
    flex: 1,
  },
  welfareName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  welfareEligibility: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: 2,
  },
  welfareDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  welfareContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold + '15',
    gap: 6,
  },
  welfareContactText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gold,
    fontWeight: '600',
  },
});
