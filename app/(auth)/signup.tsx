import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

interface Agreement {
  key: string;
  label: string;
  required: boolean;
}

const AGREEMENTS: Agreement[] = [
  { key: 'terms', label: '[필수] 이용약관 동의', required: true },
  { key: 'privacy', label: '[필수] 개인정보 수집/이용 동의', required: true },
  { key: 'age', label: '[필수] 만 14세 이상', required: true },
  { key: 'marketing', label: '[선택] 마케팅 수신 동의', required: false },
];

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signUpWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const toggleAgreement = (key: string) => {
    setAgreed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    const allChecked = AGREEMENTS.every((a) => agreed[a.key]);
    const next: Record<string, boolean> = {};
    AGREEMENTS.forEach((a) => {
      next[a.key] = !allChecked;
    });
    setAgreed(next);
  };

  const allRequiredAgreed = AGREEMENTS.filter((a) => a.required).every((a) => agreed[a.key]);

  const handleSignup = async () => {
    // 유효성 검사
    if (!email.trim()) {
      Alert.alert('입력 오류', '이메일을 입력해주세요.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('입력 오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!nickname.trim()) {
      Alert.alert('입력 오류', '닉네임을 입력해주세요.');
      return;
    }
    if (!allRequiredAgreed) {
      Alert.alert('동의 필요', '필수 약관에 모두 동의해주세요.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, nickname.trim());
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use') {
        Alert.alert('가입 실패', '이미 사용 중인 이메일입니다.');
      } else if (code === 'auth/invalid-email') {
        Alert.alert('입력 오류', '올바른 이메일 형식이 아닙니다.');
      } else if (code === 'auth/weak-password') {
        Alert.alert('입력 오류', '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.');
      } else {
        Alert.alert('오류', '회원가입 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
      console.error('[Signup] 회원가입 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 헤더 ===== */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>안전이별과 함께 보호받으세요</Text>

        {/* ===== 입력 폼 ===== */}
        <View style={styles.formSection}>
          {/* 이메일 */}
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={COLORS.slate} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor={COLORS.lightText}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* 비밀번호 */}
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.slate} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호 (6자 이상)"
              placeholderTextColor={COLORS.lightText}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.slate} />
            </TouchableOpacity>
          </View>

          {/* 비밀번호 확인 */}
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.slate} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호 확인"
              placeholderTextColor={COLORS.lightText}
              secureTextEntry={!showPassword}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
            />
          </View>

          {/* 닉네임 */}
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={COLORS.slate} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="닉네임"
              placeholderTextColor={COLORS.lightText}
              autoCapitalize="none"
              value={nickname}
              onChangeText={setNickname}
            />
          </View>
        </View>

        {/* ===== 약관 동의 ===== */}
        <View style={styles.agreementSection}>
          {/* 전체 동의 */}
          <TouchableOpacity style={styles.agreementAllRow} onPress={toggleAll} activeOpacity={0.7}>
            <Ionicons
              name={AGREEMENTS.every((a) => agreed[a.key]) ? 'checkbox' : 'square-outline'}
              size={22}
              color={AGREEMENTS.every((a) => agreed[a.key]) ? COLORS.gold : COLORS.lightText}
            />
            <Text style={styles.agreementAllText}>전체 동의</Text>
          </TouchableOpacity>

          <View style={styles.agreementDivider} />

          {AGREEMENTS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.agreementRow}
              onPress={() => toggleAgreement(item.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={agreed[item.key] ? 'checkbox' : 'square-outline'}
                size={20}
                color={agreed[item.key] ? COLORS.gold : COLORS.lightText}
              />
              <Text style={[styles.agreementText, item.required && styles.agreementRequired]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ===== 회원가입 버튼 ===== */}
        <TouchableOpacity
          style={[
            styles.signupButton,
            (!allRequiredAgreed || loading) && styles.signupButtonDisabled,
          ]}
          activeOpacity={0.7}
          onPress={handleSignup}
          disabled={!allRequiredAgreed || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.signupButtonText}>회원가입</Text>
          )}
        </TouchableOpacity>

        {/* ===== 로그인 링크 ===== */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12 }}
        >
          <Text style={styles.loginLinkText}>
            이미 계정이 있으신가요? <Text style={styles.loginLinkBold}>로그인</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },

  // ── Header ──
  header: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
    marginBottom: SPACING.xl,
  },

  // ── Form ──
  formSection: {
    gap: SPACING.sm,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    height: 50,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.darkText,
  },

  // ── Agreement ──
  agreementSection: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
  },
  agreementAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  agreementAllText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  agreementDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 6,
  },
  agreementText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },
  agreementRequired: {
    color: COLORS.darkText,
  },

  // ── Signup Button ──
  signupButton: {
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  signupButtonDisabled: {
    opacity: 0.4,
  },
  signupButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── Login Link ──
  loginLink: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginLinkText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },
  loginLinkBold: {
    fontWeight: '700',
    color: COLORS.gold,
  },
});
