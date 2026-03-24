import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import EscalationChart from '@/components/EscalationChart';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Incident {
  date: string;
  severity: number;
  category: string;
  categoryIcon?: string;
  categoryColor?: string;
  description: string;
}

const INCIDENT_CATEGORIES = [
  { label: '언어적 폭력', icon: 'chatbubble', color: '#D4A373' },
  { label: '신체적 폭력', icon: 'hand-left', color: COLORS.coral },
  { label: '협박/위협', icon: 'warning', color: COLORS.coralDark },
  { label: '스토킹', icon: 'locate', color: '#8B6F8E' },
  { label: '경제적 통제', icon: 'card', color: COLORS.blue },
  { label: '디지털 폭력', icon: 'phone-portrait', color: '#6B8CC7' },
  { label: '성적 강압', icon: 'close-circle', color: COLORS.coralDark },
  { label: '기타', icon: 'ellipsis-horizontal', color: COLORS.slate },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectTrend(incidents: Incident[]): string | null {
  if (incidents.length < 3) return null;
  const sorted = [...incidents].sort((a, b) => a.date.localeCompare(b.date));
  const recentHalf = sorted.slice(Math.floor(sorted.length / 2));
  const olderHalf = sorted.slice(0, Math.floor(sorted.length / 2));

  const recentAvgSeverity =
    recentHalf.reduce((s, i) => s + i.severity, 0) / recentHalf.length;
  const olderAvgSeverity =
    olderHalf.reduce((s, i) => s + i.severity, 0) / olderHalf.length;

  if (recentAvgSeverity > olderAvgSeverity + 0.3) {
    return '폭력 빈도가 증가하고 있습니다';
  }
  if (recentAvgSeverity > olderAvgSeverity) {
    return '폭력 심각도가 점차 높아지고 있습니다';
  }
  return null;
}

function formatToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function EscalationTimelineScreen() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState(formatToday());
  const [formSeverity, setFormSeverity] = useState(3);
  const [formCategoryIdx, setFormCategoryIdx] = useState(0);
  const [formDescription, setFormDescription] = useState('');

  const trend = detectTrend(incidents);
  const totalCount = incidents.length;
  const avgSeverity =
    totalCount > 0
      ? Math.round((incidents.reduce((s, i) => s + i.severity, 0) / totalCount) * 10) / 10
      : 0;

  const handleAddIncident = () => {
    if (!formDescription.trim()) return;
    const cat = INCIDENT_CATEGORIES[formCategoryIdx];
    const newIncident: Incident = {
      date: formDate || formatToday(),
      severity: formSeverity,
      category: cat.label,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      description: formDescription.trim(),
    };
    setIncidents((prev) =>
      [...prev, newIncident].sort((a, b) => a.date.localeCompare(b.date)),
    );
    setShowModal(false);
    setFormDate(formatToday());
    setFormSeverity(3);
    setFormCategoryIdx(0);
    setFormDescription('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>폭력 에스컬레이션</Text>
        <View style={styles.headerBackButton} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>총 기록</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: avgSeverity >= 3 ? COLORS.coral : COLORS.sage }]}>
              {avgSeverity}
            </Text>
            <Text style={styles.statLabel}>평균 심각도</Text>
          </View>
        </View>

        {/* Trend Warning */}
        {trend && (
          <View style={styles.trendWarning}>
            <Ionicons name="trending-up" size={20} color={COLORS.coral} />
            <Text style={styles.trendWarningText}>{trend}</Text>
          </View>
        )}

        {/* Timeline Chart */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>사건 타임라인</Text>
          <EscalationChart incidents={incidents} />
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.lightText} />
          <Text style={styles.infoText}>
            사건을 기록하면 패턴을 파악하고 증거로 활용할 수 있습니다. 안전한 곳에서 기록하세요.
          </Text>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Add Incident Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>사건 기록</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Date */}
              <Text style={styles.fieldLabel}>날짜</Text>
              <TextInput
                style={styles.textInput}
                value={formDate}
                onChangeText={setFormDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.lightText}
              />

              {/* Severity */}
              <Text style={styles.fieldLabel}>심각도</Text>
              <View style={styles.severityRow}>
                {[1, 2, 3, 4, 5].map((s) => {
                  const isSelected = formSeverity === s;
                  const color =
                    s <= 1
                      ? COLORS.sage
                      : s <= 2
                        ? '#D4A373'
                        : s <= 3
                          ? COLORS.coral
                          : s <= 4
                            ? COLORS.coralDark
                            : '#C4634B';
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.severityButton,
                        isSelected && { backgroundColor: color, borderColor: color },
                      ]}
                      onPress={() => setFormSeverity(s)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.severityButtonText,
                          isSelected && { color: COLORS.white },
                        ]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Category */}
              <Text style={styles.fieldLabel}>유형</Text>
              <View style={styles.categoriesGrid}>
                {INCIDENT_CATEGORIES.map((cat, idx) => {
                  const isSelected = formCategoryIdx === idx;
                  return (
                    <TouchableOpacity
                      key={cat.label}
                      style={[
                        styles.categoryChip,
                        isSelected && { backgroundColor: cat.color + '20', borderColor: cat.color },
                      ]}
                      onPress={() => setFormCategoryIdx(idx)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={14}
                        color={isSelected ? cat.color : COLORS.slate}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && { color: cat.color, fontWeight: '700' },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Description */}
              <Text style={styles.fieldLabel}>설명</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="무슨 일이 있었는지 간단히 기록하세요"
                placeholderTextColor={COLORS.lightText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </ScrollView>

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !formDescription.trim() && styles.submitButtonDisabled,
              ]}
              onPress={handleAddIncident}
              activeOpacity={0.8}
              disabled={!formDescription.trim()}
            >
              <Text style={styles.submitButtonText}>기록 추가</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  // Scroll
  scrollArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.darkText,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: 2,
  },

  // Trend
  trendWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF0ED',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.coral,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  trendWarningText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.coralDark,
    fontWeight: '600',
    lineHeight: 22,
  },

  // Timeline card
  timelineCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },

  // Info
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    lineHeight: 18,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  // Form fields
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  textInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Severity selector
  severityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  severityButton: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  severityButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  // Category chips
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 4,
  },
  categoryChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    fontWeight: '500',
  },

  // Submit
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
});
