import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Data ────────────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  label: string;
  instruction: string;
}

interface ChecklistSection {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  items: ChecklistItem[];
}

const SECTIONS: ChecklistSection[] = [
  {
    title: 'SNS 보안',
    icon: 'share-social',
    color: COLORS.blue,
    items: [
      {
        id: 'sns-1',
        label: '인스타그램 계정 비공개 전환',
        instruction: '설정 → 계정 공개 범위 → 비공개 계정으로 전환하세요.',
      },
      {
        id: 'sns-2',
        label: '페이스북 친구 목록 비공개',
        instruction: '설정 → 개인정보 → 친구 목록 공개 범위를 "나만 보기"로 변경하세요.',
      },
      {
        id: 'sns-3',
        label: '카카오톡 프로필 공개 범위 변경',
        instruction: '카카오톡 → 설정 → 개인/보안 → 프로필 공개 범위를 제한하세요.',
      },
      {
        id: 'sns-4',
        label: '공유 위치 서비스 해제',
        instruction: 'SNS 앱별 위치 공유 설정을 확인하고 모두 해제하세요.',
      },
    ],
  },
  {
    title: '계정 보안',
    icon: 'lock-closed',
    color: COLORS.sage,
    items: [
      {
        id: 'acc-1',
        label: '주요 계정 비밀번호 변경',
        instruction: '이메일, 은행, SNS 등 주요 계정의 비밀번호를 새롭게 변경하세요.',
      },
      {
        id: 'acc-2',
        label: '2단계 인증 설정',
        instruction: '구글, 네이버, 카카오 계정에 2단계 인증을 활성화하세요.',
      },
      {
        id: 'acc-3',
        label: '공유 계정 로그아웃 (넷플릭스, 스포티파이 등)',
        instruction: '함께 사용하던 스트리밍 서비스에서 모든 기기 로그아웃을 실행하세요.',
      },
      {
        id: 'acc-4',
        label: 'iCloud/Google 계정 공유 해제',
        instruction: '가족 공유, 위치 공유 등 클라우드 계정의 공유 설정을 해제하세요.',
      },
    ],
  },
  {
    title: '위치 추적 차단',
    icon: 'navigate-circle-outline' as keyof typeof Ionicons.glyphMap,
    color: COLORS.coral,
    items: [
      {
        id: 'loc-1',
        label: '위치 공유 앱 확인 및 해제',
        instruction: '카카오맵, 구글맵 등에서 실시간 위치 공유가 활성화되어 있는지 확인하세요.',
      },
      {
        id: 'loc-2',
        label: 'AirTag/SmartTag 점검',
        instruction: '소지품에 알 수 없는 추적 기기가 있는지 확인하세요. iPhone: 나의 찾기, Android: 알 수 없는 추적기 감지.',
      },
      {
        id: 'loc-3',
        label: '차량 GPS 점검',
        instruction: '차량 내 OBD 포트, 범퍼 하부, 좌석 하부 등에 GPS 추적 장치가 부착되어 있는지 확인하세요.',
      },
      {
        id: 'loc-4',
        label: '스마트폰 위치 서비스 점검',
        instruction: '설정 → 위치 서비스에서 불필요한 앱의 위치 접근 권한을 해제하세요.',
      },
    ],
  },
  {
    title: '디지털 증거 보존',
    icon: 'document-text',
    color: COLORS.warning,
    items: [
      {
        id: 'evi-1',
        label: '위협/협박 메시지 스크린샷 저장',
        instruction: '날짜와 발신자가 보이도록 전체 화면 스크린샷을 촬영하세요.',
      },
      {
        id: 'evi-2',
        label: '통화 기록 캡처',
        instruction: '반복적인 전화, 심야 시간대 전화 기록을 스크린샷으로 저장하세요.',
      },
      {
        id: 'evi-3',
        label: 'SNS DM 증거 보관',
        instruction: 'DM, 댓글, 태그 등 관련 증거를 스크린샷으로 저장하고, 증거보관함에 보관하세요.',
      },
    ],
  },
];

const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

// ─── Component ───────────────────────────────────────────────────────────────

