import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or user localStorage overrides
export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('etc_supabase_url');
  const customKey = localStorage.getItem('etc_supabase_key');

  const supabaseUrl = customUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = customKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return { supabaseUrl, supabaseAnonKey };
};

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return clientInstance;
};

export const resetSupabaseClient = () => {
  clientInstance = null;
};

export const isSupabaseConfigured = (): boolean => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing. The app is running in resilient local storage mode.'
    };
  }

  try {
    const { error } = await supabase.from('kitchen_inventory').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Connected to Supabase, but tables are missing. Please execute supabase/schema.sql in your Supabase SQL Editor.'
        };
      }
      return {
        success: false,
        message: `Supabase error: ${error.message} (code: ${error.code})`
      };
    }
    return {
      success: true,
      message: 'Successfully connected to Supabase PostgreSQL database!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Could not reach Supabase endpoint.'
    };
  }
};
