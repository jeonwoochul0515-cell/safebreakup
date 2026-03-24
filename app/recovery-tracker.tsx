import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { RECOVERY_MILESTONES, MOOD_SCALE } from '@/constants/trauma-recovery';

interface MoodEntry {
  date: string;
  value: number;
  note?: string;
}

export default function RecoveryTrackerScreen() {
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Calculate progress
  const totalMilestones = RECOVERY_MILESTONES.reduce((sum, p) => sum + p.milestones.length, 0);
  const completedCount = Object.values(completedMilestones).filter(Boolean).length;
  const progressPercent = totalMilestones > 0 ? (completedCount / totalMilestones) * 100 : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  const toggleMilestone = (id: string) => {
    setCompletedMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveMood = () => {
    if (selectedMood === null) return;
    const d = new Date();
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    const entry: MoodEntry = { date: dateStr, value: selectedMood, note: moodNote.trim() || undefined };
    setMoodHistory((prev) => [entry, ...prev].slice(0, 7));
    setSelectedMood(null);
    setMoodNote('');
  };

  const last7Moods = moodHistory.slice(0, 7).reverse();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회복 여정 트래커</Text>
        <View style={styles.headerBackButton} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Circular Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressCircleOuter}>
            <View style={styles.progressCircleTrack}>
              <View style={styles.progressCircleInner}>
                <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
                <Text style={styles.progressLabel}>
                  {completedCount}/{totalMilestones}
                </Text>
              </View>
            </View>
            {/* Animated fill ring overlay */}
            <Animated.View
              style={[
                styles.progressRing,
                {
                  borderColor: COLORS.sage,
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                  transform: [
                    {
                      rotate: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
          <Text style={styles.encourageText}>모든 발걸음이 의미 있습니다</Text>
        </View>

        {/* Milestones by Phase */}
        {RECOVERY_MILESTONES.map((phaseData) => (
          <View key={phaseData.phase} style={styles.phaseSection}>
            <View style={styles.phaseHeader}>
              <View style={[styles.phaseIconCircle, { backgroundColor: phaseData.color + '20' }]}>
                <Ionicons name={phaseData.icon as any} size={20} color={phaseData.color} />
              </View>
              <Text style={[styles.phaseTitle, { color: phaseData.color }]}>{phaseData.phase}</Text>
            </View>

            {phaseData.milestones.map((milestone) => {
              const done = !!completedMilestones[milestone.id];
              return (
                <TouchableOpacity
                  key={milestone.id}
                  style={[styles.milestoneCard, done && styles.milestoneCardDone]}
                  onPress={() => toggleMilestone(milestone.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, done && { backgroundColor: phaseData.color, borderColor: phaseData.color }]}>
                    {done && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                  </View>
                  <View style={styles.milestoneInfo}>
                    <Text style={[styles.milestoneTitle, done && styles.milestoneTitleDone]}>
                      {milestone.title}
                    </Text>
                    <Text style={styles.milestoneDesc}>{milestone.description}</Text>
                  </View>
                  {done && (
                    <View style={[styles.completionBadge, { backgroundColor: phaseData.color + '20' }]}>
                      <Ionicons name="checkmark-circle" size={16} color={phaseData.color} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Daily Mood Tracker */}
        <View style={styles.moodSection}>
          <Text style={styles.sectionTitle}>오늘의 기분</Text>
          <View style={styles.moodRow}>
            {MOOD_SCALE.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodButton,
                  selectedMood === mood.value && { backgroundColor: mood.color + '25', borderColor: mood.color },
                ]}
                onPress={() => setSelectedMood(mood.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, selectedMood === mood.value && { color: mood.color, fontWeight: '700' }]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.moodNoteInput}
            placeholder="오늘의 메모 (선택)"
            placeholderTextColor={COLORS.lightText}
            value={moodNote}
            onChangeText={setMoodNote}
          />

          <TouchableOpacity
            style={[styles.saveMoodButton, selectedMood === null && styles.saveMoodButtonDisabled]}
            onPress={handleSaveMood}
            disabled={selectedMood === null}
            activeOpacity={0.7}
          >
            <Text style={[styles.saveMoodText, selectedMood === null && { color: COLORS.lightText }]}>기분 기록하기</Text>
          </TouchableOpacity>
        </View>

        {/* Mood History Bar Chart */}
        {last7Moods.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>최근 7일 기분</Text>
            <View style={styles.chartRow}>
              {last7Moods.map((entry, i) => {
                const moodInfo = MOOD_SCALE.find((m) => m.value === entry.value);
                const barHeight = (entry.value / 5) * 100;
                return (
                  <View key={i} style={styles.chartColumn}>
                    <View style={styles.chartBarWrap}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: barHeight,
                            backgroundColor: moodInfo?.color ?? COLORS.slate,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartEmoji}>{moodInfo?.emoji}</Text>
                    <Text style={styles.chartDate}>{entry.date}</Text>
                  </View>
                );
              })}
            </View>
          </View>
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

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },

  // Progress Circle
  progressSection: { alignItems: 'center', marginVertical: SPACING.xl },
  progressCircleOuter: { width: 160, height: 160, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  progressCircleTrack: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 10,
    borderColor: COLORS.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleInner: { alignItems: 'center' },
  progressPercent: { fontSize: 36, fontWeight: '800', color: COLORS.sage },
  progressLabel: { fontSize: FONT_SIZE.sm, color: COLORS.slate, fontWeight: '600', marginTop: -2 },
  progressRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 10,
  },
  encourageText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.sage,
    fontWeight: '700',
    marginTop: SPACING.md,
    textAlign: 'center',
  },

  // Phase
  phaseSection: { marginBottom: SPACING.lg },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.sm },
  phaseIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700' },

  // Milestone
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  milestoneCardDone: { backgroundColor: COLORS.warmGray },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  milestoneInfo: { flex: 1 },
  milestoneTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText },
  milestoneTitleDone: { textDecorationLine: 'line-through', color: COLORS.slate },
  milestoneDesc: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginTop: 2, lineHeight: FONT_SIZE.sm * 1.5 },
  completionBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.sm },

  // Mood
  moodSection: { marginTop: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText, marginBottom: SPACING.md },
  moodRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.cardBg,
  },
  moodEmoji: { fontSize: 24, marginBottom: 2 },
  moodLabel: { fontSize: 10, color: COLORS.slate },
  moodNoteInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    marginBottom: SPACING.md,
  },
  saveMoodButton: {
    height: 48,
    backgroundColor: COLORS.sage,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveMoodButtonDisabled: { backgroundColor: COLORS.warmGray },
  saveMoodText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white },

  // Chart
  chartSection: { marginTop: SPACING.xl },
  chartRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 140, marginTop: SPACING.sm },
  chartColumn: { alignItems: 'center', flex: 1 },
  chartBarWrap: { height: 100, justifyContent: 'flex-end' },
  chartBar: { width: 20, borderRadius: 10, minHeight: 4 },
  chartEmoji: { fontSize: 14, marginTop: 4 },
  chartDate: { fontSize: 10, color: COLORS.lightText, marginTop: 2 },
});
