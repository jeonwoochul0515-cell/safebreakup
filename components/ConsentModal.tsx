import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { CONSENT_TEXTS } from '@/constants/consent';
import type { SensitiveDataConsent } from '@/types/database';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ConsentModalProps {
  visible: boolean;
  onConsent: (consent: SensitiveDataConsent) => void;
  onDecline: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ConsentModal({
  visible,
  onConsent,
  onDecline,
}: ConsentModalProps) {
  const [generalChecked, setGeneralChecked] = useState(false);
  const [sensitiveChecked, setSensitiveChecked] = useState(false);
  const [expandedSection, setExpandedSection] = useState<
    'general' | 'sensitive' | 'third_party' | null
  >(null);
  const [showDeclineNotice, setShowDeclineNotice] = useState(false);

  const allChecked = generalChecked && sensitiveChecked;

  const toggleExpand = (section: 'general' | 'sensitive' | 'third_party') => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const handleConsent = () => {
    if (!allChecked) return;
    onConsent({
      general_consent: true,
      sensitive_consent: true,
      third_party_consent: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleDecline = () => {
    setShowDeclineNotice(true);
  };

  const confirmDecline = () => {
    setShowDeclineNotice(false);
    onDecline();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerBar}>
            <Ionicons name="shield-checkmark" size={22} color={COLORS.gold} />
            <Text style={styles.heading}>개인정보 수집 동의</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text style={styles.subtitle}>
              고소장 작성을 위해 아래 동의가 필요합니다.{'\n'}
              각 항목을 눌러 상세 내용을 확인하실 수 있습니다.
            </Text>

            {/* ── 일반 개인정보 동의 ── */}
            <View style={styles.consentItem}>
              <TouchableOpacity
                style={styles.consentRow}
                onPress={() => setGeneralChecked(!generalChecked)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: generalChecked }}
              >
                <View
                  style={[
                    styles.checkbox,
                    generalChecked && styles.checkboxChecked,
                  ]}
                >
                  {generalChecked && (
                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.consentLabel}>
                  {CONSENT_TEXTS.general.title}
                </Text>
                <Text style={styles.requiredBadge}>(필수)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailToggle}
                onPress={() => toggleExpand('general')}
                activeOpacity={0.7}
              >
                <Text style={styles.detailToggleText}>상세 보기</Text>
                <Ionicons
                  name={
                    expandedSection === 'general'
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={14}
                  color={COLORS.slate}
                />
              </TouchableOpacity>

              {expandedSection === 'general' && (
                <View style={styles.detailBox}>
                  <Text style={styles.legalBasis}>
                    {CONSENT_TEXTS.general.legal_basis}
                  </Text>
                  <Text style={styles.detailContent}>
                    {CONSENT_TEXTS.general.content}
                  </Text>
                </View>
              )}
            </View>

            {/* ── 민감정보 별도 동의 ── */}
            <View style={styles.consentItem}>
              <TouchableOpacity
                style={styles.consentRow}
                onPress={() => setSensitiveChecked(!sensitiveChecked)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: sensitiveChecked }}
              >
                <View
                  style={[
                    styles.checkbox,
                    sensitiveChecked && styles.checkboxChecked,
                  ]}
                >
                  {sensitiveChecked && (
                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.consentLabel}>
                  {CONSENT_TEXTS.sensitive.title}
                </Text>
                <Text style={styles.requiredBadge}>(필수)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailToggle}
                onPress={() => toggleExpand('sensitive')}
                activeOpacity={0.7}
              >
                <Text style={styles.detailToggleText}>상세 보기</Text>
                <Ionicons
                  name={
                    expandedSection === 'sensitive'
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={14}
                  color={COLORS.slate}
                />
              </TouchableOpacity>

              {expandedSection === 'sensitive' && (
                <View style={styles.detailBox}>
                  <Text style={styles.legalBasis}>
                    {CONSENT_TEXTS.sensitive.legal_basis}
                  </Text>
                  <Text style={styles.detailContent}>
                    {CONSENT_TEXTS.sensitive.content}
                  </Text>
                </View>
              )}
            </View>

            {/* ── 제3자 정보 안내 (참고) ── */}
            <TouchableOpacity
              style={styles.thirdPartyRow}
              onPress={() => toggleExpand('third_party')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={COLORS.slate}
              />
              <Text style={styles.thirdPartyLabel}>
                {CONSENT_TEXTS.third_party.title}
              </Text>
              <Ionicons
                name={
                  expandedSection === 'third_party'
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={14}
                color={COLORS.slate}
              />
            </TouchableOpacity>

            {expandedSection === 'third_party' && (
              <View style={styles.detailBox}>
                <Text style={styles.legalBasis}>
                  {CONSENT_TEXTS.third_party.legal_basis}
                </Text>
                <Text style={styles.detailContent}>
                  {CONSENT_TEXTS.third_party.content}
                </Text>
              </View>
            )}

            {/* ── 동의하고 시작 버튼 ── */}
            <TouchableOpacity
              style={[styles.consentBtn, !allChecked && styles.consentBtnDisabled]}
              onPress={handleConsent}
              disabled={!allChecked}
              activeOpacity={0.7}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.white}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.consentBtnText}>동의하고 시작</Text>
            </TouchableOpacity>

            {/* ── 동의하지 않음 ── */}
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={handleDecline}
              activeOpacity={0.6}
            >
              <Text style={styles.declineBtnText}>동의하지 않음</Text>
            </TouchableOpacity>

            {/* ── 불이익 안내 모달 ── */}
            {showDeclineNotice && (
              <View style={styles.declineNotice}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={COLORS.coral}
                  style={{ marginRight: SPACING.sm }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.declineNoticeTitle}>동의 거부 안내</Text>
                  <Text style={styles.declineNoticeText}>
                    동의를 거부하시면 고소장 작성 서비스를 이용하실 수 없습니다.
                    {'\n'}다른 기능(증거보관함, 상담 등)은 정상적으로 이용
                    가능합니다.
                  </Text>
                  <View style={styles.declineNoticeButtons}>
                    <TouchableOpacity
                      style={styles.declineNoticeCancelBtn}
                      onPress={() => setShowDeclineNotice(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.declineNoticeCancelText}>
                        돌아가기
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineNoticeConfirmBtn}
                      onPress={confirmDecline}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.declineNoticeConfirmText}>
                        거부하기
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ── 개인정보 안내 푸터 ── */}
            <Text style={styles.footerText}>
              모든 데이터는 사용자의 기기에만 저장되며{'\n'}서버로 전송되지
              않습니다.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45,43,61,0.8)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.warmWhite,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '92%',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  heading: {
    color: COLORS.navy,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  subtitle: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },

  // Consent items
  consentItem: {
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 4,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.lightText,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm + 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  consentLabel: {
    flex: 1,
    color: COLORS.darkText,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  requiredBadge: {
    color: COLORS.coral,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },

  // Detail toggle
  detailToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingLeft: 32,
  },
  detailToggleText: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.sm,
    marginRight: 4,
  },

  // Detail box
  detailBox: {
    marginTop: SPACING.sm,
    paddingLeft: 32,
  },
  legalBasis: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  detailContent: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },

  // Third party
  thirdPartyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  thirdPartyLabel: {
    flex: 1,
    color: COLORS.slate,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },

  // Consent button
  consentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    ...SHADOW.sm,
  },
  consentBtnDisabled: {
    backgroundColor: COLORS.lightText,
    opacity: 0.6,
  },
  consentBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },

  // Decline button
  declineBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  declineBtnText: {
    color: COLORS.slate,
    fontSize: FONT_SIZE.sm,
  },

  // Decline notice
  declineNotice: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F3',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.coralLight,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  declineNoticeTitle: {
    color: COLORS.coral,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  declineNoticeText: {
    color: COLORS.darkText,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  declineNoticeButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  declineNoticeCancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.warmGray,
  },
  declineNoticeCancelText: {
    color: COLORS.darkText,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  declineNoticeConfirmBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.coral,
  },
  declineNoticeConfirmText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },

  // Footer
  footerText: {
    color: COLORS.lightText,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
  },
});
