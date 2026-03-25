import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW, Fonts } from '@/constants/theme';
import {
  generateLetterDraft1,
  generateLetterDraft2,
  LETTER_STATUS_CONFIG,
  LetterData,
} from '@/constants/letter-templates';

// ─── Mock Data ────────────────────────────────────────────

const MOCK_LETTER_DATA: LetterData = {
  senderName: '김**',
  senderAddress: '서울특별시 강남구 테헤란로 123',
  senderPhone: '010-****-1234',
  recipientName: '이**',
  recipientAddress: '서울특별시 서초구 서초대로 456',
  recipientPhone: '010-****-5678',
  recipientEmail: '',
  relationship: '전 연인',
  breakupDate: '2026년 2월 15일',
  harassmentTypes: [
    '반복적인 전화/문자',
    '미행/추적/감시',
    '주거지/직장 방문',
    '협박/위협적 언행',
  ],
  harassmentDetail:
    '2026년 3월 1일부터 하루 평균 30회 이상 전화, 3월 5일 직장 앞에서 3시간 대기, 3월 10일 "가만 안 두겠다" 문자 발송',
  evidenceSummary: [
    '카카오톡/문자 캡처',
    '통화 녹음',
    'CCTV 영상',
    '이별방패 증거보관함 기록',
  ],
  demands: ['일체의 연락 중단', '주거지/직장 접근 금지', 'SNS 접촉 중단'],
  sendMethod: '내용증명 우편 발송 (99,000원)',
};

type LetterStatusKey = keyof typeof LETTER_STATUS_CONFIG;
type DeliveryMethod = 'certified' | 'email' | 'sns';
type DraftTab = 'draft1' | 'draft2';

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const DELIVERY_OPTIONS: { key: DeliveryMethod; label: string; icon: string }[] = [
  { key: 'certified', label: '내용증명', icon: 'mail' },
  { key: 'email', label: '이메일', icon: 'at' },
  { key: 'sns', label: 'SNS', icon: 'chatbubble' },
];

// ─── Risk Level Calculation ───────────────────────────────

function getRiskLevel(types: string[]): { label: string; color: string; level: number } {
  const highRisk = ['협박/위협적 언행', '폭행/신체적 폭력', '자해/자살 협박', '사진/영상 유포 협박'];
  const highCount = types.filter((t) => highRisk.includes(t)).length;
  if (highCount >= 2 || types.length >= 5) return { label: '위험 (높음)', color: COLORS.danger, level: 3 };
  if (highCount >= 1 || types.length >= 3) return { label: '주의 (중간)', color: COLORS.warning, level: 2 };
  return { label: '관찰 (낮음)', color: COLORS.sage, level: 1 };
}

// ─── Component ────────────────────────────────────────────

