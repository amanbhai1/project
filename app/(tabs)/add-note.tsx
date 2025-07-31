import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, createNote, updateNote } = useNotes();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const isEditing = !!id;
  const existingNote = notes.find(note => note.id === id);

  // Handle user authentication redirect
  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
    }
  }, [isEditing, existingNote]);

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
        router.back();
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

  // Don't render if user is not authenticated
  if (!user) {
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
                onPress={() => router.back()}
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
    marginHorizontal: -8, // Negative margin to create spacing
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
