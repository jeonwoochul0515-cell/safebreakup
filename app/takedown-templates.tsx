import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { PLATFORM_TAKEDOWN_INFO } from '@/constants/ncii';

type DamageType = '불법촬영물 유포' | '딥페이크' | '리벤지 포르노' | '사진 합성' | '기타';

const DAMAGE_TYPES: DamageType[] = [
  '불법촬영물 유포',
  '딥페이크',
  '리벤지 포르노',
  '사진 합성',
  '기타',
];

function generateTemplate(
  platform: (typeof PLATFORM_TAKEDOWN_INFO)[number],
  damageType: string,
  contentUrl: string,
  description: string,
): string {
  return `[삭제 요청서 / Takedown Request]

수신: ${platform.platform} 신고 담당
To: ${platform.platform} Trust & Safety Team

1. 피해 유형 / Type of Violation:
비동의 친밀 이미지 유포 (${damageType})
Non-Consensual Intimate Image (${damageType})

2. 콘텐츠 URL / Content URL:
${contentUrl || '(URL을 입력해주세요)'}

3. 피해 설명 / Description:
${description || '(피해 내용을 작성해주세요)'}

본인은 위 콘텐츠의 피해자로서, 해당 콘텐츠는 본인의 동의 없이 촬영/생성/유포된 것임을 확인합니다. 대한민국 성폭력처벌법 및 정보통신망법에 따라 즉각적인 삭제를 요청합니다.

I am the victim depicted in the above content. This content was created/distributed without my consent. I request immediate removal pursuant to Korean Sexual Violence Prevention Act and applicable platform policies.

4. 법적 근거 / Legal Basis:
- 성폭력범죄의 처벌 등에 관한 특례법 제14조, 제14조의2
- Sexual Violence Prevention and Victims Protection Act, Articles 14, 14-2
- 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제44조의7
- Act on Promotion of Information and Communications Network Utilization and Information Protection, Article 44-7

감사합니다. / Thank you.`;
}

