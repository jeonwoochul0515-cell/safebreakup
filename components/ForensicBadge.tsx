import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface ForensicBadgeProps {
  hash: string;
  timestamp: string;
  verified?: boolean;
}

export default function ForensicBadge({ hash, timestamp, verified = true }: ForensicBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const displayHash = expanded ? hash : hash.substring(0, 16) + '...';

  return (
    <TouchableOpacity
      style={[styles.container, verified ? styles.verified : styles.unverified]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Ionicons
          name={verified ? 'shield-checkmark' : 'shield-outline'}
          size={14}
          color={verified ? COLORS.success : COLORS.lightText}
        />
        <Text style={[styles.label, { color: verified ? COLORS.success : COLORS.lightText }]}>
          {verified ? 'SHA-256 무결성 검증됨' : '미검증'}
        </Text>
      </View>
      <Text style={styles.hashText}>{displayHash}</Text>
      <Text style={styles.timeText}>{timestamp}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  verified: { backgroundColor: COLORS.success + '10', borderColor: COLORS.success + '30' },
  unverified: { backgroundColor: COLORS.warmGray, borderColor: COLORS.borderLight },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  label: { fontSize: 10, fontWeight: '600' },
  hashText: { fontSize: 9, fontFamily: 'monospace', color: COLORS.slate },
  timeText: { fontSize: 9, color: COLORS.lightText, marginTop: 1 },
});
