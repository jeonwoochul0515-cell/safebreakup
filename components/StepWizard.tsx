import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';

interface Step {
  number: number;
  title: string;
  icon: string;
  color?: string;
  content: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

interface StepWizardProps {
  steps: Step[];
  completedSteps?: number[];
}

export default function StepWizard({ steps, completedSteps = [] }: StepWizardProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.number);
        const isExpanded = expandedStep === step.number;
        const isLast = index === steps.length - 1;
        const color = step.color || COLORS.gold;

        return (
          <View key={step.number}>
            <TouchableOpacity
              style={styles.stepHeader}
              onPress={() => setExpandedStep(isExpanded ? null : step.number)}
              activeOpacity={0.7}
            >
              {/* Step indicator */}
              <View style={styles.indicatorCol}>
                <View style={[
                  styles.stepCircle,
                  isCompleted ? { backgroundColor: COLORS.success } : { backgroundColor: color + '20', borderColor: color, borderWidth: 2 },
                ]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  ) : (
                    <Text style={[styles.stepNum, { color }]}>{step.number}</Text>
                  )}
                </View>
                {!isLast && <View style={[styles.connector, { backgroundColor: isCompleted ? COLORS.success : COLORS.borderLight }]} />}
              </View>

              {/* Step title */}
              <View style={styles.titleCol}>
                <View style={styles.titleRow}>
                  <Ionicons name={step.icon as any} size={18} color={color} style={{ marginRight: 6 }} />
                  <Text style={[styles.titleText, isCompleted && { color: COLORS.success }]}>{step.title}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={COLORS.lightText}
                    style={{ marginLeft: 'auto' }}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Expanded content */}
            {isExpanded && (
              <View style={styles.contentWrapper}>
                <View style={styles.contentIndent} />
                <View style={[styles.contentCard, { borderLeftColor: color }]}>
                  {step.content}
                  {step.actionLabel && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: color }]}
                      onPress={step.onAction}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionBtnText}>{step.actionLabel}</Text>
                      <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: SPACING.sm },
  stepHeader: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: SPACING.sm },
  indicatorCol: { width: 36, alignItems: 'center' },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  connector: { width: 2, height: 20, marginTop: 4 },
  titleCol: { flex: 1, paddingLeft: SPACING.sm, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleText: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.darkText },
  contentWrapper: { flexDirection: 'row', marginBottom: SPACING.sm },
  contentIndent: { width: 36, alignItems: 'center' },
  contentCard: {
    flex: 1,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderLeftWidth: 3,
    ...SHADOW.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
    gap: 6,
  },
  actionBtnText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: '600' },
});
