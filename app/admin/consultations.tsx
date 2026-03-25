import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import {
  MOCK_CONSULTATIONS,
  CONSULTATION_STATUS_CONFIG,
} from '@/constants/admin';

type ConsultationStatus = keyof typeof CONSULTATION_STATUS_CONFIG;

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const FILTER_TABS = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '대기' },
  { key: 'confirmed', label: '확정' },
  { key: 'in_progress', label: '진행중' },
  { key: 'completed', label: '완료' },
] as const;

export default function AdminConsultations() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [consultations, setConsultations] = useState(MOCK_CONSULTATIONS);

  const filtered =
    activeFilter === 'all'
      ? consultations
      : consultations.filter((c) => c.status === activeFilter);

  const pendingCount = consultations.filter((c) => c.status === 'pending').length;
  const todayCount = consultations.filter((c) => c.date === '2026-03-24').length;

  const handleAction = (id: string, action: 'confirmed' | 'completed' | 'cancelled') => {
    const label =
      action === 'confirmed' ? '확정' : action === 'completed' ? '완료' : '취소';
    Alert.alert(`상담 ${label}`, `이 상담을 ${label} 처리하시겠습니까?`, [
      { text: '아니오', style: 'cancel' },
      {
        text: '예',
        onPress: () => {
          setConsultations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: action } : c))
          );
          setExpandedId(null);
        },
      },
    ]);
  };

  const getStatusConfig = (status: string) => {
    return (
      CONSULTATION_STATUS_CONFIG[status as ConsultationStatus] ?? {
        label: status,
        color: COLORS.lightText,
        icon: 'help-circle',
      }
    );
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT + SPACING.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>상담 관리</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={18} color={COLORS.gold} />
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>대기 중</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="today-outline" size={18} color={COLORS.blue} />
          <Text style={styles.statValue}>{todayCount}</Text>
          <Text style={styles.statLabel}>오늘 예정</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="list-outline" size={18} color={COLORS.sage} />
          <Text style={styles.statValue}>{consultations.length}</Text>
          <Text style={styles.statLabel}>전체</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  isActive && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Consultation List */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={COLORS.lightText} />
            <Text style={styles.emptyText}>해당 상태의 상담이 없습니다</Text>
          </View>
        ) : (
          filtered.map((c) => {
            const statusCfg = getStatusConfig(c.status);
            const isExpanded = expandedId === c.id;

            return (
              <TouchableOpacity
                key={c.id}
                style={styles.card}
                onPress={() => setExpandedId(isExpanded ? null : c.id)}
                activeOpacity={0.8}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTypeBadge}>
                    <Text style={styles.cardTypeText}>{c.type}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusCfg.color + '18' },
                    ]}
                  >
                    <Ionicons
                      name={statusCfg.icon as any}
                      size={14}
                      color={statusCfg.color}
                    />
                    <Text style={[styles.statusText, { color: statusCfg.color }]}>
                      {statusCfg.label}
                    </Text>
                  </View>
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="person-outline" size={14} color={COLORS.slate} />
                    <Text style={styles.cardInfoText}>{c.userName}</Text>
                  </View>
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.slate} />
                    <Text style={styles.cardInfoText}>
                      {c.date} {c.time}
                    </Text>
                  </View>
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="call-outline" size={14} color={COLORS.slate} />
                    <Text style={styles.cardInfoText}>{c.method}</Text>
                  </View>
                </View>

                {/* Notes Preview */}
                <Text
                  style={styles.cardNotes}
                  numberOfLines={isExpanded ? undefined : 1}
                >
                  {c.notes}
                </Text>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={styles.expandedSection}>
                    <View style={styles.expandedDivider} />
                    <View style={styles.cardInfoRow}>
                      <Ionicons name="call-outline" size={14} color={COLORS.slate} />
                      <Text style={styles.cardInfoText}>{c.phone}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                      {c.status === 'pending' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: COLORS.blue }]}
                          onPress={() => handleAction(c.id, 'confirmed')}
                        >
                          <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
                          <Text style={styles.actionBtnText}>확정</Text>
                        </TouchableOpacity>
                      )}
                      {(c.status === 'pending' ||
                        c.status === 'confirmed' ||
                        c.status === 'in_progress') && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: COLORS.sage }]}
                          onPress={() => handleAction(c.id, 'completed')}
                        >
                          <Ionicons name="checkmark-done-circle" size={16} color={COLORS.white} />
                          <Text style={styles.actionBtnText}>완료</Text>
                        </TouchableOpacity>
                      )}
                      {c.status !== 'completed' && c.status !== 'cancelled' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: COLORS.coral }]}
                          onPress={() => handleAction(c.id, 'cancelled')}
                        >
                          <Ionicons name="close-circle" size={16} color={COLORS.white} />
                          <Text style={styles.actionBtnText}>취소</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                {/* Expand indicator */}
                <View style={styles.expandIndicator}>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={COLORS.lightText}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F3F8',
  },
  header: {
    backgroundColor: COLORS.navy,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.borderLight,
  },

  // Filter Tabs
  filterScroll: {
    maxHeight: 52,
    backgroundColor: COLORS.white,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: '#F4F3F8',
  },
  filterTabActive: {
    backgroundColor: COLORS.navy,
  },
  filterTabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.slate,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },

  // List
  listScroll: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTypeBadge: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  cardTypeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  cardBody: {
    gap: 4,
    marginBottom: SPACING.sm,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  cardInfoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
  },
  cardNotes: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: 20,
  },

  // Expanded
  expandedSection: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  actionBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.white,
  },

  expandIndicator: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.lightText,
  },
});
