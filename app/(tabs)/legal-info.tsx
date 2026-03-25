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

// ─── 공감형 대화 흐름 (정보 수집) ────────────────────────────────────────────

const EMPATHY_FLOW = [
  {
    keywords: ['따라', '미행', '쫓아', '추적', '스토킹', '감시', '찾아와'],
    empathy: '정말 무섭고 불안하셨겠어요. 누군가가 계속 따라다니는 건 명백한 스토킹 행위이고, 법으로 보호받으실 수 있습니다.',
    followUp: '혹시 이런 행동이 언제부터 시작되었는지 알려주실 수 있나요?',
    category: 'stalking',
  },
  {
    keywords: ['협박', '죽이', '죽겠', '자해', '자살', '가만 안', '가만안둬'],
    empathy: '그런 말을 듣고 얼마나 두려우셨을지 충분히 이해합니다. 당신의 안전이 가장 중요합니다.',
    followUp: '협박 내용이 담긴 메시지나 녹음이 있으신가요? 증거가 있으면 법적 대응이 훨씬 수월해집니다.',
    category: 'threat',
  },
  {
    keywords: ['사진', '영상', '유포', '퍼뜨리', '올리', '딥페이크', '몸캠', '촬영'],
    empathy: '정말 힘든 상황이시네요. 이건 심각한 범죄이고, 당신의 잘못이 절대 아닙니다. 도움을 받으실 수 있습니다.',
    followUp: '유포된 플랫폼이 어디인지 알고 계신가요? 삭제 요청과 법적 대응을 동시에 진행할 수 있습니다.',
    category: 'ncii',
  },
  {
    keywords: ['때리', '때렸', '폭행', '폭력', '맞았', '밀었', '밀치', '목', '조르'],
    empathy: '그런 일을 겪으셨다니 정말 마음이 아픕니다. 어떤 이유에서든 폭력은 절대 정당화될 수 없습니다.',
    followUp: '혹시 병원에 가시거나 진단서를 받으신 적이 있나요? 사진으로 상처를 기록해두신 것도 중요한 증거가 됩니다.',
    category: 'violence',
  },
  {
    keywords: ['헤어지', '이별', '끝내', '그만', '관계', '헤어졌'],
    empathy: '이별을 결심하셨군요. 용기 있는 결정이에요. 안전하게 이별을 진행하는 것이 가장 중요합니다.',
    followUp: '상대방에게 이별 의사를 전달하셨나요, 아니면 아직 준비 중이신가요?',
    category: 'breakup',
  },
  {
    keywords: ['연락', '전화', '문자', '카톡', '카카오', 'DM', '메시지', '안 받아'],
    empathy: '원하지 않는 연락이 계속되면 정말 지치고 불안하시죠. 충분히 이해합니다.',
    followUp: '하루에 몇 번 정도 연락이 오나요? 그리고 연락 내용을 캡처해두고 계신가요?',
    category: 'contact',
  },
  {
    keywords: ['무서', '불안', '두려', '겁', '걱정', '어떡', '어떻게'],
    empathy: '지금 많이 불안하시죠. 그 감정은 너무나 자연스러운 거예요. 당신은 혼자가 아닙니다.',
    followUp: '지금 상황을 좀 더 알려주시면, 어떤 보호를 받으실 수 있는지 구체적으로 안내해드릴 수 있어요. 어떤 일이 있으셨나요?',
    category: 'general',
  },
];

