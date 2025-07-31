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
  ScrollView,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertTriangle, Play } from 'lucide-react-native';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/firebaseService';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showDemoOption, setShowDemoOption] = useState(false);
  
  const { signUp } = useAuth();
  const { colors } = useTheme();
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const demoAnim = useRef(new Animated.Value(0)).current;

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
    // Demo option animation
    Animated.spring(demoAnim, {
      toValue: showDemoOption ? 1 : 0,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [showDemoOption]);

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

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const validateForm = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    return isEmailValid && isPasswordValid && isConfirmPasswordValid;
  };

  const handleDemoMode = async () => {
    setDemoLoading(true);
    
    try {
      await authService.signInDemo();
      Alert.alert(
        'Demo Mode Active! 🎉',
        'You\'re now using a demo account. You can create and manage notes, but they won\'t be permanently saved. This is perfect for testing the app!',
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

  const showDemoModeOption = () => {
    setShowDemoOption(true);
    Alert.alert(
      'Registration Issue',
      'Email registration is currently not available. Would you like to try our demo mode instead? You can explore all features without creating an account.',
      [
        {
          text: 'Contact Support',
          style: 'cancel',
          onPress: () => {
            Alert.alert(
              'Contact Support',
              'Please email support@notes-app.com for assistance with account registration.',
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
  };

  const handleRegister = async () => {
    if (!validateForm()) {
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
      await signUp(email, password);
      
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
      console.error('Registration error:', err);
      
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
      
      // Check if this is an email/password not allowed error
      if (err.message && err.message.includes('not available')) {
        showDemoModeOption();
      } else {
        setError(err.message || 'Registration failed');
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
          <ScrollView contentContainerStyle={styles.scrollContent}>
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
                  <Text style={[styles.logoText, { color: colors.primary }]}>✨</Text>
                </View>
                <Text style={[styles.title, { color: colors.onSurface }]}>Create Account</Text>
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                  Join us and start organizing your notes
                </Text>
              </View>

              {/* Demo Mode Banner */}
              {showDemoOption && (
                <Animated.View
                  style={[
                    styles.demoBanner,
                    { 
                      backgroundColor: colors.primary + '15',
                      borderColor: colors.primary + '40',
                      opacity: demoAnim,
                      transform: [
                        {
                          scale: demoAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.demoHeader}>
                    <AlertTriangle size={20} color={colors.primary} />
                    <Text style={[styles.demoTitle, { color: colors.primary }]}>
                      Registration Unavailable
                    </Text>
                  </View>
                  <Text style={[styles.demoText, { color: colors.onSurfaceVariant }]}>
                    Email registration is temporarily disabled. Try our demo mode to explore all features!
                  </Text>
                  <Button
                    title="Start Demo"
                    onPress={handleDemoMode}
                    loading={demoLoading}
                    disabled={demoLoading}
                    size="small"
                    variant="filled"
                    leftIcon={<Play size={16} color="#FFFFFF" />}
                    style={styles.demoButton}
                  />
                </Animated.View>
              )}

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
                      if (confirmPassword && confirmPasswordError) {
                        validateConfirmPassword(confirmPassword);
                      }
                    }}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
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

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) validateConfirmPassword(text);
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                    error={confirmPasswordError}
                    leftIcon={<Lock size={20} color={colors.onSurfaceVariant} />}
                    rightIcon={
                      <Pressable 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeButton}
                      >
                        {showConfirmPassword ? 
                          <EyeOff size={20} color={colors.onSurfaceVariant} /> : 
                          <Eye size={20} color={colors.onSurfaceVariant} />
                        }
                      </Pressable>
                    }
                    style={styles.input}
                  />
                </View>

                <Button
                  title="Create Account"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                  variant="gradient"
                  style={styles.registerButton}
                  rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
                />

                {/* Alternative Option */}
                <Pressable 
                  onPress={showDemoModeOption}
                  style={[styles.alternativeButton, { backgroundColor: colors.surface }]}
                >
                  <Play size={20} color={colors.primary} />
                  <Text style={[styles.alternativeText, { color: colors.primary }]}>
                    Try Demo Mode Instead
                  </Text>
                </Pressable>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.onSurfaceVariant }]}>
                  Already have an account?{' '}
                </Text>
                <Pressable 
                  onPress={() => router.push('/auth/login')}
                  style={styles.linkContainer}
                >
                  <Text style={[styles.linkText, { color: colors.primary }]}>
                    Sign in
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
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
  demoBanner: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  demoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  demoButton: {
    alignSelf: 'flex-start',
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
  registerButton: {
    width: '100%',
    marginTop: 8,
    height: 56,
    marginBottom: 16,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(103, 80, 164, 0.3)',
  },
  alternativeText: {
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
