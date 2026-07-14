import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{ requiresVerification: boolean; email: string }>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = '@glimr/user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);

  // On mount: try to restore session from server (cookie-based)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      try {
        // Check if we have a cached user
        const cached = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (cached) {
          const cachedUser = JSON.parse(cached) as User;
          setUser(cachedUser);
        }

        // Validate session with server
        const res = await apiFetch('auth/me');
        if (res.ok) {
          const serverUser = await res.json() as User;
          setUser(serverUser);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(serverUser));
        } else {
          // Session expired or invalid
          setUser(null);
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch {
        // Network error: keep cached user if available for offline UX
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error((data as { error?: string }).error || 'Login failed');
    }

    const loggedInUser = data as User;
    setUser(loggedInUser);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await apiFetch('auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error((data as { error?: string }).error || 'Registration failed');
    }

    return { requiresVerification: true, email };
  }, []);

  const verifyOtp = useCallback(async (email: string, otpCode: string) => {
    const res = await apiFetch('auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error((data as { error?: string }).error || 'Verification failed');
    }

    // After verification, fetch the user
    const meRes = await apiFetch('auth/me');
    if (meRes.ok) {
      const serverUser = await meRes.json() as User;
      setUser(serverUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(serverUser));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    const res = await apiFetch('auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    const updated = await res.json();
    if (!res.ok) {
      throw new Error((updated as { error?: string }).error || 'Update failed');
    }

    const newUser = updated as User;
    setUser(newUser);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, verifyOtp, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
