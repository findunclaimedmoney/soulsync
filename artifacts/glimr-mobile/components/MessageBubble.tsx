import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MessageBubbleProps {
  message: Message;
  companionName?: string;
}

export function MessageBubble({ message, companionName }: MessageBubbleProps) {
  const colors = useColors();
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={[styles.userBubble, { backgroundColor: colors.primary }]}>
          <Text style={[styles.userText, { color: colors.primaryForeground }]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantRow}>
      <View style={[styles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {companionName ? (
          <Text style={[styles.senderName, { color: colors.primary }]}>{companionName}</Text>
        ) : null}
        <Text style={[styles.assistantText, { color: colors.foreground }]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  userBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 20,
    borderBottomRightRadius: 4,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'PlayfairDisplay_400Regular',
  },
  assistantRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  assistantBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 0.5,
  },
  senderName: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'PlayfairDisplay_400Regular',
    marginBottom: 4,
  },
  assistantText: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: 'PlayfairDisplay_400Regular',
  },
});
