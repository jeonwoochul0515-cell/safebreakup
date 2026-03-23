import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { PHASE_LABELS, FIVE_W_ONE_H, EVIDENCE_CHECKLIST, CRISIS_KEYWORDS, MOCK_OPTIONS, MOCK_LEGAL_ANALYSIS } from '@/constants/ai-secretary';
import { sendMessage, getCurrentPhase, getFactSummary, generateOptions } from '@/lib/ai-secretary';
import { analyzeEmotion } from '@/hooks/useEmotionAnalysis';
import { useAppContext } from '@/contexts/AppContext';
import type { ChatMessage, EmotionState, CasePhase } from '@/types/database';

import ChatBubble from '@/components/ChatBubble';
import PhaseIndicator from '@/components/PhaseIndicator';
import SelectionCard from '@/components/SelectionCard';

const SESSION_ID = 'session-main';
const TYPING_DELAY = 500;

// ── Emergency contact card ──────────────────────────────────────────
function EmergencyContacts() {
  const contacts = [
    { label: '경찰', number: '112', icon: 'call' as const },
    { label: '여성긴급전화', number: '1366', icon: 'heart' as const },
    { label: '자살예방상담', number: '1393', icon: 'hand-left' as const },
  ];

  return (
    <View style={styles.emergencyContainer}>
      {contacts.map((c) => (
        <TouchableOpacity
          key={c.number}
          style={styles.emergencyCard}
          onPress={() => Linking.openURL(`tel:${c.number}`)}
          activeOpacity={0.7}
        >
          <Ionicons name={c.icon} size={18} color={COLORS.coral} />
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyLabel}>{c.label}</Text>
            <Text style={styles.emergencyNumber}>{c.number}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.coralLight} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Typing indicator (3 animated dots) ──────────────────────────────
function TypingIndicator() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.typingRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>김</Text>
      </View>
      <View style={styles.typingBubble}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              { opacity: dot, transform: [{ scale: Animated.add(0.6, Animated.multiply(dot, 0.4)) }] },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ── Option card (Phase 5 A/B) ───────────────────────────────────────
function OptionCard({
  variant,
  title,
  description,
  details,
  pros,
  cons,
  cost,
  time,
  selected,
  onPress,
}: {
  variant: 'A' | 'B';
  title: string;
  description: string;
  details: string[];
  pros: string[];
  cons: string[];
  cost: string;
  time: string;
  selected: boolean;
  onPress: () => void;
}) {
  const accentColor = variant === 'A' ? COLORS.gold : COLORS.plum;

  return (
    <TouchableOpacity
      style={[
        styles.optionCard,
        { borderLeftColor: accentColor },
        selected && styles.optionCardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDesc}>{description}</Text>

      {details.map((d, i) => (
        <Text key={i} style={styles.optionDetail}>  {d}</Text>
      ))}

      <View style={styles.optionProsConsRow}>
        <View style={styles.optionProsCol}>
          <Text style={styles.optionProsLabel}>장점</Text>
          {pros.map((p, i) => (
            <Text key={i} style={styles.optionProsItem}>{p}</Text>
          ))}
        </View>
        <View style={styles.optionConsCol}>
          <Text style={styles.optionConsLabel}>단점</Text>
          {cons.map((c, i) => (
            <Text key={i} style={styles.optionConsItem}>{c}</Text>
          ))}
        </View>
      </View>

      <View style={styles.optionFooterRow}>
        <Text style={[styles.optionCost, { color: accentColor }]}>비용: {cost}</Text>
        <Text style={styles.optionTime}>기간: {time}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Main screen ─────────────────────────────────────────────────────
export default function AISecretaryScreen() {
  const router = useRouter();
  const { casePhase, setCasePhase } = useAppContext();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPhase, setCurrentPhase] = useState<CasePhase>(1);
  const [emotionState, setEmotionState] = useState<EmotionState>('calm');
  const [isPaused, setIsPaused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [factSummary, setFactSummary] = useState<Record<string, string>>({});
  const [showEmergency, setShowEmergency] = useState(false);

  // Phase 2 tracking
  const [fiveWStep, setFiveWStep] = useState(0);
  const [fiveWSelected, setFiveWSelected] = useState<string[]>([]);

  // Phase 3 tracking
  const [evidenceSelected, setEvidenceSelected] = useState<string[]>([]);
  const [evidenceSubmitted, setEvidenceSubmitted] = useState(false);

  // Phase 5 tracking
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);

  const phaseLabels = Object.values(PHASE_LABELS);

  // ── Helpers ──
  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const addBotMessage = useCallback(
    (content: string, phase: CasePhase) => {
      const msg: ChatMessage = {
        id: `bot-${Date.now()}-${Math.random()}`,
        conversation_id: SESSION_ID,
        role: 'assistant',
        content,
        phase,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    },
    [scrollToBottom]
  );

  const addUserMessage = useCallback(
    (content: string, phase: CasePhase) => {
      const emotion = analyzeEmotion(content);
      setEmotionState(emotion);

      const msg: ChatMessage = {
        id: `user-${Date.now()}-${Math.random()}`,
        conversation_id: SESSION_ID,
        role: 'user',
        content,
        phase,
        emotion_state: emotion,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
      return emotion;
    },
    [scrollToBottom]
  );

  const botReply = useCallback(
    (content: string, phase: CasePhase, delay = TYPING_DELAY) => {
      setIsTyping(true);
      scrollToBottom();
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(content, phase);
      }, delay);
    },
    [addBotMessage, scrollToBottom]
  );

  const advancePhase = useCallback(
    (next: CasePhase) => {
      setCurrentPhase(next);
      setCasePhase(next);
    },
    [setCasePhase]
  );

  // ── Initial bot greeting ──
  useEffect(() => {
    botReply(
      '안녕하세요, 이별방패 법률 사무장입니다.\n\n먼저 지금 안전한 곳에 계신지 확인드려도 될까요?',
      1,
      800
    );
  }, []);

  // ── Phase 1: safety buttons ──
  const handleSafetyResponse = useCallback(
    (safe: boolean) => {
      if (safe) {
        addUserMessage('네, 안전해요', 1);
        botReply('안전이 확인되었습니다. 감사합니다.\n\n그럼 상황을 파악해 보겠습니다.', 1, TYPING_DELAY);
        setTimeout(() => {
          advancePhase(2);
          const first = FIVE_W_ONE_H[0];
          botReply(first.question, 2, TYPING_DELAY);
        }, TYPING_DELAY + 600);
      } else {
        addUserMessage('지금 위험해요', 1);
        setEmotionState('crisis');
        setShowEmergency(true);
        botReply(
          '지금 즉시 안전한 곳으로 이동하세요.\n\n아래 연락처로 즉시 도움을 요청해 주세요.\n\n안전해지시면 다시 말씀해 주세요.',
          1,
          TYPING_DELAY
        );
      }
    },
    [addUserMessage, botReply, advancePhase]
  );

  // ── Phase 2: 5W1H selection ──
  const handleFiveWSelect = useCallback(
    (selected: string[]) => {
      setFiveWSelected(selected);
      if (selected.length === 0) return;

      const currentQ = FIVE_W_ONE_H[fiveWStep];
      const chosenLabel = currentQ.options[currentQ.options.indexOf(selected[0])] ?? selected[0];
      addUserMessage(chosenLabel.replace('custom:', ''), 2);

      const nextStep = fiveWStep + 1;
      if (nextStep < FIVE_W_ONE_H.length) {
        setFiveWStep(nextStep);
        setFiveWSelected([]);
        const nextQ = FIVE_W_ONE_H[nextStep];
        botReply(nextQ.question, 2);
      } else {
        // Phase 2 done -> Phase 3
        botReply('상황 파악이 완료되었습니다.\n\n다음으로 확보하신 증거를 확인하겠습니다.', 2, TYPING_DELAY);
        setTimeout(() => {
          advancePhase(3);
          botReply(
            '지금까지 확보하신 증거가 있으신가요?\n해당되는 항목을 모두 선택해 주세요.',
            3,
            TYPING_DELAY
          );
        }, TYPING_DELAY + 600);
      }
    },
    [fiveWStep, addUserMessage, botReply, advancePhase]
  );

  // ── Phase 3: evidence submit ──
  const handleEvidenceSubmit = useCallback(() => {
    setEvidenceSubmitted(true);
    const count = evidenceSelected.length;
    addUserMessage(
      count > 0
        ? `증거 ${count}건 선택 완료`
        : '현재 확보한 증거가 없습니다',
      3
    );

    botReply('증거 확인이 완료되었습니다.\n\n법률 분석을 진행하겠습니다.', 3, TYPING_DELAY);

    setTimeout(() => {
      advancePhase(4);
      const laws = MOCK_LEGAL_ANALYSIS.applicable_laws
        .map((l) => `  ${l.name}: ${l.description}\n    ${l.penalty}`)
        .join('\n');
      const cases = MOCK_LEGAL_ANALYSIS.similar_cases
        .map((c) => `  ${c.case_number}: ${c.summary}\n    ${c.ruling}`)
        .join('\n');

      const legalMsg =
        `말씀하신 상황을 바탕으로 법률 분석 결과를 알려드리겠습니다.\n\n` +
        `적용 가능 법률:\n${laws}\n\n` +
        `유사 판례:\n${cases}\n\n` +
        `위험도 평가:\n${MOCK_LEGAL_ANALYSIS.risk_assessment}`;

      botReply(legalMsg, 4, 1000);

      setTimeout(() => {
        setFactSummary(getFactSummary(SESSION_ID));
        botReply(
          '분석이 완료되었습니다. 두 가지 대응 선택지를 준비했습니다.',
          4,
          TYPING_DELAY
        );
        setTimeout(() => {
          advancePhase(5);
        }, TYPING_DELAY + 200);
      }, 1500);
    }, TYPING_DELAY + 600);
  }, [evidenceSelected, addUserMessage, botReply, advancePhase]);

  // ── Phase 5: option select ──
  const handleOptionSelect = useCallback(
    (option: 'A' | 'B') => {
      setSelectedOption(option);
      const chosen = option === 'A' ? MOCK_OPTIONS.optionA : MOCK_OPTIONS.optionB;
      addUserMessage(`선택지 ${option}: ${chosen.title}`, 5);
      botReply(
        `${chosen.title}을(를) 선택하셨습니다.\n\n법률사무소 청송에서 구체적인 진행 절차를 안내해 드리겠습니다. 담당 변호사가 확인 후 연락드리겠습니다.`,
        5,
        TYPING_DELAY
      );
    },
    [addUserMessage, botReply]
  );

  // ── Free-text send ──
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    setInputText('');
    const emotion = addUserMessage(text, currentPhase);

    if (emotion === 'crisis') {
      setShowEmergency(true);
      botReply(
        '지금 많이 힘드시군요. 혼자 감당하지 않으셔도 됩니다.\n\n아래 연락처로 도움을 요청해 주세요.\n\n계속 이야기 나누셔도 됩니다.',
        currentPhase,
        TYPING_DELAY
      );
      return;
    }

    const response = sendMessage(SESSION_ID, text);
    const newPhase = getCurrentPhase(SESSION_ID) as CasePhase;
    botReply(response.content, response.phase, TYPING_DELAY);

    if (newPhase !== currentPhase) {
      setTimeout(() => advancePhase(newPhase), TYPING_DELAY + 100);
    }
  }, [inputText, isTyping, currentPhase, addUserMessage, botReply, advancePhase]);

  // ── Pause ──
  const handlePause = useCallback(() => {
    setIsPaused(true);
    addUserMessage('지금은 여기까지만 하고 싶어요', currentPhase);
    botReply(
      '알겠습니다. 언제든 다시 오시면 이어서 진행하겠습니다.\n\n법률사무소 청송 / 대표변호사 김창희',
      currentPhase,
      TYPING_DELAY
    );
  }, [currentPhase, addUserMessage, botReply]);

  // ── Determine what to show below messages ──
  const showPhase1Buttons = currentPhase === 1 && messages.length > 0 && messages.every((m) => m.role === 'assistant');
  const showPhase2Selection = currentPhase === 2 && fiveWStep < FIVE_W_ONE_H.length && !isTyping;
  const showPhase3Checklist = currentPhase === 3 && !evidenceSubmitted && !isTyping;
  const showPhase5Options = currentPhase === 5 && !selectedOption && !isTyping;
  const showReviewBadge = currentPhase >= 4;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Crisis banner */}
      {emotionState === 'crisis' && (
        <View style={styles.crisisBanner}>
          <Ionicons name="alert-circle" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.crisisText}>
            위기 감지 -- 긴급 전화: 112 / 1366 / 1393
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarRing}>
            <View style={styles.headerAvatar}>
              <Ionicons name="person" size={14} color={COLORS.gold} />
            </View>
          </View>
          <Text style={styles.headerTitle}>AI 법률 사무장</Text>
        </View>

        <View style={styles.backBtn} />
      </View>

      {/* Phase indicator */}
      <PhaseIndicator currentPhase={currentPhase} phases={phaseLabels} />

      {/* Chat area */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, idx) => {
            const isBot = msg.role === 'assistant';
            const isLastBotInSequence =
              isBot && (idx === messages.length - 1 || messages[idx + 1]?.role !== 'assistant');
            return (
              <ChatBubble
                key={msg.id}
                type={isBot ? 'bot' : 'user'}
                text={msg.content}
                showAvatar={isBot && (idx === 0 || messages[idx - 1]?.role !== 'assistant')}
                showReviewBadge={showReviewBadge && isBot && isLastBotInSequence}
              />
            );
          })}

          {isTyping && <TypingIndicator />}

          {/* Emergency inline contacts */}
          {showEmergency && <EmergencyContacts />}

          {/* Phase 1: Safety buttons */}
          {showPhase1Buttons && !isPaused && (
            <View style={styles.safetyBtns}>
              <TouchableOpacity
                style={styles.safeBtn}
                onPress={() => handleSafetyResponse(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
                <Text style={styles.safeBtnText}>네, 안전해요</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={() => handleSafetyResponse(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="warning-outline" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
                <Text style={styles.dangerBtnText}>지금 위험해요</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Phase 2: 5W1H selection cards */}
          {showPhase2Selection && !isPaused && (
            <SelectionCard
              type="single"
              options={FIVE_W_ONE_H[fiveWStep].options.map((o) => ({
                id: o,
                label: o,
              }))}
              selected={fiveWSelected}
              onSelect={handleFiveWSelect}
              allowCustom
            />
          )}

          {/* Phase 3: Evidence checklist */}
          {showPhase3Checklist && !isPaused && (
            <View>
              <SelectionCard
                type="multi"
                options={EVIDENCE_CHECKLIST.map((e) => ({
                  id: e.id,
                  label: e.label,
                  icon: e.required ? '📌' : undefined,
                }))}
                selected={evidenceSelected}
                onSelect={setEvidenceSelected}
              />
              <TouchableOpacity style={styles.submitEvidenceBtn} onPress={handleEvidenceSubmit} activeOpacity={0.7}>
                <Text style={styles.submitEvidenceBtnText}>
                  {evidenceSelected.length > 0
                    ? `증거 ${evidenceSelected.length}건 제출`
                    : '확보한 증거 없음'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Phase 5: A/B options */}
          {showPhase5Options && !isPaused && (
            <View style={styles.optionsContainer}>
              <OptionCard
                variant="A"
                title={`선택지 A: ${MOCK_OPTIONS.optionA.title}`}
                description={MOCK_OPTIONS.optionA.description}
                details={MOCK_OPTIONS.optionA.details}
                pros={MOCK_OPTIONS.optionA.pros}
                cons={MOCK_OPTIONS.optionA.cons}
                cost={MOCK_OPTIONS.optionA.estimated_cost}
                time={MOCK_OPTIONS.optionA.estimated_time}
                selected={selectedOption === 'A'}
                onPress={() => handleOptionSelect('A')}
              />
              <OptionCard
                variant="B"
                title={`선택지 B: ${MOCK_OPTIONS.optionB.title}`}
                description={MOCK_OPTIONS.optionB.description}
                details={MOCK_OPTIONS.optionB.details}
                pros={MOCK_OPTIONS.optionB.pros}
                cons={MOCK_OPTIONS.optionB.cons}
                cost={MOCK_OPTIONS.optionB.estimated_cost}
                time={MOCK_OPTIONS.optionB.estimated_time}
                selected={selectedOption === 'B'}
                onPress={() => handleOptionSelect('B')}
              />
            </View>
          )}

          {/* Footer branding */}
          {(currentPhase >= 4 || isPaused) && (
            <Text style={styles.footerBranding}>
              법률사무소 청송 / 대표변호사 김창희
            </Text>
          )}
        </ScrollView>

        {/* Bottom input area */}
        {!isPaused && (
          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.pauseLink} onPress={handlePause} activeOpacity={0.6}>
              <Text style={styles.pauseLinkText}>지금은 여기까지만 하고 싶어요</Text>
            </TouchableOpacity>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="메시지를 입력하세요..."
                placeholderTextColor={COLORS.lightText}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                multiline={false}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim() || isTyping}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-up" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isPaused && (
          <View style={styles.inputArea}>
            <TouchableOpacity
              style={styles.resumeBtn}
              onPress={() => {
                setIsPaused(false);
                botReply('다시 오셨군요. 이어서 진행하겠습니다.', currentPhase, TYPING_DELAY);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.resumeBtnText}>대화 다시 시작하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  flex1: { flex: 1 },

  // Crisis banner
  crisisBanner: {
    backgroundColor: COLORS.coral,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
  crisisText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.navy,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerAvatarRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.deepNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },

  // Chat area
  chatArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  chatContent: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.sm / 2,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    gap: 6,
    ...SHADOW.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lavender,
  },

  // Emergency contacts
  emergencyContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F3',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.coralLight,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    minHeight: 56,
  },
  emergencyInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  emergencyLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    fontWeight: '500',
  },
  emergencyNumber: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.coral,
    fontWeight: '700',
    marginTop: 2,
  },

  // Phase 1 buttons
  safetyBtns: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  safeBtn: {
    flex: 1,
    minHeight: 56,
    backgroundColor: COLORS.sage,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  safeBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  dangerBtn: {
    flex: 1,
    minHeight: 56,
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  dangerBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },

  // Phase 3 submit
  submitEvidenceBtn: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    minHeight: 56,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  submitEvidenceBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },

  // Phase 5 options
  optionsContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  optionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
    padding: SPACING.md + 4,
    ...SHADOW.sm,
  },
  optionCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(196, 149, 106, 0.04)',
  },
  optionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  optionDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  optionDetail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    lineHeight: 20,
    marginBottom: 2,
  },
  optionProsConsRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm + 4,
    gap: SPACING.md,
  },
  optionProsCol: { flex: 1 },
  optionConsCol: { flex: 1 },
  optionProsLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.sage,
    marginBottom: 4,
  },
  optionConsLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.coral,
    marginBottom: 4,
  },
  optionProsItem: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.sage,
    lineHeight: 19,
  },
  optionConsItem: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.coral,
    lineHeight: 19,
  },
  optionFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm + 4,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  optionCost: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gold,
  },
  optionTime: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
  },

  // Footer branding
  footerBranding: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  // Input area
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.warmWhite,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm + 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    backgroundColor: COLORS.warmWhite,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
  sendBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  pauseLink: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    minHeight: 36,
    justifyContent: 'center',
    marginBottom: 2,
  },
  pauseLinkText: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.sm,
    fontWeight: '400',
  },

  // Resume
  resumeBtn: {
    minHeight: 56,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  resumeBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
