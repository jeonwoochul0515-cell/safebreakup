import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import {
  ADMIN_PIN,
  MOCK_CONSULTATIONS,
  MOCK_USERS,
  MOCK_REVENUE,
  MOCK_EVIDENCE_REVIEWS,
  MOCK_SOS_LOGS,
  MOCK_DOCUMENTS,
  TIER_CONFIG,
} from '@/constants/admin';

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // --- PIN Gate ---
  const handlePinSubmit = () => {
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === ADMIN_PIN) {
          setAuthenticated(true);
          setPinError(false);
        } else {
          setPinError(true);
          setTimeout(() => setPin(''), 300);
        }
      }
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
    setPinError(false);
  };

  if (!authenticated) {
    return (
      <View style={[styles.pinContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.pinContent}>
          <View style={styles.pinIconWrap}>
            <Ionicons name="shield-checkmark" size={48} color={COLORS.gold} />
          </View>
          <Text style={styles.pinTitle}>어드민 인증</Text>
          <Text style={styles.pinSubtitle}>관리자 PIN 4자리를 입력하세요</Text>

          <View style={styles.pinDots}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  pin.length > i && styles.pinDotFilled,
                  pinError && styles.pinDotError,
                ]}
              />
            ))}
          </View>

          {pinError && (
            <Text style={styles.pinErrorText}>PIN이 올바르지 않습니다</Text>
          )}

          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(
              (key, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.keypadButton, key === '' && styles.keypadEmpty]}
                  onPress={() => {
                    if (key === 'del') handlePinDelete();
                    else if (key !== '') handlePinInput(key);
                  }}
                  disabled={key === ''}
                  activeOpacity={0.6}
                >
                  {key === 'del' ? (
                    <Ionicons name="backspace-outline" size={24} color={COLORS.white} />
                  ) : (
                    <Text style={styles.keypadText}>{key}</Text>
                  )}
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </View>
    );
  }

  // --- Dashboard Data ---
  const pendingConsultations = MOCK_CONSULTATIONS.filter(
    (c) => c.status === 'pending'
  ).length;
  const todayConsultations = MOCK_CONSULTATIONS.filter(
    (c) => c.date === '2026-03-24'
  ).length;
  const totalUsers = MOCK_USERS.length;
  const tierCounts = {
    free: MOCK_USERS.filter((u) => u.tier === 'free').length,
    standard: MOCK_USERS.filter((u) => u.tier === 'standard').length,
  };
  const latestRevenue = MOCK_REVENUE.monthly[MOCK_REVENUE.monthly.length - 1];
  const revenueInManwon = Math.round(latestRevenue.total / 10000);
  const pendingEvidence = MOCK_EVIDENCE_REVIEWS.filter(
    (e) => e.status === 'pending'
  ).length;
  const pendingDocuments = MOCK_DOCUMENTS.filter(
    (d) => d.status === 'lawyer_review' || d.status === 'draft'
  ).length;
  const sosCount = MOCK_SOS_LOGS.length;

  const quickActions = [
    { label: '상담 관리', icon: 'chatbubbles' as const, route: '/admin/consultations' },
    { label: '사용자 관리', icon: 'people' as const, route: '/admin/users' },
    { label: '매출 통계', icon: 'bar-chart' as const, route: '/admin/revenue' },
    { label: '증거 검토', icon: 'document-text' as const, route: '/admin/evidence' },
    { label: '서류 검토', icon: 'document-attach' as const, route: '/admin/documents' },
    { label: 'SOS 로그', icon: 'alert-circle' as const, route: '/admin/sos-logs' },
    { label: '콘텐츠 관리', icon: 'create' as const, route: '/admin/content' },
  ];

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT + SPACING.sm }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>안전이별 어드민</Text>
            <Text style={styles.headerSubtitle}>관리자 대시보드</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setAuthenticated(false);
              setPin('');
            }}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.goldLight} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Cards */}
        <View style={styles.cardGrid}>
          {/* 오늘 상담 */}
          <View style={styles.dashCard}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#FFF3E6' }]}>
              <Ionicons name="chatbubbles" size={22} color={COLORS.gold} />
            </View>
            <Text style={styles.cardValue}>{pendingConsultations}</Text>
            <Text style={styles.cardLabel}>오늘 상담 (대기)</Text>
            <Text style={styles.cardSub}>전체 {todayConsultations}건</Text>
          </View>

          {/* 총 사용자 */}
          <View style={styles.dashCard}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="people" size={22} color={COLORS.sage} />
            </View>
            <Text style={styles.cardValue}>{totalUsers}</Text>
            <Text style={styles.cardLabel}>총 사용자</Text>
            <View style={styles.tierRow}>
              <Text style={[styles.tierBadge, { color: TIER_CONFIG.free.color }]}>
                무료 {tierCounts.free}
              </Text>
              <Text style={[styles.tierBadge, { color: TIER_CONFIG.standard.color }]}>
                유료 {tierCounts.standard}
              </Text>
            </View>
          </View>

          {/* 이번 달 매출 */}
          <View style={styles.dashCard}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="bar-chart" size={22} color={COLORS.blue} />
            </View>
            <Text style={styles.cardValue}>
              {revenueInManwon.toLocaleString()}
              <Text style={styles.cardUnit}> 만원</Text>
            </Text>
            <Text style={styles.cardLabel}>이번 달 매출</Text>
            <Text style={styles.cardSub}>{latestRevenue.month}</Text>
          </View>

          {/* 증거 검토 */}
          <View style={styles.dashCard}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#FBE9E7' }]}>
              <Ionicons name="document-text" size={22} color={COLORS.coral} />
            </View>
            <Text style={styles.cardValue}>{pendingEvidence}</Text>
            <Text style={styles.cardLabel}>증거 검토 (대기)</Text>
            <Text style={styles.cardSub}>
              전체 {MOCK_EVIDENCE_REVIEWS.length}건
            </Text>
          </View>

          {/* 서류 대기 */}
          <View style={styles.dashCard}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#EDE7F6' }]}>
              <Ionicons name="reader" size={22} color="#7E57C2" />
            </View>
            <Text style={styles.cardValue}>{pendingDocuments}</Text>
            <Text style={styles.cardLabel}>서류 대기</Text>
            <Text style={styles.cardSub}>
              전체 {MOCK_DOCUMENTS.length}건
            </Text>
          </View>

          {/* SOS 발생 */}
          <View style={styles.dashCard}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="alert-circle" size={22} color="#E53935" />
            </View>
            <Text style={styles.cardValue}>{sosCount}</Text>
            <Text style={styles.cardLabel}>SOS 발생</Text>
            <Text style={styles.cardSub}>최근 7일</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>빠른 이동</Text>
        <View style={styles.actionsWrap}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.actionButton}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name={action.icon} size={22} color={COLORS.white} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.lightText} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>최근 상담 요청</Text>
        {MOCK_CONSULTATIONS.filter((c) => c.status === 'pending')
          .slice(0, 3)
          .map((c) => (
            <View key={c.id} style={styles.recentCard}>
              <View style={styles.recentRow}>
                <View style={styles.recentTypeBadge}>
                  <Text style={styles.recentTypeText}>{c.type}</Text>
                </View>
                <Text style={styles.recentName}>{c.userName}</Text>
                <Text style={styles.recentTime}>
                  {c.date} {c.time}
                </Text>
              </View>
              <Text style={styles.recentNotes} numberOfLines={1}>
                {c.notes}
              </Text>
            </View>
          ))}

        {/* 최근 서류 생성 */}
        <Text style={styles.sectionTitle}>최근 서류 생성</Text>
        {MOCK_DOCUMENTS.slice(0, 5).map((doc) => (
          <View key={doc.id} style={styles.recentCard}>
            <View style={styles.recentRow}>
              <View style={[styles.recentTypeBadge, { backgroundColor: '#7E57C2' }]}>
                <Text style={styles.recentTypeText}>{doc.type}</Text>
              </View>
              <Text style={styles.recentName}>{doc.userName}</Text>
              <Text style={styles.recentTime}>{doc.createdDate}</Text>
            </View>
            <Text style={styles.recentNotes} numberOfLines={1}>
              {doc.notes}
            </Text>
          </View>
        ))}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // PIN Screen
  pinContainer: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  pinContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  pinIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(196,149,106,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  pinTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  pinSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.lightText,
    marginBottom: SPACING.xl,
  },
  pinDots: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lightText,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  pinDotError: {
    borderColor: COLORS.coral,
    backgroundColor: COLORS.coral,
  },
  pinErrorText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.coral,
    marginBottom: SPACING.md,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  keypadButton: {
    width: 72,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadEmpty: {
    backgroundColor: 'transparent',
  },
  keypadText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Dashboard
  root: {
    flex: 1,
    backgroundColor: '#F4F3F8',
  },
  header: {
    backgroundColor: COLORS.navy,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.goldLight,
    marginTop: 2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Dashboard Cards Grid
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  dashCard: {
    width: '48.5%' as any,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  cardUnit: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '400',
    color: COLORS.slate,
  },
  cardLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    marginTop: 2,
  },
  cardSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: 2,
  },
  tierRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  tierBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },

  // Quick Actions
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  actionsWrap: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  actionLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },

  // Recent Cards
  recentCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  recentTypeBadge: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  recentTypeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  recentName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  recentTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginLeft: 'auto',
  },
  recentNotes: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },
});
