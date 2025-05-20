import { UUID } from '../types';
import { supabase } from '../lib/supabase';
import { api } from './client';
import fetch from 'cross-fetch';

export interface Note {
  id: UUID;
  user_id: UUID;
  username: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface CreateNoteDTO {
  title: string;
  content: string;
}

// Define the Cloud Function URL
const LOG_NOTE_CREATED_URL = "https://europe-west2-cs436-project-459822.cloudfunctions.net/logNoteCreated";

export const notesApi = {
  async create(data: CreateNoteDTO): Promise<Note> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (!data.title.trim()) throw new Error('Title is required');

      const { data: note, error } = await supabase
        .from('notes')
        .insert({
          title: data.title.trim(),
          content: data.content,
          user_id: user.id,
          username: user.user_metadata.username,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Call the Cloud Function to log the note creation
      try {
        console.log("Calling Cloud Function with data:", {
          noteId: note.id,
          title: note.title,
          timestamp: note.timestamp,
          username: note.username
        });
        
        const response = await fetch(LOG_NOTE_CREATED_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId: note.id,
            title: note.title,
            timestamp: note.timestamp,
            username: note.username
          })
        });
        
        const responseData = await response.json();
        console.log("Cloud Function response:", responseData);
        
      } catch (cloudFnError) {
        console.error("Failed to log note creation:", cloudFnError);
        // Continue execution even if cloud function call fails
      }
      
      return note;
    } catch (error) {
      return api.handleError(error);
    }
  },

  async getAll(): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return api.handleError(error);
    }
  },

  async getUserNotes(): Promise<Note[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return api.handleError(error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      return api.handleError(error);
    }
  },

  async update(id: string, data: CreateNoteDTO): Promise<Note> {
    try {
      const { data: note, error } = await supabase
        .from('notes')
        .update({
          title: data.title,
          content: data.content,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return note;
    } catch (error) {
      return api.handleError(error);
    }
  },
}; 