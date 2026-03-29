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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import ChatBubble from '@/components/ChatBubble';
import ComplaintPhaseBar from '@/components/ComplaintPhaseBar';
import ComplaintPreview from '@/components/ComplaintPreview';
import type { MaskingOption } from '@/constants/consent';
import {
  startComplaintSession,
  handleResponse,
  getCurrentPhase,
  getCollectedData,
  isComplete,
  pauseSession,
  resumeSession,
  resetSession,
} from '@/lib/complaint-secretary';
import {
  generateComplaint,
  generateComplaintText,
  mergeEvidenceFromVault,
  generateWarningLetter,
  generateStopContactRequest,
  generateNoApproachRequest,
  generateEvidenceReport,
  recommendResponseStage,
} from '@/lib/complaint-generator';
import type { ComplaintDocument } from '@/lib/complaint-generator';
import { SecureEvidenceItem, loadAllEvidence } from '@/lib/secure-evidence';
import {
  generateComplaintHTML,
  createComplaintPDF,
  shareComplaintPDF,
  generateWarningLetterHTML,
  generateEvidenceReportHTML,
} from '@/lib/complaint-pdf';
import { DOCUMENT_TYPES, RESPONSE_STAGE_CRITERIA } from '@/constants/complaint';
import type { DocumentType } from '@/constants/complaint';
import type { ComplaintPhase, ComplaintDraftData } from '@/types/database';

const COMPLAINT_SESSION_ID = 'complaint-session-main';
const TYPING_DELAY = 500;

// ─── Typing indicator (3 animated dots) ─────────────────────────────
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
        <Ionicons name="document-text" size={14} color={COLORS.gold} />
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

// ─── Consent Modal ──────────────────────────────────────────────────
function ConsentStep({ onAgree }: { onAgree: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <View style={styles.consentContainer}>
      <View style={styles.consentCard}>
        <View style={styles.consentIconWrap}>
          <Ionicons name="document-text" size={40} color={COLORS.gold} />
        </View>
        <Text style={styles.consentTitle}>AI 고소장 자동 작성</Text>
        <Text style={styles.consentSubtitle}>
          법률사무장이 대화를 통해{'\n'}고소장 작성에 필요한 내용을 수집합니다
        </Text>

        <View style={styles.consentInfoCard}>
          <View style={styles.consentInfoRow}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.sage} />
            <Text style={styles.consentInfoText}>대화 내용은 기기 내에만 저장됩니다</Text>
          </View>
          <View style={styles.consentInfoRow}>
            <Ionicons name="lock-closed" size={18} color={COLORS.sage} />
            <Text style={styles.consentInfoText}>개인정보 마스킹 옵션을 제공합니다</Text>
          </View>
          <View style={styles.consentInfoRow}>
            <Ionicons name="time" size={18} color={COLORS.sage} />
            <Text style={styles.consentInfoText}>언제든 중단하고 이어서 작성할 수 있습니다</Text>
          </View>
          <View style={styles.consentInfoRow}>
            <Ionicons name="person" size={18} color={COLORS.sage} />
            <Text style={styles.consentInfoText}>최종 고소장은 변호사 검토를 권장합니다</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.consentCheckRow}
          onPress={() => setChecked(!checked)}
          activeOpacity={0.7}
        >
          <View style={[styles.consentCheckbox, checked && styles.consentCheckboxChecked]}>
            {checked && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
          </View>
          <Text style={styles.consentCheckLabel}>
            위 안내를 확인하였으며, AI가 작성한 초안임을 이해합니다
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.consentButton, !checked && styles.consentButtonDisabled]}
          onPress={onAgree}
          disabled={!checked}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubbles" size={20} color={COLORS.white} />
          <Text style={styles.consentButtonText}>고소장 작성 시작</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimerText}>
        본 서비스에서 생성되는 고소장은 AI 초안이며,{'\n'}
        법적 효력을 위해 변호사 검토를 권장합니다.{'\n'}
        법률사무소 청송 / 대표변호사 김창희
      </Text>
    </View>
  );
}

