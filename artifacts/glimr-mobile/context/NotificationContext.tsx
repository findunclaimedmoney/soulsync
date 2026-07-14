/**
 * NotificationContext
 * Manages push notification permissions, Expo push token registration,
 * and per-companion greeting preferences (stored in AsyncStorage).
 *
 * On real devices, requests permission and registers token with the API.
 * On web (preview), silently skips native push setup.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { COMPANIONS } from '@/constants/companions';

// ─── Storage keys ────────────────────────────────────────────────────────────
const PREFS_KEY = '@glimr/notification-prefs';

// ─── Types ───────────────────────────────────────────────────────────────────
/** companionId → whether daily greetings are enabled */
export type NotificationPrefs = Record<string, boolean>;

interface NotificationContextType {
  prefs: NotificationPrefs;
  toggleCompanion: (companionId: string, enabled: boolean) => Promise<void>;
  permissionGranted: boolean | null; // null = unknown / requesting
  requestPermission: () => Promise<void>;
}

// ─── Default prefs — all companions on by default ───────────────────────────
function defaultPrefs(): NotificationPrefs {
  return Object.fromEntries(COMPANIONS.map((c) => [c.id, true]));
}

// ─── Configure foreground behaviour ──────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Context ─────────────────────────────────────────────────────────────────
const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs());
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const registeredRef = useRef(false);
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(null);

  // ── Load saved prefs ──────────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as NotificationPrefs;
          setPrefs({ ...defaultPrefs(), ...saved });
        } catch {
          // ignore malformed data
        }
      }
    });
  }, []);

  // ── Request permission + register push token (native only) ───────────────
  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      setPermissionGranted(false);
      return;
    }
    try {
      // Cast needed: expo-notifications v57 types don't fully expose PermissionResponse fields
      const existingResult = (await Notifications.getPermissionsAsync()) as unknown as { granted: boolean };
      let granted = existingResult.granted;
      if (!granted) {
        const requestResult = (await Notifications.requestPermissionsAsync()) as unknown as { granted: boolean };
        granted = requestResult.granted;
      }
      setPermissionGranted(granted);

      if (granted && user?.id && !registeredRef.current) {
        registeredRef.current = true;
        const tokenData = await Notifications.getExpoPushTokenAsync();
        await apiFetch('mobile/push-token', {
          method: 'POST',
          body: JSON.stringify({ token: tokenData.data, userId: user.id }),
        });
      }
    } catch {
      setPermissionGranted(false);
    }
  }, [user]);

  // ── Register on login ────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.id && Platform.OS !== 'web') {
      requestPermission();
    }
  }, [user?.id, requestPermission]);

  // ── Handle notification taps → deep-link to companion chat ───────────────
  useEffect(() => {
    // Handle taps when app is already open
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          companionId?: string;
        };
        if (data?.companionId) {
          router.push(`/chat/${data.companionId}`);
        }
      },
    );

    // Handle taps that cold-start the app (last notification response)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = response.notification.request.content.data as {
        companionId?: string;
      };
      if (data?.companionId) {
        router.push(`/chat/${data.companionId}`);
      }
    });

    return () => {
      responseListenerRef.current?.remove();
    };
  }, []);

  // ── Toggle per-companion preference ──────────────────────────────────────
  const toggleCompanion = useCallback(async (companionId: string, enabled: boolean) => {
    const updated = { ...prefs, [companionId]: enabled };
    setPrefs(updated);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    // Sync with server (best-effort)
    apiFetch('mobile/notification-prefs', {
      method: 'POST',
      body: JSON.stringify({ prefs: updated }),
    }).catch(() => {});
  }, [prefs]);

  return (
    <NotificationContext.Provider
      value={{ prefs, toggleCompanion, permissionGranted, requestPermission }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
