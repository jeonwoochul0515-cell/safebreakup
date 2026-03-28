import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { MASKING_OPTIONS } from '@/constants/consent';
import type { MaskingOption } from '@/constants/consent';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ComplaintPreviewProps {
  complaintText: string;
  onDownloadPDF: () => void;
  onEdit: () => void;
  maskingLevel: MaskingOption['level'];
  onMaskingChange: (level: MaskingOption['level']) => void;
}

// ─── 섹션 파싱 헬퍼 ─────────────────────────────────────────────────────────

interface Section {
  title: string;
  content: string;
}

function parseSections(text: string): Section[] {
  // "## 제목" 또는 "【제목】" 패턴으로 섹션 분리
  const sectionRegex = /(?:^|\n)(?:##\s*|【)(.+?)(?:】|\n)/g;
  const sections: Section[] = [];
  let lastIndex = 0;
  let lastTitle = '';
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = sectionRegex.exec(text)) !== null) {
    if (lastTitle) {
      sections.push({
        title: lastTitle,
        content: text.substring(lastIndex, match.index).trim(),
      });
    }
    lastTitle = match[1].trim();
    lastIndex = match.index + match[0].length;
  }

  if (lastTitle) {
    sections.push({
      title: lastTitle,
      content: text.substring(lastIndex).trim(),
    });
  }

  // 섹션 구분자가 없으면 전체를 하나의 섹션으로
  if (sections.length === 0) {
    sections.push({
      title: '고소장 전문',
      content: text,
    });
  }

  return sections;
}

// ─── 면책 고지 ──────────────────────────────────────────────────────────────

const DISCLAIMER =
  '본 고소장 초안은 AI에 의해 자동 생성된 것으로, 법률 전문가의 검토를 권장합니다. ' +
  '안전이별은 법률 자문을 제공하지 않으며, 본 문서의 사용으로 인한 결과에 대해 책임지지 않습니다. ' +
  '최종 제출 전 반드시 변호사의 확인을 받으시기 바랍니다.';

// ─── 컴포넌트 ───────────────────────────────────────────────────────────────

export default function ComplaintPreview({
  complaintText,
  onDownloadPDF,
  onEdit,
  maskingLevel,
  onMaskingChange,
}: ComplaintPreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0]), // 첫 번째 섹션은 기본 펼침
  );

  const sections = parseSections(complaintText);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const currentMasking = MASKING_OPTIONS.find((m) => m.level === maskingLevel);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Ionicons name="document-text" size={24} color={COLORS.gold} />
        <Text style={styles.headerTitle}>고소장 미리보기</Text>
      </View>

      {/* 마스킹 설정 */}
      <View style={styles.maskingCard}>
        <View style={styles.maskingHeader}>
          <Ionicons name="eye-off-outline" size={18} color={COLORS.navy} />
          <Text style={styles.maskingTitle}>개인정보 마스킹</Text>
        </View>

        <View style={styles.maskingOptions}>
          {MASKING_OPTIONS.map((option) => {
            const isActive = maskingLevel === option.level;
            return (
              <TouchableOpacity
                key={option.level}
                style={[
                  styles.maskingOption,
                  isActive && styles.maskingOptionActive,
                ]}
                onPress={() => onMaskingChange(option.level)}
                activeOpacity={0.7}
              >
                <View style={styles.maskingOptionHeader}>
                  <View
                    style={[
                      styles.maskingRadio,
                      isActive && styles.maskingRadioActive,
                    ]}
                  >
                    {isActive && <View style={styles.maskingRadioDot} />}
                  </View>
                  <Text
                    style={[
                      styles.maskingOptionLabel,
                      isActive && styles.maskingOptionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
                <Text style={styles.maskingOptionDesc}>{option.description}</Text>
                <Text style={styles.maskingExample}>
                  예: {option.example_name} / {option.example_phone}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 섹션별 고소장 내용 */}
      <View style={styles.sectionsContainer}>
        {sections.map((section, index) => {
          const isExpanded = expandedSections.has(index);
          return (
            <View key={index} style={styles.sectionCard}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(index)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                  size={18}
                  color={COLORS.gold}
                />
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Ionicons
                  name={isExpanded ? 'remove-circle-outline' : 'add-circle-outline'}
                  size={18}
                  color={COLORS.lightText}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionText} selectable>
                    {section.content}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* 액션 버튼 */}
      <View style={styles.actionButtons}>
        {/* PDF 다운로드 */}
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={onDownloadPDF}
          activeOpacity={0.7}
        >
          <Ionicons
            name="download-outline"
            size={22}
            color={COLORS.white}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.downloadBtnText}>PDF 다운로드</Text>
        </TouchableOpacity>

        {/* 수정하기 */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={COLORS.gold}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.editBtnText}>수정하기</Text>
        </TouchableOpacity>
      </View>

      {/* 면책 고지 */}
      <View style={styles.disclaimerCard}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={COLORS.slate}
          style={{ marginRight: SPACING.sm, marginTop: 2 }}
        />
        <Text style={styles.disclaimerText}>{DISCLAIMER}</Text>
      </View>

      {/* 법률사무소 푸터 */}
      <Text style={styles.footerText}>
        법률사무소 청송 / 대표변호사 김창희
      </Text>
    </ScrollView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  headerTitle: {
    color: COLORS.navy,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },

  // Masking card
  maskingCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  maskingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  maskingTitle: {
    color: COLORS.navy,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  maskingOptions: {
    gap: SPACING.sm,
  },
  maskingOption: {
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  maskingOptionActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FAF3ED',
  },
  maskingOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  maskingRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.lightText,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  maskingRadioActive: {
    borderColor: COLORS.gold,
  },
  maskingRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },
  maskingOptionLabel: {
    color: COLORS.darkText,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  maskingOptionLabelActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  maskingOptionDesc: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.sm,
    marginLeft: 26,
    marginBottom: SPACING.xs,
  },
  maskingExample: {
    color: COLORS.lightText,
    fontSize: FONT_SIZE.xs,
    marginLeft: 26,
    fontStyle: 'italic',
  },

  // Sections
  sectionsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sectionCard: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    flex: 1,
    color: COLORS.navy,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  sectionContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  sectionText: {
    color: COLORS.darkText,
    fontSize: FONT_SIZE.sm,
    lineHeight: 22,
    paddingTop: SPACING.md,
  },

  // Action buttons
  actionButtons: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md + 4,
    ...SHADOW.md,
  },
  downloadBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  editBtnText: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },

  // Disclaimer
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  disclaimerText: {
    flex: 1,
    color: COLORS.slate,
    fontSize: FONT_SIZE.xs,
    lineHeight: 18,
  },

  // Footer
  footerText: {
    color: COLORS.lightText,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
});
