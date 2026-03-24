import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { DIGITAL_SECURITY_AUDIT } from '@/constants/stalking';

export default function DigitalSecurityScreen() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<number, boolean>>({});
  const scoreAnim = useRef(new Animated.Value(0)).current;

  const totalItems = DIGITAL_SECURITY_AUDIT.reduce((sum, p) => sum + p.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const scorePercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  useEffect(() => {
    Animated.timing(scoreAnim, {
      toValue: scorePercent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [scorePercent]);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePlatform = (index: number) => {
    setExpandedPlatforms((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getPlatformProgress = (platformIndex: number) => {
    const platform = DIGITAL_SECURITY_AUDIT[platformIndex];
    const done = platform.items.filter((item) => checkedItems[item.id]).length;
    return { done, total: platform.items.length };
  };

  const getScoreColor = () => {
    if (scorePercent >= 80) return COLORS.success;
    if (scorePercent >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  const animatedScoreText = scoreAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0', '100'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>디지털 보안 점검</Text>
        <View style={styles.headerBackButton} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircleOuter}>
            <View style={[styles.scoreCircleInner, { borderColor: getScoreColor() }]}>
              <Animated.Text style={[styles.scoreNumber, { color: getScoreColor() }]}>
                {scorePercent}
              </Animated.Text>
              <Text style={styles.scorePercent}>%</Text>
            </View>
          </View>
          <Text style={styles.scoreLabel}>보안 점수</Text>
          <Text style={styles.scoreSubtext}>
            {checkedCount}/{totalItems}개 항목 완료
          </Text>
          {scorePercent < 50 && (
            <View style={styles.scoreTip}>
              <Ionicons name="shield-half" size={16} color={COLORS.danger} />
              <Text style={styles.scoreTipText}>보안 수준이 낮습니다. 주요 항목부터 점검하세요.</Text>
            </View>
          )}
        </View>

        {/* Platform Sections */}
        {DIGITAL_SECURITY_AUDIT.map((platform, pIndex) => {
          const isExpanded = expandedPlatforms[pIndex] ?? false;
          const { done, total } = getPlatformProgress(pIndex);
          const hasUrgent = platform.items.some(
            (item) => item.priority === 'high' && !checkedItems[item.id],
          );

          return (
            <View key={pIndex} style={styles.platformCard}>
              <TouchableOpacity
                style={styles.platformHeader}
                onPress={() => togglePlatform(pIndex)}
                activeOpacity={0.7}
              >
                <View style={styles.platformLeft}>
                  <View style={[styles.platformIcon, { backgroundColor: platform.color + '18' }]}>
                    <Ionicons name={platform.icon as any} size={20} color={platform.color} />
                  </View>
                  <View>
                    <View style={styles.platformNameRow}>
                      <Text style={styles.platformName}>{platform.platform}</Text>
                      {hasUrgent && (
                        <View style={styles.urgentBadge}>
                          <Text style={styles.urgentBadgeText}>즉시 조치 필요</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.platformProgress}>
                      {done}/{total} 완료
                    </Text>
                  </View>
                </View>
                <View style={styles.platformRight}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${total > 0 ? (done / total) * 100 : 0}%`,
                          backgroundColor: done === total ? COLORS.success : COLORS.gold,
                        },
                      ]}
                    />
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={COLORS.slate}
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.platformItems}>
                  {platform.items.map((item) => {
                    const isChecked = checkedItems[item.id] ?? false;
                    const isHighPriority = item.priority === 'high' && !isChecked;
                    return (
                      <View
                        key={item.id}
                        style={[styles.checkItem, isHighPriority && styles.checkItemHighPriority]}
                      >
                        <View style={styles.checkItemLeft}>
                          {isHighPriority && (
                            <Ionicons
                              name="alert-circle"
                              size={16}
                              color={COLORS.danger}
                              style={{ marginRight: 4 }}
                            />
                          )}
                          <Text
                            style={[
                              styles.checkItemLabel,
                              isChecked && styles.checkItemLabelDone,
                            ]}
                          >
                            {item.label}
                          </Text>
                          {item.priority === 'high' && !isChecked && (
                            <View style={styles.priorityTag}>
                              <Text style={styles.priorityTagText}>중요</Text>
                            </View>
                          )}
                        </View>
                        <Switch
                          value={isChecked}
                          onValueChange={() => toggleItem(item.id)}
                          trackColor={{ false: COLORS.warmGray, true: COLORS.success + '60' }}
                          thumbColor={isChecked ? COLORS.success : '#f4f3f4'}
                        />
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
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

  // Score
  scoreCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOW.md,
  },
  scoreCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  scoreCircleInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.cardBg,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '900',
  },
  scorePercent: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    fontWeight: '600',
    marginTop: -4,
  },
  scoreLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  scoreSubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    marginTop: 2,
  },
  scoreTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    backgroundColor: COLORS.danger + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  scoreTipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    fontWeight: '600',
  },

  // Platform
  platformCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
    overflow: 'hidden',
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  platformLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  platformName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  urgentBadge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  urgentBadgeText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: '800',
  },
  platformProgress: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: 1,
  },
  platformRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressBarBg: {
    width: 50,
    height: 4,
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  platformItems: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  checkItemHighPriority: {
    backgroundColor: COLORS.danger + '06',
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  checkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkItemLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    fontWeight: '500',
    flex: 1,
  },
  checkItemLabelDone: {
    color: COLORS.lightText,
    textDecorationLine: 'line-through',
  },
  priorityTag: {
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
    marginLeft: 6,
  },
  priorityTagText: {
    fontSize: 9,
    color: COLORS.danger,
    fontWeight: '700',
  },
});