export default function AdminLetterGenerator() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [currentStatus, setCurrentStatus] = useState<LetterStatusKey>('draft_ready');
  const [activeTab, setActiveTab] = useState<DraftTab>('draft1');
  const [selectedDraft, setSelectedDraft] = useState<DraftTab | null>(null);
  const [editText, setEditText] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('certified');
  const [recipientAddress, setRecipientAddress] = useState(MOCK_LETTER_DATA.recipientAddress);
  const [recipientContact, setRecipientContact] = useState(MOCK_LETTER_DATA.recipientEmail || MOCK_LETTER_DATA.recipientPhone);

  const draft1 = useMemo(() => generateLetterDraft1(MOCK_LETTER_DATA), []);
  const draft2 = useMemo(() => generateLetterDraft2(MOCK_LETTER_DATA), []);
  const risk = useMemo(() => getRiskLevel(MOCK_LETTER_DATA.harassmentTypes), []);

  const dataComplete =
    !!MOCK_LETTER_DATA.senderName &&
    !!MOCK_LETTER_DATA.recipientName &&
    MOCK_LETTER_DATA.harassmentTypes.length > 0;

  // ── Handlers ──

  const handleSelectDraft = (tab: DraftTab) => {
    setSelectedDraft(tab);
    setEditText(tab === 'draft1' ? draft1 : draft2);
    setCurrentStatus('lawyer_review');
  };

  const handleApproveAndSend = () => {
    Alert.alert('발송 확인', '경고장이 발송되었습니다.\n상태가 "발송 완료"로 변경됩니다.', [
      {
        text: '확인',
        onPress: () => setCurrentStatus('sent'),
      },
    ]);
  };

  const handleRequestEdit = () => {
    setSelectedDraft(null);
    setCurrentStatus('draft_ready');
  };

  const handleReject = () => {
    Alert.alert('반려', '추가 정보가 필요합니다.\n의뢰인에게 알림이 전송됩니다.', [
      { text: '확인' },
    ]);
  };

  // ── Render helpers ──

  const renderStatusFlow = () => {
    const steps: LetterStatusKey[] = ['draft_ready', 'lawyer_review', 'approved', 'sent'];
    const currentIdx = steps.indexOf(currentStatus);

    return (
      <View style={styles.statusFlow}>
        {steps.map((step, idx) => {
          const cfg = LETTER_STATUS_CONFIG[step];
          const isActive = idx <= currentIdx;
          return (
            <React.Fragment key={step}>
              {idx > 0 && (
                <View style={[styles.statusLine, isActive && { backgroundColor: cfg.color }]} />
              )}
              <View style={styles.statusStep}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isActive ? cfg.color : COLORS.borderLight },
                  ]}
                >
                  <Ionicons
                    name={cfg.icon as any}
                    size={12}
                    color={isActive ? COLORS.white : COLORS.lightText}
                  />
                </View>
                <Text
                  style={[
                    styles.statusStepLabel,
                    isActive && { color: COLORS.darkText, fontWeight: '600' },
                  ]}
                >
                  {cfg.label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const renderCaseSummary = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>사건 요약</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: dataComplete ? COLORS.sage + '20' : COLORS.coral + '20' },
          ]}
        >
          <Ionicons
            name={dataComplete ? 'checkmark-circle' : 'alert-circle'}
            size={14}
            color={dataComplete ? COLORS.sage : COLORS.coral}
          />
          <Text
            style={[
              styles.badgeText,
              { color: dataComplete ? COLORS.sage : COLORS.coral },
            ]}
          >
            {dataComplete ? '정보 수집 완료' : '정보 부족'}
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>의뢰인</Text>
          <Text style={styles.summaryValue}>{MOCK_LETTER_DATA.senderName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>관계</Text>
          <Text style={styles.summaryValue}>{MOCK_LETTER_DATA.relationship}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>이별일</Text>
          <Text style={styles.summaryValue}>{MOCK_LETTER_DATA.breakupDate}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>상대방</Text>
          <Text style={styles.summaryValue}>{MOCK_LETTER_DATA.recipientName}</Text>
        </View>
      </View>

      {/* Harassment Types */}
      <Text style={styles.subLabel}>피해 유형</Text>
      <View style={styles.badgeRow}>
        {MOCK_LETTER_DATA.harassmentTypes.map((type) => (
          <View key={type} style={[styles.badge, { backgroundColor: COLORS.coral + '15' }]}>
            <Text style={[styles.badgeText, { color: COLORS.coral }]}>{type}</Text>
          </View>
        ))}
      </View>

      {/* Evidence */}
      <Text style={styles.subLabel}>확보 증거</Text>
      <View style={styles.badgeRow}>
        {MOCK_LETTER_DATA.evidenceSummary.map((ev) => (
          <View key={ev} style={[styles.badge, { backgroundColor: COLORS.blue + '15' }]}>
            <Ionicons name="document-attach" size={12} color={COLORS.blue} />
            <Text style={[styles.badgeText, { color: COLORS.blue }]}>{ev}</Text>
          </View>
        ))}
      </View>

      {/* Risk Level */}
      <View style={styles.riskRow}>
        <Text style={styles.subLabel}>위험도</Text>
        <View style={[styles.riskBadge, { backgroundColor: risk.color + '18' }]}>
          <Ionicons
            name={risk.level >= 3 ? 'warning' : risk.level >= 2 ? 'alert-circle' : 'shield-checkmark'}
            size={14}
            color={risk.color}
          />
          <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
        </View>
        <View style={styles.riskBar}>
          {[1, 2, 3].map((lv) => (
            <View
              key={lv}
              style={[
                styles.riskSegment,
                { backgroundColor: lv <= risk.level ? risk.color : COLORS.borderLight },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const renderLetterDocument = (text: string, tab: DraftTab) => (
    <View style={styles.letterDocument}>
      <ScrollView
        style={styles.letterScroll}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.letterText}>{text}</Text>
      </ScrollView>
      {!selectedDraft && (
        <TouchableOpacity
          style={styles.selectDraftBtn}
          onPress={() => handleSelectDraft(tab)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
          <Text style={styles.selectDraftBtnText}>이 안 선택</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDraftSection = () => {
    if (isWide) {
      // Side-by-side on wide screens
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI 생성 초안</Text>
          <View style={styles.sideBySide}>
            <View style={styles.sideColumn}>
              <View style={styles.draftLabel}>
                <Ionicons name="flame" size={16} color={COLORS.coral} />
                <Text style={styles.draftLabelText}>제1안 (강경)</Text>
              </View>
              {renderLetterDocument(draft1, 'draft1')}
            </View>
            <View style={styles.sideColumn}>
              <View style={styles.draftLabel}>
                <Ionicons name="leaf" size={16} color={COLORS.sage} />
                <Text style={styles.draftLabelText}>제2안 (온건)</Text>
              </View>
              {renderLetterDocument(draft2, 'draft2')}
            </View>
          </View>
        </View>
      );
    }

    // Tabbed on mobile
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI 생성 초안</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'draft1' && styles.tabActive]}
            onPress={() => setActiveTab('draft1')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="flame"
              size={14}
              color={activeTab === 'draft1' ? COLORS.white : COLORS.coral}
            />
            <Text
              style={[styles.tabText, activeTab === 'draft1' && styles.tabTextActive]}
            >
              제1안 (강경)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'draft2' && styles.tabActive]}
            onPress={() => setActiveTab('draft2')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="leaf"
              size={14}
              color={activeTab === 'draft2' ? COLORS.white : COLORS.sage}
            />
            <Text
              style={[styles.tabText, activeTab === 'draft2' && styles.tabTextActive]}
            >
              제2안 (온건)
            </Text>
          </TouchableOpacity>
        </View>
        {activeTab === 'draft1'
          ? renderLetterDocument(draft1, 'draft1')
          : renderLetterDocument(draft2, 'draft2')}
      </View>
    );
  };

  const renderEditSection = () => {
    if (!selectedDraft) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>경고장 편집</Text>
          <View style={[styles.badge, { backgroundColor: COLORS.navy + '12' }]}>
            <Ionicons name="create" size={14} color={COLORS.navy} />
            <Text style={[styles.badgeText, { color: COLORS.navy }]}>
              {selectedDraft === 'draft1' ? '제1안 (강경) 기반' : '제2안 (온건) 기반'}
            </Text>
          </View>
        </View>

        <TextInput
          style={styles.editInput}
          value={editText}
          onChangeText={setEditText}
          multiline
          textAlignVertical="top"
          placeholder="경고장 내용을 편집하세요..."
          placeholderTextColor={COLORS.lightText}
        />

        {/* Delivery Method */}
        <Text style={[styles.subLabel, { marginTop: SPACING.md }]}>발송 방법</Text>
        <View style={styles.deliveryRow}>
          {DELIVERY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.deliveryBtn,
                deliveryMethod === opt.key && styles.deliveryBtnActive,
              ]}
              onPress={() => setDeliveryMethod(opt.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={opt.icon as any}
                size={16}
                color={deliveryMethod === opt.key ? COLORS.white : COLORS.navy}
              />
              <Text
                style={[
                  styles.deliveryBtnText,
                  deliveryMethod === opt.key && styles.deliveryBtnTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Delivery Details */}
        {deliveryMethod === 'certified' && (
          <View style={styles.deliveryDetails}>
            <Text style={styles.fieldLabel}>수신인 주소</Text>
            <TextInput
              style={styles.fieldInput}
              value={recipientAddress}
              onChangeText={setRecipientAddress}
              placeholder="수신인 주소 입력"
              placeholderTextColor={COLORS.lightText}
            />
            <View style={styles.certifiedActions}>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => Alert.alert('우편번호 확인', '우편번호 조회 서비스 연동 예정')}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={14} color={COLORS.navy} />
                <Text style={styles.outlineBtnText}>우편번호 확인</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => Alert.alert('인쇄', '인쇄 대기열에 추가됨')}
                activeOpacity={0.7}
              >
                <Ionicons name="print" size={14} color={COLORS.navy} />
                <Text style={styles.outlineBtnText}>인쇄</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {(deliveryMethod === 'email' || deliveryMethod === 'sns') && (
          <View style={styles.deliveryDetails}>
            <Text style={styles.fieldLabel}>
              {deliveryMethod === 'email' ? '수신인 이메일' : '수신인 SNS'}
            </Text>
            <TextInput
              style={styles.fieldInput}
              value={recipientContact}
              onChangeText={setRecipientContact}
              placeholder={
                deliveryMethod === 'email'
                  ? 'example@email.com'
                  : '@카카오톡ID'
              }
              placeholderTextColor={COLORS.lightText}
              keyboardType={deliveryMethod === 'email' ? 'email-address' : 'default'}
            />
          </View>
        )}
      </View>
    );
  };

  const renderBottomActions = () => {
    if (!selectedDraft) return null;

    return (
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + SPACING.md }]}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={handleReject}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={18} color={COLORS.coral} />
          <Text style={styles.rejectBtnText}>반려</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={handleRequestEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.navy} />
          <Text style={styles.editBtnText}>수정 요청</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={handleApproveAndSend}
          activeOpacity={0.8}
        >
          <Ionicons name="paper-plane" size={18} color={COLORS.white} />
          <Text style={styles.approveBtnText}>승인 및 발송</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Main Render ──

  return (
    <View style={[styles.root, { paddingBottom: selectedDraft ? 0 : insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT + SPACING.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI 경고장 생성기</Text>
          <View style={styles.lawyerBadge}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
            <Text style={styles.lawyerBadgeText}>검토: 김창희 변호사</Text>
          </View>
        </View>
      </View>

      {/* Status Flow */}
      {renderStatusFlow()}

      {/* Content */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCaseSummary()}
        {renderDraftSection()}
        {renderEditSection()}
        <View style={{ height: selectedDraft ? 100 : SPACING.xxl }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      {renderBottomActions()}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const monoFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  web: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F3F8',
  },

  // Header
  header: {
    backgroundColor: COLORS.navy,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  lawyerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.navy,
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  lawyerBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.gold,
  },

  // Status Flow
  statusFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    ...SHADOW.sm,
  },
  statusStep: {
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusStepLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
  },
  statusLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.xs,
    marginBottom: 18,
  },

  // Scroll
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  // Summary
  summaryGrid: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    width: 64,
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    fontWeight: '500',
  },
  summaryValue: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    fontWeight: '600',
  },

  // Badges
  subLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.slate,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },

  // Risk
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  riskText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  riskBar: {
    flexDirection: 'row',
    gap: 3,
    flex: 1,
  },
  riskSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F4F3F8',
  },
  tabActive: {
    backgroundColor: COLORS.navy,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  // Side-by-side (wide)
  sideBySide: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  sideColumn: {
    flex: 1,
  },
  draftLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  draftLabelText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  // Letter Document
  letterDocument: {
    backgroundColor: '#FEFEFE',
    borderWidth: 1,
    borderColor: '#D0CFC8',
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  letterScroll: {
    maxHeight: 420,
    padding: SPACING.md,
  },
  letterText: {
    fontSize: 13,
    lineHeight: 22,
    color: '#1A1A1A',
    fontFamily: monoFont,
    letterSpacing: 0.2,
  },
  selectDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm + 2,
    borderTopWidth: 1,
    borderTopColor: '#D0CFC8',
  },
  selectDraftBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Edit Section
  editInput: {
    backgroundColor: '#FEFEFE',
    borderWidth: 1,
    borderColor: '#D0CFC8',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    fontSize: 13,
    lineHeight: 22,
    color: '#1A1A1A',
    fontFamily: monoFont,
    letterSpacing: 0.2,
    minHeight: 300,
    maxHeight: 500,
    textAlignVertical: 'top',
  },

  // Delivery
  deliveryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  deliveryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.navy + '30',
    backgroundColor: COLORS.white,
  },
  deliveryBtnActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  deliveryBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.navy,
  },
  deliveryBtnTextActive: {
    color: COLORS.white,
  },

  // Delivery Details
  deliveryDetails: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  fieldInput: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
  },
  certifiedActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.navy + '30',
  },
  outlineBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.navy,
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOW.md,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.coral + '40',
    backgroundColor: COLORS.coral + '08',
  },
  rejectBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.coral,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.navy + '30',
    backgroundColor: COLORS.white,
  },
  editBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.navy,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gold,
  },
  approveBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});
