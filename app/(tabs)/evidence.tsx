import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';

// ─── Types ───────────────────────────────────────────────────────
type EvidenceType = 'image' | 'audio' | 'text' | 'file';

interface EvidenceItem {
  id: string;
  type: EvidenceType;
  title: string;
  timestamp: Date;
  category?: string;
  preview?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────
const TYPE_META: Record<EvidenceType, { icon: string; color: string; label: string }> = {
  image: { icon: 'image', color: COLORS.blue, label: '사진' },
  audio: { icon: 'mic', color: COLORS.coral, label: '음성' },
  text:  { icon: 'document-text', color: COLORS.sage, label: '메모' },
  file:  { icon: 'attach', color: COLORS.warning, label: '파일' },
};

const UPLOAD_BUTTONS: {
  type: EvidenceType;
  icon: string;
  label: string;
  bg: string;
}[] = [
  { type: 'image', icon: 'camera-outline',        label: '사진/스크린샷', bg: COLORS.blush },
  { type: 'audio', icon: 'mic-outline',            label: '음성 메모',     bg: COLORS.lavender },
  { type: 'text',  icon: 'document-text-outline',  label: '텍스트 메모',   bg: COLORS.warmGray },
  { type: 'file',  icon: 'attach-outline',         label: '파일 첨부',     bg: COLORS.sageLight + '60' },
];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${h}:${min}`;
}

function dateLabel(d: Date): string {
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (isToday) return '오늘';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function groupByDate(items: EvidenceItem[]): { label: string; items: EvidenceItem[] }[] {
  const map = new Map<string, EvidenceItem[]>();
  for (const item of items) {
    const key = dateLabel(item.timestamp);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

// ─── Swipeable Evidence Card ─────────────────────────────────────
function SwipeableEvidenceCard({
  item,
  onDelete,
}: {
  item: EvidenceItem;
  onDelete: (id: string) => void;
}) {
  const meta = TYPE_META[item.type];
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 10 && Math.abs(gesture.dy) < 20,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          translateX.setValue(Math.max(gesture.dx, -100));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -60) {
          Animated.spring(translateX, {
            toValue: -90,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Alert.alert('증거 삭제', '이 증거를 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
        onPress: () => {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        },
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => onDelete(item.id),
      },
    ]);
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Delete button behind */}
      <TouchableOpacity
        style={styles.deleteBackground}
        onPress={handleDelete}
        activeOpacity={0.8}
      >
        <Ionicons name="trash-outline" size={22} color={COLORS.white} />
        <Text style={styles.deleteText}>삭제</Text>
      </TouchableOpacity>

      <Animated.View
        style={[styles.cardAnimated, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.evidenceCard}>
          {/* Type icon */}
          <View style={[styles.typeIconContainer, { backgroundColor: meta.color + '18' }]}>
            <Ionicons name={meta.icon as any} size={22} color={meta.color} />
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={[styles.typeBadge, { backgroundColor: meta.color + '14' }]}>
                <Text style={[styles.typeBadgeText, { color: meta.color }]}>{meta.label}</Text>
              </View>
            </View>
            {item.preview && item.type === 'text' && (
              <Text style={styles.previewText} numberOfLines={2}>
                {item.preview}
              </Text>
            )}
            {item.type === 'image' && (
              <View style={styles.thumbnailPlaceholder}>
                <Ionicons name="image-outline" size={20} color={COLORS.lightText} />
              </View>
            )}
            <View style={styles.cardBottomRow}>
              <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
              {item.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────
export default function EvidenceScreen() {
  const insets = useSafeAreaInsets();
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [memoModalVisible, setMemoModalVisible] = useState(false);
  const [memoTitle, setMemoTitle] = useState('');
  const [memoContent, setMemoContent] = useState('');

  const nextId = useRef(1);

  // ─── Handlers ────────────────────────────────────────────────
  const showComingSoon = useCallback(() => {
    Alert.alert('알림', '이 기능은 서비스 출시 후 이용 가능합니다');
  }, []);

  const addTextMemo = useCallback(() => {
    if (!memoContent.trim()) return;
    const item: EvidenceItem = {
      id: String(nextId.current++),
      type: 'text',
      title: memoTitle.trim() || `증거 #${nextId.current - 1}`,
      timestamp: new Date(),
      preview: memoContent.trim(),
      category: '텍스트 메모',
    };
    setEvidence((prev) => [item, ...prev]);
    setMemoTitle('');
    setMemoContent('');
    setMemoModalVisible(false);
  }, [memoTitle, memoContent]);

  const deleteItem = useCallback((id: string) => {
    setEvidence((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleUpload = useCallback(
    (type: EvidenceType) => {
      if (type === 'text') {
        setMemoModalVisible(true);
      } else {
        showComingSoon();
      }
    },
    [showComingSoon]
  );

  // ─── Derived data ────────────────────────────────────────────
  const groups = groupByDate(evidence);
  const isEmpty = evidence.length === 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="folder" size={20} color={COLORS.gold} />
            </View>
            <Text style={styles.headerTitle}>증거보관함</Text>
          </View>
          <View style={styles.lawyerBadge}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
            <Text style={styles.lawyerBadgeText}>검토: 김창희 변호사</Text>
          </View>
        </View>
        <Text style={styles.headerCount}>
          {evidence.length}건 보관 중
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Upload Section ──────────────────────────────────── */}
        <View style={[styles.uploadCard, SHADOW.sm]}>
          <Text style={styles.uploadTitle}>증거 추가하기</Text>
          <Text style={styles.uploadSubtitle}>
            증거 자료를 안전하게 보관하세요
          </Text>
          <View style={styles.uploadRow}>
            {UPLOAD_BUTTONS.map((btn) => (
              <TouchableOpacity
                key={btn.type}
                style={styles.uploadButton}
                activeOpacity={0.7}
                onPress={() => handleUpload(btn.type)}
              >
                <View style={[styles.uploadIconCircle, { backgroundColor: btn.bg }]}>
                  <Ionicons name={btn.icon as any} size={24} color={COLORS.darkText} />
                </View>
                <Text style={styles.uploadLabel}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Evidence List / Empty State ──────────────────────── */}
        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIllustration}>
              <Ionicons name="folder-open-outline" size={64} color={COLORS.plum} />
            </View>
            <Text style={styles.emptyTitle}>아직 저장된 증거가 없어요</Text>
            <Text style={styles.emptySubtitle}>
              증거를 미리 확보해두면{'\n'}법적 대응에 큰 도움이 됩니다
            </Text>
            <TouchableOpacity
              style={styles.emptyCta}
              activeOpacity={0.7}
              onPress={() => handleUpload('text')}
            >
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
              <Text style={styles.emptyCtaText}>첫 번째 증거 추가하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {/* Timeline left border */}
            <View style={styles.timelineLine} />

            {groups.map((group) => (
              <View key={group.label} style={styles.dateGroup}>
                <View style={styles.dateLabelRow}>
                  <View style={styles.dateLabelDot} />
                  <Text style={styles.dateLabelText}>{group.label}</Text>
                </View>
                {group.items.map((item) => (
                  <SwipeableEvidenceCard
                    key={item.id}
                    item={item}
                    onDelete={deleteItem}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Bottom Action ─────────────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
        <TouchableOpacity
          style={[styles.pdfButton, isEmpty && styles.pdfButtonDisabled]}
          activeOpacity={isEmpty ? 1 : 0.7}
          onPress={() => {
            if (isEmpty) return;
            showComingSoon();
          }}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={isEmpty ? COLORS.lightText : COLORS.white}
          />
          <Text style={[styles.pdfButtonText, isEmpty && styles.pdfButtonTextDisabled]}>
            경찰 제출용 PDF 만들기
          </Text>
          <View style={[styles.premiumBadge, isEmpty && styles.premiumBadgeDisabled]}>
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Text Memo Modal ───────────────────────────────────── */}
      <Modal
        visible={memoModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setMemoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
            {/* Drag handle */}
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>텍스트 메모 작성</Text>
              <TouchableOpacity
                onPress={() => setMemoModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={22} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>제목 (선택)</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="증거 제목을 입력하세요"
              placeholderTextColor={COLORS.lightText}
              value={memoTitle}
              onChangeText={setMemoTitle}
              maxLength={100}
            />

            <Text style={styles.inputLabel}>내용</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="상황을 자세히 기록해주세요. 날짜, 시간, 장소, 관련 인물 등을 포함하면 좋습니다."
              placeholderTextColor={COLORS.lightText}
              value={memoContent}
              onChangeText={setMemoContent}
              multiline
              textAlignVertical="top"
              maxLength={5000}
            />
            <Text style={styles.charCount}>{memoContent.length} / 5,000</Text>

            <TouchableOpacity
              style={[
                styles.saveButton,
                !memoContent.trim() && styles.saveButtonDisabled,
              ]}
              activeOpacity={memoContent.trim() ? 0.7 : 1}
              onPress={addTextMemo}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={memoContent.trim() ? COLORS.white : COLORS.lightText}
              />
              <Text
                style={[
                  styles.saveButtonText,
                  !memoContent.trim() && styles.saveButtonTextDisabled,
                ]}
              >
                증거 저장하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  // ── Header ──
  header: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  lawyerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold + '14',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  lawyerBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },
  headerCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    marginTop: SPACING.xs + 2,
  },

  // ── ScrollView ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // ── Upload Card ──
  uploadCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  uploadTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  uploadSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    marginBottom: SPACING.lg,
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.darkText,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Empty State ──
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    minHeight: 56,
  },
  emptyCtaText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.white,
  },

  // ── Timeline ──
  timelineContainer: {
    position: 'relative',
    paddingLeft: SPACING.lg,
  },
  timelineLine: {
    position: 'absolute',
    left: 6,
    top: 8,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.gold + '40',
  },
  dateGroup: {
    marginBottom: SPACING.lg,
  },
  dateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginLeft: -SPACING.lg,
  },
  dateLabelDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.gold,
    borderWidth: 3,
    borderColor: COLORS.cream,
    marginRight: SPACING.sm,
  },
  dateLabelText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Swipeable card ──
  swipeContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 90,
    backgroundColor: COLORS.coralLight,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  deleteText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  cardAnimated: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
  },

  // ── Evidence card ──
  evidenceCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    ...SHADOW.sm,
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
    flex: 1,
    marginRight: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  typeBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  previewText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  timestamp: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
  },
  categoryBadge: {
    backgroundColor: COLORS.warmGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  categoryText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    fontWeight: '500',
  },

  // ── Bottom bar ──
  bottomBar: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.darkText,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    minHeight: 56,
  },
  pdfButtonDisabled: {
    backgroundColor: COLORS.borderLight,
  },
  pdfButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  pdfButtonTextDisabled: {
    color: COLORS.lightText,
  },
  premiumBadge: {
    backgroundColor: COLORS.plum,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  premiumBadgeDisabled: {
    backgroundColor: COLORS.lightText,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.8,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
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
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    backgroundColor: COLORS.warmGray,
    marginBottom: SPACING.md,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    backgroundColor: COLORS.warmGray,
    minHeight: 160,
    maxHeight: 240,
  },
  charCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'right',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    minHeight: 56,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.borderLight,
  },
  saveButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  saveButtonTextDisabled: {
    color: COLORS.lightText,
  },
});
