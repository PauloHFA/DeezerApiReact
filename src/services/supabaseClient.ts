import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let clientPromise: Promise<SupabaseClient | null> | null = null;

export const getSupabaseClient = (): Promise<SupabaseClient | null> => {
  if (!isSupabaseConfigured) {
    return Promise.resolve(null);
  }

  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey)
    );
  }

  return clientPromise;
};
