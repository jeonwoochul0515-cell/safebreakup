// ─── Firebase 클라이언트 초기화 ─────────────────────────────────────────────
// Expo Go 호환: firebase JS SDK 사용 (react-native-firebase 아님)
// ──────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',                       // TODO: 실제 키로 교체
  authDomain: 'YOUR_PROJECT.firebaseapp.com',   // TODO: 실제 키로 교체
  projectId: 'YOUR_PROJECT_ID',                 // TODO: 실제 키로 교체
  storageBucket: 'YOUR_PROJECT.appspot.com',    // TODO: 실제 키로 교체
  messagingSenderId: 'YOUR_SENDER_ID',          // TODO: 실제 키로 교체
  appId: 'YOUR_APP_ID',                         // TODO: 실제 키로 교체
};

const app = initializeApp(firebaseConfig);

// Auth 초기화
// Firebase JS SDK v12 + Metro 번들러: RN 환경에서 자동으로
// AsyncStorage 기반 persistence를 선택합니다.
// @react-native-async-storage/async-storage가 설치되어 있으면 자동 연동.
const auth: Auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };
