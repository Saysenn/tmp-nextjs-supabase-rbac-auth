import { getSupabaseBrowserClient } from "./supabase/browser-client";

export const signUp = async (email: string, password: string) => {
  const supabase = getSupabaseBrowserClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });
};

export const signIn = async (email: string, password: string) => {
  const supabase = getSupabaseBrowserClient();
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  const supabase = getSupabaseBrowserClient();
  return supabase.auth.signOut();
};

export const signInWithGoogle = async () => {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    }
  });

  if (error) console.error('Error logging in with Google:', error);
  return data;
};