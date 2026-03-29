import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import {
  MOCK_DOCUMENTS,
  DOCUMENT_STATUS_CONFIG,
  DocumentStatus,
  DocumentReview,
} from '@/constants/admin';

const FILTER_TABS = [
  { key: 'all', label: '전체' },
  { key: 'draft', label: '검토대기' },
  { key: 'lawyer_review', label: '검토중' },
  { key: 'approved', label: '승인완료' },
] as const;

export default function DocumentsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [documents, setDocuments] = useState<DocumentReview[]>(MOCK_DOCUMENTS);

  const filteredDocs =
    activeFilter === 'all'
      ? documents
      : activeFilter === 'draft'
        ? documents.filter((d) => d.status === 'draft' || d.status === 'revision_requested')
        : activeFilter === 'approved'
          ? documents.filter((d) => d.status === 'approved' || d.status === 'sent')
          : documents.filter((d) => d.status === activeFilter);

  const pendingCount = documents.filter(
    (d) => d.status === 'draft' || d.status === 'revision_requested'
  ).length;
  const approvedThisWeek = documents.filter(
    (d) => d.status === 'approved' || d.status === 'sent'
  ).length;

  const updateStatus = (id: string, newStatus: DocumentStatus) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  const handleStartReview = (item: DocumentReview) => {
    Alert.alert(
      '검토 시작',
      `${item.userName}님의 ${item.type} 검토를 시작합니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => updateStatus(item.id, 'lawyer_review'),
        },
      ]
    );
  };

  const handleApprove = (item: DocumentReview) => {
    Alert.alert('서류 승인', `${item.userName}님의 ${item.type}을(를) 승인하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '승인',
        onPress: () => updateStatus(item.id, 'approved'),
      },
    ]);
  };

  const handleRequestRevision = (item: DocumentReview) => {
    Alert.alert(
      '수정 요청',
      `${item.userName}님의 ${item.type}에 수정을 요청하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '수정 요청',
          onPress: () => updateStatus(item.id, 'revision_requested'),
        },
      ]
    );
  };

  const renderStatusBadge = (status: DocumentStatus) => {
    const config = DOCUMENT_STATUS_CONFIG[status];
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon as any} size={14} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>서류 검토 관리</Text>
          <View style={styles.reviewerBadge}>
            <Ionicons name="person-circle" size={16} color={COLORS.goldLight} />
            <Text style={styles.reviewerText}>검토: 김창희 변호사</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>검토 대기</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{approvedThisWeek}</Text>
            <Text style={styles.statLabel}>이번 주 승인</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{documents.length}</Text>
            <Text style={styles.statLabel}>전체</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const count =
              tab.key === 'all'
                ? documents.length
                : tab.key === 'draft'
                  ? documents.filter((d) => d.status === 'draft' || d.status === 'revision_requested').length
                  : tab.key === 'approved'
                    ? documents.filter((d) => d.status === 'approved' || d.status === 'sent').length
                    : documents.filter((d) => d.status === tab.key).length;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Document Cards */}
        <View style={styles.cardList}>
          {filteredDocs.map((item) => (
            <View key={item.id} style={styles.docCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Ionicons name="document-text" size={20} color={COLORS.navy} />
                  <Text style={styles.docType}>{item.type}</Text>
                </View>
                {renderStatusBadge(item.status)}
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>사용자</Text>
                  <Text style={styles.infoValue}>{item.userName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>사건 유형</Text>
                  <Text style={styles.infoValue}>{item.caseType}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>생성일</Text>
                  <Text style={styles.infoValue}>{item.createdDate}</Text>
                </View>
                {item.lawyer ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>담당 변호사</Text>
                    <Text style={styles.infoValue}>{item.lawyer} 변호사</Text>
                  </View>
                ) : null}
              </View>

              {/* Notes */}
              <Text style={styles.notesText}>{item.notes}</Text>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {(item.status === 'draft' || item.status === 'revision_requested') && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionReview]}
                    onPress={() => handleStartReview(item)}
                  >
                    <Ionicons name="eye-outline" size={16} color={COLORS.blue} />
                    <Text style={[styles.actionText, { color: COLORS.blue }]}>
                      검토 시작
                    </Text>
                  </TouchableOpacity>
                )}
                {(item.status === 'draft' || item.status === 'revision_requested' || item.status === 'lawyer_review') && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionApprove]}
                      onPress={() => handleApprove(item)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.sage} />
                      <Text style={[styles.actionText, { color: COLORS.sage }]}>
                        승인
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionRevision]}
                      onPress={() => handleRequestRevision(item)}
                    >
                      <Ionicons name="arrow-undo-outline" size={16} color={COLORS.coral} />
                      <Text style={[styles.actionText, { color: COLORS.coral }]}>
                        수정 요청
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                {(item.status === 'approved' || item.status === 'sent') && (
                  <Text style={styles.completedText}>
                    {item.status === 'approved' ? '승인 완료' : '발송 완료'}
                  </Text>
                )}
              </View>
            </View>
          ))}

          {filteredDocs.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color={COLORS.lightText} />
              <Text style={styles.emptyText}>해당 상태의 서류가 없습니다</Text>
            </View>
          )}
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.white,
  },
  reviewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  reviewerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.goldLight,
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.navy,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginTop: SPACING.xs,
  },

  // Filter
  filterContainer: {
    marginTop: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterTabActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  filterTabText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: COLORS.white,
  },

  // Card list
  cardList: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  docCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  docType: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },

  // Card body
  cardBody: {
    gap: SPACING.xs,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },
  infoValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  notesText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    marginTop: SPACING.sm,
    lineHeight: 20,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  actionReview: {
    borderColor: COLORS.blue,
    backgroundColor: COLORS.blue + '10',
  },
  actionApprove: {
    borderColor: COLORS.sage,
    backgroundColor: COLORS.sage + '10',
  },
  actionRevision: {
    borderColor: COLORS.coral,
    backgroundColor: COLORS.coral + '10',
  },
  actionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  completedText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    fontStyle: 'italic',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.lightText,
  },
});
