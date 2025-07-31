import { useState, useEffect } from 'react';
import { Note, CreateNoteData, UpdateNoteData } from '@/types/Note';
import { notesService } from '@/services/notesService';
import { offlineDemoService } from '@/services/offlineDemoService';
import { useAuth } from '@/contexts/AuthContext';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isOfflineMode } = useAuth();

  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }

    setLoading(true);
    
    let unsubscribe: (() => void) | undefined;

    if (isOfflineMode) {
      // Use offline demo service
      unsubscribe = offlineDemoService.subscribeToNotes((newNotes) => {
        setNotes(newNotes);
        setLoading(false);
        setError(null);
      });
    } else {
      // Use Firebase notes service
      try {
        unsubscribe = notesService.subscribeToNotes(user.uid, (newNotes) => {
          setNotes(newNotes);
          setLoading(false);
          setError(null);
        });
      } catch (err) {
        console.error('Notes subscription error:', err);
        setError('Failed to load notes. Please check your connection.');
        setLoading(false);
      }
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, isOfflineMode]);

  const createNote = async (noteData: CreateNoteData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setError(null);
      
      if (isOfflineMode) {
        await offlineDemoService.createNote(noteData);
      } else {
        await notesService.createNote(user.uid, noteData);
      }
    } catch (err: any) {
      const errorMessage = isOfflineMode 
        ? 'Failed to create note in demo mode'
        : 'Failed to create note. Please check your connection.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateNote = async (noteId: string, noteData: UpdateNoteData) => {
    try {
      setError(null);
      
      if (isOfflineMode) {
        await offlineDemoService.updateNote(noteId, noteData);
      } else {
        await notesService.updateNote(noteId, noteData);
      }
    } catch (err: any) {
      const errorMessage = isOfflineMode 
        ? 'Failed to update note in demo mode'
        : 'Failed to update note. Please check your connection.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setError(null);
      
      if (isOfflineMode) {
        await offlineDemoService.deleteNote(noteId);
      } else {
        await notesService.deleteNote(noteId);
      }
    } catch (err: any) {
      const errorMessage = isOfflineMode 
        ? 'Failed to delete note in demo mode'
        : 'Failed to delete note. Please check your connection.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    isOfflineMode, // Expose offline mode state
  };
}
