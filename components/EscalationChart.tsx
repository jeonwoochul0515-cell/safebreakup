import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';

interface Incident {
  date: string;
  severity: number;
  category: string;
  categoryIcon?: string;
  categoryColor?: string;
  description: string;
}

interface EscalationChartProps {
  incidents: Incident[];
}

const getSeverityColor = (s: number) => {
  if (s <= 1) return COLORS.sage;
  if (s <= 2) return '#D4A373';
  if (s <= 3) return COLORS.coral;
  if (s <= 4) return COLORS.coralDark;
  return '#C4634B';
};

export default function EscalationChart({ incidents }: EscalationChartProps) {
  if (!incidents.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="analytics-outline" size={48} color={COLORS.lightText} />
        <Text style={styles.emptyText}>기록된 사건이 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {incidents.map((incident, index) => {
        const dotSize = 12 + incident.severity * 4;
        const color = getSeverityColor(incident.severity);
        const isLast = index === incidents.length - 1;

        return (
          <View key={index} style={styles.row}>
            {/* Left: date */}
            <View style={styles.dateCol}>
              <Text style={styles.dateText}>{incident.date}</Text>
            </View>

            {/* Center: timeline */}
            <View style={styles.timelineCol}>
              <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color }]} />
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Right: content */}
            <View style={styles.contentCol}>
              <View style={styles.contentCard}>
                <View style={styles.contentHeader}>
                  <Ionicons name={(incident.categoryIcon as any) || 'alert-circle'} size={16} color={incident.categoryColor || color} />
                  <Text style={[styles.categoryText, { color: incident.categoryColor || color }]}>{incident.category}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.severityText, { color }]}>심각도 {incident.severity}</Text>
                  </View>
                </View>
                <Text style={styles.descText} numberOfLines={2}>{incident.description}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: SPACING.sm },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { color: COLORS.lightText, marginTop: SPACING.sm, fontSize: FONT_SIZE.md },
  row: { flexDirection: 'row', minHeight: 70 },
  dateCol: { width: 65, alignItems: 'flex-end', paddingRight: SPACING.sm, paddingTop: 2 },
  dateText: { fontSize: FONT_SIZE.xs, color: COLORS.lightText },
  timelineCol: { width: 30, alignItems: 'center' },
  dot: { zIndex: 1 },
  line: { width: 2, flex: 1, backgroundColor: COLORS.borderLight, marginVertical: 2 },
  contentCol: { flex: 1, paddingLeft: SPACING.sm, paddingBottom: SPACING.md },
  contentCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.sm, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.borderLight },
  contentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  categoryText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  severityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 'auto' },
  severityText: { fontSize: 10, fontWeight: '600' },
  descText: { fontSize: FONT_SIZE.sm, color: COLORS.darkText, lineHeight: 18 },
});
