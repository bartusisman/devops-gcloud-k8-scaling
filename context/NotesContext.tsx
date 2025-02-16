import { createContext, useContext, useState, useCallback } from 'react';
import { Note, notesApi } from '../api/notes';

interface NotesContextType {
  notes: Note[];
  userNotes: Note[];
  loading: boolean;
  loadNotes: () => Promise<void>;
  loadUserNotes: () => Promise<void>;
  createNote: (content: string, title: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (id: string, data: { title: string, content: string }) => Promise<void>;
}

const NotesContext = createContext<NotesContextType>({} as NotesContextType);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notesApi.getAll();
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notesApi.getUserNotes();
      setUserNotes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(async (content: string, title: string) => {
    if (!title.trim()) {
      throw new Error('Title is required');
    }
    
    try {
      setLoading(true);
      await notesApi.create({ content, title });
      await Promise.all([loadNotes(), loadUserNotes()]);
    } finally {
      setLoading(false);
    }
  }, [loadNotes, loadUserNotes]);

  const deleteNote = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await notesApi.delete(id);
      await Promise.all([loadNotes(), loadUserNotes()]);
    } finally {
      setLoading(false);
    }
  }, [loadNotes, loadUserNotes]);

  const updateNote = useCallback(async (id: string, data: { title: string, content: string }) => {
    try {
      setLoading(true);
      await notesApi.update(id, data);
      await Promise.all([loadNotes(), loadUserNotes()]);
    } finally {
      setLoading(false);
    }
  }, [loadNotes, loadUserNotes]);

  return (
    <NotesContext.Provider 
      value={{ 
        notes, 
        userNotes, 
        loading, 
        loadNotes, 
        loadUserNotes, 
        createNote, 
        deleteNote,
        updateNote
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export const useNotes = () => useContext(NotesContext); 