import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
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

  useShakeDetection(() => setStealthMode(true), safetySettings.quickExitTrigger === 'shake');

  // Lead magnet popup after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isStealthMode) {
        setShowLeadMagnet(true);
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [isStealthMode]);

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
      </Stack>

      {/* Floating SOS button — always visible */}
      <FloatingSOS onPress={() => setShowSOS(true)} />

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
