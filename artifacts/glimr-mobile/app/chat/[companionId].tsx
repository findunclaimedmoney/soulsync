import React, { useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetch } from 'expo/fetch';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ChatInput } from '@/components/ChatInput';
import { MessageBubble } from '@/components/MessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import { getCompanion } from '@/constants/companions';
import { getBaseUrl } from '@/lib/api';
import { useColors } from '@/hooks/useColors';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Module-level counter for guaranteed unique IDs
let msgCounter = 0;
function uniqueId(): string {
  msgCounter++;
  return `msg-${Date.now()}-${msgCounter}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { companionId } = useLocalSearchParams<{ companionId: string }>();
  const companion = getCompanion(companionId ?? '');

  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const handleSend = async (text: string) => {
    if (isStreaming || !companion) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Capture current messages BEFORE state update to avoid stale closure
    const currentMessages = [...messages];

    const userMsg: Message = { id: uniqueId(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setShowTyping(true);

    try {
      const chatHistory = [
        ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: text },
      ];

      const response = await fetch(`${getBaseUrl()}/api/mobile/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: chatHistory,
          systemPrompt: companion.systemPrompt,
          companionId: companion.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';
      let assistantAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data) as { content?: string };
            if (parsed.content) {
              fullContent += parsed.content;

              if (!assistantAdded) {
                setShowTyping(false);
                setMessages((prev) => [
                  ...prev,
                  { id: uniqueId(), role: 'assistant', content: fullContent },
                ]);
                assistantAdded = true;
              } else {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: fullContent,
                  };
                  return updated;
                });
              }
            }
          } catch {
            // Ignore malformed JSON chunks
          }
        }
      }
    } catch {
      setShowTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: uniqueId(), role: 'assistant', content: "I'm having trouble connecting right now. Please try again." },
      ]);
    } finally {
      setIsStreaming(false);
      setShowTyping(false);
    }
  };

  if (!companion) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Companion not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.primary, fontFamily: 'PlayfairDisplay_400Regular', marginTop: 12 }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const reversedMessages = [...messages].reverse();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Image
            source={{ uri: companion.image }}
            style={[styles.headerAvatar, { borderColor: companion.accentColor }]}
            contentFit="cover"
          />
          <View>
            <Text style={[styles.headerName, { color: colors.foreground }]}>{companion.name}</Text>
            <Text style={[styles.headerTagline, { color: companion.accentColor }]}>{companion.tagline}</Text>
          </View>
        </View>

        {/* Right spacer for symmetry */}
        <View style={styles.backButton} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <FlatList
          data={reversedMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} companionName={item.role === 'assistant' ? companion.name : undefined} />
          )}
          inverted={!!messages.length}
          ListHeaderComponent={showTyping ? <TypingIndicator /> : null}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Image
                source={{ uri: companion.image }}
                style={[styles.emptyAvatar, { borderColor: companion.accentColor }]}
                contentFit="cover"
              />
              <Text style={[styles.emptyName, { color: colors.foreground }]}>{companion.name}</Text>
              <Text style={[styles.emptyTagline, { color: companion.accentColor }]}>{companion.tagline}</Text>
              <Text style={[styles.emptyDescription, { color: colors.mutedForeground }]}>{companion.description}</Text>
              <Text style={[styles.startHint, { color: colors.mutedForeground }]}>Say hello to begin</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        <View style={{ paddingBottom: bottomPad }}>
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
  },
  headerName: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  headerTagline: {
    fontSize: 11,
    fontFamily: 'PlayfairDisplay_400Regular',
    letterSpacing: 0.5,
  },
  messageList: {
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
    gap: 8,
  },
  emptyAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    marginBottom: 8,
  },
  emptyName: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  emptyTagline: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay_400Regular',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
  },
  startHint: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_400Regular',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_400Regular',
  },
});
