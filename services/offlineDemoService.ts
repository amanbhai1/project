// Offline demo service for when Firebase is unavailable
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, CreateNoteData, UpdateNoteData } from '@/types/Note';

// Mock user for offline demo
export const OFFLINE_DEMO_USER = {
  uid: 'offline-demo-user',
  email: 'demo@offline.com',
  displayName: 'Offline Demo User',
  emailVerified: false,
  isAnonymous: true,
  isDemo: true,
  isOffline: true,
};

// Storage keys
const STORAGE_KEYS = {
  NOTES: 'offline_demo_notes',
  USER: 'offline_demo_user',
};

// Generate unique ID for offline notes
const generateId = (): string => {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

class OfflineDemoService {
  private notes: Note[] = [];
  private listeners: Array<(notes: Note[]) => void> = [];

  // Initialize with demo data
  async initialize(): Promise<void> {
    try {
      const storedNotes = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
      if (storedNotes) {
        this.notes = JSON.parse(storedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp),
        }));
      } else {
        // Create some demo notes
        this.notes = this.createDemoNotes();
        await this.saveNotes();
      }
      this.notifyListeners();
    } catch (error) {
      console.error('Error initializing offline demo:', error);
      this.notes = this.createDemoNotes();
    }
  }

  private createDemoNotes(): Note[] {
    const now = new Date();
    return [
      {
        id: generateId(),
        title: 'Welcome to Demo Mode! 🎉',
        content: 'This is an offline demo of the notes app. You can create, edit, and delete notes even without an internet connection!\n\nAll features are available:\n• Create new notes\n• Edit existing notes\n• Search and filter\n• Delete notes\n• Switch between list and grid view\n\nYour demo notes are saved locally and will persist until you clear your browser data.',
        userId: OFFLINE_DEMO_USER.uid,
        timestamp: new Date(now.getTime() - 60000), // 1 minute ago
      },
      {
        id: generateId(),
        title: 'Features Overview',
        content: '✨ Interactive UI with smooth animations\n📝 Rich text editing experience\n🔍 Real-time search functionality\n📱 Responsive design for all devices\n🎨 Light and dark theme support\n💾 Auto-save capabilities\n🔄 Grid and list view modes',
        userId: OFFLINE_DEMO_USER.uid,
        timestamp: new Date(now.getTime() - 120000), // 2 minutes ago
      },
      {
        id: generateId(),
        title: 'Try Creating a Note!',
        content: 'Tap the + button to create your own note and experience the smooth, interactive interface. Everything works just like the real app!',
        userId: OFFLINE_DEMO_USER.uid,
        timestamp: new Date(now.getTime() - 180000), // 3 minutes ago
      },
    ];
  }

  private async saveNotes(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(this.notes));
    } catch (error) {
      console.error('Error saving offline notes:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback([...this.notes]));
  }

  // Get all notes for the demo user
  async getNotes(): Promise<Note[]> {
    return [...this.notes].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Create a new note
  async createNote(noteData: CreateNoteData): Promise<string> {
    const newNote: Note = {
      id: generateId(),
      ...noteData,
      userId: OFFLINE_DEMO_USER.uid,
      timestamp: new Date(),
    };

    this.notes.push(newNote);
    await this.saveNotes();
    this.notifyListeners();
    
    return newNote.id;
  }

  // Update an existing note
  async updateNote(noteId: string, noteData: UpdateNoteData): Promise<void> {
    const noteIndex = this.notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    this.notes[noteIndex] = {
      ...this.notes[noteIndex],
      ...noteData,
      timestamp: new Date(),
    };

    await this.saveNotes();
    this.notifyListeners();
  }

  // Delete a note
  async deleteNote(noteId: string): Promise<void> {
    const noteIndex = this.notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    this.notes.splice(noteIndex, 1);
    await this.saveNotes();
    this.notifyListeners();
  }

  // Subscribe to notes changes
  subscribeToNotes(callback: (notes: Note[]) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately call with current notes
    callback([...this.notes]);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Clear all demo data
  async clearDemoData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.NOTES);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      this.notes = [];
      this.notifyListeners();
    } catch (error) {
      console.error('Error clearing demo data:', error);
    }
  }

  // Get demo user
  getDemoUser() {
    return OFFLINE_DEMO_USER;
  }
}

export const offlineDemoService = new OfflineDemoService();
