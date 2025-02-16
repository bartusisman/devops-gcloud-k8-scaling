import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signUp: (username: string, password: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const signUp = async (username: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email: `${username.toLowerCase()}@notesync.com`, // Convert to lowercase
      password,
      options: {
        data: {
          username: username.toLowerCase(), // Store lowercase username
        },
        emailRedirectTo: undefined, // Disable email verification
      },
    });
    if (error) throw error;
  };

  const signIn = async (username: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: `${username.toLowerCase()}@notesync.com`, // Convert to lowercase
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 