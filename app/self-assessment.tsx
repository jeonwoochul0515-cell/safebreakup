import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import {
  PHQ9_QUESTIONS,
  PHQ9_OPTIONS,
  PHQ9_LEVELS,
  PCL5_QUESTIONS,
  PCL5_OPTIONS,
} from '@/constants/trauma-recovery';

type Tab = 'phq9' | 'pcl5';
type Phase = 'questions' | 'result';

const CRISIS_NUMBERS = [
  { name: '자살예방상담전화', phone: '1393', icon: 'heart' },
  { name: '경찰', phone: '112', icon: 'shield' },
  { name: '여성긴급전화', phone: '1366', icon: 'call' },
];

export default function SelfAssessmentScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('phq9');
  const [phase, setPhase] = useState<Phase>('questions');
  const [phq9Answers, setPhq9Answers] = useState<Record<number, number>>({});
  const [pcl5Answers, setPcl5Answers] = useState<Record<number, number>>({});
  const [crisisModalVisible, setCrisisModalVisible] = useState(false);

  // PHQ-9
  const phq9Score = PHQ9_QUESTIONS.reduce((sum, q) => sum + (phq9Answers[q.id] ?? 0), 0);
  const phq9Level =
    PHQ9_LEVELS.find((l) => phq9Score >= l.range[0] && phq9Score <= l.range[1]) ?? PHQ9_LEVELS[0];
  const phq9AllAnswered = PHQ9_QUESTIONS.every((q) => phq9Answers[q.id] !== undefined);

  // PCL-5
  const pcl5Score = PCL5_QUESTIONS.reduce((sum, q) => sum + (pcl5Answers[q.id] ?? 0), 0);
  const pcl5Max = PCL5_QUESTIONS.length * 4;
  const pcl5AllAnswered = PCL5_QUESTIONS.every((q) => pcl5Answers[q.id] !== undefined);

  const getPcl5Interpretation = () => {
    if (pcl5Score <= 10) return { label: '정상 범위', color: '#7A9E7E', description: 'PTSD 증상이 거의 없습니다.', recommendation: '현재 상태를 유지하세요.' };
    if (pcl5Score <= 20) return { label: '경미한 증상', color: '#D4A373', description: '경미한 외상 후 스트레스 증상이 있습니다.', recommendation: '자기 돌봄과 그라운딩 연습을 시작해보세요.' };
    if (pcl5Score <= 28) return { label: '중등도 증상', color: '#E07A5F', description: '중등도의 PTSD 증상이 감지됩니다.', recommendation: '전문 상담을 받아보는 것을 권장합니다.' };
    return { label: '심한 증상', color: '#C4634B', description: '심한 외상 후 스트레스 증상이 있습니다.', recommendation: '전문 치료를 즉시 받으세요.' };
  };

  const handlePhq9Answer = (questionId: number, value: number) => {
    setPhq9Answers((prev) => ({ ...prev, [questionId]: value }));

    // CRITICAL: Q9 crisis check
    if (questionId === 9 && value >= 1) {
      setCrisisModalVisible(true);
    }
  };

  const handlePcl5Answer = (questionId: number, value: number) => {
    setPcl5Answers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleShowResult = () => {
    setPhase('result');
  };

  const handleReset = () => {
    setPhase('questions');
    if (activeTab === 'phq9') setPhq9Answers({});
    else setPcl5Answers({});
  };

  const options = activeTab === 'phq9' ? PHQ9_OPTIONS : PCL5_OPTIONS;
  const questions = activeTab === 'phq9' ? PHQ9_QUESTIONS : PCL5_QUESTIONS;
  const answers = activeTab === 'phq9' ? phq9Answers : pcl5Answers;
  const allAnswered = activeTab === 'phq9' ? phq9AllAnswered : pcl5AllAnswered;
  const handleAnswer = activeTab === 'phq9' ? handlePhq9Answer : handlePcl5Answer;

  return (
    <SafeAreaView style={styles.container}>
      {/* Crisis Modal */}
      <Modal
        visible={crisisModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCrisisModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.crisisIconCircle}>
              <Ionicons name="heart" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.crisisTitle}>지금 도움을 받을 수 있습니다</Text>
            <Text style={styles.crisisSubtitle}>
              당신은 혼자가 아닙니다.{'\n'}
              전문 상담사가 24시간 도움을 드립니다.
            </Text>

            {CRISIS_NUMBERS.map((cn) => (
              <TouchableOpacity
                key={cn.phone}
                style={styles.crisisPhoneRow}
                onPress={() => Linking.openURL(`tel:${cn.phone}`)}
                activeOpacity={0.7}
              >
                <View style={styles.crisisPhoneIcon}>
                  <Ionicons name={cn.icon as any} size={18} color={COLORS.white} />
                </View>
                <View style={styles.crisisPhoneInfo}>
                  <Text style={styles.crisisPhoneName}>{cn.name}</Text>
                  <Text style={styles.crisisPhoneNumber}>{cn.phone}</Text>
                </View>
                <Ionicons name="call" size={20} color={COLORS.coral} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.crisisCloseButton}
              onPress={() => setCrisisModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.crisisCloseText}>계속 진행하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { if (phase === 'result') setPhase('questions'); else router.back(); }} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>자가 선별검사</Text>
        <View style={styles.headerBackButton} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'phq9' && styles.tabActive]}
          onPress={() => { setActiveTab('phq9'); setPhase('questions'); }}
        >
          <Text style={[styles.tabText, activeTab === 'phq9' && styles.tabTextActive]}>우울 선별검사</Text>
          <Text style={[styles.tabSubText, activeTab === 'phq9' && styles.tabSubTextActive]}>PHQ-9</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pcl5' && styles.tabActive]}
          onPress={() => { setActiveTab('pcl5'); setPhase('questions'); }}
        >
          <Text style={[styles.tabText, activeTab === 'pcl5' && styles.tabTextActive]}>PTSD 선별검사</Text>
          <Text style={[styles.tabSubText, activeTab === 'pcl5' && styles.tabSubTextActive]}>PCL-5</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {phase === 'questions' ? (
          <>
            <Text style={styles.instructionText}>
              {activeTab === 'phq9'
                ? '지난 2주 동안 다음의 문제들로 인해 얼마나 자주 방해를 받았습니까?'
                : '지난 1개월 동안 다음의 증상을 얼마나 경험하셨습니까?'}
            </Text>

            {questions.map((q, qIdx) => (
              <View key={q.id} style={styles.questionCard}>
                <Text style={styles.questionNumber}>Q{qIdx + 1}</Text>
                <Text style={styles.questionText}>{q.question}</Text>
                {/* Q9 warning icon for PHQ-9 */}
                {activeTab === 'phq9' && q.id === 9 && (
                  <View style={styles.criticalBadge}>
                    <Ionicons name="warning" size={12} color={COLORS.coral} />
                    <Text style={styles.criticalText}>중요 문항</Text>
                  </View>
                )}
                <View style={styles.optionsRow}>
                  {options.map((opt) => {
                    const isSelected = answers[q.id] === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                        onPress={() => handleAnswer(q.id, opt.value)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
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
              onPress={handleShowResult}
              disabled={!allAnswered}
              activeOpacity={0.7}
            >
              <Text style={[styles.submitButtonText, !allAnswered && styles.submitButtonTextDisabled]}>
                결과 확인
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimerText}>
              의학적 진단이 아닌 자가 선별입니다.
            </Text>
          </>
        ) : (
          <>
            {/* Result */}
            {activeTab === 'phq9' ? (
              <>
                <View style={styles.resultGauge}>
                  <View style={[styles.resultGaugeOuter, { borderColor: phq9Level.color + '30' }]}>
                    <View style={[styles.resultGaugeInner, { borderColor: phq9Level.color }]}>
                      <Text style={[styles.resultScore, { color: phq9Level.color }]}>{phq9Score}</Text>
                      <Text style={styles.resultMax}>/ 27</Text>
                    </View>
                  </View>
                  <View style={[styles.resultLevelBadge, { backgroundColor: phq9Level.color }]}>
                    <Text style={styles.resultLevelText}>{phq9Level.label}</Text>
                  </View>
                </View>

                {/* Score bar */}
                <View style={styles.scoreBarSection}>
                  <View style={styles.scoreBarBg}>
                    <View
                      style={[
                        styles.scoreBarFill,
                        { width: `${(phq9Score / 27) * 100}%`, backgroundColor: phq9Level.color },
                      ]}
                    />
                  </View>
                  <View style={styles.scoreBarLabels}>
                    <Text style={styles.scoreBarLabel}>0</Text>
                    <Text style={styles.scoreBarLabel}>27</Text>
                  </View>
                </View>

                <View style={[styles.resultCard, { borderLeftColor: phq9Level.color }]}>
                  <Text style={styles.resultDescription}>{phq9Level.description}</Text>
                  <Text style={styles.resultRecommendation}>{phq9Level.recommendation}</Text>
                </View>
              </>
            ) : (
              <>
                {(() => {
                  const interp = getPcl5Interpretation();
                  return (
                    <>
                      <View style={styles.resultGauge}>
                        <View style={[styles.resultGaugeOuter, { borderColor: interp.color + '30' }]}>
                          <View style={[styles.resultGaugeInner, { borderColor: interp.color }]}>
                            <Text style={[styles.resultScore, { color: interp.color }]}>{pcl5Score}</Text>
                            <Text style={styles.resultMax}>/ {pcl5Max}</Text>
                          </View>
                        </View>
                        <View style={[styles.resultLevelBadge, { backgroundColor: interp.color }]}>
                          <Text style={styles.resultLevelText}>{interp.label}</Text>
                        </View>
                      </View>

                      <View style={styles.scoreBarSection}>
                        <View style={styles.scoreBarBg}>
                          <View
                            style={[
                              styles.scoreBarFill,
                              { width: `${(pcl5Score / pcl5Max) * 100}%`, backgroundColor: interp.color },
                            ]}
                          />
                        </View>
                        <View style={styles.scoreBarLabels}>
                          <Text style={styles.scoreBarLabel}>0</Text>
                          <Text style={styles.scoreBarLabel}>{pcl5Max}</Text>
                        </View>
                      </View>

                      <View style={[styles.resultCard, { borderLeftColor: interp.color }]}>
                        <Text style={styles.resultDescription}>{interp.description}</Text>
                        <Text style={styles.resultRecommendation}>{interp.recommendation}</Text>
                      </View>
                    </>
                  );
                })()}
              </>
            )}

            <TouchableOpacity style={styles.retryButton} onPress={handleReset} activeOpacity={0.7}>
              <Ionicons name="refresh" size={18} color={COLORS.plum} />
              <Text style={styles.retryButtonText}>다시 검사하기</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimerText}>
              의학적 진단이 아닌 자가 선별입니다. 결과에 따라 전문가 상담을 권장합니다.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerBackButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  tabActive: { backgroundColor: COLORS.cardBg, ...SHADOW.sm },
  tabText: { fontSize: FONT_SIZE.sm, color: COLORS.slate, fontWeight: '600' },
  tabTextActive: { color: COLORS.darkText, fontWeight: '700' },
  tabSubText: { fontSize: FONT_SIZE.xs, color: COLORS.lightText, marginTop: 1 },
  tabSubTextActive: { color: COLORS.plum },

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },

  instructionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    lineHeight: FONT_SIZE.md * 1.7,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },

  // Question
  questionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  questionNumber: { fontSize: FONT_SIZE.xs, color: COLORS.plum, fontWeight: '700', marginBottom: SPACING.xs },
  questionText: { fontSize: FONT_SIZE.md, color: COLORS.darkText, lineHeight: FONT_SIZE.md * 1.6, marginBottom: SPACING.md },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  criticalText: { fontSize: FONT_SIZE.xs, color: COLORS.coral, fontWeight: '700' },

  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  optionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmGray,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  optionChipSelected: { backgroundColor: COLORS.plum + '20', borderColor: COLORS.plum },
  optionText: { fontSize: FONT_SIZE.sm, color: COLORS.slate, fontWeight: '500' },
  optionTextSelected: { color: COLORS.plum, fontWeight: '700' },

  submitButton: {
    height: 56,
    backgroundColor: COLORS.plum,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  submitButtonDisabled: { backgroundColor: COLORS.warmGray },
  submitButtonText: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white },
  submitButtonTextDisabled: { color: COLORS.lightText },

  // Result
  resultGauge: { alignItems: 'center', marginVertical: SPACING.xl },
  resultGaugeOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultGaugeInner: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBg,
  },
  resultScore: { fontSize: 38, fontWeight: '800' },
  resultMax: { fontSize: FONT_SIZE.sm, color: COLORS.slate, fontWeight: '600', marginTop: -2 },
  resultLevelBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
  },
  resultLevelText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white },

  scoreBarSection: { marginBottom: SPACING.lg },
  scoreBarBg: {
    height: 8,
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  scoreBarFill: { height: '100%', borderRadius: RADIUS.full },
  scoreBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  scoreBarLabel: { fontSize: FONT_SIZE.xs, color: COLORS.lightText },

  resultCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  resultDescription: { fontSize: FONT_SIZE.md, color: COLORS.darkText, lineHeight: FONT_SIZE.md * 1.7, marginBottom: SPACING.sm },
  resultRecommendation: { fontSize: FONT_SIZE.sm, color: COLORS.sage, fontWeight: '600', lineHeight: FONT_SIZE.sm * 1.6 },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.plum + '40',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  retryButtonText: { fontSize: FONT_SIZE.md, color: COLORS.plum, fontWeight: '600' },

  disclaimerText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    lineHeight: 16,
    marginTop: SPACING.lg,
  },

  // Crisis Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  crisisIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  crisisTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  crisisSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.7,
    marginBottom: SPACING.lg,
  },
  crisisPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  crisisPhoneIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  crisisPhoneInfo: { flex: 1 },
  crisisPhoneName: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.darkText },
  crisisPhoneNumber: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.coral },
  crisisCloseButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  crisisCloseText: { fontSize: FONT_SIZE.sm, color: COLORS.lightText, fontWeight: '600' },
});
