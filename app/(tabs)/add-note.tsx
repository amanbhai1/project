import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
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
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, createNote, updateNote } = useNotes();
  const { user, loading: authLoading } = useAuth();
  const { colors } = useTheme();
  
  const isEditing = !!id;
  const existingNote = notes.find(note => note.id === id);
  const mountedRef = useRef(true);

  // Handle initial authentication check
  useFocusEffect(
    React.useCallback(() => {
      if (!authLoading && !user && mountedRef.current) {
        // Use timeout to avoid calling navigation during render
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
      
      setTimeout(() => {
        if (mountedRef.current) {
          router.back();
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
    if (mountedRef.current) {
      router.back();
    }
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <TextInput
              label="Title (Optional)"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter note title..."
              style={styles.titleInput}
            />

            <TextInput
              label="Content"
              value={content}
              onChangeText={setContent}
              placeholder="Start writing your note..."
              multiline
              numberOfLines={10}
              style={styles.contentInput}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="outlined"
                style={styles.cancelButton}
              />
              <Button
                title={isEditing ? 'Update Note' : 'Save Note'}
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleInput: {
    marginBottom: 16,
  },
  contentInput: {
    flex: 1,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  cancelButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  saveButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
