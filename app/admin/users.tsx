import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { MOCK_USERS, TIER_CONFIG } from '@/constants/admin';

type TierKey = keyof typeof TIER_CONFIG;
type SortKey = 'joinDate' | 'lastActive' | 'risk';

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const TIER_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'free', label: '무료' },
  { key: 'standard', label: '유료회원' },
] as const;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'joinDate', label: '최근 가입' },
  { key: 'lastActive', label: '최근 활동' },
  { key: 'risk', label: '위험도 순' },
];

export default function AdminUsers() {
  const insets = useSafeAreaInsets();
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('joinDate');

  const tierCounts = {
    free: MOCK_USERS.filter((u) => u.tier === 'free').length,
    standard: MOCK_USERS.filter((u) => u.tier === 'standard').length,
  };

  const users = useMemo(() => {
    let list =
      tierFilter === 'all'
        ? [...MOCK_USERS]
        : MOCK_USERS.filter((u) => u.tier === tierFilter);

    list.sort((a, b) => {
      if (sortBy === 'joinDate') {
        return b.joinDate.localeCompare(a.joinDate);
      }
      if (sortBy === 'lastActive') {
        return b.lastActive.localeCompare(a.lastActive);
      }
      // risk: higher score first
      const scoreA = a.diagnosisScore ?? 0;
      const scoreB = b.diagnosisScore ?? 0;
      return scoreB - scoreA;
    });

    return list;
  }, [tierFilter, sortBy]);

  const isHighRisk = (score: number | null) => score !== null && score >= 40;

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
          <Text style={styles.headerTitle}>사용자 관리</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.totalStat}>
          <Text style={styles.totalValue}>{MOCK_USERS.length}</Text>
          <Text style={styles.totalLabel}>전체 사용자</Text>
        </View>
        <View style={styles.tierStats}>
          {(Object.keys(TIER_CONFIG) as TierKey[]).map((tier) => (
            <View key={tier} style={styles.tierStatItem}>
              <View
                style={[
                  styles.tierDot,
                  { backgroundColor: TIER_CONFIG[tier].color },
                ]}
              />
              <Text style={styles.tierStatLabel}>
                {TIER_CONFIG[tier].label}
              </Text>
              <Text style={styles.tierStatCount}>{tierCounts[tier]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tier Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {TIER_FILTERS.map((tab) => {
          const isActive = tierFilter === tab.key;
          const tierColor =
            tab.key !== 'all'
              ? TIER_CONFIG[tab.key as TierKey].color
              : COLORS.navy;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                isActive && { backgroundColor: tierColor },
              ]}
              onPress={() => setTierFilter(tab.key)}
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

      {/* Sort Options */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>정렬:</Text>
        {SORT_OPTIONS.map((opt) => {
          const isActive = sortBy === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortChip, isActive && styles.sortChipActive]}
              onPress={() => setSortBy(opt.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sortChipText,
                  isActive && styles.sortChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User List */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {users.map((user) => {
          const tierCfg = TIER_CONFIG[user.tier];
          const highRisk = isHighRisk(user.diagnosisScore);

          return (
            <View
              key={user.id}
              style={[
                styles.userCard,
                highRisk && styles.userCardHighRisk,
              ]}
            >
              {/* Top Row */}
              <View style={styles.userTopRow}>
                <View style={styles.userAvatarWrap}>
                  <Text style={styles.userAvatarText}>
                    {user.nickname.charAt(0)}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{user.nickname}</Text>
                    {highRisk && (
                      <View style={styles.riskBadge}>
                        <Ionicons name="warning" size={10} color={COLORS.white} />
                        <Text style={styles.riskBadgeText}>고위험</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.userMeta}>
                    <View
                      style={[
                        styles.tierBadge,
                        { backgroundColor: tierCfg.color + '20' },
                      ]}
                    >
                      <Text style={[styles.tierBadgeText, { color: tierCfg.color }]}>
                        {tierCfg.label}
                      </Text>
                    </View>
                    <Text style={styles.metaText}>
                      가입 {user.joinDate}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stats Row */}
              <View style={styles.userStatsRow}>
                <View style={styles.userStatItem}>
                  <Ionicons name="time-outline" size={14} color={COLORS.slate} />
                  <Text style={styles.userStatLabel}>최근 활동</Text>
                  <Text style={styles.userStatValue}>{user.lastActive}</Text>
                </View>
                <View style={styles.userStatItem}>
                  <Ionicons name="pulse-outline" size={14} color={highRisk ? COLORS.coral : COLORS.slate} />
                  <Text style={styles.userStatLabel}>진단 점수</Text>
                  <Text
                    style={[
                      styles.userStatValue,
                      highRisk && { color: COLORS.coral, fontWeight: '700' },
                    ]}
                  >
                    {user.diagnosisScore !== null ? user.diagnosisScore : '-'}
                  </Text>
                </View>
                <View style={styles.userStatItem}>
                  <Ionicons name="alert-circle-outline" size={14} color={COLORS.slate} />
                  <Text style={styles.userStatLabel}>스토킹</Text>
                  <Text style={styles.userStatValue}>{user.stalkingLogs}건</Text>
                </View>
                <View style={styles.userStatItem}>
                  <Ionicons name="document-outline" size={14} color={COLORS.slate} />
                  <Text style={styles.userStatLabel}>증거</Text>
                  <Text style={styles.userStatValue}>{user.evidenceCount}건</Text>
                </View>
              </View>
            </View>
          );
        })}

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

  // Stats Header
  statsHeader: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW.sm,
  },
  totalStat: {
    alignItems: 'center',
    paddingRight: SPACING.lg,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
  },
  totalValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  totalLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginTop: 2,
  },
  tierStats: {
    flex: 1,
    paddingLeft: SPACING.lg,
    gap: SPACING.xs,
  },
  tierStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tierStatLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    flex: 1,
  },
  tierStatCount: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  // Filter Tabs
  filterScroll: {
    maxHeight: 52,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
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
  filterTabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.slate,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },

  // Sort Row
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  sortLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    fontWeight: '600',
  },
  sortChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
  },
  sortChipActive: {
    borderColor: COLORS.navy,
    backgroundColor: COLORS.navy,
  },
  sortChipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    fontWeight: '500',
  },
  sortChipTextActive: {
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

  // User Card
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  userCardHighRisk: {
    borderWidth: 1.5,
    borderColor: COLORS.coral,
  },
  userTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  userAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  userName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.coral,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  riskBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 4,
  },
  tierBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  tierBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
  },

  // User Stats
  userStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
    gap: SPACING.xs,
  },
  userStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  userStatLabel: {
    fontSize: 10,
    color: COLORS.lightText,
  },
  userStatValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },
});
