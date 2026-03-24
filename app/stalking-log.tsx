import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS } from '@/constants/stalking';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Incident {
  id: string;
  category: string;
  severity: number;
  description: string;
  date: string;
  hash: string;
}

function generateFakeHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function getRecentCount(incidents: Incident[], days: number): number {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return incidents.filter((inc) => {
    const d = new Date(inc.date);
    return d >= cutoff;
  }).length;
}

export default function StalkingLogScreen() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [dateInput, setDateInput] = useState('');
  const fabAnim = useRef(new Animated.Value(1)).current;

  const recentCount = getRecentCount(incidents, 7);
  const showWarning = recentCount >= 3;

  const prevWeekCount = getRecentCount(incidents, 14) - recentCount;
  const trendUp = recentCount > prevWeekCount;
  const trendDown = recentCount < prevWeekCount;

  const handleAddIncident = () => {
    if (!selectedCategory || selectedSeverity === null || !description.trim()) return;

    const newIncident: Incident = {
      id: Date.now().toString(),
      category: selectedCategory,
      severity: selectedSeverity,
      description: description.trim(),
      date: dateInput.trim() || new Date().toISOString().split('T')[0],
      hash: generateFakeHash(),
    };

    setIncidents((prev) => [newIncident, ...prev]);
    resetForm();
    setModalVisible(false);
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedSeverity(null);
    setDescription('');
    setDateInput('');
  };

  const handleFabPress = () => {
    Animated.sequence([
      Animated.timing(fabAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(fabAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      resetForm();
      setModalVisible(true);
    });
  };

  const getCategoryInfo = (key: string) =>
    INCIDENT_CATEGORIES.find((c) => c.key === key) ?? INCIDENT_CATEGORIES[7];

  const getSeverityInfo = (level: number) =>
    SEVERITY_LEVELS.find((s) => s.level === level) ?? SEVERITY_LEVELS[0];

  const canSubmit =
    selectedCategory !== null && selectedSeverity !== null && description.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스토킹 사건 기록</Text>
        <View style={styles.headerBackButton} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Header */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{incidents.length}</Text>
              <Text style={styles.statLabel}>전체 기록</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{recentCount}</Text>
              <Text style={styles.statLabel}>최근 7일</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.trendRow}>
                <Ionicons
                  name={trendUp ? 'arrow-up' : trendDown ? 'arrow-down' : 'remove'}
                  size={18}
                  color={trendUp ? COLORS.danger : trendDown ? COLORS.success : COLORS.slate}
                />
                <Text
                  style={[
                    styles.statNumber,
                    { color: trendUp ? COLORS.danger : trendDown ? COLORS.success : COLORS.slate },
                  ]}
                >
                  {trendUp ? '증가' : trendDown ? '감소' : '유지'}
                </Text>
              </View>
              <Text style={styles.statLabel}>추세</Text>
            </View>
          </View>
        </View>

        {/* Warning Banner */}
        {showWarning && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color={COLORS.white} />
            <Text style={styles.warningText}>
              최근 7일간 {recentCount}건의 사건이 기록되었습니다. 경찰 신고를 고려하세요.
            </Text>
          </View>
        )}

        {/* Incident List */}
        {incidents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.borderLight} />
            <Text style={styles.emptyTitle}>아직 기록된 사건이 없습니다</Text>
            <Text style={styles.emptySubtitle}>+ 버튼으로 기록을 시작하세요</Text>
          </View>
        ) : (
          incidents.map((incident) => {
            const cat = getCategoryInfo(incident.category);
            const sev = getSeverityInfo(incident.severity);
            return (
              <View key={incident.id} style={styles.incidentCard}>
                <View style={styles.incidentHeader}>
                  <View style={styles.incidentCategoryRow}>
                    <View style={[styles.iconCircle, { backgroundColor: cat.color + '20' }]}>
                      <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                    </View>
                    <Text style={styles.incidentCategoryLabel}>{cat.label}</Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: sev.color + '20' }]}>
                    <Text style={styles.severityEmoji}>{sev.emoji}</Text>
                    <Text style={[styles.severityLabel, { color: sev.color }]}>{sev.label}</Text>
                  </View>
                </View>
                <Text style={styles.incidentDate}>{incident.date}</Text>
                <Text style={styles.incidentDescription}>{incident.description}</Text>
                <View style={styles.hashRow}>
                  <Ionicons name="finger-print" size={12} color={COLORS.lightText} />
                  <Text style={styles.hashText} numberOfLines={1}>
                    SHA-256: {incident.hash}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabAnim }] }]}>
        <TouchableOpacity style={styles.fab} onPress={handleFabPress} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Add Incident Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>사건 기록 추가</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Grid */}
              <Text style={styles.sectionLabel}>유형</Text>
              <View style={styles.categoryGrid}>
                {INCIDENT_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryItem,
                        isSelected && { borderColor: cat.color, borderWidth: 2, backgroundColor: cat.color + '10' },
                      ]}
                      onPress={() => setSelectedCategory(cat.key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={cat.icon as any} size={22} color={isSelected ? cat.color : COLORS.slate} />
                      <Text
                        style={[styles.categoryItemLabel, isSelected && { color: cat.color, fontWeight: '700' }]}
                        numberOfLines={1}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Severity Selector */}
              <Text style={styles.sectionLabel}>심각도</Text>
              <View style={styles.severityRow}>
                {SEVERITY_LEVELS.map((sev) => {
                  const isSelected = selectedSeverity === sev.level;
                  return (
                    <TouchableOpacity
                      key={sev.level}
                      style={[
                        styles.severityItem,
                        isSelected && { borderColor: sev.color, borderWidth: 2, backgroundColor: sev.color + '15' },
                      ]}
                      onPress={() => setSelectedSeverity(sev.level)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.severityItemEmoji}>{sev.emoji}</Text>
                      <Text style={[styles.severityItemLabel, isSelected && { color: sev.color, fontWeight: '700' }]}>
                        {sev.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Description */}
              <Text style={styles.sectionLabel}>상세 내용</Text>
              <TextInput
                style={styles.textInput}
                placeholder="사건에 대해 자세히 기록하세요..."
                placeholderTextColor={COLORS.lightText}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />

              {/* Date */}
              <Text style={styles.sectionLabel}>날짜</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD (미입력 시 오늘 날짜)"
                placeholderTextColor={COLORS.lightText}
                value={dateInput}
                onChangeText={setDateInput}
              />

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                onPress={handleAddIncident}
                disabled={!canSubmit}
                activeOpacity={0.7}
              >
                <Ionicons name="save" size={18} color={COLORS.white} />
                <Text style={styles.submitButtonText}>기록 저장</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.navy,
    paddingTop: SPACING.xl,
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
    color: COLORS.white,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
    paddingTop: SPACING.md,
  },

  // Stats
  statsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.darkText,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.borderLight,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  // Warning
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    fontWeight: '600',
    lineHeight: 18,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    marginTop: SPACING.xs,
  },

  // Incident Card
  incidentCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  incidentCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incidentCategoryLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  severityEmoji: {
    fontSize: 14,
  },
  severityLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  incidentDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginBottom: SPACING.xs,
  },
  incidentDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  hashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  hashText: {
    fontSize: 9,
    color: COLORS.lightText,
    fontFamily: 'monospace',
    flex: 1,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 24,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.darkText,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.slate,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryItem: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm * 3) / 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  categoryItemLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.darkText,
    marginTop: 4,
    textAlign: 'center',
  },
  severityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  severityItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  severityItemEmoji: {
    fontSize: 20,
  },
  severityItemLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.darkText,
    marginTop: 2,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    minHeight: 100,
    lineHeight: 22,
  },
  dateInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    height: 48,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.warmGray,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});
