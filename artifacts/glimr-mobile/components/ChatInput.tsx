import React, { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const colors = useColors();
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(trimmed);
    inputRef.current?.focus();
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.foreground, fontFamily: 'PlayfairDisplay_400Regular' }]}
          placeholder="Say something..."
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
          blurOnSubmit={false}
          onSubmitEditing={Platform.OS === 'web' ? handleSend : undefined}
        />
        <Pressable
          style={[
            styles.sendButton,
            { backgroundColor: canSend ? colors.primary : colors.secondary },
          ]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Feather name="send" size={16} color={canSend ? colors.primaryForeground : colors.mutedForeground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 28,
    borderWidth: 0.5,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 120,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    alignSelf: 'flex-end',
  },
});
