import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Consent Categories ─────────────────────────────────────────────────────
// diagnosis: 진단 관련 (diagnosis, danger-assessment, gaslighting-test)
// evidence:  증거/기록 관련 (evidence, stalking-log, ai-secretary)

type ConsentCategory = 'diagnosis' | 'evidence';

const STORAGE_KEYS: Record<ConsentCategory, string> = {
  diagnosis: '@safebreakup_consent_diagnosis',
  evidence: '@safebreakup_consent_evidence',
};

/**
 * 해당 카테고리에 대해 사용자가 이미 동의했는지 확인합니다.
 */
export async function hasConsent(category: ConsentCategory): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS[category]);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * 해당 카테고리에 대한 동의를 저장합니다.
 */
export async function grantConsent(category: ConsentCategory): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS[category], 'true');
}
