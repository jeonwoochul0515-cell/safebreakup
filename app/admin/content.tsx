import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';

interface ContentSection {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: ContentItem[];
}

interface ContentItem {
  name: string;
  sub?: string;
  actions: string[];
}

const CONTENT_SECTIONS: ContentSection[] = [
  {
    key: 'legal',
    title: '법률 정보 관리',
    icon: 'book-outline',
    items: [
      { name: '스토킹처벌법 해설', sub: '2026.02 개정 반영', actions: ['수정'] },
      { name: '성폭력처벌법 안내', sub: '피해자 권리 중심', actions: ['수정'] },
      { name: '가정폭력방지법 가이드', sub: '보호명령 절차 포함', actions: ['수정'] },
      { name: '디지털 성범죄 대응법', sub: 'NCII/딥페이크 포함', actions: ['수정'] },
      { name: '데이트폭력 법적 대응', sub: '접근금지 가처분', actions: ['수정'] },
      { name: '경제적 학대 관련 법률', sub: '재산분할/부당이득', actions: ['수정'] },
    ],
  },
  {
    key: 'faq',
    title: 'FAQ 관리',
    icon: 'help-circle-outline',
    items: [
      { name: '경고장은 법적 효력이 있나요?', actions: ['수정', '삭제'] },
      { name: '스토킹 증거는 어떻게 수집하나요?', actions: ['수정', '삭제'] },
      { name: '접근금지 가처분 신청 방법', actions: ['수정', '삭제'] },
      { name: '경호 서비스 이용 절차', actions: ['수정', '삭제'] },
      { name: '증거 PDF는 법정에서 인정되나요?', actions: ['수정', '삭제'] },
      { name: '무료/라이트/케어 차이점', actions: ['수정', '삭제'] },
      { name: '개인정보 보호 정책', actions: ['수정', '삭제'] },
    ],
  },
  {
    key: 'therapist',
    title: '상담사 디렉토리',
    icon: 'people-outline',
    items: [
      { name: '김수연 상담사', sub: '트라우마 전문 / EMDR', actions: ['수정', '삭제'] },
      { name: '이지현 상담사', sub: '가스라이팅 회복 전문', actions: ['수정', '삭제'] },
      { name: '박민서 상담사', sub: '데이트폭력 피해 상담', actions: ['수정', '삭제'] },
      { name: '최유진 상담사', sub: '디지털 성범죄 피해 지원', actions: ['수정', '삭제'] },
      { name: '정하은 상담사', sub: '이별 후 심리 회복', actions: ['수정', '삭제'] },
    ],
  },
  {
    key: 'safePlaces',
    title: '안전장소',
    icon: 'location-outline',
    items: [
      { name: '서울 여성긴급전화 1366', sub: '24시간 운영', actions: ['추가', '수정'] },
      { name: '한국여성의전화 상담소', sub: '서울 마포구', actions: ['추가', '수정'] },
      { name: '해바라기센터 (서울)', sub: '성폭력 원스톱 지원', actions: ['추가', '수정'] },
      { name: '여성긴급피난처 (비공개)', sub: '위치 비공개', actions: ['추가', '수정'] },
      { name: '디지털성범죄피해자지원센터', sub: '여성가족부', actions: ['추가', '수정'] },
    ],
  },
  {
    key: 'escort',
    title: '경호 서비스 플랜',
    icon: 'shield-outline',
    items: [
      { name: '안전동행 플랜', sub: '150,000원 / 2시간', actions: ['가격 수정'] },
      { name: '완전보호 플랜', sub: '350,000원 / 4시간', actions: ['가격 수정'] },
      { name: '이사보호 플랜', sub: '500,000원 / 8시간', actions: ['가격 수정'] },
      { name: '긴급출동 플랜', sub: '200,000원 / 즉시', actions: ['가격 수정'] },
    ],
  },
];

export default function ContentScreen() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['legal'])
  );

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleAction = (action: string, itemName: string) => {
    Alert.alert(
      `${action}`,
      `"${itemName}" 항목을 ${action}하시겠습니까?\n\n이 기능은 추후 구현됩니다.`,
      [{ text: '확인' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>콘텐츠 관리</Text>
          <Text style={styles.headerSub}>
            법률 정보, FAQ, 상담사, 안전장소, 서비스 플랜
          </Text>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color={COLORS.warning} />
          <Text style={styles.warningText}>
            콘텐츠 변경 시 김창희 변호사 검토 필요
          </Text>
        </View>

        {/* Content Sections */}
        <View style={styles.sectionList}>
          {CONTENT_SECTIONS.map((section) => {
            const isExpanded = expandedSections.has(section.key);
            return (
              <View key={section.key} style={styles.sectionCard}>
                {/* Section Header */}
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(section.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sectionHeaderLeft}>
                    <View style={styles.sectionIcon}>
                      <Ionicons
                        name={section.icon}
                        size={20}
                        color={COLORS.navy}
                      />
                    </View>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>
                        {section.items.length}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.slate}
                  />
                </TouchableOpacity>

                {/* Expanded Items */}
                {isExpanded && (
                  <View style={styles.itemList}>
                    {section.items.map((item, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.itemRow,
                          idx < section.items.length - 1 && styles.itemBorder,
                        ]}
                      >
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          {item.sub && (
                            <Text style={styles.itemSub}>{item.sub}</Text>
                          )}
                        </View>
                        <View style={styles.itemActions}>
                          {item.actions.map((action) => (
                            <TouchableOpacity
                              key={action}
                              style={[
                                styles.actionBtn,
                                action === '삭제' && styles.actionBtnDanger,
                              ]}
                              onPress={() => handleAction(action, item.name)}
                            >
                              <Text
                                style={[
                                  styles.actionBtnText,
                                  action === '삭제' &&
                                    styles.actionBtnTextDanger,
                                ]}
                              >
                                {action}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
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

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.warning + '15',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  warningText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    fontWeight: '700',
    flex: 1,
  },

  // Section List
  sectionList: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  sectionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.lavender,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  countBadge: {
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Items
  itemList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  itemName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  itemSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.navy + '10',
    borderWidth: 1,
    borderColor: COLORS.navy + '20',
  },
  actionBtnDanger: {
    backgroundColor: COLORS.coral + '10',
    borderColor: COLORS.coral + '30',
  },
  actionBtnText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.navy,
  },
  actionBtnTextDanger: {
    color: COLORS.coral,
  },
});
