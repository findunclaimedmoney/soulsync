import React from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { type Companion } from '@/constants/companions';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px margins + 16px gap
const CARD_HEIGHT = CARD_WIDTH * 1.45;

interface CompanionCardProps {
  companion: Companion;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CompanionCard({ companion, onPress }: CompanionCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle, { borderRadius: colors.radius, borderColor: colors.border }]}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      onPress={onPress}
    >
      <Image
        source={{ uri: companion.image }}
        style={[StyleSheet.absoluteFill, { borderRadius: colors.radius }]}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.92)']}
        locations={[0.3, 0.65, 1]}
        style={[StyleSheet.absoluteFill, { borderRadius: colors.radius }]}
      />
      {/* Gold top border accent */}
      <View style={[styles.topBorder, { backgroundColor: companion.accentColor, borderTopLeftRadius: colors.radius, borderTopRightRadius: colors.radius }]} />
      <View style={styles.content}>
        <Text style={[styles.tagline, { color: companion.accentColor }]}>{companion.tagline}</Text>
        <Text style={styles.name}>{companion.name}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    borderWidth: 0.5,
    backgroundColor: '#131313',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 8,
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'PlayfairDisplay_400Regular',
    marginBottom: 2,
  },
  name: {
    fontSize: 22,
    color: '#F5F5F5',
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 0.3,
  },
});
