import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { LEGAL } from '@/constants/legal';

type LetterType = 'email' | 'mail';

const LETTER_OPTIONS = [
  {
    id: 'email' as LetterType,
    title: '법률 경고장 (이메일/SNS)',
    price: 49000,
    priceLabel: '49,000원',
    description: '이메일 또는 SNS로 변호사 명의 경고장 발송',
    delivery: '1-2 영업일',
    recommended: false,
  },
  {
    id: 'mail' as LetterType,
    title: '내용증명 (우편)',
    price: 99000,
    priceLabel: '99,000원',
    description: '우편으로 내용증명 발송 (법적 효력)',
    delivery: '3-5 영업일',
    recommended: true,
  },
];

const DEMAND_OPTIONS = [
  { id: 'stop_contact', label: '연락 중단 요청' },
  { id: 'no_approach', label: '접근 금지 요청' },
  { id: 'delete_media', label: '사진/영상 삭제 요청' },
  { id: 'return_money', label: '금전 반환 요청' },
  { id: 'other', label: '기타' },
];

const PROCESS_STEPS = [
  { label: '신청', icon: 'document-text-outline' as const },
  { label: '변호사 검토', icon: 'person-outline' as const },
  { label: '경고장 작성', icon: 'create-outline' as const },
  { label: '발송', icon: 'send-outline' as const },
  { label: '확인서 전달', icon: 'checkmark-circle-outline' as const },
];

