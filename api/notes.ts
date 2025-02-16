import { UUID } from '../types';
import { supabase } from '../lib/supabase';
import { api } from './client';

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
}; 