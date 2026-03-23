import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const SHAKE_THRESHOLD = 1.8;
const DEBOUNCE_MS = 1000;

export function useShakeDetection(onShake: () => void, enabled: boolean): void {
  const lastShakeRef = useRef<number>(0);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    // No accelerometer on web
    if (Platform.OS === 'web' || !enabled) {
      return;
    }

    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeRef.current > DEBOUNCE_MS) {
          lastShakeRef.current = now;
          onShakeRef.current();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [enabled]);
}
