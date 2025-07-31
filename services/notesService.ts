import firestore from '@react-native-firebase/firestore';
import { Note, CreateNoteData, UpdateNoteData } from '@/types/Note';
import '@/config/firebaseConfig'; // Ensure Firebase is initialized

class NotesService {
  private get collection() {
    return firestore().collection('notes');
  }

  async getNotes(userId: string): Promise<Note[]> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Note[];
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  async createNote(userId: string, noteData: CreateNoteData): Promise<string> {
    try {
      const docRef = await this.collection.add({
        ...noteData,
        userId,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  async updateNote(noteId: string, noteData: UpdateNoteData): Promise<void> {
    try {
      await this.collection.doc(noteId).update({
        ...noteData,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      await this.collection.doc(noteId).delete();
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  subscribeToNotes(userId: string, callback: (notes: Note[]) => void) {
    return this.collection
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        (snapshot) => {
          const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          })) as Note[];
          callback(notes);
        },
        (error) => {
          console.error('Error in notes subscription:', error);
        }
      );
  }
}

export const notesService = new NotesService();