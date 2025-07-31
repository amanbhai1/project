import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Animated,
  Pressable,
  Alert
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Save, 
  ArrowLeft, 
  FileText, 
  Type, 
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function AddNoteScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'info' | 'success' | 'error'>('info');
  const [initialized, setInitialized] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, createNote, updateNote } = useNotes();
  const { user, loading: authLoading } = useAuth();
  const { colors } = useTheme();
  
  const isEditing = !!id;
  const existingNote = notes.find(note => note.id === id);
  const mountedRef = useRef(true);

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const saveButtonAnim = useRef(new Animated.Value(0)).current;

  // Track changes
  useEffect(() => {
    if (initialized) {
      const originalTitle = existingNote?.title || '';
      const originalContent = existingNote?.content || '';
      setHasChanges(title !== originalTitle || content !== originalContent);
    }
  }, [title, content, existingNote, initialized]);

  // Animate save button based on changes
  useEffect(() => {
    Animated.spring(saveButtonAnim, {
      toValue: hasChanges ? 1 : 0.7,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [hasChanges]);

  // Handle initial authentication check
  useFocusEffect(
    React.useCallback(() => {
      if (!authLoading && !user && mountedRef.current) {
        const timeoutId = setTimeout(() => {
          if (mountedRef.current) {
            router.replace('/auth/login');
          }
        }, 0);
        return () => clearTimeout(timeoutId);
      }
    }, [user, authLoading])
  );

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (user && !initialized) {
      setInitialized(true);
      
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
    }
  }, [user, initialized]);

  useEffect(() => {
    if (isEditing && existingNote && initialized) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
    }
  }, [isEditing, existingNote, initialized]);

  const showMessage = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      showMessage('Please enter a title or content', 'error');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && id) {
        await updateNote(id, { title: title.trim(), content: content.trim() });
        showMessage('Note updated successfully', 'success');
      } else {
        await createNote({ title: title.trim(), content: content.trim() });
        showMessage('Note created successfully', 'success');
      }
      
      setHasChanges(false);
      
      setTimeout(() => {
        if (mountedRef.current) {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/');
          }
        }
      }, 1000);
    } catch (error) {
      showMessage(
        isEditing ? 'Failed to update note' : 'Failed to create note',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          {
            text: 'Continue Editing',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              if (mountedRef.current) {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/');
                }
              }
            },
          },
        ]
      );
    } else {
      if (mountedRef.current) {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/');
        }
      }
    }
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharCount = (text: string) => {
    return text.length;
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          {/* Could add a loading spinner here */}
        </View>
      </SafeAreaView>
    );
  }

  // Don't render if user is not authenticated
  if (!user || !initialized) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '08', colors.background]}
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
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={handleCancel}
              style={[styles.backButton, { backgroundColor: colors.surface }]}
            >
              <ArrowLeft size={20} color={colors.onSurface} />
            </Pressable>
            
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
                {isEditing ? 'Edit Note' : 'New Note'}
              </Text>
              {hasChanges && (
                <View style={styles.changesIndicator}>
                  <View style={[styles.changesDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.changesText, { color: colors.onSurfaceVariant }]}>
                    Unsaved changes
                  </Text>
                </View>
              )}
            </View>

            <Animated.View
              style={[
                styles.saveButtonContainer,
                {
                  opacity: saveButtonAnim,
                  transform: [{ scale: saveButtonAnim }],
                },
              ]}
            >
              <Button
                title="Save"
                onPress={handleSave}
                loading={loading}
                disabled={loading || !hasChanges}
                size="small"
                variant="filled"
                leftIcon={<Save size={16} color="#FFFFFF" />}
              />
            </Animated.View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Title Input */}
              <View style={styles.inputSection}>
                <TextInput
                  label="Title"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter note title..."
                  style={styles.titleInput}
                  leftIcon={<Type size={20} color={colors.onSurfaceVariant} />}
                />
              </View>

              {/* Content Input */}
              <View style={styles.inputSection}>
                <TextInput
                  label="Content"
                  value={content}
                  onChangeText={setContent}
                  placeholder="Start writing your note..."
                  multiline
                  numberOfLines={15}
                  style={styles.contentInput}
                  leftIcon={<FileText size={20} color={colors.onSurfaceVariant} />}
                />
              </View>

              {/* Stats */}
              <View style={[styles.stats, { backgroundColor: colors.surface }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>
                    {getWordCount(content)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                    Words
                  </Text>
                </View>
                
                <View style={[styles.statDivider, { backgroundColor: colors.outline }]} />
                
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>
                    {getCharCount(content)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                    Characters
                  </Text>
                </View>
                
                <View style={[styles.statDivider, { backgroundColor: colors.outline }]} />
                
                <View style={styles.statItem}>
                  <Calendar size={16} color={colors.onSurfaceVariant} />
                  <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                    {new Date().toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  changesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changesDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  changesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  saveButtonContainer: {
    minWidth: 80,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  inputSection: {
    marginBottom: 24,
  },
  titleInput: {
    marginBottom: 0,
  },
  contentInput: {
    marginBottom: 0,
    minHeight: 200,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
  },
});
