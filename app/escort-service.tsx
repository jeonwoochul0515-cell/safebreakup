import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Pressable,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import {
  ESCORT_SERVICE_INFO,
  ESCORT_PLANS,
  ESCORT_PROCESS,
  SAFETY_TIPS_FOR_BREAKUP,
  FAQ_ESCORT,
} from '@/constants/escort-service';

function FAQItem({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable style={styles.faqItem} onPress={() => setOpen(!open)}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ}>{item.q}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.lightText} />
      </View>
      {open && <Text style={styles.faqA}>{item.a}</Text>}
    </Pressable>
  );
}

export default function EscortServiceScreen() {
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', date: '', location: '', notes: '' });

  const handleSubmit = () => {
    if (!form.name || !form.phone) {
      Alert.alert('알림', '이름과 연락처를 입력해주세요.');
      return;
    }
    Alert.alert(
      '상담 신청 완료',
      `${selectedPlan} 플랜으로 상담이 접수되었습니다.\n경호 코디네이터가 24시간 내 연락드립니다.`,
      [{ text: '확인', onPress: () => setShowModal(false) }]
    );
    setForm({ name: '', phone: '', date: '', location: '', notes: '' });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이별 안전 경호</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="shield-checkmark" size={40} color={COLORS.gold} />
          </View>
          <Text style={styles.heroTitle}>{ESCORT_SERVICE_INFO.title}</Text>
          <Text style={styles.heroSub}>{ESCORT_SERVICE_INFO.subtitle}</Text>
          <Text style={styles.heroDesc}>{ESCORT_SERVICE_INFO.description}</Text>
          <View style={styles.legalBadge}>
            <Ionicons name="document-text" size={12} color={COLORS.gold} />
            <Text style={styles.legalBadgeText}>경비업법 등록 업체만 연결</Text>
          </View>
        </View>

        {/* Why needed */}
        <View style={styles.section}>
          <View style={styles.statBanner}>
            <Text style={styles.statNumber}>30%</Text>
            <Text style={styles.statLabel}>이별 후 1개월 내 발생하는{'\n'}친밀 파트너 살인 비율</Text>
            <Text style={styles.statSource}>Femicide Census</Text>
          </View>
          <Text style={styles.statMessage}>이별 통보 순간이 가장 위험합니다.{'\n'}전문 경호와 함께 안전하게 이별하세요.</Text>
        </View>

        {/* Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>경호 플랜</Text>
          {ESCORT_PLANS.map((plan) => (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                plan.recommended && styles.planCardRecommended,
              ]}
            >
              {plan.recommended && (
                <View style={styles.recommendBadge}>
                  <Text style={styles.recommendText}>추천</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <View style={[styles.planIconWrap, { backgroundColor: plan.color + '18' }]}>
                  <Ionicons name={plan.icon as any} size={24} color={plan.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDuration}>{plan.duration}</Text>
                </View>
                <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
              </View>
              <View style={styles.planFeatures}>
                {plan.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.planCTA, { backgroundColor: plan.recommended ? COLORS.gold : COLORS.navy }]}
                onPress={() => {
                  setSelectedPlan(plan.name);
                  setShowModal(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.white} />
                <Text style={styles.planCTAText}>상담 신청</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Process */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이용 절차</Text>
          {ESCORT_PROCESS.map((step, index) => (
            <View key={step.step} style={styles.processRow}>
              <View style={styles.processLeft}>
                <View style={styles.processCircle}>
                  <Ionicons name={step.icon as any} size={18} color={COLORS.gold} />
                </View>
                {index < ESCORT_PROCESS.length - 1 && <View style={styles.processLine} />}
              </View>
              <View style={styles.processContent}>
                <Text style={styles.processStep}>STEP {step.step}</Text>
                <Text style={styles.processTitle}>{step.title}</Text>
                <Text style={styles.processDesc}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이별 시 안전 수칙</Text>
          {SAFETY_TIPS_FOR_BREAKUP.map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <View style={[styles.tipIconWrap, { backgroundColor: COLORS.coral + '12' }]}>
                <Ionicons name={tip.icon as any} size={20} color={COLORS.coral} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
          {FAQ_ESCORT.map((item, i) => (
            <FAQItem key={i} item={item} />
          ))}
        </View>

        {/* Trust */}
        <View style={styles.trustSection}>
          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.gold} />
            <Text style={styles.trustText}>검토: 김창희 변호사 (법률사무소 청송)</Text>
          </View>
          <Text style={styles.trustSub}>위험 발생 시 법률사무소 청송이 즉시 법적 대응을 지원합니다</Text>
        </View>

        {/* Emergency */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>지금 위험한 상황이라면</Text>
          <View style={styles.emergencyRow}>
            <TouchableOpacity style={styles.emergencyBtn} onPress={() => Linking.openURL('tel:112')}>
              <Ionicons name="call" size={18} color={COLORS.white} />
              <Text style={styles.emergencyBtnText}>112 경찰</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.emergencyBtn, { backgroundColor: COLORS.gold }]} onPress={() => Linking.openURL('tel:1366')}>
              <Ionicons name="heart" size={18} color={COLORS.white} />
              <Text style={styles.emergencyBtnText}>1366 여성긴급</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Consultation Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>경호 상담 신청</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalPlan}>선택 플랜: {selectedPlan}</Text>
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>이름 *</Text>
              <TextInput
                style={styles.input}
                placeholder="실명 또는 가명"
                placeholderTextColor={COLORS.lightText}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
              />
              <Text style={styles.inputLabel}>연락처 *</Text>
              <TextInput
                style={styles.input}
                placeholder="010-0000-0000"
                placeholderTextColor={COLORS.lightText}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(v) => setForm({ ...form, phone: v })}
              />
              <Text style={styles.inputLabel}>희망 날짜</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 2026-04-01"
                placeholderTextColor={COLORS.lightText}
                value={form.date}
                onChangeText={(v) => setForm({ ...form, date: v })}
              />
              <Text style={styles.inputLabel}>이별 장소 (예정)</Text>
              <TextInput
                style={styles.input}
                placeholder="카페, 레스토랑 등"
                placeholderTextColor={COLORS.lightText}
                value={form.location}
                onChangeText={(v) => setForm({ ...form, location: v })}
              />
              <Text style={styles.inputLabel}>추가 사항</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="상대방 성향, 특이사항 등"
                placeholderTextColor={COLORS.lightText}
                multiline
                value={form.notes}
                onChangeText={(v) => setForm({ ...form, notes: v })}
              />
            </ScrollView>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
              <Text style={styles.submitBtnText}>상담 신청하기</Text>
            </TouchableOpacity>
            <Text style={styles.modalDisclaimer}>경호 코디네이터가 24시간 내 연락드립니다. 개인정보는 암호화 보관됩니다.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.cream },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.navy, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.white },

  // Hero
  hero: { backgroundColor: COLORS.navy, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, alignItems: 'center' },
  heroIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.gold + '18', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  heroTitle: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  heroSub: { fontSize: FONT_SIZE.md, color: COLORS.goldLight, textAlign: 'center', marginTop: SPACING.xs },
  heroDesc: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: SPACING.sm, lineHeight: 22, paddingHorizontal: SPACING.md },
  legalBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginTop: SPACING.md },
  legalBadgeText: { fontSize: FONT_SIZE.xs, color: COLORS.goldLight, marginLeft: 6 },

  // Section
  section: { paddingHorizontal: SPACING.md, paddingTop: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.darkText, marginBottom: SPACING.md },

  // Stat
  statBanner: { backgroundColor: COLORS.coralDark, borderRadius: RADIUS.md, padding: SPACING.lg, alignItems: 'center' },
  statNumber: { fontSize: 48, fontWeight: '900', color: COLORS.white },
  statLabel: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: SPACING.xs, lineHeight: 20 },
  statSource: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.5)', marginTop: SPACING.xs },
  statMessage: { fontSize: FONT_SIZE.md, color: COLORS.darkText, textAlign: 'center', marginTop: SPACING.md, lineHeight: 24, fontWeight: '600' },

  // Plans
  planCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOW.sm },
  planCardRecommended: { borderColor: COLORS.gold, borderWidth: 2, ...SHADOW.md },
  recommendBadge: { position: 'absolute', top: -10, right: 16, backgroundColor: COLORS.gold, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  recommendText: { fontSize: 11, fontWeight: '800', color: COLORS.white },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  planIconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  planName: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText },
  planDuration: { fontSize: FONT_SIZE.xs, color: COLORS.lightText, marginTop: 2 },
  planPrice: { fontSize: FONT_SIZE.xl, fontWeight: '900' },
  planFeatures: { marginBottom: SPACING.md },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  featureText: { fontSize: FONT_SIZE.sm, color: COLORS.darkText, marginLeft: 8, flex: 1, lineHeight: 20 },
  planCTA: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: RADIUS.md },
  planCTAText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: '700', marginLeft: 8 },

  // Process
  processRow: { flexDirection: 'row', marginBottom: SPACING.xs },
  processLeft: { width: 40, alignItems: 'center' },
  processCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.gold + '15', justifyContent: 'center', alignItems: 'center' },
  processLine: { width: 2, flex: 1, backgroundColor: COLORS.borderLight, marginVertical: 4 },
  processContent: { flex: 1, paddingLeft: SPACING.sm, paddingBottom: SPACING.md },
  processStep: { fontSize: 10, fontWeight: '800', color: COLORS.gold },
  processTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText, marginTop: 2 },
  processDesc: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginTop: 4, lineHeight: 20 },

  // Tips
  tipCard: { flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  tipIconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  tipTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.darkText },
  tipDesc: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginTop: 2, lineHeight: 20 },

  // FAQ
  faqItem: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.darkText, flex: 1, marginRight: SPACING.sm },
  faqA: { fontSize: FONT_SIZE.sm, color: COLORS.slate, marginTop: SPACING.sm, lineHeight: 22 },

  // Trust
  trustSection: { alignItems: 'center', paddingVertical: SPACING.lg, paddingHorizontal: SPACING.lg },
  trustRow: { flexDirection: 'row', alignItems: 'center' },
  trustText: { fontSize: FONT_SIZE.sm, color: COLORS.gold, fontWeight: '600', marginLeft: 6 },
  trustSub: { fontSize: FONT_SIZE.xs, color: COLORS.lightText, marginTop: 4, textAlign: 'center' },

  // Emergency
  emergencySection: { alignItems: 'center', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg, backgroundColor: COLORS.warmGray },
  emergencyTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.darkText, marginBottom: SPACING.md },
  emergencyRow: { flexDirection: 'row' },
  emergencyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.coral, paddingVertical: 12, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, marginHorizontal: SPACING.xs },
  emergencyBtnText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: '700', marginLeft: 6 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.cardBg, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.darkText },
  modalPlan: { fontSize: FONT_SIZE.sm, color: COLORS.gold, fontWeight: '600', marginBottom: SPACING.md },
  inputLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.darkText, marginBottom: SPACING.xs, marginTop: SPACING.sm },
  input: { height: 48, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.darkText, backgroundColor: COLORS.warmWhite },
  submitBtn: { backgroundColor: COLORS.gold, paddingVertical: 16, borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.lg },
  submitBtnText: { color: COLORS.white, fontSize: FONT_SIZE.lg, fontWeight: '700' },
  modalDisclaimer: { fontSize: FONT_SIZE.xs, color: COLORS.lightText, textAlign: 'center', marginTop: SPACING.sm },
});
