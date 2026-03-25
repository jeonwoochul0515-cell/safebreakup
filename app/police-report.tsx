import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Animated,
  Easing,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW, Fonts } from '@/constants/theme';
import ForensicBadge from '@/components/ForensicBadge';
import {
  analyzeEvidence,
  generatePoliceReportText,
  generateReportId,
  EvidenceForReport,
  ReportData,
  REPORT_SECTIONS,
} from '@/constants/police-report';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'paywall' | 'input' | 'analysis' | 'report';

type Relationship = '전연인' | '현연인' | '전배우자' | '동거인' | '기타';

type Demand = '연락중단' | '접근금지' | 'SNS접촉중단' | '촬영물삭제' | '손해배상' | '형사처벌';

const RELATIONSHIPS: Relationship[] = ['전연인', '현연인', '전배우자', '동거인', '기타'];

const DEMAND_OPTIONS: Demand[] = ['연락중단', '접근금지', 'SNS접촉중단', '촬영물삭제', '손해배상', '형사처벌'];

const FEATURES = [
  'AI 자동 법률 분석 (적용 법률 + 판례)',
  '시간순 사건 경위 정리',
  'SHA-256 무결성 검증 보고',
  '김창희 변호사 검토',
];

const RISK_COLORS: Record<string, string> = {
  '안전': COLORS.sage,
  '주의': COLORS.warning,
  '위험': COLORS.coral,
  '긴급': COLORS.coralDark,
};

// ─── Mock Evidence Data ───────────────────────────────────────────────────────

const MOCK_EVIDENCE: EvidenceForReport[] = [
  {
    id: '1',
    type: '스크린샷',
    description: '카카오톡 협박 메시지 캡처',
    category: '협박',
    timestamp: '2026-03-24 14:32:15',
    hash: 'a3f7b2c1d9e84f56ab12cd34ef567890abcdef1234567890abcdef1234567890',
    verified: true,
  },
  {
    id: '2',
    type: '사진',
    description: '텔레그램 채널 유포 증거',
    category: '유포',
    timestamp: '2026-03-23 09:15:42',
    hash: 'b8d4e6f2a1c3d5e7f9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    verified: true,
  },
  {
    id: '3',
    type: '텍스트',
    description: '인스타그램 DM 반복 접촉 내용',
    category: '스토킹',
    timestamp: '2026-03-22 18:45:03',
    hash: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    verified: true,
  },
  {
    id: '4',
    type: '녹음',
    description: '전화 통화 녹음 (금전 요구 및 위협)',
    category: '협박',
    timestamp: '2026-03-21 21:10:30',
    hash: 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
    verified: true,
  },
];

// ─── Submission Guide Steps ───────────────────────────────────────────────────

