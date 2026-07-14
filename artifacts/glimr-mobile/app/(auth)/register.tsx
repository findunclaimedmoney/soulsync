import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

type Step = 'register' | 'verify';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register, verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    setError('');
    const e = email.trim();
    const p = password;
    if (!e || !p) { setError('Email and password are required.'); return; }
    if (p.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const result = await register(e, p);
      setRegisteredEmail(result.email);
      setStep('verify');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    const code = otp.trim();
    if (!code) { setError('Please enter the verification code.'); return; }

    setLoading(true);
    try {
      await verifyOtp(registeredEmail, code);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const isVerifyStep = step === 'verify';

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 60,
        paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 40,
        paddingHorizontal: 28,
        flexGrow: 1,
        justifyContent: 'center',
      }}
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.wordmark, { color: colors.primary }]}>GLIMR</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {isVerifyStep ? 'Check your email' : 'Create your account'}
        </Text>
        {isVerifyStep && (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Enter the 6-digit code sent to{'\n'}{registeredEmail}
          </Text>
        )}
      </View>

      {/* Form */}
      <View style={styles.form}>
        {!isVerifyStep ? (
          <>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Email"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <TextInput
                ref={passwordRef}
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Password (6+ characters)"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>
          </>
        ) : (
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground, textAlign: 'center', letterSpacing: 8, fontSize: 22 }]}
              placeholder="000000"
              placeholderTextColor={colors.mutedForeground}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleVerify}
            />
          </View>
        )}

        {error ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
        ) : null}

        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
          onPress={isVerifyStep ? handleVerify : handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
              {isVerifyStep ? 'Verify & Continue' : 'Create Account'}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Already have an account?</Text>
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={[styles.footerLink, { color: colors.primary }]}> Sign in</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', marginBottom: 48 },
  wordmark: {
    fontSize: 36,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'PlayfairDisplay_400Regular',
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_400Regular',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  form: { gap: 14 },
  inputWrap: {
    borderRadius: 14,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 15,
    fontFamily: 'PlayfairDisplay_400Regular',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_400Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontSize: 15,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 36,
  },
  footerText: { fontSize: 14, fontFamily: 'PlayfairDisplay_400Regular' },
  footerLink: { fontSize: 14, fontFamily: 'PlayfairDisplay_700Bold' },
});
