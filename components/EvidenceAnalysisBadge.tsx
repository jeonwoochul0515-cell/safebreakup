import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import type { AIAnalysisResult, RiskLevel, AnalysisCategory } from '@/lib/ai-analysis';
import { CATEGORY_LABELS } from '@/lib/ai-analysis';

// ─── 위험도별 색상 ─────────────────────────────────────────────────────────

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: COLORS.coral,
  high: COLORS.warning,
  medium: COLORS.gold,
  low: COLORS.sage,
};

const RISK_LABELS: Record<RiskLevel, string> = {
  critical: '긴급',
  high: '높음',
  medium: '보통',
  low: '낮음',
};

// ─── 인라인 배지 (증거 카드 하단에 표시) ──────────────────────────────────

interface AnalysisBadgeProps {
  result: AIAnalysisResult;
  onPress?: () => void;
}

export function AnalysisBadge({ result, onPress }: AnalysisBadgeProps) {
  const riskColor = RISK_COLORS[result.riskLevel];

  return (
    <TouchableOpacity
      style={styles.badge}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
      <Text style={[styles.badgeCategory, { color: riskColor }]}>
        {CATEGORY_LABELS[result.category]}
      </Text>
      <Text style={styles.badgeSeparator}>|</Text>
      <Text style={styles.badgeLaw} numberOfLines={1}>
        {result.applicableLaw}
      </Text>
      <Ionicons name="chevron-forward" size={12} color={COLORS.lightText} />
    </TouchableOpacity>
  );
}

// ─── 상세 분석 결과 모달 ──────────────────────────────────────────────────

interface AnalysisDetailModalProps {
  visible: boolean;
  result: AIAnalysisResult | null;
  onClose: () => void;
}

export function AnalysisDetailModal({ visible, result, onClose }: AnalysisDetailModalProps) {
  if (!result) return null;

  const riskColor = RISK_COLORS[result.riskLevel];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Ionicons name="analytics" size={22} color={COLORS.gold} />
              <Text style={styles.modalTitle}>AI 분석 결과</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={22} color={COLORS.darkText} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* 위험도 + 카테고리 */}
            <View style={styles.riskSection}>
              <View style={[styles.riskBadgeLarge, { backgroundColor: riskColor + '18' }]}>
                <View style={[styles.riskDotLarge, { backgroundColor: riskColor }]} />
                <Text style={[styles.riskLevelText, { color: riskColor }]}>
                  위험도: {RISK_LABELS[result.riskLevel]}
                </Text>
              </View>
              <View style={styles.categoryBadgeLarge}>
                <Text style={styles.categoryLabelLarge}>
                  {CATEGORY_LABELS[result.category]}
                </Text>
              </View>
              <Text style={styles.confidenceText}>
                신뢰도: {Math.round(result.confidence * 100)}%
              </Text>
            </View>

            {/* 분석 요약 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>분석 요약</Text>
              <Text style={styles.sectionContent}>{result.summary}</Text>
            </View>

            {/* 감지된 키워드 */}
            {result.detectedKeywords.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>감지된 키워드</Text>
                <View style={styles.keywordRow}>
                  {result.detectedKeywords.map((kw, idx) => (
                    <View key={idx} style={[styles.keywordChip, { backgroundColor: riskColor + '18' }]}>
                      <Text style={[styles.keywordText, { color: riskColor }]}>{kw}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 적용 법조항 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>적용 법조항</Text>
              <View style={styles.lawBox}>
                <Ionicons name="book" size={16} color={COLORS.navy} />
                <Text style={styles.lawText}>{result.applicableLaw}</Text>
              </View>
            </View>

            {/* 권장 행동 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>권장 행동</Text>
              <View style={styles.recommendationBox}>
                <Ionicons name="arrow-forward-circle" size={18} color={COLORS.gold} />
                <Text style={styles.recommendationText}>{result.recommendation}</Text>
              </View>
            </View>

            {/* 면책 고지 */}
            <View style={styles.disclaimerBox}>
              <Ionicons name="information-circle" size={16} color={COLORS.lightText} />
              <Text style={styles.disclaimerText}>
                이 분석 결과는 AI 기반 참고 정보이며, 법적 조언에 해당하지 않습니다.
                정확한 법률 상담은 변호사에게 문의하세요.
              </Text>
            </View>

            {/* 분석 시각 */}
            <Text style={styles.analyzedAt}>
              분석 시각: {new Date(result.analyzedAt).toLocaleString('ko-KR')}
            </Text>
          </ScrollView>

          {/* 닫기 버튼 */}
          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── 스타일 ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Badge (inline)
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmGray,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    gap: 6,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeCategory: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  badgeSeparator: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
  },
  badgeLaw: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    flex: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    marginBottom: SPACING.md,
  },

  // Risk section
  riskSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  riskBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  riskDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  riskLevelText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  categoryBadgeLarge: {
    backgroundColor: COLORS.navy + '14',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  categoryLabelLarge: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.navy,
  },
  confidenceText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
  },

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    lineHeight: 22,
  },

  // Keywords
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  keywordChip: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
  },
  keywordText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },

  // Law box
  lawBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.lavender,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  lawText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.navy,
    fontWeight: '500',
    flex: 1,
  },

  // Recommendation
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  recommendationText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 22,
    flex: 1,
  },

  // Disclaimer
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.warmGray,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  disclaimerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    lineHeight: 18,
    flex: 1,
  },

  analyzedAt: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'right',
    marginBottom: SPACING.md,
  },

  // Close button
  closeButton: {
    backgroundColor: COLORS.navy,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
});
