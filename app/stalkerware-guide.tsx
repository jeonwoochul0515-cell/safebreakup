import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { STALKERWARE_SIGNS } from '@/constants/stalking';

const ANDROID_STEPS = [
  '설정 > 애플리케이션에서 모든 앱을 표시합니다.',
  '"시스템 서비스", "업데이트 관리자" 등 모호한 이름의 앱을 확인하세요.',
  '설정 > 보안 > 기기 관리자에서 알 수 없는 관리자 앱을 확인하세요.',
  '설정 > 접근성에서 알 수 없는 접근성 서비스를 확인하세요.',
  'Google Play 프로텍트 스캔을 실행하세요.',
  '설정 > 개인정보 보호 > 권한 관리자에서 위치/마이크/카메라 권한을 점검하세요.',
];

const IOS_STEPS = [
  '설정 > 일반 > VPN 및 기기 관리에서 알 수 없는 프로파일을 확인하세요.',
  '설정 > 개인정보 보호에서 위치, 카메라, 마이크 접근 앱을 확인하세요.',
  '탈옥(Jailbreak) 여부를 확인하세요 — Cydia 앱이 있으면 탈옥된 것입니다.',
  '설정 > Apple ID > 나의 찾기에서 위치 공유 상태를 확인하세요.',
  '설정 > 일반 > iPhone 저장 공간에서 의심스러운 앱을 확인하세요.',
  'Apple ID에 연결된 기기 목록을 확인하세요.',
];

const SAFE_REMOVAL_STEPS = [
  { step: 1, text: '안전한 장소에서 진행하세요. 스토커웨어 제거는 가해자에게 알림이 갈 수 있습니다.' },
  { step: 2, text: '중요한 데이터(사진, 연락처)를 안전한 계정으로 백업하세요.' },
  { step: 3, text: '가능하면 공장 초기화를 진행하세요.' },
  { step: 4, text: '모든 계정(구글, 애플, SNS)의 비밀번호를 변경하세요.' },
  { step: 5, text: '2단계 인증을 모든 계정에 설정하세요.' },
  { step: 6, text: '전문가(경찰 사이버수사대 또는 보안 전문업체)에 도움을 요청하세요.' },
];

export default function StalkerwareGuideScreen() {
  const [expandedSigns, setExpandedSigns] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  const toggleSign = (id: number) => {
    setExpandedSigns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스토커웨어 탐지</Text>
        <View style={styles.headerBackButton} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BIG WARNING BANNER */}
        <View style={styles.warningBanner}>
          <View style={styles.warningIconRow}>
            <Ionicons name="warning" size={28} color="#FEE500" />
          </View>
          <Text style={styles.warningTitle}>중요 경고</Text>
          <Text style={styles.warningText}>
            스토커웨어를 제거하면 가해자에게 알림이 갈 수 있습니다
          </Text>
          <Text style={styles.warningSubtext}>
            제거 전 반드시 안전한 환경을 확보하고, 전문가의 도움을 받으세요.
          </Text>
        </View>

        {/* Detection Signs */}
        <Text style={styles.sectionTitle}>의심 징후</Text>
        {STALKERWARE_SIGNS.map((sign) => {
          const isExpanded = expandedSigns[sign.id] ?? false;
          return (
            <TouchableOpacity
              key={sign.id}
              style={styles.signCard}
              onPress={() => toggleSign(sign.id)}
              activeOpacity={0.7}
            >
              <View style={styles.signHeader}>
                <View style={styles.signIconCircle}>
                  <Ionicons name={sign.icon as any} size={20} color={COLORS.coral} />
                </View>
                <View style={styles.signTextArea}>
                  <Text style={styles.signTitle}>{sign.title}</Text>
                  <Text style={styles.signDescription}>{sign.description}</Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={COLORS.slate}
                />
              </View>
              {isExpanded && (
                <View style={styles.signCheckMethod}>
                  <Ionicons name="search" size={14} color={COLORS.gold} />
                  <Text style={styles.signCheckMethodLabel}>확인 방법</Text>
                  <Text style={styles.signCheckMethodText}>{sign.checkMethod}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Platform Tabs */}
        <Text style={styles.sectionTitle}>기기별 확인 방법</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'android' && styles.tabActive]}
            onPress={() => setActiveTab('android')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="logo-android"
              size={18}
              color={activeTab === 'android' ? COLORS.white : COLORS.slate}
            />
            <Text style={[styles.tabText, activeTab === 'android' && styles.tabTextActive]}>
              Android
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ios' && styles.tabActive]}
            onPress={() => setActiveTab('ios')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="logo-apple"
              size={18}
              color={activeTab === 'ios' ? COLORS.white : COLORS.slate}
            />
            <Text style={[styles.tabText, activeTab === 'ios' && styles.tabTextActive]}>iOS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepsCard}>
          {(activeTab === 'android' ? ANDROID_STEPS : IOS_STEPS).map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Safe Removal Section */}
        <Text style={styles.sectionTitle}>안전한 제거 절차</Text>
        <View style={styles.removalCard}>
          {SAFE_REMOVAL_STEPS.map((item) => (
            <View key={item.step} style={styles.removalStepRow}>
              <View style={styles.removalStepCircle}>
                <Text style={styles.removalStepNum}>{item.step}</Text>
              </View>
              <Text style={styles.removalStepText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Recommendation Card */}
        <View style={styles.recommendCard}>
          <Ionicons name="phone-portrait-outline" size={32} color={COLORS.gold} />
          <Text style={styles.recommendTitle}>새 기기로 교체가 가장 안전합니다</Text>
          <Text style={styles.recommendText}>
            스토커웨어가 깊이 설치된 경우 완전한 제거가 어려울 수 있습니다. 가능하다면 새 기기를
            구입하고, 이전 기기의 데이터를 수동으로 옮기는 것이 가장 안전합니다.
          </Text>
          <View style={styles.recommendTipRow}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
            <Text style={styles.recommendTipText}>
              새 기기에서는 반드시 2단계 인증을 설정하세요.
            </Text>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.navy,
    paddingTop: SPACING.xl,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
  },

  // Warning Banner
  warningBanner: {
    backgroundColor: '#2D1B1B',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.danger,
  },
  warningIconRow: {
    marginBottom: SPACING.sm,
  },
  warningTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.danger,
    marginBottom: SPACING.xs,
  },
  warningText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#FF9B8A',
    textAlign: 'center',
    lineHeight: 22,
  },
  warningSubtext: {
    fontSize: FONT_SIZE.sm,
    color: '#CCA09A',
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 18,
  },

  // Section
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },

  // Sign Cards
  signCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
    overflow: 'hidden',
  },
  signHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  signIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.coral + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signTextArea: {
    flex: 1,
  },
  signTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  signDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    marginTop: 2,
    lineHeight: 18,
  },
  signCheckMethod: {
    backgroundColor: COLORS.warmGray,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  signCheckMethodLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.gold,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  signCheckMethodText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    lineHeight: 20,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmGray,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tabActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  tabText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.slate,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  // Steps
  stepsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.gold,
  },
  stepText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 22,
  },

  // Removal
  removalCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  removalStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  removalStepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.coral + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  removalStepNum: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.coral,
  },
  removalStepText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 22,
  },

  // Recommendation
  recommendCard: {
    backgroundColor: COLORS.goldLight + '30',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
    marginBottom: SPACING.lg,
  },
  recommendTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.darkText,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  recommendText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: 20,
  },
  recommendTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    backgroundColor: COLORS.success + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  recommendTipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
});