export default function DigitalDeleteScreen() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const checkAnimations = useRef<Record<string, Animated.Value>>({}).current;

  const completedCount = Object.values(checked).filter(Boolean).length;
  const progress = TOTAL_ITEMS > 0 ? completedCount / TOTAL_ITEMS : 0;

  const getCheckAnim = (id: string) => {
    if (!checkAnimations[id]) {
      checkAnimations[id] = new Animated.Value(checked[id] ? 1 : 0);
    }
    return checkAnimations[id];
  };

  const toggleCheck = useCallback((id: string) => {
    setChecked((prev) => {
      const next = !prev[id];
      const anim = getCheckAnim(id);
      Animated.spring(anim, {
        toValue: next ? 1 : 0,
        useNativeDriver: true,
        friction: 5,
      }).start();
      return { ...prev, [id]: next };
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const showDetail = useCallback((label: string) => {
    Alert.alert(
      '자세한 가이드',
      `"${label}"에 대한 상세 안내는 추후 업데이트 예정입니다.`,
      [{ text: '확인', style: 'default' }],
    );
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────

  const renderItem = (item: ChecklistItem, sectionColor: string) => {
    const isChecked = !!checked[item.id];
    const isExpanded = expandedId === item.id;
    const scaleAnim = getCheckAnim(item.id);

    return (
      <View key={item.id} style={styles.itemWrapper}>
        <TouchableOpacity
          style={styles.itemRow}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => toggleCheck(item.id)}
            style={[
              styles.checkbox,
              isChecked && { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
            ]}
            activeOpacity={0.7}
          >
            {isChecked && (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              </Animated.View>
            )}
          </TouchableOpacity>

          {/* Label */}
          <Text
            style={[
              styles.itemLabel,
              isChecked && styles.itemLabelChecked,
            ]}
            numberOfLines={2}
          >
            {item.label}
          </Text>

          {/* Expand arrow */}
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={COLORS.lightText}
          />
        </TouchableOpacity>

        {/* Expanded content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.instructionText}>{item.instruction}</Text>
            <TouchableOpacity
              style={styles.detailLink}
              onPress={() => showDetail(item.label)}
            >
              <Text style={[styles.detailLinkText, { color: sectionColor }]}>
                자세히 보기
              </Text>
              <Ionicons name="arrow-forward" size={14} color={sectionColor} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderSection = (section: ChecklistSection, index: number) => {
    const sectionChecked = section.items.filter((i) => checked[i.id]).length;
    const allDone = sectionChecked === section.items.length;

    return (
      <View key={section.title} style={[styles.sectionCard, SHADOW.sm]}>
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: section.color + '18' }]}>
            <Ionicons name={section.icon} size={20} color={section.color} />
          </View>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View
            style={[
              styles.sectionBadge,
              allDone && { backgroundColor: COLORS.gold + '20' },
            ]}
          >
            <Text
              style={[
                styles.sectionBadgeText,
                allDone && { color: COLORS.gold },
              ]}
            >
              {sectionChecked}/{section.items.length}
            </Text>
          </View>
        </View>

        {/* Items */}
        {section.items.map((item) => renderItem(item, section.color))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Nav header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>디지털 안전 점검</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>디지털 안전 점검</Text>
          <Text style={styles.headerSubtitle}>온라인에서의 안전을 확보하세요</Text>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressCard, SHADOW.sm]}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>완료 현황</Text>
            <Text style={styles.progressCount}>
              <Text style={{ color: COLORS.gold, fontWeight: '700' }}>{completedCount}</Text>
              /{TOTAL_ITEMS} 완료
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
          {completedCount === TOTAL_ITEMS && (
            <Text style={styles.progressDoneText}>모든 항목을 완료했습니다!</Text>
          )}
        </View>

        {/* Tips card */}
        <View style={[styles.tipsCard, SHADOW.sm]}>
          <Text style={styles.tipEmoji}>💡</Text>
          <View style={styles.tipTextWrap}>
            <Text style={styles.tipTitle}>삭제 전에 반드시 증거를 먼저 확보하세요!</Text>
            <Text style={styles.tipBody}>
              증거보관함에 저장 후 삭제를 진행하면 안전합니다
            </Text>
          </View>
        </View>

        {/* Sections */}
        {SECTIONS.map((section, i) => renderSection(section, i))}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaButton, SHADOW.md]}
          activeOpacity={0.8}
          onPress={() => {
            // Navigate to evidence vault when available
            Alert.alert('증거보관함', '증거보관함 기능으로 이동합니다.');
          }}
        >
          <Ionicons name="folder-open" size={20} color={COLORS.white} style={{ marginRight: SPACING.sm }} />
          <Text style={styles.ctaText}>증거보관함으로 이동</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={14} color={COLORS.lightText} />
          <Text style={styles.footerText}>
            검토: 김창희 변호사 (법률사무소 청송)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.navy,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },

  // Header
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.goldLight,
  },

  // Progress
  progressCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  progressCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.full,
    minWidth: 4,
  },
  progressDoneText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gold,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Tips
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  tipTextWrap: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  tipBody: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: 18,
  },

  // Section
  sectionCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  sectionBadge: {
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.slate,
  },

  // Item
  itemWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.borderLight,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    backgroundColor: COLORS.warmWhite,
  },
  itemLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    marginRight: SPACING.sm,
  },
  itemLabelChecked: {
    color: COLORS.lightText,
    textDecorationLine: 'line-through',
  },

  // Expanded
  expandedContent: {
    paddingLeft: 24 + SPACING.sm, // checkbox width + gap
    paddingBottom: SPACING.sm,
  },
  instructionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLinkText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginRight: 4,
  },

  // CTA
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.gold,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  footerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginLeft: SPACING.xs,
  },
});
