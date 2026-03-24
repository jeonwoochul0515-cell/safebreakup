import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { GROUNDING_EXERCISES, MOOD_SCALE } from '@/constants/trauma-recovery';
import BreathingCircle from '@/components/BreathingCircle';

type Screen = 'list' | 'exercise' | 'mood';
type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const SESSION_DURATIONS = [
  { label: '1분', seconds: 60 },
  { label: '3분', seconds: 180 },
  { label: '5분', seconds: 300 },
];

export default function GroundingScreen() {
  const [screen, setScreen] = useState<Screen>('list');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  // Box Breathing state
  const [breathIsActive, setBreathIsActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [breathCycles, setBreathCycles] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(180);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const breathTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // 5-4-3-2-1 state
  const [fiveSensesStep, setFiveSensesStep] = useState(0);

  // Generic guided step
  const [guidedStep, setGuidedStep] = useState(0);

  const selectedExercise = GROUNDING_EXERCISES.find((e) => e.id === selectedExerciseId);

  // Box Breathing Timer
  useEffect(() => {
    if (!breathIsActive) {
      if (breathTimer.current) clearInterval(breathTimer.current);
      return;
    }

    const phases: BreathPhase[] = ['inhale', 'hold', 'exhale', 'rest'];
    let phaseIdx = 0;
    let sec = 4;
    let elapsed = sessionElapsed;

    setBreathPhase('inhale');
    setBreathSeconds(4);

    breathTimer.current = setInterval(() => {
      sec -= 1;
      elapsed += 1;
      setBreathSeconds(sec);
      setSessionElapsed(elapsed);

      if (elapsed >= sessionDuration) {
        setBreathIsActive(false);
        setScreen('mood');
        return;
      }

      if (sec <= 0) {
        phaseIdx = (phaseIdx + 1) % 4;
        if (phaseIdx === 0) setBreathCycles((c) => c + 1);
        sec = 4;
        setBreathPhase(phases[phaseIdx]);
        setBreathSeconds(4);
      }
    }, 1000);

    return () => {
      if (breathTimer.current) clearInterval(breathTimer.current);
    };
  }, [breathIsActive, sessionDuration]);

  const resetBreathing = () => {
    setBreathIsActive(false);
    setBreathPhase('inhale');
    setBreathSeconds(4);
    setBreathCycles(0);
    setSessionElapsed(0);
  };

  const handleSelectExercise = (id: string) => {
    setSelectedExerciseId(id);
    setScreen('exercise');
    setFiveSensesStep(0);
    setGuidedStep(0);
    resetBreathing();
    setSelectedMood(null);
  };

  const handleFinishExercise = () => {
    setScreen('mood');
  };

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value);
  };

  const handleMoodDone = () => {
    setScreen('list');
    setSelectedExerciseId(null);
    setSelectedMood(null);
    resetBreathing();
  };

  // ─── MOOD CHECK ───
  if (screen === 'mood') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleMoodDone} style={styles.headerBackButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>기분 체크</Text>
          <View style={styles.headerBackButton} />
        </View>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.moodContent}>
          <Ionicons name="leaf" size={48} color={COLORS.sage} />
          <Text style={styles.moodQuestion}>운동을 마친 후 기분이 어떠세요?</Text>
          <View style={styles.moodRow}>
            {MOOD_SCALE.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodButton,
                  selectedMood === mood.value && { backgroundColor: mood.color + '25', borderColor: mood.color },
                ]}
                onPress={() => handleMoodSelect(mood.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, selectedMood === mood.value && { color: mood.color, fontWeight: '700' }]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedMood !== null && (
            <TouchableOpacity style={styles.doneButton} onPress={handleMoodDone} activeOpacity={0.7}>
              <Text style={styles.doneButtonText}>완료</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── EXERCISE DETAIL ───
  if (screen === 'exercise' && selectedExercise) {
    // Box Breathing
    if (selectedExercise.id === 'box-breathing') {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => { resetBreathing(); setScreen('list'); }} style={styles.headerBackButton}>
              <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedExercise.title}</Text>
            <View style={styles.headerBackButton} />
          </View>
          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.breathContent}>
            <Text style={styles.exerciseDesc}>{selectedExercise.description}</Text>

            {/* Session Duration Selector */}
            {!breathIsActive && sessionElapsed === 0 && (
              <View style={styles.durationRow}>
                {SESSION_DURATIONS.map((sd) => (
                  <TouchableOpacity
                    key={sd.seconds}
                    style={[styles.durationChip, sessionDuration === sd.seconds && styles.durationChipActive]}
                    onPress={() => setSessionDuration(sd.seconds)}
                  >
                    <Text style={[styles.durationChipText, sessionDuration === sd.seconds && styles.durationChipTextActive]}>
                      {sd.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Breathing Circle */}
            <View style={styles.breathCircleWrap}>
              <BreathingCircle phase={breathPhase} seconds={breathSeconds} totalSeconds={4} isActive={breathIsActive} />
            </View>

            {/* Phase Counter */}
            <Text style={styles.cycleText}>사이클: {breathCycles}</Text>
            <Text style={styles.elapsedText}>
              {Math.floor(sessionElapsed / 60)}:{String(sessionElapsed % 60).padStart(2, '0')} / {Math.floor(sessionDuration / 60)}:{String(sessionDuration % 60).padStart(2, '0')}
            </Text>

            {/* Start / Stop */}
            <TouchableOpacity
              style={[styles.breathButton, breathIsActive && styles.breathButtonStop]}
              onPress={() => {
                if (breathIsActive) {
                  setBreathIsActive(false);
                  handleFinishExercise();
                } else {
                  setSessionElapsed(0);
                  setBreathCycles(0);
                  setBreathIsActive(true);
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name={breathIsActive ? 'stop' : 'play'} size={22} color={COLORS.white} />
              <Text style={styles.breathButtonText}>{breathIsActive ? '중지' : '시작'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }

    // 5-4-3-2-1
    if (selectedExercise.id === 'five-senses' && selectedExercise.steps) {
      const steps = selectedExercise.steps as Array<{ sense: string; count: number; instruction: string; example: string }>;
      const step = steps[fiveSensesStep];
      const isLast = fiveSensesStep === steps.length - 1;

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setScreen('list')} style={styles.headerBackButton}>
              <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedExercise.title}</Text>
            <View style={styles.headerBackButton} />
          </View>
          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.sensesContent}>
            {/* Progress dots */}
            <View style={styles.dotsRow}>
              {steps.map((_, i) => (
                <View key={i} style={[styles.dot, i === fiveSensesStep && styles.dotActive, i < fiveSensesStep && styles.dotDone]} />
              ))}
            </View>

            <View style={styles.senseCard}>
              <View style={[styles.senseCountCircle, { backgroundColor: COLORS.sage + '20' }]}>
                <Text style={styles.senseCount}>{step.count}</Text>
              </View>
              <Text style={styles.senseName}>{step.sense}</Text>
              <Text style={styles.senseInstruction}>{step.instruction}</Text>
              <Text style={styles.senseExample}>예시: {step.example}</Text>
            </View>

            <View style={styles.sensesNavRow}>
              {fiveSensesStep > 0 && (
                <TouchableOpacity
                  style={styles.navButtonBack}
                  onPress={() => setFiveSensesStep((p) => p - 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={18} color={COLORS.slate} />
                  <Text style={styles.navButtonBackText}>이전</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.navButtonNext, { flex: 1 }]}
                onPress={() => {
                  if (isLast) handleFinishExercise();
                  else setFiveSensesStep((p) => p + 1);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.navButtonNextText}>{isLast ? '완료' : '다음'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    // Generic guided exercises (butterfly-hug, safe-place, body-scan)
    const guideSteps: string[] =
      (selectedExercise as any).steps ??
      (selectedExercise as any).guide ??
      ((selectedExercise as any).bodyParts
        ? (selectedExercise as any).bodyParts.map((bp: any) => `${bp.area}: ${bp.instruction}`)
        : []);

    const currentGuidedStep = guideSteps[guidedStep] ?? '';
    const isLastGuided = guidedStep === guideSteps.length - 1;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('list')} style={styles.headerBackButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedExercise.title}</Text>
          <View style={styles.headerBackButton} />
        </View>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.guidedContent}>
          <Text style={styles.exerciseDesc}>{selectedExercise.description}</Text>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {guideSteps.map((_, i) => (
              <View key={i} style={[styles.dot, i === guidedStep && styles.dotActive, i < guidedStep && styles.dotDone]} />
            ))}
          </View>

          <View style={styles.guidedStepCard}>
            <Text style={styles.guidedStepNumber}>{guidedStep + 1} / {guideSteps.length}</Text>
            <Text style={styles.guidedStepText}>{currentGuidedStep}</Text>
          </View>

          <View style={styles.sensesNavRow}>
            {guidedStep > 0 && (
              <TouchableOpacity
                style={styles.navButtonBack}
                onPress={() => setGuidedStep((p) => p - 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={18} color={COLORS.slate} />
                <Text style={styles.navButtonBackText}>이전</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.navButtonNext, { flex: 1 }]}
              onPress={() => {
                if (isLastGuided) handleFinishExercise();
                else setGuidedStep((p) => p + 1);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.navButtonNextText}>{isLastGuided ? '완료' : '다음'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── EXERCISE LIST ───
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>그라운딩 & 호흡</Text>
        <View style={styles.headerBackButton} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <View style={styles.listIntro}>
          <Ionicons name="leaf" size={32} color={COLORS.sage} />
          <Text style={styles.listTitle}>마음을 안정시키는 운동</Text>
          <Text style={styles.listSubtitle}>지금 이 순간에 집중하고, 안전한 상태를 느껴보세요.</Text>
        </View>

        {GROUNDING_EXERCISES.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => handleSelectExercise(exercise.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.exerciseIconCircle, { backgroundColor: exercise.color + '20' }]}>
              <Ionicons name={exercise.icon as any} size={28} color={exercise.color} />
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseTitle}>{exercise.title}</Text>
              <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
              <Text style={styles.exerciseDescription} numberOfLines={2}>
                {exercise.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.slate} />
          </TouchableOpacity>
        ))}
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
  },
  headerBackButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText },

  scrollArea: { flex: 1 },

  // List
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  listIntro: { alignItems: 'center', marginVertical: SPACING.xl },
  listTitle: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.darkText, marginTop: SPACING.sm },
  listSubtitle: { fontSize: FONT_SIZE.md, color: COLORS.slate, textAlign: 'center', marginTop: SPACING.xs, lineHeight: FONT_SIZE.md * 1.6 },

  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  exerciseIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  exerciseInfo: { flex: 1 },
  exerciseTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText },
  exerciseDuration: { fontSize: FONT_SIZE.sm, color: COLORS.sage, fontWeight: '600', marginTop: 2 },
  exerciseDescription: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginTop: 4, lineHeight: FONT_SIZE.sm * 1.5 },
  exerciseDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.7,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },

  // Breathing
  breathContent: { alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  durationRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  durationChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmGray,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  durationChipActive: { backgroundColor: COLORS.sage + '20', borderColor: COLORS.sage },
  durationChipText: { fontSize: FONT_SIZE.md, color: COLORS.slate, fontWeight: '600' },
  durationChipTextActive: { color: COLORS.sage, fontWeight: '700' },
  breathCircleWrap: { marginVertical: SPACING.xl },
  cycleText: { fontSize: FONT_SIZE.md, color: COLORS.sage, fontWeight: '700', marginBottom: SPACING.xs },
  elapsedText: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginBottom: SPACING.lg },
  breathButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: SPACING.xxl,
    backgroundColor: COLORS.sage,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  breathButtonStop: { backgroundColor: COLORS.coral },
  breathButtonText: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white },

  // 5-4-3-2-1
  sensesContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, flexGrow: 1 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginVertical: SPACING.md },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.warmGray },
  dotActive: { backgroundColor: COLORS.sage, width: 24 },
  dotDone: { backgroundColor: COLORS.sageLight },
  senseCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginVertical: SPACING.lg,
    ...SHADOW.md,
  },
  senseCountCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  senseCount: { fontSize: 32, fontWeight: '800', color: COLORS.sage },
  senseName: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.darkText, marginBottom: SPACING.sm },
  senseInstruction: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.7,
    marginBottom: SPACING.sm,
  },
  senseExample: { fontSize: FONT_SIZE.sm, color: COLORS.lightText, fontStyle: 'italic', textAlign: 'center' },
  sensesNavRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
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
  navButtonBackText: { fontSize: FONT_SIZE.md, color: COLORS.slate, fontWeight: '600', marginLeft: SPACING.xs },
  navButtonNext: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.sage,
  },
  navButtonNextText: { fontSize: FONT_SIZE.md, color: COLORS.white, fontWeight: '700' },

  // Guided
  guidedContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, flexGrow: 1 },
  guidedStepCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginVertical: SPACING.lg,
    ...SHADOW.md,
  },
  guidedStepNumber: { fontSize: FONT_SIZE.sm, color: COLORS.sage, fontWeight: '700', marginBottom: SPACING.sm },
  guidedStepText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.darkText,
    textAlign: 'center',
    lineHeight: FONT_SIZE.lg * 1.7,
  },

  // Mood
  moodContent: { alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxl, paddingBottom: SPACING.xxl },
  moodQuestion: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.darkText, textAlign: 'center', marginTop: SPACING.lg, marginBottom: SPACING.xl },
  moodRow: { flexDirection: 'row', gap: SPACING.sm },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 62,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.cardBg,
  },
  moodEmoji: { fontSize: 28, marginBottom: 4 },
  moodLabel: { fontSize: FONT_SIZE.xs, color: COLORS.slate },
  doneButton: {
    marginTop: SPACING.xl,
    height: 52,
    paddingHorizontal: SPACING.xxl,
    backgroundColor: COLORS.sage,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white },
});
