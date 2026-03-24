import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import FrequencyGraph from '@/components/FrequencyGraph';

type ContactType = '전화' | '문자' | 'SNS' | '대면';

interface ContactLog {
  id: string;
  type: ContactType;
  date: string;
  summary: string;
}

const CONTACT_TYPES: { type: ContactType; icon: string; color: string }[] = [
  { type: '전화', icon: 'call', color: '#E07A5F' },
  { type: '문자', icon: 'chatbubble', color: '#6B8CC7' },
  { type: 'SNS', icon: 'logo-instagram', color: '#8B6F8E' },
  { type: '대면', icon: 'person', color: '#D4A373' },
];

function getDayLabel(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}/${day}`;
}

export default function ContactMonitorScreen() {
  const [logs, setLogs] = useState<ContactLog[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<ContactType | null>(null);
  const [dateInput, setDateInput] = useState('');
  const [summaryInput, setSummaryInput] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(5);

  const handleAddLog = () => {
    if (!selectedType || !summaryInput.trim()) return;

    const newLog: ContactLog = {
      id: Date.now().toString(),
      type: selectedType,
      date: dateInput.trim() || new Date().toISOString().split('T')[0],
      summary: summaryInput.trim(),
    };

    setLogs((prev) => [newLog, ...prev]);
    setSelectedType(null);
    setDateInput('');
    setSummaryInput('');
    setModalVisible(false);
  };

  // Graph data for last 7 days
  const graphData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const daysAgo = 6 - i;
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - daysAgo);
      const dateStr = targetDate.toISOString().split('T')[0];
      const count = logs.filter((l) => l.date === dateStr).length;
      return { label: getDayLabel(daysAgo), value: count };
    });
  }, [logs]);

  // Stats
  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return logs.filter((l) => new Date(l.date) >= weekAgo).length;
  }, [logs]);

  const lastWeekCount = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return logs.filter((l) => {
      const d = new Date(l.date);
      return d >= twoWeeksAgo && d < weekAgo;
    }).length;
  }, [logs]);

  const trendLabel = thisWeekCount > lastWeekCount ? '증가' : thisWeekCount < lastWeekCount ? '감소' : '유지';
  const trendIcon = thisWeekCount > lastWeekCount ? 'arrow-up' : thisWeekCount < lastWeekCount ? 'arrow-down' : 'remove';
  const trendColor = thisWeekCount > lastWeekCount ? COLORS.danger : thisWeekCount < lastWeekCount ? COLORS.success : COLORS.slate;

  const overThreshold = thisWeekCount >= alertThreshold;

  const getTypeInfo = (type: ContactType) =>
    CONTACT_TYPES.find((t) => t.type === type) ?? CONTACT_TYPES[0];

  const canSubmit = selectedType !== null && summaryInput.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>접촉 모니터링</Text>
        <TouchableOpacity
          onPress={() => {
            setSelectedType(null);
            setDateInput('');
            setSummaryInput('');
            setModalVisible(true);
          }}
          style={styles.headerBackButton}
        >
          <Ionicons name="add-circle" size={26} color={COLORS.goldLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{thisWeekCount}</Text>
              <Text style={styles.statLabel}>이번 주</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.trendRow}>
                <Ionicons name={trendIcon as any} size={18} color={trendColor} />
                <Text style={[styles.statNumber, { color: trendColor }]}>{trendLabel}</Text>
              </View>
              <Text style={styles.statLabel}>추세</Text>
            </View>
          </View>
        </View>

        {/* Alert Threshold */}
        {overThreshold && (
          <View style={styles.alertBanner}>
            <Ionicons name="notifications" size={18} color={COLORS.white} />
            <Text style={styles.alertText}>
              주간 접촉 횟수가 경고 기준({alertThreshold}회)을 초과했습니다.
            </Text>
          </View>
        )}

        {/* Threshold Setting */}
        <View style={styles.thresholdCard}>
          <Text style={styles.thresholdLabel}>경고 기준 설정</Text>
          <View style={styles.thresholdRow}>
            <TouchableOpacity
              style={styles.thresholdBtn}
              onPress={() => setAlertThreshold((p) => Math.max(1, p - 1))}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={18} color={COLORS.darkText} />
            </TouchableOpacity>
            <Text style={styles.thresholdValue}>주 {alertThreshold}회</Text>
            <TouchableOpacity
              style={styles.thresholdBtn}
              onPress={() => setAlertThreshold((p) => p + 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color={COLORS.darkText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Frequency Graph */}
        <View style={styles.graphCard}>
          <Text style={styles.graphTitle}>최근 7일 접촉 빈도</Text>
          <FrequencyGraph data={graphData} color={COLORS.coral} height={140} />
        </View>

        {/* Contact Log Timeline */}
        <Text style={styles.sectionTitle}>접촉 기록</Text>
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.borderLight} />
            <Text style={styles.emptyText}>아직 기록이 없습니다</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {logs.map((log, index) => {
              const typeInfo = getTypeInfo(log.type);
              return (
                <View key={log.id} style={styles.timelineEntry}>
                  <View style={styles.timelineLine}>
                    <View style={[styles.timelineDot, { backgroundColor: typeInfo.color }]}>
                      <Ionicons name={typeInfo.icon as any} size={14} color={COLORS.white} />
                    </View>
                    {index < logs.length - 1 && <View style={styles.timelineConnector} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeaderRow}>
                      <Text style={[styles.timelineType, { color: typeInfo.color }]}>
                        {log.type}
                      </Text>
                      <Text style={styles.timelineDate}>{log.date}</Text>
                    </View>
                    <Text style={styles.timelineSummary}>{log.summary}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Log Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>접촉 기록 추가</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Selector */}
              <Text style={styles.fieldLabel}>접촉 유형</Text>
              <View style={styles.typeRow}>
                {CONTACT_TYPES.map((ct) => {
                  const isSelected = selectedType === ct.type;
                  return (
                    <TouchableOpacity
                      key={ct.type}
                      style={[
                        styles.typeItem,
                        isSelected && { borderColor: ct.color, borderWidth: 2, backgroundColor: ct.color + '10' },
                      ]}
                      onPress={() => setSelectedType(ct.type)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={ct.icon as any}
                        size={22}
                        color={isSelected ? ct.color : COLORS.slate}
                      />
                      <Text
                        style={[styles.typeItemLabel, isSelected && { color: ct.color, fontWeight: '700' }]}
                      >
                        {ct.type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Date */}
              <Text style={styles.fieldLabel}>날짜</Text>
              <TextInput
                style={styles.inputField}
                placeholder="YYYY-MM-DD (미입력 시 오늘 날짜)"
                placeholderTextColor={COLORS.lightText}
                value={dateInput}
                onChangeText={setDateInput}
              />

              {/* Summary */}
              <Text style={styles.fieldLabel}>내용 요약</Text>
              <TextInput
                style={[styles.inputField, { minHeight: 80 }]}
                placeholder="접촉 내용을 간략히 기록하세요..."
                placeholderTextColor={COLORS.lightText}
                multiline
                numberOfLines={3}
                value={summaryInput}
                onChangeText={setSummaryInput}
                textAlignVertical="top"
              />

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                onPress={handleAddLog}
                disabled={!canSubmit}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>기록 추가</Text>
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
    paddingBottom: SPACING.xxl,
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

  // Alert
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  alertText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    fontWeight: '600',
  },

  // Threshold
  thresholdCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  thresholdLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  thresholdBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thresholdValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    minWidth: 50,
    textAlign: 'center',
  },

  // Graph
  graphCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  graphTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },

  // Section
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: SPACING.md,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.lightText,
    marginTop: SPACING.sm,
  },

  // Timeline
  timeline: {
    paddingLeft: SPACING.xs,
  },
  timelineEntry: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLine: {
    alignItems: 'center',
    width: 32,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginLeft: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  timelineType: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  timelineDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
  },
  timelineSummary: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 20,
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
    maxHeight: '80%',
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
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.slate,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  typeItemLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.darkText,
    marginTop: 4,
    fontWeight: '600',
  },
  inputField: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
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
