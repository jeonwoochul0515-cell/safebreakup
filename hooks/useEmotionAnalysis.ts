// 클라이언트 사이드 감정 분석 (키워드 기반)
// 사용자의 메시지에서 위기 상황을 빠르게 감지하기 위한 1차 필터

import { useCallback } from 'react';
import type { EmotionState } from '@/types/database';

/** 위기 키워드 — 즉시 SOS 안내 필요 */
const CRISIS_KEYWORDS = ['죽고싶', '자살', '자해', '죽겠', '끝내고싶'];

/** 고통 키워드 — 공감 + 안정화 대응 */
const DISTRESSED_KEYWORDS = ['무서워', '두려워', '힘들어', '못견디겠', '괴로워'];

/** 불안 키워드 — 안심시키기 대응 */
const ANXIOUS_KEYWORDS = ['불안', '걱정', '어떡해', '모르겠', '답답'];

/**
 * 텍스트에서 감정 상태를 분석합니다.
 * 키워드 기반 1차 분류이며, 실제 서비스에서는 AI 감정 분석과 병행합니다.
 */
export function analyzeEmotion(text: string): EmotionState {
  const normalized = text.replace(/\s/g, '');

  // 위기 키워드 최우선 체크
  if (CRISIS_KEYWORDS.some((kw) => normalized.includes(kw))) {
    return 'crisis';
  }

  // 고통 키워드
  if (DISTRESSED_KEYWORDS.some((kw) => normalized.includes(kw))) {
    return 'distressed';
  }

  // 불안 키워드
  if (ANXIOUS_KEYWORDS.some((kw) => normalized.includes(kw))) {
    return 'anxious';
  }

  return 'calm';
}

/**
 * React hook: 감정 분석 기능 제공
 */
export function useEmotionAnalysis() {
  const analyze = useCallback((text: string): EmotionState => {
    return analyzeEmotion(text);
  }, []);

  return {
    analyzeEmotion: analyze,
    CRISIS_KEYWORDS,
    DISTRESSED_KEYWORDS,
    ANXIOUS_KEYWORDS,
  };
}
