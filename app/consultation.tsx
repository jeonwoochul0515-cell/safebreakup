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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';

type ConsultationType = 'phone' | 'kakao' | 'visit' | null;
type TimeSlot = '오전' | '오후' | '저녁' | null;

const CONSULTATION_TYPES = [
  {
    id: 'phone' as const,
    title: '전화 상담',
    desc: '완전보호 플랜 포함 or 별도 문의',
    sub: '30분 기본',
    icon: 'call-outline' as const,
  },
  {
    id: 'kakao' as const,
    title: '카카오톡 채팅 상담',
    desc: '채널 추가 후 상담',
    sub: '실시간 채팅',
    icon: 'chatbubble-ellipses-outline' as const,
  },
  {
    id: 'visit' as const,
    title: '방문 상담',
    desc: '부산 사무실',
    sub: '대면 상담',
    icon: 'business-outline' as const,
  },
];

const TIME_SLOTS: TimeSlot[] = ['오전', '오후', '저녁'];

const NOTES = [
  '증거 자료를 미리 준비해주시면 더 정확한 상담이 가능합니다',
  '상담 내용은 변호사-의뢰인 비밀유지 의무가 적용됩니다',
];

export default function ConsultationScreen() {
  const [selectedType, setSelectedType] = useState<ConsultationType>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    Alert.alert(
      '안내',
      '서비스 출시 준비 중입니다. 카카오톡 채널을 통해 먼저 상담받으실 수 있습니다.',
      [{ text: '확인' }],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>변호사 상담</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Lawyer Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>김</Text>
                </View>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.lawyerName}>김창희 변호사</Text>
                <Text style={styles.lawyerTitle}>
                  법률사무소 청송 대표변호사
                </Text>
                <Text style={styles.lawyerExperience}>
                  경력 10년 | 데이트폭력·스토킹 전문
                </Text>
                <View style={styles.ratingRow}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ionicons
                        key={i}
                        name={i <= 4 ? 'star' : 'star-half'}
                        size={14}
                        color={COLORS.gold}
                        style={{ marginRight: 1 }}
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingText}>4.9</Text>
                  <View style={styles.directBadge}>
                    <Text style={styles.directBadgeText}>직접 상담</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Consultation Types */}
          <Text style={styles.sectionTitle}>상담 방법 선택</Text>
          <View style={styles.typesContainer}>
            {CONSULTATION_TYPES.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    isSelected && styles.typeCardSelected,
                  ]}
                  onPress={() => setSelectedType(type.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.typeIconWrap,
                      isSelected && styles.typeIconWrapSelected,
                    ]}
                  >
                    <Ionicons
                      name={type.icon}
                      size={22}
                      color={isSelected ? COLORS.white : COLORS.navy}
                    />
                  </View>
                  <View style={styles.typeTextWrap}>
                    <Text
                      style={[
                        styles.typeTitle,
                        isSelected && styles.typeTitleSelected,
                      ]}
                    >
                      {type.title}
                    </Text>
                    <Text style={styles.typeDesc}>{type.desc}</Text>
                    <Text style={styles.typeSub}>{type.sub}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Consultation Info Form */}
          <Text style={styles.sectionTitle}>상담 신청 정보</Text>
          <View style={styles.formCard}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>이름</Text>
              <TextInput
                style={styles.textInput}
                placeholder="이름을 입력해 주세요"
                placeholderTextColor={COLORS.lightText}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>연락처</Text>
              <TextInput
                style={styles.textInput}
                placeholder="010-0000-0000"
                placeholderTextColor={COLORS.lightText}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>상담 희망 시간</Text>
              <View style={styles.timeRow}>
                {TIME_SLOTS.map((slot) => {
                  const isActive = selectedTime === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.timeButton,
                        isActive && styles.timeButtonActive,
                      ]}
                      onPress={() => setSelectedTime(slot)}
                    >
                      <Text
                        style={[
                          styles.timeButtonText,
                          isActive && styles.timeButtonTextActive,
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.formGroupLast}>
              <Text style={styles.formLabel}>간단한 상황 설명</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="현재 상황을 간단히 설명해 주세요. 상세한 내용은 상담 시 말씀해 주셔도 됩니다."
                placeholderTextColor={COLORS.lightText}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Important Notes */}
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.gold}
              />
              <Text style={styles.notesTitle}>상담 전 알아두세요</Text>
            </View>
            {NOTES.map((note, idx) => (
              <View key={idx} style={styles.noteItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.sage}
                  style={styles.noteIcon}
                />
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={COLORS.navy}
              style={{ marginRight: SPACING.sm }}
            />
            <Text style={styles.ctaText}>상담 신청하기</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerText}>
              법률사무소 청송 / 대표변호사 김창희
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    backgroundColor: COLORS.navy,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollContent: {
    backgroundColor: COLORS.cream,
    paddingBottom: SPACING.xxl,
  },

  // -- Profile Card --
  profileCard: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg + 4,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.deepNavy,
    borderWidth: 2.5,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.gold,
  },
  profileInfo: {
    flex: 1,
  },
  lawyerName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  lawyerTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.goldLight,
    marginBottom: 4,
  },
  lawyerExperience: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  ratingText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.gold,
    marginRight: SPACING.sm,
  },
  directBadge: {
    backgroundColor: 'rgba(201,168,76,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
  },
  directBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.goldLight,
  },

  // -- Section Title --
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm + 4,
    marginHorizontal: SPACING.lg,
  },

  // -- Consultation Types --
  typesContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm + 2,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    ...SHADOW.sm,
  },
  typeCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: '#fdfaf2',
  },
  typeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  typeIconWrapSelected: {
    backgroundColor: COLORS.navy,
  },
  typeTextWrap: {
    flex: 1,
  },
  typeTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  typeTitleSelected: {
    color: COLORS.navy,
  },
  typeDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginBottom: 1,
  },
  typeSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  radioOuterSelected: {
    borderColor: COLORS.gold,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gold,
  },

  // -- Form --
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },
  formGroup: {
    marginBottom: SPACING.md + 4,
  },
  formGroupLast: {
    marginBottom: 0,
  },
  formLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.sm + 4,
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  timeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  timeButtonActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  timeButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.slate,
  },
  timeButtonTextActive: {
    color: COLORS.white,
  },

  // -- Notes --
  notesCard: {
    backgroundColor: '#fdfaf2',
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  notesTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    marginLeft: SPACING.sm,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm + 2,
  },
  noteIcon: {
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: 20,
  },

  // -- CTA --
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOW.md,
  },
  ctaText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.navy,
  },

  // -- Footer --
  footer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginBottom: SPACING.sm + 4,
  },
  footerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
  },
});
