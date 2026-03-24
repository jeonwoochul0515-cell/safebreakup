import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import ForensicBadge from '@/components/ForensicBadge';

type EvidenceType = '스크린샷' | '사진' | '텍스트' | '녹음' | '파일';
type EvidenceCategory = '협박' | '유포' | '대화' | '기타';

interface EvidenceItem {
  id: string;
  type: EvidenceType;
  description: string;
  category: EvidenceCategory;
  timestamp: string;
  hash: string;
  verified: boolean;
}

const TYPE_ICONS: Record<EvidenceType, string> = {
  '스크린샷': 'phone-portrait',
  '사진': 'image',
  '텍스트': 'chatbubble-ellipses',
  '녹음': 'mic',
  '파일': 'document-attach',
};

const TYPE_COLORS: Record<EvidenceType, string> = {
  '스크린샷': COLORS.blue,
  '사진': COLORS.sage,
  '텍스트': COLORS.gold,
  '녹음': COLORS.coral,
  '파일': COLORS.plum,
};

const EVIDENCE_TYPES: EvidenceType[] = ['스크린샷', '사진', '텍스트', '녹음', '파일'];
const EVIDENCE_CATEGORIES: EvidenceCategory[] = ['협박', '유포', '대화', '기타'];

const TOOL_CARDS = [
  { title: '증거 캡처', icon: 'camera', color: COLORS.blue, desc: '스크린샷 및 화면 녹화' },
  { title: '증거 보관함', icon: 'lock-closed', color: COLORS.sage, desc: '암호화 보관 및 백업' },
  { title: '타임라인', icon: 'time', color: COLORS.gold, desc: '시간순 증거 정리' },
  { title: '법정 제출 내보내기', icon: 'download', color: COLORS.plum, desc: 'PDF 보고서 생성' },
];

// Mock evidence items
const MOCK_EVIDENCE: EvidenceItem[] = [
  {
    id: '1',
    type: '스크린샷',
    description: '카카오톡 협박 메시지 캡처',
    category: '협박',
    timestamp: '2026-03-24 14:32:15',
    hash: 'a3f7b2c1d9e84f56ab12cd34ef567890',
    verified: true,
  },
  {
    id: '2',
    type: '사진',
    description: '텔레그램 채널 유포 증거',
    category: '유포',
    timestamp: '2026-03-23 09:15:42',
    hash: 'b8d4e6f2a1c3d5e7f9a1b2c3d4e5f6a7',
    verified: true,
  },
  {
    id: '3',
    type: '텍스트',
    description: '인스타그램 DM 대화 내용',
    category: '대화',
    timestamp: '2026-03-22 18:45:03',
    hash: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    verified: true,
  },
  {
    id: '4',
    type: '녹음',
    description: '전화 통화 녹음 (금전 요구)',
    category: '협박',
    timestamp: '2026-03-21 21:10:30',
    hash: 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
    verified: true,
  },
];