const FOLLOW_UP_RESPONSES: Record<string, string[]> = {
  stalking: [
    '감사합니다. 그 기간이면 스토킹처벌법 적용이 가능합니다.\n\n📌 알아두세요:\n• 2024년 개정법으로 반의사불벌죄가 폐지되어, 합의 없이도 처벌됩니다\n• 경찰이 즉시 100m 접근금지 조치를 할 수 있습니다\n• 전자발찌 부착도 가능합니다',
    '증거를 체계적으로 모아두시면 법적 대응이 훨씬 수월합니다.\n\n이별방패에서 도와드릴 수 있는 것:\n✅ 스토킹 사건 기록 (시간/장소 자동 기록)\n✅ 증거보관함 (SHA-256 무결성 보장)\n✅ 경찰 제출용 증거 보고서 작성\n✅ 변호사 명의 법률 경고장 발송\n\n어떤 도움이 필요하신가요?',
  ],
  threat: [
    '증거가 있다면 매우 중요합니다. 삭제하지 마시고 반드시 보관해주세요.\n\n📌 협박은 형법 제283조로 처벌됩니다:\n• 3년 이하 징역 또는 500만원 이하 벌금\n• 자해/자살 협박도 협박죄에 해당합니다\n\n지금 즉각적인 위협을 느끼시면 112에 신고해주세요.',
    '이별방패에서 바로 도와드릴 수 있습니다:\n\n✅ 변호사 명의 경고장 발송 (49,000원~)\n✅ 경찰 제출용 증거 분석 보고서 (99,000원)\n✅ AI 사무장과 상세 상담\n\n경고장만으로도 대부분 행위가 중단됩니다. 진행해볼까요?',
  ],
  ncii: [
    '지금 가장 중요한 건 증거를 보전하고, 빠르게 삭제 요청을 넣는 것입니다.\n\n📌 성폭력처벌법 제14조:\n• 불법 촬영/유포: 7년 이하 징역 또는 5,000만원 이하 벌금\n• 유포 협박: 1년 이상 징역\n• 딥페이크: 5년 이하 징역\n\n📞 D4U센터 (02-735-8994): 24시간 삭제 지원',
    '이별방패에서 바로 도와드릴 수 있습니다:\n\n✅ 플랫폼별 삭제 요청 템플릿 자동 생성\n✅ D4U센터 원터치 연결\n✅ 증거 보전 (스크린샷 + 해시값 기록)\n✅ 변호사 법률 대응\n\n긴급 삭제 대응을 시작할까요?',
  ],
  violence: [
    '진단서는 가장 강력한 증거 중 하나입니다. 가능하다면 꼭 받아두세요.\n\n📌 폭행죄 (형법 제260조):\n• 2년 이하 징역 또는 500만원 이하 벌금\n• 상해를 입은 경우: 7년 이하 징역 또는 1,000만원 이하 벌금\n\n사진, 진단서, 목격자 진술 모두 증거가 됩니다.',
    '이별방패에서 안전하게 대응할 수 있습니다:\n\n✅ 증거 수집 & 포렌식 보관\n✅ 경찰 제출용 보고서 작성\n✅ 변호사 경고장 발송\n✅ 이별 경호 서비스 (경호원 동행)\n\n안전 계획부터 세워볼까요?',
  ],
  breakup: [
    '안전한 이별이 가장 중요합니다.\n\n📌 이별 시 주의할 점:\n• 공공장소에서 만나세요\n• 신뢰할 수 있는 사람에게 알리세요\n• 상대 차를 타지 마세요\n• 녹음 준비를 해두세요\n\n이별 후 위협이 있을 경우 즉시 법적 대응이 가능합니다.',
    '이별방패에서 도와드릴 수 있습니다:\n\n✅ 위험도 정밀진단 (상대방 위험 평가)\n✅ 안전 탈출 계획 수립\n✅ 이별 경호 서비스 (전문 경호원 동행)\n✅ 이별 후 변호사 경고장 즉시 발송\n\n먼저 위험도 진단부터 해볼까요?',
  ],
  contact: [
    '원치 않는 반복 연락은 스토킹에 해당할 수 있습니다.\n\n📌 스토킹처벌법:\n• 반복적 연락 = 스토킹 행위\n• 3년 이하 징역 또는 3,000만원 이하 벌금\n• 부재중 전화 수십 회만으로도 유죄 판결 (대법원 2023.5.18.)\n\n연락 내용을 캡처해두시는 게 중요합니다.',
    '이별방패 연락 모니터링 기능을 활용하시면:\n\n✅ 연락 빈도를 자동으로 기록\n✅ 에스컬레이션 감지 시 경고\n✅ 기록이 그대로 증거로 활용\n✅ 변호사 경고장으로 즉시 연결\n\n지금 바로 시작할까요?',
  ],
  general: [
    '이해합니다. 천천히 말씀해주셔도 괜찮아요.\n\n지금 겪고 계신 상황에 따라 다양한 법적 보호를 받으실 수 있습니다:\n\n• 스토킹 → 접근금지명령\n• 협박 → 형사 고소\n• 사진/영상 유포 → 긴급 삭제 + 형사 고소\n• 폭행 → 형사 고소 + 접근금지\n\n어떤 상황에 가장 가까우신가요?',
  ],
};

function findEmpathyResponse(text: string): { empathy: string; followUp: string; category: string } | null {
  const lower = text.toLowerCase();
  for (const flow of EMPATHY_FLOW) {
    if (flow.keywords.some(kw => lower.includes(kw))) {
      return flow;
    }
  }
  return null;
}

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
  const [conversationCategory, setConversationCategory] = useState<string | null>(null);
  const [followUpIndex, setFollowUpIndex] = useState(0);

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

  // Handle free text send — 공감형 대화 흐름
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

    // 1) 키워드 매칭으로 공감 응답
    const empathy = findEmpathyResponse(trimmed);
    if (empathy) {
      setConversationCategory(empathy.category);
      setFollowUpIndex(0);
      addBotMessage(`${empathy.empathy}\n\n${empathy.followUp}`, () => scrollToBottom());
      return;
    }

    // 2) 이미 카테고리가 설정된 경우 후속 응답
    if (conversationCategory && FOLLOW_UP_RESPONSES[conversationCategory]) {
      const responses = FOLLOW_UP_RESPONSES[conversationCategory];
      const idx = Math.min(followUpIndex, responses.length - 1);
      setFollowUpIndex((prev) => prev + 1);

      addBotMessage(responses[idx], () => {
        if (idx >= responses.length - 1) {
          setShowConsultButton(true);
        }
        scrollToBottom();
      });
      return;
    }

    // 3) 매칭 안 되면 공감 + 안내
    addBotMessage(
      '말씀해주셔서 감사합니다. 조금 더 구체적으로 알려주시면 더 정확한 안내를 드릴 수 있어요.\n\n예를 들어:\n• "자꾸 따라다녀요" (스토킹)\n• "사진을 퍼뜨리겠다고 해요" (디지털 성범죄)\n• "때린 적이 있어요" (폭행)\n• "헤어지고 싶어요" (이별 준비)\n\n어떤 상황이신가요?',
      () => scrollToBottom()
    );
  }, [inputText, isTyping, addBotMessage, scrollToBottom, conversationCategory, followUpIndex]);

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
