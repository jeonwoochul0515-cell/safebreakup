import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import {
  startComplaintSession,
  handleResponse,
  getCurrentPhase,
  getCollectedData,
  isComplete,
  pauseSession,
} from '@/lib/complaint-secretary';
import type { ComplaintMessage } from '@/lib/complaint-secretary';
import type { ComplaintPhase, ComplaintDraftData } from '@/types/database';
import ComplaintPhaseBar from './ComplaintPhaseBar';
import SOSModal from './SOSModal';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ComplaintChatProps {
  sessionId: string;
  onComplete: (data: Partial<ComplaintDraftData>) => void;
  onPause: () => void;
}

// ─── 내부 메시지 타입 ────────────────────────────────────────────────────────

interface ChatEntry {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  phase: ComplaintPhase;
  isEmergency?: boolean;
}

// ─── 타이핑 인디케이터 ───────────────────────────────────────────────────────

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
          Animated.timing(dot, {
            toValue: 1,
            duration: 320,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 320,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.typingRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>사</Text>
      </View>
      <View style={styles.typingBubble}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              {
                opacity: dot,
                transform: [
                  {
                    scale: Animated.add(
                      0.6,
                      Animated.multiply(dot, 0.4),
                    ) as unknown as number,
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── 긴급 연락처 카드 ────────────────────────────────────────────────────────

function EmergencyCard() {
  const contacts = [
    { label: '경찰 신고', number: '112', icon: 'call' as const },
    { label: '여성긴급전화', number: '1366', icon: 'heart' as const },
    { label: '자살예방상담', number: '1393', icon: 'hand-left' as const },
  ];

  return (
    <View style={styles.emergencyContainer}>
      <View style={styles.emergencyHeader}>
        <Ionicons name="alert-circle" size={18} color={COLORS.coral} />
        <Text style={styles.emergencyTitle}>긴급 연락처</Text>
      </View>
      {contacts.map((c) => (
        <TouchableOpacity
          key={c.number}
          style={styles.emergencyCard}
          onPress={() => Linking.openURL(`tel:${c.number}`)}
          activeOpacity={0.7}
        >
          <Ionicons name={c.icon} size={16} color={COLORS.coral} />
          <Text style={styles.emergencyLabel}>{c.label}</Text>
          <Text style={styles.emergencyNumber}>{c.number}</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.coralLight} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── 메인 컴포넌트 ──────────────────────────────────────────────────────────

const TYPING_DELAY = 600;

export default function ComplaintChat({
  sessionId,
  onComplete,
  onPause,
}: ComplaintChatProps) {
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [currentPhase, setCurrentPhase] = useState<ComplaintPhase>('safety');
  const [completedPhases, setCompletedPhases] = useState<ComplaintPhase[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<ComplaintMessage | null>(null);
  const [multiselectBuffer, setMultiselectBuffer] = useState<string[]>([]);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);

  // ── 헬퍼 ──

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const addMessage = useCallback(
    (role: 'assistant' | 'user', content: string, phase: ComplaintPhase, isEmergency?: boolean) => {
      const entry: ChatEntry = {
        id: `${role}-${Date.now()}-${Math.random()}`,
        role,
        content,
        phase,
        isEmergency,
      };
      setMessages((prev) => [...prev, entry]);
      scrollToBottom();
    },
    [scrollToBottom],
  );

  const showBotMessage = useCallback(
    (msg: ComplaintMessage) => {
      setIsTyping(true);
      scrollToBottom();
      setTimeout(() => {
        setIsTyping(false);
        addMessage('assistant', msg.text, msg.phase, msg.isEmergency);
        setCurrentQuestion(msg);
        if (msg.isEmergency) {
          setShowEmergency(true);
          setShowSOSModal(true);
        }
      }, TYPING_DELAY);
    },
    [addMessage, scrollToBottom],
  );

  const updatePhase = useCallback(
    (newPhase: ComplaintPhase) => {
      if (newPhase !== currentPhase) {
        setCompletedPhases((prev) =>
          prev.includes(currentPhase) ? prev : [...prev, currentPhase],
        );
        setCurrentPhase(newPhase);
      }
    },
    [currentPhase],
  );

  // ── 세션 시작 ──

  useEffect(() => {
    const firstMsg = startComplaintSession(sessionId);
    showBotMessage(firstMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 사용자 응답 처리 ──

  const processResponse = useCallback(
    (userText: string) => {
      addMessage('user', userText, currentPhase);
      setMultiselectBuffer([]);

      const response = handleResponse(sessionId, userText);
      const newPhase = getCurrentPhase(sessionId);
      updatePhase(newPhase);
      showBotMessage(response);

      // 완료 체크
      if (isComplete(sessionId)) {
        const data = getCollectedData(sessionId);
        setTimeout(() => onComplete(data), TYPING_DELAY + 200);
      }
    },
    [sessionId, currentPhase, addMessage, updatePhase, showBotMessage, onComplete],
  );

  // ── 텍스트 전송 ──

  const handleSendText = useCallback(() => {
    const text = inputText.trim();
    if (!text || isTyping) return;
    setInputText('');
    processResponse(text);
  }, [inputText, isTyping, processResponse]);

  // ── 선택지 클릭 ──

  const handleSelectOption = useCallback(
    (value: string) => {
      if (isTyping) return;
      processResponse(value);
    },
    [isTyping, processResponse],
  );

  // ── 멀티셀렉트 ──

  const toggleMultiItem = useCallback((value: string) => {
    setMultiselectBuffer((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const handleMultiselectConfirm = useCallback(() => {
    if (multiselectBuffer.length === 0) return;
    processResponse(multiselectBuffer.join(', '));
  }, [multiselectBuffer, processResponse]);

  // ── 건너뛰기 ──

  const handleSkip = useCallback(() => {
    processResponse('(건너뜀)');
  }, [processResponse]);

  // ── 일시정지 ──

  const handlePause = useCallback(() => {
    pauseSession(sessionId);
    addMessage('user', '지금은 여기까지만 하고 싶어요', currentPhase);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(
        'assistant',
        '알겠습니다. 여기까지 내용은 안전하게 저장했어요.\n언제든 다시 오시면 이어서 진행할 수 있습니다.',
        currentPhase,
      );
      onPause();
    }, TYPING_DELAY);
  }, [sessionId, currentPhase, addMessage, onPause]);

  // ── inputType별 하단 입력 영역 렌더링 ──

  const renderInputArea = () => {
    if (!currentQuestion || isTyping) return null;

    const { inputType, options } = currentQuestion;

    // select: 선택지 버튼 카드
    if (inputType === 'select' && options) {
      return (
        <View style={styles.selectContainer}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={styles.selectCard}
              onPress={() => handleSelectOption(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.selectCardText}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.gold} />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // multiselect: 체크박스 + 선택 완료
    if (inputType === 'multiselect' && options) {
      return (
        <View style={styles.multiselectContainer}>
          {options.map((opt) => {
            const checked = multiselectBuffer.includes(opt.value);
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.multiselectItem, checked && styles.multiselectItemChecked]}
                onPress={() => toggleMultiItem(opt.value)}
                activeOpacity={0.7}
              >
                <View style={[styles.msCheckbox, checked && styles.msCheckboxChecked]}>
                  {checked && (
                    <Ionicons name="checkmark" size={12} color={COLORS.white} />
                  )}
                </View>
                <Text
                  style={[
                    styles.multiselectText,
                    checked && styles.multiselectTextChecked,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[
              styles.msConfirmBtn,
              multiselectBuffer.length === 0 && styles.msConfirmBtnDisabled,
            ]}
            onPress={handleMultiselectConfirm}
            disabled={multiselectBuffer.length === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.msConfirmText}>
              {multiselectBuffer.length > 0
                ? `${multiselectBuffer.length}개 선택 완료`
                : '항목을 선택해주세요'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // date: 날짜 입력
    if (inputType === 'date') {
      return (
        <View style={styles.textInputArea}>
          <Text style={styles.dateHint}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.slate} />
            {' '}YYYY.MM.DD 형식으로 입력해주세요 (예: 2024.01.15)
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="날짜를 입력해주세요"
              placeholderTextColor={COLORS.lightText}
              value={inputText}
              onChangeText={setInputText}
              keyboardType="numeric"
              returnKeyType="send"
              onSubmitEditing={handleSendText}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSendText}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-up" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // skip_allowed: 선택지 + 건너뛰기 (옵션이 있으면 선택지, 없으면 텍스트)
    if (inputType === 'skip_allowed') {
      return (
        <View style={styles.textInputArea}>
          {options && options.length > 0 ? (
            <View style={styles.selectContainer}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.selectCard}
                  onPress={() => handleSelectOption(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectCardText}>{opt.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.gold} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="입력해주세요..."
                placeholderTextColor={COLORS.lightText}
                value={inputText}
                onChangeText={setInputText}
                returnKeyType="send"
                onSubmitEditing={handleSendText}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                onPress={handleSendText}
                disabled={!inputText.trim()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-up" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            activeOpacity={0.6}
          >
            <Text style={styles.skipBtnText}>건너뛰기</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // text (기본): 텍스트 입력
    return (
      <View style={styles.textInputArea}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor={COLORS.lightText}
            value={inputText}
            onChangeText={setInputText}
            returnKeyType="send"
            onSubmitEditing={handleSendText}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSendText}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-up" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── 렌더 ──

  return (
    <View style={styles.container}>
      {/* 단계 바 */}
      <ComplaintPhaseBar
        currentPhase={currentPhase}
        completedPhases={completedPhases}
      />

      {/* 채팅 영역 */}
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
            const showAvatar =
              isBot && (idx === 0 || messages[idx - 1]?.role !== 'assistant');

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isBot ? styles.messageRowBot : styles.messageRowUser,
                ]}
              >
                {/* 사무장 아바타 */}
                {isBot && showAvatar && (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>사</Text>
                  </View>
                )}
                {isBot && !showAvatar && <View style={styles.avatarSpacer} />}

                {/* 메시지 버블 */}
                <View
                  style={[
                    styles.bubble,
                    isBot ? styles.bubbleBot : styles.bubbleUser,
                    msg.isEmergency && styles.bubbleEmergency,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      isBot ? styles.bubbleTextBot : styles.bubbleTextUser,
                      msg.isEmergency && styles.bubbleTextEmergency,
                    ]}
                  >
                    {msg.content}
                  </Text>
                </View>
              </View>
            );
          })}

          {isTyping && <TypingIndicator />}

          {/* 긴급 연락처 */}
          {showEmergency && <EmergencyCard />}
        </ScrollView>

        {/* 하단 입력 영역 */}
        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={styles.pauseLink}
            onPress={handlePause}
            activeOpacity={0.6}
          >
            <Text style={styles.pauseLinkText}>
              지금은 여기까지만 하고 싶어요
            </Text>
          </TouchableOpacity>

          {renderInputArea()}
        </View>
      </KeyboardAvoidingView>

      {/* SOS Modal — 위기 키워드 감지 시 표시 */}
      <SOSModal visible={showSOSModal} onClose={() => setShowSOSModal(false)} />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  flex1: { flex: 1 },

  // Chat area
  chatArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  chatContent: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // Message rows
  messageRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },

  // Avatar
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    ...SHADOW.sm,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  avatarSpacer: {
    width: 36,
    marginRight: SPACING.sm,
  },

  // Bubbles
  bubble: {
    maxWidth: '75%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  bubbleBot: {
    backgroundColor: COLORS.warmWhite,
    borderTopLeftRadius: RADIUS.sm,
  },
  bubbleUser: {
    backgroundColor: COLORS.gold,
    borderTopRightRadius: RADIUS.sm,
  },
  bubbleEmergency: {
    backgroundColor: '#FFF0EE',
    borderWidth: 1,
    borderColor: COLORS.coralLight,
  },
  bubbleText: {
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
  },
  bubbleTextBot: {
    color: COLORS.darkText,
  },
  bubbleTextUser: {
    color: COLORS.white,
  },
  bubbleTextEmergency: {
    color: COLORS.coral,
  },

  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderTopLeftRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    gap: 6,
    ...SHADOW.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lightText,
  },

  // Emergency card
  emergencyContainer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: '#FFF5F3',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.coralLight,
    padding: SPACING.md,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  emergencyTitle: {
    color: COLORS.coral,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs + 2,
    gap: SPACING.sm,
  },
  emergencyLabel: {
    flex: 1,
    color: COLORS.darkText,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  emergencyNumber: {
    color: COLORS.coral,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    marginRight: SPACING.xs,
  },

  // Bottom area
  bottomArea: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.warmWhite,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },

  // Pause link
  pauseLink: {
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    marginBottom: SPACING.sm,
  },
  pauseLinkText: {
    color: COLORS.lightText,
    fontSize: FONT_SIZE.sm,
  },

  // Text input
  textInputArea: {
    gap: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.lightText,
    opacity: 0.5,
  },
  dateHint: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.xs,
  },

  // Select cards
  selectContainer: {
    gap: SPACING.sm,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  selectCardText: {
    color: COLORS.darkText,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    flex: 1,
  },

  // Multiselect
  multiselectContainer: {
    gap: SPACING.xs + 2,
  },
  multiselectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  multiselectItemChecked: {
    backgroundColor: '#FAF3ED',
    borderColor: COLORS.goldLight,
  },
  msCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.lightText,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  msCheckboxChecked: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  multiselectText: {
    color: COLORS.darkText,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    flex: 1,
  },
  multiselectTextChecked: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  msConfirmBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 4,
    alignItems: 'center',
    marginTop: SPACING.xs,
    ...SHADOW.sm,
  },
  msConfirmBtnDisabled: {
    backgroundColor: COLORS.lightText,
    opacity: 0.5,
  },
  msConfirmText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },

  // Skip button
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  skipBtnText: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.sm,
    textDecorationLine: 'underline',
  },
});
