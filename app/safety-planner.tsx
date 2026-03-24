import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Switch,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 5;

const ESSENTIAL_ITEMS = [
  '주민등록증/여권',
  '현금/체크카드',
  '핸드폰 충전기',
  '상비약/처방약',
  '아이 필수용품',
  '갈아입을 옷',
  '세면도구',
  '중요서류 사본',
  '보험증서',
  '열쇠 여분',
];

interface SafetyPlan {
  // Step 1
  livingTogether: boolean;
  hasChildren: boolean;
  hasPets: boolean;
  hasVehicle: boolean;
  // Step 2
  safePersons: { name: string; phone: string }[];
  // Step 3
  safePlaces: string[];
  // Step 4
  essentialItems: boolean[];
  // Step 5
  escapeTime: string;
  transport: string;
  emergencyFund: string;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SafetyPlannerScreen() {
  const [step, setStep] = useState(1);
  const [showSummary, setShowSummary] = useState(false);

  const [plan, setPlan] = useState<SafetyPlan>({
    livingTogether: false,
    hasChildren: false,
    hasPets: false,
    hasVehicle: false,
    safePersons: [
      { name: '', phone: '' },
      { name: '', phone: '' },
      { name: '', phone: '' },
    ],
    safePlaces: ['', '', ''],
    essentialItems: ESSENTIAL_ITEMS.map(() => false),
    escapeTime: '',
    transport: '',
    emergencyFund: '',
  });

  const updatePlan = (partial: Partial<SafetyPlan>) => {
    setPlan((prev) => ({ ...prev, ...partial }));
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrev = () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      router.back();
    }
  };

