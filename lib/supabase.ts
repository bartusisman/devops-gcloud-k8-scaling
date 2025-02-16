import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Access environment variables correctly in Expo
const supabaseUrl = 'https://asioeolrooqlsotuowbd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzaW9lb2xyb29xbHNvdHVvd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MDA4NzUsImV4cCI6MjA1NTI3Njg3NX0.IYvgeDPrt4CU3C0eypFZwy0QehGRRIIj6SwKc6PdXOc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 