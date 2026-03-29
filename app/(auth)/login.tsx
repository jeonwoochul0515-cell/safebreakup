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
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, signInWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        Alert.alert('로그인 실패', '이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (code === 'auth/invalid-email') {
        Alert.alert('입력 오류', '올바른 이메일 형식이 아닙니다.');
      } else {
        Alert.alert('오류', '로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
      console.error('[Login] 로그인 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      Alert.alert('오류', '구글 로그인에 실패했습니다.');
      console.error('[Login] Google 로그인 실패:', err);
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
        {/* ===== 로고 + 앱 이름 ===== */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={48} color={COLORS.white} />
          </View>
          <Text style={styles.appName}>안전이별</Text>
          <Text style={styles.appDesc}>법률사무소 청송이 함께하는 안전한 이별</Text>
        </View>

        {/* ===== 구글 로그인 버튼 ===== */}
        <TouchableOpacity
          style={[styles.googleButton, SHADOW.sm]}
          activeOpacity={0.7}
          onPress={handleGoogleLogin}
        >
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text style={styles.googleButtonText}>Google로 계속하기</Text>
        </TouchableOpacity>

        {/* ===== 구분선 ===== */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ===== 이메일 로그인 폼 ===== */}
        <View style={styles.formSection}>
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

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.slate} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor={COLORS.lightText}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={COLORS.slate}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            activeOpacity={0.7}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ===== 회원가입 링크 ===== */}
        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/(auth)/signup')}
          hitSlop={{ top: 12, bottom: 12 }}
        >
          <Text style={styles.signupLinkText}>
            계정이 없으신가요? <Text style={styles.signupLinkBold}>회원가입</Text>
          </Text>
        </TouchableOpacity>

        {/* ===== 하단 면책 문구 ===== */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>법률사무소 청송 제공</Text>
          <Text style={styles.disclaimerText}>본 서비스는 법률 상담을 대체하지 않습니다.</Text>
        </View>
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

  // ── Logo ──
  logoSection: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: SPACING.xs,
  },
  appDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },

  // ── Google Button ──
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  googleButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.darkText,
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  dividerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.lightText,
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
  loginButton: {
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── Signup Link ──
  signupLink: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  signupLinkText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.slate,
  },
  signupLinkBold: {
    fontWeight: '700',
    color: COLORS.gold,
  },

  // ── Disclaimer ──
  disclaimer: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
    gap: 2,
  },
  disclaimerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.lightText,
  },
});
