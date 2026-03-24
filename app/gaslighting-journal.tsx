import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { JOURNAL_PROMPTS } from '@/constants/gaslighting';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'journal' | 'anchor';

interface JournalEntry {
  id: string;
  type: 'journal' | 'anchor';
  date: string;
  promptId?: number;
  text: string;
  anchor?: {
    situation: string;
    theirWords: string;
    myFeelings: string;
    myFacts: string;
  };
}

export default function GaslightingJournalScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('journal');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [journalText, setJournalText] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [anchorForm, setAnchorForm] = useState({
    situation: '',
    theirWords: '',
    myFeelings: '',
    myFacts: '',
  });
  const promptSlideAnim = useRef(new Animated.Value(0)).current;

  const currentPrompt = JOURNAL_PROMPTS[currentPromptIndex];

  const swipePrompt = (direction: 'next' | 'prev') => {
    const newIndex =
      direction === 'next'
        ? (currentPromptIndex + 1) % JOURNAL_PROMPTS.length
        : (currentPromptIndex - 1 + JOURNAL_PROMPTS.length) % JOURNAL_PROMPTS.length;

    const toValue = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    Animated.timing(promptSlideAnim, { toValue, duration: 180, useNativeDriver: true }).start(() => {
      setCurrentPromptIndex(newIndex);
      promptSlideAnim.setValue(direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH);
      Animated.timing(promptSlideAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    });
  };

  const formatDate = () => {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const handleSaveJournal = () => {
    if (!journalText.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      type: 'journal',
      date: formatDate(),
      promptId: currentPrompt.id,
      text: journalText.trim(),
    };
    setEntries((prev) => [entry, ...prev]);
    setJournalText('');
  };

  const handleSaveAnchor = () => {
    const { situation, theirWords, myFeelings, myFacts } = anchorForm;
    if (!situation.trim() && !theirWords.trim() && !myFeelings.trim() && !myFacts.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      type: 'anchor',
      date: formatDate(),
      text: situation.trim() || '현실 앵커 기록',
      anchor: { situation: situation.trim(), theirWords: theirWords.trim(), myFeelings: myFeelings.trim(), myFacts: myFacts.trim() },
    };
    setEntries((prev) => [entry, ...prev]);
    setAnchorForm({ situation: '', theirWords: '', myFeelings: '', myFacts: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>관계건강 저널</Text>
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={14} color={COLORS.sage} />
          <Text style={styles.lockText}>암호화 보관</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'journal' && styles.tabActive]}
          onPress={() => setActiveTab('journal')}
        >
          <Ionicons name="journal" size={16} color={activeTab === 'journal' ? COLORS.plum : COLORS.slate} />
          <Text style={[styles.tabText, activeTab === 'journal' && styles.tabTextActive]}>프롬프트 저널</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'anchor' && styles.tabActive]}
          onPress={() => setActiveTab('anchor')}
        >
          <Ionicons name="locate" size={16} color={activeTab === 'anchor' ? COLORS.plum : COLORS.slate} />
          <Text style={[styles.tabText, activeTab === 'anchor' && styles.tabTextActive]}>현실 앵커</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'journal' ? (
          <>
            {/* Swipeable Prompt */}
            <View style={styles.promptSection}>
              <View style={styles.promptHeader}>
                <TouchableOpacity onPress={() => swipePrompt('prev')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="chevron-back" size={20} color={COLORS.slate} />
                </TouchableOpacity>
                <Text style={styles.promptCounter}>
                  {currentPromptIndex + 1} / {JOURNAL_PROMPTS.length}
                </Text>
                <TouchableOpacity onPress={() => swipePrompt('next')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.slate} />
                </TouchableOpacity>
              </View>
              <Animated.View style={[styles.promptCard, { transform: [{ translateX: promptSlideAnim }] }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.plum} />
                <Text style={styles.promptText}>{currentPrompt.prompt}</Text>
              </Animated.View>
            </View>

            {/* Text Input */}
            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                multiline
                placeholder="여기에 자유롭게 적어보세요..."
                placeholderTextColor={COLORS.lightText}
                value={journalText}
                onChangeText={setJournalText}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.saveButton, !journalText.trim() && styles.saveButtonDisabled]}
                onPress={handleSaveJournal}
                disabled={!journalText.trim()}
                activeOpacity={0.7}
              >
                <Ionicons name="save" size={18} color={COLORS.white} />
                <Text style={styles.saveButtonText}>저장하기</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Anchor Quick-Add */}
            <View style={styles.anchorSection}>
              <Text style={styles.anchorTitle}>현실 앵커 기록하기</Text>
              <Text style={styles.anchorSubtitle}>
                기억이 생생할 때 기록해두면, 나중에 혼란스러울 때 되돌아볼 수 있습니다.
              </Text>

              <Text style={styles.inputLabel}>상황 설명</Text>
              <TextInput
                style={styles.anchorInput}
                placeholder="어떤 상황이었나요?"
                placeholderTextColor={COLORS.lightText}
                value={anchorForm.situation}
                onChangeText={(t) => setAnchorForm((p) => ({ ...p, situation: t }))}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>상대방의 말</Text>
              <TextInput
                style={styles.anchorInput}
                placeholder="상대방이 뭐라고 했나요?"
                placeholderTextColor={COLORS.lightText}
                value={anchorForm.theirWords}
                onChangeText={(t) => setAnchorForm((p) => ({ ...p, theirWords: t }))}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>나의 감정</Text>
              <TextInput
                style={styles.anchorInput}
                placeholder="그때 어떤 감정이 들었나요?"
                placeholderTextColor={COLORS.lightText}
                value={anchorForm.myFeelings}
                onChangeText={(t) => setAnchorForm((p) => ({ ...p, myFeelings: t }))}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>내가 기억하는 사실</Text>
              <TextInput
                style={styles.anchorInput}
                placeholder="실제로 일어난 일은 무엇인가요?"
                placeholderTextColor={COLORS.lightText}
                value={anchorForm.myFacts}
                onChangeText={(t) => setAnchorForm((p) => ({ ...p, myFacts: t }))}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveAnchor} activeOpacity={0.7}>
                <Ionicons name="locate" size={18} color={COLORS.white} />
                <Text style={styles.saveButtonText}>앵커 저장</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Entry List */}
        {entries.length > 0 && (
          <View style={styles.entriesSection}>
            <Text style={styles.sectionTitle}>기록 목록</Text>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTypeBadge}>
                    <Ionicons
                      name={entry.type === 'journal' ? 'book' : 'locate'}
                      size={12}
                      color={entry.type === 'journal' ? COLORS.plum : COLORS.sage}
                    />
                    <Text
                      style={[
                        styles.entryTypeText,
                        { color: entry.type === 'journal' ? COLORS.plum : COLORS.sage },
                      ]}
                    >
                      {entry.type === 'journal' ? '저널' : '앵커'}
                    </Text>
                  </View>
                  <View style={styles.entryDateRow}>
                    <Ionicons name="lock-closed" size={10} color={COLORS.lightText} />
                    <Text style={styles.entryDate}>{entry.date}</Text>
                  </View>
                </View>
                <Text style={styles.entryPreview} numberOfLines={3}>
                  {entry.type === 'anchor' && entry.anchor
                    ? `상황: ${entry.anchor.situation}\n감정: ${entry.anchor.myFeelings}\n사실: ${entry.anchor.myFacts}`
                    : entry.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.borderLight} />
            <Text style={styles.emptyText}>아직 기록이 없습니다</Text>
            <Text style={styles.emptySubtext}>첫 번째 기록을 남겨보세요</Text>
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
  lockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm },
  lockText: { fontSize: FONT_SIZE.xs, color: COLORS.sage, fontWeight: '600' },

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  tabActive: { backgroundColor: COLORS.cardBg, ...SHADOW.sm },
  tabText: { fontSize: FONT_SIZE.sm, color: COLORS.slate, fontWeight: '600' },
  tabTextActive: { color: COLORS.plum, fontWeight: '700' },

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },

  // Prompt
  promptSection: { marginBottom: SPACING.md },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  promptCounter: { fontSize: FONT_SIZE.sm, color: COLORS.slate, fontWeight: '600' },
  promptCard: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  promptText: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.darkText, lineHeight: FONT_SIZE.md * 1.7 },

  // Input
  inputSection: { marginBottom: SPACING.lg },
  textInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    minHeight: 140,
    lineHeight: FONT_SIZE.md * 1.7,
    marginBottom: SPACING.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: COLORS.plum,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  saveButtonDisabled: { backgroundColor: COLORS.warmGray },
  saveButtonText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white },

  // Anchor
  anchorSection: { marginBottom: SPACING.lg },
  anchorTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.darkText, marginBottom: SPACING.xs },
  anchorSubtitle: { fontSize: FONT_SIZE.sm, color: COLORS.slate, lineHeight: FONT_SIZE.sm * 1.6, marginBottom: SPACING.md },
  inputLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.darkText, marginBottom: SPACING.xs, marginTop: SPACING.sm },
  anchorInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    minHeight: 72,
    lineHeight: FONT_SIZE.md * 1.6,
  },

  // Entries
  entriesSection: { marginTop: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText, marginBottom: SPACING.md },
  entryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  entryTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.warmGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  entryTypeText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  entryDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  entryDate: { fontSize: FONT_SIZE.xs, color: COLORS.lightText },
  entryPreview: { fontSize: FONT_SIZE.sm, color: COLORS.slate, lineHeight: FONT_SIZE.sm * 1.6 },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.slate, fontWeight: '600', marginTop: SPACING.md },
  emptySubtext: { fontSize: FONT_SIZE.sm, color: COLORS.lightText, marginTop: SPACING.xs },
});
