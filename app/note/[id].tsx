import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Edit, Trash2, ArrowLeft } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { useNotes } from '@/hooks/useNotes';
import { useTheme } from '@/contexts/ThemeContext';
import { Note } from '@/types/Note';

export default function NoteDetailScreen() {
  const [note, setNote] = useState<Note | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'info' | 'success' | 'error'>('info');
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, deleteNote } = useNotes();
  const { colors } = useTheme();

  useEffect(() => {
    const foundNote = notes.find(n => n.id === id);
    setNote(foundNote || null);
  }, [notes, id]);

  const showMessage = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
  };

  const handleDelete = async () => {
    if (!note) return;
    
    try {
      await deleteNote(note.id);
      showMessage('Note deleted successfully', 'success');
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      showMessage('Failed to delete note', 'error');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!note) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.onSurface }]}>
            Note not found
          </Text>
          <Button
            title="Go Back"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/');
              }
            }}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/');
            }
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.onSurface} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/add-note?id=${note.id}`)}
            style={styles.actionButton}
          >
            <Edit size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.actionButton}
          >
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.noteContainer}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {note.title || 'Untitled'}
          </Text>
          
          <Text style={[styles.timestamp, { color: colors.onSurfaceVariant }]}>
            {formatDate(note.timestamp)}
          </Text>

          <Text style={[styles.noteContent, { color: colors.onSurface }]}>
            {note.content}
          </Text>
        </View>
      </ScrollView>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  noteContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 36,
  },
  timestamp: {
    fontSize: 14,
    marginBottom: 24,
    fontWeight: '500',
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
});
