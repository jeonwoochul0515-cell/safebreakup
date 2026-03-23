import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { SAFETY_CHECKLIST, LEGAL } from '@/constants/legal';

// Category metadata: icons and display order
const CATEGORY_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  '증거 확보': { icon: 'camera-outline', color: COLORS.coral },
  '법적 준비': { icon: 'document-text-outline', color: COLORS.blue },
  '안전 확보': { icon: 'shield-checkmark-outline', color: COLORS.sage },
  '디지털 안전': { icon: 'lock-closed-outline', color: '#8b5cf6' },
  '재정': { icon: 'wallet-outline', color: COLORS.warning },
};

const CATEGORY_ORDER = ['증거 확보', '법적 준비', '안전 확보', '디지털 안전', '재정'];

// Icon mapping from checklist item icon names to Ionicons
const ITEM_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  camera: 'camera-outline',
  mic: 'mic-outline',
  image: 'image-outline',
  mail: 'mail-outline',
  shield: 'shield-outline',
  ban: 'close-circle-outline',
  home: 'home-outline',
  users: 'people-outline',
  lock: 'lock-closed-outline',
  'map-pin': 'location-outline',
  key: 'key-outline',
  'dollar-sign': 'card-outline',
};

// Group checklist by category
function groupByCategory() {
  const groups: Record<string, typeof SAFETY_CHECKLIST> = {};
  for (const item of SAFETY_CHECKLIST) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }
  return groups;
}

