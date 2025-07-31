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
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Play, AlertCircle } from 'lucide-react-native';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/firebaseService';

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
  
  const { signIn } = useAuth();
  const { colors } = useTheme();
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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

  const handleDemoMode = async () => {
    setDemoLoading(true);
    
    try {
      await authService.signInDemo();
      Alert.alert(
        'Welcome to Demo Mode! 🎉',
        'You\'re now using a demo account. Explore all features - create, edit, and organize notes. Perfect for testing the app!',
        [
          {
            text: 'Start Exploring',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      setError(error.message || 'Demo mode failed. Please contact support.');
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
      
      // Check if this is an authentication availability issue
      if (err.message && (err.message.includes('not enabled') || err.message.includes('not available'))) {
        Alert.alert(
          'Authentication Issue',
          'Email/password authentication is currently not available. Would you like to try our demo mode instead?',
          [
            {
              text: 'Contact Support',
              style: 'cancel',
              onPress: () => {
                Alert.alert(
                  'Contact Support',
                  'Please email support@notes-app.com for assistance with account access.',
                  [{ text: 'OK' }]
                );
              },
            },
            {
              text: 'Try Demo Mode',
              onPress: handleDemoMode,
            },
          ]
        );
      } else {
        setError(err.message || 'Login failed');
        setShowError(true);
      }
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
      'Demo credentials filled! Note: If email authentication is not available, use the "Try Demo Mode" button below instead.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.logoText, { color: colors.primary }]}>📝</Text>
              </View>
              <Text style={[styles.title, { color: colors.onSurface }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                Sign in to continue to your notes
              </Text>
            </View>

            {/* Auth Issue Notice */}
            <View style={[styles.noticeContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.noticeHeader}>
                <AlertCircle size={16} color={colors.primary} />
                <Text style={[styles.noticeTitle, { color: colors.primary }]}>
                  Authentication Notice
                </Text>
              </View>
              <Text style={[styles.noticeText, { color: colors.onSurfaceVariant }]}>
                If you encounter login issues, try our demo mode to explore all features instantly!
              </Text>
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
                      {showPassword ? 
                        <EyeOff size={20} color={colors.onSurfaceVariant} /> : 
                        <Eye size={20} color={colors.onSurfaceVariant} />
                      }
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

              <View style={styles.buttonGroup}>
                <Pressable 
                  onPress={handleDemoLogin}
                  style={[styles.demoCredentialsButton, { backgroundColor: colors.surface }]}
                >
                  <Text style={[styles.demoCredentialsText, { color: colors.onSurface }]}>
                    Fill Demo Credentials
                  </Text>
                </Pressable>

                <Pressable 
                  onPress={handleDemoMode}
                  style={[styles.demoModeButton, { backgroundColor: colors.primary }]}
                  disabled={demoLoading}
                >
                  {demoLoading ? (
                    <Text style={styles.demoModeText}>Loading...</Text>
                  ) : (
                    <>
                      <Play size={16} color="#FFFFFF" />
                      <Text style={styles.demoModeText}>Try Demo Mode</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.onSurfaceVariant }]}>
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
    marginBottom: 32,
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
  noticeContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#6750A4',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
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
  buttonGroup: {
    gap: 12,
  },
  demoCredentialsButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(103, 80, 164, 0.3)',
  },
  demoCredentialsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  demoModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  demoModeText: {
    color: '#FFFFFF',
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
