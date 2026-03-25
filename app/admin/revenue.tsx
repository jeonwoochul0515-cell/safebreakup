import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { MOCK_REVENUE, MOCK_USERS } from '@/constants/admin';

export default function RevenueScreen() {
  const router = useRouter();
  const current = MOCK_REVENUE.monthly[MOCK_REVENUE.monthly.length - 1];
  const tier = MOCK_REVENUE.tierBreakdown;
  const conversion = MOCK_REVENUE.conversionRate;
  const totalUsers = tier.free + tier.light + tier.care;
  const subscriberCount = tier.care + tier.light;

  const maxTotal = Math.max(...MOCK_REVENUE.monthly.map((m) => m.total));

  const sortedServices = [...MOCK_REVENUE.topServices].sort(
    (a, b) => b.revenue - a.revenue
  );

  const freePercent = Math.round((tier.free / totalUsers) * 100);
  const lightPercent = Math.round((tier.light / totalUsers) * 100);
  const carePercent = 100 - freePercent - lightPercent;

  const conversionOverall = ((subscriberCount / totalUsers) * 100).toFixed(1);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>매출 / 통계 대시보드</Text>
          <Text style={styles.headerSub}>2026년 3월 기준</Text>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { borderTopColor: COLORS.gold }]}>
            <Ionicons name="cash-outline" size={22} color={COLORS.gold} />
            <Text style={styles.kpiLabel}>이번 달 매출</Text>
            <Text style={styles.kpiValue}>
              {current.total.toLocaleString()}원
            </Text>
          </View>
          <View style={[styles.kpiCard, { borderTopColor: COLORS.blue }]}>
            <Ionicons name="people-outline" size={22} color={COLORS.blue} />
            <Text style={styles.kpiLabel}>구독자 수</Text>
            <Text style={styles.kpiValue}>
              {subscriberCount.toLocaleString()}명
            </Text>
            <Text style={styles.kpiSub}>
              케어 {tier.care} + 라이트 {tier.light}
            </Text>
          </View>
          <View style={[styles.kpiCard, { borderTopColor: COLORS.sage }]}>
            <Ionicons
              name="trending-up-outline"
              size={22}
              color={COLORS.sage}
            />
            <Text style={styles.kpiLabel}>전환율</Text>
            <Text style={styles.kpiValue}>{conversionOverall}%</Text>
            <Text style={styles.kpiSub}>무료→유료</Text>
          </View>
        </View>

        {/* Monthly Revenue Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>월별 매출 추이</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: COLORS.gold }]}
                />
                <Text style={styles.legendText}>구독</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: COLORS.blue }]}
                />
                <Text style={styles.legendText}>건별</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: COLORS.coral }]}
                />
                <Text style={styles.legendText}>경호</Text>
              </View>
            </View>
            <View style={styles.barChart}>
              {MOCK_REVENUE.monthly.map((m) => {
                const barHeight = 140;
                const ratio = m.total / maxTotal;
                const subH = (m.subscription / m.total) * barHeight * ratio;
                const perH = (m.perCase / m.total) * barHeight * ratio;
                const escH = (m.escort / m.total) * barHeight * ratio;
                const monthLabel = m.month.split('-')[1] + '월';
                return (
                  <View key={m.month} style={styles.barGroup}>
                    <View
                      style={[
                        styles.barWrapper,
                        { height: barHeight },
                      ]}
                    >
                      <View style={{ flex: 1 }} />
                      <View
                        style={[
                          styles.barSegment,
                          {
                            height: escH,
                            backgroundColor: COLORS.coral,
                            borderTopLeftRadius: escH > 0 && subH === 0 && perH === 0 ? 4 : 0,
                            borderTopRightRadius: escH > 0 && subH === 0 && perH === 0 ? 4 : 0,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.barSegment,
                          {
                            height: perH,
                            backgroundColor: COLORS.blue,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.barSegment,
                          {
                            height: subH,
                            backgroundColor: COLORS.gold,
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{monthLabel}</Text>
                    <Text style={styles.barValue}>
                      {(m.total / 10000).toFixed(0)}만
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Tier Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>구독 티어 분포</Text>
          <View style={styles.card}>
            <View style={styles.stackedBar}>
              <View
                style={[
                  styles.stackedSegment,
                  {
                    flex: freePercent,
                    backgroundColor: COLORS.sage,
                    borderTopLeftRadius: RADIUS.sm,
                    borderBottomLeftRadius: RADIUS.sm,
                  },
                ]}
              >
                <Text style={styles.stackedText}>무료</Text>
              </View>
              <View
                style={[
                  styles.stackedSegment,
                  { flex: lightPercent, backgroundColor: COLORS.gold },
                ]}
              >
                <Text style={styles.stackedText}>라이트</Text>
              </View>
              <View
                style={[
                  styles.stackedSegment,
                  {
                    flex: carePercent,
                    backgroundColor: COLORS.tierPremium,
                    borderTopRightRadius: RADIUS.sm,
                    borderBottomRightRadius: RADIUS.sm,
                  },
                ]}
              >
                <Text style={styles.stackedText}>케어</Text>
              </View>
            </View>
            <View style={styles.tierDetails}>
              <View style={styles.tierRow}>
                <View
                  style={[styles.tierDot, { backgroundColor: COLORS.sage }]}
                />
                <Text style={styles.tierLabel}>무료</Text>
                <Text style={styles.tierValue}>
                  {tier.free.toLocaleString()}명 ({freePercent}%)
                </Text>
              </View>
              <View style={styles.tierRow}>
                <View
                  style={[styles.tierDot, { backgroundColor: COLORS.gold }]}
                />
                <Text style={styles.tierLabel}>라이트</Text>
                <Text style={styles.tierValue}>
                  {tier.light.toLocaleString()}명 ({lightPercent}%)
                </Text>
              </View>
              <View style={styles.tierRow}>
                <View
                  style={[
                    styles.tierDot,
                    { backgroundColor: COLORS.tierPremium },
                  ]}
                />
                <Text style={styles.tierLabel}>케어</Text>
                <Text style={styles.tierValue}>
                  {tier.care.toLocaleString()}명 ({carePercent}%)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Conversion Funnel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>전환 퍼널</Text>
          <View style={styles.card}>
            <View style={styles.funnelContainer}>
              {/* Step 1 */}
              <View style={[styles.funnelStep, { width: '100%' }]}>
                <View
                  style={[
                    styles.funnelBar,
                    { backgroundColor: COLORS.sage, width: '100%' },
                  ]}
                >
                  <Text style={styles.funnelBarText}>무료 사용자</Text>
                </View>
              </View>
              <View style={styles.funnelArrow}>
                <Ionicons
                  name="arrow-down"
                  size={18}
                  color={COLORS.lightText}
                />
                <Text style={styles.funnelRate}>
                  {conversion.freeToLight}% 전환
                </Text>
              </View>
              {/* Step 2 */}
              <View style={[styles.funnelStep, { width: '70%' }]}>
                <View
                  style={[
                    styles.funnelBar,
                    { backgroundColor: COLORS.gold, width: '100%' },
                  ]}
                >
                  <Text style={styles.funnelBarText}>라이트 구독</Text>
                </View>
              </View>
              <View style={styles.funnelArrow}>
                <Ionicons
                  name="arrow-down"
                  size={18}
                  color={COLORS.lightText}
                />
                <Text style={styles.funnelRate}>
                  {conversion.lightToCare}% 전환
                </Text>
              </View>
              {/* Step 3 */}
              <View style={[styles.funnelStep, { width: '45%' }]}>
                <View
                  style={[
                    styles.funnelBar,
                    { backgroundColor: COLORS.tierPremium, width: '100%' },
                  ]}
                >
                  <Text style={styles.funnelBarText}>케어 구독</Text>
                </View>
              </View>
              <View style={styles.funnelArrow}>
                <Ionicons
                  name="arrow-down"
                  size={18}
                  color={COLORS.lightText}
                />
                <Text style={styles.funnelRate}>
                  체험→유료 {conversion.trialToPaid}%
                </Text>
              </View>
              {/* Step 4 */}
              <View style={[styles.funnelStep, { width: '30%' }]}>
                <View
                  style={[
                    styles.funnelBar,
                    { backgroundColor: COLORS.coral, width: '100%' },
                  ]}
                >
                  <Text style={styles.funnelBarText}>유료 전환</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Top Services Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>서비스별 매출 TOP 5</Text>
          <View style={styles.card}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>
                서비스명
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  { flex: 1, textAlign: 'center' },
                ]}
              >
                건수
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  { flex: 1.5, textAlign: 'right' },
                ]}
              >
                매출
              </Text>
            </View>
            {sortedServices.map((svc, idx) => (
              <View
                key={svc.name}
                style={[
                  styles.tableRow,
                  idx % 2 === 0 && { backgroundColor: COLORS.warmGray },
                ]}
              >
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.tableRank}>{idx + 1}</Text>
                  <Text style={styles.tableName}>{svc.name}</Text>
                </View>
                <Text style={[styles.tableCount, { flex: 1, textAlign: 'center' }]}>
                  {svc.count}건
                </Text>
                <Text style={[styles.tableRevenue, { flex: 1.5, textAlign: 'right' }]}>
                  {svc.revenue.toLocaleString()}원
                </Text>
              </View>
            ))}
          </View>
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
  headerSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.goldLight,
    marginTop: SPACING.xs,
  },

  // KPI
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.md,
    gap: SPACING.sm,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderTopWidth: 3,
    alignItems: 'center',
    ...SHADOW.md,
  },
  kpiLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginTop: SPACING.xs,
  },
  kpiValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.darkText,
    marginTop: SPACING.xs,
  },
  kpiSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: 2,
  },

  // Section
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: SPACING.md,
  },

  // Bar Chart
  chartContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: 32,
    justifyContent: 'flex-end',
  },
  barSegment: {
    width: '100%',
  },
  barLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginTop: SPACING.xs,
  },
  barValue: {
    fontSize: 10,
    color: COLORS.lightText,
    marginTop: 2,
  },

  // Stacked bar / tier
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  stackedBar: {
    flexDirection: 'row',
    height: 36,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  stackedSegment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackedText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  tierDetails: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tierDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tierLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    width: 50,
  },
  tierValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },

  // Funnel
  funnelContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  funnelStep: {
    alignSelf: 'center',
  },
  funnelBar: {
    height: 38,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  funnelBarText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  funnelArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  funnelRate: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.navy,
    marginBottom: SPACING.xs,
  },
  tableHeaderText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.navy,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  tableRank: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.gold,
    width: 22,
  },
  tableName: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    fontWeight: '500',
  },
  tableCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },
  tableRevenue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.darkText,
  },
});
