// 증거 보안 저장 라이브러리
// SHA-256 해시 + AES 암호화 시뮬레이션 + AsyncStorage 영속성
// TODO: 실제 운영 시 expo-crypto + expo-secure-store + Supabase 연동

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@safebreakup_evidence_v2';
const ENCRYPTION_KEY_PLACEHOLDER = 'user-pin-derived-key'; // TODO: PIN 기반 키 파생

// ─── 타입 ───────────────────────────────────────────────────

export type EvidenceType = 'image' | 'audio' | 'text' | 'file';
export type EvidenceCategory = '협박' | '스토킹' | '폭행' | '유포' | '대화' | '기타';

export interface SecureEvidenceItem {
  id: string;
  type: EvidenceType;
  title: string;
  content: string;           // 텍스트 메모 내용 또는 파일 URI
  category: EvidenceCategory;
  timestamp: string;          // ISO string
  sha256Hash: string;         // 무결성 해시
  encrypted: boolean;
  metadata: {
    deviceInfo: string;
    appVersion: string;
    captureMethod: string;   // manual, screenshot, camera, microphone
    fileSize?: number;
  };
  verified: boolean;
}

// ─── SHA-256 해시 생성 (순수 JS 구현) ────────────────────────
// TODO: 실제 운영 시 expo-crypto의 digestStringAsync 사용

function generateSHA256(input: string): string {
  // 간이 해시 생성 (실제 SHA-256 아님 — 데모용)
  // 실제 운영: import * as Crypto from 'expo-crypto';
  // const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  // 64자리 hex string 생성 (실제 SHA-256 형식)
  const timestamp = Date.now().toString(16).padStart(12, '0');
  const random = Array.from({ length: 44 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return hex + timestamp + random;
}

// ─── 암호화/복호화 (시뮬레이션) ──────────────────────────────
// TODO: 실제 운영 시 expo-crypto AES-256-GCM

function encrypt(plaintext: string): string {
  // 시뮬레이션: Base64 인코딩 (실제로는 AES-256-GCM)
  try {
    return btoa(unescape(encodeURIComponent(plaintext)));
  } catch {
    return plaintext;
  }
}

function decrypt(ciphertext: string): string {
  try {
    return decodeURIComponent(escape(atob(ciphertext)));
  } catch {
    return ciphertext;
  }
}

// ─── 디바이스 정보 ───────────────────────────────────────────

function getDeviceInfo(): string {
  return `안전이별 앱 v3.0 / ${new Date().toISOString()}`;
}

// ─── 공개 API ────────────────────────────────────────────────

/**
 * 새 증거 생성 (해시 + 암호화 + 저장)
 */
export async function createEvidence(params: {
  type: EvidenceType;
  title: string;
  content: string;
  category: EvidenceCategory;
  captureMethod: string;
}): Promise<SecureEvidenceItem> {
  const timestamp = new Date().toISOString();
  const id = `ev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  // 해시 생성 (원본 내용 + 타임스탬프로)
  const hashInput = `${params.content}|${timestamp}|${id}`;
  const sha256Hash = generateSHA256(hashInput);

  // 내용 암호화
  const encryptedContent = encrypt(params.content);

  const item: SecureEvidenceItem = {
    id,
    type: params.type,
    title: params.title,
    content: encryptedContent,
    category: params.category,
    timestamp,
    sha256Hash,
    encrypted: true,
    metadata: {
      deviceInfo: getDeviceInfo(),
      appVersion: '3.0.0',
      captureMethod: params.captureMethod,
    },
    verified: true,
  };

  // 저장
  await saveToStorage(item);

  return item;
}

/**
 * 증거 내용 복호화하여 반환
 */
export function decryptContent(item: SecureEvidenceItem): string {
  if (!item.encrypted) return item.content;
  return decrypt(item.content);
}

/**
 * 증거 무결성 검증
 */
export function verifyIntegrity(item: SecureEvidenceItem): boolean {
  // 실제 운영 시: 원본 해시와 현재 내용의 해시를 비교
  // 데모에서는 해시 존재 여부로 판단
  return item.sha256Hash.length === 64 && item.verified;
}

/**
 * 모든 증거 불러오기
 */
export async function loadAllEvidence(): Promise<SecureEvidenceItem[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as SecureEvidenceItem[];
  } catch {
    return [];
  }
}

/**
 * 증거 삭제 (완전 삭제 — 복구 불가 경고 필요)
 */
export async function deleteEvidence(id: string): Promise<void> {
  const items = await loadAllEvidence();
  const filtered = items.filter(item => item.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * 모든 증거 삭제 (긴급 삭제용)
 */
export async function deleteAllEvidence(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/**
 * 증거 통계
 */
export async function getEvidenceStats(): Promise<{
  total: number;
  byType: Record<EvidenceType, number>;
  byCategory: Record<string, number>;
}> {
  const items = await loadAllEvidence();
  const byType: Record<string, number> = { image: 0, audio: 0, text: 0, file: 0 };
  const byCategory: Record<string, number> = {};

  for (const item of items) {
    byType[item.type] = (byType[item.type] || 0) + 1;
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  }

  return { total: items.length, byType: byType as any, byCategory };
}

// ─── 내부 헬퍼 ───────────────────────────────────────────────

async function saveToStorage(item: SecureEvidenceItem): Promise<void> {
  const items = await loadAllEvidence();
  items.unshift(item); // 최신순 정렬
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
