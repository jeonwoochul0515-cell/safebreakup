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
  MOCK_EVIDENCE_REVIEWS,
  EVIDENCE_STATUS_CONFIG,
} from '@/constants/admin';

type EvidenceStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

interface EvidenceItem {
  id: string;
  userName: string;
  type: string;
  itemCount: number;
  status: EvidenceStatus;
  requestDate: string;
  caseType: string;
}

const FILTER_TABS = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '검토대기' },
  { key: 'reviewing', label: '검토중' },
  { key: 'approved', label: '승인' },
  { key: 'rejected', label: '반려' },
] as const;

export default function EvidenceScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [reviews, setReviews] = useState<EvidenceItem[]>(
    MOCK_EVIDENCE_REVIEWS as EvidenceItem[]
  );

  const filteredReviews =
    activeFilter === 'all'
      ? reviews
      : reviews.filter((r) => r.status === activeFilter);

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const reviewedThisWeek = reviews.filter(
    (r) => r.status === 'approved' || r.status === 'rejected'
  ).length;

  const updateStatus = (id: string, newStatus: EvidenceStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleStartReview = (item: EvidenceItem) => {
    Alert.alert(
      '검토 시작',
      `${item.userName}님의 ${item.type} 검토를 시작합니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => updateStatus(item.id, 'reviewing'),
        },
      ]
    );
  };

  const handleApprove = (item: EvidenceItem) => {
    Alert.alert('증거 승인', `${item.userName}님의 증거를 승인하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '승인',
        onPress: () => updateStatus(item.id, 'approved'),
      },
    ]);
  };

  const handleReject = (item: EvidenceItem) => {
    Alert.alert(
      '증거 반려',
      `${item.userName}님의 증거를 반려하시겠습니까?\n반려 사유를 입력해야 합니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '반려',
          style: 'destructive',
          onPress: () => updateStatus(item.id, 'rejected'),
        },
      ]
    );
  };

  const renderStatusBadge = (status: EvidenceStatus) => {
    const config = EVIDENCE_STATUS_CONFIG[status];
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
        <Ionicons
          name={config.icon as any}
          size={14}
          color={config.color}
        />
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
          <Text style={styles.headerTitle}>증거 검토 관리</Text>
          <View style={styles.reviewerBadge}>
            <Ionicons name="person-circle" size={16} color={COLORS.goldLight} />
            <Text style={styles.reviewerText}>검토: 김창희 변호사</Text>
          </View>
        </View>

        {/* Integrity Note */}
        <View style={styles.integrityBanner}>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.sage} />
          <Text style={styles.integrityText}>
            SHA-256 해시 무결성 검증된 증거만 승인 가능합니다
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>검토 대기</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{reviewedThisWeek}</Text>
            <Text style={styles.statLabel}>이번 주 검토 완료</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{reviews.length}</Text>
            <Text style={styles.statLabel}>전체 요청</Text>
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
                ? reviews.length
                : reviews.filter((r) => r.status === tab.key).length;
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

        {/* Evidence Cards */}
        <View style={styles.cardList}>
          {filteredReviews.map((item) => (
            <View key={item.id} style={styles.evidenceCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={COLORS.navy}
                  />
                  <Text style={styles.userName}>{item.userName}</Text>
                </View>
                {renderStatusBadge(item.status)}
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>유형</Text>
                  <Text style={styles.infoValue}>{item.type}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>증거 수</Text>
                  <Text style={styles.infoValue}>{item.itemCount}건</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>사건 유형</Text>
                  <Text style={styles.infoValue}>{item.caseType}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>요청일</Text>
                  <Text style={styles.infoValue}>{item.requestDate}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {item.status === 'pending' && (
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
                {(item.status === 'pending' || item.status === 'reviewing') && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionApprove]}
                      onPress={() => handleApprove(item)}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={16}
                        color={COLORS.sage}
                      />
                      <Text style={[styles.actionText, { color: COLORS.sage }]}>
                        승인
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionReject]}
                      onPress={() => handleReject(item)}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={16}
                        color={COLORS.coral}
                      />
                      <Text
                        style={[styles.actionText, { color: COLORS.coral }]}
                      >
                        반려
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                {(item.status === 'approved' || item.status === 'rejected') && (
                  <Text style={styles.completedText}>
                    {item.status === 'approved' ? '승인 완료' : '반려 완료'}
                  </Text>
                )}
              </View>
            </View>
          ))}

          {filteredReviews.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-outline"
                size={48}
                color={COLORS.lightText}
              />
              <Text style={styles.emptyText}>해당 상태의 증거가 없습니다</Text>
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

  // Integrity Banner
  integrityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.sage + '15',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.sage,
  },
  integrityText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    flex: 1,
    fontWeight: '500',
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
  evidenceCard: {
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
  userName: {
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
  actionReject: {
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
