import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User as UserIcon,
  Mail,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield,
  HelpCircle,
  Heart,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotes } from '@/hooks/useNotes';

export default function ProfileScreen() {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<
    'info' | 'success' | 'error'
  >('info');

  const { user, signOut } = useAuth();
  const { colors, theme, setTheme } = useTheme();
  const { notes } = useNotes();

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showMessage = (
    message: string,
    type: 'info' | 'success' | 'error' = 'info',
  ) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          // Show loading message
          showMessage('Signing out...', 'info');

          try {
            // Try to sign out properly
            await signOut();
          } catch (error) {
            console.error('Sign out error:', error);
          }

          // Always navigate to login screen
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    showMessage(`Switched to ${newTheme} theme`, 'success');
  };

  const getJoinDate = () => {
    // Since we don't have user creation date, we'll show a placeholder
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTotalWords = () => {
    return notes.reduce((total, note) => {
      return (
        total +
        note.content
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length
      );
    }, 0);
  };

  if (!user) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.authPrompt}>
          <Text style={[styles.authTitle, { color: colors.onSurface }]}>
            Profile
          </Text>
          <Text
            style={[styles.authSubtitle, { color: colors.onSurfaceVariant }]}
          >
            Please sign in to view your profile
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[colors.primary + '15', colors.background]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Header */}
            <View
              style={[
                styles.profileHeader,
                { backgroundColor: colors.surface },
              ]}
            >
              <LinearGradient
                colors={[colors.primary + '20', colors.surface]}
                style={styles.profileGradient}
              >
                <View
                  style={[
                    styles.avatarContainer,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>

                <Text style={[styles.userName, { color: colors.onSurface }]}>
                  {user.email?.split('@')[0] || 'User'}
                </Text>

                <View style={styles.userInfo}>
                  <View style={styles.infoItem}>
                    <Mail size={16} color={colors.onSurfaceVariant} />
                    <Text
                      style={[
                        styles.infoText,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {user.email}
                    </Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Calendar size={16} color={colors.onSurfaceVariant} />
                    <Text
                      style={[
                        styles.infoText,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Joined {getJoinDate()}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Stats */}
            <View
              style={[
                styles.statsContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Your Statistics
              </Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: colors.primary + '20' },
                    ]}
                  >
                    <FileText size={24} color={colors.primary} />
                  </View>
                  <Text
                    style={[styles.statNumber, { color: colors.onSurface }]}
                  >
                    {notes.length}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Notes
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: colors.primary + '20' },
                    ]}
                  >
                    <Heart size={24} color={colors.primary} />
                  </View>
                  <Text
                    style={[styles.statNumber, { color: colors.onSurface }]}
                  >
                    {getTotalWords()}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Words
                  </Text>
                </View>
              </View>
            </View>

            {/* Settings */}
            <View
              style={[
                styles.settingsContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Settings
              </Text>

              <View style={styles.settingsList}>
                <Pressable style={styles.settingItem} onPress={toggleTheme}>
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIcon,
                        { backgroundColor: colors.primary + '20' },
                      ]}
                    >
                      {theme === 'light' ? (
                        <Moon size={20} color={colors.primary} />
                      ) : (
                        <Sun size={20} color={colors.primary} />
                      )}
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.settingTitle,
                          { color: colors.onSurface },
                        ]}
                      >
                        Theme
                      </Text>
                      <Text
                        style={[
                          styles.settingSubtitle,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        {theme === 'light'
                          ? 'Switch to dark mode'
                          : 'Switch to light mode'}
                      </Text>
                    </View>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.settingItem}
                  onPress={() => showMessage('Settings coming soon!', 'info')}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIcon,
                        { backgroundColor: colors.primary + '20' },
                      ]}
                    >
                      <Settings size={20} color={colors.primary} />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.settingTitle,
                          { color: colors.onSurface },
                        ]}
                      >
                        Preferences
                      </Text>
                      <Text
                        style={[
                          styles.settingSubtitle,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        App settings and preferences
                      </Text>
                    </View>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.settingItem}
                  onPress={() =>
                    showMessage('Privacy settings coming soon!', 'info')
                  }
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIcon,
                        { backgroundColor: colors.primary + '20' },
                      ]}
                    >
                      <Shield size={20} color={colors.primary} />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.settingTitle,
                          { color: colors.onSurface },
                        ]}
                      >
                        Privacy & Security
                      </Text>
                      <Text
                        style={[
                          styles.settingSubtitle,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        Manage your privacy settings
                      </Text>
                    </View>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.settingItem}
                  onPress={() =>
                    showMessage('Help center coming soon!', 'info')
                  }
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIcon,
                        { backgroundColor: colors.primary + '20' },
                      ]}
                    >
                      <HelpCircle size={20} color={colors.primary} />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.settingTitle,
                          { color: colors.onSurface },
                        ]}
                      >
                        Help & Support
                      </Text>
                      <Text
                        style={[
                          styles.settingSubtitle,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        Get help and contact support
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Sign Out */}
            <View style={styles.signOutContainer}>
              <Button
                title="Sign Out"
                onPress={handleSignOut}
                variant="outlined"
                leftIcon={<LogOut size={20} color={colors.error} />}
                style={[styles.signOutButton, { borderColor: colors.error }]}
                textStyle={{ color: colors.error }}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>

      <Snackbar
        message={snackbarMessage}
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        type={snackbarType}
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
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileGradient: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  userInfo: {
    gap: 8,
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsList: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  signOutContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  signOutButton: {
    width: '100%',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