const SUBMISSION_GUIDE = [
  { step: 1, text: '관할 경찰서 민원실 방문' },
  { step: 2, text: '고소장 + 이 보고서 함께 제출' },
  { step: 3, text: '진술서 작성 (보고서 내용 참고)' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PoliceReportScreen() {
  const [step, setStep] = useState<Step>('paywall');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Form state
  const [victimName, setVictimName] = useState('');
  const [perpetratorName, setPerpetratorName] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('전연인');
  const [showRelDropdown, setShowRelDropdown] = useState(false);
  const [incidentPeriod, setIncidentPeriod] = useState('');
  const [summary, setSummary] = useState('');
  const [demands, setDemands] = useState<Demand[]>([]);

  // Analysis results
  const [analysisResult, setAnalysisResult] = useState<{
    caseType: string;
    riskLevel: string;
    applicableLaws: { law: string; article: string; penalty: string }[];
    analysisNotes: string;
  } | null>(null);
  const [expandedLawIndex, setExpandedLawIndex] = useState<number | null>(null);

  // Report state
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportText, setReportText] = useState('');
  const [reportStatus] = useState<'생성완료' | '변호사검토중' | '발송가능'>('생성완료');

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAnalyzing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isAnalyzing]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [step]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handlePayment = () => {
    Alert.alert('결제 완료', '결제가 완료되었습니다.', [
      { text: '확인', onPress: () => setStep('input') },
    ]);
  };

  const toggleDemand = (d: Demand) => {
    setDemands((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleStartAnalysis = () => {
    if (!victimName.trim() || !perpetratorName.trim() || !incidentPeriod.trim() || !summary.trim()) {
      Alert.alert('알림', '필수 항목을 모두 입력해주세요.');
      return;
    }
    if (demands.length === 0) {
      Alert.alert('알림', '요구사항을 1개 이상 선택해주세요.');
      return;
    }

    setStep('analysis');
    setIsAnalyzing(true);

    setTimeout(() => {
      const result = analyzeEvidence(MOCK_EVIDENCE);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleGenerateReport = () => {
    if (!analysisResult) return;

    const id = generateReportId();
    const now = new Date();
    const generatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const data: ReportData = {
      reportId: id,
      generatedAt,
      victimName,
      perpetratorName,
      relationship,
      caseType: analysisResult.caseType,
      incidentPeriod,
      summary,
      evidenceItems: MOCK_EVIDENCE,
      applicableLaws: analysisResult.applicableLaws,
      demands,
      riskLevel: analysisResult.riskLevel,
      analysisNotes: analysisResult.analysisNotes,
    };

    setReportData(data);
    setReportText(generatePoliceReportText(data));
    setStep('report');
  };

  const handleDownloadPDF = () => {
    Alert.alert(
      'PDF 발송 안내',
      '변호사 검토 후 1~2일 내 PDF가 발송됩니다.\n등록된 이메일로 발송되며, 앱 내에서도 확인 가능합니다.',
      [{ text: '확인' }]
    );
  };

  // ─── Render: Paywall ──────────────────────────────────────────────────────

  const renderPaywall = () => (
    <ScrollView
      style={styles.scrollArea}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Paid badge */}
      <View style={styles.paidBadge}>
        <Ionicons name="diamond" size={12} color={COLORS.gold} />
        <Text style={styles.paidBadgeText}>유료 서비스</Text>
      </View>

      {/* Hero */}
      <View style={styles.heroSection}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="document-text" size={40} color={COLORS.gold} />
        </View>
        <Text style={styles.heroTitle}>경찰 제출용{'\n'}증거 분석 보고서</Text>
        <Text style={styles.heroDesc}>
          수집된 증거를 AI가 분석하여 법적 근거와 함께{'\n'}경찰 제출에 최적화된 PDF 보고서를 생성합니다
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featureCard}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.sage} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {/* Price */}
      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>보고서 생성 비용</Text>
        <Text style={styles.priceValue}>99,000원</Text>
        <Text style={styles.priceUnit}>/ 건</Text>
        <View style={styles.priceDivider} />
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.gold} />
          <Text style={styles.trustBadgeText}>변호사 직접 검토 후 발송</Text>
        </View>
        <Text style={styles.priceCompare}>
          변호사 사무실에서 동일 작업 시 약 30~50만원
        </Text>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.goldButton}
        onPress={handlePayment}
        activeOpacity={0.7}
      >
        <Ionicons name="document-text" size={20} color={COLORS.white} />
        <Text style={styles.goldButtonText}>보고서 생성 시작</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ─── Render: Input ────────────────────────────────────────────────────────

  const renderInput = () => (
    <ScrollView
      style={styles.scrollArea}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.paidBadge}>
        <Ionicons name="diamond" size={12} color={COLORS.gold} />
        <Text style={styles.paidBadgeText}>유료 서비스</Text>
      </View>

      <Text style={styles.stepTitle}>사건 정보 입력</Text>
      <Text style={styles.stepDesc}>보고서 작성에 필요한 기본 정보를 입력해주세요.</Text>

      {/* 피해자 성명 */}
      <Text style={styles.inputLabel}>피해자 성명 *</Text>
      <TextInput
        style={styles.textInput}
        value={victimName}
        onChangeText={setVictimName}
        placeholder='예: 김** (일부 가명 가능)'
        placeholderTextColor={COLORS.lightText}
      />

      {/* 가해자 성명 */}
      <Text style={styles.inputLabel}>가해자 성명 *</Text>
      <TextInput
        style={styles.textInput}
        value={perpetratorName}
        onChangeText={setPerpetratorName}
        placeholder='가해자의 성명을 입력하세요'
        placeholderTextColor={COLORS.lightText}
      />

      {/* 관계 */}
      <Text style={styles.inputLabel}>관계 *</Text>
      <TouchableOpacity
        style={styles.selectInput}
        onPress={() => setShowRelDropdown(!showRelDropdown)}
        activeOpacity={0.7}
      >
        <Text style={styles.selectText}>{relationship}</Text>
        <Ionicons
          name={showRelDropdown ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.slate}
        />
      </TouchableOpacity>
      {showRelDropdown && (
        <View style={styles.dropdown}>
          {RELATIONSHIPS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.dropdownItem, relationship === r && styles.dropdownItemSelected]}
              onPress={() => {
                setRelationship(r);
                setShowRelDropdown(false);
              }}
            >
              <Text style={[styles.dropdownItemText, relationship === r && styles.dropdownItemTextSelected]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 사건 기간 */}
      <Text style={styles.inputLabel}>사건 기간 *</Text>
      <TextInput
        style={styles.textInput}
        value={incidentPeriod}
        onChangeText={setIncidentPeriod}
        placeholder='예: 2026년 2월~3월'
        placeholderTextColor={COLORS.lightText}
      />

      {/* 사건 요약 */}
      <Text style={styles.inputLabel}>사건 요약 * (200자 이상 권장)</Text>
      <TextInput
        style={[styles.textInput, styles.textArea]}
        value={summary}
        onChangeText={setSummary}
        placeholder='사건의 경위를 상세히 기술해주세요...'
        placeholderTextColor={COLORS.lightText}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{summary.length}자</Text>

      {/* 요구사항 */}
      <Text style={styles.inputLabel}>요구사항 (복수 선택 가능) *</Text>
      <View style={styles.chipRow}>
        {DEMAND_OPTIONS.map((d) => {
          const selected = demands.includes(d);
          return (
            <TouchableOpacity
              key={d}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleDemand(d)}
              activeOpacity={0.7}
            >
              {selected && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{d}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Next */}
      <TouchableOpacity
        style={styles.goldButton}
        onPress={handleStartAnalysis}
        activeOpacity={0.7}
      >
        <Text style={styles.goldButtonText}>다음: 증거 분석</Text>
        <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
      </TouchableOpacity>
    </ScrollView>
  );

  // ─── Render: Analysis ─────────────────────────────────────────────────────

  const renderAnalysis = () => (
    <ScrollView
      style={styles.scrollArea}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.paidBadge}>
        <Ionicons name="diamond" size={12} color={COLORS.gold} />
        <Text style={styles.paidBadgeText}>유료 서비스</Text>
      </View>

      {isAnalyzing ? (
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingCircle, { opacity: pulseAnim }]}>
            <Ionicons name="analytics" size={48} color={COLORS.gold} />
          </Animated.View>
          <Animated.Text style={[styles.loadingTitle, { opacity: pulseAnim }]}>
            AI 분석 중...
          </Animated.Text>
          <Text style={styles.loadingDesc}>
            수집된 증거를 분석하고 적용 가능한{'\n'}법률을 검토하고 있습니다
          </Text>
          <View style={styles.loadingSteps}>
            <View style={styles.loadingStep}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.sage} />
              <Text style={styles.loadingStepText}>증거 무결성 확인</Text>
            </View>
            <View style={styles.loadingStep}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.sage} />
              <Text style={styles.loadingStepText}>카테고리 분류 완료</Text>
            </View>
            <View style={styles.loadingStep}>
              <Animated.View style={{ opacity: pulseAnim }}>
                <Ionicons name="ellipsis-horizontal-circle" size={16} color={COLORS.gold} />
              </Animated.View>
              <Text style={styles.loadingStepText}>법률 분석 진행 중...</Text>
            </View>
          </View>
        </View>
      ) : analysisResult ? (
        <>
          <Text style={styles.stepTitle}>증거 분석 결과</Text>

          {/* Case Type & Risk */}
          <View style={styles.analysisTopRow}>
            <View style={styles.analysisBadgeCard}>
              <Text style={styles.analysisBadgeLabel}>사건 유형</Text>
              <View style={styles.caseTypeBadge}>
                <Ionicons name="alert-circle" size={16} color={COLORS.white} />
                <Text style={styles.caseTypeBadgeText}>{analysisResult.caseType}</Text>
              </View>
            </View>
            <View style={styles.analysisBadgeCard}>
              <Text style={styles.analysisBadgeLabel}>위험 수준</Text>
              <View
                style={[
                  styles.riskBadge,
                  { backgroundColor: (RISK_COLORS[analysisResult.riskLevel] || COLORS.coral) + '20' },
                ]}
              >
                <View
                  style={[
                    styles.riskDot,
                    { backgroundColor: RISK_COLORS[analysisResult.riskLevel] || COLORS.coral },
                  ]}
                />
                <Text
                  style={[
                    styles.riskBadgeText,
                    { color: RISK_COLORS[analysisResult.riskLevel] || COLORS.coral },
                  ]}
                >
                  {analysisResult.riskLevel}
                </Text>
              </View>
            </View>
          </View>

          {/* Applicable Laws */}
          <Text style={styles.sectionHeading}>적용 법률</Text>
          {analysisResult.applicableLaws.map((law, i) => (
            <TouchableOpacity
              key={i}
              style={styles.lawCard}
              onPress={() => setExpandedLawIndex(expandedLawIndex === i ? null : i)}
              activeOpacity={0.7}
            >
              <View style={styles.lawCardHeader}>
                <View style={styles.lawIconWrap}>
                  <Ionicons name="scale" size={16} color={COLORS.gold} />
                </View>
                <Text style={styles.lawName} numberOfLines={expandedLawIndex === i ? undefined : 1}>
                  {law.law}
                </Text>
                <Ionicons
                  name={expandedLawIndex === i ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={COLORS.slate}
                />
              </View>
              {expandedLawIndex === i && (
                <View style={styles.lawDetail}>
                  <Text style={styles.lawArticle}>{law.article}</Text>
                  <View style={styles.lawPenaltyRow}>
                    <Ionicons name="warning" size={14} color={COLORS.coral} />
                    <Text style={styles.lawPenalty}>{law.penalty}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Evidence List */}
          <Text style={styles.sectionHeading}>증거 목록</Text>
          {MOCK_EVIDENCE.map((ev) => (
            <View key={ev.id} style={styles.evidenceCard}>
              <View style={styles.evidenceTopRow}>
                <View style={styles.evidenceTypeIcon}>
                  <Ionicons name="document" size={16} color={COLORS.gold} />
                </View>
                <View style={styles.evidenceInfo}>
                  <Text style={styles.evidenceDesc}>{ev.description}</Text>
                  <Text style={styles.evidenceCategory}>{ev.category}</Text>
                </View>
              </View>
              <ForensicBadge hash={ev.hash} timestamp={ev.timestamp} verified={ev.verified} />
            </View>
          ))}

          {/* AI Notes */}
          <Text style={styles.sectionHeading}>AI 분석 소견</Text>
          <View style={styles.notesCard}>
            <Ionicons name="bulb" size={20} color={COLORS.gold} style={{ marginBottom: SPACING.sm }} />
            <Text style={styles.notesText}>{analysisResult.analysisNotes}</Text>
          </View>

          {/* Generate */}
          <TouchableOpacity
            style={styles.goldButton}
            onPress={handleGenerateReport}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text" size={20} color={COLORS.white} />
            <Text style={styles.goldButtonText}>보고서 생성</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </ScrollView>
  );

  // ─── Render: Report ───────────────────────────────────────────────────────

  const renderReport = () => (
    <ScrollView
      style={styles.scrollArea}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.paidBadge}>
        <Ionicons name="diamond" size={12} color={COLORS.gold} />
        <Text style={styles.paidBadgeText}>유료 서비스</Text>
      </View>

      <Text style={styles.stepTitle}>보고서 생성 완료</Text>

      {/* Reviewer badge */}
      <View style={styles.reviewerCard}>
        <Ionicons name="shield-checkmark" size={18} color={COLORS.gold} />
        <Text style={styles.reviewerText}>검토: 김창희 변호사 (법률사무소 청송)</Text>
      </View>

      {/* Status bar */}
      <View style={styles.statusBar}>
        {(['생성완료', '변호사검토중', '발송가능'] as const).map((s, i) => {
          const isActive = s === reportStatus;
          const isPast =
            (reportStatus === '변호사검토중' && i === 0) ||
            (reportStatus === '발송가능' && i <= 1);
          const color = isActive || isPast ? COLORS.gold : COLORS.borderLight;
          return (
            <React.Fragment key={s}>
              {i > 0 && <View style={[styles.statusLine, { backgroundColor: color }]} />}
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: color }]}>
                  {(isActive || isPast) && (
                    <Ionicons name="checkmark" size={10} color={COLORS.white} />
                  )}
                </View>
                <Text style={[styles.statusText, { color: isActive ? COLORS.gold : COLORS.slate }]}>
                  {s}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {/* Report number */}
      {reportData && (
        <View style={styles.reportIdRow}>
          <Ionicons name="barcode" size={14} color={COLORS.slate} />
          <Text style={styles.reportIdText}>{reportData.reportId}</Text>
        </View>
      )}

      {/* Document preview */}
      <View style={styles.documentCard}>
        <ScrollView
          style={styles.documentScroll}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.documentText}>{reportText}</Text>
        </ScrollView>
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.goldButton}
        onPress={handleDownloadPDF}
        activeOpacity={0.7}
      >
        <Ionicons name="download" size={20} color={COLORS.white} />
        <Text style={styles.goldButtonText}>PDF 다운로드</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => setShowGuide(!showGuide)}
        activeOpacity={0.7}
      >
        <Ionicons name="navigate" size={18} color={COLORS.gold} />
        <Text style={styles.outlineButtonText}>경찰서 제출 가이드</Text>
        <Ionicons
          name={showGuide ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.gold}
        />
      </TouchableOpacity>

      {showGuide && (
        <View style={styles.guideCard}>
          {SUBMISSION_GUIDE.map((g) => (
            <View key={g.step} style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>{g.step}</Text>
              </View>
              <Text style={styles.guideStepText}>{g.text}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => router.push('/consultation' as any)}
        activeOpacity={0.7}
      >
        <Ionicons name="people" size={18} color={COLORS.gold} />
        <Text style={styles.outlineButtonText}>변호사 동행 신청</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.gold} />
      </TouchableOpacity>
    </ScrollView>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 'paywall':
        return renderPaywall();
      case 'input':
        return renderInput();
      case 'analysis':
        return renderAnalysis();
      case 'report':
        return renderReport();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step === 'paywall') router.back();
            else if (step === 'input') setStep('paywall');
            else if (step === 'analysis' && !isAnalyzing) setStep('input');
            else if (step === 'report') setStep('analysis');
          }}
          style={styles.headerBackBtn}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>증거 분석 보고서</Text>
        <View style={styles.headerBackBtn} />
      </View>

      {/* Content */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>{renderStep()}</Animated.View>

      {/* Emergency Footer */}
      <View style={styles.emergencyFooter}>
        <TouchableOpacity
          style={styles.emergencyBtn}
          onPress={() => Linking.openURL('tel:112')}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={16} color={COLORS.coral} />
          <Text style={styles.emergencyBtnText}>112 경찰</Text>
        </TouchableOpacity>
        <View style={styles.emergencyDivider} />
        <TouchableOpacity
          style={styles.emergencyBtn}
          onPress={() => Linking.openURL('tel:1366')}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={16} color={COLORS.coral} />
          <Text style={styles.emergencyBtnText}>1366 여성긴급전화</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.navy,
  },
  headerBackBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white },

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl },

  // Paid badge
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: COLORS.gold + '18',
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  paidBadgeText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.gold },

  // Hero (Paywall)
  heroSection: { alignItems: 'center', marginBottom: SPACING.xl },
  heroIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gold + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.darkText,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: SPACING.sm,
  },
  heroDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Features
  featureCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
    ...SHADOW.md,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  featureText: { fontSize: FONT_SIZE.md, color: COLORS.darkText, fontWeight: '500', flex: 1 },

  // Price
  priceCard: {
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOW.lg,
  },
  priceLabel: { fontSize: FONT_SIZE.sm, color: COLORS.goldLight, marginBottom: SPACING.xs },
  priceValue: { fontSize: 40, fontWeight: '800', color: COLORS.gold },
  priceUnit: { fontSize: FONT_SIZE.md, color: COLORS.goldLight, marginBottom: SPACING.md },
  priceDivider: {
    width: '60%',
    height: 1,
    backgroundColor: COLORS.gold + '30',
    marginVertical: SPACING.md,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.gold + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  trustBadgeText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.goldLight },
  priceCompare: { fontSize: FONT_SIZE.xs, color: COLORS.lightText, textAlign: 'center' },

  // Gold button
  goldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    ...SHADOW.md,
  },
  goldButtonText: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white },

  // Step Title
  stepTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  stepDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },

  // Form inputs
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  textInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
  },
  textArea: { minHeight: 120 },
  charCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },

  // Select
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
  },
  selectText: { fontSize: FONT_SIZE.md, color: COLORS.darkText },
  dropdown: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginTop: SPACING.xs,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  dropdownItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dropdownItemSelected: { backgroundColor: COLORS.gold + '15' },
  dropdownItemText: { fontSize: FONT_SIZE.md, color: COLORS.darkText },
  dropdownItemTextSelected: { color: COLORS.gold, fontWeight: '700' },

  // Chips (demands)
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.cardBg,
  },
  chipSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  chipText: { fontSize: FONT_SIZE.sm, color: COLORS.darkText, fontWeight: '500' },
  chipTextSelected: { color: COLORS.white, fontWeight: '700' },

  // Loading (Analysis)
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  loadingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gold + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  loadingTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  loadingDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  loadingSteps: { gap: SPACING.sm, alignSelf: 'stretch', paddingHorizontal: SPACING.xl },
  loadingStep: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  loadingStepText: { fontSize: FONT_SIZE.md, color: COLORS.darkText },

  // Analysis results
  analysisTopRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  analysisBadgeCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  analysisBadgeLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.slate,
    marginBottom: SPACING.xs,
  },
  caseTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  caseTypeBadgeText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.white },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
  riskBadgeText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  sectionHeading: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },

  // Law cards
  lawCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOW.sm,
  },
  lawCardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  lawIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gold + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lawName: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.darkText },
  lawDetail: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  lawArticle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.darkText,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  lawPenaltyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lawPenalty: { fontSize: FONT_SIZE.sm, color: COLORS.coral, fontWeight: '600' },

  // Evidence cards
  evidenceCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  evidenceTopRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  evidenceTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceInfo: { flex: 1 },
  evidenceDesc: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.darkText },
  evidenceCategory: { fontSize: FONT_SIZE.xs, color: COLORS.slate, marginTop: 2 },

  // Notes
  notesCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    ...SHADOW.sm,
  },
  notesText: { fontSize: FONT_SIZE.md, color: COLORS.darkText, lineHeight: 24 },

  // Report preview
  reviewerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold + '15',
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  reviewerText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.gold },

  // Status bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  statusItem: { alignItems: 'center', gap: 4 },
  statusDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLine: { height: 2, flex: 1, marginHorizontal: SPACING.xs },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },

  // Report ID
  reportIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: SPACING.md,
  },
  reportIdText: { fontSize: FONT_SIZE.xs, color: COLORS.slate, fontFamily: 'monospace' },

  // Document card
  documentCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    maxHeight: 400,
    marginBottom: SPACING.md,
    ...SHADOW.md,
  },
  documentScroll: { flex: 1 },
  documentText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: 'monospace',
    color: COLORS.darkText,
    lineHeight: 18,
  },

  // Outline button
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  outlineButtonText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.gold },

  // Guide
  guideCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  guideStep: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  guideStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideStepNumberText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.white },
  guideStepText: { fontSize: FONT_SIZE.md, color: COLORS.darkText, fontWeight: '500', flex: 1 },

  // Emergency footer
  emergencyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  emergencyBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.coral },
  emergencyDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.sm,
  },
});
