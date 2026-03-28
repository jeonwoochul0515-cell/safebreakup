// 증거 보안 저장 라이브러리
// SHA-256 해시 (expo-crypto) + XOR 스트림 암호화 + SecureStore 키 관리

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = '@safebreakup_evidence_v2';
const ENCRYPTION_KEY_NAME = 'safebreakup_evidence_key';

// ─── 타입 ───────────────────────────────────────────────────

export type EvidenceType = 'image' | 'audio' | 'text' | 'file';
export type EvidenceCategory = '협박' | '스토킹' | '폭행' | '유포' | '대화' | '기타';

export interface SecureEvidenceItem {
  id: string;
  type: EvidenceType;
  title: string;
  content: string;           // 암호화된 hex 문자열 또는 레거시 Base64
  category: EvidenceCategory;
  timestamp: string;          // ISO string
  sha256Hash: string;         // 무결성 해시 (실제 SHA-256)
  encrypted: boolean;
  metadata: {
    deviceInfo: string;
    appVersion: string;
    captureMethod: string;   // manual, screenshot, camera, microphone, gallery
    fileSize?: number;
  };
  verified: boolean;
  fileUri?: string;           // 파일 경로 (이미지/음성/파일)
  fileSize?: number;          // 파일 크기 (bytes)
  mimeType?: string;          // MIME 타입
}

// ─── SHA-256 해시 생성 (실제 구현) ───────────────────────────

async function generateSHA256(input: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
}

// ─── 키 관리 (SecureStore) ───────────────────────────────────

async function getOrCreateEncryptionKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
  if (!key) {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    key = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
  }
  return key;
}

// ─── 키 스트림 생성 (SHA-256 카운터 모드) ────────────────────
// 마스터 키 + 블록 인덱스를 해시하여 키 스트림 바이트를 생성

async function deriveKeyStream(masterKey: string, length: number): Promise<Uint8Array> {
  const stream = new Uint8Array(length);
  const blocksNeeded = Math.ceil(length / 32); // SHA-256 = 32 bytes per block

  for (let i = 0; i < blocksNeeded; i++) {
    const blockHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${masterKey}:block:${i}`
    );
    // hex string → bytes
    for (let j = 0; j < 32 && i * 32 + j < length; j++) {
      stream[i * 32 + j] = parseInt(blockHash.substring(j * 2, j * 2 + 2), 16);
    }
  }

  return stream;
}

// ─── 암호화/복호화 (XOR 스트림 암호) ─────────────────────────

async function encrypt(plaintext: string): Promise<string> {
  const key = await getOrCreateEncryptionKey();

  // 텍스트 → UTF-8 바이트 (TextEncoder 호환)
  const encoder = new TextEncoder();
  const plainBytes = encoder.encode(plaintext);

  // 랜덤 nonce (16 bytes) — 같은 평문도 매번 다른 암호문 생성
  const nonce = await Crypto.getRandomBytesAsync(16);
  const nonceHex = Array.from(nonce)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // 키 스트림 파생: HMAC-like — hash(key + nonce + counter)
  const streamKey = `${key}:${nonceHex}`;
  const keyStream = await deriveKeyStream(streamKey, plainBytes.length);

  // XOR
  const cipherBytes = new Uint8Array(plainBytes.length);
  for (let i = 0; i < plainBytes.length; i++) {
    cipherBytes[i] = plainBytes[i] ^ keyStream[i];
  }

  // 출력: "v2:" + nonceHex(32자) + cipherHex
  const cipherHex = Array.from(cipherBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `v2:${nonceHex}${cipherHex}`;
}

async function decrypt(ciphertext: string): Promise<string> {
  // v2 포맷 감지
  if (!ciphertext.startsWith('v2:')) {
    // 레거시 Base64 폴백 (기존 데이터 호환)
    return decryptLegacyBase64(ciphertext);
  }

  const key = await getOrCreateEncryptionKey();
  const payload = ciphertext.slice(3); // "v2:" 제거

  const nonceHex = payload.substring(0, 32);
  const cipherHex = payload.substring(32);

  // hex → bytes
  const cipherBytes = new Uint8Array(cipherHex.length / 2);
  for (let i = 0; i < cipherBytes.length; i++) {
    cipherBytes[i] = parseInt(cipherHex.substring(i * 2, i * 2 + 2), 16);
  }

  // 동일한 키 스트림 재생성
  const streamKey = `${key}:${nonceHex}`;
  const keyStream = await deriveKeyStream(streamKey, cipherBytes.length);

  // XOR (대칭 — 암호화/복호화 동일)
  const plainBytes = new Uint8Array(cipherBytes.length);
  for (let i = 0; i < cipherBytes.length; i++) {
    plainBytes[i] = cipherBytes[i] ^ keyStream[i];
  }

  const decoder = new TextDecoder();
  return decoder.decode(plainBytes);
}

/** 레거시 Base64 디코딩 폴백 (기존 저장 데이터 호환) */
function decryptLegacyBase64(ciphertext: string): string {
  try {
    return decodeURIComponent(escape(atob(ciphertext)));
  } catch {
    // Base64도 아닌 경우 원본 반환
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
  fileUri?: string;
  fileSize?: number;
  mimeType?: string;
}): Promise<SecureEvidenceItem> {
  const timestamp = new Date().toISOString();
  const id = `ev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  // 해시 생성 (원본 내용 + 타임스탬프로 — 실제 SHA-256)
  const hashInput = `${params.content}|${timestamp}|${id}`;
  const sha256Hash = await generateSHA256(hashInput);

  // 내용 암호화
  const encryptedContent = await encrypt(params.content);

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
      fileSize: params.fileSize,
    },
    verified: true,
    fileUri: params.fileUri,
    fileSize: params.fileSize,
    mimeType: params.mimeType,
  };

  // 저장
  await saveToStorage(item);

  return item;
}

