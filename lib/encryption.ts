// 암호화 유틸리티 (플레이스홀더)
// TODO: expo-crypto 또는 react-native-aes-crypto로 실제 구현 교체
// 현재는 passthrough로 동작합니다.

/**
 * 데이터 암호화 (현재 passthrough)
 * TODO: AES-256-GCM 암호화 구현
 */
export function encrypt(data: string, _key?: string): string {
  // TODO: 실제 암호화 구현
  return data;
}

/**
 * 데이터 복호화 (현재 passthrough)
 * TODO: AES-256-GCM 복호화 구현
 */
export function decrypt(data: string, _key?: string): string {
  // TODO: 실제 복호화 구현
  return data;
}

/**
 * 암호화 키 생성 (현재 더미 키 반환)
 * TODO: 안전한 랜덤 키 생성 구현
 */
export function generateKey(): string {
  // TODO: expo-crypto의 getRandomBytes 사용
  return 'placeholder-encryption-key-' + Date.now().toString(36);
}
