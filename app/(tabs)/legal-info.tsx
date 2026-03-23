import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { CHATBOT_FAQ, LEGAL } from '@/constants/legal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

// ─── Category colors ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  '긴급': COLORS.danger,
  '법률경고장': COLORS.gold,
  '법률정보': COLORS.info,
  '협박대응': COLORS.warning,
  '디지털성범죄': '#8b5cf6',
};

// ─── Initial bot greeting ─────────────────────────────────────────────────────

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  text: '안녕하세요! 법률사무소 청송의 법률정보 안내 챗봇입니다. 궁금한 점을 선택해주세요. 😊',
  sender: 'bot',
  timestamp: new Date(),
};

const FREE_TEXT_RESPONSE =
  '해당 질문에 대해서는 변호사에게 직접 상담하시는 것을 권해드립니다. 상담 예약을 도와드릴까요?';

// ─── Component ────────────────────────────────────────────────────────────────

export default function LegalInfoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [answeredIds, setAnsweredIds] = useState<number[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConsultButton, setShowConsultButton] = useState(false);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Add a bot message with typing delay
  const addBotMessage = useCallback(
    (text: string, onDone?: () => void) => {
      setIsTyping(true);
      scrollToBottom();

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            text,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
        scrollToBottom();
        onDone?.();
      }, 500);
    },
    [scrollToBottom],
  );

  // Handle FAQ chip tap
  const handleFaqTap = useCallback(
    (faq: (typeof CHATBOT_FAQ)[number]) => {
      if (isTyping) return;

      // Add user bubble
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        text: faq.question,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setAnsweredIds((prev) => [...prev, faq.id]);
      scrollToBottom();

      // Bot reply after delay
      addBotMessage(faq.answer);
    },
    [isTyping, addBotMessage, scrollToBottom],
  );

  // Handle free text send
  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: trimmed,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    scrollToBottom();

    addBotMessage(FREE_TEXT_RESPONSE, () => {
      setShowConsultButton(true);
      scrollToBottom();
    });
  }, [inputText, isTyping, addBotMessage, scrollToBottom]);

  // Show disclaimer
  const showDisclaimer = () => {
    Alert.alert(
      '안내',
      LEGAL.chatbotDisclaimer + '\n\n' + LEGAL.disclaimer,
      [{ text: '확인' }],
    );
  };

  // Remaining FAQ questions
  const remainingFaqs = CHATBOT_FAQ.filter(
    (faq) => !answeredIds.includes(faq.id),
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>법률정보 안내 챗봇</Text>
          <TouchableOpacity onPress={showDisclaimer} hitSlop={12}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={COLORS.goldLight}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={13} color={COLORS.gold} />
            <Text style={styles.badgeText}>검토: 김창희 변호사</Text>
          </View>
        </View>
      </View>

      {/* ── Chat area ───────────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) =>
          msg.sender === 'bot' ? (
            <BotBubble key={msg.id} text={msg.text} />
          ) : (
            <UserBubble key={msg.id} text={msg.text} />
          ),
        )}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Consultation button after free-text response */}
        {showConsultButton && (
          <View style={styles.consultContainer}>
            <TouchableOpacity
              style={styles.consultButton}
              activeOpacity={0.8}
              onPress={() => {
                try {
                  router.push('/consultation' as any);
                } catch {
                  Alert.alert('안내', '상담 예약 페이지는 준비 중입니다.');
                }
              }}
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.navy} />
              <Text style={styles.consultButtonText}>상담 예약하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Suggestion chips */}
        {remainingFaqs.length > 0 && !isTyping && (
          <View style={styles.chipsSection}>
            <Text style={styles.chipsLabel}>자주 묻는 질문</Text>
            {remainingFaqs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.chip}
                activeOpacity={0.7}
                onPress={() => handleFaqTap(faq)}
              >
                <View
                  style={[
                    styles.chipCategory,
                    {
                      backgroundColor:
                        (CATEGORY_COLORS[faq.category] || COLORS.gold) + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipCategoryText,
                      {
                        color:
                          CATEGORY_COLORS[faq.category] || COLORS.gold,
                      },
                    ]}
                  >
                    {faq.category}
                  </Text>
                </View>
                <Text style={styles.chipText}>{faq.question}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.gold}
                  style={styles.chipArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom spacer */}
        <View style={{ height: SPACING.md }} />
      </ScrollView>

      {/* ── Disclaimer bar ──────────────────────────────────────────────── */}
      <View style={styles.disclaimerBar}>
        <Ionicons
          name="shield-checkmark-outline"
          size={12}
          color={COLORS.slate}
        />
        <Text style={styles.disclaimerText}>
          이 챗봇은 법률정보 안내 목적이며, AI 생성 답변은 김창희 변호사가
          검토하였습니다.
        </Text>
      </View>

      {/* ── Input bar ───────────────────────────────────────────────────── */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, SPACING.sm) }]}>
        <TextInput
          style={styles.textInput}
          placeholder="질문을 입력하세요..."
          placeholderTextColor={COLORS.lightText}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isTyping}
          activeOpacity={0.7}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() ? COLORS.navy : COLORS.lightText}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function BotBubble({ text }: { text: string }) {
  return (
    <View style={styles.botRow}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>김</Text>
      </View>
      <View style={styles.botBubble}>
        <Text style={styles.botBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <View style={styles.userRow}>
      <View style={styles.userBubble}>
        <Text style={styles.userBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={styles.botRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>김</Text>
      </View>
      <View style={[styles.botBubble, styles.typingBubble]}>
        <Text style={styles.typingDots}>...</Text>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  // Header
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.goldLight,
    fontWeight: '600',
  },

  // Chat
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },

  // Bot bubble
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
    maxWidth: '85%',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.goldLight,
  },
  botBubble: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    flexShrink: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  botBubbleText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 22,
  },

  // User bubble
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.md,
  },
  userBubble: {
    backgroundColor: COLORS.gold,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    maxWidth: '80%',
  },
  userBubbleText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    lineHeight: 22,
    fontWeight: '500',
  },

  // Typing
  typingBubble: {
    paddingHorizontal: SPACING.lg,
  },
  typingDots: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.lightText,
    letterSpacing: 3,
    fontWeight: '700',
  },

  // Consultation button
  consultContainer: {
    alignItems: 'flex-start',
    marginLeft: 40,
    marginBottom: SPACING.md,
  },
  consultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  consultButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.navy,
  },

  // Chips
  chipsSection: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chipsLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    marginLeft: 40,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  chipCategory: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    flexShrink: 0,
  },
  chipCategoryText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  chipText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    lineHeight: 18,
  },
  chipArrow: {
    marginLeft: SPACING.xs,
  },

  // Disclaimer
  disclaimerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    backgroundColor: COLORS.warmWhite,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.borderLight,
    gap: 4,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 10,
    color: COLORS.slate,
    lineHeight: 14,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.cardBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.cream,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    lineHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.borderLight,
  },
});