export default function LetterScreen() {
  const [selectedType, setSelectedType] = useState<LetterType>('email');
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [situation, setSituation] = useState('');
  const [selectedDemands, setSelectedDemands] = useState<Set<string>>(new Set());

  const selectedOption = LETTER_OPTIONS.find((o) => o.id === selectedType)!;

  const contactLabel =
    selectedType === 'mail' ? '주소' : '연락처 (이메일 또는 SNS 계정)';
  const contactPlaceholder =
    selectedType === 'mail'
      ? '우편 수령 가능한 주소를 입력해주세요'
      : '이메일 주소 또는 SNS 계정을 입력해주세요';

  const toggleDemand = (id: string) => {
    setSelectedDemands((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    Alert.alert(
      '서비스 준비 중',
      '서비스 출시 준비 중입니다. 카카오톡 채널을 통해 먼저 상담받으실 수 있습니다.',
      [{ text: '확인' }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBackButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>법률 경고장 신청</Text>
          </View>
          <View style={styles.headerBackButton} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            변호사 명의로 발송되는 공식 법적 경고
          </Text>

          {/* Letter Type Selection */}
          <Text style={styles.sectionTitle}>발송 유형 선택</Text>
          <View style={styles.typeCardsRow}>
            {LETTER_OPTIONS.map((option) => {
              const isSelected = selectedType === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.typeCard,
                    isSelected && styles.typeCardSelected,
                  ]}
                  onPress={() => setSelectedType(option.id)}
                  activeOpacity={0.7}
                >
                  {option.recommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>추천</Text>
                    </View>
                  )}
                  {isSelected && (
                    <View style={styles.checkmarkBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={COLORS.gold}
                      />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.typeCardTitle,
                      isSelected && styles.typeCardTitleSelected,
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Text style={styles.typeCardPrice}>{option.priceLabel}</Text>
                  <Text style={styles.typeCardDesc}>{option.description}</Text>
                  <View style={styles.deliveryRow}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={COLORS.slate}
                    />
                    <Text style={styles.deliveryText}>
                      {option.delivery}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Recipient Info */}
          <Text style={styles.sectionTitle}>상대방 정보</Text>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>이름</Text>
            <TextInput
              style={styles.textInput}
              value={recipientName}
              onChangeText={setRecipientName}
              placeholder="상대방 이름을 입력해주세요"
              placeholderTextColor={COLORS.lightText}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>{contactLabel}</Text>
            <TextInput
              style={styles.textInput}
              value={recipientContact}
              onChangeText={setRecipientContact}
              placeholder={contactPlaceholder}
              placeholderTextColor={COLORS.lightText}
              autoCapitalize="none"
              keyboardType={
                selectedType === 'mail' ? 'default' : 'email-address'
              }
            />
          </View>

          {/* Situation */}
          <Text style={styles.sectionTitle}>상황 설명</Text>
          <View style={styles.formGroup}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={situation}
              onChangeText={setSituation}
              placeholder="어떤 상황인지 간단히 설명해주세요"
              placeholderTextColor={COLORS.lightText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Demands */}
          <Text style={styles.sectionTitle}>요구사항</Text>
          <View style={styles.demandsContainer}>
            {DEMAND_OPTIONS.map((demand) => {
              const isChecked = selectedDemands.has(demand.id);
              return (
                <TouchableOpacity
                  key={demand.id}
                  style={styles.demandRow}
                  onPress={() => toggleDemand(demand.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isChecked && styles.checkboxChecked,
                    ]}
                  >
                    {isChecked && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={COLORS.white}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.demandLabel,
                      isChecked && styles.demandLabelChecked,
                    ]}
                  >
                    {demand.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Process Steps */}
          <Text style={styles.sectionTitle}>진행 절차</Text>
          <View style={styles.processCard}>
            <View style={styles.stepsRow}>
              {PROCESS_STEPS.map((step, index) => (
                <React.Fragment key={step.label}>
                  <View style={styles.stepItem}>
                    <View style={styles.stepIconCircle}>
                      <Ionicons
                        name={step.icon}
                        size={18}
                        color={COLORS.gold}
                      />
                    </View>
                    <Text style={styles.stepLabel}>{step.label}</Text>
                  </View>
                  {index < PROCESS_STEPS.length - 1 && (
                    <View style={styles.stepArrowContainer}>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color={COLORS.lightText}
                      />
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>
            <View style={styles.processNote}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={COLORS.gold}
              />
              <Text style={styles.processNoteText}>
                모든 경고장은 김창희 변호사가 직접 검토합니다
              </Text>
            </View>
          </View>

          {/* Legal Footer Note */}
          <View style={styles.legalFooter}>
            <Text style={styles.legalFirmText}>{LEGAL.firmFull}</Text>
            <Text style={styles.legalNoteText}>
              우편 발송만 '내용증명'이며, 이메일/SNS 발송은 '변호사 명의 법률
              경고장'입니다.
            </Text>
          </View>
        </ScrollView>

        {/* CTA Button */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={20} color={COLORS.white} />
            <Text style={styles.ctaText}>
              신청하기 - {selectedOption.priceLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  // Scroll
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  // Section
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },

  // Type Cards
  typeCardsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    position: 'relative',
    ...SHADOW.sm,
  },
  typeCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: '#fdfbf5',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderTopRightRadius: RADIUS.md - 2,
    borderBottomLeftRadius: RADIUS.sm,
  },
  recommendedText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
  },
  typeCardTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  typeCardTitleSelected: {
    color: COLORS.darkText,
  },
  typeCardPrice: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  typeCardDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
  },

  // Form
  formGroup: {
    marginBottom: SPACING.sm,
  },
  formLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SPACING.sm + 4,
  },

  // Demands
  demandsContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    gap: SPACING.sm + 4,
  },
  demandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.sm - 2,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  demandLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
  },
  demandLabelChecked: {
    fontWeight: '600',
  },

  // Process Steps
  processCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    rowGap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  stepItem: {
    alignItems: 'center',
    width: 52,
  },
  stepIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.darkText,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepArrowContainer: {
    paddingHorizontal: 2,
    paddingBottom: 16,
  },
  processNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  processNoteText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    fontWeight: '600',
  },

  // Legal Footer
  legalFooter: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    alignItems: 'center',
  },
  legalFirmText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  legalNoteText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: 18,
  },

  // CTA
  ctaContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.cream,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...SHADOW.md,
  },
  ctaText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
});