export default function TakedownTemplatesScreen() {
  const [selectedPlatformIdx, setSelectedPlatformIdx] = useState<number | null>(null);
  const [damageType, setDamageType] = useState<DamageType>('불법촬영물 유포');
  const [contentUrl, setContentUrl] = useState('');
  const [description, setDescription] = useState('');
  const [showTemplate, setShowTemplate] = useState(false);

  const selectedPlatform = selectedPlatformIdx !== null ? PLATFORM_TAKEDOWN_INFO[selectedPlatformIdx] : null;

  const handleCopy = () => {
    Alert.alert('복사 완료', '삭제 요청서가 클립보드에 복사되었습니다.');
  };

  const handleGenerate = () => {
    setShowTemplate(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>삭제요청 템플릿</Text>
        <View style={styles.headerBackBtn} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Reviewer badge */}
        <View style={styles.reviewerBadge}>
          <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
          <Text style={styles.reviewerBadgeText}>검토: 김창희 변호사</Text>
        </View>

        <Text style={styles.pageTitle}>플랫폼별 삭제 요청</Text>
        <Text style={styles.pageSubtitle}>
          플랫폼을 선택하고, 정보를 입력하면 한국어/영문 삭제 요청서가 생성됩니다.
        </Text>

        {/* Platform Grid */}
        <View style={styles.platformGrid}>
          {PLATFORM_TAKEDOWN_INFO.map((p, i) => {
            const isSelected = selectedPlatformIdx === i;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.platformCard, isSelected && styles.platformCardSelected]}
                onPress={() => {
                  setSelectedPlatformIdx(i);
                  setShowTemplate(false);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.platformIconWrap, { backgroundColor: p.color + '18' }]}>
                  <Ionicons name={p.icon as any} size={22} color={p.color} />
                </View>
                <Text
                  style={[styles.platformName, isSelected && styles.platformNameSelected]}
                  numberOfLines={2}
                >
                  {p.platform}
                </Text>
                {isSelected && (
                  <View style={styles.selectedDot}>
                    <Ionicons name="checkmark" size={10} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected platform details & form */}
        {selectedPlatform && (
          <View style={styles.formSection}>
            {/* Platform info */}
            <View style={styles.platformInfoCard}>
              <View style={styles.platformInfoRow}>
                <Ionicons name="time" size={16} color={COLORS.blue} />
                <Text style={styles.platformInfoLabel}>예상 처리시간:</Text>
                <Text style={styles.platformInfoValue}>{selectedPlatform.estimatedTime}</Text>
              </View>
              <Text style={styles.platformProcessText}>{selectedPlatform.process}</Text>
              <View style={styles.requiredInfoWrap}>
                <Text style={styles.requiredInfoTitle}>필요 정보:</Text>
                {selectedPlatform.requiredInfo.map((info, i) => (
                  <View key={i} style={styles.requiredInfoItem}>
                    <Ionicons name="ellipse" size={5} color={COLORS.slate} />
                    <Text style={styles.requiredInfoText}>{info}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Form */}
            <Text style={styles.formLabel}>피해 유형</Text>
            <View style={styles.damageTypeRow}>
              {DAMAGE_TYPES.map((dt) => (
                <TouchableOpacity
                  key={dt}
                  style={[
                    styles.damageChip,
                    damageType === dt && styles.damageChipSelected,
                  ]}
                  onPress={() => setDamageType(dt)}
                >
                  <Text
                    style={[
                      styles.damageChipText,
                      damageType === dt && styles.damageChipTextSelected,
                    ]}
                  >
                    {dt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>콘텐츠 URL</Text>
            <TextInput
              style={styles.textInput}
              value={contentUrl}
              onChangeText={setContentUrl}
              placeholder="https://..."
              placeholderTextColor={COLORS.lightText}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.formLabel}>피해 설명</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="피해 상황을 간략히 설명해주세요..."
              placeholderTextColor={COLORS.lightText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Generate button */}
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGenerate}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text" size={18} color={COLORS.white} />
              <Text style={styles.generateBtnText}>삭제 요청서 생성</Text>
            </TouchableOpacity>

            {/* Template output */}
            {showTemplate && (
              <View style={styles.templateCard}>
                <Text style={styles.templateTitle}>생성된 삭제 요청서</Text>
                <View style={styles.templateBody}>
                  <Text style={styles.templateText}>
                    {generateTemplate(selectedPlatform, damageType, contentUrl, description)}
                  </Text>
                </View>

                <View style={styles.templateActions}>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={handleCopy}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="copy" size={16} color={COLORS.white} />
                    <Text style={styles.copyBtnText}>복사하기</Text>
                  </TouchableOpacity>

                  {selectedPlatform.reportUrl ? (
                    <TouchableOpacity
                      style={styles.linkBtn}
                      onPress={() => Linking.openURL(selectedPlatform.reportUrl)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="open" size={16} color={COLORS.blue} />
                      <Text style={styles.linkBtnText}>신고 페이지</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          이 템플릿은 일반적인 안내이며, 법률 조언을 대체할 수 없습니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.navy,
  },
  headerBackBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white },

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },

  reviewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  reviewerBadgeText: { fontSize: FONT_SIZE.xs, color: COLORS.gold, fontWeight: '600' },

  pageTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  pageSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },

  // Platform grid
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  platformCard: {
    width: '47%' as any,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOW.sm,
  },
  platformCardSelected: {
    borderColor: COLORS.gold,
    borderWidth: 2,
    backgroundColor: '#FDF5F3',
  },
  platformIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  platformName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
    textAlign: 'center',
  },
  platformNameSelected: { color: COLORS.gold, fontWeight: '700' },
  selectedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Platform info
  formSection: { marginBottom: SPACING.lg },
  platformInfoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.blue,
    ...SHADOW.sm,
  },
  platformInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  platformInfoLabel: { fontSize: FONT_SIZE.sm, color: COLORS.slate, fontWeight: '600' },
  platformInfoValue: { fontSize: FONT_SIZE.sm, color: COLORS.blue, fontWeight: '700' },
  platformProcessText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  requiredInfoWrap: { marginTop: SPACING.xs },
  requiredInfoTitle: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.slate, marginBottom: 4 },
  requiredInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  requiredInfoText: { fontSize: FONT_SIZE.xs, color: COLORS.darkText },

  // Form
  formLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  damageTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  damageChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.cardBg,
  },
  damageChipSelected: {
    backgroundColor: COLORS.coral,
    borderColor: COLORS.coral,
  },
  damageChipText: { fontSize: FONT_SIZE.sm, color: COLORS.darkText, fontWeight: '500' },
  damageChipTextSelected: { color: COLORS.white, fontWeight: '700' },

  textInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
  },
  textArea: {
    minHeight: 100,
  },

  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.lg,
  },
  generateBtnText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white },

  // Template
  templateCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    ...SHADOW.md,
  },
  templateTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  templateBody: {
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  templateText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.darkText,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  templateActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
  },
  copyBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.white },
  linkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.blue + '15',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
  },
  linkBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.blue },

  disclaimer: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    lineHeight: 18,
    marginTop: SPACING.lg,
  },
});
