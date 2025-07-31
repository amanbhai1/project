export interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  userId: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
}