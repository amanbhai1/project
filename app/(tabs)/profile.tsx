import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { User, Moon, Sun, Smartphone } from 'lucide-react-native';

export default function ProfileScreen() {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'info' | 'success' | 'error'>('info');
  
  const { user, signOut } = useAuth();
  const { colors, theme, setTheme, effectiveTheme } = useTheme();

  const showMessage = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showMessage('Signed out successfully', 'success');
      router.replace('/auth/login');
    } catch (error) {
      showMessage('Failed to sign out', 'error');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={20} color={colors.onSurfaceVariant} />;
      case 'dark':
        return <Moon size={20} color={colors.onSurfaceVariant} />;
      default:
        return <Smartphone size={20} color={colors.onSurfaceVariant} />;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authPrompt}>
          <Text style={[styles.authTitle, { color: colors.onSurface }]}>Not Signed In</Text>
          <Text style={[styles.authSubtitle, { color: colors.onSurfaceVariant }]}>
            Please sign in to view your profile
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/auth/login')}
            style={styles.signInButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.onSurface }]}>Profile</Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.email, { color: colors.onSurface }]}>{user.email}</Text>
              <Text style={[styles.uid, { color: colors.onSurfaceVariant }]}>
                User ID: {user.uid.substring(0, 8)}...
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.settingsTitle, { color: colors.onSurface }]}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              {getThemeIcon()}
              <Text style={[styles.settingLabel, { color: colors.onSurface }]}>Theme</Text>
            </View>
            <View style={styles.themeOptions}>
              <Button
                title="Light"
                variant={theme === 'light' ? 'filled' : 'outlined'}
                size="small"
                onPress={() => setTheme('light')}
                style={styles.themeButton}
              />
              <Button
                title="Dark"
                variant={theme === 'dark' ? 'filled' : 'outlined'}
                size="small"
                onPress={() => setTheme('dark')}
                style={styles.themeButton}
              />
              <Button
                title="System"
                variant={theme === 'system' ? 'filled' : 'outlined'}
                size="small"
                onPress={() => setTheme('system')}
                style={styles.themeButton}
              />
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outlined"
            style={[styles.signOutButton, { borderColor: colors.error }]}
            textStyle={{ color: colors.error }}
          />
        </View>
      </View>

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
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  uid: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  settingsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
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
    marginBottom: 32,
  },
  signInButton: {
    width: '100%',
  },
});