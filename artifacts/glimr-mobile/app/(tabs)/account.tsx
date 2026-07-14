import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useColors } from '@/hooks/useColors';
import { COMPANIONS } from '@/constants/companions';
import * as Haptics from 'expo-haptics';

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  const { prefs, toggleCompanion, permissionGranted, requestPermission } = useNotifications();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.fullName ?? user?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({ fullName: name, full_name: name });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditing(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/(auth)/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleToggle = async (companionId: string, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // If no permission yet, request it first then enable
    if (value && permissionGranted === false) {
      await requestPermission();
    }
    await toggleCompanion(companionId, value);
  };

  const initials = (user?.fullName ?? user?.full_name ?? user?.email ?? '?')
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0) + 20;
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 24;

  // Show notification section only on native (web doesn't support push)
  const showNotifications = Platform.OS !== 'web';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad, paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
          <Text style={[styles.initials, { color: colors.primary }]}>{initials}</Text>
        </View>
        {editing ? (
          <TextInput
            style={[styles.nameInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.mutedForeground}
            autoFocus
          />
        ) : (
          <Text style={[styles.displayName, { color: colors.foreground }]}>
            {user?.fullName ?? user?.full_name ?? 'Anonymous'}
          </Text>
        )}
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{user?.email}</Text>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Actions */}
      <View style={styles.section}>
        {editing ? (
          <View style={styles.editButtons}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.secondary, flex: 1 }]}
              onPress={() => { setEditing(false); setName(user?.fullName ?? user?.full_name ?? ''); }}
            >
              <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.primaryForeground} size="small" />
              ) : (
                <Text style={[styles.actionText, { color: colors.primaryForeground }]}>Save</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 0.5 }]}
            onPress={() => setEditing(true)}
          >
            <Text style={[styles.actionText, { color: colors.foreground }]}>Edit Profile</Text>
          </Pressable>
        )}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Info rows */}
      <View style={styles.section}>
        <InfoRow label="Account type" value="Member" colors={colors} />
        <InfoRow label="Email" value={user?.email ?? ''} colors={colors} />
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Daily Greetings — per-companion notification preferences */}
      {showNotifications && (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Greetings</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
              Choose which companions send you a morning message each day.
            </Text>

            {permissionGranted === false && (
              <Pressable
                style={[styles.permissionBanner, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={requestPermission}
              >
                <Text style={[styles.permissionText, { color: colors.mutedForeground }]}>
                  Tap to enable push notifications
                </Text>
              </Pressable>
            )}

            {COMPANIONS.map((companion) => (
              <View
                key={companion.id}
                style={[styles.companionRow, { borderBottomColor: colors.border }]}
              >
                <Image
                  source={{ uri: companion.image }}
                  style={[styles.companionAvatar, { borderColor: companion.accentColor }]}
                  contentFit="cover"
                />
                <View style={styles.companionInfo}>
                  <Text style={[styles.companionName, { color: colors.foreground }]}>{companion.name}</Text>
                  <Text style={[styles.companionTagline, { color: companion.accentColor }]}>{companion.tagline}</Text>
                </View>
                <Switch
                  value={prefs[companion.id] ?? true}
                  onValueChange={(val) => handleToggle(companion.id, val)}
                  trackColor={{ false: colors.muted, true: companion.accentColor }}
                  thumbColor={colors.primaryForeground}
                />
              </View>
            ))}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </>
      )}

      {/* Logout */}
      <Pressable
        style={[styles.logoutButton, { borderColor: colors.destructive }]}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color={colors.destructive} size="small" />
        ) : (
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarSection: { alignItems: 'center', paddingVertical: 32 },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 16,
  },
  initials: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  nameInput: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_400Regular',
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    textAlign: 'center',
    width: '70%',
    marginBottom: 6,
  },
  displayName: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 6,
  },
  email: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
  },
  divider: { height: 0.5, marginVertical: 4 },
  section: { paddingVertical: 16 },
  editButtons: { flexDirection: 'row', gap: 12 },
  actionButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
    maxWidth: '60%',
    textAlign: 'right',
  },
  logoutButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 0.3,
  },
  // Notification section
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_400Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionBanner: {
    borderRadius: 12,
    borderWidth: 0.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_400Regular',
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  companionAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
  },
  companionInfo: {
    flex: 1,
  },
  companionName: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  companionTagline: {
    fontSize: 11,
    fontFamily: 'PlayfairDisplay_400Regular',
    letterSpacing: 0.5,
  },
});
