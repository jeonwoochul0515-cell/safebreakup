// Supabase 클라이언트 설정
// TODO: Replace with actual Supabase project credentials

import { createClient } from '@supabase/supabase-js';

// TODO: 실제 Supabase 프로젝트 URL과 anon key로 교체
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // React Native에서는 AsyncStorage 사용
    // TODO: expo-secure-store로 교체 권장 (민감 데이터 보호)
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
