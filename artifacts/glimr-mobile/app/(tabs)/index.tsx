import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanionCard } from '@/components/CompanionCard';
import { COMPANIONS, type Companion } from '@/constants/companions';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0) + 16;
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 + 50 : 50) + 16;

  const renderItem = ({ item }: { item: Companion }) => (
    <CompanionCard
      companion={item}
      onPress={() => router.push(`/chat/${item.id}`)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={COMPANIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 16,
          gap: 12,
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.wordmark, { color: colors.primary }]}>GLIMR</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Your companions
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 20,
  },
  wordmark: {
    fontSize: 30,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 5,
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_400Regular',
    letterSpacing: 0.5,
  },
  row: {
    gap: 12,
    justifyContent: 'space-between',
  },
});
