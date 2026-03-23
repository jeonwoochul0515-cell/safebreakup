import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import TrustSignalBar from '@/components/TrustSignalBar';
import StatusTracker from '@/components/StatusTracker';
import { useAppContext } from '@/contexts/AppContext';

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const { casePhase, caseStatus } = useAppContext();

  // Demo quick-stats
  const savedEvidence = 3;
  const checklistDone = 5;
  const checklistTotal = 12;
  const currentPlan = 'FREE';

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleUpgrade = () => {
    Alert.alert('보호 플랜', '구독 페이지로 이동합니다. (준비 중)');
  };

  const handleChecklist = () => {
    Alert.alert('체크리스트', '안전 이별 체크리스트 페이지로 이동합니다. (준비 중)');
  };

  const handleSOS = () => {
    Alert.alert(
      '긴급 연락처',
      '경찰 112 / 여성긴급전화 1366\n법률사무소 청송 02-XXX-XXXX',
      [
        { text: '닫기', style: 'cancel' },
        {
          text: '112 전화',
          onPress: () => Alert.alert('전화 연결', '112로 전화합니다.'),
        },
      ],
    );
  };

  // -----------------------------------------------------------------------
  // Quick stats data
  // -----------------------------------------------------------------------
  const stats = [
    { value: `${savedEvidence}건`, label: '저장된 증거', color: COLORS.gold },
    { value: `${checklistDone}/${checklistTotal}`, label: '체크리스트', color: COLORS.sage },
    { value: currentPlan, label: '보호 플랜', color: COLORS.plum },
  ];

  // -----------------------------------------------------------------------
  // Action cards data
  // -----------------------------------------------------------------------
  const actions = [
    {
      title: '보호 플랜 업그레이드',
      desc: '더 강력한 법적 보호를 받으세요',
      icon: 'star-outline' as const,
      accentColor: COLORS.gold,
      onPress: handleUpgrade,
    },
    {
      title: '안전 이별 체크리스트',
      desc: '12가지 필수 확인 사항',
      icon: 'list-outline' as const,
      accentColor: COLORS.sage,
      onPress: handleChecklist,
    },
    {
      title: '긴급 연락처 확인',
      desc: '경찰 · 1366 · 법률사무소 청송',
      icon: 'call-outline' as const,
      accentColor: COLORS.coral,
      onPress: handleSOS,
    },
  ];

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ===== Profile Section ===== */}
      <View style={styles.profileSection}>
        <View style={styles.avatarCircle}>
          <Ionicons name="shield-checkmark" size={32} color={COLORS.white} />
        </View>
        <Text style={styles.heading}>나의 보호 현황</Text>
        <Text style={styles.subtitle}>법률사무소 청송이 함께합니다</Text>
      </View>

      {/* ===== Trust Signal Bar ===== */}
      <TrustSignalBar phase={casePhase} />

      {/* ===== Status Tracker (wrapped in white card) ===== */}
      <View style={[styles.statusCard, SHADOW.sm]}>
        <StatusTracker currentStatus={caseStatus} />
      </View>

      {/* ===== Quick Stats ===== */}
      <View style={styles.statsRow}>
        {stats.map((stat, idx) => (
          <View key={idx} style={[styles.statCard, SHADOW.sm]}>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ===== Action Cards ===== */}
      <View style={styles.actionSection}>
        {actions.map((action, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.actionCard,
              { borderLeftColor: action.accentColor },
            ]}
            activeOpacity={0.7}
            onPress={action.onPress}
          >
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDesc}>{action.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== Footer ===== */}
      <View style={styles.footer}>
        <Text style={styles.footerFirm}>법률사무소 청송 / 대표변호사 김창희</Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => Alert.alert('이용약관', '이용약관 내용 (준비 중)')}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={styles.footerLink}>이용약관</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('개인정보처리방침', '개인정보처리방침 내용 (준비 중)')}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={styles.footerLink}>개인정보처리방침</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerVersion}>앱 버전 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  content: {
    // paddingBottom set dynamically
  },

  // ── Profile ──
  profileSection: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.cream,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },

  // ── Status Tracker Card ──
  statusCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    overflow: 'hidden',
  },

  // ── Quick Stats ──
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },

  // ── Action Cards ──
  actionSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    gap: 1,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    minHeight: 56,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  actionDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginTop: 2,
  },

  // ── Footer ──
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
  },
  footerFirm: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    fontWeight: '600',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  footerLink: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
  },
  footerDivider: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.borderLight,
  },
  footerVersion: {
    fontSize: 10,
    color: COLORS.borderLight,
    marginTop: SPACING.sm,
  },
});
