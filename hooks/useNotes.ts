import { useState, useEffect } from 'react';
import { Note, CreateNoteData, UpdateNoteData } from '@/types/Note';
import { notesService } from '@/services/notesService';
import { useAuth } from '@/contexts/AuthContext';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }

    setLoading(true);
    const unsubscribe = notesService.subscribeToNotes(user.uid, (newNotes) => {
      setNotes(newNotes);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const createNote = async (noteData: CreateNoteData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setError(null);
      await notesService.createNote(user.uid, noteData);
    } catch (err) {
      setError('Failed to create note');
      throw err;
    }
  };

  const updateNote = async (noteId: string, noteData: UpdateNoteData) => {
    try {
      setError(null);
      await notesService.updateNote(noteId, noteData);
    } catch (err) {
      setError('Failed to update note');
      throw err;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setError(null);
      await notesService.deleteNote(noteId);
    } catch (err) {
      setError('Failed to delete note');
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
  };
}
