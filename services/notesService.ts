import { Note, CreateNoteData, UpdateNoteData } from '@/types/Note';

// Mock data storage for demo purposes
let mockNotes: Note[] = [];
let nextId = 1;

class NotesService {
  async getNotes(userId: string): Promise<Note[]> {
    try {
      // Filter notes by userId for the mock data
      return mockNotes.filter(note => note.userId === userId);
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  async createNote(userId: string, noteData: CreateNoteData): Promise<string> {
    try {
      const newNote: Note = {
        id: `note-${nextId++}`,
        ...noteData,
        userId,
        timestamp: new Date(),
      };
      mockNotes.push(newNote);
      return newNote.id;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  async updateNote(noteId: string, noteData: UpdateNoteData): Promise<void> {
    try {
      const noteIndex = mockNotes.findIndex(note => note.id === noteId);
      if (noteIndex !== -1) {
        mockNotes[noteIndex] = {
          ...mockNotes[noteIndex],
          ...noteData,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      mockNotes = mockNotes.filter(note => note.id !== noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  subscribeToNotes(userId: string, callback: (notes: Note[]) => void) {
    // For demo purposes, call the callback immediately with current notes
    const userNotes = mockNotes.filter(note => note.userId === userId);
    callback(userNotes);
    
    // Return a mock unsubscribe function
    return () => {
      console.log('Unsubscribed from notes');
    };
  }
}
}

export const notesService = new NotesService();