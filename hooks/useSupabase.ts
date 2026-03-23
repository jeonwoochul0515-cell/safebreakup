// Supabase 연동 커스텀 훅
// 현재는 모든 함수가 mock 데이터를 반환합니다.
// TODO: Supabase 연동 시 교체

import { useState, useCallback } from 'react';
import type {
  User,
  UserCase,
  ChatMessage,
  CasePhase,
  CaseStatus,
} from '@/types/database';

// ─── useAuth ────────────────────────────────────────────
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signInWithPhone = useCallback(async (phone: string) => {
    // TODO: Supabase 연동 시 교체
    setIsLoading(true);
    console.log('[mock] signInWithPhone:', phone);
    setIsLoading(false);
    return { success: true };
  }, []);

  const verifyOTP = useCallback(async (phone: string, otp: string) => {
    // TODO: Supabase 연동 시 교체
    setIsLoading(true);
    console.log('[mock] verifyOTP:', phone, otp);
    const mockUser: User = {
      id: 'mock-user-001',
      phone,
      nickname: '사용자',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subscription_tier: 'free',
      is_active: true,
    };
    setUser(mockUser);
    setIsLoading(false);
    return { success: true, user: mockUser };
  }, []);

  const signOut = useCallback(async () => {
    // TODO: Supabase 연동 시 교체
    setUser(null);
    return { success: true };
  }, []);

  return {
    user,
    isLoading,
    signInWithPhone,
    verifyOTP,
    signOut,
    isAuthenticated: !!user,
  };
}

// ─── useCase ────────────────────────────────────────────
export function useCase() {
  const [currentCase, setCurrentCase] = useState<UserCase | null>(null);

  const createCase = useCallback(async (title: string): Promise<UserCase> => {
    // TODO: Supabase 연동 시 교체
    const newCase: UserCase = {
      id: `case-${Date.now()}`,
      user_id: 'mock-user-001',
      title,
      status: 'intake' as CaseStatus,
      current_phase: 1 as CasePhase,
      risk_level: null,
      fact_summary: {},
      option_a: null,
      option_b: null,
      selected_option: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCurrentCase(newCase);
    return newCase;
  }, []);

  const updateCase = useCallback(async (id: string, updates: Partial<UserCase>) => {
    // TODO: Supabase 연동 시 교체
    setCurrentCase((prev) => (prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null));
    return { success: true };
  }, []);

  const getCase = useCallback(async (id: string): Promise<UserCase | null> => {
    // TODO: Supabase 연동 시 교체
    console.log('[mock] getCase:', id);
    return currentCase;
  }, [currentCase]);

  return {
    currentCase,
    createCase,
    updateCase,
    getCase,
  };
}

// ─── useConversation ────────────────────────────────────
export function useConversation() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPhase, setCurrentPhase] = useState<CasePhase>(1);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    // TODO: Supabase 연동 시 교체
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      conversation_id: 'mock-conv-001',
      role: 'user',
      content,
      phase: currentPhase,
      created_at: new Date().toISOString(),
    };

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      conversation_id: 'mock-conv-001',
      role: 'assistant',
      content: '[mock] 응답 준비 중입니다...',
      phase: currentPhase,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsLoading(false);
    return assistantMsg;
  }, [currentPhase]);

  return {
    messages,
    sendMessage,
    currentPhase,
    isLoading,
  };
}

// ─── useSearch ──────────────────────────────────────────
export function useSearch() {
  const [results, setResults] = useState<unknown[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    // TODO: Supabase 연동 시 교체 (pgvector 유사도 검색)
    setIsSearching(true);
    console.log('[mock] search:', query);
    setResults([]);
    setIsSearching(false);
    return [];
  }, []);

  return {
    results,
    search,
    isSearching,
  };
}