// ─── Download complete step ─────────────────────────────────────────
function DownloadComplete({ onGoHome }: { onGoHome: () => void }) {
  return (
    <View style={styles.downloadCompleteContainer}>
      <View style={styles.downloadCompleteCard}>
        <View style={styles.downloadCheckWrap}>
          <Ionicons name="checkmark-circle" size={64} color={COLORS.sage} />
        </View>
        <Text style={styles.downloadCompleteTitle}>서류 PDF 생성 완료</Text>
        <Text style={styles.downloadCompleteDesc}>
          생성된 서류 파일을 확인해 주세요.{'\n'}
          필요에 따라 제출하시면 됩니다.
        </Text>

        <View style={styles.downloadTipCard}>
          <Text style={styles.downloadTipTitle}>제출 안내</Text>
          <View style={styles.downloadTipRow}>
            <Text style={styles.downloadTipBullet}>1.</Text>
            <Text style={styles.downloadTipText}>
              가까운 경찰서 민원실을 방문해 주세요
            </Text>
          </View>
          <View style={styles.downloadTipRow}>
            <Text style={styles.downloadTipBullet}>2.</Text>
            <Text style={styles.downloadTipText}>
              "고소장을 제출하러 왔다"고 말씀하세요
            </Text>
          </View>
          <View style={styles.downloadTipRow}>
            <Text style={styles.downloadTipBullet}>3.</Text>
            <Text style={styles.downloadTipText}>
              PDF를 출력하거나 휴대폰으로 보여주셔도 됩니다
            </Text>
          </View>
          <View style={styles.downloadTipRow}>
            <Text style={styles.downloadTipBullet}>4.</Text>
            <Text style={styles.downloadTipText}>
              증거자료도 함께 제출하시면 수사에 도움이 됩니다
            </Text>
          </View>
        </View>

        <View style={styles.downloadWarning}>
          <Ionicons name="information-circle" size={16} color={COLORS.gold} />
          <Text style={styles.downloadWarningText}>
            변호사 검토를 받으시면 고소장의 법적 완성도가 높아집니다
          </Text>
        </View>

        <TouchableOpacity
          style={styles.goHomeButton}
          onPress={onGoHome}
          activeOpacity={0.85}
        >
          <Text style={styles.goHomeButtonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimerText}>
        본 고소장은 AI가 작성한 초안이며,{'\n'}
        법률사무소 청송 담당 변호사의 검토를 거쳐 최종 확정됩니다.
      </Text>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────
export default function ComplaintScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep] = useState<'consent' | 'chat' | 'document_select' | 'preview' | 'download'>('consent');

  // Chat state
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [chatPhase, setChatPhase] = useState<ComplaintPhase>('safety');
  const [completedPhases, setCompletedPhases] = useState<ComplaintPhase[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Document select state
  const [recommendedStage, setRecommendedStage] = useState<'warning' | 'police_report' | 'complaint'>('warning');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | 'all' | null>(null);

  // Preview state
  const [complaintDoc, setComplaintDoc] = useState<ComplaintDocument | null>(null);
  const [complaintText, setComplaintText] = useState('');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [maskingLevel, setMaskingLevel] = useState<MaskingOption['level']>('none');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // ── Helpers ──
  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${role}-${Date.now()}-${Math.random()}`, role, content },
    ]);
    scrollToBottom();
  }, [scrollToBottom]);

  const botReply = useCallback((content: string, delay = TYPING_DELAY) => {
    setIsTyping(true);
    scrollToBottom();
    setTimeout(() => {
      setIsTyping(false);
      addMessage('assistant', content);
    }, delay);
  }, [addMessage, scrollToBottom]);

  // ── Start session ──
  const handleConsent = useCallback(() => {
    setStep('chat');
    resetSession(COMPLAINT_SESSION_ID);
    const firstMsg = startComplaintSession(COMPLAINT_SESSION_ID);
    setChatPhase(firstMsg.phase);

    // Build initial question text including options if present
    let msgText = firstMsg.text;
    if (firstMsg.options && firstMsg.options.length > 0) {
      msgText += '\n\n' + firstMsg.options.map((o) => `  ${o.label}`).join('\n');
    }
    botReply(msgText, 800);
  }, [botReply]);

  // ── Send message ──
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || isTyping) return;
    setInputText('');
    addMessage('user', text);

    const response = handleResponse(COMPLAINT_SESSION_ID, text);
    const newPhase = getCurrentPhase(COMPLAINT_SESSION_ID);
    if (newPhase !== chatPhase) {
      setCompletedPhases((prev) =>
        prev.includes(chatPhase) ? prev : [...prev, chatPhase],
      );
    }
    setChatPhase(newPhase);

    let replyText = response.text;
    if (response.options && response.options.length > 0) {
      replyText += '\n\n' + response.options.map((o) => `  ${o.label}`).join('\n');
    }
    botReply(replyText);

    // Check if complete — go to document_select
    if (isComplete(COMPLAINT_SESSION_ID)) {
      setSessionComplete(true);
      const data = getCollectedData(COMPLAINT_SESSION_ID);
      const stage = recommendResponseStage(data as Partial<ComplaintDraftData>);
      setRecommendedStage(stage);
      setTimeout(() => {
        botReply(
          '모든 정보 수집이 완료되었습니다.\n' +
          '어떤 서류를 생성할지 선택해 주세요.\n\n' +
          '수고하셨습니다.',
          TYPING_DELAY,
        );
        setTimeout(() => setStep('document_select'), TYPING_DELAY + 800);
      }, TYPING_DELAY + 600);
    }
  }, [inputText, isTyping, addMessage, botReply]);

  // ── Generate complaint preview ──
  const handleGeneratePreview = useCallback(async () => {
    try {
      const data = getCollectedData(COMPLAINT_SESSION_ID);

      // Build complainant info
      const complainant = {
        name: data.stage2_complainant?.name || '',
        birthDate: data.stage2_complainant?.birth_date,
        address: data.stage2_complainant?.address,
        phone: data.stage2_complainant?.phone,
        job: data.stage2_complainant?.occupation,
      };

      // Build suspect info
      const suspect = {
        name: data.stage3_suspect?.name || '',
        address: data.stage3_suspect?.address,
        phone: data.stage3_suspect?.phone,
      };

      // Build crime facts
      const crimeFacts = (data.stage4_crime?.incidents || []).map((inc: any) => ({
        crimeType: inc.crime_type || 'stalking',
        when: inc.when || '',
        where: inc.where || '',
        what: inc.what || '',
        how: inc.how || '',
        detail: inc.detail || inc.what || '',
      }));

      // If no incidents, create a minimal one from crime types
      if (crimeFacts.length === 0 && data.stage4_crime?.crime_types) {
        for (const ct of data.stage4_crime.crime_types) {
          crimeFacts.push({
            crimeType: ct,
            when: '',
            where: '',
            what: '',
            how: '',
            detail: `${ct} 피해 사실`,
          });
        }
      }

      // Merge evidence from vault
      const evidenceIds = data.stage5_evidence?.vault_evidence_ids || [];
      let evidenceItems: any[] = [];
      try {
        evidenceItems = await mergeEvidenceFromVault(evidenceIds);
      } catch {
        // Evidence merge may fail if vault is empty, continue
      }

      // Build damage description from sub-fields
      const damageParts: string[] = [];
      if (data.stage6_damage?.physical_damage?.description) {
        damageParts.push(`신체적 피해: ${data.stage6_damage.physical_damage.description}`);
      }
      if (data.stage6_damage?.mental_damage?.symptoms?.length) {
        damageParts.push(`정신적 피해: ${data.stage6_damage.mental_damage.symptoms.join(', ')}`);
      }
      if (data.stage6_damage?.financial_damage?.total_amount) {
        damageParts.push(`재산적 피해: ${data.stage6_damage.financial_damage.total_amount.toLocaleString()}원`);
      }
      if (data.stage6_damage?.social_damage?.description) {
        damageParts.push(`사회적 피해: ${data.stage6_damage.social_damage.description}`);
      }
      const damageDescription = damageParts.join('\n');

      const complaint = generateComplaint(
        {
          complainant,
          suspect,
          relationship: data.stage3_suspect?.relationship || '',
          relationshipDetail: `${complainant.name}(고소인)과 ${suspect.name || '피고소인'}은(는) ${data.stage3_suspect?.relationship || '관계'} 관계이며, ${data.stage3_suspect?.dating_period ? `교제 기간은 ${data.stage3_suspect.dating_period}이고, ` : ''}${data.stage3_suspect?.breakup_date ? `${data.stage3_suspect.breakup_date}경 이별하였다.` : ''}`,
          crimeTypes: data.stage4_crime?.crime_types || [],
          crimeFacts,
          damageDescription,
          punishmentRequest: data.stage7_punishment?.additional_requests || '피고소인을 엄벌에 처하여 주시기 바랍니다.',
          policeStation: data.stage7_punishment?.target_police_station || '○○경찰서장',
          maskingLevel: 'none',
        },
        evidenceItems,
      );

      setComplaintDoc(complaint);
      const text = generateComplaintText(complaint);
      setComplaintText(text);
      setStep('preview');
    } catch (error) {
      console.error('[고소장] 미리보기 생성 실패:', error);
      Alert.alert(
        '고소장 생성 오류',
        '수집된 정보로 고소장을 생성하는 중 문제가 발생했습니다.\n다시 시도해 주세요.',
      );
    }
  }, []);

  // ── Change masking and regenerate text ──
  const handleMaskingChange = useCallback((level: MaskingOption['level']) => {
    setMaskingLevel(level);
    if (complaintDoc) {
      const updated = { ...complaintDoc, maskingLevel: level };
      setComplaintDoc(updated);
      setComplaintText(generateComplaintText(updated));
    }
  }, [complaintDoc]);

  // ── Generate and share PDF ──
  const handleDownloadPDF = useCallback(async () => {
    setIsGeneratingPDF(true);
    try {
      let html = '';
      if (complaintDoc) {
        html = generateComplaintHTML(complaintDoc);
      } else if (previewHtml) {
        html = previewHtml;
      } else {
        throw new Error('생성할 서류가 없습니다.');
      }
      const fileUri = await createComplaintPDF(html);
      await shareComplaintPDF(fileUri);
      setStep('download');
    } catch (error: any) {
      console.error('[서류] PDF 생성 실패:', error);
      Alert.alert(
        'PDF 생성 오류',
        error?.message || 'PDF를 생성하는 중 문제가 발생했습니다.',
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [complaintDoc, previewHtml]);

  // ── Document type selection → generate and go to preview ──
  const handleDocumentSelect = useCallback(async (docType: DocumentType | 'all') => {
    setSelectedDocType(docType);
    try {
      const data = getCollectedData(COMPLAINT_SESSION_ID) as Partial<ComplaintDraftData>;

      if (docType === 'complaint' || docType === 'all') {
        // Generate complaint as before (fall through to handleGeneratePreview)
        await handleGeneratePreview();
        return;
      }

      let text = '';
      let html = '';

      if (docType === 'warning_letter_strong') {
        text = generateWarningLetter(data, 'strong');
        html = generateWarningLetterHTML(text, 'strong');
      } else if (docType === 'warning_letter_moderate') {
        text = generateWarningLetter(data, 'moderate');
        html = generateWarningLetterHTML(text, 'moderate');
      } else if (docType === 'stop_contact_request') {
        text = generateStopContactRequest(data);
        html = generateWarningLetterHTML(text, 'moderate'); // reuse moderate style
      } else if (docType === 'no_approach_request') {
        text = generateNoApproachRequest(data);
        html = generateWarningLetterHTML(text, 'strong'); // reuse strong style
      } else if (docType === 'evidence_report') {
        let evidence: SecureEvidenceItem[] = [];
        try {
          evidence = await loadAllEvidence();
        } catch {
          // vault may be empty
        }
        text = generateEvidenceReport(data, evidence);
        html = generateEvidenceReportHTML(text);
      }

      setComplaintText(text);
      setPreviewHtml(html);
      setStep('preview');
    } catch (error) {
      console.error('[서류 생성] 실패:', error);
      Alert.alert('서류 생성 오류', '서류를 생성하는 중 문제가 발생했습니다.\n다시 시도해 주세요.');
    }
  }, []);

  // ── Edit (go back to chat) ──
  const handleEdit = useCallback(() => {
    setStep('chat');
  }, []);

  // ── Pause ──
  const handlePause = useCallback(() => {
    setIsPaused(true);
    pauseSession(COMPLAINT_SESSION_ID);
    addMessage('user', '지금은 여기까지만 하고 싶어요');
    botReply(
      '알겠습니다. 지금까지 내용은 안전하게 저장해 두었어요.\n' +
      '언제든 다시 오시면 이어서 진행하겠습니다.\n\n' +
      '법률사무소 청송 / 대표변호사 김창희',
    );
  }, [addMessage, botReply]);

  // ── Resume ──
  const handleResume = useCallback(() => {
    setIsPaused(false);
    const msg = resumeSession(COMPLAINT_SESSION_ID);
    setChatPhase(msg.phase);
    let replyText = msg.text;
    if (msg.options && msg.options.length > 0) {
      replyText += '\n\n' + msg.options.map((o) => `  ${o.label}`).join('\n');
    }
    botReply(replyText);
  }, [botReply]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarRing}>
            <View style={styles.headerAvatar}>
              <Ionicons name="document-text" size={14} color={COLORS.gold} />
            </View>
          </View>
          <Text style={styles.headerTitle}>법률서류 작성</Text>
        </View>

        <View style={styles.backBtn} />
      </View>

      {/* Step: consent */}
      {step === 'consent' && (
        <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.consentScroll}>
          <ConsentStep onAgree={handleConsent} />
        </ScrollView>
      )}

      {/* Step: chat */}
      {step === 'chat' && (
        <>
          <ComplaintPhaseBar currentPhase={chatPhase} completedPhases={completedPhases} />

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
                return (
                  <ChatBubble
                    key={msg.id}
                    type={isBot ? 'bot' : 'user'}
                    text={msg.content}
                    showAvatar={isBot && (idx === 0 || messages[idx - 1]?.role !== 'assistant')}
                  />
                );
              })}

              {isTyping && <TypingIndicator />}

              {/* Session complete indicator */}
              {sessionComplete && !isTyping && (
                <View style={styles.completionCard}>
                  <View style={styles.completionIconRow}>
                    <Ionicons name="checkmark-circle" size={28} color={COLORS.sage} />
                  </View>
                  <Text style={styles.completionTitle}>정보 수집 완료</Text>
                  <Text style={styles.completionDesc}>
                    고소장 미리보기를 준비하고 있습니다...
                  </Text>
                  <ActivityIndicator size="small" color={COLORS.gold} style={{ marginTop: SPACING.sm }} />
                </View>
              )}
            </ScrollView>

            {/* Bottom input area */}
            {!isPaused && !sessionComplete && (
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
                  onPress={handleResume}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resumeBtnText}>대화 다시 시작하기</Text>
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </>
      )}

      {/* Step: document_select */}
      {step === 'document_select' && (
        <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.docSelectScroll}>
          <View style={styles.docSelectContainer}>
            {/* Recommended stage badge */}
            <View style={styles.docSelectBadge}>
              <Ionicons name="bulb" size={18} color={COLORS.gold} />
              <Text style={styles.docSelectBadgeText}>
                AI 추천: {RESPONSE_STAGE_CRITERIA[recommendedStage].label}
              </Text>
            </View>
            <Text style={styles.docSelectBadgeDesc}>
              {RESPONSE_STAGE_CRITERIA[recommendedStage].description}
            </Text>

            <Text style={styles.docSelectTitle}>생성할 서류를 선택해 주세요</Text>

            {/* Document cards */}
            {DOCUMENT_TYPES.map((doc) => {
              const isRecommended =
                (recommendedStage === 'warning' && doc.stage === 1) ||
                (recommendedStage === 'police_report' && doc.stage <= 2) ||
                (recommendedStage === 'complaint' && doc.stage <= 3);
              return (
                <TouchableOpacity
                  key={doc.type}
                  style={[styles.docCard, isRecommended && styles.docCardRecommended]}
                  onPress={() => handleDocumentSelect(doc.type)}
                  activeOpacity={0.7}
                >
                  <View style={styles.docCardLeft}>
                    <View style={[styles.docCardIcon, isRecommended && styles.docCardIconRecommended]}>
                      <Ionicons name={doc.icon as any} size={22} color={isRecommended ? COLORS.gold : COLORS.slate} />
                    </View>
                  </View>
                  <View style={styles.docCardRight}>
                    <View style={styles.docCardRow}>
                      <Text style={styles.docCardLabel}>{doc.label}</Text>
                      {isRecommended && (
                        <View style={styles.docCardRecommendBadge}>
                          <Text style={styles.docCardRecommendText}>추천</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.docCardDesc}>{doc.description}</Text>
                    <Text style={styles.docCardStage}>{doc.stage}단계 대응</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.lightText} />
                </TouchableOpacity>
              );
            })}

            {/* "Generate all" card */}
            <TouchableOpacity
              style={[styles.docCard, styles.docCardAll]}
              onPress={() => handleDocumentSelect('all')}
              activeOpacity={0.7}
            >
              <View style={styles.docCardLeft}>
                <View style={[styles.docCardIcon, styles.docCardIconAll]}>
                  <Ionicons name="documents" size={22} color={COLORS.white} />
                </View>
              </View>
              <View style={styles.docCardRight}>
                <Text style={[styles.docCardLabel, { color: COLORS.white }]}>전부 만들기</Text>
                <Text style={[styles.docCardDesc, { color: 'rgba(255,255,255,0.8)' }]}>
                  모든 서류를 한 번에 생성합니다
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimerText}>
            서류 유형에 따라 적합한 양식이 자동으로 적용됩니다.{'\n'}
            법률사무소 청송 / 대표변호사 김창희
          </Text>
        </ScrollView>
      )}

      {/* Step: preview */}
      {step === 'preview' && (
        <ScrollView style={styles.scrollFlex}>
          <ComplaintPreview
            complaintText={complaintText}
            maskingLevel={maskingLevel}
            onMaskingChange={handleMaskingChange}
            onDownloadPDF={handleDownloadPDF}
            onEdit={handleEdit}
          />

          {/* 책임 한계 고지 (강화) */}
          <View style={styles.disclaimerWarningCard}>
            <View style={styles.disclaimerWarningHeader}>
              <Ionicons name="warning" size={22} color="#B91C1C" />
              <Text style={styles.disclaimerWarningTitle}>책임 한계 고지</Text>
            </View>
            <Text style={styles.disclaimerWarningBody}>
              이 서류는 AI가 생성한 초안입니다. 변호사 검토를 거치지 않았습니다.
            </Text>
            <Text style={styles.disclaimerWarningBody}>
              법적 효력을 보장하지 않으며, 제출 전 전문가 검토를 권장합니다.
            </Text>
            <TouchableOpacity
              style={styles.lawyerReviewCta}
              onPress={() => Alert.alert('변호사 검토', '변호사 검토 서비스 상담을 연결합니다.')}
              activeOpacity={0.85}
            >
              <Ionicons name="shield-checkmark" size={18} color={COLORS.white} />
              <Text style={styles.lawyerReviewCtaText}>변호사 검토 서비스 (199,000원)</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimerText}>
            법률사무소 청송 / 대표변호사 김창희
          </Text>
        </ScrollView>
      )}

      {/* Step: download */}
      {step === 'download' && (
        <ScrollView style={styles.scrollFlex}>
          <DownloadComplete onGoHome={() => router.replace('/(tabs)')} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  flex1: { flex: 1 },
  scrollFlex: { flex: 1 },

  // ── Header ──
  header: {
    backgroundColor: COLORS.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerAvatarRing: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(196,149,106,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },

  // ── Consent ──
  consentScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  consentContainer: {
    alignItems: 'center',
  },
  consentCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    ...SHADOW.md,
  },
  consentIconWrap: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  consentTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  consentSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.6,
    marginBottom: SPACING.lg,
  },
  consentInfoCard: {
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  consentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
  },
  consentInfoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    flex: 1,
    lineHeight: FONT_SIZE.sm * 1.5,
  },
  consentCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  consentCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentCheckboxChecked: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  consentCheckLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    flex: 1,
    lineHeight: FONT_SIZE.sm * 1.5,
  },
  consentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    minHeight: 52,
    ...SHADOW.md,
  },
  consentButtonDisabled: {
    backgroundColor: COLORS.borderLight,
  },
  consentButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },

  // ── Chat area ──
  chatArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  chatContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // ── Typing indicator ──
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: 6,
    ...SHADOW.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lightText,
  },

  // ── Input area ──
  inputArea: {
    backgroundColor: COLORS.warmWhite,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  pauseLink: {
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    marginBottom: SPACING.xs,
  },
  pauseLinkText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textDecorationLine: 'underline',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm + 4 : SPACING.sm + 2,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    minHeight: 42,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.borderLight,
  },
  resumeBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  resumeBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },

  // ── Completion card ──
  completionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  completionIconRow: {
    marginBottom: SPACING.sm,
  },
  completionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  completionDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: FONT_SIZE.sm * 1.6,
  },

  // ── Download complete ──
  downloadCompleteContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  downloadCompleteCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    ...SHADOW.md,
  },
  downloadCheckWrap: {
    marginBottom: SPACING.lg,
  },
  downloadCompleteTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: SPACING.sm,
  },
  downloadCompleteDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.6,
    marginBottom: SPACING.lg,
  },
  downloadTipCard: {
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  downloadTipTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.md,
  },
  downloadTipRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  downloadTipBullet: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.gold,
    width: 20,
  },
  downloadTipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    flex: 1,
    lineHeight: FONT_SIZE.sm * 1.5,
  },
  downloadWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.blush,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  downloadWarningText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    flex: 1,
    lineHeight: FONT_SIZE.sm * 1.5,
  },
  goHomeButton: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  goHomeButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },

  // ── Document select ──
  docSelectScroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  docSelectContainer: {
    gap: SPACING.sm,
  },
  docSelectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.blush,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  docSelectBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  docSelectBadgeDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginBottom: SPACING.md,
    lineHeight: FONT_SIZE.xs * 1.5,
  },
  docSelectTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: SPACING.sm,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  docCardRecommended: {
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  docCardLeft: {},
  docCardIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docCardIconRecommended: {
    backgroundColor: COLORS.blush,
  },
  docCardRight: {
    flex: 1,
  },
  docCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  docCardLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  docCardRecommendBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  docCardRecommendText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  docCardDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    lineHeight: FONT_SIZE.xs * 1.4,
    marginBottom: 2,
  },
  docCardStage: {
    fontSize: 10,
    color: COLORS.lightText,
  },
  docCardAll: {
    backgroundColor: COLORS.navy,
    marginTop: SPACING.xs,
  },
  docCardIconAll: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // ── Disclaimer ──
  disclaimerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: FONT_SIZE.xs * 1.6,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },

  // ── Disclaimer Warning Card (강화) ──
  disclaimerWarningCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  disclaimerWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  disclaimerWarningTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#B91C1C',
  },
  disclaimerWarningBody: {
    fontSize: FONT_SIZE.sm,
    color: '#991B1B',
    lineHeight: FONT_SIZE.sm * 1.6,
    marginBottom: SPACING.xs,
  },
  lawyerReviewCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#B91C1C',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
  },
  lawyerReviewCtaText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});
