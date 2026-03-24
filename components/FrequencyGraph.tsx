import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface DataPoint {
  label: string;
  value: number;
}

interface FrequencyGraphProps {
  data: DataPoint[];
  maxValue?: number;
  color?: string;
  height?: number;
}

export default function FrequencyGraph({ data, maxValue: propMax, color = COLORS.coral, height = 150 }: FrequencyGraphProps) {
  const maxValue = propMax || Math.max(...data.map(d => d.value), 1);
  const animValues = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animValues.map((av, i) =>
      Animated.timing(av, {
        toValue: data[i].value / maxValue,
        duration: 800,
        delay: i * 60,
        useNativeDriver: false,
      })
    );
    Animated.parallel(animations).start();
  }, [data]);

  return (
    <View style={styles.container}>
      {/* Y-axis label */}
      <View style={styles.yAxis}>
        <Text style={styles.yLabel}>{maxValue}</Text>
        <Text style={styles.yLabel}>{Math.round(maxValue / 2)}</Text>
        <Text style={styles.yLabel}>0</Text>
      </View>
      {/* Bars */}
      <View style={[styles.chart, { height }]}>
        {/* Grid lines */}
        <View style={[styles.gridLine, { bottom: '50%' }]} />
        <View style={[styles.gridLine, { bottom: '100%' }]} />

        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const barHeight = animValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, height - 20],
            });

            return (
              <View key={index} style={styles.barWrapper}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: item.value >= maxValue * 0.8 ? COLORS.coralDark : color,
                    },
                  ]}
                >
                  {item.value > 0 && (
                    <Text style={styles.barValue}>{item.value}</Text>
                  )}
                </Animated.View>
                <Text style={styles.barLabel} numberOfLines={1}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: SPACING.sm },
  yAxis: { width: 30, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4, paddingBottom: 18 },
  yLabel: { fontSize: 9, color: COLORS.lightText },
  chart: { flex: 1, position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: COLORS.borderLight },
  barsContainer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: 18 },
  barWrapper: { alignItems: 'center', flex: 1, maxWidth: 40 },
  bar: {
    width: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: 2,
  },
  barValue: { fontSize: 9, color: COLORS.white, fontWeight: '700', marginTop: 2 },
  barLabel: { fontSize: 9, color: COLORS.lightText, marginTop: 3, textAlign: 'center' },
});
