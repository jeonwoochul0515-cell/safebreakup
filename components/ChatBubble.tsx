import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOW } from '@/constants/theme';

interface ChatBubbleProps {
  type: 'bot' | 'user';
  text: string;
  showAvatar?: boolean;
  showReviewBadge?: boolean;
  timestamp?: string;
}

export default function ChatBubble({
  type,
  text,
  showAvatar = true,
  showReviewBadge = false,
  timestamp,
}: ChatBubbleProps) {
  const isBot = type === 'bot';

  return (
    <View style={[styles.row, isBot ? styles.rowBot : styles.rowUser]}>
      {isBot && showAvatar && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>김</Text>
        </View>
      )}
      {isBot && !showAvatar && <View style={styles.avatarPlaceholder} />}

      <View style={styles.bubbleWrap}>
        <View
          style={[
            styles.bubble,
            isBot ? styles.bubbleBot : styles.bubbleUser,
          ]}
        >
          <Text style={[styles.text, isBot ? styles.textBot : styles.textUser]}>
            {text}
          </Text>
        </View>

        {showReviewBadge && (
          <View style={styles.reviewBadgeRow}>
            <Text style={styles.reviewShield}>🛡</Text>
            <Text style={styles.reviewBadge}>검토: 김창희 변호사</Text>
          </View>
        )}

        {timestamp && (
          <Text style={[styles.timestamp, isBot ? styles.tsLeft : styles.tsRight]}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: SPACING.md,
  },
  rowBot: {
    justifyContent: 'flex-start',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  avatarText: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  avatarPlaceholder: {
    width: 36,
    marginRight: SPACING.sm,
  },
  bubbleWrap: {
    maxWidth: '75%',
    flexShrink: 1,
  },
  bubble: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  bubbleBot: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: 4,
    ...SHADOW.sm,
  },
  bubbleUser: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
  },
  textBot: {
    color: COLORS.darkText,
  },
  textUser: {
    color: COLORS.white,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.lightText,
    marginTop: 4,
  },
  tsLeft: {
    textAlign: 'left',
  },
  tsRight: {
    textAlign: 'right',
  },
  reviewBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  reviewShield: {
    fontSize: 10,
  },
  reviewBadge: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },
});
