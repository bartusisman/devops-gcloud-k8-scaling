import { supabase } from '../lib/supabase';

export class APIError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export const api = {
  handleError(error: any): never {
    if (error?.code) {
      throw new APIError(error.code, error.message);
    }
    throw new APIError('UNKNOWN_ERROR', 'An unexpected error occurred');
  },
}; 