  // ---------------------------------------------------------------------------
  // Step Indicator
  // ---------------------------------------------------------------------------

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === step;
        const isDone = stepNum < step || showSummary;
        return (
          <React.Fragment key={stepNum}>
            <View
              style={[
                styles.stepDot,
                isActive && styles.stepDotActive,
                isDone && styles.stepDotDone,
              ]}
            >
              {isDone ? (
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              ) : (
                <Text
                  style={[
                    styles.stepDotText,
                    isActive && styles.stepDotTextActive,
                  ]}
                >
                  {stepNum}
                </Text>
              )}
            </View>
            {stepNum < TOTAL_STEPS && (
              <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // ---------------------------------------------------------------------------
  // Step Contents
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>현재 상황</Text>
      <Text style={styles.stepSubtitle}>안전계획에 필요한 기본 정보입니다</Text>

      {[
        { label: '현재 상대방과 동거하고 있나요?', key: 'livingTogether' as const, icon: 'home' },
        { label: '자녀가 있나요?', key: 'hasChildren' as const, icon: 'people' },
        { label: '반려동물이 있나요?', key: 'hasPets' as const, icon: 'paw' },
        { label: '본인 명의 차량이 있나요?', key: 'hasVehicle' as const, icon: 'car' },
      ].map((item) => (
        <View key={item.key} style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Ionicons name={item.icon as any} size={20} color={COLORS.gold} />
            <Text style={styles.toggleLabel}>{item.label}</Text>
          </View>
          <Switch
            value={plan[item.key]}
            onValueChange={(v) => updatePlan({ [item.key]: v })}
            trackColor={{ false: COLORS.warmGray, true: COLORS.goldLight }}
            thumbColor={plan[item.key] ? COLORS.gold : COLORS.borderLight}
          />
        </View>
      ))}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>안전한 사람</Text>
      <Text style={styles.stepSubtitle}>
        위급 시 연락할 수 있는 믿을 수 있는 사람 3명을 적어주세요
      </Text>

      {plan.safePersons.map((person, idx) => (
        <View key={idx} style={styles.personCard}>
          <Text style={styles.personCardTitle}>
            <Ionicons name="person" size={14} color={COLORS.gold} /> 신뢰할 수 있는 사람 {idx + 1}
          </Text>
          <TextInput
            style={styles.textInput}
            value={person.name}
            onChangeText={(text) => {
              const updated = [...plan.safePersons];
              updated[idx] = { ...updated[idx], name: text };
              updatePlan({ safePersons: updated });
            }}
            placeholder="이름"
            placeholderTextColor={COLORS.lightText}
          />
          <TextInput
            style={styles.textInput}
            value={person.phone}
            onChangeText={(text) => {
              const updated = [...plan.safePersons];
              updated[idx] = { ...updated[idx], phone: text };
              updatePlan({ safePersons: updated });
            }}
            placeholder="전화번호"
            placeholderTextColor={COLORS.lightText}
            keyboardType="phone-pad"
          />
        </View>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>안전한 장소</Text>
      <Text style={styles.stepSubtitle}>
        위급 시 대피할 수 있는 안전한 장소 3곳을 적어주세요
      </Text>

      {plan.safePlaces.map((place, idx) => (
        <View key={idx} style={styles.placeCard}>
          <Ionicons name="location" size={18} color={COLORS.gold} />
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            value={place}
            onChangeText={(text) => {
              const updated = [...plan.safePlaces];
              updated[idx] = text;
              updatePlan({ safePlaces: updated });
            }}
            placeholder={`안전한 장소 ${idx + 1}`}
            placeholderTextColor={COLORS.lightText}
          />
        </View>
      ))}
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>필수 소지품</Text>
      <Text style={styles.stepSubtitle}>
        탈출 시 반드시 챙겨야 할 물건을 체크하세요
      </Text>

      <View style={styles.checklistProgress}>
        <Text style={styles.checklistProgressText}>
          {plan.essentialItems.filter(Boolean).length} / {ESSENTIAL_ITEMS.length} 항목 준비
        </Text>
      </View>

      {ESSENTIAL_ITEMS.map((item, idx) => (
        <TouchableOpacity
          key={idx}
          style={[
            styles.checklistItem,
            plan.essentialItems[idx] && styles.checklistItemChecked,
          ]}
          onPress={() => {
            const updated = [...plan.essentialItems];
            updated[idx] = !updated[idx];
            updatePlan({ essentialItems: updated });
          }}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              plan.essentialItems[idx] && styles.checkboxChecked,
            ]}
          >
            {plan.essentialItems[idx] && (
              <Ionicons name="checkmark" size={14} color={COLORS.white} />
            )}
          </View>
          <Text
            style={[
              styles.checklistItemText,
              plan.essentialItems[idx] && styles.checklistItemTextChecked,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep5 = () => (
    <View>
      <Text style={styles.stepTitle}>탈출 계획</Text>
      <Text style={styles.stepSubtitle}>
        구체적인 탈출 계획을 세워두면 위급 시 빠르게 행동할 수 있습니다
      </Text>

      <Text style={styles.fieldLabel}>탈출 시간대</Text>
      <TextInput
        style={styles.textInput}
        value={plan.escapeTime}
        onChangeText={(text) => updatePlan({ escapeTime: text })}
        placeholder="예: 상대방이 출근한 오전 9시"
        placeholderTextColor={COLORS.lightText}
      />

      <Text style={styles.fieldLabel}>이동 수단</Text>
      <TextInput
        style={styles.textInput}
        value={plan.transport}
        onChangeText={(text) => updatePlan({ transport: text })}
        placeholder="예: 택시, 본인 차량, 지인 차량"
        placeholderTextColor={COLORS.lightText}
      />

      <Text style={styles.fieldLabel}>비상 자금</Text>
      <TextInput
        style={styles.textInput}
        value={plan.emergencyFund}
        onChangeText={(text) => updatePlan({ emergencyFund: text })}
        placeholder="예: 50만원 (친구에게 맡김)"
        placeholderTextColor={COLORS.lightText}
      />
    </View>
  );

  // ---------------------------------------------------------------------------
  // Summary View
  // ---------------------------------------------------------------------------

  const renderSummary = () => {
    const checkedItems = ESSENTIAL_ITEMS.filter((_, i) => plan.essentialItems[i]);
    const filledPersons = plan.safePersons.filter((p) => p.name.trim());
    const filledPlaces = plan.safePlaces.filter((p) => p.trim());

    return (
      <View>
        <Text style={styles.summaryTitle}>나의 안전계획</Text>

        {/* Warning */}
        <View style={styles.summaryWarning}>
          <Ionicons name="lock-closed" size={18} color={COLORS.coral} />
          <Text style={styles.summaryWarningText}>
            이 계획을 안전한 곳에 저장하세요. 상대방이 볼 수 없는 곳에 보관해야 합니다.
          </Text>
        </View>

        {/* Situation */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>현재 상황</Text>
          <View style={styles.summaryChipRow}>
            {plan.livingTogether && <View style={styles.summaryChip}><Text style={styles.summaryChipText}>동거 중</Text></View>}
            {plan.hasChildren && <View style={styles.summaryChip}><Text style={styles.summaryChipText}>자녀 있음</Text></View>}
            {plan.hasPets && <View style={styles.summaryChip}><Text style={styles.summaryChipText}>반려동물</Text></View>}
            {plan.hasVehicle && <View style={styles.summaryChip}><Text style={styles.summaryChipText}>차량 보유</Text></View>}
          </View>
        </View>

        {/* Safe Persons */}
        {filledPersons.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>안전한 사람</Text>
            {filledPersons.map((p, i) => (
              <Text key={i} style={styles.summaryListItem}>
                {p.name} {p.phone ? `(${p.phone})` : ''}
              </Text>
            ))}
          </View>
        )}

        {/* Safe Places */}
        {filledPlaces.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>안전한 장소</Text>
            {filledPlaces.map((p, i) => (
              <Text key={i} style={styles.summaryListItem}>{p}</Text>
            ))}
          </View>
        )}

        {/* Essential Items */}
        {checkedItems.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>
              필수 소지품 ({checkedItems.length}/{ESSENTIAL_ITEMS.length})
            </Text>
            {checkedItems.map((item, i) => (
              <View key={i} style={styles.summaryCheckRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.sage} />
                <Text style={styles.summaryListItem}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Escape Plan */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>탈출 계획</Text>
          {plan.escapeTime ? <Text style={styles.summaryListItem}>시간: {plan.escapeTime}</Text> : null}
          {plan.transport ? <Text style={styles.summaryListItem}>이동수단: {plan.transport}</Text> : null}
          {plan.emergencyFund ? <Text style={styles.summaryListItem}>비상자금: {plan.emergencyFund}</Text> : null}
        </View>
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const stepLabels = ['현재 상황', '안전한 사람', '안전한 장소', '필수 소지품', '탈출 계획'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrev} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showSummary ? '안전계획 완성' : `${stepLabels[step - 1]}`}
        </Text>
        <View style={styles.headerBackButton} />
      </View>

      {/* Step Indicator */}
      {!showSummary && renderStepIndicator()}

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showSummary
          ? renderSummary()
          : step === 1
            ? renderStep1()
            : step === 2
              ? renderStep2()
              : step === 3
                ? renderStep3()
                : step === 4
                  ? renderStep4()
                  : renderStep5()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {!showSummary ? (
          <View style={styles.navRow}>
            <TouchableOpacity onPress={handlePrev} style={styles.navButtonBack} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={18} color={COLORS.slate} />
              <Text style={styles.navButtonBackText}>이전</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              style={styles.navButtonNext}
              activeOpacity={0.7}
            >
              <Text style={styles.navButtonNextText}>
                {step === TOTAL_STEPS ? '계획 완성' : '다음'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.navRow}>
            <TouchableOpacity onPress={handlePrev} style={styles.navButtonBack} activeOpacity={0.7}>
              <Text style={styles.navButtonBackText}>수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/' as any)}
              style={styles.navButtonNext}
              activeOpacity={0.7}
            >
              <Text style={styles.navButtonNextText}>홈으로</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Emergency Contacts */}
        <View style={styles.emergencyRow}>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:112')}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={16} color={COLORS.coral} />
            <Text style={styles.emergencyButtonText}>112 경찰</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:1366')}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={16} color={COLORS.coral} />
            <Text style={styles.emergencyButtonText}>1366 여성긴급전화</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
    color: COLORS.darkText,
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  stepDotActive: {
    backgroundColor: COLORS.gold + '20',
    borderColor: COLORS.gold,
  },
  stepDotDone: {
    backgroundColor: COLORS.sage,
    borderColor: COLORS.sage,
  },
  stepDotText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.lightText,
  },
  stepDotTextActive: {
    color: COLORS.gold,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: COLORS.sage,
  },

  // Scroll
  scrollArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },

  // Step content
  stepTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  // Toggle rows
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  toggleLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    fontWeight: '500',
    flex: 1,
  },

  // Person card
  personCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  personCardTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },

  // Place card
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.sm,
  },

  // Text input
  textInput: {
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },

  // Checklist
  checklistProgress: {
    marginBottom: SPACING.md,
  },
  checklistProgressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.sage,
    fontWeight: '600',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  checklistItemChecked: {
    backgroundColor: COLORS.sage + '10',
    borderColor: COLORS.sage + '40',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  checkboxChecked: {
    backgroundColor: COLORS.sage,
    borderColor: COLORS.sage,
  },
  checklistItemText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    fontWeight: '500',
  },
  checklistItemTextChecked: {
    color: COLORS.sage,
  },

  // Summary
  summaryTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  summaryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF0ED',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.coral,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  summaryWarningText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.coralDark,
    fontWeight: '600',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  summaryCardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  summaryChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  summaryChip: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.lavender,
  },
  summaryChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.plum,
    fontWeight: '600',
  },
  summaryListItem: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 24,
    marginLeft: SPACING.xs,
  },
  summaryCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },

  // Footer
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.cream,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  navButtonBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.slate + '40',
  },
  navButtonBackText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  navButtonNext: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
  },
  navButtonNextText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    fontWeight: '700',
  },

  // Emergency
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  emergencyButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.coral,
    fontWeight: '600',
  },
});
