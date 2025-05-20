import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Note, notesApi } from '../api/notes';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  title: string;
  timestamp: string;
  read: boolean;
}

interface NotesContextType {
  notes: Note[];
  userNotes: Note[];
  loading: boolean;
  notifications: Notification[];
  hasUnreadNotifications: boolean;
  loadNotes: () => Promise<void>;
  loadUserNotes: () => Promise<void>;
  createNote: (content: string, title: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (id: string, data: { title: string, content: string }) => Promise<void>;
  markNotificationsAsRead: () => void;
  checkForNewNotifications: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType>({} as NotesContextType);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Set to a date in the past to ensure we see all notifications initially
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<string>('2020-01-01T00:00:00.000Z');
  
  // Computed property to check if there are any unread notifications
  const hasUnreadNotifications = notifications.some(notification => !notification.read);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkForNewNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  const markNotificationsAsRead = useCallback(() => {
    setNotifications(currentNotifications => 
      currentNotifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
  }, []);

  const checkForNewNotifications = useCallback(async () => {
    try {
      const data = await notesApi.getAll();
      
      // Get current user ID to filter out own notes
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      
      // Find notes created after lastCheckedTimestamp and not by the current user
      const existingNotificationIds = new Set(notifications.map(n => n.id));
      
      const newNotes = data.filter(note => {
        // Skip own notes and notes we already have notifications for
        const isOwnNote = note.user_id === currentUserId;
        const alreadyHaveNotification = existingNotificationIds.has(note.id);
        const isNewNote = new Date(note.timestamp) > new Date(lastCheckedTimestamp);
        
        // Only show notifications for notes that are:
        // 1. Not our own notes
        // 2. We don't already have a notification for
        // 3. Created after our last check
        return !isOwnNote && !alreadyHaveNotification && isNewNote;
      });
      
      if (newNotes.length > 0) {
        // Create notifications for new notes
        const newNotifications = newNotes.map(note => ({
          id: note.id,
          title: note.title,
          timestamp: note.timestamp,
          read: false
        }));
        
        // Add new notifications to the top of the list
        setNotifications(prev => {
          // Filter out any existing notifications with the same ID as the new ones
          const existingIds = new Set(newNotifications.map(n => n.id));
          const filteredPrevNotifications = prev.filter(n => !existingIds.has(n.id));
          
          return [...newNotifications, ...filteredPrevNotifications];
        });
        
        // Update lastCheckedTimestamp to now
        setLastCheckedTimestamp(new Date().toISOString());
      }
    } catch (error) {
      console.error("Failed to check for notifications:", error);
    }
  }, [lastCheckedTimestamp, notifications]);

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
        updateNote,
        notifications,
        hasUnreadNotifications,
        markNotificationsAsRead,
        checkForNewNotifications
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export const useNotes = () => useContext(NotesContext); 