import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.navy },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerBackTitle: '돌아가기',
        contentStyle: { backgroundColor: COLORS.cream },
      }}
    >
      <Stack.Screen name="index" options={{ title: '관리자 대시보드', headerShown: false }} />
      <Stack.Screen name="revenue" options={{ title: '매출/통계' }} />
      <Stack.Screen name="evidence" options={{ title: '증거 검토 관리' }} />
      <Stack.Screen name="content" options={{ title: '콘텐츠 관리' }} />
      <Stack.Screen name="consultations" options={{ title: '상담 관리' }} />
      <Stack.Screen name="users" options={{ title: '사용자 관리' }} />
      <Stack.Screen name="letter-generator" options={{ title: '경고장 생성기' }} />
      <Stack.Screen name="documents" options={{ title: '서류 검토 관리' }} />
      <Stack.Screen name="sos-logs" options={{ title: 'SOS 로그' }} />
    </Stack>
  );
}
