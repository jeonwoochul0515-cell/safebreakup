// ─── Firebase Auth Context ──────────────────────────────────────────────────
// Firebase Auth를 감싸는 인증 Context
// - onAuthStateChanged로 로그인 상태 실시간 감시
// - Firestore users/{uid}에서 프로필 조회/자동 생성
// - Google OAuth (expo-auth-session) + Email/Password 지원
// ──────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithCredential,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { auth, db } from '@/lib/firebase';

// Google OAuth 팝업 완료 처리
WebBrowser.maybeCompleteAuthSession();

// ─── Firestore 유저 프로필 타입 ───────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  email: string | null;
  nickname: string;
  role: 'user' | 'admin';
  subscription_tier: 'free' | 'standard';
  subscription_start?: string;
  subscription_end?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── AuthContext 타입 ─────────────────────────────────────────────────────────
export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, nickname: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Firestore 프로필 조회/생성 헬퍼 ──────────────────────────────────────────
async function fetchOrCreateProfile(
  firebaseUser: FirebaseUser,
  nickname?: string,
): Promise<UserProfile> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  // 첫 로그인 = 자동 회원가입
  const now = new Date().toISOString();
  const newProfile: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    nickname: nickname || firebaseUser.displayName || '사용자',
    role: 'user',
    subscription_tier: 'free',
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  await setDoc(userRef, {
    ...newProfile,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return newProfile;
}

// ─── AuthProvider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Google OAuth (expo-auth-session)
  // TODO: iosClientId, androidClientId, webClientId를 실제 Google OAuth 클라이언트 ID로 교체
  // useIdTokenAuthRequest: Firebase signInWithCredential에 필요한 id_token을 직접 반환
  const [_request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_WEB_CLIENT_ID',             // TODO: 실제 웹 클라이언트 ID로 교체
    iosClientId: 'YOUR_IOS_CLIENT_ID',          // TODO: 실제 값으로 교체
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',  // TODO: 실제 값으로 교체
  });

  // ── onAuthStateChanged 실시간 감시 ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const profile = await fetchOrCreateProfile(firebaseUser);
          setUserProfile(profile);
        } catch (err) {
          console.error('[AuthContext] 프로필 조회 실패:', err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // ── Google OAuth 응답 처리 ──────────────────────────────────────────────────
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch((err) => {
        console.error('[AuthContext] Google 로그인 실패:', err);
      });
    }
  }, [response]);

  // ── 로그인/회원가입 메서드 ──────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, nickname: string) => {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // 프로필 즉시 생성 (닉네임 포함)
      const profile = await fetchOrCreateProfile(result.user, nickname);
      setUserProfile(profile);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: userProfile?.role === 'admin',
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
