import { Note, CreateNoteData, UpdateNoteData } from '@/types/Note';
import { firestoreService } from './firebaseService';

class NotesService {
  private get notesCollection() {
    return firestoreService.collection('notes');
  }

  async getNotes(userId: string): Promise<Note[]> {
    try {
      const queryRef = firestoreService.query(
        this.notesCollection,
        firestoreService.where('userId', '==', userId)
      );

      const snapshot = await firestoreService.getDocs(queryRef);

      const notes = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Note[];

      // Sort in memory to avoid index requirement
      return notes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  async createNote(userId: string, noteData: CreateNoteData): Promise<string> {
    try {
      const docData = {
        ...noteData,
        userId,
        timestamp: firestoreService.serverTimestamp(),
      };

      const docRef = await firestoreService.addDoc(this.notesCollection, docData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  async updateNote(noteId: string, noteData: UpdateNoteData): Promise<void> {
    try {
      const docRef = firestoreService.doc(this.notesCollection, noteId);
      const updateData = {
        ...noteData,
        timestamp: firestoreService.serverTimestamp(),
      };

      await firestoreService.updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      const docRef = firestoreService.doc(this.notesCollection, noteId);
      await firestoreService.deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  subscribeToNotes(userId: string, callback: (notes: Note[]) => void) {
    const queryRef = firestoreService.query(
      this.notesCollection,
      firestoreService.where('userId', '==', userId),
      firestoreService.orderBy('timestamp', 'desc')
    );

    return firestoreService.onSnapshot(
      queryRef,
      (snapshot: any) => {
        const notes = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as Note[];
        callback(notes);
      },
      (error: any) => {
        console.error('Error in notes subscription:', error);
        // If it's an index error, throw a specific error that can be caught
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          throw new Error('FIRESTORE_INDEX_REQUIRED');
        }
        throw error;
      }
    );
  }
}

export const notesService = new NotesService();
