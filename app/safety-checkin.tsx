import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  SafeAreaView,
  TextInput,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Frequency = '매일' | '12시간' | '6시간';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface CheckinRecord {
  id: string;
  timestamp: string;
  status: 'ok' | 'missed';
}

const FREQUENCY_OPTIONS: { label: Frequency; hours: number; icon: string }[] = [
  { label: '매일', hours: 24, icon: 'sunny' },
  { label: '12시간', hours: 12, icon: 'time' },
  { label: '6시간', hours: 6, icon: 'alarm' },
];

export default function SafetyCheckinScreen() {
  const [frequency, setFrequency] = useState<Frequency>('매일');
  const [preferredTime, setPreferredTime] = useState('09:00');
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: '', phone: '', relationship: '' },
    { name: '', phone: '', relationship: '' },
    { name: '', phone: '', relationship: '' },
  ]);
  const [checkinHistory, setCheckinHistory] = useState<CheckinRecord[]>([]);
  const [showMissedWarning, setShowMissedWarning] = useState(false);
  const [customMessage, setCustomMessage] = useState('저는 안전합니다. 걱정하지 마세요.');

  // Countdown animation
  const countdownAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  // Pulse animation for the big button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handleCheckin = useCallback(() => {
    setIsCountingDown(true);
    setCountdownSeconds(3);

    // Animated countdown circle
    countdownAnim.setValue(1);
    Animated.timing(countdownAnim, {
      toValue: 0,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Simulate countdown
    let seconds = 3;
    const interval = setInterval(() => {
      seconds -= 1;
      setCountdownSeconds(seconds);
      if (seconds <= 0) {
        clearInterval(interval);
        setIsCountingDown(false);

        const now = new Date();
        const record: CheckinRecord = {
          id: Date.now().toString(),
          timestamp: now.toISOString(),
          status: 'ok',
        };
        setCheckinHistory((prev) => [record, ...prev]);
        setShowMissedWarning(false);
      }
    }, 1000);
  }, [countdownAnim]);

  const handleSimulateMissed = () => {
    const now = new Date();
    const record: CheckinRecord = {
      id: Date.now().toString(),
      timestamp: now.toISOString(),
      status: 'missed',
    };
    setCheckinHistory((prev) => [record, ...prev]);
    setShowMissedWarning(true);
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setContacts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  const circleSize = SCREEN_WIDTH * 0.52;
  const strokeWidth = 6;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>안전 체크인</Text>
        <View style={styles.headerBackButton} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Missed Warning */}
        {showMissedWarning && (
          <View style={styles.missedBanner}>
            <Ionicons name="alert-circle" size={22} color={COLORS.white} />
            <View style={styles.missedBannerText}>
              <Text style={styles.missedTitle}>체크인을 놓쳤습니다</Text>
              <Text style={styles.missedSubtext}>
                등록된 비상 연락처에 안전 확인 메시지가 전송됩니다.
              </Text>
            </View>
          </View>
        )}

        {/* Big Check-in Button */}
        <View style={styles.checkinSection}>
          <Animated.View style={{ transform: [{ scale: isCountingDown ? 1 : pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.checkinButton,
                { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
                isCountingDown && styles.checkinButtonActive,
              ]}
              onPress={handleCheckin}
              disabled={isCountingDown}
              activeOpacity={0.8}
            >
              {isCountingDown ? (
                <>
                  <Text style={styles.countdownNumber}>{countdownSeconds}</Text>
                  <Text style={styles.countdownLabel}>확인 중...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={48} color={COLORS.white} />
                  <Text style={styles.checkinButtonText}>안전 확인</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.checkinHint}>탭하여 안전을 확인하세요</Text>
        </View>

        {/* Simulate Missed Button */}
        <TouchableOpacity
          style={styles.simulateButton}
          onPress={handleSimulateMissed}
          activeOpacity={0.7}
        >
          <Ionicons name="warning-outline" size={16} color={COLORS.coral} />
          <Text style={styles.simulateText}>체크인 놓침 시뮬레이션</Text>
        </TouchableOpacity>

        {/* Frequency Selector */}
        <Text style={styles.sectionTitle}>체크인 빈도</Text>
        <View style={styles.frequencyRow}>
          {FREQUENCY_OPTIONS.map((opt) => {
            const isSelected = frequency === opt.label;
            return (
              <TouchableOpacity
                key={opt.label}
                style={[styles.frequencyItem, isSelected && styles.frequencyItemActive]}
                onPress={() => setFrequency(opt.label)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={20}
                  color={isSelected ? COLORS.white : COLORS.slate}
                />
                <Text style={[styles.frequencyLabel, isSelected && styles.frequencyLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Preferred Time */}
        <View style={styles.timeCard}>
          <Text style={styles.timeLabel}>선호 시간</Text>
          <TextInput
            style={styles.timeInput}
            value={preferredTime}
            onChangeText={setPreferredTime}
            placeholder="HH:MM"
            placeholderTextColor={COLORS.lightText}
          />
        </View>

        {/* Custom Message */}
        <Text style={styles.sectionTitle}>안전 확인 메시지 템플릿</Text>
        <TextInput
          style={styles.messageInput}
          value={customMessage}
          onChangeText={setCustomMessage}
          placeholder="비상 연락처에 보낼 메시지..."
          placeholderTextColor={COLORS.lightText}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />

        {/* Emergency Contacts */}
        <Text style={styles.sectionTitle}>비상 연락처</Text>
        {contacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <View style={styles.contactNumberCircle}>
                <Text style={styles.contactNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.contactHeaderLabel}>비상 연락처 {index + 1}</Text>
            </View>
            <View style={styles.contactFields}>
              <TextInput
                style={styles.contactInput}
                placeholder="이름"
                placeholderTextColor={COLORS.lightText}
                value={contact.name}
                onChangeText={(v) => updateContact(index, 'name', v)}
              />
              <TextInput
                style={styles.contactInput}
                placeholder="전화번호"
                placeholderTextColor={COLORS.lightText}
                value={contact.phone}
                onChangeText={(v) => updateContact(index, 'phone', v)}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.contactInput}
                placeholder="관계 (예: 친구, 가족)"
                placeholderTextColor={COLORS.lightText}
                value={contact.relationship}
                onChangeText={(v) => updateContact(index, 'relationship', v)}
              />
            </View>
          </View>
        ))}

        {/* Check-in History */}
        <Text style={styles.sectionTitle}>체크인 기록</Text>
        {checkinHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={40} color={COLORS.borderLight} />
            <Text style={styles.emptyText}>아직 체크인 기록이 없습니다</Text>
          </View>
        ) : (
          checkinHistory.map((record) => (
            <View key={record.id} style={styles.historyItem}>
              <View
                style={[
                  styles.historyDot,
                  {
                    backgroundColor:
                      record.status === 'ok' ? COLORS.success : COLORS.danger,
                  },
                ]}
              >
                <Ionicons
                  name={record.status === 'ok' ? 'checkmark' : 'close'}
                  size={14}
                  color={COLORS.white}
                />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTime}>{formatTimestamp(record.timestamp)}</Text>
                <Text
                  style={[
                    styles.historyStatus,
                    { color: record.status === 'ok' ? COLORS.success : COLORS.danger },
                  ]}
                >
                  {record.status === 'ok' ? '안전 확인 완료' : '체크인 놓침'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.navy,
    paddingTop: SPACING.xl,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
  },

  // Missed Banner
  missedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  missedBannerText: {
    flex: 1,
  },
  missedTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.white,
  },
  missedSubtext: {
    fontSize: FONT_SIZE.sm,
    color: '#FFB8B0',
    marginTop: 2,
    lineHeight: 18,
  },

  // Check-in Button
  checkinSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  checkinButton: {
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
  },
  checkinButtonActive: {
    backgroundColor: COLORS.gold,
  },
  checkinButtonText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.white,
  },
  countdownLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    fontWeight: '600',
  },
  checkinHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
    marginTop: SPACING.md,
  },

  // Simulate
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  simulateText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.coral,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Section
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },

  // Frequency
  frequencyRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  frequencyItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  frequencyItemActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  frequencyLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.slate,
  },
  frequencyLabelActive: {
    color: COLORS.white,
  },

  // Time
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  timeLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  timeInput: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gold,
    textAlign: 'center',
    width: 80,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold + '40',
    paddingVertical: SPACING.xs,
  },

  // Custom Message
  messageInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
    minHeight: 60,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },

  // Contacts
  contactCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  contactNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactNumber: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.gold,
  },
  contactHeaderLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  contactFields: {
    gap: SPACING.sm,
  },
  contactInput: {
    backgroundColor: COLORS.warmGray,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
  },

  // History
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.lightText,
    marginTop: SPACING.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  historyDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTime: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
  },
  historyStatus: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginTop: 1,
  },
});
