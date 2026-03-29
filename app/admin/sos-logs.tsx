import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import {
  MOCK_SOS_LOGS,
  SOS_STATUS_CONFIG,
  SOSStatus,
} from '@/constants/admin';

export default function SOSLogsScreen() {
  const logs = [...MOCK_SOS_LOGS].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const todayStr = '2026-03-27';
  const todayCount = logs.filter((l) => l.timestamp.startsWith(todayStr)).length;

  // This week: 2026-03-24 ~ 2026-03-27
  const weekStart = '2026-03-24';
  const weekCount = logs.filter((l) => l.timestamp >= weekStart).length;

  const renderStatusBadge = (status: SOSStatus) => {
    const config = SOS_STATUS_CONFIG[status];
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
          <Text style={styles.headerTitle}>SOS 로그</Text>
          <Text style={styles.headerSubtitle}>긴급 발동 이력 모니터링</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardDanger]}>
            <Ionicons name="alert-circle" size={24} color={COLORS.coral} />
            <Text style={[styles.statValue, { color: COLORS.coral }]}>{todayCount}</Text>
            <Text style={styles.statLabel}>오늘 SOS</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.blue} />
            <Text style={styles.statValue}>{weekCount}</Text>
            <Text style={styles.statLabel}>이번 주</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="list-outline" size={24} color={COLORS.sage} />
            <Text style={styles.statValue}>{logs.length}</Text>
            <Text style={styles.statLabel}>전체</Text>
          </View>
        </View>

        {/* Log List */}
        <View style={styles.logList}>
          {logs.map((log) => (
            <View key={log.id} style={styles.logCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor:
                          log.type === '긴급신고'
                            ? COLORS.coral + '18'
                            : COLORS.warning + '18',
                      },
                    ]}
                  >
                    <Ionicons
                      name={log.type === '긴급신고' ? 'warning' : 'pulse'}
                      size={14}
                      color={log.type === '긴급신고' ? COLORS.coral : COLORS.warning}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        {
                          color:
                            log.type === '긴급신고' ? COLORS.coral : COLORS.warning,
                        },
                      ]}
                    >
                      {log.type}
                    </Text>
                  </View>
                  {renderStatusBadge(log.status)}
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={14} color={COLORS.slate} />
                  <Text style={styles.infoText}>{log.userName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={14} color={COLORS.slate} />
                  <Text style={styles.infoText}>{log.timestamp}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.slate} />
                  <Text style={styles.infoText}>{log.location}</Text>
                </View>
              </View>

              {/* Result */}
              <View style={styles.resultRow}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.sage} />
                <Text style={styles.resultText}>{log.result}</Text>
              </View>
            </View>
          ))}

          {logs.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={48} color={COLORS.lightText} />
              <Text style={styles.emptyText}>SOS 로그가 없습니다</Text>
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
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.goldLight,
    marginTop: SPACING.xs,
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
    gap: SPACING.xs,
    ...SHADOW.sm,
  },
  statCardDanger: {
    borderWidth: 1,
    borderColor: COLORS.coral + '30',
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.navy,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
  },

  // Log List
  logList: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  logCard: {
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
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  typeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
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
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    fontWeight: '500',
  },

  // Result
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    backgroundColor: COLORS.sage + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  resultText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    fontWeight: '600',
    flex: 1,
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
