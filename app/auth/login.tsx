import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Play,
  Wifi,
  WifiOff,
  AlertTriangle,
  Zap,
} from 'lucide-react-native';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [networkError, setNetworkError] = useState(false);

  const { signIn, signInOfflineDemo } = useAuth();
  const { colors } = useTheme();

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const networkErrorAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  React.useEffect(() => {
    // Network error banner animation
    Animated.timing(networkErrorAnim, {
      toValue: networkError ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [networkError]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleOfflineDemo = async () => {
    setDemoLoading(true);

    try {
      await signInOfflineDemo();

      Alert.alert(
        '🎮 Demo Mode Active!',
        'Welcome to the offline demo! You can explore all features:\n\n✨ Create and edit notes\n🔍 Search and organize\n🎨 Switch themes\n📱 Responsive design\n\nAll features work perfectly offline!',
        [
          {
            text: 'Start Exploring',
            onPress: () => router.replace('/(tabs)'),
          },
        ],
      );
    } catch (error: any) {
      setError(error.message || 'Demo mode failed to start');
      setShowError(true);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    setNetworkError(false);

    // Add loading animation
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();

    try {
      await signIn(email, password);

      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Login error:', err);

      // Error animation
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Check if this is a network-related error
      const isNetworkError =
        err.message &&
        (err.message.includes('network') ||
          err.message.includes('connection') ||
          err.message.includes('offline') ||
          err.message.includes('timeout'));

      if (isNetworkError) {
        setNetworkError(true);
        setError('Connection failed. Try Demo Mode for offline access!');
      } else {
        setError(err.message || 'Login failed');
      }

      setShowError(true);
    } finally {
      setLoading(false);
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
    Alert.alert(
      'Demo Credentials',
      'Demo credentials filled! If you experience connection issues, use the "Offline Demo" button for instant access.',
      [{ text: 'OK', style: 'default' }],
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[colors.primary + '10', colors.background]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View
                style={[
                  styles.logoContainer,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Text style={[styles.logoText, { color: colors.primary }]}>
                  📝
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.onSurface }]}>
                Welcome Back
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.onSurfaceVariant }]}
              >
                Sign in to continue to your notes
              </Text>
            </View>

            {/* Network Error Banner */}
            {networkError && (
              <Animated.View
                style={[
                  styles.networkBanner,
                  {
                    backgroundColor: colors.error + '15',
                    borderColor: colors.error + '40',
                    opacity: networkErrorAnim,
                    transform: [
                      {
                        translateY: networkErrorAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <WifiOff size={20} color={colors.error} />
                <View style={styles.networkBannerText}>
                  <Text
                    style={[styles.networkBannerTitle, { color: colors.error }]}
                  >
                    Connection Issue
                  </Text>
                  <Text
                    style={[
                      styles.networkBannerSubtitle,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Try Offline Demo for instant access
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Offline Demo Highlight */}
            <View
              style={[
                styles.demoHighlight,
                {
                  backgroundColor: colors.primary + '15',
                  borderColor: colors.primary + '40',
                },
              ]}
            >
              <LinearGradient
                colors={[colors.primary + '20', colors.primary + '10']}
                style={styles.demoHighlightGradient}
              >
                <View style={styles.demoHighlightContent}>
                  <Zap size={24} color={colors.primary} />
                  <View style={styles.demoHighlightText}>
                    <Text
                      style={[
                        styles.demoHighlightTitle,
                        { color: colors.primary },
                      ]}
                    >
                      Instant Demo Access
                    </Text>
                    <Text
                      style={[
                        styles.demoHighlightSubtitle,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Try all features without internet connection
                    </Text>
                  </View>
                </View>

                <Button
                  title="Start Demo"
                  onPress={handleOfflineDemo}
                  loading={demoLoading}
                  disabled={demoLoading}
                  size="small"
                  variant="filled"
                  leftIcon={<Play size={16} color="#FFFFFF" />}
                  style={styles.demoHighlightButton}
                />
              </LinearGradient>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={emailError}
                  leftIcon={<Mail size={20} color={colors.onSurfaceVariant} />}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword(text);
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  error={passwordError}
                  leftIcon={<Lock size={20} color={colors.onSurfaceVariant} />}
                  rightIcon={
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={colors.onSurfaceVariant} />
                      ) : (
                        <Eye size={20} color={colors.onSurfaceVariant} />
                      )}
                    </Pressable>
                  }
                  style={styles.input}
                />
              </View>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
              />

              <Pressable
                onPress={handleDemoLogin}
                style={[
                  styles.demoCredentialsButton,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Wifi size={16} color={colors.onSurface} />
                <Text
                  style={[
                    styles.demoCredentialsText,
                    { color: colors.onSurface },
                  ]}
                >
                  Fill Demo Credentials
                </Text>
              </Pressable>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text
                style={[styles.footerText, { color: colors.onSurfaceVariant }]}
              >
                Don't have an account?{' '}
              </Text>
              <Pressable
                onPress={() => router.push('/auth/register')}
                style={styles.linkContainer}
              >
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Sign up
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>

      <Snackbar
        message={error}
        visible={showError}
        onDismiss={() => setShowError(false)}
        type="error"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  networkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  networkBannerText: {
    flex: 1,
  },
  networkBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  networkBannerSubtitle: {
    fontSize: 12,
  },
  demoHighlight: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  demoHighlightGradient: {
    padding: 16,
  },
  demoHighlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  demoHighlightText: {
    flex: 1,
  },
  demoHighlightTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  demoHighlightSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  demoHighlightButton: {
    alignSelf: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 0,
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
    height: 56,
  },
  demoCredentialsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(103, 80, 164, 0.3)',
    gap: 8,
  },
  demoCredentialsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  linkContainer: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