export default function ChecklistScreen() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const checkAnimations = useRef<Record<number, Animated.Value>>({});
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const celebrateScale = useRef(new Animated.Value(0.8)).current;

  const totalItems = SAFETY_CHECKLIST.length;
  const completedCount = checked.size;
  const allComplete = completedCount === totalItems;
  const progress = completedCount / totalItems;
  const grouped = groupByCategory();

  // Initialize animations for each item
  useEffect(() => {
    for (const item of SAFETY_CHECKLIST) {
      if (!checkAnimations.current[item.id]) {
        checkAnimations.current[item.id] = new Animated.Value(0);
      }
    }
  }, []);

  // Celebration animation
  useEffect(() => {
    if (allComplete) {
      Animated.parallel([
        Animated.timing(celebrateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(celebrateScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      celebrateAnim.setValue(0);
      celebrateScale.setValue(0.8);
    }
  }, [allComplete, celebrateAnim, celebrateScale]);

  const toggleItem = useCallback((id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      const isChecking = !next.has(id);
      if (isChecking) {
        next.add(id);
      } else {
        next.delete(id);
      }

      // Animate checkbox
      const anim = checkAnimations.current[id];
      if (anim) {
        Animated.spring(anim, {
          toValue: isChecking ? 1 : 0,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }).start();
      }

      return next;
    });
  }, []);

  const getCategoryCompletion = (category: string) => {
    const items = grouped[category] || [];
    const done = items.filter((i) => checked.has(i.id)).length;
    return { done, total: items.length };
  };

  // Determine unchecked categories for action recommendations
  const uncheckedCategories = CATEGORY_ORDER.filter((cat) => {
    const { done, total } = getCategoryCompletion(cat);
    return done < total;
  });

  const handleSave = () => {
    Alert.alert(
      '체크리스트 저장',
      'PDF 저장 기능은 출시 후 제공됩니다.',
      [{ text: '확인', style: 'default' }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>안전 이별 체크리스트</Text>
        <View style={styles.headerBackButton} />
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {completedCount}/{totalItems} 완료
          </Text>
          <View style={styles.reviewerBadge}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
            <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Banner */}
        {allComplete && (
          <Animated.View
            style={[
              styles.celebrationBanner,
              {
                opacity: celebrateAnim,
                transform: [{ scale: celebrateScale }],
              },
            ]}
          >
            <Ionicons name="ribbon-outline" size={32} color={COLORS.gold} />
            <Text style={styles.celebrationTitle}>
              모든 항목을 확인했어요!
            </Text>
            <Text style={styles.celebrationSubtext}>
              다음 단계로 진행해보세요.
            </Text>
          </Animated.View>
        )}

        {/* Category Sections */}
        {CATEGORY_ORDER.map((category) => {
          const items = grouped[category] || [];
          const meta = CATEGORY_META[category];
          const { done, total } = getCategoryCompletion(category);
          const categoryComplete = done === total;

          return (
            <View key={category} style={styles.categorySection}>
              {/* Category Header */}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryHeaderLeft}>
                  <View style={[styles.categoryIconWrap, { backgroundColor: meta.color + '18' }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                  </View>
                  <Text style={styles.categoryTitle}>{category}</Text>
                </View>
                <View style={[
                  styles.categoryCountBadge,
                  categoryComplete && styles.categoryCountBadgeComplete,
                ]}>
                  <Text style={[
                    styles.categoryCountText,
                    categoryComplete && styles.categoryCountTextComplete,
                  ]}>
                    {done}/{total}
                  </Text>
                </View>
              </View>

              {/* Checklist Items */}
              {items.map((item) => {
                const isChecked = checked.has(item.id);
                const anim = checkAnimations.current[item.id] || new Animated.Value(0);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.checklistRow,
                      isChecked && styles.checklistRowChecked,
                    ]}
                    onPress={() => toggleItem(item.id)}
                    activeOpacity={0.7}
                  >
                    {/* Custom Checkbox */}
                    <Animated.View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['transparent', COLORS.gold],
                          }),
                          borderColor: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [COLORS.borderLight, COLORS.gold],
                          }),
                          transform: [
                            {
                              scale: anim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [1, 1.15, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      {isChecked && (
                        <Ionicons name="checkmark" size={14} color={COLORS.white} />
                      )}
                    </Animated.View>

                    {/* Item Icon + Text */}
                    <View style={styles.checklistTextWrap}>
                      <Ionicons
                        name={ITEM_ICON_MAP[item.icon] || 'ellipse-outline'}
                        size={16}
                        color={isChecked ? COLORS.gold : COLORS.slate}
                        style={styles.itemIcon}
                      />
                      <Text
                        style={[
                          styles.checklistText,
                          isChecked && styles.checklistTextChecked,
                        ]}
                      >
                        {item.text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {/* Action Recommendations */}
        {!allComplete && (
          <View style={styles.actionsSection}>
            <Text style={styles.actionsSectionTitle}>추천 다음 단계</Text>

            {uncheckedCategories.includes('증거 확보') && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/(tabs)/evidence')}
                activeOpacity={0.7}
              >
                <View style={styles.actionButtonLeft}>
                  <View style={[styles.actionIconWrap, { backgroundColor: COLORS.coral + '18' }]}>
                    <Ionicons name="camera-outline" size={18} color={COLORS.coral} />
                  </View>
                  <View>
                    <Text style={styles.actionButtonTitle}>증거보관함으로 이동</Text>
                    <Text style={styles.actionButtonSub}>대화, 사진 등 증거를 안전하게 보관하세요</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.slate} />
              </TouchableOpacity>
            )}

            {uncheckedCategories.includes('법적 준비') && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/(tabs)/legal-info')}
                activeOpacity={0.7}
              >
                <View style={styles.actionButtonLeft}>
                  <View style={[styles.actionIconWrap, { backgroundColor: COLORS.blue + '18' }]}>
                    <Ionicons name="document-text-outline" size={18} color={COLORS.blue} />
                  </View>
                  <View>
                    <Text style={styles.actionButtonTitle}>법률 경고장 알아보기</Text>
                    <Text style={styles.actionButtonSub}>변호사 명의 법률 경고장 발송 안내</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.slate} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Save / Download Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Ionicons name="download-outline" size={20} color={COLORS.white} />
          <Text style={styles.saveButtonText}>체크리스트 저장하기</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerFirm}>{LEGAL.firmFull}</Text>
          <Text style={styles.footerDisclaimer}>{LEGAL.disclaimer}</Text>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  // Progress
  progressSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  reviewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold + '14',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  reviewerBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.gold,
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
  },

  // Scroll
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Celebration
  celebrationBanner: {
    backgroundColor: COLORS.gold + '14',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  celebrationTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.gold,
    marginTop: SPACING.sm,
  },
  celebrationSubtext: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    marginTop: SPACING.xs,
  },

  // Category
  categorySection: {
    marginBottom: SPACING.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  categoryCountBadge: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  categoryCountBadgeComplete: {
    backgroundColor: COLORS.gold + '20',
  },
  categoryCountText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.slate,
  },
  categoryCountTextComplete: {
    color: COLORS.gold,
  },

  // Checklist Row
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOW.sm,
  },
  checklistRowChecked: {
    backgroundColor: '#fdfbf5',
    borderColor: COLORS.gold + '40',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checklistTextWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: SPACING.sm,
  },
  checklistText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.darkText,
  },
  checklistTextChecked: {
    color: COLORS.slate,
    textDecorationLine: 'line-through',
  },

  // Action Recommendations
  actionsSection: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionsSectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOW.sm,
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  actionButtonSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginTop: 1,
  },

  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  saveButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  footerFirm: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.slate,
    marginBottom: SPACING.xs,
  },
  footerDisclaimer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: 18,
  },
});