export default function EvidenceForensicsScreen() {
  const [evidence] = useState<EvidenceItem[]>(MOCK_EVIDENCE);
  const [modalVisible, setModalVisible] = useState(false);
  const [newType, setNewType] = useState<EvidenceType>('스크린샷');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<EvidenceCategory>('협박');

  const handleAddEvidence = () => {
    if (!newDesc.trim()) {
      Alert.alert('알림', '증거 설명을 입력해주세요.');
      return;
    }
    Alert.alert('증거 추가됨', `${newType} 증거가 보관함에 추가되었습니다.`);
    setModalVisible(false);
    setNewDesc('');
  };

  const totalItems = evidence.length;
  const dateRange =
    evidence.length > 0
      ? `${evidence[evidence.length - 1].timestamp.split(' ')[0]} ~ ${evidence[0].timestamp.split(' ')[0]}`
      : '-';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>증거 보관함</Text>
        <View style={styles.headerBackBtn} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="documents" size={22} color={COLORS.blue} />
            <Text style={styles.statValue}>{totalItems}</Text>
            <Text style={styles.statLabel}>총 증거</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={22} color={COLORS.gold} />
            <Text style={styles.statDateValue}>{dateRange}</Text>
            <Text style={styles.statLabel}>수집 기간</Text>
          </View>
        </View>

        {/* Tool Dashboard */}
        <Text style={styles.headingText}>증거 관리 도구</Text>
        <View style={styles.toolGrid}>
          {TOOL_CARDS.map((tool, i) => (
            <TouchableOpacity key={i} style={styles.toolCard} activeOpacity={0.7}>
              <View style={[styles.toolIconWrap, { backgroundColor: tool.color + '18' }]}>
                <Ionicons name={tool.icon as any} size={24} color={tool.color} />
              </View>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDesc}>{tool.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Evidence List */}
        <View style={styles.evidenceHeaderRow}>
          <Text style={styles.headingText}>수집된 증거</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color={COLORS.white} />
            <Text style={styles.addBtnText}>추가</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.evidenceList}>
          {evidence.map((item) => {
            const typeColor = TYPE_COLORS[item.type];
            return (
              <View key={item.id} style={styles.evidenceCard}>
                <View style={styles.evidenceTopRow}>
                  <View style={[styles.evidenceTypeIcon, { backgroundColor: typeColor + '18' }]}>
                    <Ionicons name={TYPE_ICONS[item.type] as any} size={18} color={typeColor} />
                  </View>
                  <View style={styles.evidenceInfo}>
                    <Text style={styles.evidenceDesc}>{item.description}</Text>
                    <Text style={styles.evidenceTimestamp}>{item.timestamp}</Text>
                  </View>
                  <View style={styles.evidenceCategoryBadge}>
                    <Text style={styles.evidenceCategoryText}>{item.category}</Text>
                  </View>
                </View>
                <ForensicBadge
                  hash={item.hash}
                  timestamp={item.timestamp}
                  verified={item.verified}
                />
              </View>
            );
          })}
        </View>

        {/* Legal info section */}
        <View style={styles.legalInfoCard}>
          <View style={styles.legalInfoHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.blue} />
            <Text style={styles.legalInfoTitle}>법적 증거력 안내</Text>
          </View>
          <Text style={styles.legalInfoText}>
            디지털 증거는 원본성, 무결성, 신뢰성이 확보되어야 법적 증거로 인정됩니다.
          </Text>
          <View style={styles.legalInfoItem}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.sage} />
            <Text style={styles.legalInfoItemText}>
              스크린샷 촬영 시 날짜/시간/URL이 모두 보이도록 캡처하세요.
            </Text>
          </View>
          <View style={styles.legalInfoItem}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.sage} />
            <Text style={styles.legalInfoItemText}>
              원본 파일을 수정하거나 편집하지 마세요. 해시값이 변경되면 증거력이 상실됩니다.
            </Text>
          </View>
          <View style={styles.legalInfoItem}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.sage} />
            <Text style={styles.legalInfoItemText}>
              증거 수집 과정에서 불법적인 방법(해킹, 무단 접근 등)을 사용하면 증거능력이 부정될 수 있습니다.
            </Text>
          </View>
          <View style={styles.legalInfoItem}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.sage} />
            <Text style={styles.legalInfoItemText}>
              SHA-256 해시를 통해 파일의 무결성을 검증할 수 있습니다.
            </Text>
          </View>

          {/* Reviewer badge */}
          <View style={styles.reviewerBadge}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
            <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사</Text>
          </View>

          <View style={styles.disclaimerBox}>
            <Ionicons name="alert-circle" size={14} color={COLORS.warning} />
            <Text style={styles.disclaimerBoxText}>
              이 앱의 증거 관리 기능은 참고용이며, 법적 효력을 보장하지 않습니다.
              중요한 증거는 반드시 전문가(변호사, 디지털포렌식 전문가)의 도움을 받으세요.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Evidence Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>증거 추가</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            {/* Type selector */}
            <Text style={styles.modalLabel}>증거 유형</Text>
            <View style={styles.typeRow}>
              {EVIDENCE_TYPES.map((t) => {
                const isSelected = newType === t;
                const color = TYPE_COLORS[t];
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, isSelected && { backgroundColor: color + '20', borderColor: color }]}
                    onPress={() => setNewType(t)}
                  >
                    <Ionicons name={TYPE_ICONS[t] as any} size={14} color={isSelected ? color : COLORS.slate} />
                    <Text style={[styles.typeChipText, isSelected && { color, fontWeight: '700' }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description */}
            <Text style={styles.modalLabel}>설명</Text>
            <TextInput
              style={styles.modalInput}
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="증거에 대한 설명을 입력하세요..."
              placeholderTextColor={COLORS.lightText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Category */}
            <Text style={styles.modalLabel}>카테고리</Text>
            <View style={styles.categoryRow}>
              {EVIDENCE_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.categoryChip, newCategory === c && styles.categoryChipSelected]}
                  onPress={() => setNewCategory(c)}
                >
                  <Text style={[styles.categoryChipText, newCategory === c && styles.categoryChipTextSelected]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleAddEvidence}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={18} color={COLORS.white} />
              <Text style={styles.submitBtnText}>증거 추가하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: COLORS.navy,
  },
  headerBackBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white },

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: COLORS.darkText, marginTop: SPACING.xs },
  statDateValue: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.darkText, marginTop: SPACING.xs, textAlign: 'center' },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.slate, marginTop: 2 },

  headingText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.md,
  },

  // Tool grid
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  toolCard: {
    width: '47%' as any,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  toolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  toolTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText, marginBottom: 2 },
  toolDesc: { fontSize: FONT_SIZE.xs, color: COLORS.slate },

  // Evidence list
  evidenceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  addBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.white },

  evidenceList: { gap: SPACING.sm, marginBottom: SPACING.lg },
  evidenceCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  evidenceTopRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  evidenceTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceInfo: { flex: 1 },
  evidenceDesc: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.darkText },
  evidenceTimestamp: { fontSize: FONT_SIZE.xs, color: COLORS.lightText, marginTop: 2 },
  evidenceCategoryBadge: {
    backgroundColor: COLORS.warmGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  evidenceCategoryText: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.slate },

  // Legal info
  legalInfoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  legalInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  legalInfoTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText },
  legalInfoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  legalInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  legalInfoItemText: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.darkText, lineHeight: 20 },

  reviewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reviewerBadgeText: { fontSize: FONT_SIZE.xs, color: COLORS.gold, fontWeight: '600' },

  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.warning + '12',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  disclaimerBoxText: { flex: 1, fontSize: FONT_SIZE.xs, color: COLORS.darkText, lineHeight: 18 },

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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.darkText },

  modalLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },

  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.cardBg,
  },
  typeChipText: { fontSize: FONT_SIZE.sm, color: COLORS.slate },

  modalInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    minHeight: 80,
  },

  categoryRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.cardBg,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  categoryChipText: { fontSize: FONT_SIZE.sm, color: COLORS.darkText, fontWeight: '500' },
  categoryChipTextSelected: { color: COLORS.white, fontWeight: '700' },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.lg,
  },
  submitBtnText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white },
});