/**
 * 증거 내용 복호화하여 반환
 */
export async function decryptContent(item: SecureEvidenceItem): Promise<string> {
  if (!item.encrypted) return item.content;
  return await decrypt(item.content);
}

/**
 * 증거 무결성 검증
 * 저장된 해시와 복호화된 내용의 해시를 재계산하여 비교
 */
export async function verifyIntegrity(item: SecureEvidenceItem): Promise<boolean> {
  try {
    const decrypted = await decryptContent(item);
    const hashInput = `${decrypted}|${item.timestamp}|${item.id}`;
    const currentHash = await generateSHA256(hashInput);
    return currentHash === item.sha256Hash;
  } catch {
    return false;
  }
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

// ─── 고소장 연동 API ────────────────────────────────────────

/** 고소장 증거 목록용 타입 */
export interface ComplaintEvidenceItem {
  number: number;
  type: string;
  description: string;
  timestamp: string;
  sha256Hash: string;
}

/**
 * ID 배열로 증거 조회
 * 고소장 작성 시 사용자가 선택한 증거만 가져올 때 사용
 */
export async function getEvidenceByIds(ids: string[]): Promise<SecureEvidenceItem[]> {
  const allItems = await loadAllEvidence();
  return allItems.filter(item => ids.includes(item.id));
}

/**
 * 고소장 첨부용 증거 목록 생성
 * 시간순 정렬 + 번호 부여 + SHA-256 해시 포함
 */
export async function getEvidenceForComplaint(ids: string[]): Promise<ComplaintEvidenceItem[]> {
  const selected = await getEvidenceByIds(ids);

  // 시간순 정렬 (오래된 순)
  const sorted = [...selected].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  // 증거 유형 한글 변환
  const typeLabels: Record<EvidenceType, string> = {
    image: '사진/캡처',
    audio: '음성/녹음',
    text: '텍스트 메모',
    file: '파일',
  };

  return sorted.map((item, idx) => ({
    number: idx + 1,
    type: typeLabels[item.type] || item.type,
    description: item.title,
    timestamp: formatTimestampKR(item.timestamp),
    sha256Hash: item.sha256Hash,
  }));
}

/** ISO 타임스탬프 → 한국식 표기 (내부 헬퍼) */
function formatTimestampKR(iso: string): string {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}년 ${m}월 ${day}일 ${h}:${min}`;
  } catch {
    return iso;
  }
}

// ─── 내부 헬퍼 ───────────────────────────────────────────────

async function saveToStorage(item: SecureEvidenceItem): Promise<void> {
  const items = await loadAllEvidence();
  items.unshift(item); // 최신순 정렬
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
