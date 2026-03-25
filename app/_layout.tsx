import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import { useShakeDetection } from '@/hooks/useShakeDetection';
import FloatingSOS from '@/components/FloatingSOS';
import SOSModal from '@/components/SOSModal';
import LeadMagnetPopup from '@/components/LeadMagnetPopup';
import StealthCalculatorScreen from './stealth';

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isStealthMode, setStealthMode, safetySettings } = useAppContext();
  const [showSOS, setShowSOS] = useState(false);
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  useShakeDetection(() => setStealthMode(true), safetySettings.quickExitTrigger === 'shake');

  // Lead magnet popup after 30 seconds (어드민에서는 비활성)
  useEffect(() => {
    if (isAdmin) return;
    const timer = setTimeout(() => {
      if (!isStealthMode) {
        setShowLeadMagnet(true);
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [isStealthMode, isAdmin]);

  const handleEnableStealthMode = useCallback(() => {
    setShowSOS(false);
    setStealthMode(true);
  }, [setStealthMode]);

  // Stealth mode: show calculator instead of normal app
  if (isStealthMode) {
    return (
      <>
        <StatusBar style="light" />
        <StealthCalculatorScreen />
      </>
    );
  }

  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.navy },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: COLORS.cream },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="diagnosis"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="diagnosis-result"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="letter"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="consultation"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="checklist"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="subscription"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="digital-delete"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="ai-secretary"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="safety-settings"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="stealth"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: '설정',
          }}
        />

        {/* ── v3 New Modules ── */}
        {/* M1: Danger Assessment */}
        <Stack.Screen name="danger-assessment" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="escalation-timeline" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="safety-planner" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="coercive-control" options={{ headerShown: false, animation: 'slide_from_right' }} />

        {/* M2: Stalking Response */}
        <Stack.Screen name="stalking-log" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="digital-security" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="stalkerware-guide" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="contact-monitor" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="safety-checkin" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="restraining-order" options={{ headerShown: false, animation: 'slide_from_right' }} />

        {/* Escort & Security */}
        <Stack.Screen name="escort-service" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="security-partner" options={{ headerShown: false, animation: 'slide_from_right' }} />

        {/* M3: NCII Response */}
        <Stack.Screen name="ncii-response" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="takedown-templates" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="deepfake-response" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="sextortion-response" options={{ headerShown: false, animation: 'slide_from_right' }} />

        {/* M4A: Financial Abuse */}
        <Stack.Screen name="financial-abuse" options={{ headerShown: false, animation: 'slide_from_right' }} />

        {/* M4B: Gaslighting */}
        <Stack.Screen name="gaslighting-test" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="gaslighting-journal" options={{ headerShown: false, animation: 'slide_from_right' }} />

        {/* M4C: Trauma Recovery */}
        <Stack.Screen name="grounding" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="self-assessment" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="recovery-tracker" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="therapist-directory" options={{ headerShown: false, animation: 'slide_from_right' }} />

        {/* M4D: Safe Places */}
        <Stack.Screen name="safe-places" options={{ headerShown: false, animation: 'slide_from_right' }} />

        {/* M4F: Evidence Forensics */}
        <Stack.Screen name="evidence-forensics" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="police-report" options={{ headerShown: false, animation: 'slide_from_right' }} />

        {/* Landing & Hub */}
        <Stack.Screen name="landing" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="services-hub" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>

      {/* Floating SOS button — 어드민 제외 */}
      {!isAdmin && <FloatingSOS onPress={() => setShowSOS(true)} />}

      {/* SOS emergency modal */}
      <SOSModal
        visible={showSOS}
        onClose={() => setShowSOS(false)}
        onEnableStealthMode={handleEnableStealthMode}
      />

      {/* Lead magnet popup (after 30s) */}
      <LeadMagnetPopup
        visible={showLeadMagnet}
        onClose={() => setShowLeadMagnet(false)}
      />

      <StatusBar style="light" />
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
