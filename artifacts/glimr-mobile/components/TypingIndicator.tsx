import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

function Dot({ delay }: { delay: number }) {
  const colors = useColors();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: colors.primary }, animatedStyle]}
    />
  );
}

export function TypingIndicator() {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <View style={[styles.bubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Dot delay={0} />
        <Dot delay={180} />
        <Dot delay={360} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 0.5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
